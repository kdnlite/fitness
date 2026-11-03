import { json, bad, now, cleanEmail, PLANS, getContent, sendMail, activate, welcomeText, ensureSchema } from '../../_lib/kdn.js';

// Razorpay -> Settings -> Webhooks: URL https://kdnfitness.com/api/razorpay/webhook,
// events payment.captured, payment.failed, refund.processed; same secret as RAZORPAY_WEBHOOK_SECRET.
// At checkout, pass notes: { email, plan: 'ind'|'fam'|'gym', name?, coupon? }.

async function hmacHex(secret, data) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Price the plan the way the website does (admin prices, minus a valid coupon) and compare with what was paid.
async function checkAmount(db, plan, code, p) {
  const c = await getContent(db);
  const price = Math.round(Number(c.plans[plan]?.price || 0) * 100); // paise
  let expected = price, days = 0, used = null;
  if (code) {
    const cp = await db.prepare('SELECT * FROM coupons WHERE code=?').bind(code).first();
    const usable = cp && cp.active && !(cp.expires_at && cp.expires_at < now()) &&
      !(cp.max_uses != null && cp.used >= cp.max_uses) && !(cp.plan && cp.plan !== plan);
    if (usable) {
      used = cp.code;
      if (cp.kind === 'percent') expected = Math.round(price * (100 - cp.value) / 100);
      else if (cp.kind === 'flat') expected = Math.max(0, price - cp.value * 100);
      else if (cp.kind === 'days') days = cp.value;
    }
  }
  const paid = Number(p.amount || 0);
  const okCurrency = (p.currency || 'INR') === 'INR';
  // ₹1 margin for rounding.
  if (!price || !okCurrency || paid + 100 < expected) {
    const r = (n) => '₹' + (n / 100).toLocaleString('en-IN');
    const why = !price ? 'plan has no price' : !okCurrency ? `paid in ${p.currency}` : `paid ${r(paid)}, ${PLANS[plan]} plan costs ${r(expected)}${used ? ' after coupon ' + used : ''}`;
    return { ok: false, days: 0, coupon: null, note: `Not activated: ${why}. Check in Razorpay, then add the member yourself if it is fine.` };
  }
  return { ok: true, days, coupon: used, note: null };
}

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !env.DB) return bad('Not configured', 503);
  await ensureSchema(env.DB);
  const raw = await request.text();
  const sig = request.headers.get('x-razorpay-signature') || '';
  if (!safeEqual(await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, raw), sig)) return bad('Bad signature', 401);

  let ev;
  try { ev = JSON.parse(raw); } catch { return bad('Bad JSON'); }
  const db = env.DB;

  if (ev.event === 'refund.processed') {
    const rf = ev.payload?.refund?.entity || {};
    const pid = rf.payment_id;
    if (!pid) return json({ ok: true });
    const pay = await db.prepare('SELECT * FROM payments WHERE ref=?').bind(pid).first();
    const full = !pay || !rf.amount || rf.amount >= pay.amount;
    if (full) {
      await db.prepare("UPDATE payments SET status='refunded' WHERE ref=?").bind(pid).run();
      // A full refund of the payment that activated the member ends that membership.
      if (pay && pay.email && pay.status === 'captured') {
        const t = now(), stamp = new Date(t).toISOString().slice(0, 10);
        await db.prepare("UPDATE users SET status='cancelled', notes=COALESCE(NULLIF(notes,'') || char(10),'') || ?, updated_at=? WHERE email=?")
          .bind(`${stamp}: payment ${pid} fully refunded, membership cancelled.`, t, pay.email).run();
      }
    } else {
      await db.prepare("UPDATE payments SET note=COALESCE(NULLIF(note,'') || ' ','') || ? WHERE ref=?")
        .bind(`Partly refunded ₹${(rf.amount / 100).toLocaleString('en-IN')}.`, pid).run();
    }
    return json({ ok: true });
  }

  const p = ev.payload?.payment?.entity;
  if (!p || !['payment.captured', 'payment.failed'].includes(ev.event)) return json({ ok: true, ignored: ev.event });

  const notes = p.notes || {};
  const email = cleanEmail(notes.email || p.email);
  const plan = PLANS[notes.plan] ? notes.plan : null;
  const coupon = notes.coupon ? String(notes.coupon).toLowerCase() : null;
  const status = ev.event === 'payment.captured' ? 'captured' : 'failed';

  // The plan, coupon and email come from checkout notes, which a buyer could change.
  // So the amount actually paid is checked against the plan price before anything is activated.
  let check = { ok: true, days: 0, coupon: null, note: null };
  if (status === 'captured' && email && plan) check = await checkAmount(db, plan, coupon, p);
  const finalStatus = status === 'captured' && !check.ok ? 'review' : status;

  const before = await db.prepare('SELECT status FROM payments WHERE ref=?').bind(p.id).first();
  await db.prepare(
    `INSERT INTO payments (ref,source,email,plan,amount,currency,status,method,coupon,note,created_at)
     VALUES (?, 'razorpay', ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(ref) DO UPDATE SET status=CASE WHEN payments.status IN ('captured','refunded','review') AND excluded.status='failed' THEN payments.status ELSE excluded.status END, note=COALESCE(excluded.note, payments.note)`
  ).bind(p.id, email || null, plan, p.amount || 0, p.currency || 'INR', finalStatus, p.method || null, coupon, check.note, (p.created_at ? p.created_at * 1000 : now())).run();

  // Only activate once per payment (Razorpay may retry webhooks).
  const firstTime = !before || !['captured', 'review'].includes(before.status);
  if (finalStatus === 'captured' && email && plan && firstTime) {
    const user = await activate(env, { email, name: notes.name || null, plan, months: 3, days: check.days });
    if (check.coupon) await db.prepare('UPDATE coupons SET used=used+1 WHERE code=?').bind(check.coupon).run();
    const c = await getContent(db);
    await sendMail(env, { to: email, subject: 'Your KDN Fitness plan is active', text: welcomeText(user, c.signature) });
  }
  return json({ ok: true });
}

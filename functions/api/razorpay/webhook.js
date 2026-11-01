import { json, bad, now, cleanEmail, PLANS, getContent, sendMail, activate, welcomeText } from '../../_lib/kdn.js';

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

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !env.DB) return bad('Not configured', 503);
  const raw = await request.text();
  const sig = request.headers.get('x-razorpay-signature') || '';
  if (!safeEqual(await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, raw), sig)) return bad('Bad signature', 401);

  let ev;
  try { ev = JSON.parse(raw); } catch { return bad('Bad JSON'); }
  const db = env.DB;

  if (ev.event === 'refund.processed') {
    const pid = ev.payload?.refund?.entity?.payment_id;
    if (pid) await db.prepare("UPDATE payments SET status='refunded' WHERE ref=?").bind(pid).run();
    return json({ ok: true });
  }

  const p = ev.payload?.payment?.entity;
  if (!p || !['payment.captured', 'payment.failed'].includes(ev.event)) return json({ ok: true, ignored: ev.event });

  const notes = p.notes || {};
  const email = cleanEmail(notes.email || p.email);
  const plan = PLANS[notes.plan] ? notes.plan : null;
  const coupon = notes.coupon ? String(notes.coupon).toLowerCase() : null;
  const status = ev.event === 'payment.captured' ? 'captured' : 'failed';

  const before = await db.prepare('SELECT status FROM payments WHERE ref=?').bind(p.id).first();
  await db.prepare(
    `INSERT INTO payments (ref,source,email,plan,amount,currency,status,method,coupon,created_at)
     VALUES (?, 'razorpay', ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(ref) DO UPDATE SET status=CASE WHEN payments.status IN ('captured','refunded') AND excluded.status='failed' THEN payments.status ELSE excluded.status END`
  ).bind(p.id, email || null, plan, p.amount || 0, p.currency || 'INR', status, p.method || null, coupon, (p.created_at ? p.created_at * 1000 : now())).run();

  // Only activate once per payment (Razorpay may retry webhooks).
  const firstTime = !before || before.status !== 'captured';
  if (status === 'captured' && email && plan && firstTime) {
    const user = await activate(env, { email, name: notes.name || null, plan, months: 3 });
    if (coupon) await db.prepare('UPDATE coupons SET used=used+1 WHERE code=?').bind(coupon).run();
    const c = await getContent(db);
    await sendMail(env, { to: email, subject: 'Your KDN Fitness plan is active', text: welcomeText(user, c.signature) });
  }
  return json({ ok: true });
}

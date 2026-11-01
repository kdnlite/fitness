import {
  json, bad, now, cleanEmail, PLANS, getContent, sendMail, activate, welcomeText, addMonths,
} from '../../_lib/kdn.js';

const DAY = 86400000;

async function body(request) {
  try { return await request.json(); } catch { return {}; }
}
const int = (v, d = null) => (v === '' || v == null || isNaN(+v) ? d : Math.round(+v));
const like = (q) => `%${String(q || '').trim().toLowerCase()}%`;

export async function onRequest(ctx) {
  const { request, env, params } = ctx;
  const db = env.DB;
  const path = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  const [res, id] = path;
  const m = request.method;
  const url = new URL(request.url);
  const q = url.searchParams;

  try {
    // ---------- who am I + dashboard ----------
    if (res === 'me' && m === 'GET') {
      return json({ email: ctx.data.admin, mailReady: !!env.RESEND_API_KEY, razorpayReady: !!env.RAZORPAY_WEBHOOK_SECRET });
    }
    if (res === 'stats' && m === 'GET') {
      const t = now();
      const monthStart = new Date(new Date(t + 5.5 * 3600000).toISOString().slice(0, 7) + '-01T00:00:00+05:30').getTime();
      const [unread, active, expSoon, users, rev, pays] = await Promise.all([
        db.prepare("SELECT COUNT(*) n FROM messages WHERE direction='in' AND is_read=0").first(),
        db.prepare("SELECT COUNT(*) n FROM users WHERE status='active' AND valid_until>?").bind(t).first(),
        db.prepare("SELECT COUNT(*) n FROM users WHERE status='active' AND valid_until>? AND valid_until<?").bind(t, t + 7 * DAY).first(),
        db.prepare('SELECT COUNT(*) n FROM users').first(),
        db.prepare("SELECT COALESCE(SUM(amount),0) s FROM payments WHERE status IN ('captured','manual') AND created_at>=?").bind(monthStart).first(),
        db.prepare("SELECT COUNT(*) n FROM payments WHERE status IN ('captured','manual') AND created_at>=?").bind(monthStart).first(),
      ]);
      return json({ unread: unread.n, active: active.n, expiringSoon: expSoon.n, users: users.n, monthRevenue: rev.s, monthPayments: pays.n });
    }

    // ---------- mail ----------
    if (res === 'messages') {
      if (!id && m === 'GET') {
        const box = q.get('box') || 'in';
        const where = [], args = [];
        if (box === 'in' || box === 'out') { where.push('direction=?'); args.push(box); }
        if (box === 'unread') where.push("direction='in' AND is_read=0");
        if (q.get('q')) { where.push('(lower(peer_email) LIKE ? OR lower(COALESCE(peer_name,\'\')) LIKE ? OR lower(COALESCE(subject,\'\')) LIKE ?)'); args.push(like(q.get('q')), like(q.get('q')), like(q.get('q'))); }
        const page = Math.max(0, int(q.get('page'), 0));
        const rows = await db.prepare(
          `SELECT id,direction,peer_email,peer_name,subject,substr(COALESCE(text_body,''),1,160) snippet,is_read,status,created_at
           FROM messages ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 51 OFFSET ?`
        ).bind(...args, page * 50).all();
        return json({ items: rows.results.slice(0, 50), more: rows.results.length > 50 });
      }
      if (id && m === 'GET') {
        const msg = await db.prepare('SELECT * FROM messages WHERE id=?').bind(id).first();
        if (!msg) return bad('Message not found', 404);
        if (!msg.is_read) await db.prepare('UPDATE messages SET is_read=1 WHERE id=?').bind(id).run();
        const thread = await db.prepare(
          'SELECT id,direction,subject,text_body,html_body,attachments,status,error,created_at,peer_name FROM messages WHERE peer_email=? ORDER BY created_at ASC LIMIT 100'
        ).bind(msg.peer_email).all();
        const user = await db.prepare('SELECT id,kdn_id,plan,status,valid_until FROM users WHERE email=?').bind(msg.peer_email).first();
        return json({ message: { ...msg, is_read: 1 }, thread: thread.results, user });
      }
      if (id && m === 'PATCH') {
        const b = await body(request);
        await db.prepare('UPDATE messages SET is_read=? WHERE id=?').bind(b.read ? 1 : 0, id).run();
        return json({ ok: true });
      }
      if (id && m === 'DELETE') {
        await db.prepare('DELETE FROM messages WHERE id=?').bind(id).run();
        return json({ ok: true });
      }
    }

    if (res === 'send' && m === 'POST') {
      const b = await body(request);
      const to = cleanEmail(b.to);
      const subject = String(b.subject || '').trim();
      const text = String(b.text || '').trim();
      if (!to) return bad('Enter a valid email address.');
      if (!subject) return bad('Add a subject.');
      if (!text) return bad('Write a message.');
      let inReplyTo = null;
      if (b.replyToId) {
        const orig = await db.prepare('SELECT message_id FROM messages WHERE id=?').bind(b.replyToId).first();
        if (orig?.message_id && !orig.message_id.startsWith('resend-')) inReplyTo = orig.message_id;
      }
      const r = await sendMail(env, { to, subject, text, inReplyTo });
      return r.ok ? json({ ok: true, id: r.id }) : bad(`Not sent: ${r.error}`, 502);
    }

    // ---------- users ----------
    if (res === 'users') {
      if (!id && m === 'GET') {
        const where = [], args = [];
        const f = q.get('filter') || 'all', t = now();
        if (f === 'active') { where.push("status='active' AND valid_until>?"); args.push(t); }
        if (f === 'expiring') { where.push("status='active' AND valid_until>? AND valid_until<?"); args.push(t, t + 7 * DAY); }
        if (f === 'expired') { where.push("(status!='active' OR valid_until IS NULL OR valid_until<=?)"); args.push(t); }
        if (q.get('q')) { where.push("(lower(email) LIKE ? OR lower(COALESCE(name,'')) LIKE ? OR lower(kdn_id) LIKE ?)"); args.push(like(q.get('q')), like(q.get('q')), like(q.get('q'))); }
        const rows = await db.prepare(`SELECT * FROM users ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY updated_at DESC LIMIT 200`).bind(...args).all();
        return json({ items: rows.results });
      }
      if (!id && m === 'POST') {
        const b = await body(request);
        const email = cleanEmail(b.email);
        if (!email) return bad('Enter a valid email address.');
        if (b.plan && !PLANS[b.plan]) return bad('Unknown plan.');
        const exists = await db.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
        if (exists) return bad('This email is already a user. Open it and use Extend.');
        const u = await activate(env, { email, name: String(b.name || '').trim() || null, plan: b.plan || 'ind', months: int(b.months, 3) });
        let mailed = null;
        if (b.sendWelcome) {
          const c = await getContent(db);
          mailed = await sendMail(env, { to: email, subject: 'Your KDN Fitness plan is active', text: welcomeText(u, c.signature) });
        }
        return json({ user: u, mailed: mailed ? mailed.ok : null, mailError: mailed?.error || null });
      }
      if (id && m === 'GET') {
        const u = await db.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
        if (!u) return bad('User not found', 404);
        const pays = await db.prepare('SELECT * FROM payments WHERE email=? ORDER BY created_at DESC LIMIT 50').bind(u.email).all();
        return json({ user: u, payments: pays.results });
      }
      if (id && m === 'PATCH') {
        const b = await body(request);
        const u = await db.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
        if (!u) return bad('User not found', 404);
        const t = now();
        let until = u.valid_until;
        if (b.validUntil) until = new Date(b.validUntil + 'T23:59:59+05:30').getTime();
        if (int(b.extendMonths)) until = addMonths(until && until > t ? until : t, int(b.extendMonths));
        if (int(b.extendDays)) until = (until && until > t ? until : t) + int(b.extendDays) * DAY;
        const plan = b.plan && PLANS[b.plan] ? b.plan : u.plan;
        const status = ['active', 'cancelled'].includes(b.status) ? b.status : u.status;
        await db.prepare('UPDATE users SET name=?, plan=?, status=?, valid_until=?, notes=?, updated_at=? WHERE id=?')
          .bind(b.name !== undefined ? String(b.name).trim() || null : u.name, plan, status, until, b.notes !== undefined ? String(b.notes) : u.notes, t, id).run();
        return json({ user: await db.prepare('SELECT * FROM users WHERE id=?').bind(id).first() });
      }
      if (id && m === 'DELETE') {
        await db.prepare('DELETE FROM users WHERE id=?').bind(id).run();
        return json({ ok: true });
      }
    }

    // ---------- payments ----------
    if (res === 'payments') {
      if (m === 'GET') {
        const where = [], args = [];
        if (q.get('q')) { where.push("(lower(COALESCE(email,'')) LIKE ? OR lower(COALESCE(ref,'')) LIKE ?)"); args.push(like(q.get('q')), like(q.get('q'))); }
        const rows = await db.prepare(`SELECT * FROM payments ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 200`).bind(...args).all();
        return json({ items: rows.results });
      }
      if (m === 'POST') {
        // Manual entry, e.g. a direct UPI transfer. Optionally activates the plan.
        const b = await body(request);
        const email = cleanEmail(b.email);
        const amount = int(b.amount);
        if (!email) return bad('Enter a valid email address.');
        if (!amount || amount < 0) return bad('Enter the amount in rupees.');
        if (b.plan && !PLANS[b.plan]) return bad('Unknown plan.');
        const ref = String(b.ref || '').trim() || `manual-${now()}`;
        try {
          await db.prepare("INSERT INTO payments (ref,source,email,plan,amount,status,method,note,created_at) VALUES (?, 'manual', ?, ?, ?, 'manual', ?, ?, ?)")
            .bind(ref, email, b.plan || null, amount * 100, String(b.method || 'UPI'), String(b.note || '') || null, now()).run();
        } catch (e) {
          if (String(e).includes('UNIQUE')) return bad('A payment with this reference already exists.');
          throw e;
        }
        let user = null, mailed = null;
        if (b.activate) {
          user = await activate(env, { email, plan: b.plan || 'ind', months: 3 });
          if (b.sendWelcome) {
            const c = await getContent(db);
            mailed = await sendMail(env, { to: email, subject: 'Your KDN Fitness plan is active', text: welcomeText(user, c.signature) });
          }
        }
        return json({ ok: true, user, mailed: mailed ? mailed.ok : null, mailError: mailed?.error || null });
      }
    }

    // ---------- coupons ----------
    if (res === 'coupons') {
      if (!id && m === 'GET') {
        const rows = await db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
        return json({ items: rows.results });
      }
      if (!id && m === 'POST') {
        const b = await body(request);
        const code = String(b.code || '').trim().toLowerCase();
        if (!/^[a-z0-9_-]{3,32}$/.test(code)) return bad('Code: 3–32 letters, numbers, - or _.');
        if (!['percent', 'flat', 'days'].includes(b.kind)) return bad('Pick a coupon type.');
        const value = int(b.value);
        if (!value || value < 1 || (b.kind === 'percent' && value > 100)) return bad('Enter a valid value.');
        if (b.plan && !PLANS[b.plan]) return bad('Unknown plan.');
        const exp = b.expires ? new Date(b.expires + 'T23:59:59+05:30').getTime() : null;
        try {
          await db.prepare('INSERT INTO coupons (code,kind,value,plan,max_uses,expires_at,active,note,created_at) VALUES (?,?,?,?,?,?,1,?,?)')
            .bind(code, b.kind, value, b.plan || null, int(b.maxUses), exp, String(b.note || '') || null, now()).run();
        } catch (e) {
          if (String(e).includes('UNIQUE') || String(e).includes('PRIMARY')) return bad('This code already exists.');
          throw e;
        }
        return json({ ok: true });
      }
      if (id && m === 'PATCH') {
        const b = await body(request);
        await db.prepare('UPDATE coupons SET active=? WHERE code=?').bind(b.active ? 1 : 0, decodeURIComponent(id)).run();
        return json({ ok: true });
      }
      if (id && m === 'DELETE') {
        await db.prepare('DELETE FROM coupons WHERE code=?').bind(decodeURIComponent(id)).run();
        return json({ ok: true });
      }
    }

    // ---------- website content ----------
    if (res === 'content') {
      if (m === 'GET') return json(await getContent(db));
      if (m === 'PUT') {
        const b = await body(request);
        const c = await getContent(db);
        for (const k of Object.keys(c.plans)) {
          const p = b.plans?.[k];
          if (!p) continue;
          const price = int(p.price), mrp = int(p.mrp);
          if (!price || price < 1) return bad(`${PLANS[k]}: enter a price.`);
          c.plans[k] = { price, mrp: mrp && mrp > price ? mrp : null, per: String(p.per || '').slice(0, 80) };
        }
        if (b.banner) {
          const link = String(b.banner.link || '').trim();
          if (link && !/^https:\/\//.test(link) && !link.startsWith('/')) return bad('Banner link must start with https:// or /');
          c.banner = { on: !!b.banner.on, text: String(b.banner.text || '').slice(0, 200), link };
        }
        if (typeof b.signature === 'string') c.signature = b.signature.slice(0, 500);
        await db.prepare("INSERT INTO settings (key,value) VALUES ('content',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(c)).run();
        return json(c);
      }
    }

    return bad('Not found', 404);
  } catch (e) {
    return bad('Server error: ' + (e && e.message ? e.message : String(e)), 500);
  }
}


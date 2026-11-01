// Shared helpers for KDN Fitness Pages Functions.

export const PLANS = { ind: 'Individual', fam: 'Family', gym: 'Gym' };

export const DEFAULT_CONTENT = {
  plans: {
    ind: { price: 799, mrp: 999, per: 'About ₹9 a day' },
    fam: { price: 1999, mrp: 2499, per: 'About ₹500 per person' },
    gym: { price: 6399, mrp: 7999, per: 'One price for the whole gym' },
  },
  banner: { on: false, text: '', link: '' },
  signature: 'Team KDN Fitness\nsupport@kdnfitness.com',
};

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });
}

export const bad = (msg, status = 400) => json({ error: msg }, status);

export function now() { return Date.now(); }

export function cleanEmail(v) {
  const e = String(v || '').trim().toLowerCase();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(e) ? e : '';
}

export function newKdnId() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const b = crypto.getRandomValues(new Uint8Array(6));
  return 'KDN-' + Array.from(b, (x) => abc[x % abc.length]).join('');
}

export function addMonths(fromMs, months) {
  const d = new Date(fromMs);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.getTime();
}

export async function getContent(db) {
  const row = await db.prepare("SELECT value FROM settings WHERE key='content'").first();
  let saved = {};
  try { saved = row ? JSON.parse(row.value) : {}; } catch { saved = {}; }
  const c = structuredClone(DEFAULT_CONTENT);
  if (saved.plans) for (const k of Object.keys(c.plans)) Object.assign(c.plans[k], saved.plans[k] || {});
  if (saved.banner) Object.assign(c.banner, saved.banner);
  if (typeof saved.signature === 'string') c.signature = saved.signature;
  return c;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Plain text -> branded, simple HTML email.
export function mailHtml(text) {
  const body = esc(text).replace(/\r?\n/g, '<br>');
  return `<!doctype html><html><body style="margin:0;background:#f4f4f2;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden" cellspacing="0" cellpadding="0">
<tr><td style="background:#0b0b0b;padding:16px 22px;color:#d4af37;font-weight:bold;font-size:20px;letter-spacing:2px">KDN FITNESS</td></tr>
<tr><td style="padding:22px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:14px 22px;border-top:1px solid #eee;font-size:12px;color:#888">KDN Fitness · kdnfitness.com</td></tr>
</table></td></tr></table></body></html>`;
}

// Send through Resend and log it in the messages table.
export async function sendMail(env, { to, subject, text, inReplyTo, references }) {
  const from = env.MAIL_FROM || 'KDN Fitness <support@kdnfitness.com>';
  const replyTo = env.MAIL_REPLY_TO || 'support@kdnfitness.com';
  const headers = {};
  if (inReplyTo) { headers['In-Reply-To'] = inReplyTo; headers['References'] = references || inReplyTo; }
  let status = 'sent', error = null, messageId = null;
  if (!env.RESEND_API_KEY) {
    status = 'failed'; error = 'RESEND_API_KEY is not set';
  } else {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, html: mailHtml(text), reply_to: replyTo, headers }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) { status = 'failed'; error = out.message || out.error || `Resend error ${r.status}`; }
    else messageId = out.id ? `resend-${out.id}` : null;
  }
  const res = await env.DB.prepare(
    `INSERT INTO messages (direction,message_id,in_reply_to,peer_email,subject,text_body,html_body,is_read,status,error,created_at)
     VALUES ('out',?,?,?,?,?,?,1,?,?,?)`
  ).bind(messageId, inReplyTo || null, to, subject, text, null, status, error, now()).run();
  return { ok: status === 'sent', error, id: res.meta?.last_row_id };
}

// Create or extend a subscription. Returns the user row.
export async function activate(env, { email, name, plan, months = 3, days = 0 }) {
  const t = now();
  let u = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  const base = u && u.valid_until && u.valid_until > t ? u.valid_until : t;
  let until = months ? addMonths(base, months) : base;
  if (days) until += days * 86400000;
  if (u) {
    await env.DB.prepare('UPDATE users SET plan=?, status=\'active\', valid_until=?, name=COALESCE(?,name), updated_at=? WHERE id=?')
      .bind(plan || u.plan, until, name || null, t, u.id).run();
  } else {
    await env.DB.prepare('INSERT INTO users (email,name,kdn_id,plan,status,valid_until,created_at,updated_at) VALUES (?,?,?,?,\'active\',?,?,?)')
      .bind(email, name || null, newKdnId(), plan || 'ind', until, t, t).run();
  }
  return env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
}

export function welcomeText(u, sig) {
  const d = new Date(u.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  return `Hello${u.name ? ' ' + u.name : ''},

Thank you for joining KDN Fitness. Your ${PLANS[u.plan] || ''} plan is now active.

Your KDN ID: ${u.kdn_id}
Valid until: ${d}

Keep this email safe. If you need any help, just reply to this email.

${sig}`;
}

// ---- Cloudflare Access JWT check ----
let jwksCache = { at: 0, keys: [] };

function b64urlBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function accessUser(request, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const aud = env.ACCESS_AUD;
  const allowed = String(env.ADMIN_EMAILS || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
  if (!team || !aud || !allowed.length) return { error: 'Admin is not set up yet: ACCESS_TEAM_DOMAIN, ACCESS_AUD and ADMIN_EMAILS must be set.' };
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) return { error: 'Not signed in through Cloudflare Access.' };
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return { error: 'Bad token.' };
  let header, payload;
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlBytes(h)));
    payload = JSON.parse(new TextDecoder().decode(b64urlBytes(p)));
  } catch { return { error: 'Bad token.' }; }
  if (Date.now() - jwksCache.at > 3600000 || !jwksCache.keys.find((k) => k.kid === header.kid)) {
    const r = await fetch(`https://${team}/cdn-cgi/access/certs`);
    const j = await r.json();
    jwksCache = { at: Date.now(), keys: j.keys || [] };
  }
  const jwk = jwksCache.keys.find((k) => k.kid === header.kid);
  if (!jwk) return { error: 'Unknown signing key.' };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return { error: 'Invalid signature.' };
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(aud)) return { error: 'Wrong audience.' };
  if (payload.iss !== `https://${team}`) return { error: 'Wrong issuer.' };
  if (!payload.exp || payload.exp * 1000 < Date.now()) return { error: 'Session expired. Reload the page.' };
  const email = String(payload.email || '').toLowerCase();
  if (!allowed.includes(email)) return { error: `${email || 'This account'} is not an admin.` };
  return { email };
}

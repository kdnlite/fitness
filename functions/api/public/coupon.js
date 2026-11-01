import { json, bad, ensureSchema } from '../../_lib/kdn.js';

// Public: check a coupon code. POST {code, plan}. Does not use up the coupon;
// a use is counted when the Razorpay payment (with notes.coupon) is captured.
export async function onRequestPost({ request, env }) {
  if (!env.DB) return bad('Unavailable', 503);
  await ensureSchema(env.DB);
  let b = {};
  try { b = await request.json(); } catch {}
  const code = String(b.code || '').trim().toLowerCase();
  if (!code) return json({ valid: false, reason: 'Enter a coupon code first.' });
  const c = await env.DB.prepare('SELECT * FROM coupons WHERE code=?').bind(code).first();
  const no = (reason) => json({ valid: false, reason });
  if (!c || !c.active) return no('That coupon is not valid. Check the spelling and try again.');
  if (c.expires_at && c.expires_at < Date.now()) return no('This coupon has expired.');
  if (c.max_uses != null && c.used >= c.max_uses) return no('This coupon has been fully used.');
  if (c.plan && b.plan && c.plan !== b.plan) return no('This coupon does not apply to this plan.');
  return json({ valid: true, code: c.code, kind: c.kind, value: c.value, plan: c.plan });
}

import { json, ensureSchema, CORS, preflight } from '../../_lib/kdn.js';

// Public: count one anonymous event for the admin dashboard. POST {k}
// k: visit (website opened), start (questions started), plan (first plan made), pay (plans page opened).
// Only a per-day counter is stored: no IP, no cookie, no user id.
const KINDS = new Set(['visit', 'start', 'plan', 'pay']);

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false }, 200, CORS);
  let b = {};
  try { b = await request.json(); } catch {}
  const k = String(b.k || '');
  if (!KINDS.has(k)) return json({ ok: false }, 400, CORS);
  await ensureSchema(env.DB);
  const day = new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10); // India date
  await env.DB.prepare('INSERT INTO visits (day, kind, n) VALUES (?, ?, 1) ON CONFLICT(day, kind) DO UPDATE SET n = n + 1').bind(day, k).run();
  return json({ ok: true }, 200, CORS);
}

export const onRequestOptions = () => preflight();

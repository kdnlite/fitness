import { json, getContent, ensureSchema } from '../../_lib/kdn.js';

// Public: plan prices + site banner, read by /kdn-live.js on the website.
export async function onRequestGet({ env }) {
  if (!env.DB) return json({}, 200);
  await ensureSchema(env.DB);
  const c = await getContent(env.DB);
  return json({ plans: c.plans, banner: c.banner }, 200, { 'cache-control': 'public, max-age=60' });
}

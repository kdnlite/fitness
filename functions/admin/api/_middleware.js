import { accessUser, bad } from '../../_lib/kdn.js';

// Every /admin/api/* call must come from an allowed admin signed in via Cloudflare Access.
export async function onRequest(ctx) {
  const { request, env } = ctx;
  if (!env.DB) return bad('Database is not connected: add a D1 binding named DB to this Pages project.', 500);
  const host = new URL(request.url).hostname;
  // Local testing only (wrangler pages dev on localhost). Never applies on kdnfitness.com.
  if (env.DEV_ADMIN_EMAIL && (host === 'localhost' || host === '127.0.0.1')) {
    ctx.data.admin = env.DEV_ADMIN_EMAIL;
    return ctx.next();
  }
  const who = await accessUser(request, env);
  if (who.error) return bad(who.error, 401);
  ctx.data.admin = who.email;
  return ctx.next();
}

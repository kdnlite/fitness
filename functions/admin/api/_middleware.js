import { accessUser, bad, json } from '../../_lib/kdn.js';
import { loginConfigured, sessionUser, checkLogin, makeSessionCookie, clearSessionCookie, adminUsername } from '../../_lib/session.js';

// Every /admin/api/* call needs a signed-in admin: username/password session cookie,
// or (optional) Cloudflare Access if ACCESS_* variables are set.
export async function onRequest(ctx) {
  const { request, env } = ctx;
  if (!env.DB) return bad('Database is not connected: add a D1 binding named DB to this Pages project.', 500);
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/admin\/api\/?/, '').replace(/\/$/, '');

  if (route === 'login' && request.method === 'POST') {
    if (!loginConfigured(env)) return bad('Login is not set up yet: add ADMIN_PASSWORD in Cloudflare.', 503);
    let b = {};
    try { b = await request.json(); } catch {}
    const r = await checkLogin(request, env, b.username, b.password);
    if (!r.ok) return bad(r.error, r.status);
    return json({ ok: true }, 200, { 'set-cookie': await makeSessionCookie(env, adminUsername(env)) });
  }
  if (route === 'logout' && request.method === 'POST') {
    return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
  }

  // Local testing only. Never applies on kdnfitness.com.
  if (env.DEV_ADMIN_EMAIL && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    ctx.data.admin = env.DEV_ADMIN_EMAIL;
    return ctx.next();
  }

  const user = await sessionUser(request, env);
  if (user) { ctx.data.admin = user; return ctx.next(); }

  if (env.ACCESS_AUD) {
    const who = await accessUser(request, env);
    if (!who.error) { ctx.data.admin = who.email; return ctx.next(); }
  }
  return json({ error: 'Please sign in.', login: true, configured: loginConfigured(env) }, 401);
}

// Accept the D1 binding whether it was named "DB" or "db" in the Cloudflare dashboard.
export async function onRequest(ctx) {
  const env = ctx.env;
  if (!env.DB) {
    const alt = env.db || env.Db || env.dB;
    if (alt) {
      try { env.DB = alt; } catch { /* env not writable */ }
      if (!env.DB) ctx.env = Object.assign(Object.create(env), { DB: alt });
    }
  }
  return ctx.next();
}

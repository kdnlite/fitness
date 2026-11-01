// Username/password login for /admin with a signed, HttpOnly session cookie.
// Credentials live in Cloudflare secrets (ADMIN_USERNAME, ADMIN_PASSWORD), never in this public repo.

const COOKIE = 'kdn_admin';
const DAYS = 7;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

const enc = new TextEncoder();

function b64url(bytes) {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(s + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
}

async function hmacKey(env) {
  // SESSION_SECRET is optional; changing ADMIN_PASSWORD also signs everyone out.
  const secret = (env.SESSION_SECRET || '') + '|' + env.ADMIN_PASSWORD + '|kdn-admin-session';
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sha256(s) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

// Constant-time compare via hashes of equal length.
async function same(a, b) {
  const [x, y] = await Promise.all([sha256(String(a)), sha256(String(b))]);
  let r = 0;
  for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i];
  return r === 0;
}

export function loginConfigured(env) {
  return !!env.ADMIN_PASSWORD;
}

export function adminUsername(env) {
  return env.ADMIN_USERNAME || 'kdn';
}

export async function makeSessionCookie(env, username) {
  const payload = b64url(enc.encode(JSON.stringify({ u: username, exp: Date.now() + DAYS * 86400000 })));
  const sig = b64url(new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(env), enc.encode(payload))));
  return `${COOKIE}=${payload}.${sig}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${DAYS * 86400}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function sessionUser(request, env) {
  if (!loginConfigured(env)) return null;
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [payload, sig] = m[1].split('.');
  if (!payload || !sig) return null;
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', await hmacKey(env), fromB64url(sig), enc.encode(payload));
  } catch { return null; }
  if (!ok) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (!p.exp || p.exp < Date.now() || p.u !== adminUsername(env)) return null;
    return p.u;
  } catch { return null; }
}

// Brute-force guard: 5 wrong tries from one IP locks that IP for 15 minutes.
async function ensureTable(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT PRIMARY KEY, fails INTEGER NOT NULL, locked_until INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)').run();
}

export async function checkLogin(request, env, username, password) {
  const db = env.DB;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const t = Date.now();
  await ensureTable(db);
  const row = await db.prepare('SELECT * FROM login_attempts WHERE ip=?').bind(ip).first();
  if (row && row.locked_until > t) {
    const mins = Math.ceil((row.locked_until - t) / 60000);
    return { error: `Too many wrong tries. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`, status: 429 };
  }
  const good = (await same(String(username || '').trim().toLowerCase(), adminUsername(env).toLowerCase()))
    & (await same(String(password || ''), env.ADMIN_PASSWORD));
  if (good) {
    await db.prepare('DELETE FROM login_attempts WHERE ip=?').bind(ip).run();
    return { ok: true };
  }
  const fails = (row && t - row.updated_at < LOCK_MS ? row.fails : 0) + 1;
  const lockedUntil = fails >= MAX_FAILS ? t + LOCK_MS : 0;
  await db.prepare('INSERT INTO login_attempts (ip,fails,locked_until,updated_at) VALUES (?,?,?,?) ON CONFLICT(ip) DO UPDATE SET fails=excluded.fails, locked_until=excluded.locked_until, updated_at=excluded.updated_at')
    .bind(ip, lockedUntil ? 0 : fails, lockedUntil, t).run();
  return lockedUntil
    ? { error: 'Too many wrong tries. Try again in 15 minutes.', status: 429 }
    : { error: 'Wrong username or password.', status: 401 };
}

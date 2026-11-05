import { json, ensureSchema, CORS, preflight } from '../../_lib/kdn.js';

// Public: recognise Indian food in a photo with Cloudflare Workers AI.
// POST {img: "<base64 JPEG>"} -> {items: [{name, qty, unit, kcal, protein}], note}
// The photo is sent to the model and not stored. Needs the Workers AI binding named AI
// (Pages project > Settings > Bindings > Workers AI, variable name AI).
// GET returns {ready: true|false} so the app can hide the photo button when AI is not set up.

const LIMIT = 25; // photos per person (IP) per day
const MODELS = ['@cf/meta/llama-4-scout-17b-16e-instruct', '@cf/meta/llama-3.2-11b-vision-instruct'];
const PROMPT = `You are a nutrition assistant for Indian users. Look at the photo and list each food or drink you can see.
Answer with JSON only, no other text, in this exact shape:
{"items":[{"name":"Roti","qty":2,"unit":"piece","kcal":200,"protein":6}],"note":""}
Rules: use common Indian names in English letters (roti, dal, rice, paneer sabzi, chicken curry, poha, idli, dosa, chai, samosa).
qty is how many units are on the plate; unit is one of piece, katori, plate, glass, cup, slice, bowl, handful.
kcal and protein are totals for that qty. If the photo has no food, return {"items":[],"note":"No food found"}.`;

async function who(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('kdn-ai|' + ip));
  return Array.from(new Uint8Array(d).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
}

function parse(txt) {
  if (txt && typeof txt === 'object') return txt;
  const s = String(txt || '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}

function clean(o) {
  const items = (Array.isArray(o && o.items) ? o.items : []).slice(0, 12).map((x) => ({
    name: String(x.name || '').slice(0, 60).trim(),
    qty: Math.max(0.25, Math.min(20, Number(x.qty) || 1)),
    unit: String(x.unit || 'piece').slice(0, 20),
    kcal: Math.max(0, Math.min(3000, Math.round(Number(x.kcal) || 0))),
    protein: Math.max(0, Math.min(200, Math.round(Number(x.protein) || 0))),
  })).filter((x) => x.name);
  return { items, note: String((o && o.note) || '').slice(0, 200) };
}

async function ask(env, model, b64) {
  if (model.includes('llama-4')) {
    const r = await env.AI.run(model, {
      messages: [{ role: 'user', content: [
        { type: 'text', text: PROMPT },
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } },
      ] }],
      max_tokens: 700, temperature: 0.2,
    });
    return r && r.response;
  }
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const run = () => env.AI.run(model, { messages: [{ role: 'user', content: PROMPT }], image: Array.from(bytes), max_tokens: 700, temperature: 0.2 });
  try { return (await run()).response; }
  catch (e) {
    // this model asks for a one-time licence agreement on each account
    if (/agree/i.test(String(e && e.message))) { await env.AI.run(model, { prompt: 'agree' }); return (await run()).response; }
    throw e;
  }
}

export async function onRequestGet({ env }) {
  return json({ ready: !!env.AI }, 200, CORS);
}

export async function onRequestPost({ request, env }) {
  if (!env.AI) return json({ error: 'Photo AI is not set up yet.' }, 503, CORS);
  let body = {};
  try { body = await request.json(); } catch {}
  const b64 = String(body.img || '').replace(/^data:image\/\w+;base64,/, '');
  if (!b64 || b64.length > 1_400_000 || !/^[A-Za-z0-9+/=]+$/.test(b64)) return json({ error: 'Send one JPEG photo under 1 MB.' }, 400, CORS);

  if (env.DB) {
    await ensureSchema(env.DB);
    const day = new Date().toISOString().slice(0, 10), w = await who(request);
    const row = await env.DB.prepare('SELECT n FROM ai_use WHERE day=? AND who=?').bind(day, w).first();
    if (row && row.n >= LIMIT) return json({ error: `Daily limit of ${LIMIT} photos reached. Type what you ate instead, or try tomorrow.` }, 429, CORS);
    await env.DB.prepare('INSERT INTO ai_use (day, who, n) VALUES (?, ?, 1) ON CONFLICT(day, who) DO UPDATE SET n = n + 1').bind(day, w).run();
    // keep only the last 3 days of counts
    const old = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    await env.DB.prepare('DELETE FROM ai_use WHERE day < ?').bind(old).run();
  }

  let lastErr = '';
  for (const m of MODELS) {
    try {
      const o = parse(await ask(env, m, b64));
      if (o) return json(clean(o), 200, CORS);
      lastErr = 'unreadable answer';
    } catch (e) { lastErr = String((e && e.message) || e).slice(0, 200); }
  }
  return json({ error: 'Could not read this photo. Try a clearer photo from above, or type what you ate.', detail: lastErr }, 502, CORS);
}

export const onRequestOptions = () => preflight();

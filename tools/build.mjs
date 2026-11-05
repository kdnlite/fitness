// Builds index.html from the files in src/.
//   node tools/build.mjs          write index.html
//   node tools/build.mjs --check  exit 1 if index.html is out of date
// Cloudflare Pages serves index.html as it is, so run this after every change in src/ and commit both.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const read = (p) => readFileSync(p, 'utf8');
const parts = (dir) => readdirSync(join(SRC, dir)).filter((f) => !f.startsWith('.')).sort().map((f) => read(join(SRC, dir, f))).join('');

const page = read(join(SRC, 'page.html'));
const out = page
  .replace('<!--@css-->', () => parts('css'))
  .replace('<!--@js-->', () => parts('js'));

const target = join(ROOT, 'index.html');
if (process.argv.includes('--check')) {
  let cur = '';
  try { cur = read(target); } catch {}
  if (cur !== out) { console.error('index.html is out of date: run  node tools/build.mjs'); process.exit(1); }
  console.log('index.html is up to date');
} else {
  writeFileSync(target, out);
  console.log('built index.html', out.length, 'bytes');
}

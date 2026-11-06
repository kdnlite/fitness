#!/usr/bin/env python3
"""Add the two photos (start and end) for one exercise.

  python3 tools/add-exercise-photos.py <exercise-id> <start-photo> <end-photo>
  python3 tools/add-exercise-photos.py --remove <exercise-id>
  python3 tools/add-exercise-photos.py --list          (ids and names, with which have photos)

Makes, in assets/ex/:
  <id>-start.webp / <id>-end.webp        light copy for lists, 1200 px on the long side
  <id>-start-hd.webp / <id>-end-hd.webp  full quality, up to 3840 px (4K), opens when tapped
and updates src/js/03a-ex-photos.js. Then run: node tools/build.mjs"""
import sys, os, re, json
from PIL import Image, ImageOps
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
LIST = os.path.join(ROOT, 'src/js/03a-ex-photos.js'); OUT = os.path.join(ROOT, 'assets/ex')
def load():
    s = open(LIST).read(); return json.loads(s[s.index('var EXPH = ') + 11:s.rindex(';')])
def save(d):
    open(LIST, 'w').write('  /* Made by tools/add-exercise-photos.py: exercise id -> photo version. Do not edit by hand. */\n  var EXPH = ' + json.dumps(dict(sorted(d.items())), separators=(',', ':')) + ';\n')
def ids():
    lib = open(os.path.join(ROOT, 'src/js/04-exercise-library.js'), encoding='utf-8').read()
    out = {m.group(1): m.group(2) for m in re.finditer(r"\b([a-z0-9]+):\{n:'([^']+)'", lib)}
    a = lib.index('var XROWS = ['); rows = json.loads(lib[a + 12:lib.index('];', a) + 1])
    for r in rows:
        n = r.split('~')[0]; out.setdefault(re.sub('[^a-z0-9]', '', n.lower()), n)
    return out
def make(src, dst, size, q):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    k = min(1, size / max(im.size))
    if k < 1: im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=q, method=6)
    return im.size, os.path.getsize(dst)
a = sys.argv[1:]
if not a: print(__doc__); sys.exit(1)
d = load()
if a[0] == '--list':
    for k, n in sorted(ids().items(), key=lambda x: x[1].lower()): print(('✓ ' if k in d else '  ') + k.ljust(36) + n)
    sys.exit(0)
if a[0] == '--remove':
    for s in ('start', 'end', 'start-hd', 'end-hd'):
        p = os.path.join(OUT, f'{a[1]}-{s}.webp')
        if os.path.exists(p): os.remove(p)
    d.pop(a[1], None); save(d); print('removed', a[1]); sys.exit(0)
eid, s_img, e_img = a
known = ids()
if eid not in known: sys.exit(f'Unknown exercise id "{eid}". Run with --list to see ids.')
os.makedirs(OUT, exist_ok=True)
for tag, src in (('start', s_img), ('end', e_img)):
    sz, b = make(src, os.path.join(OUT, f'{eid}-{tag}.webp'), 1200, 82)
    hz, hb = make(src, os.path.join(OUT, f'{eid}-{tag}-hd.webp'), 3840, 90)
    print(f'{eid} {tag}: list {sz[0]}x{sz[1]} {b//1024} KB · full {hz[0]}x{hz[1]} {hb//1024} KB')
d[eid] = d.get(eid, 0) + 1; save(d)
print(f'{known[eid]}: photos added ({len(d)} exercises have photos now).')

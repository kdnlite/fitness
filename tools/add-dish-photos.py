#!/usr/bin/env python3
"""Add new dish photos: tools/add-dish-photos.py <dir-with-id.webp> [crop%]
Crops a margin on every side (removes generator watermarks), writes
assets/img/dish/<id>-<hash>.webp (card, 720px) and -hd (full), updates DPH/DPHD."""
import sys, os, re, json, hashlib, io
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]; crop = float(sys.argv[2]) if len(sys.argv) > 2 else 7.0
js = os.path.join(root, 'src/js/02-dish-library.js'); s = open(js).read()
def getmap(name):
    m = re.search(r'var %s = (\{.*?\});' % name, s); return json.loads(m.group(1)), m
DPH, _ = getmap('DPH'); DPHD, _ = getmap('DPHD')
out = os.path.join(root, 'assets/img/dish'); os.makedirs(out, exist_ok=True)
for f in sorted(os.listdir(src)):
    if not f.endswith(('.webp', '.png', '.jpg')): continue
    did = os.path.splitext(f)[0]
    im = Image.open(os.path.join(src, f)).convert('RGB'); w, h = im.size
    dx, dy = round(w * crop / 100), round(h * crop / 100)
    im = im.crop((dx, dy, w - dx, h - dy))
    hd = io.BytesIO(); im.save(hd, 'WEBP', quality=86, method=6); hb = hd.getvalue()
    tag = hashlib.sha1(hb).hexdigest()[:8]
    sm = im.copy(); sm.thumbnail((720, 720), Image.LANCZOS)
    for old in (DPH.get(did), DPHD.get(did)):
        if old and old.startswith('assets/img/dish/') and os.path.exists(os.path.join(root, old)): os.remove(os.path.join(root, old))
    p1 = 'assets/img/dish/%s-%s.webp' % (did, tag); p2 = 'assets/img/dish/%s-%s-hd.webp' % (did, tag)
    sm.save(os.path.join(root, p1), 'WEBP', quality=80, method=6); open(os.path.join(root, p2), 'wb').write(hb)
    DPH[did] = p1; DPHD[did] = p2; print(did, sm.size, im.size)
s = re.sub(r'var DPH = \{.*?\};', lambda m: 'var DPH = ' + json.dumps(DPH) + ';', s, count=1)
s = re.sub(r'var DPHD = \{.*?\};', lambda m: 'var DPHD = ' + json.dumps(DPHD) + ';', s, count=1)
open(js, 'w').write(s)

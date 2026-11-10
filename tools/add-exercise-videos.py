#!/usr/bin/env python3
"""Add exercise demo videos.

  python3 tools/add-exercise-videos.py <id> <m|f> <video.mp4> [<id> <m|f> <video> ...]

Each video is re-encoded (H.264, no sound, web-ready) to assets/vid/<m|f>/<id>.mp4 and listed in
src/js/03b-ex-videos.js (VIDS). The app then plays it on the exercise page instead of the drawn demo.
Run node tools/build.mjs afterwards.
"""
import sys, os, re, json, subprocess
def wm_filter(src):
    # cover the generator's small corner watermark (bottom right) with ffmpeg delogo
    w, h = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src], capture_output=True, text=True, check=True).stdout.strip().split(',')[:2])
    k = min(w, h) / 464; bw, bh = round(48 * k), round(24 * k)
    return f'delogo=x={w - bw - round(4 * k)}:y={h - bh - round(6 * k)}:w={bw}:h={bh}'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIST = os.path.join(ROOT, 'src/js/03b-ex-videos.js')
IDS = json.load(open(os.path.join(ROOT, 'tools/exercise-ids.json'), encoding='utf-8'))
def load():
    if not os.path.exists(LIST): return {'m': {}, 'f': {}}
    s = open(LIST).read(); return json.loads(re.search(r'var VIDS = (\{.*?\});', s, re.S).group(1))
def save(v):
    v = {g: dict(sorted(v[g].items())) for g in ('m', 'f')}
    open(LIST, 'w').write('  /* Made by tools/add-exercise-videos.py: which exercises have a demo video (assets/vid/<m|f>/<id>.mp4), id -> version. Do not edit by hand. */\n  var VIDS = ' + json.dumps(v, separators=(',', ':')) + ';\n')
a = sys.argv[1:]
if not a or len(a) % 3: print(__doc__); sys.exit(1)
v = load()
for i in range(0, len(a), 3):
    eid, g, src = a[i], a[i + 1], a[i + 2]
    if eid not in IDS: sys.exit(f'Unknown exercise id "{eid}"')
    if g not in ('m', 'f'): sys.exit('Gender must be m or f')
    out = os.path.join(ROOT, 'assets/vid', g, eid + '.mp4'); os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-vf', wm_filter(src), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26',
                    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
    v[g][eid] = v[g].get(eid, 0) + 1
    print(f'{IDS[eid]} ({g}): {os.path.getsize(out) // 1024} KB')
save(v)
print(f"Videos: {len(v['m'])} male, {len(v['f'])} female.")

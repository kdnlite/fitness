#!/usr/bin/env python3
"""Add dish loop videos: tools/add-dish-videos.py <id> <video> [<id> <video> ...]

Each clip becomes a seamless loop (the last second cross-fades into the start), the generator's
corner mark is painted out, and it is saved web-ready to assets/dvid/<id>.mp4 and listed in DVID
(src/js/02-dish-library.js). Run node tools/build.mjs afterwards."""
import sys, os, re, json, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(ROOT, 'src/js/02-dish-library.js')
def probe(src):
    o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', src], capture_output=True, text=True, check=True).stdout
    j = json.loads(o); st = j['streams'][0]; return st['width'], st['height'], float(j['format']['duration'])
a = sys.argv[1:]
if not a or len(a) % 2: print(__doc__); sys.exit(1)
s = open(JS).read(); D = json.loads(re.search(r'var DVID = (\{.*?\});', s).group(1))
os.makedirs(os.path.join(ROOT, 'assets/dvid'), exist_ok=True)
for i in range(0, len(a), 2):
    did, src = a[i], a[i + 1]
    w, h, dur = probe(src); L = min(dur, 8.0) - 1.0; k = w / 1280
    # Veo's sparkle sits near the bottom-right corner
    logo = f'delogo=x={round(w - 150 * k)}:y={round(h - 150 * k)}:w={round(60 * k)}:h={round(60 * k)}'
    fc = (f'[0:v]{logo},split[x][y];[x]trim=0:1,setpts=PTS-STARTPTS[a];[y]trim=1:{L + 1},setpts=PTS-STARTPTS[b];'
          f'[b][a]xfade=transition=fade:duration=1:offset={L - 1},scale=960:-2,format=yuv420p[v]')
    out = os.path.join(ROOT, 'assets/dvid', did + '.mp4')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[v]', '-an', '-c:v', 'libx264',
                    '-preset', 'veryfast', '-crf', '27', '-movflags', '+faststart', out], check=True)
    D[did] = D.get(did, 0) + 1; print(did, os.path.getsize(out) // 1024, 'KB')
s = re.sub(r'var DVID = \{.*?\};', lambda m: 'var DVID = ' + json.dumps(dict(sorted(D.items()))) + ';', s, count=1)
open(JS, 'w').write(s); print(len(D), 'dish videos')

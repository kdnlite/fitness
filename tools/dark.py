#!/usr/bin/env python3
"""Writes src/css/24-dark.css: a dark theme made from the light CSS.
Every rule in src/css that paints a light background, a dark text colour or a light border
gets a matching html.dk rule. Gym manager, landing and already-dark parts are left alone.
Run after changing CSS:  python3 tools/dark.py && node tools/build.mjs"""
import re, glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SKIP_SEL = re.compile(r'(^|[\s,>+~])(\.g[a-z]|#gym|#gymroot|\.lp-|body\.onland|\.onland|\.gymmode|#s-landing|\.hh-hero|\.ek(?![\w-])|\.ek-(top|wa|links|tx|q|cups|fl|wl|wb)\b|\.gw|\.wr-hero|\.hx-hero|\.hx-tile\.(navy|gold)|\.kshare|#trainerroot|\.tr-|\.hd\b|\.hd::|#mlist|\.mpanel|\.menu|\.lgo|\.brand|\.gw-|\.hh-gold|\.cb\.on|\.on\b|\.btn:not|\.tkgo)')
def hexrgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def lum(h):
    r, g, b = hexrgb(h); return (0.299*r + 0.587*g + 0.114*b) / 255
def light(h): return lum(h) > 0.86
def plain(h):
    r, g, b = hexrgb(h)
    return not (r - max(g, b) > 50 or g - max(r, b) > 40)
def darktext(h):
    r, g, b = hexrgb(h)
    if r - max(g, b) > 50 or g - max(r, b) > 40: return False  # keep reds and greens (errors, success)
    return lum(h) < 0.32
BG = '#131C30'; BG2 = '#182339'; FG = '#E8ECF4'; MUT = '#A9B3C7'; LINE = 'rgba(233,207,156,.16)'
def map_bg(v):
    cols = re.findall(r'#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b', v)
    if not cols: return 'rgba(255,255,255,.06)' if re.search(r'\bwhite\b', v) else None
    if 'gradient' in v:
        return 'linear-gradient(160deg,#1A2440,#121A2C)' if all(light(c) for c in cols) else None
    c = cols[0]
    if not light(c) or len(cols) > 1: return None
    return BG if lum(c) > 0.97 else BG2
def split_rules(css):
    out, i, depth, start, at = [], 0, 0, 0, []
    # flatten simple @media wrappers
    for m in re.finditer(r'(@media[^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}|([^{}@]+)\{([^{}]*)\}', css):
        if m.group(1): 
            for r in re.finditer(r'([^{}]+)\{([^{}]*)\}', m.group(2)): out.append((m.group(1).strip(), r.group(1).strip(), r.group(2)))
        else: out.append((None, m.group(3).strip(), m.group(4)))
    return out
def split_sel(sel):
    out, depth, cur = [], 0, ''
    for ch in sel:
        if ch == '(': depth += 1
        elif ch == ')': depth -= 1
        if ch == ',' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur)
    return out
rules = []
for f in sorted(glob.glob(os.path.join(ROOT, 'src/css/*.css'))):
    if f.endswith('24-dark.css'): continue
    css = re.sub(r'/\*.*?\*/', '', open(f, encoding='utf-8').read(), flags=re.S)
    for media, sel, body in split_rules(css):
        if not sel or sel.startswith('@') or 'keyframes' in sel or re.match(r'^(from|to|\d+%)', sel): continue
        sels = [s.strip() for s in split_sel(sel) if s.strip() and not SKIP_SEL.search(' '+s.strip()) and not re.search(r'gym|onland|#s-landing|\.lp-|kshare|trainer', s) and ':root' not in s and not s.strip().startswith('html')]
        if not sels: continue
        decl = {}
        for d in body.split(';'):
            if ':' in d:
                k, v = d.split(':', 1); decl[k.strip().lower()] = v.strip()
        bgv = decl.get('background') or decl.get('background-color')
        out = []
        nb = map_bg(bgv) if bgv else None
        if nb: out.append('background:' + nb)
        bg_is_colored = bgv and not nb and re.search(r'#|rgb|gradient', bgv or '')
        c = decl.get('color')
        if c and not bg_is_colored:
            cm = re.fullmatch(r'#[0-9A-Fa-f]{3,6}', c.replace('!important', '').strip())
            if cm and darktext(cm.group(0)): out.append('color:' + FG)
            elif cm and 0.32 <= lum(cm.group(0)) < 0.6 and plain(cm.group(0)): out.append('color:' + MUT)
        for bk in ('border', 'border-top', 'border-bottom', 'border-color'):
            v = decl.get(bk)
            if v:
                cs = re.findall(r'#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b', v)
                if cs and light(cs[0]) or (cs and lum(cs[0]) > .7): out.append(bk + ':' + v.replace(cs[0], LINE))
        if decl.get('box-shadow') and nb: out.append('box-shadow:none')
        if out:
            s = ','.join('html.dk ' + x for x in sels)
            rules.append(((media + '{') if media else '') + s + '{' + ';'.join(out) + '}' + ('}' if media else ''))
head = """/* ===== DARK THEME (made by tools/dark.py, do not edit by hand) ===== */
html.dk{color-scheme:dark;--bg:#0B1220;--surface:#131C30;--fg:#E8ECF4;--muted:#A9B3C7;--line:rgba(233,207,156,.18);--accent-soft:#18233A}
html.dk body{background:#0B1220;color:#E8ECF4}
html.dk input,html.dk select,html.dk textarea{background:#0F1729;color:#E8ECF4;border-color:rgba(233,207,156,.22)}
html.dk input::placeholder,html.dk textarea::placeholder{color:#7D879B}
html.dk .hs-panel,html.dk .hs-foot{background:#111A2E}
html.dk .hs-x,html.dk .fq-q button,html.dk .hs-time button{background:#1E2A44;color:#E8ECF4}
html.dk h1,html.dk h2,html.dk h3,html.dk h4{color:#F2F4F8}
html.dk img.eph,html.dk .eph{background:#E9E6DE}
"""
tail = open(os.path.join(ROOT, 'tools/dark-extra.css'), encoding='utf-8').read() if os.path.exists(os.path.join(ROOT, 'tools/dark-extra.css')) else ''
open(os.path.join(ROOT, 'src/css/24-dark.css'), 'w', encoding='utf-8').write(head + '\n'.join(rules) + '\n' + tail + '\n/* ===== DARK THEME END ===== */\n')
print(len(rules), 'dark rules')

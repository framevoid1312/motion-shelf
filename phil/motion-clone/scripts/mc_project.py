#!/usr/bin/env python3
"""mc_project.py WORKDIR [--no-audio]
Merge WORKDIR/scene-XX/layers.json into WORKDIR/rebuild/ (editable HTML project:
project.json + renderer.js + index.html, HyperFrames/GSAP-compatible)."""
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path
SAFE = {'color','background','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat',
 'border','borderTop','borderRight','borderBottom','borderLeft','borderRadius','boxShadow','textShadow','fontFamily','fontSize',
 'fontWeight','fontStyle','textAlign','lineHeight','letterSpacing','whiteSpace','transformOrigin','filter','clipPath','maskImage',
 'fill','stroke','strokeWidth','strokeLinecap','strokeLinejoin','strokeDasharray','strokeDashoffset','opacity','padding','overflow',
 'display','alignItems','justifyContent','mixBlendMode','textTransform','backdropFilter','WebkitBackgroundClip','WebkitTextFillColor'}
KINDS = {'text','rect','ellipse','path','group'}
def check(scene, si, s0, s1):
    errs=[]; seen={}
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', scene.get('background','')): errs.append('background must be #rrggbb')
    for L in scene['layers']:
        id_=L.get('id','')
        if not re.fullmatch(r'[a-zA-Z][\w-]{0,70}', id_) or id_ in seen: errs.append(f'bad/duplicate id {id_!r}')
        if L.get('kind') not in KINDS: errs.append(f'{id_}: kind')
        if L.get('parent') and seen.get(L['parent']) != 'group': errs.append(f'{id_}: parent must be an earlier group')
        if not L.get('frames'): errs.append(f'{id_}: needs frames')
        for k,v in L.get('style',{}).items():
            if k not in SAFE or re.search(r'url\s*\(|javascript|expression|[<>]', str(v), re.I): errs.append(f'{id_}: style {k}')
        for f in L.get('frames',[]):
            if not all(k in f for k in 't x y w h'.split()): errs.append(f'{id_}: frame needs t,x,y,w,h')
        if L.get('end', s1) <= L.get('start', s0): errs.append(f'{id_}: end<=start')
        seen[id_] = L.get('kind')
    if errs: sys.exit(f'scene {si}: '+'; '.join(errs[:8]))
ap = argparse.ArgumentParser(); ap.add_argument('work'); ap.add_argument('--no-audio', action='store_true'); a = ap.parse_args()
W = Path(a.work); scan = json.loads((W/'scan.json').read_text()); m = scan['meta']
layers=[]; notes=[]; title='Rebuild'; bg='#000000'
for sc in scan['scenes']:
    si=sc['scene']; f = W/f'scene-{si:02d}'/'layers.json'
    if not f.exists(): sys.exit(f'missing {f}')
    s = json.loads(f.read_text()); s0, s1 = sc['start'], sc['end']
    if si == len(scan['scenes'])-1: s1 = scan['duration'] + 1/scan['fps']
    check(s, si, s0, s1); title = s.get('title', title) if si == 0 else title; bg = s['background'] if si == 0 else bg
    p = f's{si}_'; layers.append(dict(id=p+'bg', kind='rect', start=s0, end=s1, style={'background': s['background']},
                                     frames=[dict(t=s0, x=0, y=0, w=m['width'], h=m['height'])]))
    alive=set()
    for L in s['layers']:
        L = dict(L); L['start']=max(s0, L.get('start', s0)); L['end']=min(s1, L.get('end', s1))
        if L['end'] <= L['start'] or (L.get('parent') and L['parent'] not in alive): continue
        alive.add(L['id']); L['id']=p+L['id']; L['parent']=p+L['parent'] if L.get('parent') else ''; layers.append(L)
    notes += [f'Scene {si+1}: {n}' for n in s.get('notes', [])]
R = W/'rebuild'; (R/'vendor').mkdir(parents=True, exist_ok=True); (R/'assets').mkdir(exist_ok=True)
data = dict(title=title, width=m['width'], height=m['height'], fps=scan['fps'], duration=scan['duration'], background=bg, notes=notes, layers=layers)
(R/'project.json').write_text(json.dumps(data, indent=1))
(R/'project.js').write_text('window.project='+json.dumps(data, separators=(',',':')).replace('<','\\u003c')+';')
(R/'renderer.js').write_text((Path(__file__).parent/'renderer.js').read_text())
(R/'sync-project.cjs').write_text("const fs=require('fs');const d=JSON.parse(fs.readFileSync('project.json','utf8'));fs.writeFileSync('project.js','window.project='+JSON.stringify(d).replace(/</g,'\\\\u003c')+';');\n")
for g in [Path(__file__).parent/'node_modules/gsap/dist/gsap.min.js']:
    if g.exists(): shutil.copy2(g, R/'vendor/gsap.min.js')
audio=''
if m['audio'] and not a.no_audio:
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(W/'source.mp4'),'-vn','-c:a','copy',str(R/'assets/audio.m4a')], check=True)
    audio = f'<audio id="audio" src="assets/audio.m4a" data-start="0" data-duration="{scan["duration"]}" data-track-index="99"></audio>'
(R/'index.html').write_text(f'''<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<style>html,body{{margin:0;overflow:hidden;background:{bg}}}#root{{position:relative;width:{m['width']}px;height:{m['height']}px;overflow:hidden}}
.layer{{position:absolute;box-sizing:border-box;white-space:pre-wrap}}</style>
<script src="vendor/gsap.min.js" onerror="0"></script><script src="project.js"></script><script src="renderer.js"></script></head><body>
<div id="root" data-composition-id="rebuilt" data-width="{m['width']}" data-height="{m['height']}" data-fps="{scan['fps']}" data-duration="{scan['duration']}">{audio}</div>
<script>buildProject();</script></body></html>''')
(R/'package.json').write_text(json.dumps({'private':True,'dependencies':{'hyperframes':'0.8.33','gsap':'3.14.2'},
 'scripts':{'sync':'node sync-project.cjs','preview':'npm run sync && hyperframes preview','render':'npm run sync && hyperframes render --quality high --output output.mp4'}}, indent=2))
(R/'README.md').write_text('# Editable motion rebuild\n\nEdit `project.json` (layers: id, kind text|rect|ellipse|path|group, parent, text, path, style, start, end, frames[t,x,y,w,h,opacity,rotation,reveal,ease]).\nRun `node sync-project.cjs`, then open index.html (`?t=2.5` freezes a time, `?play` plays) or `npm i && npm run render` with HyperFrames.\n\n'+'\n'.join('- '+n for n in notes)+'\n')
print(f'{len(layers)} layers -> {R}')

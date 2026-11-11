---
name: motion-clone
description: Rebuild a reference motion-graphics video as an editable code project (HTML/GSAP layers, HyperFrames-compatible), compare it frame by frame and render it. Use for clone, recreate, rebuild or remake this animation, title sequence, ad or explainer clip.
compatibility: Claude Code or any agent with a shell and image vision. Needs Python 3 (opencv, numpy, pillow, playwright + Chromium), ffmpeg/ffprobe and Node for the optional gsap vendor copy. No accounts or API keys; the agent itself does the visual analysis.
---

# Motion Clone: reference video → editable motion project

The method comes from [MotionClone](https://github.com/blixvip/MotionClone) (MIT, blixvip). In that app, Codex/ChatGPT does the vision. Here the **agent is the vision step**: it looks at sampled frames and writes the layer JSON itself, and nothing is sent to another model.

**Pipeline:**
1. Normalize the clip.
2. Scan every frame.
3. Split into scene chunks snapped to cuts.
4. The agent authors layers per scene.
5. Merge them into one project.
6. Make RGB-SSIM compare sheets.
7. Run a bounded patch loop.
8. Do a frame-exact render, plus a REFERENCE | REBUILD video.

It suits motion graphics: type, shapes, UI, logos, charts and transitions, up to 120 s (under 30 s is the sweet spot). Live footage, photography and real 3D can't be rebuilt faithfully. Say so in the notes, and never claim a 1:1 result. Only use footage the user owns or has permission to adapt.

## 0. Setup

Save the five files from *Tool files* below into `~/mctools/`, or copy this folder's `scripts/` there. Keep them outside any downloaded folder. Then:

```
cd ~/mctools && npm i --silent gsap@3.14.2      # optional: vendored into projects for HyperFrames
python3 -c "import cv2,numpy,PIL,playwright" || pip install opencv-python-headless numpy pillow playwright
python3 -m playwright install chromium          # if no Chromium is available
```

## 1. Scan

`python3 ~/mctools/mc_scan.py REF.mp4 WORK [--budget 384 for dense/fast clips] [--scene 6]`

This writes `WORK/source.mp4` (constant frame rate, ≤1080p), `WORK/scan.json` and `WORK/scene-XX/frame-NNNNNN-T.TTTs.jpg`. Each JPG is one full frame. Frames are sampled adaptively: scene endpoints first, then each cut or flash with the frames on either side, then the highest-change frames. Read the timestamps in the file names.

Look at the frames: make a labelled grid per scene with PIL, then pull full-res stills (`ffmpeg -ss T -i WORK/source.mp4 -frames:v 1 x.png`) where you need precision.

## 2. Measure, don't guess

Small offsets are what make a rebuild look wrong, so measure with code.

- **Per-frame tracks.** Decode every frame with cv2 and print each element's bounding box over time. Use colour masks (red dot), darkness masks (type, blocks) and fixed crops for each region. One table gives entrances, exits, easing steps and the exact frame each block lands.
- **Positions, sizes, colours.** Use `connectedComponentsWithStats` on a still for exact rects and repeating patterns (column x's, row pitch). Sample pixel colours for the palette.
- **Solid glyphs and logos → traced paths.** Huge numerals, logo marks and icons in an unknown font: threshold the region, upscale ×4, `findContours` (RETR_CCOMP), `approxPolyDP` at about 1.2 px, then normalize to the 0–100 viewBox of their bbox. This rebuilds the shape as a vector, not a raster.
- **Type calibration.** Measure the reference's text widths, x-height and cap height. In Chromium, use `canvas.measureText` to find the installed font, size and weight that match the width. Inter is a good stand-in for most grotesks. Then set `y` from the metrics, and use the measured advance widths to place word layers.
- **Stepped motion.** Many motion pieces animate on twos or threes. If the per-frame table shows plateaus, give a keyframe per measured frame (linear) instead of a smooth ease.

## 3. Author `WORK/scene-XX/layers.json`

```json
{"title":"…","background":"#rrggbb","notes":["candid limits"],
 "layers":[{"id":"title","kind":"text","parent":"","text":"Align","path":"",
  "style":{"color":"#111","fontFamily":"Inter","fontSize":"36px","fontWeight":"600","lineHeight":"44px","whiteSpace":"pre"},
  "start":1.21,"end":3.8,
  "frames":[{"t":1.21,"x":8,"y":44,"w":300,"h":44,"ease":"out"},{"t":1.333,"x":8,"y":0,"w":300,"h":44}]}]}
```

**Layout and timing**
- Coordinates are pixels: top-left x/y plus w/h, in the parent's coordinate system.
- Times are absolute seconds, not relative to the scene. `end` is exclusive.
- Layers draw in array order, back to front.
- Writing one generator script (Python) that emits the layers is easiest. You can write the full timeline to every scene file: the merge step clips each layer to its scene.

**Kinds**
- `text`: literal text. For multi-line text, `lineHeight` must be the per-line height, not the box height.
- `rect`: CSS backgrounds, borders and shadows.
- `ellipse`: use a radial gradient for spheres.
- `path`: SVG `d` in a 0 0 100 100 viewBox, stretched to w×h.
- `group`: its children are positioned relative to the group. Scaling the group's w/h scales every child length. `overflow:hidden` on a group gives a clip/mask, which is how words rising out of a line or a dot dropping into a poster are built.

**Frames and style**
- Frames need t,x,y,w,h. Optional: opacity, rotation, reveal (0–1 types out text) and `ease` (linear|out|in|inout|smooth|step|back), which applies from that frame to the next.
- Allowed style keys are the safe CSS listed in `mc_project.py`. No url(), scripts or HTML.

**Content rules**
- Rebuild everything as layers. Never embed the source video, screenshots or raster plates.
- Keep the exact copy and the small supporting details (rules, counters, labels).
- Split content at cuts using start/end. Write honest notes.

## 4. Build and compare

```
python3 ~/mctools/mc_project.py WORK     # validates + merges → WORK/rebuild/
python3 ~/mctools/mc_compare.py WORK     # → scene-XX/preview.jpg + mean/min RGB-SSIM + worst timestamp
```

Read every sheet (reference left, rebuild right, at the same timestamps). SSIM is a guide; your eyes decide.

## 5. Patch loop (bounded)

Start with the lowest-scoring scene. Fix up to about 6 concrete differences: copy, missing elements, position, scale, weight or timing. Then run `mc_compare.py WORK --scenes N --tag revision`.

Keep a change if the mean improves by more than 0.002 and the minimum drops by no more than 0.03. Also keep a visually clear fidelity fix that doesn't lower the scores. Otherwise revert it. Stop after 2–3 passes per scene.

## 6. Render and deliver

`python3 ~/mctools/mc_render.py WORK --compare side|stack` makes `WORK/rebuild.mp4` (frame-exact, source audio muxed in) and `WORK/compare.mp4`. Verify the frame count, audio and a still with ffprobe.

Deliver both videos and a zip of `WORK/rebuild/`. The zip holds project.json, renderer.js, index.html, the vendored gsap, audio, a README and a package.json for HyperFrames. index.html also works when opened directly: `?t=2.5` freezes a time and `?play` loops.

To edit the project later, change `project.json`, run `node sync-project.cjs`, and re-render. Report per-scene SSIM and the notes.

## Gotchas
- Text `y` is the top of the line box. With Inter, cap top ≈ y + (lineHeight − 1.21·size)/2 + 0.969·size − 0.727·size.
- Check which fonts are installed (`fc-list`). Name the closest one and disclose it.
- Effects outside the primitives (grain, glow, wipes with soft masks) can be approximated with filter, opacity or clipPath. Say so in the notes.
- For long clips with many cuts, run the scan with `--budget 384`. Render speed is about 10–25 fps of output at 1080p.

## Demo

`demo/` holds a 7.5 s clone of rule 4 from lemo-opuscar's *Swiss Motion* film (MIT). It shows the reference beside the rebuild, plus the editable project that produced it: 97 authored layers, traced digits, Inter type and per-frame-measured timing. RGB-SSIM is 0.959 and 0.966 for its two scenes. The one known difference: the grid lines fade instead of wiping downward.

---

## Tool files

### `scripts/mc_scan.py`
```python
#!/usr/bin/env python3
"""mc_scan.py SOURCE WORKDIR [--budget 192|384] [--scene 6]
Normalize the reference, scan every frame for motion/cuts, split into scenes
(boundaries snapped to cuts) and export the frames Claude should look at."""
import argparse, json, math, subprocess, sys
from pathlib import Path
import cv2, numpy as np
from PIL import Image

def probe(p):
    d = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
    v = next(s for s in d['streams'] if s['codec_type']=='video')
    n, den = map(int, v['r_frame_rate'].split('/'))
    return dict(width=int(v['width']), height=int(v['height']), fps=n/den,
                duration=float(d['format']['duration']), audio=any(s['codec_type']=='audio' for s in d['streams']))

ap = argparse.ArgumentParser(); ap.add_argument('source'); ap.add_argument('work')
ap.add_argument('--budget', type=int, default=192); ap.add_argument('--scene', type=float, default=6)
a = ap.parse_args(); work = Path(a.work); work.mkdir(parents=True, exist_ok=True)
src = work/'source.mp4'
m0 = probe(a.source)
if m0['duration'] > 120.05: sys.exit('Trim the reference to <=120 s first.')
fps = min(60, max(12, round(m0['fps'])))
subprocess.run(['ffmpeg','-y','-v','error','-i',a.source,'-map','0:v:0','-map','0:a:0?',
  '-vf',"scale='min(iw,if(gte(iw,ih),1920,1080))':'min(ih,if(gte(iw,ih),1080,1920))':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1",
  '-r',str(fps),'-fps_mode','cfr','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',
  '-c:a','aac','-movflags','+faststart',str(src)], check=True)
meta = probe(src)

# 1. scan every frame at 160px; record change score and hard "visual jumps" (cuts/flashes)
cap = cv2.VideoCapture(str(src)); prev=None; changes=[]; jumps=[]; i=0
while True:
    ok, f = cap.read()
    if not ok: break
    s = cv2.resize(f, (160, max(16, round(160*meta['height']/meta['width']))), interpolation=cv2.INTER_AREA).astype(np.float32)
    if prev is not None:
        d = np.abs(s-prev)/255; sc = float(d.mean()); changes.append((sc, i))
        if sc > .22 and float((d.mean(axis=2) > .12).mean()) > .60: jumps.append(i)
    prev = s; i += 1
cap.release(); count = i; fps = meta['fps']
# 2. global sample set: even spread + jump neighbours + highest-change frames
budget = a.budget
k = min(budget//2, max(16, math.ceil(meta['duration']*(6 if budget > 192 else 4))))
samples = {round(j*(count-1)/max(1,k-1)) for j in range(k)}
for sc, n in sorted(changes, reverse=True):
    if n in jumps:
        nb = {x for x in (n-1,n,n+1) if 0 <= x < count}
        if len(samples|nb) <= budget-24: samples |= nb
for sc, n in sorted(changes, reverse=True):
    if sc < .012 or len(samples) >= budget: break
    if all(abs(n-x) > 2 for x in samples): samples.add(n)
# 3. scenes of ~N s, end snapped to a late cut inside the window
width = max(1, round(a.scene*fps)); scenes=[]; st=0
while st < count:
    en = min(count, st+width)
    if en < count:
        near = [n for n in jumps if st+width*.65 <= n <= en]
        if near: en = max(near)
    scenes.append((st, en)); st = en
# 4. per-scene picks: endpoints, jumps (+/-1), then spread
def pick(st, en, limit):
    limit = min(limit, en-st); sel = {st} | ({en-1} if limit > 1 else set())
    js = [n for n in jumps if st <= n < en]
    while js and len(sel) < limit:
        n = max(js, key=lambda n: min(abs(n-x) for x in sel)); js.remove(n)
        for x in (n, n-1, n+1):
            if st <= x < en and len(sel) < limit: sel.add(x)
    cand = {n for n in samples if st <= n < en} | {round(st+j*(en-st-1)/max(1,limit-1)) for j in range(limit)}
    while cand-sel and len(sel) < limit:
        sel.add(max(sorted(cand-sel), key=lambda n: min(abs(n-x) for x in sel)))
    return sorted(sel)
lim = 24 if budget > 192 else 16
out = []; cap = cv2.VideoCapture(str(src))
for si, (st, en) in enumerate(scenes):
    d = work/f'scene-{si:02d}'; d.mkdir(exist_ok=True); idx = pick(st, en, lim); files=[]
    for n in idx:
        cap.set(cv2.CAP_PROP_POS_FRAMES, n); ok, f = cap.read()
        if not ok: continue
        im = Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)); im.thumbnail((1080,1080))
        p = d/f'frame-{n:06d}-{n/fps:.3f}s.jpg'; im.save(p, quality=92); files.append(str(p))
    out.append(dict(scene=si, start=st/fps, end=en/fps, first=st, last=en, frames=idx, files=files))
cap.release()
scan = dict(meta=meta, decoded_frames=count, fps=fps, duration=count/fps, budget=budget,
            visual_jump_seconds=[round(n/fps,3) for n in jumps], sample_frames=sorted(samples), scenes=out)
(work/'scan.json').write_text(json.dumps(scan, indent=1))
print(json.dumps(dict(meta=meta, frames=count, jumps=len(jumps), scenes=[(s['scene'],round(s['start'],2),round(s['end'],2),len(s['files'])) for s in out])))
```

### `scripts/mc_project.py`
```python
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
```

### `scripts/renderer.js`
```js
// Pure function of time: drawFrame(t) sets every layer. Keyframe poses interpolate with optional per-segment ease.
function buildProject(){
const P=window.project,root=document.getElementById('root'),nodes={},items=[];
const E={linear:q=>q,out:q=>1-Math.pow(1-q,3),in:q=>q*q*q,inout:q=>q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2,smooth:q=>q*q*(3-2*q),step:q=>q<1?0:1,
 back:q=>{const c=1.70158;return 1+(c+1)*Math.pow(q-1,3)+c*Math.pow(q-1,2)}};
for(const l of P.layers){
 const el=document.createElement('div');el.className='layer';el.id=l.id;l.style=l.style||{};
 if(l.kind==='path'){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.style.cssText='width:100%;height:100%;overflow:visible;display:block';const p=document.createElementNS(ns,'path');p.setAttribute('d',l.path||'');p.setAttribute('vector-effect','non-scaling-stroke');svg.append(p);el.append(svg);
  for(const k of ['fill','stroke','strokeWidth','strokeLinecap','strokeLinejoin','strokeDasharray','strokeDashoffset'])if(l.style[k]!=null)p.style[k]=l.style[k];}
 else if(l.kind==='text')el.textContent=l.text||'';
 const st={...l.style};for(const k of ['fill','stroke','strokeWidth','strokeLinecap','strokeLinejoin','strokeDasharray','strokeDashoffset'])if(l.kind==='path')delete st[k];
 Object.assign(el.style,st);if(l.kind==='ellipse')el.style.borderRadius='50%';
 (nodes[l.parent]||root).append(el);nodes[l.id]=el;items.push([el,l]);
}
function draw(t){for(const [el,l] of items){const on=t>=l.start&&t<l.end;el.style.visibility=on?'':'hidden';if(!on)continue;
 const F=l.frames;let a=F[0],b=F[0];for(const f of F){if(f.t<=t){a=f;b=f;}else{b=f;break;}}
 let q=b.t===a.t?0:Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t)));q=(E[a.ease||'linear']||E.linear)(q);
 const v=k=>{const d={opacity:1,rotation:0,reveal:1}[k]??0,x=a[k]??d,y=b[k]??d;return x+(y-x)*q;};
 const base=F[0],g=l.kind==='group',w=v('w'),h=v('h');
 Object.assign(el.style,{left:v('x')+'px',top:v('y')+'px',width:(g?base.w:w)+'px',height:(g?base.h:h)+'px',
  opacity:v('opacity')*Number(l.style.opacity??1),transformOrigin:g?'0 0':(l.style.transformOrigin||'center'),
  transform:'rotate('+v('rotation')+'deg)'+(g?' scale('+(w/base.w)+','+(h/base.h)+')':'')});
 if(l.kind==='text'){const r=v('reveal');el.textContent=r>=1?l.text:l.text.slice(0,Math.ceil(l.text.length*r));}
}}
window.drawFrame=draw;draw(0);
const qs=new URLSearchParams(location.search);if(qs.has('t'))draw(+qs.get('t'));
if(qs.has('play')){const t0=performance.now();(function loop(){draw(((performance.now()-t0)/1000)%P.duration);requestAnimationFrame(loop)})();}
if(window.gsap){const c={t:0};window.__timelines=window.__timelines||{};window.__timelines['rebuilt']=gsap.timeline({paused:true}).to(c,{t:P.duration,duration:P.duration,ease:'none',onUpdate:()=>draw(c.t)});}
}
```

### `scripts/mc_compare.py`
```python
#!/usr/bin/env python3
"""mc_compare.py WORKDIR [--scenes 0,2] [--tag preview]
Draw the rebuild at the scene's sampled frames, score RGB-SSIM against the
reference, write side-by-side sheets (scene-XX/<tag>.jpg) and print scores."""
import argparse, io, json
from pathlib import Path
import cv2, numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
def ssim(a, b):
    a=a.astype(np.float32); b=b.astype(np.float32); G=lambda x: cv2.GaussianBlur(x,(11,11),1.5)
    u,v=G(a),G(b); aa=G(a*a)-u*u; bb=G(b*b)-v*v; ab=G(a*b)-u*v
    return float((((2*u*v+6.5025)*(2*ab+58.5225))/((u*u+v*v+6.5025)*(aa+bb+58.5225))).mean())
ap=argparse.ArgumentParser(); ap.add_argument('work'); ap.add_argument('--scenes'); ap.add_argument('--tag', default='preview'); a=ap.parse_args()
W=Path(a.work); scan=json.loads((W/'scan.json').read_text()); m=scan['meta']; fps=scan['fps']
only={int(x) for x in a.scenes.split(',')} if a.scenes else None
cap=cv2.VideoCapture(str(W/'source.mp4')); report=[]
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--allow-file-access-from-files'])
    pg=br.new_page(viewport={'width':m['width'],'height':m['height']}, device_scale_factor=1)
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto((W/'rebuild/index.html').resolve().as_uri()); pg.wait_for_function('!!window.drawFrame'); pg.evaluate('document.fonts.ready')
    for sc in scan['scenes']:
        if only is not None and sc['scene'] not in only: continue
        pairs=[]; scores=[]
        for n in sc['frames']:
            pg.evaluate('t=>drawFrame(t)', n/fps); img=Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
            cap.set(cv2.CAP_PROP_POS_FRAMES, n); ok, f = cap.read()
            ref=Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)); ref.thumbnail((480,480)); img=img.resize(ref.size)
            s=ssim(np.array(ref), np.array(img)); scores.append(s)
            p=Image.new('RGB',(ref.width*2+6, ref.height+22),'#161616'); p.paste(ref,(0,22)); p.paste(img,(ref.width+6,22))
            d=ImageDraw.Draw(p); d.text((4,5),f'REFERENCE {n/fps:.3f}s',fill='white'); d.text((ref.width+10,5),f'REBUILD  ssim {s:.3f}',fill='#8f8')
            pairs.append(p)
        cols=2 if len(pairs)>6 else 1; rows=-(-len(pairs)//cols); pw_,ph=pairs[0].size
        sheet=Image.new('RGB',(pw_*cols, ph*rows),'#161616')
        for i,p in enumerate(pairs): sheet.paste(p,((i//rows)*pw_,(i%rows)*ph))
        out=W/f'scene-{sc["scene"]:02d}'/f'{a.tag}.jpg'; sheet.save(out, quality=90)
        r=dict(scene=sc['scene'], mean=round(sum(scores)/len(scores),4), min=round(min(scores),4), worst_t=round(sc['frames'][scores.index(min(scores))]/fps,3), sheet=str(out))
        report.append(r); print(json.dumps(r))
    br.close()
if errs: print('PAGE ERRORS:', errs[:3])
prev = json.loads((W/'report.json').read_text()) if (W/'report.json').exists() else {}
prev[a.tag] = report; (W/'report.json').write_text(json.dumps(prev, indent=1))
```

### `scripts/mc_render.py`
```python
#!/usr/bin/env python3
"""mc_render.py WORKDIR [--compare side|stack] [--crf 18]
Frame-exact render of rebuild/ to rebuild.mp4 (source audio muxed), plus an
optional synced reference|rebuild comparison video."""
import argparse, json, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ap=argparse.ArgumentParser(); ap.add_argument('work'); ap.add_argument('--compare', choices=['side','stack']); ap.add_argument('--crf', default='18'); a=ap.parse_args()
W=Path(a.work); P=json.loads((W/'rebuild/project.json').read_text()); fps=P['fps']; n=round(P['duration']*fps)
src=W/'source.mp4'; out=W/'rebuild.mp4'
ff=subprocess.Popen(['ffmpeg','-y','-v','error','-f','image2pipe','-framerate',str(fps),'-c:v','png','-i','-','-i',str(src),
  '-map','0:v','-map','1:a?','-c:v','libx264','-preset','veryfast','-crf',a.crf,'-pix_fmt','yuv420p','-c:a','aac','-shortest','-movflags','+faststart',str(out)], stdin=subprocess.PIPE)
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--allow-file-access-from-files']); pg=br.new_page(viewport={'width':P['width'],'height':P['height']})
    pg.goto((W/'rebuild/index.html').resolve().as_uri()); pg.wait_for_function('!!window.drawFrame'); pg.evaluate('document.fonts.ready')
    for i in range(n):
        pg.evaluate('t=>drawFrame(t)', i/fps); ff.stdin.write(pg.screenshot(type='png'))
    br.close()
ff.stdin.close(); ff.wait(); print('wrote', out)
if a.compare:
    stack='hstack' if a.compare=='side' else 'vstack'
    fc=(f"[0:v]scale=-2:720,drawtext=text='REFERENCE':x=24:y=24:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.5[a];"
        f"[1:v]scale=-2:720,drawtext=text='REBUILD':x=24:y=24:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.5[b];[a][b]{stack}[v]")
    cmp=W/'compare.mp4'
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(src),'-i',str(out),'-filter_complex',fc,'-map','[v]','-map','0:a?',
      '-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-shortest',str(cmp)], check=True); print('wrote', cmp)
```

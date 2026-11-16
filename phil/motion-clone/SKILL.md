---
name: "motion-clone"
description: "Rebuild a reference motion-graphics video as editable code layers or an After Effects project, with a side-by-side comparison. Use for clone, recreate or remake this animation, video, ad or illustrated film."
---

# Motion Clone — reference video → editable motion project

Distilled from MotionClone (blixvip/MotionClone, MIT). In that app, Codex/ChatGPT is the vision step. Here **Claude is the vision step**: Claude looks at the sampled frames and writes the layer JSON itself. Nothing is sent to another AI.

Pipeline: **normalize → scan every frame → scene chunks snapped to cuts → Claude authors layers per scene → merge into project → RGB-SSIM compare sheets → bounded patch loop → frame-exact render + comparison video.**

Two routes, chosen by what the reference is:
- **Flat type-and-shape clips** (titles, UI, logos, kinetic type): sections 1–5, then section 6 for an After Effects project.
- **Illustrated films** (characters, scenery, glows, grain): section 7. Never auto-trace these. Build each shot from measured geometry.

Use it for reference clips of text, shapes, UI, logos and transitions, up to 120 s. Footage, photography and complex 3D can't be rebuilt faithfully. Say so in the notes and never claim 1:1 accuracy. Only use footage the user owns or has permission to adapt.

## Phil's restrictions (read first, they override everything below)

These come from clones and logo animations Phil has rejected. Do not repeat them, even reworded.

**Before building**
- Show a 4-image storyboard and wait for approval. Nothing is built or rendered before a yes.
- Every keyframe needs anticipation and a stated reason. If you can't say why a move happens, cut it.
- "Same animation for my logo" is not a restyle when the two marks have different geometry. First show a mapping: which part of his logo plays each piece of the reference, beat by beat. Get that approved with the storyboard.
- If he says stop, stop. Don't keep iterating on your own.
- A storyboard shows four posed keys of one idea. Four moments sampled from a simulation are not a storyboard, and effect stills (spectrum smear, particle swirl, extruded 3D) are not directions.
- Put nothing on a board he didn't ask for: no corner labels, timecode, tags or micrographics. If you think one would help, offer it in a line and leave it off the board.
- Board from a vector logo. Close-ups blown up from a small PNG show wobbling edges, and he sees that before he sees the idea.
- If the reference is someone else's logo or mascot, settle which mark gets animated in the first reply: ask for his own mark or a pose board. Never invent a stand-in and animate it. A stand-in built from different kinds of parts (a rectangle where the reference has a beak) does not carry the motion, however exact the timing.
- When he names a subject for a new mark ("a raptor", "a dog"), send one still PNG of the mark and wait for a yes before animating. If the word could mean two things, the still settles it; do not guess and run.

**Fidelity to the reference**
- Match the reference's piece count and pacing. If it builds from three or four bold pieces one at a time, the clone does too. Never split a wordmark by algorithm into dozens of strokes that fly in together; it reads as noise.
- Match line weights. Where the reference uses hairlines, the clone uses hairlines: 1 to 3 px at 1080p. Never substitute thick bars.
- Chromatic aberration must be as clean as the reference: a crisp, thin fringe on a sharp image, applied before any glow. No heavy bloom, no strong grain, no blur smeared over the fringe.
- Measure colours, stripe lengths, timing and easing from full-rate frames of the reference, not from a 4 fps contact sheet.
- Use his real logo file. Ask for an SVG; don't upscale a small PNG and trace it.
- When he supplies a pose board or storyboard, that board is the reference for the shapes. Trace its outlines directly (threshold, contour, light smoothing) and rig the traced shapes. Never rebuild the subject from circles and boxes "in the style of" the board. If the board is small, trace it anyway, say which corners and notches the trace softened, and ask for a larger or vector version.
- A part drawn as one silhouette stays one silhouette. Ears, tails and hair that merge into the body are never separate outlined shapes pasted on top. Move them by bending the outline's own points around a root, with weights that fall to zero at the root, and keep his creases and notches.
- A head turn is not a left-right flip. Trace the reference per frame for the vertical dip, the rebound past rest and the slow settle, and for how far the nose or beak reaches through the 3/4 pose and past rest on arrival. That is the weight; without it he says the animation was ignored.
- Never swap drawings between poses. A one-frame swap between profile and front reads as jitter. Resample the traced poses point for point between shared landmarks and blend them, so the turn passes through real in-betweens.
- Secondary motion does only what he asks. "The ears bounce left and right" means a sideways swing that trails, overshoots and settles; do not add lift, flare or stretch on top.
- Before calling a letter or shape reveal "fade plus blur", measure its width per frame against its final width. A width that starts wide and settles is a stretch, not blur. Clone the stretch and note which letters have it (in one reference it was only the leading letter of each line).

**Before delivering**
- Make the side-by-side and judge it yourself at full size and at speed. If the clone doesn't hold up next to the reference, fix it or say what fails. Don't hand it over and let him find it.
- Send the side-by-side with the first build, without waiting to be asked: reference left, clone right, frame numbers burned in on both.
- Report per element what was measured against the reference and what was only judged by eye.
- Expect him to ask for the After Effects project. Offer the .jsx builder (section 6) at delivery, with named, editable layers, and say plainly that it is untested if After Effects was not available to run it.

**Ideas he rejects for logo animation (finds them basic, first-week-student level)**

The test behind this list: every item is something done to the logo or around it. He does not count any of these four kinds as logo animation:
1. A move of the whole mark (drop, swing, slide, scale punch).
2. A reveal that fills the mark in (wipe-up, stroke growth, autofill).
3. A transition laid over it (slice, wipe, invert sweep).
4. A camera or edit (close-up cuts, pull-back, zoom).

Before boarding any idea, name which kind it is. If it is one of the four, drop it. A rejected kind with a new story on top is the same idea reworded: the "film negative" concept was still a clock wipe.

Specific ideas already rejected:
- A physics simulation with no posed keys: letters reacting by formula, knocks travelling through the word, a Newton's cradle.
- A pun on the brand name standing in for an idea (gravity, apples, pendulums for "Newtons").
- A word dropping down to sit on the rest of the logo.
- One word building big, then scaling down and moving into place before the next word builds.
- The whole logo swinging like a pendulum.
- A stem-first fill-in reveal.
- A bouncing ball that becomes a letter.
- Slicing the wordmark into strips.
- Close-up cuts followed by a pull-back.
- A shutter-blade or radial negative-to-positive sweep (a clock wipe).

**What he has liked:** a double negative invert (black/white flip), and a kinetic graphic register for The Newtons sting.

Ask him for references of what he likes after the first rejected idea, before boarding a second. In one session six boards were guessed and rejected before the question was asked. When he offers references, take them and stop boarding until they are studied.

## 0. Setup (once per session)

Write the four tool files below into `~/mctools/` (do not put them in the download folder). Then run:

```
cd ~/mctools && npm i --silent gsap@3.14.2
python3 -c "import cv2,numpy,PIL,playwright" || pip install --break-system-packages opencv-python-headless numpy pillow playwright
python3 -m playwright install chromium   # only if no chromium is available
```

Needs ffmpeg/ffprobe. If the user gives a URL, try yt-dlp. If the network blocks it, ask them to upload the clip.

## 1. Scan

`python3 ~/mctools/mc_scan.py REF.mp4 WORK [--budget 384 for dense/fast clips] [--scene 6]`

This writes `WORK/source.mp4` (CFR, ≤1080p), `WORK/scan.json` and `WORK/scene-XX/frame-NNNNNN-T.TTTs.jpg`. Each JPG is ONE full frame: its whole area maps to the video's width×height. These are not contact-sheet cells.

Frames are sampled adaptively, NOT evenly. The sampling favours scene endpoints, then each visual jump (cut or flash) with the frames on either side, then the highest-change frames. Read every timestamp in the file names.

To inspect a scene, Read the frames. For overview, make a labelled grid with PIL. Any time a motion is undersampled (a fast entrance between two frames), extract extra frames with `ffmpeg -ss T -i WORK/source.mp4 -frames:v 1 x.jpg`. Measure positions in pixels from full-res frames. When precision matters, crop or zoom.

## 2. Author `WORK/scene-XX/layers.json` (one per scene)

```json
{"title":"…","background":"#rrggbb","notes":["candid limits: fonts guessed, photo replaced by gradient…"],
 "layers":[{"id":"title","kind":"text","parent":"","text":"LAUNCH DAY","path":"",
  "style":{"color":"#fff","fontFamily":"Arial","fontSize":"96px","lineHeight":"96px","whiteSpace":"nowrap"},
  "start":0,"end":3,
  "frames":[{"t":0,"x":-600,"y":298,"w":620,"h":96,"opacity":1,"rotation":0,"reveal":1,"ease":"out"},{"t":1,"x":340,"y":298,"w":620,"h":96}]}]}
```

Rules (adapted from MotionClone's prompt):
- Coordinates are **pixels**, top-left x/y plus w/h, absolute in the parent's coordinate system. Times are **absolute seconds**, not scene-relative. `end` is exclusive. Layers draw in array order, back to front.
- `kind`:
  - `text`: literal text with CSS typography. Use exact px font sizes and a realistic lineHeight. Newlines work.
  - `rect`: CSS backgrounds, borders, gradients and shadows.
  - `ellipse`: use a radial gradient for spheres.
  - `path`: SVG `d` inside a 0 0 100 100 viewBox, stretched to w×h. Set fill/stroke in style. Use paths for logos and icons.
  - `group`: animates its children as a unit. Children are positioned relative to the group's first-frame w×h. A group's w/h keyframes scale its children, so every child length (fontSize, radius, borders, shadows) scales too. Define them in the initial size.
- Only safe CSS keys are allowed: color, background*, border*, borderRadius, boxShadow, textShadow, font*, textAlign, lineHeight, letterSpacing, whiteSpace, transformOrigin, filter, clipPath, maskImage, fill, stroke*, opacity, padding, overflow, display, alignItems, justifyContent, mixBlendMode, textTransform, backdropFilter. No url(), scripts or HTML.
- Frames need t,x,y,w,h. opacity, rotation (degrees, clockwise) and reveal are optional. Reveal types out text from 0 to 1. `ease` applies from a frame to the next one: linear|out|in|inout|smooth|step|back. Use many **measured** keyframes where motion is complex, and don't invent generic looping motion.
- Rebuild **everything** as layers. Never embed the source video, screenshots or raster plates. Reconstruct exact copy, layout, panels, cursors, grids, shadows and logos as paths. Use several layered supporting details per scene, not just the headline. Don't use emoji or placeholders in place of artwork.
- Split discontinuous content at cuts using start/end. Preserve the ending, and leave no blank pauses the source doesn't have.
- Stay under about 40 layers per scene, using groups and multiline text to stay compact. Write notes that honestly disclose what couldn't be rebuilt.
- To restyle or rebrand ("same motion, my copy/colours"), keep the geometry and timing and change only text and style.

## 3. Build and compare

```
python3 ~/mctools/mc_project.py WORK          # validates, merges scenes (ids get s{N}_ prefix + per-scene bg rect) → WORK/rebuild/
python3 ~/mctools/mc_compare.py WORK          # → WORK/scene-XX/preview.jpg + per-scene mean/min RGB-SSIM + worst timestamp
```

Read every `preview.jpg` (reference on the left, rebuild on the right, same timestamps). SSIM is a guide, not proof. Your eyes decide.

## 4. Patch loop (bounded)

Start with the scenes that have the lowest mean SSIM, skipping any at ≥0.96 that also look right. In each pass, fix at most ~6 concrete differences: copy, missing elements, position, scale, typography, colour or timing. Edit only the affected layers, rebuild, then run `mc_compare.py WORK --scenes N --tag revision`.

**Keep a revision only if the mean improves by more than 0.002 and the minimum doesn't drop by more than 0.03.** Otherwise revert it. Stop after 2–3 passes per scene. Don't make cosmetic changes the reference doesn't support.

## 5. Render and deliver

`python3 ~/mctools/mc_render.py WORK --compare side|stack` renders each frame via drawFrame(t) to `WORK/rebuild.mp4`, with the source audio muxed in. It also makes `WORK/compare.mp4`, labelled REFERENCE | REBUILD. Check the frame count and audio with ffprobe and look at a still.

Deliver `rebuild.mp4` and `compare.mp4`, plus a zip of `WORK/rebuild/` as the editable project. The zip contains project.json, renderer.js, index.html, the vendored gsap, audio, a README and a package.json for HyperFrames (`npm i && npm run render`). Opening index.html directly also works: `?t=2.5` freezes a time and `?play` plays. Report the per-scene SSIM and the honest notes.

To edit the project later, change `project.json`, run `node sync-project.cjs`, and re-render.

---

## 6. After Effects export (flat clips)

No tool can write an `.aep` directly. `mc_ae.py` turns `WORK/rebuild/project.json` into an ExtendScript that builds the comp inside After Effects and saves the `.aep`.

```
pip install --break-system-packages fonttools
python3 ~/mctools/mc_ae.py WORK --name Clip_rebuild     # -> WORK/ae/Clip_rebuild.jsx + reference.mp4 + fonts/
```

What the script builds: one shape or text layer per project layer, nulls for groups (children parented), position/scale/opacity/rotation keys with Bezier eases and hold keys for `step`, Source Text hold keys for typing and `texts`, a REFERENCE | REBUILD compare comp, and the reference as a disabled guide layer.

Rules:
- **Text layers can carry `texts`: [[t, string], ...]**, held content changes (typing with font swaps, scrambles, ASCII animation). Both the browser renderer and the AE export honour them.
- **Fonts.** Download OFL fonts from `https://raw.githubusercontent.com/google/fonts/main/ofl/<family>/<file>.ttf` into `~/.fonts`, run `fc-cache -f`, and bundle them in `ae/fonts`. Read the real PostScript names with fontTools; AE needs those. For variable widths, load the font with an `@font-face` that declares `font-stretch: 62% 125%` and set `fontVariationSettings: "'wdth' 62"`. Extend `ae_font()` and `FONTFILES` for any family you add.
- **Measure text with element styles, not the canvas `font` shorthand.** A shorthand containing a percentage stretch is invalid and silently measures in the fallback font.
- **Test before delivery.** After Effects cannot run in the workspace. Syntax-check the `.jsx` with `node -e "new Function(src)"` and dry-run it against a strict mock of the AE object model (reject unknown match names, wrong value shapes, key indexes out of range, in/out point order). Tell the user it is untested in real After Effects and ask for a screenshot of any error.
- Zip `WORK/ae` with a short README: install fonts, File > Scripts > Run Script File, keep the folder together.

## 7. Illustrated films: constructed shapes, exact colours, riso

For character and scenery animation, posterized tracing looks like a bad Illustrator image trace and users reject it. Build each shot by hand from primitives. Show a still proof of one shot before doing more.

**Plan first.** Detect shots (per-frame histogram distance plus affine residual), list them, and give the user an honest time estimate: roughly 45–90 minutes of work per shot. Agree scope before building.

**Measure, don't guess** (work on a 2048-wide frame area-downscaled from the source):
- **Silhouettes -> lines and arcs.** Mask the element by colour, take the contour, and run `arcfit.fit_contour`. It returns straight lines and circular arcs with centres and radii. Read the output: shared centres and tangent circles reveal how the original was constructed (for example a neck made of two concentric circles plus a tangent ring). Then write the shape from those constructed values, not from the noisy fit.
- **Thin strokes -> line items.** Hough lines on the colour mask, merge collinear pieces, take width from the distance transform. Overlay the result on the reference and hand-place whatever is missing.
- **Small solids -> primitives.** Triangles, rectangles and circles are fitted as such (`approxPolyDP` on the hull, `boundingRect`, `fitEllipse`).
- **Soft or blurred elements** are still clean shapes; give the layer a `blur` value.
- **Background characters:** place polygons by eye from a crop with a coordinate ruler drawn on it.
- **Exact hex.** A fill is the most frequent real pixel value inside the region (the mode), sampled from the full-resolution source. Never use a k-means centroid or a mean; those wash colours out.

**Layer format** (`shot.json`: `{name, t0, t1, layers:[...]}`; comp pixels, bottom layer first):
```json
{"name":"heron neck","items":[{"t":"path","v":[[x,y]],"o":[[dx,dy]],"i":[[dx,dy]],"closed":true}],
 "fill":"#1b2e37","grad":["#194b52","#1a414a",176,680],"stroke":["#12273a",3],
 "blur":1.8,"opacity":80,"mode":"screen","pos":[[t0,0,0],[t1,12,4]]}
```
Item types: `path` (vertices with in/out tangents, as After Effects stores them), `ellipse` (cx, cy, rx, ry), `rect` (x, y, w, h), `line` (x0, y0, x1, y1, w). `grad` is a vertical two-colour ramp between two y values. `mode` is normal, screen, add or multiply. `pos` animates the layer offset. Name layers like a designer would and keep one idea per layer.

**Preview and compare.** `render2.render(layers, t, cache)` rasterizes at 2x and composites. Stack it under the reference frame and look at it at full size and at a 100% crop; fix geometry before texture.

**Riso** (`riso2.py`) is separate layers on top, so fills stay exact underneath: a 45-degree halftone screen (overlay), fine grain (overlay), clustered dry-ink dropouts (screen, subtle), and a slightly offset multiply copy for misregistration. Plates boil on twos (24-frame loop at 12.5 fps). Keep dropouts faint or they read as white specks.

**After Effects for this format is not written yet.** Write the exporter on first use, following `mc_ae.py`: one shape layer per layer, one vector group per item or per stroke width, `Shape` with vertices/inTangents/outTangents, fill and stroke, blend modes, position keys, Gaussian Blur and Gradient Ramp effects inside try/catch, riso plates as looping footage with Screen and Overlay modes, and a compare comp. Dry-run it against the mock as in section 6.

## Tool files

### ~/mctools/mc_scan.py
```python
#!/usr/bin/env python3
"""mc_scan.py SOURCE WORKDIR [--budget 192|384] [--scene 6]"""
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
width = max(1, round(a.scene*fps)); scenes=[]; st=0
while st < count:
    en = min(count, st+width)
    if en < count:
        near = [n for n in jumps if st+width*.65 <= n <= en]
        if near: en = max(near)
    scenes.append((st, en)); st = en
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

### ~/mctools/mc_project.py
```python
#!/usr/bin/env python3
"""mc_project.py WORKDIR [--no-audio]  — merge scene layers into WORKDIR/rebuild/"""
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path
SAFE = {'color','background','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat',
 'border','borderTop','borderRight','borderBottom','borderLeft','borderRadius','boxShadow','textShadow','fontFamily','fontSize',
 'fontWeight','fontStyle','textAlign','lineHeight','letterSpacing','whiteSpace','transformOrigin','filter','clipPath','maskImage',
 'fill','stroke','strokeWidth','strokeLinecap','strokeLinejoin','strokeDasharray','strokeDashoffset','opacity','padding','overflow',
 'display','alignItems','justifyContent','mixBlendMode','textTransform','backdropFilter','WebkitBackgroundClip','WebkitTextFillColor','fontStretch','fontVariationSettings','outline','outlineOffset'}
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
(R/'README.md').write_text('# Editable motion rebuild\n\nEdit `project.json`, run `node sync-project.cjs`, then open index.html (`?t=2.5` freezes, `?play` plays) or `npm i && npm run render` (HyperFrames).\n\n'+'\n'.join('- '+n for n in notes)+'\n')
print(f'{len(layers)} layers -> {R}')
```

### ~/mctools/renderer.js
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
 if(l.kind==='text'){let s=l.text;if(l.texts){for(const [tt,ss] of l.texts){if(tt<=t)s=ss;else break;}}const r=v('reveal');const o=r>=1?s:s.slice(0,Math.floor(s.length*r+1e-4));if(el.__t!==o){el.textContent=o;el.__t=o;}}
}}
window.drawFrame=draw;draw(0);
const qs=new URLSearchParams(location.search);if(qs.has('t'))draw(+qs.get('t'));
if(qs.has('play')){const t0=performance.now();(function loop(){draw(((performance.now()-t0)/1000)%P.duration);requestAnimationFrame(loop)})();}
if(window.gsap){const c={t:0};window.__timelines=window.__timelines||{};window.__timelines['rebuilt']=gsap.timeline({paused:true}).to(c,{t:P.duration,duration:P.duration,ease:'none',onUpdate:()=>draw(c.t)});}
}
```

### ~/mctools/mc_compare.py
```python
#!/usr/bin/env python3
"""mc_compare.py WORKDIR [--scenes 0,2] [--tag preview]"""
import argparse, io, json
from pathlib import Path
import cv2, numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
def ssim(a, b):  # per RGB channel: grayscale can score a wrong palette as perfect
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

### ~/mctools/mc_render.py
```python
#!/usr/bin/env python3
"""mc_render.py WORKDIR [--compare side|stack] [--crf 18]"""
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

### ~/mctools/mc_ae.py
```python
#!/usr/bin/env python3
"""mc_ae.py WORKDIR [--name Rebuild] [--fonts-dir DIR]
Export WORKDIR/rebuild/project.json to an After Effects ExtendScript that builds
the comp (shape + text layers, nulls for groups, keyframes with eases/holds),
imports the reference into a REFERENCE|REBUILD compare comp, and saves an .aep.
Output: WORKDIR/ae/<name>.jsx (+ reference.mp4, fonts/)."""
import argparse, json, math, re, shutil, subprocess
from pathlib import Path
from fontTools.ttLib import TTFont

# --- font table: browser style -> AE candidates [(postscript, hscale%)] -------
def ae_font(st):
    fam = st.get('fontFamily', 'Arial').strip("'\""); w = int(st.get('fontWeight', '400'))
    it = st.get('fontStyle') == 'italic'
    m = re.search(r"'wdth'\s*([\d.]+)", st.get('fontVariationSettings', '')); wd = float(m.group(1)) if m else 100
    W = {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'}[w]
    if fam == 'Archivo':
        hs = round(wd)
        wname = {62: 'ExtraCondensed', 75: 'Condensed', 125: 'Expanded'}.get(round(wd), '')
        sty = W + ('Italic' if it else '') if not (it and W == 'Regular') else 'Italic'
        c = []
        if wname: c.append((f'Archivo{wname}-{sty}', 100))
        c += [(f'Archivo-{sty}', hs), (f"Archivo{'Italic' if it else 'Roman'}-{W}", hs)]
        return c
    # last entry = the PostScript name of the bundled file (used when AE can't check installed fonts)
    simple = {'Archivo Black': ['ArchivoBlack-Regular'], 'Pinyon Script': ['PinyonScript-Regular'], 'Anton': ['Anton-Regular'],
              'Bungee': ['Bungee-Regular'], 'UnifrakturMaguntia': ['UnifrakturMaguntia-Book', 'UnifrakturMaguntia'], 'Silkscreen': ['Silkscreen-Regular']}
    if fam in simple: return [(n, 100) for n in simple[fam]]
    if fam == 'Space Mono': return [('SpaceMono-Bold' if w >= 700 else 'SpaceMono-Regular', 100)]
    if fam == 'Doto': return [('Doto-Regular', 100), (f'Doto-{W}', 100)]
    if fam in ('Inter', 'Inter Display'): return [(f"{fam.replace(' ', '')}-{W}", 100), (f'Inter-{W}', 100)]
    return [(fam.replace(' ', '') + '-' + W, 100), (fam.replace(' ', ''), 100)]

FONTFILES = {'Archivo': ['Archivo[wdth,wght].ttf', 'Archivo-Italic[wdth,wght].ttf'], 'Archivo Black': ['ArchivoBlack-Regular.ttf'],
             'Pinyon Script': ['PinyonScript-Regular.ttf'], 'Anton': ['Anton-Regular.ttf'], 'Bungee': ['Bungee-Regular.ttf'],
             'UnifrakturMaguntia': ['UnifrakturMaguntia-Book.ttf'], 'Silkscreen': ['Silkscreen-Regular.ttf'],
             'Space Mono': ['SpaceMono-Regular.ttf', 'SpaceMono-Bold.ttf'], 'Doto': ['Doto[ROND,wght].ttf']}
_met = {}
def metrics(fam, fonts_dir):
    """hhea ascent/descent in em, as Chromium uses for line boxes."""
    if fam in _met: return _met[fam]
    f = None
    if fam in FONTFILES and (fonts_dir / FONTFILES[fam][0]).exists(): f = fonts_dir / FONTFILES[fam][0]
    else:
        try: f = Path(subprocess.check_output(['fc-match', '-f', '%{file}', fam]).decode())
        except Exception: pass
    a, d = 0.9, 0.22
    if f and f.exists():
        t = TTFont(f, lazy=True); u = t['head'].unitsPerEm; h = t['hhea']
        a, d = h.ascent / u, -h.descent / u
    _met[fam] = (a, d); return a, d

def px(v, default=0.0):
    if v is None: return default
    m = re.match(r'\s*(-?[\d.]+)', str(v)); return float(m.group(1)) if m else default
def color(v):
    v = str(v or '').strip()
    m = re.fullmatch(r'#([0-9a-fA-F]{6})', v)
    if m: h = m.group(1); return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    m = re.fullmatch(r'#([0-9a-fA-F]{3})', v)
    if m: return [int(c * 2, 16) / 255 for c in m.group(1)]
    m = re.match(r'rgba?\(([^)]*)\)', v)
    if m: p = [float(x) for x in m.group(1).split(',')[:3]]; return [x / 255 for x in p]
    return None
def border(st):
    b = st.get('border')
    if not b: return None
    m = re.match(r'\s*([\d.]+)px\s+\w+\s+(#[0-9a-fA-F]{3,6}|rgba?\([^)]*\))', b)
    return (float(m.group(1)), color(m.group(2))) if m else None

def interp(fr, t, k, d):
    a = fr[0]; b = fr[0]
    for f in fr:
        if f['t'] <= t: a = b = f
        else: b = f; break
    if b['t'] == a['t']: q = 0
    else: q = max(0, min(1, (t - a['t']) / (b['t'] - a['t'])))
    E = {'linear': lambda q: q, 'out': lambda q: 1 - (1 - q) ** 3, 'in': lambda q: q ** 3, 'step': lambda q: 0 if q < 1 else 1,
         'inout': lambda q: 4 * q ** 3 if q < .5 else 1 - (-2 * q + 2) ** 3 / 2, 'smooth': lambda q: q * q * (3 - 2 * q)}
    q = E.get(a.get('ease', 'linear'), E['linear'])(q)
    x, y = a.get(k, d), b.get(k, d); return x + (y - x) * q

def build(work, name, fonts_dir):
    W = Path(work); P = json.loads((W / 'rebuild/project.json').read_text())
    out = []
    for l in P['layers']:
        st = l.get('style', {}); fr = l['frames']; kind = l['kind']
        o = dict(id=l['id'], kind=kind, parent=l.get('parent') or '', s=round(l['start'], 4), e=round(min(l['end'], P['duration'] + 1), 4))
        base = fr[0]
        def keys(xw, yh, dx=0, dy=0):
            return [[f['t'], f['x'] + dx, f['y'] + dy, xw(f), yh(f), f.get('opacity', 1) * 100 * px(st.get('opacity'), 1), f.get('rotation', 0), f.get('ease', 'linear')] for f in fr]
        rel = (lambda f: f['w'] / base['w'] * 100, lambda f: f['h'] / base['h'] * 100)
        if kind == 'group':
            o['k'] = keys(*rel)
        elif kind in ('rect', 'ellipse', 'path'):
            bg = st.get('background') or st.get('backgroundColor') or st.get('fill')
            o['fill'] = None if (not bg or bg == 'transparent' or 'gradient' in str(bg)) else color(bg)
            if 'gradient' in str(bg):  # first colour stop as a flat fallback
                m = re.search(r'#[0-9a-fA-F]{6}', bg); o['fill'] = color(m.group(0)) if m else None
            bd = border(st)
            if kind == 'path' and st.get('stroke'): bd = (px(st.get('strokeWidth'), 1), color(st['stroke']))
            o['stroke'] = bd
            o['radius'] = px(st.get('borderRadius'), 0)
            if kind == 'path':
                pts = []
                for sub in re.findall(r'M([^MZz]*)[Zz]?', l.get('path', '')):
                    nums = [float(v) for v in re.findall(r'-?[\d.]+', sub)]
                    pts.append([[nums[i] * base['w'] / 100, nums[i + 1] * base['h'] / 100] for i in range(0, len(nums) - 1, 2)])
                o['paths'] = pts
                o['k'] = keys(*rel)
            else:
                o['k'] = keys(lambda f: f['w'], lambda f: f['h'])
        elif kind == 'text':
            size = px(st.get('fontSize'), 16); lh = px(st.get('lineHeight'), size * 1.2)
            fam = st.get('fontFamily', 'Arial').strip("'\"")
            a, d = metrics(fam, fonts_dir)
            base_dy = (lh - (a + d) * size) / 2 + a * size   # line-box top -> first baseline
            o.update(font=ae_font(st), size=size, lead=lh, col=color(st.get('color')) or [0, 0, 0],
                     track=px(st.get('letterSpacing'), 0) / size * 1000 if size else 0,
                     just='center' if st.get('textAlign') == 'center' else 'left', w=base['w'])
            # resolve reveal + held texts into one list of (t, string)
            times = sorted({l['start']} | {f['t'] for f in fr} | {t for t, _ in l.get('texts', [])})
            seq = []
            for t in times:
                s = l['text']
                for tt, ss in l.get('texts', []):
                    if tt <= t + 1e-6: s = ss
                    else: break
                r = interp(fr, t, 'reveal', 1)
                s = s if r >= 1 else s[:int(math.floor(len(s) * r + 1e-4))]
                s = s.replace('\n', '\r')
                if not seq or seq[-1][1] != s: seq.append([round(t, 4), s])
            o['txt'] = seq
            dx = base['w'] / 2 if o['just'] == 'center' else 0
            o['k'] = keys(lambda f: 100, lambda f: 100, dx, base_dy)
        out.append(o)
    return dict(title=P['title'], name=name, width=P['width'], height=P['height'], fps=P['fps'], duration=P['duration'],
                bg=color(P.get('background')) or [0, 0, 0], layers=out)

JSX = r'''// Built by the motion-clone skill. Run in After Effects: File > Scripts > Run Script File...
// Creates the rebuild comp, a REFERENCE | REBUILD compare comp, and saves __NAME__.aep next to this file.
(function () {
var D = __DATA__;
var root = File($.fileName).parent;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
var fontOK = {};
function pickFont(cands) {
    var hasAPI = (typeof app.fonts !== 'undefined') && app.fonts && app.fonts.getFontsByPostScriptName;
    for (var i = 0; i < cands.length; i++) {
        var n = cands[i][0];
        if (fontOK[n] === undefined) {
            if (hasAPI) { try { fontOK[n] = app.fonts.getFontsByPostScriptName(n).length > 0; } catch (e) { fontOK[n] = false; } }
            else fontOK[n] = null;
        }
        if (fontOK[n] === true) return cands[i];
    }
    return cands[cands.length > 1 ? cands.length - 1 : 0];
}
function setKeys(prop, vals, eases) {
    if (vals.length === 1) { prop.setValue(vals[0][1]); return; }
    for (var i = 0; i < vals.length; i++) prop.setValueAtTime(vals[i][0], vals[i][1]);
    var vt = prop.propertyValueType, dims = 1;
    if (vt === PropertyValueType.TwoD) dims = 2; else if (vt === PropertyValueType.ThreeD) dims = 3;
    for (var k = 1; k <= prop.numKeys; k++) {
        var e = eases[k - 1] || 'linear';
        if (e === 'step') { prop.setInterpolationTypeAtKey(k, prop.keyInInterpolationType(k), KeyframeInterpolationType.HOLD); continue; }
        if (e === 'linear') { prop.setInterpolationTypeAtKey(k, prop.keyInInterpolationType(k), KeyframeInterpolationType.LINEAR); continue; }
        if (k >= prop.numKeys) continue;
        var outInf = (e === 'out') ? 85 : (e === 'in' ? 10 : 50), inInf = (e === 'out') ? 10 : (e === 'in' ? 85 : 50);
        var eo = [], ei = [];
        for (var d = 0; d < dims; d++) { eo.push(new KeyframeEase(0, outInf)); ei.push(new KeyframeEase(0, inInf)); }
        prop.setInterpolationTypeAtKey(k, prop.keyInInterpolationType(k), KeyframeInterpolationType.BEZIER);
        prop.setInterpolationTypeAtKey(k + 1, KeyframeInterpolationType.BEZIER, prop.keyOutInterpolationType(k + 1));
        try { prop.setTemporalEaseAtKey(k, prop.keyInTemporalEase(k), eo); prop.setTemporalEaseAtKey(k + 1, ei, prop.keyOutTemporalEase(k + 1)); } catch (err) {}
    }
}
function transform(layer, L, kind) {
    var tr = layer.property('ADBE Transform Group');
    tr.property('ADBE Anchor Point').setValue([0, 0]);
    var K = L.k, pos = [], sc = [], op = [], rot = [], ez = [];
    var hs = L.hs || 100;
    for (var i = 0; i < K.length; i++) {
        pos.push([K[i][0], [K[i][1], K[i][2]]]); ez.push(K[i][7]);
        sc.push([K[i][0], kind === 'scale' ? [K[i][3] * hs / 100, K[i][4]] : [hs, 100]]);
        op.push([K[i][0], clamp(K[i][5], 0, 100)]); rot.push([K[i][0], K[i][6]]);
    }
    function same(a) { for (var i = 1; i < a.length; i++) if (String(a[i][1]) !== String(a[0][1])) return false; return true; }
    function reduce(a) { return same(a) ? [a[0]] : a; }
    setKeys(tr.property('ADBE Position'), reduce(pos), ez);
    setKeys(tr.property('ADBE Scale'), reduce(sc), ez);
    setKeys(tr.property('ADBE Opacity'), reduce(op), ez);
    setKeys(tr.property('ADBE Rotate Z'), reduce(rot), ez);
}
function timing(layer, L) {
    var s = clamp(L.s, 0, D.duration), e = clamp(L.e, s + 1 / D.fps, D.duration);
    layer.outPoint = D.duration; layer.inPoint = s; layer.outPoint = e;
}
function vecGroup(layer) { return layer.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').property('ADBE Vectors Group'); }
function paint(g, L) {
    if (L.stroke) { var s = g.addProperty('ADBE Vector Graphic - Stroke'); s.property('ADBE Vector Stroke Color').setValue(L.stroke[1] || [0, 0, 0]); s.property('ADBE Vector Stroke Width').setValue(L.stroke[0]); }
    if (L.fill) { var f = g.addProperty('ADBE Vector Graphic - Fill'); f.property('ADBE Vector Fill Color').setValue(L.fill); }
}
function build(comp) {
    var byId = {};
    for (var i = 0; i < D.layers.length; i++) {
        var L = D.layers[i], layer;
        if (L.kind === 'group') {
            layer = comp.layers.addNull(); layer.name = L.id;
            layer.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, 0]);
        } else if (L.kind === 'text') {
            layer = comp.layers.addText(L.txt[0][1] || ' ');
            var f = pickFont(L.font); L.hs = f[1];
            var st = layer.property('ADBE Text Properties').property('ADBE Text Document');
            for (var j = 0; j < L.txt.length; j++) {
                var doc = st.value; doc.text = L.txt[j][1] || ' ';
                doc.font = f[0]; doc.fontSize = L.size; doc.applyFill = true; doc.fillColor = L.col; doc.applyStroke = false;
                doc.tracking = L.track;
                doc.justification = L.just === 'center' ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY;
                try { doc.autoLeading = false; doc.leading = L.lead; } catch (e) {}
                if (L.txt.length === 1) st.setValue(doc); else st.setValueAtTime(L.txt[j][0], doc);
            }
            if (L.txt.length > 1) for (var k = 1; k <= st.numKeys; k++) st.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
            layer.name = L.id;
        } else {
            layer = comp.layers.addShape(); layer.name = L.id;
            var g = vecGroup(layer);
            if (L.kind === 'path') {
                for (var p = 0; p < L.paths.length; p++) {
                    var sh = new Shape(); sh.vertices = L.paths[p]; sh.closed = true;
                    g.addProperty('ADBE Vector Shape - Group').property('ADBE Vector Shape').setValue(sh);
                }
            } else {
                var r = g.addProperty(L.kind === 'ellipse' ? 'ADBE Vector Shape - Ellipse' : 'ADBE Vector Shape - Rect');
                var szp = r.property(L.kind === 'ellipse' ? 'ADBE Vector Ellipse Size' : 'ADBE Vector Rect Size');
                var psp = r.property(L.kind === 'ellipse' ? 'ADBE Vector Ellipse Position' : 'ADBE Vector Rect Position');
                var sv = [], pv = [], ez = [];
                for (var q = 0; q < L.k.length; q++) { sv.push([L.k[q][0], [Math.max(0.01, L.k[q][3]), Math.max(0.01, L.k[q][4])]]); pv.push([L.k[q][0], [L.k[q][3] / 2, L.k[q][4] / 2]]); ez.push(L.k[q][7]); }
                var moving = false; for (var q2 = 1; q2 < sv.length; q2++) if (String(sv[q2][1]) !== String(sv[0][1])) moving = true;
                setKeys(szp, moving ? sv : [sv[0]], ez); setKeys(psp, moving ? pv : [pv[0]], ez);
                if (L.radius && L.kind !== 'ellipse') r.property('ADBE Vector Rect Roundness').setValue(L.radius);
            }
            paint(g, L);
        }
        if (L.parent && byId[L.parent]) layer.parent = byId[L.parent];
        transform(layer, L, (L.kind === 'group' || L.kind === 'path') ? 'scale' : 'fixed');
        timing(layer, L);
        if (L.kind === 'group') layer.enabled = false;
        byId[L.id] = layer;
    }
}
app.beginUndoGroup('Motion Clone build');
var proj = app.project || app.newProject();
var comp = proj.items.addComp(D.name, D.width, D.height, 1, D.duration, D.fps);
comp.bgColor = D.bg;
var bgl = comp.layers.addSolid(D.bg, 'background', D.width, D.height, 1, D.duration);
build(comp);
bgl.moveToEnd();
var refFile = new File(root.fsName + '/reference.mp4');
if (refFile.exists) {
    var ref = proj.importFile(new ImportOptions(refFile));
    var cmp = proj.items.addComp(D.name + ' - REFERENCE vs REBUILD', D.width * 2, D.height, 1, D.duration, D.fps);
    var a = cmp.layers.add(ref); a.property('ADBE Transform Group').property('ADBE Position').setValue([D.width / 2, D.height / 2]);
    var b = cmp.layers.add(comp); b.property('ADBE Transform Group').property('ADBE Position').setValue([D.width * 1.5, D.height / 2]);
    var g1 = comp.layers.add(ref); g1.guideLayer = true; g1.enabled = false; g1.name = 'REFERENCE (guide, off)'; g1.moveToEnd();
}
app.endUndoGroup();
try { proj.save(new File(root.fsName + '/__NAME__.aep')); } catch (e) {}
alert('Built "' + D.name + '" (' + D.layers.length + ' layers). Missing fonts? Install the files in the fonts folder and re-run.');
})();
'''

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('work'); ap.add_argument('--name', default='Rebuild')
    ap.add_argument('--fonts-dir', default=str(Path.home() / '.fonts')); a = ap.parse_args()
    W = Path(a.work); out = W / 'ae'; out.mkdir(exist_ok=True)
    fd = Path(a.fonts_dir)
    data = build(W, a.name, fd)
    js = json.dumps(data, ensure_ascii=True, separators=(',', ':'))
    (out / f'{a.name}.jsx').write_text(JSX.replace('__DATA__', js).replace('__NAME__', a.name))
    shutil.copy2(W / 'source.mp4', out / 'reference.mp4')
    (out / 'fonts').mkdir(exist_ok=True)
    used = {re.sub(r"['\"]", '', l['style'].get('fontFamily', '')) for l in json.loads((W / 'rebuild/project.json').read_text())['layers'] if l['kind'] == 'text'}
    for fam in used:
        for f in FONTFILES.get(fam, []):
            if (fd / f).exists(): shutil.copy2(fd / f, out / 'fonts' / f)
    print(f'{len(data["layers"])} layers -> {out / (a.name + ".jsx")}; fonts: {sorted(used)}')
```

### ~/mctools/arcfit.py
```python
import numpy as np
def circ(p):
    x,y=p[:,0],p[:,1]; A=np.c_[2*x,2*y,np.ones(len(p))]; b=x*x+y*y
    try: s=np.linalg.lstsq(A,b,rcond=None)[0]
    except Exception: return None
    cx,cy=s[0],s[1]; r2=s[2]+cx*cx+cy*cy
    if r2<=0: return None
    r=np.sqrt(r2); return cx,cy,r,np.abs(np.hypot(x-cx,y-cy)-r).max()
def line_dev(p):
    a,b=p[0],p[-1]; d=b-a; L=np.hypot(*d)
    if L<1e-6: return 1e9
    return np.abs((p[:,0]-a[0])*d[1]-(p[:,1]-a[1])*d[0]).max()/L
def fit_contour(c,tol=1.2,rmax=20000):
    """closed contour (N,2) float -> list of ('L',p0,p1) / ('A',p0,p1,cx,cy,r,positive_sweep)"""
    n=len(c); out=[]; i=0
    k=6; v1=c-np.roll(c,k,0); v2=np.roll(c,-k,0)-c   # start at the sharpest corner
    ang=np.abs(np.arctan2(v1[:,0]*v2[:,1]-v1[:,1]*v2[:,0],(v1*v2).sum(1))); s0=int(np.argmax(ang)); cc=np.vstack([np.roll(c,-s0,0)]*2)
    while i<n:
        def ok_line(j): return line_dev(cc[i:j+1])<tol
        def ok_arc(j):
            r=circ(cc[i:j+1]); return r is not None and r[3]<tol and r[2]<rmax
        def extend(ok):
            lo=min(i+3,n)
            if not ok(lo): return i+2
            step=8; hi=lo
            while hi<n and ok(min(hi+step,n)): hi=min(hi+step,n); step*=2
            a,b=hi,min(hi+step,n)
            while b-a>1:
                m=(a+b)//2
                if ok(m): a=m
                else: b=m
            return a
        jl=extend(ok_line); ja=extend(ok_arc)
        if jl>=ja-2 or ja-i<12:
            j=max(jl,i+1); out.append(('L',cc[i].copy(),cc[j%len(cc)].copy()))
        else:
            j=ja; cx,cy,r,_=circ(cc[i:j+1]); m=cc[(i+j)//2]
            a0=np.arctan2(cc[i][1]-cy,cc[i][0]-cx); am=np.arctan2(m[1]-cy,m[0]-cx); a1=np.arctan2(cc[j][1]-cy,cc[j][0]-cx)
            out.append(('A',cc[i].copy(),cc[j].copy(),cx,cy,r,((am-a0)%(2*np.pi))<((a1-a0)%(2*np.pi))))
        i=j
    return out
def to_bezier(segs):
    """-> list of (p0,c1,c2,p1) cubics: exact lines, arcs split to <=90 degrees.
    The arc flag means: sweep with increasing screen angle (y down) from p0 to p1."""
    bz=[]
    for s in segs:
        if s[0]=='L': bz.append((s[1],s[1],s[2],s[2])); continue
        _,p0,p1,cx,cy,r,pos=s; a0=np.arctan2(p0[1]-cy,p0[0]-cx); a1=np.arctan2(p1[1]-cy,p1[0]-cx)
        d=a1-a0
        if pos:
            while d<=0: d+=2*np.pi
        else:
            while d>=0: d-=2*np.pi
        k=int(np.ceil(abs(d)/(np.pi/2))); da=d/k
        for q in range(k):
            b0=a0+q*da; b1=b0+da; t=4/3*np.tan(da/4)
            P0=np.array([cx+r*np.cos(b0),cy+r*np.sin(b0)]); P3=np.array([cx+r*np.cos(b1),cy+r*np.sin(b1)])
            C1=P0+t*r*np.array([-np.sin(b0),np.cos(b0)]); C2=P3-t*r*np.array([-np.sin(b1),np.cos(b1)])
            if q==0: P0=np.array(p0,float)
            if q==k-1: P3=np.array(p1,float)
            bz.append((P0,C1,C2,P3))
    return bz
def to_path(segs,closed=True):
    """segments -> a `path` item: v (vertices), o (out tangents), i (in tangents), relative, as After Effects stores them."""
    bz=to_bezier(segs); n=len(bz); r=lambda a:[round(float(a[0]),2),round(float(a[1]),2)]
    v=[r(b[0]) for b in bz]; o=[r(b[1]-b[0]) for b in bz]; i=[r(bz[j-1][2]-bz[j-1][3]) for j in range(n)]
    if not closed:
        e=bz[-1]; v.append(r(e[3])); o.append([0,0]); i.append(r(e[2]-e[3])); i[0]=[0,0]
    return dict(t='path',v=v,o=o,i=i,closed=closed)
```
Hand-written segments use the same tuples: `('L',p0,p1)` and `('A',p0,p1,cx,cy,r,positive_sweep)` with numpy points.

### ~/mctools/render2.py
```python
import cv2,numpy as np
W,H,S=2048,858,2   # comp size and supersampling; set W,H to the source aspect
def hx(h): return np.array([int(h[5:7],16),int(h[3:5],16),int(h[1:3],16)],np.float32)
def flatpath(it,n=12):
    v=np.array(it['v'],np.float32); o=np.array(it.get('o') or np.zeros_like(v),np.float32); i=np.array(it.get('i') or np.zeros_like(v),np.float32)
    t=np.linspace(0,1,n,endpoint=False)[:,None]; out=[]; N=len(v); rng=range(N) if it.get('closed',True) else range(N-1)
    for a in rng:
        b=(a+1)%N
        if not o[a].any() and not i[b].any(): out.append(v[a][None]); continue
        P0,P1,P2,P3=v[a],v[a]+o[a],v[b]+i[b],v[b]; out.append((1-t)**3*P0+3*(1-t)**2*t*P1+3*(1-t)*t*t*P2+t**3*P3)
    if not it.get('closed',True): out.append(v[-1][None])
    return np.vstack(out)
def alpha(layer,dx=0,dy=0):
    a=np.zeros((H*S,W*S),np.uint8); sh=4; k=S*(1<<sh)
    fill=layer.get('fill') is not None or layer.get('grad') is not None; st=layer.get('stroke')
    for it in layer['items']:
        t=it['t']
        if t=='path':
            p=np.round((flatpath(it)+[dx,dy])*k).astype(np.int32)
            if fill and it.get('closed',True): cv2.fillPoly(a,[p],255,cv2.LINE_AA,sh)
            if st: cv2.polylines(a,[p],it.get('closed',True),255,max(1,int(round(st[1]*S))),cv2.LINE_AA,sh)
        elif t=='ellipse':
            c=(int((it['cx']+dx)*k),int((it['cy']+dy)*k)); ax=(int(it['rx']*k),int(it['ry']*k))
            if fill: cv2.ellipse(a,c,ax,0,0,360,255,-1,cv2.LINE_AA,sh)
            if st: cv2.ellipse(a,c,ax,0,0,360,255,max(1,int(round(st[1]*S))),cv2.LINE_AA,sh)
        elif t=='rect':
            cv2.rectangle(a,(int((it['x']+dx)*k),int((it['y']+dy)*k)),(int((it['x']+it['w']+dx)*k),int((it['y']+it['h']+dy)*k)),255,-1,cv2.LINE_AA,sh)
        elif t=='line':
            cv2.line(a,(int((it['x0']+dx)*k),int((it['y0']+dy)*k)),(int((it['x1']+dx)*k),int((it['y1']+dy)*k)),255,max(1,int(round(it['w']*S))),cv2.LINE_AA,sh)
    a=a.astype(np.float32)/255
    if layer.get('blur'): a=cv2.GaussianBlur(a,(0,0),layer['blur']*S)   # blur = sigma in comp px
    return cv2.resize(a,(W,H),interpolation=cv2.INTER_AREA)
def interp(keys,t):
    ts=[k[0] for k in keys]; return [float(np.interp(t,ts,[k[j] for k in keys])) for j in range(1,len(keys[0]))]
def render(layers,t=0.0,cache=None):
    im=np.zeros((H,W,3),np.float32)
    for li,L in enumerate(layers):
        dx=dy=0; op=L.get('opacity',100)/100
        if L.get('pos'): dx,dy=interp(L['pos'],t)
        key=(li,round(dx,2),round(dy,2))
        if cache is not None and key in cache: a=cache[key]
        else:
            a=alpha(L,dx,dy)
            if cache is not None and not L.get('pos'): cache[key]=a
        a=(a*op)[:,:,None]
        if L.get('grad'):
            c0,c1,y0,y1=L['grad']; g=np.clip((np.arange(H,dtype=np.float32)-y0)/max(1e-3,y1-y0),0,1)[:,None,None]; col=hx(c0)*(1-g)+hx(c1)*g
        else: col=hx(L.get('fill') or L['stroke'][0])
        m=L.get('mode','normal')
        if m=='normal': im=im*(1-a)+col*a
        elif m=='screen': im=255-(255-im)*(1-a*col/255)
        elif m=='add': im=np.minimum(255,im+col*a)
        elif m=='multiply': im=im*(1-a)+im*col/255*a
    return np.clip(im,0,255).astype(np.uint8)
```

### ~/mctools/riso2.py
```python
import cv2,numpy as np
W,H=2048,858
PAPER=np.array([216,234,242],np.float32)   # BGR, warm paper
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
def halftone(period=5.0,ang=45,amp=17):
    a=np.radians(ang); u=xx*np.cos(a)+yy*np.sin(a); v=-xx*np.sin(a)+yy*np.cos(a)
    return np.clip(128+amp*np.cos(2*np.pi*u/period)*np.cos(2*np.pi*v/period),0,255).astype(np.uint8)
def plates(n=24,seed=5):
    """n-frame loops: dropout plate (screen) and grain plate (overlay). Hold each frame for two."""
    rng=np.random.default_rng(seed); sp=[];gr=[]
    drum=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),60); drum/=drum.std()
    for i in range(n):
        fine=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),0.55); fine/=fine.std()
        blot=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),7); blot/=blot.std()
        a=np.clip((fine-(1.75-0.3*blot-0.2*drum))*1.6,0,1)                 # dry-ink dropouts, clustered
        sp.append((a[:,:,None]*PAPER*0.16).astype(np.uint8))
        gr.append(np.clip(128+rng.normal(0,1,(H,W)).astype(np.float32)*8+blot*3.5,0,255).astype(np.uint8))
    return sp,gr
def ov(a,g): return np.where(a<0.5,2*a*g,1-2*(1-a)*(1-g))
def riso(im,sp,gr,ht,off=(1.5,1.0),mis=0.25):
    a=im.astype(np.float32)/255
    sh=cv2.warpAffine(a,np.float32([[1,0,off[0]],[0,1,off[1]]]),(W,H),borderMode=cv2.BORDER_REPLICATE)
    a=a*(1-mis)+a*sh*mis                                   # misregistered overprint (multiply)
    a=ov(a,(ht.astype(np.float32)/255)[:,:,None])          # halftone screen (overlay)
    a=1-(1-a)*(1-sp.astype(np.float32)/255)                # dropouts (screen)
    a=ov(a,(gr.astype(np.float32)/255)[:,:,None])          # grain (overlay)
    return np.clip(a*255,0,255).astype(np.uint8)
```

## Gotchas
- Illustrated footage: never deliver a posterized or auto-traced rebuild, even for a whole film. Do one hand-built shot as a still proof, get approval, then continue in batches.
- Arc fitting on a contour polluted by overlapping elements (reeds, light streaks) gives junk segments. Mask them out or close gaps first, and trust the clean segments.
- Text box y is the top of the line box. For lineHeight equal to fontSize, set y ≈ the cap top minus about 0.1×fontSize, then fine-tune using the compare sheet.
- Only Arial, Georgia, Times New Roman and system monospace are reliably available. For other fonts, name the closest one and disclose it in the notes.
- For long clips, check `scan.json`'s visual_jump_seconds. If a scene has many cuts or flashes, rerun the scan with `--budget 384` (3 s scenes, 24 frames each).
- Render time is about 10–25 fps of output at 1080p. For 60–120 s clips, run mc_render in the background with a long timeout.
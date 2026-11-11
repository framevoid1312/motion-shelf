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

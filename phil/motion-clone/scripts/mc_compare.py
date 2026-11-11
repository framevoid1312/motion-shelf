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

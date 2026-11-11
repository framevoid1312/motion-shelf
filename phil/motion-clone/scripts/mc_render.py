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

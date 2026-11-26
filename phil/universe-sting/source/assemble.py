"""Assemble clone.mp4 and compare.mp4 (ref left, clone right, frame numbers burned in)."""
import os, sys, subprocess, numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import compose
PLATES = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/mc_sting/plate_full'
OUT = '/home/claude/mc_sting/out'; os.makedirs(OUT + '/clone', exist_ok=True); os.makedirs(OUT + '/cmp', exist_ok=True)
N = 148
for n in range(N):
    me = compose.frame(n, PLATES)
    if n < compose.CUT: me = compose.grain(me, n)      # grain on the object section only (lockup stays clean)
    cv2.imwrite(f'{OUT}/clone/{n:04d}.png', cv2.cvtColor(me, cv2.COLOR_RGB2BGR))
    ref = cv2.imread(f'/home/claude/mc_sting/ref/f{n+1:03d}.png')
    a, b = ref.copy(), cv2.cvtColor(me, cv2.COLOR_RGB2BGR)
    for img, lab, col in ((a, 'REFERENCE', (0, 220, 255)), (b, 'CLONE', (160, 255, 0))):
        cv2.rectangle(img, (0, 0), (430, 64), (0, 0, 0), -1)
        cv2.putText(img, f'{lab}  f{n:03d}', (18, 46), cv2.FONT_HERSHEY_SIMPLEX, 1.25, col, 3, cv2.LINE_AA)
    sbs = np.hstack([a, np.full((1080, 8, 3), 255, np.uint8), b])
    sbs = cv2.resize(sbs, (2568, 720), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{OUT}/cmp/{n:04d}.png', sbs)
    if n % 20 == 0: print('frame', n, flush=True)
enc = ['-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-framerate', '30', '-i', f'{OUT}/clone/%04d.png', *enc, '-crf', '14', f'{OUT}/universe_sting_clone.mp4'], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-framerate', '30', '-i', f'{OUT}/cmp/%04d.png', *enc, '-crf', '18', f'{OUT}/universe_sting_compare.mp4'], check=True)
print('ok')

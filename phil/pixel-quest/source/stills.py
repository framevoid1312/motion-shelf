import sys, numpy as np
from PIL import Image
import scene, assets, post
fr=[int(a) for a in sys.argv[1:]] or [2,30,62,84,120,160,182,196,222,250,299]
for f in fr:
    idx, st, br = scene.frame(f)
    rgb = assets.palette_rgb(st, br)[idx]
    Image.fromarray(rgb.astype(np.uint8)).resize((960,540),Image.NEAREST).save(f'still_{f:03d}.png')
    if '--crt' in sys.argv: pass
print('ok')

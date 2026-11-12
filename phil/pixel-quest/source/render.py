import numpy as np, subprocess, sys
import scene, assets, post
out = sys.argv[1] if len(sys.argv) > 1 else 'video.mp4'
cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
       '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1920x1080', '-r', '30', '-i', '-',
       '-i', 'music_master.wav',
       '-map', '0:v', '-map', '1:a',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-tune', 'animation', '-pix_fmt', 'yuv420p',
       '-x264-params', 'keyint=60', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
       '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2',
       '-frames:v', '300', '-t', '10', '-movflags', '+faststart', out]
p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for f in range(300):
    idx, st, br = scene.frame(f)
    rgb = assets.palette_rgb(st, br)[idx].astype(np.uint8)
    big = post.crt(rgb)
    p.stdin.write(big.tobytes())
    if f in (0, 60, 150, 200, 250, 299):
        from PIL import Image
        Image.fromarray(big).save(f'full_{f:03d}.png')
p.stdin.close(); p.wait()
print('done', p.returncode)

import numpy as np, subprocess, wave, re
from scipy.signal import resample_poly
import audio
SR = audio.SR

def write(path, a):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(3) if False else w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype('<i2').tobytes())

def measure(path):
    o = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1]); P = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', o)[-1])
    return I, P

def limiter(x, ceil_db=-1.4, look=0.003, rel=0.06):
    c = 10 ** (ceil_db / 20)
    os_ = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)
    pk = os_.reshape(-1, 4).max(1)[:len(x)]
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    L = int(look * SR)
    # lookahead: min over window ahead
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, size=2 * L + 1, origin=0)
    # smooth release (attack instantaneous thanks to lookahead)
    a = np.exp(-1 / (rel * SR))
    out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]
        out[i] = cur
    # attack smoothing over lookahead window (fade into reductions)
    k = np.hanning(2 * L + 1); k /= k.sum()
    out = np.minimum(out, np.convolve(out, k, mode='same'))
    return x * out[:, None]

raw = audio.build()
raw /= np.abs(raw).max()
gain_db = 8.0
for it in range(8):
    y = limiter(raw * 10 ** (gain_db / 20))
    write('music_master.wav', y)
    I, P = measure('music_master.wav')
    print(f'iter {it}: gain {gain_db:.2f} dB -> I {I} LUFS, TP {P} dBTP')
    if abs(I + 14) < 0.15 and P <= -1.0:
        break
    gain_db += (-14 - I) * 0.9

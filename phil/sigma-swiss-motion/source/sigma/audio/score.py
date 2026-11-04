"""ς — score + print foley, all synthesized. 120 bpm, D dorian, one instrument per rule.
Reads ../events.json (sound cues and the sigma path exported from the film) -> mix_raw.wav (+ stems).
The final sigma is the only thing that sings: a sine whose pitch follows its height on screen."""
import json, os, sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.dirname(HERE)
SR = 48000
DUR = 31.0
N = int(SR * DUR)
STOP = 30.0                                   # hard stop on a downbeat
BEAT = 0.5; E8 = 0.25; E16 = 0.125
rng = np.random.default_rng(7)
ev = json.load(open(os.path.join(FILM, 'events.json')))
EV, TL = ev['ev'], ev['tl']


def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def tv(sec): return np.arange(int(sec * SR)) / SR
def dec(sec, tau): t = tv(sec); return np.exp(-t / tau)
def noise(sec): return rng.standard_normal(int(sec * SR))
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def midi(n): return 12 * (int(n[-1]) + 1) + NOTE[n[0]] + (1 if '#' in n else 0)


def place(buf, x, t, g=1.0):
    i = int(round(t * SR))
    if i >= len(buf): return
    j = min(len(buf), i + len(x))
    buf[i:j] += g * x[:j - i]


# ------------------------------------------------------------------ instruments
def kick():
    t = tv(0.32); f = 45 + 75 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.11) + 0.15 * hp(noise(0.32), 3000) * dec(0.32, 0.004)
def hat(open_=False):
    l = 0.18 if open_ else 0.045
    return hp(noise(l), 7000, 4) * dec(l, 0.05 if open_ else 0.012) * 0.6
def clap():
    x = np.zeros(int(0.2 * SR))
    for k, d in enumerate([0, 0.009, 0.018]):
        place(x, bp(noise(0.12), 900, 3500) * dec(0.12, 0.01 if k < 2 else 0.05), d)
    return x * 0.7
def rim():
    t = tv(0.05)
    return (np.sin(2 * np.pi * 1750 * t) * 0.6 + bp(noise(0.05), 2000, 6000) * 0.4) * dec(0.05, 0.008)
def bass(m, length):
    t = tv(length); f = hz(m)
    x = 2 * ((t * f) % 1) - 1
    x = lp(x, 500, 2) * 0.8 + np.sin(2 * np.pi * f * t) * 0.6
    env = np.minimum(1, t / 0.004) * np.exp(-t / (length * 0.9)); env[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return x * env
def marimba(m):
    t = tv(0.6); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.22) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05)
    x += 0.08 * bp(noise(0.6), 1500, 5000) * dec(0.6, 0.003)
    return x * np.minimum(1, t / 0.002)
def glock(m):
    t = tv(1.4); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.6) + 0.25 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.18)
    x += 0.1 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.05)
    return x * np.minimum(1, t / 0.001)
def drone(m, length):
    t = tv(length); f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    a = np.minimum(1, t / 0.4) * np.minimum(1, (length - t) / 0.05)
    return x * a


# ------------------------------------------------------------------ print foley (dry, close, no reverb)
def tok():
    t = tv(0.08)
    return (np.sin(2 * np.pi * 1150 * t) * 0.8 + np.sin(2 * np.pi * 1780 * t) * 0.4) * dec(0.08, 0.016) + 0.3 * hp(noise(0.08), 3000) * dec(0.08, 0.002)
def tss():
    t = tv(0.14); env = np.minimum(1, t / 0.02) * np.exp(-t / 0.05)
    return bp(noise(0.14), 4500, 9500) * env * 0.5
def clack():
    t = tv(0.09)
    x = 0.7 * hp(noise(0.09), 2500) * dec(0.09, 0.0018)
    x += 0.45 * np.sin(2 * np.pi * 3300 * t) * dec(0.09, 0.02) + 0.3 * np.sin(2 * np.pi * 5100 * t) * dec(0.09, 0.012)
    x += 0.5 * np.sin(2 * np.pi * 210 * t) * dec(0.09, 0.02)
    return x
def block():
    t = tv(0.1)
    return 0.5 * hp(noise(0.1), 1500) * dec(0.1, 0.003) + 0.5 * np.sin(2 * np.pi * 1850 * t) * dec(0.1, 0.025) + 0.5 * np.sin(2 * np.pi * 160 * t) * dec(0.1, 0.03)
def slap():
    t = tv(0.12)
    return 0.8 * lp(noise(0.12), 2600) * dec(0.12, 0.018) + 0.5 * np.sin(2 * np.pi * 140 * t) * dec(0.12, 0.025)
def thunk():
    t = tv(0.2); f = 60 + 40 * np.exp(-t / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * dec(0.2, 0.06) + 0.25 * lp(noise(0.2), 900) * dec(0.2, 0.01)
def felt():
    t = tv(0.45)
    return np.sin(2 * np.pi * 58 * t) * dec(0.45, 0.12) * 1.1 + 0.5 * lp(noise(0.45), 380) * dec(0.45, 0.04)
def snick():
    t = tv(0.12); fc = 2000 * (4 ** np.minimum(1, t / 0.05))
    x = np.zeros_like(t); nz = noise(0.12)
    for k in range(0, len(t), 256):                      # band-pass sweep, block-wise
        f = fc[k]; x[k:k + 256] = bp(nz[max(0, k - 512):k + 256], f * 0.7, min(f * 1.4, 20000))[-len(x[k:k + 256]):]
    x *= np.minimum(1, t / 0.01) * np.exp(-t / 0.03)
    return 0.8 * x + 0.35 * np.sin(2 * np.pi * 6200 * t) * dec(0.12, 0.025)
def tick():
    t = tv(0.03)
    return np.sin(2 * np.pi * 4200 * t) * dec(0.03, 0.004) * 0.7
def slide():
    t = tv(0.3)
    return lp(noise(0.3), 1800) * np.minimum(1, t / 0.08) * np.exp(-t / 0.08) * 0.8
FOLEY = dict(tok=tok, tss=tss, clack=clack, block=block, slap=slap, thunk=thunk, felt=felt, snick=snick, tick=tick, slide=slide, peek=tss)


# ------------------------------------------------------------------ arrangement
drums = np.zeros(N); bassb = np.zeros(N); mallets = np.zeros(N); bells = np.zeros(N); voice = np.zeros(N); fol = np.zeros(N)

def drums_on(t):            # the drums drop for the exception
    if t >= STOP or t < 4: return False
    if 11.0 <= t < 14.0: return False
    if 18.0 <= t < 19.0: return False
    return True
def hats_on(t):
    if t >= STOP or t < 2: return False
    if 11.0 <= t < 14.0: return False
    if 26.0 <= t < 28.0: return False
    return True

for k in range(int(STOP / E8)):
    t = k * E8
    if hats_on(t): place(drums, hat(open_=(k % 4 == 2 and t >= 14)), t, 0.6 if k % 2 else 0.85)
    if k % 2 == 0 and drums_on(t): place(drums, kick(), t, 0.95)
    if k % 4 == 2 and drums_on(t) and (14 <= t < 18 or 19 <= t < 26 or 28 <= t): place(drums, clap(), t, 0.55)
for k in range(int(11.0 / BEAT), int(12.0 / BEAT)): place(drums, rim(), k * BEAT, 0.5)   # near-silent bar: a tick per quarter

# bass: offbeat eighths, Dm / G alternating per bar (D dorian's bright IV)
ROOTS = ['D2', 'D2', 'G1', 'A1']
for k in range(int(6 / E8), int(STOP / E8)):
    t = k * E8
    if 11.0 <= t < 14.0: continue
    if 26.0 <= t < 26.5: continue
    if k % 2 == 1:
        root = midi(ROOTS[int(t // 2) % 4])
        place(bassb, bass(root, 0.22), t, 0.55)
place(bassb, bass(midi('D2'), 1.0), 11.0, 0.6)                 # pedal
place(bassb, lp(drone(midi('D2'), 2.0), 400), 12.0, 0.16)               # the break: a floor, nothing else
place(bassb, lp(drone(midi('D2'), 1.0), 400), 18.0, 0.12)

# marimba ostinato (16ths), one cell per sixteenth, like the letters
PAT = {'D': ['D4', 'A4', 'F4', 'C5', 'E4', 'A4', 'D5', 'A4', 'D4', 'A4', 'F4', 'C5', 'G4', 'A4', 'E5', 'A4'],
       'G': ['G3', 'D4', 'B3', 'F4', 'A3', 'D4', 'G4', 'D4', 'G3', 'D4', 'B3', 'F4', 'C4', 'D4', 'A4', 'D4'],
       'A': ['A3', 'E4', 'C4', 'G4', 'B3', 'E4', 'A4', 'E4', 'A3', 'E4', 'C4', 'G4', 'D4', 'E4', 'B4', 'E4']}
for k in range(int(8 / E16), int(STOP / E16)):
    t = k * E16
    if 11.0 <= t < 14.0 or 18.0 <= t < 19.0: continue
    bar = int(t // 2); key = ['D', 'D', 'G', 'A'][bar % 4]
    n = PAT[key][k % 16] if k % 32 < 16 else PAT[key][(k + 3) % 16]
    place(mallets, marimba(midi(n)), t, 0.32 if k % 4 == 0 else 0.22)

# glockenspiel phrase enters when the sigma lands; ends on D
MEL = [(0, 'A5'), (1, 'F5'), (1.5, 'G5'), (2, 'A5'), (4, 'C6'), (5, 'B5'), (5.5, 'A5'), (6, 'G5'),
       (8, 'A5'), (9, 'D6'), (9.5, 'C6'), (10, 'A5'), (12, 'G5'), (13, 'F5'), (13.5, 'E5'), (14, 'D5')]
for start in (19.0, 23.0):
    for b, n in MEL:
        t = start + b * BEAT / 2 * 1.0
        if t < STOP: place(bells, glock(midi(n)), t, 0.32)
for b, n in [(0, 'A5'), (1, 'G5'), (2, 'F5'), (3, 'E5'), (4, 'D5')]:
    place(bells, glock(midi(n)), 28.0 + b * BEAT * 0.75 if b < 4 else 29.5, 0.3)


# the sigma sings: pitch follows its height (higher on screen = higher pitch)
def sig_base(t):
    def path(keys, t):
        if t <= keys[0][0]: return keys[0][2]
        for i in range(1, len(keys)):
            if t <= keys[i][0]:
                a, b = keys[i - 1], keys[i]; p = (t - a[0]) / (b[0] - a[0]); return a[2] + (b[2] - a[2]) * p
        return keys[-1][2]
    if t < 12.0: return 800 - 25 * min(1, max(0, (t - 11.0) / 0.25)) if t < 11.25 else 775 + 25 * min(1, (t - 11.25) / 0.25)
    if t < 18.0: return path(TL['flight1'], t)
    return path(TL['flight2'], t)
tt = np.arange(N) / SR
amp = np.zeros(N)
for a, b in [(11.0, 11.5), (12.0, 14.0), (18.0, 19.0)]:
    m = (tt >= a) & (tt < b)
    x = (tt[m] - a) / (b - a)
    amp[m] = np.minimum(1, np.minimum(x * (b - a) / 0.03, (1 - x) * (b - a) / 0.05))
idx = np.nonzero(amp)[0]
base = np.array([sig_base(t) for t in tt[idx]])
f = 392.0 * 2 ** ((800 - base) / 300.0)
freq = np.zeros(N); freq[idx] = f
phase = 2 * np.pi * np.cumsum(freq) / SR
voice = np.sin(phase) * amp * 0.3

for t, typ, g in EV:
    if typ in FOLEY: place(fol, FOLEY[typ](), t, g)

# hard stop: everything musical ends on the downbeat (5 ms release)
for bus in (drums, bassb, mallets, bells):
    i = int(STOP * SR); bus[i:i + 240] *= np.linspace(1, 0, 240); bus[i + 240:] = 0

mix = 0.9 * drums + 0.8 * bassb + 0.75 * mallets + 0.7 * bells + 0.8 * voice + 1.15 * fol
mix = hp(mix, 25)
mix /= np.max(np.abs(mix)) / 0.89
stereo = np.stack([mix, mix], 1).astype(np.float32)
wavfile.write(os.path.join(HERE, 'mix_raw.wav'), SR, stereo)
for name, bus in [('music', drums + bassb + mallets + bells), ('foley', fol), ('voice', voice)]:
    b = bus / (np.max(np.abs(bus)) + 1e-9) * 0.8
    wavfile.write(os.path.join(HERE, f'stem_{name}.wav'), SR, b.astype(np.float32))
print('ok', DUR, 's')

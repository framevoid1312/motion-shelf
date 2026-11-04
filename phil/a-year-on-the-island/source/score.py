"""A Year on the Island — score + SFX, synthesized and timed from the film's own events.

Writes audio/music.wav, audio/sfx.wav and beats.json. 96 BPM, 12 bars, one season = 2 bars.
Music: one continuous piece (pad, e-piano, music box, marimba bass, brushes); seasons change only how
thick the accompaniment is. SFX: small foley under the music; the same event always gets the same sound.
"""
import json, os, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.dirname(HERE)
SR = 48000
DUR = 30.0
N = int(SR * DUR)
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(2026)
TW = [5, 10, 15, 20, 25]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a=0.005, d=0.2, s=0.0, r=0.1, sus=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    sus_n = max(0, n - a_n - d_n - r_n) if sus is None else int(sus * SR)
    e = np.concatenate([np.linspace(0, 1, max(a_n, 1)), np.linspace(1, s, max(d_n, 1)), np.full(sus_n, s), np.linspace(s, 0, max(r_n, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def tv(n):
    return np.arange(n) / SR


class Bus:
    def __init__(self):
        self.x = np.zeros((N + SR * 4, 2))

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0:
            sig = sig[-i:]; i = 0
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
        n = min(len(sig), len(self.x) - i)
        self.x[i:i + n] += sig[:n] * gain


def reverb(x, wet=0.25, length=2.2, decay=3.0, seed=1):
    r = np.random.default_rng(seed)
    n = int(length * SR)
    t = tv(n)
    irl = r.standard_normal(n) * np.exp(-decay * t)
    irr = r.standard_normal(n) * np.exp(-decay * t)
    b, a = signal.butter(1, 5500 / (SR / 2), 'low')
    irl, irr = signal.lfilter(b, a, irl), signal.lfilter(b, a, irr)
    irl /= np.sqrt(np.sum(irl ** 2)); irr /= np.sqrt(np.sum(irr ** 2))
    yl = signal.fftconvolve(x[:, 0], irl)[:len(x)]
    yr = signal.fftconvolve(x[:, 1], irr)[:len(x)]
    return x * (1 - wet) + np.stack([yl, yr], 1) * wet * 0.6


def lp(x, f, order=2):
    b, a = signal.butter(order, min(f, SR / 2 - 100) / (SR / 2), 'low')
    return signal.lfilter(b, a, x, axis=0)


def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high')
    return signal.lfilter(b, a, x, axis=0)


def bp(x, f0, f1, order=2):
    b, a = signal.butter(order, [f0 / (SR / 2), f1 / (SR / 2)], 'band')
    return signal.lfilter(b, a, x, axis=0)


# ------------------------------------------------------------------ instruments
def music_box(m, dur=1.6):
    n = int(dur * SR); t = tv(n); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-3.2 * t)
    x += 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-6 * t)
    x += 0.18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-14 * t)   # tine
    x += 0.06 * np.sin(2 * np.pi * f * 8.9 * t) * np.exp(-30 * t)
    return x * env(n, 0.002, dur - 0.05, 0, 0.04, 0)


def epiano(m, dur=2.0, vel=1.0):
    n = int(dur * SR); t = tv(n); f = hz(m)
    mod = np.sin(2 * np.pi * f * t) * (1.6 * np.exp(-5 * t) + 0.2)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-1.4 * t)
    x += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-4 * t)
    return x * env(n, 0.004, 0.1, 1.0, 0.25) * vel


def marimba(m, dur=0.9):
    n = int(dur * SR); t = tv(n); f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-5 * t) + 0.3 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-22 * t)
    return x * env(n, 0.002, dur, 0, 0.02, 0)


def pad(notes, dur, cutoff=1400, voices=4):
    n = int(dur * SR); t = tv(n)
    out = np.zeros((n, 2))
    for m in notes:
        for v in range(voices):
            det = (v - (voices - 1) / 2) * 0.09
            f = hz(m) * 2 ** (det / 12)
            ph = rng.random() * 2 * np.pi
            saw = 2 * ((f * t + ph / (2 * np.pi)) % 1) - 1
            pan = (v / (voices - 1)) * 2 - 1
            out[:, 0] += saw * (1 - pan) * 0.5; out[:, 1] += saw * (1 + pan) * 0.5
    out = lp(out, cutoff, 2)
    e = env(n, 0.6, 0.1, 1.0, 0.8)
    return out * e[:, None] / (len(notes) * voices)


def brush(dur=0.35, bright=1.0):
    n = int(dur * SR); t = tv(n)
    x = rng.standard_normal(n)
    x = bp(x, 1800, 7000 * bright, 2) * np.exp(-9 * t) * env(n, 0.03, dur, 0, 0.02, 0)
    return x


def bell(m, dur=3.0):
    n = int(dur * SR); t = tv(n); f = hz(m)
    parts = [(1, 1, 1.2), (2.76, 0.45, 2.4), (5.4, 0.25, 4), (8.93, 0.12, 7), (0.5, 0.3, 1.0)]
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-d * t) for r, a, d in parts)
    return x * env(n, 0.003, dur, 0, 0.05, 0)


# ------------------------------------------------------------------ harmony (D major), 12 bars
D = 62
CH = [  # (bass, chord tones)
    (38, [62, 66, 69, 73, 76]),   # Dmaj9            spring
    (43, [62, 66, 67, 71]),       # Gmaj7
    (47, [62, 66, 69, 71]),       # Bm7              summer
    (45, [61, 64, 69, 71]),       # Aadd9
    (43, [59, 62, 66, 67]),       # Gmaj7            autumn
    (42, [61, 62, 66, 69]),       # Dmaj7/F#
    (40, [59, 62, 64, 67]),       # Em7              winter
    (47, [57, 62, 66, 69]),       # Bm7
    (43, [59, 62, 66, 69]),       # Gmaj9            night
    (45, [62, 64, 69, 71]),       # Asus2
    (38, [62, 66, 69, 73, 76]),   # Dmaj9            spring again
    (38, [62, 66, 69, 74]),       # D
]
# season thickness: which layers play in each bar
LAY = {
    'ep':      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    'ep8':     [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    'bass':    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    'brush':   [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0],
    'mbox':    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
}
# music-box melody, (beat-in-bar, midi, len-beats) per bar
MEL = [
    [(0, 81, 1), (1, 78, 1), (2, 76, 1.5), (3.5, 74, .5)],
    [(0, 74, 1), (1.5, 76, .5), (2, 78, 2)],
    [(0, 78, .5), (.5, 81, .5), (1, 83, 1), (2, 81, .5), (2.5, 78, .5), (3, 76, 1)],
    [(0, 76, .5), (.5, 78, .5), (1, 81, 1.5), (2.5, 78, .5), (3, 76, 1)],
    [(0, 79, 1.5), (1.5, 78, .5), (2, 74, 1), (3, 71, 1)],
    [(0, 73, 1), (1, 74, 1), (2, 78, 2)],
    [(0, 83, 2), (2, 79, 2)],
    [(0, 78, 2), (2, 74, 2)],
    [(0, 86, 3), (3, 83, 1)],
    [(0, 81, 2), (2.5, 85, 1.5)],
    [(0, 81, 1), (1, 78, 1), (2, 76, 1.5), (3.5, 74, .5)],
    [(0, 86, 4)],
]

music = Bus()
for b, (bass, tones) in enumerate(CH):
    t0 = b * BAR
    night = b in (8, 9)
    winter = b in (6, 7)
    # pad: always, darker in winter/night
    cutoff = 900 if night else (1200 if winter else 1700)
    music.add(t0 - 0.15, pad([m - 12 for m in tones[:3]] + tones[:2], BAR + 0.9, cutoff), gain=0.55 if b < 11 else 0.6)
    if b == 11:
        music.add(t0 + BAR, pad([50, 57, 62, 66], 2.5, 1100), gain=0.45)
    if LAY['ep'][b]:
        for beat in (0, 2):
            for i, m in enumerate(tones[:4]):
                music.add(t0 + beat * BEAT + i * 0.012, epiano(m, 1.6, 0.8 if beat else 1.0), gain=0.07, pan=-0.3 + 0.2 * i)
    if LAY['ep8'][b]:
        for k in range(8):
            if k % 2:
                for i, m in enumerate(tones[1:4]):
                    music.add(t0 + k * BEAT / 2, epiano(m + 12, 0.4, 0.6), gain=0.035, pan=0.3)
    if LAY['bass'][b]:
        pattern = [(0, 0), (1.5, 0), (2, 7), (3, 12)] if not (winter or night) else [(0, 0), (2, 7)]
        for bt, iv in pattern:
            music.add(t0 + bt * BEAT, marimba(bass + iv + (12 if winter or night else 0), 0.9), gain=0.22 if not (winter or night) else 0.15)
    if LAY['brush'][b]:
        for k in range(8):
            g = 0.06 if k in (2, 6) else 0.025
            music.add(t0 + k * BEAT / 2, brush(0.3 if k in (2, 6) else 0.12), gain=g, pan=0.25)
    if LAY['mbox'][b]:
        for bt, m, ln in MEL[b]:
            music.add(t0 + bt * BEAT, music_box(m, 1.8 if night or winter else 1.3), gain=0.16 if not night else 0.19, pan=-0.15)
            if night or b == 11:   # echo an octave up at night
                music.add(t0 + bt * BEAT + BEAT * 0.75, music_box(m + 12, 1.2), gain=0.05, pan=0.4)

mx = reverb(music.x, wet=0.32, length=2.6, decay=2.4, seed=3)[:N]
mx = hp(mx, 35)
# gentle fade at the very end
mx[-int(1.0 * SR):] *= np.linspace(1, 0, int(1.0 * SR))[:, None] ** 1.5

# ------------------------------------------------------------------ SFX from the film's events
ev = json.load(open(os.path.join(FILM, 'events.json')))
sfx = Bus()


def ripple_whoosh(dur=2.4):
    """the wave: a soft water swell that rolls outward"""
    n = int(dur * SR); t = tv(n)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    fc = 300 + 2600 * np.exp(-1.6 * t)
    blk = 256
    zi = None
    for i in range(0, n, blk):
        f = fc[i]
        b, a = signal.butter(2, [max(f * 0.6, 60) / (SR / 2), min(f * 1.6, 20000) / (SR / 2)], 'band')
        seg, zi = signal.lfilter(b, a, x[i:i + blk], zi=zi if zi is not None else signal.lfilter_zi(b, a) * 0)
        out[i:i + blk] = seg
    e = np.minimum(t / 0.05, 1) * np.exp(-1.5 * t)
    return out * e


def boing(dur=0.55):
    """the lighthouse springs back: a soft rubbery release"""
    n = int(dur * SR); t = tv(n)
    f = 180 + 140 * np.exp(-6 * t) * np.cos(12 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-6 * t) * env(n, 0.004, dur, 0, 0.03, 0)


def squeeze(dur=0.32):
    """anticipation squash: a short tightening creak"""
    n = int(dur * SR); t = tv(n)
    f = 260 - 90 * (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * 0.5 + 0.5 * bp(rng.standard_normal(n), 900, 2400) * 0.5
    return x * (t / dur) ** 1.5 * env(n, 0.01, dur, 1, 0.02)


def pop_in(m, dur=0.22):
    n = int(dur * SR); t = tv(n)
    f = hz(m) * (0.7 + 0.3 * np.minimum(t / 0.03, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-16 * t) * env(n, 0.002, dur, 0, 0.02, 0)


def pop_out(m, dur=0.2):
    n = int(dur * SR); t = tv(n)
    f = hz(m) * (1.0 - 0.45 * np.minimum(t / 0.12, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-14 * t) * env(n, 0.002, dur, 0, 0.02, 0)


def tok(dur=0.18):
    """houses and the mill squash as the wave passes: a small wooden tok"""
    n = int(dur * SR); t = tv(n)
    x = np.sin(2 * np.pi * 520 * t) * np.exp(-35 * t) + 0.4 * np.sin(2 * np.pi * 1310 * t) * np.exp(-60 * t)
    return x


def twinkle(dur=0.15):
    n = int(dur * SR); t = tv(n)
    return np.sin(2 * np.pi * hz(98) * t) * np.exp(-30 * t)


POP_PITCH = {'umbrella': 86, 'pumpkin': 74, 'bale': 69, 'snowman': 79, 'flower': 93}
for e in ev:
    ty, what, t = e['type'], e.get('what'), e['t']
    if ty == 'squash':
        sfx.add(t, squeeze(), gain=0.16)
    elif ty == 'wave':
        sfx.add(t, boing(), gain=0.32)
        sfx.add(t + 0.02, ripple_whoosh(), gain=0.20)
        sfx.add(t, bell(86, 3.2), gain=0.09, pan=0.25)       # the lighthouse bell, same every time
        sfx.add(t + 0.03, bell(93, 2.4), gain=0.04, pan=-0.2)
    elif ty == 'pulse':
        sfx.add(t, tok(), gain=0.13, pan=float(np.clip((e['d'] - 5) / 5, -0.6, 0.6)))
    elif ty == 'pop-in':
        g = 0.025 if what == 'flower' else 0.11
        sfx.add(t, pop_in(POP_PITCH[what]), gain=g, pan=float(rng.uniform(-0.5, 0.5)))
    elif ty == 'pop-out':
        g = 0.018 if what == 'flower' else 0.08
        sfx.add(t, pop_out(POP_PITCH[what] - 5), gain=g, pan=float(rng.uniform(-0.5, 0.5)))


def frame_swell(dur, rising=True):
    n = int(dur * SR); t = tv(n)
    x = lp(hp(rng.standard_normal(n), 400), 3500)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    shape *= (t / dur) if rising else (1 - t / dur) * 0.6 + 0.4
    return x * shape


sfx.add(0.0, frame_swell(1.3), gain=0.05)
sfx.add(0.0, bell(74, 2.5), gain=0.0)
sfx.add(28.45, frame_swell(1.1, False), gain=0.045)

# ---------------------------------------------------------------- ambience per season, crossfading on the waves
t = tv(N)


def season_gain(state_list):
    """state_list: gain per palette state [spring, summer, autumn, winter, night]; crossfades over the wave"""
    states = [0, 1, 2, 3, 4, 0]
    g = np.full(N, float(state_list[0]))
    for k, t0 in enumerate(TW):
        a, b = state_list[states[k]], state_list[states[k + 1]]
        x = np.clip((t - t0) / 1.4, 0, 1)
        x = x * x * (3 - 2 * x)
        m = t >= t0
        g[m] = a + (b - a) * x[m]
    return g


noise = rng.standard_normal((N, 2))
# water lapping: low band noise with slow swells
lap = bp(noise, 150, 900) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.31 * t)[:, None] * np.sin(2 * np.pi * 0.17 * t + 1)[:, None])
amb = lap * season_gain([0.05, 0.08, 0.05, 0.025, 0.02])[:, None]
# wind: band noise with gusts
gust = 0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t + 0.4) * np.sin(2 * np.pi * 0.29 * t)
wind = bp(rng.standard_normal((N, 2)), 400, 1800) * gust[:, None]
amb += wind * season_gain([0.0, 0.0, 0.07, 0.045, 0.03])[:, None]
# leaves rustle in autumn
rustle = hp(rng.standard_normal((N, 2)), 3500) * (np.abs(np.sin(2 * np.pi * 1.7 * t)) ** 4)[:, None]
amb += rustle * season_gain([0, 0, 0.03, 0, 0])[:, None]
sfx.x[:N] += amb * 1.6


def chirp(r):
    n = int(0.09 * SR); tt = tv(n)
    f0 = r.uniform(3000, 4600)
    f = f0 + 1400 * np.sin(np.pi * tt / 0.09) * (1 if r.random() < 0.5 else -0.6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.09) ** 2


def gull(r):
    n = int(0.45 * SR); tt = tv(n)
    f = 1150 + 500 * np.sin(np.pi * tt / 0.45) - 300 * tt
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(f) / SR)
    return bp(x, 700, 3200) * np.sin(np.pi * tt / 0.45) ** 1.5


br = np.random.default_rng(5)
for t0, t1, dens in [(0.4, 5.6, 3.2), (25.6, 29.2, 3.6)]:
    tt = t0
    while tt < t1:
        for j in range(br.integers(1, 4)):
            sfx.add(tt + j * 0.11, chirp(br), gain=0.035, pan=float(br.uniform(-0.8, 0.8)))
        tt += br.exponential(1 / dens) + 0.25
for tt in (6.3, 8.4):
    sfx.add(tt, gull(br), gain=0.03, pan=0.5)
# night: a distant foghorn under the beam
n_h = int(3.2 * SR); th = tv(n_h)
horn = (np.sin(2 * np.pi * 73.4 * th) + 0.5 * np.sin(2 * np.pi * 146.8 * th) + 0.25 * np.sin(2 * np.pi * 220.2 * th)) * env(n_h, 0.6, 0.2, 0.8, 1.6)
sfx.add(22.0, lp(horn, 600), gain=0.075, pan=0.3)

sx = reverb(sfx.x, wet=0.22, length=1.8, decay=3.2, seed=9)[:N]
sx = hp(sx, 40)


def write(name, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    wavfile.write(os.path.join(HERE, name), SR, x.astype(np.float32))


write('music.wav', mx)
write('sfx.wav', sx * 0.5)   # stem level: under the music
beats = [round(i * BEAT, 4) for i in range(int(DUR / BEAT))]
json.dump({'offset': 0, 'period': BEAT, 'bpm': BPM, 'beats': beats, 'bars': [round(b * BAR, 4) for b in range(12)]},
          open(os.path.join(FILM, 'beats.json'), 'w'))
print('music.wav, sfx.wav, beats.json written')

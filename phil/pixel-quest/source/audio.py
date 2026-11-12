"""PIXEL QUEST — 2A03-style chiptune + SFX, locked to the same cue sheet as the picture.
150 BPM -> one 16th note = exactly 3 video frames = 0.1 s."""
import numpy as np
from scene import CUE, DLG_TEXT

SR = 48000
DUR = 10.0
N = int(SR * DUR)
T16 = 0.1
ST = lambda f: f / 30.0          # frame -> seconds


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- oscillators
def polyblep(t, dt):
    y = np.zeros_like(t)
    dt = np.broadcast_to(dt, t.shape)
    m = t < dt
    x = t[m] / dt[m]; y[m] = x + x - x * x - 1
    m = t > 1 - dt
    x = (t[m] - 1) / dt[m]; y[m] = x * x + x + x + 1
    return y


def pulse(freq, n, duty=0.5, phase0=0.0):
    freq = np.broadcast_to(np.asarray(freq, float), (n,))
    dt = freq / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    sq = np.where(ph < duty, 1.0, -1.0)
    sq += polyblep(ph, dt)
    sq -= polyblep((ph - duty) % 1.0, dt)
    return sq


def triangle(freq, n):
    """4-bit stepped triangle, like the 2A03"""
    freq = np.broadcast_to(np.asarray(freq, float), (n,))
    ph = np.cumsum(freq / SR) % 1.0
    tri = 1 - 4 * np.abs(ph - 0.5)            # -1..1
    return np.round((tri + 1) * 7.5) / 7.5 - 1


_LFSR_CACHE = {}


def lfsr(short=False, length=1 << 15):
    key = short
    if key in _LFSR_CACHE:
        return _LFSR_CACHE[key]
    reg = 1
    out = np.empty(length, np.float64)
    tap = 6 if short else 1
    for i in range(length):
        bit = (reg & 1) ^ ((reg >> tap) & 1)
        reg = (reg >> 1) | (bit << 14)
        out[i] = 1.0 if (reg & 1) else -1.0
    _LFSR_CACHE[key] = out
    return out


def noise(rate_hz, n, short=False):
    seq = lfsr(short)
    rate = np.broadcast_to(np.asarray(rate_hz, float), (n,))
    idx = (np.cumsum(rate / SR)).astype(np.int64) % len(seq)
    return seq[idx]


def env_steps(n, attack=0.0, decay=0.25, sustain=0.0, length=None, vmax=1.0):
    """NES-flavoured envelope: quantised to 16 levels, updated at 60 Hz"""
    t = np.arange(n) / SR
    tq = np.floor(t * 60) / 60
    e = np.ones(n) * vmax
    if attack > 0:
        e = np.minimum(e, tq / attack * vmax)
    rel = np.maximum(0, tq - attack)
    e = e * (sustain + (1 - sustain) * np.exp(-rel / max(decay, 1e-4)))
    if length is not None:
        e[t > length] *= np.exp(-(t[t > length] - length) / 0.03)
    return np.round(e * 15) / 15


class Mix:
    def __init__(self):
        self.L = np.zeros(N); self.R = np.zeros(N)

    def add(self, sig, t0, gain=1.0, pan=0.0):
        i0 = int(round(t0 * SR))
        if i0 >= N:
            return
        sig = sig[:N - i0]
        gl = gain * np.sqrt(0.5 * (1 - pan)); gr = gain * np.sqrt(0.5 * (1 + pan))
        self.L[i0:i0 + len(sig)] += sig * gl
        self.R[i0:i0 + len(sig)] += sig * gr


# ---------------------------------------------------------------- instruments
def note_pulse(m, dur, duty=0.25, decay=0.35, sustain=0.55, vib=True, vmax=1.0):
    n = int((dur + 0.08) * SR)
    t = np.arange(n) / SR
    f = midi(m) * np.ones(n)
    if vib and dur > 0.35:
        f *= 2 ** ((np.sin(2 * np.pi * 6 * t) * 0.18 * np.clip((t - 0.18) / 0.15, 0, 1)) / 12)
    return pulse(f, n, duty) * env_steps(n, 0.004, decay, sustain, dur, vmax)


def note_tri(m, dur):
    n = int((dur + 0.01) * SR)
    e = np.ones(n); e[-int(0.01 * SR):] = np.linspace(1, 0, int(0.01 * SR))
    return triangle(midi(m), n) * e


def kick(vel=1.0):
    n = int(0.16 * SR); t = np.arange(n) / SR
    f = 55 + 160 * np.exp(-t / 0.025)
    body = triangle(f, n) * np.exp(-t / 0.07)
    click = noise(12000, n) * np.exp(-t / 0.004) * 0.5
    return (body + click) * vel


def snare(vel=1.0):
    n = int(0.18 * SR); t = np.arange(n) / SR
    s = noise(9000, n) * env_steps(n, 0, 0.06) + pulse(190 * np.exp(-t / 0.05) + 120, n, 0.5) * np.exp(-t / 0.03) * 0.4
    return s * vel


def hat(vel=1.0, open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    return noise(30000, n, short=False) * env_steps(n, 0, 0.09 if open_ else 0.015) * vel


def crash(vel=1.0):
    n = int(1.6 * SR)
    return noise(26000, n) * env_steps(n, 0, 0.45) * vel


# ---------------------------------------------------------------- SFX
def sfx_coin(semis=0):
    n1, n2 = int(0.06 * SR), int(0.32 * SR)
    a = pulse(midi(83 + semis), n1, 0.5) * 0.9
    b = pulse(midi(88 + semis), n2, 0.5) * env_steps(n2, 0, 0.12)
    return np.concatenate([a, b])


def sfx_jump():
    n = int(0.17 * SR); t = np.arange(n) / SR
    f = 260 * 2 ** (t / 0.17 * 1.6)
    return pulse(f, n, 0.5) * env_steps(n, 0, 0.12)


def sfx_bop():
    n = int(0.16 * SR); t = np.arange(n) / SR
    f = 520 * 2 ** (-t / 0.16 * 2.2)
    return pulse(f, n, 0.25) * env_steps(n, 0, 0.08) + noise(4000, n) * env_steps(n, 0, 0.03) * 0.6


def sfx_land():
    n = int(0.08 * SR)
    return noise(2500, n) * env_steps(n, 0, 0.025) * 0.8


def sfx_skid():
    n = int(0.22 * SR); t = np.arange(n) / SR
    return noise(14000 - 40000 * t, n, short=True) * env_steps(n, 0.01, 0.1) * 0.5


def sfx_blip(m):
    n = int(0.045 * SR)
    return pulse(midi(m), n, 0.125) * env_steps(n, 0, 0.03)


def sfx_alert():
    n = int(0.07 * SR)
    return np.concatenate([pulse(midi(88), n, 0.5), pulse(midi(95), int(0.12 * SR), 0.5) * env_steps(int(0.12 * SR), 0, 0.05)])


def sfx_chest():
    n = int(0.9 * SR); t = np.arange(n) / SR
    whoosh = noise(3000 + 30000 * t / 0.9, n) * env_steps(n, 0, 0.18) * 0.5
    sweep = pulse(midi(60) * 2 ** (np.minimum(t, 0.12) / 0.12 * 2), n, 0.25) * env_steps(n, 0, 0.2) * 0.5
    return whoosh + sweep


def sfx_power():
    n = int(0.3 * SR); t = np.arange(n) / SR
    thunk = triangle(90 * np.exp(-t / 0.1) + 40, n) * np.exp(-t / 0.08)
    zap = pulse(3000 * np.exp(-t / 0.04) + 200, n, 0.125) * env_steps(n, 0, 0.04) * 0.35
    return thunk + zap


def sfx_shine():
    out = []
    for i, m in enumerate([96, 100, 103, 108, 103, 108]):
        n = int(0.033 * SR)
        out.append(pulse(midi(m), n, 0.125) * (1 - i / 8))
    tail = int(0.3 * SR)
    out.append(pulse(midi(108), tail, 0.125) * env_steps(tail, 0, 0.08) * 0.4)
    return np.concatenate(out)


def sfx_stamp():
    n = int(0.2 * SR); t = np.arange(n) / SR
    return triangle(110 * np.exp(-t / 0.06) + 50, n) * np.exp(-t / 0.08) + noise(7000, n) * env_steps(n, 0, 0.04) * 0.6


# ---------------------------------------------------------------- score
CHORDS = {  # half-bar chords (root midi for bass, triad for arps)
    'C': (36, [60, 64, 67]), 'G': (43, [59, 62, 67]), 'Am': (45, [57, 60, 64]),
    'F': (41, [57, 60, 65]), 'Em': (40, [55, 59, 64]),
}
PROG = ['C', 'G', 'Am', 'F', 'F', 'G', 'Am', 'G', 'C', 'G', 'C', 'C', 'C']   # per half bar (24 frames)

LEAD = [  # (bar, start16, len16, midi)
    (0, 0, 2, 72), (0, 2, 2, 76), (0, 4, 2, 79), (0, 6, 2, 84), (0, 8, 3, 83), (0, 11, 1, 81), (0, 12, 4, 79),
    (1, 0, 2, 81), (1, 2, 2, 79), (1, 4, 2, 76), (1, 6, 2, 72), (1, 8, 2, 77), (1, 10, 2, 81), (1, 12, 4, 84),
    (2, 0, 6, 81),
    # fanfare (chest)
    (4, 0, 1, 72), (4, 1, 1, 76), (4, 2, 1, 79), (4, 3, 3, 84), (4, 6, 2, 83), (4, 8, 2, 79), (4, 10, 2, 83), (4, 12, 4, 86),
    (5, 0, 14, 84),
]
HARM = [(4, 3, 3, 79), (4, 6, 2, 79), (4, 12, 4, 83), (5, 0, 14, 76)]


def t16(bar, s):
    return (bar * 16 + s) * T16


def build():
    mx = Mix()
    # ---- bass: 8th-note octave bounce, half-time in the sunset bar, whole note at the end
    for hb, ch in enumerate(PROG):
        root = CHORDS[ch][0]
        bar = hb // 2
        if bar >= 5:
            if hb == 10:
                mx.add(note_tri(36, 1.4) * np.linspace(1, 0.0, int(1.41 * SR)), hb * 0.8, 0.55)
            continue
        for k in range(4):
            if bar == 2 and k % 2 == 1:
                continue
            m = root + (12 if k % 2 else 0)
            mx.add(note_tri(m, 0.18 if bar != 2 else 0.38), hb * 0.8 + k * 0.2, 0.55)
    # ---- drums
    for bar in range(5):
        for s in range(16):
            t = t16(bar, s)
            calm = bar == 2
            if s in (0, 8) or (s == 10 and bar in (0, 1, 4)):
                if not (calm and s != 0):
                    mx.add(kick(), t, 0.85)
            if s in (4, 12) and not calm and not (bar == 3 and s >= 8):
                mx.add(snare(), t, 0.5)
            if s % 2 == 0:
                mx.add(hat(open_=(s == 14 and not calm)), t, 0.16 if not calm else 0.1, pan=0.3)
            if bar == 3 and s >= 8:            # snare roll build into the chest
                mx.add(snare(0.35 + 0.65 * (s - 8) / 7), t, 0.5)
    for c in (0, CUE['chest']):
        mx.add(crash(), ST(c), 0.22, pan=-0.2)
    mx.add(crash(0.7), ST(CUE['shine']), 0.16, pan=0.2)
    # ---- lead + harmony (pulse 25% / 50%), slight stereo spread
    for (bar, s, l, m) in LEAD:
        mx.add(note_pulse(m, l * T16 - 0.01, 0.25, vmax=1.0), t16(bar, s), 0.25, pan=-0.25)
        # echo channel, NES-style fake delay (pulse 2, quieter, 3 16ths later)
        if bar < 4:
            mx.add(note_pulse(m, l * T16 - 0.01, 0.125, vmax=0.5), t16(bar, s) + 0.15, 0.12, pan=0.45)
    for (bar, s, l, m) in HARM:
        mx.add(note_pulse(m, l * T16 - 0.01, 0.5, vmax=0.8), t16(bar, s), 0.15, pan=0.35)
    # ---- arps: sunset bar + build (pulse 12.5%)
    for bar in (2, 3):
        for s in range(16):
            hb = bar * 2 + s // 8
            tri_ = CHORDS[PROG[hb]][1]
            up = 12 if (bar == 3 and s >= 8) else 0
            m = tri_[s % 3] + 12 + up + (12 if (bar == 3 and s >= 12) else 0)
            mx.add(note_pulse(m, 0.09, 0.125, decay=0.05, sustain=0.0, vib=False), t16(bar, s), 0.12, pan=0.4)
    # final twinkle arp decaying over the end card
    for i, m in enumerate([84, 88, 91, 96, 91, 88, 84, 79, 84, 88, 91, 96]):
        t = t16(5, 4 + i)
        mx.add(note_pulse(m, 0.09, 0.125, decay=0.05, sustain=0.0, vib=False), t, 0.1 * (1 - i / 14), pan=0.5 if i % 2 else -0.5)

    # ---- SFX on the cue sheet
    mx.add(sfx_power(), ST(CUE['power_on']), 0.5)
    allc = CUE['coins_run'] + CUE['coins_arc'] + CUE['coins_chain']
    for i, c in enumerate(CUE['coins_run']):
        mx.add(sfx_coin(0), ST(c), 0.2, pan=0.1)
    for i, c in enumerate(CUE['coins_arc']):
        mx.add(sfx_coin([0, 2, 4][i]), ST(c), 0.2, pan=0.1)
    for i, c in enumerate(CUE['coins_chain']):
        mx.add(sfx_coin([0, 2, 4, 7][i]), ST(c), 0.2, pan=0.1)
    mx.add(sfx_jump(), ST(CUE['jump1']), 0.22)
    mx.add(sfx_bop(), ST(CUE['bop']), 0.3)
    mx.add(sfx_jump() , ST(CUE['bop']) + 0.02, 0.15)
    mx.add(sfx_land(), ST(CUE['land1']), 0.4)
    mx.add(sfx_skid(), ST(CUE['skid']), 0.45)
    pent = [79, 81, 84, 86, 88, 84, 81, 86, 91]
    for i in range(len(DLG_TEXT)):
        mx.add(sfx_blip(pent[i]), ST(CUE['dlg_type0'] + i * CUE['dlg_step']), 0.16, pan=-0.1)
    for i, m in enumerate([72, 76, 79]):
        mx.add(sfx_blip(m + 12), ST(CUE['dlg_open']) + i * 0.03, 0.12)
    for i, m in enumerate([79, 76, 72]):
        mx.add(sfx_blip(m + 12), ST(CUE['dlg_close']) + i * 0.03, 0.1)
    mx.add(sfx_alert(), ST(CUE['alert']), 0.18)
    mx.add(sfx_chest(), ST(CUE['chest']), 0.45)
    mx.add(kick(1.2), ST(CUE['logo_land']), 0.7)
    mx.add(sfx_stamp(), ST(CUE['logo_land']), 0.35)
    mx.add(sfx_stamp(), ST(CUE['subtitle']), 0.28)
    mx.add(sfx_shine(), ST(CUE['shine']), 0.2, pan=0.3)
    mx.add(sfx_blip(96), ST(CUE['press']), 0.15)
    mx.add(sfx_blip(96), ST(CUE['press'] + 24), 0.12)

    out = np.stack([mx.L, mx.R], 1)
    # gentle DC block + tiny final fade (last 60 ms)
    out -= out.mean(0)
    fade = int(0.06 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return out


if __name__ == '__main__':
    import wave
    a = build()
    a = a / np.abs(a).max() * 0.5
    with wave.open('music_raw.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype('<i2').tobytes())
    print('peak', np.abs(a).max(), 'len', len(a) / SR)

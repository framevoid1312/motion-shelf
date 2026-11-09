"""Export index.html as a seamless 30 s 1080p60 H.264 + AAC loop.

Runs the page's own scene renderer in an embedded V8 (mini-racer), synthesises the
ambience from the same event timeline, then pipes raw frames into ffmpeg.
Requires: pip install numpy imageio-ffmpeg mini-racer
"""
import json, re, subprocess, sys, wave, time
from pathlib import Path
import numpy as np
import imageio_ffmpeg
from py_mini_racer import MiniRacer

HERE = Path(__file__).resolve().parent
HTML = HERE / "index.html"
OUT = HERE / "snow-1999.mp4"
WAV = HERE / "snow-1999.wav"
P, FPS, SR = 30, 60, 48000
NS = P * SR
CTL = 1000  # control-signal rate (Hz)

src = HTML.read_text(encoding="utf-8")
ctx = MiniRacer()
ctx.eval(re.search(r'<script id="scene">(.*?)</script>', src, re.S).group(1))
ctx.eval(f"var S=createScene({P});")
ev = json.loads(ctx.eval("JSON.stringify(S.events)"))
ctl = json.loads(ctx.eval(f"""(function(){{var n={P*CTL},g=[],k=[],h=[],c=[];
  for(var i=0;i<n;i++){{var t=i/{CTL};g.push(S.gust(t));k.push(S.kO(t));h.push(S.hddAt(t)?1:0);c.push(S.carAt(t));}}
  var land=[];for(var j=0;j<S.events.clumps.length;j++)land.push(S.clumpLand(j));
  return JSON.stringify({{g:g,k:k,h:h,c:c,land:land}});}})()"""))

# ---------------------------------------------------------------- audio
rng = np.random.default_rng(314)
t = np.arange(NS) / SR
freqs = np.fft.rfftfreq(NS, 1 / SR)
fsafe = np.maximum(freqs, 1.0)


def up(sig):
    """control signal (CTL Hz, periodic) -> audio rate, circular linear interpolation"""
    s = np.asarray(sig, float)
    x = np.arange(NS) * CTL / SR
    return np.interp(x, np.arange(len(s) + 1), np.append(s, s[0]))


def shaped(lo, hi, tilt=0.0, order=2, seed=None):
    """circular band-limited noise: FFT-domain filter so the loop wraps seamlessly"""
    r = np.random.default_rng(seed) if seed is not None else rng
    spec = np.fft.rfft(r.standard_normal(NS))
    H = np.ones_like(fsafe)
    if lo:
        H /= np.sqrt(1 + (lo / fsafe) ** (2 * order))
    if hi:
        H /= np.sqrt(1 + (fsafe / hi) ** (2 * order))
    H *= (fsafe / 1000.0) ** tilt
    H[0] = 0
    y = np.fft.irfft(spec * H, NS)
    return y / (np.sqrt(np.mean(y ** 2)) + 1e-12)


def lowpass(x, hi, order=2):
    H = 1 / np.sqrt(1 + (fsafe / hi) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x) * H, NS)


def pan(x, p):
    p = np.clip(p, -1, 1)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def bump(center, width):
    """periodic smooth window around time `center` (s)"""
    d = (t - center + P / 2) % P - P / 2
    return np.exp(-0.5 * (d / width) ** 2)


def env_span(t0, t1, fade):
    d0 = (t - t0) % P
    span = (t1 - t0) % P
    e = np.clip(np.minimum(d0, span - d0) / fade, 0, 1)
    e[d0 > span] = 0
    return 0.5 - 0.5 * np.cos(np.pi * e)


mix = np.zeros((2, NS))
gust = up(ctl["g"])
kO = up(ctl["k"])
car = np.array(ctl["c"], float)

# muffled city: brown-ish rumble, wide stereo, slow swell (15 s period -> periodic)
city = np.stack([shaped(20, 260, -1.0, seed=1), shaped(20, 260, -1.0, seed=2)])
mix += 0.050 * city * (0.85 + 0.15 * np.sin(2 * np.pi * t / 15))
# distant traffic wash through the open window
mix += 0.012 * np.stack([shaped(300, 1800, -0.5, seed=3), shaped(300, 1800, -0.5, seed=4)])

# wind: base breath + gust swells + faint whistle
wind = shaped(220, 1600, -0.6, seed=5)
wamp = 0.012 + 0.11 * gust + 0.006 * (1 + np.sin(2 * np.pi * t / 10 + 1))
w_st = np.stack([wind, np.roll(wind, 900)])
mix += w_st * wamp
whis = shaped(560, 640, 0, order=6, seed=6) + 0.7 * shaped(880, 940, 0, order=6, seed=7)
mix += pan(whis * 0.022 * gust ** 1.6, 0.05)
# snow ticking on glass (very faint, brighter in gusts)
mix += pan(shaped(4500, 9000, 0, seed=8) * (0.0025 + 0.006 * gust), 0.05)

# PC: hum harmonics (60 Hz -> 1800 cycles per loop) + fan noise, tower on the left
hum = 0.016 * np.sin(2 * np.pi * 60 * t) + 0.010 * np.sin(2 * np.pi * 120 * t) + 0.004 * np.sin(2 * np.pi * 180 * t)
fan = 0.010 * shaped(120, 2600, -0.7, seed=9)
mix += pan(hum + fan, -0.55)
# HDD seeks: clicks on LED activity
hdd = np.array(ctl["h"])
clicks = np.zeros(NS)
on_idx = np.nonzero(hdd)[0]
crng = np.random.default_rng(11)
for i in on_idx:
    if i == 0 or hdd[i - 1] == 0 or crng.random() < 0.06:
        s0 = int(i * SR / CTL + crng.integers(0, 40))
        clicks[s0 % NS] += 0.5 + 0.5 * crng.random()
ker_t = np.arange(int(0.006 * SR)) / SR
ker = np.exp(-ker_t / 0.0012) * np.sin(2 * np.pi * 2300 * ker_t) + 0.6 * np.exp(-ker_t / 0.003) * np.sin(2 * np.pi * 380 * ker_t)
clk = np.fft.irfft(np.fft.rfft(clicks) * np.fft.rfft(ker, NS), NS)
mix += pan(clk * 0.05, -0.6)

# sodium lamp buzz outside (120 Hz family), steadier when lit, crackly in flicker
buzz = sum((0.6 ** n) * np.sin(2 * np.pi * 120 * (n + 1) * t + n) for n in range(8))
buzz = lowpass(buzz, 1400)
flick = np.clip(1 - kO, 0, 1)
crack = shaped(1500, 6000, 0, seed=12) * (crng.random(NS) < 0.002) * 6
mix += pan(buzz * (0.006 * kO + 0.03 * flick) + crack * 0.02 * (flick > 0.05), 0.05)

# cars: tyre hiss on slush + engine rumble, panned with car position
for c in ev["cars"]:
    t0, d, dr = c["t"], c["d"], c["dir"]
    pre, post = 1.6, 1.8
    span_e = env_span(t0 - pre, t0 + d + post, 1.2)
    tr = ((t - t0 + pre) % P) - pre          # time relative to the light sweep, wraps the loop
    u = tr / d
    lx = dr * (-13 + 26 * u)
    near = np.exp(-(lx / 6.0) ** 2)
    e = span_e * (0.25 + 0.75 * near)
    k = 0.5 + 0.5 * np.tanh((0.5 - u) * 6)
    hiss = k * shaped(1300, 7500, -0.2, seed=20) + (1 - k) * shaped(500, 3600, -0.4, seed=21)
    rum = shaped(35, 180, -0.5, seed=22)
    sig = 0.13 * hiss * e + 0.08 * rum * e
    p = np.clip(lx / 11.0, -1, 1)
    mix += pan(lowpass(sig, 6000), p)

# snowplow: diesel rumble, blade scrape, panned with the beacon's motion
for q in ev["plow"]:
    t0, d = q["t"], q["d"]
    e = env_span(t0 - 2.2, t0 + d + 2.2, 2.0)
    u = np.clip((((t - t0 + 2.2) % P) - 2.2) / d, 0, 1)
    plx = -7 + 14 * u
    eng = sum((0.7 ** n) * np.sin(2 * np.pi * 31.5 * (n + 1) * t + 0.3 * n) for n in range(6))
    eng = lowpass(eng * (0.8 + 0.2 * np.sin(2 * np.pi * 7.5 * t)), 260)
    grit = (np.random.default_rng(30).random(NS) < 0.004).astype(float)
    grit = np.fft.irfft(np.fft.rfft(grit) * np.fft.rfft(np.exp(-np.arange(400) / 60.0), NS), NS)
    scrape = shaped(420, 2600, -0.3, seed=31) * (0.6 + 0.4 * np.clip(grit, 0, 1.5))
    sig = (0.11 * eng + 0.05 * shaped(25, 120, -0.8, seed=32) + 0.055 * scrape) * e
    mix += pan(lowpass(sig, 4500), np.clip(plx / 7.0, -0.9, 0.9))

# snow clumps landing on the fire escape: soft thud
for j, tl in enumerate(ctl["land"]):
    x = ev["clumps"][j]["x"]
    e = bump(tl + 0.06, 0.05)
    th = lowpass(shaped(40, 400, -0.5, seed=40 + j), 300) * e
    mix += pan(0.16 * th + 0.03 * shaped(2000, 6000, 0, seed=50 + j) * bump(tl + 0.05, 0.03), (x - 0.5) * 0.6)

# master: gentle low shelf trim, normalise to -3 dBFS peak
peak = np.max(np.abs(mix))
mix *= 10 ** (-3 / 20) / peak
rms = np.sqrt(np.mean(mix ** 2))
print(f"audio: peak -3.0 dBFS, rms {20*np.log10(rms):.1f} dBFS")
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(WAV), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

# ---------------------------------------------------------------- video
ff = imageio_ffmpeg.get_ffmpeg_exe()
cmd = [ff, "-y", "-loglevel", "error",
       "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "640x360", "-r", str(FPS), "-i", "-",
       "-i", str(WAV),
       "-vf", "scale=1920:1080:flags=neighbor",
       "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-tune", "animation",
       "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2", "-g", "120",
       "-c:a", "aac", "-b:a", "192k", "-ar", str(SR),
       "-t", str(P), "-movflags", "+faststart", str(OUT)]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
t_start = time.time()
for i in range(P * FPS):
    proc.stdin.write(ctx.eval(f"S.frameRGB({i}/{FPS})").encode("latin-1"))
    if i % 300 == 0:
        print(f"frame {i}/{P*FPS}  {time.time()-t_start:.0f}s", flush=True)
proc.stdin.close()
proc.wait()
print("done:", OUT, proc.returncode)

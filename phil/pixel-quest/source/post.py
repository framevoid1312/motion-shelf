"""CRT post: x6 nearest upscale, scanlines, phosphor glow, slight barrel, vignette. Pure function of the RGB frame."""
import numpy as np
from functools import lru_cache
S = 6
OW, OH = 1920, 1080

@lru_cache(None)
def _maps():
    yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float64)
    nx = (xx + 0.5) / OW * 2 - 1
    ny = (yy + 0.5) / OH * 2 - 1
    k = 0.018
    r2 = nx * nx * (16 / 9) ** 0 + ny * ny
    sx = nx * (1 + k * r2 * 0.6) ; sy = ny * (1 + k * r2)
    px = ((sx + 1) / 2 * OW).astype(np.int64)
    py = ((sy + 1) / 2 * OH).astype(np.int64)
    valid = (px >= 0) & (px < OW) & (py >= 0) & (py < OH)
    px = np.clip(px, 0, OW - 1); py = np.clip(py, 0, OH - 1)
    # scanline profile per source row inside a 6px pixel row
    prof = np.array([0.96, 1.0, 1.0, 1.0, 0.86, 0.62])
    scan = prof[py % S]
    # vignette + rounded-corner bezel
    v = 1 - 0.22 * (nx ** 2 * 0.6 + ny ** 2 * 0.6) ** 1.5
    ex = np.maximum(0, np.abs(sx) - 0.985) ; ey = np.maximum(0, np.abs(sy) - 0.975)
    corner = np.clip(1 - np.hypot(ex * 40, ey * 40), 0, 1)
    mul = (scan * v * corner * valid)[..., None].astype(np.float32)
    return py, px, mul

def _blur_small(a, r):
    # separable box blur x3 (approx gaussian) at internal res
    out = a.astype(np.float32)
    for _ in range(3):
        for ax in (0, 1):
            c = np.cumsum(np.pad(out, [(r + 1, r) if i == ax else (0, 0) for i in range(2)] + [(0, 0)], mode='edge'), axis=ax)
            if ax == 0:
                out = (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)
            else:
                out = (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
    return out

def crt(rgb_small):
    """rgb_small: (180,320,3) uint8 -> (1080,1920,3) uint8"""
    big = rgb_small.repeat(S, 0).repeat(S, 1).astype(np.float32)
    # phosphor glow: bright-pass blurred at internal res, upsampled smoothly
    lum = rgb_small.astype(np.float32)
    bp = np.clip(lum - 150, 0, None) * 1.6
    g = _blur_small(bp, 2)
    gy = np.linspace(0, g.shape[0] - 1, OH); gx = np.linspace(0, g.shape[1] - 1, OW)
    y0 = np.floor(gy).astype(int); x0 = np.floor(gx).astype(int)
    y1 = np.minimum(y0 + 1, g.shape[0] - 1); x1 = np.minimum(x0 + 1, g.shape[1] - 1)
    fy = (gy - y0)[:, None, None]; fx = (gx - x0)[None, :, None]
    gu = (g[y0][:, x0] * (1 - fx) + g[y0][:, x1] * fx) * (1 - fy) + (g[y1][:, x0] * (1 - fx) + g[y1][:, x1] * fx) * fy
    big = big + gu * 0.22
    py, px, mul = _maps()
    out = big[py, px] * mul
    # glow also partially fills the scanline gaps (phosphor bleed), keeps hard pixel edges
    return np.clip(out, 0, 255).astype(np.uint8)

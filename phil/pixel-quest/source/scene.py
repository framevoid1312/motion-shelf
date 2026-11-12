"""PIXEL QUEST — frame(f) -> palette-index image (180x320). Pure function of frame number f (30 fps)."""
import numpy as np
from functools import lru_cache
from assets import *

W, H = 320, 180
GY = 148              # ground top (feet line)
FPS = 30
S16 = 3               # frames per 16th note (150 BPM)
BAR = 48

# ================================================================= cue sheet (frames) — shared with audio.py
CUE = dict(
    power_on=0,
    coins_run=[24, 36],
    jump1=54, bop=72, coins_arc=[80, 84, 88], land1=96,
    stage_steps=[96, 108, 120, 132],             # palette day -> sunset, one swap per beat
    dlg_open=108, dlg_type0=114, dlg_step=3, dlg_close=165,
    coins_chain=[147, 150, 153, 156],
    cam_lock=152, skid=174, stop=180, alert=180, reach=186,
    chest=192, gem_up=(192, 204), logo_drop=200, logo_land=216, subtitle=228,
    shine=240, press=264,
)
DLG_TEXT = "欢迎来到像素世界！"


def stage_at(f):
    s = 0
    for k in CUE['stage_steps']:
        if f >= k:
            s += 1
    return s


# ================================================================= camera / hero kinematics (closed form, integer)
def scroll(f):
    L = CUE['cam_lock']
    if f <= L:
        return 2 * f
    extra = [2, 1, 1, 1]
    return 2 * L + sum(extra[:min(f - L, 4)])


def hero_wx(f):
    s = CUE['skid']
    if f <= s:
        return 2 * f + 100
    extra = [2, 2, 1, 1, 1, 0]
    return 2 * s + 100 + sum(extra[:min(f - s, 6)])


def _arc(t, T, y0, y1, apex):
    """parabola from y0 (t=0) to y1 (t=T) rising 'apex' px above y0. returns float y."""
    # y = y0 - a t + b t^2 ; a^2/(4b) = apex ; y(T)=y1
    import math
    d = y1 - y0
    # solve: b T^2 - a T = d, a^2 = 4 apex b -> a = 2 sqrt(apex b)
    # b T^2 - 2 sqrt(apex) T sqrt(b) - d = 0 ; let u = sqrt(b)
    A, B, Cc = T * T, -2 * math.sqrt(apex) * T, -d
    u = (-B + math.sqrt(B * B - 4 * A * Cc)) / (2 * A)
    b = u * u; a = 2 * math.sqrt(apex * b)
    return y0 - a * t + b * t * t, (-a + 2 * b * t)


SLIME_TOP = GY - 9


def hero_state(f):
    """returns (pose_sprite, feet_y, facing) """
    j1, bop, l1 = CUE['jump1'], CUE['bop'], CUE['land1']
    if j1 - 2 <= f < j1:
        return HERO_CROUCH, GY, 1
    if j1 <= f < bop:
        y, v = _arc(f - j1, bop - j1, GY, SLIME_TOP, 34)
        return (HERO_JUMP if v < 0.6 else HERO_FALL), int(round(y)), 1
    if bop <= f < l1:
        y, v = _arc(f - bop, l1 - bop, SLIME_TOP, GY, 46)
        return (HERO_JUMP if v < 0.6 else HERO_FALL), int(round(y)), 1
    if l1 <= f < l1 + 3:
        return HERO_LAND, GY, 1
    if f < CUE['skid']:
        return HERO_RUN[(f // 3) % 6], GY, 1
    if f < CUE['reach']:
        return HERO_SKID if f < CUE['stop'] + 2 else HERO_RUN[2], GY, 1
    if f < CUE['chest'] + 4:
        return HERO_REACH, GY, 1
    # item-get pose, 2-frame breathing at ~4 fps
    return HERO_GET[((f - CUE['chest']) // 8) % 2], GY, 1


def hero_center(f):
    s, fy, _ = hero_state(f)
    return hero_wx(f), fy - 12


# ================================================================= static layers (cached)
BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 + 1 / 32


@lru_cache(None)
def sky_layer():
    """dithered vertical gradient over 5 bands"""
    y = np.arange(H)[:, None].repeat(W, 1)
    x = np.arange(W)[None, :].repeat(H, 0)
    # band position: nonlinear so horizon bands are thinner/brighter
    top, bot = 0, 132
    v = np.clip((y - top) / (bot - top), 0, 1) ** 1.15 * 4.0
    base = np.floor(v).astype(int)
    frac = v - base
    th = BAYER4[y % 4, x % 4]
    band = np.clip(base + (frac > th), 0, 4)
    # widen transitions: only dither within the middle 70% of each band step, solid otherwise
    return band  # 0..4


def sky_slots(band, ray=None):
    out = SLOT['SKY0'] + band
    if ray is not None:
        out = np.where(ray, SLOT['RAY0'] + band, out)
    return out


def _rng(seed):
    return np.random.default_rng(seed)


@lru_cache(None)
def mountains_layer():
    """far mountains: period 512, returns index image (H x 512) with TRANSP"""
    P = 512
    r = _rng(7)
    peaks = []
    x = 0
    while x < P + 80:
        hgt = r.integers(30, 62)
        hw = r.integers(34, 60)
        peaks.append((x, int(hgt), int(hw)))
        x += r.integers(48, 90)
    base = 126
    img = np.full((H, P), TRANSP, np.int64)
    hmap = np.zeros(P)
    owner = np.zeros(P, int)
    for i, (cx, hgt, hw) in enumerate(peaks):
        for xx in range(cx - hw - 80, cx + hw + 80):
            dx = abs(xx - cx)
            # slightly concave slopes
            hh = hgt * max(0.0, 1 - dx / hw) ** 1.15
            px = xx % P
            if hh > hmap[px]:
                hmap[px] = hh; owner[px] = i
    # jaggedness: +-1 noise on slope
    jag = r.integers(-1, 2, P)
    hmap = np.maximum(0, np.round(hmap + jag * (hmap > 4))).astype(int)
    for xx in range(P):
        h = hmap[xx]
        if h <= 0:
            continue
        cx, hgt, hw = peaks[owner[xx]]
        right = ((xx - cx) % P) < P // 2 and (xx - cx) % P > 0
        lit = right  # sun is on the right
        y0 = base - h
        img[y0:base, xx] = SLOT['MTL'] if lit else SLOT['MTD']
        # ridge crease dither near peak centre
        if abs(((xx - cx + P // 2) % P) - P // 2) <= 1:
            img[y0:base:2, xx] = SLOT['MTD']
        # snow cap on tall peaks
        if hgt > 44 and h > hgt - 16:
            cap = (h - (hgt - 16)) // 2 + 2 + ((xx * 7) % 3)
            img[y0:min(base, y0 + cap), xx] = SLOT['SNOW'] if lit else SLOT['CLOUDS']
    # extend below to horizon of hills
    img[base:base + 30, :] = SLOT['MTD']
    return img


@lru_cache(None)
def hills_layer():
    """rolling hills band between mountains and forest, period 384"""
    P = 384
    x = np.arange(P)
    h = (14 + 6 * np.sin(x / P * 2 * np.pi * 3 + 1.0) + 3 * np.sin(x / P * 2 * np.pi * 7)).round().astype(int)
    img = np.full((H, P), TRANSP, np.int64)
    base = 132
    for xx in range(P):
        y0 = base - h[xx]
        img[y0:H, xx] = SLOT['HILL']
        img[y0, xx] = SLOT['HILLL']
        if (xx % 2 == 0):
            img[y0 + 1, xx] = SLOT['HILLL']
    return img


@lru_cache(None)
def castle_sprite():
    rows = [
        "....f.............f....",
        "....ff............ff...",
        "....f.............f....",
        "...ttt...........ttt...",
        "..t.t.t.........t.t.t..",
        "..ttttt...f.....ttttt..",
        "..tTtwt...ff....tTtwt..",
        "..tTttt..ttt....tTttt..",
        "..tTttt.t.t.t...tTttt..",
        "..tTtwt.ttttt...tTtwt..",
        "..tTttttTtwttttttTttt..",
        "t.tTttttTtttttttttTtt.t",
        "tttTttttTtttttttttTtttt",
        "tTtTttttTttwwtttttTtTtt",
        "tTtTttttTttwwtttttTtTtt",
        "tTtTttttTttwwtttttTtTtt",
    ]
    return spr(rows, dict(t=SLOT['CAST'], T=SLOT['CASTL'], w=SLOT['WIN'], f=8))


@lru_cache(None)
def forest_layer():
    """mid forest of round canopies, period 384"""
    P = 384
    r = _rng(11)
    img = np.full((H, P), TRANSP, np.int64)
    base = 150
    trees = []
    x = 0
    while x < P:
        rad = int(r.integers(9, 16))
        top = int(r.integers(108, 124))
        trees.append((x, top, rad))
        x += int(r.integers(10, 20))
    yy, xx = np.mgrid[0:H, 0:P]
    for (cx, top, rad) in trees:
        cy = top + rad
        for dxw in (-P, 0, P):
            dx = xx - (cx + dxw)
            dy = yy - cy
            d2 = dx * dx + dy * dy
            inside = (d2 <= rad * rad) | ((np.abs(dx) <= rad) & (yy >= cy))
            inside &= yy < base + 2
            if not inside.any():
                continue
            # shading: upper-right lit (sun), lower-left dark, dithered transitions
            lx = (dx * 0.6 - dy * 0.8) / rad   # light dir (up-right)
            th = BAYER4[yy % 4, xx % 4]
            v = lx + (th - 0.5) * 0.55
            col = np.where(v > 0.55, SLOT['TRL'], np.where(v > -0.05, SLOT['TRM'], np.where(v > -0.6, SLOT['TRD'], SLOT['TRDD'])))
            # below canopy centre: darker body
            col = np.where(dy > rad * 0.4, np.where(th > 0.5, SLOT['TRDD'], SLOT['TRD']), col)
            img[inside] = col[inside]
    # canopy outline on top edge (1px darker)  - gives readable silhouettes
    m = img != TRANSP
    edge = m & ~np.roll(m, 1, 0)
    img[edge & (img == SLOT['TRL'])] = SLOT['TRM']
    img[base + 2:, :] = SLOT['TRDD']
    return img


@lru_cache(None)
def ground_tiles():
    """three 16x16 grass-top tile variants + 2 dirt variants"""
    tiles = []
    for v in range(3):
        r = _rng(100 + v)
        t = np.full((16, 16), SLOT['DIL'], np.int64)
        # grass band
        t[0:4, :] = SLOT['GRM']
        t[0, :] = SLOT['GRL']
        for x in range(16):
            if r.random() < 0.35:
                t[1, x] = SLOT['GRL']
            d = 4 + (1 if (x + v) % 5 in (1, 2) else 0) + (1 if (x * 3 + v) % 7 == 0 else 0)
            t[4:d, x] = SLOT['GRD']
            t[d, x] = SLOT['GRD'] if (x % 2) else SLOT['DIM']
        # dirt dither + stones
        for _ in range(7):
            x, y = int(r.integers(0, 16)), int(r.integers(7, 16))
            t[y, x] = SLOT['DIM']
        for _ in range(2):
            sx, sy = int(r.integers(1, 12)), int(r.integers(8, 13))
            t[sy:sy + 2, sx:sx + 3] = SLOT['STONE']
            t[sy, sx] = SLOT['STONEL']
            t[sy + 2, sx + 1:sx + 4] = SLOT['DID']
        tiles.append(t)
    dirt = []
    for v in range(2):
        r = _rng(200 + v)
        t = np.full((16, 16), SLOT['DIM'], np.int64)
        for _ in range(14):
            x, y = int(r.integers(0, 16)), int(r.integers(0, 16))
            t[y, x] = SLOT['DID']
        for _ in range(5):
            x, y = int(r.integers(0, 15)), int(r.integers(0, 16))
            t[y, x:x + 2] = SLOT['DIL']
        sx, sy = int(r.integers(2, 11)), int(r.integers(3, 11))
        t[sy:sy + 2, sx:sx + 3] = SLOT['STONE']; t[sy, sx] = SLOT['STONEL']
        dirt.append(t)
    return tiles, dirt


def _h(i, k=0):
    return (i * 2654435761 + k * 40503) % 4294967296


@lru_cache(None)
def deco_sprites():
    tuft = spr(["g.g", "ggg"], dict(g=SLOT['GRL']))
    flower = spr([".p.", "pyp", ".p.", ".g.", ".g."], dict(p=SLOT['FLWR'], y=SLOT['FLWY'], g=SLOT['GRD']))
    bush = outline(spr(["..mmmm..", ".mllmmm.", "mlllmmmm", "mmmmmmmd", "dmmmmmdd"],
                       dict(m=SLOT['GRM'], l=SLOT['GRL'], d=SLOT['GRD'])), SLOT['SHADOW'])
    sign = outline(spr(["kkkkkkk", "kwkwwkk", "kkkkkkk", "...K...", "...K...", "...K..."],
                       dict(k=4, K=20, w=15)), OUT)
    return tuft, flower, bush, sign


# ================================================================= world objects
def coin_list():
    out = []
    for fc in CUE['coins_run'] + CUE['coins_chain']:
        out.append((fc, hero_wx(fc), GY - 12))
    for fc in CUE['coins_arc']:
        wx, cy = hero_center(fc)
        out.append((fc, wx, cy))
    return out


SLIME_WX = None
CHEST_WX = None


def _consts():
    global SLIME_WX, CHEST_WX
    SLIME_WX = hero_wx(CUE['bop'])
    CHEST_WX = hero_wx(CUE['stop']) + 22


_consts()


# ================================================================= logo
@lru_cache(None)
def logo_letters():
    """returns list of (sprite, x_offset) for 'PIXEL QUEST' + total width + face masks"""
    word = "PIXEL QUEST"
    letters = []
    x = 0
    for ch in word:
        if ch == ' ':
            x += 8
            continue
        g = LOGO_GLYPHS[ch]
        m = np.array([[c == '#' for c in row] for row in g])
        m = m.repeat(2, 0).repeat(2, 1)        # 18 rows
        h, w = m.shape
        # chamfer outer corners by 1px for a bevelled feel
        for (yy, xx) in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
            if m[yy, xx]:
                m[yy, xx] = False
        EX = 3
        img = np.full((h + EX + 2, w + EX + 2), TRANSP, np.int64)
        # extrusion: shifted copies down-right
        for e in range(EX, 0, -1):
            sub = img[1 + e:1 + e + h, 1 + e // 2:1 + e // 2 + w]
            col = 20 if e == EX else 4
            sub[m] = col
        # face with vertical gradient (pixel-stepped bands)
        bands = [7, 23, 23, 10, 10, 10, 10, 10, 9, 9, 9, 9, 9, 25, 25, 25, 24, 24]
        face = img[1:1 + h, 1:1 + w]
        for yy in range(h):
            row = m[yy]
            face[yy][row] = bands[yy]
        # left-edge bevel highlight
        left = m & ~np.roll(m, 1, 1)
        left[:, 0] = m[:, 0]
        face[left & (np.arange(h)[:, None] < 12)] = 23
        img = outline(img[:, :], OUT, pad=1)
        letters.append((img, x, m))
        x += w + 3
    return letters, x - 3


# ================================================================= frame render
def frame(f):
    """returns (idx[H,W], stage, bright)"""
    st = stage_at(f)
    sx = scroll(f)
    img = np.empty((H, W), np.int64)

    # ---- sky + sunburst rays
    band = sky_layer()
    ray = None
    t_burst = f - CUE['chest']
    if t_burst >= 0:
        cx, cy = CHEST_WX - sx, GY - 14
        yy, xx = np.mgrid[0:H, 0:W]
        ang = np.arctan2(yy - cy, xx - cx)
        rad = np.hypot(yy - cy, xx - cx)
        phase = (t_burst // 4) * 0.035                    # stepped rotation
        nr = 18
        ray = (np.floor((ang + phase) / (2 * np.pi) * nr * 2) % 2 == 0)
        reach = min(400, 30 + t_burst * 22)
        ray &= rad < reach
        # outer rays dithered (50%), inner solid
        chk = ((yy + xx) % 2 == 0)
        ray &= (rad < 70) | chk
    img[:] = sky_slots(band, ray)

    # ---- sun (stepped descent)
    sun_pos = [(250, 36), (254, 56), (258, 76), (262, 94), (262, 108)][st]
    yy, xx = np.mgrid[0:H, 0:W]
    d2 = (xx - sun_pos[0]) ** 2 + (yy - sun_pos[1]) ** 2
    R = 13 if st < 4 else 16
    img[d2 <= R * R] = SLOT['SUN']
    rim = (d2 > (R - 3) ** 2) & (d2 <= R * R) & (((xx + yy) % 2) == 0)
    img[rim & (yy > sun_pos[1])] = SLOT['SUNR']
    halo = (d2 > R * R) & (d2 <= (R + 3) ** 2) & ((xx % 2 == 0) & (yy % 2 == 0))
    img[halo] = SLOT['SKY4']
    if st == 4:  # sunset sun gets horizontal cloud-bands through it
        for by in (sun_pos[1] + 4, sun_pos[1] + 8, sun_pos[1] + 11):
            m = (d2 <= R * R) & (yy == by)
            img[m] = SLOT['SKY3']

    # ---- clouds (0.1x + own drift), whole pixels
    for i, (cx0, cy, s) in enumerate([(40, 30, 1.0), (170, 46, 0.7), (300, 22, 0.85), (420, 58, 0.6)]):
        off = (sx // 10 + f // 6 + 0)  # 5 px/s drift
        cx = int((cx0 - off) % 480) - 80
        _cloud(img, cx, cy, s)

    # ---- far mountains (0.25x)
    m = mountains_layer()
    o = (sx // 4) % m.shape[1]
    cols = (np.arange(W) + o) % m.shape[1]
    lay = m[:, cols]
    msk = lay != TRANSP
    img[msk] = lay[msk]
    # castle on far layer (anchored at far-world x)

    # ---- hills (0.375x)
    hl = hills_layer()
    o = (sx * 3 // 8) % hl.shape[1]
    lay = hl[:, (np.arange(W) + o) % hl.shape[1]]
    msk = lay != TRANSP
    img[msk] = lay[msk]
    # castle on the hills layer (destination of the quest)
    c = castle_sprite()
    blit(img, c, 162 - sx * 3 // 8, 113 - c.shape[0] + 1)

    # ---- forest (0.5x)
    fl = forest_layer()
    o = (sx // 2) % fl.shape[1]
    lay = fl[:, (np.arange(W) + o) % fl.shape[1]]
    msk = lay != TRANSP
    img[msk] = lay[msk]

    # ---- ground tiles (1x)
    tiles, dirt = ground_tiles()
    t0 = sx // 16
    for i in range(-1, W // 16 + 2):
        ti = t0 + i
        x = ti * 16 - sx
        blit(img, tiles[_h(ti) % 3], x, GY)
        blit(img, dirt[_h(ti, 1) % 2], x, GY + 16)
    # decorations
    tuft, flower, bush, sign = deco_sprites()
    for k in range(-2, 30):
        wx = k * 37 + (_h(k, 3) % 17)
        x = wx - sx
        if -20 < x < W + 20:
            kind = _h(k, 5) % 5
            if kind in (0, 1):
                blit(img, tuft, x, GY - 2)
            elif kind == 2:
                blit(img, flower, x, GY - 5)
            elif kind == 3:
                blit(img, bush, x, GY - 6)
    # signpost near start
    blit(img, sign, 150 - sx, GY - 9)

    # ---- slime
    sxp = SLIME_WX - sx
    tb = f - CUE['bop']
    if tb < 0:
        s = SLIME_IDLE[(f // 6) % 2]
        blit(img, s, sxp - s.shape[1] // 2, GY - s.shape[0] + 1)
    elif tb < 4:
        s = SLIME_SQUASH
        blit(img, s, sxp - s.shape[1] // 2, GY - s.shape[0] + 1)
    elif tb < 10:
        p = PUFF[(tb - 4) // 2]
        blit(img, p, sxp - p.shape[1] // 2, GY - 8 - p.shape[0] // 2)
    if 4 <= tb < 30:
        t = text3("100", 7)
        t = outline(t, OUT)
        blit(img, t, sxp - t.shape[1] // 2, GY - 20 - (tb - 4) // 2)

    # ---- coins + sparkles
    for (fc, wx, cy) in coin_list():
        x = wx - sx
        if f < fc:
            c = COIN[(f // 3) % 4]
            blit(img, c, x - c.shape[1] // 2, cy - c.shape[0] // 2)
        elif f < fc + 8:
            sp = SPARKLE[(f - fc) // 2]
            blit(img, sp, x - sp.shape[1] // 2, cy - sp.shape[0] // 2 - (f - fc) // 2)

    # ---- chest
    cxp = CHEST_WX - sx
    base = outline(CHEST_BASE, OUT)
    bx, by = cxp - base.shape[1] // 2, GY - base.shape[0] + 1
    tc = f - CUE['chest']
    if tc >= 0:  # inner glow behind lid
        glow = spr(["..wwwwwwwwwwwwww..", ".wyywwwwwwwwwwyyw."], dict(w=7, y=10))
        blit(img, glow, bx + 1, by - 1)
    blit(img, base, bx, by)
    if tc < 0:
        lid = outline(LID_CLOSED, OUT)
        # anticipation: lid rattles on the 16ths before opening
        jig = -1 if (CUE['reach'] <= f < CUE['chest'] and (f // 3) % 2 == 0) else 0
        blit(img, lid, bx, by - lid.shape[0] + 2 + jig)
    elif tc < 2:
        lid = outline(LID_HALF, OUT)
        blit(img, lid, bx, by - lid.shape[0] - 1)
    else:
        lid = outline(LID_OPEN, OUT)
        blit(img, lid, bx, by - lid.shape[0] - 2)

    # ---- hero
    pose, fy, _ = hero_state(f)
    hx = hero_wx(f) - sx
    blit(img, pose, hx - pose.shape[1] // 2, fy - pose.shape[0] + 3)

    # ---- dust: landing + skid
    tl = f - CUE['land1']
    if 0 <= tl < 6:
        d = DUST[tl // 2]
        blit(img, d, hx - 10 - tl, GY - 3)
        blit(img, flip(d), hx + 6 + tl, GY - 3)
    ts = f - CUE['skid']
    if 0 <= ts < 12:
        for k in range(0, ts + 1, 2):
            age = ts - k
            if age < 6:
                d = DUST[age // 2]
                wx = hero_wx(CUE['skid'] + k) - 4
                blit(img, d, wx - sx - 4, GY - 3 - age // 3)

    # ---- alert "!"
    ta = f - CUE['alert']
    if 0 <= ta < 12:
        bub = outline(spr(["wwwww", "wwrww", "wwrww", "wwrww", "wwwww", "wwrww", "wwwww", "..w.."], dict(w=7, r=8)), OUT)
        jump = [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][ta]
        blit(img, bub, hx - 3, fy - 34 - jump)

    # ---- gem rising (stepped, 2-frame holds) and held above head
    tg = f - CUE['chest']
    if tg >= 0:
        g0 = (cxp, by - 6)
        g1 = (hx, fy - 27)
        T = CUE['gem_up'][1] - CUE['gem_up'][0]
        tq = min(T, (tg // 2) * 2)
        u = tq / T
        gx = g0[0] + (g1[0] - g0[0]) * u
        gy = g0[1] + (g1[1] - g0[1]) * u - 18 * 4 * u * (1 - u)
        if tg >= T:
            gy = g1[1] - (1 if ((f - CUE['chest']) // 8) % 2 == 0 else 0) + (((f - CUE['chest']) // 8) % 2)
        blit(img, GEM, int(gx) - GEM.shape[1] // 2, int(gy) - GEM.shape[0] // 2)
        # gem twinkle
        tw = (f // 4) % 6
        if tw < 4 and tg >= T:
            sp = SPARKLE[tw]
            blit(img, sp, int(gx) + 3, int(gy) - 7)

    # ---- chest burst particles (closed form)
    if 0 <= tc < 40:
        r = _rng(42)
        for i in range(22):
            ang = -np.pi / 2 + (r.random() - 0.5) * 2.4
            spd = 2.2 + r.random() * 2.6
            life = 14 + int(r.random() * 22)
            if tc >= life:
                continue
            t = tc
            px = cxp + np.cos(ang) * spd * t
            py = by - 4 + np.sin(ang) * spd * t + 0.11 * t * t
            col = [7, 10, 23, 9][i % 4]
            px, py = int(px), int(py)
            if 0 <= px < W - 1 and 0 <= py < H - 1:
                if (life - t) > 6:
                    img[py, px] = col; img[py, px + 1] = col; img[py + 1, px] = col; img[py + 1, px + 1] = col
                else:
                    img[py, px] = col
    # shock ring
    if 0 <= tc < 8:
        rr = 8 + tc * 14
        d = np.hypot(xx - cxp, yy - (by - 2))
        ring = (d >= rr - 2) & (d < rr)
        img[ring] = 7

    # ---- dialogue box
    _dialog(img, f)

    # ---- logo + subtitle + press start
    _title(img, f)

    # ---- screen shake on logo landing (integer)
    tl = f - CUE['logo_land']
    shake = {0: 2, 1: -1, 2: 1}.get(tl, 0)
    if shake:
        img = np.roll(img, shake, 0)
        if shake > 0:
            img[:shake] = OUT
        else:
            img[shake:] = OUT

    # ---- CRT power-on (frames 0-3)
    bright = 0
    if f == 0:
        img2 = np.full_like(img, 0)
        img2[88:92, :] = 7
        img2[89:91, 40:280] = 7
        img = img2
    elif f == 1:
        img2 = np.full_like(img, 0)
        img2[66:114] = img[66:114]
        img = img2; bright = 2
    elif f == 2:
        bright = 1
    elif f == 3:
        bright = 1
    if tc in (0,):
        bright = 2
    elif tc in (1, 2):
        bright = 1
    return img, st, bright


def _cloud(img, cx, cy, s):
    blobs = [(-14, 2, 7), (-5, -3, 9), (6, -1, 8), (15, 3, 6)]
    ya, yb, xa, xb = max(0, cy - 16), min(H, cy + 10), max(0, cx - 30), min(W, cx + 30)
    if ya >= yb or xa >= xb:
        return
    yy, xx = np.mgrid[ya:yb, xa:xb]
    inside = np.zeros(yy.shape, bool)
    shade = np.zeros(yy.shape, bool)
    for bx, by, r in blobs:
        bx, by, r = int(bx * s), int(by * s), max(3, int(r * s))
        d2 = (xx - cx - bx) ** 2 + (yy - cy - by) ** 2
        inside |= d2 <= r * r
        shade |= (d2 <= r * r) & (yy - cy - by > r * 0.25)
    inside &= yy <= cy + int(5 * s)
    shade = (shade | (yy >= cy + int(3 * s))) & inside
    th = BAYER4[yy % 4, xx % 4]
    sub = img[yy[0, 0]:yy[-1, 0] + 1, xx[0, 0]:xx[0, -1] + 1]
    col = np.where(shade, np.where(th > 0.35, SLOT['CLOUDS'], SLOT['CLOUD']), SLOT['CLOUD'])
    bottom = inside & ~np.roll(inside, -1, 0)
    col = np.where(bottom, SLOT['CLOUDD'], col)
    sub[inside] = col[inside]


DLG = dict(x=82, y=14, w=156, h=30)


def _dialog(img, f):
    t0, tc = CUE['dlg_open'], CUE['dlg_close']
    if f < t0 or f >= tc + 3:
        return
    x, y, w, h = DLG['x'], DLG['y'], DLG['w'], DLG['h']
    if f < t0 + 3:
        hh = [2, 12, h][f - t0]
    elif f >= tc:
        hh = [h, 12, 2][f - tc]
    else:
        hh = h
    yc = y + h // 2
    y0, y1 = yc - hh // 2, yc - hh // 2 + hh
    img[y0:y1, x:x + w] = 17
    if hh > 4:
        # double border, rounded corners
        img[y0, x + 1:x + w - 1] = 7; img[y1 - 1, x + 1:x + w - 1] = 7
        img[y0 + 1:y1 - 1, x] = 7; img[y0 + 1:y1 - 1, x + w - 1] = 7
        img[y0 + 2, x + 2:x + w - 2] = 13; img[y1 - 3, x + 2:x + w - 2] = 13
        img[y0 + 2:y1 - 2, x + 2] = 13; img[y0 + 2:y1 - 2, x + w - 3] = 13
        for (cy, cx) in [(y0, x), (y0, x + w - 1), (y1 - 1, x), (y1 - 1, x + w - 1)]:
            img[cy, cx] = TRANSP_FILL(img, cy, cx)
        # drop shadow
        img[y1, x + 2:x + w + 1] = SLOT['SKY0']
        img[y0 + 2:y1 + 1, x + w] = SLOT['SKY0']
    else:
        img[y0:y1, x:x + w] = 7
    if t0 + 3 <= f < tc:
        n = 0 if f < CUE['dlg_type0'] else min(len(DLG_TEXT), (f - CUE['dlg_type0']) // CUE['dlg_step'] + 1)
        if n:
            line_spr, gl, adv, l = _dlg_text()
            # reveal glyph by glyph
            wv = min(line_spr.shape[1], n * adv - l)
            blit(img, line_spr[:, :wv], x + 10, y + (h - line_spr.shape[0]) // 2)
        if n == len(DLG_TEXT) and f > CUE['dlg_type0'] + CUE['dlg_step'] * len(DLG_TEXT) + 1:
            if (f // 6) % 2 == 0:
                tri = spr(["#####", ".###.", "..#.."], {'#': 10})
                blit(img, tri, x + w - 13, y + h - 9)


def TRANSP_FILL(img, cy, cx):
    # corners show the sky band behind (approximate with SKY0/1)
    return SLOT['SKY0']


@lru_cache(None)
def _dlg_text():
    return cjk_line(DLG_TEXT, 13, "Regular", 7, advance=14)


@lru_cache(None)
def _subtitle():
    s, gl, adv, l = cjk_line("像素冒险", 16, "Bold", 7, advance=19)
    return outline(s, OUT)


LOGO_Y = 22


def _title(img, f):
    letters, tw = logo_letters()
    x0 = (W - tw) // 2
    td = f - CUE['logo_drop']
    if td >= 0:
        for i, (spr_, lx, m) in enumerate(letters):
            ti = td - i                  # 1-frame stagger
            if ti < 0:
                continue
            # stepped fall: position updated every 2 frames, gravity; land then 2px bounce
            T = CUE['logo_land'] - CUE['logo_drop'] - 4
            tq = (ti // 2) * 2
            if tq < T:
                u = tq / T
                y = int(-40 + (LOGO_Y + 40) * u * u)
            else:
                k = ti - T
                y = LOGO_Y - [0, 0, 3, 3, 2, 1, 0][k] if k < 7 else LOGO_Y
            blit(img, spr_, x0 + lx, y)
            # shine sweep: diagonal band across faces
            ts = f - CUE['shine']
            if 0 <= ts < 14:
                hh, ww = m.shape
                yy, xx = np.mgrid[0:hh, 0:ww]
                pos = (x0 + lx + xx) + yy - (-30 + ts * 22)
                band = (pos >= 0) & (pos < 5) & m
                band2 = (pos >= 7) & (pos < 9) & m
                sub = img[y + 2:y + 2 + hh, x0 + lx + 1:x0 + lx + 1 + ww]
                sub[band[:sub.shape[0], :sub.shape[1]]] = 7
                sub[band2[:sub.shape[0], :sub.shape[1]]] = 23
    # subtitle stamp
    tsub = f - CUE['subtitle']
    if tsub >= 0:
        s = _subtitle()
        sx_ = (W - s.shape[1]) // 2
        sy_ = LOGO_Y + 30
        if tsub < 2:
            s2 = np.where(s != TRANSP, 10, TRANSP)
            blit(img, s2, sx_, sy_ - 1)
        else:
            sh = np.where(s != TRANSP, SLOT['SKY0'], TRANSP)
            blit(img, sh, sx_ + 1, sy_ + 1)
            blit(img, s, sx_, sy_)
        # ornaments slide in (stepped)
        k = min(4, tsub // 2)
        orn = spr(["..#..", ".###.", "##w##", ".###.", "..#.."], {'#': 10, 'w': 7})
        orn = outline(orn, OUT)
        oy = sy_ + s.shape[0] // 2 - 3
        for side in (-1, 1):
            ox = (sx_ - 14 - (4 - k) * 6) if side < 0 else (sx_ + s.shape[1] + 7 + (4 - k) * 6)
            blit(img, orn, ox, oy)
            # rule lines
            if k == 4:
                if side < 0:
                    img[oy + 3, ox - 26:ox - 2:2] = 10
                else:
                    img[oy + 3, ox + 9:ox + 33:2] = 10
    # press start (blinks on quarter notes)
    tp = f - CUE['press']
    if tp >= 0 and (tp // 12) % 2 == 0:
        t = text5("PRESS START", 7)
        t = outline(t, OUT)
        blit(img, t, (W - t.shape[1]) // 2, 160)

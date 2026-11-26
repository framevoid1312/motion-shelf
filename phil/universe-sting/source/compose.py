"""Compose clone frames: black bg + 3D object plate + mark (plain ring placeholder) + wordmark/year roll.
compose.frame(n, plate_dir) -> RGB uint8 (1080x1920)."""
import json, math, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(HERE, "tracks.json")))
MK = {int(k): v for k, v in json.load(open(os.path.join(HERE, "mark_track.json"))).items()}
W, H = 1920, 1080
CUT = 71   # first frame of the wordmark (hard cut)

def mark_layer(n, ss=2):
    d = MK[n][2]; R = d / 2 * ss; r = R * 0.63           # measured diameter; ring thickness 0.37 r
    S = W * ss, H * ss
    yy, xx = np.mgrid[0:H * ss, 0:W * ss].astype(np.float32)
    cx, cy = 960 * ss, 540 * ss
    dist = np.hypot(xx - cx, yy - cy)
    a = np.clip(R - dist + 0.5, 0, 1) * np.clip(dist - r + 0.5, 0, 1)
    # conic gradient that rotates and whitens (measured: colour f0-12, white sweeps in f12-48)
    ang = (np.degrees(np.arctan2(yy - cy, xx - cx)) + 360 - n * 6.0) % 360
    stops = [(0, (64, 81, 210)), (70, (40, 170, 200)), (140, (45, 200, 120)), (200, (170, 40, 176)), (280, (107, 49, 205)), (360, (64, 81, 210))]
    col = np.zeros((H * ss, W * ss, 3), np.float32)
    for (a0, c0), (a1, c1) in zip(stops, stops[1:]):
        m = (ang >= a0) & (ang < a1); u = ((ang - a0) / (a1 - a0))[m][:, None]
        col[m] = np.array(c0) * (1 - u) + np.array(c1) * u
    wt = min(1, max(0, (n - 10) / 38.0)); wt = wt * wt * (3 - 2 * wt)
    # white arrives as a soft sweep from the left side, like the reference
    sweep = np.clip((wt * 2.2 - 0.6) + (cx - xx) / (2 * R) * 1.2, 0, 1) if wt < 1 else 1.0
    col = col * (1 - sweep if np.ndim(sweep) else 0)[..., None] if np.ndim(sweep) else np.full_like(col, 255)
    if np.ndim(sweep): col = col + 255 * sweep[..., None]
    rgba = np.dstack([col, a * 255]).astype(np.float32)
    return cv2.resize(rgba, (W, H), interpolation=cv2.INTER_AREA)

def over(base, rgba):
    a = rgba[..., 3:4] / 255.0
    return base * (1 - a) + rgba[..., :3] * a

_plates = {}
def plate(n, d):
    p = os.path.join(d, "p%03d.png" % n)
    if not os.path.exists(p): return None
    im = Image.open(p).convert("RGBA")
    if im.size != (W, H): im = im.resize((W, H), Image.LANCZOS)
    return np.asarray(im).astype(np.float32)

ID_DIR = os.path.join(HERE, "idpass")
_CM = None
def colour_match(p, n):
    """Per-object colour LUTs fitted against the reference at f57 (colormatch.py), applied via the object-ID pass."""
    global _CM
    import colormatch
    if _CM is None:
        d = json.load(open(os.path.join(HERE, "color_luts.json"))); _CM = (d["ids"], d["luts"])
    idp = os.path.join(ID_DIR, "p%03d.png" % n)
    if not os.path.exists(idp): return p
    ids, luts = _CM
    lab = colormatch.id_map(idp, ids, (W, H))
    p = p.copy(); p[..., :3] = colormatch.apply(p[..., :3], p[..., 3], lab, ids, luts)
    return p

def frame(n, plate_dir, text=None):
    img = np.zeros((H, W, 3), np.float32)
    if n < CUT:
        if n >= 1:
            p = plate(n, plate_dir)
            if p is not None:
                p = colour_match(p, n)
                img = over(img, p)
        img = over(img, mark_layer(n))
    else:
        img = (text or text_frame)(n)
    return np.clip(img, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- wordmark + year roll (f71-147), measured
FONTS = "/home/claude/aefx/dist/fonts/"
TS = {int(k): v for k, v in json.load(open(os.path.join(HERE, "text_scale.json"))).items()}   # lockup scale per frame (measured)
GREY = (141, 144, 152)
P_PITCH = 90          # strip pitch (px at 1x) - best SSD fit
TOPY, CAPH, MIDY = 500, 80, 540
# per-half roll offsets in digits (measured by strip template matching every 2nd frame, outliers removed)
ROLL = {
 (0, 0): [(71, 0), (73, .13), (75, .21), (79, .45), (81, .55), (83, .61), (85, .66), (87, .70), (89, .74), (91, .77), (93, .80),
          (95, .83), (97, .85), (99, .87), (101, .91), (103, .93), (105, .95), (107, .97), (111, .99), (115, 1.0)],
 (0, 1): [(71, 0), (73, .23), (75, .34), (79, .50), (81, .57), (83, .60), (85, .67), (87, .71), (89, .76), (91, .78), (93, .81),
          (95, .86), (97, .88), (99, .90), (101, .94), (103, .96), (105, .97), (107, .99), (111, 1.0)],
 (1, 0): [(71, .0), (73, .99), (75, 1.6), (77, 2.11), (79, 2.54), (81, 2.91), (83, 3.13), (85, 3.4), (87, 3.68), (89, 3.86), (91, 4.0),
          (93, 4.17), (95, 4.31), (97, 4.43), (99, 4.53), (101, 4.66), (103, 4.73), (105, 4.80), (107, 4.85), (109, 4.93), (111, 4.98),
          (113, 5.01), (115, 5.03), (117, 5.07), (119, 5.09), (121, 5.11), (123, 5.12)],
 (1, 1): [(71, .0), (73, 1.02), (75, 1.64), (77, 2.17), (79, 2.58), (81, 3.0), (83, 3.23), (85, 3.45), (87, 3.67), (89, 3.88), (91, 4.03),
          (93, 4.21), (95, 4.34), (97, 4.47), (99, 4.58), (101, 4.66), (103, 4.74), (105, 4.82), (107, 4.89), (109, 4.96), (111, 4.99),
          (113, 5.02), (115, 5.06), (117, 5.09), (119, 5.11), (121, 5.12), (123, 5.13)]}
# Year counter 89 -> 26, counting every year (1989 ... 2026 = 37 steps), odometer style.
# Ones digit runs through all 37 years; tens digit carries when the ones wrap 9 -> 0 (89->90, 99->00, 09->10, 19->20).
# Timing per half = the reference's measured roll curve (cell 2, 5 steps), stretched to 37 steps; end drift kept as measured.
YEARS = 37
CELLS = [(1101.5, "89012"), (1170.0, "9" + "0123456789" * 3 + "01234567")]
COUNT_START, COUNT_END = 71, 118      # cubic ease-out: ~2.4 years/frame at the start, the last 7 years tick ~4 frames each
def year_v(hi, n):
    lead = (0.7 * min(1.0, max(0.0, n - COUNT_START) / 3.0)) if hi == 1 else 0.0           # bottom half leads ~0.7 frame (measured), from rest
    u = min(max((n + lead - COUNT_START) / (COUNT_END - COUNT_START), 0.0), 1.0)
    return YEARS * (1 - (1 - u) ** 3) + max(0.0, _lerp_keys(ROLL[(1, hi)], n) - 5.0)                   # + the reference's end drift
def cell_p(ci, hi, n):
    v = year_v(hi, n)
    if ci == 1: return v
    return sum(min(max(v - c, 0.0), 1.0) for c in (0, 10, 20, 30))

def _lerp_keys(K, n):
    if n <= K[0][0]: return K[0][1]
    for (a, va), (b, vb) in zip(K, K[1:]):
        if a <= n <= b: return va + (vb - va) * (n - a) / (b - a)
    return K[-1][1]

_TXT = {}
def _text_assets(ss):
    if ss in _TXT: return _TXT[ss]
    fw = ImageFont.truetype(FONTS + "FVGroteskCondensed-Black.ttf", 104 * ss)
    fd = ImageFont.truetype(os.path.join(HERE, "fonts", "FVMonaYear-Regular.ttf"), 110 * ss)   # Mona Sans var: wdth 125, wght 480 (stroke/width fit to f112)
    bb = fw.getbbox("UNIVERSE"); word = Image.new("L", (bb[2] - bb[0] + 8 * ss, bb[3] - bb[1] + 8 * ss), 0)
    ImageDraw.Draw(word).text((4 * ss - bb[0], 4 * ss - bb[1]), "UNIVERSE", font=fw, fill=255)
    capw = fw.getbbox("N")[1]; word_off = (4 * ss - bb[0], 4 * ss + (bb[1] - capw) * 0 - (capw - bb[1]))
    word = np.asarray(word).astype(np.float32) / 255
    word = cv2.dilate(word, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * ss + 1, 2 * ss + 1)))   # ref strokes ~1 px heavier per side
    word = cv2.resize(word, (int(round(349 * ss * word.shape[1] / (bb[2] - bb[0]))), word.shape[0]), interpolation=cv2.INTER_AREA)
    cap2 = fd.getbbox("2")[1]
    strips = []
    for cx, D in CELLS:
        Wc = 110 * ss; Hs = (len(D) + 2) * P_PITCH * ss + CAPH * ss
        st = np.zeros((Hs, Wc), np.float32)
        for k, ch in enumerate(D):
            gb = fd.getbbox(ch); g = Image.new("L", (gb[2] - gb[0] + 4 * ss, gb[3] - gb[1] + 4 * ss), 0)
            ImageDraw.Draw(g).text((2 * ss - gb[0], 2 * ss - gb[1]), ch, font=fd, fill=255)
            a = np.asarray(g).astype(np.float32) / 255; y = P_PITCH * ss + k * P_PITCH * ss + (gb[1] - cap2) - 2 * ss; x = int(round(Wc / 2 - a.shape[1] / 2))
            st[y:y + a.shape[0], x:x + a.shape[1]] = np.maximum(st[y:y + a.shape[0], x:x + a.shape[1]], a)
        strips.append(st)
    _TXT[ss] = (word, bb, fw.getbbox("U")[1], strips)
    return _TXT[ss]

def text_frame(n, ss=2):
    word, bb, capU, strips = _text_assets(ss)
    Wd, Hd = W * ss, H * ss
    lay = np.zeros((Hd, Wd, 3), np.float32)          # lockup at 100% in a 2x canvas, scaled about the centre afterwards
    # word: left edge 718, cap top 500 (measured f112)
    y0 = TOPY * ss - (capU - bb[1]) - 4 * ss + 2 * ss; x0 = 717 * ss - 4 * ss
    h, w = word.shape; lay[y0:y0 + h, x0:x0 + w] = np.maximum(lay[y0:y0 + h, x0:x0 + w], word[..., None] * 255)
    for ci, (cx, D) in enumerate(CELLS):
        st = strips[ci]; Wc = st.shape[1]; xL = int(round(cx * ss - Wc / 2))
        for hi, (ya, yb) in enumerate(((TOPY, MIDY), (MIDY, TOPY + CAPH + 2))):
            acc = None                               # motion blur: 180-degree trailing shutter, samples ~ every 2 px of travel
            disp = abs(cell_p(ci, hi, n) - cell_p(ci, hi, n - 0.5)) * P_PITCH * ss
            NS = int(min(64, max(1, disp / 2 + 1)))
            for k in range(NS):
                p = cell_p(ci, hi, n - 0.5 + 0.5 * (k + 1) / NS)
                off = int(round(p * P_PITCH * ss))
                piece = st[P_PITCH * ss + off + (ya - TOPY) * ss: P_PITCH * ss + off + (yb - TOPY) * ss]
                acc = piece.copy() if acc is None else acc + piece
            sl = acc / NS
            reg = lay[ya * ss: ya * ss + sl.shape[0], xL:xL + Wc]
            reg[:] = np.maximum(reg, sl[..., None] * np.array(GREY, np.float32))
    s = TS.get(n, 1.0)
    M = np.array([[s, 0, Wd / 2 * (1 - s)], [0, s, Hd / 2 * (1 - s)]], np.float32)
    lay = cv2.warpAffine(lay, M, (Wd, Hd), flags=cv2.INTER_LINEAR)
    return cv2.resize(lay, (W, H), interpolation=cv2.INTER_AREA)

# ---------------------------------------------------------------- film grain (measured on the reference f57:
# high-pass residual ~1.3-1.7 levels on mid-tones, ~1.5 px clumps, partly chromatic, new every frame, clean blacks)
GRAIN_AMP = 2.2   # matches the reference residual after H.264 (1.3-1.6 levels)
def grain(img, n, amp=GRAIN_AMP):
    rng = np.random.default_rng(1000 + n)
    h, w = img.shape[:2]
    mono = rng.standard_normal((h, w)).astype(np.float32)
    chro = rng.standard_normal((h, w, 3)).astype(np.float32)
    g = mono[..., None] * 0.8 + chro * 0.45
    g = cv2.GaussianBlur(g, (0, 0), 0.75)
    g /= g.std()
    f = img.astype(np.float32)
    lum = f @ np.array([0.299, 0.587, 0.114], np.float32)
    m = np.clip((lum - 6) / 60.0, 0, 1)[..., None]          # no grain on the black background
    return np.clip(f + g * amp * m, 0, 255).astype(np.uint8)

"""PIXEL QUEST — palette, sprites and fonts, all authored in code.
Everything here is pure data / pure functions; no randomness except seeded."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------- palette
# 32-colour PICO-8 style master palette (0-15 + extended 16-31)
MASTER_HEX = [
    "000000", "1D2B53", "7E2553", "008751", "AB5236", "5F574F", "C2C3C7", "FFF1E8",
    "FF004D", "FFA300", "FFEC27", "00E436", "29ADFF", "83769C", "FF77A8", "FFCCAA",
    "291814", "111D35", "422136", "125359", "742F29", "49333B", "A28879", "F3EF7D",
    "BE1250", "FF6C24", "A8E72E", "00B543", "065AB5", "754665", "FF6E59", "FF9D81",
]
MASTER = np.array([[int(h[i:i + 2], 16) for i in (0, 2, 4)] for h in MASTER_HEX], np.uint8)


def _nearest(rgb, exclude=None):
    d = ((MASTER.astype(int) - np.array(rgb)[None]) ** 2).sum(1)
    if exclude is not None:
        d[exclude] = 1 << 30
    return int(d.argmin())


# brighten table: blend 55% toward white, snap back into the master palette (NES-style fade)
# hue-preserving one-step-brighter ramps (hand-authored, like an NES palette fade)
BRIGHT = np.array([1, 13, 14, 11, 9, 13, 7, 7, 14, 10, 7, 26, 7, 6, 15, 7,
                   20, 1, 2, 3, 4, 29, 15, 7, 8, 9, 23, 11, 12, 13, 31, 15])

# ---- semantic background slots (32+) : 5 stepped stages day -> sunset
SLOT = {}
_SLOT_TABLE = [
    # name      day  s1  s2  s3  sunset
    ("SKY0",   (28, 28, 1, 1, 18)),
    ("SKY1",   (12, 12, 28, 29, 2)),
    ("SKY2",   (12, 12, 13, 14, 30)),
    ("SKY3",   (6, 15, 31, 30, 25)),
    ("SKY4",   (7, 7, 15, 31, 9)),
    ("RAY0",   (12, 12, 13, 2, 2)),     # lit version of each sky band (sunburst rays)
    ("RAY1",   (12, 12, 14, 14, 30)),
    ("RAY2",   (6, 6, 31, 30, 25)),
    ("RAY3",   (7, 7, 15, 31, 9)),
    ("RAY4",   (7, 7, 7, 15, 10)),
    ("SUN",    (7, 7, 23, 10, 10)),
    ("SUNR",   (15, 15, 10, 9, 9)),
    ("CLOUD",  (7, 7, 15, 31, 31)),
    ("CLOUDS", (6, 6, 31, 14, 14)),
    ("CLOUDD", (13, 13, 13, 29, 2)),
    ("MTL",    (13, 13, 13, 29, 2)),
    ("MTD",    (29, 29, 29, 21, 18)),
    ("SNOW",   (7, 7, 15, 31, 14)),
    ("CAST",   (29, 29, 21, 18, 18)),
    ("CASTL",  (13, 13, 29, 2, 29)),
    ("WIN",    (1, 1, 17, 9, 10)),
    ("HILL",   (27, 27, 3, 19, 21)),
    ("HILLL",  (26, 26, 27, 4, 4)),
    ("TRL",    (11, 11, 26, 9, 25)),
    ("TRM",    (27, 27, 27, 3, 29)),
    ("TRD",    (3, 3, 3, 19, 21)),
    ("TRDD",   (19, 19, 19, 1, 18)),
    ("TRUNK",  (4, 4, 20, 20, 16)),
    ("GRL",    (11, 11, 26, 9, 9)),
    ("GRM",    (27, 27, 27, 3, 3)),
    ("GRD",    (3, 3, 3, 19, 19)),
    ("DIL",    (4, 4, 4, 20, 20)),
    ("DIM",    (20, 20, 20, 16, 16)),
    ("DID",    (16, 16, 16, 16, 17)),
    ("STONE",  (22, 22, 22, 5, 21)),
    ("STONEL", (6, 6, 15, 22, 22)),
    ("FLWR",   (14, 14, 14, 30, 30)),
    ("FLWY",   (10, 10, 10, 10, 9)),
    ("SHADOW", (19, 19, 19, 1, 18)),
]
for i, (n, _) in enumerate(_SLOT_TABLE):
    SLOT[n] = 32 + i
NSLOT = 32 + len(_SLOT_TABLE)
STAGE_MAP = np.zeros((5, NSLOT), np.int64)
for s in range(5):
    STAGE_MAP[s, :32] = np.arange(32)
    for i, (n, cols) in enumerate(_SLOT_TABLE):
        STAGE_MAP[s, 32 + i] = cols[s]
TRANSP = -1


def palette_rgb(stage, bright=0):
    m = STAGE_MAP[stage].copy()
    for _ in range(bright):
        m = BRIGHT[m]
    return MASTER[m]


# ---------------------------------------------------------------- sprite helpers
def spr(rows, cmap):
    h = len(rows); w = max(len(r) for r in rows)
    a = np.full((h, w), TRANSP, np.int64)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c in cmap:
                a[y, x] = cmap[c]
    return a


def outline(a, col, pad=1, diag=False):
    h, w = a.shape
    b = np.full((h + 2 * pad, w + 2 * pad), TRANSP, np.int64)
    b[pad:pad + h, pad:pad + w] = a
    m = b != TRANSP
    n = np.zeros_like(m)
    n[1:, :] |= m[:-1, :]; n[:-1, :] |= m[1:, :]; n[:, 1:] |= m[:, :-1]; n[:, :-1] |= m[:, 1:]
    if diag:
        n[1:, 1:] |= m[:-1, :-1]; n[:-1, :-1] |= m[1:, 1:]; n[1:, :-1] |= m[:-1, 1:]; n[:-1, 1:] |= m[1:, :-1]
    b[n & ~m] = col
    return b


def flip(a):
    return a[:, ::-1].copy()


def line(a, x0, y0, x1, y1, col, thick=1):
    """Bresenham line into array a (in place)."""
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    while True:
        for tx in range(thick):
            for ty in range(thick):
                yy, xx = y0 + ty, x0 + tx
                if 0 <= yy < a.shape[0] and 0 <= xx < a.shape[1]:
                    a[yy, xx] = col
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy; x0 += sx
        if e2 <= dx:
            err += dx; y0 += sy


def blit(dst, s, x, y):
    """Paste sprite s (TRANSP = skip) at integer x,y."""
    x, y = int(x), int(y)
    h, w = s.shape
    H, W = dst.shape
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, W), min(y + h, H)
    if x0 >= x1 or y0 >= y1:
        return
    sub = s[y0 - y:y1 - y, x0 - x:x1 - x]
    m = sub != TRANSP
    dst[y0:y1, x0:x1][m] = sub[m]


# ---------------------------------------------------------------- hero
# master colours used by sprites
OUT = 17
C = dict(o=OUT, r=8, R=24, w=7, s=15, S=31, e=17, p=14, h=4, H=20, b=12, B=28, y=10, Y=9, k=4, K=20, g=16, d=1)

HEAD_R = [  # facing right, 14 wide
    "....rrrrr.....",
    "...rrrwrrrr...",
    "..rrrrrrrrrr..",
    "..RRRRRRRRRRRR",
    "..hhssssssss..",
    "..hhssssseSs..",
    "..hsssssseSs..",
    "..hhsssspsss..",
    "...hsssssss...",
]
HEAD_F = [  # facing camera
    "....rrrrrr....",
    "...rrrwrrrr...",
    "..rrrrrrrrrr..",
    "..RRRRRRRRRR..",
    "..hsssssssh...",
    "..hseSsseSsh..",
    "..hseSsseSsh..",
    "..hpssssssph..",
    "...ssssssss...",
]
HEAD_F = [r[:14].ljust(14, '.') for r in HEAD_F]
TORSO = [  # 14 wide, scarf at top
    "...yyyyyyy....",
    "....bbbbbb....",
    "....bbbbbb....",
    "....BKKYKB....",
    "....bbbbbb....",
]


def _base(w=20, h=24):
    return np.full((h, w), TRANSP, np.int64)


def _limb(a, hip, knee, foot, col, footcol, boot=True):
    line(a, hip[0], hip[1], knee[0], knee[1], col, 2)
    line(a, knee[0], knee[1], foot[0], foot[1], col, 2)
    if boot:
        fx, fy = foot
        for xx in range(fx - 0, fx + 3):
            for yy in (fy, fy + 1):
                if 0 <= yy < a.shape[0] and 0 <= xx < a.shape[1]:
                    a[yy, xx] = footcol


def hero_pose(legF, legB, armF, armB, bob=0, head="R", scarf=0, lean=0):
    """Compose a hero frame on a 20x24 canvas (feet baseline at row 22).
    legX = (knee(dx,dy), foot(dx,dy)) relative to hip; armX = hand (dx,dy) relative to shoulder."""
    a = _base()
    ox = 3 + lean
    top = 1 + bob
    hip = (ox + 6, top + 14)
    sh_ = (ox + 6, top + 10)
    # back limbs (darker)
    k, f = legB
    _limb(a, (hip[0] - 1, hip[1]), (hip[0] - 1 + k[0], hip[1] + k[1]), (hip[0] - 1 + f[0], hip[1] + f[1]), 28, 16)
    line(a, sh_[0] - 1, sh_[1], sh_[0] - 1 + armB[0], sh_[1] + armB[1], 28, 2)
    a[min(23, sh_[1] + armB[1] + 1), max(0, sh_[0] + armB[0] - 1)] = 31
    # torso + head
    t = spr(TORSO, C)
    blit(a, t, ox, top + 9)
    hd = spr(HEAD_R if head == "R" else HEAD_F, C)
    blit(a, hd, ox, top)
    # scarf tail (flapping, 2 frames)
    sy = top + 9
    tails = [[(ox + 2, sy), (ox + 1, sy), (ox, sy + 1), (ox - 1, sy + 1)],
             [(ox + 2, sy), (ox + 1, sy + 1), (ox, sy + 1), (ox - 1, sy + 2)]]
    if head == "R":
        for (xx, yy) in tails[scarf % 2]:
            if 0 <= xx < 20:
                a[yy, xx] = 10 if xx > ox else 9
    # front limbs
    k, f = legF
    _limb(a, (hip[0] + 1, hip[1]), (hip[0] + 1 + k[0], hip[1] + k[1]), (hip[0] + 1 + f[0], hip[1] + f[1]), 12, 4)
    line(a, sh_[0] + 1, sh_[1], sh_[0] + 1 + armF[0], sh_[1] + armF[1], 12, 2)
    hx, hy = sh_[0] + 1 + armF[0], sh_[1] + armF[1]
    for xx in (hx, hx + 1):
        if 0 <= hy + 1 < 24 and 0 <= xx < 20:
            a[hy + 1, xx] = 15
    return outline(a, OUT)  # 22 x 26, feet at row 23


# 6-frame run cycle (10 fps)
RUN_POSES = [
    # legF knee,foot          legB knee,foot       armF      armB     bob scarf
    (((2, 3), (4, 6)),   ((-2, 3), (-4, 5)),   (-3, 3), (3, 2), 0, 0),
    (((1, 3), (0, 6)),   ((-2, 2), (-5, 3)),   (-2, 3), (2, 3), 1, 1),
    (((2, 2), (0, 5)),   ((1, 3), (-1, 6)),    (0, 4), (0, 4), -1, 0),
    (((-2, 3), (-4, 5)), ((2, 3), (4, 6)),     (3, 2), (-3, 3), 0, 1),
    (((-2, 2), (-5, 3)), ((1, 3), (0, 6)),     (2, 3), (-2, 3), 1, 0),
    (((1, 3), (-1, 6)),  ((2, 2), (0, 5)),     (0, 4), (0, 4), -1, 1),
]
HERO_RUN = [hero_pose(p[0], p[1], p[2], p[3], bob=p[4], scarf=p[5]) for p in RUN_POSES]
HERO_CROUCH = hero_pose(((3, 1), (1, 4)), ((-2, 1), (-1, 4)), (-3, 1), (2, 2), bob=3)
HERO_JUMP = hero_pose(((3, 1), (2, 4)), ((-1, 3), (-4, 4)), (2, -4), (-3, 1), bob=-1, scarf=1)
HERO_FALL = hero_pose(((2, 3), (3, 6)), ((-2, 2), (-3, 5)), (4, -1), (-3, -2), bob=0)
HERO_LAND = hero_pose(((3, 1), (3, 4)), ((-3, 1), (-3, 4)), (3, 1), (-3, 1), bob=3)
HERO_SKID = hero_pose(((4, 2), (6, 4)), ((-1, 3), (-1, 6)), (-4, 1), (-3, -1), bob=1, lean=-2, scarf=1)
HERO_REACH = hero_pose(((2, 2), (2, 5)), ((-2, 3), (-2, 6)), (4, 2), (3, 2), bob=1)
_GET_TOP = [
    ".ss............ss.",
    ".bb....rrrr....bb.",
    ".bb..rrrrwrrr..bb.",
    ".bb.rrrrrrrrrr.bb.",
    ".bb.RRRRRRRRRR.bb.",
    ".bb.hssssssssh.bb.",
    ".bb.hsessssesh.bb.",
    ".bb.hsessssesh.bb.",
    ".bb.hpssRRssph.bb.",
    "..bb.ssssssss.bb..",
    "...bbyyyyyyyybb...",
    "....bbbbbbbbbb....",
    ".....bbbbbbbb.....",
    ".....bKKYYKKb.....",
    ".....bbbbbbbb.....",
]
_GET_LEG = [
    ".....BBB..BBB.....",
    ".....BBB..BBB.....",
    ".....BBB..BBB.....",
    "....kkkk..kkkk....",
    "....kkkk..kkkk....",
]


def _get_pose(bob):
    a = np.full((26, 22), TRANSP, np.int64)
    top = spr(_GET_TOP, C); leg = spr(_GET_LEG, C)
    blit(a, leg, 2, 23 - 1 - 4 + 0 - 0)          # feet rows end at 22
    blit(a, top, 2, 22 - 4 - 15 + bob)
    o = outline(a[1:-1, 1:-1], OUT)
    return o


HERO_GET = [_get_pose(b) for b in (0, 1)]

# ---------------------------------------------------------------- coin (spin 4 frames)
_COIN = [
    [".yyyy.", "yYyyyy", "yYywyy", "yYywyy", "yYyyyy", "yYyyyy", "yYYYyy", ".yyyy."],
    ["..yy..", ".yYyy.", ".yYwy.", ".yYwy.", ".yYyy.", ".yYyy.", ".yYYy.", "..yy.."],
    ["..y...", "..y...", "..w...", "..w...", "..y...", "..y...", "..Y...", "..y..."],
    ["..yy..", ".yyYy.", ".ywYy.", ".ywYy.", ".yyYy.", ".yyYy.", ".yYYy.", "..yy.."],
]
COIN = [outline(spr(r, dict(y=10, Y=9, w=7)), 4) for r in _COIN]

SPARKLE = [
    outline(spr(["...", ".w.", "..."], dict(w=7)), 10),
    spr([".....", "..w..", ".wyw.", "..w..", "....."], dict(w=7, y=10)),
    spr(["...w...", "...w...", "..wyw..", "wwyyyww", "..wyw..", "...w...", "...w..."], dict(w=7, y=10)),
    spr(["w.....w", ".......", "...y...", "..y.y..", "...y...", ".......", "w.....w"], dict(w=7, y=10)),
]

# ---------------------------------------------------------------- slime
_SL = dict(m=14, M=2, w=7, e=17, D=24)
SLIME_IDLE = [outline(spr(r, _SL), OUT) for r in (
    ["....mmmmm....", "..mmmmmmmmm..", ".mwwmmmmmmmm.", ".mwmmmememmm.", "mmmmmmememmmm", "mmmmmmmmmmmmm", "MmmmmmmmmmmmM", ".MMMMMMMMMMM."],
    [".....mmm.....", "...mmmmmmm...", "..mwwmmmmmm..", ".mwmmmmemmem.", ".mmmmmmemmem.", "mmmmmmmmmmmmm", "MmmmmmmmmmmmM", ".MMMMMMMMMMM."],
)]
SLIME_SQUASH = outline(spr(["...mmmmmmmmm...", ".mwwmmmmmmmmmm.", "mmmmmmeemmeemmm", "MMmmmmmmmmmmmMM"], _SL), OUT)
PUFF = [
    outline(spr(["..ww..", ".wwww.", "wwwwww", ".wwww."], dict(w=7)), 6),
    outline(spr([".w..w.", "w.ww.w", ".wwww.", "w.ww.w", ".w..w."], dict(w=7)), 6),
    spr(["w....w", "......", "..w...", "....w.", "w....w"], dict(w=6)),
]
DUST = [
    spr([".ww.", "wwww", ".ww."], dict(w=6)),
    spr(["w..w", ".ww.", "w..w"], dict(w=6)),
    spr(["w...", "...w", ".w.."], dict(w=22)),
]

# ---------------------------------------------------------------- chest
_CH = dict(k=4, K=20, g=16, y=10, Y=9, w=7, d=17, l=23)
CHEST_BASE = spr([
    "kkkkkkkkkkkkkkkkkk",
    "YYYYYYYYyyYYYYYYYY",
    "kkkkkkkYyyYkkkkkkk",
    "kKkkkkkYwyYkkkkKkk",
    "kKkkkkkYyyYkkkkKkk",
    "kKkkkkkkYYkkkkkKkk",
    "kKkkkkkkkkkkkkkKkk",
    "KKKKKKKKKKKKKKKKKK",
    "YYYYYYYYYYYYYYYYYY",
], _CH)
LID_CLOSED = spr([
    "..kkkkkkkkkkkkkk..",
    ".kllkkkkkkkkkkkkk.",
    "kkkkkkkkkkkkkkkkkk",
    "YyyyYYYYYYYYYYYYYY",
    "KKKKKKKKKKKKKKKKKK",
], _CH)
LID_HALF = spr([
    "..kkkkkkkkkkkkkk..",
    "kllkkkkkkkkkkkkkkk",
    "YYYYYYYYYYYYYYYYYY",
], _CH)
LID_OPEN = spr([  # lid flipped back, seen from inside
    "..KKKKKKKKKKKKKK..",
    ".KggggggggggggggK.",
    "KgggggggggggggggKK",
    "YYYYYYYYYYYYYYYYYY",
], _CH)

GEM = outline(spr([
    "..cwc..",
    ".cwwcC.",
    "cwwccCC",
    "cwcccCC",
    ".cccCC.",
    "..cCC..",
    "...C...",
], dict(c=12, w=7, C=28)), OUT)

# ---------------------------------------------------------------- small latin font (5x7) for UI
_F5 = {
    'P': ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    'R': ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    'E': ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    'S': [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    'T': ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    'A': [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    '1': ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
    '0': [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    ' ': ["...", "...", "...", "...", "...", "...", "..."],
}
_F3 = {
    '1': [".#", "##", ".#", ".#", ".#"],
    '0': ["###", "#.#", "#.#", "#.#", "###"],
}


def text5(s, col, spacing=1, font=_F5):
    gl = [spr(font[ch], {'#': col}) for ch in s]
    h = max(g.shape[0] for g in gl)
    w = sum(g.shape[1] for g in gl) + spacing * (len(gl) - 1)
    a = np.full((h, w), TRANSP, np.int64)
    x = 0
    for g in gl:
        blit(a, g, x, 0); x += g.shape[1] + spacing
    return a


def text3(s, col):
    return text5(s, col, 1, _F3)


# ---------------------------------------------------------------- CJK pixel glyphs (rasterised 1-bit, no AA)
_CJK_PATH = "/usr/share/fonts/opentype/noto/NotoSansCJK-%s.ttc"


def cjk_glyph(ch, size, weight="Regular", cell=None):
    f = ImageFont.truetype(_CJK_PATH % weight, size, index=2)  # index 2 = SC
    cell = cell or size
    im = Image.new("1", (cell + 4, cell + 6), 0)
    d = ImageDraw.Draw(im); d.fontmode = "1"
    d.text((2, 0), ch, font=f, fill=1)
    a = np.array(im)
    return a


def cjk_line(text, size, weight, col, advance=None):
    """Monospaced CJK pixel text, returns sprite (glyph bits = col)."""
    gl = [cjk_glyph(c, size, weight) for c in text]
    adv = advance or size + 1
    rows = np.vstack([g.any(1) for g in gl]).any(0)
    y0, y1 = np.argmax(rows), len(rows) - np.argmax(rows[::-1])
    w = adv * (len(gl) - 1) + gl[-1].shape[1]
    a = np.full((y1 - y0, w), TRANSP, np.int64)
    glyph_sprites = []
    for i, g in enumerate(gl):
        sub = g[y0:y1]
        s = np.where(sub, col, TRANSP)
        glyph_sprites.append(s)
        blit(a, s, i * adv, 0)
    # trim left/right
    cols = (a != TRANSP).any(0)
    l = np.argmax(cols)
    return a[:, l:], [gs[:, :] for gs in glyph_sprites], adv, l


# ---------------------------------------------------------------- logo font (9-row chunky, x2 scaled shape)
LOGO_GLYPHS = {
    'P': ["#######.", "########", "###..###", "###..###", "########", "#######.", "###.....", "###.....", "###....."],
    'I': ["###", "###", "###", "###", "###", "###", "###", "###", "###"],
    'X': ["###..###", "###..###", ".######.", "..####..", "..####..", ".######.", "###..###", "###..###", "###..###"],
    'E': ["#######", "#######", "###....", "######.", "######.", "###....", "###....", "#######", "#######"],
    'L': ["###....", "###....", "###....", "###....", "###....", "###....", "###....", "#######", "#######"],
    'Q': [".######..", "########.", "###..###.", "###..###.", "###..###.", "###.####.", "###..###.", "#########", ".#####.##"],
    'U': ["###..###", "###..###", "###..###", "###..###", "###..###", "###..###", "###..###", "########", ".######."],
    'S': [".#######", "########", "###.....", "#######.", ".#######", ".....###", ".....###", "########", "#######."],
    'T': ["#########", "#########", "...###...", "...###...", "...###...", "...###...", "...###...", "...###...", "...###..."],
}

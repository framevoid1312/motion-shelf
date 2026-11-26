"""Per-object colour matching: per-channel quantile LUTs (clone -> reference) fitted at f57 from object masks."""
import json, numpy as np, cv2
ROOT = '/home/claude/mc_sting/'
SKIP = {"ring", "shield", "flower", "bone", "duck", "clover", "coral_halves"}   # built from measured materials directly          # the ring's angular gradient is built directly in its material
REFGROUP = {"halfdome": ["halfdome_blue", "halfdome_pair"], "bone": ["bone_orbcube"], "orbcube": ["bone_orbcube"]}

def id_map(id_png, ids, size=(1920, 1080)):
    im = cv2.imread(id_png, cv2.IMREAD_UNCHANGED); r = im[..., 2].astype(int); a = im[..., 3]
    vals = sorted(json.load(open(ROOT + 'idvals.json')))
    lab = np.full(r.shape, -1, int)
    for i, v in enumerate(vals): lab[(np.abs(r - v) <= 3) & (a > 128)] = i
    lab = cv2.resize(lab.astype(np.float32), size, interpolation=cv2.INTER_NEAREST).astype(int)
    # spread labels into antialiased fringe pixels (nearest label)
    m = (lab >= 0).astype(np.uint8); grow = lab.copy()
    for _ in range(3):
        d = cv2.dilate(np.where(grow >= 0, grow + 1, 0).astype(np.uint8), np.ones((3, 3), np.uint8)) - 1
        grow = np.where(grow >= 0, grow, d)
    return grow

def fit(ref_png, plate_png, id_png, ids):
    names = json.load(open(ROOT + 'names.json')); L57 = np.load(ROOT + 'labels57.npy')
    ref = cv2.cvtColor(cv2.imread(ref_png), cv2.COLOR_BGR2RGB).astype(np.float32)
    pl = cv2.imread(plate_png, cv2.IMREAD_UNCHANGED); pl = cv2.resize(pl, (1920, 1080), interpolation=cv2.INTER_LINEAR)
    rgb = cv2.cvtColor(pl[..., :3], cv2.COLOR_BGR2RGB).astype(np.float32); al = pl[..., 3]
    lab = id_map(id_png, ids)
    coral = (ref[..., 0] > 140) & (ref[..., 1] < 150) & (ref[..., 0] > ref[..., 2] * 0.8)
    coral = cv2.morphologyEx(coral.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8)) > 0
    luts = {}
    for i, nm in enumerate(ids):
        grp = REFGROUP.get(nm, [nm]); rm = np.isin(L57, [names.index(g) + 1 for g in grp if g in names])
        if nm == "bone": rm &= coral
        if nm == "orbcube": rm &= ~coral
        rm = cv2.erode(rm.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        cm = (lab == i) & (al > 250); cm = cv2.erode(cm.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        if rm.sum() < 500 or cm.sum() < 500: continue
        lut = np.zeros((3, 256), np.float32); q = np.linspace(0, 1, 101)
        for ch in range(3):
            cq = np.quantile(rgb[..., ch][cm], q); rq = np.quantile(ref[..., ch][rm], q)
            cq = np.maximum.accumulate(cq + np.arange(101) * 1e-3)       # strictly increasing
            lut[ch] = np.interp(np.arange(256), cq, rq)
            lut[ch] = np.convolve(np.pad(lut[ch], 6, mode='edge'), np.ones(13) / 13, mode='valid')
        luts[nm] = lut.tolist()
    return luts

def apply(rgb, alpha, lab, ids, luts, amount=1.0):
    out = rgb.astype(np.float32).copy()
    for i, nm in enumerate(ids):
        if nm not in luts or nm in SKIP: continue
        m = lab == i
        if not m.any(): continue
        L = np.array(luts[nm], np.float32); px = np.clip(rgb[m], 0, 255).astype(np.uint8)
        mapped = np.stack([L[c][px[:, c]] for c in range(3)], 1)
        out[m] = px * (1 - amount) + mapped * amount
    return out

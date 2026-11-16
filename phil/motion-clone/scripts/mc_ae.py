#!/usr/bin/env python3
"""mc_ae.py WORKDIR [--name Rebuild] [--fonts-dir DIR]
Export WORKDIR/rebuild/project.json to an After Effects ExtendScript that builds
the comp (shape + text layers, nulls for groups, keyframes with eases/holds),
imports the reference into a REFERENCE|REBUILD compare comp, and saves an .aep.
Output: WORKDIR/ae/<name>.jsx (+ reference.mp4, fonts/)."""
import argparse, json, math, re, shutil, subprocess
from pathlib import Path
from fontTools.ttLib import TTFont

# --- font table: browser style -> AE candidates [(postscript, hscale%)] -------
def ae_font(st):
    fam = st.get('fontFamily', 'Arial').strip("'\""); w = int(st.get('fontWeight', '400'))
    it = st.get('fontStyle') == 'italic'
    m = re.search(r"'wdth'\s*([\d.]+)", st.get('fontVariationSettings', '')); wd = float(m.group(1)) if m else 100
    W = {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'}[w]
    if fam == 'Archivo':
        hs = round(wd)
        wname = {62: 'ExtraCondensed', 75: 'Condensed', 125: 'Expanded'}.get(round(wd), '')
        sty = W + ('Italic' if it else '') if not (it and W == 'Regular') else 'Italic'
        c = []
        if wname: c.append((f'Archivo{wname}-{sty}', 100))
        c += [(f'Archivo-{sty}', hs), (f"Archivo{'Italic' if it else 'Roman'}-{W}", hs)]
        return c
    # last entry = the PostScript name of the bundled file (used when AE can't check installed fonts)
    simple = {'Archivo Black': ['ArchivoBlack-Regular'], 'Pinyon Script': ['PinyonScript-Regular'], 'Anton': ['Anton-Regular'],
              'Bungee': ['Bungee-Regular'], 'UnifrakturMaguntia': ['UnifrakturMaguntia-Book', 'UnifrakturMaguntia'], 'Silkscreen': ['Silkscreen-Regular']}
    if fam in simple: return [(n, 100) for n in simple[fam]]
    if fam == 'Space Mono': return [('SpaceMono-Bold' if w >= 700 else 'SpaceMono-Regular', 100)]
    if fam == 'Doto': return [('Doto-Regular', 100), (f'Doto-{W}', 100)]
    if fam in ('Inter', 'Inter Display'): return [(f"{fam.replace(' ', '')}-{W}", 100), (f'Inter-{W}', 100)]
    return [(fam.replace(' ', '') + '-' + W, 100), (fam.replace(' ', ''), 100)]

FONTFILES = {'Archivo': ['Archivo[wdth,wght].ttf', 'Archivo-Italic[wdth,wght].ttf'], 'Archivo Black': ['ArchivoBlack-Regular.ttf'],
             'Pinyon Script': ['PinyonScript-Regular.ttf'], 'Anton': ['Anton-Regular.ttf'], 'Bungee': ['Bungee-Regular.ttf'],
             'UnifrakturMaguntia': ['UnifrakturMaguntia-Book.ttf'], 'Silkscreen': ['Silkscreen-Regular.ttf'],
             'Space Mono': ['SpaceMono-Regular.ttf', 'SpaceMono-Bold.ttf'], 'Doto': ['Doto[ROND,wght].ttf']}
_met = {}
def metrics(fam, fonts_dir):
    """hhea ascent/descent in em, as Chromium uses for line boxes."""
    if fam in _met: return _met[fam]
    f = None
    if fam in FONTFILES and (fonts_dir / FONTFILES[fam][0]).exists(): f = fonts_dir / FONTFILES[fam][0]
    else:
        try: f = Path(subprocess.check_output(['fc-match', '-f', '%{file}', fam]).decode())
        except Exception: pass
    a, d = 0.9, 0.22
    if f and f.exists():
        t = TTFont(f, lazy=True); u = t['head'].unitsPerEm; h = t['hhea']
        a, d = h.ascent / u, -h.descent / u
    _met[fam] = (a, d); return a, d

def px(v, default=0.0):
    if v is None: return default
    m = re.match(r'\s*(-?[\d.]+)', str(v)); return float(m.group(1)) if m else default
def color(v):
    v = str(v or '').strip()
    m = re.fullmatch(r'#([0-9a-fA-F]{6})', v)
    if m: h = m.group(1); return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    m = re.fullmatch(r'#([0-9a-fA-F]{3})', v)
    if m: return [int(c * 2, 16) / 255 for c in m.group(1)]
    m = re.match(r'rgba?\(([^)]*)\)', v)
    if m: p = [float(x) for x in m.group(1).split(',')[:3]]; return [x / 255 for x in p]
    return None
def border(st):
    b = st.get('border')
    if not b: return None
    m = re.match(r'\s*([\d.]+)px\s+\w+\s+(#[0-9a-fA-F]{3,6}|rgba?\([^)]*\))', b)
    return (float(m.group(1)), color(m.group(2))) if m else None

def interp(fr, t, k, d):
    a = fr[0]; b = fr[0]
    for f in fr:
        if f['t'] <= t: a = b = f
        else: b = f; break
    if b['t'] == a['t']: q = 0
    else: q = max(0, min(1, (t - a['t']) / (b['t'] - a['t'])))
    E = {'linear': lambda q: q, 'out': lambda q: 1 - (1 - q) ** 3, 'in': lambda q: q ** 3, 'step': lambda q: 0 if q < 1 else 1,
         'inout': lambda q: 4 * q ** 3 if q < .5 else 1 - (-2 * q + 2) ** 3 / 2, 'smooth': lambda q: q * q * (3 - 2 * q)}
    q = E.get(a.get('ease', 'linear'), E['linear'])(q)
    x, y = a.get(k, d), b.get(k, d); return x + (y - x) * q

def build(work, name, fonts_dir):
    W = Path(work); P = json.loads((W / 'rebuild/project.json').read_text())
    out = []
    for l in P['layers']:
        st = l.get('style', {}); fr = l['frames']; kind = l['kind']
        o = dict(id=l['id'], kind=kind, parent=l.get('parent') or '', s=round(l['start'], 4), e=round(min(l['end'], P['duration'] + 1), 4))
        base = fr[0]
        def keys(xw, yh, dx=0, dy=0):
            return [[f['t'], f['x'] + dx, f['y'] + dy, xw(f), yh(f), f.get('opacity', 1) * 100 * px(st.get('opacity'), 1), f.get('rotation', 0), f.get('ease', 'linear')] for f in fr]
        rel = (lambda f: f['w'] / base['w'] * 100, lambda f: f['h'] / base['h'] * 100)
        if kind == 'group':
            o['k'] = keys(*rel)
        elif kind in ('rect', 'ellipse', 'path'):
            bg = st.get('background') or st.get('backgroundColor') or st.get('fill')
            o['fill'] = None if (not bg or bg == 'transparent' or 'gradient' in str(bg)) else color(bg)
            if 'gradient' in str(bg):  # first colour stop as a flat fallback
                m = re.search(r'#[0-9a-fA-F]{6}', bg); o['fill'] = color(m.group(0)) if m else None
            bd = border(st)
            if kind == 'path' and st.get('stroke'): bd = (px(st.get('strokeWidth'), 1), color(st['stroke']))
            o['stroke'] = bd
            o['radius'] = px(st.get('borderRadius'), 0)
            if kind == 'path':
                pts = []
                for sub in re.findall(r'M([^MZz]*)[Zz]?', l.get('path', '')):
                    nums = [float(v) for v in re.findall(r'-?[\d.]+', sub)]
                    pts.append([[nums[i] * base['w'] / 100, nums[i + 1] * base['h'] / 100] for i in range(0, len(nums) - 1, 2)])
                o['paths'] = pts
                o['k'] = keys(*rel)
            else:
                o['k'] = keys(lambda f: f['w'], lambda f: f['h'])
        elif kind == 'text':
            size = px(st.get('fontSize'), 16); lh = px(st.get('lineHeight'), size * 1.2)
            fam = st.get('fontFamily', 'Arial').strip("'\"")
            a, d = metrics(fam, fonts_dir)
            base_dy = (lh - (a + d) * size) / 2 + a * size   # line-box top -> first baseline
            o.update(font=ae_font(st), size=size, lead=lh, col=color(st.get('color')) or [0, 0, 0],
                     track=px(st.get('letterSpacing'), 0) / size * 1000 if size else 0,
                     just='center' if st.get('textAlign') == 'center' else 'left', w=base['w'])
            # resolve reveal + held texts into one list of (t, string)
            times = sorted({l['start']} | {f['t'] for f in fr} | {t for t, _ in l.get('texts', [])})
            seq = []
            for t in times:
                s = l['text']
                for tt, ss in l.get('texts', []):
                    if tt <= t + 1e-6: s = ss
                    else: break
                r = interp(fr, t, 'reveal', 1)
                s = s if r >= 1 else s[:int(math.floor(len(s) * r + 1e-4))]
                s = s.replace('\n', '\r')
                if not seq or seq[-1][1] != s: seq.append([round(t, 4), s])
            o['txt'] = seq
            dx = base['w'] / 2 if o['just'] == 'center' else 0
            o['k'] = keys(lambda f: 100, lambda f: 100, dx, base_dy)
        out.append(o)
    return dict(title=P['title'], name=name, width=P['width'], height=P['height'], fps=P['fps'], duration=P['duration'],
                bg=color(P.get('background')) or [0, 0, 0], layers=out)

JSX = r'''// Built by the motion-clone skill. Run in After Effects: File > Scripts > Run Script File...
// Creates the rebuild comp, a REFERENCE | REBUILD compare comp, and saves __NAME__.aep next to this file.
(function () {
var D = __DATA__;
var root = File($.fileName).parent;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
var fontOK = {};
function pickFont(cands) {
    var hasAPI = (typeof app.fonts !== 'undefined') && app.fonts && app.fonts.getFontsByPostScriptName;
    for (var i = 0; i < cands.length; i++) {
        var n = cands[i][0];
        if (fontOK[n] === undefined) {
            if (hasAPI) { try { fontOK[n] = app.fonts.getFontsByPostScriptName(n).length > 0; } catch (e) { fontOK[n] = false; } }
            else fontOK[n] = null;
        }
        if (fontOK[n] === true) return cands[i];
    }
    return cands[cands.length > 1 ? cands.length - 1 : 0];
}
function setKeys(prop, vals, eases) {
    if (vals.length === 1) { prop.setValue(vals[0][1]); return; }
    for (var i = 0; i < vals.length; i++) prop.setValueAtTime(vals[i][0], vals[i][1]);
    var vt = prop.propertyValueType, dims = 1;
    if (vt === PropertyValueType.TwoD) dims = 2; else if (vt === PropertyValueType.ThreeD) dims = 3;
    for (var k = 1; k <= prop.numKeys; k++) {
        var e = eases[k - 1] || 'linear';
        if (e === 'step') { prop.setInterpolationTypeAtKey(k, prop.keyInInterpolationType(k), KeyframeInterpolationType.HOLD); continue; }
        if (e === 'linear') { prop.setInterpolationTypeAtKey(k, prop.keyInInterpolationType(k), KeyframeInterpolationType.LINEAR); continue; }
        if (k >= prop.numKeys) continue;
        var outInf = (e === 'out') ? 85 : (e === 'in' ? 10 : 50), inInf = (e === 'out') ? 10 : (e === 'in' ? 85 : 50);
        var eo = [], ei = [];
        for (var d = 0; d < dims; d++) { eo.push(new KeyframeEase(0, outInf)); ei.push(new KeyframeEase(0, inInf)); }
        prop.setInterpolationTypeAtKey(k, prop.keyInInterpolationType(k), KeyframeInterpolationType.BEZIER);
        prop.setInterpolationTypeAtKey(k + 1, KeyframeInterpolationType.BEZIER, prop.keyOutInterpolationType(k + 1));
        try { prop.setTemporalEaseAtKey(k, prop.keyInTemporalEase(k), eo); prop.setTemporalEaseAtKey(k + 1, ei, prop.keyOutTemporalEase(k + 1)); } catch (err) {}
    }
}
function transform(layer, L, kind) {
    var tr = layer.property('ADBE Transform Group');
    tr.property('ADBE Anchor Point').setValue([0, 0]);
    var K = L.k, pos = [], sc = [], op = [], rot = [], ez = [];
    var hs = L.hs || 100;
    for (var i = 0; i < K.length; i++) {
        pos.push([K[i][0], [K[i][1], K[i][2]]]); ez.push(K[i][7]);
        sc.push([K[i][0], kind === 'scale' ? [K[i][3] * hs / 100, K[i][4]] : [hs, 100]]);
        op.push([K[i][0], clamp(K[i][5], 0, 100)]); rot.push([K[i][0], K[i][6]]);
    }
    function same(a) { for (var i = 1; i < a.length; i++) if (String(a[i][1]) !== String(a[0][1])) return false; return true; }
    function reduce(a) { return same(a) ? [a[0]] : a; }
    setKeys(tr.property('ADBE Position'), reduce(pos), ez);
    setKeys(tr.property('ADBE Scale'), reduce(sc), ez);
    setKeys(tr.property('ADBE Opacity'), reduce(op), ez);
    setKeys(tr.property('ADBE Rotate Z'), reduce(rot), ez);
}
function timing(layer, L) {
    var s = clamp(L.s, 0, D.duration), e = clamp(L.e, s + 1 / D.fps, D.duration);
    layer.outPoint = D.duration; layer.inPoint = s; layer.outPoint = e;
}
function vecGroup(layer) { return layer.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group').property('ADBE Vectors Group'); }
function paint(g, L) {
    if (L.stroke) { var s = g.addProperty('ADBE Vector Graphic - Stroke'); s.property('ADBE Vector Stroke Color').setValue(L.stroke[1] || [0, 0, 0]); s.property('ADBE Vector Stroke Width').setValue(L.stroke[0]); }
    if (L.fill) { var f = g.addProperty('ADBE Vector Graphic - Fill'); f.property('ADBE Vector Fill Color').setValue(L.fill); }
}
function build(comp) {
    var byId = {};
    for (var i = 0; i < D.layers.length; i++) {
        var L = D.layers[i], layer;
        if (L.kind === 'group') {
            layer = comp.layers.addNull(); layer.name = L.id;
            layer.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([0, 0]);
        } else if (L.kind === 'text') {
            layer = comp.layers.addText(L.txt[0][1] || ' ');
            var f = pickFont(L.font); L.hs = f[1];
            var st = layer.property('ADBE Text Properties').property('ADBE Text Document');
            for (var j = 0; j < L.txt.length; j++) {
                var doc = st.value; doc.text = L.txt[j][1] || ' ';
                doc.font = f[0]; doc.fontSize = L.size; doc.applyFill = true; doc.fillColor = L.col; doc.applyStroke = false;
                doc.tracking = L.track;
                doc.justification = L.just === 'center' ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY;
                try { doc.autoLeading = false; doc.leading = L.lead; } catch (e) {}
                if (L.txt.length === 1) st.setValue(doc); else st.setValueAtTime(L.txt[j][0], doc);
            }
            if (L.txt.length > 1) for (var k = 1; k <= st.numKeys; k++) st.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
            layer.name = L.id;
        } else {
            layer = comp.layers.addShape(); layer.name = L.id;
            var g = vecGroup(layer);
            if (L.kind === 'path') {
                for (var p = 0; p < L.paths.length; p++) {
                    var sh = new Shape(); sh.vertices = L.paths[p]; sh.closed = true;
                    g.addProperty('ADBE Vector Shape - Group').property('ADBE Vector Shape').setValue(sh);
                }
            } else {
                var r = g.addProperty(L.kind === 'ellipse' ? 'ADBE Vector Shape - Ellipse' : 'ADBE Vector Shape - Rect');
                var szp = r.property(L.kind === 'ellipse' ? 'ADBE Vector Ellipse Size' : 'ADBE Vector Rect Size');
                var psp = r.property(L.kind === 'ellipse' ? 'ADBE Vector Ellipse Position' : 'ADBE Vector Rect Position');
                var sv = [], pv = [], ez = [];
                for (var q = 0; q < L.k.length; q++) { sv.push([L.k[q][0], [Math.max(0.01, L.k[q][3]), Math.max(0.01, L.k[q][4])]]); pv.push([L.k[q][0], [L.k[q][3] / 2, L.k[q][4] / 2]]); ez.push(L.k[q][7]); }
                var moving = false; for (var q2 = 1; q2 < sv.length; q2++) if (String(sv[q2][1]) !== String(sv[0][1])) moving = true;
                setKeys(szp, moving ? sv : [sv[0]], ez); setKeys(psp, moving ? pv : [pv[0]], ez);
                if (L.radius && L.kind !== 'ellipse') r.property('ADBE Vector Rect Roundness').setValue(L.radius);
            }
            paint(g, L);
        }
        if (L.parent && byId[L.parent]) layer.parent = byId[L.parent];
        transform(layer, L, (L.kind === 'group' || L.kind === 'path') ? 'scale' : 'fixed');
        timing(layer, L);
        if (L.kind === 'group') layer.enabled = false;
        byId[L.id] = layer;
    }
}
app.beginUndoGroup('Motion Clone build');
var proj = app.project || app.newProject();
var comp = proj.items.addComp(D.name, D.width, D.height, 1, D.duration, D.fps);
comp.bgColor = D.bg;
var bgl = comp.layers.addSolid(D.bg, 'background', D.width, D.height, 1, D.duration);
build(comp);
bgl.moveToEnd();
var refFile = new File(root.fsName + '/reference.mp4');
if (refFile.exists) {
    var ref = proj.importFile(new ImportOptions(refFile));
    var cmp = proj.items.addComp(D.name + ' - REFERENCE vs REBUILD', D.width * 2, D.height, 1, D.duration, D.fps);
    var a = cmp.layers.add(ref); a.property('ADBE Transform Group').property('ADBE Position').setValue([D.width / 2, D.height / 2]);
    var b = cmp.layers.add(comp); b.property('ADBE Transform Group').property('ADBE Position').setValue([D.width * 1.5, D.height / 2]);
    var g1 = comp.layers.add(ref); g1.guideLayer = true; g1.enabled = false; g1.name = 'REFERENCE (guide, off)'; g1.moveToEnd();
}
app.endUndoGroup();
try { proj.save(new File(root.fsName + '/__NAME__.aep')); } catch (e) {}
alert('Built "' + D.name + '" (' + D.layers.length + ' layers). Missing fonts? Install the files in the fonts folder and re-run.');
})();
'''

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('work'); ap.add_argument('--name', default='Rebuild')
    ap.add_argument('--fonts-dir', default=str(Path.home() / '.fonts')); a = ap.parse_args()
    W = Path(a.work); out = W / 'ae'; out.mkdir(exist_ok=True)
    fd = Path(a.fonts_dir)
    data = build(W, a.name, fd)
    js = json.dumps(data, ensure_ascii=True, separators=(',', ':'))
    (out / f'{a.name}.jsx').write_text(JSX.replace('__DATA__', js).replace('__NAME__', a.name))
    shutil.copy2(W / 'source.mp4', out / 'reference.mp4')
    (out / 'fonts').mkdir(exist_ok=True)
    used = {re.sub(r"['\"]", '', l['style'].get('fontFamily', '')) for l in json.loads((W / 'rebuild/project.json').read_text())['layers'] if l['kind'] == 'text'}
    for fam in used:
        for f in FONTFILES.get(fam, []):
            if (fd / f).exists(): shutil.copy2(fd / f, out / 'fonts' / f)
    print(f'{len(data["layers"])} layers -> {out / (a.name + ".jsx")}; fonts: {sorted(used)}')

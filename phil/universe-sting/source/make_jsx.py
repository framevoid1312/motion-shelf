#!/usr/bin/env python3
"""Generate ae/Universe_sting_clone.jsx: builds the clone as an editable After Effects project.
Measured data (mark size, lockup scale, digit roll offsets) is embedded per frame."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import compose

FPS, N = 30, 148
mark_d = [compose.MK[n][2] for n in range(0, 71)]
scale = [round(compose.TS.get(n, 1.0) * 100, 3) for n in range(71, N)]
roll = {}
for ci in range(2):
    for hi in range(2):
        roll["%d_%d" % (ci, hi)] = [round(compose.cell_p(ci, hi, n), 4) for n in range(71, N)]
cells_js = json.dumps([{"x": cx, "digits": list(D)} for cx, D in compose.CELLS], separators=(",", ":"))

def js(v): return json.dumps(v, separators=(",", ":"))
A3 = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "ae3d", "anim.json")))["objects"]
S3 = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "spec.json")))
order = sorted(A3, key=lambda n: -S3[n].get("depth", 0))      # far (positive depth) first = bottom of the stack

src = r"""// Universe_sting_clone.jsx - builds the GitHub Universe '23 sting clone (private study) in After Effects.
// Run: File > Scripts > Run Script File... Keep this file next to the models/, fonts/ and reference/ folders.
// Needs After Effects 24.1+ (3D model import + Advanced 3D renderer).
// Install fonts/ first: FVGroteskCondensed-Black.ttf (word) and FVMonaYear-Regular.ttf (year digits).
// UNTESTED in real After Effects: dry-run only against a strict mock of the AE object model.
(function () {
var FPS = 30, N = 148, CUT = 71, W = 1920, H = 1080;
var MARK_D = __MARK__;          // measured outer diameter of the mark, frames 0-70 (px)
var SCALE = __SCALE__;          // measured lockup scale %, frames 71-147
var ROLL = __ROLL__;            // measured roll offset in digits per half: "cell_half" -> frames 71-147
var CELLS = __CELLS__;   // year counter 89 -> 26, every year (odometer)
var PITCH = 90, TOP = 500, MID = 540, BASE = 580, GREY = [141 / 255, 144 / 255, 152 / 255];

function t(f) { return f / FPS; }
function hex(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
function tr(layer, mn) { return layer.property("ADBE Transform Group").property(mn); }
function linearKeys(prop) {
    for (var k = 1; k <= prop.numKeys; k++) prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
}
function setText(layer, str, font, size, color, leading, just) {
    var tp = layer.property("ADBE Text Properties").property("ADBE Text Document");
    var d = tp.value;
    d.resetCharStyle(); d.text = str; d.font = font; d.fontSize = size; d.fillColor = color; d.applyFill = true; d.applyStroke = false;
    d.tracking = 0; d.justification = just;
    if (leading) { d.autoLeading = false; d.leading = leading; }
    tp.setValue(d);
}

var base = (new File($.fileName)).parent.fsName;
var missing = [];
var fonts = ["FVGroteskCondensed-Black", "FVMonaYear-Regular"];
for (var fi = 0; fi < fonts.length; fi++) {
    try { if (app.fonts && app.fonts.getFontsByPostScriptName(fonts[fi]).length === 0) missing.push(fonts[fi]); } catch (e) {}
}

app.beginUndoGroup("Universe sting clone");
var proj = app.project || app.newProject();
var fld = proj.items.addFolder("UNIVERSE_STING_CLONE");

// ---- 3D models (GLB, linked from ./models next to this script). Look = baked emission texture, so AE lighting
// doesn't repaint it. Transforms per frame come from the Blender scene (camera zoom already folded in).
var ANIM = __ANIM__;            // name -> frames 1..70: [x, y, z, orientX, orientY, orientZ, px per model unit]
var ORDER = __ORDER__;
var UNIT_PX = 512;              // px per model unit (1 m) at 100% scale - see README if models come in too big/small
var modelItems = {}, missingModels = [];
var mfld = proj.items.addFolder("models (linked: ./models)");
try { mfld.parentFolder = fld; } catch (e) {}
for (var mi = 0; mi < ORDER.length; mi++) {
    var mf = new File(base + "/models/" + ORDER[mi] + ".glb");
    if (!mf.exists) { missingModels.push(ORDER[mi]); continue; }
    var it = proj.importFile(new ImportOptions(mf));
    try { it.parentFolder = mfld; } catch (e) {}
    modelItems[ORDER[mi]] = it;
}

// ---- half-window precomps for the year roll (each one clips a column of digits)
function halfComp(ci, hi) {
    var cell = CELLS[ci];
    var y0 = hi === 0 ? TOP : MID, y1 = hi === 0 ? MID : BASE + 2;
    var cw = 110, ch = y1 - y0;
    var c = proj.items.addComp("YEAR_cell" + (ci + 1) + (hi === 0 ? "_top" : "_bottom"), cw, ch, 1, N / FPS, FPS);
    try { c.parentFolder = fld; } catch (e) {}
    var col = cell.digits.join("\r");
    var L = c.layers.addText(col);
    L.name = "digits " + cell.digits.join("");
    setText(L, col, "FVMonaYear-Regular", 110, GREY, PITCH, ParagraphJustification.CENTER_JUSTIFY);
    try { L.motionBlur = true; c.motionBlur = true; } catch (e) {}     // the ones digit counts 2-3 years per frame early on
    var pos = tr(L, "ADBE Position");
    var R = ROLL[ci + "_" + hi];
    for (var f = CUT; f < N; f++) {
        var p = R[f - CUT];
        pos.setValueAtTime(t(f), [cw / 2, (BASE - y0) - p * PITCH]);   // first-line baseline; digit k sits k*PITCH lower
    }
    linearKeys(pos);
    return {comp: c, x: cell.x - cw / 2, y: y0};
}

// ---- lockup precomp: word + 4 half windows, laid out at 100% (measured f112)
var lock = proj.items.addComp("LOCKUP_universe23", W, H, 1, N / FPS, FPS);
try { lock.parentFolder = fld; } catch (e) {}
var word = lock.layers.addText("UNIVERSE");
word.name = "UNIVERSE (word)";
setText(word, "UNIVERSE", "FVGroteskCondensed-Black", 104, [1, 1, 1], 0, ParagraphJustification.LEFT_JUSTIFY);
tr(word, "ADBE Position").setValue([717, BASE - 1]);
var halves = [halfComp(0, 0), halfComp(0, 1), halfComp(1, 0), halfComp(1, 1)];
for (var hi2 = 0; hi2 < halves.length; hi2++) {
    var hc = halves[hi2];
    var HL = lock.layers.add(hc.comp);
    HL.name = hc.comp.name;
    tr(HL, "ADBE Anchor Point").setValue([0, 0]);
    tr(HL, "ADBE Position").setValue([hc.x, hc.y]);
}

// ---- main comp
var comp = proj.items.addComp("UNIVERSE_STING_CLONE", W, H, 1, N / FPS, FPS);
try { comp.parentFolder = fld; } catch (e) {}
var bg = comp.layers.addSolid([0, 0, 0], "BG black", W, H, 1, N / FPS); bg.name = "BG black";

// ---- OBJECTS_3D: Advanced 3D precomp with the linked models + near-ortho camera (effects and blend modes stay
// in the 2D main comp above it, where Advanced 3D's limits don't apply)
var c3d = proj.items.addComp("OBJECTS_3D (Advanced 3D)", W, H, 1, N / FPS, FPS);
try { c3d.parentFolder = fld; } catch (e) {}
function setup3D(c, rigExpr) {
    try {  // Advanced 3D is the only renderer that draws 3D models
        var rs = c.renderers;
        for (var ri = 0; ri < rs.length; ri++) if (/advanced/i.test(rs[ri])) { c.renderer = rs[ri]; break; }
    } catch (e) {}
    var rig = c.layers.addNull(N / FPS);
    rig.name = "MODEL RIG";
    var sl = rig.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    sl.name = "Model unit fix %";
    var sv = rig.property("ADBE Effect Parade").property(1).property("ADBE Slider Control-0001");
    sv.setValue(100);
    if (rigExpr) sv.expression = rigExpr;
    // near-orthographic camera (the Blender camera is orthographic): very long lens, z = 0 plane maps 1:1 to comp px
    var cam = c.layers.addCamera("CAMERA near-ortho", [W / 2, H / 2]);
    cam.property("ADBE Camera Options Group").property("ADBE Camera Zoom").setValue(30000);
    tr(cam, "ADBE Position").setValue([W / 2, H / 2, -30000]);
    tr(cam, "ADBE Anchor Point").setValue([W / 2, H / 2, 0]);
}
function addModel(c, nm, item, label) {
    var ML = c.layers.add(item);
    ML.name = label;
    try { ML.threeDLayer = true; } catch (e) {}
    ML.inPoint = t(1); ML.outPoint = t(CUT);
    var rows = ANIM[nm];
    var mp = tr(ML, "ADBE Position"), mo = tr(ML, "ADBE Orientation"), ms = tr(ML, "ADBE Scale");
    tr(ML, "ADBE Anchor Point").setValue([0, 0, 0]);
    for (var fr = 1; fr < CUT; fr++) {
        var r = rows[fr - 1], k = r[6] / UNIT_PX * 100;
        mp.setValueAtTime(t(fr), [r[0], r[1], r[2]]);
        mo.setValueAtTime(t(fr), [(r[3] % 360 + 360) % 360, (r[4] % 360 + 360) % 360, (r[5] % 360 + 360) % 360]);
        ms.setValueAtTime(t(fr), [k, k, k]);
    }
    linearKeys(mp); linearKeys(ms);
    ms.expression = 'value * thisComp.layer("MODEL RIG").effect("Model unit fix %")(1) / 100';
    return ML;
}
function importModel(path) {
    var f = new File(path);
    if (!f.exists) return null;
    var it = proj.importFile(new ImportOptions(f));
    try { it.parentFolder = mfld; } catch (e) {}
    return it;
}
setup3D(c3d, null);
var glassItems = {}, matteItems = {};
for (var oi = ORDER.length - 1; oi >= 0; oi--) {
    var nm = ORDER[oi], item = modelItems[nm];
    if (!item) continue;
    addModel(c3d, nm, item, nm + " (3D model)");
    var gi = importModel(base + "/models/" + nm + "_glass.glb");
    if (gi) { glassItems[nm] = gi; addModel(c3d, nm, gi, nm + " GLASS (3D model, rendered look)"); }
    var mi2 = importModel(base + "/models/" + nm + "_glassmatte.glb");
    if (mi2) matteItems[nm] = mi2;
}

// ---- GLASS_MATTE: the glass pieces alone, opaque white - its shading drives the fake refraction below
var gmc = null;
for (var gk in matteItems) {
    if (!gmc) {
        gmc = proj.items.addComp("GLASS_MATTE (Advanced 3D)", W, H, 1, N / FPS, FPS);
        try { gmc.parentFolder = fld; } catch (e) {}
        setup3D(gmc, 'comp("OBJECTS_3D (Advanced 3D)").layer("MODEL RIG").effect("Model unit fix %")(1)');
    }
    addModel(gmc, gk, matteItems[gk], gk + " glass matte");
}

var O3 = comp.layers.add(c3d);
O3.name = "OBJECTS_3D (models)";
O3.outPoint = t(CUT);

// ---- glass refraction (faked: Advanced 3D has transparency but no refraction): the glass matte's shading displaces
// whatever is behind the glass, inside the glass silhouette only. Strength = Max Horizontal/Vertical Displacement.
if (gmc) {
    var GMAP = comp.layers.add(gmc);
    GMAP.name = "GLASS map (displacement source)"; GMAP.enabled = false; GMAP.outPoint = t(CUT);
    var ADJ = comp.layers.addSolid([1, 1, 1], "GLASS refraction", W, H, 1, N / FPS);
    ADJ.name = "GLASS refraction"; ADJ.outPoint = t(CUT);
    try { ADJ.adjustmentLayer = true; } catch (e) {}
    try {
        ADJ.property("ADBE Effect Parade").addProperty("ADBE Displacement Map");
        var dm = ADJ.property("ADBE Effect Parade").property(1);
        dm.property("ADBE Displacement Map-0001").setValue(GMAP.index);      // Displacement Map Layer
        dm.property("ADBE Displacement Map-0003").setValue(28);              // Max Horizontal Displacement
        dm.property("ADBE Displacement Map-0005").setValue(28);              // Max Vertical Displacement
    } catch (e) {}
    var GMT = comp.layers.add(gmc);
    GMT.name = "GLASS matte (alpha)"; GMT.outPoint = t(CUT);
    try { ADJ.setTrackMatte(GMT, TrackMatteType.ALPHA); }
    catch (e) { try { GMT.moveBefore(ADJ); ADJ.trackMatteType = TrackMatteType.ALPHA; } catch (e2) {} }
}

// ---- film grain (measured on the reference: fine, ~1.5 px, new every frame, black stays clean):
// 50% grey + Noise in Overlay mode leaves black untouched. Strength = this layer's opacity.
var GR = comp.layers.addSolid([0.5, 0.5, 0.5], "GRAIN (Overlay)", W, H, 1, N / FPS);
GR.name = "GRAIN (Overlay)";
var nz = GR.property("ADBE Effect Parade").addProperty("ADBE Noise");
GR.property("ADBE Effect Parade").property(1).property("ADBE Noise-0001").setValue(12);   // Amount of Noise %
try { GR.blendingMode = BlendingMode.OVERLAY; } catch (e) {}
tr(GR, "ADBE Opacity").setValue(40);
GR.outPoint = t(CUT);

// mark placeholder: flat ring (the reference mark is someone else's logo; swap in your own mark here)
var mk = comp.layers.addShape();
mk.name = "MARK ring (placeholder)";
var grp = mk.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
grp.name = "ring";
var vecs = grp.property("ADBE Vectors Group");
var el = vecs.addProperty("ADBE Vector Shape - Ellipse");
var st = vecs.addProperty("ADBE Vector Graphic - Stroke");
el = vecs.property(1); st = vecs.property(2);
var esz = el.property("ADBE Vector Ellipse Size"), sw = st.property("ADBE Vector Stroke Width"), sc = st.property("ADBE Vector Stroke Color");
for (var f2 = 0; f2 < CUT; f2++) {
    var R = MARK_D[f2] / 2, r = R * 0.63;
    esz.setValueAtTime(t(f2), [R + r, R + r]);     // centre-line diameter
    sw.setValueAtTime(t(f2), R - r);
}
linearKeys(esz); linearKeys(sw);
sc.setValueAtTime(t(0), hex("#5A48D8")); sc.setValueAtTime(t(10), hex("#5A48D8")); sc.setValueAtTime(t(48), [1, 1, 1]);
tr(mk, "ADBE Position").setValue([W / 2, H / 2]);
mk.outPoint = t(CUT);

// lockup: hard cut at f71, measured scale-down 128% -> 100% about frame centre
var LK = comp.layers.add(lock);
LK.name = "LOCKUP universe23";
LK.inPoint = t(CUT);
var lsc = tr(LK, "ADBE Scale");
for (var f3 = CUT; f3 < N; f3++) lsc.setValueAtTime(t(f3), [SCALE[f3 - CUT], SCALE[f3 - CUT]]);
linearKeys(lsc);

// reference as a disabled guide layer
var refFile = new File(base + "/reference/reference.mp4");
var refItem = null;
if (refFile.exists) {
    refItem = proj.importFile(new ImportOptions(refFile));
    try { refItem.parentFolder = fld; } catch (e) {}
    var RL = comp.layers.add(refItem);
    RL.name = "REFERENCE (guide, off)"; RL.enabled = false; try { RL.guideLayer = true; } catch (e) {}
}

// compare comp: reference left, clone right
var cmp = proj.items.addComp("COMPARE ref | clone", W * 2, H, 1, N / FPS, FPS);
try { cmp.parentFolder = fld; } catch (e) {}
var CL = cmp.layers.add(comp); CL.name = "CLONE"; tr(CL, "ADBE Position").setValue([W * 1.5, H / 2]);
if (refItem) { var RF = cmp.layers.add(refItem); RF.name = "REFERENCE"; tr(RF, "ADBE Position").setValue([W / 2, H / 2]); }

try { comp.openInViewer(); } catch (e) {}
try { proj.save(new File(base + "/Universe_sting_clone.aep")); } catch (e) {}
app.endUndoGroup();
alert("Universe sting clone built." + (missingModels.length ? "\nMissing models: " + missingModels.join(", ") : "") + (missing.length ? "\nMissing fonts: " + missing.join(", ") + " - install from the fonts folder and run again." : ""));
})();
"""
src = src.replace("__CELLS__", cells_js).replace("__ANIM__", js({n: A3[n] for n in order})).replace("__ORDER__", js(order)).replace("__MARK__", js(mark_d)).replace("__SCALE__", js(scale)).replace("__ROLL__", js(roll))
os.makedirs("ae", exist_ok=True)
open("ae/Universe_sting_clone.jsx", "w").write("﻿" + src)
print("ok", len(src))

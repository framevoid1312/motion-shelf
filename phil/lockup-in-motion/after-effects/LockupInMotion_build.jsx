/*
 * LOCKUP IN MOTION — After Effects build script (v3, matches the corrected reel + soundtrack)
 * ------------------------------------------------------------------
 * Builds the 20 s, 1080×1080, 30 fps reel as native, editable layers:
 *   • main comp "LOCKUP_IN_MOTION_MAIN" with the 120 BPM soundtrack
 *   • 34 shot precomps on the 1/16-note grid (edit list matches the Remotion v3 film)
 *   • the climax lockup sheet as its own precomp, laid out from the reference's measurements
 *   • texture panels as small precomps (faceted grey footage stand-ins + grain)
 *   • shape layers for graphics, text layers for type, hold keys for snappy moves,
 *     expressions for decoders, type-ons, flicker and data visuals
 *
 * HOW TO RUN
 *   1. Install the fonts in the Fonts folder, restart After Effects.
 *   2. Keep LockupInMotion_score.wav next to this script.
 *   3. File → Scripts → Run Script File… → this file.  Then File → Save As… → .aep
 *
 * COPY: edit the BRAND block below, or edit text layers after the build.
 */

(function lockupInMotion() {
    // ================================================================
    // SETTINGS
    // ================================================================
    var W = 1080, H = 1080, FPS = 30, DUR = 20;

    var BRAND = {
        studio: "Studio",
        partner: "BRAND",
        mark: "SB-O",
        url: "SHOP.STUDIOBRAND.COM",
        tagline: "MADE FOR DESIGNERS. BY DESIGNERS",
        edition: "NEW EDITION",
        copyright: "© COPYRIGHT. ALL RIGHTS RESERVED",
        volume: "LOCKUP IN MOTION. VOLUME 3",
        formats: "AE / MOV / GIF",
        assets: ["50 BESPOKE", "MOTION ASSETS"]
    };
    var AUDIO_FILE = "LockupInMotion_score.wav";

    var F = {
        g500: "Inter-Medium",
        g600: "Inter-SemiBold",
        g700: "Inter-Bold",
        g800: "Inter-ExtraBold",
        mono: "SpaceMono-Regular",
        monoB: "SpaceMono-Bold"
    };

    var WHITE = [1, 1, 1], BLACK = [0, 0, 0], SHEET_BG = [0.086, 0.086, 0.086];
    var WORD = 145;                 // headline size, measured from the reference (cap height ≈ 105 px)
    var T_GROT = -35, T_MONO = 20;  // tracking: grotesk −0.035 em, mono +0.02 em

    var warnings = [];

    // ================================================================
    // GENERIC HELPERS
    // ================================================================
    function tryDo(label, fn) {
        try { return fn(); } catch (e) { warnings.push(label + ": " + e.toString()); return null; }
    }

    function hold(prop, keys) {
        // keys: [[time, value], ...] → hold keyframes (stepped animation)
        for (var i = 0; i < keys.length; i++) prop.setValueAtTime(keys[i][0], keys[i][1]);
        for (var k = 1; k <= prop.numKeys; k++) {
            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
        }
    }

    function win(layer, a, b) {
        // visible only for [a, b) seconds of its comp
        var dur = layer.containingComp.duration;
        if (b === undefined || b > dur) b = dur;
        if (a === undefined) a = 0;
        layer.inPoint = a;
        layer.outPoint = b;
        return layer;
    }

    function tr(layer) { return layer.property("ADBE Transform Group"); }
    function pos(layer, v) { tr(layer).property("ADBE Position").setValue(v); return layer; }

    function esc(s) {
        return String(s).replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\r/g, "\\r").replace(/\n/g, "\\r").replace(/\u00A0/g, "\\u00A0").replace(/\u00A9/g, "\\u00A9");
    }

    // ---------------------------------------------------------------- shapes
    function absShape(comp, name) {
        var l = comp.layers.addShape();
        l.name = name;
        pos(l, [0, 0]); // path coordinates == comp coordinates
        return l;
    }
    function vecs(layer) { return layer.property("ADBE Root Vectors Group"); }
    function group(parent, name) {
        var g = parent.addProperty("ADBE Vector Group");
        if (name) g.name = name;
        return g;
    }
    function gv(g) { return g.property("ADBE Vectors Group"); }
    function gtr(g) { return g.property("ADBE Vector Transform Group"); }

    function addRect(v, x, y, w, h, round) {
        var r = v.addProperty("ADBE Vector Shape - Rect");
        r.property("ADBE Vector Rect Size").setValue([w, h]);
        r.property("ADBE Vector Rect Position").setValue([x + w / 2, y + h / 2]);
        if (round) r.property("ADBE Vector Rect Roundness").setValue(round);
        return r;
    }
    function addEllipse(v, cx, cy, rx, ry) {
        var e = v.addProperty("ADBE Vector Shape - Ellipse");
        e.property("ADBE Vector Ellipse Size").setValue([rx * 2, (ry === undefined ? rx : ry) * 2]);
        e.property("ADBE Vector Ellipse Position").setValue([cx, cy]);
        return e;
    }
    function addPath(v, pts, closed) {
        var p = v.addProperty("ADBE Vector Shape - Group");
        var s = new Shape();
        s.vertices = pts;
        s.closed = !!closed;
        p.property("ADBE Vector Shape").setValue(s);
        return p;
    }
    function addFill(v, col) {
        var f = v.addProperty("ADBE Vector Graphic - Fill");
        f.property("ADBE Vector Fill Color").setValue(col || WHITE);
        return f;
    }
    function addStroke(v, w, col, cap) {
        var s = v.addProperty("ADBE Vector Graphic - Stroke");
        s.property("ADBE Vector Stroke Color").setValue(col || WHITE);
        s.property("ADBE Vector Stroke Width").setValue(w);
        if (cap) s.property("ADBE Vector Stroke Line Cap").setValue(cap); // 1 butt, 2 round, 3 square
        return s;
    }

    function rect(comp, name, x, y, w, h, opt) {
        opt = opt || {};
        var l = absShape(comp, name);
        var g = group(vecs(l), name);
        addRect(gv(g), x, y, w, h, opt.round);
        if (opt.sw) addStroke(gv(g), opt.sw, opt.col);
        else addFill(gv(g), opt.col);
        return l;
    }
    function circle(comp, name, cx, cy, r, opt) {
        opt = opt || {};
        var l = absShape(comp, name);
        var g = group(vecs(l), name);
        addEllipse(gv(g), cx, cy, r);
        if (opt.fill) addFill(gv(g), opt.fill);
        if (opt.sw) addStroke(gv(g), opt.sw, opt.col);
        if (!opt.fill && !opt.sw) addFill(gv(g), WHITE);
        return l;
    }
    function line(comp, name, x1, y1, x2, y2, sw) {
        var l = absShape(comp, name);
        var g = group(vecs(l), name);
        addPath(gv(g), [[x1, y1], [x2, y2]], false);
        addStroke(gv(g), sw || 2);
        return l;
    }

    // ---------------------------------------------------------------- text
    /**
     * Text layer. anchor: c | l | r | tl | bc (bottom-centre) | base (baseline-left, i.e. raw position).
     * opt: col, tracking, leading, measureAt (seconds | "end"), fauxItalic, stroke {col, w}.
     */
    function text(comp, name, str, x, y, size, font, anchor, opt) {
        opt = opt || {};
        var l = comp.layers.addText(str);
        l.name = name;
        var sp = l.property("ADBE Text Properties").property("ADBE Text Document");
        var td = sp.value;
        td.resetCharStyle();
        td.resetParagraphStyle();
        td.text = str;
        td.font = font;
        td.fontSize = size;
        td.applyFill = true;
        td.fillColor = opt.col || WHITE;
        if (opt.stroke) {
            td.applyStroke = true;
            td.strokeColor = opt.stroke.col;
            td.strokeWidth = opt.stroke.w;
            td.strokeOverFill = true;
        } else {
            td.applyStroke = false;
        }
        if (opt.fauxItalic) td.fauxItalic = true;
        td.tracking = opt.tracking === undefined ? 0 : opt.tracking;
        if (opt.leading) { td.autoLeading = false; td.leading = opt.leading; }
        td.justification = ParagraphJustification.LEFT_JUSTIFY;
        sp.setValue(td);
        pos(l, [x, y]);
        var mt = opt.measureAt === "end" ? Math.max(0, comp.duration - 1 / FPS) : (opt.measureAt === undefined ? "time" : opt.measureAt);
        var ax = {
            c: "[r.left + r.width/2, r.top + r.height/2]",
            l: "[r.left, r.top + r.height/2]",
            tl: "[r.left, r.top]",
            r: "[r.left + r.width, r.top + r.height/2]",
            bc: "[r.left + r.width/2, r.top + r.height]"
        }[anchor || "c"];
        if (anchor !== "base") {
            tr(l).property("ADBE Anchor Point").expression = "var r = sourceRectAtTime(" + mt + ", false);\r" + ax + ";";
        }
        return l;
    }

    /** Squeeze/stretch a text layer horizontally to an exact width (SVG textLength), measured at time t. */
    function fitWidth(layer, w, t) {
        tr(layer).property("ADBE Scale").expression =
            "var r = sourceRectAtTime(" + t + ", false);\r[r.width > 0 ? " + w + " / r.width * 100 : 100, 100];";
        return layer;
    }

    /** HTML text box → cap-top: the box (line-height lh) centres the glyphs, caps sit around that centre. */
    function capTop(y, size, lh, cap) {
        return y + (lh * size) / 2 - ((cap || 0.68) * size) / 2;
    }

    /**
     * Decoder on Source Text. Times are comp-local seconds. Layout never shifts.
     * mode "scramble": chars resolve left→right; the unresolved tail is random letters/digits/symbols.
     * mode "reveal":   no noise — letters pop in (and out) in random order.
     */
    function scramble(layer, str, o) {
        o = o || {};
        var e =
            "// decoder — edit TXT / timings freely\r" +
            "var TXT = \"" + esc(str) + "\";\r" +
            "var MODE = \"" + (o.mode || "scramble") + "\";\r" +
            "var START = " + (o.start || 0) + ", STAGGER = " + (o.stagger === undefined ? 0.025 : o.stagger) +
            ", HOLD = " + (o.hold === undefined ? 0.12 : o.hold) + ", SPAN = " + (o.span === undefined ? 0.3 : o.span) + ";\r" +
            "var OUT_AT = " + (o.outAt === undefined ? -999 : o.outAt) + ", OUT_SPAN = " + (o.outSpan || 0.15) + ";\r" +
            "var SEED = " + (o.seed || 1) + ";\r" +
            "var POOL = \"ABCDEFGHKLMNOPRSTUVXZ0123456789$*^%()<>,:;-#&!?/=+\";\r" +
            "var tk = Math.floor(time * 15), out = \"\";\r" +
            "for (var i = 0; i < TXT.length; i++) {\r" +
            "  var c = TXT.charAt(i);\r" +
            "  if (c == \" \" || c == \"\\r\") { out += c; continue; }\r" +
            "  seedRandom(SEED * 1000 + i, true); var r = random();\r" +
            "  seedRandom(SEED * 7919 + i * 31 + tk * 977, true); var s = POOL.charAt(Math.floor(random() * POOL.length));\r" +
            "  if (OUT_AT > -999) { var v = OUT_AT + r * OUT_SPAN;\r" +
            "    if (time >= v + (MODE == \"reveal\" ? 0 : 0.05)) { out += \"\\u00A0\"; continue; }\r" +
            "    if (time >= v) { out += s; continue; } }\r" +
            "  if (MODE == \"reveal\") { out += (time >= START + r * SPAN) ? c : \"\\u00A0\"; continue; }\r" +
            "  var ap = START + i * STAGGER * 0.4, rs = START + i * STAGGER + HOLD + r * 0.04;\r" +
            "  out += (time < ap) ? \"\\u00A0\" : (time >= rs ? c : s);\r" +
            "}\r" +
            "out;";
        layer.property("ADBE Text Properties").property("ADBE Text Document").expression = e;
        return layer;
    }

    function addAnimator(layer, name) {
        var a = layer.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
        a.name = name;
        return a;
    }
    function indexSelector(anim, startExpr, endExpr) {
        var s = anim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        s.property("ADBE Text Range Advanced").property("ADBE Text Range Units").setValue(2); // Index
        s.property("ADBE Text Index Start").expression = startExpr;
        s.property("ADBE Text Index End").expression = endExpr;
        return s;
    }
    function exprSelector(anim, amountExpr) {
        var s = anim.property("ADBE Text Selectors").addProperty("ADBE Text Expressible Selector");
        s.property("ADBE Text Expressible Amount").expression = amountExpr;
        return s;
    }

    /** Type-on: letters appear one by one (layout reserved); newest letter blurred + nudged. */
    function typeOn(layer, n, start, interval, blurFor) {
        var k = "var N = " + n + ", ST = " + start + ", IV = " + interval + ";\r" +
                "var k = time < ST ? 0 : Math.min(N, Math.floor((time - ST) / IV + 1e-6) + 1);\r";
        var a = addAnimator(layer, "Type On");
        a.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity").setValue(0);
        indexSelector(a, k + "k;", "" + (n + 1) + ";");
        var b = addAnimator(layer, "Fresh Letter Blur");
        var bp = b.property("ADBE Text Animator Properties");
        bp.addProperty("ADBE Text Blur").setValue([10, 4]);
        bp.addProperty("ADBE Text Position 3D").setValue([10, 0, 0]);
        bp.addProperty("ADBE Text Opacity").setValue(75);
        var age = "var age = time - ST - (k - 1) * IV;\r";
        indexSelector(b,
            k + age + "(k > 0 && age < " + blurFor + ") ? k - 1 : 0;",
            k + age + "(k > 0 && age < " + blurFor + ") ? k : 0;");
        return layer;
    }

    // ---------------------------------------------------------------- texture
    function setFx(fx, name, val) {
        tryDo("effect param " + name, function () { fx.property(name).setValue(val); });
    }

    /**
     * Grainy faceted "footage" panel (stand-in for the reference's B/W sculpture shots), built as
     * its own small precomp so everything stays clipped to the panel:
     *   dark charcoal base · low-contrast stone noise · flat grey facets with bright creases
     *   (slowly drifting) · hard black blotches · strong grain.
     */
    var panelCount = 0, panelsFolder = null;
    function texturePanel(comp, name, x, y, w, h, o) {
        o = o || {};
        var L = Math.min(3.2, o.bright === undefined ? 1 : o.bright);
        var seed = o.seed || 1;
        var pw = Math.max(4, Math.round(w)), ph = Math.max(4, Math.round(h)), sx = Math.max(pw, ph);
        var g = function (v) { v = Math.max(0, Math.min(1, v)); return [v, v, v]; };
        panelCount++;
        var pc = proj.items.addComp("PANEL_" + (panelCount < 10 ? "0" : "") + panelCount + "_" + comp.name + "_" + name, pw, ph, 1, comp.duration, FPS);
        if (panelsFolder) pc.parentFolder = panelsFolder;
        pc.bgColor = BLACK;

        pc.layers.addSolid(g(0.07 * L), "base", pw, ph, 1);

        var stone = pc.layers.addSolid([0.5, 0.5, 0.5], "stone", pw + 40, ph, 1);
        pos(stone, [pw / 2 + 20, ph / 2]);
        tr(stone).property("ADBE Position").expression = "[value[0] - time * 12, value[1]]";
        tr(stone).property("ADBE Opacity").setValue(55);
        var sn = stone.property("ADBE Effect Parade").addProperty("ADBE Fractal Noise");
        setFx(sn, "Contrast", 70);
        setFx(sn, "Brightness", -32 + 8 * L);
        setFx(sn, "Scale", Math.round(sx / 4));
        setFx(sn, "Complexity", 3);
        setFx(sn, "Random Seed", seed);

        var facets = pc.layers.addShape();
        facets.name = "facets + creases";
        pos(facets, [0, 0]);
        var r = prng(seed * 101 + 7);
        var n = o.shards || 7;
        for (var i = 0; i < n; i++) {
            var cx = r() * pw, cy = r() * ph, size = (0.35 + r() * 0.8) * sx;
            var ang = -70 + r() * 140, dr = (r() - 0.5) * 16, dx = (r() - 0.5) * 36;
            var pts = [];
            for (var k = 0; k < 4; k++) {
                var a = (k / 4) * Math.PI * 2 + (r() - 0.5) * 1.1;
                var rad = size * (0.25 + r() * 0.6) * (k % 2 ? 0.35 : 1);
                pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
            }
            var lo = (0.03 + r() * 0.08) * L, hi = (0.12 + r() * 0.3) * L;
            var fg = group(vecs(facets), "facet " + (i + 1));
            var body = group(gv(fg), "body");
            addPath(gv(body), pts, true);
            addFill(gv(body), g((lo + hi) / 2));
            var lit = group(gv(fg), "lit edge");      // brighter strip along the leading edge = cheap gradient
            addPath(gv(lit), [pts[0], pts[1], [pts[1][0] * 0.55, pts[1][1] * 0.55], [pts[0][0] * 0.55, pts[0][1] * 0.55]], true);
            addFill(gv(lit), g(hi));
            gtr(lit).property("ADBE Vector Group Opacity").setValue(70);
            if (r() > 0.3) {
                var cr = group(gv(fg), "crease");
                addPath(gv(cr), [pts[0], pts[1]], false);
                addStroke(gv(cr), 1.4);
                gtr(cr).property("ADBE Vector Group Opacity").setValue(75);
            }
            gtr(fg).property("ADBE Vector Position").setValue([cx, cy]);
            gtr(fg).property("ADBE Vector Position").expression = "[value[0] + time * " + dx.toFixed(2) + ", value[1]]";
            gtr(fg).property("ADBE Vector Rotation").setValue(ang);
            gtr(fg).property("ADBE Vector Rotation").expression = "value + time * " + dr.toFixed(2);
        }
        setFx(facets.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2"), "ADBE Gaussian Blur 2-0001", 2.4);

        var blot = pc.layers.addSolid([0.5, 0.5, 0.5], "blotches", pw, ph, 1);
        blot.blendingMode = BlendingMode.MULTIPLY;
        var bn = blot.property("ADBE Effect Parade").addProperty("ADBE Fractal Noise");
        setFx(bn, "Contrast", 600);
        setFx(bn, "Brightness", -70);
        setFx(bn, "Scale", Math.round(sx / 2.6));
        setFx(bn, "Complexity", 2);
        setFx(bn, "Random Seed", seed + 7);
        blot.property("ADBE Effect Parade").addProperty("ADBE Invert");

        var grit = pc.layers.addSolid(WHITE, "grain (adjustment)", pw, ph, 1);
        grit.adjustmentLayer = true;
        var nz = grit.property("ADBE Effect Parade").addProperty("ADBE Noise");
        setFx(nz, "ADBE Noise-0001", 32);
        setFx(nz, "ADBE Noise-0002", 0);

        var l = comp.layers.add(pc);
        l.name = name;
        pos(l, [x + w / 2, y + h / 2]);
        return win(l, o.a, o.b);
    }

    /** Blurred glassy lens streaks (hex pills). */
    function streaks(comp, name, x, y, w, h, n, o) {
        o = o || {};
        var l = absShape(comp, name);
        var L = w / n - 14;
        for (var i = 0; i < n; i++) {
            var g = group(vecs(l), "streak " + (i + 1));
            var hh = h * (0.75 + ((i * 37) % 25) / 100);
            var k = hh * 0.55, ox = x + i * (L + 14), oy = y - hh / 2;
            addPath(gv(g), [[ox, oy + hh / 2], [ox + k, oy], [ox + L - k, oy], [ox + L, oy + hh / 2], [ox + L - k, oy + hh], [ox + k, oy + hh]], true);
            addFill(gv(g), [0.72 - i * 0.08, 0.72 - i * 0.08, 0.72 - i * 0.08]);
        }
        tr(l).property("ADBE Position").expression = "[value[0] + time * 40, value[1]]";
        var fxp = l.property("ADBE Effect Parade");
        setFx(fxp.addProperty("ADBE Gaussian Blur 2"), "ADBE Gaussian Blur 2-0001", 9);
        var nz = fxp.addProperty("ADBE Noise");
        setFx(nz, "ADBE Noise-0001", 30);
        setFx(nz, "ADBE Noise-0002", 0);
        return win(l, o.a, o.b);
    }

    // ---------------------------------------------------------------- pixels
    var GREYS = { "#": WHITE, "+": [0.74, 0.74, 0.74], "-": [0.36, 0.36, 0.36] };

    function glyph(comp, name, rows, cell, x, y, o) {
        o = o || {};
        var maxw = 0, j, i;
        for (j = 0; j < rows.length; j++) maxw = Math.max(maxw, rows[j].length);
        var ox = o.tl ? x : x - (maxw * cell) / 2;
        var oy = o.tl ? y : y - (rows.length * cell) / 2;
        var l = absShape(comp, name);
        var groups = {};
        for (var key in GREYS) {
            var cells = [];
            for (j = 0; j < rows.length; j++)
                for (i = 0; i < rows[j].length; i++)
                    if (rows[j].charAt(i) === key) cells.push([i, j]);
            if (!cells.length) continue;
            var g = group(vecs(l), key === "#" ? "white" : (key === "+" ? "light grey" : "dark grey"));
            for (var c = 0; c < cells.length; c++)
                addRect(gv(g), ox + cells[c][0] * cell, oy + cells[c][1] * cell, cell + (o.round ? 0 : 0.5), cell + (o.round ? 0 : 0.5), o.round ? cell * 0.45 : 0);
            addFill(gv(g), GREYS[key]);
        }
        return win(l, o.a, o.b);
    }

    // deterministic "random" glyph (like the React seededGlyph)
    function prng(seed) {
        var s = seed % 2147483647; if (s <= 0) s += 2147483646;
        return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    }
    function seededGlyph(seed, cols, rows, density) {
        var r = prng(seed * 7919 + 13), out = [];
        for (var j = 0; j < rows; j++) {
            var row = "";
            for (var i = 0; i < cols; i++) row += r() < density ? "#" : ".";
            out.push(row);
        }
        return out;
    }

    var INVADER = ["##..##..##", "##########", "..##..##..", "####..####", "..##..##.."];
    var INVADER_B = ["..##..##..", "##########", "##..##..##", "..##..##..", "####..####"];
    var QUERY = ["..###.", ".#...#", "....#.", "..##..", "..#..."];
    var HOOK = ["####..", "...#..", ".####.", ".#..##", ".#...."];
    var CHECKERS = [["+-", "-+"], ["#.", ".-"], ["-#", "+."], [".+", "#-"], ["+", "-"], ["#"]];

    /** Stack of glyph variants that flicker; exactly one visible per tick. */
    function flickerGlyphs(comp, name, variants, cell, x, y, rate, o) {
        o = o || {};
        for (var v = 0; v < variants.length; v++) {
            var l = glyph(comp, name + " " + (v + 1), variants[v], cell, x, y, {tl: o.tl, a: o.a, b: o.b, round: o.round});
            tr(l).property("ADBE Opacity").expression =
                "seedRandom(" + (o.seed || 3) + " * 1000 + Math.floor(time * " + rate + "), true);\r" +
                "Math.floor(random() * " + variants.length + ") == " + v + " ? 100 : 0;";
        }
    }

    // ---------------------------------------------------------------- icons
    function circlePath(cx, cy, r) {
        var k = r * 0.5523, s = new Shape();
        s.vertices = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
        s.inTangents = [[-k, 0], [0, -k], [k, 0], [0, k]];
        s.outTangents = [[k, 0], [0, k], [-k, 0], [0, -k]];
        s.closed = true;
        return s;
    }

    function wireGlobe(comp, name, cx, cy, r, sw, o) {
        o = o || {};
        var l = absShape(comp, name);
        var g = group(vecs(l), "globe");
        var ring = group(gv(g), "outline"); addEllipse(gv(ring), cx, cy, r); addStroke(gv(ring), sw);
        for (var k = 0; k < 3; k++) {
            var m = group(gv(g), "meridian " + (k + 1));
            var e = addEllipse(gv(m), cx, cy, r);
            e.property("ADBE Vector Ellipse Size").expression =
                "var a = " + (k / 3) + " * Math.PI + time * " + (o.spin === undefined ? 3 : o.spin) + ";\r[Math.abs(Math.cos(a)) * " + (2 * r) + ", " + (2 * r) + "];";
            addStroke(gv(m), sw);
        }
        var p = [-0.5, 0, 0.5];
        for (var i = 0; i < 3; i++) {
            var hw = Math.cos(Math.asin(p[i])) * r;
            var pg = group(gv(g), "parallel " + (i + 1));
            addPath(gv(pg), [[cx - hw, cy + p[i] * r], [cx + hw, cy + p[i] * r]], false);
            addStroke(gv(pg), sw);
        }
        // In AE the first content group draws on top, so the black disc goes last (underneath the lines)
        if (o.fill) { var gf = group(gv(g), "disc"); addEllipse(gv(gf), cx, cy, r); addFill(gv(gf), BLACK); }
        return win(l, o.a, o.b);
    }

    function wwwBadge(comp, name, cx, cy, r, sw, o) {
        o = o || {};
        var parts = [];
        if (o.globe !== undefined) {
            var gl = wireGlobe(comp, name + " globe", cx, cy, r * 0.96, sw * 0.8, {fill: true, a: o.a, b: o.b});
            if (o.globeKeys) hold(tr(gl).property("ADBE Position"), o.globeKeys);
            parts.push(gl);
        }
        var l = absShape(comp, name + " ring");
        var g = group(vecs(l), "badge");
        addEllipse(gv(g), cx, cy, r);
        addFill(gv(g), BLACK);
        addStroke(gv(g), sw);
        win(l, o.a, o.b);
        if (o.ringKeys) hold(tr(l).property("ADBE Position"), o.ringKeys);
        var t = text(comp, name + " WWW", "WWW", cx, cy, r * 0.54, F.g700, "c", {tracking: -20});
        win(t, o.a, o.b);
        if (o.ringKeys) {
            var tk = [];
            for (var i = 0; i < o.ringKeys.length; i++) tk.push([o.ringKeys[i][0], [cx + o.ringKeys[i][1][0], cy + o.ringKeys[i][1][1]]]);
            hold(tr(t).property("ADBE Position"), tk);
        }
        return l;
    }

    function crosshair(comp, name, cx, cy, w, spread, sw, o) {
        o = o || {};
        var l = absShape(comp, name);
        var s = spread;
        var g = group(vecs(l), "lines");
        addPath(gv(g), [[cx - w / 2, cy], [cx + w / 2, cy]], false);
        var sx = [-1, 1], i, j;
        for (i = 0; i < 2; i++) for (j = 0; j < 2; j++)
            addPath(gv(g), [[cx + sx[i] * s * 0.4, cy + sx[j] * s * 0.9], [cx + sx[i] * s * 1.1, cy + sx[j] * s * 0.9]], false);
        addPath(gv(g), [[cx, cy - s * 0.55], [cx, cy - s * 0.3]], false);
        addPath(gv(g), [[cx, cy + s * 0.3], [cx, cy + s * 0.55]], false);
        addStroke(gv(g), sw);
        var d = group(vecs(l), "dot");
        addEllipse(gv(d), cx, cy, sw * 3.2);
        addFill(gv(d), WHITE);
        if (o.scaleKeys) {
            tr(l).property("ADBE Anchor Point").setValue([cx, cy]);
            pos(l, [cx, cy]);
            hold(tr(l).property("ADBE Scale"), o.scaleKeys);
        }
        return win(l, o.a, o.b);
    }

    function dumbbell(comp, name, cx, cy, w, r, neckExpr, o) {
        o = o || {};
        var l = absShape(comp, name);
        var g = group(vecs(l), "bone");
        addEllipse(gv(g), cx - w / 2 + r, cy, r);
        addEllipse(gv(g), cx + w / 2 - r, cy, r);
        var nk = addRect(gv(g), cx - w / 2 + r, cy - 15, w - 2 * r, 30, 0);
        nk.property("ADBE Vector Rect Size").expression = neckExpr;
        nk.property("ADBE Vector Rect Position").setValue([cx, cy]);
        addFill(gv(g), WHITE);
        return win(l, o.a, o.b);
    }

    /** © ring: circular text on a reversed (counter-clockwise) mask path + ring + C (trimmed) or I bar. */
    function copyrightRing(comp, name, cx, cy, r, o) {
        o = o || {};
        var t = text(comp, name + " text", "ALL RIGHTS RESERVED - COPYRIGHT - ", 0, 0, r * 0.3, F.g800, "base", {tracking: 10});
        pos(t, [cx, cy]);
        var m = t.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        m.property("ADBE Mask Shape").setValue(circlePath(0, 0, r * 0.97));
        tryDo("text on path", function () {
            var po = t.property("ADBE Text Properties").property("ADBE Text Path Options");
            po.property("ADBE Text Path").setValue(1);
            po.property("ADBE Text Force Align Path").setValue(1);
            po.property("ADBE Text Reverse Path").setValue(1);
        });
        if (o.spinKeys) {
            var k2 = [];
            for (var i = 0; i < o.spinKeys.length; i++) k2.push([o.spinKeys[i][0], o.spinKeys[i][1] + 180]);
            hold(tr(t).property("ADBE Rotate Z"), k2);
        } else {
            tr(t).property("ADBE Rotate Z").expression = "180 + " + (o.spinExpr || "0");
        }
        win(t, o.a, o.b);

        var l = absShape(comp, name + " mark");
        var ring = group(vecs(l), "ring");
        addEllipse(gv(ring), cx, cy, r * 0.62);
        addStroke(gv(ring), r * 0.13);
        var c = group(vecs(l), "C");
        addEllipse(gv(c), cx, cy, r * 0.3);
        addStroke(gv(c), r * 0.13);
        var trim = gv(c).addProperty("ADBE Vector Filter - Trim");
        trim.property("ADBE Vector Trim Start").setValue(8);
        trim.property("ADBE Vector Trim End").setValue(92);
        trim.property("ADBE Vector Trim Offset").setValue(90);
        if (o.iBar) {
            var ib = group(vecs(l), "I");
            addRect(gv(ib), cx - r * 0.07, cy - r * 0.32, r * 0.14, r * 0.64);
            addFill(gv(ib), WHITE);
            // adding "I" invalidated the old reference to "C" — look both up fresh by name
            hold(gtr(vecs(l).property("I")).property("ADBE Vector Group Opacity"), [[0, 100], [o.iBar, 0]]);
            hold(gtr(vecs(l).property("C")).property("ADBE Vector Group Opacity"), [[0, 0], [o.iBar, 100]]);
        }
        return win(l, o.a, o.b);
    }

    function starBurst(comp, name, cx, cy, r, points, inner) {
        var l = absShape(comp, name);
        var g = group(vecs(l), "star");
        var s = gv(g).addProperty("ADBE Vector Shape - Star");
        s.property("ADBE Vector Star Type").setValue(1);
        s.property("ADBE Vector Star Points").setValue(points || 8);
        s.property("ADBE Vector Star Outer Radius").setValue(r);
        s.property("ADBE Vector Star Inner Radius").setValue(r * (inner || 0.45));
        s.property("ADBE Vector Star Position").setValue([cx, cy]);
        addFill(gv(g), WHITE);
        return l;
    }

    function pill(comp, name, x, y, w, h, sw, o) {
        o = o || {};
        return win(rect(comp, name, x, y, w, h, {round: h / 2, sw: sw}), o.a, o.b);
    }

    /** Vertical waveform lines, heights re-rolled ~15×/s by expression. */
    function waveform(comp, name, x, y, w, h, count, sw, o) {
        o = o || {};
        var l = absShape(comp, name);
        for (var i = 0; i < count; i++) {
            var g = group(vecs(l), "bar " + (i + 1));
            var r = addRect(gv(g), x + (i / count) * w - sw / 2, y - h / 2, sw, h);
            r.property("ADBE Vector Rect Size").expression =
                "seedRandom(" + (o.seed || 5) + " * 1000 + " + i + " + Math.floor(time * 15) * 131, true);\r" +
                "[" + sw + ", (0.12 + Math.pow(random(), 2.2) * 0.88) * " + h + "];";
            r.property("ADBE Vector Rect Position").setValue([x + (i / count) * w, y]);
            addFill(gv(g), WHITE);
            if (o.revealSpeed) {
                gtr(g).property("ADBE Vector Group Opacity").expression =
                    "(0.35 + time * " + o.revealSpeed + ") * " + count + " > " + i + " ? 100 : 0;";
            }
        }
        return win(l, o.a, o.b);
    }

    /** Two-line chart; lines re-randomise every 1/16 note via createPath. */
    function lineChart(comp, name, x, y, w, h, o) {
        o = o || {};
        var ms = o.ms || 11;
        var fs = Math.max(8, h * 0.075);
        var l = absShape(comp, name);
        var ax = group(vecs(l), "axes");
        addPath(gv(ax), [[x, y], [x, y + h], [x + w, y + h]], false);
        addStroke(gv(ax), 1.6);
        var xs = [0.15 * w, 0.55 * w, 0.95 * w];
        for (var k = 0; k < 2; k++) {
            var g = group(vecs(l), "series " + (k + 1));
            var p = addPath(gv(g), [[x, y], [x + 1, y]], false);
            p.property("ADBE Vector Shape").expression =
                "var st = Math.floor(time / 0.125), pts = [];\r" +
                "var xs = [" + xs.join(",") + "];\r" +
                "for (var i = 0; i < 3; i++) { seedRandom(" + (k + 1) + " * 100 + i * 7 + st * 13, true); pts.push([" + x + " + xs[i], " + y + " + " + h + " * (0.15 + random() * 0.7)]); }\r" +
                "createPath(pts, [], [], false);";
            addStroke(gv(g), 1.6);
            for (var i = 0; i < 3; i++) {
                var mg = group(gv(g), "marker " + (i + 1));
                var mr = addRect(gv(mg), 0, 0, ms, ms);
                mr.property("ADBE Vector Rect Position").expression =
                    "var st = Math.floor(time / 0.125); seedRandom(" + (k + 1) + " * 100 + " + i + " * 7 + st * 13, true);\r" +
                    "[" + (x + xs[i]) + ", " + y + " + " + h + " * (0.15 + random() * 0.7)];";
                addFill(gv(mg), WHITE);
            }
        }
        var nums = [10, 8, 6, 4, 2, 0];
        for (var n = 0; n < nums.length; n++) {
            var tl = text(comp, name + " y" + nums[n], String(nums[n]), x - 8, y + (n / 5) * h, fs, F.mono, "r");
            win(tl, o.a, o.b);
        }
        return win(l, o.a, o.b);
    }

    /** Outline pixel grid: fixed mask (rows of "#") or random cells re-rolled 5×/s. */
    function pixelGridIcon(comp, name, x, y, cols, rows, cell, seed, o) {
        o = o || {};
        var l = absShape(comp, name);
        for (var i = 0; i < cols * rows; i++) {
            var cx = i % cols, cy = Math.floor(i / cols);
            if (o.mask && (o.mask[cy] || "").charAt(cx) !== "#") continue;
            var g = group(vecs(l), "cell " + (i + 1));
            var sz = cell * (o.mask ? 0.84 : 0.78);
            addRect(gv(g), x + cx * cell, y + cy * cell, sz, sz);
            addStroke(gv(g), o.sw || 1.6);
            if (!o.mask) {
                gtr(g).property("ADBE Vector Group Opacity").expression =
                    "seedRandom(" + seed + " * 1000 + " + i + " + Math.floor(time * 5) * 71, true); random() < 0.3 ? 0 : 100;";
            }
        }
        return win(l, o.a, o.b);
    }

    /** Edition arrow (↘ by default, ↗ when flipped) as absolute points. */
    function arrowPts(ox, oy, u, flip) {
        var P = [[4, 0], [5, 1], [2.4, 3.6], [4, 3.6], [4, 4.4], [0, 4.4], [0, 0.6], [0.8, 0.6], [0.8, 2.9]], out = [];
        for (var i = 0; i < P.length; i++) out.push([ox + u * 6 - P[i][0] * u, oy + (flip ? u * 5.4 - P[i][1] * u : u + P[i][1] * u)]);
        return out;
    }

    /** "NEW EDITION" product strip: arrow (flips ↗→↘), notched D, ®, caption tracked out to the bar width. */
    function editionBar(comp, name, x, y, w, h, o) {
        o = o || {};
        var u = h * 0.16, fs = h * 0.3;
        var l = absShape(comp, name + " bar");
        var arD = group(vecs(l), "arrow ↘");
        addPath(gv(arD), arrowPts(x, y, u, false), true);
        addFill(gv(arD), BLACK);
        var arU = group(vecs(l), "arrow ↗");
        addPath(gv(arU), arrowPts(x, y, u, true), true);
        addFill(gv(arU), BLACK);
        var dg = group(vecs(l), "D");
        var dx = x + u * 7, dy = y + u;
        addPath(gv(dg), [[dx, dy], [dx + u * 3.4, dy], [dx + u * 4.6, dy + u * 1.2], [dx + u * 4.6, dy + u * 3.2], [dx + u * 3.4, dy + u * 4.4], [dx, dy + u * 4.4]], true);
        addPath(gv(dg), [[dx + u * 1.4, dy + u * 1.3], [dx + u * 2.9, dy + u * 1.3], [dx + u * 2.9, dy + u * 3.1], [dx + u * 1.4, dy + u * 3.1]], true);
        gv(dg).addProperty("ADBE Vector Filter - Merge").property("ADBE Vector Merge Type").setValue(5); // exclude intersections
        addFill(gv(dg), BLACK);
        var rg = group(vecs(l), "registered");
        addEllipse(gv(rg), x + w - u * 1.6, y + u * 1.4, u * 0.75);
        addStroke(gv(rg), u * 0.22, BLACK);
        var bar = group(vecs(l), "strip (under)");
        addPath(gv(bar), [[x, y], [x + w, y], [x + w, y + h - u], [x + w - u, y + h], [x, y + h]], true);
        addFill(gv(bar), WHITE);
        // fresh lookups by name (adding groups invalidates earlier references)
        var fu = o.flipUntil || 0;
        hold(gtr(vecs(l).property("arrow ↗")).property("ADBE Vector Group Opacity"), [[0, fu > 0 ? 100 : 0], [Math.max(fu, 1e-3), 0]]);
        hold(gtr(vecs(l).property("arrow ↘")).property("ADBE Vector Group Opacity"), [[0, fu > 0 ? 0 : 100], [Math.max(fu, 1e-3), 100]]);
        win(l, o.a, o.b);
        var rt = text(comp, name + " R", "R", x + w - u * 1.6, y + u * 1.45, u, F.g800, "c", {col: BLACK});
        win(rt, o.a, o.b);

        var lab = text(comp, name + " label", BRAND.edition, x, y - h * 0.18, fs, F.g700, "base", {tracking: -17});
        var cap = text(comp, name + " caption", BRAND.copyright, x + u * 0.6, y + h + fs * 1.25, fs * 0.95, F.g700, "tl", {measureAt: 0});
        tr(cap).property("ADBE Anchor Point").expression = "var r = sourceRectAtTime(0, false);\r[r.left, 0];";
        fitWidth(cap, w - u * 1.2, 0);
        var layers = [lab, cap];
        for (var i = 0; i < 2; i++) {
            win(layers[i], o.a, o.b);
            var an = addAnimator(layers[i], "Gaps");
            an.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity").setValue(0);
            exprSelector(an, o.gapExpr ? o.gapExpr(i) :
                "seedRandom(textIndex * 17 + " + i + " * 400 + Math.floor(time * 15) * 3, true); random() < 0.18 ? 100 : 0;");
        }
        return l;
    }

    /** Lit globe: grey oceans, white land, dark limb (reference shot at 1.8 s). */
    function earth(comp, name, cx, cy, r, o) {
        o = o || {};
        var P = function (pts) { var out = []; for (var i = 0; i < pts.length; i++) out.push([cx + pts[i][0] * r, cy + pts[i][1] * r]); return out; };
        var l = absShape(comp, name);
        var land = group(vecs(l), "land");
        addPath(gv(land), P([[-0.9, -0.3], [-0.7, -0.75], [-0.2, -0.95], [0.3, -0.9], [0.6, -0.7], [0.55, -0.45], [0.3, -0.4], [0.05, -0.38], [-0.15, -0.3], [-0.4, -0.2], [-0.65, -0.15], [-0.88, -0.15]]), true);
        addPath(gv(land), P([[-0.55, -0.05], [-0.2, -0.15], [0.1, -0.05], [0.2, 0.15], [0.12, 0.42], [0, 0.65], [-0.15, 0.82], [-0.3, 0.7], [-0.32, 0.45], [-0.55, 0.3], [-0.68, 0.08]]), true);
        addPath(gv(land), P([[0.3, -0.25], [0.55, -0.28], [0.68, -0.12], [0.64, 0.08], [0.48, 0.14], [0.38, -0.02]]), true);
        addEllipse(gv(land), cx + 0.62 * r, cy + 0.5 * r, 0.07 * r, 0.12 * r);
        addFill(gv(land), WHITE);
        var limb = group(vecs(l), "limb shade");
        addEllipse(gv(limb), cx, cy, r);
        addStroke(gv(limb), r * 0.18, [0.12, 0.12, 0.12]);
        gtr(limb).property("ADBE Vector Group Opacity").setValue(55);
        var ocean = group(vecs(l), "ocean (under)");
        addEllipse(gv(ocean), cx, cy, r);
        addFill(gv(ocean), [0.43, 0.43, 0.43]);
        var mk = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        mk.property("ADBE Mask Shape").setValue(circlePath(cx, cy, r));
        return win(l, o.a, o.b);
    }

    /** Diagonal hatch block ("\\\\" like the reference), optional round corners and drift. */
    function hatch(comp, name, x, y, w, h, n, o) {
        o = o || {};
        var l = absShape(comp, name);
        var g = group(vecs(l), "stripes");
        var pitch = (w + h) / n;
        for (var i = 0; i < n + 3; i++) {
            var sx = x + i * pitch - h - pitch;
            addPath(gv(g), [[sx, y], [sx + h, y + h]], false);
        }
        addStroke(gv(g), pitch * 0.45);
        if (o.driftExpr) gtr(g).property("ADBE Vector Position").expression = o.driftExpr;
        var mk = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var s = new Shape();
        s.vertices = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
        s.closed = true;
        mk.property("ADBE Mask Shape").setValue(s);
        return win(l, o.a, o.b);
    }

    /** Dot matrix whose dots shrink / vanish at random, re-rolled 7.5×/s. */
    function dotMatrix(comp, name, cx, cy, cols, rows, gap, r, o) {
        o = o || {};
        var l = absShape(comp, name);
        for (var i = 0; i < cols * rows; i++) {
            var g = group(vecs(l), "dot " + (i + 1));
            var e = addEllipse(gv(g), cx + ((i % cols) - (cols - 1) / 2) * gap, cy + (Math.floor(i / cols) - (rows - 1) / 2) * gap, r);
            e.property("ADBE Vector Ellipse Size").expression =
                "seedRandom(" + i + " + Math.floor(time * 7.5) * 53, true); var v = random();\r" +
                "v < 0.08 ? [0, 0] : (v < 0.3 ? [" + (r * 1.1) + ", " + (r * 1.1) + "] : [" + (2 * r) + ", " + (2 * r) + "]);";
            addFill(gv(g), WHITE);
        }
        return win(l, o.a, o.b);
    }

    // ================================================================
    // FONT CHECK
    // ================================================================
    var missing = [];
    tryDo("font check", function () {
        if (!app.fonts || !app.fonts.getFontsByPostScriptName) return; // AE < 24: can't check
        for (var key in F) {
            var found = app.fonts.getFontsByPostScriptName(F[key]);
            if (!found || !found.length) missing.push(F[key]);
        }
    });
    if (missing.length) {
        var go = confirm("These fonts aren't installed:\n\n  " + missing.join("\n  ") +
            "\n\nInstall the .ttf files from the Fonts folder that came with this script, restart After Effects, then run again." +
            "\n\nBuild anyway with substitute fonts?");
        if (!go) return;
    }

    app.beginUndoGroup("Build LOCKUP IN MOTION v3");

    // ================================================================
    // PROJECT / COMPS
    // ================================================================
    var proj = app.project || app.newProject();
    var root = proj.items.addFolder("LOCKUP IN MOTION");
    var shotsFolder = proj.items.addFolder("Shots");
    shotsFolder.parentFolder = root;
    panelsFolder = proj.items.addFolder("Texture panels");
    panelsFolder.parentFolder = root;
    var main = proj.items.addComp("LOCKUP_IN_MOTION_MAIN", W, H, 1, DUR, FPS);
    main.parentFolder = root;
    main.bgColor = BLACK;

    var shotIndex = 0;
    function shot(name, start, end, build) {
        shotIndex++;
        var id = (shotIndex < 10 ? "0" : "") + shotIndex;
        var c = proj.items.addComp(id + "_" + name, W, H, 1, end - start, FPS);
        c.parentFolder = shotsFolder;
        c.bgColor = BLACK;
        c.layers.addSolid(BLACK, "BG", W, H, 1); // AE never renders bgColor — a real layer keeps frames opaque
        tryDo("shot " + id + " " + name, function () { build(c); return true; });
        var l = main.layers.add(c);
        l.startTime = start;
        l.outPoint = end;
        l.moveToEnd(); // keep main timeline in shot order top → bottom
        return c;
    }

    // small conveniences
    function holdOp(layer, keys) { hold(tr(layer).property("ADBE Opacity"), keys); return layer; }
    function mono(comp, name, str, x, y, size, anchor, opt) {
        opt = opt || {};
        opt.tracking = opt.tracking === undefined ? T_MONO : opt.tracking;
        return text(comp, name, str, x, y, size, opt.bold ? F.monoB : F.mono, anchor, opt);
    }
    /** HTML-style top-left label (box top y, line-height lh) → AE cap-top anchor. */
    function monoTL(comp, name, str, x, y, size, lh, opt) {
        opt = opt || {};
        if (str.indexOf("\r") >= 0) opt.leading = lh * size;
        return mono(comp, name, str, x, capTop(y, size, lh), size, "tl", opt);
    }
    function headline(comp, name, str, x, y) {
        return text(comp, name, str, x, y, WORD, F.g500, "l", {tracking: T_GROT, measureAt: "end"});
    }
    function polyLayer(comp, name, pts, col) {
        var l = absShape(comp, name);
        var g = group(vecs(l), name);
        addPath(gv(g), pts, true);
        addFill(gv(g), col || WHITE);
        return l;
    }
    function xMark(comp, name, cx, cy, size, sw, col) {
        var l = absShape(comp, name);
        var g = group(vecs(l), "x");
        addPath(gv(g), [[cx - size / 2, cy - size / 2], [cx + size / 2, cy + size / 2]], false);
        addPath(gv(g), [[cx + size / 2, cy - size / 2], [cx - size / 2, cy + size / 2]], false);
        addStroke(gv(g), sw, col);
        return l;
    }
    /** Word slides up out of a mask over two frames (reference brand reveal). */
    function slideUp(layer, start, dist) {
        var a = addAnimator(layer, "Slide Up");
        var p = a.property("ADBE Text Animator Properties").addProperty("ADBE Text Position 3D");
        p.setValue([0, dist, 0]);
        p.expression = "var k = Math.min(1, Math.max(0, (time - " + start + ") / 0.0667));\r[0, (1 - k) * " + dist + ", 0];";
        var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        m.property("ADBE Mask Shape").expression =
            "var r = sourceRectAtTime(1, false), p = 4;\r" +
            "createPath([[r.left - p, r.top - p], [r.left + r.width + p, r.top - p], [r.left + r.width + p, r.top + r.height + p], [r.left - p, r.top + r.height + p]], [], [], true);";
        holdOp(layer, [[0, 0], [start, 100]]);
        return layer;
    }

    var COL = 241;                         // left edge of the headline words
    var L = 227;                           // left label column
    var LABEL_TOP = capTop(369, 30, 1.25); // "50 BESPOKE" cap top
    var STACK_TOP = capTop(369, 30, 1.05);
    var SPEC = "LOCKUP IN MOTION\r50 BESPOKE MOTION ASSETS\r20 —@0";

    // ================================================================
    // OPENING  0 – 4 s
    // ================================================================
    shot("PixelBlocks", 0, 0.5, function (c) {
        flickerGlyphs(c, "checker", CHECKERS, 64, 540, 540, 15, {seed: 11});
    });

    shot("StudioLetters", 0.5, 1.1875, function (c) {
        streaks(c, "streak", 300, 130, 480, 46, 2, {a: 0.375, b: 0.5});
        texturePanel(c, "panel", 290, 300, 500, 480, {bright: 3, seed: 2, a: 0.5});
        var lab = monoTL(c, "label", "LOCKUP IN MOTION\r50 BESPOKE MOTION", 227, 146, 11, 1.25, {measureAt: "end"});
        scramble(lab, "LOCKUP IN MOTION\r50 BESPOKE MOTION", {start: 0.125, stagger: 0.006, hold: 0.05, seed: 21});
        win(lab, 0.125);
        // logotype glyphs: S · B · — · O laid out like the HTML flex row, each jumps on the 1/16 grid
        var glyphs = BRAND.mark.split(""), adv = {"-": 34}, x = 0, xs = [];
        var wOf = function (ch) { return adv[ch] || ({S: 92, I: 40, O: 114, B: 98}[ch] || 95); };
        for (var i = 0; i < glyphs.length; i++) { xs.push(x); x += wOf(glyphs[i]) - 4; }
        var x0 = 540 - (x + 4) / 2, appear = [0, 0.0625, 0.125, 0.1875];
        for (var g = 0; g < glyphs.length; g++) {
            var gl, ch = glyphs[g];
            if (ch === "-") gl = rect(c, "glyph " + (g + 1) + " (dash)", x0 + xs[g], 518, 34, 11);
            else gl = text(c, "glyph " + (g + 1) + " " + ch, ch, x0 + xs[g], 540, 148, F.g500, "l", {measureAt: 0.5});
            tr(gl).property("ADBE Position").expression =
                "var st = Math.floor(time / 0.125 + 1e-6); seedRandom(" + (g * 97 + 5) + " + st * 13, true);\r" +
                "var dy = time >= 0.4375 ? 0 : [-62, 0, 0, 58][Math.floor(random() * 4)];\r[value[0], value[1] + dy];";
            holdOp(gl, [[0, appear[g] > 0 ? 0 : 100], [Math.max(appear[g] || 0.2, 1e-3), 100]]);
            if (g === 0) {
                var bl = gl.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
                hold(bl.property("ADBE Gaussian Blur 2-0001"), [[0, 14], [0.0625, 0]]);
                hold(tr(gl).property("ADBE Opacity"), [[0, 70], [0.0625, 100]]);
            }
        }
    });

    shot("RingGlyph", 1.1875, 1.375, function (c) {
        streaks(c, "streak", 300, 300, 300, 40, 2, {a: 0, b: 0.0625});
        circle(c, "ring", 540, 540, 275, {sw: 2.5});
        glyph(c, "glyph", QUERY, 50, 540, 540, {a: 0.0625});
    });

    shot("PanelGlyph", 1.375, 1.6875, function (c) {
        texturePanel(c, "panel", 0, 120, 580, 780, {seed: 3});
        glyph(c, "glyph A", [".###", "###.", ".##.", "..#."], 44, 520, 540, {a: 0, b: 0.125});
        glyph(c, "glyph B", [".###.", "##...", "#.###", "#..#.", ".#..#"], 44, 520, 540, {a: 0.125, b: 0.25});
        win(line(c, "hairline", 100, 572, 960, 572, 2), 0.25);
        var lab = mono(c, "label", "STUDIO 1.0FR — 20.10\rLAT 52.52 / 13.40", 700, 620, 10, "l", {leading: 12.5, measureAt: "end"});
        scramble(lab, "STUDIO 1.0FR — 20.10\rLAT 52.52 / 13.40", {stagger: 0.006, hold: 0.05, seed: 31});
    });

    shot("StreakGlobe", 1.6875, 2.1875, function (c) {
        streaks(c, "streaks A", -40, 520, 1160, 120, 3, {a: 0, b: 0.3125});
        earth(c, "earth", 470, 455, 130, {a: 0.125, b: 0.3125});
        win(rect(c, "white block", 520, 430, 430, 440), 0.1875, 0.3125);
        texturePanel(c, "panel", 0, 380, 1080, 290, {bright: 2, seed: 41, a: 0.3125, b: 0.375});
        streaks(c, "streaks B", -40, 520, 1160, 100, 3, {a: 0.3125, b: 0.375});
        hatch(c, "hatch", 455, 325, 330, 150, 7, {a: 0.3125});
        win(mono(c, "coords", "51.50° N, 0.12° W", 232, 620, 9, "l"), 0.3125);
    });

    shot("LockupWord", 2.1875, 2.6875, function (c) {
        texturePanel(c, "panel dim", 432, 108, 508, 810, {bright: 0.9, seed: 4, a: 0, b: 0.125});
        texturePanel(c, "panel lit", 432, 108, 508, 810, {bright: 1.4, seed: 4, a: 0.125, b: 0.3125});
        win(rect(c, "flash square", 430, 300, 100, 100), 0.0625, 0.125);
        var lab = monoTL(c, "label", "AFTER EFFECTS AEE7F B35=", 227, 232, 10, 1.25, {measureAt: "end"});
        scramble(lab, "AFTER EFFECTS AEE7F B35=", {start: 0.06, stagger: 0.006, hold: 0.05, seed: 41});
        typeOn(headline(c, "LOCKUP", "LOCKUP", COL, 540), 6, 0, 0.075, 0.09);
        win(rect(c, "overline (L)", COL + 4.6, 444, 67, 11), 0.12);
        win(rect(c, "dot", 247, 632, 11, 11), 0.4375);
    });

    shot("InWord", 2.6875, 3.15625, function (c) {
        streaks(c, "streak", 240, 330, 260, 50, 2, {a: 0.0625, b: 0.1875});
        texturePanel(c, "panel", 130, 270, 500, 510, {bright: 2.4, seed: 5, a: 0.1875, b: 0.375});
        var ticks = absShape(c, "ticks");
        var tg = group(vecs(ticks), "ticks");
        for (var i = 0; i < 28; i++) if (i % 3 !== 1) addRect(gv(tg), 360 + i * 20, 600, 2, i % 4 ? 6 : 12);
        addFill(gv(tg), WHITE);
        win(ticks, 0.1875);
        win(rect(c, "long rule", COL, 486, 410, 4), 0.375);
        typeOn(headline(c, "IN", "IN", COL, 540), 2, 0, 0.02, 0.09);
        rect(c, "overline (I)", COL + 2.3, 444, 35, 11);
        var inv = rect(c, "invert block", 230, 520, 380, 260);
        inv.blendingMode = BlendingMode.DIFFERENCE;
        win(inv, 0.375);
        win(monoTL(c, "spec", SPEC, 227, 216, 10, 1.25), 0.375);
    });

    shot("MotionWord", 3.15625, 3.5625, function (c) {
        texturePanel(c, "panel", 110, 500, 540, 290, {bright: 1, seed: 6, a: 0.0625, b: 0.34375});
        texturePanel(c, "panel dim", 110, 500, 540, 290, {bright: 0.5, seed: 6, a: 0.34375, b: 0.40625});
        var m = headline(c, "MOTION", "MOTION", 335, 540);
        typeOn(m, 6, 0, 0.02, 0.4);
        win(m, 0, 0.34375);
        win(rect(c, "overline (N)", 786, 444, 94, 11), 0.06, 0.34375);
        monoTL(c, "spec", SPEC, 227, 216, 10, 1.25);
        var lab = mono(c, "label", "SI-O /50 AE MOV AC@", 862, 636, 10, "r", {measureAt: "end"});
        scramble(lab, "SI-O /50 AE MOV AC@", {start: 0.125, stagger: 0.006, hold: 0.05, seed: 61});
        win(lab, 0.125);
        var bs = rect(c, "blurred square", 232, 300, 56, 56);
        setFx(bs.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2"), "ADBE Gaussian Blur 2-0001", 12);
        win(bs, 0.21875, 0.34375);
        win(rect(c, "square", 249, 318, 22, 22), 0.34375);
    });

    shot("Breath", 3.5625, 4.0, function (c) {
        win(rect(c, "dash", 506, 540, 22, 3), 0.3125);
    });

    // ================================================================
    // ASSETS  4 – 12.34 s
    // ================================================================
    shot("Fifty", 4.0, 4.25, function (c) {
        scramble(mono(c, "50", "50", 540, 540, 96, "c", {measureAt: "end"}), "50", {hold: 0.05, stagger: 0.02, seed: 71});
        win(rect(c, "rule left", 243, 540, 165, 2), 0.09375, 0.1875);
        win(rect(c, "rule right", 640, 540, 165, 2), 0.1875);
        var lab = mono(c, "label", BRAND.assets[0], L, LABEL_TOP, 30, "tl", {measureAt: "end"});
        scramble(lab, BRAND.assets[0], {start: 0.1875, stagger: 0.002, hold: 0.01, seed: 72});
        win(lab, 0.1875);
    });

    shot("Bespoke", 4.25, 5.125, function (c) {
        win(mono(c, "50 BESPOKE", BRAND.assets[0], L, LABEL_TOP, 30, "tl"), 0, 0.5625);
        var b = mono(c, "MOTION ASSETS", BRAND.assets[1], 508, LABEL_TOP, 30, "tl", {measureAt: "end"});
        scramble(b, BRAND.assets[1], {stagger: 0.004, hold: 0.03, seed: 82});
        win(b, 0, 0.5625);
        win(mono(c, "stacked", BRAND.assets[0] + "\r" + BRAND.assets[1], L, STACK_TOP, 30, "tl", {leading: 31.5}), 0.5625);
        win(rect(c, "rule centre", 462, 540, 156, 2), 0, 0.125);
        win(rect(c, "rule under", L, 497, 162, 2), 0.4375, 0.5625);
    });

    shot("Blocks", 5.125, 5.875, function (c) {
        var f = function (v) { return v * 1080; };
        win(mono(c, "label stacked", BRAND.assets[0] + "\r" + BRAND.assets[1], L, STACK_TOP, 30, "tl", {leading: 31.5}), 0, 0.5);
        win(mono(c, "label single", BRAND.assets[0], L, STACK_TOP, 30, "tl"), 0.5625, 0.625);
        win(rect(c, "step 1 block", f(0.23), f(0.555), f(0.135), f(0.145)), 0.0625, 0.1875);
        win(rect(c, "step 2 bar", f(0.23), f(0.5), f(0.6), f(0.13)), 0.1875, 0.375);
        win(rect(c, "step 2 foot", f(0.23), f(0.6), f(0.135), f(0.1)), 0.1875, 0.375);
        win(rect(c, "step 3 tower", f(0.6), f(0.27), f(0.23), f(0.33)), 0.25, 0.375);
        win(mono(c, "step 4 50", "50", 243, f(0.545), 88, "l"), 0.375, 0.5);
        win(rect(c, "step 4 block", f(0.53), f(0.5), f(0.13), f(0.13)), 0.375, 0.5);
        win(rect(c, "step 5 bar", f(0.19), f(0.28), f(0.38), f(0.12)), 0.5, 0.5625);
        win(rect(c, "step 5/6 block", f(0.6), f(0.38), f(0.13), f(0.12)), 0.5, 0.625);
        win(rect(c, "step 6 bar", f(0.19), f(0.37), f(0.39), f(0.13)), 0.5625, 0.625);
        var z = rect(c, "step 7 blurred bar", f(0.18), f(0.48), f(0.39), f(0.14));
        setFx(z.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2"), "ADBE Gaussian Blur 2-0001", 14);
        win(z, 0.625);
    });

    shot("Formats", 5.875, 6.875, function (c) {
        texturePanel(c, "panel", 313, 335, 567, 453, {bright: 1.2, seed: 7, a: 0, b: 0.4375});
        var sq = rect(c, "hopping block", 0, 0, 140, 135);
        hold(tr(sq).property("ADBE Position"), [[0, [420, 378]], [0.4375, [552, 508]]]);
        win(sq, 0.3125, 0.625);
        scramble(mono(c, "formats", BRAND.formats, L, 702, 30, "l", {measureAt: "end"}), BRAND.formats, {stagger: 0.035, hold: 0.12, seed: 91});
    });

    shot("Www", 6.875, 7.5, function (c) {
        texturePanel(c, "panel", 300, 290, 480, 130, {bright: 2, seed: 8, a: 0.375, b: 0.5625});
        var gk = [[0, 0], [0.1875, 22], [0.3125, 60], [0.4375, 100]], gKeys = [], rKeys = [];
        for (var i = 0; i < gk.length; i++) { gKeys.push([gk[i][0], [-gk[i][1] / 2, 0]]); rKeys.push([gk[i][0], [gk[i][1] / 2, 0]]); }
        wwwBadge(c, "WWW", 540, 540, 140, 8, {globe: true, globeKeys: gKeys, ringKeys: rKeys});
    });

    shot("FlashSi", 7.5, 7.6875, function (c) {
        texturePanel(c, "panel", 290, 290, 500, 500, {bright: 2.4, seed: 9, a: 0, b: 0.09375});
        streaks(c, "streak", 300, 320, 480, 46, 2, {a: 0.09375});
        win(mono(c, "SI<", "SI<", 540, 540, 80, "c"), 0.09375);
    });

    shot("ThreeSixFive", 7.6875, 8.0625, function (c) {
        texturePanel(c, "panel", 0, 470, 930, 270, {bright: 1.3, seed: 10, a: 0.1875});
        var lines = [["Three", "3", 470, 0], ["Six", "6", 557, 0.0625], ["Five", "5", 692, 0.1875]];
        for (var i = 0; i < 3; i++) {
            var t = text(c, lines[i][0], lines[i][0] + lines[i][1], 340, lines[i][2], 118, F.g700, "base", {tracking: -25});
            var sup = addAnimator(t, "Superscript");
            var sp = sup.property("ADBE Text Animator Properties");
            sp.addProperty("ADBE Text Scale 3D").setValue([42, 42, 100]);
            sp.addProperty("ADBE Text Position 3D").setValue([6, -47, 0]);
            indexSelector(sup, "textTotal - 1;", "textTotal;");
            win(t, lines[i][3]);
        }
        win(text(c, "6 (preview)", "6", 530, 540, 50, F.g700, "bc"), 0.03, 0.0625);
    });

    shot("BlobMorph", 8.0625, 8.375, function (c) {
        texturePanel(c, "panel", 0, 440, 930, 280, {bright: 1.1, seed: 10, a: 0, b: 0.1875});
        var BL = [
            [[[-160, 60], [-160, 0], [-40, 0], [-40, 60]], [[-40, 0], [-40, -70], [40, -70]], [[90, -70], [90, 60], [150, 60]]],
            [[[-170, 70], [-170, 10], [-70, 10], [-70, 70], [-170, 70]], [[-10, 70], [-10, -50]], [[-10, -10], [60, -10]], [[120, -70], [120, 0]]],
            [[[-130, 70], [20, 70], [20, -50]], [[20, -50], [90, -50], [90, 0], [20, 0]]]
        ];
        var wins = [[0, 0.09375], [0.09375, 0.1875], [0.1875, 0.3125]];
        for (var k = 0; k < BL.length; k++) {
            var l = absShape(c, "blob " + (k + 1));
            var g = group(vecs(l), "strokes");
            for (var p = 0; p < BL[k].length; p++) {
                var pts = [];
                for (var q = 0; q < BL[k][p].length; q++) pts.push([540 + BL[k][p][q][0], 540 + BL[k][p][q][1]]);
                addPath(gv(g), pts, false);
            }
            var s = addStroke(gv(g), 58, WHITE, 2);
            s.property("ADBE Vector Stroke Line Join").setValue(2);
            win(l, wins[k][0], wins[k][1]);
        }
    });

    shot("PillsChart", 8.375, 8.8125, function (c) {
        texturePanel(c, "panel", 432, 270, 430, 530, {seed: 12});
        pill(c, "pill A", 340, 395, 150, 46, 4, {a: 0, b: 0.125});
        pill(c, "pill B", 350, 510, 44, 140, 4, {a: 0, b: 0.125});
        pill(c, "pill C", 410, 630, 170, 46, 4, {a: 0, b: 0.125});
        lineChart(c, "chart", 270, 390, 560, 300, {a: 0.125, ms: 11});
    });

    shot("Grids", 8.8125, 9.125, function (c) {
        pixelGridIcon(c, "grid A", 292, 420, 6, 6, 34, 1, {sw: 2.4, mask: ["######", "#.##.#", "######", "#.##.#", "######", "##..##"]});
        pixelGridIcon(c, "grid B", 540, 420, 6, 6, 34, 2, {sw: 2.4, mask: ["##.##.", "#..###", "##.#..", ".###.#", "#.#.##", "###..#"]});
    });

    shot("Wave", 9.125, 9.375, function (c) {
        waveform(c, "waveform", 205, 540, 680, 70, 64, 1.6, {seed: 7, revealSpeed: 4});
    });

    shot("Decoder", 9.375, 9.5625, function (c) {
        texturePanel(c, "panel", 120, 498, 850, 120, {bright: 2, seed: 13, a: 0.09375});
        var top = capTop(400, 74, 1.18), lh = 1.18 * 74;
        var l1 = mono(c, "line 1", "50 BESPOKE", 195, top, 74, "tl", {measureAt: "end"});
        scramble(l1, "50 BESPOKE", {hold: 0.03, stagger: 0.012, seed: 111});
        var l2 = mono(c, "line 2", "027.21 $66(76", 195, top + lh, 74, "tl", {measureAt: "end"});
        scramble(l2, "027.21 $66(76", {start: 0.09375, hold: 0.05, stagger: 0.01, seed: 112});
        win(l2, 0.09375);
        var l3 = mono(c, "line 3", "$(", 195, top + 2 * lh, 74, "tl", {measureAt: "end"});
        scramble(l3, "$(", {start: 0.09375, hold: 0.05, stagger: 0.01, seed: 113});
        win(l3, 0.09375);
    });

    shot("Bone", 9.5625, 10.125, function (c) {
        texturePanel(c, "panel", 200, 470, 760, 140, {bright: 2, seed: 14, a: 0, b: 0.0625});
        streaks(c, "streak", 560, 520, 300, 60, 2, {a: 0, b: 0.125});
        dumbbell(c, "dumbbell", 540, 540, 380, 56, "[" + (380 - 112) + ", time < 0.0625 ? 4 : 22 + Math.abs(Math.sin(time * 7)) * 36];");
    });

    shot("Edition", 10.125, 10.6875, function (c) {
        texturePanel(c, "panel tall", 432, 130, 508, 820, {bright: 1.2, seed: 15, a: 0, b: 0.4375});
        texturePanel(c, "panel wide", 0, 300, 1080, 470, {seed: 16, a: 0.4375});
        editionBar(c, "edition", 227, 490, 627, 100, {
            flipUntil: 0.25,
            gapExpr: function (i) { return "seedRandom(textIndex * 17 + " + i + " * 400, true); random() > Math.min(1, time / 0.45) ? 100 : 0;"; }
        });
        var lab = monoTL(c, "coords", "52.52° N, 13.40° E", 830, 355, 9, 1.25, {measureAt: "end"});
        scramble(lab, "52.52° N, 13.40° E", {stagger: 0.006, hold: 0.05, seed: 121});
    });

    shot("Ring", 10.6875, 11.125, function (c) {
        texturePanel(c, "panel", 0, 330, 1080, 420, {bright: 1.3, seed: 17, a: 0, b: 0.1875});
        copyrightRing(c, "copyright", 540, 540, 160, {spinKeys: [[0, -50], [0.0625, -28], [0.125, -12], [0.1875, 0]], iBar: 0.0625});
    });

    shot("Invader", 11.125, 11.5, function (c) {
        texturePanel(c, "panel", 540, 380, 540, 290, {bright: 1.6, seed: 18, a: 0.125, b: 0.25});
        win(rect(c, "grey bar", 540, 372, 540, 4, {col: [0.6, 0.6, 0.6]}), 0.1875, 0.3125);
        glyph(c, "invader A", INVADER, 32, 540, 540, {a: 0, b: 0.125});
        glyph(c, "invader B", INVADER_B, 32, 560, 540, {a: 0.125, b: 0.1875});
        glyph(c, "hook", HOOK, 32, 560, 540, {a: 0.1875, b: 0.3125});
    });

    shot("Register", 11.5, 11.875, function (c) {
        texturePanel(c, "panel", 0, 420, 540, 240, {bright: 1.6, seed: 19, a: 0.0625, b: 0.1875});
        crosshair(c, "crosshair", 540, 540, 420, 56, 5, {scaleKeys: [[0, [40, 40]], [0.0625, [65, 65]], [0.125, [85, 85]], [0.25, [100, 100]]]});
    });

    shot("Serial", 11.875, 12.0625, function (c) {
        win(mono(c, "serial", "LOC794\r-2", 205, capTop(378, 96, 1.08), 96, "tl", {leading: 103.7}), 0.125);
    });

    shot("Dots", 12.0625, 12.34375, function (c) {
        texturePanel(c, "panel", 324, 108, 432, 886, {seed: 20});
        dotMatrix(c, "dot matrix", 540, 540, 5, 5, 62, 19);
    });

    // ================================================================
    // LOCKUP SHEET (810 × 810 design space, coordinates measured from the reference)
    // ================================================================
    var sheet = proj.items.addComp("SHEET_LockupSheet", 810, 810, 1, 8, FPS);
    sheet.parentFolder = root;
    sheet.bgColor = SHEET_BG;
    tryDo("lockup sheet", function () {
        var c = sheet;
        rect(c, "background", 0, 0, 810, 810, {col: SHEET_BG}).moveToEnd();
        var G = [0.81, 0.81, 0.81];
        var STEP = "Math.floor(time / 0.125 + 1e-6)", EIGHTH = "Math.floor(time / 0.25 + 1e-6)";
        function t8(comp, name, str, x, y, size, font, anchor, opt) { return text(comp, name, str, x, y, size, font, anchor, opt); }

        // ── row 1: rounded-bar micro glyphs (2 variants each, swap on 1/8 notes)
        var MICRO = [
            {fill: true, v: [[[30, 22, 40, 11], [24, 40, 52, 11], [62, 46, 24, 11], [38, 61, 34, 11]], [[26, 22, 48, 11], [40, 40, 44, 11], [26, 58, 24, 11], [58, 58, 38, 11]]]},
            {fill: false, v: [[[150, 22, 38, 11], [118, 40, 26, 22], [148, 40, 46, 11], [150, 60, 30, 11]], [[120, 22, 30, 11], [140, 38, 52, 11], [118, 56, 40, 14], [166, 58, 26, 11]]]},
            {fill: true, v: [[[212, 22, 32, 11], [212, 22, 11, 40], [232, 44, 18, 11], [256, 50, 34, 11], [270, 38, 11, 26]], [[222, 24, 46, 11], [212, 40, 32, 11], [250, 48, 11, 22], [260, 60, 30, 11]]]},
            {fill: false, v: [[[305, 40, 24, 26], [316, 58, 24, 11], [340, 22, 38, 11], [358, 30, 11, 40]], [[310, 24, 42, 11], [305, 44, 30, 11], [346, 44, 11, 26], [360, 60, 24, 11]]]}
        ];
        for (var k = 0; k < MICRO.length; k++) {
            for (var v = 0; v < 2; v++) {
                var ml = absShape(c, "micro glyph " + (k + 1) + (v ? "b" : "a"));
                var mg = group(vecs(ml), "bars");
                for (var b = 0; b < MICRO[k].v[v].length; b++) {
                    var R = MICRO[k].v[v][b];
                    addRect(gv(mg), R[0], R[1], R[2], R[3], Math.min(R[2], R[3]) / 2);
                }
                if (MICRO[k].fill) addFill(gv(mg), WHITE); else addStroke(gv(mg), 1.6, G);
                tr(ml).property("ADBE Opacity").expression = "(" + EIGHTH + " + " + k + ") % 2 == " + v + " ? 100 : 0;";
            }
        }
        var sp = absShape(c, "sparkles");
        var sxs = [410, 433, 457], sys = [34, 58];
        for (var si = 0; si < 3; si++) for (var sj = 0; sj < 2; sj++) {
            var sg = group(vecs(sp), "sparkle");
            var st4 = gv(sg).addProperty("ADBE Vector Shape - Star");
            st4.property("ADBE Vector Star Type").setValue(1);
            st4.property("ADBE Vector Star Points").setValue(4);
            st4.property("ADBE Vector Star Outer Radius").setValue(9);
            st4.property("ADBE Vector Star Inner Radius").setValue(2.6);
            st4.property("ADBE Vector Star Position").setValue([sxs[si], sys[sj]]);
            addFill(gv(sg), WHITE);
        }
        var fl = absShape(c, "flower");
        var fc = group(vecs(fl), "centre"); addEllipse(gv(fc), 507, 47, 4.5); addFill(gv(fc), SHEET_BG);
        var fg = group(vecs(fl), "petals");
        for (var p = 0; p < 4; p++) addEllipse(gv(fg), 507 + Math.cos(p * Math.PI / 2) * 12.5, 47 + Math.sin(p * Math.PI / 2) * 12.5, 12.5);
        addFill(gv(fg), WHITE);
        var eye = absShape(c, "eye");
        var eg = group(vecs(eye), "eye");
        addPath(gv(eg), [[548, 47], [638, 47]], false);
        addEllipse(gv(eg), 585, 47, 23); addEllipse(gv(eg), 601, 47, 23); addEllipse(gv(eg), 593, 47, 7);
        addStroke(gv(eg), 3);
        circle(c, "eye dot", 593, 47, 2.5, {fill: WHITE});
        var tri = absShape(c, "triangle grid");
        var tg = group(vecs(tri), "triangles");
        for (var ti = 0; ti < 20; ti++) {
            var tx = 650 + (ti % 4) * 13.5, ty = 22 + Math.floor(ti / 4) * 10.2;
            addPath(gv(tg), [[tx, ty], [tx + 11, ty], [tx, ty + 8]], true);
        }
        addFill(gv(tg), WHITE);
        var dg = absShape(c, "dot grid");
        var dgg = group(vecs(dg), "dots");
        for (var di = 0; di < 20; di++) addEllipse(gv(dgg), 722 + (di % 5) * 11.2, 27 + Math.floor(di / 5) * 12.5, 4.5);
        addFill(gv(dgg), WHITE);

        // ── row 2: protractor, pixel words, tube band, WWW
        var PX = 25, PY = 85, PW = 225, PH = 155, PCX = 240, PCY = 163;
        rect(c, "protractor plate", PX, PY, PW, PH);
        var pr = absShape(c, "protractor lines");
        var gl = group(vecs(pr), "grid");
        for (var gi = 0; gi < 8; gi++) addPath(gv(gl), [[PX + 25 + gi * 25, PY], [PX + 25 + gi * 25, PY + PH]], false);
        addStroke(gv(gl), 1, [0.78, 0.78, 0.78]);
        var arcs = group(vecs(pr), "arcs");
        addEllipse(gv(arcs), PCX, PCY, 58); addEllipse(gv(arcs), PCX, PCY, 108); addEllipse(gv(arcs), PCX, PCY, 156);
        addPath(gv(arcs), [[PX, PCY], [PCX, PCY]], false);
        addStroke(gv(arcs), 1.8, BLACK);
        var rays = group(vecs(pr), "rays");
        var angs = [-62, -38, -14, 14, 38, 62];
        for (var ai = 0; ai < angs.length; ai++) {
            var ar = (angs[ai] + 180) * Math.PI / 180;
            addPath(gv(rays), [[PCX, PCY], [PCX + Math.cos(ar) * 400, PCY + Math.sin(ar) * 400]], false);
        }
        addStroke(gv(rays), 1.8, BLACK);
        // fresh lookup (adding groups invalidates earlier references)
        var raysT = gtr(vecs(pr).property("rays"));
        raysT.property("ADBE Vector Anchor").setValue([PCX, PCY]);
        raysT.property("ADBE Vector Position").setValue([PCX, PCY]);
        raysT.property("ADBE Vector Rotation").expression = "(" + STEP + " % 4) * 2;";
        var pm = pr.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var pms = new Shape(); pms.vertices = [[PX, PY], [PX + PW, PY], [PX + PW, PY + PH], [PX, PY + PH]]; pms.closed = true;
        pm.property("ADBE Mask Shape").setValue(pms);

        var pwx = [272, 355, 408, 490, 543];
        for (var pw = 0; pw < pwx.length; pw++) {
            var vars = [];
            for (var pv = 0; pv < 3; pv++) vars.push(seededGlyph(300 + pw * 7 + pv, 5, 5, 0.55));
            flickerGlyphs(c, "pixel word " + (pw + 1), vars, 10.6, pwx[pw], 92, 2.6667, {tl: true, seed: 400 + pw});
        }
        var tube = absShape(c, "tube band");
        for (var tb = 0; tb < 14; tb++) {
            var tgx = group(vecs(tube), "tube " + (tb + 1)), x = 278 + tb * 21.5;
            addPath(gv(tgx), [[x, 162], [x + 8, 162], [x + 8, 182], [x + 40, 214], [x + 40, 238], [x + 32, 238], [x + 32, 216], [x, 184]], true);
            var ts = addStroke(gv(tgx), 1.5, [0.85, 0.85, 0.85]);
            ts.property("ADBE Vector Stroke Line Join").setValue(2);
        }
        tr(tube).property("ADBE Position").expression = "[(" + STEP + " % 2) * 2, 0];";
        wwwBadge(c, "sheet WWW", 730, 160, 54, 4, {globe: true, globeKeys: [[0, [-59, 0]]]});

        // ── tagline pill, tags, step stack
        rect(c, "tagline pill", 22, 255, 583, 46, {round: 23, sw: 3});
        var tag = t8(c, "tagline", BRAND.tagline, 43, 279, 27, F.g700, "l", {measureAt: 3});
        tag.property("ADBE Text Properties").property("ADBE Text Document").expression =
            "var s = \"" + esc(BRAND.tagline) + "\"; var p = Math.max(0, Math.min(1, (time - 0.875) / 0.45));\rs.substr(0, Math.round(s.length * p));";
        fitWidth(tag, 542, 3);
        polyLayer(c, "tag A", [[622, 253], [632.5, 244], [643, 253], [643, 273], [632.5, 266], [622, 273]]);
        var tA = absShape(c, "tag A arrow");
        var tAg = group(vecs(tA), "arrow");
        addPath(gv(tAg), [[632.5, 252], [632.5, 265]], false); addPath(gv(tAg), [[627, 257], [632.5, 251], [638, 257]], false);
        addStroke(gv(tAg), 2.4, BLACK);
        var tB = absShape(c, "tag B");
        var tBg = group(vecs(tB), "tag");
        addPath(gv(tBg), [[656, 253], [666.5, 244], [677, 253], [677, 273], [666.5, 266], [656, 273]], true);
        addStroke(gv(tBg), 1.6);
        var tBa = group(vecs(tB), "arrow");
        addPath(gv(tBa), [[666.5, 252], [666.5, 265]], false); addPath(gv(tBa), [[661, 257], [666.5, 251], [672, 257]], false);
        addStroke(gv(tBa), 2.4);
        var stack = absShape(c, "step stack");
        for (var sk = 0; sk < 21; sk++) {
            var sgp = group(vecs(stack), "band " + (sk + 1));
            var spth = addPath(gv(sgp), [[700, 0], [782, 0]], false);
            spth.property("ADBE Vector Shape").expression =
                "var y = " + (222 + sk * 16.5) + ", d = 18, mid = 726 + 9 * Math.sin(" + sk + " * 0.55 + " + STEP + " * 0.35);\r" +
                "createPath([[700, y + d], [mid, y + d], [mid + d, y], [782, y]], [], [], false);";
            addStroke(gv(sgp), 10);
        }
        var stm = stack.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var stms = new Shape(); stms.vertices = [[702, 226], [780, 226], [780, 548], [702, 548]]; stms.closed = true;
        stm.property("ADBE Mask Shape").setValue(stms);

        // ── copy block + hanging bars
        rect(c, "copy block", 25, 312, 335, 62, {round: 6});
        var cb = absShape(c, "copy block C");
        var cbr = group(vecs(cb), "ring"); addEllipse(gv(cbr), 52, 343, 19); addStroke(gv(cbr), 5, BLACK);
        var cbc = group(vecs(cb), "C"); addEllipse(gv(cbc), 52, 343, 10.5); addStroke(gv(cbc), 4.5, BLACK);
        var cbt = gv(vecs(cb).property("C")).addProperty("ADBE Vector Filter - Trim");
        cbt.property("ADBE Vector Trim Start").setValue(10);
        cbt.property("ADBE Vector Trim End").setValue(90);
        cbt.property("ADBE Vector Trim Offset").setValue(90);
        var COPY = ["ALL GRAPHICS SUPPLIED AS PART OF THIS PACK ARE LICENSED", "FOR USE IN PERSONAL AND COMMERCIAL WORK. NO PART MAY BE",
            "RESOLD OR REDISTRIBUTED AS-IS, IN ANY FORM OR BY ANY", "MEANS, DIGITAL OR PRINTED, WITHOUT THE PRIOR WRITTEN",
            "PERMISSION OF THE STUDIO, EXCEPT IN THE CASE OF BRIEF", "QUOTATIONS EMBODIED IN CRITICAL REVIEWS AND PREVIEWS"];
        for (var cl = 0; cl < COPY.length; cl++) {
            var ct = t8(c, "copy line " + (cl + 1), COPY[cl], 92, 322.5 + cl * 8.9, 7.6, F.g700, "base", {col: BLACK});
            tr(ct).property("ADBE Anchor Point").expression = "var r = sourceRectAtTime(0, false);\r[r.left, 0];";
            fitWidth(ct, 260, 0);
        }
        var hb = absShape(c, "hanging bars");
        var rail = group(vecs(hb), "rail"); addRect(gv(rail), 373, 312, 297, 3.5); addFill(gv(rail), WHITE);
        for (var hi = 0; hi < 48; hi++) {
            var hg = group(vecs(hb), "bar " + (hi + 1)), bx = 373 + hi * 6.2;
            var hr = addRect(gv(hg), bx, 312, 3.4, 40);
            var rnd = "seedRandom(" + (9000 + hi) + " + Math.floor(time * 7.5) * 131, true); var h = 62 * (0.3 + random() * 0.7);\r";
            hr.property("ADBE Vector Rect Size").expression = rnd + "[3.4, h];";
            hr.property("ADBE Vector Rect Position").expression = rnd + "[" + (bx + 1.7) + ", 312 + h / 2];";
            addFill(gv(hg), WHITE);
        }

        // ── pixel grids + waveform
        var pgx = [22, 112, 205, 297];
        for (var pg = 0; pg < 4; pg++) pixelGridIcon(c, "pixel grid " + (pg + 1), pgx[pg], 386, 6, 5, 11.2, 10 + pg, {sw: 1.4});
        waveform(c, "waveform", 373, 412, 297, 36, 60, 1.5, {seed: 11});

        // ── chart + files + edition
        lineChart(c, "chart", 47, 467, 168, 76, {ms: 6});
        polyLayer(c, "file A", [[234, 465], [234, 500], [292, 500], [292, 470], [262, 470], [256, 461], [234, 461]]);
        t8(c, "file A label", "FILE", 263, 491, 8, F.monoB, "bc", {col: BLACK, fauxItalic: true});
        var fB = absShape(c, "file B");
        var fBg = group(vecs(fB), "folder");
        addPath(gv(fBg), [[298, 465], [298, 500], [356, 500], [356, 470], [326, 470], [320, 461], [298, 461]], true);
        addStroke(gv(fBg), 1.8);
        t8(c, "file B label", "FILE", 327, 491, 8, F.monoB, "bc", {fauxItalic: true});
        var oc = absShape(c, "chip outline");
        var ocg = group(vecs(oc), "chip");
        addPath(gv(ocg), [[240, 506], [274, 506], [274, 540], [268, 546], [234, 546], [234, 512]], true);
        addStroke(gv(ocg), 1.8);
        polyLayer(c, "chip filled", [[286, 506], [318, 506], [318, 540], [312, 546], [280, 546], [280, 512]]);
        // edition strip (sheet scale: arrow ↘, letter gaps flicker)
        var EX = 372, EY = 477, EW = 301, EH = 47, u = EH * 0.16;
        var ed = absShape(c, "sheet edition bar");
        var eda = group(vecs(ed), "arrow ↘"); addPath(gv(eda), arrowPts(EX, EY, u, false), true); addFill(gv(eda), BLACK);
        var edd = group(vecs(ed), "D");
        var dx = EX + u * 7, dy = EY + u;
        addPath(gv(edd), [[dx, dy], [dx + u * 3.4, dy], [dx + u * 4.6, dy + u * 1.2], [dx + u * 4.6, dy + u * 3.2], [dx + u * 3.4, dy + u * 4.4], [dx, dy + u * 4.4]], true);
        addPath(gv(edd), [[dx + u * 1.4, dy + u * 1.3], [dx + u * 2.9, dy + u * 1.3], [dx + u * 2.9, dy + u * 3.1], [dx + u * 1.4, dy + u * 3.1]], true);
        gv(edd).addProperty("ADBE Vector Filter - Merge").property("ADBE Vector Merge Type").setValue(5);
        addFill(gv(vecs(ed).property("D")), BLACK);
        var edr = group(vecs(ed), "registered"); addEllipse(gv(edr), EX + EW - 19, EY + 12, 7.5); addStroke(gv(edr), 1.6, BLACK);
        var eds = group(vecs(ed), "strip (under)");
        addPath(gv(eds), [[EX, EY], [EX + EW, EY], [EX + EW, EY + EH - u], [EX + EW - u, EY + EH], [EX, EY + EH]], true);
        addFill(gv(eds), WHITE);
        t8(c, "sheet edition R", "R", EX + EW - 19, EY + 12.5, 9, F.g800, "c", {col: BLACK});
        var elab = t8(c, "sheet edition label", BRAND.edition, EX, EY - 7, 19, F.g700, "base", {tracking: -21});
        var ecap = t8(c, "sheet edition caption", BRAND.copyright, EX + 6, EY + EH + 20, 16, F.g700, "base");
        tr(ecap).property("ADBE Anchor Point").expression = "var r = sourceRectAtTime(0, false);\r[r.left, 0];";
        fitWidth(ecap, EW - 12, 0);
        var eL = [elab, ecap];
        for (var ei = 0; ei < 2; ei++) {
            var an = addAnimator(eL[ei], "Gaps");
            an.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity").setValue(0);
            exprSelector(an, "seedRandom(textIndex * 17 + " + ei + " * 400 + Math.floor(time * 15) * 3, true); random() < 0.18 ? 100 : 0;");
        }

        // ── badges row
        var dip = t8(c, "DESIGN IN PROGRESS", "DESIGN IN PROGRESS", 27, 655, 134, F.g800, "base", {stroke: {col: SHEET_BG, w: 1.3}});
        tr(dip).property("ADBE Anchor Point").expression = "var r = sourceRectAtTime(0, false);\r[r.left, 0];";
        fitWidth(dip, 195, 0);
        starBurst(c, "star", 257, 595, 25, 8);
        rect(c, "recognition pill", 297, 560, 113, 48, {round: 24, sw: 2.5});
        wireGlobe(c, "recognition globe", 322, 584, 17, 2, {spin: 1.5});
        var map = absShape(c, "world map");
        var mpg = group(vecs(map), "land");
        addEllipse(gv(mpg), 352, 576, 7, 5); addEllipse(gv(mpg), 359, 595, 3, 7); addEllipse(gv(mpg), 375, 577, 10, 6); addEllipse(gv(mpg), 388, 595, 4, 3);
        addFill(gv(mpg), WHITE);
        t8(c, "INTERNATIONAL", "INTERNATIONAL", 353, 569, 5.5, F.g700, "bc");
        t8(c, "RECOGNITION", "RECOGNITION", 353, 604, 5.5, F.g700, "bc");
        circle(c, "earth outline", 448, 585, 25, {sw: 2});
        var ea = absShape(c, "earth land");
        var eag = group(vecs(ea), "land");
        addEllipse(gv(eag), 440, 574, 10, 7); addEllipse(gv(eag), 461, 594, 8, 6); addEllipse(gv(eag), 463, 568, 3, 2);
        addFill(gv(eag), WHITE);
        hatch(c, "sheet hatch", 490, 560, 120, 54, 7, {driftExpr: "[(" + STEP + " * 4) % " + ((120 + 54) / 7).toFixed(3) + ", 0];"});
        copyrightRing(c, "sheet ring", 668, 588, 29, {spinExpr: "time * 70"});
        var sups = [["Three", "3", 576], ["Six", "6", 599], ["Five", "5", 622]];
        for (var su = 0; su < 3; su++) {
            var stt = t8(c, "sup " + sups[su][0], sups[su][0] + sups[su][1], 708, sups[su][2], 23, F.g700, "base", {tracking: -30});
            var sa = addAnimator(stt, "Superscript");
            var sap = sa.property("ADBE Text Animator Properties");
            sap.addProperty("ADBE Text Scale 3D").setValue([52, 52, 100]);
            sap.addProperty("ADBE Text Position 3D").setValue([1, -9, 0]);
            indexSelector(sa, "textTotal - 1;", "textTotal;");
        }

        // ── merch row
        circle(c, "digit ring 3", 253, 637, 16.5, {sw: 2.4});
        var ov = absShape(c, "digit oval 6");
        var ovg = group(vecs(ov), "oval"); addEllipse(gv(ovg), 285, 637, 11, 16.5); addStroke(gv(ovg), 2.4);
        circle(c, "digit ring 5", 317, 637, 16.5, {sw: 2.4});
        var dgt = [["3", 253], ["6", 285], ["5", 317]];
        for (var dd = 0; dd < 3; dd++) t8(c, "digit " + dgt[dd][0], dgt[dd][0], dgt[dd][1], 638, 21, F.g700, "c");
        rect(c, "merch box", 343, 623, 123, 29, {sw: 1.5});
        line(c, "merch divider", 343, 637.5, 466, 637.5, 1.5);
        var mt = [["OFFICIAL MERCHANDISE — 365", 634], ["MADE IN THE STUDIO, VOL. 3", 648.5]];
        for (var mi = 0; mi < 2; mi++) {
            var mtl = t8(c, "merch " + (mi + 1), mt[mi][0], 347, mt[mi][1], 8, F.g700, "base");
            tr(mtl).property("ADBE Anchor Point").expression = "var r = sourceRectAtTime(0, false);\r[r.left, 0];";
            fitWidth(mtl, 115, 0);
        }
        dumbbell(c, "sheet dumbbell", 511, 640, 59, 9.5, "[" + (59 - 19) + ", 5 + Math.abs(Math.sin(time * 9)) * 5];");
        crosshair(c, "sheet crosshair", 617, 640, 114, 17, 1.8);
        var PS = [[[715, 627], [741, 627], [688, 640], [728, 640], [768, 640]], [[702, 627], [741, 627], [688, 640], [715, 640], [768, 640]]];
        for (var pv2 = 0; pv2 < 2; pv2++) {
            var psl = absShape(c, "pixel strip " + (pv2 ? "b" : "a"));
            var psg = group(vecs(psl), "cells");
            for (var pc = 0; pc < 5; pc++) addRect(gv(psg), PS[pv2][pc][0], PS[pv2][pc][1], 13.3, 13.3);
            addFill(gv(psg), WHITE);
            tr(psl).property("ADBE Opacity").expression = EIGHTH + " % 2 == " + (pv2 ? 0 : 1) + " ? 100 : 0;";
        }
        var tk = absShape(c, "ticks");
        var tkg = group(vecs(tk), "ticks"), trn = prng(77);
        for (var tki = 0; tki < 30; tki++) if (trn() >= 0.45) addRect(gv(tkg), 490 + tki * 9.8, 665, 2, 8);
        addRect(gv(tkg), 626, 694, 9, 2);
        addFill(gv(tkg), WHITE);

        // ── footer utilities
        rect(c, "vol box", 28, 664, 100, 28, {sw: 1.4});
        line(c, "vol divider", 48, 664, 48, 692, 1.4);
        starBurst(c, "vol star", 38, 678, 7, 12, 0.45);
        t8(c, "vol", "VOL. 03 — 2026", 54, 675, 7.5, F.g700, "base");
        t8(c, "vol sub", "Assembled in-house", 54, 687, 7.5, F.g500, "base");
        rect(c, "slider", 145, 665, 197, 28, {round: 14});
        var stk = absShape(c, "slider ticks");
        var stkg = group(vecs(stk), "ticks");
        for (var sti = 0; sti < 40; sti++) addPath(gv(stkg), [[162 + sti * 4.1, 672], [162 + sti * 4.1, 686]], false);
        addStroke(gv(stkg), 1.3, BLACK);
        var knob = absShape(c, "slider knob");
        var kg = group(vecs(knob), "knob"); addEllipse(gv(kg), 0, 679, 12); addFill(gv(kg), WHITE); addStroke(gv(kg), 2.4, SHEET_BG);
        var kr = group(vecs(knob), "halo"); addEllipse(gv(kr), 0, 679, 14.5); addStroke(gv(kr), 1.2);
        tr(knob).property("ADBE Position").expression = "[170 + (0.5 + 0.38 * Math.sin(time * 3)) * 150, 0];";
        circle(c, "ring small", 382, 679, 16, {sw: 2.2});
        var co = absShape(c, "collab");
        var cog = group(vecs(co), "rings"); addEllipse(gv(cog), 427, 679, 17); addEllipse(gv(cog), 451, 679, 17); addStroke(gv(cog), 1.8);
        t8(c, "COLLAB", "COLLAB", 439, 680, 8, F.g700, "c");

        // ── title block
        t8(c, "title LOCKUP", "LOCKUP", 24, 752, 43.5, F.g800, "base", {tracking: -37});
        t8(c, "title IN MOTION", "IN MOTION", 24, 787, 43.5, F.g800, "base", {tracking: -37});
        t8(c, "credit", BRAND.studio.toUpperCase() + " × " + BRAND.partner + " DESIGN", 276, 787, 7, F.mono, "base");
        t8(c, "volume", BRAND.volume, 490, 787, 7, F.mono, "base");
        circle(c, "big 3 ring", 747, 750, 33, {sw: 5});
        t8(c, "big 3", "3", 747, 752, 46, F.g700, "c");
    });

    function squareShape(l, t, r, b) { var s = new Shape(); s.vertices = [[l, t], [r, t], [r, b], [l, b]]; s.closed = true; return s; }
    function sheetLayer(c, name, startAt) {
        var s = c.layers.add(sheet);
        s.name = name;
        if (startAt) s.startTime = startAt;
        pos(s, [540, 540]);
        tr(s).property("ADBE Scale").setValue([872 / 8.1, 872 / 8.1]);
        return s;
    }

    // ================================================================
    // FINALE  12.34 – 20 s
    // ================================================================
    shot("SheetShot", 12.34375, 15.375, function (c) {
        texturePanel(c, "panel top", 324, 0, 432, 420, {seed: 20, a: 0, b: 0.0625});
        dotMatrix(c, "dots (top)", 540, 230, 5, 3, 62, 19, {a: 0, b: 0.0625});
        texturePanel(c, "panel left", 0, 0, 560, 1080, {bright: 1.2, seed: 21, a: 0.0625, b: 0.25});
        var s = sheetLayer(c, "LOCKUP SHEET");
        var mk = s.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var P = function (v) { return v * 810; };
        hold(mk.property("ADBE Mask Shape"), [
            [0, squareShape(P(0.04), P(0.48), P(0.74), P(0.96))],
            [0.0625, squareShape(P(0.40), P(0.04), P(0.96), P(0.96))],
            [0.125, squareShape(-10, -10, 820, 820)]
        ]);
        hold(tr(s).property("ADBE Opacity"), [[0, 100], [1.5, 62], [1.625, 100], [2.8125, 66], [2.9375, 100]]);
        var inv = s.property("ADBE Effect Parade").addProperty("ADBE Invert");
        hold(inv.property("ADBE Invert-0002"), [[0, 100], [2.9375, 10]]); // Blend With Original: 100 = untouched
        texturePanel(c, "panel over (top-left)", 104, 0, 420, 340, {bright: 1.3, seed: 22, a: 0.125, b: 0.3125});
        win(rect(c, "white A", 108, 590, 300, 290), 0.0625, 0.125);
        win(rect(c, "white B", 650, 0, 330, 260), 0.0625, 0.125);
        var grey = rect(c, "grey corner", 104, 104, 290, 230, {col: [0.63, 0.63, 0.63]});
        grey.blendingMode = BlendingMode.SCREEN;
        tr(grey).property("ADBE Opacity").setValue(55);
        win(grey, 1.25, 1.3125);
        var iw = rect(c, "invert window", 205, 335, 670, 640);
        iw.blendingMode = BlendingMode.DIFFERENCE;
        win(iw, 1.3125, 1.4375);
        win(rect(c, "white block top", 200, 0, 660, 390), 1.4375, 1.5);
        win(rect(c, "white block left", 110, 572, 300, 290), 1.4375, 1.5);
    });

    shot("SheetChop", 15.375, 15.5, function (c) {
        var s = sheetLayer(c, "LOCKUP SHEET (inverted)", -3);
        var inv = s.property("ADBE Effect Parade").addProperty("ADBE Invert");
        tryDo("invert blend", function () { inv.property("ADBE Invert-0002").setValue(10); });
        rect(c, "chop black", 0, 0, 540, 540, {col: BLACK});
        rect(c, "chop pixel", 540, 300, 24, 24);
        var m = rect(c, "chop grey", 104, 540, 436, 436, {col: [0.165, 0.165, 0.165]});
        m.blendingMode = BlendingMode.MULTIPLY;
    });

    shot("PixelCollapse", 15.5, 16.0, function (c) {
        texturePanel(c, "panel", 216, 216, 470, 640, {bright: 1.2, seed: 23, a: 0, b: 0.375});
        glyph(c, "pixels 2x2 A", [".+", "+-"], 46, 560, 540, {a: 0, b: 0.125});
        glyph(c, "pixels 2x2 B", ["+.", "-+"], 46, 560, 540, {a: 0.125, b: 0.25});
        glyph(c, "pixels 1x2", ["+", "-"], 46, 560, 540, {a: 0.25, b: 0.375});
    });

    shot("Cross", 16.0, 16.9375, function (c) {
        texturePanel(c, "panel", 260, 390, 370, 300, {bright: 1.2, seed: 24, a: 0.125, b: 0.25});
        streaks(c, "streaks", 250, 545, 580, 60, 3, {a: 0.25, b: 0.375});
        win(polyLayer(c, "hourglass stem", [[530, 500], [550, 500], [543, 540], [550, 580], [530, 580], [537, 540]]), 0, 0.125);
        win(xMark(c, "x big (grey)", 540, 540, 86, 9, [0.81, 0.81, 0.81]), 0.125, 0.25);
        win(xMark(c, "x big", 540, 540, 86, 9), 0.25, 0.5);
        win(xMark(c, "x small", 540, 540, 44, 4), 0.5);
    });

    shot("BrandLockup", 16.9375, 17.6875, function (c) {
        xMark(c, "x", 540, 540, 22, 3.4);
        slideUp(text(c, "studio", BRAND.studio, 501, 540, 50, F.g500, "r", {tracking: -30, measureAt: 0.5}), 0, 36);
        slideUp(text(c, "TM", "TM", 503, 525.5, 15, F.g700, "l", {measureAt: 0.5}), 0, 12);
        var p = text(c, "partner", BRAND.partner, 560, 540, 46, F.g800, "l", {tracking: -11, measureAt: 0.5});
        tr(p).property("ADBE Scale").setValue([112, 100]);
        slideUp(p, 0.0625, 33);
    });

    shot("Url", 17.6875, 20.0, function (c) {
        var u = text(c, "url", BRAND.url, 540, 540, 30, F.g500, "c", {tracking: 40, measureAt: 1});
        scramble(u, BRAND.url, {mode: "reveal", span: 0.3, outAt: 2.04, outSpan: 0.12, seed: 151});
    });

    // ================================================================
    // SOUNDTRACK, GRAIN, BACKGROUND
    // ================================================================
    tryDo("soundtrack", function () {
        var here = new File($.fileName).parent;
        var wav = new File(here.fsName + "/" + AUDIO_FILE);
        if (!wav.exists) wav = new File(here.fsName + "/Audio/" + AUDIO_FILE);
        if (!wav.exists) { warnings.push("soundtrack: " + AUDIO_FILE + " not found next to the script — import it by hand"); return; }
        var item = proj.importFile(new ImportOptions(wav));
        item.parentFolder = root;
        var al = main.layers.add(item);
        al.name = "SOUNDTRACK (120 BPM)";
        al.startTime = 0;
        al.moveToBeginning();
    });

    tryDo("grain", function () {
        var g = main.layers.addSolid(BLACK, "GRAIN", W, H, 1);
        g.moveToBeginning();
        g.blendingMode = BlendingMode.SCREEN;
        tr(g).property("ADBE Opacity").setValue(7);
        var fn = g.property("ADBE Effect Parade").addProperty("ADBE Fractal Noise");
        setFx(fn, "Contrast", 420);
        setFx(fn, "Brightness", -150);
        setFx(fn, "Scale", 18);
        tryDo("grain evolution", function () { fn.property("Evolution").expression = "Math.floor(time * 30) * 97"; });
    });

    var mainBg = main.layers.addSolid(BLACK, "BG", W, H, 1);
    mainBg.moveToEnd();

    main.openInViewer();
    app.endUndoGroup();

    var msg = "LOCKUP IN MOTION v3 built: " + shotIndex + " shots in \"LOCKUP_IN_MOTION_MAIN\".\nSave it with File → Save As…";
    if (warnings.length) msg += "\n\nSkipped " + warnings.length + " item(s):\n" + warnings.slice(0, 12).join("\n");
    alert(msg);
})();

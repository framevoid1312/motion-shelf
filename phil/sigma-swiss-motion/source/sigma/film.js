// ς — the letter that only ends. Swiss motion graphics study, 120 bpm, 24 fps.
// Pure function of time: draw(ctx, u, t) paints the whole frame from t alone.
// System: a 4×6 specimen sheet of the 24 Greek lowercase letters. Exception: final sigma, the 25th form.
import * as M from './lib/motion.js';

const W = 1920, H = 1080;

// ------------------------------------------------------------------ palette (one signal colour)
const C = {
  page: '#E9ECEF', paper: '#FFFFFF', ink: '#0B0B0B', blue: '#1F3FFF',
  gPage: '#B7BFC8', gPaper: '#E2E6EA', cap: '#E6E9ED', grey: '#6E7680', card: '#F7F8F9',
};

// ------------------------------------------------------------------ time: two curves only
const E16 = 0.125, E8 = 0.25, BEAT = 0.5;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
function cubicBezier(x1, y1, x2, y2) {
  const bx = (u) => 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
  const by = (u) => 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  return (t) => {
    if (t <= 0) return 0; if (t >= 1) return 1;
    let lo = 0, hi = 1, u = t;
    for (let i = 0; i < 30; i++) { const x = bx(u); if (Math.abs(x - t) < 1e-6) break; if (x < t) lo = u; else hi = u; u = (lo + hi) / 2; }
    return by(u);
  };
}
const E = cubicBezier(0.7, 0, 0.2, 1);                    // the only ease
const snap = (t, t1, d = E8) => E(seg(t, t1 - d, t1));   // lands at t1
const lin = seg;
function steps(t, a, b, n) { const p = seg(t, a, b) * n, i = Math.floor(p); return i >= n ? 1 : (i + E(p - i)) / n; }

// ------------------------------------------------------------------ type
const FAM = 'Inter';
function setF(ctx, w, s) {
  ctx.font = `${w} ${s}px ${FAM}`;
  ctx.letterSpacing = s >= 90 ? `${(-s * 0.022).toFixed(2)}px` : '0px';
}
const tw = (ctx, s) => ctx.measureText(s).width;
// clip-reveal: p 0→1 rises out of a clip rect from below the baseline; q 0→1 leaves upward
function reveal(ctx, s, x, y, size, p, q = 0, color = C.ink) {
  if (p <= 0 || q >= 1) return;
  const w = tw(ctx, s) + size * 0.2;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - size * 1.0, w + 8, size * 1.32); ctx.clip();
  ctx.fillStyle = color;
  ctx.fillText(s, x, y + (1 - p) * size * 1.05 - q * size * 1.32);
  ctx.restore();
}

// ------------------------------------------------------------------ grids
const colX = (i) => 96 + i * 146;                       // frame: 12 cols × 122, gutter 24
const PAPER = { x: 1118, y: 36, w: 706, h: 1008 };      // right page, cols 8–12
const PC = { x: PAPER.x + PAPER.w / 2, y: PAPER.y + PAPER.h / 2 };
const GX0 = 1173, GY0 = 90, MOD = 140, PITCH = 152;      // specimen: 4 cols × 6 rows of 140
const LOW = 'αβγδεζηθικλμνξοπρστυφχψω';
const CAP = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';
const LS = 120;                                          // letter size in a cell
const cell = (i) => { const c = i % 4, r = Math.floor(i / 4); return { c, r, x: GX0 + c * PITCH, y: GY0 + r * PITCH }; };
const LX = 12, LB = 102;                                 // letter offset in its cell (x, baseline)
const SIG = 17;                                          // σ
const SURV = { 18: 0, 4: 1, 10: 2, 14: 3 };              // τ ε λ ο → slots of τέλος
const WORD = 'τέλος', WS = 150, WX = GX0, WB = 600;      // the word on the sheet
const END = { x: 96, b: 990, s: 250 };                   // the word in the corner

// ------------------------------------------------------------------ timeline
const T = {
  dot: 0.25, gridIn: 0.25, title: 1.5, titleOut: 4.25, gridOut: 4.0, paperIn: 4.5,
  num: [4.75, 5.75], pgrid: 4.75, letters: 6.25,
  peek: 11.0, brk: 12.0, ext: 12.0, arrive: 14.0, extOut: 15.5,
  cut: 16.0, pgridOut: 16.75, reflow: 17.0, tonos: 18.0, fly2: 18.0, land: 19.0, numCut: 19.5,
  pull: 21.0, wall: 20.0, wallCut: 24.0, push: 26.0, paperOut: 26.25, corner: 26.5,
  dot2: 27.0, grid2: 27.0, head2: 28.0, end: 32.0,
};
const LAND = (i) => T.letters + i * E16;                 // letter i lands on its sixteenth

// final sigma path: [t, x, baseline, size]; linear, unsnapped, one eighth pause (the glance back)
const SIGP = cell(SIG);
const P0 = [SIGP.x + LX, SIGP.y + LB, LS];
const FLIGHT1 = [[12.0, ...P0], [12.5, 1050, 716, 165], [12.75, 1050, 716, 165], [14.0, 900, 520, 240]];
let SLOT = [];                                           // filled in init (prefix widths of τέλος at 100 px)
let FLIGHT2 = null;
function path(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i], p = lin(t, a[0], b[0]);
    return [lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)];
  }
  return keys[keys.length - 1].slice(1);
}

// statements: lead (30 px grey) + big (76 px), every word clip-revealed on a sixteenth
const LINES = [
  { t0: 4.5, t1: 6.375, lead: 'Rule 1', big: ['Twenty-four', 'letters.'] },
  { t0: 6.5, t1: 9.875, lead: 'Rule 2', big: ['One cell', 'each.'] },
  { t0: 10.0, t1: 11.875, lead: 'Correct.', big: ['And a little', 'dull.'], w: 400 },
  { t0: 12.0, t1: 13.875, lead: 'Rule 3', big: ['No', 'exceptions.'] },
  { t0: 14.0, t1: 15.875, lead: 'Twenty-four cells.', big: ['Twenty-five', 'forms.'] },
  { t0: 16.0, t1: 19.75, lead: 'ς, final sigma', big: ['Lives only at', 'the end of a word.'] },
  { t0: 21.0, t1: 23.875, lead: 'Specimens 01–33', big: ['Every word ends the same way.'], bottom: true },
];

// header (caption row) fields: [t0, t1, text]
const HEAD = [
  [[1.75, 4.25, 'Final sigma'], [4.5, 19.5, 'Specimen · Greek lowercase'], [28.0, 99, 'ς  U+03C2']],
  [[1.875, 4.25, 'A Swiss motion study'], [4.5, 11.875, 'Rule 01–02 / 03'], [12.0, 19.5, 'Rule 03 / 03'], [28.125, 99, 'Final sigma']],
  [[2.0, 4.25, 'Inter · 120 bpm'], [4.5, 19.5, 'bar'], [28.25, 99, 'A Swiss motion study']],
];

// ------------------------------------------------------------------ wall: one programme, many words
const WORDS = ['κόσμος', 'λόγος', 'ήλιος', 'χρόνος', 'δρόμος', 'νόμος', 'φίλος', 'ουρανός', 'ρυθμός', 'χορός', 'ήχος',
  'θεός', 'κήπος', 'ποταμός', 'τοίχος', 'άνεμος', 'βράχος', 'λύκος', 'αέρας', 'μήνας', 'φως', 'ώρες', 'γραμμές',
  'μορφές', 'ύπνος', 'νους', 'ίσκιος', 'καιρός', 'σταθμός', 'ορίζοντας', 'χάρτης', 'ναύτης'];
const CARDS = [];
for (let j = -1; j <= 1; j++) for (let i = -5; i <= 5; i++) {
  if (!i && !j) continue;
  CARDS.push({ i, j, x: PAPER.x + i * 766, y: PAPER.y + j * 1068, d: Math.hypot(i, j * 1068 / 766) });
}
CARDS.sort((a, b) => a.d - b.d || a.j - b.j || a.i - b.i);
CARDS.forEach((c, k) => { c.word = WORDS[k]; c.k = k; c.wipe = T.wall + Math.floor(k / 2) * E16 + E16; });

// ------------------------------------------------------------------ frame grid, ripple from the dot
let DOT = { x: 0, b: 0, cx: 0, cy: 0 };
let FRAME_LINES = [];
function buildFrameLines() {
  const L = [];
  for (let i = 0; i < 12; i++) { L.push({ v: 1, p: colX(i) }); L.push({ v: 1, p: colX(i) + 122 }); }
  for (let k = 0; k <= 7; k++) L.push({ v: 0, p: 36 + k * 144 });
  L.forEach((l) => { l.d = Math.abs(l.p - (l.v ? DOT.cx : DOT.cy)); });
  L.sort((a, b) => a.d - b.d);
  FRAME_LINES = L;
}
// p: 0..1 grown from the dot along the line's length
function frameLine(ctx, l, p) {
  if (p <= 0) return;
  ctx.fillStyle = C.gPage;
  if (l.v) { const a = DOT.cy * (1 - p), b = DOT.cy + (H - DOT.cy) * p; ctx.fillRect(l.p - 0.5, a, 1, b - a); }
  else { const a = DOT.cx * (1 - p), b = DOT.cx + (W - DOT.cx) * p; ctx.fillRect(a, l.p - 0.5, b - a, 1); }
}
function drawFrameGrid(ctx, t) {
  FRAME_LINES.forEach((l, k) => {
    const slot = Math.floor(k / 4);
    let p = 0;
    if (t < 20) {
      p = lin(t, T.gridIn + slot * E16, T.gridIn + slot * E16 + E8);
      const r0 = T.gridOut + (FRAME_LINES.length - 1 - k) * E16 / 2;   // farthest first: they return to the dot
      p *= 1 - lin(t, r0, r0 + E8);
    } else p = lin(t, T.grid2 + slot * E16, T.grid2 + slot * E16 + E8);
    frameLine(ctx, l, p);
  });
}

// grid of the sheet extends past the page during the break
let EXT_LINES = [];
function buildExt() {
  const L = [];
  for (let r = 0; r <= 6; r++) L.push({ v: 0, p: GY0 - 6 + r * PITCH });
  for (let k = 1; k <= 7; k++) L.push({ v: 1, p: GX0 - 6 - k * PITCH });
  const cx = SIGP.x + 70, cy = SIGP.y + 70;
  L.forEach((l) => { l.d = Math.abs(l.p - (l.v ? cx : cy)); });
  L.sort((a, b) => a.d - b.d);
  EXT_LINES = L;
}
function drawExt(ctx, t) {
  if (t < T.ext || t > T.extOut + 2) return;
  ctx.fillStyle = C.gPage;
  EXT_LINES.forEach((l, k) => {
    const slot = Math.floor(k / 2);
    const p = lin(t, T.ext + slot * E16, T.ext + slot * E16 + E8) * (1 - lin(t, T.extOut + slot * E16, T.extOut + slot * E16 + E8));
    if (p <= 0) return;
    if (l.v) { const a = 540 - 540 * p; ctx.fillRect(l.p - 0.5, a, 1, H * p); }
    else { const len = PAPER.x * p; ctx.fillRect(PAPER.x - len, l.p - 0.5, len, 1); ctx.fillRect(PAPER.x + PAPER.w, l.p - 0.5, (W - PAPER.x - PAPER.w) * p, 1); }
  });
}

// ------------------------------------------------------------------ the sheet
function drawPaper(ctx, t) {
  if (t < T.paperIn - 0.5 || t > T.paperOut + 0.01) return;
  const hIn = PAPER.h * snap(t, T.paperIn, 0.5);
  const hOut = PAPER.h * (1 - snap(t, T.paperOut, E8));
  const h = Math.min(hIn, hOut);
  if (h <= 0) return;
  ctx.fillStyle = C.paper; ctx.fillRect(PAPER.x, PAPER.y, PAPER.w, h);
  // cell grid: 5 verticals + 7 horizontals, one per sixteenth, drawn along their length
  ctx.save(); ctx.beginPath(); ctx.rect(PAPER.x, PAPER.y, PAPER.w, h); ctx.clip();
  ctx.fillStyle = C.gPaper;
  for (let k = 0; k < 12; k++) {
    const a = T.pgrid + k * E16;
    let p = lin(t, a, a + E8) * (1 - lin(t, T.pgridOut + k * E16 / 2, T.pgridOut + k * E16 / 2 + E8));
    if (p <= 0) continue;
    if (k < 5) { const x = GX0 - 6 + k * PITCH; ctx.fillRect(x - 0.5, PAPER.y, 1, PAPER.h * p); }
    else { const y = GY0 - 6 + (k - 5) * PITCH; ctx.fillRect(PAPER.x, y - 0.5, PAPER.w * p, 1); }
  }
  // caption on the sheet
  setF(ctx, 500, 15);
  const pc = snap(t, 6.0, E16);
  reveal(ctx, 'αβγ — 24 cells · Greek lowercase · Inter 700', GX0, 1028, 15, pc, 0, C.grey);
  ctx.restore();
}

function cutTime(r) {          // knife order: rows nearest the sigma first
  const order = [2, 1, 3, 0, 4, 5];
  return T.cut + order.indexOf(r) * E16 + E16;
}
function drawLetters(ctx, t) {
  if (t < T.letters - E16) return;
  for (let i = 0; i < 24; i++) {
    const c = cell(i), land = LAND(i);
    const p = snap(t, land, E16);
    if (p <= 0) continue;
    const surv = i in SURV;
    const tc = cutTime(c.r);
    const mid = c.y + LB - LS * 0.27;
    // capital: the secondary voice, light grey under the black
    if (t < tc + E8) {
      const pc = snap(t, land + E16, E16), col = 1 - snap(t, tc + E8, E8);
      if (pc > 0 && col > 0) {
        ctx.save();
        ctx.translate(0, mid); ctx.scale(1, Math.max(0.001, col)); ctx.translate(0, -mid);
        ctx.beginPath(); ctx.rect(c.x - 2, c.y - 2, MOD + 4, MOD + 4); ctx.clip();
        setF(ctx, 700, 108); ctx.fillStyle = C.cap;
        ctx.fillText(CAP[i], c.x + 58, c.y + 128 + (1 - pc) * 120);
        ctx.restore();
      }
    }
    if (!surv) {
      if (t > tc + E8) continue;
      const col = 1 - snap(t, tc + E8, E8);
      ctx.save();
      ctx.translate(0, mid); ctx.scale(1, Math.max(0.001, col)); ctx.translate(0, -mid);
      setF(ctx, 700, LS);
      reveal(ctx, LOW[i], c.x + LX, c.y + LB, LS, p);
      ctx.restore();
      continue;
    }
    // survivors re-flow into τέλος, nearest first, two per sixteenth
    const slot = SURV[i];
    const tl = T.reflow + slot * E16 + 0.5;
    const pr = snap(t, tl, 0.5);
    if (pr <= 0) { setF(ctx, 700, LS); reveal(ctx, LOW[i], c.x + LX, c.y + LB, LS, p); continue; }
    const [x, b, s] = wordGlyph(t, slot, pr, c);
    setF(ctx, 700, s); ctx.fillStyle = C.ink;
    const ch = slot === 1 ? 'ε' : LOW[i];
    ctx.fillText(ch, x, b);
    if (slot === 1) {                     // the tonos drops in on the downbeat
      const pa = snap(t, T.tonos, E16);
      if (pa > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(x - 10, b - s * 1.2, s, s * 0.62); ctx.clip();
        ctx.fillText('έ', x, b - (1 - pa) * s * 0.35);
        ctx.restore();
      }
    }
  }
}
// where glyph `slot` of the word sits at time t (world space; after 26 the word moves to the corner)
function wordAt(t) {
  const pc = snap(t, T.corner, 0.5);
  return { x: lerp(WX, END.x, pc), b: lerp(WB, END.b, pc), s: lerp(WS, END.s, pc) };
}
function wordGlyph(t, slot, pr, c) {
  const w = wordAt(t), tx = w.x + SLOT[slot] * w.s / 100;
  if (pr >= 1) return [tx, w.b, w.s];
  return [lerp(c.x + LX, tx, pr), lerp(c.y + LB, w.b, pr), lerp(LS, w.s, pr)];
}
function drawKnives(ctx, t) {
  ctx.fillStyle = C.ink;
  for (let r = 0; r < 6; r++) {
    const tc = cutTime(r);
    if (t < tc - E16 || t > tc + E8) continue;
    const y = GY0 + r * PITCH + LB - LS * 0.27;
    const x0 = PAPER.x + 12, len = (PAPER.w - 24) * lin(t, tc - E16, tc);
    ctx.fillRect(x0, y - 1, len, 2);
  }
}

// ------------------------------------------------------------------ the exception
function sigmaState(t) {
  if (t < T.peek) return null;
  if (t < T.brk) {                                       // hesitation: peeks out, snaps back
    if (t > 11.5) return null;
    const dx = t < 11.25 ? -42 * lin(t, 11.0, 11.25) : -42 * (1 - snap(t, 11.5, E8));
    return [P0[0] + dx, P0[1], P0[2]];
  }
  if (t < T.fly2) return path(FLIGHT1, t);
  if (t < T.land) return path(FLIGHT2, t);
  const w = wordAt(t);
  return [w.x + SLOT[4] * w.s / 100, w.b, w.s];
}
function drawSigma(ctx, t) {
  const st = sigmaState(t);
  if (!st) return;
  const [x, b, s] = st;
  ctx.save();
  if (t < 12.6) {   // hidden behind σ until it leaves σ's box
    setF(ctx, 700, LS);
    const aw = tw(ctx, 'σ');
    ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20);
    ctx.rect(P0[0] - 4, P0[1] - LS * 0.85, aw + 6, LS * 1.25);
    ctx.clip('evenodd');
  }
  setF(ctx, 700, s); ctx.fillStyle = C.blue;
  ctx.fillText('ς', x, b);
  ctx.restore();
  // coordinate readout
  if (t >= T.brk && t < 19.75) {
    const col = (x - (GX0 + LX)) / PITCH, row = (b - (GY0 + LB)) / PITCH;
    const on = Math.abs(col - Math.round(col)) < 0.005 && Math.abs(row - Math.round(row)) < 0.005;
    const p = snap(t, T.brk + E16, E16), q = E(seg(t, 19.5, 19.75));
    const rx = x, ry = b + s * 0.34 + 26;
    setF(ctx, 500, 19);
    const f2 = (v) => (v < 0 ? '-' : '') + Math.abs(v).toFixed(2);
    reveal(ctx, `col ${f2(col)}   row ${f2(row)}`, rx, ry, 19, p, q, on || t >= T.land ? C.ink : C.blue);
    const tag = t >= T.land ? 'end of word' : on ? 'on grid' : 'off grid';
    reveal(ctx, tag, rx, ry + 24, 19, p, q, t >= T.land || on ? C.ink : C.blue);
  }
}

// ------------------------------------------------------------------ wall
function drawWall(ctx, t) {
  if (t < T.wall || t > 25.2) return;
  CARDS.forEach((c) => {
    const pw = snap(t, c.wipe, E8);
    if (pw <= 0) return;
    const tc = c.j === 0 ? T.wallCut : T.wallCut + E8;
    const col = 1 - snap(t, tc + E8, E8);
    if (col <= 0) return;
    ctx.save();
    const my = c.y + PAPER.h / 2;
    ctx.translate(0, my); ctx.scale(1, Math.max(0.001, col)); ctx.translate(0, -my);
    ctx.beginPath(); ctx.rect(c.x, c.y, PAPER.w, PAPER.h * pw); ctx.clip();
    ctx.fillStyle = C.paper; ctx.fillRect(c.x, c.y, PAPER.w, PAPER.h);
    let s = WS; setF(ctx, 700, s);
    const avail = PAPER.w - 2 * (GX0 - PAPER.x);
    let w = tw(ctx, c.word);
    if (w > avail) { s = WS * avail / w; setF(ctx, 700, s); }
    const stem = c.word.slice(0, -1);
    const wb = c.y - PAPER.y + WB;
    ctx.fillStyle = C.ink; ctx.fillText(stem, c.x + (WX - PAPER.x), wb);
    ctx.fillStyle = C.blue; ctx.fillText('ς', c.x + (WX - PAPER.x) + tw(ctx, stem), wb);
    setF(ctx, 500, 15); ctx.fillStyle = C.grey;
    ctx.fillText(`Specimen ${String(c.k + 2).padStart(2, '0')} · ${c.word}`, c.x + (WX - PAPER.x), 1028 + c.y - PAPER.y);
    ctx.restore();
  });
}
function drawWallKnives(ctx, t, cam) {
  ctx.fillStyle = C.ink;
  for (const j of [0, -1, 1]) {
    const tc = j === 0 ? T.wallCut : T.wallCut + E8;
    if (t < tc - E16 || t > tc + E8) continue;
    const wy = PAPER.y + j * 1068 + WB - WS * 0.27;
    const y = cam.qy + (wy - PC.y) * cam.s;
    ctx.fillRect(0, y - 1, W * lin(t, tc - E16, tc), 2);
  }
}

// ------------------------------------------------------------------ camera: one 2D matrix
function camera(t) {
  const p = snap(t, T.pull, 1.0) - snap(t, T.push, 1.0);
  const s = Math.exp(lerp(0, Math.log(0.25), p));
  return { s, qx: lerp(PC.x, 960, p), qy: lerp(PC.y, 540, p) };
}

// ------------------------------------------------------------------ left page
let NUM = { size: 0, asc: 0, x: 0, w2: 0 };
function drawNumeral(ctx, t) {
  if (t < T.num[0] || t > T.numCut + E8 * 2) return;
  setF(ctx, 700, NUM.size);
  const base = 1044, top = base - NUM.asc;
  const p = steps(t, T.num[0], T.num[1], 4);
  const tc = T.numCut, col = 1 - snap(t, tc + E8, E8);
  if (col <= 0) return;
  ctx.save();
  const mid = base - NUM.asc / 2;
  ctx.translate(0, mid); ctx.scale(1, Math.max(0.001, col)); ctx.translate(0, -mid);
  ctx.beginPath(); ctx.rect(0, top - 4, 1000, NUM.asc + 8); ctx.clip();
  ctx.fillStyle = C.ink;
  const y = base + (1 - p) * NUM.asc * 1.02;
  ctx.fillText('2', NUM.x, y);
  const q = snap(t, T.arrive, E8);                       // 24 → 25: one module up
  if (q < 1) ctx.fillText('4', NUM.x + NUM.w2, y - q * NUM.asc * 1.02);
  if (q > 0) ctx.fillText('5', NUM.x + NUM.w2, y + (1 - q) * NUM.asc * 1.02);
  ctx.restore();
  if (t > tc - E16 && t < tc + E8) { ctx.fillStyle = C.ink; ctx.fillRect(96, mid - 1, 860 * lin(t, tc - E16, tc), 2); }
}
function drawLine(ctx, L, t) {
  if (t < L.t0 - 0.01 || t > L.t1 + E8) return;
  const q = E(seg(t, L.t1, L.t1 + E8));
  const x = 96;
  const yl = L.bottom ? 978 : 200, yb = L.bottom ? 1050 : 290;
  setF(ctx, 500, 30);
  // the ς in a lead-in carries the signal colour
  if (L.lead.startsWith('ς')) {
    reveal(ctx, 'ς', x, yl, 30, snap(t, L.t0 + E16, E16), q, C.blue);
    reveal(ctx, L.lead.slice(1), x + tw(ctx, 'ς'), yl, 30, snap(t, L.t0 + E16, E16), q, C.grey);
  } else reveal(ctx, L.lead, x, yl, 30, snap(t, L.t0 + E16, E16), q, C.grey);
  let k = 1;
  L.big.forEach((line, li) => {
    setF(ctx, L.w || 700, 76);
    let cx = x;
    line.split(' ').forEach((wd) => {
      k++;
      reveal(ctx, wd, cx, yb + li * 82, 76, snap(t, L.t0 + k * E16, E16), q);
      cx += tw(ctx, wd + ' ');
    });
  });
}
function drawHeader(ctx, t) {
  const on = (t > 1.6 && t < 4.5) || (t > 4.4 && t < 19.75) || t > 27.6;
  // rule
  let p = 0;
  if (t < 20) p = lin(t, 1.5, 2.0) * (1 - lin(t, 19.5, 19.75));
  else p = lin(t, 27.75, 28.0);
  if (p > 0) { ctx.fillStyle = C.ink; const x0 = t > 19.5 && t < 20 ? lerp(96, 948, lin(t, 19.5, 19.75)) : 96; ctx.fillRect(x0, 56, (948 - 96) * p - (x0 - 96), 1); }
  if (!on) return;
  setF(ctx, 500, 19);
  HEAD.forEach((fields, fi) => {
    const x = [96, 388, 680][fi];
    fields.forEach(([a, b, s]) => {
      if (t < a || t > b + E8) return;
      let text = s;
      if (s === 'bar') { const bt = Math.floor(t / BEAT); text = `bar ${String(Math.floor(bt / 4) + 1).padStart(2, '0')}.${(bt % 4) + 1}`; }
      reveal(ctx, text, x, 84, 19, snap(t, a + E16, E16), E(seg(t, b, b + E8)));
    });
  });
}
function drawTitle(ctx, t) {
  if (t < T.title - E16 || t > T.titleOut + E8) return;
  const q = E(seg(t, T.titleOut, T.titleOut + E8));
  setF(ctx, 700, 120);
  reveal(ctx, 'The letter', 96, 236, 120, snap(t, T.title, E16), q);
  reveal(ctx, 'that only', 96, 362, 120, snap(t, T.title + E16, E16), q);
  setF(ctx, 700, 120);
  const w = tw(ctx, 'that only ');
  reveal(ctx, 'ends.', 96 + w, 362, 120, snap(t, T.title + E8, E16), q);
}

// ------------------------------------------------------------------ the dot (opening seed, closing full stop)
function drawDot(ctx, t) {
  setF(ctx, 700, END.s);
  let p = 0, q = 0;
  if (t < 20) { p = snap(t, T.dot, E16); q = E(seg(t, 4.75, 4.75 + E8)); }
  else p = snap(t, T.dot2, E16);
  if (p <= 0 || q >= 1) return;
  ctx.save(); ctx.beginPath(); ctx.rect(DOT.x - 10, DOT.b - 60, 80, 70); ctx.clip();
  ctx.fillStyle = C.ink;
  ctx.fillText('.', DOT.x, DOT.b + (1 - p) * 70 + q * 70);
  ctx.restore();
}

// ------------------------------------------------------------------ sound cues (shared with the score)
const EV = [];
function buildEvents() {
  const add = (t, type, g = 1) => EV.push([t, type, g]);
  add(T.dot, 'tok', 1);
  for (let s = 0; s < 8; s++) add(T.gridIn + s * E16, 'tss', 0.45);
  add(T.title, 'clack', 0.9); add(T.title + E16, 'clack', 0.8); add(T.title + E8, 'clack', 0.9);
  add(1.5, 'tss', 0.5);
  add(T.paperIn, 'slap', 1);
  for (let i = 1; i <= 4; i++) add(T.num[0] + i * 0.25, 'thunk', 0.5 + 0.15 * (i === 4));
  for (let k = 0; k < 12; k++) add(T.pgrid + k * E16, 'tss', 0.22);
  for (let i = 0; i < 24; i++) add(LAND(i), 'clack', 0.75 + 0.2 * (i % 4 === 0));
  add(11.0, 'peek', 0.7); add(11.5, 'block', 0.5);
  for (let s = 0; s < 7; s++) add(T.ext + s * E16, 'tss', 0.3);
  add(T.arrive, 'felt', 1); add(T.arrive, 'thunk', 0.7);
  for (let r = 0; r < 6; r++) add(cutTime(r), 'snick', 0.75);
  for (let s = 0; s < 4; s++) add(T.reflow + s * E16 + 0.5, 'block', 0.8);
  add(T.tonos, 'tick', 0.8);
  add(T.land, 'felt', 1.1);
  add(T.numCut, 'snick', 0.9);
  for (let s = 0; s < 16; s++) add(T.wall + s * E16 + E16, 'slap', 0.28);
  add(T.wallCut, 'snick', 1); add(T.wallCut + E8, 'snick', 0.9);
  add(T.paperOut, 'slide', 0.8); add(T.corner, 'thunk', 0.9);
  add(T.dot2, 'tok', 1);
  for (let s = 0; s < 8; s++) add(T.grid2 + s * E16, 'tss', 0.35);
  add(27.75, 'tss', 0.5);
  EV.sort((a, b) => a[0] - b[0]);
}

// ------------------------------------------------------------------ frame
function draw(ctx, u, t) {
  ctx.fillStyle = C.page; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  drawFrameGrid(ctx, t);
  drawExt(ctx, t);
  const cam = camera(t);
  ctx.save();
  ctx.translate(cam.qx, cam.qy); ctx.scale(cam.s, cam.s); ctx.translate(-PC.x, -PC.y);
  drawWall(ctx, t);
  drawPaper(ctx, t);
  drawLetters(ctx, t);
  drawKnives(ctx, t);
  ctx.restore();
  drawWallKnives(ctx, t, cam);
  drawTitle(ctx, t);
  drawHeader(ctx, t);
  LINES.forEach((L) => drawLine(ctx, L, t));
  drawNumeral(ctx, t);
  ctx.save();
  ctx.translate(cam.qx, cam.qy); ctx.scale(cam.s, cam.s); ctx.translate(-PC.x, -PC.y);
  drawSigma(ctx, t);
  ctx.restore();
  drawDot(ctx, t);
}

async function init(ctx) {
  await Promise.all([300, 400, 500, 700].map((w) => document.fonts.load(`${w} 100px ${FAM}`, 'Aa0 αβγδεζηθικλμνξοπρστυφχψως ΑΒΓ έόήίύώ')));
  // word slots: prefix widths of τέλος at 100 px
  setF(ctx, 700, 100);
  SLOT = [0, 1, 2, 3, 4].map((i) => tw(ctx, WORD.slice(0, i)));
  FLIGHT2 = [[18.0, 900, 520, 240], [18.5, 1450, 330, 190], [19.0, WX + SLOT[4] * WS / 100, WB, WS]];
  // the full stop after the corner word: the opening dot
  setF(ctx, 700, END.s);
  DOT.x = END.x + tw(ctx, WORD);
  DOT.b = END.b;
  const m = ctx.measureText('.');
  DOT.cx = DOT.x + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  DOT.cy = DOT.b - m.actualBoundingBoxAscent / 2;
  buildFrameLines(); buildExt();
  // the giant numeral: 460 px figure height, optically flush left
  setF(ctx, 700, 100);
  const asc100 = ctx.measureText('2').actualBoundingBoxAscent;
  NUM.size = Math.round(100 * 460 / asc100);
  setF(ctx, 700, NUM.size);
  const m2 = ctx.measureText('2');
  NUM.asc = m2.actualBoundingBoxAscent; NUM.x = 96 + m2.actualBoundingBoxLeft; NUM.w2 = m2.width;
  buildEvents();
  window.EV = EV;
  window.TL = { flight1: FLIGHT1, flight2: FLIGHT2, peek: [11.0, 11.5] };
}

const HITS = [];
M.film({ draw, init, hits: HITS, samples: 6, shutter: 0.5 });

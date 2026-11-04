---
name: swiss-motion
description: Swiss / International Typographic Style motion graphics: grid-snapped 2D type, one signal colour, beat-locked snaps. Use when Phil asks for Swiss motion, Swiss-style, or this look.
---

# Swiss Motion Graphics

Source: LemoLab `lemo-opuscar/styles/swiss-motion` (MIT). Grammar only — never copy their demo (*Five Rules for a Poster*), its story, shots, timings or end card, and never add a LemoLab credit.

**One line:** a modular grid, one typeface, one signal colour, motion as exact as a printing press. Every element snaps to the grid, every move lands on a beat, nothing bounces.

## 1. Core idea
- Pure flat 2D graphic design animated on a grid: paper, black type/bars, light greys, **one** saturated signal colour.
- **Rigor with one exception**: the whole frame obeys a system, so the single element that breaks it becomes the character.
- **Extreme scale contrast**: giant numeral (~700 px figure height) beside ~19 px technical notes.
- Turn any topic into **a system + one exception** (product: spec sheet assembles, one feature breaks out; company history: each decade = a rule added to one poster).
- NOT: keynote (no gradients/glow/device renders), kinetic lyric type (no flying/spinning/bouncing words), data-viz (bars are graphic mass unless the grid is given meaning), Bauhaus primary-shape pastiche.
- Never: Helvetica/Akzidenz files, a lifted Müller-Brockmann composition (concentric circles, fans), a real institution's name on a poster.

## 2. Grid & materials
- Frame 1920×1080: 12 cols, ~96 px side margins, 24 px gutters (≈122 px cols), 24 px baseline.
- Frame as a **spread**: left page (cols 1–6) = the programme (numeral, rule text, notes, subtitles); right page (cols 8–12) = the artifact.
- **Artifact grid derived from content** (Gerstner): decide what columns/rows *mean*. Fewer, wider modules — thin columns look like a chart (demo: 12 semitone cols failed; 7 cols × 91 px, 16 rows × 40 px worked).
- Flat rects only. Adjacent cells of one unit merge into one bar; **overdraw 1 px at seams** (antialias hairlines appear after rotate/scale).
- Secondary voice = light-grey elements under the black ones: depth without a second colour.
- No gradients, shadows, particles, grain (mux grain 0).
- All moves via one **2D camera matrix** (centre, scale, rotation).

## 3. Colour
- Page, paper, ink, 2–3 grid greys, **one** signal colour (red / orange / ultramarine / green chosen for the topic, then never a second).
- Only one thing carries the signal colour → it is the protagonist and the only thing allowed to be inexact. Black overprint on signal is allowed.
- Palettes: `#EAE9E5` page / `#FFFFFF` paper / `#111111` ink / `#E30613` red · grid greys `#CFCEC9` (page), `#C9C8C2` (building), `#E2E1DC` (on paper). Alt: `#F2F0EA`/`#141414`/`#FF5A00`; `#E9ECEF`/`#0B0B0B`/`#1F3FFF`.

## 4. Type
- **One OFL neo-grotesque for the whole film** (Archivo, Inter, Schibsted Grotesk, Instrument Sans), several weights. For Greek copy pick a family with Greek glyphs (e.g. Inter, Manrope, Noto Sans) and test.
- Tracking ≈ −2 to −2.2 % at ≥ 90 px. Lowercase headlines OK. Flush left, ragged right, everything on a grid line, white space is layout.
- Giant numerals **optically** flush left (subtract glyph left bearing), bottom-aligned to the artifact.
- `await document.fonts.load()` every weight before drawing. Set `letterSpacing` before `measureText` (it changes the measure).
- **Subtitles live in the layout**, never a bottom bar: at a column start — small grey lead-in (~30 px Medium) + big bold statement (~76 px Bold), each word clip-revealed on its timestamp. Hold ≥ max(1.8 s, speech + 0.6 s); assert in code.
- Caption rows: ~19 px Medium with a 1 px rule above. Corner technical notes (`Columns 7 · Rows 16 · Module 91 × 40`, `bar 04.3`).
- Title card ~120 px Bold, two lines flush left, sitting on a signal-colour rule.

## 5. Motion
- **Two curves only**: `cubic-bezier(.7,0,.2,1)` for every snap; linear for lines being drawn, playheads, and the exception. No overshoot/spring/bounce.
- **Durations = note values** at the tempo (120 BPM: 1/8 = 0.25 s, 1/16 = 0.125 s). A snap starts one note value early and **lands on the beat**.
- Entrances are **wipes/clip-reveals, never fades**: words rise from below the baseline inside a clip rect (1/16), exit upward (1/8); lines grow along their length; paper appears by a wipe; big numerals climb in **4 eased steps**.
- **Deletion = knife cut**: 2 px line crosses in 1/16, element collapses vertically to its midline in 1/8.
- **Ripples ordered by distance** from the cause, ~2 units per sixteenth, nearest first.
- **The exception**: linear, unsnapped, may pause an eighth mid-flight, may grow as it travels; a readout flips from `col 5.00 row 0.00 · on grid` to signal-colour `off grid` with non-integer values.
- Smooth 24 fps, no stepping. Put visual onsets on whole frames (multiples of 1/24 s; at 120 BPM use 0.25 s multiples).

## 6. Camera vocabulary (precise ease, on beats only; never dissolves)
| Move | Meaning |
|---|---|
| Locked spread | cause (left) → effect (right) |
| Hard pan one page/column | next step in a system |
| Rotate 90° and **stop** | same thing read another way (poster → score) |
| Pull out to a wall of artifacts | one programme, many outputs |
| Push into one module | the unit of the system |
| Grid extends past the page | system bigger than the artifact |
| Split frame into equal cells | parallel cases |
| Vertical scroll through a column | reading a list / spec |
Transitions: wipes, knife cuts, camera moves, re-flows.

## 7. Native moves (pick what the story needs)
The grid means something (cols/rows = a quantity) · Snap = beat · Programme (rules applied one by one, then generating many) · Extreme scale contrast · The exception · Knife cut · Re-flow.

Typical arc (30–60 s): order being built → order complete (correct, a bit dull — say it) → hesitation (exception twitches, snaps back) → the break (only linear move; drums drop) → re-flow, bolder → reveal (grid means something) → scale reveal (many outputs) → hero artifact end card.

The "better" composition must be **visibly** bolder: one strong diagonal with long/short rhythm, signal element ~2×, bleeds off the paper, type over colour. Tilting alone isn't enough.

Variations: timetable (24 hour-rows), alphabet specimen A–Z, split-spread comparison until one element crosses the gutter. Openings: a single dot growing a grid; the finished artifact dismantled into rules; a frame-filling numeral that's a detail of a small layout. Endings: empty grid after everything is cut; one word flush-left in a corner; the exception leaves and the system closes over the gap.

## 8. Sound
- Music with its own grid: motorik/krautrock, minimal techno, marimba/vibraphone patterns, mechanical piano ostinato, drum machine + glockenspiel. Add one instrument per rule.
- Picture and music can share one data file (column → pitch, row → onset, length → duration) so the graphic literally is the score.
- Drop the drums for the exception; a near-silent bar before a reveal; thin the band during a reveal; hard stop on a downbeat.
- Foley = print materials, dry, no reverb: letterpress clack, ruling-pen "tss", guillotine snick, paper slap/slide, numeral thunk per step, block snap, felt thump (~58 Hz) for landings, rubber stamp, typewriter carriage. The exception can be the only thing that sings (sine glide tracking its position).
- Voice: cool, crisp, rule-like sentences, bright consonants ("Rule one. Build a grid."). Voice compressed ≥ 6 dB over music, music ducked ~10 dB, −14 LUFS.

## 9. Engine snippets (canvas, time-pure)
```js
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const seg=(t,a,b)=>clamp((t-a)/(b-a));
export function cubicBezier(x1,y1,x2,y2){
  const bx=u=>3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;
  const by=u=>3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u;
  return t=>{ if(t<=0)return 0; if(t>=1)return 1;
    let lo=0,hi=1,u=t; for(let i=0;i<30;i++){const x=bx(u); if(Math.abs(x-t)<1e-6)break; x<t?lo=u:hi=u; u=(lo+hi)/2;}
    return by(u); };
}
export const E=cubicBezier(.7,0,.2,1);                 // the only ease
export const BPM=120, BEAT=60/BPM, E8=BEAT/2, E16=BEAT/4, BAR=BEAT*4;
export const snap=(t,t1,d=E8)=>E(seg(t,t1-d,t1));      // lands at t1
export const lin=(t,a,b)=>seg(t,a,b);
export function steps(t,a,b,n){const p=seg(t,a,b)*n,i=Math.floor(p); return i>=n?1:(i+E(p-i))/n;}
export function track(keys){ // [[t_arrive, value|array, dur?], ...]
  return t=>{ let v=keys[0][1];
    for(let i=1;i<keys.length;i++){ const [t1,v1,d=E8]=keys[i]; if(t<t1-d)break;
      const p=snap(t,t1,d); v=Array.isArray(v1)?v1.map((x,j)=>lerp(v[j],x,p)):lerp(v,v1,p); if(p<1)break; }
    return v; };
}
// clip-reveal: p 0→1 rises in from below baseline, q 0→1 exits upward
function revealText(g,s,x,y,size,p,q=0){
  if(p<=0||q>=1)return; const w=g.measureText(s).width+size*.1;
  g.save(); g.beginPath(); g.rect(x-2,y-size*1.02,w+4,size*1.30); g.clip();
  g.fillText(s,x,y+(1-p)*size*1.05-q*size*1.3); g.restore();
}
// knife cut at time tc: line draws over E16, element collapses to midline over E8
function knife(g,t,tc,x,yMid,w,drawEl){
  if(t>tc+E8)return; const c=1-snap(t,tc+E8,E8);
  g.save(); g.translate(0,yMid); g.scale(1,Math.max(.001,c)); g.translate(0,-yMid); drawEl(); g.restore();
  if(t>tc-E16) { g.fillRect(x-10,yMid-1,(w+20)*lin(t,tc-E16,tc),2); }
}
```
Render each frame as a pure function of `t`; draw camera-matrix-shared elements only while their shot is on screen (otherwise they leak into other shots).

## 10. Pitfalls
- Thin columns → chart look; use wide modules.
- Rotating and labelling at once = noise: rotate (1.5 beats) → hold → grid lines → labels → playhead.
- Hide caption rows before rotated shots (labels collide with header).
- Merged bars show seams → 1 px overdraw.
- Onsets between frames flicker → whole-frame onsets.
- Whisper word timings: split/merged words and padded first word → align by letters, clamp ≥ 0.
- A knife cut through a group shrinks it from the side the line enters, in screen space.

## 11. Workflow
1. Design the layout system first: frame grid, artifact grid, what cols/rows mean; one data file (layout + score + timeline).
2. Write the treatment (system, exception, signal colour, opening, ending) — fresh, not the demo's.
3. Build canvas film as f(t); review contact sheets (1 s overview + 0.25 s strips around the break and each transition).
4. VO → ASR check → word timings → in-layout subtitles (asserted holds).
5. Score from the same data file, foley events, ducked mix at −14 LUFS; render 24 fps, frame-exact.
For the full video pipeline pair with the motion-reel / motion-studio skills.

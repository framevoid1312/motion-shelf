# REEL 2026 — v4 (Remotion project)

35 s · 1920×1080 · 30 fps · 150 BPM (1 beat = 12 frames). Every pixel is a pure function of the frame number,
so any frame can be rendered alone, in any order.

## Run it
```bash
npm i
npx remotion studio            # preview (Reel2026 = full quality, Reel2026Draft = 960×540, no motion blur)
./render_full.sh               # final 1080p render → out/render/video_noaudio.mp4
```
The film-wide effects (`@remotion/effects` through `<HtmlInCanvas>`) render headless out of the box. To see them
in the Studio preview, use Chrome 149+ with `chrome://flags/#canvas-draw-element` enabled.

## What's where
| File | What it does |
|---|---|
| `src/Root.tsx` | the two compositions |
| `src/Film.tsx` | loads the engine, poses 4 motion-blur sub-frames per frame (180° shutter), canvas bloom, and the effects timeline: chromatic-aberration kick on every hard cut, zoom blur into and out of the 3D ocean, pixel dissolves, vignette, grain |
| `src/three-assets.ts` | Three.js: studio-lit metal ribbons for the footage cards, the 22,176-point ocean (four impacts, camera tilt and fly-through) |
| `public/engine.js` | the 2D motion engine (count, 2026 → REEL decode, micrographic sequences, poster, burst, ASCII field, recap, end card). Cut times are snapped to the 30 fps grid |
| `public/mix.wav` | the mastered score (−14 LUFS, −1.5 dBTP). Not in this repo (10 MB): build it with the re-score line below before rendering with sound |
| `score/` | the Tone.js score: `score.js` (every sound at its picture time), `events.json` (times taken from the picture logic), `render-tone.cjs` (offline render in headless Chrome), `master.sh` (two-pass loudnorm) |

Re-score: `cd score && node render-tone.cjs . score_raw.wav && bash master.sh && cp mix.wav ../public/mix.wav`.

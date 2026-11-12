# LOCKUP IN MOTION (Remotion project)

20 s · 1080×1080 · 30 fps (`BrutalistReel`) or 60 fps (`BrutalistReel60`) · 120 BPM. Every cut sits on the 1/16-note grid (a few on 1/32), so the film renders the same at any frame rate.

## Run it
```bash
npm i
npx remotion studio     # preview
npm run render          # out/reel-30fps.mp4
npm run render:60       # out/reel-60fps.mp4
```
Fonts (Inter, Space Mono) load from Google Fonts, so rendering needs internet. The composition plays `public/LockupInMotion_score.wav`; build it first (below), or set the `audioSrc` prop to `''` for a silent render.

## Score
`score/score.js` is the soundtrack: Tone.js, every hit scheduled at the film's cut times. Render it offline in headless Chrome and master it:
```bash
cd score && npm init -y && npm i tone@14.7.77 puppeteer-core@22
CHROME=/path/to/chrome node render-tone.mjs 20 score_raw.wav
ffmpeg -i score_raw.wav -af "alimiter=limit=0.89,loudnorm=I=-14:TP=-1:LRA=9,afade=t=out:st=19.6:d=0.4" \
  -ar 48000 -c:a pcm_s24le ../public/LockupInMotion_score.wav
```
If you retime a shot in `src/BrutalistReel.tsx`, move the matching times in `score.js`.

## What's where
| File | What it does |
|---|---|
| `src/BrutalistReel.tsx` | the edit list: `[start, end, Shot]` in seconds, plus grain and audio |
| `src/brand.ts` | all copy (studio, partner, logotype, URL, labels) |
| `src/timing.ts` | BPM, the shot clock `useShot()`, `stepped()` hold keyframes |
| `src/theme.ts` | black/white, Inter + Space Mono helpers |
| `src/components/Texture.tsx` | grain, the faceted grainy "footage" panels, light streaks |
| `src/components/Type.tsx` | decoder (scramble / random reveal) and type-on |
| `src/components/Pixel.tsx` | bitmap glyphs and sprites |
| `src/components/Icons.tsx` | globe/WWW, crosshair, dumbbell, © ring, chart, waveforms, hatch, edition strip, … |
| `src/components/LockupSheet.tsx` | the climax sheet, laid out on an 810-unit grid |
| `src/shots/` | `Opening` (0–4 s), `Assets` (4–12.3 s), `Finale` (12.3–20 s) |
| `score/` | the Tone.js score and its offline renderer |

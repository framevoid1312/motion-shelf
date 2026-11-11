# Vertical cartoon short built in three.js

**#169 by popularity** · ♥ 480 · 53,683 views · by [@treyscalez](https://x.com/treyscalez) · [Original post](https://x.com/treyscalez/status/2118357912624005300) · [Watch the video](https://www.sandbase.ai/lab/media/x/opus-5-5/2118357912624005300/video.mp4)

[![Vertical cartoon short built in three.js](https://www.sandbase.ai/lab/media/x/opus-5-5/2118357912624005300/poster.jpg)](https://x.com/treyscalez/status/2118357912624005300)

## Prompt

```text
{
 "task": "Make a vertical animated cartoon short of MY story, built in code: three.js r160 world + canvas-drawn 2D character cards, rendered frame by frame in headless Chromium (Playwright, swiftshader), encoded with ffmpeg. 1080x1920, 30fps, exactly as long as my voiceover. Work start to finish; only ask if script and audio don't match.",
 "my_inputs": {
  "story": "[your idea, true event, legend or full script]",
  "script": "[optional exact script]",
  "voiceover": "[optional: attach mp3/wav]",
  "length_seconds": 30,
  "voice_speed": 1.0,
  "captions": false,
  "notes": "[optional: era, setting, characters, jokes]"
 },
 "stages": [
  "A. No script: write one at ~3.7 words/s (30s~110 words): 1) hook = absurd fact, no setup 2) setting in 1-2 lines with a concrete detail 3) 2-4 escalating beats, others doubt/mock, one exaggeration joke 4) pivot 'But...'/'You see,' revealing the real mechanism with an everyday analogy 5) short ironic twist = last words. Spoken English, contractions, numbers as words, never describe what's on screen. If presented as true, web-check facts and say history/disputed/legend.",
  "B. No voiceover: give script in a copyable block + word count + est. length, a short shot plan, recording tips (one warm narrator; ElevenLabs speed 1.05-1.1, stability 45-55%; pauses at sentence ends; no music). Stop and ask for the upload.",
  "C. With voiceover: build everything below without stopping. Task list for progress; send a stills contact sheet before the long render."
 ],
 "setup": [
  "mkdir -p web/lib work stills frames out",
  "npm pack three@0.160.0 -> copy package/build/three.module.js to web/lib (fallback: sparse git clone of mrdoob/three.js branch r160, folder build)",
  "Playwright + Chromium (npm i -g playwright && npx playwright install chromium); launch args --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist",
  "python3 numpy Pillow, ffmpeg (with rubberband)",
  "Serve web/ with a tiny Node http server; render.mjs loads index.html, waits for window.ready, calls window.renderFrame(f), saves canvas.toDataURL('image/jpeg',.95) to frames/f0000.jpg. Support RESUME=1 (skip existing) and a frame list 'a-b' or '1,5,9'."
 ],
 "timing": "If voice_speed!=1: ffmpeg -af rubberband=tempo=<speed> (pitch kept). Claude can't hear audio: align my script to speech using ffmpeg silencedetect (-35dB, 0.12s): split script into phrases at punctuation, DP-match phrases to speech segments by syllable count vs duration, penalise sentence ends inside a segment. Spread words by syllables. Write work/phrases.json; check pauses fall at sentence ends. Frames = round(duration*30). Every reaction lands 0-3 frames before its word; the final payoff lands on the final word.",
 "architecture": {
  "files": "web/index.html (canvas#c 1080x1920 + module main.js), main.js (renderer, materials, world, cards, sprites, passes), story.js (SHOTS, LIGHTS, lightFor, camAt, dofAt, worldAt, actorsAt, fxAt: all pure functions of frame f), motion.js, paint.js (canvas textures), toon.js (character + creature drawing), https://t.co/MwT4jjcu22, https://t.co/3V5W7hv6gk, https://t.co/XLDraRXh1Z, https://t.co/vZbd2PyUGV (contact sheets).",
  "renderer": "WebGLRenderer antialias:false, preserveDrawingBuffer, PCFSoft shadows 2048, sun = DirectionalLight from az/el per light preset, shadow camera centred on each shot's action (ext 8-60m), HemisphereLight, Fog(colour = sky horizon). Camera Perspective, near .08 far 1500.",
  "materials": "MeshToonMaterial with a 2-texel gradientMap [90,255] Nearest = hard 2-step toon shading. Textures are CanvasTextures pai…
```

The prompt and video belong to @treyscalez; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

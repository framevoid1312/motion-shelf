# Motion Clone

An agent skill that rebuilds a reference motion-graphics clip as an **editable code project**: HTML layers with keyframes, GSAP/HyperFrames-compatible. It then compares the rebuild with the original frame by frame and renders it out, along with a side-by-side REFERENCE | REBUILD video.

The agent does the looking itself, so there are no accounts or API keys. It scans every frame for cuts and motion, samples the frames that matter, and measures geometry, colours and timing with code. Type is matched to installed fonts and solid glyphs are traced into vector paths. A bounded fix loop is scored with RGB-SSIM.

https://github.com/framevoid1312/motion-shelf/raw/main/phil/motion-clone/motion-clone-demo.mp4

*Left: 7.5 s of lemo-opuscar's Swiss Motion film. Right: the same 7.5 s rebuilt as 97 code layers by this skill. RGB-SSIM is 0.959 and 0.966 for the two scenes.*

| File | |
|---|---|
| [`SKILL.md`](SKILL.md) | The skill, self-contained (tool scripts embedded) |
| [`scripts/`](scripts) | The same five tools as separate files: scan, project builder, renderer, compare, render |
| [`demo/project/`](demo/project) | The demo's editable project. Open `index.html?play` in a browser, or `npm i && npm run render` with HyperFrames |
| [`demo/author.py`](demo/author.py) | The generator that wrote the demo's layers from the measurements |

Install: copy this folder to `~/.claude/skills/motion-clone/` (or your agent's skills folder), then ask your agent to "clone this animation" with a clip.

Works best on type, shapes, UI, logos, charts and transitions under about 30 s. It does not rebuild live footage, photography or real 3D.

## Credits

- Method adapted from [MotionClone](https://github.com/blixvip/MotionClone) by blixvip (MIT, see `LICENSE-MotionClone.txt`). Its app uses Codex/ChatGPT for vision; this skill has the agent do the vision directly and adds per-frame measurement, glyph tracing, per-keyframe easing and font calibration.
- Demo reference footage: *Swiss Motion* from [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) by LemoLab (MIT, see `demo/LICENSE-lemo-opuscar.txt`).

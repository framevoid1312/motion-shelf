# Coded music video for Mongolian throat singing dubstep track

**#642 by popularity** · ♥ 157 · 10,122 views · by [@kloss_xyz](https://x.com/kloss_xyz) · [Original post](https://x.com/kloss_xyz/status/2112006151885705553) · [Watch the video](https://video.twimg.com/amplify_video/2112004483366461440/vid/avc1/1920x1080/JnE5IrL2NCElb9N9.mp4)

[![Coded music video for Mongolian throat singing dubstep track](https://pbs.twimg.com/amplify_video_thumb/2112004483366461440/img/9455ozuVyBF7CZ--.jpg)](https://x.com/kloss_xyz/status/2112006151885705553)

## Prompt

```text
You're a motion director and creative coder. Make a finished music video for [song file], built entirely in code and rendered frame by frame.

Concept: [your idea in one or two sentences]
Look: [palette, mood, references]
On-screen text: [title only / none / lyrics]
Deliver: [full song or mm:ss to mm:ss], [16:9 / 9:16 / both, each recomposed, not cropped], [fps], H.264 + AAC for [platform]

How to work:
1. Analyze the song before any visuals. Split it into bands or stems and export per-frame features plus a timing map (beats, bars, sections, hits). Every visual event reads from the map and is listed in it.
2. Give each musical element one visual job that serves the concept. Keep one idea transforming across the song instead of cycling effects.
3. Storyboard with timings and 3 style frames, get a fresh critic's verdict on them, then a 4-second end-to-end test before the full build.
4. Make every value a pure function of the frame number. Render offline, encode with the original audio (gain only).
5. After each full render, send it to fresh critic subagents that never saw the build, each returning ranked problems with timestamps and a ship / one more pass verdict:
   - sound-off: retells the story from a silent 2 fps contact sheet
   - sync: every cut, hit and visual event within 1 frame of the timing map
   - QA: specs, palette, text, artifacts, measured on the frames
   - director: brutal critique against the brief
   - one per extra aspect ratio: composition and platform UI zones
6. Fix render bugs first, then the biggest problem; re-render; log each round with before/after numbers. If critics conflict, the brief wins.
7. Stop after [5] rounds or when the bar passes. The final pass checks only for breakage.

The bar: exact duration, size and fps; frame one finished; no still over 0.5 s; cuts and hits within 1 frame; audio unedited except gain, about -14 LUFS, true peak under -1 dB; text readable and inside safe areas; understood with the sound off.
```

The prompt and video belong to @kloss_xyz; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

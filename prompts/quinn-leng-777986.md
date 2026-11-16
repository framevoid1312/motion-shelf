# Shot-for-shot Big Bang Theory opening titles rendered in code

**#521 by popularity** · ♥ 158 · 20,759 views · by [@quinn_leng](https://x.com/quinn_leng) · [Original post](https://x.com/quinn_leng/status/2103145862536777986) · [Watch the video](https://video.twimg.com/ext_tw_video/2103145812725211136/pu/vid/avc1/720x900/EIwmFV_9l_rlMnzz.mp4)

[![Shot-for-shot Big Bang Theory opening titles rendered in code](https://pbs.twimg.com/ext_tw_video_thumb/2103145812725211136/pu/img/LT7C174EkMs2reiT.jpg)](https://x.com/quinn_leng/status/2103145862536777986)

## Prompt

```text
Recreate the opening titles of The Big Bang Theory (https://t.co/b7pJxLiMM4) shot for shot, drawn entirely in code, over the original audio.

Style: match @devteamdrew's Opus 5.5 film (https://t.co/t6MGBXeKxw). Flat fills, slightly wobbly dark ink outlines that re-jitter 12 times a second, fine short-dash texture inside fills, soft glows, sparkle stars, paper grain.

1. Download the opening. Sample it at 24 fps, frame-diff it and list every distinct shot with its start time and a reference still. Expect about 120 shots; most of the montage lasts 1–3 frames.
2. Build a small drawing kit in Node with @napi-rs/canvas at 1920x1080. No video model, no framework, no images.
3. Follow the source's colour script: navy space, pencil on cream paper for early life, sepia ink up to 1900, cool grey for the war years, full saturated colour from the 1950s.
4. Draw every shot as a function of time: one bold subject that reads instantly, framed like the source. Add the scrolling year ruler.
5. Split the eras across parallel subagents. Each renders its shots under the gridded source frame and fixes the framing over at least two rounds.
6. Snap shot starts to the 24 fps frame grid, render, mux the original audio, and stack the original above ours at 1080x1350.
```

The prompt and video belong to @quinn_leng; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

# 8-bar 3D motion design film of a website

**#907 by popularity** · ♥ 61 · 5,111 views · by [@kloss_xyz](https://x.com/kloss_xyz) · [Original post](https://x.com/kloss_xyz/status/2113088964735480263) · [Watch the video](https://video.twimg.com/amplify_video/2113083185366282240/vid/avc1/1920x1080/f_gO85_GrzYWSp3t.mp4)

[![8-bar 3D motion design film of a website](https://pbs.twimg.com/amplify_video_thumb/2113083185366282240/img/lLnlWv8AYG0fNFR2.jpg)](https://x.com/kloss_xyz/status/2113088964735480263)

## Prompt

```text
Make an 8-bar 3D motion design film of my website: 1920x1080, 30 fps, Blender Cycles on GPU, headless, built entirely from code, in this folder.

INPUTS
SITE: [path to your site's repo, or its live URL]
HERO: [a .glb, 3 to 4 views of your character, or "the site's logo mark"]
AUDIO: [a WAV you own or licensed, with a clear drop, or "synth"]
LINE: [the one sentence the film proves]

STORY
Bar 1, hook: the site fills the frame, flat, and something alive inside it moves within 2 seconds. No title card.
Bar 2, premise: the hero breaks out of the page and the page splits into its sections as floating slabs.
Bar 3, drop: the first landing hits the music's drop.
Bars 3 to 5, proof: each landing switches one real section on. A landing that changes nothing gets cut.
Bar 6, breadth: every section lit in one frame.
Bar 7, thesis: the slabs fly back into one page.
Bar 8, close: a clean poster frame. Make the last frame match the first so it loops.

TRUTH
- Real pixels only. Capture each section of the running site with headless Chrome. Replace every clock the page uses (the performance timer, requestAnimationFrame, setTimeout and CSS animations) with a stepper so every frame is reproducible. Measure every target from the DOM.
- Never draw a screen, logo, number or claim that is not on the site. Cut empty sections.
- The look comes from the site: color, type, radius and easing tokens (from the code, or computed styles for a live URL), written into a style guide with the source of each. Anything not on the site is marked as a film choice.
- Banned: dark chrome, iridescent porcelain, a centered title over a gradient, fade-in on everything, particles that mean nothing.

TIMING
- One Python timeline file is the only clock: every event in beats at the track's tempo, with a check that fails on gaps. Capture, Blender and sound all read its JSON.
```

The prompt and video belong to @kloss_xyz; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

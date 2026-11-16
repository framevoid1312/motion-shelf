# 20-second satisfying physics short of balls multiplying inside a

**#981 by popularity** · ♥ 38 · 5,214 views · by [@treyscalez](https://x.com/treyscalez) · [Original post](https://x.com/treyscalez/status/2119829208906006830) · [Watch the video](https://video.twimg.com/amplify_video/2119827006795780096/vid/avc1/1080x1920/Z3eX1_39dfsI8VF0.mp4)

[![20-second satisfying physics short of balls multiplying inside a](https://pbs.twimg.com/amplify_video_thumb/2119827006795780096/img/btwqvs3WlxcxtrN3.jpg)](https://x.com/treyscalez/status/2119829208906006830)

## Prompt

```text
<inputs>
Ask me for: the machine (default: Crusher; others: Sweeper Arm, Laser Blades, Rotating Frame, Multiplier Zones, Split Rings), how many new balls one hit ball becomes (default 8), the length (default 20 seconds), and whether I have my own sound effects (if not, synthesize them in numpy).
</inputs>

<direction>
An oddly satisfying physics short at 1080x1920, 30fps, drawn entirely in code with Python, pymunk and OpenCV, every shape anti-aliased with cv2.LINE_AA at sub-pixel shift 4.
Space: pure black #000000, no gradient, no stars. The arena is a white ring, radius 438px, 5px stroke, centred at 540,960.
The machine: brushed steel #8E9198 with a darker edge #5C5F66 and a 2px highlight line #B9BCC2 along its top, 6-7px rounded corners, three small dark bolts per plate and a thin orange pad #E9A23B on every face that touches balls. For the Crusher: a 16px steel rail from each jaw's outer side to the screen edge with a rounded end cap, and two C-shaped jaws "[ ]" facing each other, each a 42x312 back plate with top and bottom arms 118px long and 33px thick pointing inward. No rail between the jaws.
Balls: flat solid circles with no outline or shading, radius 9px, the first ball 17px. Each wave is a new color in this order: orange #FF8A1F, indigo #4B2BFF, green #3BFF3B, pink #FF2D7A, cyan #22C3F5, yellow #FFF000, purple #A01EFF, mint #1FF58A, red #FF3B1F. Old colors stay, so the ring marbles into a mix.
Draw order: ring, rail, balls, squashed balls, machine on top.
Finish: one white flash at 55% fading over 5 frames on the finale, nothing else.
Banned: text, captions, counters or watermarks on screen (except zone labels on Multiplier Zones), camera moves, gradients, glow on balls, gravity pulling down, balls spawning inside the machine, AI images or AI video, NexusBox Lab's logo or name.
</direction>

<structure>
20 seconds, the machine never stops moving and every crush is bigger than the last.
One orange ball sitting still left of centre at 400,955, jaws open (0s) → the jaws start closing at 0.2s with an ease-in cubic slam over 0.5s, the ball gets swept in and squashed, pinch at 0.7s, 8 indigo balls shoot out both sides → jaws ease back open over 1.2s and rest → every 2.4s the same clamp: pinches at 3.1, 5.5, 7.9, 10.3, 12.7 and 15.1s, each crushing whatever drifted into the jaws and turning every crushed ball into exactly 8 of the next color, so the waves grow 8 → 8 → 16 → 32 → 88 → 264 → 880 and the ring fills up (0.7-15.1s) → on the last close the ring itself gets pulled in and shrinks into a white capsule squeezed between the jaws (17.0s) → pinch: capsule vanishes, white flash, deep boom, the red wave of 2,000+ balls bursts out and every ball blasts off screen at 600-1100px/s (17.5s) → the empty jaws clamp once more on black at 19.9s so the last frame flows into the first.
For any other machine, keep the same shape: one lonely ball, the first hit before 1s, a hit every 2-2.5s with each wave a new color and 8x bigger, the ring fills, the machine destroys the ring at about 87% of the length, everything explodes off screen, the empty machine keeps moving into a seamless loop. Sweeper Arm: a 12-tooth gear with a 150-degree curved arm sweeping round, pinning balls against the ring. Laser Blades: 5 neon cyan blades spinning from a hub, slicing balls in two. Rotating Frame: a spinning square frame that squeezes shut every 2.4s, on two X rails. Multiplier Zones: an octagon with gates labelled x20, x5, BIG, SMALL and a skull, with normal gravity. Split Rings: four corner ramps tipping colored piles into four stacked rings with rotating gaps.
</structure>

<build>
1. One Python script. Every number in a CONFIG block at the top, a fixed random seed (default 4) I can change with an environment variable, raw frames piped straight into ffmpeg.
2. Physics: pymunk with zero gravity, 10 substeps per frame, 12 iterations, space.damping 1.0 so balls never slow down, ball elasticity 0.95, machine 0.6, wall 1.0, friction 0, speed clamped at 1100px/s. A gentle spring pull toward the centre (2.0 x distance per second squared) keeps balls drifting back into the machine. Switch it off when the ring breaks.
3. The ring wall is 160 static segments just outside radius 438. Every moving machine part is a KINEMATIC body: every substep set its position AND its velocity from the next substep's target, or balls tunnel through and don't get shoved.
4. The crush: once the jaws' arms overlap, the box is sealed. Balls inside leave the physics and are drawn squashed, keeping their x as a fraction of the gap and narrowing into ellipses. At the pinch they all count as crushed.
5. The multiply rule: spawn EXACTLY crushed x 8 new balls, no rounding, no fixed totals, safety cap 4000. Stream them out over 9 frames just outside the jaws, worked out from where the jaws are when each ball appears, flying away at 250-520px/s fanned over 110 degrees. Print one line per pinch: "pinch N: crushed X -> spawned Y (x8), total Z".
6. Sound: one effect per event kind (jaw whir rising 120 to 380Hz through each close, metal clunk on each pinch, a burst of 14 tiny pops 22ms apart on each spawn, a deep 1.6s boom on the finale), each peak-aligned to its frame. If I gave you my own sound effects, use them instead. Normalize the mix to -1.5dB peak and mux it with ffmpeg.
7. Encode with libx264 at CRF 17, yuv420p, preset veryfast, AAC 192k.
</build>

<gotchas>
With damping below 1.0, balls lose their energy and settle in the gaps above, below and behind the jaws, so nothing gets crushed and the waves die out. Without the centre pull the same thing happens: test it and you'll see crushes of 1, 0, 0, 0. Spawn positions must follow the jaws as they open, or the finale wave gets stuck inside the jaws. If fewer than 1 ball is crushed in each of the first 3 pinches, try another seed or raise the pull. If the cap gets hit before the finale, lower the pull. Run the physics once with rendering switched off, show me the crush log and a contact sheet of every pinch before the full render.
</gotchas>

<start>
Ask me the inputs, run the physics and show me the crush log with the wave sizes it gives, then build and render the video.
```

The prompt and video belong to @treyscalez; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

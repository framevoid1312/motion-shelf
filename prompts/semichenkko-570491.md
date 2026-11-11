# Interactive 3D Squishy Toast Memory Foam Simulation

**#413 by popularity** · ♥ 46 · by [@semichenkko](https://x.com/semichenkko) · [Original post](https://x.com/semichenkko/status/2110015093190570491) · [Watch the video](https://video.twimg.com/amplify_video/2110014933643468800/vid/avc1/720x914/e-yGyIEYi0JdbZrb.mp4)

[![Interactive 3D Squishy Toast Memory Foam Simulation](https://pbs.twimg.com/amplify_video_thumb/2110014933643468800/img/iJaey2fwXXq7hsBd.jpg)](https://x.com/semichenkko/status/2110015093190570491)

## Prompt

```text
Build "Squishy Toast" - a single self-contained HTML file (three.js from a CDN is the only dependency): an interactive 3D slice of slow-rise memory foam bread you can press, poke, stretch and squash.

The toast
- A real bread silhouette: square body, rounded "muffin top" crown, soft beveled edges
- Crumb face: warm cream color, procedural pores of varied size with highlights and a bump map, a toasted golden edge fading in toward the center
- Crust: golden-brown with subtle grain and a light sheen
- Lies flat on a white surface at a 3/4 angle with a soft baked contact shadow

Physics (this is the whole point - it must feel like foam, not geometry)
- Densely tessellated mesh deformed per vertex every frame, normals recomputed
- Press and hold: a smooth gaussian dent, crumb bulges outward around the rim, the bottom stays planted on the table
- Release: the dent rises back slowly and exponentially, like memory foam, with no instant snap. A faint elastic ripple runs across the crumb after release
- Several dents can coexist, each recovering on its own
- Grab the crust and pull: the bread stretches elastically, thins as it stretches, then springs back with a damped wobble
- Palm squash: the whole slice flattens and barrel-bulges at mid-height, then breathes back up
- Drop: lift and release, squash-and-stretch on impact, small decaying bounce

Flavors
- Butter, strawberry jam (glossy clearcoat, deeper color), avocado (mashed texture). The spread sits on the crumb, leaves a crust rim and deforms with the bread

UI
- Editorial product-page style on a white background. Large italic serif title "Squishy / Toast.", a short subtitle, a minimal card on the right with flavor swatches, a softness slider (controls dent size and recovery time), a live "Rise" meter and a "Fresh slice" reset button
- A subtle circular cursor that shrinks while pressing
- ACES tone mapping, soft key and rim lights, environment reflections. Smooth 60fps
```

The prompt and video belong to @semichenkko; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

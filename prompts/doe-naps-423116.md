# Real-time translucent gummy aquarium cake slice with drag physics

**#1380 by popularity** · ♥ 21 · 981 views · by [@doe_naps](https://x.com/doe_naps) · [Original post](https://x.com/doe_naps/status/2113153484279423116) · [Watch the video](https://video.twimg.com/amplify_video/2113152878789767168/vid/avc1/1920x1080/m8QuFdXPO3VStJRR.mp4)

[![Real-time translucent gummy aquarium cake slice with drag physics](https://pbs.twimg.com/amplify_video_thumb/2113152878789767168/img/1yq7oKYgOV9kDrYg.jpg)](https://x.com/doe_naps/status/2113153484279423116)

## Prompt

```text
Build one standalone HTML file: a real-time WebGPU simulation of a translucent gummy cake slice sitting on a plate, filled with a tiny living aquarium. Genuine WebGPU + WGSL, all geometry procedural, no external assets.

Physically simulate it: a tetrahedral lattice solved with XPBD (distance + normalised volume constraints), fixed timestep with substeps, gravity, damping, ground friction, per-node inverse mass so the crust is firmer than the flesh. Skin the high-poly mesh with cubic Catmull-Rom FFD in the vertex shader reading node positions from a storage buffer — never trilinear, never object-scaling. Skinned through the same field: substrate, rocks, coral fans, kelp, fish, bubbles, caustics. A small schooling shoal plus two or three feature fish.

Drag anywhere on the slice to pull, stretch, twist and fling it; deformation must be local, and release must wobble, overshoot and recover. Drag empty space to orbit, scroll/pinch to zoom.

Wedge-shaped slice, crust only along the outer arc (cut faces bare jelly). Four flavours: Aqua, Orange, Lemon, Ruby. Firmness and damping sliders, nudge, reset, pause, quarter speed, show-mesh wireframe, live mass / rest-volume / kinetic-energy readouts. Fallback card if WebGPU is missing.

Any drag must never inflate, invert or NaN the mesh. Test strong repeated drags, every control, and a 390x844 viewport before delivering.
```

The prompt and video belong to @doe_naps; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

# Interactive jelly watermelon slice with cuttable gummy spiders

**#841 by popularity** · ♥ 93 · 4,523 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2116858362339934650) · [Watch the video](https://video.twimg.com/amplify_video/2116858301472280576/vid/avc1/1920x1200/x3BcaaMCM65FmFwo.mp4)

[![Interactive jelly watermelon slice with cuttable gummy spiders](https://pbs.twimg.com/amplify_video_thumb/2116858301472280576/img/ltRfDt_LDqrjeYGg.jpg)](https://x.com/vib3coded/status/2116858362339934650)

## Prompt

```text
Build "Spider Melon" — a single-page three.js (r170, WebGL2, ES module via import map from jsDelivr) interactive jelly watermelon slice for Halloween, as one self-contained HTML file. English UI.

SIMULATION
- A thick triangular watermelon slice (rounded rind arc, rounded corners) as an XPBD tetrahedral soft body: co-rotational per-tet shape matching with warm-started quaternions, volume constraints, edge damping, gravity, floor collision with friction.
- Hand tool: grab any point and pull (soft spring grab), fling to throw, scroll or a second finger to twist, tap to jolt. Sliders: Firmness (trembling↔️set) and Internal damping (lively↔️syrupy). Buttons: Give it a nudge, Reset, ¼ speed, Show mesh, Pause.
- Knife tool: draw a stroke across the slice. Read the stroke on the surface to get a vertical blade plane; for each piece it crosses, fit the piece's best rotation, carry the plane back to rest space as a straight line and split that piece's convex rest-plane outline (rounded corners). Prebuild both halves as new tet meshes, then animate a steel chef's knife (wooden handle, rivets, brushed steel) that first presses a groove and, on breaking through, swaps in the new pieces with the old particles' positions and velocities transferred via barycentric embedding, wedging the halves apart. Every piece stays its own soft body; pieces collide with each other. Pieces can be cut again.
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

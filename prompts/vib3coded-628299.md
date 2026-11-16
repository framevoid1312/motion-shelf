# Interactive soft-body jelly whale simulation in three.js with

**#71 by popularity** · ♥ 1,203 · 229,953 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2119542001775628299) · [Watch the video](https://video.twimg.com/amplify_video/2119541342778855424/vid/avc1/2560x1440/LKSJY3CN1TOUgvuE.mp4)

[![Interactive soft-body jelly whale simulation in three.js with](https://pbs.twimg.com/amplify_video_thumb/2119541342778855424/img/fFqtFQwTTmMA5pA8.jpg)](https://x.com/vib3coded/status/2119542001775628299)

## Prompt

```text
Build "Blue Whale Jelly · Material Studies No. 058" — a single-page interactive soft-body study in three.js (r170, WebGL2, importmap from jsDelivr), matching the quality, layout and juicy colours of my earlier jelly whale studies (No. 043 humpback, No. 056 sperm whale).

Subject: a blue whale cast in two layers of jelly, resting on its belly on a pale studio sweep (#E2DFDA). Make it big and full-bodied — plumper than life, a well-fed jelly — so it fills the stage.

Shape (signed distance field):
- A superellipse section swept along the spine: round along the body, a little flatter and squarer at the head. Author it slender, then scale its girth (section height, width and the mouth line) by ~1.38 while keeping the length.
- A broad, flat, U-shaped head seen from above, with a long mouth line curving up toward a small dark eye.
- A splash-guard ridge in front of twin blowholes.
- Short, narrow, pointed flippers; a tiny dorsal fin far back; broad triangular flukes with a small notch. Scale all of these with the girth.
- Shader markings from rest-space coordinates: pale mottling on the back, throat pleats from chin to navel, a dark mouth-line groove, dark blowhole slits.

Inside:
- A milky belly layer that thins to a milky floor under the throat.
- The throat itself is a pouch of clear jelly.
- Rows of dark licorice baleen plates hang inside the upper jaw, visible through the head.
- About 28 trapped bubbles, kept out of the throat and stomach.

Physics:
- CPU XPBD tetrahedral soft body: snapped hex lattice, 5 tets per cell, h≈0.12, 60 Hz with 10 substeps, per-region compliance (fins firmest, then skin, milk, clear jelly).
- Barycentric skinning of the render surfaces; grab, drag and twist (wheel or second finger); orbit and zoom.

The gulp:
- Give each node of the throat a displacement at full inflation: down toward the table and out to the sides.
- On a gulp, blow up the rest shapes AND rest volumes of the pouch tets together by an amount 0…1. The throat then really fills (whale volume ≈ +35%), presses on the table and lifts the head, and the pleats spread apart.
- Add a lunge impulse forward and up. Fill fast, hold, then let the pouch slowly empty, as if the water were strained out through the baleen.
- 96 pink krill beads, each with a rest-space path: in at the lips → swirling in the full pouch → back to a stomach behind the flippers. Embed every point of every path in the tets so the krill rides the swelling, wobbling jelly.
- 32 krill per gulp; the oldest are digested when the pool cycles.

Spout:
- 72 rigid jelly drops forming a tall, slim twin column from the two blowholes.
- The crown of the head dips as the whale exhales.
- Drops bounce, roll and can be picked up and tossed.

Lights out:
- The room and page fade to near-black and the key light dims.
- The swallowed krill glows: a point light at the swarm's centre, filtered blue by the jelly it crosses, pooling on the table.
- Prodding the jelly makes the krill flicker.

Renderer (cu
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

# Interactive soft-body plush toy demo in two styles

**#828 by popularity** · ♥ 93 · 5,178 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2118661427690913866) · [Watch the video](https://video.twimg.com/amplify_video/2118661275865513984/vid/avc1/1920x2160/_KNFc_10C640bJYc.mp4)

[![Interactive soft-body plush toy demo in two styles](https://pbs.twimg.com/amplify_video_thumb/2118661275865513984/img/-z9-EqmhW_XNSg35.jpg)](https://x.com/vib3coded/status/2118661427690913866)

## Prompt

```text
Build a single-file HTML5 page, "Stitchling": an interactive soft-body plush toy. A burlap scarecrow doll with a jelly core that stretches where you pull it, bends, can be tossed, and bounces candy off. three.js r128 from cdnjs, Google Fonts (Fraunces italic for the title, IBM Plex Mono for labels), no asset files, no build step for the viewer.

CHARACTER (original design)
Round burlap head, stubby cotton jumpsuit body, mittens, boots, about 1.55 m tall, defined by a signed-distance field (smooth union of ellipsoids and capsules, soles on y = 0). Details: one X-stitched button eye and one glossy bead eye, a zigzag stitched mouth, cross stitches, two cloth patches with running stitches, gold buttons, a straw collar and straw at the cuffs and ankles, and a swirl lollipop held in a mitten. Eyes pop when tapped. The doll stands alone on the floor.

SOFT BODY (port of a published plush-toy solver: hex-cell shape matching plus tetrahedral volume, XPBD style)
Cut the shape into a cubic lattice of 7 cm cells: about 1,950 particles, 1,280 hex cells, 7,700 tetrahedra (six per cell). Fixed 60 Hz step, 6 substeps (adapt down to 3 when the measured cost is high), one iteration per substep. Keep every constant in the original solver's own units (a lattice cell is 0.112 of them) and convert lengths with 0.07/0.112, so the behaviour matches.
Each hex cell is pulled toward its own rest shape under the best-fit rotation (co-rotational shape matching, one warm-started quaternion step per substep). Goal fraction f = k/(1+k) with k = stiffness x dt^2 / h^2, stiffness 90..1600 on a log scale from the "body firmness" slider (default 0.45); a cell whose deviation is over a quarter of a cell is pulled harder, up to 0.35. "Fabric flexibility" multiplies the stiffness of the cells that touch the surface (the shell) between 2.4 and 0.3.
Tetrahedra keep volume: XPBD constraint with compliance 0.05 x (1 - 0.7 x firmness), no compliance for a tet squashed below a quarter of its rest volume. Masses are lumped tet volumes (60%) plus an even share (40%).
Standing: the nodes of the soles are held softly at their planted x,z (a spring of 0.12 per substep, each correction capped at 6 mm) while the toy stands, and a weak posture pull (0.004 per substep) toward the rest pose carried with the centre of mass turns it upright and keeps it facing the front. The posture pull is off while something is held, otherwise pulling one part would move the whole body with it. When the bottom row of the soles comes off the floor (pulled up, thrown) the footing lets go and is re-planted after landing; if the toy is dragged along the floor the footing moves with it; a correction must never be able to fling it sideways.
Floor with Coulomb friction 0.9 and a small hop on a hard landing (restitution 0.42); speed cap; air drag. After the last substep: relative velocity along every edge decays (rate 20 + 300 d^2), then the deformation part of the whole body's motion (everything but translation and
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

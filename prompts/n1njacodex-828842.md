# Interactive 3D cauldron jelly with eyeballs and stretchy worms

**#1286 by popularity** · ♥ 29 · 1,064 views · by [@N1njaCodex](https://x.com/N1njaCodex) · [Original post](https://x.com/N1njaCodex/status/2116471579198828842) · [Watch the video](https://video.twimg.com/amplify_video/2116471502098874368/vid/avc1/2560x1600/a-sPZxK0e2IxTR0Y.mp4)

[![Interactive 3D cauldron jelly with eyeballs and stretchy worms](https://pbs.twimg.com/amplify_video_thumb/2116471502098874368/img/-7hIXfj8RT6Jr5hy.jpg)](https://x.com/N1njaCodex/status/2116471579198828842)

## Prompt

```text
Build a single-file three.js (r170 via importmap from jsDelivr) interactive page "Material Studies No. 013 — Cauldron Jelly", matching the quality of a soft-body watermelon-jelly study.

ENGINE
- XPBD tetrahedral soft body on the CPU: co-rotational per-tet shape matching (warm-started quaternions, recovers inversions), tet volume constraints, edge relative-velocity damping, soft grab of a patch with twist (scroll or second finger), floor contact with Coulomb friction, fixed 60 Hz step with 8 substeps.
- The sim mesh is a body-centred-cubic lattice stuffed into the jelly's shape. Vertices on the boundary are snapped to the true surface, and slivers are dropped.
- A smooth render surface (a revolved profile) is embedded in the tets by barycentric weights, with a few passes of normal smoothing to hide creases between tets.
- Renderer, multi-pass:
  - key-light PCSS shadow map;
  - top-down height map for contact AO;
  - HDR 4× MSAA scene pass (alpha = linear depth);
  - jelly back-face depth for view-ray thickness;
  - jelly pass with refraction, Beer–Lambert absorption, scattering, Fresnel reflections of a procedural studio and GGX highlights;
  - Khronos PBR Neutral tone mapping plus dither.

SUBJECT
- A glowing acid-green jelly set inside a cast-iron witch's cauldron:
  - the pot: bulbous belly, narrower neck, rolled lip, three legs with paws, two lugs and a bail handle resting back;
  - the jelly: heaped in a superellipse crown above the rim.
- Inside the jelly:
  - six veined eyeballs whose striated irises turn to follow the viewer (each reads the rotation of its tetrahedron) and snap to anything falling in;
  - four ridged two-tone gummy worms, sugar-dusted;
  - frozen air bubbles;
  - twinkling motes, spiral marbling and milky wisps fixed in the rest shape, so they swirl when stirred.
- The jelly emits its own glow, brighter the deeper you look.
- Cast iron: blackened, faint casting bumps, rust and soot, a polished lip, dark cavity. It is lit by the moon key, the fire beneath and the brew's green spill.

COLLISION — the jelly must never show through the iron
- The pot is a solid of revolution. Its signed distance is tabulated once on a 1 cm grid in (r, y), and particles are pushed out along the gradient. Wet iron gives kinetic friction only.
- ~2,500 proxy points sampled on the rendered skin also collide. Each is tied to its tetrahedron and pushes its four corners back out, so a coarse element never straddles the thin wall.
- Capsule colliders for the legs, paws and bail.
- While the jelly is in the pot, an invisible chimney above the lip makes a pulled jelly fall back in instead of draping over the rim.
- Grab targets in the pot are kept near the axis and below a height limit.

INTERACTIONS
- Drag to pull and stretch the jelly (it lifts up and out of the pot and falls back).
- Four ingredient swatches — eye of newt (slit pupil), a black nightshade berry, a faceted garnet, a ribbed mini pumpkin. Each drops its item, which:
```

The prompt and video belong to @N1njaCodex; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

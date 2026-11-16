# Interactive jelly crocodile simulation in three.js

**#419 by popularity** · ♥ 330 · 18,340 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2121290268779618790) · [Watch the video](https://video.twimg.com/amplify_video/2121290025744678912/vid/avc1/2560x1616/rigG54wLGQbJn7Z2.mp4)

[![Interactive jelly crocodile simulation in three.js](https://pbs.twimg.com/amplify_video_thumb/2121290025744678912/img/XTncU0St3T0cQ4lz.jpg)](https://x.com/vib3coded/status/2121290268779618790)

## Prompt

```text
Build a single-file interactive three.js (r170, ES module via import map) soft-body study called "Crocodile Jelly" — No. 069 in a "Material Studies" series. A life-size crocodile cast in two layers of jelly lies on its belly on a pale studio table, legs splayed, mouth open.

Geometry (signed distance field, rest pose):
- Body: a flattened, boxy superellipse section swept along a gently curving Catmull–Rom spine from the tail tip to the snout. The tail is tall and narrow, the body broad and low, then a neck, a flat skull and a long flat snout ending in a rounded nose bulb. The belly is pressed into the table so the footprint is flat.
- Legs: four short, stocky legs built from tapered capsules (shoulder/hip → elbow/knee → wrist), splayed out sideways. Feet are flat on the table; the front feet have 5 spread toes, the hind feet 4.
- Tail crest: a double row of upright triangular plates that merges into a single row toward the tip.
- Back: rows of keeled scutes down the back, with a bigger pair on the nape. Eyes sit on raised bumps on top of the skull.
- Jaws: the mouth line sits a little below the middle of the head, so the lower jaw is a solid bar about a third of the head's depth. The upper head is built swung up about the corner of the mouth (about 17° open); the lower jaw lies flat and still on the table. The floor of the mouth is nearly flat and filled by a soft tongue pad; the palate is a shallow hollow.
- Teeth: one row of 13 sugar cones along each jaw edge, upper pointing down and lower pointing up, staggered so they interleave, every fourth one larger.
- Inside: about 22 small trapped air bubbles in the body, and 6 stomach slots down the middle for swallowed food.

Simulation:
- Hex lattice with 5 tets per cell, boundary nodes snapped to the surface and a node layer exactly on the floor.
- CPU XPBD shape matching on a fixed 60 Hz step with 10 substeps. Legs, crest and head are set firmer than the body.
- Render meshes from surface nets (clear jelly plus a cream core layer), embedded barycentrically in the tets.
- Two muscles made by rewriting rest shapes:
  (1) the head swings down about the corner of the mouth onto the still lower jaw. It breathes slowly half-open, opens wide when food approaches, and on "Snap" opens wide, slams shut and lunges forward;
  (2) a travelling-wave plus steady-turn bend of the spine. The tail sways lazily and the head turns toward the pointer; "Thrash" sends a hard wave down the body.

Rendering (hand-written ShaderMaterials):
- Key-light shadow map, a back-face thickness pass, and refraction through the front faces with Beer–Lambert absorption and a scattering tint.
- The cream layer fills the belly up to a scalloped line low on the flank and rises at the head to just under the mouth line, so the whole lower jaw is solid cream. It carries square belly plates.
- Clear jelly carries procedural scales in body coordinates (arc length × distance round the section): oblong plates in rows on the back and tail
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

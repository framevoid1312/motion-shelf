# Procedural plush dragon browser demo with combable fur and

**#588 by popularity** · ♥ 182 · 11,228 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2107020311380033949) · [Watch the video](https://video.twimg.com/amplify_video/2107020211945631744/vid/avc1/1440x1828/eVslLHYE_LnCPToD.mp4)

[![Procedural plush dragon browser demo with combable fur and](https://pbs.twimg.com/amplify_video_thumb/2107020211945631744/img/subfwpQyEPoP7C9p.jpg)](https://x.com/vib3coded/status/2107020311380033949)

## Prompt

```text
Build "Plush Dragon" — Material Studies No. 014: a single self-contained HTML file, native WebGPU, fully procedural (no assets, no libraries), in the same editorial style as the series (serif masthead, side specimen panel, live readouts, "Inside the experiment" notes).

The specimen:
- A chubby plush baby dragon sitting on a table, all made from one signed distance field.
- Minky body: a big round head with a short snout and two felt horns, a pale belly quilted in horizontal bands, stubby arms, round haunches with padded feet and tiny felt claws.
- A tail curled round to one side, ending in a soft spade.
- A row of flat felt spikes down the head, back and tail.
- Face: glossy bead eyes, blushing cheeks, embroidered nostrils, a stitched smile with one little felt fang.
- Two quilted plush wings sewn on at the shoulders.

Physics:
- Body: XPBD soft body on a hex-cell lattice (co-rotational shape matching plus tetrahedral volume), 60 Hz, 6 substeps. Gravity and floor friction; the seat keeps its footing and the toy slowly rights itself like a weighted plush.
- Muscles instead of forces: the belly breathes (cells' rest shapes and rest volumes swell); the tail wags by lengthening cells on one side of its centre line and shortening them on the other, faster when the dragon is happy.
- Wings:
  - each wing is a small XPBD cloth cut from a curved fan-shaped 3D pattern (stretch, shear and bend links), its two root rows embedded in the body lattice;
  - a pose (fold back about the vertical, flap about a hinge along the body, both riding a shoulder frame from embedded points) pulls every point toward its target: firmly at the root, barely at the edge, so the stuffed wings lag and flop;
  - collider spheres riding the body keep the wings off it.
- Flapping: downstrokes lift the dragon with a hover controller (about 6 cm off the table, bobbing with each beat), then it drops back onto its seat.
- Pulling a wing past its slack tows the body by that shoulder.

Rendering:
- Shell fur (base + N instanced shells, alpha-to-coverage under 4× MSAA): fur lie carried by the deformation gradient, damped-spring tip lag, Kajiya–Kay highlights, velvet sheen, a comb tool.
- Regions painted in rest space: belly with quilting seams, short-nap felt horns and spikes in the wing colour, padded soles, cheeks, smile groove.
- Wings drawn each frame as stuffed slabs swept from the cloth:
  - a rolled leading edge in the body colour;
  - three panels puffed between stitched ribs;
  - a scalloped trailing edge;
  - a shorter pile of the same minky.
- Glossy eyes, embroidery thread, felt fang and claws.
- Soft PCSS key-light shadows, contact occlusion on the studio floor, Khronos PBR Neutral tone mapping.
- NaN-safe WGSL (clamped pow/smoothstep, clamped post).

Interaction:
- Hand: lift and squash the dragon, or grab a wing to stretch it open (pull harder to tow the dragon).
- Finger: a finger reaches in from the viewer; poke to dent the stuffing; hold it pressed in to tickle —
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

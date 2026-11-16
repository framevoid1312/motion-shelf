# Interactive WebGPU jelly watermelon that can be cut and grabbed

**#594 by popularity** · ♥ 174 · 11,639 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2112638127483343162) · [Watch the video](https://video.twimg.com/amplify_video/2112638040594079744/vid/avc1/1920x1216/7BmcolQwoKIv3--9.mp4)

[![Interactive WebGPU jelly watermelon that can be cut and grabbed](https://pbs.twimg.com/amplify_video_thumb/2112638040594079744/img/BsH6r3x0wr-Pns-b.jpg)](https://x.com/vib3coded/status/2112638127483343162)

## Prompt

```text
Build a real-time WebGPU soft-body "jelly" study of a watermelon wedge that you can cut with a steel knife, in an editorial "Material Studies" page style (serif title "Melon Jelly.", muted paper backdrop, side panel, English UI, mobile-friendly). Geometry: a thick triangular watermelon wedge with a rounded green rind, a pale white layer, and translucent red flesh with dark seeds and a few air bubbles. Sim: CPU XPBD on a tetrahedral mesh, fixed 60 Hz step with 10 substeps. Each tet uses a co-rotational shape-matching constraint with finite compliance, which also flips inverted elements back out, plus a near-incompressible volume constraint so a stretched slice necks in. The rind is about 3× stiffer than the flesh. Damping acts only on relative velocity along edges. Floor contact uses Coulomb friction. Grabbing is a soft, reach-limited attachment to a patch of particles, and scroll or a second finger twists it.

Two tools, Hand and Knife:
- Knife: the user draws a stroke across the slice. Read on the surface, that stroke defines a vertical blade plane. Every piece is stored as a rounded convex outline in the slice's rest plane. For each piece the plane crosses, fit the piece's current pose with a best rotation, carry the plane back to rest space as a straight line, and split the outline along it.
- The cut: prebuild both halves as fresh tet meshes on release. An animated steel knife lines up over the stroke, comes down, and first presses a groove into the jelly. When it breaks through, swap in the new pieces, which inherit the position and velocity of the flesh they came from, and the blade wedges the faces apart on its way to the board. Draw the blade behind the jelly surface so the buried part is seen refracted.
- Pieces: every piece is its own soft body that can be grabbed, stretched and cut again, and pieces collide with each other instead of passing through.

Render: a smooth surface mesh plus the seeds and bubbles, each vertex embedded in a tet by barycentric weights so they ride the wobble. WGSL passes:
- floor, seeds and bubbles first;
- back faces, to get the thickness each view ray crosses;
- front faces with refraction by that thickness, Beer–Lambert absorption, milky scattering in the pale layer, a back-lit glow at thin edges, Fresnel reflections of a procedural studio, and GGX highlights;
- a soft key shadow on the floor tinted by the jelly, plus contact AO from a top-down height map.

Varieties: Crimson, Golden, Rosé. Controls: Hand/Knife tool toggle, firmness and internal damping sliders, "Give it a nudge", Reset, Pause, ¼ speed, Show mesh, plus mass/volume/kinetic readouts and an "Inside the experiment" notes drawer explaining the physics, cutting and rendering.
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

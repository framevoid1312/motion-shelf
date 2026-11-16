# Interactive blooming tea teapot browser scene

**#1202 by popularity** · ♥ 35 · 1,445 views · by [@N1njaCodex](https://x.com/N1njaCodex) · [Original post](https://x.com/N1njaCodex/status/2107392323755598268) · [Watch the video](https://video.twimg.com/amplify_video/2107392279858028544/vid/avc1/1920x1206/j2HP6gjfEfWF7XK9.mp4)

[![Interactive blooming tea teapot browser scene](https://pbs.twimg.com/amplify_video_thumb/2107392279858028544/img/KNFYOzVezNvnRUMt.jpg)](https://x.com/N1njaCodex/status/2107392323755598268)

## Prompt

```text
Build a single-file three.js scene called "Blooming Tea": a photoreal glass teapot and a small glass tea bowl on a soft celadon background, with light and dark themes. No external models or images, everything procedural.

Glass: MeshPhysicalMaterial with transmission, low roughness, slight dispersion and studio reflections from RoomEnvironment. A round-bellied teapot from LatheGeometry, a tapered curved spout, a solid glass handle, a lid with a knob.

Tea: a volume clipped by a world-space level plane, so the surface stays flat when the pot tilts. Color it in a fragment shader by ray-marching a noise-based dye field (Beer–Lambert absorption per RGB channel), so the color rises from the tea ball in swirling clouds and slowly fills the pot. Fresnel surface reflection with tiny ripples. Tint everything underwater with the same volume. Render the liquid as an opaque shader that computes its color from the background, so the glass refracts it on every GPU.

Each tea looks different before brewing:
- Jasmine: a green leaf ball dotted with white jasmine buds. It opens into a green rosette, and white flowers rise on a stem. Golden liquor.
- Hibiscus: a dark red calyx bud. It opens into a crimson rosette, and a red hibiscus with stamens rises. Ruby liquor.
- Matcha: a mound of green powder. A bamboo whisk dips in and whisks up foam. Opaque jade liquor.
- Butterfly Pea: a deep blue petal ball that opens into blue flowers. Deep blue liquor; a lemon slice turns it violet, spreading out from the slice.

Leaves and petals are procedural strips bent by curvature, θ(s)=α−κs. Closed, they wrap into a sphere; blooming eases them open one by one.

Interactions:
- "Pour hot water": the lid lifts, a water stream falls in, bubbles rise, the level goes up, and a steep timer shows the real steep time sped up.
- "Pour the tea": the spout fills with tea like communicating vessels. The pot lifts and keeps tilting as it empties, with the spout tip held over the cup, until every drop has run out through the spout. The stream thins to a trickle at the end. Compute the level from volume: a plane cuts a tilted ellipsoid like a sphere cap.
- "Drink": click the cup to drain it.
- "Brew again", pause auto-rotation, drag to orbit.

Extras: soft floor shadows, tea-colored light on the floor, steam wisps, slight sloshing. Minimal UI: the tea name in spaced caps at the top, and a floating pill toolbar at the bottom with the four teas and the actions.
```

The prompt and video belong to @N1njaCodex; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

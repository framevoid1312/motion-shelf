# Interactive 3D pineapple jelly scene in the browser

**#283 by popularity** · ♥ 356 · 50,164 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2104103495020458415) · [Watch the video](https://video.twimg.com/amplify_video/2104025404449153024/vid/avc1/1080x1440/ip-Twahu7WNnKIB_.mp4)

[![Interactive 3D pineapple jelly scene in the browser](https://pbs.twimg.com/amplify_video_thumb/2104025404449153024/img/L9BXdnGg10dJzyzf.jpg)](https://x.com/vib3coded/status/2104103495020458415)

## Prompt

```text
Create an interactive 3D scene called “Pineapple Jelly” - a thick, translucent gummy pineapple ring that users can grab, stretch, bend, and release. Everything must run directly in the browser in one standalone HTML file using genuine WebGPU and WGSL shaders.
The main priorities are convincing soft-body behavior, beautiful light refraction, and satisfying interaction.
MODEL

* A round pineapple slice with a genuine hole through its center.
* Thick, juicy flesh, a slightly scalloped outer edge, and softly rounded corners.
* Both cut faces must be equally detailed. The ring can be flipped and viewed from every angle.
* Golden translucent flesh with delicate radial fibers, small bubbles, and elongated pale juice cells embedded inside.
* No skin, leaves, or seeds. It should look like a pineapple ring made of gummy candy, not a doughnut.

MATERIAL AND LIGHTING

* Rich honey-yellow coloring, wet gloss, and soft subsurface-style light scattering.
* Refraction, thickness-dependent transparency, controlled highlights, and Fresnel reflections around the edges.
* Stretched, thinner areas should transmit more light.
* A warm, light background, soft studio lighting, and a grounded contact shadow.
* Avoid blown-out highlights, excessive bloom, and a hard-glass appearance.

PHYSICS

* Use a volumetric soft-body mesh with elastic connections and volume constraints, such as XPBD.
* Allow users to grab either the outer or inner edge and pull it in any direction.
* Deformation should spread naturally through neighboring regions: the hole stretches, the flesh bends, and the opposite side responds with a slight delay.
* After release, the ring should spring back softly, wobble a few times, and gradually settle.
* No instant snapping, endless oscillation, torn geometry, or collapsing central hole.
* Implement gravity and ground collisions. The ring should squash slightly on impact and recover its shape.
* Internal fibers, bubbles, and juice cells must deform with the flesh instead of remaining stationary.
* Clicking through the empty center must not grab the object.

INTERFACE

* A minimal editorial layout with generous whitespace.
* A large italic serif heading on the left: “Pineapple Jelly.”
* A compact “THE SPECIMEN” control panel on the right.
* Three color presets: Golden, Amber, and Rosé. Change the tint while preserving the material properties.
* Sliders for Firmness and Internal damping.
* Buttons: Give it a nudge, Reset, Turn it over, and Pause.
* Toggles: ¼ speed and Show mesh.
* Small live readouts for mass, volume relative to rest volume, and kinetic energy.
* All interface text in English.
* Support both mouse and touch interaction.

TECHNICAL REQUIREMENTS

* Use actual 3D geometry and WebGPU rendering, not a video or a Canvas 2D imitation.
* Generate all geometry and materials in code, without external models or image assets.
* Separate the simulation mesh from the smoother visual surface to maintain good performance.
* Display a clear fallback m
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

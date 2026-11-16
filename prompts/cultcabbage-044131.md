# Low-poly T-rex scooter chase with a meteor crash and tumble

**#1140 by popularity** · ♥ 42 · 1,606 views · by [@CultCabbage](https://x.com/CultCabbage) · [Original post](https://x.com/CultCabbage/status/2117312830928044131) · [Watch the video](https://video.twimg.com/amplify_video/2117311692958818304/vid/avc1/1080x1480/HnLbbufq0U4ABMnL.mp4)

[![Low-poly T-rex scooter chase with a meteor crash and tumble](https://pbs.twimg.com/amplify_video_thumb/2117311692958818304/img/u52qzOTULAd3lcOb.jpg)](https://x.com/CultCabbage/status/2117312830928044131)

## Prompt

```text
Build "Rex Ride" — a single self-contained HTML file (inline JS/CSS): a looping real-time 3D animation of an articulated low-poly Tyrannosaurus rex riding a kick scooter through a small town at sunset, weaving around obstacles, filmed from behind and to the side like a chase camera; the sky slowly turns red, a flaming meteor crashes right in front of him and the blast launches him into an epic, cinematic tumble. No text or UI on screen, only the scene. Keep the code compact: under about 1,200 lines.

TECH AND ROBUSTNESS
three.js r160 as an ES module from https://t.co/jyIKTZ7Lsd (no addons, no models, no textures). If WebGL is unavailable or something fails at startup, show a short message on screen instead of a blank page.
The file must parse and run in a browser with no syntax errors. In particular never put a unary minus directly before ** (write -(x ** 2) or -Math.pow(x, 2), not -x ** 2).
Everything is driven by a single time value t: the action runs from 0 to 13 s, then holds the final pose for 2 s, then loops (a 15 s cycle).
Wrap each frame's update in try/catch: on an error, show the message in a small on-screen box, still render the frame, and keep the loop running.
Use three.js types correctly (Vector3 for positions, Quaternion for rotations; getWorldQuaternion takes a Quaternion, getWorldPosition a Vector3). Before answering, re-read the whole script for syntax errors, then walk through every time range (riding 0–9.6 s, meteor 9.6–10.3 s, flight 10.3–11.8 s, slide and lying 11.8–15 s) and make sure each one runs without errors and shows the whole T-rex in frame.

SOLID MODELS (no holes, no see-through parts)
Every object must look solid from every angle: no missing faces, holes or see-through gaps in the T-rex (head, jaw, body, limbs, tail), the scooter, the cars, the houses or any prop.
Build from closed three.js primitives (Box, Sphere, Icosahedron, Cylinder and Cone with caps, Capsule, Extrude with caps). Never use openEnded cylinders or single-sided planes for solid parts.
Never mirror with negative scale (scale.x = -1 and similar): build the left and right sides with positive scale and position or rotation only.
If you write any custom BufferGeometry, use consistent counter-clockwise winding with outward normals and call computeVertexNormals; if unsure, give that material side: THREE.DoubleSide.
Connected parts overlap slightly at every joint (neck into head, limbs into body, tail segments, car cabin into car body), so there are no visible gaps while moving.

STYLE
Clean stylized low-poly 3D: flat-shaded matte faceted surfaces, sRGB output, no tone mapping, soft shadows from a warm low sun that follows the rider. Palette: sky dome gradient from #8cc8ef at the top through #cfe6f2 to a warm sunset horizon #f4dcb2 with matching fog; HemisphereLight #dff0ff / #e2b277 at 1.25; sun #fff0d4 at 2.1; asphalt #6f7378, sidewalk #d9cdb8, road lines #f5e0b8; houses in soft pastels (#e8b39a, #9ccfc4, #f2d38a, #c9b7e0); trees #5c9a4b; dust
```

The prompt and video belong to @CultCabbage; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

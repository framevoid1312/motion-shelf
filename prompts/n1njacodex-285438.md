# Robotic hammerhead shark simulator with exposed internals and

**#1107 by popularity** · ♥ 51 · 1,403 views · by [@N1njaCodex](https://x.com/N1njaCodex) · [Original post](https://x.com/N1njaCodex/status/2118394875238285438) · [Watch the video](https://video.twimg.com/amplify_video/2118394801334759424/vid/avc1/1920x1080/bw_hrhORkSigcKOi.mp4)

[![Robotic hammerhead shark simulator with exposed internals and](https://pbs.twimg.com/amplify_video_thumb/2118394801334759424/img/Hk1VHnmZUsI7qWxV.jpg)](https://x.com/N1njaCodex/status/2118394875238285438)

## Prompt

```text
Build an interactive 3D tank simulator of a robotic great hammerhead shark that runs in the browser: a single HTML file on three.js 0.170 (loaded via an importmap from https://t.co/L5J7EWNaMZ). Use no external models or textures; generate all geometry in code and draw all markings into canvas textures.

CHARACTER
Sphyrna HX-6: a subsea survey drone shaped like a great hammerhead, made by the fictional company Lateral Line Robotics.
- Body of 8 vertebra segments (lathe profile from a Catmull-Rom radius table, laterally compressed cross-section). Countershading: dark navy dorsal shell, pale ventral shell, boundary below the flank. Bellows seals and yaw drums at every joint, rivet rings, glowing lateral-line sensor pods, segment numbers S1–S8, yellow ROV lifting eyes, curved side decals ("HX-6", "CAUDAL DRIVE" hazard band).
- Cephalofoil: an extruded hammer outline with a median notch. Pale underside; dorsal top split into a centre plate and two hinged wing lids that open to reveal an electro-sense board with a grid of glowing ampullae pores. Telescoping 3-stage stereo optics at the wingtips with a 7-blade iris.
- Gills: 5 slits per side with heat-exchanger fins and glow; hinged flaps with a yellow inner face.
- Dorsal fin made of two mirrored halves that open like a book, letting a 3-stage sensor mast rise with a beacon, a whip antenna and a rotating acoustic-modem dish.
- Jaw: hinged lower jaw with 2 × 14 titanium teeth, a dark mouth lining and an extending 3-finger sampler claw.
- Fins: two-tone pectorals, pelvics, second dorsal, anal fin, heterocercal caudal fin on its own joint.
- Internals: titanium pressure hull, two battery packs, yellow syntactic foam block, caudal drive motor, flight computer.
- Every moving piece is a separate part with two offset vectors: full teardown (exploded view) and "spine apart".

STYLE
Deep navy + pale grey shell, ROV safety yellow (#FFC629) for markings, sensor cyan only for emissive sensors. Aqua-grey tank background. PBR materials with clearcoat, RoomEnvironment, a soft overhead key-light shadow that follows the shark, GTAO (exclude the background, fog, floor and FX planes from the AO pass), NeutralToneMapping, MSAA. Tank effects: animated caustics shader on the floor, ~900 drifting marine-snow particles in a shader, depth fog, expanding sonar rings from the head, a painted floor grid with measurement rings.

ANIMATION
- Travelling body wave over 7 joints plus the caudal fin: angle_i = A · env_i · sin(φ − 0.8·i) − κ·L_i (amplitude grows toward the tail; κ is path curvature), with the head counter-swaying.
- Swim paths are Catmull-Rom curves with arc-length parameterisation. Precompute speed, tail-beat frequency/amplitude, phase integral and heading into 1/240 s tables so stateAt(t) is fully deterministic.
- Banking from turn rate × speed, pitch from depth change, pectoral trim plus sculling while holding station.
- 30 s timeline: cruise with sonar → burst (2.6 Hz) → glide → station keep → hammer lids o
```

The prompt and video belong to @N1njaCodex; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

# Browser 3D spider simulator with IK and teardown

**#870 by popularity** · ♥ 87 · 3,467 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2118357984086725108) · [Watch the video](https://video.twimg.com/amplify_video/2118357914058407936/vid/avc1/1920x1080/TS7vz2R6h-kobrTF.mp4)

[![Browser 3D spider simulator with IK and teardown](https://pbs.twimg.com/amplify_video_thumb/2118357914058407936/img/AtAKrPEZPXuUYBsm.jpg)](https://x.com/vib3coded/status/2118357984086725108)

## Prompt

```text
Build an interactive 3D field simulator of a robotic spider that runs in the browser: a single HTML file on three.js 0.170 (loaded via an importmap from https://t.co/lj8MfmK18g). Use no external models; generate all geometry in code.

CHARACTER
Saltus SX-8: an eight-legged survey robot styled after a jumping spider, made by the fictional company Saltus Field Robotics.
- Cephalothorax built from thick ellipsoid shell patches with bevels, rivets and seams: 6 hinged carapace plates plus a top cap with a lidar puck.
- Two large principal eyes: 3-stage telescoping barrels, a 9-blade iris, a glowing sensor and lime rings; plus 6 small auxiliary eyes.
- Chelicerae with titanium fangs, a needle core sampler, and pedipalps that keep moving.
- Abdomen made of plates with "SX-8" markings and lime chevrons; the rear petals open to reveal the silk spool, the battery stack and a 3-nozzle spinneret.
- 8 legs: coxa, femur, knee, tibia, metatarsus, tarsus with claws; joint drives and 2 hydraulic rams per leg that actually track their joints.
- Every part is a separate movable piece for an exploded (teardown) view.

STYLE
Graphite + titanium + acid lime (#C6F23C) on a cool light-grey studio background. PBR materials (clearcoat on the shell), RoomEnvironment, soft shadows, GTAO (exclude the background and the floor from the AO pass), NeutralToneMapping, a soft contact shadow under the spider. On the floor: thin measurement rings and a dot grid.

ANIMATION
- Leg IK (3 links, knees up), alternating-tetrapod gait with no foot sliding.
- Poses: hanging on the silk line, leap, raised front legs, exploded.
- A deterministic 30 s timeline (stateAt(t)) that drives pose, assemblies, camera and telemetry:
  rappel down → touchdown → walk → crouch and leap → open optics → carapace → leg L2 (links separate horizontally) → abdomen → fangs → full teardown on a turntable → reassembly → ascend on the silk line.
- A dedicated camera angle for each scene with smooth blends; legs must not block the assembly being inspected.

HUD (HTML/CSS/SVG over the canvas)
Fonts: Space Grotesk + IBM Plex Mono.
- Top bar: logo, title, hydraulic load meter, sim ID, runtime, status, operator.
- Left: Hydraulics (pressure with a 3 s graph, foot force), Power, per-leg load for all 8 legs.
- Right: attitude indicator, assembly buttons (HERO / OPTICS / CARAPACE / LEG L2 / SPINNERET / FANGS), display toggles (LABELS / EXPLODED / SILK / TURNTABLE), subsystem status chips.
- Bottom: operation log with a scrubbable timeline and play/pause; a lime operating-mode badge.
- Callouts anchored to 3D points, set in columns at the viewport edges on a light backing, never overlapping.
- Every number is driven by the simulation.

CONTROLS
Any button switches to manual mode with smooth transitions. OrbitControls for a free camera; double-click returns to the auto camera. Keys: Space, 1–6, E / L / S / T / C, arrow keys.

TECHNICAL
Adaptive quality on weak devices, mobile layout, prefers-reduced-motion, safe-area
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

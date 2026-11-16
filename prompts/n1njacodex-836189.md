# Pixel-art firefighting diorama with interactive three.js simulation

**#1275 by popularity** · ♥ 31 · 1,015 views · by [@N1njaCodex](https://x.com/N1njaCodex) · [Original post](https://x.com/N1njaCodex/status/2114767777407836189) · [Watch the video](https://video.twimg.com/amplify_video/2114767712127782912/vid/avc1/1920x1200/CvUlryDmWsaBKYW1.mp4)

[![Pixel-art firefighting diorama with interactive three.js simulation](https://pbs.twimg.com/amplify_video_thumb/2114767712127782912/img/-FH7oXHeaRCvurtm.jpg)](https://x.com/N1njaCodex/status/2114767777407836189)

## Prompt

```text
Build a single-file, original pixel-art diorama called "Station Seven": a small-town fire station on a floating isometric island block, rendered with three.js (r160) at low resolution and upscaled with a post shader (depth-based outlines, OKLab quantisation to a fixed 64-colour palette, optional Bayer dither, a "Raw 3D" toggle). Orthographic camera, drag to rotate, scroll to zoom, whole-pixel snapping.

World: a two-lane rounded-rectangle loop road (Main St / South St) with curbs, sidewalks, zebra crossing, a brick two-bay station (roll-up doors, hose tower, sign, alarm lights, bench, flagpole whose flag follows the wind), five houses (three on South St, two across Main St) built from per-room cells, hydrants, street lamps with real point lights at night, a small park, trees, hedges and fences. Day / dusk / night blend, rain with puddle reflections and a "roads wet" meter, calm / breeze / gusty wind.

Fire sim: each room has heat, fuel, burning, smoulder, char and wetness; fire grows, climbs, spreads sideways (wind-biased) and to the neighbouring house; water cools rooms; roofs can collapse to rafters; houses are repaired a while after the incident. Flames, smoke, steam, embers and water are instanced voxels and points; the water is ballistic.

Operations: smoke → 911 call → alarm → crew runs to the trucks → ladder leads out, engine follows with sirens → engine takes the nearest hydrant (supply line), nozzle team lays an attack line that trails behind the nozzleman, officer directs → the ladder sets outriggers, its articulating boom (turntable, lower arm, telescoping upper arm, level bucket) reaches a window to rescue a trapped resident and lowers them to the street, then flows water from above → knockdown → pack up → return round the block → a spotter backs each truck into its bay.

Traffic: a few cars circulate; they pull over for sirens (not on bends), hold back while a truck pulls out or backs in, and pass trucks parked at a fire by using the opposite lane one way at a time while oncoming cars wait at a line. No deadlocks and no overlapping vehicles.

UI (English): a lit scoreboard (CALLS · clock + status · RESCUES · wind line), side rail with Time & weather, Wind, Units (live status per truck, "Report a fire", Pause, "Fires start on their own"), a Dispatch radio log, View controls (turn, pixel size, palette/dither/outlines), click a house to start a fire there, a collapsible "How it's drawn" note. Responsive (phone layout stacks), light and dark themes, no external assets except three.js from a CDN.
```

The prompt and video belong to @N1njaCodex; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

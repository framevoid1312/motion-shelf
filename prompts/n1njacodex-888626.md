# Interactive pixel-art fishing harbour diorama in real-time 3D

**#966 by popularity** · ♥ 77 · 1,794 views · by [@N1njaCodex](https://x.com/N1njaCodex) · [Original post](https://x.com/N1njaCodex/status/2115466641110888626) · [Watch the video](https://video.twimg.com/amplify_video/2115466252508409857/vid/avc1/1920x1200/CEmHExLOzGAPGviH.mp4)

[![Interactive pixel-art fishing harbour diorama in real-time 3D](https://pbs.twimg.com/amplify_video_thumb/2115466252508409857/img/gmlWBbjeeyAVfYxM.jpg)](https://x.com/N1njaCodex/status/2115466641110888626)

## Prompt

```text
Build a single-file HTML pixel-art diorama of a small fishing harbour ("Polgrain Pier") in three.js (0.160 via importmap from jsDelivr). Use an orthographic isometric camera with quarter-turn rotation, a low-res render target, depth-buffer outlines and an OKLab nearest-of-64 palette pass.

The scene is a floating island. Its north end is a granite quay with whitewashed cottages, a tarred smokehouse with smoke, net racks, barrels and lobster pots, a fish market under a striped awning, a wooden luffing derrick and a harbour bell. The rest is a basin of sea water held in by a rim of rocks, with a red-and-white lighthouse whose beam sweeps at night. A timber pier on tarred piles runs out into the basin with a T at its end.

Water: a vertex mesh lifted every frame by summed long waves plus a slow tide. The boats, floats, nets and gulls sit on the same height function, and the water mixes in a mirrored render of the scene.

Five original anglers (box-rig figures with two-bone IK) sit on the pier edge with legs dangling, on stools, or stand. Each has a rod of eight segments that bends toward the line's pull, a sagging line and a float.
- They cast in a ballistic arc. Bites come by chance, weighted by species and time of day (mackerel, herring, sea bass, cod, flounder, conger eel, plus crab, old boot and weed).
- A bite is nibbles that twitch the float, then a take that pulls it under. A strike during the take hooks the fish; too early or too late loses the bait.
- In the fight the fish runs and rests and tires; the reel gains line while it rests; leaps and splashes; a big fish can snap the line.
- A landed fish is lifted out, unhooked on the deck, weighed and put in a bucket, or thrown back if undersized.

Two clinker sailing boats with lug sails that fill to leeward and heel. Each floats on the waves under its bow, stern and sides. The two-person crew casts off, sails to the fishing grounds, throws a net that spreads on the water, then hauls it back with fish flicking and gulls diving. They sail home and moor, and the derrick swings fish boxes ashore one by one for a porter to carry to the market. Customers buy from the fishwife; a cat steals fish.

Also include gulls that perch, soar, float, dive for bread and steal from buckets, and a child crabbing off the quay.

UI in English: a scoreboard with the best fish of the day and the kilograms landed, a catch table, boat statuses, a feed and a chalk board on the pier. Controls: click the water to throw bread, click an angler for fresh bait, a bell that calls the boats, slow motion, morning/noon/dusk/night and calm/breezy/storm (rain, spray). Responsive phone layout.
```

The prompt and video belong to @N1njaCodex; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

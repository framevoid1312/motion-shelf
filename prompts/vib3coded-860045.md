# Pixel-art 3D table tennis diorama with courtyard life and UI

**#636 by popularity** · ♥ 165 · 9,649 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2114842660829860045) · [Watch the video](https://video.twimg.com/amplify_video/2114842610950942720/vid/avc1/1440x1860/L8J2y1k4aNv11FQ7.mp4)

[![Pixel-art 3D table tennis diorama with courtyard life and UI](https://pbs.twimg.com/amplify_video_thumb/2114842610950942720/img/bTB9oddCWsxouybR.jpg)](https://x.com/vib3coded/status/2114842660829860045)

## Prompt

```text
PROMPT

Build a single-file HTML pixel-art diorama called "King of the Table": table tennis in the courtyard of a three-storey pastel panel apartment block, on a small floating island, rendered with three.js (r160 via importmap) as a real 3D scene drawn into a low-res render target (orthographic isometric camera in 90° steps, whole-pixel snapping, depth outlines, a fixed 64-colour palette matched in OKLab, optional dither, Raw 3D toggle).

World: the block with three entrances (canopies, numbered plates, lamps), windows, balconies with washing; brick garages; a regulation concrete table (2.74 × 1.525 m, top at 76 cm, steel net 15.25 cm) on a slab pad with a flip score counter on a stool; benches; a playground (swings, slide, sandbox, carousel); washing lines whose sheets flap in the wind; two parked cars; birches, lilac, painted-tyre flower beds, a chalk hopscotch; lamp posts. Merge static meshes by material.

Ball physics: 40 mm / 2.7 g ball with strong quadratic drag, Magnus lift from spin (topspin dives, backspin floats), table bounce that converts spin into pace, net and net-cord, ground bounces and rolling, walls, wind with gusts. Shots are solved (bisection over launch angle) to land on a target with a given spin and net clearance, then perturbed by an error model (hurry, incoming pace, risk, wind, mishits). Serves: tossed ≥16 cm from the palm, struck behind the end line, solved so they bounce once on each half; lets.

Game: 4 neighbours with distinct styles (lefty topspin attacker, close blocker, far-back chopper, wild smasher) play king of the table: games to 11, two clear, serve changes every 2 points and every point from 10-all; winner stays, loser to the back of the bench. Players predict the ball's flight, shuffle to meet it after the bounce, and choose forehand/backhand loops, drives, blocks, pushes, flicks, chops, lobs, floated returns and smashes, with keyed bat paths and two-bone IK box-rig bodies. Between points the nearer player fetches the ball wherever it rolled (or takes a new one if it falls off the island), throws it to the server, who bounces it on the table before serving. Yard life via generator coroutines and A*: grandmothers knit and comment, kids swing/slide/ride the carousel/dig/watch, a man walks his dog, pigeons peck and take off when approached. Day/dusk/night, rain (everyone shelters under the canopy, puddle reflections, then the table is wiped), wind calm/breeze/gusty. Clicks: the table aims the next shot; the yard calls the pigeons; buttons call Loop/Push/Smash/Lob. UI: flip-card score board with serve dots, bench ladder with W–L, longest rally, wind readout, comments feed, view controls, "How it's drawn" notes, light/dark themes, phone layout.
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

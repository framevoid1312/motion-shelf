# 3D pixel-art baseball stadium game on a floating voxel island

**#652 by popularity** · ♥ 165 · 8,878 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2118281844181369210) · [Watch the video](https://video.twimg.com/amplify_video/2118280729423454209/vid/avc1/1080x1352/hGupbIsdXaywIRvN.mp4)

[![3D pixel-art baseball stadium game on a floating voxel island](https://pbs.twimg.com/amplify_video_thumb/2118280729423454209/img/6PRxpanQJXPKfZ8u.jpg)](https://x.com/vib3coded/status/2118281844181369210)

## Prompt

```text
Build a single-file HTML5 game, "Marigold Park": a pixel-art 3D baseball game on a floating voxel island, where you manage one of two teams (you choose the approach, the pitches, the defence and the steals; the sim plays out each pitch). three.js r128 from cdnjs, no build step for the player, everything inline, no asset files.

LOOK
Render the 3D scene to a low-res target (default 2 px art pixels, slider 1-6), then a post pass: depth-based outlines, snap every pixel to a fixed 90-colour OKLab palette, Bayer dither. Orthographic isometric camera (rotate in 45 degree steps or drag, zoom, tilt) placed 850 m from its target with a far plane of 1700, so the island is never clipped at low tilt. Sun shadow map, day / dusk / night with eased light changes and floodlights that come on after dusk.
Island: a slab of 2.4 m voxel columns (about 208 x 192 m), terraced rim, banded soil and slate, a waterfall. The slab is solid right through the centre (every cell included) with DoubleSide faces, so no hole shows from any camera angle. A 2048 px painted ground: outer grass patchwork, the park (mown stripes, fair and foul ground, warning track, infield dirt skin, grass diamond, base paths, circles, chalk lines), and the village (paths, plaza, parking, playground, pond, stream).
Park geometry in metres, home plate at the origin: bases 18 m apart, mound 13.5 m out, fence 60 m at the lines swelling to 70 m at centre (3 m high), foul poles, backstop, two dugouts with benches, bullpens, umpires, base coaches and an on-deck batter. Three playing surfaces that repaint the ground and change the physics: natural grass, artificial turf (the ball skips and keeps rolling, fewer bad hops), red clay infield (slow and heavy but more bad hops and errors).
Stands in eight side groups around the park: coloured seat sections, a brick concourse wall with pilasters, windows and a cornice, a striped canopy with a scalloped valance over the back rows, a press box, an outfield scoreboard, outfield bleachers beyond the fence, advertising boards, banners, bunting, rails, pennant poles at the corners, vendors in the aisles, a mascot by the third-base dugout, floodlight towers, thousands of instanced spectators in team colours who cheer on big plays.
Village around the park: plaza with a gate arch and sign, ticket booths, a statue of a batter on a pedestal, a fountain, market stalls with umbrellas, benches, lamps, hedges, planters, a car park, a playground, a pond, a stream with a waterfall, groves, walkers and floating islets.
Doll's-house lift: the eight stand sides that face the camera rise out of the way (with their crowds and fence) and ease back when the camera turns; disabled for cinematic cameras and between innings; toggle "Lift near stands".

GAME
Six invented teams (Harbor Gulls, Cedar Bears, Ironwood Foxes, Riverton Rays, Maple Hawks, Dunes Lizards) with generated rosters: 9 hitters (C, 1B, 2B, SS, 3B, LF, CF, RF, DH) with contact, power, eye, speed, range, arm, glove an
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

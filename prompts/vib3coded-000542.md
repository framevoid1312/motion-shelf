# Pixel-style 2v2 beach volleyball game in a floating voxel island

**#755 by popularity** · ♥ 120 · 6,173 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2119464800661000542) · [Watch the video](https://video.twimg.com/amplify_video/2119464718326718465/vid/avc1/1080x1350/OkVncRPAizplQUJq.mp4)

[![Pixel-style 2v2 beach volleyball game in a floating voxel island](https://pbs.twimg.com/amplify_video_thumb/2119464718326718465/img/J7Sj5rDjcSREeIoN.jpg)](https://x.com/vib3coded/status/2119464800661000542)

## Prompt

```text
Build a single-file HTML5 game, "Beach Volleyball": a 2 vs 2 beach volleyball match in pixel-art 3D on a floating voxel island. three.js r128 from cdnjs, everything else inline, no asset files, no build step for the player.

LOOK
- Render the 3D scene to a low-res target (default 2 px art pixels on wide stages, 1 px on phones; slider 1-6), then a post pass: depth-based outlines, snap every pixel to one fixed 90-colour OKLab palette, ordered Bayer dither. Orthographic camera with smooth azimuth / elevation / zoom, pixel-snapped. Sun shadow map; day / dusk / night lighting. Four floodlight poles at the court corners must be registered as point lights BEFORE the lights are initialised, otherwise night is pitch black.
- Island: a slab of 1 m voxel columns with a rounded outline, a sandy top (three sand tones from noise), a grass rim, boardwalks, layered rock strata underneath with floating rocks. The slab is solid through the centre (no holes from any angle). A ground canvas paints sand, boardwalks, the 16 x 8 m court rectangle with blue boundary lines and the centre line under the net.
- Court: two net posts (padded, 2.43 m tape height), a net with a canvas grid texture that sways and shivers when touched, white tapes, red-white antennae, a referee's high chair on the far side with a roof, two benches with towels, a big scoreboard sign above the far stand (canvas texture redrawn when the score changes: team names, two 2-digit scores, "TO 21", a dot for the serving team).
- Surroundings: four tiered wooden stands (long ones behind both sidelines, short ones behind the baselines) with an instanced crowd of voxel spectators in both teams' colours who bob and jump more after points; a tiki bar, lifeguard tower, surfboards, striped umbrellas, palms on the rim, bushes, a few spare balls and sandals, drifting gulls, clouds in the sky shader.
- Doll's-house lift: every stand is its own lift group; a group that the sight line from the camera target to the camera crosses below roof height slides up and out of the way (and stops casting shadows). Option "Stands lift away" to turn it off. Merge static meshes by material after building (animated roots such as the net are excluded).

PLAYERS (four voxel athletes + a referee)
- Jointed rigs built from boxes: hips, torso, head with hair / cap / ponytail, upper arms and forearms on shoulder and elbow groups, thighs and shins on hip and knee groups, a hand anchor. Two teams: Azure (blue shirt, navy shorts) and Amber (orange shirt, red shorts); different skin tones and hair styles.
- A pose function per state returns channels (hip height, torso pitch / twist, head, both shoulders (pitch, roll), elbows, both hips, both knees, body offset, air height). Ready stance breathes; run cycle from gait phase and speed; dig (platform arms, deep knees), set (hands above forehead, extend), spike (arch back, cock the hitting arm, swing through), block (arms straight up, jump), serve toss and serve, dive (body flat, arms for
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

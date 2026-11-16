# 3D character rebuilt from a turnaround sheet with animations

**#998 by popularity** · ♥ 59 · 2,859 views · by [@bonsaixbt](https://x.com/bonsaixbt) · [Original post](https://x.com/bonsaixbt/status/2116633195794067826) · [Watch the video](https://video.twimg.com/amplify_video/2116633142345748480/vid/avc1/1080x1350/O0svMxFTYkK-G-gV.mp4)

[![3D character rebuilt from a turnaround sheet with animations](https://pbs.twimg.com/amplify_video_thumb/2116633142345748480/img/Ek9roA8ddlWIy3O8.jpg)](https://x.com/bonsaixbt/status/2116633195794067826)

## Prompt

```text
Delete the "learn Blender first" step. Claude Opus 5.5 rebuilt my mascot in 3D straight from his character sheet, skeleton and animations included

No Blender, no 3D artist, no rigging tutorial. Just one PNG with four views of a guy who has a bonsai growing out of his TV head

I expected a rough blocky mannequin that only sort of looked like him. Instead Claude read the sheet the way a modeler reads a turnaround, front, side and back, and carried over every detail it could see, right down to the pixel bonsai on the hoodie and the green heels on the sneakers

The trick is that a chunky stylized character isn't really "3D art" to Claude, it's geometry it can describe in Three.js, so the whole hero ends up as one readable file you can open and change

Here's how it works:

> Claude uses the front, side and back views as the blueprint for proportions, so the head, hoodie and baggy cargo pants keep the same silhouette as the drawing
> it builds the model from rounded blocks and voxels: a TV head with a pixel screen face that blinks, a 354-voxel bonsai, the hoodie, the cargo pants and the sneakers
> it rigs him with 18 real bones from the hips up to the head, plus one extra bone for the tree, so the bonsai sways and lags behind every time he moves
> it writes five animations by hand (idle, walk, run, jump and wave) and blends between them, so switching from a run into a jump doesn't snap
> it drops him into a small paper-style level where WASD walks, Shift runs, Space jumps and E makes him wave

You can use the same approach for a brand mascot on your landing page, a hero for a weekend game jam, an animated avatar for your videos, or a quick prototype before you pay anyone for production 3D
```

The prompt and video belong to @bonsaixbt; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

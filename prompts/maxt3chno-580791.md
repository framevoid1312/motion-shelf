# Side-by-side boar animation refinement comparison in Blender

**#862 by popularity** · ♥ 79 · 4,637 views · by [@maxt3chno](https://x.com/maxt3chno) · [Original post](https://x.com/maxt3chno/status/2106755008884580791) · [Watch the video](https://video.twimg.com/amplify_video/2106754479408160768/vid/avc1/2304x1440/aOJmTVoiC-MC2GSO.mp4)

[![Side-by-side boar animation refinement comparison in Blender](https://pbs.twimg.com/amplify_video_thumb/2106754479408160768/img/ipTmjvYAjC48BFWB.jpg)](https://x.com/maxt3chno/status/2106755008884580791)

## Prompt

```text
Use Blender MCP to refine an existing rigged boar animation against a side-view video reference (144 frames at 24 fps, 6 seconds).

First inspect the scene, rig, rest pose, bone hierarchy, mesh weights, and existing animation. Create a verified backup before making changes.

Set up a synchronized side-by-side comparison in Blender: reference on the left, model on the right, with matching frame numbers. Review all 144 frames and match the visible motion as closely as the model’s proportions allow. Explicitly identify any poses inferred because of occlusion or missing depth information.

Animate complete leg chains from the shoulders and hips, with appropriate body movement and weight transfer. Preserve bone lengths. Match footfall timing, hoof placement and orientation, swing height, stride length, and joint bending. Avoid excessive bending of supporting legs, ground penetration, foot sliding, and unnatural hoof tilt.

Validate the front and hind legs separately before smoothing. Previous attempts improved the front legs but left the hind legs with short strides, insufficient swing flexion, and trajectories poorly positioned relative to the pelvis. Smoothing preserved these errors instead of correcting them.

Once the gait is correct, improve continuity without changing footfall timing or ground contact. Check interpolated and subframe poses using the deformed hoof mesh, not only bone positions. Treat numerical smoothness and contact checks as supporting evidence; also inspect the rendered motion.

If working from v4, preserve the approved front legs, torso, head, and tail animation, and modify only the hind-leg chains. Use the reference to determine hind-leg timing; do not assume a fixed offset from the front legs.

Deliver the updated .blend file and synchronized comparison video. Briefly report what changed, what failed and how it was fixed, what was verified, and any remaining mismatch. Do not claim an exact 1:1 match unless the comparison supports it.
```

The prompt and video belong to @maxt3chno; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

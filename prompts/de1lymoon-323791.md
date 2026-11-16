# Blender Python pipeline for a rigged Unity-ready 3D game character

**#1257 by popularity** · ♥ 32 · 1,064 views · by [@de1lymoon](https://x.com/de1lymoon) · [Original post](https://x.com/de1lymoon/status/2120212518891323791) · [Watch the video](https://video.twimg.com/amplify_video/2120212152183070720/vid/avc1/1920x1080/uZKIV4khU9u1jEx-.mp4)

[![Blender Python pipeline for a rigged Unity-ready 3D game character](https://pbs.twimg.com/amplify_video_thumb/2120212152183070720/img/5ov2ypBqQSRqH28c.jpg)](https://x.com/de1lymoon/status/2120212518891323791)

## Prompt

```text
Design an original stylized 3D game character: readable face, 2+ clothing layers, 2+ accessories, full body, A-pose, arms away from the body, empty hands. Write a Tripo text-to-3D prompt for it (max 400 chars).

Then write one Blender Python script (bpy, headless) that takes the Tripo GLB and outputs a Unity-ready character:
1. import, join meshes, scale to 2 m tall, feet on the ground, centred
2. check which way it faces (toes in front of the shins, arm span wider than depth) and turn it to face -Y. Tripo often exports characters facing +X
3. weld seam splits, delete floating pieces, fill small holes
4. decimate to 20k tris, new UVs, bake the original texture onto it
5. build a humanoid armature from the mesh shape, auto weights, max 4 influences per vertex
6. make 4 clips: idle, walk, wave, jump
7. export FBX with all clips
```

The prompt and video belong to @de1lymoon; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

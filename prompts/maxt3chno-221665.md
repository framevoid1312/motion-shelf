# Rigged 3D shark with swim and bite animations

**#311 by likes** · ♥ 117 · by [@maxt3chno](https://x.com/maxt3chno) · [Original post](https://x.com/maxt3chno/status/2113934291818221665) · [Watch the video](https://video.twimg.com/amplify_video/2113934210998185984/vid/avc1/1200x720/6__XcW73o4_kA1jZ.mp4?tag=29)

[![Rigged 3D shark with swim and bite animations](https://pbs.twimg.com/amplify_video_thumb/2113934210998185984/img/rm7-OKn_ZorgvJAO.jpg)](https://x.com/maxt3chno/status/2113934291818221665)

## Prompt

```text
You’ll animate a rigged shark from Meshy/Tripo in Blender. Generate and export headlessly with Python scripts so every run is reproducible; use Blender MCP only for inspecting the scene. Never overwrite the original GLB: work on copies, and put each new version in its own folder.
Stage 1: Fix the rig before animating
Auto-rigs usually bake a bent tail into the rest pose. Build a straight neutral pose by straightening the mesh, not the bones: rotate the tail joints until the fin lines up with the tail stalk. If you straighten by bones, the mesh stays bent and the tail beats asymmetrically.
Clean the weights in local zones only, and measure deformation before and after. Check that:
the nose and upper teeth have no lower-jaw weight;
the dorsal and pelvic fins are weighted to a single body bone;
noisy weights at the fin roots are smoothed.
Reweight the lower jaw to about 1.0 along the mouth line. Otherwise it bends instead of rotating when the mouth opens.
Map the bone chain and check the hierarchy. The pectoral fins are often children of the head bone, so any head rotation moves them too.
Stage 2: Procedural swim and idle (no video)
Make a travelling wave down the spine: yaw = A(x) · sin(2πt/T − 2πx/λ), with λ ≈ body length.
Use a tuna-like envelope: the front stays nearly rigid (<1–3°) and the motion grows toward the tail (~30° at the fin). Turn the head slightly in counter-phase.
Swim: 24 frames. Idle: about 60 frames at ~0.45× amplitude. The last key must equal the first, so the loop has a zero seam.
Check the result with real numbers: tail sweep about 0.15–0.2 of body length, sweep centered around 0, and no mesh edges overstretched.
Stage 3: Reference frame for the video model
Render a 1920×1080 split screen: side view on the left, top view on the right, both orthographic at the same scale, on a flat green background.
Color-code the parts on the mesh:
left fin blue, right fin yellow;
tail lobe magenta;
lower jaw orange;
body desaturated gray.
Save the cameras, the world-to-pixel formulas and the start pose (frame 1 of swim) to JSON.
Write a Seedance/Omni prompt: static camera, shark held in place, both panels in sync. Timing: calm swim, then lunge and jaw open, bite, recover, back to swimming. Forbid water, bubbles, blood and prey.
Stage 4: Check the generated video
Compare frame 0 with the start frame. The model usually zooms and shifts the image slightly, so fit one global 2D zoom + offset and apply it before fitting. Don’t move the cameras.
Check that:
the colors stay stable on every frame;
nothing leaves the frame;
the two panels stay consistent with each other.
Expect artifacts: the far fin rendered gray, a “forked” tail seen from above, and a red mouth interior.
Stage 5: Fit the bite
Fit the rig frame by frame in world-space parameters, so that:
the model’s points fall inside the silhouette;
the model covers the silhouette;
the colored zones match in both views.
Fit in stages per frame: body, then head + jaw, then fins.
Express fin rotation relative to the torso, not the head. Keep the tail lobe stiff, because its yaw is barely visible from above.
Apply a de-jerk smoothing pass, but keep the peak amplitudes.
Stage 6: Retarget to an anatomical spine model (important)
A free per-joint 2D fit turns the body into a snake: segments bend in opposite directions and it explains out-of-plane motion as sideways bends. Wider joint limits make it worse.
Keep the head strike from the video, because that’s what makes the bite feel alive. After that, drive the body with:
whole-body heading;
one scheduled C-bend spread over fixed weights toward the tail;
head motion capped at about 12°;
roll scaled down;
the procedural swim wave on top.
Pass criteria:
adjacent segments ≤15° apart;
no sign flips in the bend along the front of the body;
tail stalk ≤25°;
total bend ≤60–70°.
```

The prompt and video belong to @maxt3chno; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

# 38-second realistic 3D short about a man and weather balloons

**#634 by popularity** · ♥ 132 · 13,070 views · by [@theoardley](https://x.com/theoardley) · [Original post](https://x.com/theoardley/status/2120124748159996152) · [Watch the video](https://video.twimg.com/amplify_video/2120124716274888705/vid/avc1/1008x1152/9H-B8JfF30S2S0iD.mp4)

[![38-second realistic 3D short about a man and weather balloons](https://pbs.twimg.com/amplify_video_thumb/2120124716274888705/img/AzYr6KKYZOdyoNgE.jpg)](https://x.com/theoardley/status/2120124748159996152)

## Prompt

```text
<inputs>
Ask me 2 things, then wait:
1. The story in one line: a strange TRUE event where one person did one odd physical thing ("He tied 42 weather balloons to a lawn chair."). If I say "you pick", pitch 3 with one source link each and take the first unless I choose.
2. The voice. Default: Kokoro (free, runs on my computer), a calm, warm male narrator.
Then tell me everything else is free: Blender (find my install, or tell me the one download), its free MPFB extension for human bodies (ask me before you install it) and into this folder a Python venv with FFmpeg (imageio-ffmpeg), kokoro-onnx + its model files (kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx GitHub releases), faster-whisper (small.en), numpy and Pillow. It needs no API key or account and renders on my graphics card with EEVEE.
</inputs>

<direction>
The look: a clean, realistic 3D world, like a good game cutscene. Bright, saturated, a little filmic.
- People: realistic bodies with generic faces and big readable expressions (shock, a smirk, a scream). Plain clothes, no logos. Never a real person's likeness: for a real person keep the face out of close-ups (hands, back, side, distance, straight top-down).
- CALM shots only. Bodies in fast action or contact (running, jumping, fighting, falling) look stiff, so tell the story with frozen moments under a slowly moving camera, macro inserts of hands and objects, rooms, vehicles, the sky, top-down views and the aftermath.
- One new picture for every caption chunk (2-4 words, about 1-1.5 s): a new framing, a new action or a camera move. Nothing ever holds still: every shot drifts, pushes in or orbits.
- The shot kit: macro insert (extreme close-up of the key object or hands, very shallow depth of field), hero low angle (wide lens at waist height), god's-eye top-down with a slow rotate, tracked object, over the shoulder, smash zoom on the word that matters, whip pan between beats, glow highlight (the named object glows orange with a rim, then fades), a big 3D number lying in the scene, a thought bubble (a cloud ring showing what he hoped for), a TV in the scene replaying the event.
- Light: a bright warm sun, blue sky with clouds, soft shadows. Night scenes use hard lamps and a dark sky. Wide lens up close, depth of field on every shot, motion blur on every fast camera move.
- Captions: 2-4 words at a time, white bold rounded sans, about 64 px on a 1080 px-wide frame, centred, 78% down the frame, soft dark shadow, no box. Each chunk replaces the last on the same frame as its picture.
- Banned: real footage, photos, downloaded textures or 3D models, logos, AI images or AI video, downloaded music, gore.
</direction>

<structure>
38-50 s, 100-140 words, 150-180 words a minute. The voice starts at 0.0 s.
- Line 1: the most surprising physical act, in past tense, opening with "He" (or "She"). No name, date or setup. Frame 1 shows that act.
- Then a cause-and-effect chain: every sentence starts with a hinge word (Then, Suddenly, So, Because, But, Later) and is ONE visible action.
- The context arrives late, after "You see,".
- A reveal: someone looks closer and the story turns.
- The last line is the consequence. No call to action, no question.
- Names are rare: use one only when it pays off.
Title = "He ..." or "The Man Who ...". The cover is the first frame.
</structure>

<build>
Save every stage to disk so a crash never costs more than one stage.
- sources.md: every fact with its link and the date you read it. Anything you can't verify stays out.
- script.json: the lines and the caption chunks cut by hand (2-4 words, one picture each), each chunk with its shot: the set, the camera, what moves.
- https://t.co/2ltXAYBEB2: Kokoro reads the whole script in one take (speed 1.0-1.1) and pauses are squeezed to 0.35 s at most; faster-whisper times every word (pass it a 16 kHz numpy array, not a path); write chunks.json with each chunk's start and end. A picture and its caption switch together on frame round(start*30)+1.
- blender/: Python scripts run headless (blender -b -P). https://t.co/Xw0DENaRfo makes one .blend with the sets, the cast, the props and every shot baked with a key on every frame. https://t.co/7dWyuydMpl sets EEVEE with ray tracing, the AgX view with the Punchy look, motion blur, depth of field and bloom in the compositor. Bodies come from MPFB or are built by you; clothes, hair, props and sets are built in code.
- Stills first: one half-size still per shot as a contact sheet. Look at every tile and fix what's off before any full render. Time one full-size frame and tell me the estimate.
- Render 1080x1920 at 30 fps to PNG frames, skipping frames already on disk.
- https://t.co/49eJxversT, numpy only: a light music bed, a sound on every action (a whoosh on each whip pan, hits, wind, room tone), ducked under the voice, mastered to -14 LUFS on the whole stereo mix.
- https://t.co/9GMRkcDO2w: burn the captions in from chunks.json. Encode out/<slug>_9x16.mp4 (1080x1920, 30 fps, TV-range yuv420p) and out/<slug>_x_7x8.mp4 (1008x1152, under 10 MB, 2-pass): a crop of the 9:16 frame that keeps the subject and the caption.
</build>

<gotchas>
- Blender paths: pass absolute output paths (a relative one lands on the drive root).
- MPFB headless: enable it with addon_utils.enable("bl_ext.user_default.mpfb"). Bake a body's shape keys before you pose it: the rig is fitted to the baked shape.
- Clothes: cut them from the body mesh and push them 7-16 mm out along the normals; keep two rings of body faces under every hem.
- Nothing coplanar: keep every resting object 1 cm off its neighbour and draw ground markings into the texture, or they flicker.
- Hair: EEVEE draws hair only from a Curves object, hair type STRIP. Use a Principled BSDF on it (the Hair BSDF renders black).
- Skin: keep subsurface weight near 0.2 (more turns faces black in EEVEE) and add a soft fill light from below under a noon sun.
- Hands: a curled hand reads as a claw from the palm side, so shoot a grip from behind the knuckles.
- Motion blur: shutter position START, a key on every frame, plus a key half a frame after each shot's last frame, so blur never reaches across a cut.
- Check: run a black-frame and one-frame-flicker check on the render. Make a contact sheet (a frame every 0.5 s) and look at every tile: the act reads in the first 2 s, faces are lit, nothing clips through anything, captions stay off faces and key objects. Then step through the first 2 s, the middle and the end frame by frame. Fix, render only the changed shots again.
</gotchas>

<start>
Pitch (or take my story), then show me the script with the word count, the caption chunks with their seconds and the shot list with what the first frame shows. Build nothing until I say go.
```

The prompt and video belong to @theoardley; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

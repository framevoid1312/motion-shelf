# Jelly eyeball model comparison

**#320 by likes** · ♥ 103 · by [@semichenkko](https://x.com/semichenkko) · [Original post](https://x.com/semichenkko/status/2112923979002368406) · [Watch the video](https://video.twimg.com/amplify_video/2112923941119447040/vid/avc1/720x992/TUrVM-FaxvV2LGG5.mp4?tag=29)

[![Jelly eyeball model comparison](https://pbs.twimg.com/amplify_video_thumb/2112923941119447040/img/gQiFyv8uIffxmZ_X.jpg)](https://x.com/semichenkko/status/2112923979002368406)

## Prompt

```text
Build a single-file HTML + Three.js interactive scene called "Jelly / Eyeball."

Look: premium product render on a clean white background. One large gummy eyeball sits on the floor in the center - milky translucent jelly sclera with fine red veins, a glowing blue iris with radial fibers, a glossy black pupil and a clear wet cornea bulge on top. A red gummy optic nerve trails behind it on the floor. Soft colored glow and a soft shadow underneath. Around the edges: small jelly pumpkins (purple, green, orange), jelly beans and candy corn, all glossy and translucent. Physically based materials (transmission, clearcoat), environment reflections, ACES tone mapping, soft shadows.

The eye is a real soft body - deformation happens in the vertex shader so the sclera, iris, pupil and cornea all bend together:
1. It always watches the cursor, and keeps finding you even after it rolls.
2. Tap it - a gooey dent with a ripple, jelly eyelids blink, the pupil contracts, and it does a small hop.
3. Grab and drag it - the grabbed spot stretches toward the cursor like taffy into a teardrop. Lift it up and it dangles and sways with gravity.
4. Flick and release - it gets thrown with the hand's velocity plus a slingshot recoil from the stretch. It squashes and stretches along its velocity in flight, splats on the floor and walls with a big squash, bounces, rolls (the iris rolls with it), then wobbles and rights itself to look back at you.
5. Pull it sideways and let go - it snaps back like a slingshot.
6. Grab the nerve - it is a verlet rope, so you can lift the eye by it and swing it around.
7. Double-tap - hypnotized: the pupil dilates and the gaze spins in circles.
8. Hard landings make it dizzy - its eyes wander for a moment.

Jelly secondary motion everywhere: volume-preserving squash on impacts, shear wobble when it accelerates, ripples from pokes.

UI: elegant serif italic title "Jelly /" with "Eyeball." in the iris color top-left, small kicker "Nº 12 / Soft goods · October", short grey subtitle. Small white control panel top-right: iris color swatches (changes the iris and title color), sliders for Pupil and Wobble, a live "Mood" status (Curious / Startled / Stretched / Airborne / Dizzy / Dangling / Hypnotized), a "Blink" button and a "Pour candy" button that rains gummies that bounce off the eye and dent it. Bottom hints: "Drag to stretch · Flick to throw · Tap to poke · Pull the nerve". Price "2.90 €" bottom-right.

Smooth 60fps.
```

The prompt and video belong to @semichenkko; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

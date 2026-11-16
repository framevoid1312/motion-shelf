# Interactive vintage-shirt concept website with cursor-following

**#831 by popularity** · ♥ 87 · 5,714 views · by [@exploraX_](https://x.com/exploraX_) · [Original post](https://x.com/exploraX_/status/2116160132262318269) · [Watch the video](https://video.twimg.com/amplify_video/2116159997738467328/vid/avc1/1816x1080/bvm-wmyiXUVe6TSV.mp4)

[![Interactive vintage-shirt concept website with cursor-following](https://pbs.twimg.com/amplify_video_thumb/2116159997738467328/img/dTwys5sCiDG7KtMl.jpg)](https://x.com/exploraX_/status/2116160132262318269)

## Prompt

```text
Build "Coconut Button Club", a concept shop for vintage aloha shirts, as a static website (plain HTML, CSS and JavaScript, no build step), using the attached painted character illustration as the hero and brand mascot. The character is "Big Lou, head of shirts".

THE HERO: LOU FOLLOWS YOUR CURSOR
Lou turns his head to look at the visitor's cursor. Do not use a 3D model or face tracking. Build a 2D pose grid instead:
1. Upscale the illustration and outpaint it wide enough for a desktop hero, keeping the original figure untouched.
2. With an image-editing model (Nano Banana Pro), make 8 head-pose keyframes from the original: turned left and right, tilted up and down, and the four diagonal corners. Hair, face, shirt and art style must stay identical.
3. With an image-to-video model (MiniMax H3 at 2K), make 5-second start-frame/end-frame clips that sweep the head between poses while the body stays perfectly still. Add extra tilt clips if the level-to-down step is too big.
4. Assemble a grid of 152 poses (8 heights x 19 angles). Pick frames by measured eye position, not by time, so every step is the same size. Cut each head out with a feathered mask and composite it onto one fixed body so the shirt never jitters. Fill the in-between rows with optical-flow morphs. Export as 8 WebP pose strips plus a rig.json holding per-pose eye positions and skin tones.
5. At runtime the cursor sets a target yaw and pitch, a soft spring chases it, and the nearest pose is painted on a canvas placed exactly over his head. Paint blinks and the occasional wink live, using the eye positions and skin tones from rig.json.

PAGE SECTIONS
- Header and nav, with a bag.
- Hero: "Loud shirts for quiet afternoons." with Lou in the cursor-following rig.
- The Rack: generated shirt illustrations (Big Lou, Koi Pond, Lava Flow, Night Orchid, Pineapple, Surf Club) hung on a rail you can drag. They swing like shirts on hangers, with physics.
- "How to spot a real one": a field guide to a vintage aloha shirt, with hotspots on an annotated illustration.
- The shore: "Every shirt on the rack has been to the beach at least once." over a looping painted beach (an image-to-video loop whose first and last frames match the still, so it loops seamlessly).
- "Join the club." footer: a newsletter form, with a second Lou peeking up from the bottom of the page.

LOOK AND FEEL
A warm, painterly vintage-resort feel: cream paper, red, palm green, film grain. Fonts: Fraunces for display, DM Sans for text, DM Mono for labels. Add scroll reveals and gentle motion, and respect prefers-reduced-motion. The bag and the form are for show and send nothing. State that it's a concept.

Before building, propose the concept and list the assets you'll generate with their prompts, then generate the assets, then build the site. Check the head rig in a browser: it must look like one continuous painting turning its head.
```

The prompt and video belong to @exploraX_; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

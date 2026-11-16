# Flat cartoon calisthenics explainer short with cut-out character

**#825 by popularity** · ♥ 97 · 4,893 views · by [@treyscalez](https://x.com/treyscalez) · [Original post](https://x.com/treyscalez/status/2120617070119236035) · [Watch the video](https://video.twimg.com/amplify_video/2120616304059056128/vid/avc1/1080x1920/r2gCccbWEfyzvo9I.mp4)

[![Flat cartoon calisthenics explainer short with cut-out character](https://pbs.twimg.com/amplify_video_thumb/2120616304059056128/img/Go3MTxQO1TbbMnpM.jpg)](https://x.com/treyscalez/status/2120617070119236035)

## Prompt

```text
<inputs>
Ask me for: the topic (default: how peptides work), the length (default 60 seconds), whether I want captions on screen (default yes), and whether I have my own sound effects (if not, synthesize them in numpy). I attach the red character sheet on a black background. After I answer, write a voiceover script of about 2.4 words per second, give it to me in a code block, then stop and wait for my voiceover audio before you render anything.
</inputs>

<direction>
A flat cartoon explainer short at 1080x1920, 30fps, drawn entirely in code with Python and skia-python, piped to ffmpeg, one encoded file per scene joined with the concat demuxer. Every shape anti-aliased.
Character: cut each pose out of the attached sheet into its own transparent sprite. The background is black and so are the outlines, so flood-fill the background from the image edges only at low tolerance and keep all black inside the figure (outlines, sleeves, waistband). Keep the white eyes. Add a 3px navy #24364F stroke around each silhouette to replace the lost edge. Upscale 3x with Lanczos. Show me a contact sheet of the cut-outs on #D3DFEC before going further.
Posing: the character is a presenter anchored to the bottom edge, 800-1050px wide, never floating. Pick the pose from the line being spoken: pointing at the viewer for the hook and the final line, finger up when explaining, shrug on a question, arms crossed while watching, open palm when presenting an object, pointing at a zoom bubble. 1 to 3 pose changes per scene. Each change lands with a squash and stretch over 9 frames (8% wider, 10% shorter, then back). Idle: 0.5 degree sway and a 0.6% breathing scale.
Script: a hook question in the first 4 seconds, a title line, 4 to 5 beats that each carry one visual idea, a one-line payoff. Short sentences, plain words, every claim accurate, no medical advice.
Timing: run silencedetect on my voiceover at -35dB, 0.22s. Cut scenes in the middle of the long pauses and fire every pop, label and pose change on the word it belongs to.
Palette: backgrounds pale blue #D3DFEC, mid blue #B4C7E6, strong blue #6790CB. Outlines and text navy #24364F. Accents amber #F4B740, coral #EE7B5B, teal #58B7A8, lilac #9A86D6. Flat fills only, 5-9px navy outlines on every drawn object.
Scenes: the title card is solid #37557F with two lines of white text sliding in from opposite sides and an amber underline. At least two close-up scenes with no character. One circular zoom bubble, 320px radius, white ring with navy edges, that the character points at. The final scene is #6790CB with 14 lighter rotating rays.
Diagrams: every explainer visual is drawn in code from circles, rounded rectangles and lines: chains of beads joined by a thick navy link, cells with a dotted membrane, arrows as moving dashed lines, labels in white rounded pills with a 6px navy outline.
Captions: Inter ExtraBold Italic, all capitals, 66px, navy, centred at the top between y=200 and y=340, two lines maximum, each line rising 24px and fading in over 9 frames on its word. White with a navy stroke on the strong blue scene.
Movement: a slow push-in from 100% to 104% across every scene, 14 soft white particles drifting upward at 35% opacity, every new element popping in with an 18% overshoot, beads rippling in a wave, a 7% zoom punch on the final line.
Draw order: background, particles, floor line, diagrams, character, captions on top.
Sound: my voiceover at full level. Effects at half the voice level: a swoosh 0.12s before each cut, a whip on each pose change, a pop on each element, a click or chime on key moments, a low hit on the title card and the final line.
Before the full render: render 14 still frames at the busiest moments, look at them, fix overlaps and text leaving the frame.
Banned: gradients, drop shadows, glow, 3D, AI images or AI video, stock footage, music, emojis, watermarks, any character other than the attached one, any other channel's characters, logo or name, text smaller than 30px, a character that floats above the bottom edge, more than two caption lines.
```

The prompt and video belong to @treyscalez; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

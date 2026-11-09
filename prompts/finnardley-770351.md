# Stickman survival thriller

**#139 by likes** · ♥ 629 · by [@finnardley](https://x.com/finnardley) · [Original post](https://x.com/finnardley/status/2115786060231770351) · [Watch the video](https://video.twimg.com/amplify_video/2115784242701500416/vid/avc1/720x1280/yPMX34ABAcld_GHW.mp4)

[![Stickman survival thriller](https://pbs.twimg.com/amplify_video_thumb/2115784242701500416/img/a_e-E2kTPxvwNIU5.jpg)](https://x.com/finnardley/status/2115786060231770351)

## Prompt

```text
i just made this stickman animation in full code with claude opus 5.5

took me 20 mins and spent $0 on videos or images

promised you guys id give a free claude skill to re create any code format so here it is

hand this prompt to your claude code and thank me later ↓

<inputs>
Ask me for: my video idea (one line is fine), the setting, the length (60-90 s) and the narrator (an ElevenLabs voice, or "free" for a local text-to-speech). Everything is built in code: no AI images, no AI video. Make it MY story, not a copy of an example.
</inputs>

<format>
The style is a second-person survival thriller with stickmen, built as a series:
- "Imagine you…" hook with a time stamp in the first 3 s
- a HUD with the DAY number and a clock that moves forward through the episode
- 3-4 RULES, each one paid off on screen
- a threat that escalates and is mostly shown, not told
- a twist that makes one rule impossible
- a two-choice ending ("DO YOU OPEN IT?" style, a green and a red option, "COMMENT BELOW") and "FOLLOW FOR DAY 2"
Around 20-30 voice lines, 60-90 s, a new shot every 1.5-3 s.
</format>

<story>
Write a beat sheet and the script first and show me both before building anything.
- One line = one visual. Rules are short commands.
- Open a new question every ~10 s and only answer it with a bigger one.
- Put the viewer in POV for the scary parts: what you see through a door, a window, a phone, a peephole.
- The ending is a choice where both options look bad.
- Write numbers twice: the caption form ("11:58 PM") and the spoken form ("eleven fifty-eight P M") for the text-to-speech.
- Rotate settings between episodes (apartment, subway, school at night, hospital, cabin, plane, office, motel) and fit the threat to the setting.
</story>

<look>
Pick a palette per story, but keep the language:
- real 3D low-poly sets with real lights and shadows; the mood comes from light (one warm practical, one cold fill, one strong accent such as a door gap, a screen or a siren)
- the stickman is flat and 2D-looking: a light body with a thick dark outline, round strokes, dot eyes, no mouth; give the main character one mark (a scar, a cap, a colour) so doubles and callbacks read
- the overlay: a monospace HUD top-left, chunky captions (1-3 words, key words in an accent colour), a tilted rule sticker with a big condensed title, phone screens drawn in 2D
- banned: AI frames, glossy 3D characters, emojis, music with vocals, long captions
</look>

<shots>
A library to adapt to the story (never use all of them):
- the opener: a camera move that starts tight on you and pulls out to show where you are
- POV phone in your hands (2D phone UI, two stick thumbs)
- a macro on the one detail that matters
- outside chaos from above (balcony, bridge, window): physics vehicles, a running crowd, something collapsing or burning
- third-person action in the room: walking with planted feet, reaching, hesitating, barricading
- POV interaction: throwing, holding a torch, opening something
- a close-up of your face for the reaction
- a low angle on a door or vent: light leaking in, shadows moving
- knocks, shakes, things falling
- a fisheye peephole, camera or window view of the threat stepping closer
- the choice screen and the end card
</shots>

<tools>
What each tool is for. Install whatever is missing, and ask me before anything paid:
- three . js: the 3D engine; it runs inside a web page. Download its module file locally so renders don't depend on the internet. Use its post-processing passes for bloom, plus one custom lens shader for vignette, grain, fisheye and colour fringing.
- cannon-es: a JavaScript physics engine for vehicles, falling debris and collapses.
- Playwright (Python): opens the page in a real browser (Edge or Chrome with the GPU on) and captures every frame as an image.
- ffmpeg: the command-line video and audio tool. It joins the frames into an MP4, cuts and filters the audio (highpass, lowpass and echo for voices behind doors), mixes, normalises loudness and…
```

The prompt and video belong to @finnardley; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

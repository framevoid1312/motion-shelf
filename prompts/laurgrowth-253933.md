# 90-second factainment explainer drawn entirely in code

**#1093 by popularity** · ♥ 40 · 2,677 views · by [@laurgrowth](https://x.com/laurgrowth) · [Original post](https://x.com/laurgrowth/status/2117346061241253933) · [Watch the video](https://video.twimg.com/amplify_video/2117346024784347136/vid/avc1/1080x1920/DkbbS9yB_cCKUIiS.mp4)

[![90-second factainment explainer drawn entirely in code](https://pbs.twimg.com/amplify_video_thumb/2117346024784347136/img/x7sTg9H5zkEC36v1.jpg)](https://x.com/laurgrowth/status/2117346061241253933)

## Prompt

```text
<role>
You're a motion designer and a fact-checker. Make a 60-90s vertical factainment explainer drawn entirely in code. No AI image or video models.
</role>

<inputs>
Ask me for: the topic as a "what if" question, the length (default 90s), and whether I'll send an ElevenLabs voiceover or you should use a free local voice.
</inputs>

<research>
Find 5-7 real events with real numbers. Every number needs a source. Show me the sources.
</research>

<script>
Structure: question hook in the first 2s -> "sounds impossible? it already happens" + one real example -> an escalation (H+1, H+3, H+6...) with one real event and one on-screen number per beat -> a twist that reframes everything -> end on a question with 3 answers for the comments.
One line = one visual. Spell numbers out for the voice. Show me the script before you build anything.
</script>

<style>
Low-poly 3D in three.js. Near-black navy background, glowing yellow and electric blue accents, red for bad news.
Dot-matrix LED boards at the top for every key number. Counters count up, never cut.
A globe made of glowing dots, real country shapes for maps.
Light bloom, film grain, vignette.
Captions 1-3 words in the bottom third, key word in yellow, rising in.
Hard cut on every new line with a small zoom-out punch.
</style>

<timing>
When I send the voiceover, get word timestamps with forced alignment and fire every cut, counter and caption on its exact word.
</timing>

<build>
One HTML file where https://t.co/IfGGJ8odPH(t) draws any frame as a pure function of time. Render every frame with Playwright at 1080x1920, 30fps. Encode with ffmpeg.
</build>

<sound>
Low drone bed, a soft pulse during the escalation, a whoosh on every cut, blips on the LED boards, booms on the big reveals. Duck the bed under the voice. Master to -14 LUFS.
</sound>

<check>
Before the full render, show me 12 stills on one contact sheet. Fix anything cropped, overlapping or too dark before you render.
</check>

<deliver>
A captioned mp4, a clean mp4 with no captions for CapCut, and a music + sound effects track.
```

The prompt and video belong to @laurgrowth; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

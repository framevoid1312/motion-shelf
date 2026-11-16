# Automated faceless short-form video factory rendered as a 3D system

**#484 by popularity** · ♥ 202 · 20,223 views · by [@Y0urDumble](https://x.com/Y0urDumble) · [Original post](https://x.com/Y0urDumble/status/2118038616257515823) · [Watch the video](https://video.twimg.com/amplify_video/2118033914249805825/vid/avc1/1920x1080/3dDn2Ehjx2rJUYOY.mp4)

[![Automated faceless short-form video factory rendered as a 3D system](https://pbs.twimg.com/amplify_video_thumb/2118033914249805825/img/TYui5MVgNFdiDgXk.jpg)](https://x.com/Y0urDumble/status/2118038616257515823)

## Prompt

```text
Build me a faceless channel factory on this machine. One topic in, one finished long-form video and 6 vertical shorts out, scheduled to YouTube, TikTok and Reels. Use only free open-source repos. Write every step as a script I can rerun with one command.

NICHE: [your niche, e.g. 1930s noir cartoon animals explaining money]
STYLE: one locked visual style for the channel (pixel, paper, clay, toon, voxel, neon or noir). Same character every video.

THE FACTORY (9 rooms, one conveyor, each room is one folder + one script)

01 SCOUT · yt-dlp: pull the 10 top videos in the niche from the last 30 days
02 TRANSCRIBE · whisperX: word-timed transcripts, then write an original script with a hook in the first 2 seconds
03 VOICE · chatterbox: narrator voice with emotion tags, one wav per scene
04 ART · ComfyUI: character sheet first, then every scene in the locked style, same character on-model
05 MOTION · Wan2.2: each still becomes a 3-5 s moving shot
06 LIP-SYNC · LivePortrait: the character's mouth follows the voice
07 EDIT · remotion: the long-form cut in code, captions from step 02, music under the voice
08 CLIPS · AI-Youtube-Shorts-Generator: 6 vertical 9:16 shorts from the long cut
09 POST · postiz: schedule all 7 videos with titles, descriptions and tags

QUALITY BAR
- Every shot on-model: same face, colours and proportions as the character sheet
- Captions word-synced, big, readable on a phone
- Audio: voice clear, music ducked under it, no clipping
- Shorts start on motion, never on a black frame or a logo

MUST NOT
- No stock footage, no slideshow of still images, no robotic TTS voice
- No step that needs me to click in a GUI. Everything runs from the terminal
- No paid APIs

Before you finish: render one full run, pull 10 random frames from every video and look at them. Fix any off-model, blurry or caption-broken frame and rerun that room only. Do not stop until all 7 videos would pass as an upload from a real channel.
```

The prompt and video belong to @Y0urDumble; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

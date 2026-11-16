# 30-second vertical stick figure survival short in full code

**#1151 by popularity** · ♥ 40 · 1,647 views · by [@leonclipping](https://x.com/leonclipping) · [Original post](https://x.com/leonclipping/status/2116211217958084736) · [Watch the video](https://video.twimg.com/amplify_video/2116211125578506241/vid/avc1/1080x1920/FJAEP4tGNIDIFjCd.mp4)

[![30-second vertical stick figure survival short in full code](https://pbs.twimg.com/amplify_video_thumb/2116211125578506241/img/prLZA-P71AXq1TXJ.jpg)](https://x.com/leonclipping/status/2116211217958084736)

## Prompt

```text
build me a 30 second vertical stick figure survival short, 100% in code, without ai images or video tools.

<inputs>
ask me for: where he's stranded, how many days until rescue, 4 story beats (each with a day number and one caption line) and the cliffhanger for the last beat
</inputs>

<build>
1) one html file with a 1080x1920 canvas. draw everything with canvas 2d: sky, ground, props, the stick figure, weather, text
2) expose window.setT(t) that draws the exact frame for time t in seconds, plus https://t.co/VHtsNK8BEs. nothing animates on its own, so every render is identical
3) the stick figure: round helmet with a visor, torso, two part arms and legs, one accent colour backpack. poses as parameters: walk cycle, carry, crouch, sit, look up
4) every beat gets a big "DAY N" badge at the top, one caption at the bottom that types in word by word and one action that moves
5) a small hud in the corner (oxygen, power, food) that drops from beat to beat
6) weather from a seeded random so the snow is identical on every render
7) end on the cliffhanger, a white flash, the final DAY badge and "follow for part 2"
</build>

<render>
1) a python script with playwright: open the html, call setT(i/30) for every frame, screenshot each one
2) a numpy script for the sound: wind that follows the weather, a low drone, a hit on every DAY badge and on the cliffhanger
3) ffmpeg to join frames and audio into an h264 mp4 at 30fps
</render>

render one test frame per beat and show me before you render the whole video
```

The prompt and video belong to @leonclipping; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

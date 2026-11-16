# Interactive pixel-art cyberpunk window wallpaper you can smash

**#876 by popularity** · ♥ 91 · 2,889 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2121203658931204320) · [Watch the video](https://video.twimg.com/amplify_video/2121203552701837312/vid/avc1/2560x1616/tI15SifXToALKqLx.mp4)

[![Interactive pixel-art cyberpunk window wallpaper you can smash](https://pbs.twimg.com/amplify_video_thumb/2121203552701837312/img/K-F0Y-wGOn9LJh5O.jpg)](https://x.com/vib3coded/status/2121203658931204320)

## Prompt

```text
Build a single self-contained HTML file (no libraries, no external assets, works offline) called "Neon Window": an interactive pixel-art live wallpaper where the viewer can smash a window.

TECH
- Plain JavaScript. Canvas 2D for all pixel art, raw WebGL (one custom GLSL fragment shader) for the glass, Web Audio API for all sound (fully synthesized, no audio files).
- Draw the world at a low resolution of 480×270 and scale it up to cover the viewport, keeping crisp square pixels. On narrow or portrait screens, keep the window in view. Cap devicePixelRatio at 2. Target 60 fps.

SCENE — OUTSIDE (rainy cyberpunk Tokyo at night, seen through the window)
- Smoggy purple-magenta sky with a hazy pink moon; distant skyscraper silhouettes with tiny lit windows and blinking red beacons.
- A large holographic koi swimming slowly across the sky, projected by a beam from a tower (cyan/pink, scanlines, occasional glitch).
- An animated billboard on a tower cycling through three screens with glitch transitions; a monorail train passing every ~20 s; a small flying car with a light trail now and then.
- A street of five buildings: a ramen shop (indigo noren curtains, red paper lanterns, diners in silhouette), a convenience store (bright interior), an izakaya (lattice doors, a big red lantern with 酒, string lights on the roof), a karaoke bar (pink and purple windows), and a bar (vending machines, a graffiti-covered shutter, a fire escape). Add AC units, cables and rooftop water tanks.
- Neon signs drawn with a hand-made bitmap pixel font: vertical katakana ラーメン, ホテル, カラオケ and horizontal BAR, OPEN, 24H, all with glow. Signs flicker occasionally; one is "broken" and flickers often.
- A wet road with mirrored, rippling reflections; pedestrians with colorful umbrellas walking both ways; cars with headlight beams and light streaks on the asphalt; steam from a manhole and roof vents; slanted rain streaks with small splashes.

SCENE — ROOM (cozy, warm, Japanese)
- A dark wooden window frame and a plank wall, warmly lit by a hanging red paper lantern (chochin) that flickers softly.
- A hanging scroll with an ink-wash mountain painting, a small framed Mt. Fuji print, and a shelf with a daruma, a succulent and books.
- A desk with: a bonsai whose foliage overlaps the bottom of the window, an open book, a digital clock showing the real local time, a steaming cup of instant noodles, and a sleeping black cat. Clicking the cat makes it open its eyes and play a synthesized "meow".
- Pink, violet and cyan neon light spilling onto the desk from outside.

GLASS (WebGL shader)
- Seen through the glass, the street is slightly hazy and soft, with condensation fog near the bottom and a blurred warm reflection of the lantern.
- Raindrops on the glass: many small drops plus larger ones that grow, slide down in jerky bursts, leave trails and absorb small drops. Render them as a normal map that refracts the scene (an inverted lens image) with a darker rim and a specular highlight.
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

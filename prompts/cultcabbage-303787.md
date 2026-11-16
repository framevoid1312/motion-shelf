# Low-poly crab rides a bike through desert and crashes

**#1073 by popularity** · ♥ 36 · 3,394 views · by [@CultCabbage](https://x.com/CultCabbage) · [Original post](https://x.com/CultCabbage/status/2118728012166303787) · [Watch the video](https://video.twimg.com/amplify_video/2118726258745839616/vid/avc1/1080x1350/fPsVbqSnfvEi3_il.mp4)

[![Low-poly crab rides a bike through desert and crashes](https://pbs.twimg.com/amplify_video_thumb/2118726258745839616/img/UFswnWURCnrYTv7N.jpg)](https://x.com/CultCabbage/status/2118728012166303787)

## Prompt

```text
Build "Crab Ride" — a single self-contained HTML file (inline JS/CSS, English UI): a 13-second real-time 3D animation of a low-poly crab riding a long bicycle sideways through a desert, weaving between scattered obstacles; at the end, distracted by a fly, it crashes into a wooden lifeguard tower standing in the middle of the desert and flies off in an epic crash. No titles, captions or text overlays on the page: only the full-screen 3D scene and one menu card.

TECH
three.js r160 as an ES module from https://t.co/jyIKTZ7Lsd (no addons, no models, no textures except one canvas texture if you need it). WebGL 2; if unavailable, show a fallback card.
The file must parse and run with no syntax errors (never put a unary minus directly before **). Wrap each frame's update in try/catch, show any error in a small on-screen box and keep the loop running.
The whole animation is a pure function of time t in [0, 13] s, so the timeline can be scrubbed both ways and every frame is repeatable.

STYLE
Clean stylized low-poly 3D: flat-shaded matte faceted surfaces, sRGB output, no tone mapping, soft PCF shadows from a warm sun that follows the action, hemisphere sky/sand fill.
The crab: a big faceted low-poly crab with a wide shell (bright red-orange #e0502f with a lighter underside), two big claws, eight jointed walking legs, and two eyes on stalks with dark pupils and a white glint that look around. Design and build it however you like, as long as it reads clearly as a crab. Every part is a closed solid (no holes, no negative-scale mirroring).
It rides SIDEWAYS, like a real crab walks: its body sits across the bike, facing sideways to the direction of travel, with the claws gripping the handlebars and some of its legs working the pedals while the others dangle and wiggle. How exactly it sits and pedals is up to you.
The bike: a stretched city bike with a 2.25 m wheelbase: double top tube with cross braces, long down tube, long swept-back handlebars, black tyres, cream spokes, brown saddle. Frame colour is switchable.

DESERT
Low-poly sand ground with per-face colour variation, flat along the ride and rising into dunes further away; sky dome gradient from blue to warm haze, matching fog; distant mesas; a faint tyre track along the path. Palette: sky #8cc8ef / #cfe6f2 / horizon #f4dcb2; HemisphereLight #dff0ff / #e2b277 at 1.25; sun #fff0d4 at 2.1; sand #efd3a2, #e3bd86, #f5e0b8; mesas #d99a68; rocks #b48a66 / #9c765a; cacti #5c9a4b / #4b8640; wood #9a7a5c; dust #f2dfba; stars #ffd23d.
Obstacles near the ride, not in a row: one on the inside of every swerve, so the bike visibly rides around it — beach junk lost in the desert: a bucket with a spade, a rusty anchor, a lobster trap, a piece of driftwood, a deflated beach ball, a message bottle stuck in the sand — plus a few further out on alternating sides. Only low objects on the camera side, so nothing blocks the view. Lots of scattered cacti, rocks and bushes in the distance.
Around t = 5.5 s a tumbleweed
```

The prompt and video belong to @CultCabbage; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

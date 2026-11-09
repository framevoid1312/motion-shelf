# Pixel-art 3D football yard simulation with kids and dog

**#212 by likes** · ♥ 370 · by [@N1njaCodex](https://x.com/N1njaCodex) · [Original post](https://x.com/N1njaCodex/status/2113037013326627200) · [Watch the video](https://video.twimg.com/amplify_video/2113036952471498752/vid/avc1/1152x720/TbhqfwSZdoXx7scg.mp4?tag=29)

[![Pixel-art 3D football yard simulation with kids and dog](https://pbs.twimg.com/amplify_video_thumb/2113036952471498752/img/4qXKW1bgvbN37-Zj.jpg)](https://x.com/N1njaCodex/status/2113037013326627200)

## Prompt

```text
Build a single-page web toy called "Yard Box": a real-time 3D scene rendered as pixel art, showing a courtyard football box behind a four-storey panel apartment block on a floating island. Use three.js r160 (ES module via import map from jsDelivr, plus BufferGeometryUtils). English UI. Original design only — no real brands, places or logos.

RENDERING PIPELINE (the core look)
- Orthographic camera at an isometric angle (elevation ≈31°, azimuth π/4, rotatable in 90° steps with smooth easing; drag sideways or buttons to turn; wheel/pinch zoom 0.7–2.6).
- Render into a small WebGLRenderTarget (half-float, nearest filtering, depth texture) — about 480×300 art pixels at pixel size 3 — no anti-aliasing. Fit the island + the top of the block into the screen area left free by the UI, and snap the camera so the world origin lands on a whole art pixel (static things never shimmer).
- Post-pass ShaderMaterial: texelFetch whole-pixel upscale; depth-based outlines (a pixel > ~0.5 m in front of a neighbour darkens ×0.5); quantize every pixel to the nearest of a fixed ~60-colour palette in OKLab (lightness weighted ×1.35); optional 4×4 Bayer dither (off by default); empty depth = page background colour.
- "Raw 3D" toggle shows the full-resolution MSAA render without steps above. Controls: pixel size slider 2–6, palette / dither / outlines checkboxes.
- Palette: warm concrete greys, cool greys for snow in shade/moonlight, snow and sky blues, turf greens, autumn olives, yellows/oranges/rusts, team reds and blues, skin and wood tones, lamp/window yellows, dusk violets, mint for the boards.

LIGHT AND TIME
- Directional sun/moon with hard BasicShadowMap (2048), hemisphere fill, point lights for two streetlamps (decay 2) and weak doorway lamps. Presets Day / Dusk / Night blended over 1.6 s. Glow materials lerp between on/off colours.
- The block's facade uses an emissive map drawn on a canvas; at night windows glow warm or cool, and random flats switch lights on and off.

WORLD (all boxes, cylinders, extrusions; textures drawn texel by texel on canvases)
- Rounded floating slab: grass top over soil over rock.
- Football box: rounded-rectangle boards (22×12 m, mint green, plank lines, a gate with an open door), netting on posts above the boards at both ends, mini goals (3 m × 2 m) with alpha-tested nets, turf texture with mowing stripes, worn goalmouths/centre and white markings.
- Panel block along one long side: 4 floors, facade drawn panel by panel with windows and curtains, two entrances with canopies, random balconies, roof details; an asphalt strip with two benches and hedges.
- Dollhouse cut: when the camera looks from the block's side, hide the floors, roof, balconies and canopies and show a section of the ground floor instead — low cut walls with a dark cap, rooms with coloured floors, rugs, sofas, tables, wardrobes, TVs (glowing at night), pot plants, stairwells with steps and post boxes; room floors glow warm at night.
- Playground (swing that actually swings, slide, sandbox), birches with white trunks and dark marks, painted-tyre flower beds, a parked car, a washing line with swaying sheets, two lamp posts.

PEOPLE AND DOG
- Kids as rigs of ~17 boxes (bigger heads), posed every frame with two-bone IK: running stride, kicks keyed as back-swing → strike → follow-through, keeper stance, sideways dives, catch/hold/throw, goal celebrations (airplane arms).
- Three grandmothers sitting on the benches (cheer on goals), a small kid on the swing.
- A box-built dog that lives by the benches.

GAME LOGIC
- 3v3: two field players + one keeper per team (RED attacks +x, BLUE −x), first to 5, then a new game; scoreboard with score, game number, status line and games won.
- Kick-off from the centre; open play with dribbling by small touches, passes leading the receiver, shots aimed inside a post at random height with angular error growing with distance and pressure, tackles; players get behind the ball before kicking (feed-forward on a rolling ball), squeeze in at an angle when the ball is against the boards, avoid goal frames; a scramble poke if nobody can reach a still ball for 3.5 s.
- Keepers hold position, come out for slow loose balls, read shots after a 0.1–0.3 s reaction delay with some error, dive, catch or parry.
- Ball physics in 4 substeps: gravity, ground bounce (lower in winter), boards (lively below rail height, dead in the netting above), posts and crossbar, the goal net, legs in the way. Status flashes: GOAL!, SAVED!, WHAT A SAVE!, OFF THE POST!, OFF THE BOARDS, TACKLE.
- Every 100–170 s (or on a button) the dog runs in through the gate, grabs the ball, runs loops away from the kids for ~5 s, drops it and trots home; it gives up if the game resets.

SEASONS (Summer / Autumn / Winter)
- Summer: poplar fluff drifting. Autumn: yellow/orange canopies, leaves falling from the birches, leaf litter on the ground, olive grass. Winter: snow on the ground, roofs, benches, car and boards; bare trees; falling snow and kicked-up snow spray; kids wear hats; the ball turns orange.

INPUT AND UI
- Click the player on the ball to shoot, his teammate to pass, the pitch to make him dribble there; keys S, P, D, Space, Q/E or arrows.
- Layout: title and caption top-left, lit pixel-font scoreboard top-centre, a narrow control rail on the right (Time, Season, Game, View), a hint bottom-left, a fold-out "How it's drawn" panel bottom-right. Fonts: Silkscreen, Rubik, JetBrains Mono. Light and dark themes via CSS tokens; on phones everything stacks under the scene. WebGL2 fallback card.
```

The prompt and video belong to @N1njaCodex; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

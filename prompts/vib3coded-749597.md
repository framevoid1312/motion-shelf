# Jelly brain Halloween demo with soft-body physics and UI

**#714 by popularity** · ♥ 132 · 7,203 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2116632234916749597) · [Watch the video](https://video.twimg.com/amplify_video/2116631945266237441/vid/avc1/1280x1620/6CoMR-pHiEMvYQ20.mp4)

[![Jelly brain Halloween demo with soft-body physics and UI](https://pbs.twimg.com/amplify_video_thumb/2116631945266237441/img/8L8xv8XxQ1wFTtiu.jpg)](https://x.com/vib3coded/status/2116632234916749597)

## Prompt

```text
Build "Brain Jelly" (Material Studies No. 014), a three.js WebGL2 soft-body study in the same quality as the gelatin watermelon slice: an original, cartoon gelatin brain with a face, sitting on a dark night-studio table.
Shape: a smooth hull of ellipsoids in a smooth union (two hemispheres, two temporal lobes, a two-lobed cerebellum, flattened base). The rendered skin is the hull carved by sulci — zero-sets of a domain-warped 3D gradient noise with rounded gyri crowns — plus a deep narrow longitudinal fissure, Sylvian and transverse fissures along the seams where the ellipsoids meet, and fine parallel folia on the cerebellum; polygonised once with surface nets (~1.7 mm grid), each vertex embedded in a tetrahedron by barycentric weights, normals carried by the cofactor of each tet's deformation gradient averaged onto particles.
Physics: XPBD co-rotational tetrahedral shape matching + volume constraints on a BCC lattice stuffed into the hull and snapped to it; 60 Hz, 8 substeps, edge damping, table friction with slide and rolling damping, soft arena edge; grab with a soft patch attachment, twist with a second finger or wheel, flick-to-throw on release; the rest shape breathes (slower and deeper asleep).
Face: two rigid candy eyes riding the best-fit rotation of the jelly around them; lids are two planes through each eye's centre (upper/lower edge angles and a brow-like tilt toward the nose) that make every expression; irises follow the cursor (cross-eyed up close), blinks and saccades. Moods: calm, curious, held, annoyed/furious after pokes, eye-poke wince, terrified in the air, stretched, squeezed shut when squashed, dizzy spiral irises with orbiting stars after a hard landing, giggling crescents when stroked fast (tickle), thinking (looks up, sparks surge), drowsy → asleep with rising Z's after ~30 s, upside-down panic that hops itself upright, zapped (electric storm, twitching, crackles) then dizzy.
Sparks: ~30 nerve threads wander inside; pulses race along them, a few per second calm, a storm when excited; drawn as soft points behind the gelatin so they are refracted and absorbed, their glow lights the body from within and spills on the table.
Rendering: six THREE.Scene passes — key-light shadow map (PCSS-lite, tinted), top-down contact AO, scene (table, eyes, lids, bubbles, sparks; MSAA half-float), back-face depth for view-ray thickness, gelatin pass with refraction, Beer–Lambert absorption (denser in the folds), cloudy wisps, rim glow, studio softbox reflections dulled in sulci, a flickering candle off to the right; Khronos PBR Neutral tone mapping.
UI: editorial dark page, masthead "Brain Jelly.", status pill, panel with four flavours (Raspberry, Zombie lime, Grape, Ghost clear), firmness and damping sliders, Poke / Toss / Zap / Reset, Sound (procedural squelch, boop, ouch, giggle, whee, zap, snore), ¼ speed, Show mesh, Pause; readouts Mass, Volume, Firing /s, Mood; notes "Inside the experiment"; stacked phone layout. Original charac
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

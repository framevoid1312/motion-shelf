# First-Person 3D Procedural Arms and Dynamic Grip Rigging in Three.js

**#357 by likes** · ♥ 74 · by [@maxt3chno](https://x.com/maxt3chno) · [Original post](https://x.com/maxt3chno/status/2108637690698633713) · [Watch the video](https://video.twimg.com/amplify_video/2108637537623306240/vid/avc1/1300x720/FEdLB3rfRzTtkFb6.mp4)

[![First-Person 3D Procedural Arms and Dynamic Grip Rigging in Three.js](https://pbs.twimg.com/amplify_video_thumb/2108637537623306240/img/6gyEvbBEcN9yycsd.jpg)](https://x.com/maxt3chno/status/2108637690698633713)

## Prompt

```text
TASK: Build production-grade first-person arms ("Hands 2.0") for a Three.js browser game, then fix them until every pose actually holds the object it should hold. Do the whole thing yourself with scripts, from generating the model to the in-game checks. I already did this once. Below is what works and the traps I fell into, so you don't repeat them.

━━━ PART 1 — THE MODEL (Blender + MPFB2, fully scripted) ━━━

1. Don't patch AI-generated "statue" arms (Meshy etc.). Chaotic topology with no edge loops at the joints and fingers baked into a pose will crease at every bend. Without clavicle and twist bones the wrist twists like a candy wrapper. Gluing separate generated parts together only adds seams to the same bad mesh. Start over with a real humanoid generator.

2. Use Blender (headless: `blender --background --python tools/hands/*.py`) + MPFB2 (MakeHuman, CC0) and its official asset packs. Put every step in a script so it can be rebuilt:
   - build_body.py: macro params (male, ~30 y/o, wiry and lean: muscle ~0.66, weight ~0.3) plus local arm targets.
   - build_arms.py: game skeleton with clavicle → shoulder → upperarm01/02 → lowerarm01/02 (twist bones!) → wrist → metacarpals → 3 phalanges per finger. Keep skin only from the elbow down and apply subdiv 1. Make the sleeve a separate mesh on the same bones, with real geometry for the rolled cuff. Accessories (watch, bracelet) are parented to forearm/wrist bones; watch hands are bones too.
   - build_tex.py: UVs, then bake veins, tendons and knuckles into geometry and normals. Author every detail in bone-local 3D space so it survives re-UVs, then bake in Cycles.
   - https://t.co/3ocKmFbTLm → pack script → hands_v2.glb. Budget ~25–40k tris for both arms incl. sleeves (they're huge on screen), 1–2 skin materials + sleeve + accessories. Textures 2048² on High, 1024² on Low, plus a tiling micro-normal for pores.
   - Generate a full body with pants, boots and the same shirt, and save it as a .blend for a future "player body" stage. Don't put it in the game yet.

3. Look: tanned back of hand and forearm, paler palm and inner side. Scars, calluses, short nails with natural cuticles. Flannel sleeves rolled just below the elbow, with a visible inside-out lining on the roll. Tactical watch on the left wrist, cord bracelet on the right.

4. Check skin weights on stress poses before you export: fist, pinch, spread fingers, 90° supination. Fix weights in a script, not by hand.

5. HARD STOP #1: render review shots in Blender (neutral light and warm daylight): front, back, palms, fist, pinch, cylinder grip, spread fingers, sleeve close-up, two plaid colour variants. Wait for my verbal OK. Iterate. Don't integrate anything into the game until I say yes.

6. glTF only gives you standard material slots, so use them as carriers. Example: MR = (R AO, G roughness, B subsurface thickness), emissive = masks (R hair, G dirt accumulation order), clearcoatNormal = pore tile. Document the mapping and read it back in the runtime.

━━━ PART 2 — SHADERS (MeshStandard/Physical + onBeforeCompile) ━━━

- Skin: wrap lighting, back-lit translucency in thin areas (fingers, webbing, knuckles go red against the sun), pore detail normal, micro-sheen, tan gradient by mask.
- Hair: 4 fur shells in ONE instanced draw, only on hairy triangles, visible on the silhouette against the sun. Disabled on Low.
- Dynamic state:
  · wet = max(world wetness, rain when not under a roof), with two layers of droplets. The sleeve goes darker when wet.
  · dirt builds up from game events (gather, pickup, log, fish_land, climb_out…), fingers and palms first through the mask, and washes off in water or rain.
- Arm lighting mirrors the world: shade under roofs, lamp light, lightning.
- Precompile every arm shader behind the loading screen. https://t.co/nXMh9v1zBi.programs.length must not grow during gameplay.
- Budget: the arm overlay may cost at most ~0.3 ms more GPU than before on High. Measure with a timer query before and after, not by feel.

━━━ PART 3 — THE ARM SYSTEM (data, not code) ━━━

Goal: a new item or action (axe, bow, paddle, steering wheel) should be a data entry plus a clip, never new logic.

1. Rig wrapper: bone map, wrist twist spread over the twist bones (e.g. 0.3 / 0.8 on lowerarm01/02). No candy-wrapper wrists.
2. Two-bone IK (shoulder–elbow–wrist) with pole vectors (elbows down and out) and joint limits.
3. grips.js: for each item, per hand: `at / axis / back / r / diag / gap / slide / fingers / thumb` in item space. One hand owns the item, the other IKs to its socket.
4. Fingers are always a joint table `[[mcp, pip, dip, spread, twist] × 5]` (absolute bend) and blend between poses. Autogrip closes the fingers until they touch the handle.
5. Animation layers, in this order: base pose → clip keyframes → IK → procedural (breath, bob, mouse-turn inertia, sway, recoil, fatigue tremor) → additive reactions. Smooth transitions between states.
6. Clips: JSON keyframes in code, plus importing .glb animations (with empty hand_R/hand_L) for future Blender-made actions. Clip events (strike frame, bow release) go onto the effects bus.
7. In-game pose editor (Shift+H, game keeps running, cursor free): sliders for item offset and rotation, sockets, every finger joint, elbow pole, shoulders, layer speeds. Show changes live. "Copy" puts JSON on the clipboard to paste into grips.js. I need to be able to tune a grip without Blender.
8. Keep the old public API as a facade (hands.anim, reach, lampInHand…) so fishing, boat, lamp, weapons, sleep and the seaplane don't need deep rewrites.
9. Port EVERY existing action: rifle (stance, ADS, fire, reload with mag, dry fire), knife (2 strikes), stone throw, fishing rod (cast, fight, reel, fish in hand), carried log, lamp, reach and pickup, plant gathering, inspect, crate, swimming (breaststroke and crawl), boat tiller, hands down while sleeping, hidden arms in vehicles. Each one must be at least as good as before. Delete the old arm code only after everything is ported (keep a backup).
10. HARD STOP #2: in-game screenshots for my approval (idle, rifle, rod, log, lamp at night, wet after swimming, dirty after firewood, under a roof and in full sun).

━━━ PART 4 — THE FIX PASS (bake this in from day one) ━━━

The first version shipped with these bugs. Every one of them came from old poses written for "stump" arms with no shoulder.

ROOT CAUSE: a real arm has a fixed length (shoulder→wrist ≈ 0.48 m in view space). Old poses put wrists at targets the arm can't reach. The solver then "cheated": it pushed the clavicle out (up to 0.32 m) and clamped the wrist rotation. The hand ended up somewhere else, while finger curls were cached for the ideal hand position, so the fingers squeezed thin air.
  - Rifle, left hand: handguard 0.516 m away with a 0.479 m arm → shoulder pushed out ~0.3 m and the fist still sat 3.8 cm below the handguard.
  - Rifle, right hand: wrist rotation clamped by ~21°, palm not seated on the grip.

FIXES, as SYSTEM features:
1. Shoulder stance as data: per item/pose, `stance: { L:[x,y,z], R:[x,y,z] }` with smooth blending, and the elbow pole moves with the shoulder. Rifle: left shoulder forward and in, right shoulder slightly back (a real shooter's torso rotation). The left elbow stays slightly bent and the clavicle doesn't stretch.
2. Elbow auto-swivel: give each forearm a pronation range (e.g. R −100°…+95°, 0 = thumb up). If the requested pole would over-twist the forearm or bend the wrist past its limit, rotate the elbow around the shoulder–wrist line to the nearest valid angle. The old poses were silently over-twisted (+101° on the rifle, +80° on the knife).
3. Grip by the REAL handle shape. A cylinder radius is wrong: the knife handle was a 2.6 × 4.2 cm oval, not Ø2.5 cm, so the knuckles sank 2–6 mm into it.
   - Handle = elliptical cylinder with end caps (`sec` [along back, across], `span`, `inset`).
   - measureSection(item, socket): take the cross-section automatically by slicing the item mesh around `at` along `axis`.
   - CPU-skin the hand (SkinnedMesh.getVertexPosition, palm and phalanx vertices with weights) and test real skin vertices, not phalanx tips.
   - gripFit, cached and computed at startup: first push the palm out until it leaves the handle. Then close each finger with all joints together until first contact, and after that only the joints past the touching phalanx. If the start pose already intersects, open it up.
   - Fingertip targets: `fingers: {1: {to:[x,y,z]}}` puts the index pad on the trigger.
4. Validator: hands.check(pose) and hands.checkAll(). Run every scenario × both hands + the live rod pose, print a console table, and show it live in the Shift+H editor with a "Check all poses" button. RED if wrist miss > 0.5 cm, rotation clamp > 3°, shoulder push > 0.5 cm, twist over the limit > 3°, or any skin vertex deeper than 1.5 mm inside the handle. Don't call the work done until it's all green (mine ended at 122/122).

DATA FIXES that came from my screenshots:
- Rifle: left hand on the WOODEN handguard, not the metal in front of it. Handguard runs diagonally across the palm, thumb along the left side, forearm coming in from the lower-left corner. Right hand fully on the pistol grip using the grip's real rake (axis (0, 0.95, −0.32), not a guessed 40°), index on the trigger. On reload the hand leads and the mag rides in the hand, and the shoulder dips to follow it. Check sprint, recoil, dry fire, and steering a boat while holding the rifle.
- Log: nobody carries a 44 × 7 cm log with two arms like a crate. One hand, an ordinary hammer grip like a bottle: knuckles up, thumb on top, held about a third from the back end, log pointing forward and up from the thumb side, riding in the fist. The throw is a one-handed wind-up and lunge. The left hand stays free, so the lamp stays in it.
- Swimming: fingers together and slightly cupped (no fan), hands in the bottom third of the frame. Crawl recovery comes in from the side, palm facing out. The sleeve never covers the middle of the screen and the palm never faces the camera.
- Fix every pose the validator flags: stone wind-up and throw, aim, lamp, lamp lowered, climbing, reach.

━━━ RULES ━━━
- Backup before each stage. Measure, don't guess: write every claim down as a number (cm, °, ms, tris, programs).
- No performance regression: grip fit is cached per socket, and the validator only runs in the editor or dev builds.
- Write down what's still unfinished honestly in the report (e.g. "right hand mostly below the frame on the rifle", "pinky sometimes curls without contact").
- DONE = I approved the renders and the screenshots, bends are clean on every grip, fingers wrap handles with zero penetrations, wet and dirt work, every old action works on the new system, a new item is one grips.js entry + one clip, and FPS is unchanged.
```

The prompt and video belong to @maxt3chno; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

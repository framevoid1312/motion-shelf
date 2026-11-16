# Interactive mangrove island diorama with synced fireflies

**#835 by popularity** · ♥ 97 · 4,554 views · by [@vib3coded](https://x.com/vib3coded) · [Original post](https://x.com/vib3coded/status/2116024691533979940) · [Watch the video](https://video.twimg.com/amplify_video/2116024618062315520/vid/avc1/1280x1620/64sx-NaYRgoaxyEg.mp4)

[![Interactive mangrove island diorama with synced fireflies](https://pbs.twimg.com/amplify_video_thumb/2116024618062315520/img/J3GQpwCOeZXqpJQ-.jpg)](https://x.com/vib3coded/status/2116024691533979940)

## Prompt

```text
Build a single-file interactive WebGL diorama called "Mangrove Lights" (Three.js r160 via import map, OrbitControls, no external models or textures, English UI). A mangrove island sits inside a rounded rectangular block of water, about 10×10 units and 1.7 deep, on a cream plinth, over a transparent canvas with a soft contact shadow.

Island: a procedural heightfield with a dry forest floor at the back, shallow mud flats, creeks, and an open inlet at the front corner. Mangrove fringes stand in about 0.5 of water along both glass walls that face the camera, so the stilt roots show above the water and through the glass. The terrain's side walls are a layered mud cross-section with root fibres. Mud below the high-tide line stays dark, wet and glossy.

Trees (about 140): each has a short trunk; 8–11 arching prop roots built as CatmullRom tube geometry that reach into the mud; hanging aerial roots; and a dense crown of displaced icosphere blobs with per-instance AO and dark glossy greens. Bark is algae- and barnacle-stained below the high-tide line. Add pencil-root pneumatophores on the flats, a fisherman's hut on stilts with a lit window and lamp plus a boardwalk, a canoe that bobs on the waves, wading egrets, an egret flying by day, and schools of silver fish that swim between the roots and flee the cursor.

Water: refraction, Beer–Lambert absorption from real thickness, Fresnel sky, screen-space reflections, sun glints, and almost no shore foam. A 256² GPU wave-equation ripple sim responds to the cursor and clicks. Low mist layers part around the cursor.

Fireflies: about 1600 Kuramoto oscillators around the crowns, coupled to a local spatial-hash mean field plus the global field, with a position-dependent phase offset so the synchronized flash sweeps across the forest as a wave. Use an asymmetric flash curve and additive point sprites drawn after the water, with a manual depth test. Mirrored copies show reflections on the water. Two point lights pulse with the average glow. The cursor randomizes the phase of nearby fireflies and pushes them away; a click scatters a wider area; they drift home and resync.

Lighting: day/night palettes with moonlight, a warm hut lamp, ACES tone mapping and tilt-shift.

UI: brand "bakau°"; headline "A forest that blinks in time."; dock buttons Reset, Night/Day, High/Low tide, Tune and Fullscreen; a settings panel (time, fireflies, pull to sync, mist, water color, tide, waves, ripples, clarity, light azimuth, tilt-shift); a live sync % and clock; a "How it's made" note. The page theme turns dark at night. Include adaptive DPR, a low-detail mode for touch devices, reduced-motion support and a WebGL2 fallback.
```

The prompt and video belong to @vib3coded; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

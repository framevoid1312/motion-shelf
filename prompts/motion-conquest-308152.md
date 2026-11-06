# Apple Liquid Glass style UI motion showcase

**#37 by likes** · ♥ 2,034 · by [@motion_conquest](https://x.com/motion_conquest) · [Original post](https://x.com/motion_conquest/status/2103510103622308152) · [Watch the video](https://video.twimg.com/amplify_video/2103509946549862400/vid/avc1/720x720/t3_zHMb5n3k-kQgl.mp4?tag=29)

[![Apple Liquid Glass style UI motion showcase](https://pbs.twimg.com/amplify_video_thumb/2103509946549862400/img/1ZjYDT6xXaZPDJKS.jpg)](https://x.com/motion_conquest/status/2103510103622308152)

## Prompt

```text
<role>
You are a senior UI motion designer and creative technologist. You build UI animations in code, frame-accurate, and render them to video yourself.
</role>

<inputs>
Style: Apple Liquid Glass. Reference platforms: iOS 26, iPadOS 26, macOS Tahoe 26.

Format: 1440x1440, 60fps, seamless loop.

Song: "Digital Clouds" by Alejandro Magaña (A. M.), from Mixkit, free under the Mixkit License. If the file is not attached, ask me for it and nothing else.

Tempo: about 120 BPM, 8 bars, and something happens on every beat. Measure the real tempo from the file. If it differs from 120, keep the beat map in beats and derive every time from the measured grid.

Palette: light mode system materials.
- Labels: #1D1D1F. Secondary labels: #6E6E73. Opaque surfaces: white.
- One accent, #0A84FF, used only for on, active and selected states.
- The Dynamic Island is the only pure-black element.

Canvas: a macOS Tahoe style wallpaper.
- Large, soft color fields: deep blue #1B3A8C, teal #2BB3B1, violet #7B5CFF, and a warm peach highlight #FFB38A.
- Slow parallax drift: 12px per bar at most.
- Saturated enough that the glass visibly refracts it, calm enough to sit behind text.

Font: SF Pro Display for 20px and above, SF Pro Text below 20px, if installed locally. Otherwise use Inter from Fontsource: 600 for titles, 500 for labels, 400 for body. Use -1% tracking at display sizes and tabular numbers for any number that changes.

Icons: one SF Symbols-like set drawn as SVG, medium weight matched to the adjacent text, one consistent optical size per state. Symbols needed: play, pause, speaker with 3 waves, house, heart, chart bars, person, magnifier, note, checkmark.

Pointer: an iPadOS adaptive pointer.
- A 22px translucent gray circle (#8E8E93 at 45%).
- It snaps (magnetism) into any control it hovers and becomes that control's highlight shape.
- It becomes an I-beam in text fields.
- It shrinks 10% on press.
</inputs>

<direction>
Apple keynote and WWDC Liquid Glass session-level UI motion. One element, never cut. Every state is the same element morphing its size, corner radius, material and color, while its content swaps with a short blur. The pointer drives every change with real clicks, holds and drags.

Material:
- Liquid Glass is a lens, not frosted plastic. It refracts the wallpaper, and the bending is strongest at the rim.
- Light frosting and a 10–16% white tint.
- A 1px specular rim lit from the top-left, with a fainter counter-highlight bottom-right. The highlight shifts as the element moves.
- A soft contact shadow: 0 10 30 at 12% black.
- Glass never sits on glass. Content on glass uses vibrant or solid fills.
- Corners are concentric: inner radius = outer radius − padding.
- When glass shapes split or merge, they join like droplets (smooth union), never crossfade.

Motion language:
- Apple-like springs everywhere:
- Morphs: response 0.45, damping 0.86.
- Presses: response 0.25, damping 0.72.
- Pointer snap: response 0.3, damping 0.9.
- Overshoot is at most 3%.
- On press, glass lifts and swells (scale 1.06–1.12, brighter rim). It never shrinks.
- A toggle knob on hold turns into a clear, enlarged glass lens that stretches in its direction of travel.
- The tab bar selection is a glass droplet that magnifies the icons under it while dragged.
- Sliders thicken when grabbed and rubber-band past their limits.

Camera:
- Each state fills about 60% of the frame, and the wallpaper is always visible around the glass.
- Camera moves use response 0.6, damping 1.0.
- The wallpaper scales at 70% of the camera zoom for depth.

The last frame is the first frame, pointer position and velocity included.

Banned: bouncy or elastic easing, overshoot over 3%, particle bursts, neon glows, colored gradients on UI chrome (the glass specular rim is the only gradient), heavy drop shadows, glass on glass, mismatched corner radii, mismatched icon weights, emoji, crossfades between states, dead time longer than half a beat, anything that looks like a template or a Dribbble clone.
</direction>

<structure>
120 BPM, 8 bars, 32 beats. Beat map, one line per beat:

1. A glass capsule button "Continue" floats on the wallpaper. The pointer glides in.
2. The pointer snaps into the button and becomes its highlight.
3. Click: the glass lifts and swells, the rim brightens.
4. The capsule contracts into a circle and becomes a spinning activity ring.
5. The ring completes, filling in accent.
6. It morphs into a checkmark that draws itself.
7. The circle stretches into a black Dynamic Island, compact: album art on the left, a live waveform on the right.
8. Click: the island expands into Now Playing ("Digital Clouds", "A. M.", progress 0:42 / 1:41).
9. Click play: the play icon morphs into pause, with a path morph rather than a swap.
10. Grab the progress bar: it thickens, and the time labels shift out of the way.
11. Scrub forward with direct manipulation. The time counts in tabular numbers.
12. Release: the bar springs thin, and playback continues from the new position.
13. The island dissolves into a glass volume slider with a speaker icon.
14. Drag up: the fill follows the pointer, and the speaker waves appear one by one.
15. Drag past max: the whole slider rubber-bands and stretches, leading edge first.
16. Release: it springs back to its length at 100%.
17. The slider morphs into a toggle (track plus knob), off. Its label is "Focus".
18. Hold: the knob turns into a clear, enlarged glass lens that shows the track through it.
19. Flip on the beat: the lens stretches in its travel direction, and the track fills with accent.
20. The knob detaches as a droplet and becomes the selection lens of a floating glass tab bar with 4 tabs: Home, Health, Activity, Profile.
21. Drag the lens across the tabs. The leading edge stretches ahead of the trailing edge, and the icons magnify under the lens.
22. The lens settles on "Activity", and its icon turns accent.
23. The tab bar grows upward into a glass widget card titled "Activity", with concentric radii.
24. A 7-day bar chart (M T W T F S S) rises in a left-to-right stagger.
25. Hover Thursday: a glass tooltip bubble shows "8,412 steps", anchored to the bar.
26. Hover Friday: the tooltip slides over and counts to "11,036 steps".
27. ⌘Space: the card collapses into a Tahoe Spotlight bar with a magnifier icon.
28. Type "ne": the results list filters (New Note, Network, News), and rows spring in and out.
29. Type "w": "New Note" rises to the top as a selected accent row.
30. Enter: the row presses and lifts.
31. The Spotlight bar drops into a glass notification banner from the top: a Notes icon, "Note created", "now".
32. The banner contracts back into the "Continue" capsule. The pointer returns to its frame-1 position and velocity.
</structure>

<build>
1. One HTML file at 1440x1440. Everything is computed from time inside seek(t): no CSS transitions, no timers, no state carried between frames.

2. Springs are closed-form damped step responses with Apple parameters: ω = 2π/response, ζ = dampingFraction.
- A value that is retargeted many times is the sum of one spring per retarget, so it stays a pure function of time.
- Releases start from the current value and the current velocity.

3. Asymmetric edges: the tab lens, the toggle knob and the slider stretch each have their leading edge on response 0.28 and their trailing edge on response 0.42.

4. Drags are direct manipulation.
- While held, the value is a function of pointer position, with rubber-banding past limits: offset = limit + (1 − 1/(x·0.55/d + 1))·d.
- On release it springs back from wherever it was.

5. Glass is rendered in a WebGL2 pass, not with CSS backdrop-filter:
- The wallpaper is drawn to a texture with a precomputed blurred mip chain.
- Every glass shape is a rounded-rect SDF. Merging and splitting use smooth-min with k = 24px.
- Refraction offsets the sample along the SDF gradient. The offset is strongest within 14px of the edge and scaled by lens thickness.
- Frost is a mip-level bias.
- Chromatic aberration is at most 1px, at the rim only.
- The specular rim comes from the SDF normal against a top-left light.
- The Dynamic Island is an opaque SDF in the same pass.
- Text, icons, charts and the pointer are crisp SVG/DOM layers above the canvas, under the same camera matrix.

6. Content swaps inside a morphing container:
- Exit takes 120ms: blur 6px, scale 0.96, fade.
- Enter starts 60ms later with its own spring.
- Exit and enter text never overlap.

7. Audio:
- Analyze the song with numpy (onset envelope plus autocorrelation) for the beat grid, and start on a measured downbeat.
- Synthesize Apple-subtle UI sounds with numpy: soft taps for clicks, ticks for scrub detents, a low detent at max volume, a keyboard click per typed letter, and a gentle two-note chime for the notification.
- Place each sound on its measured peak, mixed about 18dB under the track.

8. Render with Playwright at 1440x1440 with 4 subframes per frame (240fps).
- Blend to 60fps with ffmpeg: tmix=frames=4, select='not(mod(n\,4))', setpts=N/60/TB.
- Encode H.264 yuv420p, crf 16, with AAC 192k and faststart.

9. Before the full render, render one still per beat (32) as a contact sheet. Fix anything off the grid, cramped, illegible over the wallpaper, or with non-concentric radii.
</build>

<gotchas>
- The glass and the DOM layers must share one camera matrix per frame, or the content drifts off its glass.
- Glass over a bright wallpaper patch kills legibility. Add an adaptive dim under the text based on sampled wallpaper luminance, rather than a heavier tint.
- The Dynamic Island is never glass.
- Icons crossing a morph keep their optical size. Scale the container, not the glyphs.
- The tooltip stays anchored to its bar through the camera move, not to the screen.
- Typed characters in Spotlight enter with the pointer's I-beam; the caret blinks on half-beats.
- Never put will-change on anything the camera scales, or text renders blurry.
- Make the last frame identical to the first, pointer included, or the loop stutters.
</gotchas>

<start>
If the song file is missing, ask for it. Then measure the BPM and the downbeat, and show me the beat map as a table (beat, time, state, pointer action, sound), snapped to the measured grid, before writing any code. Wait for my OK.
</start>
```

The prompt and video belong to @motion_conquest; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)

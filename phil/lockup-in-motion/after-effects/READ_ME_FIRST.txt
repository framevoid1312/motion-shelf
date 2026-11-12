LOCKUP IN MOTION — After Effects build
======================================

1. Install the six fonts in Fonts/ (Inter Medium/SemiBold/Bold/ExtraBold, Space Mono Regular/Bold),
   then quit and reopen After Effects.
2. Put the soundtrack next to the script as LockupInMotion_score.wav. The quickest way is to pull it
   out of the film:  ffmpeg -i ../lockup-in-motion.mp4 -vn -c:a pcm_s24le LockupInMotion_score.wav
   (or render it from source/score, see source/README.md). Without it the build still runs, minus sound.
3. File > Scripts > Run Script File... > LockupInMotion_build.jsx, then File > Save As... > .aep

You get LOCKUP_IN_MOTION_MAIN (1080×1080, 30 fps, 20 s), 34 shot precomps on the 120 BPM grid,
the lockup sheet as its own precomp, and the texture panels in their own folder.
Copy lives in the BRAND block at the top of the script. Fonts: SIL Open Font License (OFL-*.txt).

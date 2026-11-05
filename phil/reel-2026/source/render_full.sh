#!/bin/bash
# full 1080p render to a temp name; rename only on success (video-making skill)
cd "$(dirname "$0")"
npx remotion render Reel2026 out/render/video_noaudio.tmp.mp4 --props='{"samples":4,"withAudio":false}' > out/render/render.log 2>&1
code=$?
if [ $code -eq 0 ]; then mv out/render/video_noaudio.tmp.mp4 out/render/video_noaudio.mp4; fi
echo "EXIT $code" >> out/render/render.log

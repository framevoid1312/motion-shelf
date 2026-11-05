#!/usr/bin/env bash
# two-pass loudnorm to -14 LUFS / -1.5 dBTP, then mux onto the picture without re-encoding it
set -euo pipefail
cd "$(dirname "$0")"
RAW0=score_raw.wav
RAW=score_lim.wav
# bring the mix up into a fast lookahead limiter first, so the loudness pass can stay linear (no pumping)
ffmpeg -hide_banner -v error -y -i "$RAW0" -af "volume=10.5dB,alimiter=limit=0.7:attack=1.5:release=45:level=disabled:latency=1" -c:a pcm_f32le "$RAW"
J=$(ffmpeg -hide_banner -nostats -i "$RAW" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -v error -y -i "$RAW" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -c:a pcm_s24le mix.wav
echo "pass1: I=$(g input_i) TP=$(g input_tp) LRA=$(g input_lra)"
ffmpeg -hide_banner -nostats -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary" | grep -E "I:|Peak:|LRA:"

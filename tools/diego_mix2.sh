#!/bin/bash
# Mix v2 (sem música): locução original em primeiro plano + ambiências/foley com redução suave sob a voz -> -14 LUFS / -1,5 dBTP
cd "$(dirname "$0")/.."
D=diego/public; OUT=${1:-$D/mix2.wav}
FC="[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=62,asplit=2[v][key];\
[1:a]volume=0.85[fx];[fx][key]sidechaincompress=threshold=0.03:ratio=2.5:attack=30:release=500:makeup=1[fxd];\
[v][fxd]amix=inputs=2:normalize=0:duration=longest,atrim=0:62[mix]"
ffmpeg -v error -y -i $D/locucao.mp3 -i $D/sfx2.wav -filter_complex "$FC" -map "[mix]" -ar 48000 /tmp/dpremix2.wav
J=$(ffmpeg -hide_banner -i /tmp/dpremix2.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
gi() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i /tmp/dpremix2.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(gi input_i):measured_TP=$(gi input_tp):measured_LRA=$(gi input_lra):measured_thresh=$(gi input_thresh):offset=$(gi target_offset):linear=true,aresample=48000" -ar 48000 $OUT
ffmpeg -hide_banner -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:"

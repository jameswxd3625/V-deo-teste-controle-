#!/bin/bash
# Mixagem: locução (master, sem alteração de tempo/conteúdo) + trilha com ducking por sidechain + efeitos; normaliza -14 LUFS / -1 dBTP
cd "$(dirname "$0")/.."
OUT=${1:-public/mix.wav}
FC="[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=30,asplit=2[v][key];\
[1:a]volume=0.32[m];[m][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=320:makeup=1[md];\
[2:a]volume=0.55[fx];\
[v]volume=1.0[vv];[vv][md][fx]amix=inputs=3:normalize=0:duration=longest,atrim=0:30[mix]"
ffmpeg -v error -y -i public/narracao.mp3 -i public/music.wav -i public/sfx.wav -filter_complex "$FC" -map "[mix]" -ar 48000 /tmp/premix.wav
J=$(ffmpeg -hide_banner -i /tmp/premix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
gi() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i /tmp/premix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(gi input_i):measured_TP=$(gi input_tp):measured_LRA=$(gi input_lra):measured_thresh=$(gi input_thresh):offset=$(gi target_offset):linear=true,aresample=48000" -ar 48000 $OUT
ffmpeg -hide_banner -i $OUT -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:|LRA:"

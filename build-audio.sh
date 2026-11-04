#!/bin/bash
# Gera trilha ambiente + efeitos (whoosh/impacto) em public/bed.wav
cd "$(dirname "$0")"
D=30
T=(2.0 4.5 6.1 7.7 8.6 10.3 12.9 16.7 19.7 21.3 24.3 27.8)
IN=(-f lavfi -t $D -i "sine=f=110:r=44100" -f lavfi -t $D -i "sine=f=164.81:r=44100" -f lavfi -t $D -i "sine=f=220:r=44100" -f lavfi -t $D -i "sine=f=277.18:r=44100")
FC="[0]volume=0.5[a0];[1]volume=0.35[a1];[2]volume=0.3[a2];[3]volume=0.2[a3];[a0][a1][a2][a3]amix=inputs=4:normalize=0,tremolo=f=0.25:d=0.3,lowpass=f=700,volume=0.35,afade=t=in:d=1.5,afade=t=out:st=27:d=3[pad];"
n=4; MIX="[pad]"
for t in "${T[@]}"; do
  ms=$(python3 -c "print(int($t*1000))")
  IN+=(-f lavfi -t 0.7 -i "anoisesrc=c=pink:r=44100:a=0.8")
  FC+="[$n]highpass=f=500,lowpass=f=6000,afade=t=in:d=0.35,afade=t=out:st=0.35:d=0.35,volume=0.35,adelay=${ms}|${ms}[w$n];"
  MIX+="[w$n]"; n=$((n+1))
done
for t in 0.0 7.75 27.85; do
  ms=$(python3 -c "print(int($t*1000)+1)")
  IN+=(-f lavfi -t 1.2 -i "sine=f=55:r=44100")
  FC+="[$n]afade=t=in:d=0.01,afade=t=out:st=0.05:d=1.1,volume=0.9,adelay=${ms}|${ms}[w$n];"
  MIX+="[w$n]"; n=$((n+1))
done
cnt=$((n-3+3-0)); cnt=$(( (n-4) + 1 ))
FC+="${MIX}amix=inputs=$cnt:normalize=0,alimiter=limit=0.7[out]"
ffmpeg -v error -y "${IN[@]}" -filter_complex "$FC" -map "[out]" -t $D public/bed.wav

#!/bin/bash
# Mixagem final do áudio -> public/mix.wav (29,6 s)
# Fontes: ver CREDITS.md. Narração = master (sem alteração de tempo/tom, só ganho).
set -e
cd "$(dirname "$0")"
A=assets/audio
DUR=29.6
MOFF=9.48   # início do trecho de "Ouroboros": a virada da música (17,40 s da faixa) cai em 7,92 s ("Na Conttrole")

# whoosh: ciclo 0,55–1,75 s do loop (pico ~0,75 s após o início do trecho)
# impacto grave: golpe em 3,499 s do arquivo
W="atrim=0.55:1.75,asetpts=PTS-STARTPTS,afade=t=in:d=0.25,afade=t=out:st=0.85:d=0.35"
I="atrim=3.48:4.4,asetpts=PTS-STARTPTS,afade=t=out:st=0.4:d=0.5"

ffmpeg -v error -y \
  -i public/narracao.mp3 \
  -ss $MOFF -t $DUR -i $A/Ouroboros_KevinMacLeod.mp3 \
  -i $A/air-whoosh_pyranostudios_CC0.wav \
  -i $A/impact_qubodup_CC0.ogg \
  -filter_complex "
[0:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=8dB,apad=whole_dur=$DUR,asplit=2[vo][key];
[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=-14dB,afade=t=in:d=0.25,afade=t=out:st=27.4:d=2.2[mus];
[mus][key]sidechaincompress=threshold=0.04:ratio=5:attack=25:release=350:makeup=1[duck];
[2:a]asplit=4[w1][w2][w3][w4];
[w1]$W,volume=-13dB,adelay=1350|1350[s1];
[w2]$W,volume=-9dB,adelay=7200|7200[s2];
[w3]$W,volume=-11dB,adelay=20800|20800[s3];
[w4]$W,volume=-9dB,adelay=25350|25350[s4];
[3:a]aformat=sample_rates=44100:channel_layouts=stereo,asplit=2[i1][i2];
[i1]$I,lowpass=f=380,volume=-2dB,adelay=0|0[k1];
[i2]$I,lowpass=f=600,volume=-4dB,adelay=26080|26080[k2];
[vo][duck][s1][s2][s3][s4][k1][k2]amix=inputs=8:normalize=0:duration=first,alimiter=limit=0.89:level=false[out]" \
  -map "[out]" -t $DUR -ar 44100 public/mix.wav
ffmpeg -hide_banner -i public/mix.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1

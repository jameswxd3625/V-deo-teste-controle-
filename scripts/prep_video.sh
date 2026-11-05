#!/bin/bash
# Uso: scripts/prep_video.sh entrada.mp4 saida.mp4
# Amplia um vídeo 720x1280 para 1080x1920 (Lanczos + nitidez leve), 24 fps, sem áudio.
ffmpeg -v error -y -i "$1" -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.7:5:5:0.0" \
  -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -r 24 -an -movflags +faststart "$2"

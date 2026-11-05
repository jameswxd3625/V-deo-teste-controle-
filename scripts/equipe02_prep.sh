#!/bin/bash
# Gera public/diego/drone_paqueta.mp4: o vídeo original (720x1280) ampliado a 1080x1920 com Lanczos + nitidez leve.
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i public/diego/drone_original.mp4 -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.7:5:5:0.0" \
  -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -r 24 -an -movflags +faststart public/diego/drone_paqueta.mp4

#!/bin/bash
# uso: tools/stills.sh outdir "f1 f2 ..." [scale]  -> renderiza quadros e monta folha de contato
cd "$(dirname "$0")/.."
OUT=$1; FR=$2; SC=${3:-0.5}
mkdir -p $OUT
npx remotion bundle src/index.jsx --out-dir=$OUT/bundle >/dev/null 2>&1 || true
for fr in $FR; do
  npx remotion still $OUT/bundle ConttroleAd $OUT/f$(printf %04d $fr).png --frame=$fr --gl=swangle --scale=$SC >/dev/null 2>&1 &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 0.5; done
done
wait
ls $OUT/*.png | wc -l

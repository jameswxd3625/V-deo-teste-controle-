#!/bin/bash
# uso: tools/dstills.sh outdir "f1 f2 ..." [scale]
cd "$(dirname "$0")/.."
OUT=$1; FR=$2; SC=${3:-0.5}; COMP=${4:-DiegoFilm2}
rm -rf $OUT; mkdir -p $OUT
npx remotion bundle diego/src/index.jsx --public-dir=diego/public --out-dir=$OUT/bundle --log=error >/dev/null 2>&1
for fr in $FR; do
  npx remotion still $OUT/bundle $COMP $OUT/f$(printf %04d $fr).png --frame=$fr --scale=$SC --log=error >/dev/null 2>&1 &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 0.3; done
done
wait
ls $OUT/f*.png | wc -l

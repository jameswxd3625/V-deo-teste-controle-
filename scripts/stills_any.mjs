// Uso: COMP=Id node scripts/stills_any.mjs out_dir escala t1 t2 ...
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import path from "path";
const [out, scale, ...ts] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve("src/index.jsx")});
for (const id of process.env.COMP.split(",")) {
  const composition = await selectComposition({serveUrl, id});
  for (const t of ts) await renderStill({serveUrl, composition, frame: Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * composition.fps)), output: `${out}/${id}_${t}.png`, scale: parseFloat(scale)});
}
console.log("ok");

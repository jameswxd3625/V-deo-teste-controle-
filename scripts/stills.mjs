// Uso: node scripts/stills.mjs out_dir escala t1 t2 ... (segundos)
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import path from "path";
const [out, scale, ...ts] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve("src/index.jsx")});
const composition = await selectComposition({serveUrl, id: "DiegoMudancas"});
for (const t of ts) {
  const frame = Math.round(parseFloat(t) * 30);
  await renderStill({serveUrl, composition, frame, output: `${out}/s_${String(t).padStart(5, "0")}.png`, scale: parseFloat(scale)});
}
console.log("ok");

// Uso: node scripts/stills_eq.mjs out_dir escala t1 t2 ...  (composição Equipe02)
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import path from "path";
const [out, scale, ...ts] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve("src/index.jsx")});
const composition = await selectComposition({serveUrl, id: "Equipe02"});
for (const t of ts) await renderStill({serveUrl, composition, frame: Math.round(parseFloat(t) * 24), output: `${out}/e_${String(t).padStart(4, "0")}.png`, scale: parseFloat(scale)});
console.log("ok");

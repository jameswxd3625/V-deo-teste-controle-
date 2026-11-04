import React from "react";
import {registerRoot, Composition, staticFile, delayRender, continueRender} from "remotion";
import {Film} from "./Film";
import {Film2} from "./Film2";
import {FPS, DUR, W, H} from "./lib";

// Montserrat (OFL) local — carregada antes do primeiro quadro
if (typeof document !== "undefined" && !document.getElementById("mont")) {
  const st = document.createElement("style");
  st.id = "mont";
  st.textContent = [500, 600, 700, 800, 900]
    .map((w) => `@font-face{font-family:Montserrat;font-weight:${w};font-display:block;src:url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)}) format('woff2');}`)
    .join("");
  document.head.appendChild(st);
  const h = delayRender("fontes");
  Promise.all([500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px Montserrat`, "ÁÊÇÃ12%"))).then(() => continueRender(h));
}

const Root = () => (
  <>
    <Composition id="Conttrole" component={Film} durationInFrames={DUR} fps={FPS} width={W} height={H} />
    <Composition id="ConttroleV2" component={Film2} durationInFrames={DUR} fps={FPS} width={W} height={H} />
  </>
);
registerRoot(Root);

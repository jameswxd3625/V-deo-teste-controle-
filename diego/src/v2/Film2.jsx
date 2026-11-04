import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {FPS, P, EO} from "../lib";
import {PersonDefs} from "./Person";
import {Finish} from "../ui";
import {Shot1} from "./s1_open";
import {Shot2} from "./s2_album";
import {Shot3, Shot4} from "./s3_diego";
import {Shot5, Shot6, Shot7, Shot8} from "./s4_end";
import {Subtitles} from "./subs";
export const DURATION2 = Math.round(62 * FPS);
const SHOTS = [
  [0, 14.5, Shot1],
  [14.5, 31.46, Shot2],
  [31.46, 36.55, Shot3],
  [36.55, 40.45, Shot4],
  [40.45, 44.95, Shot5],
  [44.95, 48.95, Shot6],
  [48.95, 52.4, Shot7],
  [52.4, 62.1, Shot8],
];
export const Film2 = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <PersonDefs />
      {SHOTS.map(([a, b, C, fin = 0], i) => (t >= a && t < b ? <AbsoluteFill key={i} style={{opacity: fin ? P(t, a, a + fin, EO) : 1}}><C t={t} /></AbsoluteFill> : null))}
      <Finish t={t} vignette={0.5} />
      <Subtitles t={t} />
    </AbsoluteFill>
  );
};

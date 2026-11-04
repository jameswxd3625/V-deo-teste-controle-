import React from "react";
import {AbsoluteFill} from "remotion";
import {Character, PAULO, MOVER1, MOVER2, SharedDefs, Head} from "./Character";
export const SIT = {torso: 4, head: 10, aA: [-28, -78], aB: [28, 78], lA: [6, -6, 0.32], lB: [-6, 6, 0.32], hip: [0, 330]};
export const CROUCH = {torso: 6, head: 12, aA: [-20, -60], aB: [40, 60], lA: [70, -125], lB: [-70, 125], hip: [0, 250]};
export const CharTest = () => (
  <AbsoluteFill style={{background: "#cfd6e2"}}>
    <SharedDefs />
    <svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <Character c={PAULO} x={200} y={900} s={0.75} e={{smile: 0.3}} />
      <rect x={440} y={680} width={200} height={220} fill="#C9945C" />
      <Character c={PAULO} x={540} y={900} s={0.75} pose={SIT} e={{smile: 0.45, look: [0, 1], blink: 0.4}} />
      <Character c={MOVER1} x={850} y={900} s={0.75} pose={{aA: [30, -40], aB: [-20, -50]}} e={{smile: 0.5}} />
      <Character c={PAULO} x={540} y={1800} s={0.75} pose={CROUCH} e={{brow: 0.4, worry: 1, smile: -0.2}} />
      <Character c={MOVER2} x={880} y={1800} s={0.75} e={{smile: 0.7, open: 0.6}} />
      <g transform="translate(200 1450) scale(2.2)"><Head c={PAULO} e={{smile: 0.6, open: 0.3, brow: 0.3}} turn={0.3} /></g>
    </svg>
  </AbsoluteFill>
);

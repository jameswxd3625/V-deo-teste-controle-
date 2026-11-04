import React from "react";
import {AbsoluteFill} from "remotion";
import {Person, PersonDefs, PAULO, MOVER1, MOVER2, ANA, KID, Head2} from "./Person";
const HOLD = {spine: 2, head: 14, turn: 0.1, ikL: [-112, -585], ikR: [112, -585], wristL: 170, wristR: -170, foreL: 0.42, foreR: 0.42, handL: "thumb", handR: "thumb", armsOver: true};
const CARRY = {spine: -6, head: 4, turn: 0.2, ikL: [-138, -500], ikR: [138, -500], wristL: 160, wristR: -160, foreL: 0.55, foreR: 0.55, handL: "grip", handR: "grip", armsOver: true, legL: [8, -12], legR: [-6, 10], hip: [0, 16]};
export const Test2 = () => (
  <AbsoluteFill style={{background: "#C9D3E2"}}>
    <PersonDefs />
    <svg width="1080" height="1920">
      <Person c={PAULO} x={190} y={920} s={0.78} e={{smile: 0.25}} />
      <Person c={PAULO} x={540} y={920} s={0.78} pose={HOLD} e={{smile: 0.55, look: [0, 1], blink: 0.35}}
        hold={(h) => <g transform="translate(0 -560)"><rect x={-118} y={-110} width={236} height={200} rx={10} fill="#7B3B22" /></g>} />
      <Person c={MOVER1} x={880} y={920} s={0.78} pose={CARRY} e={{smile: 0.4}}
        hold={(h) => <g transform="translate(0 -560)"><rect x={-140} y={-100} width={280} height={190} fill="#C9945C" /></g>} holdLayer="front" />
      <Person c={ANA} x={200} y={1820} s={0.74} e={{smile: 0.7, open: 0.3}} />
      <Person c={KID} x={360} y={1820} s={0.5} e={{smile: 0.9, open: 0.4}} />
      <Person c={MOVER2} x={560} y={1820} s={0.78} pose={{armR: [-60, -50, 0], handR: "open", turn: -0.2}} e={{smile: 0.8, open: 0.5}} />
      <g transform="translate(860 1350) scale(1.6)"><Head2 c={PAULO} e={{smile: 0.6, brow: 0.2, look: [0, 0.6], blink: 0.3}} turn={0.25} /></g>
      <g transform="translate(860 1700) scale(1.1)"><Head2 c={PAULO} e={{smile: -0.2, worry: 1, brow: 0.3}} turn={-0.2} /></g>
    </svg>
  </AbsoluteFill>
);

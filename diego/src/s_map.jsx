import React from "react";
import {AbsoluteFill} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, FONT} from "./lib";
import {Cam, Stage, Caption, L} from "./ui";
import {Truck} from "./Truck";

// rota (curva cúbica em trechos) de A até B
const ROUTE = [[180, 1520], [180, 1300], [420, 1300], [420, 1060], [700, 1060], [700, 820], [900, 820], [900, 620]];
const segLen = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
const TOT = segLen.reduce((a, b) => a + b, 0);
const at = (u) => {
  let d = u * TOT;
  for (let i = 0; i < segLen.length; i++) {
    if (d <= segLen[i]) {
      const k = d / segLen[i];
      return [mix(ROUTE[i][0], ROUTE[i + 1][0], k), mix(ROUTE[i][1], ROUTE[i + 1][1], k), ROUTE[i + 1][0] - ROUTE[i][0]];
    }
    d -= segLen[i];
  }
  const L = ROUTE[ROUTE.length - 1];
  return [L[0], L[1], 0];
};
const routeD = ROUTE.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");

const Pin = ({x, y, p, icon}) => (
  <g transform={`translate(${x} ${y}) scale(${cl(p, 0, 1.3)})`}>
    <ellipse cx={0} cy={4} rx={46} ry={14} fill="#000" opacity={0.35} filter="url(#softShadow)" />
    <circle cx={0} cy={0} r={mix(30, 120, cl(p))} fill="#27C0F5" opacity={0.25 * (1 - cl(p))} />
    <path d="M 0 0 C -20 -40, -70 -80, -70 -130 A 70 70 0 1 1 70 -130 C 70 -80, 20 -40, 0 0 Z" fill="url(#pinG)" />
    <circle cx={0} cy={-130} r={46} fill="#fff" />
    <g transform="translate(0 -130)" stroke="#0A1C4A" strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round">
      {icon === "apt" ? (<><rect x={-20} y={-24} width={40} height={50} /><path d="M -10 -12 h6 M 4 -12 h6 M -10 2 h6 M 4 2 h6 M -4 26 v-10 h8 v10" /></>) : (<><path d="M -26 0 L 0 -24 L 26 0" /><path d="M -18 -6 V 24 H 18 V -6" /><path d="M -5 24 V 10 H 5 V 24" /></>)}
    </g>
  </g>
);

const Chip = ({x, y, p, label, icon, w = 300}) => (
  <g transform={`translate(${x} ${y}) scale(${cl(p, 0, 1.2)})`} opacity={cl(p * 2)}>
    <rect x={-w / 2} y={-62} width={w} height={124} rx={62} fill="#0E2A6E" stroke="#27C0F5" strokeWidth={3} />
    <circle cx={-w / 2 + 62} cy={0} r={44} fill="url(#pinG)" />
    <g transform={`translate(${-w / 2 + 62} 0)`} stroke="#fff" strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round">
      {icon === "sofa" && <><rect x={-24} y={-8} width={48} height={18} rx={5} /><path d="M -24 -8 V -20 H 24 V -8 M -18 10 V 18 M 18 10 V 18" /></>}
      {icon === "fridge" && <><rect x={-14} y={-26} width={28} height={52} rx={5} /><path d="M -14 -6 H 14 M 8 -18 V -10 M 8 2 V 14" /></>}
      {icon === "box" && <><rect x={-22} y={-16} width={44} height={36} rx={3} /><path d="M -22 -6 H 22 M 0 -16 V -6" /></>}
    </g>
    <text x={w > 300 ? 40 : 34} y={14} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={40} fill="#fff">{label}</text>
  </g>
);

export const SceneMap = ({t}) => {
  const draw = P(t, 42.2, 43.3, EIO);
  const tr = at(P(t, 42.2, 43.35, EIO));
  const cam = KO(t, [
    [40.3, {x: 560, y: 1200, z: 1.35}],
    [41.2, {x: 420, y: 1250, z: 1.1}],
    [42.2, {x: 420, y: 1230, z: 1.05}],
    [43.4, {x: 600, y: 900, z: 0.92}],
    [44.9, {x: 560, y: 880, z: 0.9}],
  ], ES);
  const appear = P(t, 40.2, 40.7, EO);
  return (
    <AbsoluteFill>
      <Stage bg="#081A45">
        <defs>
          <linearGradient id="pinG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#27C0F5" /><stop offset="1" stopColor="#1558D6" /></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="8" /></filter>
        </defs>
        <Cam c={cam}>
          <g opacity={appear}>
            <rect x={-800} y={-600} width={2700} height={3200} fill="#0A1F52" />
            {/* curvas de nível (relevo de BH) */}
            {Array.from({length: 9}, (_, i) => (
              <path key={i} d={`M -800 ${300 + i * 170} C 0 ${180 + i * 170}, 500 ${420 + i * 170}, 1900 ${240 + i * 170}`} stroke="#27C0F5" strokeOpacity={0.07} strokeWidth={3} fill="none" />
            ))}
            {/* quadras */}
            {Array.from({length: 9}, (_, r) => Array.from({length: 7}, (_, c) => {
              const x = -480 + c * 270, y = -200 + r * 240;
              const park = (r * 7 + c) % 11 === 3;
              return <rect key={`${r}${c}`} x={x} y={y} width={220} height={190} rx={18} fill={park ? "#0E4A5C" : "#10295F"} />;
            }))}
            {/* ruas principais */}
            {[180, 420, 700, 900].map((x) => <rect key={x} x={x - 14} y={-600} width={28} height={3200} fill="#16357A" />)}
            {[1520, 1300, 1060, 820, 620].map((y) => <rect key={y} x={-800} y={y - 14} width={2700} height={28} fill="#16357A" />)}
            {/* rota */}
            <path d={routeD} stroke="#27C0F5" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} filter="url(#glow)" opacity={0.7} />
            <path d={routeD} stroke="#BFF0FF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
            <Pin x={180} y={1520} p={SP(t, 41.2, 12, 0.45)} icon="apt" />
            <Pin x={900} y={620} p={SP(t, 42.85, 12, 0.45)} icon="house" />
            {/* caminhão percorrendo a rota */}
            {t > 42.0 && (
              <g transform={`translate(${tr[0]} ${tr[1] - 6})`}>
                <circle r={86} fill="#fff" opacity={0.95} />
                <g transform="translate(-74 30)"><Truck x={0} y={0} s={0.095} /></g>
              </g>
            )}
          </g>
        </Cam>
        {/* rótulos em tela */}
      </Stage>
      <Caption t={t} y={200} out={44.95} lines={[L("Conte para a gente", [39.8, 40.08, 40.34, 40.42], {size: 62, weight: 700})]} />
      <Caption t={t} y={300} out={44.95} lines={[
        L("de onde você está *saindo,*", [40.68, 41.14, 41.38, 41.72, 41.9], {size: 66, weight: 900}),
        L("para onde *vai*", [42.56, 42.82, 43.14], {size: 66, weight: 900}),
        L("e o que precisa *levar.*", [43.44, 43.7, 43.86, 44.18, 44.48], {size: 66, weight: 900}),
      ]} />
      <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
        <Chip x={270} y={1560} p={SP(t, 44.2, 13, 0.5)} label="Sofá" icon="sofa" w={280} />
        <Chip x={740} y={1560} p={SP(t, 44.35, 13, 0.5)} label="Geladeira" icon="fridge" w={400} />
        <Chip x={540} y={1720} p={SP(t, 44.5, 13, 0.5)} label="Caixas" icon="box" />
      </svg>
    </AbsoluteFill>
  );
};

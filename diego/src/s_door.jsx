import React from "react";
import {AbsoluteFill, staticFile} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, wob} from "./lib";
import {Cam, Stage, Caption, L} from "./ui";
import {Character, PAULO, MOVER1, MOVER2, lerpPose} from "./Character";
import {Box, QuiltCover, Sofa} from "./props";

const walk = (t, t0, t1, amp = 22) => {
  if (t < t0 || t > t1) return {lA: [3, 0], lB: [-3, 0], bob: 0};
  const ph = (t - t0) * 9;
  const k = Math.sin(ph) * (1 - P(t, t1 - 0.25, t1));
  return {lA: [k * amp, Math.max(0, -k) * 30], lB: [-k * amp, Math.max(0, k) * 30], bob: Math.abs(Math.sin(ph)) * -10};
};

// pilha de capas azuis dobradas
const Folded = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0 ${-i * 46})`}>
        <rect x={-130} y={-46} width={260} height={50} rx={18} fill={i % 2 ? "#1A56C8" : "#2263DA"} />
        <rect x={-130} y={-46} width={260} height={50} rx={18} fill="url(#quiltTex)" />
        <path d="M -120 -10 L 120 -10" stroke="#0D2F78" strokeWidth={4} opacity={0.6} />
      </g>
    ))}
  </g>
);

const Hall = ({t, door}) => (
  <g>
    <defs>
      <linearGradient id="wallDay" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B9C6DA" /><stop offset="1" stopColor="#9FB0C9" /></linearGradient>
      <linearGradient id="floorDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A6248" /><stop offset="1" stopColor="#A27A5C" /></linearGradient>
      <linearGradient id="hallOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2E6D2" /><stop offset="1" stopColor="#D8C6AA" /></linearGradient>
    </defs>
    <rect x={-400} y={-200} width={1900} height={1480} fill="url(#wallDay)" />
    <rect x={-400} y={1250} width={1900} height={1000} fill="url(#floorDay)" />
    {Array.from({length: 12}, (_, i) => <path key={i} d={`M -400 ${1270 + i * i * 7} L 1500 ${1270 + i * i * 7}`} stroke="#5E3F2C" strokeWidth={2} opacity={0.3} />)}
    <rect x={-400} y={1236} width={1900} height={22} fill="#8090AA" />
    {/* vão da porta e corredor */}
    <rect x={90} y={520} width={360} height={740} fill="url(#hallOut)" />
    <rect x={90} y={1180} width={360} height={80} fill="#C9B394" />
    <rect x={250} y={600} width={140} height={200} fill="#FFF6E0" opacity={0.7} />
    <path d="M 70 500 L 470 500 L 470 1260 L 450 1260 L 450 520 L 90 520 L 90 1260 L 70 1260 Z" fill="#F4F5F8" />
    {/* folha da porta (abre para dentro, em direção à câmera) */}
    <g transform={`translate(90 0) scale(${mix(1, -0.42, door)} 1) translate(-90 0)`}>
      <rect x={90} y={520} width={360} height={740} fill={door > 0.58 ? "#6E4A36" : "#8B5E44"} />
      <rect x={130} y={580} width={280} height={280} rx={10} fill="none" stroke="#000" strokeOpacity={0.15} strokeWidth={6} />
      <rect x={130} y={920} width={280} height={280} rx={10} fill="none" stroke="#000" strokeOpacity={0.15} strokeWidth={6} />
      <circle cx={410} cy={900} r={12} fill="#D8B46A" />
    </g>
    {/* luz da manhã entrando */}
    <path d={`M 90 1260 L 450 1260 L ${450 + 700 * door} 1920 L ${90 - 200 * door} 1920 Z`} fill="#FFF3D6" opacity={0.22 * door} />
    {/* quadro e prateleira vazios (mudança) */}
    <rect x={640} y={640} width={240} height={180} fill="#fff" opacity={0.1} />
    <rect x={600} y={900} width={380} height={18} rx={4} fill="#7C5A44" />
  </g>
);

export const SceneDoor = ({t}) => {
  const door = P(t, 31.8, 32.45, EIO);
  const pull = P(t, 31.46, 32.15, EO); // recuo a partir da etiqueta FRÁGIL
  const camBase = KO(t, [[32.1, {x: 540, y: 760, z: 0.98}], [34.4, {x: 540, y: 740, z: 1.03}]], ES);
  const lbl = {x: 270, y: 1640};
  const cam = {x: mix(lbl.x, camBase.x, pull), y: mix(lbl.y, camBase.y, pull), z: mix(4.2, camBase.z, pull)};
  // equipe entra
  const w1 = walk(t, 32.2, 33.0), w2 = walk(t, 32.45, 33.3);
  const m1x = mix(270, 560, P(t, 32.2, 33.0, EIO)), m2x = mix(220, 300, P(t, 32.45, 33.3, EIO));
  const m1In = t > 32.15, m2In = t > 32.4;
  // capa arremessada (34.55 -> 35.3)
  const fly = P(t, 34.5, 35.25, EO);
  const away = P(t, 36.25, 36.7, EI);
  const pauloPose = lerpPose({aA: [8, 4], aB: [-8, -4]}, {torso: -3, aA: [60, -40], aB: [-10, -20], turn: -0.35, head: -4}, P(t, 32.6, 33.2, EIO));
  const coverW = mix(260, 1240, fly), coverH = mix(150, 2100, fly);
  const cx = mix(380, 540, fly), cy = mix(800, 960, fly);
  return (
    <AbsoluteFill>
      <Stage bg="#9FB0C9">
        <Cam c={cam}>
          <Hall t={t} door={door} />
          {m2In && (
            <Character c={MOVER2} x={m2x} y={1290 + w2.bob} s={0.86} pose={{...w2, aA: [10, 0], aB: [-24, -70], turn: 0.25}} e={{smile: 0.6}}
              hold={fly < 0.02 ? (hp) => <Folded x={hp[0] + 40} y={hp[1] + 40} /> : undefined} />
          )}
          {m1In && (
            <Character c={MOVER1} x={m1x} y={1330 + w1.bob} s={0.9} pose={{...w1, aA: [20, -40], aB: [-30, -60], turn: 0.3, head: 4}} e={{smile: mix(0.4, 0.75, P(t, 33.0, 33.4)), open: P(t, 33.1, 33.4) * 0.35 * (1 - P(t, 34.0, 34.3))}} />
          )}
          <Character c={PAULO} x={870} y={1400} s={0.95} pose={pauloPose} e={{smile: mix(0.25, 0.7, P(t, 32.7, 33.2)), open: P(t, 32.9, 33.2) * 0.3 * (1 - P(t, 33.8, 34.1))}} />
          {/* caixa do álbum em primeiro plano */}
          <Box x={100} y={1400} w={340} h={240} fragile seed={11} />
        </Cam>
        {/* capa acolchoada se abrindo em direção à câmera */}
        {fly > 0 && (
          <g transform={`translate(${cx + away * 1400} ${cy - away * 300}) rotate(${mix(-8, 0, fly) + away * 12}) skewY(${Math.sin(t * 6) * 2 * (1 - fly * 0.6)})`}>
            <g transform={`translate(${-coverW / 2} ${-coverH / 2})`}>
              <QuiltCover x={0} y={0} w={coverW} h={coverH} p={1} r={mix(18, 0, fly)} logoScale={0.7} />
              {/* brilho que atravessa o tecido */}
              <rect x={0} y={0} width={coverW} height={coverH} fill="url(#fabricSweep)" opacity={P(t, 35.2, 35.5) * (1 - P(t, 36.0, 36.3))} transform={`translate(${mix(-coverW, coverW, P(t, 35.2, 36.2, EIO))} 0)`} />
            </g>
          </g>
        )}
        <defs>
          <linearGradient id="fabricSweep" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0.35" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.28" /><stop offset="0.65" stopColor="#fff" stopOpacity="0" /></linearGradient>
        </defs>
      </Stage>
      <Caption t={t} y={170} out={34.25} lines={[
        L("Na hora de escolher", [31.46, 31.52, 31.72, 31.96], {weight: 700, size: 58}),
        L("quem vai *acompanhar*", [32.4, 32.66, 32.92], {size: 80, weight: 900}),
        L("essa mudança,", [33.46, 33.64], {size: 80, weight: 900}),
      ]} />
      <Caption t={t} y={250} out={36.2} lines={[L("Conheça a", [34.62, 34.98], {size: 58, weight: 700})]} />
    </AbsoluteFill>
  );
};

import React from "react";
import {AbsoluteFill} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, ANT, LIN, cl, mix, wob, FONT} from "./lib";
import {Cam, Stage, Caption, L, NameSuper} from "./ui";
import {Character, PAULO, lerpPose} from "./Character";
import {Box, AlbumClosed, Sofa, FloorLamp, Plant, Frame} from "./props";

// ---------- cenário: sala antiga ao entardecer ----------
const Skyline = () => (
  <g>
    <defs>
      <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1F2D57" /><stop offset="0.45" stopColor="#5B5C8E" /><stop offset="0.75" stopColor="#D98B6A" /><stop offset="1" stopColor="#F4B66E" />
      </linearGradient>
    </defs>
    <rect x={40} y={300} width={440} height={700} fill="url(#dusk)" />
    {/* serra (silhueta) */}
    <path d="M 40 760 L 90 730 L 130 742 L 170 700 L 205 712 L 240 690 L 280 705 L 320 668 L 360 690 L 400 676 L 440 700 L 480 690 L 480 1000 L 40 1000 Z" fill="#3A3866" />
    {/* prédios */}
    {[[40, 820, 70], [105, 790, 60], [160, 840, 55], [210, 770, 50], [255, 810, 70], [320, 760, 46], [360, 800, 64], [420, 830, 60]].map(([x, y, w], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={1000 - y} fill={i % 2 ? "#262B4D" : "#2E3459"} />
        {Array.from({length: 14}, (_, k) => {
          const wx = x + 8 + (k % 3) * (w / 3.4), wy = y + 14 + Math.floor(k / 3) * 30;
          return ((i * 7 + k * 3) % 5 < 2) ? <rect key={k} x={wx} y={wy} width={8} height={11} fill="#FFD08A" opacity={0.85} /> : null;
        })}
      </g>
    ))}
  </g>
);

const OldRoom = ({t}) => {
  const lampOn = 1;
  return (
    <g>
      <defs>
        <linearGradient id="wallOld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#36466B" /><stop offset="1" stopColor="#4B5A7D" /></linearGradient>
        <linearGradient id="floorOld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4E3628" /><stop offset="1" stopColor="#6E4C36" /></linearGradient>
        <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFCB7A" stopOpacity="0.55" /><stop offset="1" stopColor="#FFCB7A" stopOpacity="0" /></radialGradient>
        <linearGradient id="winLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7B97A" stopOpacity="0.22" /><stop offset="1" stopColor="#F7B97A" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x={-600} y={-300} width={2400} height={1580} fill="url(#wallOld)" />
      <rect x={-600} y={1250} width={2400} height={1200} fill="url(#floorOld)" />
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-600} ${1270 + i * i * 7} L 1800 ${1270 + i * i * 7}`} stroke="#2E1F16" strokeWidth={2} opacity={0.35} />)}
      <rect x={-600} y={1236} width={2400} height={22} fill="#2C3552" />
      {/* janela */}
      <rect x={20} y={280} width={480} height={740} fill="#23283A" />
      <Skyline />
      <path d="M 260 300 L 260 1000 M 40 640 L 480 640" stroke="#23283A" strokeWidth={14} />
      <path d="M 60 320 L 200 320 L 60 560 Z" fill="#fff" opacity={0.06} />
      <rect x={10} y={1000} width={500} height={26} fill="#2B2F42" />
      {/* luz da janela no chão */}
      <path d="M 40 1000 L 480 1000 L 700 1700 L -100 1700 Z" fill="url(#winLight)" />
      {/* quadros */}
      <Frame x={600} y={540} w={220} h={180}>
        <rect width="400" height="300" fill="#9DB7D8" /><circle cx="300" cy="90" r="40" fill="#FFE2A0" /><path d="M0 300 L 120 150 L 220 260 L 300 180 L 400 300 Z" fill="#4C6A58" />
      </Frame>
      <Frame ghost x={860} y={580} w={150} h={190} />
      {/* rodapé de quadro removido: prego */}
      <circle cx={935} cy={568} r={4} fill="#1E2436" />
      <Sofa x={740} y={1300} w={560} />
      <circle cx={1160} cy={560} r={360} fill="url(#lampGlow)" opacity={lampOn} />
      <FloorLamp x={1160} y={1320} on={lampOn} />
      <Plant x={-60} y={1300} s={0.9} sway={wob(t, 2, 0.4) * 2} />
    </g>
  );
};

// caixas: caem do alto e assentam com leve compressão
const BoxA = ({t, x, y, w, h, at, seed, fragile, open = 0}) => {
  const fall = P(t, at - 0.32, at, (u) => u * u);
  if (fall <= 0) return null;
  const land = SP(t, at, 16, 0.32);
  const sq = t > at ? (1 - cl(land)) * 0.12 : 0;
  return (
    <g transform={`translate(${x + w / 2} ${y + h - (1 - fall) * 900}) scale(${1 + sq} ${1 - sq}) translate(${-w / 2} ${-h})`}>
      <Box x={0} y={0} w={w} h={h} d={70} seed={seed} fragile={fragile} open={open} />
    </g>
  );
};

// ---------- bloco de notas (lista) ----------
const ITEMS = [
  {txt: "Organizar as caixas", at: 5.74},
  {txt: "Cuidar dos móveis", at: 7.14},
  {txt: "Escolher o transporte", at: 8.66},
  {txt: "Torcer pra dar certo", at: 10.22},
];
const Notepad = ({t}) => {
  const pin = P(t, 2.75, 3.45, EO);
  const out = P(t, 12.15, 12.7, EI);
  if (pin <= 0 || out >= 1) return null;
  const shake = t > 10.4 && t < 12.2 ? Math.sin(t * 38) * 1.6 * P(t, 10.4, 11.4) : 0;
  return (
    <div style={{position: "absolute", left: 70, top: 1120, width: 640, height: 640, transform: `translateY(${(1 - pin) * 700 + out * 900}px) rotate(${-4 + (1 - pin) * -8 + shake}deg)`, fontFamily: FONT}}>
      <div style={{position: "absolute", inset: 0, borderRadius: 18, background: "linear-gradient(180deg,#FFFDF7,#F3EEE2)", boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 6px 14px rgba(0,0,0,0.25)"}} />
      <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 70, borderRadius: "18px 18px 0 0", background: "#0A1C4A"}} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} style={{position: "absolute", left: 40 + i * 76, top: -16, width: 20, height: 46, borderRadius: 10, background: "linear-gradient(90deg,#9AA3B2,#E6EAF0,#9AA3B2)"}} />)}
      <div style={{position: "absolute", left: 48, top: 108, fontSize: 50, fontWeight: 900, fontStyle: "italic", color: "#0A1C4A", letterSpacing: "-0.02em"}}>Lista da mudança</div>
      <div style={{position: "absolute", left: 48, right: 48, top: 176, height: 4, background: "#27C0F5", borderRadius: 2, transform: `scaleX(${P(t, 3.3, 3.9)})`, transformOrigin: "left"}} />
      {ITEMS.map((it, i) => {
        const p = P(t, it.at - 0.1, it.at + 0.65, EIO);
        return (
          <div key={i} style={{position: "absolute", left: 48, top: 220 + i * 98, display: "flex", alignItems: "center", gap: 22}}>
            <div style={{width: 46, height: 46, borderRadius: 10, border: "4px solid #0A1C4A", opacity: cl(p * 3), transform: `scale(${mix(0.5, 1, cl(p * 2))})`}} />
            <div style={{fontSize: 44, fontWeight: 700, color: "#1B2238", whiteSpace: "nowrap", clipPath: `inset(0 ${100 - p * 100}% 0 0)`}}>{it.txt}</div>
          </div>
        );
      })}
      {/* linhas do papel */}
      {[0, 1, 2, 3].map((i) => <div key={i} style={{position: "absolute", left: 40, right: 40, top: 290 + i * 98, height: 2, background: "#D7DCE6"}} />)}
    </div>
  );
};

// ---------- poses ----------
const STAND = {torso: 0, head: 0, turn: 0, aA: [8, 4], aB: [-8, -4], lA: [3, 0], lB: [-3, 0], hip: [0, 0]};
const REACH = {torso: -8, head: -6, turn: -0.5, aA: [84, -26], aB: [-12, -18], lA: [10, -4], lB: [-6, 4], hip: [0, 0]};
const RELIEF = {torso: -2, head: 4, turn: 0.1, aA: [10, -2], aB: [-14, -28], lA: [3, 0], lB: [-3, 0], hip: [0, 0]};
const REACH_R = {torso: 10, head: 10, turn: 0.55, aA: [6, -20], aB: [-34, -14], lA: [4, 0], lB: [-6, 2], hip: [0, 0]};
const HOLD = {torso: 2, head: 12, turn: 0.05, aA: [28, -80], aB: [-28, 80], lA: [3, 0], lB: [-3, 0], hip: [0, 0]};
const SIT = {torso: 4, head: 8, turn: 0.15, aA: [4, -30], aB: [-6, 30], lA: [6, -6, 0.32], lB: [-6, 6, 0.32], hip: [0, 330]};
const SIT_REACH = {torso: 18, head: 14, turn: 0.5, aA: [-6, -40], aB: [-46, -6], lA: [6, -6, 0.32], lB: [-10, 10, 0.32], hip: [0, 330]};
const SIT_HOLD = {torso: 3, head: 16, turn: 0.05, aA: [-16, -108], aB: [16, 108], lA: [6, -6, 0.32], lB: [-6, 6, 0.32], hip: [0, 330]};

const pauloState = (t) => {
  // posição x, pose, expressão
  let x = 640, pose = STAND, e = {smile: 0.1};
  if (t < 12.6) {
    x = mix(1300, 600, P(t, 11.9, 12.55, EO));
    pose = lerpPose(STAND, REACH, P(t, 12.15, 12.5, EO));
    e = {smile: -0.1, brow: 0.4, worry: 1, open: 0.2};
  } else if (t < 14.5) {
    x = 600;
    pose = lerpPose(REACH, RELIEF, P(t, 12.75, 13.3, EIO));
    e = {smile: mix(-0.1, 0.55, P(t, 12.9, 13.5)), brow: 0.2, blink: t > 13.55 && t < 13.7 ? 1 : 0};
  } else {
    x = mix(600, 640, P(t, 14.5, 15.1, EIO));
    pose = lerpPose(RELIEF, REACH_R, P(t, 15.0, 15.8, EIO));
    if (t > 16.1) pose = lerpPose(REACH_R, HOLD, P(t, 16.1, 16.95, EIO));
    const soft = P(t, 17.6, 18.7, EIO);
    e = {smile: mix(0.2, 0.6, soft), brow: mix(0, 0.35, soft), look: [mix(0.5, 0, P(t, 16.1, 16.7)), mix(0.6, 1, P(t, 16.1, 16.9))], blink: (t > 18.45 && t < 18.7) ? 0.85 : mix(0, 0.4, soft)};
    if (t < 16.1) e = {smile: 0.15, look: [0.9, 0.7], brow: P(t, 15.6, 16.0) * 0.4};
  }
  return {x, pose, e};
};

export const SceneOld = ({t}) => {
  const cam = KO(t, [
    [0, {x: 300, y: 700, z: 1.55}],
    [2.4, {x: 470, y: 860, z: 1.12}],
    [5.3, {x: 560, y: 950, z: 1.0}],
    [11.8, {x: 580, y: 980, z: 1.02}],
    [12.6, {x: 520, y: 1040, z: 1.12}],
    [14.4, {x: 560, y: 1080, z: 1.18}],
    [15.4, {x: 720, y: 1100, z: 1.12}],
    [17.4, {x: 650, y: 1060, z: 1.3}],
    [18.9, {x: 640, y: 1030, z: 1.7}],
  ], ES);
  // mergulho no álbum (19.0 -> 19.5)
  const ps = pauloState(t);
  const dive = P(t, 19.0, 19.55, EI);
  const stackSway = t > 10.3 && t < 12.5 ? Math.sin((t - 10.3) * 7) * mix(0, 4.5, P(t, 10.3, 11.6)) * (1 - P(t, 12.3, 12.5)) : 0;
  const albumW = 250;
  const sc = 0.95;
  const holdAlbum = t > 16.0;
  return (
    <AbsoluteFill>
      <Stage bg="#1b2238">
        <Cam c={{x: mix(cam.x, ps.x, dive), y: mix(cam.y, 1600 - 545 * sc, dive), z: cam.z * (1 + dive * 3.4)}}>
          <OldRoom t={t} />
          {/* pilha de caixas (balança antes de Paulo segurar) */}
          <g transform={`rotate(${stackSway} 230 1480)`}>
            <BoxA t={t} x={70} y={1270} w={310} h={210} at={5.8} seed={1} />
            <g transform={`rotate(${stackSway * 0.6} 230 1270)`}>
              <BoxA t={t} x={100} y={1080} w={270} h={190} at={6.0} seed={2} />
              <g transform={`rotate(${stackSway * 0.9} 230 1080)`}>
                <BoxA t={t} x={130} y={910} w={220} h={170} at={6.2} seed={3} fragile />
              </g>
            </g>
          </g>
          {/* pilha à direita: caixa aberta no topo, onde está o álbum */}
          <BoxA t={t} x={800} y={1340} w={300} h={260} at={6.3} seed={4} />
          <BoxA t={t} x={825} y={1170} w={250} h={170} at={6.5} seed={5} open={P(t, 14.7, 15.3, EO)} />
          {!holdAlbum && t > 14.9 && <AlbumClosed x={955} y={1150 - P(t, 15.6, 16.0, EO) * 40} w={190} h={150} rot={-6} />}
          <Character c={PAULO} x={ps.x} y={1600} s={sc} pose={ps.pose} e={ps.e} holdUnder={holdAlbum}
            hold={holdAlbum ? (hp) => (
              <g transform={`translate(${hp[0]} ${hp[1] - 10})`}>
                <AlbumClosed x={mix(290, 0, P(t, 16.1, 16.95, EIO))} y={mix(-60, -20, P(t, 16.1, 16.95, EIO))} w={mix(200, albumW, P(t, 16.1, 16.9))} h={mix(160, albumW * 0.8, P(t, 16.1, 16.9))} rot={mix(-6, -2, P(t, 16.1, 16.9))} />
              </g>
            ) : undefined}
          />
          {/* caixa desfocada em primeiro plano */}
          <g filter="url(#blur14)" opacity={0.95}>
            <Box x={900} y={1700} w={420} h={300} seed={6} />
          </g>
        </Cam>
        {/* luz quente e partículas no momento do álbum */}
        <rect width="1080" height="1920" fill="#FFB866" opacity={0.10 * P(t, 17.8, 18.8)} style={{mixBlendMode: "soft-light"}} />
        {t > 17.5 && Array.from({length: 26}, (_, i) => {
          const px = (i * 173) % 1080, py = (i * 397) % 1920 - ((t - 17.5) * (14 + (i % 5) * 6));
          return <circle key={i} cx={px + Math.sin(t + i) * 12} cy={((py % 1920) + 1920) % 1920} r={1.5 + (i % 3)} fill="#FFE2B0" opacity={0.35 * P(t, 17.6, 18.4)} />;
        })}
      </Stage>
      <Notepad t={t} />
      <Caption t={t} y={220} size={60} out={2.45} lines={[
        L("Eu sei que você está", [0, 0.26, 0.5, 0.68, 0.94], {weight: 700, size: 58}),
        L("pensando em *se mudar.*", [1.1, 1.54, 1.72, 1.88], {size: 74, weight: 900}),
      ]} />
      <Caption t={t} y={230} size={66} out={5.5} lines={[
        L("E só de imaginar,", [2.64, 2.9, 3.1, 3.28], {weight: 700, size: 58}),
        L("já vem *aquela* *lista.*", [3.72, 4.12, 4.38, 4.72], {size: 78, weight: 900}),
      ]} />
      <NameSuper t={t} at={13.3} x={120} y={330} name="Paulo" sub="Esse aqui é o" />
    </AbsoluteFill>
  );
};

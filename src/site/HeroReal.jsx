// Abertura do site (Remotion): o cuidado (gesto real com papel, vídeo 04) → a revelação
// (a borda branca do papel revela o branco do baú do caminhão real) → a rota (a faixa azul
// pintada na cabine se prolonga para fora da foto e desenha o caminho até um novo endereço).
// Quadro 1080x1440 (3:4), usado no celular (topo da tela) e no desktop (painel à direita).
import React from "react";
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing} from "remotion";

const EIO = Easing.bezier(0.65, 0, 0.35, 1);
const EO = Easing.bezier(0.16, 1, 0.3, 1);
const EH = Easing.bezier(0.33, 0, 0.12, 1);
const ip = (t, a, b, f = 0, to = 1, ez = EIO) => interpolate(t, [a, b], [f, to], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ez});
const cl = (v) => Math.max(0, Math.min(1, v));

export const HERO3_T = 7.5;
// foto original do caminhão (coordenadas em pixels da foto 2340x4160)
const PW = 2340, PH = 4160;
const S0 = 1080 / PW;               // enquadramento final: largura inteira
const FINAL = {fx: 1170, fy: 1040 + 1440 / S0 / 2}; // janela y 1040..4160
const BOX = {fx: 1060, fy: 1905};   // branco do painel do baú ("Servir a Deus…")
// faixa azul da cabine: termina perto de x≈1145; perto da ponta: borda sup. y≈2710 / inf. y≈2814 em x=1100,
// inclinação ~22°, espessura ~92 px. A rota começa por dentro da tinta, na mesma direção e espessura.
const ROUTE = "M 1088 2756 L 1146 2780 C 1196 2802 1206 2890 1196 3020 C 1186 3170 1400 3330 1960 3384";
const PIN = [1960, 3384];

export const HeroReal = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;

  // 1) o cuidado
  const push = ip(t, 0, 2.6, 1, 1.07, (x) => x);
  // 2) a revelação: borda do papel sobe pela tela
  const edge = ip(t, 2.15, 3.35, 1560, -360, EIO);
  const tilt = -0.2; // inclinação da dobra (y sobe para a direita)
  const poly = `polygon(0 0, 100% 0, 100% ${edge + tilt * 1080}px, 0 ${edge}px)`;
  // câmera sobre a foto: do branco do baú ao caminhão inteiro
  const z = ip(t, 2.3, 4.55, 2.7, 1, EH);
  const fx = ip(t, 2.3, 4.55, BOX.fx, FINAL.fx, EH);
  const fy = ip(t, 2.3, 4.55, BOX.fy, FINAL.fy, EH);
  const s = S0 * z;
  // 3) a rota
  const paint = ip(t, 4.55, 6.45, 0, 1, EH);
  const glowIn = ip(t, 4.9, 5.6);
  const pin = ip(t, 6.25, 6.75, 0, 1, EO);
  const ring = ip(t, 6.5, 7.4, 0, 1, EO);
  // ponta da linha (aproximação: segue a fração percorrida)
  return (
    <AbsoluteFill style={{background: "#0B1B3F", overflow: "hidden"}}>
      {/* caminhão real + rota (mesmas coordenadas da foto) */}
      <svg width={1080} height={1440} viewBox="0 0 1080 1440" style={{position: "absolute", inset: 0}}>
        <defs>
          <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A4FB4" /><stop offset="0.5" stopColor="#2C4AAE" /><stop offset="1" stopColor="#3A4DA8" /></linearGradient>
          <linearGradient id="ramp" gradientUnits="userSpaceOnUse" x1="1150" y1="0" x2="1260" y2="0"><stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#fff" /></linearGradient>
          <mask id="after" maskUnits="userSpaceOnUse" x="0" y="0" width={PW} height={PH}><rect x="0" y="0" width={PW} height={PH} fill="url(#ramp)" /></mask>
          <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></radialGradient>
        </defs>
        <g transform={`translate(540 720) scale(${s}) translate(${-fx} ${-fy})`}>
          <image href={staticFile("diego/caminhao_rua.jpg")} x={0} y={0} width={PW} height={PH} preserveAspectRatio="none" />
          {/* a tinta se prolonga: mesma cor, direção e espessura */}
          <path d={ROUTE} fill="none" stroke="url(#paint)" strokeWidth={92} strokeLinecap="butt" strokeLinejoin="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - paint} />
          {/* ...e ganha movimento próprio: brilho e núcleo claro só depois da junção */}
          <g mask="url(#after)" opacity={glowIn}>
            <path d={ROUTE} fill="none" stroke="#22C7F5" strokeWidth={92} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - paint} opacity={0.55} style={{filter: "blur(18px)"}} />
            <path d={ROUTE} fill="none" stroke="#1F5BFF" strokeWidth={92} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - paint} />
            <path d={ROUTE} fill="none" stroke="#9BEBFF" strokeWidth={30} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - paint} />
            <path d={ROUTE} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - paint} />
          </g>
          {/* novo endereço */}
          <g transform={`translate(${PIN[0]} ${PIN[1]})`}>
            <ellipse cx={0} cy={0} rx={150 * ring} ry={52 * ring} fill="none" stroke="#9BEBFF" strokeWidth={8} opacity={(1 - ring) * 0.9} />
            <ellipse cx={0} cy={0} rx={90} ry={30} fill="#1F5BFF" opacity={0.45 * pin} style={{filter: "blur(10px)"}} />
            <g transform={`translate(0 ${-(1 - pin) * 160}) scale(${0.4 + 0.6 * pin})`} opacity={cl(pin * 3)}>
              <path d="M0 0 C 0 0 -78 -86 -78 -146 A 78 78 0 1 1 78 -146 C 78 -86 0 0 0 0 Z" fill="#1F5BFF" stroke="#fff" strokeWidth={10} style={{filter: "drop-shadow(0 18px 24px rgba(0,0,0,.45))"}} />
              <circle cx={0} cy={-146} r={40} fill="#fff" />
              <path d="M-22 -140 L0 -160 L22 -140 M-15 -146 V -124 H 15 V -146" fill="none" stroke="#1F5BFF" strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </g>
        </g>
        <rect x={0} y={0} width={1080} height={1440} fill="url(#vig)" />
      </svg>

      {/* o cuidado: vídeo real (corte acima da legenda gravada no post) */}
      {t < 3.45 && (
        <AbsoluteFill style={{clipPath: t > 2.15 ? poly : undefined}}>
          <div style={{position: "absolute", left: 0, top: 0, width: 1080, height: 1440, transform: `scale(${push})`, transformOrigin: "52% 78%"}}>
            <Sequence from={0}>
              <OffthreadVideo src={staticFile("diego/ig04.mp4")} startFrom={Math.round(35.3 * fps)} muted style={{position: "absolute", left: 0, top: -30 * 2.25, width: 1080, height: 854 * 2.25, filter: "contrast(1.05) saturate(1.04)"}} />
            </Sequence>
          </div>
        </AbsoluteFill>
      )}
      {/* a dobra branca do papel conduz a revelação */}
      {t > 2.15 && t < 3.45 && (
        <svg width={1080} height={1440} style={{position: "absolute", inset: 0, overflow: "visible"}}>
          <defs><linearGradient id="fold" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.55" stopColor="#fff" stopOpacity="0.95" /><stop offset="1" stopColor="#F3F4F2" stopOpacity="1" /></linearGradient></defs>
          <path d={`M -20 ${edge + 6} L 1100 ${edge + tilt * 1080 + 6} L 1100 ${edge + tilt * 1080 + 120} L -20 ${edge + 120} Z`} fill="url(#fold)" />
          <path d={`M -20 ${edge} L 1100 ${edge + tilt * 1080}`} stroke="#fff" strokeWidth={10} style={{filter: "drop-shadow(0 -10px 18px rgba(0,0,0,.28))"}} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

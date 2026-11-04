import React from "react";
import {staticFile} from "remotion";
import {cl, mix} from "./lib";

const WM = {w: 555, h: 254}; // proporção do lettering

// ---------- caixa de papelão (vista 3/4 frontal, topo visível) ----------
// w,h = frente; d = profundidade aparente do topo; open 0..1 (abas abertas); tape: fita; label: etiqueta FRÁGIL
export const Box = ({x, y, w = 260, h = 200, d = 70, open = 0, tape = 1, fragile = false, rot = 0, light = 0, seed = 0}) => {
  const id = `bx${seed}`;
  const fl = open; // abas
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D9A46A" /><stop offset="1" stopColor="#B57E46" />
        </linearGradient>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9BE86" /><stop offset="1" stopColor="#D6A66C" />
        </linearGradient>
      </defs>
      {/* sombra */}
      <ellipse cx={w / 2 + 10} cy={h + 6} rx={w * 0.62} ry={16} fill="#000" opacity={0.28} filter="url(#softShadow)" />
      {/* lateral (profundidade à direita) */}
      <path d={`M ${w} 0 L ${w + d * 0.55} ${-d * 0.5} L ${w + d * 0.55} ${h - d * 0.5} L ${w} ${h} Z`} fill="#9C6935" />
      {/* frente */}
      <rect x={0} y={0} width={w} height={h} fill={`url(#${id}f)`} />
      {/* ondulação/textura */}
      <rect x={0} y={0} width={w} height={h} fill="url(#kraftTex)" opacity={0.35} />
      {/* topo */}
      {fl < 0.02 ? (
        <path d={`M 0 0 L ${d * 0.55} ${-d * 0.5} L ${w + d * 0.55} ${-d * 0.5} L ${w} 0 Z`} fill={`url(#${id}t)`} />
      ) : (
        <g>
          <path d={`M 0 0 L ${d * 0.55} ${-d * 0.5} L ${w + d * 0.55} ${-d * 0.5} L ${w} 0 Z`} fill="#5B3D20" />
          {/* aba frontal caindo para frente */}
          <path d={`M 0 0 L ${w} 0 L ${w - 6} ${-d * 0.5 * (1 - fl) + 50 * fl * 0.2} L 6 ${-d * 0.5 * (1 - fl) + 50 * fl * 0.2} Z`} fill="#C99460" />
          {/* aba traseira levantada */}
          <path d={`M ${d * 0.55} ${-d * 0.5} L ${w + d * 0.55} ${-d * 0.5} L ${w + d * 0.55 - 4} ${-d * 0.5 - 70 * fl} L ${d * 0.55 + 4} ${-d * 0.5 - 70 * fl} Z`} fill="#E3B27A" />
          {/* abas laterais */}
          <path d={`M 0 0 L ${d * 0.55} ${-d * 0.5} L ${-50 * fl} ${-d * 0.5 - 30 * fl} L ${-50 * fl} ${-10 * fl} Z`} fill="#D9A46A" />
          <path d={`M ${w} 0 L ${w + d * 0.55} ${-d * 0.5} L ${w + d * 0.55 + 55 * fl} ${-d * 0.5 - 26 * fl} L ${w + 55 * fl} ${-6 * fl} Z`} fill="#B98149" />
        </g>
      )}
      {/* fita */}
      {tape > 0 && fl < 0.02 && (
        <g opacity={0.9}>
          <path d={`M ${w / 2 - 22} 0 L ${w / 2 - 22 + d * 0.55} ${-d * 0.5} L ${w / 2 + 22 + d * 0.55} ${-d * 0.5} L ${w / 2 + 22} 0 Z`} fill="#E8D2A8" opacity={0.85} />
          <rect x={w / 2 - 22} y={0} width={44} height={h * 0.32 * tape} fill="#E8D2A8" opacity={0.75} />
        </g>
      )}
      {fragile && (
        <g transform={`translate(${w * 0.12} ${h * 0.5})`}>
          <rect width={w * 0.76} height={42} fill="#F5F0E6" />
          <rect width={w * 0.76} height={42} fill="none" stroke="#C0262D" strokeWidth={3} />
          <text x={w * 0.38} y={29} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={24} fill="#C0262D" letterSpacing="2">FRÁGIL</text>
          <path d="M 14 8 L 30 8 L 27 20 Q 22 26 17 20 Z M 22 23 L 22 34 M 16 34 L 28 34" stroke="#C0262D" strokeWidth={2.4} fill="none" />
        </g>
      )}
      {/* sombra de luz */}
      {light !== 0 && <rect x={0} y={0} width={w} height={h} fill={light > 0 ? "#FFD9A0" : "#000"} opacity={Math.abs(light) * 0.3} />}
    </g>
  );
};

// ---------- álbum de família ----------
export const ALBUM = {cover: "#7B3B22", coverH: "#9C5232", coverS: "#5A2914", gold: "#E2B45E"};
export const AlbumClosed = ({x, y, w = 300, h = 240, rot = 0, persp = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) skewY(${persp})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={10} fill="#000" opacity={0.35} filter="url(#softShadow)" />
    {/* páginas (borda) */}
    <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 8} height={h - 6} rx={6} fill="#F1E6D2" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={ALBUM.cover} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="url(#leatherTex)" opacity={0.5} />
    <rect x={-w / 2} y={-h / 2} width={w * 0.12} height={h} rx={8} fill={ALBUM.coverS} />
    <rect x={-w / 2 + w * 0.17} y={-h / 2 + 16} width={w * 0.76} height={h - 32} rx={6} fill="none" stroke={ALBUM.gold} strokeWidth={2.4} strokeDasharray="7 5" opacity={0.85} />
    <text x={w * 0.05} y={8} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={800} fontSize={h * 0.13} fill={ALBUM.gold}>Nossa Família</text>
    <path d={`M ${-w * 0.2} ${h * 0.12} L ${w * 0.3} ${h * 0.12}`} stroke={ALBUM.gold} strokeWidth={2} opacity={0.7} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.45} rx={10} fill="#fff" opacity={0.07} />
  </g>
);

// ---------- foto (moldura branca) ----------
export const Photo = ({x, y, w, h, rot = 0, children, id, corners = true}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 4} y={-h / 2 + 8} width={w} height={h} fill="#000" opacity={0.25} filter="url(#softShadow)" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#FBF8F1" />
    <svg x={-w / 2 + w * 0.05} y={-h / 2 + w * 0.05} width={w * 0.9} height={h - w * 0.1} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      {children}
      <rect width="400" height="300" fill="url(#photoTone)" opacity={0.35} />
    </svg>
    {corners && [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
      <path key={i} d={`M ${sx * w / 2} ${sy * h / 2} l ${-sx * 34} 0 l ${sx * 34} ${-sy * 34} Z`} fill="#3A2A20" opacity={0.85} />
    ))}
  </g>
);

// ---------- sofá ----------
export const Sofa = ({x, y, w = 560, col = "#8A8F99", colS = "#6E737D", covered = 0, coverLogo = true}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={6} rx={w * 0.55} ry={22} fill="#000" opacity={0.3} filter="url(#softShadow)" />
    {/* encosto */}
    <rect x={-w / 2 + 30} y={-250} width={w - 60} height={150} rx={40} fill={colS} />
    {/* assento */}
    <rect x={-w / 2 + 40} y={-130} width={w - 80} height={90} rx={26} fill={col} />
    <path d={`M 0 -128 L 0 -44`} stroke={colS} strokeWidth={4} />
    {/* braços */}
    <rect x={-w / 2} y={-190} width={80} height={170} rx={36} fill={col} />
    <rect x={w / 2 - 80} y={-190} width={80} height={170} rx={36} fill={colS} />
    {/* base */}
    <rect x={-w / 2 + 10} y={-50} width={w - 20} height={44} rx={14} fill={colS} />
    <rect x={-w / 2 + 40} y={-8} width={16} height={14} fill="#3A2A1E" /><rect x={w / 2 - 56} y={-8} width={16} height={14} fill="#3A2A1E" />
    {/* almofadas */}
    <rect x={-w / 2 + 70} y={-210} width={110} height={90} rx={24} fill="#D69A36" transform="rotate(-8)" opacity={1 - covered} />
    {covered > 0 && <QuiltCover x={-w / 2 - 10} y={-262} w={w + 20} h={262} p={covered} logo={coverLogo} r={44} />}
  </g>
);

// ---------- capa acolchoada azul Diego (com marca) ----------
// p: 0..1 cobertura (desce de cima para baixo)
export const QuiltCover = ({x, y, w, h, p = 1, logo = true, r = 30, logoScale = 0.42, shade = 0}) => {
  const hh = h * cl(p);
  const id = `qc${Math.round(x)}_${Math.round(y)}_${Math.round(w)}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}><rect x={0} y={0} width={w} height={hh + 12} rx={r} /></clipPath>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#2A6FE8" /><stop offset="0.5" stopColor="#1A56C8" /><stop offset="1" stopColor="#123F9C" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={0} y={0} width={w} height={h + 20} rx={r} fill={`url(#${id}g)`} />
        <rect x={0} y={0} width={w} height={h + 20} fill="url(#quiltTex)" />
        {logo && (
          <g transform={`translate(${w / 2} ${h * 0.46})`}>
            <image href={staticFile("brand/wordmark_white.png")} x={(-w * logoScale) / 2} y={(-w * logoScale * WM.h) / WM.w / 2} width={w * logoScale} height={(w * logoScale * WM.h) / WM.w} opacity={0.92} />
          </g>
        )}
        {/* volume */}
        <rect x={0} y={0} width={w} height={h + 20} fill="url(#quiltShade)" />
        {shade !== 0 && <rect x={0} y={0} width={w} height={h + 20} fill="#000" opacity={shade} />}
      </g>
      {/* barra com debrum */}
      <path d={`M ${6} ${hh} Q ${w / 2} ${hh + 14} ${w - 6} ${hh}`} stroke="#0D2F78" strokeWidth={10} fill="none" strokeLinecap="round" opacity={p < 1 ? 1 : 0.8} />
    </g>
  );
};

// ---------- geladeira (envolta) ----------
export const Fridge = ({x, y, w = 230, h = 520, cover = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={w * 0.6} ry={16} fill="#000" opacity={0.3} filter="url(#softShadow)" />
    <rect x={-w / 2} y={-h} width={w} height={h} rx={18} fill="#E7EAEE" />
    <rect x={-w / 2} y={-h} width={w} height={h} rx={18} fill="url(#steelShade)" />
    <path d={`M ${-w / 2} ${-h * 0.62} L ${w / 2} ${-h * 0.62}`} stroke="#B9BEC6" strokeWidth={4} />
    <rect x={w / 2 - 34} y={-h * 0.9} width={10} height={90} rx={5} fill="#9AA0AA" />
    <rect x={w / 2 - 34} y={-h * 0.55} width={10} height={120} rx={5} fill="#9AA0AA" />
    {cover > 0 && <QuiltCover x={-w / 2 - 8} y={-h - 8} w={w + 16} h={h + 8} p={cover} r={22} logoScale={0.7} />}
  </g>
);

// ---------- luminária de piso ----------
export const FloorLamp = ({x, y, on = 1}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={2} rx={70} ry={12} fill="#000" opacity={0.3} filter="url(#softShadow)" />
    <rect x={-40} y={-10} width={80} height={12} rx={6} fill="#2A2522" />
    <rect x={-5} y={-560} width={10} height={552} fill="#2A2522" />
    <path d="M -90 -560 L 90 -560 L 60 -690 L -60 -690 Z" fill="#F3E2C4" />
    <path d="M -90 -560 L 90 -560 L 60 -690 L -60 -690 Z" fill="url(#shadeGlow)" opacity={on} />
    <ellipse cx={0} cy={-560} rx={90} ry={10} fill="#FFE9B8" opacity={on} />
  </g>
);

// ---------- planta ----------
export const Plant = ({x, y, s = 1, sway = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={70} ry={12} fill="#000" opacity={0.3} filter="url(#softShadow)" />
    <path d="M -55 -120 L 55 -120 L 42 0 L -42 0 Z" fill="#E8E2D8" />
    <path d="M -55 -120 L 55 -120 L 52 -96 L -52 -96 Z" fill="#D4CCBF" />
    <g transform={`rotate(${sway} 0 -120)`}>
      {[[-70, -320, -30], [-20, -380, -8], [40, -340, 18], [80, -260, 34], [-90, -230, -44], [10, -300, 4]].map(([lx, ly, a], i) => (
        <g key={i} transform={`translate(0 -120) rotate(${a})`}>
          <path d={`M 0 0 C ${lx * 0.2} ${ly * 0.4}, ${lx * 0.6} ${ly * 0.7}, ${lx * 0.3} ${ly + 120}`} stroke="#2F6B3A" strokeWidth={6} fill="none" />
          <path d={`M ${lx * 0.3} ${ly + 120} C ${lx * 0.3 - 60} ${ly + 160}, ${lx * 0.3 - 30} ${ly + 60}, ${lx * 0.3} ${ly + 20} C ${lx * 0.3 + 30} ${ly + 60}, ${lx * 0.3 + 60} ${ly + 160}, ${lx * 0.3} ${ly + 120} Z`} fill={i % 2 ? "#3F8A4B" : "#2F7440"} />
        </g>
      ))}
    </g>
  </g>
);

// ---------- quadro na parede ----------
export const Frame = ({x, y, w, h, children, ghost = false}) => (
  ghost
    ? <rect x={x} y={y} width={w} height={h} fill="#fff" opacity={0.08} />
    : (
      <g>
        <rect x={x + 6} y={y + 10} width={w} height={h} fill="#000" opacity={0.3} filter="url(#softShadow)" />
        <rect x={x} y={y} width={w} height={h} fill="#2B2420" />
        <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} fill="#F4EEE4" />
        <svg x={x + 26} y={y + 26} width={w - 52} height={h - 52} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">{children}</svg>
      </g>
    )
);

// ---------- defs globais (texturas, sombras) ----------
export const WorldDefs = () => (
  <svg width="0" height="0" style={{position: "absolute"}}>
    <defs>
      <filter id="softShadow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="10" /></filter>
      <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
      <filter id="blur14"><feGaussianBlur stdDeviation="14" /></filter>
      <pattern id="kraftTex" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 0 5 L 10 5" stroke="#8A5A2A" strokeWidth="0.8" opacity="0.5" /></pattern>
      <pattern id="leatherTex" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#000" opacity="0.25" /><circle cx="6" cy="6" r="0.8" fill="#fff" opacity="0.08" /></pattern>
      <pattern id="quiltTex" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="44" height="44" fill="none" />
        <path d="M 0 0 L 44 0 M 0 0 L 0 44" stroke="#0B2F7E" strokeWidth="2.4" opacity="0.55" strokeDasharray="5 3" />
        <rect x="3" y="3" width="38" height="38" rx="10" fill="#fff" opacity="0.06" />
      </pattern>
      <linearGradient id="quiltShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.16" /><stop offset="0.4" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.28" />
      </linearGradient>
      <linearGradient id="steelShade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.18" />
      </linearGradient>
      <radialGradient id="shadeGlow" cx="0.5" cy="1" r="0.9"><stop offset="0" stopColor="#FFF4D6" /><stop offset="1" stopColor="#F6C978" /></radialGradient>
      <linearGradient id="photoTone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD9A0" /><stop offset="1" stopColor="#B9785A" /></linearGradient>
    </defs>
  </svg>
);

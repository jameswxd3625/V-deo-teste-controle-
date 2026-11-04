import React from "react";
import {C} from "./parts";

const Defs = () => (
  <defs>
    <linearGradient id="bl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4d8dff" /><stop offset="1" stopColor="#0a3bb0" /></linearGradient>
    <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe38a" /><stop offset="1" stopColor="#e08f08" /></linearGradient>
  </defs>
);
const Svg = ({size, children, style}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: "visible", ...style}}><Defs />{children}</svg>
);

// ícone azul volumétrico com moeda e setas douradas
export const CoinArrows = ({size = 420, f = 0}) => (
  <Svg size={size} style={{filter: "drop-shadow(0 24px 30px rgba(10,40,120,0.4))"}}>
    <rect x="12" y="20" width="176" height="176" rx="44" fill="#06236f" />
    <rect x="12" y="8" width="176" height="176" rx="44" fill="url(#bl)" />
    <rect x="22" y="14" width="156" height="70" rx="34" fill="rgba(255,255,255,0.18)" />
    <g transform={`rotate(${f * 2} 100 96)`}>
      <path d="M40 96a60 60 0 0 1 100-44" fill="none" stroke="url(#gd)" strokeWidth="13" strokeLinecap="round" />
      <path d="M160 96a60 60 0 0 1-100 44" fill="none" stroke="url(#gd)" strokeWidth="13" strokeLinecap="round" />
      <path d="M128 36l24 12-8 26z" fill="url(#gd)" />
      <path d="M72 156l-24-12 8-26z" fill="url(#gd)" />
    </g>
    <circle cx="100" cy="96" r="34" fill="url(#gd)" stroke="#fff3c0" strokeWidth="4" />
    <text x="100" y="110" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="44" fill="#fff8e0">$</text>
  </Svg>
);

const W = {fill: "none", stroke: "#fff", strokeWidth: 9, strokeLinecap: "round", strokeLinejoin: "round"};
export const IconTech = ({size = 150}) => (
  <Svg size={size}><circle cx="100" cy="100" r="30" {...W} />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <g key={a} transform={`rotate(${a} 100 100)`}><path d="M100 70V30" {...W} /><circle cx="100" cy="24" r="8" fill="#fff" /></g>)}<circle cx="100" cy="100" r="10" fill="#fff" /></Svg>
);
export const IconAI = ({size = 150}) => (
  <Svg size={size}><path d="M100 30c-30 0-52 20-52 48 0 14 6 24 14 32v32h46c26 0 44-18 44-44 0-36-24-68-52-68z" {...W} /><path d="M78 80h24M90 100h30M100 62v22" {...W} /><circle cx="120" cy="80" r="7" fill="#fff" /><circle cx="78" cy="80" r="7" fill="#fff" /></Svg>
);
export const IconChart = ({size = 150}) => (
  <Svg size={size}><path d="M30 170V30M30 170h150" {...W} /><path d="M60 140l30-34 30 18 44-64" {...W} stroke={C.gold} /><path d="M154 60h14v14" {...W} stroke={C.gold} /><path d="M60 160v-14M100 160v-24M140 160v-34" {...W} strokeWidth="14" /></Svg>
);
export const Check = ({size = 150, rot = 0}) => (
  <Svg size={size} style={{transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 14px 14px rgba(0,10,60,0.45))"}}><path d="M26 108l46 46L176 40" fill="none" stroke="#9a5a05" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 10)" /><path d="M26 108l46 46L176 40" fill="none" stroke="url(#gd)" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" /></Svg>
);
export const Building = ({size = 330}) => (
  <Svg size={size} style={{filter: "drop-shadow(0 18px 20px rgba(10,40,120,0.35))"}}>
    <rect x="40" y="40" width="80" height="150" rx="6" fill="url(#bl)" /><rect x="110" y="84" width="54" height="106" rx="6" fill="#0a2a8a" />
    {[0, 1, 2, 3].map((r) => [0, 1].map((c) => <rect key={r + "" + c} x={54 + c * 34} y={54 + r * 32} width="20" height="20" rx="3" fill="#fff" opacity="0.95" />))}
    {[0, 1, 2].map((r) => <rect key={r} x="126" y={98 + r * 30} width="22" height="18" rx="3" fill="#cfe0ff" />)}
  </Svg>
);
export const Gear = ({size = 420, rot = 0}) => (
  <Svg size={size} style={{transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 18px 20px rgba(10,40,120,0.35))"}}>
    {Array.from({length: 10}).map((_, i) => <rect key={i} x="86" y="6" width="28" height="44" rx="6" fill="url(#bl)" transform={`rotate(${i * 36} 100 100)`} />)}
    <circle cx="100" cy="100" r="74" fill="url(#bl)" /><circle cx="100" cy="100" r="34" fill="#f1f5fc" />
  </Svg>
);
export const Hammer = ({size = 560, rot = 0}) => (
  <Svg size={size} style={{transform: `rotate(${rot}deg)`, transformOrigin: "30% 70%", filter: "drop-shadow(0 22px 24px rgba(0,10,60,0.5))"}}>
    <rect x="86" y="70" width="22" height="120" rx="8" fill="#a8620a" transform="rotate(35 100 100)" /><rect x="80" y="64" width="22" height="120" rx="8" fill="url(#gd)" transform="rotate(35 100 100)" />
    <rect x="30" y="30" width="110" height="52" rx="12" fill="#a8620a" transform="rotate(35 100 100) translate(8 10)" /><rect x="30" y="30" width="110" height="52" rx="12" fill="url(#gd)" transform="rotate(35 100 100)" /><rect x="40" y="36" width="90" height="14" rx="7" fill="rgba(255,255,255,0.45)" transform="rotate(35 100 100)" />
  </Svg>
);
export const GavelBase = ({w = 640}) => (
  <svg width={w} height={w * 0.3} viewBox="0 0 400 120" style={{filter: "drop-shadow(0 18px 20px rgba(0,10,60,0.5))"}}><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe38a" /><stop offset="1" stopColor="#c47a05" /></linearGradient></defs><ellipse cx="200" cy="86" rx="190" ry="30" fill="#8a4f05" /><ellipse cx="200" cy="70" rx="190" ry="32" fill="url(#gb)" /><ellipse cx="200" cy="64" rx="120" ry="16" fill="rgba(255,255,255,0.3)" /></svg>
);

// ---------- personagem preocupado (ilustração vetorial, estilo 3D simplificado) ----------
export const Man = ({size = 900, f = 0}) => {
  const sway = Math.sin(f / 14) * 2;
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 600 660" style={{overflow: "visible", filter: "drop-shadow(0 30px 30px rgba(0,10,60,0.45))"}}>
      <defs>
        <linearGradient id="sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd2a6" /><stop offset="1" stopColor="#e0a070" /></linearGradient>
        <linearGradient id="ty" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd84a" /><stop offset="1" stopColor="#e5a000" /></linearGradient>
      </defs>
      <g transform={`rotate(${sway} 300 640)`}>
        <path d="M110 660c0-130 40-200 190-200s190 70 190 200z" fill="url(#ty)" />
        <path d="M230 462c20 30 120 30 140 0" fill="none" stroke="#c98a00" strokeWidth="10" />
        <rect x="262" y="400" width="76" height="70" rx="26" fill="#d89a68" />
        <ellipse cx="300" cy="300" rx="112" ry="125" fill="url(#sk)" />
        <path d="M188 280c-6-90 60-140 118-140 70 0 112 56 106 130-30-40-80-60-130-56-40 4-76 28-94 66z" fill="#2a1a12" />
        <ellipse cx="190" cy="305" rx="14" ry="26" fill="#e0a070" /><ellipse cx="410" cy="305" rx="14" ry="26" fill="#e0a070" />
        <path d="M236 270l44 12M364 270l-44 12" stroke="#2a1a12" strokeWidth="10" strokeLinecap="round" />
        <circle cx="262" cy="305" r="9" fill="#2a1a12" /><circle cx="338" cy="305" r="9" fill="#2a1a12" />
        <path d="M262 372c24-18 52-18 76 0" fill="none" stroke="#8a3a2a" strokeWidth="9" strokeLinecap="round" />
        <path d="M390 190c10 14 6 30-2 40" stroke="#7fd0ff" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.85" />
        {/* braço direito: mão na testa */}
        <path d="M470 560c30-90 20-190-62-262" fill="none" stroke="url(#ty)" strokeWidth="76" strokeLinecap="round" />
        <circle cx="388" cy="236" r="40" fill="url(#sk)" />
        {/* braço esquerdo com papel de contas */}
        <path d="M130 570c-10-60 10-110 50-130" fill="none" stroke="url(#ty)" strokeWidth="70" strokeLinecap="round" />
        <g transform="rotate(-12 150 440)"><rect x="70" y="330" width="150" height="190" rx="10" fill="#fff" /><rect x="70" y="330" width="150" height="190" rx="10" fill="none" stroke="#c7d3ec" strokeWidth="4" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="90" y={356 + i * 28} width={i % 2 ? 90 : 110} height="9" rx="4" fill="#9fb2d8" />)}<text x="146" y="506" fontFamily="Inter" fontWeight="800" fontSize="22" fill="#d33">12%</text></g>
        <circle cx="180" cy="448" r="30" fill="url(#sk)" />
      </g>
    </svg>
  );
};

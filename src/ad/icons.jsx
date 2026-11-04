import React from "react";

// ícones de linha (viewBox 100), traço branco; p = progresso de desenho 0..1
const base = (s, children, sw = 7) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke="#fff" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{position: "relative", filter: "drop-shadow(0 3px 4px rgba(0,20,80,0.45))"}}>
    {children}
  </svg>
);

export const IcList = ({s = 64}) => base(s, <>
  <rect x="18" y="12" width="64" height="76" rx="10" />
  <path d="M32 34 l5 5 9-10" /><path d="M54 34h16" />
  <path d="M32 54 l5 5 9-10" /><path d="M54 54h16" />
  <path d="M32 74h38" />
</>);

export const IcPercentDoc = ({s = 64}) => base(s, <>
  <path d="M26 10h34l18 18v62H26z" /><path d="M60 10v18h18" />
  <circle cx="42" cy="50" r="5" /><circle cx="62" cy="72" r="5" /><path d="M64 46 40 76" />
</>);

export const IcFlow = ({s = 64}) => base(s, <>
  <rect x="10" y="14" width="28" height="22" rx="6" /><rect x="62" y="14" width="28" height="22" rx="6" />
  <rect x="36" y="64" width="28" height="22" rx="6" />
  <path d="M38 25h24" /><path d="M24 36v12h52V36" /><path d="M50 48v16" />
</>);

export const IcChip = ({s = 64}) => base(s, <>
  <rect x="26" y="26" width="48" height="48" rx="8" /><rect x="39" y="39" width="22" height="22" rx="3" />
  <path d="M38 26V12M50 26V12M62 26V12M38 88V74M50 88V74M62 88V74M26 38H12M26 50H12M26 62H12M88 38H74M88 50H74M88 62H74" />
</>);

export const IcAI = ({s = 64}) => base(s, <>
  <path d="M42 14c3 18 8 23 26 26-18 3-23 8-26 26-3-18-8-23-26-26 18-3 23-8 26-26z" />
  <path d="M74 56c1.6 9 4 11.5 13 13-9 1.5-11.4 4-13 13-1.6-9-4-11.5-13-13 9-1.5 11.4-4 13-13z" />
  <path d="M76 12v14M69 19h14" />
</>);

export const IcCalc = ({s = 64}) => base(s, <>
  <rect x="20" y="10" width="60" height="80" rx="10" /><rect x="31" y="21" width="38" height="16" rx="3" />
  <path d="M34 52h0M50 52h0M66 52h0M34 66h0M50 66h0M66 66h0M34 79h0M50 79h16" strokeWidth="9" />
</>);

export const IcBuilding = ({s = 64}) => base(s, <>
  <path d="M14 88h72" /><path d="M22 88V20l32-8v76" /><path d="M54 40l24 6v42" />
  <path d="M32 30h10M32 44h10M32 58h10M32 72h10M64 56h6M64 70h6" />
</>);

export const Check = ({s = 64, p = 1, color = "#fff", sw = 10}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" style={{position: "relative"}}>
    <path d="M24 52 L42 70 L78 32" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
  </svg>
);

// fachada de loja em traço com toldo, vitrine e porta (door: 0 fechada .. 1 aberta)
export const Storefront = ({w = 560, p = 1, door = 0, light = 0}) => {
  const d = (a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  const S = {pathLength: 1, strokeDasharray: 1};
  return (
    <svg width={w} height={w * 0.9} viewBox="0 0 200 180" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{overflow: "visible"}}>
      <defs>
        <linearGradient id="sfAw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f9bff" /><stop offset="1" stopColor="#0b45d6" /></linearGradient>
        <radialGradient id="sfL" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stopColor="#ffffff" /><stop offset="0.5" stopColor="#9cc8ff" /><stop offset="1" stopColor="#1a6cff" stopOpacity="0" /></radialGradient>
        <linearGradient id="sfB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(80,140,255,0.28)" /><stop offset="1" stopColor="rgba(10,30,100,0.35)" /></linearGradient>
      </defs>
      <path d="M22 62 V170 H178 V62" fill="url(#sfB)" fillOpacity={d(0.3, 0.7)} stroke="none" />
      {/* luz da porta */}
      <rect x="112" y="104" width="44" height="66" fill="url(#sfL)" opacity={light} />
      <g stroke="#eef3ff" strokeWidth="5">
        <path d="M10 170 H190" {...S} strokeDashoffset={1 - d(0, 0.35)} />
        <path d="M22 62 V170 M178 62 V170" {...S} strokeDashoffset={1 - d(0.05, 0.4)} />
        {/* vitrine */}
        <rect x="38" y="104" width="58" height="46" rx="4" {...S} strokeDashoffset={1 - d(0.35, 0.7)} />
        {/* batente */}
        <rect x="112" y="104" width="44" height="66" rx="3" {...S} strokeDashoffset={1 - d(0.4, 0.75)} />
      </g>
      {/* folha da porta (gira pela dobradiça esquerda) */}
      <g transform={`translate(112 0) scale(${1 - door * 0.82} 1) translate(-112 0)`} opacity={d(0.5, 0.8)}>
        <rect x="112" y="104" width="44" height="66" rx="3" fill="#0d3a9e" stroke="#eef3ff" strokeWidth="5" />
        <circle cx="148" cy="140" r="3.5" fill="#eef3ff" />
      </g>
      {/* toldo */}
      <g opacity={d(0.15, 0.55)} transform={`translate(0 ${(1 - d(0.15, 0.55)) * -14})`}>
        <path d="M14 30 H186 L192 62 H8 Z" fill="url(#sfAw)" stroke="#eef3ff" strokeWidth="5" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${8 + i * 30.7} 62 a15.35 15.35 0 0 0 30.7 0`} fill={i % 2 ? "#eef3ff" : "#1a6cff"} stroke="#eef3ff" strokeWidth="5" />
        ))}
      </g>
    </svg>
  );
};

// escudo com bisel prateado
export const Shield = ({w = 560, p = 1, fill = 1}) => (
  <svg width={w} height={w * 1.18} viewBox="0 0 100 118" fill="none" style={{overflow: "visible"}}>
    <defs>
      <linearGradient id="shS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor="#c9d2df" /><stop offset="0.55" stopColor="#8f9bb0" /><stop offset="1" stopColor="#e8edf5" /></linearGradient>
      <linearGradient id="shF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f6cff" stopOpacity="0.55" /><stop offset="1" stopColor="#04155a" stopOpacity="0.75" /></linearGradient>
    </defs>
    <path d="M50 4 L92 18 V58 C92 86 72 104 50 116 C28 104 8 86 8 58 V18 Z" fill="url(#shF)" fillOpacity={fill} />
    <path d="M50 4 L92 18 V58 C92 86 72 104 50 116 C28 104 8 86 8 58 V18 Z" stroke="url(#shS)" strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
    <path d="M50 12 L84 23.5 V58 C84 81 68 96 50 106.5 C32 96 16 81 16 58 V23.5 Z" stroke="rgba(160,200,255,0.45)" strokeWidth="1.2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
  </svg>
);

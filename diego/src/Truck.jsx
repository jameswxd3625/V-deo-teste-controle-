import React from "react";
import {staticFile} from "remotion";
import {cl, mix} from "./lib";

const WM = {w: 555, h: 254};
const LION = {w: 660, h: 880};

const Wheel = ({x, y, r = 74, spin = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#17181C" />
    <circle r={r * 0.86} fill="#24262C" />
    <circle r={r * 0.56} fill="#C9CED6" />
    <circle r={r * 0.56} fill="url(#rimShade)" />
    <g transform={`rotate(${spin})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.36} cy={Math.sin((a * Math.PI) / 180) * r * 0.36} r={r * 0.06} fill="#7D838E" />
      ))}
    </g>
    <circle r={r * 0.17} fill="#8D939E" />
  </g>
);

// ondas da marca (derivadas do selo): faixas marinho, azul, ciano e branco
export const BrandWaves = ({w, h, y0 = 0, amp = 1, id = "bw"}) => (
  <g>
    <defs>
      <linearGradient id={`${id}a`} x1="0" x2="1"><stop offset="0" stopColor="#0B1F5C" /><stop offset="1" stopColor="#1650D0" /></linearGradient>
      <linearGradient id={`${id}b`} x1="0" x2="1"><stop offset="0" stopColor="#1E6FF0" /><stop offset="1" stopColor="#27C0F5" /></linearGradient>
    </defs>
    <path d={`M 0 ${y0 + h * 0.55 * amp} C ${w * 0.3} ${y0 + h * 0.95 * amp}, ${w * 0.62} ${y0 + h * 0.2 * amp}, ${w} ${y0 - h * 0.15 * amp} L ${w} ${y0 + h} L 0 ${y0 + h} Z`} fill={`url(#${id}a)`} />
    <path d={`M 0 ${y0 + h * 0.72 * amp} C ${w * 0.32} ${y0 + h * 1.08 * amp}, ${w * 0.64} ${y0 + h * 0.38 * amp}, ${w} ${y0 + h * 0.05 * amp}`} stroke="#FFFFFF" strokeWidth={h * 0.07} fill="none" />
    <path d={`M 0 ${y0 + h * 0.84 * amp} C ${w * 0.34} ${y0 + h * 1.18 * amp}, ${w * 0.66} ${y0 + h * 0.52 * amp}, ${w} ${y0 + h * 0.2 * amp}`} stroke={`url(#${id}b)`} strokeWidth={h * 0.09} fill="none" />
  </g>
);

// caminhão baú em vista lateral, cabine à direita. Origem: chão, extremo traseiro.
// L = 1560 de comprimento; altura do baú até -720
export const Truck = ({x = 0, y = 0, s = 1, spin = 0, bounce = 0, light = 0, flip = 1}) => {
  const bx = 0, bw = 1080, bTop = -730, bBot = -170;
  const bh = bBot - bTop;
  const lw = bh * 0.86; // leão
  return (
    <g transform={`translate(${x} ${y + bounce}) scale(${s * flip} ${s})`}>
      <defs>
        <linearGradient id="boxSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E9EDF3" /></linearGradient>
        <linearGradient id="cabSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E3E7EE" /></linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7FA7D9" /><stop offset="0.5" stopColor="#2D4E7E" /><stop offset="1" stopColor="#14284A" /></linearGradient>
        <radialGradient id="rimShade" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity="0.7" /><stop offset="1" stopColor="#000" stopOpacity="0.25" /></radialGradient>
        <clipPath id="boxClip"><rect x={bx} y={bTop} width={bw} height={bh} rx={6} /></clipPath>
      </defs>
      {/* sombra no chão */}
      <ellipse cx={780} cy={6} rx={860} ry={30} fill="#000" opacity={0.32} filter="url(#softShadow)" />
      {/* chassi */}
      <rect x={20} y={-178} width={1450} height={40} fill="#2A2D33" />
      <rect x={-12} y={-150} width={60} height={34} rx={4} fill="#3A3E46" />
      {/* baú */}
      <rect x={bx} y={bTop} width={bw} height={bh} rx={6} fill="url(#boxSide)" />
      <g clipPath="url(#boxClip)">
        {/* frisos verticais do baú */}
        {Array.from({length: 15}, (_, i) => <rect key={i} x={bx + 36 + i * 72} y={bTop} width={2} height={bh} fill="#000" opacity={0.035} />)}
        {/* leão aplicado (multiply sobre o branco) */}
        <image href={staticFile("brand/lion_on_white.png")} x={bx + 30} y={bTop + 28} width={lw * (LION.w / LION.h)} height={lw} style={{mixBlendMode: "multiply"}} />
        {/* ondas da marca */}
        <BrandWaves w={bw} h={bh * 0.42} y0={bh * 0.58 + bTop} amp={1} id="truckW" />
        {/* lettering */}
        <image href={staticFile("brand/wordmark_navy.png")} x={bx + 470} y={bTop + 120} width={500} height={(500 * WM.h) / WM.w} />
        <text x={bx + 720} y={bTop + 382} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={25} letterSpacing="1.5" fill="#0B1F5C">TRANSPORTE COM SEGURANÇA E QUALIDADE</text>
        <text x={bx + 720} y={bTop + 72} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={800} fontSize={24} fill="#1650D0">“Servir a Deus tem nos feito muito bem!”</text>
        <text x={bx + 600} y={bBot - 28} textAnchor="end" fontFamily="Montserrat" fontWeight={700} fontSize={26} fill="#FFFFFF">@diegomudancasbh</text>
        {/* reflexo */}
        <rect x={bx} y={bTop} width={bw} height={bh} fill="url(#boxGloss)" />
      </g>
      <rect x={bx} y={bTop} width={bw} height={bh} rx={6} fill="none" stroke="#C8CFDA" strokeWidth={4} />
      <rect x={bx} y={bTop - 8} width={bw} height={14} rx={4} fill="#D9DEE6" />
      {/* cabine */}
      <g transform="translate(1100 0)">
        <path d="M 0 -620 L 250 -620 C 300 -620, 320 -600, 340 -520 L 380 -330 C 392 -280, 392 -230, 388 -190 L 388 -130 L 0 -130 Z" fill="url(#cabSide)" />
        {/* janela */}
        <path d="M 40 -590 L 240 -590 C 280 -590, 296 -570, 310 -520 L 334 -420 L 40 -420 Z" fill="url(#glass)" />
        <path d="M 60 -580 L 140 -580 L 70 -440 L 50 -440 Z" fill="#fff" opacity={0.18} />
        {/* porta */}
        <path d="M 30 -600 L 30 -150 M 300 -400 L 300 -150" stroke="#C8CFDA" strokeWidth={3} />
        <rect x={60} y={-400} width={60} height={12} rx={6} fill="#9AA2AE" />
        <image href={staticFile("brand/wordmark_navy.png")} x={110} y={-370} width={170} height={(170 * WM.h) / WM.w} />
        {/* faixa da marca na cabine */}
        <path d="M 0 -250 C 120 -230, 260 -300, 388 -340 L 388 -300 C 260 -262, 120 -196, 0 -214 Z" fill="#1650D0" />
        <path d="M 0 -200 C 130 -186, 260 -246, 388 -280 L 388 -262 C 260 -228, 130 -170, 0 -184 Z" fill="#27C0F5" />
        {/* espelho */}
        <rect x={-14} y={-560} width={22} height={110} rx={8} fill="#2A2D33" />
        {/* para-choque e farol */}
        <rect x={340} y={-210} width={64} height={80} rx={10} fill="#3A3E46" />
        <rect x={360} y={-330} width={30} height={46} rx={8} fill="#FFF4D0" />
        <rect x={360} y={-330} width={30} height={46} rx={8} fill="#FFE9A8" opacity={light} />
      </g>
      {/* para-lamas */}
      <path d="M 1150 -130 A 100 100 0 0 1 1350 -130 Z" fill="#2A2D33" />
      <path d="M 640 -150 A 100 100 0 0 1 840 -150 Z" fill="#2A2D33" />
      <Wheel x={740} y={-74} spin={spin} />
      <Wheel x={1250} y={-74} spin={spin} />
    </g>
  );
};

// traseira do baú: portas (open 0..1). Origem: chão, centro.
export const TruckRear = ({x = 0, y = 0, s = 1, open = 0, children}) => {
  const w = 620, top = -760, bot = -170;
  const h = bot - top;
  const door = (side) => {
    const o = cl(open);
    // folha gira em torno da dobradiça; mostra face interna quando passa de 90°
    const sx = Math.cos(o * Math.PI * 0.95);
    const hx = side < 0 ? -w / 2 : w / 2;
    return (
      <g transform={`translate(${hx} 0) scale(${sx} 1) translate(${-hx} 0)`}>
        <rect x={side < 0 ? -w / 2 : 0} y={top} width={w / 2} height={h} fill={sx > 0 ? "#F4F6FA" : "#C9CED8"} stroke="#B7BFCB" strokeWidth={4} />
        {sx > 0 && (
          <g>
            <rect x={side < 0 ? -w / 2 + 70 : w / 2 - 82} y={top + 20} width={12} height={h - 40} rx={6} fill="#9AA2AE" />
            <rect x={side < 0 ? -w / 2 + 60 : w / 2 - 92} y={top + h * 0.5 - 14} width={32} height={28} rx={6} fill="#7D8592" />
            {side > 0 && <image href={staticFile("brand/wordmark_navy.png")} x={30} y={top + 80} width={230} height={(230 * WM.h) / WM.w} />}
            <rect x={side < 0 ? -w / 2 : 0} y={bot - 120} width={w / 2} height={120} fill={side < 0 ? "#1650D0" : "#27C0F5"} opacity={0.9} />
          </g>
        )}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={420} ry={26} fill="#000" opacity={0.35} filter="url(#softShadow)" />
      {/* interior */}
      <rect x={-w / 2} y={top} width={w} height={h} fill="#1A1E28" />
      <g clipPath="url(#rearInt)">{children}</g>
      <clipPath id="rearInt"><rect x={-w / 2 + 8} y={top + 8} width={w - 16} height={h - 8} /></clipPath>
      {door(-1)}{door(1)}
      {/* para-choque e lanternas */}
      <rect x={-w / 2 - 10} y={bot} width={w + 20} height={40} fill="#2A2D33" />
      <rect x={-w / 2 + 10} y={bot + 8} width={60} height={22} rx={4} fill="#D3302F" />
      <rect x={w / 2 - 70} y={bot + 8} width={60} height={22} rx={4} fill="#D3302F" />
      <rect x={-w / 2 + 30} y={-150} width={110} height={110} rx={50} fill="#17181C" />
      <rect x={w / 2 - 140} y={-150} width={110} height={110} rx={50} fill="#17181C" />
    </g>
  );
};

export const TruckDefs = () => (
  <svg width="0" height="0" style={{position: "absolute"}}>
    <defs>
      <linearGradient id="boxGloss" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.45" stopColor="#fff" stopOpacity="0.0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.18" /><stop offset="0.56" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

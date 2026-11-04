import React from "react";
import {staticFile} from "remotion";
import {G, Face, Cuboid, Cylinder, shadeFor} from "./three";

const WM = 555 / 254, LION = 645 / 810;
// dimensões (px = unidades do mundo)
export const TK = {L: 1600, boxL: 1080, boxH: 580, W: 520, boxBot: 170, cabL: 420, cabH: 470, wheelR: 90, rearAx: -330, frontAx: 560};

// ---------- plotagem do baú (lado direito: traseira à esquerda, cabine à direita) ----------
const Livery = ({w, h, mirror = false}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: "block"}}>
    <defs>
      <linearGradient id={`lvA${mirror}`} x1="0" x2="1"><stop offset="0" stopColor="#0B1F5C" /><stop offset="1" stopColor="#1650D0" /></linearGradient>
      <linearGradient id={`lvB${mirror}`} x1="0" x2="1"><stop offset="0" stopColor="#1E6FF0" /><stop offset="1" stopColor="#27C0F5" /></linearGradient>
      <linearGradient id={`lvBase${mirror}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E8ECF2" /></linearGradient>
      <linearGradient id={`lvGloss${mirror}`} x1="0" y1="0" x2="1" y2="0.35"><stop offset="0.3" stopColor="#fff" stopOpacity="0" /><stop offset="0.42" stopColor="#fff" stopOpacity="0.35" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></linearGradient>
    </defs>
    <rect width={w} height={h} fill={`url(#lvBase${mirror})`} />
    {Array.from({length: 14}, (_, i) => <rect key={i} x={40 + i * 76} y={0} width={2} height={h} fill="#000" opacity={0.035} />)}
    <g transform={mirror ? `translate(${w} 0) scale(-1 1)` : undefined}>
      <image href={staticFile("brand/lion_on_white.png")} x={24} y={20} width={h * 0.88 * LION} height={h * 0.88} style={{mixBlendMode: "multiply"}} />
      <path d={`M 0 ${h * 0.80} C ${w * 0.3} ${h * 1.02}, ${w * 0.62} ${h * 0.62}, ${w} ${h * 0.5} L ${w} ${h} L 0 ${h} Z`} fill={`url(#lvA${mirror})`} />
      <path d={`M 0 ${h * 0.86} C ${w * 0.32} ${h * 1.06}, ${w * 0.64} ${h * 0.7}, ${w} ${h * 0.58}`} stroke="#fff" strokeWidth={h * 0.03} fill="none" />
      <path d={`M 0 ${h * 0.91} C ${w * 0.34} ${h * 1.1}, ${w * 0.66} ${h * 0.77}, ${w} ${h * 0.66}`} stroke={`url(#lvB${mirror})`} strokeWidth={h * 0.04} fill="none" />
      <path d={`M ${w * 0.55} 0 C ${w * 0.75} ${h * 0.04}, ${w * 0.9} ${h * 0.0}, ${w} ${h * 0.1} L ${w} 0 Z`} fill={`url(#lvB${mirror})`} opacity={0.9} />
    </g>
    <image href={staticFile("brand/wordmark_navy.png")} x={w * 0.42} y={h * 0.2} width={w * 0.46} height={(w * 0.46) / WM} />
    <text x={w * 0.65} y={h * 0.13} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={800} fontSize={h * 0.042} fill="#1650D0">“Servir a Deus tem nos feito muito bem!”</text>
    <text x={w * 0.65} y={h * 0.64} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={h * 0.042} letterSpacing="1.5" fill="#0B1F5C">TRANSPORTE COM SEGURANÇA E QUALIDADE</text>
    <text x={mirror ? w * 0.94 : w * 0.06} y={h * 0.955} textAnchor={mirror ? "end" : "start"} fontFamily="Montserrat" fontWeight={700} fontSize={h * 0.042} fill="#fff">@diegomudancasbh</text>
    <rect width={w} height={h} fill={`url(#lvGloss${mirror})`} />
    <rect x={1.5} y={1.5} width={w - 3} height={h - 3} fill="none" stroke="#C3CAD6" strokeWidth={3} />
  </svg>
);

// ---------- lateral da cabine (perfil recortado) ----------
const cabProfile = [[0, 0], [372, 0], [398, 24], [420, 470], [0, 470]];
const CabSide = ({mirror = false}) => {
  const {cabL: w, cabH: h} = TK;
  const flipX = (x) => (mirror ? w - x : x);
  const poly = cabProfile.map(([x, y]) => `${flipX(x)}px ${y}px`).join(",");
  return (
    <div style={{position: "absolute", inset: 0, clipPath: `polygon(${poly})`}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id={`cbG${mirror}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E3E8EF" /></linearGradient>
          <linearGradient id={`glG${mirror}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9CC0E8" /><stop offset="0.5" stopColor="#36557F" /><stop offset="1" stopColor="#152A4A" /></linearGradient>
        </defs>
        <g transform={mirror ? `translate(${w} 0) scale(-1 1)` : undefined}>
          <rect width={w} height={h} fill={`url(#cbG${mirror})`} />
          {/* janela lateral */}
          <path d="M 40 30 L 340 30 L 368 188 L 40 188 Z" fill={`url(#glG${mirror})`} />
          <path d="M 70 40 L 150 40 L 80 180 L 56 180 Z" fill="#fff" opacity={0.2} />
          <path d="M 40 188 L 370 188" stroke="#1F2630" strokeWidth={8} />
          {/* porta */}
          <path d="M 26 20 L 26 430 M 346 196 L 346 400" stroke="#BEC6D2" strokeWidth={3} />
          <rect x={70} y={214} width={64} height={14} rx={7} fill="#8E97A4" />
          <image href={staticFile("brand/wordmark_navy.png")} x={120} y={240} width={190} height={190 / WM} />
          {/* faixas da marca */}
          <path d="M 0 360 C 120 380, 260 330, 420 300 L 420 334 C 260 360, 120 410, 0 392 Z" fill="#1650D0" />
          <path d="M 0 404 C 130 418, 270 372, 420 346 L 420 362 C 270 388, 130 434, 0 420 Z" fill="#27C0F5" />
          {/* caixa de roda dianteira */}
          <path d={`M ${560 - 290 - 112} 470 A 112 112 0 0 1 ${560 - 290 + 112} 470 Z`} fill="#15171C" />
          <path d={`M ${560 - 290 - 120} 470 A 120 120 0 0 1 ${560 - 290 + 120} 470`} stroke="#2A2D33" strokeWidth={14} fill="none" />
          <rect x={0} y={440} width={w} height={30} fill="#2A2D33" opacity={0.85} />
        </g>
      </svg>
    </div>
  );
};

// ---------- roda ----------
const Rim = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="rimG" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#F2F4F7" /><stop offset="0.6" stopColor="#B8BEC8" /><stop offset="1" stopColor="#7D838E" /></radialGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="#1A1B1F" />
    <circle cx="50" cy="50" r="46" fill="#24262B" />
    <circle cx="50" cy="50" r="31" fill="url(#rimG)" />
    {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={50 + Math.cos((a * Math.PI) / 180) * 19} cy={50 + Math.sin((a * Math.PI) / 180) * 19} r="3.4" fill="#5D636E" />)}
    <circle cx="50" cy="50" r="9" fill="#8D939E" />
    <circle cx="50" cy="50" r="31" fill="none" stroke="#5D636E" strokeWidth="2" />
  </svg>
);
const Wheel = ({x, z, spin, ry}) => (
  <G x={x} y={-TK.wheelR} z={z}>
    <G rz={spin}>
      <Cylinder r={TK.wheelR} depth={72} n={18} col="#1C1D21" cap={<Rim />} capBack={<div style={{width: "100%", height: "100%", background: "#111", borderRadius: "50%"}} />} ry={ry} />
    </G>
  </G>
);

// ---------- caminhão ----------
// open: portas traseiras 0..1; spin: graus das rodas; pitch: inclinação da carroceria (frenagem)
export const Truck3D = ({x = 0, y = 0, z = 0, ry = 0, spin = 0, open = 0, pitch = 0, bounce = 0, cargo, headlight = 0, interior = false}) => {
  const {boxL, boxH, W, boxBot, cabL, cabH} = TK;
  const boxCx = -800 + boxL / 2, boxCy = -boxBot - boxH / 2;
  const door = (side) => {
    const ang = open * 165 * side;
    return (
      <G x={-800 - 3} y={boxCy} z={side * W / 2} ry={ang}>
        <G z={-side * W / 4}>
          <Face w={W / 2} h={boxH} tf="rotateY(-90deg)" bg="#F2F4F8" shade={shadeFor([-1, 0, 0], ry + ang)}>
            <div style={{position: "absolute", left: side > 0 ? W / 2 - 74 : 60, top: 20, width: 12, bottom: 20, background: "#9AA2AE", borderRadius: 6}} />
            <div style={{position: "absolute", left: side > 0 ? W / 2 - 88 : 46, top: boxH / 2 - 20, width: 40, height: 40, background: "#7D8592", borderRadius: 8}} />
            {side < 0 && <img src={staticFile("brand/wordmark_navy.png")} style={{position: "absolute", left: 30, top: 80, width: 180}} />}
            <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: side > 0 ? "#27C0F5" : "#1650D0"}} />
            <div style={{position: "absolute", inset: 0, border: "3px solid #C3CAD6"}} />
          </Face>
          <Face w={W / 2} h={boxH} tf="rotateY(90deg) translateZ(2px)" bg="#C7CDD6" shade={shadeFor([1, 0, 0], ry + ang)} />
        </G>
      </G>
    );
  };
  return (
    <G x={x} y={y} z={z} ry={ry}>
      {/* sombra de contato */}
      <G y={-1}>
        <Face w={1820} h={760} tf="rotateX(90deg)" style={{background: "radial-gradient(closest-side, rgba(0,0,0,0.5), rgba(0,0,0,0.28) 60%, transparent)"}} back />
      </G>
      {[TK.rearAx, TK.frontAx].map((ax) => [-1, 1].map((sd) => (
        <G key={`${ax}${sd}`} x={ax} y={-2} z={sd * 225}><Face w={260} h={120} tf="rotateX(90deg)" style={{background: "radial-gradient(closest-side, rgba(0,0,0,0.7), transparent)"}} back /></G>
      )))}
      {/* rodas */}
      {[TK.rearAx, TK.frontAx].map((ax) => [-1, 1].map((sd) => <Wheel key={`w${ax}${sd}`} x={ax} z={sd * 228} spin={spin} ry={ry} />))}
      <G y={bounce} rz={pitch}>
        {/* chassi */}
        <G x={-60} y={-boxBot + 30} z={0}><Cuboid w={1500} h={50} d={380} col="#2A2D33" ry={ry} /></G>
        {/* para-lamas traseiros */}
        {[-1, 1].map((sd) => (
          <G key={sd} x={TK.rearAx} y={-TK.wheelR - 46} z={sd * 262}>
            <Face w={250} h={70} tf={sd > 0 ? "" : "rotateY(180deg)"} style={{borderRadius: "125px 125px 0 0 / 70px 70px 0 0", background: "#1E2025"}} />
          </G>
        ))}
        {/* baú */}
        <G x={boxCx} y={boxCy}>
          <Cuboid w={boxL} h={boxH} d={W} ry={ry} col="#F4F6FA" skip={{left: true}} faces={{front: <Livery w={boxL} h={boxH} />, back: <Livery w={boxL} h={boxH} mirror />, top: "#E9EDF3", bottom: "#3A3E46"}} />
          {/* interior visível com portas abertas */}
          {(open > 0.02 || interior) && (
            <G x={0}>
              <Face w={boxL - 10} h={boxH - 10} tf={`translateZ(${W / 2 - 4}px) rotateY(180deg)`} bg="#2C303B" back />
              <Face w={boxL - 10} h={boxH - 10} tf={`translateZ(${-W / 2 + 4}px)`} bg="#262A35" back />
              <Face w={boxL - 10} h={W - 8} tf={`translateY(${boxH / 2 - 4}px) rotateX(90deg)`} bg="#3A3530" back />
              <Face w={W - 10} h={boxH - 10} tf={`translateX(${boxL / 2 - 6}px) rotateY(-90deg)`} bg="#1E222C" back />
              {cargo}
            </G>
          )}
        </G>
        {/* moldura traseira, lanternas */}
        <G x={-800 - 2} y={-boxBot + 18} z={0}><Face w={W + 20} h={36} tf="rotateY(-90deg)" bg="#2A2D33" back>
          <div style={{position: "absolute", left: 14, top: 6, width: 70, height: 24, background: "#D3302F", borderRadius: 4}} />
          <div style={{position: "absolute", right: 14, top: 6, width: 70, height: 24, background: "#D3302F", borderRadius: 4}} />
        </Face></G>
        {door(-1)}{door(1)}
        {/* cabine */}
        <G x={290 + cabL / 2} y={-140 - cabH / 2}>
          <Face w={cabL} h={cabH} tf={`translateZ(${250}px)`} shade={shadeFor([0, 0, 1], ry)}><CabSide /></Face>
          <Face w={cabL} h={cabH} tf={`rotateY(180deg) translateZ(${250}px)`} shade={shadeFor([0, 0, -1], ry)}><CabSide mirror /></Face>
          {/* teto */}
          <G x={-cabL / 2 + 190} y={-cabH / 2}><Face w={380} h={500} tf="rotateX(90deg)" bg="#EEF1F5" shade={shadeFor([0, -1, 0], ry)} /></G>
          <G x={-cabL / 2 + 385} y={-cabH / 2 + 12}><Face w={36} h={500} tf="rotateZ(45deg) rotateX(90deg)" bg="#E6EAF0" shade={shadeFor([0.7, -0.7, 0], ry)} /></G>
          {/* frente: para-brisa, grade, faróis, para-choque */}
          <G x={cabL / 2 - 11} y={12}>
            <Face w={500} h={cabH - 24} tf="rotateZ(-2.7deg) rotateY(90deg)" shade={shadeFor([1, 0, 0], ry)} bg="#F1F3F7">
              <div style={{position: "absolute", left: 22, right: 22, top: 10, height: 170, background: "linear-gradient(170deg,#A8C8EE,#3A5B86 48%,#142846)", borderRadius: "16px 16px 6px 6px"}} />
              <div style={{position: "absolute", left: "18%", top: 14, width: "14%", height: 160, background: "rgba(255,255,255,0.22)", transform: "skewX(-22deg)"}} />
              <div style={{position: "absolute", left: 120, top: 172, width: 140, height: 5, background: "#1A1C20", transform: "rotate(-14deg)", transformOrigin: "left"}} />
              <div style={{position: "absolute", left: 40, right: 40, top: 236, height: 84, background: "linear-gradient(180deg,#2E3138,#15171B)", borderRadius: 10}} />
              {[0, 1, 2].map((i) => <div key={i} style={{position: "absolute", left: 54, right: 54, top: 252 + i * 22, height: 5, background: "#5A5F68"}} />)}
              <div style={{position: "absolute", left: 14, top: 240, width: 62, height: 44, background: headlight ? "#FFF4C8" : "#E4EBF4", borderRadius: 10, boxShadow: headlight ? "0 0 30px #FFE9A8" : "inset 0 0 0 3px #B8C0CC"}} />
              <div style={{position: "absolute", right: 14, top: 240, width: 62, height: 44, background: headlight ? "#FFF4C8" : "#E4EBF4", borderRadius: 10, boxShadow: headlight ? "0 0 30px #FFE9A8" : "inset 0 0 0 3px #B8C0CC"}} />
              <div style={{position: "absolute", left: 0, right: 0, top: 200, height: 16, background: "#1650D0"}} />
              <div style={{position: "absolute", left: 0, right: 0, top: 216, height: 6, background: "#27C0F5"}} />
              <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 96, background: "linear-gradient(180deg,#34373E,#22252A)"}} />
              <div style={{position: "absolute", left: 180, right: 180, bottom: 30, height: 34, background: "#F4F4F0", borderRadius: 4, border: "2px solid #2E3B55"}} />
            </Face>
          </G>
          {/* retrovisores */}
          {[-1, 1].map((sd) => (
            <G key={sd} x={cabL / 2 - 70} y={-cabH / 2 + 150} z={sd * 290}><Cuboid w={24} h={110} d={40} col="#24262C" ry={ry} /></G>
          ))}
        </G>
      </G>
    </G>
  );
};

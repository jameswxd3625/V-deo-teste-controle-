// Cenas autorais do site Diego Mudanças (Remotion, SVG).
// Sistema único: estúdio azul, móveis desenhados com volume, capa de tecido da Diego
// (sombreado de estofado, costura, dobras, marca acompanhando a superfície) e a linha de percurso.
import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing} from "remotion";

const TAU = Math.PI * 2;
const cl = (v) => Math.max(0, Math.min(1, v));
const EIO = Easing.bezier(0.65, 0, 0.35, 1);
const EO = Easing.bezier(0.16, 1, 0.3, 1);
const EH = Easing.bezier(0.33, 0, 0.12, 1); // movimento com peso: arranca devagar, assenta suave
const ip = (t, a, b, f = 0, to = 1, ez = EIO) => interpolate(t, [a, b], [f, to], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ez});
const kf = (t, ts, vs, ez = EIO) => interpolate(t, ts, vs, {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ez});
const LET = staticFile("diego/logo_letreiro.png");
const LION = staticFile("diego/leao.png");

// ---------------- estúdio ----------------
export const Studio = ({w, h, floorY, light = 0.5, warm = 0}) => (
  <>
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#030C2A" /><stop offset="1" stopColor="#0A2A86" /></linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B2C8C" /><stop offset="0.35" stopColor="#061C5C" /><stop offset="1" stopColor="#020A22" /></linearGradient>
      <radialGradient id="spot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#5FB8FF" stopOpacity="0.55" /><stop offset="0.55" stopColor="#1446E0" stopOpacity="0.18" /><stop offset="1" stopColor="#1446E0" stopOpacity="0" /></radialGradient>
      <radialGradient id="warmspot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFC98A" stopOpacity="0.5" /><stop offset="1" stopColor="#FFC98A" stopOpacity="0" /></radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9BEBFF" stopOpacity="0.22" /><stop offset="1" stopColor="#9BEBFF" stopOpacity="0" /></linearGradient>
    </defs>
    <rect x={0} y={-3000} width={w} height={3000} fill="#030C2A" /><rect x={0} y={0} width={w} height={floorY + 2} fill="url(#wall)" />
    <rect x={0} y={floorY} width={w} height={h - floorY} fill="url(#floor)" />
    <rect x={0} y={floorY - 1} width={w} height={2} fill="#4FA8FF" opacity={0.35} />
  </>
);

// ---------------- capa de tecido ----------------
// Desenha a capa azul sobre a silhueta `shape` (JSX). p = quanto já desceu (0..1).
let _uid = 0;
export const Cover = ({id, shape, box, p, logo, folds = [], shade = null, dil = 9, seed = 3, settle = 0, color = "#2C6FD1", px = null}) => {
  const [bx, by, bw, bh] = box;
  const fx = bx - 80, fy = by - 120, fw = bw + 160, fh = bh + 220;
  const edge = by - 40 + p * (bh + 110); // borda inferior da capa descendo
  const pp = (x) => (px ? px(x, p) : p);
  const wave = (x) => by - 40 + pp(x) * (bh + 110) + Math.sin(x / 38 + p * 9) * 10 * (1 - p * 0.6) + Math.sin(x / 13 + p * 4) * 3;
  let d = `M ${fx} ${fy} L ${fx + fw} ${fy} L ${fx + fw} ${wave(fx + fw)}`;
  for (let x = fx + fw; x >= fx; x -= 12) d += ` L ${x} ${wave(x)}`;
  d += " Z";
  const lift = (1 - p) * -34;
  const sq = 1 + Math.sin(settle * Math.PI) * 0.012;
  if (p <= 0.001) return null;
  return (
    <g>
      <defs>
        <filter id={`cl${id}`} x={fx} y={fy} width={fw} height={fh} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius={dil} result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.011" numOctaves="2" seed={seed} result="n" />
          <feDisplacementMap in="d" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="shape" />
          <feGaussianBlur in="shape" stdDeviation="16" result="b" />
          <feDiffuseLighting in="b" surfaceScale="12" diffuseConstant="1.25" lightingColor="#ffffff" result="diff"><feDistantLight azimuth="235" elevation="52" /></feDiffuseLighting>
          <feSpecularLighting in="b" surfaceScale="12" specularConstant="0.4" specularExponent="22" lightingColor="#BFE3FF" result="spec"><feDistantLight azimuth="235" elevation="42" /></feSpecularLighting>
          <feFlood floodColor={color} result="col" />
          <feComposite in="col" in2="diff" operator="arithmetic" k1="1.1" result="lit" />
          <feComposite in="spec" in2="shape" operator="in" result="sp" />
          <feComposite in="lit" in2="sp" operator="arithmetic" k2="1" k3="0.3" result="all" />
          <feComposite in="all" in2="shape" operator="in" />
        </filter>
        <filter id={`cm${id}`} x={fx} y={fy} width={fw} height={fh} filterUnits="userSpaceOnUse">
          <feMorphology in="SourceAlpha" operator="dilate" radius={dil - 3} result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.011" numOctaves="2" seed={seed} result="n" />
          <feDisplacementMap in="d" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="s" />
          <feFlood floodColor="#fff" /><feComposite in2="s" operator="in" />
        </filter>
        <filter id={`lg${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="1" seed={seed + 4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id={`qt${id}`} width="76" height="400" patternUnits="userSpaceOnUse" x={bx + 8}>
          <rect x="0" y="0" width="76" height="400" fill="#000" opacity="0" />
          <path d="M1 0 V400" stroke="#0A2A72" strokeWidth="3.4" opacity="0.55" />
          <path d="M4.5 0 V400" stroke="#BFE0FF" strokeWidth="1.3" opacity="0.4" strokeDasharray="5 4" />
          <rect x="6" y="0" width="30" height="400" fill="#fff" opacity="0.05" />
        </pattern>
        <mask id={`rv${id}`} maskUnits="userSpaceOnUse" x={fx} y={fy} width={fw} height={fh}><path d={d} fill="#fff" /></mask>
        <mask id={`ms${id}`} maskUnits="userSpaceOnUse" x={fx} y={fy} width={fw} height={fh}><g filter={`url(#cm${id})`}>{shape}</g></mask>
      </defs>
      {/* sombra que a capa projeta sobre o móvel, logo abaixo da barra */}
      {p < 0.99 && <rect x={fx} y={edge - 6} width={fw} height={46} fill="#020A22" opacity={0.35} mask={`url(#ms${id})`} style={{filter: "blur(10px)"}} />}
      <g mask={`url(#rv${id})`} transform={`translate(0 ${lift}) translate(${bx + bw / 2} ${by}) scale(1 ${sq}) translate(${-bx - bw / 2} ${-by})`}>
        <g filter={`url(#cl${id})`}>{shape}</g>
        <g mask={`url(#ms${id})`}>
          <rect x={fx} y={fy} width={fw} height={fh} fill={`url(#qt${id})`} />
          <linearGradient id={`sh${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFD9FF" stopOpacity="0.22" /><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#020A22" stopOpacity="0.38" /></linearGradient>
          <rect x={fx} y={fy} width={fw} height={fh} fill={`url(#sh${id})`} />
          {shade && <g style={{filter: "blur(6px)"}}>{shade}</g>}
          {folds.map((f, i) => <path key={i} d={f} stroke="#041545" strokeWidth={7} fill="none" opacity={0.28} strokeLinecap="round" style={{filter: "blur(4px)"}} />)}
          {folds.map((f, i) => <path key={"h" + i} d={f} stroke="#8FC0FF" strokeWidth={2.5} fill="none" opacity={0.25} strokeLinecap="round" transform="translate(-5 -3)" style={{filter: "blur(1.5px)"}} />)}
          {logo && (
            <g filter={`url(#lg${id})`} opacity={0.92}>
              <image href={LET} x={logo[0]} y={logo[1]} width={logo[2]} height={logo[2] * 0.55} preserveAspectRatio="xMidYMid meet" transform={logo[3] || ""} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// ---------------- móveis ----------------
// cada móvel: {draw: JSX do objeto, shape: silhueta para a capa, box, logo, folds}
const Foot = ({x, y}) => <rect x={x} y={y} width={16} height={18} rx={3} fill="#1B1F2A" />;
export const FRIDGE = (() => {
  const draw = (
    <g>
      <defs>
        <linearGradient id="frF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F3F6FA" /><stop offset="0.55" stopColor="#E2E8F0" /><stop offset="1" stopColor="#C8D1DD" /></linearGradient>
        <linearGradient id="frS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A8B3C3" /><stop offset="1" stopColor="#7E8A9C" /></linearGradient>
        <linearGradient id="frH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E7ECF2" /><stop offset="1" stopColor="#9AA6B6" /></linearGradient>
      </defs>
      <path d="M232 46 L300 18 L300 548 L232 576 Z" fill="url(#frS)" />
      <path d="M0 46 L68 18 L300 18 L232 46 Z" fill="#F8FAFC" />
      <rect x={0} y={46} width={232} height={530} rx={10} fill="url(#frF)" />
      <rect x={6} y={214} width={220} height={3} fill="#9AA6B6" />
      <rect x={196} y={92} width={10} height={86} rx={5} fill="url(#frH)" />
      <rect x={196} y={258} width={10} height={150} rx={5} fill="url(#frH)" />
      <rect x={18} y={60} width={26} height={500} fill="#fff" opacity={0.35} />
      <Foot x={14} y={572} /><Foot x={200} y={572} />
    </g>
  );
  const shape = <path d="M0 52 Q0 46 6 44 L70 16 L300 16 L300 548 L232 578 L8 578 Q0 578 0 570 Z" fill="#000" />;
  const shade = <g><path d="M232 46 L300 18 L300 548 L232 576 Z" fill="#020A22" opacity={0.42} /><path d="M0 46 L68 18 L300 18 L232 46 Z" fill="#CFE4FF" opacity={0.22} /><rect x={0} y={208} width={232} height={14} fill="#020A22" opacity={0.18} /></g>;
  // tecido encontra primeiro as quinas superiores e desce pelas laterais
  const px = (x, p) => cl(p * 1.12 - (1 - Math.min(1, Math.abs(x - 150) / 150)) * 0.12);
  return {draw, shape, shade, px, box: [0, 16, 300, 562], w: 300, h: 590, logo: [26, 280, 180], folds: ["M30 560 Q60 520 52 470", "M170 572 Q190 530 214 520", "M250 540 Q262 500 286 480"]};
})();

export const SOFA = (() => {
  const fab = "#B9A58E", fabD = "#9C8670", fabL = "#D3C2AD";
  const draw = (
    <g>
      <defs>
        <linearGradient id="sfB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={fabL} /><stop offset="1" stopColor={fab} /></linearGradient>
        <linearGradient id="sfS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={fabL} /><stop offset="1" stopColor={fabD} /></linearGradient>
      </defs>
      <rect x={58} y={20} width={484} height={170} rx={36} fill="url(#sfB)" />
      <rect x={70} y={34} width={226} height={146} rx={30} fill="#CBB9A3" opacity={0.6} />
      <rect x={304} y={34} width={226} height={146} rx={30} fill="#CBB9A3" opacity={0.6} />
      <rect x={40} y={170} width={520} height={86} rx={22} fill="url(#sfS)" />
      <rect x={66} y={160} width={232} height={58} rx={20} fill={fabL} />
      <rect x={302} y={160} width={232} height={58} rx={20} fill={fabL} />
      <rect x={0} y={112} width={86} height={168} rx={34} fill="url(#sfS)" />
      <rect x={514} y={112} width={86} height={168} rx={34} fill="url(#sfS)" />
      <rect x={6} y={118} width={74} height={30} rx={15} fill={fabL} opacity={0.8} />
      <rect x={520} y={118} width={74} height={30} rx={15} fill={fabL} opacity={0.8} />
      <rect x={40} y={252} width={520} height={14} rx={7} fill="#7C6955" />
      <Foot x={36} y={262} /><Foot x={548} y={262} />
    </g>
  );
  const shape = (
    <g fill="#000"><rect x={58} y={20} width={484} height={170} rx={36} /><rect x={40} y={150} width={520} height={116} rx={22} /><rect x={0} y={112} width={86} height={160} rx={34} /><rect x={514} y={112} width={86} height={160} rx={34} /></g>
  );
  const shade = <g fill="#020A22"><rect x={70} y={150} width={460} height={22} rx={10} opacity={0.4} /><rect x={86} y={150} width={14} height={110} opacity={0.32} /><rect x={500} y={150} width={14} height={110} opacity={0.32} /><rect x={40} y={226} width={520} height={40} opacity={0.28} /><rect x={296} y={36} width={8} height={130} opacity={0.22} /><rect x={296} y={170} width={8} height={50} opacity={0.22} /></g>;
  // acomoda-se primeiro nos braços, depois no encosto e no assento
  const px = (x, p) => (x < 90 || x > 510 ? cl(p / 0.5) : cl((p - 0.38) / 0.62));
  return {draw, shape, shade, px, box: [0, 20, 600, 256], w: 600, h: 282, logo: [205, 58, 190], folds: ["M70 250 Q90 200 76 150", "M530 250 Q512 205 524 150", "M300 230 Q296 205 304 182", "M150 262 Q170 230 160 214", "M440 262 Q426 232 440 214"]};
})();

export const BED = (() => {
  const draw = (
    <g>
      <defs>
        <linearGradient id="bdH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A6A4E" /><stop offset="1" stopColor="#6A4F39" /></linearGradient>
        <linearGradient id="bdT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4F2EE" /><stop offset="1" stopColor="#DCD8D0" /></linearGradient>
        <linearGradient id="bdF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D2CDC4" /><stop offset="1" stopColor="#B7B1A6" /></linearGradient>
      </defs>
      <rect x={70} y={0} width={500} height={170} rx={16} fill="url(#bdH)" />
      <rect x={88} y={16} width={464} height={8} rx={4} fill="#A0805F" opacity={0.6} />
      <path d="M40 140 L600 140 L640 236 L0 236 Z" fill="url(#bdT)" />
      <rect x={0} y={236} width={640} height={62} rx={8} fill="url(#bdF)" />
      <path d="M118 150 Q114 132 140 128 L290 128 Q314 130 312 150 L316 182 Q316 196 296 198 L130 198 Q108 196 110 180 Z" fill="#FFFFFF" />
      <path d="M338 150 Q334 132 360 128 L510 128 Q534 130 532 150 L536 182 Q536 196 516 198 L350 198 Q328 196 330 180 Z" fill="#FFFFFF" />
      <path d="M130 160 Q210 152 296 160" stroke="#D9D4CB" strokeWidth={3} fill="none" />
      <path d="M350 160 Q430 152 516 160" stroke="#D9D4CB" strokeWidth={3} fill="none" />
      <rect x={0} y={294} width={640} height={26} rx={6} fill="#6A4F39" />
      <Foot x={14} y={316} /><Foot x={610} y={316} />
    </g>
  );
  const shape = <g fill="#000"><path d="M40 140 L600 140 L640 236 L640 298 L0 298 L0 236 Z" /><path d="M118 150 Q114 132 140 128 L290 128 Q314 130 312 150 L316 182 L110 180 Z M338 150 Q334 132 360 128 L510 128 Q534 130 532 150 L536 182 L330 180 Z" /></g>;
  const shade = <g><path d="M0 236 L640 236 L640 298 L0 298 Z" fill="#020A22" opacity={0.36} /><path d="M40 120 L600 120 L640 236 L0 236 Z" fill="#CFE4FF" opacity={0.12} /><path d="M118 150 Q114 132 140 128 L290 128 Q314 130 312 150 L316 182 Q316 196 296 198 L130 198 Q108 196 110 180 Z M338 150 Q334 132 360 128 L510 128 Q534 130 532 150 L536 182 Q536 196 516 198 L350 198 Q328 196 330 180 Z" fill="#CFE4FF" opacity={0.18} /></g>;
  // cobre o tampo e desce pela espessura, os cantos por último
  const px = (x, p) => cl(p * 1.18 - Math.pow(Math.abs(x - 320) / 320, 3) * 0.18);
  return {draw, shape, shade, px, box: [0, 120, 640, 178], w: 640, h: 336, logo: [226, 210, 190, "translate(320 236) scale(1 0.62) translate(-320 -236)"], folds: ["M30 296 Q60 262 46 240", "M612 296 Q584 262 600 240", "M200 296 Q214 270 206 250", "M450 296 Q436 268 446 250"]};
})();

export const ARMCHAIR = (() => {
  const draw = (
    <g>
      <rect x={40} y={0} width={240} height={190} rx={40} fill="#C2A88C" />
      <rect x={24} y={160} width={272} height={96} rx={24} fill="#A88D72" />
      <rect x={58} y={150} width={204} height={56} rx={20} fill="#D5BFA6" />
      <rect x={0} y={100} width={70} height={170} rx={30} fill="#A88D72" />
      <rect x={250} y={100} width={70} height={170} rx={30} fill="#A88D72" />
      <Foot x={30} y={266} /><Foot x={274} y={266} />
    </g>
  );
  const shape = <g fill="#000"><rect x={40} y={0} width={240} height={190} rx={40} /><rect x={24} y={150} width={272} height={116} rx={24} /><rect x={0} y={100} width={70} height={164} rx={30} /><rect x={250} y={100} width={70} height={164} rx={30} /></g>;
  const shade = <g fill="#020A22"><rect x={60} y={150} width={200} height={20} rx={8} opacity={0.38} /><rect x={24} y={226} width={272} height={40} opacity={0.28} /></g>;
  return {draw, shape, shade, box: [0, 0, 320, 266], w: 320, h: 286, logo: [80, 52, 160], folds: ["M40 260 Q56 220 44 180", "M282 260 Q266 220 278 180", "M160 250 Q156 228 164 210"]};
})();

// móvel no chão com sombra de contato e luz de recorte
export const Piece = ({m, x, floorY, scale = 1, p = 0, settle = 0, id, glow = 1, px = null}) => {
  const y = floorY - m.h * scale;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={m.w / 2} cy={m.h} rx={m.w * 0.62} ry={22} fill="#000" opacity={0.45} style={{filter: "blur(14px)"}} />
      <ellipse cx={m.w / 2} cy={m.h - 4} rx={m.w * 0.5} ry={8} fill="#000" opacity={0.55} style={{filter: "blur(4px)"}} />
      <g style={{filter: `drop-shadow(0 0 ${18 * glow}px rgba(34,199,245,0.35))`}}>{m.draw}</g>
      <Cover id={id} shape={m.shape} shade={m.shade} box={m.box} p={p} settle={settle} logo={m.logo} folds={m.folds} seed={id.length + 3} px={px || m.px || null} />
    </g>
  );
};

// ---------------- linha de percurso (faixas da marca) ----------------
export const Route = ({d, p = 1, w = 1, dots = true, id = "r"}) => (
  <g>
    {dots && <path d={d} fill="none" stroke="#9BEBFF" strokeOpacity={0.28} strokeWidth={10 * w} strokeLinecap="round" strokeDasharray={`1 ${22 * w}`} />}
    <path d={d} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={34 * w} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - p} transform="translate(0 10)" style={{filter: "blur(8px)"}} />
    <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={26 * w} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - p} />
    <path d={d} fill="none" stroke="#22C7F5" strokeWidth={17 * w} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - p} style={{filter: "drop-shadow(0 0 10px rgba(34,199,245,0.9))"}} />
    <path d={d} fill="none" stroke="#1446E0" strokeWidth={7 * w} strokeLinecap="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - p} />
  </g>
);

// ---------------- caminhão (plotagem da marca) e casa ----------------
const Wheel = ({cx, cy, rot}) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={50} fill="#14171F" /><circle r={34} fill="#3A404C" /><circle r={30} fill="#C9D0DA" />
    <g transform={`rotate(${rot})`}>{[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={-3} y={-28} width={6} height={18} rx={3} fill="#7C8696" transform={`rotate(${a})`} />)}</g>
    <circle r={9} fill="#5A6372" />
  </g>
);
export const Truck = ({rot = 0, lights = 0}) => (
  <g>
    <defs>
      <linearGradient id="tkB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#DCE3EC" /></linearGradient>
      <linearGradient id="tkG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3B6EA8" /><stop offset="1" stopColor="#0B1D3F" /></linearGradient>
      <clipPath id="tkC"><rect x={0} y={0} width={540} height={270} rx={12} /></clipPath>
    </defs>
    <ellipse cx={380} cy={352} rx={400} ry={26} fill="#000" opacity={0.5} style={{filter: "blur(14px)"}} />
    <rect x={0} y={0} width={540} height={270} rx={12} fill="url(#tkB)" />
    <g clipPath="url(#tkC)">
      <path d="M-20 270 C 120 200 260 250 560 120 L 560 170 C 300 270 140 250 -20 300 Z" fill="#1446E0" />
      <path d="M-20 250 C 140 186 270 230 560 100 L 560 118 C 280 240 140 210 -20 270 Z" fill="#22C7F5" />
      <image href={LION} x={-30} y={-26} width={300} height={300} opacity={0.95} />
    </g>
    <image href={LET} x={272} y={46} width={232} height={128} style={{filter: "brightness(0.12) sepia(1) hue-rotate(190deg) saturate(6)"}} />
    <rect x={0} y={0} width={540} height={270} rx={12} fill="none" stroke="#B9C3D0" strokeWidth={3} />
    <rect x={540} y={250} width={60} height={22} fill="#2A2F3A" />
    <path d="M556 92 L700 92 Q726 92 736 118 L760 196 L760 286 L556 286 Z" fill="url(#tkB)" stroke="#B9C3D0" strokeWidth={3} />
    <path d="M590 110 L690 110 Q708 110 714 128 L730 186 L590 186 Z" fill="url(#tkG)" />
    <path d="M556 236 C 620 220 700 230 760 216 L 760 250 C 690 262 620 252 556 268 Z" fill="#1446E0" />
    <rect x={742} y={232} width={22} height={18} rx={4} fill="#FFE7A8" />
    <ellipse cx={790} cy={242} rx={70 * lights} ry={22 * lights} fill="#FFE7A8" opacity={0.35} style={{filter: "blur(10px)"}} />
    <rect x={6} y={276} width={756} height={16} rx={6} fill="#2A2F3A" />
    <Wheel cx={128} cy={300} rot={rot} /><Wheel cx={430} cy={300} rot={rot} /><Wheel cx={666} cy={300} rot={rot} />
  </g>
);
export const House = ({glow = 0, door = 0}) => (
  <g>
    <defs>
      <linearGradient id="hsW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F4F7FB" /><stop offset="1" stopColor="#C9D4E3" /></linearGradient>
      <linearGradient id="hsR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A47C8" /><stop offset="1" stopColor="#0B2370" /></linearGradient>
      <radialGradient id="hsL" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFE1B0" /><stop offset="1" stopColor="#FFB45E" /></radialGradient>
    </defs>
    <ellipse cx={200} cy={372} rx={250} ry={22} fill="#000" opacity={0.45} style={{filter: "blur(12px)"}} />
    <ellipse cx={200} cy={250} rx={300 * glow} ry={230 * glow} fill="url(#warmspot)" />
    <rect x={20} y={136} width={360} height={236} fill="url(#hsW)" />
    <rect x={20} y={136} width={360} height={10} fill="#0A2A86" opacity={0.18} />
    <path d="M-6 148 L200 20 L406 148 L388 160 L200 46 L12 160 Z" fill="url(#hsR)" />
    <path d="M200 20 L406 148" stroke="#5FA0FF" strokeWidth={3} opacity={0.6} />
    {[[48, 192], [278, 192]].map(([x, y], i) => (
      <g key={i}>
        <rect x={x - 6} y={y - 6} width={86} height={86} rx={6} fill="#C3CEDD" />
        <rect x={x} y={y} width={74} height={74} rx={3} fill="#16264D" />
        <rect x={x} y={y} width={74} height={74} rx={3} fill="url(#hsL)" opacity={0.08 + 0.85 * glow} />
        <rect x={x + 35} y={y} width={4} height={74} fill="#C3CEDD" /><rect x={x} y={y + 35} width={74} height={4} fill="#C3CEDD" />
      </g>
    ))}
    <rect x={156} y={240} width={88} height={132} rx={4} fill="#C3CEDD" />
    <rect x={164} y={248} width={72} height={124} rx={3} fill="url(#hsL)" opacity={0.15 + 0.85 * door} />
    <path d={`M164 248 L${164 + 72 * (1 - door * 0.62)} ${248 + 10 * door} L${164 + 72 * (1 - door * 0.62)} ${372 - 10 * door} L164 372 Z`} fill="#1D4FD8" />
    <circle cx={226 - 46 * door} cy={312} r={4} fill="#FFD08A" />
    <ellipse cx={200} cy={384} rx={130 * door} ry={16 * door} fill="#FFC98A" opacity={0.4} style={{filter: "blur(8px)"}} />
    <ellipse cx={46} cy={366} rx={34} ry={20} fill="#0F3B2E" /><ellipse cx={356} cy={366} rx={30} ry={18} fill="#0F3B2E" />
  </g>
);
const Pin = ({x, y, p, check = 0}) => (
  <g transform={`translate(${x} ${y - (1 - p) * 120}) scale(${0.6 + 0.4 * p})`} opacity={cl(p * 3)}>
    <path d="M0 0 C 0 0 -44 -48 -44 -80 A 44 44 0 1 1 44 -80 C 44 -48 0 0 0 0 Z" fill="#1446E0" stroke="#fff" strokeWidth={5} />
    <circle cx={0} cy={-80} r={22} fill="#fff" />
    <path d="M-11 -80 L-3 -71 L12 -90" stroke="#1446E0" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
  </g>
);
// ponto em uma cúbica
const cub = (P, u) => [0, 1].map((k) => (1 - u) ** 3 * P[0][k] + 3 * (1 - u) ** 2 * u * P[1][k] + 3 * (1 - u) * u * u * P[2][k] + u ** 3 * P[3][k]);

// =====================================================================
// 1. ABERTURA: capa → percurso → caminhão → novo endereço (uma só cena)
// =====================================================================
export const HERO_T = 11;
export const HeroScene = ({mobile = false}) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const t = f / fps;
  const FY = 860; // chão do mundo
  const TS = 1.3; // escala do caminhão e da casa
  // mundo: sofá (0..600) → caminhão (1250 → 2250) → casa (3350..3870)
  const sofaP = ip(t, -0.45, 1.55, 0, 1, EH);
  const settle = ip(t, 1.55, 2.1, 0, 1, (x) => x);
  const R1 = [[300, FY + 40], [640, FY + 80], [980, FY + 70], [1250, FY + 40]];
  const route1 = `M ${R1[0][0]} ${R1[0][1]} C ${R1[1][0]} ${R1[1][1]} ${R1[2][0]} ${R1[2][1]} ${R1[3][0]} ${R1[3][1]}`;
  const route2 = `M 1250 ${FY + 40} C 1900 ${FY + 0} 2700 ${FY + 90} 3300 ${FY + 50} S 3610 ${FY + 36} 3610 ${FY + 36}`;
  const p1 = ip(t, 1.9, 3.3, 0, 1, EIO);
  const tok = ip(t, 2.2, 3.8, 0, 1, EIO);
  const [tx, ty] = cub(R1, tok);
  const drive = ip(t, 4.2, 7.2, 0, 1, EH);
  const truckX = 1250 + drive * 1000;
  const tc = truckX + 380 * TS; // centro do caminhão
  const p2 = ip(t, 4.0, 7.3, 0, 1, EH);
  const glow = ip(t, 7.0, 8.3, 0, 1, EO);
  const door = ip(t, 7.5, 8.5, 0, 1, EIO);
  const pin = ip(t, 7.9, 8.5, 0, 1, EO);
  const chk = ip(t, 8.4, 9.0, 0, 1, EIO);
  // câmera: segue a ação com peso
  const follow = t < 4.2 ? kf(t, [0, 2.2, 4.2], [300, 330, 1744], EH) : t < 7.3 ? tc : kf(t, [7.3, 8.6, 11], [tc, mobile ? 3300 : 3150, mobile ? 2560 : 2500], EH);
  const S = mobile
    ? {cx: follow, cy: kf(t, [0, 4.2, 8.6, 11], [FY - 170, FY - 240, FY - 260, FY - 300]), s: kf(t, [0, 2.2, 4.2, 7.3, 8.6, 11], [1.3, 1.22, 0.8, 0.8, 0.74, 0.5], EH), ax: 540, ay: 640}
    : {cx: follow, cy: kf(t, [0, 4.2, 8.6, 11], [FY - 200, FY - 250, FY - 260, FY - 300]), s: kf(t, [0, 2.2, 4.2, 7.3, 8.6, 11], [0.96, 0.9, 0.66, 0.66, 0.63, 0.4], EH), ax: 1480, ay: 600};
  const cam = `translate(${S.ax} ${S.ay}) scale(${S.s}) translate(${-S.cx} ${-S.cy})`;
  return (
    <AbsoluteFill style={{background: "#020A22"}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={cam}>
          <g transform="translate(-3000 0)"><Studio w={10000} h={3000} floorY={FY} /></g>
          {/* luzes volumétricas ao longo do caminho */}
          <path d={`M 120 -400 L 480 -400 L 780 ${FY} L -180 ${FY} Z`} fill="url(#beam)" />
          <ellipse cx={300} cy={FY - 160} rx={560} ry={440} fill="url(#spot)" />
          <path d={`M ${tc - 200} -400 L ${tc + 200} -400 L ${tc + 640} ${FY} L ${tc - 640} ${FY} Z`} fill="url(#beam)" opacity={0.7} />
          <ellipse cx={tc} cy={FY - 180} rx={720} ry={440} fill="url(#spot)" opacity={0.7} />
          <path d={`M 3450 -400 L 3770 -400 L 4060 ${FY} L 3160 ${FY} Z`} fill="url(#beam)" opacity={0.8} />
          <ellipse cx={3610} cy={FY - 180} rx={600} ry={460} fill="url(#spot)" opacity={0.7} />
          <ellipse cx={3610} cy={FY + 30} rx={620} ry={120} fill="url(#warmspot)" opacity={glow} />
          <Route d={route1} p={p1} />
          <Route d={route2} p={p2} />
          <Piece m={SOFA} id="hs" x={0} floorY={FY + 20} p={sofaP} settle={settle} />
          {tok > 0 && tok < 1 && (
            <g transform={`translate(${tx} ${ty - 44})`} opacity={cl(tok * 6) * cl((1 - tok) * 6)}>
              <rect x={-36} y={-36} width={72} height={72} rx={16} fill="#1D4FD8" stroke="#9BEBFF" strokeWidth={3} style={{filter: "drop-shadow(0 0 16px rgba(34,199,245,0.9))"}} />
              <path d="M-16 -6 L0 -16 L16 -6 L16 12 L0 20 L-16 12 Z M-16 -6 L0 4 L16 -6 M0 4 L0 20" stroke="#fff" strokeWidth={3} fill="none" strokeLinejoin="round" />
            </g>
          )}
          <g transform={`translate(${truckX} ${FY + 20 - 350 * TS}) scale(${TS})`}><Truck rot={drive * 1300} lights={cl((drive - 0.02) * 8) * cl((1 - drive) * 3 + 0.25)} /></g>
          <g transform={`translate(3350 ${FY + 20 - 372 * TS}) scale(${TS})`}><House glow={glow} door={door} /></g>
          <Pin x={3610} y={FY + 20 - 372 * TS - 10} p={pin} check={chk} />
        </g>
      </svg>
      <AbsoluteFill style={{background: mobile ? "linear-gradient(180deg, rgba(2,10,34,0.35) 0%, rgba(2,10,34,0) 12%, rgba(2,10,34,0) 40%, rgba(2,10,34,0.88) 52%, #020A22 64%)" : "linear-gradient(90deg, #020A22 0%, rgba(2,10,34,0.92) 30%, rgba(2,10,34,0.35) 50%, rgba(2,10,34,0) 62%)"}} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 2. PROTEÇÃO: geladeira → sofá → cama, uma capa por vez (loop)
// =====================================================================
export const PROT_P = 4.6; // duração de cada móvel
export const PROT_D = 2.8;  // passagem para o detalhe real
export const PROT_T = PROT_P * 3 + PROT_D;
export const ProtectScene = () => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const t = f / fps;
  const FY = 880;
  const items = [[FRIDGE, 0.98], [SOFA, 1.18], [BED, 1.12]];
  const T3 = PROT_P * 3;
  // aproximação final na costura da capa da cama
  const zIn = ip(t, T3 - 1.4, T3 + 0.4, 0, 1, EIO);
  const zs = 1 + zIn * 4.2;
  const zx = W / 2 - 60, zy = FY - 150;
  const real = ip(t, T3 - 0.1, T3 + 0.5) * (1 - ip(t, PROT_T - 0.75, PROT_T - 0.05));
  return (
    <AbsoluteFill style={{background: "#020A22"}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(${zx} ${zy}) scale(${zs}) translate(${-zx} ${-zy})`}>
        <Studio w={W} h={H} floorY={FY} />
        <path d={`M ${W / 2 - 170} -40 L ${W / 2 + 170} -40 L ${W / 2 + 470} ${FY} L ${W / 2 - 470} ${FY} Z`} fill="url(#beam)" />
        <ellipse cx={W / 2} cy={FY - 220} rx={560} ry={460} fill="url(#spot)" />
        <ellipse cx={W / 2} cy={FY + 30} rx={460} ry={70} fill="#1F7BFF" opacity={0.22} style={{filter: "blur(30px)"}} />
        <g transform={`translate(${-((t / PROT_T) * 3 * 1100) % 1100} 0)`}>
          {[0, 1, 2].map((k) => <Route key={k} d={`M ${-560 + k * 1100} ${FY + 90} C ${-200 + k * 1100} ${FY + 140} ${200 + k * 1100} ${FY + 40} ${540 + k * 1100} ${FY + 90}`} p={1} w={0.7} dots={false} />)}
        </g>
        {items.map(([m, sc], k) => {
          let u = t - k * PROT_P;
          if (k === 0 && t > PROT_T - 0.8) u = t - PROT_T; // a geladeira volta no fim do loop
          const last = k === 2;
          if (u < -0.8 || u > (last ? PROT_P + PROT_D : PROT_P + 0.05)) return null;
          const xIn = last ? kf(u, [-0.8, 0], [1100, 0], EH) : kf(u, [-0.8, 0, PROT_P - 0.8, PROT_P], [1100, 0, 0, -1100], EH);
          const p = ip(u, 1.0, 2.7, 0, 1, EH); // um instante para reconhecer a peça antes da capa
          const settle = ip(u, 2.7, 3.3, 0, 1, (x) => x);
          const w = m.w * sc;
          return (
            <g key={k} transform={`translate(${xIn} 0)`} opacity={1 - Math.abs(xIn) / 1600}>
              <Piece m={m} id={"p" + k} x={W / 2 - w / 2} floorY={FY + 10} scale={sc} p={p} settle={settle} />
            </g>
          );
        })}
        </g>
      </svg>
      {/* detalhe real: costura da capa filmada pela equipe (vídeo 08) */}
      {real > 0 && (
        <AbsoluteFill style={{opacity: real, overflow: "hidden"}}>
          <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${1.08 - 0.08 * ip(t, T3, PROT_T)})`}}>
            <img src={staticFile("diego/capa_real_detalhe.jpg")} style={{position: "absolute", inset: 0, width: W, height: H, objectFit: "cover"}} />
          </div>
          <AbsoluteFill style={{background: "radial-gradient(80% 80% at 50% 50%, transparent 55%, rgba(2,10,34,0.45))"}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// =====================================================================
// 3. SERVIÇOS (loops curtos para os cartões)
// =====================================================================
const Box2 = ({x, y, w, h, tape = true, tone = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={w} height={h} rx={6} fill={tone ? "#E6EDF7" : "#D9C2A0"} />
    <rect x={0} y={0} width={w} height={h * 0.18} rx={6} fill={tone ? "#F6F9FD" : "#E8D3B3"} />
    <rect x={w * 0.44} y={0} width={w * 0.12} height={h * 0.5} fill={tape ? "#22C7F5" : "transparent"} opacity={0.9} />
    <rect x={w - 10} y={4} width={6} height={h - 8} fill="#000" opacity={0.08} />
  </g>
);
// Mudança residencial e comercial: móveis e caixas compondo uma casa
export const SV_T = 7;
export const SvHome = () => {
  const f = useCurrentFrame(); const {width: W, height: H, fps} = useVideoConfig(); const t = f / fps;
  const out = ip(t, 5.7, 6.6, 0, 1, EIO);
  const line = ip(t, 0.1, 1.3, 0, 1, EIO) * (1 - out);
  const FY = 860;
  const house = `M 230 ${FY} L 230 470 L 540 250 L 850 470 L 850 ${FY}`;
  const drop = (a, x, y, w, h, el) => {
    const p = ip(t, a, a + 0.75, 0, 1, EH);
    const bounce = Math.sin(ip(t, a + 0.62, a + 0.95, 0, 1, (q) => q) * Math.PI) * 8;
    const lift = out * -520 - (1 - p) * 760;
    return <g key={a} transform={`translate(${x} ${y + lift + bounce})`} opacity={cl(p * 3) * (1 - out)}>{el(w, h)}</g>;
  };
  const sc = 0.62;
  return (
    <AbsoluteFill style={{background: "#020A22"}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(0 ${(H - 1080) / 2})`}>
        <Studio w={W} h={H + 1200} floorY={FY} />
        <ellipse cx={540} cy={560} rx={520} ry={440} fill="url(#spot)" />
        <ellipse cx={540} cy={FY - 120} rx={330} ry={220} fill="url(#warmspot)" opacity={ip(t, 3.2, 4.2) * (1 - out)} />
        <Route d={house} p={line} w={0.8} dots={false} />
        {drop(1.0, 262, FY - SOFA.h * sc, 0, 0, () => <g transform={`scale(${sc})`}>{SOFA.draw}</g>)}
        {drop(1.45, 640, FY - 190, 0, 0, () => <Box2 x={0} y={0} w={170} h={190} />)}
        {drop(1.8, 655, FY - 330, 0, 0, () => <Box2 x={0} y={0} w={140} h={140} tone={1} />)}
        {drop(2.15, 300, FY - SOFA.h * sc - 150, 0, 0, () => <Box2 x={0} y={0} w={150} h={150} />)}
        {drop(2.45, 465, FY - SOFA.h * sc - 120, 0, 0, () => <Box2 x={0} y={0} w={120} h={120} tone={1} />)}
        {drop(2.75, 668, FY - 440, 0, 0, () => <Box2 x={0} y={0} w={110} h={110} />)}
        {drop(3.05, 470, 360, 0, 0, () => (<g><rect x={0} y={0} width={140} height={110} rx={10} fill="#16264D" /><rect x={8} y={8} width={124} height={94} rx={6} fill="#FFD08A" opacity={0.85} /><rect x={66} y={8} width={8} height={94} fill="#16264D" /></g>))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
// Embalagem: a capa da Diego envolvendo uma poltrona (cobre e descobre, loop)
export const SvWrap = () => {
  const f = useCurrentFrame(); const {width: W, height: H, fps} = useVideoConfig(); const t = f / fps;
  const FY = 880;
  const p = Math.min(ip(t, 0.4, 2.0, 0, 1, EH), 1 - ip(t, 5.1, 6.6, 0, 1, EH));
  const settle = ip(t, 2.0, 2.6, 0, 1, (x) => x);
  const sc = 1.7;
  return (
    <AbsoluteFill style={{background: "#020A22"}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Studio w={W} h={H} floorY={FY} />
        <path d={`M 390 -40 L 690 -40 L 980 ${FY} L 100 ${FY} Z`} fill="url(#beam)" />
        <ellipse cx={540} cy={FY - 220} rx={520} ry={430} fill="url(#spot)" />
        <Route d={`M -40 ${FY + 90} C 300 ${FY + 140} 700 ${FY + 40} 1120 ${FY + 90}`} p={1} w={0.7} dots={false} />
        <Piece m={ARMCHAIR} id="sw" x={540 - (ARMCHAIR.w * sc) / 2} floorY={FY + 10} scale={sc} p={p} settle={settle} />
      </svg>
    </AbsoluteFill>
  );
};
// Transporte: foto real dos caminhões com o percurso da marca
export const SvTruck = () => {
  const f = useCurrentFrame(); const {width: W, height: H, fps} = useVideoConfig(); const t = f / fps;
  const kb = 1.08 + Math.sin((t / SV_T) * TAU) * 0.025;
  const pr = ip(t, 0.5, 3.0, 0, 1, EIO) * (1 - ip(t, 5.8, 6.7, 0, 1, EIO));
  const pinA = ip(t, 0.4, 0.9, 0, 1, EO) * (1 - ip(t, 6.0, 6.6)), pinB = ip(t, 2.8, 3.3, 0, 1, EO) * (1 - ip(t, 6.0, 6.6));
  const sw = ip(t, 3.3, 4.6, 0, 1, EIO);
  const d = `M 70 ${H - 120} C 400 ${H - 40} 700 ${H - 200} 1000 ${H - 130} S 1400 ${H - 60} ${W - 90} ${H - 150}`;
  return (
    <AbsoluteFill style={{background: "#020A22", overflow: "hidden"}}>
      <img src={staticFile("diego/caminhoes.jpg")} style={{position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", objectPosition: "50% 40%", transform: `scale(${kb})`, transformOrigin: "50% 60%"}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(2,10,34,0.15) 0%, rgba(2,10,34,0) 40%, rgba(2,10,34,0.55) 80%, rgba(2,10,34,0.85) 100%)"}} />
      {sw > 0 && sw < 1 && <div style={{position: "absolute", top: -40, bottom: -40, width: 260, left: -300 + sw * (W + 600), background: "linear-gradient(100deg, transparent, rgba(200,235,255,0.35), transparent)", transform: "skewX(-18deg)", mixBlendMode: "screen"}} />}
      <svg width={W} height={H} style={{position: "absolute"}}>
        <Route d={d} p={pr} w={0.8} />
        <Pin x={70} y={H - 110} p={pinA} />
        <Pin x={W - 90} y={H - 140} p={pinB} check={ip(t, 3.3, 3.8)} />
      </svg>
    </AbsoluteFill>
  );
};
// Guarda-móveis: peças protegidas sendo organizadas no espaço
const Bundle = ({id, w, h}) => (
  <Cover id={id} shape={<rect x={0} y={0} width={w} height={h} rx={18} fill="#000" />} box={[0, 0, w, h]} p={1} dil={6} seed={id.length + 7} folds={[`M10 ${h - 6} Q24 ${h - 40} 14 ${h - 70}`, `M${w - 12} ${h - 6} Q${w - 26} ${h - 36} ${w - 16} ${h - 66}`]} />
);
export const SvStorage = () => {
  const f = useCurrentFrame(); const {width: W, height: H, fps} = useVideoConfig(); const t = f / fps;
  const FY = 900;
  const out = ip(t, 5.9, 6.7, 0, 1, EIO);
  const slots = [[170, 430, 210, 150], [435, 430, 210, 150], [700, 430, 210, 150], [170, 640, 210, 190], [435, 640, 210, 190], [700, 640, 210, 190]];
  return (
    <AbsoluteFill style={{background: "#020A22"}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(0 ${(H - 1080) / 2})`}>
        <Studio w={W} h={H + 1200} floorY={FY} />
        <ellipse cx={540} cy={560} rx={560} ry={460} fill="url(#spot)" />
        {/* estrutura do depósito */}
        <g stroke="#6FB6FF" strokeOpacity={0.55} strokeWidth={10} strokeLinecap="round" fill="none">
          <path d="M150 340 V 860 M410 340 V 860 M670 340 V 860 M930 340 V 860" />
          <path d="M150 600 H 930 M150 846 H 930 M150 344 H 930" stroke="#9BEBFF" strokeOpacity={0.4} strokeWidth={6} />
        </g>
        <Route d={`M -40 ${FY + 70} C 300 ${FY + 110} 700 ${FY + 30} 1120 ${FY + 70}`} p={1} w={0.7} dots={false} />
        {slots.map(([x, y, w, h], i) => {
          const a = 0.4 + i * 0.7;
          const p = ip(t, a, a + 0.9, 0, 1, EH);
          const xx = x + (1 - p) * (1200 - x);
          const hh = h - 22;
          return (
            <g key={i} transform={`translate(${xx} ${y + (150 - hh) + (i > 2 ? 40 : 0) - (i > 2 ? 0 : 0)})`} opacity={cl(p * 4) * (1 - out)}>
              <ellipse cx={w / 2} cy={hh + 6} rx={w * 0.5} ry={10} fill="#000" opacity={0.45} style={{filter: "blur(6px)"}} />
              <Bundle id={"b" + i} w={w} h={hh} />
            </g>
          );
        })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

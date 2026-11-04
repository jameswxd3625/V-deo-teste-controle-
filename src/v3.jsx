import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from "remotion";
import {P, spr, trk, Bg, crPath} from "./v2";

// V3 — um único elemento condutor: o anel de "12%".
// O arco dourado (12% do anel) percorre o contorno enquanto o anel vira cartão,
// pousa na borda inferior e dela se prolonga fisicamente até virar o gráfico.
export const FPS_V3 = 120;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const LIGHT = "#b9d7ff";

// ponto no perímetro de um retângulo arredondado (u: 0..1, início no topo-centro, sentido horário)
const rrPt = (x1, y1, x2, y2, r, u) => {
  const w = x2 - x1, h = y2 - y1;
  r = Math.max(1, Math.min(r, w / 2, h / 2));
  const sw = w - 2 * r, sh = h - 2 * r, q = (Math.PI * r) / 2;
  const per = 2 * sw + 2 * sh + 4 * q;
  let d = (((u % 1) + 1) % 1) * per;
  const arc = (cx, cy, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const segs = [
    [sw / 2, (s) => [x1 + w / 2 + s, y1]],
    [q, (s) => arc(x2 - r, y1 + r, -90 + (90 * s) / q)],
    [sh, (s) => [x2, y1 + r + s]],
    [q, (s) => arc(x2 - r, y2 - r, (90 * s) / q)],
    [sw, (s) => [x2 - r - s, y2]],
    [q, (s) => arc(x1 + r, y2 - r, 90 + (90 * s) / q)],
    [sh, (s) => [x1, y2 - r - s]],
    [q, (s) => arc(x1 + r, y1 + r, 180 + (90 * s) / q)],
    [sw / 2, (s) => [x1 + r + s, y1]],
  ];
  for (const [len, fn] of segs) {
    if (d <= len) return fn(d);
    d -= len;
  }
  return [x1 + w / 2, y1];
};

// gráfico: sobe da esquerda para a direita com respiros (eco da seta da logo)
const chartPt = (s) => [150 + 780 * s, 1400 - 520 * Math.pow(s, 1.3) + 45 * Math.sin(s * Math.PI * 3.2) * (1 - s * 0.6)];

// câmera única: [t, zoom, cx, cy, rotação]
const CAM = [[0, 1.3, 450, 860, -2], [0.15, 1.0, 540, 930, 0], [1.18, 1.05, 540, 920, 0], [1.75, 0.97, 540, 940, -1.2], [2.3, 1.0, 540, 930, 0], [3.46, 1.02, 540, 950, 0], [4.4, 1.04, 520, 1100, 0], [4.75, 1.05, 520, 880, 0], [5.4, 1.0, 540, 930, 0]];
const cam = (t) => {
  const k = (i) => trk(t, CAM.map((c) => [c[0], c[i]]), 7.5, 1);
  return {s: k(1), cx: k(2), cy: k(3), r: k(4)};
};

// palavra com máscara: entra de baixo no tempo da fala, sai para cima no fim do bloco
const Wd = ({t, at, out, size, weight, color = "#fff", children}) => {
  const inn = spr(t - at, 17, 0.93), o = out == null ? 0 : spr(t - out, 15, 1);
  return (
    <span style={{display: "inline-block", overflow: "hidden", padding: `${size * 0.08}px ${size * 0.06}px`, verticalAlign: "bottom"}}>
      <span style={{display: "inline-block", fontFamily: "Inter", fontWeight: weight, fontSize: size, lineHeight: 1.02, color, letterSpacing: -size * 0.025, transform: `translateY(${(1 - inn) * 118 - o * 118}%) skewX(-6deg)`}}>{children}</span>
    </span>
  );
};

// blocos de frase: uma expressão em destaque por vez
const BLOCKS = [
  {out: 3.4, lines: [{y: 990, size: 100, w: 400, c: LIGHT, words: [["Imagine", 2.26], ["pagar", 2.6]]}, {y: 1140, size: 138, w: 900, words: [["esse", 2.94], ["valor", 3.2]]}]},
  {out: 4.4, lines: [{y: 970, size: 100, w: 400, c: LIGHT, words: [["todos", 3.46], ["os", 3.9]]}, {y: 1150, size: 210, w: 900, words: [["meses", 4.22]]}]},
  {out: 5.33, lines: [{y: 480, size: 90, w: 400, c: LIGHT, words: [["sobre", 4.52], ["o", 4.78]]}, {y: 610, size: 118, w: 900, words: [["faturamento", 4.92]]}]},
  {out: null, lines: [{y: 480, size: 90, w: 400, c: LIGHT, words: [["da", 5.38], ["sua", 5.7]]}, {y: 610, size: 130, w: 900, words: [["empresa", 5.86]]}]},
];

export const MotionV3 = () => {
  const t = useCurrentFrame() / FPS_V3;
  const C = cam(t);
  const camT = `translate(540px,960px) rotate(${C.r}deg) scale(${C.s}) translate(${-C.cx}px,${-C.cy}px)`;

  // --- forma única: anel -> cartão -> painel do gráfico (bordas com molas diferentes) ---
  const R = {
    x1: trk(t, [[0, 70], [1.75, 60]], 9, 1),
    x2: trk(t, [[0, 1010], [1.75, 1020]], 9, 1),
    y1: trk(t, [[0, 470], [1.75, 360], [4.3, 330]], 13, 0.94),
    y2: trk(t, [[0, 1410], [1.75, 1500], [4.3, 1530]], 9, 0.97, 0.05),
    r: trk(t, [[0, 470], [1.75, 70]], 7, 1, 0.03),
  };
  const ringDraw = spr(t - 0.36, 6, 1);
  const glassK = cl(1 - (R.r - 70) / 400);

  // --- arco dourado: 12% do perímetro; percorre o contorno até a borda inferior ---
  const lenF = 0.12 * spr(t - 1.18, 9, 1);
  const u0 = 0.48 * spr(t - 1.75, 6.5, 1);
  const N = 24;
  const gPts = Array.from({length: N}, (_, k) => {
    const u = u0 + lenF * (1 - k / (N - 1));
    const a = rrPt(R.x1, R.y1, R.x2, R.y2, R.r, u);
    const dl = (N - 1 - k) * 0.012; // a ponta lidera
    const mx = spr(t - 4.42 - dl, 12, 0.95), my = spr(t - 4.42 - dl - 0.06, 12, 0.95);
    const b = chartPt(k / (N - 1));
    return [lerp(a[0], b[0], mx), lerp(a[1], b[1], my)];
  });
  const tip = gPts[N - 1], prev = gPts[N - 3];
  const tipAng = (Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) * 180) / Math.PI;
  const arrowS = spr(t - 5.05, 16, 0.9);
  const tipGlow = spr(t - 4.5, 10, 1) * (1 - 0.7 * spr(t - 5.4, 8, 1));
  const gridP = (i) => cl((t - 4.65 - i * 0.07) / 0.45);
  const areaP = cl((t - 4.75) / 0.9);

  // --- "12%": um só grupo que encolhe e vira rótulo (nada é apagado) ---
  const G = {x: trk(t, [[0, 540], [1.8, 255], [4.3, 870]], 12, 0.94), y: trk(t, [[0, 860], [1.8, 500], [4.3, 450]], 12, 0.94, 0.03), s: trk(t, [[0, 330], [1.8, 120], [4.3, 64]], 12, 0.96)};
  const chars = [["1", -274, 0], ["2", -56, 0.07], ["%", 217, 0.36]];
  const CAP = {x: trk(t, [[0, 540], [1.8, 255], [4.3, 870]], 12, 0.94, 0.05), y: trk(t, [[0, 1100], [1.8, 585], [4.3, 510]], 12, 0.94, 0.08), s: trk(t, [[0, 84], [1.8, 44], [4.3, 30]], 12, 0.96, 0.05)};

  return (
    <AbsoluteFill style={{background: P.deep}}>
      <Bg t={t} cam={C} />
      <div style={{position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: camT}}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          <defs>
            <linearGradient id="g3glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(120,185,255,0.20)" /><stop offset="1" stopColor="rgba(10,73,172,0.08)" /></linearGradient>
            <linearGradient id="g3gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe38a" /><stop offset="1" stopColor={P.gold2} /></linearGradient>
            <linearGradient id="g3area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(10,143,237,0.38)" /><stop offset="1" stopColor="rgba(10,143,237,0)" /></linearGradient>
            <radialGradient id="g3tip"><stop offset="0" stopColor="rgba(246,181,42,0.6)" /><stop offset="1" stopColor="rgba(246,181,42,0)" /></radialGradient>
            <clipPath id="g3clip"><rect x="140" y="700" width={Math.max(1, (tip[0] - 140) * areaP)} height="840" /></clipPath>
          </defs>
          {/* trilho largo e contorno luminoso da forma única */}
          <rect x={R.x1} y={R.y1} width={R.x2 - R.x1} height={R.y2 - R.y1} rx={Math.min(R.r, (R.x2 - R.x1) / 2, (R.y2 - R.y1) / 2)} fill="url(#g3glass)" fillOpacity={glassK} stroke="rgba(143,208,255,0.10)" strokeWidth={30} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ringDraw} />
          <rect x={R.x1} y={R.y1} width={R.x2 - R.x1} height={R.y2 - R.y1} rx={Math.min(R.r, (R.x2 - R.x1) / 2, (R.y2 - R.y1) / 2)} fill="none" stroke="#8fd0ff" strokeWidth={5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ringDraw} style={{filter: "drop-shadow(0 0 14px rgba(10,143,237,0.8))"}} />
          {/* grade e área do gráfico */}
          {[0, 1, 2, 3].map((i) => <line key={i} x1="150" x2={150 + 780 * gridP(i)} y1={950 + i * 150} y2={950 + i * 150} stroke="rgba(190,225,255,0.13)" strokeWidth="2" />)}
          <path d={`${crPath(gPts)} L${tip[0]} 1500 L${gPts[0][0]} 1500 Z`} fill="url(#g3area)" clipPath="url(#g3clip)" opacity={areaP} />
          {/* arco dourado = 12% -> borda inferior -> gráfico */}
          {lenF > 0.002 && <path d={crPath(gPts)} fill="none" stroke="url(#g3gold)" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" style={{filter: "drop-shadow(0 0 12px rgba(246,181,42,0.75))"}} />}
          <circle cx={tip[0]} cy={tip[1]} r={150} fill="url(#g3tip)" opacity={tipGlow} />
          <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${tipAng}) scale(${arrowS})`}><path d="M-40,-32 L36,0 L-40,32 L-20,0 Z" fill="url(#g3gold)" /></g>
        </svg>

        {/* grupo "12%" */}
        <div style={{position: "absolute", left: G.x, top: G.y, transform: `scale(${G.s / 330})`, transformOrigin: "0 0"}}>
          {chars.map(([c, dx, at]) => {
            const w = c === "%" ? 330 : 218, h = 400;
            return (
              <div key={c} style={{position: "absolute", left: dx - w / 2, top: -h / 2, width: w, height: h, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <div style={{fontFamily: "Inter", fontWeight: 900, fontSize: 330, lineHeight: 1, color: "#fff", letterSpacing: -10, transform: `translateY(${(1 - spr(t - at, 15, 0.9)) * 120}%) skewX(-8deg)`, textShadow: "0 18px 40px rgba(0,8,40,0.55)"}}>{c}</div>
              </div>
            );
          })}
        </div>
        {/* "de imposto" acompanha o número */}
        <div style={{position: "absolute", left: CAP.x - 600, top: CAP.y, width: 1200, transform: "translateY(-50%)", display: "flex", justifyContent: "center", columnGap: CAP.s * 0.22}}>
          <Wd t={t} at={0.84} size={CAP.s} weight={400} color={LIGHT}>de</Wd>
          <Wd t={t} at={1.18} size={CAP.s} weight={800}>imposto</Wd>
        </div>

        {/* blocos de frase */}
        {BLOCKS.map((b, bi) => b.lines.map((ln, li) => (
          <div key={bi + "-" + li} style={{position: "absolute", left: 0, width: 1080, top: ln.y, transform: "translateY(-50%)", display: "flex", justifyContent: "center", columnGap: ln.size * 0.2}}>
            {ln.words.map(([w, at]) => <Wd key={w} t={t} at={at} out={b.out == null ? null : b.out + li * 0.04} size={ln.size} weight={ln.w} color={ln.c || "#fff"}>{w}</Wd>)}
          </div>
        )))}
      </div>
      <Audio src={staticFile("narracao.mp3")} volume={(f) => (f > 690 ? Math.max(0, 1 - (f - 690) / 30) : 1)} />
      <Audio src={staticFile("bed.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};

// Animações do site Diego Mudanças, versão "direção de arte".
// - CoverScene: uma peça por vez (geladeira, sofá, cama box) recebe a capa acolchoada azul
//   da Diego, que desce acompanhando o volume, assenta no chão e recebe plástico stretch.
// - RouteScene: mapa de cima, com o caminhão branco da frota (faixa azul) percorrendo a rota.
//   Um elemento se move por vez. Sem textos dentro do vídeo: as etapas ficam no HTML.
import React from "react";
import {AbsoluteFill, staticFile, useCurrentFrame, interpolate, Easing} from "remotion";

const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const ip = (f, a, b, from, to, e = ease) => interpolate(f, [a, b], [from, to], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e});

// cores reais: capa azul royal, piping mais escuro, marinho do uniforme e do letreiro
const CAPA = "#2153D2", CAPA_ESC = "#163E9F", PIPING = "#12317F";

/* ================= projeção oblíqua (profundidade sobe para a direita) ================= */
const mkP = (k, ox, oy, cx = 0.46, cy = 0.27) => (x, y, z) => [ox + (x + z * cx) * k, oy - (y + z * cy) * k];
const pts = (a) => a.map((p) => p.join(",")).join(" ");

// faces visíveis de uma caixa (frente, topo, lateral direita)
function faces(P, b, inf = 0) {
  const x0 = b.x - inf, x1 = b.x + b.w + inf, y0 = b.y - (b.y > 0.5 ? inf : 0), y1 = b.y + b.h + inf, z0 = b.z - inf, z1 = b.z + b.d + inf;
  return {
    front: [P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)],
    top: [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)],
    side: [P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)],
  };
}

/* ================= peças (medidas em cm) ================= */
const PIECES = {
  fridge: {
    k: 3.55, size: [70, 182, 68],
    boxes: [{x: 0, y: 1.5, z: 0, w: 70, h: 180.5, d: 68, mat: "fridge"}],
    feet: [[3, 0, 3], [63, 0, 3]],
    bands: 6, logo: {box: 0, x: 0.5, y: 0.6, w: 0.62},
  },
  sofa: {
    k: 3.1, size: [212, 86, 92],
    boxes: [
      {x: 22, y: 14, z: 62, w: 168, h: 72, d: 30, mat: "fab", r: 6}, // encosto
      {x: 0, y: 14, z: 0, w: 212, h: 26, d: 92, mat: "fabD"}, // base
      {x: 22, y: 40, z: 0, w: 56, h: 14, d: 62, mat: "fabL", r: 5}, // assentos
      {x: 78, y: 40, z: 0, w: 56, h: 14, d: 62, mat: "fabL", r: 5},
      {x: 134, y: 40, z: 0, w: 56, h: 14, d: 62, mat: "fabL", r: 5},
      {x: 0, y: 14, z: 0, w: 22, h: 50, d: 92, mat: "fab", r: 7}, // braços
      {x: 190, y: 14, z: 0, w: 22, h: 50, d: 92, mat: "fab", r: 7},
    ],
    legs: [[4, 4], [200, 4]],
    bands: 3, logo: {box: 0, x: 0.5, y: 0.8, w: 0.3},
  },
  bed: {
    k: 3.25, size: [190, 66, 140],
    boxes: [
      {x: 0, y: 7, z: 0, w: 188, h: 33, d: 138, mat: "base"},
      {x: 1, y: 40, z: 1, w: 186, h: 26, d: 136, mat: "mattress", r: 5},
    ],
    legs: [[6, 6], [176, 6]],
    bands: 3, logo: {box: 0, x: 0.5, y: 0.5, w: 0.25},
  },
};

const MAT = {
  fridge: {front: "url(#gFridge)", top: "#EEF1F4", side: "#CDD3DB"},
  fab: {front: "#B4AA9D", top: "#C6BDB1", side: "#9C9285"},
  fabL: {front: "#BDB3A6", top: "#CFC7BC", side: "#A49A8D"},
  fabD: {front: "#A89E91", top: "#BAB1A5", side: "#90867A"},
  base: {front: "#555C68", top: "#636B78", side: "#474D58"},
  mattress: {front: "url(#gMat)", top: "#F4F5F7", side: "#E1E4E9"},
};

const Defs = ({k}) => {
  const cw = 9 * k, ch = 12 * k; // gomos da capa: ~9 x 12 cm, como nas capas reais
  return (
    <defs>
      <linearGradient id="gFridge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F7F8FA" /><stop offset="1" stopColor="#E3E7EC" /></linearGradient>
      <linearGradient id="gMat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6F7F9" /><stop offset="1" stopColor="#E4E7EC" /></linearGradient>
      <radialGradient id="gCell" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stopColor="#2D5EDC" /><stop offset="0.75" stopColor={CAPA} /><stop offset="1" stopColor="#1C4AC4" /></radialGradient>
      <linearGradient id="shadeF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.07" /><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#06143F" stopOpacity="0.22" /></linearGradient>
      <pattern id="quilt" width={cw} height={ch} patternUnits="userSpaceOnUse">
        <rect width={cw} height={ch} fill="url(#gCell)" />
        <path d={`M0 0.5H${cw}M0.5 0V${ch}`} stroke={CAPA_ESC} strokeOpacity={0.55} strokeWidth={1.4} strokeDasharray="4 3" fill="none" />
      </pattern>
      <pattern id="quiltSide" width={cw} height={ch} patternUnits="userSpaceOnUse" patternTransform="skewY(-30)">
        <rect width={cw} height={ch} fill="url(#gCell)" />
        <path d={`M0 0.5H${cw}M0.5 0V${ch}`} stroke={CAPA_ESC} strokeOpacity={0.55} strokeWidth={1.4} strokeDasharray="4 3" fill="none" />
      </pattern>
      <pattern id="quiltTop" width={cw} height={ch * 0.55} patternUnits="userSpaceOnUse" patternTransform="skewX(-58)">
        <rect width={cw} height={ch * 0.55} fill="url(#gCell)" />
        <path d={`M0 0.5H${cw}M0.5 0V${ch}`} stroke={CAPA_ESC} strokeOpacity={0.5} strokeWidth={1.3} strokeDasharray="4 3" fill="none" />
      </pattern>
      <pattern id="mquilt" width={7 * k} height={7 * k} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d={`M0 0.5H${7 * k}M0.5 0V${7 * k}`} stroke="#C9CED6" strokeWidth={1.2} fill="none" />
      </pattern>
      <linearGradient id="hemShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A1A44" stopOpacity="0.42" /><stop offset="1" stopColor="#0A1A44" stopOpacity="0" /></linearGradient>
      <linearGradient id="film" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.16" /><stop offset="0.42" stopColor="#fff" stopOpacity="0.24" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" /><stop offset="0.58" stopColor="#fff" stopOpacity="0.2" /><stop offset="1" stopColor="#fff" stopOpacity="0.12" />
      </linearGradient>
      <filter id="blur18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
      <filter id="blur5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
    </defs>
  );
};

const Room = () => (
  <AbsoluteFill style={{background: "linear-gradient(180deg,#EEF1F5 0%,#E6EAEF 70%)"}}>
    <div style={{position: "absolute", left: 0, right: 0, top: 846, bottom: 0, background: "linear-gradient(180deg,#D3D8DF 0%,#C9CFD7 100%)"}} />
    <div style={{position: "absolute", left: 0, right: 0, top: 832, height: 14, background: "#F7F8FA", boxShadow: "0 2px 0 rgba(0,0,0,.06)"}} />
  </AbsoluteFill>
);

// borda inferior da capa (barra), com ondulação que aumenta quando o tecido assenta no chão
const hemPath = (y, amp, ph, W = 1080) => {
  let d = `M-20 -20 H${W + 20} V${y}`;
  for (let x = W + 20; x >= -20; x -= 12) d += ` L${x} ${y + amp * Math.sin(x / 41 + ph) + amp * 0.45 * Math.sin(x / 13 + ph * 2)}`;
  return d + " Z";
};
const hemLine = (y, amp, ph, W = 1080) => {
  let d = "";
  for (let x = -20; x <= W + 20; x += 12) d += `${d ? "L" : "M"}${x} ${y + amp * Math.sin(x / 41 + ph) + amp * 0.45 * Math.sin(x / 13 + ph * 2)}`;
  return d;
};

export const COVER_T = 6.2;
export const CoverScene = ({item = "fridge"}) => {
  const f = useCurrentFrame();
  const pc = PIECES[item], k = pc.k, [W, H, D] = pc.size;
  const floorY = 900;
  const spanX = (W + D * 0.46) * k;
  const ox = 540 - spanX / 2, P = mkP(k, ox, floorY);
  const topY = floorY - (H + D * 0.27) * k;

  // tempo: 0,6 s parado; 0,6–2,8 s a capa desce; 2,8–3,4 s assenta; 3,4–5,2 s plástico stretch; depois parado
  const descend = ip(f, 18, 84, 0, 1, Easing.bezier(0.42, 0, 0.25, 1));
  const settle = f < 84 ? 0 : Math.exp(-(f - 84) / 7) * Math.sin((f - 84) / 3.2);
  const contact = ip(f, 80, 100, 0, 1, out);
  const hemY = topY - 30 + (floorY + 22 - (topY - 30)) * descend + settle * 5;
  const amp = 2.5 + 6.5 * contact;
  const ph = 0.6 + f * 0.012 * (1 - contact);

  const bare = pc.boxes.map((b) => ({b, F: faces(P, b, 0)}));
  const cov = pc.boxes.map((b) => ({b, F: faces(P, b, 1.8)}));
  const silhouette = (list) => list.map(({F}, i) => <g key={i}><polygon points={pts(F.front)} /><polygon points={pts(F.top)} /><polygon points={pts(F.side)} /></g>);

  // pés e contato com o chão
  const foot = pc.feet || (pc.legs || []).flatMap(([x, z]) => [[x, 0, z], [x, 0, D - z - 6]]);
  const footprint = [P(-2, 0, -2), P(W + 2, 0, -2), P(W + 2, 0, D + 2), P(-2, 0, D + 2)];

  const nb = pc.bands, bandStart = 104, bandDur = Math.round(50 / nb);
  const lg = pc.logo, lb = cov[lg.box].F.front;
  const lw = (lb[1][0] - lb[0][0]) * lg.w, lx = lb[0][0] + (lb[1][0] - lb[0][0]) * lg.x - lw / 2, ly = lb[3][1] + (lb[0][1] - lb[3][1]) * (1 - lg.y);

  return (
    <AbsoluteFill>
      <Room />
      <svg width={1080} height={1080} style={{position: "absolute"}}>
        <Defs k={k} />
        <clipPath id="cBare">{silhouette(bare)}</clipPath>
        <clipPath id="cCov">{silhouette(cov)}</clipPath>
        <clipPath id="cHem"><path d={hemPath(hemY, amp, ph)} /></clipPath>

        {/* sombra de contato: difusa + oclusão junto à base */}
        <polygon points={pts(footprint)} fill="#0B1530" opacity={0.22 + 0.06 * contact} filter="url(#blur18)" transform={`translate(0 ${6})`} />
        <line x1={P(0, 0, 0)[0]} y1={floorY + 1} x2={P(W, 0, 0)[0]} y2={floorY + 1} stroke="#0B1530" strokeOpacity={0.35} strokeWidth={6} filter="url(#blur5)" />

        {/* pés / pernas */}
        {foot.map(([x, , z], i) => {
          const a = P(x, 0, z), b = P(x + 6, 0, z);
          const h = (pc.boxes[0].y || 7) * k;
          return <rect key={i} x={a[0]} y={a[1] - h} width={b[0] - a[0]} height={h} rx={2} fill={item === "sofa" ? "#4A3A2E" : "#2B2F36"} />;
        })}

        {/* peça sem capa */}
        {bare.map(({b, F}, i) => {
          const m = MAT[b.mat];
          return (
            <g key={i}>
              <polygon points={pts(F.side)} fill={m.side} />
              <polygon points={pts(F.top)} fill={m.top} />
              <polygon points={pts(F.front)} fill={m.front} />
              {b.mat === "mattress" && <><polygon points={pts(F.front)} fill="url(#mquilt)" opacity={0.8} /><polygon points={pts(F.top)} fill="url(#mquilt)" opacity={0.5} /></>}
            </g>
          );
        })}
        {item === "fridge" && (() => {
          const fr = bare[0].F.front, x0 = fr[0][0], x1 = fr[1][0], yb = fr[0][1], yt = fr[3][1], hh = yb - yt;
          const split = yt + hh * 0.3;
          return (
            <g>
              <line x1={x0} y1={split} x2={x1} y2={split} stroke="#B8BFC9" strokeWidth={3} />
              <rect x={x1 - 26} y={yt + hh * 0.08} width={9} height={hh * 0.17} rx={4.5} fill="#8E97A3" />
              <rect x={x1 - 26} y={split + hh * 0.06} width={9} height={hh * 0.3} rx={4.5} fill="#8E97A3" />
              <rect x={x0} y={yb - 16} width={x1 - x0} height={16} fill="#D5DAE0" />
            </g>
          );
        })()}

        {/* sombra que a barra da capa projeta sobre a peça ainda descoberta */}
        <g clipPath="url(#cBare)" opacity={1 - contact}>
          <rect x={0} y={hemY - 2} width={1080} height={34} fill="url(#hemShade)" />
        </g>

        {/* a capa: visível só acima da barra */}
        <g clipPath="url(#cHem)">
          {cov.map(({F}, i) => (
            <g key={i}>
              {/* contorno arredondado: o acolchoado deixa as arestas macias */}
              {[F.side, F.top, F.front].map((q, j) => <polygon key={j} points={pts(q)} fill="none" stroke={j === 0 ? "#173FA6" : "#1D4CC8"} strokeWidth={9} strokeLinejoin="round" />)}
              <polygon points={pts(F.side)} fill="url(#quiltSide)" />
              <polygon points={pts(F.side)} fill="#06143F" opacity={0.34} />
              <polygon points={pts(F.top)} fill="url(#quiltTop)" />
              <polygon points={pts(F.top)} fill="#fff" opacity={0.1} />
              <polygon points={pts(F.front)} fill="url(#quilt)" />
              {/* luz de cima: o volume escurece em direção ao chão */}
              <polygon points={pts(F.front)} fill="url(#shadeF)" />
              {/* acabamento (viés) nas arestas */}
              <polyline points={pts([F.front[0], F.front[3], F.front[2], F.side[2], F.side[1]])} fill="none" stroke={PIPING} strokeOpacity={0.75} strokeWidth={2.4} strokeLinejoin="round" />
              <polyline points={pts([F.front[2], F.front[1]])} fill="none" stroke={PIPING} strokeOpacity={0.75} strokeWidth={2.4} />
            </g>
          ))}
          {/* gradiente vertical de volume sobre toda a capa */}
          <g clipPath="url(#cCov)"><rect x={0} y={topY - 20} width={1080} height={floorY - topY + 40} fill="url(#hemShade)" opacity={0} /></g>
          <image href={staticFile("craft/letreiro.png")} x={lx} y={ly - lw * 0.275} width={lw} height={lw * 0.55} opacity={0.92} />
          {/* dobras que se formam quando o tecido toca o chão */}
          <g clipPath="url(#cCov)" opacity={contact}>
            {[0.16, 0.38, 0.61, 0.83].map((u, i) => {
              const fr = cov[item === "sofa" ? 1 : 0].F.front, x = fr[0][0] + (fr[1][0] - fr[0][0]) * u + (i % 2 ? 6 : -4), yb = fr[0][1];
              const len = 34 + (i % 2) * 18;
              return <g key={i}>
                <path d={`M${x} ${yb + 4} q ${-5} ${-len / 2} ${2} ${-len}`} stroke="#0B246E" strokeOpacity={0.55} strokeWidth={5} fill="none" strokeLinecap="round" filter="url(#blur5)" />
                <path d={`M${x + 5} ${yb + 2} q ${-4} ${-len / 2} ${2} ${-len + 6}`} stroke="#5E86F0" strokeOpacity={0.4} strokeWidth={2} fill="none" strokeLinecap="round" />
              </g>;
            })}
          </g>
        </g>
        {/* barra da capa */}
        <g clipPath="url(#cCov)">
          <path d={hemLine(hemY, amp, ph)} stroke={PIPING} strokeWidth={5} fill="none" />
        </g>

        {/* plástico stretch: faixas que envolvem a peça de baixo para cima */}
        <g clipPath="url(#cCov)">
          {Array.from({length: nb}, (_, i) => {
            const p = ip(f, bandStart + i * bandDur, bandStart + (i + 1) * bandDur + 6, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
            if (p <= 0) return null;
            const bh = (floorY - topY) / nb, y = floorY + 8 - (i + 1) * bh - 6;
            const x0 = ox - 20, wv = (spanX + 40) * p;
            return <g key={i}>
              <rect x={x0} y={y} width={wv} height={bh + 12} fill="url(#film)" />
              <line x1={x0} y1={y} x2={x0 + wv} y2={y} stroke="#fff" strokeOpacity={0.55} strokeWidth={2} />
            </g>;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ================= rota ================= */
export const ROUTE_T = 11;
// ruas do mapa (coordenadas 0-1080)
const STREETS = [
  "M-20 820 H1100", "M-20 600 H1100", "M-20 380 H1100", "M-20 170 H1100",
  "M190 -20 V1100", "M430 -20 V1100", "M690 -20 V1100", "M900 -20 V1100",
  "M-20 980 L520 700", "M560 520 L1100 250",
];
const PIN_O = [92, 948], PIN_D = [985, 236];
const ROUTE = [[190, 1040], [190, 820], [430, 820], [430, 600], [690, 600], [690, 380], [900, 380], [900, 190]];
const segs = (() => {
  const s = []; let L = 0;
  for (let i = 1; i < ROUTE.length; i++) { const a = ROUTE[i - 1], b = ROUTE[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); s.push({a, b, l, L0: L}); L += l; }
  return {s, L};
})();
const raw = (d) => {
  d = cl(d, 0, segs.L);
  for (const g of segs.s) if (d <= g.L0 + g.l + 1e-6) { const u = (d - g.L0) / g.l; return [g.a[0] + (g.b[0] - g.a[0]) * u, g.a[1] + (g.b[1] - g.a[1]) * u]; }
  return ROUTE[ROUTE.length - 1];
};
// posição e direção suavizadas: o caminhão faz a curva em vez de girar no lugar
const along = (d) => {
  let x = 0, y = 0, n = 0;
  for (let o = -24; o <= 24; o += 6) { const q = raw(d + o); x += q[0]; y += q[1]; n++; }
  const a = raw(d - 26), b = raw(d + 26);
  return {x: x / n, y: y / n, ang: Math.atan2(b[1] - a[1], b[0] - a[0])};
};
const routeD = "M" + ROUTE.map((p) => p.join(" ")).join(" L");

// caminhão visto de cima, com a pintura da frota: baú branco com faixa azul diagonal
const TruckTop = ({x, y, ang}) => (
  <g transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI}) scale(1.2)`}>
    <rect x={-60} y={-24} width={124} height={48} rx={6} fill="#0B1530" opacity={0.35} transform="translate(5 6)" />
    {/* baú */}
    <rect x={-62} y={-22} width={88} height={44} rx={3} fill="#F5F7FA" stroke="#C9D0DA" strokeWidth={1.5} />
    {Array.from({length: 7}, (_, i) => <line key={i} x1={-58 + i * 12} y1={-20} x2={-58 + i * 12} y2={20} stroke="#DCE1E8" strokeWidth={1.2} />)}
    <path d="M-30 22 L-6 -22 L8 -22 L-16 22 Z" fill="#1F4FD0" />
    <path d="M-12 22 L12 -22 L16 -22 L-8 22 Z" fill="#12317F" />
    {/* cabine */}
    <rect x={30} y={-20} width={32} height={40} rx={7} fill="#FFFFFF" stroke="#C9D0DA" strokeWidth={1.5} />
    <rect x={50} y={-16} width={9} height={32} rx={3} fill="#22324F" />
    <rect x={30} y={-20} width={8} height={40} fill="#1F4FD0" opacity={0.9} />
  </g>
);

const Pin = ({x, y, drop = 1, solid = true, check = 0}) => {
  const lift = (1 - drop) * 70, sq = drop >= 1 ? 1 : 1;
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={18 * (0.4 + 0.6 * drop)} ry={6 * (0.4 + 0.6 * drop)} fill="#000" opacity={0.3 * drop} />
      <g transform={`translate(${x} ${y - lift}) scale(${sq})`} opacity={cl(drop * 3)}>
        <path d="M0 0 C -6 -14 -26 -30 -26 -52 A 26 26 0 1 1 26 -52 C 26 -30 6 -14 0 0 Z" fill={solid ? "#FFFFFF" : "none"} stroke="#FFFFFF" strokeWidth={4} />
        <circle cx={0} cy={-52} r={10} fill={solid ? "#1F4FD0" : "none"} stroke={solid ? "none" : "#FFFFFF"} strokeWidth={3} />
        {check > 0 && <g transform={`translate(0 -52) scale(${check})`}><circle r={15} fill="#2DB5E0" /><path d="M-6 0 L-2 5 L7 -5" stroke="#06143F" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
      </g>
    </g>
  );
};

const Box = ({x, y, s = 1, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-13} y={-13} width={26} height={26} rx={3} fill="#C89B62" stroke="#9C7443" strokeWidth={1.5} />
    <line x1={-13} y1={0} x2={13} y2={0} stroke="#9C7443" strokeWidth={1.5} />
  </g>
);

export const RouteScene = () => {
  const f = useCurrentFrame(), t = f / 30;
  const O = PIN_O, Dst = PIN_D;
  // 1. você conta (0–2,2 s): pino de saída pousa, rota planejada aparece
  const drop = ip(f, 6, 26, 0, 1, Easing.bezier(0.5, 0, 0.75, 0)); // cai com aceleração (peso)
  const plan = ip(f, 30, 62, 0, 1);
  const dstShow = ip(f, 54, 66, 0, 1);
  // 2. a gente protege (2,2–4,4 s): caixas entram no caminhão estacionado
  const truckIn = ip(f, 66, 92, 0, 1, out);
  // 3. transportamos (4,4–8,4 s)
  const drive = ip(f, 132, 252, 0, 1, Easing.bezier(0.55, 0, 0.35, 1));
  // 4. descarregar (8,4–11 s)
  const unload = (i) => ip(f, 258 + i * 9, 274 + i * 9, 0, 1, out);
  const check = ip(f, 292, 304, 0, 1, Easing.bezier(0.3, 1.6, 0.5, 1));
  const fade = ip(f, 318, 330, 1, 0, Easing.linear) * ip(f, 0, 6, 0, 1, Easing.linear);

  const startD = 110; // caminhão estaciona em frente à casa de saída
  const endD = segs.L - 70, pos = along(startD + (endD - startD) * drive);
  const parkIn = along(startD - 90 + 90 * truckIn);
  const tr = drive > 0 ? pos : {...parkIn, ang: -Math.PI / 2};
  const lineLen = segs.L * plan;

  return (
    <AbsoluteFill style={{background: "#0A1D50"}}>
      <svg width={1080} height={1080} style={{position: "absolute", opacity: fade}}>
        {/* quarteirões e ruas: discretos, sem brilho */}
        {STREETS.map((d, i) => <path key={i} d={d} stroke="#163178" strokeWidth={i > 7 ? 18 : 30} fill="none" />)}
        {STREETS.map((d, i) => <path key={"c" + i} d={d} stroke="#1A3480" strokeWidth={1.5} strokeDasharray="10 14" fill="none" />)}
        {/* rota planejada */}
        <path d={routeD} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={6} fill="none" strokeDasharray="2 14" strokeLinecap="round" strokeLinejoin="round"
          style={{strokeDashoffset: 0}} pathLength={segs.L} clipPath="url(#planClip)" />
        <clipPath id="planClip"><path d={routeD} pathLength={segs.L} stroke="#000" strokeWidth={40} fill="none" strokeDasharray={`${lineLen} ${segs.L}`} /></clipPath>
        {/* trecho percorrido */}
        <path d={routeD} stroke="#2DB5E0" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={`${(startD + (endD - startD) * drive) * (drive > 0 ? 1 : 0)} ${segs.L * 2}`} />
        {/* destino */}
        <g opacity={dstShow}><Pin x={Dst[0]} y={Dst[1] - 6} drop={1} solid={check > 0} check={check} /></g>
        {/* caixas da etapa 2: saem da casa e entram pela traseira do caminhão, uma de cada vez */}
        {f >= 70 && f < 140 && [0, 1, 2].map((i) => {
          const p = ip(f, 96 + i * 12, 116 + i * 12, 0, 1, Easing.bezier(0.4, 0, 0.2, 1));
          if (p >= 1) return null;
          const rear = {x: tr.x, y: tr.y + 66};
          const sx = O[0] + 4 + i * 30, sy = O[1] + 44;
          return <Box key={i} x={sx + (rear.x - sx) * p} y={sy + (rear.y - sy) * p} s={1 - 0.3 * p} o={ip(f, 70, 80, 0, 1)} />;
        })}
        {/* caixas descarregadas no destino */}
        {[0, 1, 2].map((i) => {
          const p = unload(i);
          if (p <= 0) return null;
          const from = {x: pos.x, y: pos.y + 66}, to = {x: Dst[0] - 40 + i * 30, y: Dst[1] + 46};
          return <Box key={"u" + i} x={from.x + (to.x - from.x) * p} y={from.y + (to.y - from.y) * p} s={0.75 + 0.25 * p} />;
        })}
        {/* caminhão */}
        {truckIn > 0 && <g opacity={cl(truckIn * 2)}><TruckTop x={tr.x} y={tr.y + (drive > 0 ? 0 : 0)} ang={tr.ang} /></g>}
        {/* saída */}
        <Pin x={O[0]} y={O[1]} drop={drop} />
      </svg>
    </AbsoluteFill>
  );
};

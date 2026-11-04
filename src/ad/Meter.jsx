import React from "react";

// Medidor 100% -> 12%: anel (m=0) que se desenrola em barra (m=1) mantendo a proporção.
// u ∈ [0,1] percorre o total; [0, share] é a parcela de imposto (sentido horário a partir das 12h),
// que na barra ocupa a ponta direita.
const pts = (u0, u1, m, L, n = 64) => {
  const k = Math.max(1e-4, 1 - m) * (2 * Math.PI) / L; // curvatura
  const r = 1 / k;
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = u0 + ((u1 - u0) * i) / n;
    const s = L / 2 - u * L; // comprimento de arco a partir do ponto médio (base do anel)
    const x = Math.sin(k * s) * r;
    const y = -(1 - Math.cos(k * s)) * r + (1 - m) * (1 - m) * (L / (2 * Math.PI));
    out.push([x, y]);
  }
  return out;
};
const path = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");

export const Meter = ({
  x, y, // posição do centro (anel) / centro (barra)
  R = 300, L = 900, m = 0, sw = 70, // raio do anel, comprimento da barra, morph, espessura
  share = 0.12, gap = 0.012,
  pBlue = 1, pGold = 1, // fração desenhada
  goldCol = 1, // 1 = dourado (imposto), 0 = azul da logo
  goldLift = 0, // deslocamento vertical da parcela na barra
  track = 1, // opacidade do restante
  opacity = 1,
  glow = 0.6,
  idSuffix = "a",
}) => {
  const len = R * 2 * Math.PI * (1 - m) + L * m;
  const blueEnd = share + gap + (1 - share - 2 * gap) * pBlue;
  const blue = pBlue > 0.001 ? pts(share + gap, blueEnd, m, len) : null;
  const gold = pGold > 0.001 ? pts(0, share * pGold, m, len, 24) : null;
  const S = 2 * Math.max(R, L / 2) + sw * 2 + 200;
  const g1 = `rgb(${255 + (60 - 255) * (1 - goldCol)}, ${194 + (150 - 194) * (1 - goldCol)}, ${61 + (255 - 61) * (1 - goldCol)})`;
  const g2 = `rgb(${232 + (10 - 232) * (1 - goldCol)}, ${137 + (80 - 137) * (1 - goldCol)}, ${12 + (230 - 12) * (1 - goldCol)})`;
  return (
    <svg width={S} height={S} viewBox={`${-S / 2} ${-S / 2} ${S} ${S}`} style={{position: "absolute", left: x - S / 2, top: y - S / 2, opacity, overflow: "visible"}}>
      <defs>
        <linearGradient id={`mb${idSuffix}`} x1="0" y1={-R} x2="0" y2={R} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3d8bff" />
          <stop offset="1" stopColor="#0b45d6" />
        </linearGradient>
        <linearGradient id={`mg${idSuffix}`} x1={-sw} y1={-R} x2={R} y2={R * 0.2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={g1} />
          <stop offset="1" stopColor={g2} />
        </linearGradient>
        <filter id={`mgl${idSuffix}`} filterUnits="userSpaceOnUse" x={-S / 2} y={-S / 2} width={S} height={S}>
          <feGaussianBlur stdDeviation={sw * 0.35} />
        </filter>
        <filter id={`mhl${idSuffix}`} filterUnits="userSpaceOnUse" x={-S / 2} y={-S / 2} width={S} height={S}>
          <feGaussianBlur stdDeviation={sw * 0.08} />
        </filter>
      </defs>
      {blue && (
        <g opacity={track}>
          <path d={path(blue)} fill="none" stroke="#000a2e" strokeOpacity="0.45" strokeWidth={sw} transform={`translate(0 ${sw * 0.18})`} filter={`url(#mgl${idSuffix})`} />
          <path d={path(blue)} fill="none" stroke={`url(#mb${idSuffix})`} strokeWidth={sw} />
          <path d={path(blue)} fill="none" stroke="#9cc8ff" strokeOpacity="0.28" strokeWidth={sw * 0.38} filter={`url(#mhl${idSuffix})`} />
        </g>
      )}
      {gold && (
        <g transform={`translate(0 ${goldLift})`}>
          <path d={path(gold)} fill="none" stroke={g1} strokeOpacity={0.55 * glow} strokeWidth={sw * 1.3} filter={`url(#mgl${idSuffix})`} />
          <path d={path(gold)} fill="none" stroke={`url(#mg${idSuffix})`} strokeWidth={sw} />
          <path d={path(gold)} fill="none" stroke="#fff6d8" strokeOpacity="0.45" strokeWidth={sw * 0.34} filter={`url(#mhl${idSuffix})`} />
        </g>
      )}
    </svg>
  );
};

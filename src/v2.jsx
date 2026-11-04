import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from "remotion";

// ====== princípios (referência de movimento): tudo é função pura do tempo, molas em forma fechada,
// somas de molas para múltiplos alvos, bordas líder/seguidora com molas diferentes, câmera única,
// sem bounce. Motion blur por subquadros (composição a 120 fps -> tmix -> 30 fps).
export const FPS_V2 = 120;
export const P = {deep: "#01071b", navy: "#02103d", mid: "#0a1a64", blue: "#0a49ac", lum: "#0a8fed", silver: "#d6dae0", gold: "#f6b52a", gold2: "#e08f08"};
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

// resposta ao degrau de uma mola (subamortecida, quase crítica => overshoot mínimo)
export const spr = (t, w = 15, z = 0.9) => {
  if (t <= 0) return 0;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w * t) * (1 + w * t);
};
// valor = v0 + soma de uma mola por mudança de alvo
export const trk = (t, pts, w = 15, z = 0.9, delay = 0) => {
  let v = pts[0][1];
  for (let i = 1; i < pts.length; i++) v += (pts[i][1] - pts[i - 1][1]) * spr(t - pts[i][0] - delay, w, z);
  return v;
};

// ====== câmera (um único objeto: zoom + centro), tempos pela fala ======
const CAM = [[0, 1.0, 540, 960], [0.3, 1.07, 560, 880], [1.25, 1.03, 560, 880], [1.78, 1.07, 620, 850], [2.4, 1.0, 540, 900], [4.25, 1.07, 480, 1130], [4.62, 1.08, 580, 800], [5.45, 1.0, 540, 980]];
const camAt = (t) => ({
  s: trk(t, CAM.map((c) => [c[0], c[1]]), 7.5, 1),
  cx: trk(t, CAM.map((c) => [c[0], c[2]]), 7.5, 1),
  cy: trk(t, CAM.map((c) => [c[0], c[3]]), 7.5, 1),
});
const layerT = (cam, z) => {
  const s = 1 + (cam.s - 1) * z, cx = 540 + (cam.cx - 540) * z, cy = 960 + (cam.cy - 960) * z;
  return `translate(540px,960px) scale(${s}) translate(${-cx}px,${-cy}px)`;
};

// ====== fundo azul da identidade (cores extraídas da logo) ======
export const Bg = ({t, cam}) => {
  const glow = trk(t, [[0, 0.8], [1.8, 1.0], [2.4, 0.8], [4.3, 1.0], [5.3, 0.85]], 6, 1);
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: layerT(cam, 0.3)}}>
      <div style={{position: "absolute", left: -600, top: -600, width: 2280, height: 3120, background: `radial-gradient(ellipse 1100px 900px at 520px 520px, rgba(10,143,237,${0.5 * glow}), transparent 70%), radial-gradient(ellipse 1000px 1100px at 1250px 1900px, rgba(10,73,172,${0.55 * glow}), transparent 70%), linear-gradient(180deg, ${P.mid} 0%, ${P.navy} 45%, ${P.deep} 100%)`}} />
      <svg width="1080" height="1920" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        {[[-200, 0.07], [520, 0.05], [1150, 0.06]].map(([x, o], i) => (
          <polygon key={i} points={`${x + t * 14},-200 ${x + 150 + t * 14},-200 ${x - 650 + t * 14},2200 ${x - 800 + t * 14},2200`} fill={`rgba(120,190,255,${o})`} />
        ))}
      </svg>
      <div style={{position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,4,20,0.6) 100%)"}} />
    </div>
  );
};

// ====== moeda com profundidade (luz sempre do alto à esquerda) ======
const Coin2 = ({c, t, cam}) => {
  const x = trk(t, c.x, 11, 0.92), y = trk(t, c.y, 11, 0.92, 0.07), ang = trk(t, c.a, 10, 1), z = c.z;
  const sl = 1 + (cam.s - 1) * z, cx = 540 + (cam.cx - 540) * z, cy = 960 + (cam.cy - 960) * z;
  const sx = 540 + (x - cx) * sl, sy = 960 + (y - cy) * sl, s = c.s * sl;
  const face = Math.max(0.14, Math.abs(Math.cos((ang * Math.PI) / 180)));
  const blur = Math.abs(z - 1) * 7;
  return (
    <div style={{position: "absolute", left: sx - s / 2, top: sy - s / 2, width: s, height: s, transform: `scaleX(${face}) rotate(${-12 * (1 - face)}deg)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
      <div style={{position: "absolute", left: s * 0.05, top: s * 0.07, width: s, height: s, borderRadius: "50%", background: "#8a4f05", boxShadow: `${s * 0.1}px ${s * 0.16}px ${s * 0.2}px rgba(0,5,30,0.55)`}} />
      <div style={{position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 30% 26%, #fff1b0 0%, ${P.gold} 42%, ${P.gold2} 100%)`, boxShadow: `inset 0 0 0 ${s * 0.04}px #f9c850, inset ${-s * 0.03}px ${-s * 0.04}px ${s * 0.07}px rgba(150,80,0,0.5)`}}>
        <div style={{position: "absolute", inset: s * 0.13, borderRadius: "50%", border: `${s * 0.02}px solid rgba(255,240,180,0.7)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 800, fontSize: s * 0.48, color: "#fff7dc", textShadow: `0 ${s * 0.02}px ${s * 0.03}px rgba(150,80,0,0.7)`}}>{c.sym}</div>
      </div>
    </div>
  );
};
// trajetórias planejadas: [t, valor] — x e y com molas defasadas desenham arcos; ang = giro
const COINS = [
  {sym: "%", s: 200, z: 1.0, x: [[0, 1250], [0.05, 880], [1.85, 935], [4.3, 960]], y: [[0, -150], [0.05, 330], [1.85, 255], [4.3, 230]], a: [[0, 220], [0.05, 0], [1.85, 360], [4.3, 720]]},
  {sym: "$", s: 130, z: 0.8, x: [[0, -160], [0.36, 130], [4.3, 110]], y: [[0, 1750], [0.36, 1560], [4.3, 1640]], a: [[0, -200], [0.36, 0], [4.3, 360]]},
  {sym: "%", s: 340, z: 1.5, x: [[0, 1300], [0.5, 1010]], y: [[0, 2100], [0.5, 1740]], a: [[0, 150], [0.5, 0]]},
  {sym: "$", s: 100, z: 0.7, x: [[0, -120], [0.3, 150], [4.3, 120]], y: [[0, 520], [0.3, 330], [4.3, 300]], a: [[0, -160], [0.3, 0], [1.85, 180]]},
  {sym: "$", s: 170, z: 1.0, x: [[0, 1300], [2.3, 975]], y: [[0, 1700], [2.3, 1560]], a: [[0, 200], [2.3, 0]]},
];

// ====== texto: caracteres com máscara, rise por mola ======
const Ch = ({c, x, y, size, rise, weight = 900, color = "#fff", skew = -8}) => {
  const w = size * (c === "%" ? 1.05 : 0.72), h = size * 1.2;
  return (
    <div style={{position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div style={{fontFamily: "Inter", fontWeight: weight, fontSize: size, lineHeight: 1, color, transform: `translateY(${rise * 115}%) skewX(${skew}deg)`, textShadow: `0 ${size * 0.05}px ${size * 0.12}px rgba(0,8,40,0.5)`}}>{c}</div>
    </div>
  );
};
const Wd = ({t, at, out, size, weight = 500, color = "#fff", children}) => {
  const inn = spr(t - at, 18, 0.92), o = out == null ? 0 : spr(t - out, 16, 1);
  return (
    <span style={{display: "inline-block", overflow: "hidden", padding: `${size * 0.1}px ${size * 0.08}px`, verticalAlign: "top"}}>
      <span style={{display: "inline-block", fontFamily: "Inter", fontWeight: weight, fontSize: size, lineHeight: 1.05, color, letterSpacing: -size * 0.015, transform: `translateY(${(1 - inn) * 115 - o * 115}%) skewX(-6deg)`}}>{children}</span>
    </span>
  );
};
const Line = ({y, children, left}) => (
  <div style={{position: "absolute", left: left ?? 0, width: left != null ? undefined : 1080, top: y, transform: "translateY(-50%)", display: "flex", justifyContent: left != null ? "flex-start" : "center", columnGap: 18}}>{children}</div>
);

// curva suave (Catmull-Rom -> Bézier)
export const crPath = (Q) => {
  let d = `M${Q[0][0].toFixed(1)} ${Q[0][1].toFixed(1)}`;
  for (let i = 0; i < Q.length - 1; i++) {
    const p0 = Q[i - 1] || Q[i], p1 = Q[i], p2 = Q[i + 1], p3 = Q[i + 2] || p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};
const CH = [[170, 1030], [298, 965], [424, 995], [552, 850], [678, 885], [806, 725], [930, 650]];

export const MotionV2 = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS_V2;
  const cam = camAt(t);

  // --- caracteres de "12%" (um só conjunto que se reposiciona; nada é apagado) ---
  const T2 = [[0, 1], [0.5, 1]];
  const ch = (c, at, xs, ys, ss, dl = 0) => ({c, rise: 1 - spr(t - at, 16, 0.88), x: trk(t, xs, 14, 0.92, dl), y: trk(t, ys, 14, 0.92, dl + 0.03), size: trk(t, ss, 14, 0.95, dl)});
  const C1 = ch("1", 0.0, [[0, 260], [1.95, 385], [4.3, 770]], [[0, 800], [1.95, 650], [4.3, 505]], [[0, 360], [1.95, 200], [4.3, 84]]);
  const C2 = ch("2", 0.07, [[0, 480], [1.95, 505], [4.3, 822]], [[0, 800], [1.95, 650], [4.3, 505]], [[0, 360], [1.95, 200], [4.3, 84]], 0.03);
  const C3 = ch("%", 0.36, [[0, 760], [2.15, 640], [4.3, 885]], [[0, 800], [2.15, 655], [4.3, 505]], [[0, 360], [1.75, 120], [2.15, 76], [4.3, 34]], 0.0);
  const DE = {x: trk(t, [[0, 311], [1.95, 410], [4.3, 760]], 14, 0.92, 0.05), y: trk(t, [[0, 1010], [1.95, 770], [4.3, 575]], 14, 0.92, 0.08), s: trk(t, [[0, 100], [1.95, 56], [4.3, 30]], 14, 0.95, 0.05)};
  const IM = {x: trk(t, [[0, 609], [1.95, 578], [4.3, 851]], 14, 0.92, 0.08), y: DE.y, s: DE.s};
  const ulA = trk(t, [[0, 430], [1.95, 465], [4.3, 790]], 14, 0.92, 0.1), ulB = trk(t, [[0, 790], [1.95, 692], [4.3, 912]], 14, 0.92, 0.1);
  const ulY = trk(t, [[0, 1080], [1.95, 804], [4.3, 592]], 14, 0.92, 0.1);
  const ulP = spr(t - 1.3, 12, 1);

  // --- contorno único: círculo (selo) -> cartão -> cartão do gráfico ---
  const R = {
    x1: trk(t, [[0, 570], [1.75, 665], [2.05, 100]], 11, 0.95, 0), x2: trk(t, [[0, 950], [1.75, 855], [2.05, 980]], 17, 0.92),
    y1: trk(t, [[0, 610], [1.75, 705], [2.05, 520], [4.3, 410]], 17, 0.92), y2: trk(t, [[0, 990], [1.75, 895], [2.05, 1180], [4.3, 1110]], 11, 0.95),
    rx: trk(t, [[0, 190], [1.75, 95], [2.05, 64]], 14, 0.95),
  };
  const ringDraw = cl((t - 1.45) / 0.3);
  // selo dourado fino em torno do % (acompanha a posição/tamanho do %)
  const badgeP = cl((t - 2.5) / 0.4);

  // --- linha dourada: borda do cartão que se prolonga e vira o gráfico ---
  const gPts = CH.map((p, i) => {
    const sx = 170 + (i * 400) / 6;
    const mx = spr(t - 4.3 - i * 0.035, 14, 0.95), my = spr(t - 4.3 - i * 0.035 - 0.07, 14, 0.95);
    return [lerp(sx, p[0], mx), lerp(R.y2, p[1], my)];
  });
  const gDraw = t < 4.3 ? spr(t - 2.2, 9, 1) : 1;
  const tip = gPts[6], prev = gPts[5];
  const tipAng = (Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) * 180) / Math.PI;
  const arrowS = spr(t - 4.95, 16, 0.9);
  const tipGlow = spr(t - 4.7, 10, 1) * (1 - spr(t - 5.4, 8, 1) * 0.7);
  const gridP = (i) => cl((t - 4.6 - i * 0.07) / 0.4);
  const areaP = cl((t - 4.7) / 0.9);

  return (
    <AbsoluteFill style={{background: P.deep}}>
      <Bg t={t} cam={cam} />
      <div style={{position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: layerT(cam, 1)}}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          <defs>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(120,185,255,0.22)" /><stop offset="1" stopColor="rgba(10,73,172,0.10)" /></linearGradient>
            <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe38a" /><stop offset="1" stopColor={P.gold2} /></linearGradient>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(10,143,237,0.35)" /><stop offset="1" stopColor="rgba(10,143,237,0)" /></linearGradient>
            <radialGradient id="tg"><stop offset="0" stopColor="rgba(246,181,42,0.65)" /><stop offset="1" stopColor="rgba(246,181,42,0)" /></radialGradient>
            <clipPath id="areaClip"><rect x="150" y="500" width={Math.max(1, (tip[0] - 150) * areaP)} height="700" /></clipPath>
          </defs>
          <g transform="translate(0 900) skewX(-6) translate(0 -900)">
            {/* contorno do selo/cartão */}
            <rect x={R.x1} y={R.y1} width={Math.max(2, R.x2 - R.x1)} height={Math.max(2, R.y2 - R.y1)} rx={Math.max(2, Math.min(R.rx, (R.x2 - R.x1) / 2, (R.y2 - R.y1) / 2))} pathLength={1} fill="url(#glass)" fillOpacity={cl((t - 1.4) / 0.2)} stroke="rgba(190,225,255,0.75)" strokeWidth={3.5} strokeDasharray="1" strokeDashoffset={t < 1.45 ? 1 : 1 - ringDraw} style={{filter: "drop-shadow(0 0 16px rgba(10,143,237,0.55))"}} />
            {/* grade e área do gráfico */}
            {[0, 1, 2, 3].map((i) => <line key={i} x1="170" x2={170 + 760 * gridP(i)} y1={700 + i * 110} y2={700 + i * 110} stroke="rgba(190,225,255,0.14)" strokeWidth="2" />)}
            <path d={`${crPath(gPts)} L${tip[0]} 1060 L${gPts[0][0]} 1060 Z`} fill="url(#area)" clipPath="url(#areaClip)" opacity={areaP} />
            {/* linha dourada */}
            {t > 2.2 && <path d={crPath(gPts)} pathLength={1} fill="none" stroke="url(#gl)" strokeWidth={8} strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - gDraw} style={{filter: "drop-shadow(0 0 10px rgba(246,181,42,0.7))"}} />}
            <circle cx={tip[0]} cy={tip[1]} r={140} fill="url(#tg)" opacity={tipGlow} />
            <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${tipAng}) scale(${arrowS})`}><path d="M-34,-26 L30,0 L-34,26 L-16,0 Z" fill="url(#gl)" style={{filter: "drop-shadow(0 0 8px rgba(246,181,42,0.8))"}} /></g>
          </g>
          {/* selo dourado fino em torno do % */}
          <circle cx={C3.x} cy={C3.y} r={C3.size * 0.62} fill="none" stroke={P.gold} strokeWidth={Math.max(2, C3.size * 0.04)} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - badgeP} strokeLinecap="round" transform={`rotate(-90 ${C3.x} ${C3.y})`} />
          {/* sublinhado dourado de "imposto" */}
          <path d={`M${ulA} ${ulY} Q${(ulA + ulB) / 2} ${ulY - 14} ${ulB} ${ulY - 8}`} pathLength={1} fill="none" stroke="url(#gl)" strokeWidth={Math.max(3, DE.s * 0.1)} strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - ulP} />
        </svg>

        <Ch {...C1} />
        <Ch {...C2} />
        <Ch {...C3} />
        <div style={{position: "absolute", left: DE.x - DE.s * 0.7, top: DE.y - DE.s * 0.7, width: DE.s * 1.4, height: DE.s * 1.4, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"}}><div style={{fontFamily: "Inter", fontWeight: 400, fontSize: DE.s, color: "#fff", transform: `translateY(${(1 - spr(t - 0.84, 18, 0.92)) * 115}%) skewX(-8deg)`}}>de</div></div>
        <div style={{position: "absolute", left: IM.x - IM.s * 2.2, top: IM.y - IM.s * 0.7, width: IM.s * 4.4, height: IM.s * 1.4, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"}}><div style={{fontFamily: "Inter", fontWeight: 800, fontSize: IM.s, color: "#fff", transform: `translateY(${(1 - spr(t - 1.18, 18, 0.92)) * 115}%) skewX(-8deg)`}}>imposto</div></div>

        {/* "Imagine pagar esse valor todos os meses" dentro do cartão */}
        {[[900, [["Imagine", 2.26], ["pagar", 2.6]]], [985, [["esse", 2.94], ["valor", 3.2, 800], ["todos", 3.46]]], [1070, [["os", 3.9], ["meses", 4.22, 800]]]].map(([y, ws], li) => (
          <Line key={li} y={y}>{ws.map(([w, at, wt], wi) => <Wd key={w} t={t} at={at} out={4.3 + (li * 3 + wi) * 0.025} size={72} weight={wt || 500}>{w}</Wd>)}</Line>
        ))}
        {/* cartão do gráfico: rótulo + frase de faturamento */}
        <Line y={505} left={170}><Wd t={t} at={4.5} size={54} weight={500}>Faturamento</Wd></Line>
        <Line y={1300}>{[["sobre", 4.52], ["o", 4.78], ["faturamento", 4.92, 800]].map(([w, at, wt]) => <Wd key={w} t={t} at={at} size={78} weight={wt || 500}>{w}</Wd>)}</Line>
        <Line y={1392}>{[["da", 5.38], ["sua", 5.7], ["empresa", 5.86, 800]].map(([w, at, wt]) => <Wd key={w} t={t} at={at} size={78} weight={wt || 500}>{w}</Wd>)}</Line>
      </div>
      {COINS.map((c, i) => <Coin2 key={i} c={c} t={t} cam={cam} />)}
      <Audio src={staticFile("narracao.mp3")} volume={(f) => (f > 690 ? Math.max(0, 1 - (f - 690) / 30) : 1)} />
      <Audio src={staticFile("bed.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};

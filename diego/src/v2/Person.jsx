import React from "react";
import {staticFile} from "remotion";
import {add, sub, mul, nrm, perp, rot, deg, lerp2, smooth, limb, cyl, f} from "./geo";

// ---------------- elenco ----------------
const base = {
  skin: "#B97A55", skinS: "#8E5639", skinH: "#D49A74", lip: "#8A4636", hair: "#1C1716", hairH: "#3A3230",
  eye: "#3A2216", glasses: false, gray: null, build: "m", headScale: 1,
};
export const PAULO = {
  ...base, id: "paulo", glasses: true, gray: "#9A938E", hairStyle: "crop",
  outfit: "overshirt", shirt: "#D59A3A", shirtS: "#A8701F", shirtH: "#EDB959", tee: "#F3EEE6", teeS: "#D9D1C4",
  pants: "#3A404E", pantsS: "#262A35", pantsH: "#4E5566", shoe: "#F2EFE9", shoeS: "#C9C3B8", sole: "#9C958A",
};
export const PAULO_YOUNG = {...PAULO, id: "pauloY", gray: null};
export const PAULO_GOWN = {...PAULO, id: "pauloG", gray: null, shirt: "#1D2029", shirtS: "#0F1117", shirtH: "#30343F", tee: "#1D2029", teeS: "#0F1117"};
export const ANA = {
  ...base, id: "ana", skin: "#8F5A3D", skinS: "#6A3E28", skinH: "#AA7356", lip: "#6E2E2A", hairStyle: "curly", hair: "#241612", hairH: "#4A3024",
  build: "f", outfit: "blouse", shirt: "#2F9E92", shirtS: "#1E7369", shirtH: "#4DBDB0", tee: "#2F9E92", teeS: "#1E7369",
  pants: "#E8DCC6", pantsS: "#C8B89C", pantsH: "#F5ECDC", shoe: "#C8765A", shoeS: "#9E5A44", sole: "#7A4434",
};
export const KID = {
  ...base, id: "kid", skin: "#A56E4C", skinS: "#7E4E33", skinH: "#C08A68", hairStyle: "puffs", hair: "#241612", hairH: "#4A3024",
  build: "k", headScale: 1.32, outfit: "tee", shirt: "#E4574B", shirtS: "#B53D34", shirtH: "#F27C70", tee: "#E4574B", teeS: "#B53D34",
  pants: "#2F5DA8", pantsS: "#22467F", pantsH: "#4776C2", shoe: "#F2EFE9", shoeS: "#C9C3B8", sole: "#9C958A",
};
const moverBase = {
  ...base, outfit: "polo", shirt: "#15285C", shirtS: "#0B1840", shirtH: "#24408A", tee: "#15285C", teeS: "#0B1840",
  pants: "#13204A", pantsS: "#0A1433", pantsH: "#1F3066", shoe: "#1E1F25", shoeS: "#101116", sole: "#34353D",
};
export const MOVER1 = {...moverBase, id: "m1", skin: "#E3B08A", skinS: "#BE8964", skinH: "#F2C8A6", lip: "#B0645A", hairStyle: "side", hair: "#4A2E20", hairH: "#6E4A36"};
export const MOVER2 = {...moverBase, id: "m2", skin: "#7E4F33", skinS: "#5A3420", skinH: "#9A6848", lip: "#5E2A22", hairStyle: "buzz", hair: "#151010", hairH: "#2A2220"};
export const MOVER3 = {...moverBase, id: "m3", skin: "#C48B63", skinS: "#9C6644", skinH: "#DDA684", lip: "#8E4A3E", hairStyle: "crop", hair: "#221814", hairH: "#3C2E26"};

// ---------------- pose padrão ----------------
// ângulos (graus): 0 = membro para baixo; positivo gira para a esquerda da tela
export const REST = {
  spine: 0, head: 0, turn: 0.15, hip: [0, 0],
  armL: [10, -8, 0], armR: [-10, 8, 0], handL: "relax", handR: "relax",
  legL: [4, 0, 0], legR: [-4, 0, 0], front: "R",
};
export const mixPose = (a, b, u) => {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[k] ?? REST[k], vb = b[k] ?? va;
    if (Array.isArray(va)) o[k] = va.map((v, i) => v + ((vb[i] ?? v) - v) * u);
    else if (typeof va === "number") o[k] = va + (vb - va) * u;
    else o[k] = u < 0.5 ? va : vb;
  }
  return o;
};

const BUILD = {
  m: {sh: 1, wa: 1, hp: 1, arm: 1, leg: 1, h: 1},
  f: {sh: 0.86, wa: 0.84, hp: 1.06, arm: 0.88, leg: 1, h: 0.95},
  k: {sh: 0.82, wa: 0.95, hp: 0.92, arm: 0.92, leg: 0.95, h: 1},
};

// ---------------- mãos ----------------
// tipos: relax, grip (dedos curvados para frente), thumb (polegar à frente, dedos atrás do objeto), flat, open
const Hand = ({W, a, c, type = "relax", side = 1, k = 1, back = false}) => {
  const id = `${c.id}h${side}${type}`;
  const curl = {relax: 0.35, grip: 1.05, thumb: 0.9, flat: 0.05, open: 0.0}[type] ?? 0.35;
  const spread = type === "open" ? 0.16 : 0.05;
  const ang = (a * 180) / Math.PI;
  const fing = [[-15, 30, 26], [-5, 34, 30], [5, 32, 29], [14, 27, 24]]; // x, comprimento, -
  const fingers = fing.map(([fx, L1], i) => {
    const s0 = [fx * k, 40 * k];
    const a1 = (i - 1.5) * spread;
    const d1 = rot([0, 1], a1 + curl * 0.9 * side * 0);
    const j1 = add(s0, mul(rot([0, 1], a1 - curl * 0.0), L1 * 0.55 * k));
    const j2 = add(j1, mul(rot([0, 1], a1 + curl * 1.3 * -1 * 0 ), L1 * 0.45 * k));
    // curvatura em direção à palma (eixo z simulado por encurtamento + leve deslocamento)
    const sh = 1 - curl * 0.55;
    const p1 = [s0[0], s0[1]], p2 = [j1[0], s0[1] + (j1[1] - s0[1]) * sh], p3 = [j2[0] - side * curl * 4 * k, s0[1] + (j2[1] - s0[1]) * sh * (1 - curl * 0.35)];
    return {d: limb([p1, p2, p3], [6.4 * k, 5.6 * k, 4.6 * k]).d, tip: p3};
  });
  const thumbBase = [side * 18 * k, 18 * k];
  const tAng = type === "thumb" ? -0.25 : type === "open" ? 0.9 : 0.5;
  const t1 = add(thumbBase, mul(rot([side, 0.9], side * tAng * 0.6), 16 * k));
  const t2 = add(t1, mul(rot([side * 0.3, 1], side * tAng * 0.3), 16 * k));
  const thumb = limb([thumbBase, t1, t2], [8 * k, 7 * k, 5.4 * k]).d;
  return (
    <g transform={`translate(${f(W[0])} ${f(W[1])}) rotate(${f(ang)})`}>
      <defs>
        <linearGradient id={id} x1="-1" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox"><stop offset="0" stopColor={c.skinH} /><stop offset="0.55" stopColor={c.skin} /><stop offset="1" stopColor={c.skinS} /></linearGradient>
      </defs>
      {type !== "thumb" && fingers.map((fi, i) => <path key={i} d={fi.d} fill={i % 2 ? c.skin : c.skinH} stroke={c.skinS} strokeWidth={1.1 * k} strokeOpacity={0.55} />)}
      {/* palma / dorso */}
      <path d={smooth([[-19 * k, 0], [19 * k, 0], [22 * k, 22 * k], [18 * k, 44 * k], [0, 48 * k], [-18 * k, 44 * k], [-22 * k, 22 * k]], true)} fill={c.skin} />
      <path d={smooth([[-19 * k, 0], [-4 * k, -1 * k], [-10 * k, 24 * k], [-18 * k, 42 * k], [-22 * k, 22 * k]], true)} fill={c.skinH} opacity={0.45} />
      {type === "grip" && fingers.map((fi, i) => <path key={`k${i}`} d={`M ${f(fing[i][0] * k - 4 * k)} ${f(40 * k)} q ${f(4 * k)} ${f(4 * k)} ${f(8 * k)} 0`} stroke={c.skinS} strokeWidth={1.6 * k} fill="none" opacity={0.6} />)}
      <path d={thumb} fill={c.skin} stroke={c.skinS} strokeWidth={1.1 * k} strokeOpacity={0.6} />
    </g>
  );
};

// ---------------- cabeça ----------------
export const Head2 = ({c, e = {}, turn = 0, k = 1}) => {
  const tx = turn * 15;
  const smile = e.smile ?? 0.15, open = e.open ?? 0, blink = e.blink ?? 0, brow = e.brow ?? 0, worry = e.worry ?? 0;
  const look = e.look ?? [turn * 0.4, 0];
  const id = `${c.id}hd`;
  const eyeY = -6;
  const eye = (sx) => {
    const far = sx * turn < 0 ? 0.86 : 1; // olho do lado oposto ao giro menor
    const cx = sx * 30 * (1 - Math.abs(turn) * 0.12) + tx;
    const rx = 14.5 * far, ry = 9.6 * (1 - blink * 0.92);
    const ix = cx + look[0] * 5.5, iy = eyeY + look[1] * 3.5;
    return (
      <g key={sx}>
        <ellipse cx={cx} cy={eyeY} rx={rx} ry={ry} fill="#FAF6F0" />
        <clipPath id={`${id}ec${sx}`}><ellipse cx={cx} cy={eyeY} rx={rx} ry={ry} /></clipPath>
        <g clipPath={`url(#${id}ec${sx})`}>
          <circle cx={ix} cy={iy} r={7.8} fill={c.eye} />
          <circle cx={ix} cy={iy} r={4} fill="#0E0805" />
          <circle cx={ix + 2.6} cy={iy - 2.6} r={2.1} fill="#fff" />
          <rect x={cx - rx} y={eyeY - ry} width={rx * 2} height={ry * 0.7} fill="#000" opacity={0.12} />
        </g>
        {/* pálpebra superior e cílios */}
        <path d={`M${f(cx - rx - 2)} ${f(eyeY + 1)} Q ${f(cx)} ${f(eyeY - ry - 5.5 + blink * 9)} ${f(cx + rx + 2)} ${f(eyeY - 1)}`} stroke="#22140D" strokeWidth={3.4} fill="none" strokeLinecap="round" />
        {/* dobra da pálpebra */}
        <path d={`M${f(cx - rx + 2)} ${f(eyeY - ry - 4)} Q ${f(cx)} ${f(eyeY - ry - 9)} ${f(cx + rx - 1)} ${f(eyeY - ry - 4)}`} stroke={c.skinS} strokeWidth={1.8} fill="none" opacity={0.6} />
        {smile > 0.45 && <path d={`M${f(cx - rx + 3)} ${f(eyeY + ry + 3)} Q ${f(cx)} ${f(eyeY + ry + 6)} ${f(cx + rx - 3)} ${f(eyeY + ry + 3)}`} stroke={c.skinS} strokeWidth={1.6} fill="none" opacity={0.5} />}
      </g>
    );
  };
  const browP = (sx) => {
    const inner = sx * 12 + tx, outer = sx * 48 + tx;
    const iy = -34 - brow * 5 - worry * 5, oy = -32 - brow * 3 + worry * 3;
    return <path key={sx} d={`M${f(inner)} ${f(iy)} Q ${f((inner + outer) / 2)} ${f(Math.min(iy, oy) - 6)} ${f(outer)} ${f(oy + 2)}`} stroke={c.hair} strokeWidth={7.5} strokeLinecap="round" fill="none" />;
  };
  // boca
  const mY = 54, mw = 21 + smile * 5 + open * 2;
  const cy = smile * 9;
  const mouth = open > 0.06 ? (
    <g>
      <path d={`M${f(tx - mw)} ${f(mY - cy * 0.4)} Q ${f(tx)} ${f(mY + cy + open * 20)} ${f(tx + mw)} ${f(mY - cy * 0.4)} Q ${f(tx)} ${f(mY - 3 + cy * 0.2)} ${f(tx - mw)} ${f(mY - cy * 0.4)} Z`} fill="#4A1A14" />
      <clipPath id={`${id}mc`}><path d={`M${f(tx - mw)} ${f(mY - cy * 0.4)} Q ${f(tx)} ${f(mY + cy + open * 20)} ${f(tx + mw)} ${f(mY - cy * 0.4)} Q ${f(tx)} ${f(mY - 3 + cy * 0.2)} ${f(tx - mw)} ${f(mY - cy * 0.4)} Z`} /></clipPath>
      <rect clipPath={`url(#${id}mc)`} x={tx - mw} y={mY - 8} width={mw * 2} height={9 + cy * 0.3} fill="#FBF8F2" />
      <path d={`M${f(tx - mw - 1)} ${f(mY - cy * 0.4)} Q ${f(tx)} ${f(mY + cy + open * 20 + 3)} ${f(tx + mw + 1)} ${f(mY - cy * 0.4)}`} stroke={c.lip} strokeWidth={3} fill="none" opacity={0.6} />
    </g>
  ) : (
    <g>
      <path d={`M${f(tx - mw)} ${f(mY - cy * 0.45)} Q ${f(tx)} ${f(mY + cy * 0.9)} ${f(tx + mw)} ${f(mY - cy * 0.45)}`} stroke="#5A261C" strokeWidth={3.6} fill="none" strokeLinecap="round" />
      <path d={`M${f(tx - mw * 0.55)} ${f(mY + 7 + cy * 0.3)} Q ${f(tx)} ${f(mY + 12 + cy * 0.4)} ${f(tx + mw * 0.55)} ${f(mY + 7 + cy * 0.3)}`} stroke={c.lip} strokeWidth={3} fill="none" opacity={0.45} strokeLinecap="round" />
    </g>
  );
  const jawN = 66 + turn * 6, jawF = 66 - turn * 6;
  const face = smooth([[-70, -40], [-62, -86], [-30, -104], [tx * 0.3, -108], [32, -104], [64, -86], [72, -40], [jawN, 14], [52, 62], [22 + tx * 0.3, 92], [tx * 0.4, 97], [-22 + tx * 0.3, 92], [-52, 62], [-jawF, 14]], true);
  return (
    <g transform={`scale(${k})`}>
      <defs>
        <radialGradient id={`${id}f`} cx={0.4 - turn * 0.12} cy={0.36} r={0.72}><stop offset="0" stopColor={c.skinH} /><stop offset="0.55" stopColor={c.skin} /><stop offset="1" stopColor={c.skinS} /></radialGradient>
      </defs>
      {/* cabelo de trás */}
      {c.hairStyle === "curly" && <g fill={c.hair}>{[[-78, -10, 40], [78, -10, 40], [-86, 34, 34], [86, 34, 34], [-70, 70, 28], [70, 70, 28]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>}
      {/* orelhas */}
      <path d={smooth([[-66, -14], [-82, -20], [-86, 6], [-76, 30], [-62, 30]], false)} fill={c.skinS} />
      <path d={smooth([[66, -14], [82, -20], [86, 6], [76, 30], [62, 30]], false)} fill={c.skinS} />
      <path d={face} fill={`url(#${id}f)`} />
      {/* sombras: maçã do rosto, mandíbula */}
      <path d={smooth([[46, -40], [70, -30], [66, 20], [50, 62], [24, 90], [44, 50], [52, 4]], true)} fill={c.skinS} opacity={0.28} />
      <ellipse cx={-40 + tx} cy={30} rx={18} ry={10} fill="#D46A5A" opacity={0.08 + smile * 0.12} />
      <ellipse cx={40 + tx} cy={30} rx={18} ry={10} fill="#D46A5A" opacity={0.08 + smile * 0.12} />
      {/* cabelo */}
      {c.hairStyle === "crop" && (
        <g>
          <path d={smooth([[-72, -18], [-80, -70], [-54, -116], [0, -128], [56, -118], [82, -72], [74, -18], [66, -46], [44, -66], [10, -70], [-30, -66], [-58, -54], [-66, -40]], true)} fill={c.hair} />
          <path d={smooth([[-40, -110], [0, -122], [44, -112], [10, -114]], true)} fill={c.hairH} opacity={0.7} />
          {c.gray && <><path d={smooth([[-73, -16], [-78, -44], [-70, -62], [-64, -40]], true)} fill={c.gray} /><path d={smooth([[73, -16], [78, -44], [70, -62], [64, -40]], true)} fill={c.gray} /></>}
        </g>
      )}
      {c.hairStyle === "side" && <path d={smooth([[-74, -14], [-82, -76], [-40, -122], [20, -126], [70, -100], [80, -50], [74, -16], [64, -52], [20, -78], [-20, -62], [-60, -52]], true)} fill={c.hair} />}
      {c.hairStyle === "buzz" && <path d={smooth([[-70, -30], [-72, -82], [-36, -112], [10, -116], [56, -100], [74, -60], [70, -30], [50, -66], [0, -76], [-48, -66]], true)} fill={c.hair} opacity={0.9} />}
      {c.hairStyle === "curly" && <g fill={c.hair}>{[[-66, -50, 32], [-52, -92, 34], [-14, -116, 36], [28, -114, 36], [62, -88, 34], [72, -46, 30], [-34, -72, 26], [12, -80, 26], [44, -70, 24]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}<circle cx={10} cy={-122} r={20} fill={c.hairH} opacity={0.5} /></g>}
      {c.hairStyle === "puffs" && <g fill={c.hair}><circle cx={-70} cy={-96} r={36} /><circle cx={70} cy={-96} r={36} /><path d={smooth([[-72, -30], [-70, -86], [0, -116], [70, -86], [72, -30], [40, -70], [-40, -70]], true)} /></g>}
      {eye(-1)}{eye(1)}
      {browP(-1)}{browP(1)}
      {/* nariz */}
      <path d={`M${f(tx + 2)} -6 C ${f(tx + 4)} 12, ${f(tx + 12)} 24, ${f(tx + 8)} 32`} stroke={c.skinS} strokeWidth={2.4} fill="none" opacity={0.5} />
      <path d={smooth([[tx - 14, 30], [tx - 6, 24], [tx + 6, 24], [tx + 14, 30], [tx + 6, 36], [tx - 6, 36]], true)} fill={c.skinS} opacity={0.55} />
      <circle cx={tx - 6} cy={32} r={2.6} fill="#3A1C12" opacity={0.6} /><circle cx={tx + 7} cy={32} r={2.6} fill="#3A1C12" opacity={0.6} />
      {mouth}
      {c.glasses && (
        <g stroke="#2A1E17" strokeWidth={4.4} fill="rgba(210,230,255,0.10)">
          <rect x={-30 * (1 - Math.abs(turn) * 0.12) + tx - 25} y={-26} width={50} height={38} rx={12} />
          <rect x={30 * (1 - Math.abs(turn) * 0.12) + tx - 25} y={-26} width={50} height={38} rx={12} />
          <path d={`M ${f(tx - 6)} -12 Q ${f(tx)} -17 ${f(tx + 6)} -12`} fill="none" />
          <path d={`M ${f(-56 + tx)} -14 L -70 -16 M ${f(56 + tx)} -14 L 70 -16`} fill="none" />
          <path d={`M ${f(-48 + tx)} -19 L ${f(-38 + tx)} -21 M ${f(12 + tx)} -19 L ${f(22 + tx)} -21`} stroke="#fff" strokeOpacity={0.55} strokeWidth={2.6} />
        </g>
      )}
    </g>
  );
};

// ---------------- personagem ----------------
// props: c, pose (parcial sobre REST), e (expressão), x, y, s, flip, light ("warm"/"cool"), hold(ctx) render prop
export const Person = ({c, pose: pz = {}, e, x = 0, y = 0, s = 1, flip = 1, rim = null, hold, holdLayer = "front", shadow = true}) => {
  const p = {...REST, ...pz};
  const B = BUILD[c.build] || BUILD.m;
  const pelvis = [p.hip[0], -500 * B.leg + p.hip[1]];
  const sa = deg(p.spine);
  const T = (pt) => add(pelvis, rot(pt, sa)); // ponto no espaço do tronco
  const shX = 82 * B.sh;
  const SL = T([-shX, -266]), SR = T([shX, -266]);
  const neckB = T([0, -316]);
  const headC = add(neckB, rot([0, -100], sa + deg(p.head)));
  const UA = 182 * B.arm, FA = 158 * B.arm, UA0 = UA, FA0 = FA;
  const arm = (S, [a1d, a2d, wd]) => {
    const a1 = sa + deg(a1d), a2 = a1 + deg(a2d);
    const E = add(S, rot([0, UA], a1)), Wr = add(E, rot([0, FA], a2));
    return {S, E, W: Wr, a1, a2, aw: a2 + deg(wd || 0)};
  };
  // IK de dois ossos: alvo do punho em coordenadas locais; o cotovelo abre para fora
  const ik = (S, Tg, side, wd = 0, fo = 1) => {
    const UA = UA0, FA = FA0 * fo;
    let d = sub(Tg, S);
    let D = Math.hypot(d[0], d[1]);
    const maxD = UA + FA - 2;
    if (D > maxD) { d = mul(d, maxD / D); D = maxD; }
    const base = Math.atan2(d[1], d[0]);
    const cosA = (UA * UA + D * D - FA * FA) / (2 * UA * D);
    const A0 = Math.acos(Math.max(-1, Math.min(1, cosA)));
    const cand = [base + A0, base - A0].map((ang) => add(S, [Math.cos(ang) * UA, Math.sin(ang) * UA]));
    const score = (Ep) => Ep[1] * 0.6 + (side < 0 ? -Ep[0] : Ep[0]); // cotovelo para fora e para baixo
    const E = score(cand[0]) > score(cand[1]) ? cand[0] : cand[1];
    const W = add(S, d);
    const a1 = Math.atan2(E[1] - S[1], E[0] - S[0]) - Math.PI / 2, a2 = Math.atan2(W[1] - E[1], W[0] - E[0]) - Math.PI / 2;
    return {S, E, W, a1, a2, aw: a2 + deg(wd)};
  };
  const AL = p.ikL ? ik(SL, p.ikL, -1, p.wristL || 0, p.foreL ?? 1) : arm(SL, p.armL);
  const AR = p.ikR ? ik(SR, p.ikR, 1, p.wristR || 0, p.foreR ?? 1) : arm(SR, p.armR);
  const hipL = add(pelvis, [-50 * B.hp, 0]), hipR = add(pelvis, [50 * B.hp, 0]);
  const TH = 236 * B.leg, SH = 238 * B.leg;
  const leg = (Hp, [a1d, a2d, fd = 0, fs = 1]) => {
    const a1 = deg(a1d), a2 = a1 + deg(a2d);
    const K = add(Hp, rot([0, TH * fs], a1)), A = add(K, rot([0, SH], a2));
    return {H: Hp, K, A, a1, a2, fa: deg(fd)};
  };
  const LL = leg(hipL, p.legL), LR = leg(hipR, p.legR);
  const id = c.id;
  const light = [-0.55, -0.83];

  // ---- membros ----
  const drawLeg = (L, side) => {
    const C = [L.H, lerp2(L.H, L.K, 0.5), L.K, lerp2(L.K, L.A, 0.5), L.A];
    const g = cyl(L.H, L.A, 60, light);
    const lp = limb(C, [66, 58, 46, 44, 34].map((v) => v * (c.build === "k" ? 0.85 : 1)), {capStart: false});
    const ga = `${id}lg${side}`;
    const foot = L.A;
    const fa = L.fa + (L.a2 - 0) * 0.15;
    return (
      <g key={`l${side}`}>
        <defs><linearGradient id={ga} gradientUnits="userSpaceOnUse" {...g}><stop offset="0" stopColor={c.pantsH} /><stop offset="0.45" stopColor={c.pants} /><stop offset="1" stopColor={c.pantsS} /></linearGradient></defs>
        <path d={lp.d} fill={`url(#${ga})`} />
        {/* dobras no joelho */}
        <path d={`M ${f(L.K[0] - 22)} ${f(L.K[1] - 8)} q 18 10 38 2`} stroke={c.pantsS} strokeWidth={3} fill="none" opacity={0.6} />
        {/* tênis 3/4 */}
        <g transform={`translate(${f(foot[0])} ${f(foot[1])}) rotate(${f((fa * 180) / Math.PI)})`}>
          <path d={smooth([[-34, -6], [-26, -30], [14, -30], [40, -14], [64, 4], [62, 22], [-34, 22], [-40, 8]], true)} fill={c.shoe} />
          <path d={smooth([[-26, -30], [14, -30], [20, -18], [-22, -16]], true)} fill={c.shoeS} opacity={0.6} />
          <path d="M -40 14 L 64 14 L 62 28 L -38 28 Z" fill={c.sole} />
        </g>
      </g>
    );
  };
  const sleeveCol = c.shirt;
  const drawArm = (A, side, handType) => {
    const C = [A.S, lerp2(A.S, A.E, 0.5), A.E, lerp2(A.E, A.W, 0.5), A.W];
    const ga = `${id}ar${side}`, gs = `${id}sl${side}`;
    const g = cyl(A.S, A.W, 48, light);
    const skinArm = limb(C, [38, 34, 29, 28, 22], {capStart: false}).d;
    // manga: dobrada logo abaixo do cotovelo (camisa) ou curta (polo/blusa/camiseta)
    const shortSl = c.outfit !== "overshirt";
    const sEnd = shortSl ? lerp2(A.S, A.E, c.outfit === "polo" ? 0.62 : 0.5) : lerp2(A.E, A.W, 0.22);
    const sC = shortSl ? [A.S, lerp2(A.S, sEnd, 0.5), sEnd] : [A.S, lerp2(A.S, A.E, 0.5), A.E, sEnd];
    const sW = shortSl ? [44, 41, 38] : [43, 39, 35, 33];
    const sleeve = limb(sC, sW, {capStart: false, capEnd: false}).d;
    const dirS = nrm(sub(sEnd, sC[sC.length - 2]));
    const n = perp(dirS);
    const bandW = shortSl ? 38 : 33;
    const band = (off, col, w) => {
      const p0 = add(sEnd, mul(dirS, -off));
      return <path d={`M ${f(p0[0] + n[0] * bandW)} ${f(p0[1] + n[1] * bandW)} L ${f(p0[0] - n[0] * bandW)} ${f(p0[1] - n[1] * bandW)}`} stroke={col} strokeWidth={w} strokeLinecap="round" />;
    };
    return (
      <g key={`a${side}`}>
        <defs>
          <linearGradient id={ga} gradientUnits="userSpaceOnUse" {...g}><stop offset="0" stopColor={c.skinH} /><stop offset="0.5" stopColor={c.skin} /><stop offset="1" stopColor={c.skinS} /></linearGradient>
          <linearGradient id={gs} gradientUnits="userSpaceOnUse" {...g}><stop offset="0" stopColor={c.shirtH} /><stop offset="0.5" stopColor={sleeveCol} /><stop offset="1" stopColor={c.shirtS} /></linearGradient>
        </defs>
        <path d={skinArm} fill={`url(#${ga})`} />
        <path d={sleeve} fill={`url(#${gs})`} />
        {!shortSl && band(4, c.shirtS, 16)}
        {c.outfit === "polo" && <>{band(6, "#1E6FF0", 9)}{band(14, "#27C0F5", 4)}</>}
        {/* dobras do tecido no cotovelo */}
        {!shortSl && <path d={`M ${f(A.E[0] - n[0] * 18)} ${f(A.E[1] - n[1] * 18)} q ${f(dirS[0] * 10 + n[0] * 6)} ${f(dirS[1] * 10 + n[1] * 6)} ${f(n[0] * 24)} ${f(n[1] * 24)}`} stroke={c.shirtS} strokeWidth={3} fill="none" opacity={0.7} />}
        <Hand W={A.W} a={A.aw} c={c} type={handType} side={side} />
      </g>
    );
  };

  // ---- tronco ----
  const W = B.wa, Hh = B.hp, Sx = B.sh;
  const torsoPts = [
    [-32, -322], [-66 * Sx, -306], [-96 * Sx, -292], [-112 * Sx, -262], [-104 * Sx, -222], [-96 * W, -160], [-86 * W, -96], [-90 * Hh, -36], [-96 * Hh, 22],
    [96 * Hh, 22], [90 * Hh, -36], [86 * W, -96], [96 * W, -160], [104 * Sx, -222], [112 * Sx, -262], [96 * Sx, -292], [66 * Sx, -306], [32, -322],
  ];
  const torso = smooth(torsoPts, true);
  const pelvisBlock = smooth([[-92 * Hh, -40], [92 * Hh, -40], [96 * Hh, 30], [58, 70], [0, 56], [-58, 70], [-96 * Hh, 30]], true);
  const frontIsR = p.front === "R";
  const backArm = frontIsR ? [AL, -1, p.handL] : [AR, 1, p.handR];
  const frontArm = frontIsR ? [AR, 1, p.handR] : [AL, -1, p.handL];
  const armsOver = p.armsOver ?? false; // os dois braços na frente do tronco (segurando objeto)
  const holdCtx = {L: AL, R: AR, mid: lerp2(AL.W, AR.W, 0.5), chest: T([0, -180]), pelvis};
  const neckTop = add(neckB, rot([0, -46], sa + deg(p.head) * 0.5));

  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      <defs>
        <linearGradient id={`${id}to`} x1="0" x2="1" y1="0" y2="0.15"><stop offset="0" stopColor={c.shirtH} /><stop offset="0.45" stopColor={c.shirt} /><stop offset="1" stopColor={c.shirtS} /></linearGradient>
        <linearGradient id={`${id}pv`} x1="0" x2="1"><stop offset="0" stopColor={c.pantsH} /><stop offset="0.5" stopColor={c.pants} /><stop offset="1" stopColor={c.pantsS} /></linearGradient>
        <linearGradient id={`${id}nk`} x1="0" x2="1"><stop offset="0" stopColor={c.skin} /><stop offset="1" stopColor={c.skinS} /></linearGradient>
      </defs>
      {shadow && <ellipse cx={(LL.A[0] + LR.A[0]) / 2 + 14} cy={Math.max(LL.A[1], LR.A[1]) + 26} rx={170} ry={20} fill="#000" opacity={0.28} filter="url(#v2soft)" />}
      {holdLayer === "back" && hold && hold(holdCtx)}
      {!armsOver && drawArm(...backArm)}
      {drawLeg(LL, -1)}
      {drawLeg(LR, 1)}
      <g transform={`translate(${f(pelvis[0])} ${f(pelvis[1])})`}><path d={pelvisBlock} fill={`url(#${id}pv)`} /><path d="M -92 -34 L 92 -34" stroke={c.pantsS} strokeWidth={6} opacity={0.6} /></g>
      {/* pescoço */}
      <path d={limb([neckB, lerp2(neckB, neckTop, 0.5), neckTop], [30, 28, 27], {capStart: false}).d} fill={`url(#${id}nk)`} />
      <g transform={`translate(${f(pelvis[0])} ${f(pelvis[1])}) rotate(${f(p.spine)})`}>
        <path d={torso} fill={`url(#${id}to)`} />
        {c.outfit === "overshirt" && (
          <g>
            <path d={smooth([[-30, -320], [0, -296], [30, -320], [24, 20], [-24, 20]], true)} fill={c.tee} />
            <path d={smooth([[-34, -320], [0, -292], [34, -320], [30, 20], [-30, 20]], true)} fill={c.teeS} opacity={0.25} transform="translate(8 0)" />
            {/* golas e frentes da camisa */}
            <path d={smooth([[-46, -318], [-26, -250], [-34, -150], [-40, 22], [-62, 22], [-58, -200], [-60, -300]], true)} fill={c.shirt} />
            <path d={smooth([[46, -318], [26, -250], [34, -150], [40, 22], [62, 22], [58, -200], [60, -300]], true)} fill={c.shirtS} />
            <path d="M -46 -318 L -24 -262 L -56 -270 Z" fill={c.shirtS} opacity={0.8} />
            <path d="M 46 -318 L 24 -262 L 56 -270 Z" fill={c.shirtS} />
            <rect x={-82} y={-226} width={34} height={38} rx={4} fill={c.shirtS} opacity={0.55} />
            {[-120, -60, 0].map((yy) => <circle key={yy} cx={-46} cy={yy} r={3.6} fill={c.shirtS} />)}
          </g>
        )}
        {c.outfit === "polo" && (
          <g>
            <path d="M -40 -322 L 0 -262 L 40 -322 L 28 -332 L 0 -290 L -28 -332 Z" fill="#0A1636" />
            <path d="M -44 -320 L -10 -268 M 44 -320 L 10 -268" stroke="#1E6FF0" strokeWidth={5} />
            <path d="M 0 -262 L 0 -196" stroke="#0A1636" strokeWidth={4} />
            <circle cx={0} cy={-236} r={3} fill="#0A1636" /><circle cx={0} cy={-210} r={3} fill="#0A1636" />
            <image href={staticFile("brand/wordmark_white.png")} x={22} y={-226} width={64} height={(64 * 254) / 555} opacity={0.95} />
            <path d={smooth([[112 * Sx, -262], [100, -160], [90, -40], [96, 20]], false)} stroke="#1E6FF0" strokeWidth={7} fill="none" opacity={0.9} />
            <path d={smooth([[-112 * Sx, -262], [-100, -160], [-90, -40], [-96, 20]], false)} stroke="#1E6FF0" strokeWidth={7} fill="none" opacity={0.6} />
          </g>
        )}
        {c.outfit === "blouse" && <path d="M -34 -322 Q 0 -268 34 -322" fill={c.skinS} />}
        {c.outfit === "tee" && <path d="M -30 -322 Q 0 -290 30 -322" fill={c.skinS} />}
        {/* sombra lateral e dobras de cintura */}
        <path d={smooth([[60, -300], [104, -240], [96, -120], [92, 20], [66, 20], [76, -140], [72, -260]], true)} fill="#000" opacity={0.13} />
        <path d="M -70 -40 q 30 10 60 2 M 20 -30 q 26 8 52 -4" stroke="#000" strokeOpacity={0.12} strokeWidth={3} fill="none" />
        {rim && <path d={smooth([[100, -290], [112, -262], [104, -222], [96, -160], [86, -96], [90, -36], [96, 22]], false)} stroke={rim} strokeWidth={5} fill="none" opacity={0.6} />}
      </g>
      {/* sombra do queixo no pescoço */}
      <ellipse cx={neckTop[0]} cy={neckTop[1] + 4} rx={30} ry={12} fill={c.skinS} opacity={0.6} />
      <g transform={`translate(${f(headC[0])} ${f(headC[1])}) rotate(${f(p.spine + p.head)})`}>
        <Head2 c={c} e={e} turn={p.turn} k={0.86 * (c.headScale || 1)} />
      </g>
      {armsOver && drawArm(...backArm)}
      {holdLayer === "front" && hold && hold(holdCtx)}
      {drawArm(...frontArm)}
      {holdLayer === "top" && hold && hold(holdCtx)}
    </g>
  );
};

export const PersonDefs = () => (
  <svg width="0" height="0" style={{position: "absolute"}}>
    <defs><filter id="v2soft" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="9" /></filter></defs>
  </svg>
);

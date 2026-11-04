import React from "react";
import {staticFile} from "remotion";
import {rot, add, deg, capsule, cl, mix} from "./lib";

// ---------- elencos ----------
export const PAULO = {
  id: "paulo",
  skin: "#B47652", skinS: "#94593A", skinH: "#CE9470",
  hair: "#1F1A19", gray: "#8E8A87", hairType: "paulo", glasses: true,
  shirt: "#D69A36", shirtS: "#B07722", shirtH: "#E8B456", tee: null, rolled: true,
  pants: "#3B4150", pantsS: "#2B2F3B", shoe: "#F1EEE8", sole: "#B8B2A8",
  uniform: false,
};
export const PAULO_YOUNG = {...PAULO, id: "py", gray: "#1F1A19"};
export const PAULO_GRAD = {...PAULO, id: "pg", gray: "#1F1A19", shirt: "#1B1D26", shirtS: "#0E0F15", shirtH: "#2C2F3B"};
export const ANA = {
  id: "ana", skin: "#8C5A3E", skinS: "#704430", skinH: "#A56E50",
  hair: "#2A1A14", hairType: "curly", glasses: false,
  shirt: "#2E9C8F", shirtS: "#1F7A70", shirtH: "#45B5A8", rolled: false, sleeveless: true,
  pants: "#2E9C8F", pantsS: "#1F7A70", shoe: "#C9785A", sole: "#8E4E36", uniform: false, dress: true,
};
export const KID = {
  id: "kid", skin: "#A26A4A", skinS: "#84523A", skinH: "#BC8463",
  hair: "#2A1A14", hairType: "curly", glasses: false,
  shirt: "#E2574C", shirtS: "#B9403A", shirtH: "#F07A6F", rolled: false,
  pants: "#2F5DA8", pantsS: "#244A88", shoe: "#F1EEE8", sole: "#B8B2A8", uniform: false,
};
export const MOVER1 = {
  id: "m1",
  skin: "#E2B08C", skinS: "#C38E6A", skinH: "#F0C6A6",
  hair: "#4A3022", hairType: "short", glasses: false, beard: false,
  shirt: "#14275A", shirtS: "#0C1A40", shirtH: "#22397A", rolled: false,
  pants: "#14214A", pantsS: "#0C1636", shoe: "#1C1C22", sole: "#3A3A44",
  uniform: true,
};
export const MOVER2 = {
  ...MOVER1, id: "m2", skin: "#8A5A3C", skinS: "#6E4329", skinH: "#A06C4B", hair: "#141010", hairType: "buzz",
};

// ---------- pose ----------
// ângulos em graus; 0 = membro pendendo para baixo; positivo gira no sentido horário da tela
export const POSE = {
  stand: {torso: 0, head: 0, turn: 0, aA: [8, 4], aB: [-8, -4], lA: [3, 0], lB: [-3, 0], hip: [0, 0]},
};
export const lerpPose = (a, b, u) => {
  const o = {};
  for (const k of Object.keys(a)) {
    const va = a[k], vb = b[k] === undefined ? va : b[k];
    o[k] = Array.isArray(va) ? va.map((v, i) => mix(v, vb[i], u)) : typeof va === "number" ? mix(va, vb, u) : u < 0.5 ? va : vb;
  }
  return o;
};

const L = {pelvisY: -470, shoulderY: -300, shoulderX: 100, hipX: 56, upper: 165, fore: 150, thigh: 228, shin: 228, neck: 34, headC: -112};

// ---------- cabeça ----------
export const Head = ({c, e = {}, turn = 0, detail = 1}) => {
  const tx = turn * 13;
  const smile = e.smile ?? 0.15, open = e.open ?? 0, blink = e.blink ?? 0, brow = e.brow ?? 0, look = e.look ?? [0, 0];
  const lidY = mix(-10, 4, blink);
  const eye = (sx) => {
    const cx = sx * 31 + tx;
    return (
      <g key={sx}>
        <ellipse cx={cx} cy={-6} rx={16} ry={mix(10.5, 1.2, blink)} fill="#FBF7F2" />
        {blink < 0.8 && (
          <g clipPath={`url(#eyeclip-${c.id}-${sx})`}>
            <circle cx={cx + look[0] * 6} cy={-5 + look[1] * 4} r={8.6} fill="#3B2417" />
            <circle cx={cx + look[0] * 6} cy={-5 + look[1] * 4} r={4.2} fill="#120A06" />
            <circle cx={cx + look[0] * 6 + 3} cy={-8 + look[1] * 4} r={2.4} fill="#fff" />
          </g>
        )}
        <clipPath id={`eyeclip-${c.id}-${sx}`}><ellipse cx={cx} cy={-6} rx={16} ry={mix(10.5, 1.2, blink)} /></clipPath>
        {/* pálpebra superior */}
        <path d={`M${cx - 18} ${-5} Q ${cx} ${lidY - 12} ${cx + 18} ${-5}`} stroke="#2A1810" strokeWidth={3.6} fill="none" strokeLinecap="round" />
      </g>
    );
  };
  const by = -33 - brow * 5;
  const browP = (sx) => {
    const inner = sx * 14 + tx, outer = sx * 50 + tx;
    const iy = by - brow * 4 + (e.worry ? -6 : 0), oy = by + 2 + (e.worry ? 4 : 0);
    return <path key={sx} d={`M${inner} ${iy} Q ${(inner + outer) / 2} ${Math.min(iy, oy) - 6} ${outer} ${oy}`} stroke={c.hair} strokeWidth={9} strokeLinecap="round" fill="none" />;
  };
  // boca
  const mw = 24 + smile * 6 + open * 3;
  const mY = 58;
  const curve = smile * 13;
  const mouth = open > 0.05
    ? (
      <g>
        <path d={`M${tx - mw} ${mY - curve * 0.3} Q ${tx} ${mY + curve + open * 26} ${tx + mw} ${mY - curve * 0.3} Q ${tx} ${mY + curve * 0.4 - 4} ${tx - mw} ${mY - curve * 0.3} Z`} fill="#5A2018" />
        <path d={`M${tx - mw + 6} ${mY - curve * 0.3 + 2} Q ${tx} ${mY + curve * 0.5 + 6} ${tx + mw - 6} ${mY - curve * 0.3 + 2} L ${tx + mw - 8} ${mY - curve * 0.3 - 1} Q ${tx} ${mY + curve * 0.4 - 2} ${tx - mw + 8} ${mY - curve * 0.3 - 1} Z`} fill="#fff" opacity={cl(open * 3)} />
      </g>
    )
    : <path d={`M${tx - mw} ${mY - curve * 0.35} Q ${tx} ${mY + curve} ${tx + mw} ${mY - curve * 0.35}`} stroke="#6A2E22" strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  return (
    <g>
      <defs>
        <radialGradient id={`face-${c.id}`} cx={0.38 - turn * 0.1} cy={0.38} r={0.75}>
          <stop offset="0" stopColor={c.skinH} />
          <stop offset="0.55" stopColor={c.skin} />
          <stop offset="1" stopColor={c.skinS} />
        </radialGradient>
      </defs>
      {/* orelhas */}
      <ellipse cx={-73 + tx * 0.4} cy={8} rx={13} ry={22} fill={c.skinS} />
      <ellipse cx={73 + tx * 0.4} cy={8} rx={13} ry={22} fill={c.skinS} />
      {/* rosto */}
      <path d={`M -72 -40 C -74 -104, 74 -104, 72 -40 L 70 18 C 66 70, 32 102, ${tx * 0.3} 104 C -32 102, -66 70, -70 18 Z`} fill={`url(#face-${c.id})`} />
      {/* sombra lateral do rosto */}
      <path d={`M 40 -60 C 70 -50, 74 10, 66 50 C 56 80, 30 100, 10 104 C 40 80, 58 40, 40 -60 Z`} fill={c.skinS} opacity={0.35} />
      {c.beard && <path d={`M -66 30 C -60 80, -30 104, 0 106 C 30 104, 60 80, 66 30 C 50 70, 30 82, 0 82 C -30 82, -50 70, -66 30 Z`} fill={c.hair} opacity={0.85} />}
      {/* cabelo */}
      {c.hairType === "paulo" && (
        <g>
          <path d="M -77 -4 C -90 -78, -58 -126, 2 -128 C 64 -126, 92 -78, 77 -4 L 71 -26 C 66 -50, 44 -64, 12 -62 C -24 -62, -58 -56, -70 -28 Z" fill={c.hair} />
          <path d="M -76 -8 C -80 -30, -76 -48, -70 -56 L -70 -22 Z" fill={c.gray} opacity={0.9} />
          <path d="M 76 -8 C 80 -30, 76 -48, 70 -56 L 70 -22 Z" fill={c.gray} opacity={0.9} />
          <path d="M -40 -118 C -10 -130, 30 -128, 56 -112" stroke="#4A4240" strokeWidth={4} fill="none" opacity={0.6} />
        </g>
      )}
      {c.hairType === "short" && <path d="M -76 -10 C -88 -82, -54 -124, 4 -124 C 62 -122, 90 -80, 76 -10 L 70 -34 C 60 -60, 30 -66, 0 -66 C -30 -64, -60 -58, -70 -34 Z" fill={c.hair} />}
      {c.hairType === "curly" && (
        <g fill={c.hair}>
          {[[-70, -40, 34], [-56, -86, 36], [-20, -112, 38], [24, -112, 38], [58, -86, 36], [72, -40, 34], [-82, 4, 28], [82, 4, 28], [-40, -70, 30], [40, -70, 30], [0, -80, 30]].map(([hx, hy, hr], i) => <circle key={i} cx={hx} cy={hy} r={hr} />)}
        </g>
      )}
      {c.hairType === "buzz" && <path d="M -74 -20 C -82 -86, -50 -118, 2 -118 C 56 -118, 84 -86, 74 -20 C 66 -54, 40 -70, 0 -70 C -40 -70, -66 -54, -74 -20 Z" fill={c.hair} opacity={0.85} />}
      {/* olhos e sobrancelhas */}
      {eye(-1)}{eye(1)}
      {browP(-1)}{browP(1)}
      {/* nariz */}
      <path d={`M ${tx - 4} 4 C ${tx - 8} 18, ${tx - 16} 28, ${tx - 13} 36 C ${tx - 8} 42, ${tx + 8} 42, ${tx + 13} 36`} stroke={c.skinS} strokeWidth={3.6} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={`M ${tx + 2} 8 C ${tx + 10} 20, ${tx + 14} 28, ${tx + 12} 34 C ${tx + 4} 30, ${tx} 18, ${tx + 2} 8 Z`} fill={c.skinH} opacity={0.5} />
      {/* bochechas */}
      {smile > 0.4 && <><ellipse cx={-42 + tx} cy={36} rx={14} ry={8} fill="#D9705A" opacity={0.18 * smile} /><ellipse cx={42 + tx} cy={36} rx={14} ry={8} fill="#D9705A" opacity={0.18 * smile} /></>}
      {mouth}
      {/* óculos */}
      {c.glasses && (
        <g stroke="#2C1F18" strokeWidth={5} fill="rgba(200,225,255,0.10)">
          <rect x={-31 + tx - 26} y={-26} width={52} height={40} rx={13} />
          <rect x={31 + tx - 26} y={-26} width={52} height={40} rx={13} />
          <path d={`M ${tx - 5} -12 Q ${tx} -17 ${tx + 5} -12`} fill="none" />
          <path d={`M ${-57 + tx} -14 L -72 -16 M ${57 + tx} -14 L 72 -16`} fill="none" />
          <path d={`M ${-48 + tx} -20 L ${-38 + tx} -22`} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
          <path d={`M ${14 + tx} -20 L ${24 + tx} -22`} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// mão (mitene com polegar). a = ângulo do antebraço
const Hand = ({p, a, c, flip = 1}) => (
  <g transform={`translate(${p[0]} ${p[1]}) rotate(${(a * 180) / Math.PI})`}>
    <path d="M -22 -2 C -26 20, -24 44, -10 54 C 0 60, 14 58, 20 48 C 28 34, 26 10, 22 -2 Z" fill={c.skin} />
    <path d={`M ${flip * 16} 6 C ${flip * 34} 14, ${flip * 36} 30, ${flip * 26} 38 C ${flip * 20} 30, ${flip * 18} 22, ${flip * 12} 18 Z`} fill={c.skin} stroke={c.skinS} strokeWidth={2} />
    <path d="M -12 42 L -12 52 M -2 46 L -2 57 M 8 44 L 8 54" stroke={c.skinS} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
  </g>
);

// ---------- personagem completo ----------
// pose: {torso, head, turn, aA:[ombro,cotovelo], aB, lA:[quadril,joelho], lB, hip:[dx,dy]}
// opts: e (expressão), hold (render prop desenhado entre as mãos), legsOff (cortar pernas)
export const Character = ({c, pose, e, x = 0, y = 0, s = 1, flip = 1, hold, holdBehind = false, holdUnder = false, shadow = true, light = 0.3, children}) => {
  const pz = POSE.stand;
  const p = {...pz, ...pose};
  const pelvis = [p.hip[0], L.pelvisY + p.hip[1]];
  const ta = deg(p.torso);
  const chest = add(pelvis, rot([0, L.shoulderY], ta));
  const shA = add(pelvis, rot([-L.shoulderX, L.shoulderY + 12], ta));
  const shB = add(pelvis, rot([L.shoulderX, L.shoulderY + 12], ta));
  const neckTop = add(chest, rot([0, -L.neck], ta));
  const headC = add(neckTop, rot([0, L.headC + L.neck], ta + deg(p.head)));
  const arm = (sh, [s1, s2]) => {
    const a1 = ta + deg(s1);
    const el = add(sh, rot([0, L.upper], a1));
    const a2 = a1 + deg(s2);
    const wr = add(el, rot([0, L.fore], a2));
    return {sh, el, wr, a1, a2};
  };
  const hpA = add(pelvis, [-L.hipX, 0]), hpB = add(pelvis, [L.hipX, 0]);
  const leg = (hp, [s1, s2, fs = 1]) => {
    const a1 = deg(s1);
    const kn = add(hp, rot([0, L.thigh * fs], a1));
    const a2 = a1 + deg(s2);
    const an = add(kn, rot([0, L.shin], a2));
    return {hp, kn, an, a1, a2};
  };
  const A = arm(shA, p.aA), B = arm(shB, p.aB);
  const LA = leg(hpA, p.lA), LB = leg(hpB, p.lB);
  const id = c.id;
  const sleeveEnd = (ar) => (c.rolled ? add(ar.el, rot([0, 34], ar.a2)) : add(ar.sh, rot([0, L.upper * 0.62], ar.a1)));
  const drawArm = (ar, side) => (
    <g>
      {/* antebraço */}
      <path d={capsule(ar.el, ar.wr, 27, 22)} fill={c.skin} />
      <path d={capsule(add(ar.el, rot([8, 0], ar.a2)), add(ar.wr, rot([6, 0], ar.a2)), 14, 10)} fill={c.skinS} opacity={0.35} />
      {/* braço */}
      {c.uniform ? (
        <>
          <path d={capsule(ar.sh, ar.el, 33, 28)} fill={c.skin} />
          <path d={capsule(ar.sh, sleeveEnd(ar), 44, 38)} fill={`url(#shirt-${id})`} />
          {/* faixas azul e ciano na barra da manga (uniforme) */}
          {(() => {
            const e1 = sleeveEnd(ar), n = rot([1, 0], ar.a1), d = rot([0, 1], ar.a1);
            const band = (off, col, w) => <path d={`M ${e1[0] - n[0] * 37 - d[0] * off} ${e1[1] - n[1] * 37 - d[1] * off} L ${e1[0] + n[0] * 37 - d[0] * off} ${e1[1] + n[1] * 37 - d[1] * off}`} stroke={col} strokeWidth={w} />;
            return <g>{band(10, "#1E6FF0", 9)}{band(20, "#27C0F5", 4)}</g>;
          })()}
        </>
      ) : (
        <>
          <path d={capsule(ar.sh, ar.el, 42, 33)} fill={`url(#shirt-${id})`} />
          <path d={capsule(ar.el, sleeveEnd(ar), 32, 30)} fill={c.shirtS} />
        </>
      )}
      <Hand p={ar.wr} a={ar.a2} c={c} flip={side} />
    </g>
  );
  const drawLeg = (lg) => (
    <g>
      <path d={capsule(lg.hp, lg.kn, 48, 42)} fill={`url(#pants-${id})`} />
      <path d={capsule(lg.kn, lg.an, 38, 32)} fill={`url(#pants-${id})`} />
      {/* sapato */}
      <g transform={`translate(${lg.an[0]} ${lg.an[1]}) rotate(${((lg.a2 * 180) / Math.PI) * 0.4})`}>
        <path d="M -38 4 C -40 -22, 30 -26, 52 10 C 56 22, 50 30, 40 30 L -36 30 C -42 30, -42 18, -38 4 Z" fill={c.shoe} />
        <path d="M -40 22 L 54 22 L 52 32 L -38 32 Z" fill={c.sole} />
      </g>
    </g>
  );
  // tronco
  const hemY = 34;
  const torsoPath = `M ${-L.shoulderX - 8} ${L.shoulderY + 10} C ${-L.shoulderX - 14} ${L.shoulderY + 90}, -86 -80, -78 ${hemY} L 78 ${hemY} C 86 -80, ${L.shoulderX + 14} ${L.shoulderY + 90}, ${L.shoulderX + 8} ${L.shoulderY + 10} C 60 ${L.shoulderY - 18}, -60 ${L.shoulderY - 18}, ${-L.shoulderX - 8} ${L.shoulderY + 10} Z`;
  const holdP = [(A.wr[0] + B.wr[0]) / 2, (A.wr[1] + B.wr[1]) / 2];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      <defs>
        <linearGradient id={`shirt-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={c.shirtH} />
          <stop offset="0.6" stopColor={c.shirt} />
          <stop offset="1" stopColor={c.shirtS} />
        </linearGradient>
        <linearGradient id={`pants-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={c.pants} />
          <stop offset="1" stopColor={c.pantsS} />
        </linearGradient>
      </defs>
      {shadow && <ellipse cx={(LA.an[0] + LB.an[0]) / 2 + 10} cy={Math.max(LA.an[1], LB.an[1]) + 32} rx={150} ry={22} fill="#000" opacity={0.22} filter="url(#softShadow)" />}
      {holdBehind && hold && hold(holdP, A, B)}
      {!holdUnder && drawArm(A, -1)}
      {drawLeg(LA)}
      {drawLeg(LB)}
      {/* cinto */}
      <g transform={`translate(${pelvis[0]} ${pelvis[1]}) rotate(${p.torso * 0.5})`}>
        <path d="M -82 -6 L 82 -6 L 80 40 L -80 40 Z" fill={`url(#pants-${id})`} />
      </g>
      {/* pescoço */}
      <path d={capsule(chest, neckTop, 24, 24)} fill={c.skinS} />
      <g transform={`translate(${pelvis[0]} ${pelvis[1]}) rotate(${p.torso})`}>
        <path d={torsoPath} fill={`url(#shirt-${id})`} />
        <circle cx={-L.shoulderX + 4} cy={L.shoulderY + 26} r={c.uniform ? 44 : 42} fill={`url(#shirt-${id})`} />
        <circle cx={L.shoulderX - 4} cy={L.shoulderY + 26} r={c.uniform ? 44 : 42} fill={c.shirtS} />
        {c.uniform ? (
          <g>
            {/* gola polo */}
            <path d={`M -40 ${L.shoulderY - 6} L 0 ${L.shoulderY + 44} L 40 ${L.shoulderY - 6} L 26 ${L.shoulderY - 14} L 0 ${L.shoulderY + 20} L -26 ${L.shoulderY - 14} Z`} fill="#0B1838" />
            <path d={`M -44 ${L.shoulderY - 4} L -12 ${L.shoulderY + 40} M 44 ${L.shoulderY - 4} L 12 ${L.shoulderY + 40}`} stroke="#1E6FF0" strokeWidth={5} />
            <path d={`M 0 ${L.shoulderY + 44} L 0 ${L.shoulderY + 100}`} stroke="#0B1838" strokeWidth={4} />
            <image href={staticFile("brand/wordmark_white.png")} x={22} y={L.shoulderY + 64} width={62} height={(62 * 254) / 555} opacity={0.95} />
            {/* faixa lateral */}
            <path d={`M 84 ${L.shoulderY + 60} C 86 -120, 82 -40, 78 ${hemY}`} stroke="#1E6FF0" strokeWidth={8} fill="none" opacity={0.9} />
          </g>
        ) : (
          <g>
            {/* camiseta e camisa aberta */}
            <path d={`M -36 ${L.shoulderY - 8} C -20 ${L.shoulderY + 26}, 20 ${L.shoulderY + 26}, 36 ${L.shoulderY - 8} L 30 ${hemY} L -30 ${hemY} Z`} fill="#F4EFE6" />
            <path d={`M -36 ${L.shoulderY - 8} L -30 ${hemY} M 36 ${L.shoulderY - 8} L 30 ${hemY}`} stroke={c.shirtS} strokeWidth={6} />
            <path d={`M -46 ${L.shoulderY - 10} L -26 ${L.shoulderY + 70} L -38 ${L.shoulderY + 70} Z M 46 ${L.shoulderY - 10} L 26 ${L.shoulderY + 70} L 38 ${L.shoulderY + 70} Z`} fill={c.shirtS} opacity={0.8} />
            <path d={`M -68 ${L.shoulderY + 70} L -52 ${L.shoulderY + 70} L -52 ${L.shoulderY + 100} L -68 ${L.shoulderY + 100} Z`} fill={c.shirtS} opacity={0.7} />
          </g>
        )}
        {/* sombra lateral */}
        <path d={`M 40 ${L.shoulderY} C 90 ${L.shoulderY + 60}, 90 -60, 78 ${hemY} L 52 ${hemY} C 70 -80, 70 ${L.shoulderY + 80}, 40 ${L.shoulderY} Z`} fill="#000" opacity={0.12} />
      </g>
      <g transform={`translate(${headC[0]} ${headC[1] + 6}) rotate(${p.torso + p.head}) scale(1.12)`}>
        <Head c={c} e={e} turn={p.turn} />
      </g>
      {!holdBehind && hold && hold(holdP, A, B)}
      {holdUnder && drawArm(A, -1)}
      {drawArm(B, 1)}
      {children}
    </g>
  );
};

export const SharedDefs = () => (
  <svg width="0" height="0" style={{position: "absolute"}}>
    <defs>
      <filter id="softShadow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="10" /></filter>
    </defs>
  </svg>
);

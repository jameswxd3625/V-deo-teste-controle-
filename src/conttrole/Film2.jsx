import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from "remotion";
import {FPS, K, FONT, clamp, mix, E, r, kf} from "./lib";
import {makeCam, boxFaces, shadowPoly, footPoly, ptsStr, planeMatrix, MAT, blendMat, rgb, lerp3, add} from "./engine3d";

/* =====================================================================
   CONTTROLE v2 — linguagem: "o faturamento e a fatia"
   Faturamento = colunas de prata (material de "TROLE"); imposto = fatias azuis (material de "CONT").
   Tipografia extrudada como a logo; legendas com espaçamento largo como "CONTABILIDADE".
   Prova: 0–8,5 s
   ===================================================================== */

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const HT = 4.0; // altura = 100% do faturamento do mês
const CUT = HT * 0.88;
const SL = HT * 0.12; // 12%
const GAP = 2.0;
const LIFT = 0.95;
const STACK = [-2.0, 0, 1.0];
const backS = E.back; // (0.34,1.45,0.64,1)

const growAt = (i) => (i === 0 ? -1 : 2.32 + (i - 1) * 0.07);
const cutAt = (i) => (i === 0 ? 0.3 : 3.42 + 0.95 * Math.pow((i - 1) / 10, 0.85));
const flyAt = (i) => 5.72 + i * 0.075;
const FLY = 0.42;

// subida da fatia: antecipação (desce), arranque, acomodação
const lift = (dt) => {
  if (dt <= 0) return 0;
  const dip = -0.06 * Math.sin(Math.PI * clamp(dt / 0.09)) * (dt < 0.09 ? 1 : 0);
  return dip + backS(clamp((dt - 0.07) / 0.5));
};

// ------------------------------------------------------------------ câmera
const CAMS = [
  [0.0, [3.2, 3.4, 14.5], [1.1, 2.7, 0], 30],
  [2.05, [2.9, 3.6, 13.4], [1.1, 2.9, 0], 30],
  [3.15, [4.2, 10.5, 10.5], [-0.8, 1.2, -9], 42],
  [5.6, [4.6, 10.8, 9.6], [-0.9, 1.0, -9.5], 42],
  [6.9, [1.0, 6.4, 15.0], [-1.4, 2.9, -3], 38],
  [7.8, [0.95, 6.35, 15.1], [-1.4, 2.9, -3], 38],
  [8.5, [-1.2, 3.6, 15.5], [-3.1, 2.8, 0.8], 42],
];
const camAt = (t) => {
  let a = CAMS[0], b = CAMS[0];
  for (let i = 1; i < CAMS.length; i++) {
    if (t <= CAMS[i][0]) {
      a = CAMS[i - 1];
      b = CAMS[i];
      break;
    }
    a = b = CAMS[i];
  }
  const ez = a === b ? 1 : t >= 7.85 ? E.out(clamp((t - a[0]) / (b[0] - a[0]))) : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  // micro-respiração da câmera (manual, não aleatória)
  const br = [0.03 * Math.sin(t * 0.9), 0.02 * Math.sin(t * 0.7 + 1), 0];
  return makeCam(add(lerp3(a[1], b[1], ez), br), lerp3(a[2], b[2], ez), mix(a[3], b[3], ez));
};

// ------------------------------------------------------------------ estado da cena
const sceneAt = (t) => {
  const boxes = [];
  const slices = [];
  for (let i = 0; i < 12; i++) {
    const z = -i * GAP;
    const g = i === 0 ? 1 : r(t, growAt(i), growAt(i) + 0.55, backS);
    if (g <= 0.001) continue;
    boxes.push({id: "c" + i, x: 0, y: 0, z, w: 1, h: CUT * g, d: 1, mat: blendMat(MAT.silver, MAT.shade, r(t, 7.9, 8.3, E.out)), col: i});
    const c = cutAt(i);
    const blue = r(t, c + 0.02, c + 0.32, E.inOut);
    let pos = [0, CUT * g + LIFT * lift(t - c), z];
    const bob = 0.035 * Math.sin(2.1 * (t - c)) * r(t, c + 0.7, c + 1.3);
    pos[1] += bob;
    let yaw = 9 * r(t, c + 0.05, c + 0.3) * (1 - r(t, c + 0.3, c + 0.9, E.inOut));
    // voo até a pilha
    const f = flyAt(i);
    const p = r(t, f, f + FLY, E.inOut);
    let landed = 0;
    if (p > 0) {
      const target = [STACK[0], i * SL, STACK[2]];
      const xz = lerp3(pos, target, p);
      xz[1] = mix(pos[1], target[1], E.in(p)) + 1.1 * Math.sin(Math.PI * p);
      pos = xz;
      yaw = 22 * Math.sin(Math.PI * p);
      landed = r(t, f + FLY, f + FLY + 0.01);
      if (landed) pos[1] -= 0.045 * Math.sin(Math.PI * clamp((t - f - FLY) / 0.14));
    }
    // virada: as camadas se afastam para serem examinadas
    if (landed) pos[1] += i * 0.16 * r(t, 7.95, 8.6, E.out);
    const s = {id: "s" + i, x: pos[0], y: pos[1], z: pos[2], w: 1, h: SL * g, d: 1, yaw, mat: blendMat(MAT.silver, MAT.blue, blue), slice: i, landed, blue};
    boxes.push(s);
    slices.push(s);
  }
  return {boxes, slices};
};

// ------------------------------------------------------------------ palco 3D
const Stage = ({t}) => {
  const cam = camAt(t);
  const {boxes, slices} = sceneAt(t);
  const sorted = [...boxes].sort((a, b) => {
    const da = Math.hypot(a.x - cam.pos[0], a.y + a.h / 2 - cam.pos[1], a.z - cam.pos[2]);
    const db = Math.hypot(b.x - cam.pos[0], b.y + b.h / 2 - cam.pos[1], b.z - cam.pos[2]);
    return db - da;
  });
  // horizonte
  const far = cam.proj([cam.pos[0] + cam.f[0] * 400, 0, cam.pos[2] + cam.f[2] * 400]);
  const hy = clamp(far[1], -400, 1920);
  const pool = cam.proj([-0.6, 0, -2.5]);
  const dim = kf(t, [[6.95, 0], [7.25, 0.32], [7.86, 0.32], [7.96, 0]]);
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: "absolute", inset: 0}}>
      <defs>
        <linearGradient id="floor" x1="0" y1={hy} x2="0" y2="1920" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#020E33" stopOpacity="0" />
          <stop offset={clamp(260 / Math.max(1, 1920 - hy), 0.01, 1)} stopColor="#020E33" stopOpacity="1" />
          <stop offset="1" stopColor="#04194A" />
        </linearGradient>
        <radialGradient id="pool" cx={pool[0]} cy={pool[1]} r="900" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${pool[0]} ${pool[1]}) scale(1 0.55) translate(${-pool[0]} ${-pool[1]})`}>
          <stop offset="0" stopColor="#0B3C9E" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0B3C9E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000814" stopOpacity="0.38" />
        </linearGradient>
        <filter id="b14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
        <filter id="b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="b2"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <rect x="0" y={hy} width="1080" height={Math.max(0, 1920 - hy)} fill="url(#floor)" />
      <rect x="0" y={hy} width="1080" height={Math.max(0, 1920 - hy)} fill="url(#pool)" />
      {hy > -100 && hy < 1900 && <rect x="-100" y={hy - 40} width="1280" height="80" fill={K.sky} opacity={0.12} filter="url(#b14)" />}
      {/* reflexos */}
      <g opacity={0.16} filter="url(#b2)">
        {sorted.map((b) => boxFaces(b, cam, true).map((F, k) => <polygon key={b.id + "m" + k} points={ptsStr(F.pts)} fill={rgb(F.col)} />))}
      </g>
      {/* sombras projetadas + contato */}
      <g filter="url(#b14)" opacity={0.75}>
        {boxes.map((b) => (b.y < 3 ? <polygon key={b.id + "sh"} points={ptsStr(shadowPoly(b, cam))} fill="#000412" opacity={clamp(1 - b.y / 3) * 0.8} /> : null))}
      </g>
      <g filter="url(#b5)">
        {boxes.map((b) => (b.y < 0.6 ? <polygon key={b.id + "ao"} points={ptsStr(footPoly(b, cam))} fill="#000208" opacity={0.85 * (1 - b.y / 0.6)} /> : null))}
      </g>
      <Annotations t={t} cam={cam} back />
      {sorted.map((b) => (
        <BoxG key={b.id} b={b} cam={cam} t={t} />
      ))}
      <Annotations t={t} cam={cam} slices={slices} />
      <rect width="1080" height="1920" fill="#000614" opacity={dim} />
    </svg>
  );
};

const BoxG = ({b, cam, t}) => {
  const F = boxFaces(b, cam);
  const m = b.mat;
  const edge = Array.isArray(m.edge) ? m.edge : [255, 255, 255];
  return (
    <g>
      {F.map((f, k) => (
        <g key={k}>
          <polygon points={ptsStr(f.pts)} fill={rgb(f.col)} />
          {f.k !== "+y" && <polygon points={ptsStr(f.pts)} fill="url(#sheen)" />}
          {f.k === "+y" && <polygon points={ptsStr(f.pts)} fill="none" stroke={rgb(edge, 0.95)} strokeWidth={1.6} strokeLinejoin="round" />}
        </g>
      ))}
      <FaceText b={b} cam={cam} t={t} faces={F} />
    </g>
  );
};

// textos impressos nas faces (identificam a variável)
const FaceText = ({b, cam, t, faces}) => {
  const front = faces.find((f) => f.k === "+z");
  if (!front) return null;
  if (b.id === "c0") {
    const a = 1 - r(t, 2.4, 2.9);
    if (a <= 0) return null;
    return (
      <text transform={planeMatrix(cam, [b.x + 0.16, 0.32, b.z + 0.502], [0, 1, 0], [1, 0, 0])} fontFamily={FONT} fontWeight={700} fontSize={27} letterSpacing={9} fill="#3B4258" opacity={a}>
        FATURAMENTO
      </text>
    );
  }
  if (b.slice != null && b.landed) {
    const a = r(t, flyAt(b.slice) + FLY, flyAt(b.slice) + FLY + 0.25);
    return (
      <text transform={planeMatrix(cam, [b.x - 0.36, b.y + 0.33, b.z + 0.502], [1, 0, 0], [0, -1, 0])} fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={5} fill="#E6F3FF" opacity={a * 0.92}>
        {MONTHS[b.slice]}
      </text>
    );
  }
  return null;
};

// anéis de corte, cotas e rótulos no piso
const Annotations = ({t, cam, back, slices}) => {
  if (back) {
    // rótulos dos meses no piso + régua
    return (
      <g>
        {MONTHS.map((mth, i) => {
          const a = (i === 0 ? r(t, 2.3, 2.7) : r(t, growAt(i) + 0.2, growAt(i) + 0.5)) * (1 - 0.6 * r(t, 6.9, 7.3));
          if (a <= 0) return null;
          const z = -i * GAP;
          return (
            <text key={i} transform={planeMatrix(cam, [0.66, 0.002, z + 0.42], [1, 0, 0], [0, 0, 1])} fontFamily={FONT} fontWeight={700} fontSize={30} letterSpacing={6} fill={K.silver} opacity={0.8 * a}>
              {mth}
            </text>
          );
        })}
      </g>
    );
  }
  const out = [];
  // anel de luz que mede e corta
  for (let i = 0; i < 12; i++) {
    const c = cutAt(i);
    const s0 = i === 0 ? -0.05 : c - 0.06;
    if (t < s0 || t > c + 0.32) continue;
    const y = i === 0 ? mix(HT + 0.02, CUT, r(t, 0.0, 0.3, E.inOut)) : CUT;
    const z = -i * GAP;
    const ring = [[-0.53, y, z - 0.53], [0.53, y, z - 0.53], [0.53, y, z + 0.53], [-0.53, y, z + 0.53]].map((p) => cam.proj(p));
    const flash = r(t, c, c + 0.32, E.out);
    const a = t < c ? 1 : 1 - flash;
    out.push(
      <g key={"r" + i} opacity={a}>
        <polygon points={ptsStr(ring)} fill="none" stroke={K.sky} strokeWidth={10 + 16 * flash} filter="url(#glow)" />
        <polygon points={ptsStr(ring)} fill="none" stroke="#E8F6FF" strokeWidth={2.5} />
      </g>
    );
  }
  // cota da fatia de janeiro
  const s0 = slices && slices[0];
  if (s0 && t > 0.35 && t < 2.45) {
    const a = r(t, 0.38, 0.6) * (1 - r(t, 2.1, 2.4));
    const x = 0.5 + 0.22;
    const zf = 0.5;
    const top = cam.proj([x, s0.y + SL, zf]);
    const bot = cam.proj([x, s0.y, zf]);
    const base0 = cam.proj([x, CUT, zf]);
    const base1 = cam.proj([x, 0, zf]);
    out.push(
      <g key="dim" opacity={a} stroke="#E8F6FF" strokeWidth={2.2}>
        <line x1={top[0]} y1={top[1]} x2={bot[0]} y2={bot[1]} />
        <line x1={top[0] - 12} y1={top[1]} x2={top[0] + 12} y2={top[1]} />
        <line x1={bot[0] - 12} y1={bot[1]} x2={bot[0] + 12} y2={bot[1]} />
        <line x1={base0[0]} y1={base0[1]} x2={base1[0]} y2={base1[1]} strokeOpacity={0.35} strokeDasharray="3 9" />
        <line x1={base0[0] - 10} y1={base0[1]} x2={base0[0] + 10} y2={base0[1]} strokeOpacity={0.5} />
        <line x1={base1[0] - 10} y1={base1[1]} x2={base1[0] + 10} y2={base1[1]} strokeOpacity={0.5} />
      </g>
    );
  }
  return <g>{out}</g>;
};

// ------------------------------------------------------------------ tipografia
const extrude = (n, c0, c1) =>
  Array.from({length: n}, (_, k) => {
    const p = k / Math.max(1, n - 1);
    const c = [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * p));
    return `${(k + 1) * 0.55}px ${(k + 1) * 0.9}px 0 rgb(${c.join(",")})`;
  }).join(",") + `, ${n * 0.6}px ${n * 1.3}px 26px rgba(0,4,18,0.75)`;

// número / palavra com volume (como as letras da logo)
const Solid = ({children, size, depth = 14, face, ls = -2, style}) => (
  <div style={{position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: ls, whiteSpace: "nowrap", ...style}}>
    <div style={{color: "#041B55", textShadow: extrude(depth, [6, 48, 140], [1, 10, 40])}}>{children}</div>
    <div style={{position: "absolute", inset: 0, backgroundImage: face, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent"}}>{children}</div>
  </div>
);
const BLUE_FACE = "linear-gradient(180deg, #9AD3FF 0%, #2F8BFF 38%, #1266F0 70%, #0A4AC8 100%)";
const SILVER_FACE = "linear-gradient(180deg, #FFFFFF 0%, #ECECEA 45%, #B9BAC0 100%)";

const Label = ({children, color = K.silver, size = 30, ls = 12, w = 700, style}) => (
  <div style={{fontFamily: FONT, fontWeight: w, fontSize: size, letterSpacing: ls, color, whiteSpace: "nowrap", lineHeight: 1, ...style}}>{children}</div>
);

// palavras que entram uma a uma (subida curta + desfoque que assenta)
const Words = ({t, at, gap = 0.12, words, size, w = 600, color = K.white, style}) => (
  <div style={{display: "flex", gap: size * 0.28, fontFamily: FONT, fontWeight: w, fontSize: size, lineHeight: 1.05, whiteSpace: "nowrap", ...style}}>
    {words.map((wd, k) => {
      const at2 = typeof gap === "number" ? at + k * gap : gap[k];
      const p = r(t, at2, at2 + 0.42, E.out);
      return (
        <span key={k} style={{display: "inline-block", color: wd.c || color, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: `blur(${(1 - p) * 6}px)`}}>
          {wd.w || wd}
        </span>
      );
    })}
  </div>
);

const Type = ({t}) => {
  const cam = camAt(t);
  const {slices} = sceneAt(t);
  const els = [];

  // A — "12%" preso à fatia
  if (t < 2.3) {
    const s0 = slices[0];
    const anchor = cam.proj([0.75, s0.y + SL * 0.5, 0.5]);
    const pin = r(t, 0.36, 0.62, E.out);
    const ex = r(t, 1.98, 2.22, E.in);
    const sc = mix(0.6, 1, backS(clamp((t - 0.36) / 0.4))) * mix(1, 0.4, ex);
    els.push(
      <div key="12" style={{position: "absolute", left: anchor[0] + 40, top: anchor[1] - 150, transformOrigin: "0% 60%", transform: `scale(${sc})`, opacity: pin * (1 - ex)}}>
        <Solid size={250} depth={Math.round(16 * pin)} face={BLUE_FACE} ls={-8}>
          12%
        </Solid>
        <div style={{marginTop: 26, marginLeft: 10, overflow: "hidden"}}>
          <Label size={34} ls={mix(2, 13, r(t, 0.84, 1.5, E.out))} color={K.white} style={{opacity: r(t, 0.84, 1.1), transform: `translateY(${(1 - r(t, 0.84, 1.2, E.out)) * 100}%)`}}>
            DE IMPOSTO
          </Label>
        </div>
      </div>
    );
  }

  // B — "Imagine pagar esse valor"
  if (t > 2.2 && t < 3.45) {
    const ex = r(t, 3.22, 3.4, E.in);
    els.push(
      <div key="imag" style={{position: "absolute", left: 80, top: 210, opacity: 1 - ex, transform: `translateY(${-50 * ex}px)`}}>
        <Words t={t} at={2.26} gap={[2.26, 2.6, 2.94, 3.2]} size={62} w={600} words={["Imagine", "pagar", {w: "esse", c: K.light}, {w: "valor", c: K.light}]} />
      </div>
    );
  }
  // B — "TODOS OS MESES"
  if (t > 3.4 && t < 4.6) {
    const wipe = r(t, 3.44, 3.75, E.out);
    const slam = r(t, 4.18, 4.42, E.out);
    const ex = r(t, 4.38, 4.56, E.in);
    els.push(
      <div key="todos" style={{position: "absolute", left: 76, top: 170, clipPath: `inset(-20% ${ex * 105}% -40% 0)`}}>
        <div style={{clipPath: `inset(-20% ${(1 - wipe) * 100}% -20% 0)`}}>
          <Solid size={128} depth={10} face={SILVER_FACE} ls={-3}>
            TODOS OS
          </Solid>
        </div>
        {t > 4.18 && (
          <div style={{marginTop: 4, transformOrigin: "0% 100%", transform: `scale(${mix(1.35, 1, slam)})`, opacity: slam}}>
            <Solid size={150} depth={Math.round(18 * slam)} face={BLUE_FACE} ls={-4}>
              MESES
            </Solid>
          </div>
        )}
      </div>
    );
  }
  // C — "sobre o faturamento da sua empresa"
  if (t > 4.52 && t < 6.35) {
    const ex = r(t, 6.06, 6.3, E.in);
    els.push(
      <div key="fat" style={{position: "absolute", left: 80, top: 200, opacity: 1 - ex, filter: `blur(${ex * 10}px)`, transform: `translateY(${-30 * ex}px)`}}>
        <Words t={t} at={4.56} gap={[4.56, 4.78]} size={50} w={600} color={K.silver} words={["sobre", "o"]} />
        <div style={{marginTop: 10, clipPath: `inset(-10% ${(1 - r(t, 4.9, 5.35, E.out)) * 100}% -30% 0)`}}>
          <Solid size={112} depth={10} face={SILVER_FACE} ls={-3}>
            faturamento
          </Solid>
        </div>
        <Words t={t} at={5.38} gap={[5.38, 5.7, 5.86]} size={50} w={600} color={K.silver} words={["da", "sua", {w: "empresa", c: K.white}]} style={{marginTop: 18}} />
      </div>
    );
  }
  // D — "e achar que é normal."
  if (t > 6.2 && t < 7.95) {
    const ex = r(t, 7.8, 7.9, E.in);
    const n = "normal.";
    const typed = Math.floor(clamp((t - 7.02) / 0.3) * n.length + 0.0001);
    els.push(
      <div key="norm" style={{position: "absolute", left: 80, top: 210, opacity: 1 - ex}}>
        <Words t={t} at={6.28} gap={[6.28, 6.6, 6.9, 7.0]} size={52} w={600} color={K.silver} words={["e", "achar", "que", "é"]} />
        <div style={{marginTop: 12, fontFamily: FONT, fontWeight: 800, fontSize: 150, letterSpacing: -5, color: K.white, lineHeight: 1}}>
          {n.slice(0, typed)}
          <span style={{display: "inline-block", width: 8, height: 120, marginLeft: 8, background: K.sky, opacity: t < 6.98 ? 0 : t < 7.36 || Math.floor(t * 3) % 2 === 0 ? 1 : 0, verticalAlign: "-8px"}} />
        </div>
      </div>
    );
  }
  // pilha: rótulo IMPOSTO
  if (t > 6.6 && t < 7.95) {
    const top = cam.proj([STACK[0], 12 * SL + 0.15, STACK[2] + 0.5]);
    const a = r(t, 6.65, 7.0) * (1 - r(t, 7.82, 7.92));
    els.push(
      <div key="imp" style={{position: "absolute", left: top[0] - 160, top: top[1] - 70, width: 320, textAlign: "center", opacity: a}}>
        <Label size={30} ls={12} color={K.light}>IMPOSTO</Label>
      </div>
    );
  }
  // E — virada: "Na Conttrole,"
  if (t > 7.9) {
    const wipe = r(t, 7.93, 8.2, E.out);
    els.push(
      <div key="na" style={{position: "absolute", left: 76, top: 200, clipPath: `inset(-20% ${(1 - wipe) * 100}% -40% 0)`}}>
        <Label size={44} ls={4} w={600} color={K.light} style={{marginBottom: 14}}>Na</Label>
        <Solid size={100} depth={12} face={SILVER_FACE} ls={-3}>
          Conttrole,
        </Solid>
      </div>
    );
  }
  return <>{els}</>;
};

// varredura de luz na trajetória da seta da marca (virada em 7,92 s)
const Sweep = ({t}) => {
  if (t < 7.84 || t > 8.55) return null;
  const hd = r(t, 7.86, 8.12, E.soft);
  const tl = r(t, 7.98, 8.5, E.in);
  const d = "M -120 1780 C 260 1500, 620 1180, 1200 360";
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
      <defs>
        <filter id="sw" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16" /></filter>
      </defs>
      <path d={d} pathLength={1} fill="none" stroke={K.sky} strokeWidth={70} strokeOpacity={0.5} strokeDasharray={`${Math.max(0.001, hd - tl)} 2`} strokeDashoffset={-tl} filter="url(#sw)" strokeLinecap="round" />
      <path d={d} pathLength={1} fill="none" stroke="#DFF2FF" strokeWidth={9} strokeDasharray={`${Math.max(0.001, hd - tl)} 2`} strokeDashoffset={-tl} strokeLinecap="round" />
    </svg>
  );
};

const Atmos = ({t}) => {
  const turn = kf(t, [[7.9, 0], [8.1, 1]]);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 900px 700px at 540px ${mix(380, 520, turn)}px, rgba(14,70,190,${mix(0.32, 0.55, turn)}) 0%, rgba(0,8,31,0) 70%), ${K.bg}`}} />
  );
};
// legibilidade do topo
const Scrim = () => <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(0,8,31,0.7) 0%, rgba(0,8,31,0.35) 22%, rgba(0,8,31,0) 34%)"}} />;
const Vignette = () => <AbsoluteFill style={{background: "radial-gradient(ellipse 85% 70% at 50% 52%, transparent 55%, rgba(0,3,14,0.7) 100%)"}} />;

export const Film2 = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
      <Atmos t={t} />
      <Stage t={t} />
      <Scrim />
      <Vignette />
      <Sweep t={t} />
      <Type t={t} />
      <Audio src={staticFile("mix2.wav")} />
    </AbsoluteFill>
  );
};

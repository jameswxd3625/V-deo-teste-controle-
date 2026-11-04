import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from "remotion";
import {FPS, K, FONT, clamp, mix, E, r, kf} from "./lib";
import {makeCam, boxFaces, boxVerts, hull, ptsStr, planeMatrix, MAT, blendMat, rgb, lerp3, sub, mul, LIGHT} from "./engine3d";

/* =====================================================================
   CONTTROLE v3 — prova 0–8,5 s
   1 cobrança  -> barra de faturamento (100%), 12% medidos e destacados
   repetição   -> a barra vira a linha JAN de uma tabela de 12 meses; cada mês sofre o corte
   efeito      -> 12 linhas = faturamento de 12 meses; 12 fatias = imposto de 12 meses (mesmo período, 88/12)
   ===================================================================== */

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const L0 = -4, LEN = 8, XC = L0 + LEN * 0.88; // corte em 88%
const T = 0.9, DZ = 1.4, ROW = 1.2, GAPX = 0.35;
const WALLZ = -1.3;
const LW = [0.28, 0.42, 0.86]; // luz para as sombras na parede

const cutAt = (i) => (i === 0 ? 0.47 : 3.46 + (i - 1) * 0.087);
const growAt = (i) => (i === 0 ? -9 : 2.5 + (i - 1) * 0.055);
const letterAt = (k) => 3.46 + k * 0.087;

// ------------------------------------------------------------------ câmera (cada movimento revela a próxima informação)
const CAMS = [
  [0.0, [2.0, 7.5, 32.5], [0.4, -0.8, 0], 30, E.inOut],
  [2.2, [1.9, 7.2, 30.8], [0.4, -0.85, 0], 30, E.inOut], // 1 cobrança: aproximação lenta
  [3.15, [2.6, 3.0, 45.5], [0.3, -5.4, 0], 30, E.inOut], // recua: aparecem os 12 meses
  [4.85, [2.5, 2.8, 45.0], [0.3, -5.4, 0], 30, E.inOut],
  [6.2, [24, 4.5, 27], [1.6, -4.4, 0], 31, E.inOut], // gira: os totais ganham volume
  [7.62, [24.2, 4.6, 27.2], [1.6, -4.4, 0], 31, E.inOut],
  [7.9, [24.8, 4.9, 28.2], [1.6, -4.4, 0], 31, E.in], // antecipação
  [8.5, [19.5, 2.6, 25.5], [3.9, -4.9, 1.2], 32, E.out], // virada: aproxima do imposto
];
const camAt = (t) => {
  let i = 1;
  while (i < CAMS.length - 1 && t > CAMS[i][0]) i++;
  const a = CAMS[i - 1], b = CAMS[i];
  const p = b[4](clamp((t - a[0]) / (b[0] - a[0])));
  return makeCam(lerp3(a[1], b[1], p), lerp3(a[2], b[2], p), mix(a[3], b[3], p));
};

// ------------------------------------------------------------------ cena
const sceneAt = (t) => {
  const m = r(t, 4.95, 5.75, E.inOut); // linhas se fundem em totais de 12 meses
  const sep = r(t, 6.42, 7.06, E.in); // bloco de imposto se desprende (cai com peso)
  const ant = Math.sin(Math.PI * r(t, 6.3, 6.46)) * 0.12;
  const land = Math.sin(Math.PI * clamp((t - 7.06) / 0.16)) * (t > 7.06 ? 1 : 0);
  const turn = r(t, 7.94, 8.5, E.out);
  const shade = r(t, 7.9, 8.3, E.out);
  const rows = [];
  const slices = [];
  for (let i = 0; i < 12; i++) {
    const g = i === 0 ? 1 : r(t, growAt(i), growAt(i) + 0.5, E.out);
    if (g <= 0) continue;
    const y = -i * mix(ROW, T, m) - T / 2;
    const total = LEN * g;
    const revLen = Math.min(LEN * 0.88, total);
    rows.push({id: "r" + i, x: L0 + revLen / 2, y, z: 0, w: revLen, h: T, d: DZ, mat: blendMat(MAT.silver, MAT.shade, shade * 0.75), row: i});
    const sl = Math.max(0, total - LEN * 0.88);
    if (sl <= 0.001) continue;
    const c = cutAt(i);
    const cut = r(t, c, c + 0.4, E.back);
    let dx = GAPX * cut, dy = 0, dz = 0;
    if (i === 0) {
      // 1ª cobrança: o pedaço se destaca para a frente
      const pull = r(t, 0.5, 1.0, E.back) * (1 - r(t, 2.3, 2.95, E.inOut));
      const pre = -0.08 * Math.sin(Math.PI * r(t, 0.45, 0.55));
      dx = pre + mix(GAPX * cut, 0.55, pull);
      dz = 1.0 * pull;
      dy = 0.12 * pull;
    } else {
      dz = 0.35 * Math.sin(Math.PI * r(t, c, c + 0.45));
    }
    // efeito: o imposto do ano sai como um bloco
    dx += -ant + 1.45 * sep;
    dz += 1.25 * sep;
    dy += -0.06 * land;
    // virada: o bloco se abre em 3 camadas para análise
    const grp = Math.floor(i / 4);
    dy += (1 - grp) * 0.4 * turn;
    const blue = r(t, c, c + 0.25, E.inOut);
    const s = {id: "s" + i, x: XC + sl / 2 + dx, y: y + dy, z: dz, w: sl, h: T, d: DZ, mat: blendMat(MAT.silver, MAT.blue, blue), slice: i, blue};
    slices.push(s);
  }
  return {rows, slices, m, sep};
};

// ------------------------------------------------------------------ desenho das caixas
const BoxG = ({b, cam, glow = 0}) => {
  const F = boxFaces(b, cam);
  const V = boxVerts(b).map((v) => cam.proj(v));
  const edge = Array.isArray(b.mat.edge) ? b.mat.edge : [255, 255, 255];
  const isBlue = b.slice != null;
  return (
    <g>
      {F.map((f, k) => (
        <g key={k}>
          <polygon points={ptsStr(f.pts)} fill={rgb(f.col)} />
          {f.k === "+z" && <polygon points={ptsStr(f.pts)} fill={isBlue ? "url(#gBlue)" : "url(#gSilver)"} />}
          {(f.k === "+x" || f.k === "-x") && <polygon points={ptsStr(f.pts)} fill="url(#gSide)" />}
        </g>
      ))}
      {/* chanfro: aresta superior frontal acesa, aresta inferior escura */}
      <line x1={V[3][0]} y1={V[3][1]} x2={V[7][0]} y2={V[7][1]} stroke={rgb(edge, 0.95)} strokeWidth={2} />
      <line x1={V[1][0]} y1={V[1][1]} x2={V[5][0]} y2={V[5][1]} stroke="rgba(0,6,24,0.55)" strokeWidth={1.5} />
      <line x1={V[5][0]} y1={V[5][1]} x2={V[7][0]} y2={V[7][1]} stroke={rgb(edge, 0.55)} strokeWidth={1.4} />
      {glow > 0 && F.filter((f) => f.k === "+z").map((f, k) => <polygon key={"g" + k} points={ptsStr(f.pts)} fill="none" stroke={K.sky} strokeWidth={10} opacity={glow * 0.6} filter="url(#gl)" />)}
    </g>
  );
};

const wallShadow = (b, cam) => {
  const P = boxVerts(b).map((v) => sub(v, mul(LW, (v[2] - WALLZ) / LW[2])));
  return hull(P.map((v) => cam.proj(v)));
};

// ------------------------------------------------------------------ palco
const Stage = ({t, cam, S}) => {
  const all = [...S.rows, ...S.slices];
  const sorted = all.sort((a, b) => {
    const da = Math.hypot(a.x - cam.pos[0], a.y + a.h / 2 - cam.pos[1], a.z - cam.pos[2]);
    const db = Math.hypot(b.x - cam.pos[0], b.y + b.h / 2 - cam.pos[1], b.z - cam.pos[2]);
    return db - da;
  });
  const j0 = S.rows[0];
  // medição dos 12% (luz que percorre da ponta até 88%)
  const meas = r(t, 0.1, 0.45, E.inOut);
  const xm = mix(L0 + LEN, XC, meas);
  const zf = DZ / 2 + 0.005;
  const front = (x0, x1) => [[x0, -T, zf], [x1, -T, zf], [x1, 0, zf], [x0, 0, zf]].map((p) => cam.proj([p[0], p[1] + 0, p[2]]));
  const measA = (t > 0.08 && t < 0.62 ? 1 : 0) * (1 - r(t, 0.47, 0.62));
  const flash = r(t, 0.45, 0.7, E.out);
  const cl = [cam.proj([XC, 0.05, zf]), cam.proj([XC, -T - 0.05, zf])];
  const mx = [cam.proj([xm, 0.12, zf]), cam.proj([xm, -T - 0.12, zf])];
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: "absolute", inset: 0}}>
      <defs>
        <linearGradient id="gSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#0A1430" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFE3FF" stopOpacity="0.35" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#001048" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="gSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000814" stopOpacity="0.35" />
        </linearGradient>
        <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22" /></filter>
        <filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      {/* sombras na parede: dão profundidade sem chão */}
      <g filter="url(#sh)" opacity={0.5}>
        {all.map((b) => <polygon key={b.id + "w"} points={ptsStr(wallShadow(b, cam))} fill="#00030F" />)}
      </g>
      {sorted.map((b) => (
        <BoxG key={b.id} b={b} cam={cam} glow={b.slice != null ? r(t, cutAt(b.slice), cutAt(b.slice) + 0.12) * (1 - r(t, cutAt(b.slice) + 0.12, cutAt(b.slice) + 0.7)) : 0} />
      ))}
      {/* medição */}
      {measA > 0 && j0 && (
        <g opacity={measA}>
          <polygon points={ptsStr(front(xm, L0 + LEN).map((p) => p))} fill={K.sky} opacity={0.32} />
          <line x1={mx[0][0]} y1={mx[0][1]} x2={mx[1][0]} y2={mx[1][1]} stroke={K.sky} strokeWidth={14} opacity={0.6} filter="url(#gl)" />
          <line x1={mx[0][0]} y1={mx[0][1]} x2={mx[1][0]} y2={mx[1][1]} stroke="#EAF7FF" strokeWidth={3} />
        </g>
      )}
      {flash > 0 && flash < 1 && (
        <g opacity={1 - flash}>
          <line x1={cl[0][0]} y1={cl[0][1] - 40 * flash} x2={cl[1][0]} y2={cl[1][1] + 40 * flash} stroke={K.sky} strokeWidth={10 + 30 * flash} filter="url(#gl)" />
          <line x1={cl[0][0]} y1={cl[0][1] - 40 * flash} x2={cl[1][0]} y2={cl[1][1] + 40 * flash} stroke="#fff" strokeWidth={3} />
        </g>
      )}
      <FaceText t={t} cam={cam} S={S} />
    </svg>
  );
};

// textos impressos nos volumes: identificam a variável e o período
const FaceText = ({t, cam, S}) => {
  const a = r(t, 5.55, 5.95);
  if (a <= 0 || !S.rows.length) return null;
  const zf = DZ / 2 + 0.006;
  const last = S.slices[S.slices.length - 1];
  const s0 = S.slices[0];
  const yMid = -6 * T + 0.1;
  const out = 1 - r(t, 7.9, 8.15);
  return (
    <g opacity={a * out}>
      <text transform={planeMatrix(cam, [L0 + 0.45, yMid, zf], [1, 0, 0], [0, -1, 0])} fontFamily={FONT} fontWeight={800} fontSize={60} letterSpacing={12} fill="#1A2440">
        FATURAMENTO
      </text>
      <text transform={planeMatrix(cam, [L0 + 0.47, yMid - 0.8, zf], [1, 0, 0], [0, -1, 0])} fontFamily={FONT} fontWeight={600} fontSize={40} letterSpacing={10} fill="#2C3858">
        12 MESES
      </text>
      {s0 && last && (
        <>
          <text transform={planeMatrix(cam, [s0.x + 0.12, last.y + 0.45, s0.z + zf], [0, 1, 0], [1, 0, 0])} fontFamily={FONT} fontWeight={800} fontSize={40} letterSpacing={10} fill="#EAF6FF">
            IMPOSTO
          </text>
          <text transform={planeMatrix(cam, [s0.x + 0.38, last.y + 0.45, s0.z + zf], [0, 1, 0], [1, 0, 0])} fontFamily={FONT} fontWeight={600} fontSize={26} letterSpacing={8} fill="#BFE0FF">
            12 MESES
          </text>
        </>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ tipografia
const extrude = (n) =>
  Array.from({length: n}, (_, k) => {
    const p = k / Math.max(1, n - 1);
    const c = [6, 48, 140].map((v, j) => Math.round(v + ([1, 10, 40][j] - v) * p));
    return `${(k + 1) * 0.55}px ${(k + 1) * 0.9}px 0 rgb(${c.join(",")})`;
  }).join(",") + `, ${n * 0.6}px ${n * 1.4}px 28px rgba(0,4,18,0.8)`;
const BLUE_FACE = "linear-gradient(180deg, #A6D8FF 0%, #3392FF 36%, #1266F0 68%, #0A4AC8 100%)";
const SILVER_FACE = "linear-gradient(180deg, #FFFFFF 0%, #EDEDEB 46%, #B4B6BD 100%)";
const Solid = ({children, size, depth = 14, face = SILVER_FACE, ls = -2, style}) => (
  <div style={{position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: ls, whiteSpace: "nowrap", ...style}}>
    <div style={{color: "#041B55", textShadow: depth > 0 ? extrude(depth) : "none"}}>{children}</div>
    <div style={{position: "absolute", inset: 0, backgroundImage: face, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent"}}>{children}</div>
  </div>
);
const Label = ({children, size = 30, ls = 12, w = 700, color = K.white, style}) => (
  <div style={{fontFamily: FONT, fontWeight: w, fontSize: size, letterSpacing: ls, color, whiteSpace: "nowrap", lineHeight: 1, ...style}}>{children}</div>
);
const at = (x, y, style) => ({position: "absolute", left: x, top: y, ...style});

const Type = ({t, cam, S}) => {
  const els = [];
  const P = (p) => cam.proj(p);
  const zf = DZ / 2;

  // ---- cabeçalho FATURAMENTO: nasce sobre a barra, vira cabeçalho da tabela, depois vira o assunto da frase
  {
    const anc = P([L0, T / 2, -zf]);
    const pin = 1;
    const toHead = r(t, 4.86, 5.3, E.inOut);
    const out = r(t, 6.05, 6.25, E.in);
    const x = mix(anc[0], 80, toHead);
    const y = mix(anc[1] - 52, 236, toHead);
    const size = mix(34, 100, toHead);
    if (out < 1)
      els.push(
        <div key="fat" style={at(x, y, {opacity: pin * (1 - out), transform: `translateY(${-40 * out}px)`})}>
          <div style={{fontFamily: FONT, fontWeight: mix(700, 900, toHead), fontSize: size, letterSpacing: mix(10, -2, toHead), color: K.white, lineHeight: 1, whiteSpace: "nowrap"}}>FATURAMENTO</div>
        </div>
      );
  }
  // ---- 100% (cota da barra inteira)
  if (t < 2.5) {
    const a = 1 - r(t, 2.2, 2.45);
    const A = P([L0, T / 2 + 0.55, -zf]), B = P([L0 + LEN, T / 2 + 0.55, -zf]);
    const d = r(t, -0.2, 0.3, E.out);
    els.push(
      <svg key="cota" width="1080" height="1920" style={{position: "absolute", inset: 0, opacity: a}}>
        <g stroke="rgba(255,255,255,0.75)" strokeWidth={2}>
          <line x1={A[0]} y1={A[1]} x2={mix(A[0], B[0], d)} y2={mix(A[1], B[1], d)} />
          <line x1={A[0]} y1={A[1] - 12} x2={A[0]} y2={A[1] + 12} />
          <line x1={B[0]} y1={B[1] - 12} x2={B[0]} y2={B[1] + 12} opacity={d} />
        </g>
      </svg>
    );
    els.push(
      <div key="100" style={at(B[0] - 120, B[1] - 48, {width: 120, textAlign: "right", opacity: a * r(t, 0.15, 0.4)})}>
        <Label size={34} ls={2} w={800}>100%</Label>
      </div>
    );
  }
  // ---- "12%": sai do pedaço cortado; depois vira o cabeçalho da coluna de imposto
  {
    const s0 = S.slices[0];
    if (s0 && t > 0.5) {
      const under = P([s0.x + s0.w / 2, s0.y - 0.1, s0.z + zf]);
      const head = P([XC + GAPX + (LEN * 0.12) / 2, T / 2, -zf]);
      const grow = r(t, 0.52, 0.95, E.back);
      const dock = r(t, 2.25, 2.95, E.inOut);
      const sc = mix(0.25, 1, grow) * mix(1, 0.3, r(t, 2.25, 2.62, E.inOut));
      const out = r(t, 7.88, 8.05, E.in);
      // ancoragem: canto superior direito sob o pedaço -> centro inferior acima da coluna
      const ax = mix(under[0] + 30, head[0], dock);
      const ay = mix(under[1] + 34, head[1] - 22, dock);
      els.push(
        <div key="12" style={at(ax, ay, {transform: `translate(${mix(-100, -50, dock)}%, ${mix(0, -100, dock)}%) scale(${sc})`, transformOrigin: dock > 0.5 ? "50% 100%" : "100% 0%", opacity: r(t, 0.5, 0.62) * (1 - out)})}>
          <Solid size={240} depth={Math.round(16 * grow)} face={BLUE_FACE} ls={-8}>12%</Solid>
        </div>
      );
      const di = r(t, 0.84, 1.3, E.out) * (1 - r(t, 2.15, 2.4));
      if (di > 0)
        els.push(
          <div key="di" style={at(under[0] + 30 - 560, under[1] + 34 + 250, {width: 560, textAlign: "right", opacity: di})}>
            <Label size={38} ls={mix(2, 14, di)} w={700}>DE IMPOSTO</Label>
          </div>
        );
      const im = r(t, 2.8, 3.1) * (1 - r(t, 7.88, 8.05));
      if (im > 0)
        els.push(
          <div key="im" style={at(head[0] - 150, head[1] - 22 - 72 - 40, {width: 300, textAlign: "center", opacity: im})}>
            <Label size={22} ls={8} color={K.light}>IMPOSTO</Label>
          </div>
        );
    }
  }
  // ---- meses na lateral (aparecem com cada linha)
  if (t > 2.3 && t < 5.6) {
    const fade = 1 - r(t, 4.95, 5.4);
    MONTHS.forEach((mm, i) => {
      const a = (i === 0 ? r(t, 2.3, 2.6) : r(t, growAt(i), growAt(i) + 0.3)) * fade;
      if (a <= 0) return;
      const row = S.rows[i];
      if (!row) return;
      const p = P([L0 - 0.25, row.y + T / 2, zf]);
      p[1] -= 3;
      const cutNow = i > 0 && t > cutAt(i) && t < cutAt(i) + 0.5;
      els.push(
        <div key={mm} style={at(p[0] - 112, p[1] - 16, {width: 100, textAlign: "right", opacity: a})}>
          <Label size={32} ls={4} w={800} color={cutNow ? K.light : K.silver}>{mm}</Label>
        </div>
      );
    });
  }
  // ---- "Imagine pagar esse valor": revelado no ritmo da fala
  if (t > 2.2 && t < 3.55) {
    const wp = kf(t, [[2.26, 0], [2.6, 0.33], [2.94, 0.58], [3.2, 0.8], [3.46, 1]], E.lin);
    const out = r(t, 3.36, 3.52, E.in);
    const ul = r(t, 3.0, 3.4, E.out);
    els.push(
      <div key="imag" style={at(80, 200, {clipPath: `inset(-20% ${(1 - wp) * 100}% -40% 0)`, opacity: 1 - out, transform: `translateY(${-30 * out}px)`})}>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 58, color: K.white, whiteSpace: "nowrap"}}>
          Imagine pagar <span style={{color: K.light, fontWeight: 800, position: "relative"}}>esse valor<span style={{position: "absolute", left: 0, bottom: -10, height: 5, width: `${ul * 100}%`, background: K.sky}} /></span>
        </div>
      </div>
    );
  }
  // ---- "TODOS OS MESES": 12 letras, uma para cada corte mensal
  if (t > 3.4 && t < 4.95) {
    const letters = "TODOSOSMESES".split("");
    const out = r(t, 4.6, 4.85, E.in);
    const mk = (k) => {
      const p = r(t, letterAt(k), letterAt(k) + 0.32, E.back);
      return {opacity: clamp(p * 3), transform: `translateY(${(1 - p) * -60}px)`, display: "inline-block"};
    };
    els.push(
      <div key="todos" style={at(78, 150, {opacity: 1 - out, transform: `translateY(${-40 * out}px)`})}>
        <div style={{display: "flex"}}>
          {letters.slice(0, 7).map((c, k) => (
            <span key={k} style={{...mk(k), marginLeft: k === 5 ? 34 : 0}}>
              <Solid size={112} depth={8} ls={-2}>{c}</Solid>
            </span>
          ))}
        </div>
        <div style={{display: "flex", marginTop: 4}}>
          {letters.slice(7).map((c, k) => (
            <span key={k} style={mk(k + 7)}>
              <Solid size={112} depth={10} face={BLUE_FACE} ls={-2}>{c}</Solid>
            </span>
          ))}
        </div>
      </div>
    );
  }
  // ---- "sobre o … da sua empresa"
  if (t > 4.5 && t < 6.3) {
    const out = r(t, 6.05, 6.25, E.in);
    const a1 = r(t, 4.55, 4.85, E.out);
    const a2 = r(t, 5.38, 5.75, E.out);
    els.push(
      <div key="sob" style={{opacity: 1 - out, transform: `translateY(${-40 * out}px)`}}>
        <div style={at(82, 176, {opacity: a1, transform: `translateX(${(1 - a1) * -30}px)`})}>
          <Label size={44} ls={1} w={600} color={K.silver}>sobre o</Label>
        </div>
        <div style={at(82, 352, {opacity: a2, clipPath: `inset(0 ${(1 - a2) * 100}% 0 0)`})}>
          <Label size={44} ls={1} w={600} color={K.silver}>da sua <span style={{color: K.white, fontWeight: 800}}>empresa</span></Label>
        </div>
      </div>
    );
  }
  // ---- "e achar que é normal." — "normal." cai junto com o bloco
  if (t > 6.25 && t < 7.95) {
    const a1 = r(t, 6.28, 6.6, E.out);
    const drop = r(t, 6.62, 7.06, E.in);
    const settle = Math.sin(Math.PI * clamp((t - 7.06) / 0.18)) * (t > 7.06 ? 1 : 0);
    const out = r(t, 7.84, 7.93, E.in);
    els.push(
      <div key="norm" style={{opacity: 1 - out}}>
        <div style={at(82, 160, {opacity: a1})}>
          <Label size={46} ls={1} w={600} color={K.silver}>e achar que é</Label>
        </div>
        <div style={at(76, mix(-170, 222, drop) + 10 * settle, {opacity: clamp(drop * 4)})}>
          <Solid size={136} depth={14} ls={-4}>normal.</Solid>
        </div>
      </div>
    );
  }
  // ---- virada
  if (t > 7.9) {
    const w = r(t, 7.93, 8.25, E.out);
    els.push(
      <div key="na" style={at(78, 170, {clipPath: `inset(-30% ${(1 - w) * 100}% -40% 0)`})}>
        <Label size={42} ls={4} w={600} color={K.light} style={{marginBottom: 12}}>Na</Label>
        <Solid size={112} depth={12} ls={-3}>Conttrole,</Solid>
      </div>
    );
  }
  return <>{els}</>;
};

// ------------------------------------------------------------------ luz e fundo (o azul estrutura a peça)
const Light = ({t, cam, S}) => {
  // a luz-chave acompanha a ação
  let key = [XC + 0.6, -0.4, 0.5];
  if (t > 2.3) key = [0.4, -6.2, 0];
  if (t > 3.4 && t < 4.6) {
    const i = clamp(Math.floor((t - 3.46) / 0.087) + 1, 1, 11);
    key = [XC + 0.6, -i * ROW - 0.45, 0];
  }
  if (t > 4.6) key = [0.6, -5.2, 0];
  if (t > 6.3) key = [XC + 1.9, -5.0, 1.2];
  const k = cam.proj(key);
  const kx = k[0], ky = k[1];
  const inten = kf(t, [[0, 0.75], [0.45, 1.15], [1.2, 1], [6.4, 1], [7.1, 1.25], [7.6, 0.75], [7.88, 0.55], [8.0, 1.5], [8.5, 1.2]]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: "linear-gradient(180deg, #000A26 0%, #01113A 55%, #000A24 100%)"}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 760px 640px at ${kx}px ${ky}px, rgba(21,112,249,${0.42 * inten}) 0%, rgba(8,48,140,${0.22 * inten}) 38%, rgba(0,8,31,0) 72%)`}} />
      <BrandArc t={t} />
      <AbsoluteFill style={{background: "radial-gradient(ellipse 90% 75% at 50% 50%, transparent 58%, rgba(0,3,14,0.75) 100%)"}} />
    </AbsoluteFill>
  );
};
// a seta da logo como estrutura de luz ao fundo, presente em todos os quadros
const BrandArc = ({t}) => {
  const turn = kf(t, [[7.9, 0], [8.05, 1], [8.5, 0.6]]);
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
      <defs>
        <linearGradient id="arcg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={K.blue} stopOpacity="0" />
          <stop offset="1" stopColor={K.sky} stopOpacity="1" />
        </linearGradient>
        <filter id="abl"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <g opacity={0.09 + 0.25 * turn} filter="url(#abl)">
        <path d="M -200 1980 C 300 1720, 760 1300, 1010 620" fill="none" stroke="url(#arcg)" strokeWidth={46} strokeLinecap="round" />
        <polygon points="1060,470 1110,700 930,620" fill={K.sky} />
      </g>
    </svg>
  );
};

const Sweep = ({t}) => {
  if (t < 7.86 || t > 8.55) return null;
  const hd = r(t, 7.88, 8.12, E.soft);
  const tl = r(t, 7.98, 8.5, E.in);
  const d = "M -120 1880 C 300 1600, 760 1220, 1150 300";
  const dash = `${Math.max(0.001, hd - tl)} 2`;
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
      <defs><filter id="sw" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16" /></filter></defs>
      <path d={d} pathLength={1} fill="none" stroke={K.sky} strokeWidth={80} strokeOpacity={0.45} strokeDasharray={dash} strokeDashoffset={-tl} filter="url(#sw)" strokeLinecap="round" />
      <path d={d} pathLength={1} fill="none" stroke="#E2F3FF" strokeWidth={9} strokeDasharray={dash} strokeDashoffset={-tl} strokeLinecap="round" />
    </svg>
  );
};

export const Film3 = () => {
  const t = useCurrentFrame() / FPS;
  const cam = camAt(t);
  const S = sceneAt(t);
  const dim = kf(t, [[7.6, 0], [7.86, 0.3], [7.95, 0]]);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
      <Light t={t} cam={cam} S={S} />
      <Stage t={t} cam={cam} S={S} />
      <AbsoluteFill style={{background: "#000614", opacity: dim}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(0,8,31,0.55) 0%, rgba(0,8,31,0) 24%)"}} />
      <Sweep t={t} />
      <Type t={t} cam={cam} S={S} />
      <Audio src={staticFile("mix3.wav")} />
    </AbsoluteFill>
  );
};

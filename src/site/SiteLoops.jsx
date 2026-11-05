// Animações autorais do site Diego Mudanças (Remotion). Todas são loops perfeitos:
// o último quadro emenda no primeiro, para tocar em repetição como vídeo leve no site.
// Nenhum texto essencial fica dentro dos vídeos — textos e botões ficam no HTML.
import React from "react";
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, random} from "remotion";
import {C, EO, EI, EIO, ip, kf, Lion, Icon} from "../diego/kit";

const TAU = Math.PI * 2;

// ---------- fundo periódico (rede + partículas) ----------
const Field = ({t, T, w, h, seed = "s", n = 26, glowX = 0.7, glowY = 0.42}) => {
  const ph = (t / T) * TAU;
  const pts = Array.from({length: n}, (_, i) => {
    const x0 = random(seed + "x" + i) * (w + 200) - 100, y0 = random(seed + "y" + i) * (h + 200) - 100;
    const a = random(seed + "a" + i) * TAU;
    return {x: x0 + Math.sin(ph + a) * 34, y: y0 + Math.cos(ph + a) * 26};
  });
  const lines = [];
  const L = Math.min(w, h) * 0.42;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < L) lines.push([pts[i], pts[j], 1 - d / L]);
  }
  return (
    <AbsoluteFill style={{background: `radial-gradient(110% 80% at ${glowX * 100}% ${glowY * 100}%, #1446E0 0%, #06205F 34%, #041545 62%, #020A22 100%)`}}>
      <svg width={w} height={h} style={{position: "absolute"}}>
        {lines.map(([a, b, k], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.cyan} strokeWidth={1.2} opacity={0.04 + k * 0.18} />)}
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2.2} fill={C.ice} opacity={0.5} />)}
      </svg>
      {Array.from({length: 34}, (_, i) => {
        const s = 4 + random(seed + "s" + i) * 22;
        const y = ((random(seed + "b" + i) * h - (t / T) * h) % h + h) % h; // sobe exatamente uma tela por ciclo
        return <div key={i} style={{position: "absolute", left: random(seed + "c" + i) * w, top: y, width: s, height: s, borderRadius: "50%", background: C.ice, opacity: 0.08 + random(seed + "o" + i) * 0.22, filter: `blur(${s > 16 ? 5 : 1}px)`}} />;
      })}
    </AbsoluteFill>
  );
};

// faixas da marca, largura livre, ondulação periódica
const Waves = ({t, T, w, y, amp = 70, scale = 1}) => {
  const ph = (t / T) * TAU;
  const band = (off, th, k) => {
    const y0 = y + off;
    const a = amp * scale, s1 = Math.sin(ph + k) * 18 * scale, s2 = Math.cos(ph + k) * 22 * scale;
    return `M -40 ${y0 + s1} C ${w * 0.3} ${y0 - a + s2} ${w * 0.62} ${y0 + a * 0.7 - s1} ${w + 40} ${y0 - a * 0.5 + s2} L ${w + 40} ${y0 - a * 0.5 + s2 + th} C ${w * 0.62} ${y0 + a * 0.7 - s1 + th} ${w * 0.3} ${y0 - a + s2 + th} -40 ${y0 + s1 + th} Z`;
  };
  return (
    <svg width={w} height={y + 600} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <path d={band(0, 60 * scale, 0)} fill="#fff" opacity={0.92} />
      <path d={band(42 * scale, 46 * scale, 0.5)} fill={C.cyan} />
      <path d={band(82 * scale, 70 * scale, 1)} fill={C.blue} />
      <path d={band(140 * scale, 900, 1.4)} fill={C.navy} />
    </svg>
  );
};

// ---------- 1. ABERTURA: leão, luz e faixas (fundo do hero) ----------
export const HeroLoop = ({mobile = false}) => {
  const f = useCurrentFrame();
  const {width: w, height: h, fps, durationInFrames} = useVideoConfig();
  const T = durationInFrames / fps, t = f / fps;
  const ph = (t / T) * TAU;
  const breathe = 1 + Math.sin(ph) * 0.012;
  const sweep = ip(t, T * 0.28, T * 0.62, 0, 1, EIO);
  const L = mobile ? {x: w * 0.02, y: h * 0.04, s: w * 1.12} : {x: w * 0.47, y: h * 0.0, s: h * 1.02};
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <Field t={t} T={T} w={w} h={h} seed={mobile ? "m" : "d"} glowX={mobile ? 0.6 : 0.72} glowY={mobile ? 0.28 : 0.45} />
      <div style={{position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${breathe})`, transformOrigin: mobile ? "60% 30%" : "75% 50%"}}>
        <div style={{position: "absolute", left: L.x - L.s * 0.06, top: L.y + L.s * 0.18, width: L.s * 0.9, height: L.s * 0.7, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(34,199,245,0.32), transparent)", opacity: 0.8 + 0.2 * Math.sin(ph)}} />
        <Lion x={L.x + Math.sin(ph) * 8} y={L.y + Math.cos(ph) * 6} size={L.s} bright={mobile ? 0.82 : 0.95} sweep={sweep > 0 && sweep < 1 ? sweep : -1} />
      </div>
      {/* leitura do texto (HTML) */}
      <AbsoluteFill style={{background: mobile ? "linear-gradient(180deg, rgba(2,10,34,0.15) 0%, rgba(2,10,34,0.1) 30%, rgba(2,10,34,0.82) 56%, rgba(2,10,34,0.96) 100%)" : "linear-gradient(90deg, rgba(2,10,34,0.94) 0%, rgba(2,10,34,0.78) 34%, rgba(2,10,34,0.1) 60%, transparent 100%)"}} />
      <Waves t={t} T={T} w={w} y={mobile ? h * 0.93 : h * 0.86} amp={mobile ? 50 : 80} scale={mobile ? 0.8 : 1} />
    </AbsoluteFill>
  );
};

// ---------- 2. JORNADA: origem → proteção → transporte → entrega ----------
const A = [250, 790], B = [830, 330], C1 = [700, 860], C2 = [360, 330];
const bez = (u) => [0, 1].map((k) => (1 - u) ** 3 * A[k] + 3 * (1 - u) ** 2 * u * C1[k] + 3 * (1 - u) * u * u * C2[k] + u ** 3 * B[k]);
const ROUTE = `M ${A[0]} ${A[1]} C ${C1[0]} ${C1[1]} ${C2[0]} ${C2[1]} ${B[0]} ${B[1]}`;
export const JOURNEY_T = 9; // tempos usados também pelo site para destacar cada passo
const Pin = ({x, y, p, color = C.cyan, icon}) => (
  <div style={{position: "absolute", left: x, top: y}}>
    <div style={{position: "absolute", left: -80, top: -18, width: 160, height: 36, borderRadius: "50%", background: `radial-gradient(closest-side, ${color}cc, transparent)`, transform: `scale(${p})`}} />
    <div style={{position: "absolute", left: -58, top: -150 - (1 - p) * 220, width: 116, height: 150, opacity: Math.min(1, p * 3), filter: "drop-shadow(0 14px 20px rgba(0,0,0,0.5)) drop-shadow(0 0 20px rgba(34,199,245,0.7))"}}>
      <svg width={116} height={150} viewBox="0 0 110 140"><defs><linearGradient id={"g" + x} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FE7FF" /><stop offset="1" stopColor="#1446E0" /></linearGradient></defs><path d="M55 136 C55 136 8 84 8 50 A47 47 0 1 1 102 50 C102 84 55 136 55 136 Z" fill={`url(#g${x})`} stroke="#fff" strokeWidth={5} /></svg>
      <div style={{position: "absolute", left: 28, top: 22, width: 60, height: 60, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center"}}>{icon}</div>
    </div>
  </div>
);
export const JourneyLoop = () => {
  const f = useCurrentFrame();
  const {width: w, height: h, fps} = useVideoConfig();
  const T = JOURNEY_T, t = f / fps;
  const fade = 1 - ip(t, 7.6, 8.7, 0, 1, EI);
  const pA = ip(t, 0.25, 0.75, 0, 1, EO);
  const draw = ip(t, 2.2, 4.3, 0, 1, EIO);
  const u = kf(t, [2.3, 4.6], [0, 1], EIO);
  const [tx, ty] = bez(u);
  const [tx2] = bez(Math.min(1, u + 0.01));
  const pB = ip(t, 4.3, 4.8, 0, 1, EO);
  const ring = ip(t, 4.8, 6.2, 0, 1, EO);
  const ok = ip(t, 5.1, 5.7, 0, 1, EIO);
  const items = [["box", 1.1, -150, -40], ["sofa", 1.4, -30, -170], ["fridge", 1.7, 110, -60]];
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <Field t={t} T={T} w={w} h={h} seed="j" n={18} glowX={0.55} glowY={0.5} />
      <div style={{position: "absolute", inset: 0, opacity: fade}}>
        <div style={{position: "absolute", left: -500, top: 120, width: w + 1000, height: 1300, transform: "perspective(1300px) rotateX(56deg)", transformOrigin: "50% 30%", background: "repeating-linear-gradient(0deg, rgba(155,235,255,0.14) 0 2px, transparent 2px 90px), repeating-linear-gradient(90deg, rgba(155,235,255,0.14) 0 2px, transparent 2px 90px)", maskImage: "radial-gradient(60% 55% at 50% 40%, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(60% 55% at 50% 40%, black 30%, transparent 75%)"}} />
        <svg width={w} height={h} style={{position: "absolute", overflow: "visible"}}>
          <path d={ROUTE} fill="none" stroke="rgba(155,235,255,0.18)" strokeWidth={30} strokeLinecap="round" strokeDasharray="2 26" />
          <path d={ROUTE} fill="none" stroke="#fff" strokeWidth={30} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={ROUTE} fill="none" stroke={C.cyan} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{filter: "drop-shadow(0 0 12px rgba(34,199,245,0.9))"}} />
          <path d={ROUTE} fill="none" stroke={C.blue} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </svg>
        <Pin x={A[0]} y={A[1]} p={pA} icon={<Icon name="box" size={40} p={1} glow={0} color={C.blue} sw={18} />} />
        {/* itens protegidos saem da origem e entram no caminhão */}
        {items.map(([ic, a, dx, dy], i) => {
          const p = ip(t, a, a + 0.4, 0, 1, EO);
          const go = ip(t, 2.0, 2.45, 0, 1, EI);
          const x = A[0] + dx * (1 - go) + (tx - A[0]) * go, y = A[1] + dy * (1 - go) - 170 + (ty - A[1] + 170) * go;
          return (
            <div key={i} style={{position: "absolute", left: x - 62, top: y - 62, width: 124, height: 124, borderRadius: 32, background: "linear-gradient(160deg, rgba(255,255,255,0.22), rgba(120,190,255,0.08))", boxShadow: "inset 0 0 0 2px rgba(155,235,255,0.55), 0 16px 30px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: p * (1 - go), transform: `scale(${(0.5 + 0.5 * p) * (1 - go * 0.6)})`}}>
              <Icon name={ic} size={90} p={p} glow={0.6} sw={13} />
            </div>
          );
        })}
        {t > 2.2 && (
          <div style={{position: "absolute", left: tx - 70, top: ty - 70, width: 140, height: 140, borderRadius: "50%", background: "#fff", boxShadow: "0 14px 30px rgba(0,0,0,0.45), 0 0 0 9px rgba(34,199,245,0.45), 0 0 46px rgba(34,199,245,0.8)", display: "flex", alignItems: "center", justifyContent: "center", opacity: ip(t, 2.2, 2.45) * (1 - ip(t, 4.7, 5.1)), transform: `scale(${0.6 + 0.4 * ip(t, 2.2, 2.6, 0, 1, EO)})`}}>
            <div style={{transform: `scaleX(${tx2 < tx ? -1 : 1})`}}><Icon name="truck" size={92} p={1} glow={0} color={C.blue} sw={15} /></div>
          </div>
        )}
        <div style={{position: "absolute", left: B[0] - 150 * ring, top: B[1] - 60 - 150 * ring, width: 300 * ring, height: 300 * ring, borderRadius: "50%", border: `4px solid rgba(155,235,255,${0.8 * (1 - ring)})`}} />
        <Pin x={B[0]} y={B[1]} p={pB} icon={<svg width={38} height={38} viewBox="0 0 64 64" fill="none" stroke={C.blue} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"><path d="M8 30 32 10l24 20" /><path d="M14 26v28h36V26" /></svg>} />
        <div style={{position: "absolute", left: B[0] + 40, top: B[1] - 200, width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg,#1446E0,#22C7F5)", boxShadow: "0 0 30px rgba(34,199,245,0.8)", transform: `scale(${ok})`, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <svg width={48} height={48} viewBox="0 0 34 34"><path d="M6 18 L14 26 L28 9" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ok} /></svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. PROTEÇÃO EM CAMADAS: papelão → plástico → plástico-bolha → manta ----------
export const PROTECT_T = 10;
export const PROTECT_STEPS = [[0.9, 2.3], [2.5, 3.9], [4.1, 5.5], [5.7, 7.1], [7.2, 8.4]]; // camadas + pronto
const layerBg = [
  "linear-gradient(160deg, #D8B587, #B88D5C)", // papelão
  "linear-gradient(115deg, rgba(255,255,255,0.0) 20%, rgba(255,255,255,0.55) 32%, rgba(255,255,255,0.05) 44%, rgba(255,255,255,0.35) 62%, rgba(255,255,255,0) 72%), rgba(200,235,255,0.28)", // plástico
  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.75) 0 5px, rgba(255,255,255,0.18) 6px 9px, transparent 10px) 0 0/26px 26px, rgba(210,240,255,0.32)", // plástico-bolha
  "repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 3px, transparent 3px 46px), repeating-linear-gradient(-45deg, rgba(0,0,40,0.25) 0 3px, transparent 3px 46px), linear-gradient(160deg, #2A6BFF, #1446E0 50%, #0A2A9A)", // manta
];
export const ProtectLoop = () => {
  const f = useCurrentFrame();
  const {width: w, height: h, fps} = useVideoConfig();
  const T = PROTECT_T, t = f / fps;
  const fade = 1 - ip(t, 8.9, 9.8, 0, 1, EI);
  const pin = ip(t, 0.0, 0.7, 0, 1, EO);
  const prog = PROTECT_STEPS.slice(0, 4).map(([a, b]) => ip(t, a, a + 0.9, 0, 1, EIO));
  const done = ip(t, PROTECT_STEPS[4][0], PROTECT_STEPS[4][0] + 0.6, 0, 1, EO);
  const rot = -24 + Math.sin((t / T) * TAU) * 4;
  const W0 = 340, H0 = 560, D0 = 230;
  const face = (ww, hh, tr, shade) => ({position: "absolute", width: ww, height: hh, left: -ww / 2, top: -hh / 2, transform: tr, backfaceVisibility: "hidden", overflow: "hidden", background: `linear-gradient(160deg, rgb(${232 * shade},${238 * shade},${248 * shade}), rgb(${196 * shade},${208 * shade},${228 * shade}))`});
  const layers = (ww, hh, shade) => prog.map((p, i) => (
    <div key={i} style={{position: "absolute", inset: 0, background: layerBg[i], clipPath: `inset(${(1 - p) * 100}% 0 0 0)`, filter: `brightness(${shade})`}}>
      {i === 3 && ww > 300 && <img src={staticFile("diego/logo_letreiro.png")} style={{position: "absolute", left: "50%", top: "44%", width: ww * 0.62, transform: "translate(-50%,-50%)", opacity: 0.95}} />}
    </div>
  ));
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <Field t={t} T={T} w={w} h={h} seed="p" n={18} glowX={0.5} glowY={0.45} />
      <div style={{position: "absolute", inset: 0, opacity: fade}}>
        <div style={{position: "absolute", left: w / 2 - 300, top: h * 0.82, width: 600, height: 80, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(34,199,245,0.55), transparent)", opacity: pin}} />
        <div style={{position: "absolute", left: w / 2, top: h * 0.5 + (1 - pin) * 80, perspective: 1500, opacity: pin}}>
          <div style={{position: "relative", transformStyle: "preserve-3d", transform: `rotateX(-10deg) rotateY(${rot}deg)`}}>
            <div style={face(W0, H0, `translateZ(${D0 / 2}px)`, 1)}>
              <div style={{position: "absolute", left: 24, right: 24, top: 24, height: H0 * 0.45, border: "3px solid rgba(4,21,69,0.25)", borderRadius: 8}} />
              <div style={{position: "absolute", left: 24, right: 24, top: H0 * 0.5, bottom: 24, border: "3px solid rgba(4,21,69,0.25)", borderRadius: 8}} />
              {layers(W0, H0, 1)}
            </div>
            <div style={face(D0, H0, `rotateY(90deg) translateZ(${W0 / 2}px)`, 0.72)}>{layers(D0, H0, 0.72)}</div>
            <div style={face(D0, H0, `rotateY(-90deg) translateZ(${W0 / 2}px)`, 0.6)}>{layers(D0, H0, 0.6)}</div>
            <div style={face(W0, D0, `rotateX(90deg) translateZ(${H0 / 2}px)`, 1.06)}>{layers(W0, D0, 1.06)}</div>
          </div>
        </div>
        {/* selo final */}
        <div style={{position: "absolute", left: w / 2 + 150, top: h * 0.18, width: 130, height: 130, borderRadius: "50%", background: "linear-gradient(135deg,#1446E0,#22C7F5)", boxShadow: "0 0 50px rgba(34,199,245,0.85)", transform: `scale(${done})`, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <svg width={74} height={74} viewBox="0 0 34 34"><path d="M6 18 L14 26 L28 9" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - done} /></svg>
        </div>
        {/* brilho passando no fim */}
        <div style={{position: "absolute", top: 0, bottom: 0, width: 260, opacity: t > 7.3 && t < 8.4 ? 1 : 0, left: -500 + ip(t, 7.3, 8.4, 0, 1, EIO) * (w + 800), background: "linear-gradient(100deg, transparent, rgba(190,235,255,0.22), transparent)", transform: "skewX(-18deg)", mixBlendMode: "screen"}} />
      </div>
    </AbsoluteFill>
  );
};

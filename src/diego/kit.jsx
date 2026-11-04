// Kit visual Diego Mudanças: cores, easing, fundo, texto, objetos e transições.
import React from "react";
import {AbsoluteFill, Img, staticFile, interpolate, Easing, random, delayRender, continueRender} from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  ink: "#020A22",
  navy: "#041545",
  deep: "#06205F",
  blue: "#1446E0",
  royal: "#0B5BFF",
  cyan: "#22C7F5",
  ice: "#9BEBFF",
  white: "#FFFFFF",
  paper: "#F6F3EC",
};
export const FONT = "Montserrat, sans-serif";
export const HAND = "Caveat, cursive";

// ---------- fontes locais (carregadas antes do primeiro quadro) ----------
const FONTS = [
  ["Montserrat", "500", "normal", "Montserrat-500.ttf"],
  ["Montserrat", "700", "normal", "Montserrat-700.ttf"],
  ["Montserrat", "800", "normal", "Montserrat-800.ttf"],
  ["Montserrat", "900", "normal", "Montserrat-900.ttf"],
  ["Montserrat", "800", "italic", "Montserrat-800i.ttf"],
  ["Montserrat", "900", "italic", "Montserrat-900i.ttf"],
  ["Caveat", "600", "normal", "Caveat-600.ttf"],
];
if (typeof window !== "undefined" && !window.__diegoFonts) {
  window.__diegoFonts = true;
  const h = delayRender("fontes");
  Promise.all(
    FONTS.map(([fam, w, st, file]) =>
      new FontFace(fam, `url(${staticFile("fonts/" + file)})`, {weight: w, style: st}).load().then((f) => document.fonts.add(f))
    )
  ).then(() => continueRender(h));
}

// ---------- tempo e easing ----------
export const EO = Easing.bezier(0.16, 1, 0.3, 1); // saída suave (entrada de elementos)
export const EI = Easing.bezier(0.7, 0, 0.84, 0); // aceleração (saída de elementos)
export const EIO = Easing.bezier(0.65, 0, 0.35, 1); // câmera
export const ip = (t, a, b, from = 0, to = 1, ez = EO) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ez});
export const kf = (t, ts, vs, ez = EIO) =>
  interpolate(t, ts, vs, {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ez});
export const on = (t, a, b) => t >= a && t < b;

// largura real do texto (fontes já carregadas) para ajustar tamanho às margens
let _ctx = null;
export const fit = (text, maxW, maxSize, weight = 900, italic = false, ls = 0) => {
  if (typeof document === "undefined") return maxSize;
  if (!_ctx) _ctx = document.createElement("canvas").getContext("2d");
  _ctx.font = `${italic ? "italic " : ""}${weight} 100px Montserrat`;
  const w = _ctx.measureText(text).width + ls * 100 * text.length;
  return Math.min(maxSize, Math.floor((maxW / w) * 100));
};

// ---------- texto com entrada/saída coreografada ----------
// inn/out: [tempo, duração, tipo]; tipos: up, down, left, right, zoom, fade, pop
const motion = (type, p, dist = 1) => {
  const q = 1 - p;
  switch (type) {
    case "up": return {ty: q * 110 * dist, blur: q * 10};
    case "down": return {ty: -q * 110 * dist, blur: q * 10};
    case "left": return {tx: q * 260 * dist, blur: q * 18, sx: 1 + q * 0.25};
    case "right": return {tx: -q * 260 * dist, blur: q * 18, sx: 1 + q * 0.25};
    case "zoom": return {sc: 1 + q * 1.4 * dist, blur: q * 26, op: p};
    case "back": return {sc: 1 - q * 0.35, blur: q * 14, op: p};
    case "pop": return {sc: 0.6 + 0.4 * p, op: Math.min(1, p * 2), blur: q * 6};
    default: return {op: p, blur: q * 8};
  }
};
export const El = ({t, inn, out, x = 0, y = 0, w = W, align = "center", mask = false, children, style, z}) => {
  if (inn && t < inn[0] - 0.01) return null;
  if (out && t > out[0] + out[1] + 0.01) return null;
  const pi = inn ? ip(t, inn[0], inn[0] + (inn[1] ?? 0.6), 0, 1, inn[3] || EO) : 1;
  const po = out ? ip(t, out[0], out[0] + (out[1] ?? 0.4), 0, 1, EI) : 0;
  const a = motion(inn ? inn[2] || "up" : "fade", pi);
  const ot = out ? out[2] || "up" : "fade";
  const b = out ? motion(ot, 1 - po, ["up", "down", "left", "right"].includes(ot) ? -1 : 1) : {};
  const tx = (a.tx || 0) + (b.tx || 0);
  const ty = (a.ty || 0) + (b.ty || 0);
  const sc = (a.sc ?? 1) * (b.sc ?? 1);
  const sx = (a.sx ?? 1) * (b.sx ?? 1);
  const op = (a.op ?? 1) * (out ? (b.op ?? (mask && (ot === "up" || ot === "down") ? 1 : 1 - po)) : 1);
  const blur = (a.blur || 0) + (b.blur || 0);
  const unit = mask ? "%" : "px";
  const inner = (
    <div style={{transform: `translate(${tx}${mask ? "px" : "px"}, ${ty}${unit}) scale(${sc}) scaleX(${sx})`, opacity: op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transformOrigin: align === "left" ? "left center" : "center"}}>
      {children}
    </div>
  );
  return (
    <div style={{position: "absolute", left: x, top: y, width: w, display: "flex", justifyContent: align === "left" ? "flex-start" : "center", zIndex: z, ...style}}>
      {mask ? <div style={{clipPath: "inset(-14% -30% -14% -30%)"}}>{inner}</div> : inner}
    </div>
  );
};

// estilos tipográficos
export const T_SUB = {fontFamily: FONT, fontWeight: 700, fontSize: 54, color: "rgba(255,255,255,0.94)", letterSpacing: "-0.01em", lineHeight: 1.12, textShadow: "0 4px 24px rgba(0,8,40,0.65)", whiteSpace: "nowrap"};
export const T_BIG = {fontFamily: FONT, fontWeight: 900, color: C.white, letterSpacing: "-0.035em", lineHeight: 0.92, textTransform: "uppercase", whiteSpace: "nowrap", textShadow: "0 0 34px rgba(34,199,245,0.35), 0 12px 40px rgba(0,6,30,0.6)"};
export const GRAD = {
  background: "linear-gradient(180deg, #E9FCFF 0%, #8FE7FF 38%, #22C7F5 62%, #1F7BFF 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  textShadow: "none",
  filter: "drop-shadow(0 0 22px rgba(34,199,245,0.55)) drop-shadow(0 10px 30px rgba(0,8,40,0.7))",
};
export const Big = ({children, size = 160, grad = false, italic = false, style}) => (
  <div style={{...T_BIG, fontSize: size, fontStyle: italic ? "italic" : "normal", ...(grad ? GRAD : {}), padding: "0.08em 0.12em", ...style}}>{children}</div>
);
export const Sub = ({children, size = 54, style}) => <div style={{...T_SUB, fontSize: size, ...style}}>{children}</div>;
export const Hi = ({children}) => <span style={{color: C.cyan, textShadow: "0 0 24px rgba(34,199,245,0.6)"}}>{children}</span>;

// ---------- fundo: rede poligonal, partículas, luz ----------
const PTS = Array.from({length: 30}, (_, i) => ({x: random("px" + i) * 1300 - 110, y: random("py" + i) * 2150 - 115, ph: random("pp" + i) * 6.28, r: 1.5 + random("pr" + i) * 3}));
const BOK = Array.from({length: 34}, (_, i) => ({x: random("bx" + i) * W, y: random("by" + i) * H, s: 4 + random("bs" + i) * 26, sp: 8 + random("bv" + i) * 26, o: 0.15 + random("bo" + i) * 0.5}));
export const Bg = ({t, glow = C.blue, glowY = 0.42, net = 1, warm = 0, dark = 0}) => {
  const pts = PTS.map((p) => ({x: p.x + Math.sin(t * 0.25 + p.ph) * 40, y: p.y + Math.cos(t * 0.2 + p.ph) * 30, r: p.r}));
  const lines = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 430) lines.push([pts[i], pts[j], 1 - d / 430]);
    }
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% ${glowY * 100}%, ${glow} 0%, ${C.deep} 35%, ${C.navy} 62%, ${C.ink} 100%)`}}>
      <svg width={W} height={H} style={{position: "absolute", opacity: net}}>
        {lines.map(([a, b, k], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.cyan} strokeWidth={1.2} opacity={0.05 + k * 0.22} />
        ))}
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={C.ice} opacity={0.55} />)}
      </svg>
      {BOK.map((b, i) => {
        const y = (((b.y - t * b.sp) % H) + H) % H;
        return <div key={i} style={{position: "absolute", left: b.x, top: y, width: b.s, height: b.s, borderRadius: "50%", background: C.ice, opacity: b.o * 0.5, filter: `blur(${b.s > 18 ? 6 : 1.5}px)`}} />;
      })}
      <div style={{position: "absolute", left: -300 + Math.sin(t * 0.3) * 200, top: 200 + Math.cos(t * 0.21) * 160, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,199,245,0.18), transparent 65%)"}} />
      {warm > 0 && <AbsoluteFill style={{background: "radial-gradient(70% 45% at 50% 55%, rgba(255,214,170,0.22), transparent 70%)", opacity: warm}} />}
      <AbsoluteFill style={{background: "radial-gradient(100% 75% at 50% 50%, transparent 55%, rgba(0,4,18,0.75) 100%)"}} />
      {dark > 0 && <AbsoluteFill style={{background: C.ink, opacity: dark}} />}
    </AbsoluteFill>
  );
};

// ---------- curvas da marca (faixas da logo) ----------
const bandPath = (y0, amp, th) => `M -200 ${y0} C 300 ${y0 - amp} 700 ${y0 + amp * 0.6} 1300 ${y0 - amp * 0.9} L 1300 ${y0 - amp * 0.9 + th} C 700 ${y0 + amp * 0.6 + th} 300 ${y0 - amp + th} -200 ${y0 + th} Z`;
export const Bands = ({y = 1500, amp = 260, scale = 1, shift = 0, opacity = 1}) => (
  <svg width={W} height={H} style={{position: "absolute", left: 0, top: 0, opacity, overflow: "visible"}}>
    <defs>
      <linearGradient id="bA" x1="0" x2="1"><stop offset="0" stopColor="#0B2D8F" /><stop offset="1" stopColor="#1446E0" /></linearGradient>
      <linearGradient id="bB" x1="0" x2="1"><stop offset="0" stopColor="#22C7F5" /><stop offset="1" stopColor="#0B5BFF" /></linearGradient>
      <linearGradient id="bC" x1="0" x2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#CFEFFF" /></linearGradient>
    </defs>
    <g transform={`translate(${shift},0) scale(1,${scale})`} style={{transformOrigin: `540px ${y}px`}}>
      <path d={bandPath(y, amp, 90)} fill="url(#bC)" opacity={0.95} />
      <path d={bandPath(y + 60, amp, 70)} fill="url(#bB)" />
      <path d={bandPath(y + 120, amp * 0.9, 120)} fill="url(#bA)" />
      <path d={bandPath(y + 220, amp * 0.8, 900)} fill={C.navy} />
    </g>
  </svg>
);

// transição: faixas da marca atravessam a tela e cobrem a troca de cena (meio = t0 + dur/2)
export const WaveWipe = ({t, t0, dur = 1.1}) => {
  if (t < t0 || t > t0 + dur) return null;
  const e = EIO((t - t0) / dur);
  const TH = 2750;
  const y = interpolate(e, [0, 1], [H + 80, -(TH + 260 + 700)]);
  const curve = (o) => `C 250 ${o - 380} 720 ${o + 260} 1400 ${o - 300}`;
  const band = (top, th) => `M -320 ${top} ${curve(top)} L 1400 ${top - 300 + th} C 720 ${top + 260 + th} 250 ${top - 380 + th} -320 ${top + th} Z`;
  const L = [["#FFFFFF", 0, TH + 520], [C.cyan, 90, TH + 340], [C.blue, 170, TH + 170], [C.navy, 260, TH]];
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <svg width={W} height={H} style={{position: "absolute", overflow: "visible", transform: `translateY(${y}px)`, filter: "drop-shadow(0 0 40px rgba(34,199,245,0.6))"}}>
        <defs>
          <linearGradient id="wwN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.navy} /><stop offset="0.5" stopColor={C.ink} /><stop offset="1" stopColor={C.navy} /></linearGradient>
        </defs>
        {L.map(([c, o, th], i) => <path key={i} d={band(o + 300, th)} fill={i === 3 ? "url(#wwN)" : c} />)}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- logo (sempre íntegra, proporção 1:1) ----------
export const Logo = ({size = 600, style}) => (
  <Img src={staticFile("diego/logo.png")} style={{width: size, height: size, display: "block", filter: "drop-shadow(0 24px 50px rgba(0,6,30,0.65)) drop-shadow(0 0 40px rgba(34,199,245,0.35))", ...style}} />
);

// ---------- ícones de linha luminosos (desenho por traço) ----------
const ICONS = {
  box: ["M60 110 L160 60 L260 110 L160 160 Z", "M60 110 L60 230 L160 280 L160 160", "M260 110 L260 230 L160 280", "M110 85 L210 135 L210 175", "M60 110 L30 150 L130 200 L160 160", "M260 110 L290 150 L190 200 L160 160"],
  sofa: ["M70 150 L70 110 Q70 80 100 80 L220 80 Q250 80 250 110 L250 150", "M40 160 Q40 140 60 140 Q80 140 80 160 L80 190 L240 190 L240 160 Q240 140 260 140 Q280 140 280 160 L280 230 L40 230 Z", "M80 190 L80 160 L240 160 L240 190", "M60 230 L60 255", "M260 230 L260 255", "M160 160 L160 190"],
  truck: ["M30 90 L190 90 L190 220 L30 220 Z", "M190 130 L245 130 L285 175 L285 220 L190 220", "M205 140 L240 140 L268 172 L205 172 Z", "M75 245 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", "M240 245 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", "M60 125 L160 125"],
  check: ["M160 40 m-120 0 a120 120 0 1 0 240 0 a120 120 0 1 0 -240 0", "M100 45 L145 92 L228 -10"],
  pin: ["M160 280 C 160 280 70 190 70 125 A 90 90 0 1 1 250 125 C 250 190 160 280 160 280 Z", "M160 125 m-32 0 a32 32 0 1 0 64 0 a32 32 0 1 0 -64 0"],
  fridge: ["M100 40 L220 40 L220 280 L100 280 Z", "M100 120 L220 120", "M120 70 L120 100", "M120 145 L120 190"],
};
export const Icon = ({name, p = 1, size = 320, glow = 1, color = C.ice, sw = 9}) => {
  const paths = ICONS[name];
  const vb = name === "check" ? "0 -100 320 300" : "0 0 320 300";
  return (
    <svg viewBox={vb} width={size} height={(size * 300) / 320} style={{overflow: "visible", filter: `drop-shadow(0 0 ${14 * glow}px rgba(34,199,245,0.9)) drop-shadow(0 0 ${40 * glow}px rgba(34,199,245,0.5))`}}>
      {paths.map((d, i) => {
        const st = 0.5 / paths.length;
        const q = Math.max(0, Math.min(1, (p - i * st) / (1 - (paths.length - 1) * st)));
        return <path key={i} d={d} pathLength={1} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - q} />;
      })}
    </svg>
  );
};

// ---------- caixa 3D (papelão claro, fita ciano) ----------
export const Box3D = ({w = 300, h = 240, d = 260, label, rot = -28, tilt = -14, tape = 1, light = 1, style}) => {
  const face = (bg, tr, ww, hh) => ({position: "absolute", width: ww, height: hh, left: -ww / 2, top: -hh / 2, background: bg, transform: tr, backfaceVisibility: "hidden"});
  return (
    <div style={{position: "relative", width: 0, height: 0, transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg) rotateY(${rot}deg)`, ...style}}>
      {/* frente */}
      <div style={{...face(`linear-gradient(170deg, rgb(${230 * light},${238 * light},${250 * light}), rgb(${186 * light},${204 * light},${232 * light}))`, `translateZ(${d / 2}px)`, w, h), boxShadow: "inset 0 0 40px rgba(4,21,69,0.18)"}}>
        <div style={{position: "absolute", left: w / 2 - 22, top: 0, width: 44, height: h * 0.36 * tape, background: "linear-gradient(90deg, #2BB8EC, #63D9FF 50%, #2BB8EC)", opacity: 0.92}} />
        {label && <div style={{position: "absolute", left: 0, right: 0, top: h * 0.46, textAlign: "center", fontFamily: HAND, fontWeight: 600, fontSize: Math.min(70, w * 0.2), color: C.navy, transform: "rotate(-4deg)"}}>{label}</div>}
      </div>
      {/* lado */}
      <div style={face(`linear-gradient(170deg, rgb(${170 * light},${190 * light},${222 * light}), rgb(${120 * light},${146 * light},${190 * light}))`, `rotateY(90deg) translateZ(${w / 2}px)`, d, h)} />
      <div style={face(`rgb(${160 * light},${180 * light},${215 * light})`, `rotateY(-90deg) translateZ(${w / 2}px)`, d, h)} />
      {/* topo */}
      <div style={{...face(`linear-gradient(90deg, rgb(${244 * light},${248 * light},${255 * light}), rgb(${214 * light},${226 * light},${244 * light}))`, `rotateX(90deg) translateZ(${h / 2}px)`, w, d)}}>
        <div style={{position: "absolute", left: w / 2 - 22, top: 0, width: 44, height: d * tape, background: "linear-gradient(90deg, #2BB8EC, #63D9FF 50%, #2BB8EC)", opacity: 0.92}} />
        <div style={{position: "absolute", left: 0, right: 0, top: d / 2 - 1, height: 2, background: "rgba(4,21,69,0.25)"}} />
      </div>
    </div>
  );
};

// ---------- fotografia impressa (borda branca, sombra) ----------
export const Print = ({src, w = 420, h = 300, cap, rot = 0, style, pos = "center"}) => (
  <div style={{position: "absolute", width: w + 36, padding: 18, paddingBottom: cap ? 70 : 18, background: "#FCFBF8", boxShadow: "0 18px 40px rgba(10,20,40,0.35), 0 2px 6px rgba(0,0,0,0.2)", transform: `rotate(${rot}deg)`, ...style}}>
    <Img src={staticFile("diego/" + src)} style={{width: w, height: h, objectFit: "cover", objectPosition: pos, display: "block", filter: "saturate(0.92) contrast(1.04)"}} />
    {cap && <div style={{position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: HAND, fontWeight: 600, fontSize: 46, color: "#1B2A4A"}}>{cap}</div>}
  </div>
);

// ---------- cartão fotográfico com moldura e luz de borda ----------
export const PhotoCard = ({src, w, h, pos = "center", radius = 34, style, children, fit = "cover"}) => (
  <div style={{position: "absolute", width: w, height: h, borderRadius: radius, overflow: "hidden", background: C.navy, boxShadow: "0 40px 80px rgba(0,4,20,0.65), 0 0 0 2px rgba(155,235,255,0.45), 0 0 50px rgba(34,199,245,0.25)", ...style}}>
    <Img src={staticFile("diego/" + src)} style={{width: "100%", height: "100%", objectFit: fit, objectPosition: pos, display: "block"}} />
    <div style={{position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.16), transparent 35%, transparent 70%, rgba(2,10,34,0.35))"}} />
    {children}
  </div>
);

export const Chip = ({children, style}) => (
  <div style={{display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 60, background: "linear-gradient(90deg, #1446E0, #22C7F5)", color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: "0.01em", boxShadow: "0 12px 30px rgba(0,8,40,0.5), 0 0 30px rgba(34,199,245,0.45)", whiteSpace: "nowrap", ...style}}>{children}</div>
);

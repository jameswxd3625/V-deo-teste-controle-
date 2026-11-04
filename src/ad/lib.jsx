import React from "react";
import {interpolate, Easing, staticFile, continueRender, delayRender} from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const sec = (s) => s * FPS;
export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// curvas
export const EO = Easing.bezier(0.16, 1, 0.3, 1); // saída expo (ação principal)
export const EIO = Easing.bezier(0.65, 0, 0.35, 1); // movimento de câmera
export const EI = Easing.bezier(0.55, 0, 0.9, 0.4); // saídas aceleradas
export const ANT = Easing.bezier(0.36, -0.45, 0.25, 1); // antecipação + ação

// keyframes em segundos: K(f, [[t, v], ...], ease)
export const K = (f, pts, ease = EO) => {
  const t = f / FPS;
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [t0, v0] = pts[i];
    const [t1, v1] = pts[i + 1];
    if (t <= t1) {
      const e = Array.isArray(ease) ? ease[i] || EO : ease;
      return v0 + (v1 - v0) * e(cl((t - t0) / (t1 - t0)));
    }
  }
  return pts[pts.length - 1][1];
};
// progresso 0..1 entre dois instantes
export const P = (f, t0, t1, ease = EO) => ease(cl((f / FPS - t0) / (t1 - t0)));
// mola amortecida (overshoot controlado) a partir de t0
export const SP = (f, t0, {d = 0.55, k = 9, z = 0.42} = {}) => {
  const t = f / FPS - t0;
  if (t <= 0) return 0;
  const w = k;
  return cl(1 - Math.exp(-z * w * t) * Math.cos(w * Math.sqrt(1 - z * z) * t), -0.2, 1.3) * (t > d * 6 ? 1 : 1);
};
export const mix = (a, b, t) => a + (b - a) * t;

// ---------- marca ----------
export const COL = {
  ink: "#020817",
  navy: "#04123a",
  deep: "#06205e",
  royal: "#0b4fe0",
  blue: "#1a6cff",
  sky: "#5aa8ff",
  silver: "#e6e9ef",
  silver2: "#9aa6b8",
  gold: "#ffc23d",
  gold2: "#e8890c",
};
export const FONT = "Montserrat, sans-serif";

// logo extraída: 1490x376, centro do anel "O" em (1035,148), raio médio 72, espessura 40
export const LOGO = {w: 1490, h: 376, ox: 1035, oy: 148, or: 72, osw: 40};

let fontsReady = false;
export const loadFonts = () => {
  if (fontsReady || typeof document === "undefined") return;
  fontsReady = true;
  const h = delayRender("fonts");
  const ws = [500, 600, 700, 800, 900];
  Promise.all(
    ws.map((w) => {
      const ff = new FontFace("Montserrat", `url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)}) format('woff2')`, {weight: String(w)});
      document.fonts.add(ff);
      return ff.load();
    })
  ).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- tipografia ----------
// palavra que sobe por trás de uma máscara, sincronizada ao instante da fala
export const Word = ({f, t, children, style, dur = 0.45, from = 1.05, mask = true}) => {
  const p = P(f, t - 0.06, t - 0.06 + dur, EO);
  const inner = (
    <span style={{display: "inline-block", transform: `translateY(${(1 - p) * from * 100}%)`, opacity: mask ? 1 : p, ...style}}>{children}</span>
  );
  if (!mask) return inner;
  return <span style={{display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.06em 0.04em 0.14em", margin: "-0.06em -0.04em -0.14em"}}>{inner}</span>;
};

export const Abs = ({x = 0, y = 0, w, h, children, style, center = true}) => (
  <div style={{position: "absolute", left: x, top: y, width: w, height: h, ...(center ? {transform: "translate(-50%,-50%)"} : {}), ...style}}>{children}</div>
);

// cartão de vidro escuro com borda de luz
export const Glass = ({w, h, r = 36, children, style, glow = 0}) => (
  <div
    style={{
      position: "relative",
      width: w,
      height: h,
      borderRadius: r,
      background: "linear-gradient(160deg, rgba(64,120,255,0.20) 0%, rgba(20,50,140,0.18) 45%, rgba(6,20,70,0.55) 100%)",
      boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 0 0 1.5px rgba(140,180,255,0.22), 0 30px 60px rgba(0,6,30,0.45), 0 0 ${60 * glow}px rgba(40,120,255,${0.55 * glow})`,
      overflow: "hidden",
      ...style,
    }}
  >
    <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 40%)"}} />
    {children}
  </div>
);

// ladrilho de ícone (gradiente azul da logo, brilho superior)
export const Tile = ({s = 120, children, glow = 0, style}) => (
  <div
    style={{
      width: s,
      height: s,
      borderRadius: s * 0.27,
      background: "linear-gradient(150deg, #4f9bff 0%, #1a6cff 38%, #0a3fc4 100%)",
      boxShadow: `inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 14px rgba(0,20,90,0.45), 0 ${s * 0.12}px ${s * 0.3}px rgba(0,10,50,0.55), 0 0 ${s * 0.6 * glow}px rgba(60,140,255,${0.8 * glow})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      ...style,
    }}
  >
    <div style={{position: "absolute", left: "8%", right: "8%", top: "5%", height: "42%", borderRadius: s * 0.22, background: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0))"}} />
    {children}
  </div>
);

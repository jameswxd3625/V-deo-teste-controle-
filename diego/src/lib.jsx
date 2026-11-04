import React from "react";
import {Easing, staticFile, continueRender, delayRender, useCurrentFrame} from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const EO = Easing.bezier(0.16, 1, 0.3, 1);
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);
export const ES = Easing.bezier(0.45, 0, 0.2, 1); // câmera suave
export const EI = Easing.bezier(0.55, 0, 0.9, 0.4);
export const LIN = (u) => u;
export const ANT = Easing.bezier(0.36, -0.4, 0.25, 1);

export const useT = () => useCurrentFrame() / FPS;
// progresso 0..1 entre t0 e t1
export const P = (t, t0, t1, e = EO) => e(cl((t - t0) / (t1 - t0)));
// keyframes [[t, v], ...]
export const K = (t, pts, e = EIO) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [t0, v0] = pts[i];
    const [t1, v1] = pts[i + 1];
    if (t <= t1) {
      const ee = Array.isArray(e) ? e[i] || EIO : e;
      return v0 + (v1 - v0) * ee(cl((t - t0) / (t1 - t0)));
    }
  }
  return pts[pts.length - 1][1];
};
// keyframes de objetos {chave: valor}
export const KO = (t, pts, e = EIO) => {
  const keys = Object.keys(pts[0][1]);
  const o = {};
  for (const k of keys) o[k] = K(t, pts.map(([tt, v]) => [tt, v[k]]), e);
  return o;
};
// mola amortecida
export const SP = (t, t0, k = 10, z = 0.45) => {
  const u = t - t0;
  if (u <= 0) return 0;
  return 1 - Math.exp(-z * k * u) * Math.cos(k * Math.sqrt(1 - z * z) * u);
};
// ruído suave determinístico
export const wob = (t, seed = 0, f = 1) => Math.sin(t * f * 1.7 + seed * 12.9) * 0.6 + Math.sin(t * f * 2.9 + seed * 7.3) * 0.4;

export const COL = {
  navy: "#0A1C4A",
  ink: "#061232",
  blue: "#1558D6",
  blue2: "#1E6FF0",
  cyan: "#27C0F5",
  white: "#FFFFFF",
  kraft: "#C9945C",
  kraftD: "#A5713E",
  kraftL: "#E0B27A",
};
export const FONT = "Montserrat, sans-serif";

let fontsReady = false;
export const loadFonts = () => {
  if (fontsReady || typeof document === "undefined") return;
  fontsReady = true;
  const h = delayRender("fonts");
  const list = [
    ["normal", 500], ["normal", 600], ["normal", 700], ["normal", 800], ["normal", 900], ["italic", 800], ["italic", 900],
  ];
  Promise.all(
    list.map(([st, w]) => {
      const ff = new FontFace("Montserrat", `url(${staticFile(`fonts/montserrat-latin-${w}-${st}.woff2`)}) format('woff2')`, {weight: String(w), style: st});
      document.fonts.add(ff);
      return ff.load();
    })
  ).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// palavra revelada por máscara no instante da fala
export const Word = ({t, at, children, style, dur = 0.5, dy = 1.0}) => {
  const p = P(t, at - 0.05, at - 0.05 + dur, EO);
  return (
    <span style={{display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: "0.08em 0.06em 0.16em", margin: "-0.08em -0.06em -0.16em"}}>
      <span style={{display: "inline-block", transform: `translateY(${(1 - p) * dy * 110}%)`, ...style}}>{children}</span>
    </span>
  );
};

// geometria
export const rot = ([x, y], a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
};
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const deg = (d) => (d * Math.PI) / 180;
// cápsula afunilada entre A (raio ra) e B (raio rb)
export const capsule = (A, B, ra, rb) => {
  const dx = B[0] - A[0], dy = B[1] - A[1];
  const L = Math.hypot(dx, dy) || 1e-3;
  const nx = -dy / L, ny = dx / L;
  const a1 = [A[0] + nx * ra, A[1] + ny * ra], a2 = [A[0] - nx * ra, A[1] - ny * ra];
  const b1 = [B[0] + nx * rb, B[1] + ny * rb], b2 = [B[0] - nx * rb, B[1] - ny * rb];
  return `M${a1} L${b1} A${rb} ${rb} 0 0 0 ${b2} L${a2} A${ra} ${ra} 0 0 0 ${a1} Z`;
};

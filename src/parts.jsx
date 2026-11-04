import React from "react";
import {interpolate, Easing} from "remotion";

export const FPS = 30;
export const C = {blue: "#0a3bb0", deep: "#051f6e", royal: "#1d5bd6", gold: "#f6b52a", gold2: "#e08f08", navy: "#0a2a6e", white: "#fff"};
export const FONT = "Inter, 'DejaVu Sans', sans-serif";
const cl = (v) => Math.max(0, Math.min(1, v));
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const back = Easing.out(Easing.back(1.7));
export const pop = (f, at, dur = 16) => back(cl((f - at) / dur));
export const slide = (f, at, dur = 18) => ease(cl((f - at) / dur));
export const sec = (s) => Math.round(s * FPS);

// ---------- fundos ----------
const Rings = ({f, color}) => (
  <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
    {[520, 760, 1040].map((r, i) => (
      <circle key={i} cx={540 + Math.sin(f / 60 + i) * 30} cy={960 + Math.cos(f / 70 + i) * 40} r={r} fill="none" stroke={color} strokeWidth={2} opacity={0.5 - i * 0.12} />
    ))}
  </svg>
);
export const BlueBg = ({f}) => (
  <div style={{position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 28%, ${C.royal} 0%, ${C.blue} 48%, ${C.deep} 100%)`}}>
    <Rings f={f} color="rgba(255,255,255,0.14)" />
    <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(2,10,50,0.45) 100%)"}} />
  </div>
);
export const WhiteBg = ({f}) => (
  <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, #ffffff 0%, #f1f5fc 70%, #e3ebf8 100%)"}}>
    <Rings f={f} color="rgba(10,59,176,0.10)" />
  </div>
);

// ---------- cena com fade/escala ----------
export const Scene = ({frame, a, b, children, drift = 0.0005}) => {
  const A = sec(a), B = sec(b);
  if (frame < A - 2 || frame > B + 8) return null;
  const o = interpolate(frame, [A - 2, A + 6, B - 2, B + 8], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const exit = cl((frame - (B - 2)) / 10);
  const f = frame - A;
  return (
    <div style={{position: "absolute", inset: 0, opacity: o, transform: `scale(${1 + f * drift + exit * 0.04})`, transformOrigin: "50% 50%"}}>
      {children(f)}
    </div>
  );
};

// ---------- moeda ----------
export const Coin = ({x, y, s = 200, sym = "%", blur = 0, ph = 0, f, at = 0}) => {
  const p = pop(f, at, 18);
  const bob = Math.sin((f + ph) / 22) * 16;
  const rot = Math.sin((f + ph) / 34) * 32;
  return (
    <div style={{position: "absolute", left: x - s / 2, top: y - s / 2 + bob, width: s, height: s, transform: `scale(${p}) perspective(700px) rotateY(${rot}deg) rotateZ(${Math.sin((f + ph) / 50) * 10}deg)`, filter: blur ? `blur(${blur}px)` : undefined}}>
      <div style={{position: "absolute", left: 0, top: s * 0.06, width: s, height: s, borderRadius: "50%", background: "#a8620a", boxShadow: `0 ${s * 0.12}px ${s * 0.18}px rgba(0,10,60,0.45)`}} />
      <div style={{position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 32% 28%, #ffe38a 0%, ${C.gold} 40%, ${C.gold2} 100%)`, boxShadow: "inset 0 0 0 " + s * 0.045 + "px #f9c850, inset 0 " + -s * 0.03 + "px " + s * 0.06 + "px rgba(160,90,0,0.5)"}}>
        <div style={{position: "absolute", inset: s * 0.12, borderRadius: "50%", border: `${s * 0.02}px solid rgba(255,240,180,0.7)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: s * 0.5, color: "#fff7dc", textShadow: `0 ${s * 0.02}px ${s * 0.03}px rgba(150,80,0,0.7)`}}>{sym}</div>
        <div style={{position: "absolute", left: s * 0.14, top: s * 0.1, width: s * 0.3, height: s * 0.14, borderRadius: "50%", background: "rgba(255,255,255,0.5)", transform: "rotate(-30deg)", filter: "blur(3px)"}} />
      </div>
    </div>
  );
};

// ---------- cartão translúcido ----------
export const Card = ({x, y, w, h, rot = 0, children, scale = 1, style}) => (
  <div style={{position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${scale})`, borderRadius: 56, background: "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))", border: "3px solid rgba(255,255,255,0.55)", boxShadow: "0 30px 70px rgba(0,10,60,0.4), inset 0 0 40px rgba(255,255,255,0.12), 0 0 40px rgba(120,170,255,0.3)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", ...style}}>
    <div style={{position: "absolute", left: 30, top: 10, right: 30, height: "38%", borderRadius: 48, background: "linear-gradient(rgba(255,255,255,0.18), transparent)"}} />
    {children}
  </div>
);

// ---------- traço SVG desenhado ----------
export const Draw = ({d, p, stroke = C.gold, width = 10, w = 1080, h = 1920, style, glow = true}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: "absolute", left: 0, top: 0, overflow: "visible", ...style}}>
    <path d={d} pathLength={1} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - cl(p)} style={{filter: glow ? "drop-shadow(0 0 8px rgba(246,181,42,0.7))" : undefined}} />
  </svg>
);

// ---------- palavras sincronizadas (at em segundos absolutos; a = início da cena) ----------
export const Words = ({items, f, a, size = 130, color = "#fff", gold = C.gold, weight = 800, justify = "center", gap = 0.26, from = "up", style}) => (
  <div style={{display: "flex", flexWrap: "wrap", justifyContent: justify, columnGap: size * gap, rowGap: size * 0.04, fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1.1, letterSpacing: -size * 0.02, color, ...style}}>
    {items.map((it, i) => {
      const at = sec(it.at) - sec(a);
      const p = slide(f, at, 14);
      const dx = from === "right" ? (1 - p) * 260 : 0;
      const dy = from === "up" ? (1 - p) * 50 : 0;
      return (
        <span key={i} style={{opacity: cl((f - at) / 8), transform: `translate(${dx}px,${dy}px) scale(${0.92 + 0.08 * p})`, color: it.gold ? gold : it.color || color, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined, textShadow: it.gold ? "0 0 24px rgba(246,181,42,0.35)" : undefined}}>{it.t}</span>
      );
    })}
  </div>
);

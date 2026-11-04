import React, {useRef, useLayoutEffect} from "react";
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

// ---------- verificação de margem lateral (70 px) ----------
const SAFE = 70;
const chk = (el, abs, clip) => {
  if (!el) return;
  let o = 1, n = el;
  while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
  if (o < 0.15) return;
  const r = el.getBoundingClientRect();
  let L = r.left, R = r.right;
  if (clip) { const c = clip.getBoundingClientRect(); L = Math.max(L, c.left); R = Math.min(R, c.right); }
  if (R > L && (L < SAFE - 1 || R > 1080 - SAFE + 1)) console.log(`VIOL f=${abs} "${(el.textContent || "").slice(0, 30)}" L=${L.toFixed(0)} R=${R.toFixed(0)}`);
};
export const Txt = ({children, f, a = 0, style}) => {
  const ref = useRef();
  useLayoutEffect(() => chk(ref.current, f + sec(a)));
  return <div ref={ref} style={style}>{children}</div>;
};

// ---------- fundo compartilhado entre cenas (continuidade) ----------
export const Group = ({frame, a, b, kind = "blue", children}) => {
  const A = sec(a), B = sec(b);
  if (frame < A - 8 || frame > B + 8) return null;
  const o = interpolate(frame, [A - 8, A, B, B + 8], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const f = frame - A;
  return <div style={{position: "absolute", inset: 0, opacity: o}}>{kind === "blue" ? <BlueBg f={f} /> : <WhiteBg f={f} />}{children && children(f)}</div>;
};

// ---------- cena: fade, deslocamento coordenado, wipe, push ----------
export const Scene = ({frame, a, b, children, drift = 0.0003, inY = 0, wipe = false, push = null, bgless = false}) => {
  const A = sec(a), B = sec(b);
  if (frame < A - 2 || frame > B + 8) return null;
  const f = frame - A;
  let o = 1, tx = 0, ty = 0, sc = 1 + f * drift, clip;
  if (wipe) {
    const p = ease(cl((frame - A) / 15));
    clip = `inset(0 0 0 ${(1 - p) * 100}%)`;
    if (frame > B) return null;
  } else {
    const inn = ease(cl((frame - A) / 12));
    const out = ease(cl((frame - (B - 4)) / 12));
    o = Math.min(cl((frame - (A - 2)) / 8), 1 - out);
    ty = (1 - inn) * inY - out * inY * 0.6;
    if (push) {
      const pp = ease(cl((frame - sec(push)) / 15));
      o = cl((frame - (A - 2)) / 8);
      tx = -pp * 170; ty = 0;
      if (frame > B) return null;
    }
  }
  return (
    <div style={{position: "absolute", inset: 0, opacity: o, clipPath: clip, transform: `translate(${tx}px,${ty}px) scale(${sc})`, transformOrigin: "50% 50%"}}>
      {children(f)}
      {wipe && <div style={{position: "absolute", top: 0, bottom: 0, width: 16, left: `${(1 - ease(cl((frame - A) / 15))) * 100}%`, background: C.gold, boxShadow: "0 0 30px rgba(246,181,42,0.8)", opacity: frame - A < 15 ? 1 : 0}} />}
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
// peso base leve; palavras-chave (gold ou b) em peso forte
const WordSpan = ({it, at, f, abs, base, gold, color, from, clip}) => {
  const ref = useRef();
  const p = slide(f, at, 14);
  useLayoutEffect(() => chk(ref.current, abs, clip && clip.current));
  const dx = from === "right" ? (1 - p) * 180 : 0;
  const dy = from === "up" ? (1 - p) * 40 : 0;
  const strong = it.gold || it.b;
  return (
    <span ref={ref} style={{opacity: cl((f - at) / 8), transform: `translate(${dx}px,${dy}px)`, fontWeight: strong ? 800 : base, color: it.gold ? gold : it.color || color, filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined, whiteSpace: "nowrap"}}>{it.t}</span>
  );
};
export const Words = ({items, f, a, size = 120, color = "#fff", gold = C.gold, weight = 500, justify = "center", gap = 0.26, from = "up", style}) => {
  const clip = useRef();
  return (
    <div ref={clip} style={{display: "flex", flexWrap: "wrap", justifyContent: justify, columnGap: size * gap, rowGap: size * 0.02, fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1.12, letterSpacing: -size * 0.02, color, overflow: from === "right" ? "hidden" : "visible", padding: from === "right" ? "0.1em 0" : 0, maxWidth: 920, ...style}}>
      {items.map((it, i) => <WordSpan key={i} it={it} at={sec(it.at) - sec(a)} f={f} abs={f + sec(a)} base={weight} gold={gold} color={color} from={from} clip={from === "right" ? clip : null} />)}
    </div>
  );
};

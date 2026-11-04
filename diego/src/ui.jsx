import React from "react";
import {AbsoluteFill, staticFile} from "remotion";
import {P, EO, EIO, EI, cl, mix, FONT, Word} from "./lib";

// câmera 2D: ponto do mundo no centro da tela + zoom
export const Cam = ({c, children, w = 1080, h = 1920}) => (
  <g transform={`translate(${w / 2} ${h / 2}) rotate(${c.r || 0}) scale(${c.z}) translate(${-c.x} ${-c.y})`}>{children}</g>
);

export const Stage = ({children, bg = "#000"}) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: "absolute", inset: 0, background: bg}}>{children}</svg>
);

// legenda: linhas de palavras [texto, instante, ênfase?]
const emStyle = {fontStyle: "italic", fontWeight: 900, background: "linear-gradient(180deg,#8EE3FF 0%,#27C0F5 50%,#1E8CF0 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "none", filter: "drop-shadow(0 4px 14px rgba(0,30,90,0.45))", paddingRight: "0.06em"};
export const Caption = ({t, lines, y, size = 76, out, inAt, align = "center", x = 540, maxW = 940, color = "#fff", shadow = true, weight = 800, lh = 1.08, style}) => {
  const o = out ? 1 - P(t, out, out + 0.35, EI) : 1;
  if (o <= 0.001) return null;
  return (
    <div style={{position: "absolute", left: x - maxW / 2, width: maxW, top: y, textAlign: align, fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: "-0.015em", color, opacity: o, transform: `translateY(${(1 - o) * -30}px)`, textShadow: shadow ? "0 6px 26px rgba(0,8,30,0.55), 0 2px 4px rgba(0,8,30,0.35)" : "none", ...style}}>
      {lines.map((ln, i) => (
        <div key={i} style={{fontSize: ln.size || size, fontWeight: ln.weight || weight, color: ln.color || color, marginTop: ln.gap || 0}}>
          {ln.words.map(([w, at, em], j) => (
            <React.Fragment key={j}>
              <Word t={t} at={at} style={em ? emStyle : undefined}>{w}</Word>
              {j < ln.words.length - 1 ? " " : ""}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};
// atalho: "texto *ênfase*" com instantes por palavra
export const L = (str, times, opts = {}) => {
  const ws = str.split(" ");
  return {...opts, words: ws.map((w, i) => {
    const em = w.startsWith("*");
    return [w.replace(/\*/g, ""), times[i] ?? times[times.length - 1], em];
  })};
};

// granulação e vinheta finais
export const Finish = ({t, vignette = 0.55, warm = 0}) => (
  <>
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(2,6,20,${vignette}) 100%)`, pointerEvents: "none"}} />
    {warm !== 0 && <AbsoluteFill style={{background: warm > 0 ? "#FFB45A" : "#3A7BFF", opacity: Math.abs(warm) * 0.08, mixBlendMode: "soft-light"}} />}
    <AbsoluteFill style={{backgroundImage: `url(${staticFile("grain.png")})`, backgroundPosition: `${(Math.floor(t * 30) * 137) % 512}px ${(Math.floor(t * 30) * 251) % 512}px`, opacity: 0.075, mixBlendMode: "overlay", pointerEvents: "none"}} />
  </>
);

// rótulo de nome (super)
export const NameSuper = ({t, at, x, y, name, sub}) => {
  const p = P(t, at, at + 0.6, EO);
  const out = 1 - P(t, at + 1.6, at + 2.0, EI);
  if (p <= 0) return null;
  return (
    <div style={{position: "absolute", left: x, top: y, opacity: out, fontFamily: FONT}}>
      <div style={{width: 6, height: 120 * p, background: "linear-gradient(180deg,#27C0F5,#1E6FF0)", borderRadius: 3, position: "absolute", left: 0, top: 0, boxShadow: "0 0 18px rgba(39,192,245,0.6)"}} />
      <div style={{marginLeft: 26, overflow: "hidden"}}>
        <div style={{fontSize: 34, fontWeight: 700, color: "#BFE9FF", letterSpacing: "0.12em", textTransform: "uppercase", transform: `translateY(${(1 - p) * 100}%)`}}>{sub}</div>
        <div style={{fontSize: 92, fontWeight: 900, color: "#fff", lineHeight: 1, transform: `translateY(${(1 - p) * 110}%)`, textShadow: "0 8px 30px rgba(0,8,30,0.55)"}}>{name}</div>
      </div>
    </div>
  );
};

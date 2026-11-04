import React from "react";
import {AbsoluteFill, Img, staticFile, useCurrentFrame, Audio, getInputProps} from "remotion";
import {FPS, K, P, SP, EO, EIO, EI, ANT, cl, mix, COL, FONT, LOGO, Word, Abs, Glass, Tile, loadFonts} from "./lib";
import {Meter} from "./Meter";
import {Coins3D} from "./Coins3D";
import {IcList, IcPercentDoc, IcFlow, IcChip, IcAI, IcCalc, IcBuilding, Check, Storefront, Shield} from "./icons";

loadFonts();
export const DURATION = 30 * FPS;
const ip = getInputProps();
const NO3D = ip.no3d;
const WITH_AUDIO = ip.audio;

const t_ = (f) => f / FPS;
const vis = (f, a, b) => t_(f) >= a && t_(f) < b;
const T = {
  white: {fontFamily: FONT, color: "#fff", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.04, textShadow: "0 8px 30px rgba(0,8,40,0.55)"},
};
const Line = ({y, size, children, style, x = 540, o = 1}) => (
  <div style={{position: "absolute", left: 0, width: 1080, top: y, transform: `translateY(-50%) translateX(${x - 540}px)`, textAlign: "center", fontSize: size, opacity: o, whiteSpace: "nowrap", ...T.white, ...style}}>{children}</div>
);
const goldTxt = {background: "linear-gradient(180deg,#ffe08a 0%,#ffc23d 45%,#e8890c 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "none", filter: "drop-shadow(0 6px 18px rgba(255,170,30,0.35))"};
const blueTxt = {background: "linear-gradient(180deg,#9fd0ff 0%,#4f9bff 45%,#1a6cff 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "none", filter: "drop-shadow(0 6px 22px rgba(40,120,255,0.55))"};

// ---------------- fundo ----------------
const DUST = Array.from({length: 46}, (_, i) => {
  const r = (n) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
  return {x: r(1) * 1080, y: r(2) * 1920, s: 1.5 + r(3) * 4, sp: 8 + r(4) * 22, a: 0.15 + r(5) * 0.45, d: r(6)};
});
const Background = ({f}) => {
  const t = t_(f);
  const sol = P(f, 7.85, 8.6, EIO); // 0 = problema (frio/escuro), 1 = solução (royal)
  const burst = Math.max(0, 1 - Math.abs(t - 8.1) / 0.5) + Math.max(0, 1 - Math.abs(t - 26.3) / 0.6);
  const c1 = sol ? `rgba(${mix(20, 30, sol)},${mix(70, 110, sol)},${mix(200, 255, sol)},1)` : "rgb(20,70,200)";
  return (
    <AbsoluteFill style={{background: COL.ink}}>
      <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% ${mix(38, 42, sol)}%, ${c1} 0%, ${mix(0, 1, sol) ? "#0a2f9e" : "#0a2f9e"} 32%, #051a5c 62%, #020a26 100%)`, opacity: mix(0.78, 1, sol)}} />
      {/* luz móvel */}
      <AbsoluteFill style={{background: `radial-gradient(50% 30% at ${50 + Math.sin(t * 0.35) * 18}% ${30 + Math.cos(t * 0.28) * 10}%, rgba(90,168,255,0.28), transparent 70%)`}} />
      {/* textura diagonal derivada do fundo da logo */}
      <AbsoluteFill style={{backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 22px)", maskImage: "radial-gradient(70% 55% at 50% 45%, black, transparent)", WebkitMaskImage: "radial-gradient(70% 55% at 50% 45%, black, transparent)", transform: `translateY(${(t * 6) % 31}px)`}} />
      <AbsoluteFill style={{background: `radial-gradient(60% 40% at 50% 50%, rgba(120,190,255,${0.5 * burst}), transparent 70%)`}} />
      {DUST.map((d, i) => (
        <div key={i} style={{position: "absolute", left: d.x + Math.sin(t * 0.4 + i) * 20, top: ((d.y - t * d.sp) % 1920 + 1920) % 1920, width: d.s, height: d.s, borderRadius: "50%", background: "#bcd8ff", opacity: d.a * (0.6 + 0.4 * Math.sin(t * 2 + i)), filter: d.d > 0.6 ? "blur(1.5px)" : undefined}} />
      ))}
      <AbsoluteFill style={{background: "radial-gradient(85% 60% at 50% 48%, transparent 55%, rgba(0,4,20,0.65) 100%)"}} />
    </AbsoluteFill>
  );
};

// ---------------- moedas 3D (fase do problema) ----------------
const exitE = [EO, (u) => u, EI];
const NEAR = [
  {sym: "%", s: 0.62, rx: 0.5, ry: -0.6, spin: 0.35, phase: 0.2, p: [[0, 4.6, 5.5, 1.5], [0.9, 2.45, 3.75, 1.5], [7.3, 2.25, 4.05, 1.5], [7.9, 5.2, 7.5, 1.5]]},
  {sym: "$", s: 0.46, rx: -0.3, ry: 0.7, spin: -0.4, phase: 1.3, p: [[0, -5, 0.2, 1], [1.0, -2.65, 0.7, 1], [7.3, -2.75, 1.3, 1], [7.85, -6, 1.6, 1]]},
  {sym: "%", s: 0.8, rx: 0.4, ry: 0.5, spin: 0.3, phase: 2.1, p: [[0, 5, -6.5, 2.5], [1.1, 2.15, -3.95, 2.5], [7.3, 2.35, -3.6, 2.5], [7.9, 5.5, -7, 2.5]]},
];
const FAR = [
  {sym: "$", s: 0.5, rx: 0.2, ry: 0.4, spin: 0.25, phase: 0.7, p: [[0, -4, 6, -3], [1.2, -2.4, 4.3, -3], [7.3, -2.2, 4.6, -3], [7.9, -5, 7, -3]]},
  {sym: "%", s: 0.45, rx: -0.4, ry: -0.3, spin: -0.3, phase: 2.9, p: [[0, 5, -1.5, -4], [1.2, 3.1, -0.9, -4], [7.3, 3.2, -0.5, -4], [7.9, 6, -0.8, -4]]},
  {sym: "$", s: 0.6, rx: 0.3, ry: -0.2, spin: 0.2, phase: 4.1, p: [[0, -4, -7, -2], [1.2, -2.3, -4.5, -2], [7.3, -2.5, -4.2, -2], [7.9, -5, -7.5, -2]]},
  {sym: "%", s: 1.3, rx: 0.6, ry: 0.3, spin: 0.25, phase: 5.2, p: [[0, -3.6, -5.6, 7], [7.9, -4.2, -6.6, 7]]},
];
NEAR.concat(FAR).forEach((c) => { c.ease = (u) => 1 - Math.pow(1 - u, 3); });

// ---------------- marca fixa ----------------
const LogoImg = ({w, style}) => <Img src={staticFile("logo_alpha.png")} style={{width: w, height: (w * LOGO.h) / LOGO.w, display: "block", ...style}} />;

// posição/escala da logo ao longo do filme (centro x,y e largura)
const BUG = {x: 540, y: 168, w: 330};
const BIG = {x: 540, y: 960, w: 900};
const END = {x: 540, y: 1040, w: 920};
const logoState = (f) => {
  const t = t_(f);
  if (t < 7.4) return {...BUG, o: P(f, 0.3, 0.9), mode: "bug"};
  if (t < 7.9) return {...BUG, o: 1 - P(f, 7.4, 7.6), mode: "bug"};
  if (t < 9.0) {
    const k = P(f, 8.5, 8.95, EIO);
    return {x: mix(BIG.x, BUG.x, k), y: mix(BIG.y, BUG.y, k), w: mix(BIG.w, BUG.w, k), o: 1, mode: "reveal"};
  }
  if (t < 26.15) return {...BUG, o: 1, mode: "bug"};
  const k = P(f, 26.15, 26.75, ANT);
  return {x: mix(BUG.x, END.x, k), y: mix(BUG.y, END.y, k), w: mix(BUG.w, END.w, k), o: 1, mode: "end"};
};
const Brand = ({f}) => {
  const s = logoState(f);
  const t = t_(f);
  if (s.o <= 0.001) return null;
  // revelação a partir do anel "O": máscara radial que cresce
  let mask;
  if (s.mode === "reveal") {
    const r = P(f, 7.98, 8.4, EO) * 1700;
    const ox = (LOGO.ox / LOGO.w) * 100, oy = (LOGO.oy / LOGO.h) * 100;
    mask = `radial-gradient(circle at ${ox}% ${oy}%, black ${r * 0.85}px, transparent ${r}px)`;
  }
  const sweepT = s.mode === "reveal" ? P(f, 8.1, 8.6, EIO) : s.mode === "end" ? P(f, 26.7, 27.6, EIO) : -1;
  const h = (s.w * LOGO.h) / LOGO.w;
  const scale = s.mode === "reveal" ? mix(1.08, 1, P(f, 7.98, 8.5, EO)) : 1;
  return (
    <div style={{position: "absolute", left: s.x - s.w / 2, top: s.y - h / 2, width: s.w, height: h, opacity: s.o, transform: `scale(${scale})`}}>
      <div style={{position: "absolute", inset: 0, maskImage: mask, WebkitMaskImage: mask}}>
        <LogoImg w={s.w} style={{filter: `drop-shadow(0 ${s.w * 0.012}px ${s.w * 0.02}px rgba(0,6,30,0.7))`}} />
        {sweepT >= 0 && sweepT < 1 && (
          <div style={{position: "absolute", inset: 0, maskImage: `url(${staticFile("logo_alpha.png")})`, WebkitMaskImage: `url(${staticFile("logo_alpha.png")})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%", mixBlendMode: "screen"}}>
            <div style={{position: "absolute", top: 0, bottom: 0, width: "30%", left: `${mix(-40, 120, sweepT)}%`, background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.85), transparent)"}} />
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- cenas ----------------
// meses (S2): 3 colunas x 4 linhas
const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const tileXY = (i) => ({x: [230, 540, 850][i % 3], y: 830 + Math.floor(i / 3) * 215});
const RING_IN_TILE = (i) => ({x: tileXY(i).x - 68, y: tileXY(i).y});
const OPOS = {x: BIG.x + (LOGO.ox - LOGO.w / 2) * (BIG.w / LOGO.w), y: BIG.y + (LOGO.oy - LOGO.h / 2) * (BIG.w / LOGO.w), r: LOGO.or * (BIG.w / LOGO.w), sw: LOGO.osw * (BIG.w / LOGO.w)};

// estado do medidor principal (anel 12% -> mês -> barra -> logo)
const meterState = (f) => {
  const t = t_(f);
  const jan = RING_IN_TILE(0);
  let s = {x: 540, y: 880, R: 300, m: 0, sw: 74, L: 880, pBlue: P(f, 0, 0.45), pGold: P(f, 0.12, 0.8, EIO), goldCol: 1, goldLift: 0, opacity: 1, glow: 0.7};
  s.R = mix(250, 300, P(f, 0, 1.0));
  if (t >= 2.25) {
    const k = P(f, 2.3, 3.0, ANT);
    s = {...s, x: mix(540, jan.x, k), y: mix(880, jan.y, k), R: mix(300, 50, k), sw: mix(74, 18, k), glow: mix(0.7, 0.3, k)};
  }
  if (t >= 4.45) {
    const k = P(f, 4.45, 4.95, EIO);
    const u = P(f, 4.92, 5.45, EIO);
    s = {...s, x: mix(jan.x, 540, k), y: mix(jan.y, 1000, k), R: mix(50, 140, k), sw: mix(18, 64, k) + u * 26, m: u, glow: 0.6};
    s.goldLift = SP(f, 5.86, {k: 11, z: 0.45}) * 120;
  }
  if (t >= 6.25) {
    const k = P(f, 6.25, 6.75, EIO);
    s.y = mix(1000, 770, k);
  }
  if (t >= 7.4) {
    const back = P(f, 7.4, 7.62, EIO);
    s.goldLift *= 1 - back;
    const u = P(f, 7.45, 7.88, EIO);
    s.m = 1 - u;
    s.y = mix(770, 960, u);
    s.R = mix(140, 230, u);
    s.sw = mix(90, 60, u);
    const k = P(f, 7.9, 8.2, EIO);
    s.x = mix(540, OPOS.x, k);
    s.y = mix(s.y, OPOS.y, k);
    s.R = mix(s.R, OPOS.r, k);
    s.sw = mix(s.sw, OPOS.sw, k);
    s.goldCol = 1 - P(f, 7.9, 8.15);
    s.opacity = 1 - P(f, 8.18, 8.4);
  }
  return s;
};

const S1 = ({f}) => {
  const n = Math.round(mix(0, 12, P(f, 0.1, 0.62, (u) => u)));
  const t = t_(f);
  const out = P(f, 2.25, 2.6, EI);
  const k = P(f, 2.3, 3.0, ANT);
  const jan = tileXY(0);
  // "12%" viaja do centro do anel para o rótulo do mês
  const x = mix(540, jan.x + 52, k), y = mix(880, jan.y + 22, k), s = mix(1, 0.27, k);
  const gone = P(f, 4.45, 4.65);
  return (
    <>
      <div style={{position: "absolute", left: x, top: y, opacity: 1 - gone, transform: `translate(-50%,-50%) scale(${s * mix(0.85, 1, P(f, 0, 0.7))})`, ...T.white, fontSize: 200, fontWeight: 900, letterSpacing: "-0.05em", whiteSpace: "nowrap", ...(k > 0.5 ? goldTxt : {})}}>
        {n}<span style={{fontSize: "0.62em", marginLeft: 6}}>%</span>
      </div>
      {t < 2.7 && (
        <div style={{opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
          <Line y={1290} size={64} style={{fontWeight: 600, color: COL.silver}}><Word f={f} t={0.84}>de</Word></Line>
          <Line y={1380} size={128} style={{fontWeight: 900}}><Word f={f} t={1.18} style={goldTxt}>imposto</Word></Line>
        </div>
      )}
    </>
  );
};

const S2 = ({f}) => {
  const out = P(f, 4.4, 4.75, EI);
  const t = t_(f);
  return (
    <>
      <div style={{opacity: 1 - out, transform: `translateY(${-out * 50}px)`}}>
        <Line y={420} size={78}><Word f={f} t={2.26}>Imagine</Word> <Word f={f} t={2.6}>pagar</Word></Line>
        <Line y={512} size={78}><Word f={f} t={2.94}>esse</Word> <Word f={f} t={3.2}>valor</Word></Line>
        <Line y={630} size={84} style={{fontWeight: 900}}>
          <Word f={f} t={3.46} style={goldTxt}>todos</Word> <Word f={f} t={3.9} style={goldTxt}>os</Word> <Word f={f} t={4.22} style={goldTxt}>meses</Word>
        </Line>
      </div>
      {MONTHS.map((mo, i) => {
        const {x, y} = tileXY(i);
        const t0 = i === 0 ? 2.75 : 3.46 + i * 0.065;
        const pin = i === 0 ? P(f, t0, t0 + 0.4) : SP(f, t0, {k: 14, z: 0.5});
        if (pin <= 0) return null;
        // recolhe para o centro em 4.45
        const c = P(f, 4.45, 4.85, EIO);
        const rx = RING_IN_TILE(i);
        const ring = (
          i > 0 && (
            <Meter x={mix(rx.x, 540, c)} y={mix(rx.y, 1000, c)} R={mix(50, 140, c)} sw={mix(18, 64, c)} pBlue={P(f, t0 + 0.05, t0 + 0.35)} pGold={P(f, t0 + 0.12, t0 + 0.45)} opacity={1 - P(f, 4.6, 4.85)} glow={0.3} idSuffix={`m${i}`} />
          )
        );
        return (
          <React.Fragment key={i}>
            <div style={{position: "absolute", left: x - 140, top: y - 92, width: 280, height: 184, opacity: (1 - c) * cl(pin * 1.5), transform: `scale(${mix(0.6, 1, cl(pin, 0, 1.2)) * (1 - c * 0.3)})`}}>
              <Glass w={280} h={184} r={34}>
                <div style={{position: "absolute", left: 132, top: 38, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: COL.silver2, letterSpacing: "0.06em"}}>{mo}</div>
                {i > 0 && <div style={{position: "absolute", left: 130, top: 80, fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: "-0.04em", ...goldTxt}}>12%</div>}
              </Glass>
            </div>
            {ring}
          </React.Fragment>
        );
      })}
    </>
  );
};

const S34 = ({f}) => {
  const t = t_(f);
  const up = P(f, 6.25, 6.75, EIO) * -230;
  const out = P(f, 7.38, 7.65, EI);
  const br = P(f, 5.2, 5.6, EIO);
  const lbl = P(f, 5.95, 6.35);
  return (
    <div style={{opacity: 1 - out, filter: out ? `blur(${out * 10}px)` : undefined}}>
      <div style={{transform: `translateY(${up}px)`}}>
        <Line y={700} size={92} style={{fontWeight: 900}}><Word f={f} t={4.92}>Faturamento</Word></Line>
        <Line y={792} size={54} style={{fontWeight: 600, color: COL.silver}}><Word f={f} t={5.38}>da</Word> <Word f={f} t={5.7}>sua</Word> <Word f={f} t={5.86}>empresa</Word></Line>
        {/* chave do total = 100% */}
        <svg width="1080" height="200" style={{position: "absolute", left: 0, top: 860}}>
          <path d={`M${100} 66 V48 H${100 + 880 * br} ${br > 0.99 ? "V66" : ""}`} stroke="rgba(200,220,255,0.6)" strokeWidth="3" fill="none" />
        </svg>
        <div style={{position: "absolute", left: 540, top: 908, transform: `translate(-50%,-50%) scale(${mix(0.7, 1, br)})`, opacity: br, padding: "6px 22px", borderRadius: 40, background: "#0a2a7a", boxShadow: "inset 0 0 0 2px rgba(140,180,255,0.5)", fontFamily: FONT, fontWeight: 800, fontSize: 36, color: "#fff"}}>100%</div>
        {/* rótulo da parcela */}
        <div style={{position: "absolute", right: 100, top: 1170, opacity: lbl, transform: `translateY(${(1 - lbl) * 20}px)`, textAlign: "right", fontFamily: FONT, whiteSpace: "nowrap"}}>
          <span style={{fontWeight: 900, fontSize: 64, letterSpacing: "-0.03em", ...goldTxt}}>12%</span>
          <span style={{fontWeight: 600, fontSize: 44, color: COL.silver, marginLeft: 14}}>de imposto</span>
        </div>
      </div>
      <Line y={1270} size={66} style={{fontWeight: 600, color: COL.silver}}><Word f={f} t={6.28}>e</Word> <Word f={f} t={6.6}>achar</Word> <Word f={f} t={6.9}>que</Word> <Word f={f} t={7.0}>é</Word></Line>
      <div style={{position: "absolute", left: 0, width: 1080, top: 1400, transform: "translateY(-50%)", textAlign: "center"}}>
        <span style={{position: "relative", display: "inline-block", ...T.white, fontSize: 168, fontWeight: 900, letterSpacing: "-0.04em"}}>
          <Word f={f} t={7.06}>normal.</Word>
          <span style={{position: "absolute", left: "-3%", width: "106%", top: "50%", height: 18, marginTop: -6, borderRadius: 9, background: "linear-gradient(90deg,#ffe08a,#ffc23d,#e8890c)", boxShadow: "0 0 18px rgba(255,180,40,0.7)", transform: `scaleX(${P(f, 7.3, 7.45, EIO)}) rotate(-2deg)`, transformOrigin: "left"}} />
        </span>
      </div>
    </div>
  );
};

// S6: análise
const CARDS = [
  {y: 720, t: 9.54, Icon: IcList, title: "Suas atividades"},
  {y: 1010, t: 10.6, Icon: IcPercentDoc, title: "Regime tributário"},
  {y: 1300, t: 12.34, Icon: IcFlow, title: "Toda a operação"},
];
const PILLARS = [
  {x: 250, y: 760, t: 13.32, Icon: IcChip, label: ["Tecnologia"]},
  {x: 830, y: 760, t: 14.32, Icon: IcAI, label: ["Inteligência", "artificial"]},
  {x: 540, y: 1330, t: 15.66, Icon: IcCalc, label: ["Análise contábil"]},
];
const HUB = {x: 540, y: 1045};

const CardBody = ({i, f}) => {
  const c = CARDS[i];
  if (i === 0)
    return (
      <div style={{display: "flex", gap: 28, marginTop: 22}}>
        {[0, 1, 2].map((j) => {
          const p = P(f, c.t + 0.3 + j * 0.15, c.t + 0.6 + j * 0.15);
          return (
            <div key={j} style={{display: "flex", alignItems: "center", gap: 10}}>
              <div style={{width: 40, height: 40, borderRadius: 20, background: p > 0.5 ? "#1a6cff" : "rgba(255,255,255,0.12)", boxShadow: "inset 0 0 0 2px rgba(160,200,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center"}}><Check s={34} p={p} sw={13} /></div>
              <div style={{width: [110, 90, 120][j], height: 14, borderRadius: 7, background: "rgba(200,220,255,0.35)"}} />
            </div>
          );
        })}
      </div>
    );
  if (i === 1) {
    const sc = P(f, 10.95, 11.85, EIO);
    const chips = ["Simples", "Presumido", "Real"];
    return (
      <div style={{position: "relative", display: "flex", gap: 14, marginTop: 20}}>
        {chips.map((ch, j) => {
          const hl = Math.max(0, 1 - Math.abs(sc * 2.6 - j) * 1.3) * (1 - P(f, 11.85, 12.1));
          return (
            <div key={j} style={{padding: "10px 20px", borderRadius: 30, fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "#fff", background: `rgba(26,108,255,${0.18 + hl * 0.7})`, boxShadow: `inset 0 0 0 2px rgba(150,190,255,${0.35 + hl * 0.6}), 0 0 ${30 * hl}px rgba(60,140,255,${hl})`, opacity: P(f, c.t + 0.15 + j * 0.1, c.t + 0.5 + j * 0.1)}}>{ch}</div>
          );
        })}
      </div>
    );
  }
  const d = P(f, 12.45, 12.95, EIO);
  return (
    <svg width="560" height="70" style={{marginTop: 18, overflow: "visible"}}>
      <path d="M20 35 H540" stroke="rgba(160,200,255,0.55)" strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - d} />
      {[0, 1, 2, 3, 4].map((j) => {
        const pj = P(f, 12.45 + j * 0.09, 12.7 + j * 0.09);
        return <circle key={j} cx={20 + j * 130} cy={35} r={16 * pj} fill="#1a6cff" stroke="#cfe2ff" strokeWidth="4" />;
      })}
      {d > 0.2 && [0, 1].map((j) => {
        const u = ((t_(f) - 12.6) * 0.9 + j * 0.5) % 1;
        return <circle key={`p${j}`} cx={20 + u * 520} cy={35} r={7} fill="#fff" style={{filter: "drop-shadow(0 0 8px #9cc8ff)"}} />;
      })}
    </svg>
  );
};

const S6 = ({f}) => {
  const t = t_(f);
  const out = P(f, 12.95, 13.3, EIO);
  return (
    <>
      <div style={{opacity: 1 - P(f, 12.9, 13.15), transform: `translateY(${-P(f, 12.9, 13.2) * 40}px)`}}>
        <Line y={480} size={92} style={{fontWeight: 900}}><Word f={f} t={8.8} style={blueTxt}>Analisamos</Word></Line>
      </div>
      {CARDS.map((c, i) => {
        const pin = P(f, c.t - 0.22, c.t + 0.33, EO);
        if (pin <= 0) return null;
        const act = Math.max(0, 1 - Math.abs(t - c.t - 0.3) / 0.7);
        const scan = P(f, c.t - 0.05, c.t + 0.55, EIO);
        // ladrilho viaja para o pilar correspondente
        const pl = PILLARS[i];
        const tx = mix(100 + 50 + 65, pl.x, out), ty = mix(c.y, pl.y, out);
        const ts = mix(130, 190, out);
        return (
          <React.Fragment key={i}>
            <div style={{position: "absolute", left: 100, top: c.y - 125, opacity: pin * (1 - P(f, 12.92, 13.1)), transform: `translateX(${(1 - pin) * 140}px) scale(${1 - out * 0.15})`, filter: pin < 1 ? `blur(${(1 - pin) * 12}px)` : undefined}}>
              <Glass w={880} h={250} glow={act * 0.8}>
                <div style={{position: "absolute", left: 200, top: 50, right: 30}}>
                  <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: "-0.02em"}}>{c.title}</div>
                  <CardBody i={i} f={f} />
                </div>
                <div style={{position: "absolute", top: 0, bottom: 0, width: 160, left: `${mix(-20, 110, scan)}%`, background: "linear-gradient(90deg, transparent, rgba(150,200,255,0.25), transparent)", opacity: scan < 1 ? 1 : 0}} />
              </Glass>
            </div>
            {t < 13.4 && (
              <div style={{position: "absolute", left: tx, top: ty, transform: `translate(-50%,-50%) scale(${pin})`, opacity: t < 13.3 ? 1 : 0}}>
                <Tile s={ts} glow={act}>
                  <div style={{opacity: 1 - out, position: "absolute"}}><c.Icon s={ts * 0.55} /></div>
                  <div style={{opacity: out, position: "absolute"}}><pl.Icon s={ts * 0.55} /></div>
                </Tile>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

// S7: tecnologia, IA, análise contábil -> hub
const edge = (a, b, ra, rb) => {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  return {x1: a.x + (dx / d) * ra, y1: a.y + (dy / d) * ra, x2: b.x - (dx / d) * rb, y2: b.y - (dy / d) * rb};
};
const S7 = ({f}) => {
  const t = t_(f);
  const gather = P(f, 16.85, 17.35, EIO); // pilares entram no hub
  const hubIn = SP(f, 13.15, {k: 10, z: 0.5});
  const hubPulse = PILLARS.reduce((a, p) => a + Math.max(0, 1 - Math.abs(t - p.t - 0.45) / 0.25), 0);
  // hub sobe para virar o nó "Sua empresa"
  const hx = HUB.x, hy = mix(HUB.y, TOP.y, gather);
  return (
    <>
      <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
        {PILLARS.map((p, i) => {
          const e = edge(p, HUB, 120, 125);
          const d = P(f, p.t + 0.05, p.t + 0.45, EIO) * (1 - gather);
          const u = P(f, p.t + 0.1, p.t + 0.5, (x) => x);
          return (
            <g key={i}>
              <line {...e} stroke="rgba(120,180,255,0.55)" strokeWidth="5" strokeDasharray="1" pathLength="1" strokeDashoffset={1 - d} />
              {u > 0 && u < 1 && <circle cx={mix(e.x1, e.x2, u)} cy={mix(e.y1, e.y2, u)} r="10" fill="#fff" style={{filter: "drop-shadow(0 0 10px #7fb6ff)"}} />}
            </g>
          );
        })}
      </svg>
      <div style={{opacity: 1 - P(f, 16.95, 17.25)}}>
        <Meter x={hx} y={hy} R={mix(96, 70, gather)} sw={30} share={0.25} gap={0.02} goldCol={0} pBlue={P(f, 13.15, 13.6)} pGold={P(f, 13.3, 13.7)} opacity={cl(hubIn * 1.4)} glow={0.6 + hubPulse * 0.8} idSuffix="hub" />
      </div>
      <div style={{position: "absolute", left: hx, top: hy, width: 120, height: 120, transform: "translate(-50%,-50%)", borderRadius: 60, background: `radial-gradient(circle, rgba(140,200,255,${0.35 + hubPulse * 0.5}), transparent 70%)`}} />
      {PILLARS.map((p, i) => {
        const on = P(f, p.t - 0.05, p.t + 0.3);
        const pop = 1 + Math.max(0, Math.sin(cl((t - p.t) / 0.35) * Math.PI)) * 0.1;
        const x = mix(p.x, hx, gather), y = mix(p.y, hy, gather);
        return (
          <React.Fragment key={i}>
            <div style={{position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${pop * mix(1, 0.3, gather)})`, opacity: mix(0.4, 1, on) * (1 - gather)}}>
              <Tile s={190} glow={on}><p.Icon s={104} /></Tile>
            </div>
            <div style={{position: "absolute", left: p.x - 250, width: 500, top: p.y + 120, textAlign: "center", opacity: 1 - gather}}>
              {p.label.map((l, j) => (
                <div key={j} style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: "#fff", lineHeight: 1.12, letterSpacing: "-0.01em"}}>
                  <Word f={f} t={j ? 14.78 : p.t}>{l}</Word>
                </div>
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

// S8: estrutura mais eficiente
const TOP = {x: 540, y: 860};
const KIDS = [
  {x: 220, Icon: IcList, label: "Atividades", mess: [-40, 60, -9]},
  {x: 540, Icon: IcPercentDoc, label: "Regime", mess: [30, -40, 7]},
  {x: 860, Icon: IcFlow, label: "Operação", mess: [50, 90, -6]},
];
const KY = 1250;
const S8 = ({f}) => {
  const t = t_(f);
  const out = P(f, 19.95, 20.5, EIO); // encolhe para dentro do escudo
  const gone = P(f, 21.42, 21.75, EI);
  const topIn = P(f, 16.95, 17.4, EO);
  const snap = SP(f, 18.2, {k: 13, z: 0.38});
  const lit = P(f, 19.2, 19.6);
  const cy = 1100;
  const sx = mix(1, 0.46, out) * (1 + gone * 0.6);
  const ty = mix(0, 950 - cy, out);
  return (
    <>
      <div style={{opacity: 1 - P(f, 19.85, 20.15), transform: `translateY(${-P(f, 19.85, 20.2) * 40}px)`}}>
        <Line y={430} size={80}><Word f={f} t={17.3}>Uma</Word> <Word f={f} t={17.48}>estrutura</Word></Line>
        <Line y={530} size={96} style={{fontWeight: 900}}><Word f={f} t={17.92}>mais</Word> <Word f={f} t={18.26} style={blueTxt}>eficiente</Word></Line>
      </div>
      <div style={{position: "absolute", inset: 0, transform: `translateY(${ty}px) scale(${sx})`, transformOrigin: `540px ${cy}px`, opacity: 1 - gone, filter: gone ? `blur(${gone * 14}px)` : undefined}}>
        <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
          {KIDS.map((k, i) => {
            const pin = P(f, 17.15 + i * 0.12, 17.6 + i * 0.12);
            const kx = k.x + k.mess[0] * (1 - snap), ky = KY + k.mess[1] * (1 - snap);
            const midY = mix(TOP.y + 130, 1100, 1);
            const curve = 1 - snap;
            const d = `M${TOP.x} ${TOP.y + 80} C ${TOP.x} ${midY + curve * 60}, ${kx + curve * 80} ${midY - curve * 40}, ${kx} ${ky - 85}`;
            const dClean = `M${TOP.x} ${TOP.y + 80} V 1100 H ${kx} V ${ky - 85}`;
            return (
              <g key={i} opacity={pin}>
                <path d={snap > 0.97 ? dClean : d} stroke={`rgba(130,185,255,${0.45 + 0.4 * snap})`} strokeWidth="5" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - pin} />
              </g>
            );
          })}
        </svg>
        <div style={{position: "absolute", left: TOP.x, top: TOP.y, transform: `translate(-50%,-50%) scale(${mix(0.6, 1, topIn)})`, opacity: topIn}}>
          <Glass w={560} h={160} r={40} glow={lit * 0.9} style={{boxShadow: lit ? undefined : undefined}}>
            <div style={{position: "absolute", left: 24, top: 20}}><Tile s={120} glow={lit}><IcBuilding s={68} /></Tile></div>
            <div style={{position: "absolute", left: 172, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff"}}>
              <span style={{opacity: mix(0.55, 1, lit), textShadow: `0 0 ${24 * lit}px rgba(140,200,255,0.9)`}}>Sua empresa</span>
            </div>
          </Glass>
        </div>
        {KIDS.map((k, i) => {
          const pin = SP(f, 17.25 + i * 0.12, {k: 11, z: 0.5});
          const kx = k.x + k.mess[0] * (1 - snap), ky = KY + k.mess[1] * (1 - snap);
          const sweep = P(f, 18.3 + i * 0.06, 18.8 + i * 0.06, EIO);
          return (
            <div key={i} style={{position: "absolute", left: kx, top: ky, transform: `translate(-50%,-50%) rotate(${k.mess[2] * (1 - snap)}deg) scale(${cl(pin, 0, 1.2)})`, opacity: cl(pin * 2)}}>
              <Glass w={290} h={170} r={34} glow={snap * (1 - sweep) * 0.6}>
                <div style={{position: "absolute", left: 0, right: 0, top: 18, display: "flex", justifyContent: "center"}}><Tile s={78}><k.Icon s={46} /></Tile></div>
                <div style={{position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 36, color: "#fff"}}>{k.label}</div>
                <div style={{position: "absolute", top: 0, bottom: 0, width: 120, left: `${mix(-50, 130, sweep)}%`, background: "linear-gradient(90deg, transparent, rgba(190,220,255,0.35), transparent)"}} />
              </Glass>
            </div>
          );
        })}
      </div>
    </>
  );
};

// S9: sempre dentro da lei
const S9 = ({f}) => {
  const t = t_(f);
  const draw = P(f, 19.98, 20.6, EIO);
  const out = P(f, 21.42, 21.75, EI);
  const badge = SP(f, 21.0, {k: 14, z: 0.45});
  return (
    <div style={{opacity: 1 - out, transform: `scale(${1 + out * 0.6})`, transformOrigin: "540px 1000px", filter: out ? `blur(${out * 14}px)` : undefined}}>
      <div style={{position: "absolute", left: 540, top: 990, transform: `translate(-50%,-50%) scale(${mix(1.25, 1, draw)})`, opacity: cl(draw * 3)}}>
        <Shield w={600} p={draw} fill={P(f, 20.3, 20.8)} />
      </div>
      <div style={{position: "absolute", left: 540, top: 1300, transform: `translate(-50%,-50%) scale(${cl(badge, 0, 1.3)})`}}>
        <div style={{width: 150, height: 150, borderRadius: 75, background: "linear-gradient(150deg,#ffffff,#c9d2df 55%,#8f9bb0)", boxShadow: "0 16px 40px rgba(0,8,40,0.6), inset 0 -4px 10px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div style={{width: 124, height: 124, borderRadius: 62, background: "linear-gradient(150deg,#4f9bff,#1a6cff 45%,#0a3fc4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.5)"}}>
            <Check s={96} p={P(f, 21.05, 21.35, EIO)} sw={12} />
          </div>
        </div>
      </div>
      <Line y={1500} size={78}><Word f={f} t={20.0}>Sempre</Word> <Word f={f} t={20.36}>dentro</Word></Line>
      <Line y={1600} size={96} style={{fontWeight: 900}}><Word f={f} t={20.76}>da</Word> <Word f={f} t={21.0} style={blueTxt}>lei.</Word></Line>
    </div>
  );
};

// S10/S11: abrir empresa -> CNPJ -> marca
const S10 = ({f}) => {
  const t = t_(f);
  const draw = P(f, 21.55, 22.5, (u) => u);
  const door = P(f, 22.95, 23.5, EIO);
  const push = P(f, 24.3, 24.75, EI); // câmera entra pela porta
  const q = P(f, 22.7, 22.95, EI);
  const ans = P(f, 24.25, 24.5, EI);
  const ck = SP(f, 23.72, {k: 14, z: 0.45});
  const sx = mix(1, 9, push);
  const doorC = {x: 540 + ((134 - 100) / 200) * 560, y: 830 - 252 + (137 / 180) * 504};
  return (
    <>
      <div style={{position: "absolute", inset: 0, transform: `scale(${sx})`, transformOrigin: `${doorC.x}px ${doorC.y}px`, opacity: 1 - P(f, 24.6, 24.8)}}>
        <div style={{position: "absolute", left: 540, top: 830, transform: `translate(-50%,-50%) scale(${mix(0.9, 1, P(f, 21.55, 22.4))})`}}>
          <Storefront w={560} p={draw} door={door} light={door} />
        </div>
        <div style={{position: "absolute", left: 790, top: 600, transform: `translate(-50%,-50%) scale(${cl(ck, 0, 1.3)})`}}>
          <div style={{width: 120, height: 120, borderRadius: 60, background: "linear-gradient(150deg,#4f9bff,#1a6cff 45%,#0a3fc4)", boxShadow: "0 0 0 6px rgba(255,255,255,0.9), 0 14px 30px rgba(0,8,40,0.55)", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Check s={92} p={P(f, 23.75, 24.0, EIO)} sw={12} />
          </div>
        </div>
      </div>
      <div style={{opacity: 1 - q, transform: `translateY(${-q * 50}px)`}}>
        <Line y={1260} size={84}><Word f={f} t={21.58}>Vai</Word> <Word f={f} t={21.68}>abrir</Word></Line>
        <Line y={1360} size={96} style={{fontWeight: 900}}><Word f={f} t={21.94}>sua</Word> <Word f={f} t={22.12}>empresa?</Word></Line>
      </div>
      <div style={{opacity: 1 - ans, transform: `translateY(${-ans * 50}px)`}}>
        <Line y={1260} size={76} style={{fontWeight: 700, color: COL.silver}}><Word f={f} t={22.88}>Comece</Word> <Word f={f} t={23.32}>do</Word></Line>
        <div style={{position: "absolute", left: 0, width: 1080, top: 1380, transform: "translateY(-50%)", textAlign: "center"}}>
          <span style={{position: "relative", display: "inline-block", padding: "8px 36px 18px"}}>
            <span style={{position: "absolute", inset: 0, borderRadius: 30, background: "linear-gradient(150deg,#4f9bff,#1a6cff 45%,#0a3fc4)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.45), 0 18px 40px rgba(0,10,60,0.5)", transform: `scaleX(${P(f, 23.45, 23.85, EO)})`, transformOrigin: "left"}} />
            <span style={{position: "relative", ...T.white, fontSize: 104, fontWeight: 900}}><Word f={f} t={23.48}>jeito</Word> <Word f={f} t={23.72}>certo.</Word></span>
          </span>
        </div>
      </div>
    </>
  );
};

const S11 = ({f}) => {
  const t = t_(f);
  const cin = P(f, 24.55, 25.1, EO);
  const stamp = P(f, 25.0, 25.22, EI);
  const shake = t > 25.2 && t < 25.5 ? Math.sin((t - 25.2) * 90) * 10 * (1 - (t - 25.2) / 0.3) : 0;
  const away = P(f, 25.85, 26.3, EIO);
  const lift = P(f, 25.85, 26.35, EIO);
  // "CNPJ" sai do cartão e sobe para o título
  const cx = 540, cy = mix(960, 680, lift), cs = mix(1, 0.72, lift);
  return (
    <>
      <div style={{opacity: 1 - P(f, 25.85, 26.1)}}>
        <Line y={560} size={84}><Word f={f} t={24.6}>Abra</Word> <Word f={f} t={24.86}>seu</Word></Line>
      </div>
      <div style={{position: "absolute", left: 540, top: 1000, transform: `translate(-50%,-50%) translate(${shake}px, ${away * 160}px) scale(${mix(0.75, 1, cin) * mix(1, 0.9, away)})`, opacity: cl(cin * 2) * (1 - away), filter: cin < 1 ? `blur(${(1 - cin) * 16}px)` : undefined}}>
        <Glass w={860} h={520} r={44} glow={Math.max(0, 1 - Math.abs(t - 25.25) / 0.4)}>
          <div style={{position: "absolute", left: 50, top: 46}}><Tile s={96}><IcBuilding s={56} /></Tile></div>
          <div style={{position: "absolute", left: 50, right: 50, bottom: 60}}>
            {[0.92, 0.7, 0.8].map((w, j) => (
              <div key={j} style={{height: 18, borderRadius: 9, width: `${w * 100 * P(f, 24.8 + j * 0.1, 25.3 + j * 0.1)}%`, background: "rgba(200,220,255,0.28)", marginTop: 22}} />
            ))}
          </div>
        </Glass>
      </div>
      {t >= 24.9 && (
        <div style={{position: "absolute", left: cx, top: cy, transform: `translate(-50%,-50%) translateX(${shake * (1 - lift)}px) scale(${mix(1.6, 1, stamp) * cs})`, opacity: stamp, ...T.white, fontSize: 170, fontWeight: 900, letterSpacing: "-0.03em"}}>
          CNPJ
        </div>
      )}
      <div style={{opacity: P(f, 25.75, 26.1), transform: `translateY(${(1 - P(f, 25.75, 26.2)) * 30}px)`}}>
        <Line y={560} size={64} style={{fontWeight: 700, color: COL.silver}}>Abra seu</Line>
        <Line y={812} size={56} style={{fontWeight: 600, color: COL.silver}}><Word f={f} t={25.8}>com</Word> <Word f={f} t={26.12}>a</Word></Line>
      </div>
    </>
  );
};

const Ripples = ({f, t0, x, y}) => {
  const t = t_(f) - t0;
  if (t < 0) return null;
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
      {[0, 1, 2].map((i) => {
        const u = cl((t - i * 0.2) / 1.6);
        if (u <= 0 || u >= 1) return null;
        return <circle key={i} cx={x} cy={y} r={mix(250, 900, EO(u))} fill="none" stroke="#9cc8ff" strokeWidth={mix(6, 1, u)} opacity={(1 - u) * 0.55} />;
      })}
    </svg>
  );
};

const EndCard = ({f}) => (
  <>
    <div style={{position: "absolute", left: 540, top: 1040, width: 1400, height: 760, transform: "translate(-50%,-50%)", background: `radial-gradient(closest-side, rgba(40,110,255,${0.5 * P(f, 26.2, 26.9)}), transparent)`}} />
    <Ripples f={f} t0={26.4} x={540} y={1040} />
  </>
);

// ---------------- câmera ----------------
const CAM = [
  [0, 2.25, 1.07, 1.0],
  [2.25, 4.45, 1.0, 1.025],
  [4.45, 7.4, 1.03, 1.0],
  [7.4, 8.8, 1.0, 1.0],
  [8.8, 13.0, 1.0, 1.03],
  [13.0, 16.9, 1.03, 1.0],
  [16.9, 20.0, 1.0, 1.03],
  [20.0, 21.5, 1.03, 1.0],
  [21.5, 24.4, 1.0, 1.025],
  [24.4, 26.2, 1.025, 1.0],
  [26.2, 30, 1.04, 1.0],
];
const camScale = (f) => {
  const t = t_(f);
  const s = CAM.find((c) => t >= c[0] && t < c[1]) || CAM[CAM.length - 1];
  return mix(s[2], s[3], EIO(cl((t - s[0]) / (s[1] - s[0]))));
};

export const Ad = () => {
  const f = useCurrentFrame();
  const t = t_(f);
  const ms = meterState(f);
  const cs = camScale(f);
  const coinsOn = t < 8.0;
  return (
    <AbsoluteFill style={{background: COL.ink, fontFamily: FONT, overflow: "hidden"}}>
      <Background f={f} />
      {coinsOn && !NO3D && <Coins3D coins={FAR} blur={7} opacity={0.9} />}
      <AbsoluteFill style={{transform: `scale(${cs})`}}>
        {t < 8.45 && <Meter {...ms} idSuffix="main" />}
        {vis(f, 0, 4.8) && <S1 f={f} />}
        {vis(f, 2.2, 5.0) && <S2 f={f} />}
        {vis(f, 4.8, 7.7) && <S34 f={f} />}
        {vis(f, 8.7, 13.45) && <S6 f={f} />}
        {vis(f, 13.0, 17.5) && <S7 f={f} />}
        {vis(f, 19.9, 21.8) && <S9 f={f} />}
        {vis(f, 16.9, 21.8) && <S8 f={f} />}
        {vis(f, 21.5, 24.85) && <S10 f={f} />}
        {t >= 26.1 && <EndCard f={f} />}
        {vis(f, 24.5, 30.1) && <S11 f={f} />}
      </AbsoluteFill>
      {coinsOn && !NO3D && <Coins3D coins={NEAR} />}
      <Brand f={f} />
      {WITH_AUDIO && <Audio src={staticFile("mix.wav")} />}
    </AbsoluteFill>
  );
};

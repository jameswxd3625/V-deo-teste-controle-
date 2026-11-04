import React from "react";
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from "remotion";
import {FPS, K, FONT, clamp, mix, E, r, kf, arc, samplePath} from "./lib";

/* =====================================================================
   CONTTROLE — "Pressão → Estrutura"
   Motivo central: o anel segmentado (o "O" da logo) + a trajetória ascendente da seta.
   Mapa (s):  0–2.3 12% | 2.3–7.9 piso de meses (acúmulo) | 7.9–13.1 reorganização + 3 camadas
              13.2–16.9 grade/estrutura | 17–19.9 anel + seta | 20–21.4 limite (lei)
              21.6–24.4 pergunta / começo | 24.6–26 CNPJ | 26–29.6 logo
   ===================================================================== */

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const SP = 560; // espaçamento do piso

// ---------------------------------------------------------------- texto
const Txt = ({t, at, out, y, x = 0, size, w = 800, color = K.white, align = "center", ls = 0, dur = 0.5, outDur = 0.28, grad, style, children}) => {
  if (t < at - 0.001) return null;
  if (out != null && t > out + outDur + 0.02) return null;
  const pin = r(t, at, at + dur, E.out);
  const pout = out != null ? r(t, out, out + outDur, E.in) : 0;
  const ty = (1 - pin) * 108 - pout * 108;
  const ink = grad
    ? {background: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent"}
    : {color};
  return (
    <div style={{position: "absolute", top: y, left: 0, width: 1080, display: "flex", justifyContent: align === "center" ? "center" : "flex-start", paddingLeft: align === "left" ? x : 0}}>
      <div style={{overflow: "hidden", padding: "0.16em 0.06em 0.08em"}}>
        <div style={{transform: `translateY(${ty}%)`, fontFamily: FONT, fontWeight: w, fontSize: size, lineHeight: 1, letterSpacing: ls, whiteSpace: "nowrap", ...ink, ...style}}>{children}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- fundo
const Bg = ({t}) => {
  const gy = kf(t, [[0, 820], [2.3, 820], [2.9, 560], [7.9, 560], [8.6, 1180], [16.8, 1150], [21.5, 1150], [22.2, 1320], [25.6, 1320]]);
  const gx = kf(t, [[21.5, 540], [22.2, 330], [25.6, 330], [26.2, 540]]);
  const gi = kf(t, [[0, 0.35], [0.15, 1], [6.3, 1], [6.9, 0.45], [7.85, 0.4], [8.0, 1.25], [8.7, 1], [25.8, 1], [26.4, 0]]);
  const li = kf(t, [[25.8, 0], [26.3, 1]]); // luz que corresponde ao fundo da logo
  const grid = kf(t, [[0, 0], [0.4, 1], [25.6, 1], [26.4, 0]]);
  return (
    <AbsoluteFill style={{background: K.bg}}>
      <AbsoluteFill style={{opacity: gi, background: `radial-gradient(ellipse 760px 700px at ${gx}px ${gy}px, rgba(6,40,118,0.95) 0%, rgba(1,18,64,0.7) 42%, rgba(0,8,31,0) 100%)`}} />
      <AbsoluteFill style={{opacity: li, background: `radial-gradient(ellipse 520px 420px at 540px 960px, #011038 0%, #00081F 100%)`}} />
      <svg width="1080" height="1920" style={{position: "absolute", inset: 0, opacity: grid * 0.07}}>
        {Array.from({length: 19}, (_, i) => <line key={"v" + i} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke="#5B8CFF" strokeWidth={1} />)}
        {Array.from({length: 33}, (_, i) => <line key={"h" + i} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke="#5B8CFF" strokeWidth={1} />)}
      </svg>
      <AbsoluteFill style={{background: "radial-gradient(ellipse 120% 90% at 50% 50%, transparent 60%, rgba(0,4,16,0.55) 100%)"}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- anel (motivo da marca)
const RingSVG = ({R, sw, arcA, trackA = 0.16, arcAlpha = 1, glow = 0, id}) => {
  const s = Math.ceil(2 * R + sw + 60);
  const h = s / 2;
  return (
    <svg width={s} height={s} viewBox={`${-h} ${-h} ${s} ${s}`} style={{position: "absolute", left: -h, top: -h, overflow: "visible"}}>
      <defs>
        <linearGradient id={"g" + id} x1="0" y1="-1" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor={K.blue} />
          <stop offset="1" stopColor={K.sky} />
        </linearGradient>
      </defs>
      <circle r={R} fill="none" stroke={K.silver} strokeOpacity={trackA} strokeWidth={sw} />
      {arcA > 0.05 && arcAlpha > 0.01 && (
        <>
          {glow > 0 && <path d={arc(0, 0, R, 0, arcA)} fill="none" stroke={K.sky} strokeWidth={sw * 1.6} strokeOpacity={0.18 * glow * arcAlpha} />}
          <path d={arc(0, 0, R, 0, arcA)} fill="none" stroke={`url(#g${id})`} strokeWidth={sw} opacity={arcAlpha} />
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- piso de meses -> pontos -> camadas -> grade
const ELEMS = Array.from({length: 49}, (_, i) => {
  const row = Math.floor(i / 3);
  const col = (i % 3) - 1;
  const order = i === 0 ? 1 : i;
  const appear = i === 1 ? 0 : i === 48 ? 8.3 : 2.72 + 1.8 * Math.pow((order - 1) / 46, 0.55);
  const cell = (i * 19) % 49;
  return {i, row, col, appear, label: MONTHS[(i - 1 + 12) % 12], fx: col * SP, fy: -row * SP, gx: ((cell % 7) - 3) * 80, gy: (Math.floor(cell / 7) - 3) * 80, gc: cell};
});
const DOTS = Array.from({length: 49}, (_, c) => ({x: ((c % 7) - 3) * 80, y: (Math.floor(c / 7) - 3) * 80, cx: c % 7, cy: Math.floor(c / 7)}));
// trajeto da "IA": escada ascendente (direção da seta da marca)
const STAIR = [[-240, 240], [-160, 240], [-160, 80], [0, 80], [0, -80], [160, -80], [160, -240], [240, -240]];
const STAIR_PATH = samplePath(STAIR.slice(1).map((p, i) => [STAIR[i], [(STAIR[i][0] + p[0]) / 2, (STAIR[i][1] + p[1]) / 2], p]), 30);
// células sob a escada (estrutura)
const CELLS = [];
for (let cx = 0; cx < 6; cx++) for (let cy = 0; cy < 6; cy++) {
  const x0 = -240 + cx * 80;
  const y0 = -240 + cy * 80;
  const stepTop = x0 < -160 ? 240 : x0 < 0 ? 80 : x0 < 160 ? -80 : -240;
  if (y0 >= stepTop) CELLS.push({x0, y0, k: cx * 0.07 + (5 - cy) * 0.035});
}

const LAYER_AT = [9.54, 10.52, 11.86];

const Layer = ({t, idx, z, alpha, structure}) => {
  const at = LAYER_AT[idx];
  const scan = r(t, at, at + 0.85, E.inOut);
  const scanning = t >= at && t <= at + 0.95;
  const done = t >= at;
  const latest = done && (idx === 2 || t < LAYER_AT[idx + 1]);
  const bx = mix(-300, 300, scan);
  const edge = done ? (latest ? 0.95 : 0.45) : 0.16;
  // estrutura (S4)
  const gl = r(t, 13.32, 14.3, E.inOut);
  const ai = r(t, 14.32, 15.4, E.inOut);
  const st = STAIR_PATH.upTo(ai);
  return (
    <div style={{position: "absolute", left: -320, top: -320, width: 640, height: 640, transform: `translateZ(${z}px)`, opacity: alpha}}>
      <svg width="640" height="640" viewBox="-320 -320 640 640" style={{overflow: "visible"}}>
        <rect x={-290} y={-290} width={580} height={580} fill={K.blue} fillOpacity={done ? (latest ? 0.13 : 0.07) : 0.035} stroke={latest ? K.sky : K.silver} strokeOpacity={edge} strokeWidth={3} />
        {structure &&
          CELLS.map((c, i) => {
            const p = r(t, 15.66 + c.k, 15.66 + c.k + 0.35, E.out);
            return p > 0 ? <rect key={i} x={c.x0 + 6} y={c.y0 + 6 + (1 - p) * 30} width={68} height={68 * p} fill={K.blue} fillOpacity={0.42} /> : null;
          })}
        {structure && gl > 0 &&
          [-240, -160, -80, 0, 80, 160, 240].map((v, i) => (
            <g key={i} stroke={K.sky} strokeOpacity={0.5} strokeWidth={2}>
              <line x1={-240} y1={v} x2={mix(-240, 240, clamp(gl * 1.4 - i * 0.06))} y2={v} />
              <line x1={v} y1={240} x2={v} y2={mix(240, -240, clamp(gl * 1.4 - i * 0.06))} />
            </g>
          ))}
        {DOTS.map((d, i) => {
          const lit = done && (!scanning || d.x < bx);
          const onStair = structure && ai > 0 && STAIR.some((s) => s[0] === d.x && s[1] === d.y) && st.head && (d.x <= st.head[0] + 1 && d.y >= st.head[1] - 1);
          return <circle key={i} cx={d.x} cy={d.y} r={onStair ? 12 : 7} fill={onStair ? K.white : lit ? (latest ? K.light : K.sky) : K.silver} fillOpacity={lit || onStair ? 1 : 0.45} />;
        })}
        {structure && ai > 0 && (
          <>
            <path d={st.d} fill="none" stroke={K.sky} strokeWidth={22} strokeOpacity={0.22} strokeLinejoin="round" />
            <path d={st.d} fill="none" stroke={K.white} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={st.head[0]} cy={st.head[1]} r={13} fill={K.white} />
          </>
        )}
        {scanning && (
          <g>
            <rect x={bx - 40} y={-300} width={40} height={600} fill={K.sky} fillOpacity={0.16} />
            <line x1={bx} y1={-300} x2={bx} y2={300} stroke={K.white} strokeWidth={5} />
          </g>
        )}
      </svg>
    </div>
  );
};

const Plane = ({t}) => {
  if (t > 17.5) return null;
  // câmera / plano
  const tilt = kf(t, [[2.05, 0], [2.85, 72], [7.92, 72], [8.85, 55], [13.6, 55], [16.7, 0]]);
  const spin = kf(t, [[7.92, 0], [8.85, -45], [9.6, -45], [13.0, -37], [13.6, -37], [16.7, 0], [16.85, 0], [17.45, 80]], E.inOut);
  const oy = kf(t, [[2.05, 820], [2.85, 1350], [7.92, 1350], [8.85, 1180], [13.6, 1180], [16.7, 1150]]);
  const sc = kf(t, [[13.6, 1], [16.7, 1.5], [16.85, 1.5], [17.45, 0.15]], E.inOut);
  const fade = (1 - r(t, 17.05, 17.45, E.in)) * kf(t, [[6.3, 1], [6.8, 0.3], [7.86, 0.3], [8.15, 1]]);
  const dolly = kf(t, [[2.8, 0], [6.75, SP * 2]], E.inOut);
  const phaseLayers = t >= 8.9;
  const zOff = kf(t, [[9.0, 0], [9.6, 190], [13.2, 190], [13.7, 0]]);
  const anticip = kf(t, [[7.6, 1], [7.9, 0.97], [8.1, 1]], E.inOut);
  return (
    <AbsoluteFill style={{perspective: "1500px", perspectiveOrigin: "540px 300px", opacity: fade, transform: `scale(${anticip})`}}>
      <div style={{position: "absolute", left: 540, top: oy, width: 0, height: 0, transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg) rotateZ(${spin}deg) scale(${sc})`}}>
        {!phaseLayers &&
          ELEMS.map((el) => {
            if (t < el.appear) return null;
            const delay = Math.min(0.32, el.row * 0.022) + (el.i % 3) * 0.03;
            const m = r(t, 7.9 + delay, 8.7 + delay, E.soft);
            const ap = r(t, el.appear, el.appear + 0.4, E.out);
            const arcP = el.i === 1 ? r(t, 0.15, 0.85, E.inOut) : r(t, el.appear + 0.08, el.appear + 0.55, E.inOut);
            let R = 210, sw = 40;
            if (el.i === 1) {
              const h = r(t, 2.05, 2.85, E.inOut);
              R = mix(380, 210, h);
              sw = mix(58, 40, h);
            }
            R = mix(R, 3.5, m);
            sw = mix(sw, 7, m);
            const x = mix(el.fx, el.gx, m);
            const y = mix(el.fy + dolly, el.gy, m);
            const dist = el.row * SP - dolly;
            const fog = mix(clamp(1.1 - dist / 6200), 1, m);
            const s0 = el.i === 1 ? kf(t, [[0, 0.82], [0.5, 1]], E.out) : mix(0.55, 1, ap);
            const born = el.i === 48 ? r(t, 8.3, 8.7) : 1;
            const trackA = mix(el.i === 1 ? 0.16 : 0.24, 0.45, m);
            return (
              <div key={el.i} style={{position: "absolute", left: x, top: y, width: 0, height: 0, opacity: (el.i === 1 ? 1 : ap) * fog * born, transform: `scale(${s0})`}}>
                <RingSVG R={R} sw={sw} arcA={43.2 * arcP} trackA={trackA} arcAlpha={1 - r(t, 7.92 + delay, 8.2 + delay, E.lin)} glow={el.i === 1 ? 1 - r(t, 2.0, 2.6) : 0} id={el.i} />
                {el.i !== 1 || t > 2.6 ? (
                  <div style={{position: "absolute", left: -120, top: R + sw / 2 + 26, width: 240, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 46, letterSpacing: 10, color: K.silver, opacity: 0.7 * (1 - m) * (el.i === 1 ? r(t, 2.6, 3.0) : 1)}}>{el.label}</div>
                ) : null}
              </div>
            );
          })}
        {phaseLayers && (
          <>
            {t < 13.75 && <Layer t={t} idx={0} z={zOff} alpha={r(t, 9.0, 9.35)} />}
            <Layer t={t} idx={1} z={0} alpha={1} structure={t > 13.3} />
            {t < 13.75 && <Layer t={t} idx={2} z={-zOff} alpha={r(t, 9.0, 9.35)} />}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- "12%"
const Twelve = ({t}) => {
  if (t > 2.4) return null;
  const slam = kf(t, [[0, 2.3], [0.42, 1]], E.out);
  const settle = kf(t, [[0.42, 1], [2.0, 1.04]], E.soft);
  const exit = r(t, 1.98, 2.36, E.in);
  return (
    <div style={{position: "absolute", left: 0, top: 820 - 165, width: 1080, height: 330, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${slam * settle * mix(1, 0.55, exit)}) translateY(${exit * 60}px)`, opacity: 1 - exit}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 300, lineHeight: 1, letterSpacing: -6, color: K.white, textShadow: "0 18px 50px rgba(0,8,31,0.8)"}}>
        12<span style={{color: K.sky, fontSize: 210, verticalAlign: "8%"}}>%</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- varredura de luz (virada)
const SWEEP = samplePath([[[-80, 1700], [300, 1380], [660, 1060], [1160, 380]]], 160);
const Sweep = ({t}) => {
  if (t < 7.84 || t > 8.55) return null;
  const hd = r(t, 7.84, 8.1, E.soft);
  const tl = r(t, 7.95, 8.5, E.in);
  const s = SWEEP.between(tl, hd);
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
      <path d={s.d} fill="none" stroke={K.sky} strokeWidth={70} strokeOpacity={0.15} strokeLinecap="round" />
      <path d={s.d} fill="none" stroke={K.sky} strokeWidth={22} strokeLinecap="round" />
      <path d={s.d} fill="none" stroke={K.white} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};

// ---------------------------------------------------------------- anel estruturado + seta (S5/S6)
const SEG = 10;
const ARROW = samplePath([[[250, 1470], [520, 1510], [800, 1340], [918, 880]]], 160);
const Structure = ({t}) => {
  if (t < 16.85 || t > 21.66) return null;
  const cx = 540, cy = 1150, R = 300, sw = 70;
  const spin = kf(t, [[16.9, -70], [17.9, 0]], E.out);
  const pull = kf(t, [[19.85, 1], [20.6, 0.8]], E.inOut);
  const cut = r(t, 21.42, 21.64, E.in);
  const ap = r(t, 17.92, 18.7, E.inOut);
  const a = ARROW.upTo(ap);
  const headS = r(t, 18.55, 18.85, E.back);
  const breathe = 1 + 0.012 * Math.sin((t - 18.8) * 2.2) * r(t, 18.8, 19.4);
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0, overflow: "visible"}}>
      <defs>
        <linearGradient id="silv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9E9E7" />
          <stop offset="1" stopColor="#9C9DA3" />
        </linearGradient>
        <linearGradient id="arw" x1="250" y1="1470" x2="918" y2="880" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={K.blue} stopOpacity="0.2" />
          <stop offset="0.35" stopColor={K.blue} />
          <stop offset="1" stopColor={K.sky} />
        </linearGradient>
      </defs>
      <g transform={`translate(${cx} ${cy}) scale(${pull * mix(1, 0.02, cut) * breathe}) translate(${-cx} ${-cy})`} opacity={1 - cut}>
        <g transform={`rotate(${spin} ${cx} ${cy})`}>
          {Array.from({length: SEG}, (_, k) => {
            const p = r(t, 16.95 + k * 0.045, 17.6 + k * 0.045, E.out);
            const a0 = k * 36 + 2.5;
            const len = (36 - 5) * p;
            const blue = k < 2;
            const rr = mix(R * 0.4, R, p);
            return p > 0 ? <path key={k} d={arc(cx, cy, rr, a0, a0 + len)} fill="none" stroke={blue ? (k === 0 ? K.sky : K.blue) : "url(#silv)"} strokeWidth={sw} /> : null;
          })}
        </g>
        {ap > 0 && (
          <>
            <path d={a.d} fill="none" stroke={K.sky} strokeWidth={90} strokeOpacity={0.1} strokeLinecap="round" />
            <path d={a.d} fill="none" stroke="url(#arw)" strokeWidth={38} strokeLinecap="round" />
            {headS > 0 && (
              <g transform={`translate(${a.head[0]} ${a.head[1]}) rotate(${(a.ang * 180) / Math.PI}) scale(${headS})`}>
                <polygon points="54,0 -26,-52 -10,0 -26,52" fill={K.sky} />
              </g>
            )}
          </>
        )}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- moldura (limite / lei)
const Frame = ({t}) => {
  if (t < 19.95 || t > 26.1) return null;
  const d = r(t, 20.0, 20.7, E.inOut);
  const open = r(t, 21.44, 21.7, E.out);
  const x0 = mix(185, 70, open), x1 = mix(895, 1010, open), y0 = mix(800, 170, open), y1 = mix(1505, 1750, open);
  const a = (1 - open * 0.78) * (1 - r(t, 25.4, 26.0, E.lin));
  const L = (ax, ay, bx, by) => <line x1={ax} y1={ay} x2={mix(ax, bx, d)} y2={mix(ay, by, d)} />;
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
      <g stroke={K.white} strokeWidth={3} strokeOpacity={0.75 * a}>
        {L(x0, y0, x1, y0)}
        {L(x1, y0, x1, y1)}
        {L(x1, y1, x0, y1)}
        {L(x0, y1, x0, y0)}
      </g>
      <g fill={K.sky} opacity={a * d}>
        {[[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y], i) => <rect key={i} x={x - 7} y={y - 7} width={14} height={14} />)}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- trajetória que conduz à logo
// termina exatamente sobre o corpo da seta da logo (logo: x 60, y 787, escala 960/793)
const LS = 960 / 793;
const LX = 60, LY = 960 - (286 * LS) / 2;
const lp = (x, y) => [LX + x * LS, LY + y * LS];
const LEAD = samplePath([[[150, 1480], [400, 1150], [640, 1000], lp(588, 166)], [lp(588, 166), lp(692, 160), lp(740, 92)]], 200);
const Lead = ({t}) => {
  if (t < 22.85 || t > 27.1) return null;
  const p = 0.24 * r(t, 22.95, 24.3, E.out) + 0.1 * r(t, 24.3, 25.9, E.lin) + 0.66 * r(t, 25.95, 26.42, E.inOut);
  const s = LEAD.upTo(p);
  const dot = r(t, 22.88, 23.2, E.back);
  const ring = r(t, 22.9, 23.7, E.out);
  const fadeAll = 1 - r(t, 26.45, 27.05, E.inOut);
  const tailCut = r(t, 26.2, 26.75, E.inOut);
  const vis = tailCut > 0 ? LEAD.between(tailCut * 0.9, p) : s;
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}} opacity={fadeAll}>
      <circle cx={150} cy={1480} r={16 * dot} fill={K.white} opacity={1 - tailCut} />
      <circle cx={150} cy={1480} r={16 + 90 * ring} fill="none" stroke={K.sky} strokeWidth={3} opacity={(1 - ring) * 0.9} />
      {p > 0.002 && (
        <>
          <path d={vis.d} fill="none" stroke={K.sky} strokeWidth={46} strokeOpacity={0.12} strokeLinecap="round" />
          <path d={vis.d} fill="none" stroke={K.sky} strokeWidth={13} strokeLinecap="round" />
          <circle cx={s.head[0]} cy={s.head[1]} r={13} fill={K.white} />
          <circle cx={s.head[0]} cy={s.head[1]} r={34} fill={K.sky} opacity={0.25} />
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- logo
const Logo = ({t}) => {
  if (t < 25.95) return null;
  const rev = r(t, 26.02, 26.5, E.inOut);
  const a = mix(-14, 112, rev);
  const settle = kf(t, [[26.0, 1.035], [27.4, 1]], E.out);
  const w = 960, h = 286 * LS;
  const feather = "linear-gradient(90deg, transparent 0.6%, #000 4.3%, #000 96.4%, transparent 99.4%), linear-gradient(180deg, transparent 2%, #000 13%, #000 80%, transparent 95%)";
  const wipe = `linear-gradient(100deg, #000 ${a}%, transparent ${a + 12}%)`;
  const mask = {WebkitMaskImage: `${wipe}, ${feather}`, maskImage: `${wipe}, ${feather}`, WebkitMaskComposite: "source-in, source-in", maskComposite: "intersect"};
  const g = r(t, 27.6, 28.5, E.inOut);
  const gp = mix(-30, 130, g);
  return (
    <div style={{position: "absolute", left: LX, top: LY, width: w, height: h, transform: `scale(${settle})`}}>
      <Img src={staticFile("logo.png")} style={{position: "absolute", inset: 0, width: w, height: h, ...mask}} />
      {g > 0 && g < 1 && (
        <div style={{position: "absolute", inset: 0, ...mask}}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(100deg, transparent ${gp - 10}%, rgba(255,255,255,0.55) ${gp}%, transparent ${gp + 10}%)`,
              WebkitMaskImage: `url(${staticFile("logo.png")})`,
              maskImage: `url(${staticFile("logo.png")})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              maskMode: "luminance",
              mixBlendMode: "screen",
            }}
          />
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- tipografia por cena
const S3item = (t, at, nextAt) => (t >= at && (nextAt == null || t < nextAt) ? K.white : "rgba(202,202,200,0.5)");
const Words = ({t}) => {
  const L = 100; // margem esquerda das cenas estruturadas
  const blueGrad = `linear-gradient(180deg, ${K.light} 0%, ${K.sky} 55%, ${K.blue} 100%)`;
  return (
    <>
      {/* S1 */}
      <Txt t={t} at={0.84} out={1.98} y={1262} size={56} w={700} ls={18} color={K.silver}>DE IMPOSTO</Txt>
      {/* S2 */}
      <Txt t={t} at={2.26} out={3.3} y={230} size={60} w={600}>Imagine pagar esse valor</Txt>
      <Txt t={t} at={3.46} out={4.42} y={190} size={150} w={900} ls={-2}>TODOS OS</Txt>
      <Txt t={t} at={4.18} out={4.46} y={350} size={150} w={900} ls={-2} grad={blueGrad}>MESES</Txt>
      <Txt t={t} at={4.52} out={6.08} y={215} size={56} w={600} color={K.silver}>sobre o</Txt>
      <Txt t={t} at={4.9} out={6.12} y={290} size={124} w={800} ls={-2}>faturamento</Txt>
      <Txt t={t} at={5.38} out={6.16} y={445} size={56} w={600} color={K.silver}>da sua empresa</Txt>
      <Txt t={t} at={6.28} out={7.78} outDur={0.16} y={760} size={54} w={600} color={K.silver}>e achar que é</Txt>
      <Txt t={t} at={6.96} out={7.8} outDur={0.16} y={840} size={190} w={800} ls={-4}>normal.</Txt>
      {/* S3 */}
      <Txt t={t} at={7.95} out={13.0} y={190} x={L} align="left" size={96} w={800} ls={-1}>Na Conttrole,</Txt>
      <Txt t={t} at={8.8} out={13.04} y={310} x={L} align="left" size={62} w={600} color={K.sky}>analisamos</Txt>
      <Txt t={t} at={9.5} out={13.08} y={450} x={L} align="left" size={50} w={800} color={S3item(t, 9.5, 10.5)}><span style={{color: K.sky, fontWeight: 600, fontSize: 32, marginRight: 22}}>01</span>ATIVIDADES</Txt>
      <Txt t={t} at={10.5} out={13.12} y={530} x={L} align="left" size={50} w={800} color={S3item(t, 10.5, 11.84)}><span style={{color: K.sky, fontWeight: 600, fontSize: 32, marginRight: 22}}>02</span>REGIME TRIBUTÁRIO</Txt>
      <Txt t={t} at={11.84} out={13.16} y={610} x={L} align="left" size={50} w={800} color={S3item(t, 11.84)}><span style={{color: K.sky, fontWeight: 600, fontSize: 32, marginRight: 22}}>03</span>TODA A OPERAÇÃO</Txt>
      {/* S4 */}
      <Txt t={t} at={13.25} out={16.74} y={190} x={L} align="left" size={82} w={900} color={S3item(t, 13.25, 14.3)}>TECNOLOGIA</Txt>
      <Txt t={t} at={14.3} out={16.78} y={285} x={L} align="left" size={82} w={900} color={S3item(t, 14.3, 15.64)}>INTELIGÊNCIA</Txt>
      <Txt t={t} at={14.76} out={16.82} y={380} x={L} align="left" size={82} w={900} color={S3item(t, 14.3, 15.64)}>ARTIFICIAL</Txt>
      <Txt t={t} at={15.64} out={16.86} y={475} x={L} align="left" size={82} w={900} grad={blueGrad}>ANÁLISE</Txt>
      <Txt t={t} at={16.08} out={16.9} y={570} x={L} align="left" size={82} w={900} grad={blueGrad}>CONTÁBIL</Txt>
      {/* S5 */}
      <Txt t={t} at={16.96} out={19.84} y={215} size={62} w={700}>Buscamos uma estrutura</Txt>
      <Txt t={t} at={17.92} out={19.88} y={305} size={104} w={900} ls={-2} grad={blueGrad}>mais eficiente</Txt>
      <Txt t={t} at={18.82} out={19.92} y={450} size={52} w={600} color={K.silver}>para a sua empresa</Txt>
      {/* S6 */}
      <Txt t={t} at={20.0} out={21.38} outDur={0.2} y={250} size={64} w={600} color={K.silver}>sempre dentro</Txt>
      <Txt t={t} at={20.72} out={21.4} outDur={0.2} y={340} size={160} w={900} ls={-3}>da lei.</Txt>
      {/* S7 */}
      <Txt t={t} at={21.58} out={22.72} outDur={0.22} y={500} x={L} align="left" size={124} w={900} ls={-2}>VAI ABRIR</Txt>
      <Txt t={t} at={21.92} out={22.76} outDur={0.22} y={640} x={L} align="left" size={124} w={900} ls={-2}>SUA</Txt>
      <Txt t={t} at={22.1} out={22.8} outDur={0.22} y={780} x={L} align="left" size={124} w={900} ls={-2} grad={blueGrad}>EMPRESA?</Txt>
      <Txt t={t} at={22.88} out={24.36} outDur={0.22} y={560} x={L} align="left" size={150} w={900} ls={-3}>Comece</Txt>
      <Txt t={t} at={23.46} out={24.4} outDur={0.22} y={745} x={L} align="left" size={74} w={700} color={K.silver}>do jeito certo.</Txt>
    </>
  );
};

const Cnpj = ({t}) => {
  if (t < 24.55 || t > 26.08) return null;
  const pin = r(t, 25.0, 25.42, E.out);
  const out = r(t, 25.86, 26.06, E.in);
  const ant = kf(t, [[25.5, 1], [25.86, 0.965]], E.inOut);
  const sw = r(t, 25.25, 25.9, E.inOut);
  const sp = mix(-30, 130, sw);
  const fill = `linear-gradient(100deg, #fff ${sp - 14}%, ${K.light} ${sp}%, #fff ${sp + 14}%)`;
  return (
    <div style={{position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${-90 * out}px)`}}>
      <Txt t={t} at={24.6} y={560} size={64} w={600} color={K.silver}>Abra seu</Txt>
      {t >= 25.0 && (
        <div style={{position: "absolute", top: 640, left: 0, width: 1080, display: "flex", justifyContent: "center"}}>
          <div style={{overflow: "hidden", padding: "0.1em 0.04em 0.04em"}}>
            <div style={{transform: `translateY(${(1 - pin) * 100}%) scale(${mix(1.18, 1, pin) * ant})`}}>
              <span style={{display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 270, lineHeight: 1, letterSpacing: -6, backgroundImage: fill, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent"}}>CNPJ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// legibilidade sobre o piso
const Scrim = ({t}) => {
  const a = kf(t, [[2.2, 0], [2.8, 1], [16.6, 1], [17.0, 0]]);
  return <AbsoluteFill style={{opacity: a, background: "linear-gradient(180deg, rgba(0,8,31,0.92) 0%, rgba(0,8,31,0.75) 30%, rgba(0,8,31,0) 44%)"}} />;
};

export const Film = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
      <Bg t={t} />
      <Plane t={t} />
      <Scrim t={t} />
      <Twelve t={t} />
      <Sweep t={t} />
      <Structure t={t} />
      <Frame t={t} />
      <Lead t={t} />
      <Words t={t} />
      <Cnpj t={t} />
      <Logo t={t} />
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};

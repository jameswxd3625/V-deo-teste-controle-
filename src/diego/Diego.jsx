// DIEGO MUDANÇAS — filme vertical 1080x1920 sincronizado à locução (tempos em segundos absolutos)
import React from "react";
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from "remotion";
import {FPS, W, H, C, FONT, HAND, EO, EI, EIO, ip, kf, on, fit, El, Big, Sub, Hi, Bg, Bands, WaveWipe, Logo, Icon, Box3D, Print, PhotoCard, Chip, T_SUB} from "./kit";

export const DIEGO_DURATION = 62; // locução termina em 59,7 s; 2,3 s de leitura da marca

const M = 90; // margem lateral
const TW = W - 2 * M; // largura útil de texto
const S3D = {transformStyle: "preserve-3d"};
const swing = (t, a, b, k = 22) => Math.sin(Math.PI * Math.max(0, Math.min(1, (t - a) / (b - a)))) * k; // desfoque de deslocamento

// palavras sincronizadas: [texto, tempo, destaque?]
const Words = ({t, words, size = 56, weight = 700, color = "#fff", style}) => (
  <div style={{...T_SUB, fontSize: size, fontWeight: weight, color, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.26}px`, ...style}}>
    {words.map(([w, ts, hi], i) => {
      const p = ip(t, ts - 0.06, ts + 0.32);
      return (
        <span key={i} style={{display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 28}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined, color: hi ? C.cyan : undefined, textShadow: hi ? "0 0 26px rgba(34,199,245,0.7)" : undefined}}>{w}</span>
      );
    })}
  </div>
);
// linha que entra e sai inteira (máscara)
const Line = ({t, a, out, y, children, type = "up", outType = "up", dur = 0.55, z}) => (
  <El t={t} inn={[a, dur, type]} out={out ? [out, 0.32, outType] : undefined} x={M} y={y} w={TW} mask={type === "up" || type === "down"} z={z}>
    {children}
  </El>
);

// ======================= ÁLBUM (objeto condutor) =======================
const AW = 560, AH = 720;
const Leather = ({children}) => (
  <div style={{position: "absolute", inset: 0, borderRadius: "10px 22px 22px 10px", background: "radial-gradient(120% 90% at 30% 20%, #1D3E8F 0%, #0B2363 45%, #051338 100%)", boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 60px rgba(0,0,0,0.55)", overflow: "hidden", backfaceVisibility: "hidden"}}>
    <div style={{position: "absolute", inset: 26, border: "3px dashed rgba(220,235,255,0.35)", borderRadius: 14}} />
    <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 46, background: "linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.06) 60%, transparent)"}} />
    {children}
  </div>
);
const CoverFront = () => (
  <Leather>
    <div style={{position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 26, letterSpacing: "0.5em", color: "rgba(220,235,255,0.75)", paddingLeft: "0.5em"}}>ÁLBUM DE</div>
    <div style={{position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: HAND, fontWeight: 600, fontSize: 120, background: "linear-gradient(180deg,#FFFFFF,#BFD7FF 60%,#8FB3EA)", WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.45))"}}>Família</div>
    <div style={{position: "absolute", left: 200, right: 200, top: 450, height: 3, background: "linear-gradient(90deg, transparent, rgba(155,235,255,0.8), transparent)"}} />
  </Leather>
);
const Paper = ({children, shade = 0}) => (
  <div style={{position: "absolute", inset: 0, background: `linear-gradient(90deg, #E7E1D4 0%, ${C.paper} 7%, #FBF9F4 60%, #F1ECE2 100%)`, borderRadius: "4px 14px 14px 4px", overflow: "hidden", backfaceVisibility: "hidden"}}>
    {children}
    <div style={{position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,${0.18 + shade * 0.3}), transparent 12%)`}} />
  </div>
);
const Album = ({open = 0, turn = 0, page, next, wrap = 0, shadow = 1}) => (
  <div style={{position: "relative", width: AW, height: AH, perspective: 2600}}>
    <div style={{position: "absolute", inset: 0, ...S3D}}>
      <div style={{position: "absolute", inset: 0, borderRadius: "4px 14px 14px 4px", boxShadow: `5px 0 0 #E9E4D9, 8px 1px 0 #CFC8BA, 11px 2px 0 #E9E4D9, 14px 3px 0 #C9C1B2, 0 ${40 * shadow}px ${80 * shadow}px rgba(0,6,24,${0.55 * shadow})`}}>
        <Paper>{turn > 0 ? next : page}</Paper>
      </div>
      {turn > 0 && turn < 1 && (
        <div style={{position: "absolute", inset: 0, transformOrigin: "left center", transform: `rotateY(${-turn * 178}deg)`, ...S3D}}>
          <Paper shade={turn}>{page}</Paper>
          <div style={{position: "absolute", inset: 0, transform: "rotateY(180deg)", backfaceVisibility: "hidden", background: "#EFEADF", borderRadius: "14px 4px 4px 14px"}} />
        </div>
      )}
      <div style={{position: "absolute", left: -10, top: -10, width: AW + 22, height: AH + 20, transformOrigin: "left center", transform: `rotateY(${-open * 176}deg)`, ...S3D}}>
        <CoverFront />
        <div style={{position: "absolute", inset: 0, transform: "rotateY(180deg)", backfaceVisibility: "hidden", borderRadius: "22px 10px 10px 22px", background: "linear-gradient(90deg, #0A1F57, #102C73)", boxShadow: "inset 0 0 0 18px #0B2363, inset 0 0 0 20px rgba(255,255,255,0.15)"}} />
      </div>
      {wrap > 0 && (
        <div style={{position: "absolute", left: -34, top: -34, width: AW + 70, height: AH + 68, borderRadius: 34, clipPath: `inset(${(1 - wrap) * 100}% -40px -40px -40px round 34px)`, background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 3px, transparent 3px 52px), repeating-linear-gradient(-45deg, rgba(0,0,40,0.22) 0 3px, transparent 3px 52px), linear-gradient(160deg, #2A6BFF, #1446E0 45%, #0A2A9A)", boxShadow: "inset 0 0 0 8px #0A2A8F, inset 0 0 50px rgba(0,0,0,0.35), 0 40px 80px rgba(0,6,24,0.6)", transform: "translateZ(30px)"}}>
          <div style={{position: "absolute", left: (AW + 70) / 2 - 130, top: (AH + 68) / 2 - 130, width: 260, height: 260}}>
            <Logo size={260} style={{filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))"}} />
          </div>
        </div>
      )}
    </div>
  </div>
);
// páginas do álbum
const PageRoute = ({t}) => (
  <>
    <Print src="u_casa2.jpg" w={300} h={200} cap="nosso endereço" rot={-4} style={{left: 40, top: 46, opacity: ip(t, 20.5, 20.9), transform: `rotate(-4deg) translateY(${(1 - ip(t, 20.5, 20.9)) * -30}px)`}} />
    <Print src="u_cozinha.jpg" w={290} h={190} cap="domingos" rot={5} style={{left: 200, top: 370, opacity: ip(t, 20.8, 21.2), transform: `rotate(5deg) translateY(${(1 - ip(t, 20.8, 21.2)) * -30}px)`}} />
  </>
);
const drop = (t, a) => {
  const p = ip(t, a, a + 0.45);
  return {opacity: Math.min(1, p * 3), sc: 1.25 - 0.25 * p, y: (1 - p) * -40};
};
const PageLife = ({t}) => {
  const A = drop(t, 23.0), B = drop(t, 24.3), Cc = drop(t, 25.85);
  return (
    <>
      <Print src="u_casa.jpg" w={300} h={210} cap="a nossa casa" pos="50% 60%" style={{left: 26, top: 30, opacity: A.opacity, transform: `translateY(${A.y}px) scale(${A.sc}) rotate(-5deg)`}} />
      <Print src="u_conquistas.jpg" w={290} h={200} cap="conquistas" style={{left: 214, top: 262, opacity: B.opacity, transform: `translateY(${B.y}px) scale(${B.sc}) rotate(4deg)`}} />
      <Print src="u_familia.jpg" w={330} h={150} cap="família" pos="50% 70%" style={{left: 36, top: 476, opacity: Cc.opacity, transform: `translateY(${Cc.y}px) scale(${Cc.sc}) rotate(-2deg)`}} />
    </>
  );
};
const PageNew = ({t}) => {
  const wr = ip(t, 49.75, 50.6, 0, 1, EIO);
  const ph = drop(t, 50.3);
  const st = ip(t, 51.5, 51.75);
  return (
    <>
      <div style={{position: "absolute", left: 50, top: 50, fontFamily: HAND, fontWeight: 600, fontSize: 92, color: C.navy, clipPath: `inset(0 ${(1 - wr) * 100}% 0 0)`, whiteSpace: "nowrap"}}>Capítulo 2</div>
      <div style={{position: "absolute", left: 56, top: 162, width: 300 * wr, height: 4, borderRadius: 2, background: C.cyan}} />
      <Print src="u_novacasa.jpg" w={360} h={230} cap="nova casa" style={{left: 90, top: 230, opacity: ph.opacity, transform: `translateY(${ph.y}px) scale(${ph.sc}) rotate(3deg)`}} />
      <div style={{position: "absolute", left: 70, top: 600, opacity: st, transform: `scale(${1.8 - 0.8 * st}) rotate(-3deg)`, transformOrigin: "left center"}}>
        <div style={{display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 40, border: `4px solid ${C.blue}`, color: C.blue, fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: "0.06em"}}>
          <svg width={30} height={34} viewBox="0 0 30 34"><path d="M15 33 C15 33 3 21 3 13 A12 12 0 1 1 27 13 C27 21 15 33 15 33 Z" fill={C.blue} /><circle cx={15} cy={13} r={5} fill="#fff" /></svg>
          NOVO ENDEREÇO
        </div>
      </div>
    </>
  );
};

// câmera do álbum (cenas 3 e 4): foco [x,y] em coordenadas da página, escala, posição na tela
const ALB = {
  t: [16.0, 16.9, 17.6, 18.9, 19.62, 20.5, 22.9, 23.25, 24.25, 24.6, 25.8, 26.2, 27.3, 28.0, 28.7, 29.4, 30.5, 31.1],
  fx: [280, 280, 280, 280, 280, 280, 280, 190, 190, 360, 360, 210, 210, 280, 280, 280, 280, 280],
  fy: [360, 360, 360, 360, 360, 360, 360, 175, 175, 400, 400, 560, 560, 360, 360, 360, 360, 360],
  s: [0.46, 0.46, 0.5, 0.82, 0.86, 1.25, 1.25, 1.8, 1.8, 1.8, 1.8, 1.6, 1.6, 1.25, 1.25, 1.16, 1.16, 1.6],
  sx: [540, 540, 540, 540, 540, 560, 560, 540, 540, 540, 540, 540, 540, 560, 560, 540, 540, 540],
  sy: [1450, 1010, 1010, 1150, 1150, 1180, 1180, 1250, 1250, 1250, 1250, 1300, 1300, 1180, 1180, 1150, 1150, 1100],
  rz: [0, -7, -7, -2, 0, 0, 0, -1, -1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  ry: [0, 10, 10, 4, 0, -4, -4, 0, 0, 0, 0, 0, 0, -4, -4, 0, 0, 0],
};
const albCam = (t) => {
  const g = (k) => kf(t, ALB.t, ALB[k]);
  return {fx: g("fx"), fy: g("fy"), s: g("s"), sx: g("sx"), sy: g("sy"), rz: g("rz"), ry: g("ry")};
};
const CamAlbum = ({t, cam, children, blur = 0}) => (
  <div style={{position: "absolute", left: cam.sx, top: cam.sy, width: 0, height: 0, perspective: 2400, filter: blur > 0.4 ? `blur(${blur}px)` : undefined}}>
    <div style={{position: "absolute", transformOrigin: "0 0", transform: `rotateY(${cam.ry}deg) rotateZ(${cam.rz}deg) scale(${cam.s}) translate(${-cam.fx}px, ${-cam.fy}px)`, ...S3D}}>{children}</div>
  </div>
);

// ======================= CENA 1 — PENSANDO EM SE MUDAR? =======================
const ListCard = ({t}) => {
  const rows = [
    ["Organizar as caixas", 5.72, 6.75],
    ["Cuidar dos móveis", 7.14, 8.1],
    ["Escolher o transporte", 8.64, 9.75],
    ["Torcer para tudo dar certo", 10.12, 11.95],
  ];
  const enter = ip(t, 4.35, 5.1);
  const top = kf(t, [4.35, 5.1, 5.35, 6.0], [1950, 880, 880, 236]);
  const rx = kf(t, [4.35, 5.1, 5.35, 6.0], [42, 12, 12, 0]);
  const sc = kf(t, [5.35, 6.0], [1, 0.94]);
  const exitP = ip(t, 12.45, 13.05, 0, 1, EIO);
  return (
    <div style={{position: "absolute", left: M, top: top - exitP * 1920, width: TW, perspective: 1600, opacity: Math.min(1, enter * 2), filter: (enter < 1 ? `blur(${(1 - enter) * 12}px)` : "") + (exitP > 0 && exitP < 1 ? ` blur(${swing(t, 12.45, 13.05, 16)}px)` : "") || undefined}}>
      <div style={{transform: `rotateX(${rx}deg) scale(${sc})`, transformOrigin: "50% 0%", borderRadius: 36, padding: "34px 44px 30px", background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(120,190,255,0.06))", boxShadow: "0 40px 90px rgba(0,4,20,0.6), inset 0 0 0 2px rgba(155,235,255,0.35)", backdropFilter: "blur(6px)"}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: "0.32em", color: C.ice, marginBottom: 18}}>A LISTA</div>
        {rows.map(([txt, a, chk], i) => {
          const tp = ip(t, a - 0.05, a + 0.5);
          const ck = ip(t, chk, chk + 0.3);
          const act = on(t, a - 0.1, (rows[i + 1] ? rows[i + 1][1] : 12.6) - 0.1);
          return (
            <div key={i} style={{display: "flex", alignItems: "center", gap: 26, height: 92, borderTop: i ? "1px solid rgba(155,235,255,0.16)" : "none"}}>
              <div style={{width: 50, height: 50, borderRadius: 14, border: `4px solid ${ck > 0 ? C.cyan : "rgba(155,235,255,0.55)"}`, background: ck > 0 ? `rgba(34,199,245,${0.25 * ck})` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: ck > 0 ? `0 0 ${24 * ck}px rgba(34,199,245,0.8)` : "none", flexShrink: 0}}>
                <svg width={34} height={34} viewBox="0 0 34 34"><path d="M5 18 L14 26 L29 8" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ck} /></svg>
              </div>
              <div style={{position: "relative", flex: 1, height: 60}}>
                <div style={{position: "absolute", left: 0, top: 22, height: 14, borderRadius: 7, width: `${(1 - tp) * 70 + 10}%`, background: "rgba(155,235,255,0.18)", opacity: 1 - tp}} />
                <div style={{position: "absolute", left: 0, top: 0, fontFamily: FONT, fontWeight: act ? 800 : 600, fontSize: 46, color: act ? "#fff" : "rgba(225,240,255,0.78)", whiteSpace: "nowrap", clipPath: `inset(-20% ${(1 - tp) * 100}% -20% 0)`, textShadow: act ? "0 0 22px rgba(34,199,245,0.55)" : "none"}}>{txt}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Scene1 = ({t}) => {
  // título protagonista; encolhe e sobe ao surgir "aquela lista"
  const k = kf(t, [2.6, 3.3], [0, 1]);
  const gy = -k * 470;
  const gs = 1 - k * 0.38;
  const exit = ip(t, 5.2, 5.6, 0, 1, EI);
  const s1 = fit("PENSANDO", TW, 190);
  return (
    <AbsoluteFill style={{opacity: 1 - exit, filter: exit > 0 ? `blur(${exit * 14}px)` : undefined, transform: `translateY(${-exit * 160}px)`}}>
      <El t={t} inn={[0.0, 0.5, "fade"]} out={[2.45, 0.3, "up"]} x={M} y={560} w={TW}>
        <Words t={t} size={58} words={[["Eu", 0.0], ["sei", 0.26], ["que", 0.5], ["você", 0.68], ["está", 0.94]]} />
      </El>
      <div style={{position: "absolute", inset: 0, transformOrigin: "540px 650px", transform: `translateY(${gy}px) scale(${gs})`}}>
        <El t={t} inn={[1.08, 0.5, "zoom"]} x={0} y={650} w={W}><Big size={s1}>PENSANDO</Big></El>
        <El t={t} inn={[1.52, 0.45, "up"]} mask x={0} y={650 + s1 * 0.95} w={W}><Big size={s1} italic>EM SE</Big></El>
        <El t={t} inn={[1.86, 0.5, "pop"]} x={0} y={650 + s1 * 1.9} w={W}><Big size={fit("MUDAR?", TW, 250)} grad italic>MUDAR?</Big></El>
      </div>
      <El t={t} inn={[2.62, 0.3, "fade"]} x={M} y={655} w={TW}>
        <Words t={t} size={56} words={[["e", 2.66], ["só", 2.88], ["de", 3.1], ["imaginar", 3.28]]} />
      </El>
      <El t={t} inn={[3.68, 0.3, "fade"]} x={M} y={730} w={TW}>
        <Words t={t} size={56} words={[["já", 3.72], ["vem", 4.12], ["aquela", 4.38], ["lista.", 4.72, true]]} />
      </El>
    </AbsoluteFill>
  );
};

// ======================= CENA 2 — A LISTA (caixas, móveis, transporte) =======================
const ITEMS = [
  {a: 5.72, b: 7.05, word: "CAIXAS"},
  {a: 7.14, b: 8.55, word: "MÓVEIS", icon: "sofa"},
  {a: 8.64, b: 10.05, word: "TRANSPORTE", icon: "truck"},
  {a: 10.12, b: 12.45, word: "DAR CERTO", icon: "check"},
];
const Floor = ({o = 1}) => (
  <div style={{position: "absolute", left: 540 - 380, top: 1190, width: 760, height: 120, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(34,199,245,0.55), rgba(20,70,224,0.18) 60%, transparent)", opacity: o}} />
);
const Scene2 = ({t}) => {
  const pan = ip(t, 12.45, 13.05, 0, 1, EIO);
  const pb = swing(t, 12.45, 13.05, 18);
  return (
    <AbsoluteFill style={{transform: `translateY(${-pan * 1920}px)`, filter: pb > 0.5 ? `blur(${pb}px)` : undefined}}>
      <Floor o={ip(t, 5.6, 6.1)} />
      {ITEMS.map((it, i) => {
        if (!on(t, it.a - 0.2, it.b + 0.5)) return null;
        const pin = ip(t, it.a, it.a + 0.55);
        const pout = ip(t, it.b, it.b + 0.35, 0, 1, EI);
        const last = i === 3;
        const ws = fit(it.word, TW, 170);
        const wordX = (1 - pin) * 520 - pout * 620 * (last ? 0 : 1);
        const wb = (1 - pin) * 20 + (last ? 0 : pout * 20);
        return (
          <React.Fragment key={i}>
            {/* palavra-chave atravessa a cena: entra pela direita, sai pela esquerda */}
            <div style={{position: "absolute", left: 0, width: W, top: 1265, display: "flex", justifyContent: "center", transform: `translateX(${wordX}px) scaleX(${1 + (1 - pin) * 0.2})`, opacity: Math.min(1, pin * 1.6) * (last ? 1 : 1 - pout), filter: wb > 0.5 ? `blur(${wb}px)` : undefined}}>
              <Big size={ws} grad={last && t > 11.86} italic>{it.word}</Big>
            </div>
            {/* objeto */}
            <div style={{position: "absolute", left: 540, top: 1000, transform: `scale(${(0.7 + 0.3 * pin) * (1 - pout * 0.4)})`, opacity: 1 - pout, filter: pout > 0 ? `blur(${pout * 14}px)` : undefined}}>
              {i === 0 ? (
                <div style={{position: "absolute", left: 0, top: 0, perspective: 1400}}>
                  {[
                    {x: -150, y: 150, w: 270, h: 210, d: 240, at: 5.72, r: -24, lab: "SALA"},
                    {x: 140, y: 150, w: 250, h: 200, d: 230, at: 5.9, r: -32, lab: "COZINHA"},
                    {x: -10, y: -55, w: 220, h: 180, d: 200, at: 6.12, r: -20, lab: "FRÁGIL"},
                  ].map((b, j) => {
                    const p = ip(t, b.at, b.at + 0.42, 0, 1, EO);
                    return (
                      <div key={j} style={{position: "absolute", left: b.x, top: b.y - (1 - p) * 700, opacity: Math.min(1, p * 3), ...S3D}}>
                        <Box3D w={b.w} h={b.h} d={b.d} rot={b.r} tilt={-16} label={b.lab} tape={ip(t, 6.35, 6.95)} />
                      </div>
                    );
                  })}
                </div>
              ) : last ? (
                <div style={{position: "absolute", left: -170, top: -190}}>
                  <svg width={340} height={340} viewBox="0 0 340 340" style={{position: "absolute", transform: `rotate(${t * 240}deg)`, opacity: 1 - ip(t, 11.75, 11.95), filter: "drop-shadow(0 0 16px rgba(34,199,245,0.9))"}}>
                    <circle cx={170} cy={170} r={140} fill="none" stroke={C.ice} strokeWidth={9} strokeLinecap="round" strokeDasharray="160 720" />
                  </svg>
                  <div style={{position: "absolute", left: 10, top: 40, opacity: ip(t, 11.8, 11.95)}}>
                    <Icon name="check" size={320} p={ip(t, 11.8, 12.35, 0, 1, EIO)} glow={1.2} />
                  </div>
                </div>
              ) : (
                <div style={{position: "absolute", left: -200, top: -210}}>
                  <Icon name={it.icon} size={400} p={ip(t, it.a, it.a + 0.8, 0, 1, EIO)} />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
      {/* flash no "dar certo" */}
      <AbsoluteFill style={{background: "radial-gradient(circle at 50% 52%, rgba(155,235,255,0.5), transparent 45%)", opacity: ip(t, 11.85, 11.95) * (1 - ip(t, 11.95, 12.5))}} />
    </AbsoluteFill>
  );
};

// ======================= CENA 3 — PAULO =======================
const Scene3 = ({t}) => {
  const pan = ip(t, 12.45, 13.05, 0, 1, EIO);
  const pb = swing(t, 12.45, 13.05, 18);
  const pull = kf(t, [13.0, 14.5, 15.2], [1.18, 1.12, 1]);
  const dof = ip(t, 17.5, 18.6, 0, 1, EIO); // foco no álbum
  const exitTxt = 19.4;
  const nameS = fit("PAULO.", TW, 230);
  const tape = ip(t, 13.75, 14.25, 0, 1, EIO);
  const side = (a) => ip(t, a, a + 0.45);
  const front = (
    <div style={{position: "absolute", left: 540, top: 1420 + dof * 260, opacity: 1 - dof * 0.7, filter: dof > 0 ? `blur(${dof * 10}px)` : undefined, perspective: 1500, ...S3D}}>
      <Box3D w={440} h={330} d={340} rot={-14} tilt={-12} tape={tape} label="Mudança do Paulo" />
    </div>
  );
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - pan) * 1920}px)`, filter: pb > 0.5 ? `blur(${pb}px)` : undefined}}>
      {/* caixas ao fundo */}
      <AbsoluteFill style={{transform: `scale(${pull})`, transformOrigin: "540px 1350px", opacity: 1 - dof * 0.55, filter: dof > 0 ? `blur(${dof * 9}px)` : undefined}}>
        <div style={{position: "absolute", left: 150 - (1 - side(14.5)) * 700, top: 1490, perspective: 1400, ...S3D}}><Box3D w={300} h={240} d={260} rot={18} tilt={-12} label="QUARTO" light={0.88} /></div>
        <div style={{position: "absolute", left: 930 + (1 - side(14.66)) * 700, top: 1460, perspective: 1400, ...S3D}}><Box3D w={320} h={250} d={260} rot={-40} tilt={-12} label="LIVROS" light={0.88} /></div>
        <div style={{position: "absolute", left: 830 + (1 - side(14.82)) * 700, top: 1210, perspective: 1400, ...S3D}}><Box3D w={240} h={190} d={210} rot={-36} tilt={-12} light={0.8} /></div>
        <div style={{position: "absolute", left: 220 - (1 - side(15.0)) * 700, top: 1250, perspective: 1400, ...S3D}}><Box3D w={230} h={180} d={200} rot={26} tilt={-12} light={0.8} /></div>
      </AbsoluteFill>
      {/* o álbum é desenhado entre o fundo e a caixa da frente (ver Main) */}
      {/* textos */}
      <AbsoluteFill style={{opacity: 1 - dof * 0.25}}>
        <Line t={t} a={13.02} out={exitTxt} y={300}><Words t={t} size={56} words={[["Esse", 13.06], ["aqui", 13.32], ["é", 13.58], ["o", 13.7]]} /></Line>
        <El t={t} inn={[13.86, 0.55, "zoom"]} out={[exitTxt, 0.35, "up"]} x={0} y={372} w={W}><Big size={nameS} grad>PAULO.</Big></El>
        <El t={t} inn={[13.9, 0.6, "fade"]} out={[exitTxt, 0.3, "up"]} x={0} y={372 + nameS * 1.02} w={W}>
          <div style={{width: 420 * ip(t, 14.0, 14.6, 0, 1, EIO), height: 6, borderRadius: 3, background: "linear-gradient(90deg, transparent, #22C7F5, transparent)", boxShadow: "0 0 20px #22C7F5"}} />
        </El>
        <Line t={t} a={14.46} out={15.62} y={720}><Words t={t} size={56} words={[["No", 14.5], ["meio", 14.64], ["das", 14.82], ["caixas,", 15.12, true]]} /></Line>
        <Line t={t} a={15.78} out={17.4} y={720}><Words t={t} size={56} words={[["ele", 15.82], ["encontrou", 16.06], ["um", 16.36], ["álbum", 16.62, true], ["de", 16.92], ["família", 17.22, true]]} /></Line>
        <Line t={t} a={17.5} out={exitTxt} y={720}><Words t={t} size={56} words={[["e", 17.56], ["parou", 18.14], ["por", 18.48], ["um", 18.68], ["instante.", 18.92]]} style={{letterSpacing: `${ip(t, 18.0, 19.4) * 0.04}em`}} /></Line>
      </AbsoluteFill>
      {front}
    </AbsoluteFill>
  );
};

// ======================= CENA 4 — O ÁLBUM (textos) =======================
const Scene4Text = ({t}) => {
  const casa = fit("CASA.", TW, 230);
  const conq = fit("CONQUISTAS.", TW, 200);
  const tempo = fit("TEMPO", TW, 200);
  const cuid = fit("CUIDADO.", TW, 200);
  const end = fit("DE UM ENDEREÇO", TW, 110);
  return (
    <AbsoluteFill>
      {/* faixa escura para leitura sobre o álbum */}
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(2,10,34,0.94) 0%, rgba(2,10,34,0.85) 24%, rgba(2,10,34,0.5) 32%, transparent 40%)", opacity: ip(t, 19.6, 20.2) * (1 - ip(t, 30.9, 31.3))}} />
      <Line t={t} a={19.58} out={22.85} y={240}><Words t={t} size={58} words={[["Porque", 19.62], ["não", 19.94], ["é", 20.16], ["só", 20.28], ["levar", 20.5]]} /></Line>
      <Line t={t} a={20.72} out={22.85} y={312}><Words t={t} size={58} words={[["as", 20.76], ["coisas", 21.06]]} /></Line>
      <El t={t} inn={[21.32, 0.5, "left"]} out={[22.85, 0.32, "left"]} x={0} y={392} w={W}><Big size={end} italic>DE UM <span style={{color: C.cyan}}>ENDEREÇO</span></Big></El>
      <Line t={t} a={22.12} out={22.85} y={392 + end * 1.05}><Words t={t} size={58} words={[["para", 22.16], ["outro.", 22.4]]} /></Line>

      <Line t={t} a={23.06} out={24.2} y={250}><Words t={t} size={60} words={[["É", 23.1], ["a", 23.3], ["sua", 23.42]]} /></Line>
      <El t={t} inn={[23.58, 0.5, "zoom"]} out={[24.2, 0.3, "left"]} x={0} y={322} w={W}><Big size={casa} grad>CASA.</Big></El>

      <Line t={t} a={24.34} out={25.75} y={250}><Words t={t} size={60} words={[["São", 24.38], ["suas", 24.62]]} /></Line>
      <El t={t} inn={[24.98, 0.5, "left"]} out={[25.75, 0.3, "left"]} x={0} y={330} w={W}><Big size={conq} grad>CONQUISTAS.</Big></El>

      <Line t={t} a={25.9} out={28.85} y={250}><Words t={t} size={58} words={[["É", 25.94], ["aquilo", 26.3], ["que", 26.54], ["você", 26.74], ["levou", 27.02]]} /></Line>
      <El t={t} inn={[27.32, 0.5, "zoom"]} out={[28.85, 0.3, "up"]} x={0} y={318} w={W}><Big size={tempo} grad>TEMPO</Big></El>
      <Line t={t} a={27.68} out={28.85} y={318 + tempo * 0.98}><Words t={t} size={58} words={[["para", 27.72], ["construir.", 28.04]]} /></Line>

      <Line t={t} a={29.06} out={30.95} y={250}><Words t={t} size={60} words={[["E", 29.1], ["tudo", 29.3], ["isso", 29.5], ["merece", 29.98]]} /></Line>
      <El t={t} inn={[30.42, 0.5, "zoom"]} out={[30.95, 0.35, "zoom"]} x={0} y={322} w={W}><Big size={cuid} grad>CUIDADO.</Big></El>
    </AbsoluteFill>
  );
};

// ======================= CENA 5 — CONHEÇA A DIEGO =======================
const Rays = ({t, o = 1}) => (
  <div style={{position: "absolute", left: 540 - 900, top: 1000 - 900, width: 1800, height: 1800, borderRadius: "50%", opacity: o, background: "repeating-conic-gradient(from 0deg, rgba(155,235,255,0.14) 0deg 4deg, transparent 4deg 15deg)", transform: `rotate(${t * 8}deg)`, maskImage: "radial-gradient(circle, black 10%, transparent 62%)", WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 62%)"}} />
);
const Scene5 = ({t}) => {
  const lg = ip(t, 35.12, 35.75);
  const lout = ip(t, 36.35, 36.85, 0, 1, EI);
  const mud = fit("ESSA MUDANÇA,", TW, 130);
  return (
    <AbsoluteFill>
      <Rays t={t} o={lg * (1 - lout)} />
      <Line t={t} a={31.38} out={34.45} y={640}><Words t={t} size={60} words={[["Na", 31.42], ["hora", 31.52], ["de", 31.72], ["escolher", 31.96]]} /></Line>
      <Line t={t} a={32.36} out={34.45} y={724}><Words t={t} size={60} words={[["quem", 32.4], ["vai", 32.66], ["acompanhar", 32.92]]} /></Line>
      <El t={t} inn={[33.42, 0.5, "left"]} out={[34.45, 0.35, "zoom"]} x={0} y={812} w={W}><Big size={mud} grad italic>ESSA MUDANÇA,</Big></El>
      <El t={t} inn={[34.56, 0.4, "up"]} mask out={[36.35, 0.3, "up"]} x={M} y={470} w={TW}><Words t={t} size={58} words={[["conheça", 34.6], ["a", 34.98]]} /></El>
      {t >= 35.1 && (
        <div style={{position: "absolute", left: 540 - 330, top: 600, width: 660, height: 660, transform: `scale(${(1.5 - 0.5 * lg) * (1 + lout * 1.8)})`, opacity: Math.min(1, lg * 2) * (1 - lout), filter: (1 - lg) + lout > 0.02 ? `blur(${(1 - lg) * 24 + lout * 20}px)` : undefined}}>
          <div style={{position: "absolute", inset: -40, borderRadius: "50%", boxShadow: `0 0 ${120 * lg}px rgba(34,199,245,0.55)`}} />
          <Logo size={660} />
        </div>
      )}
      <div style={{position: "absolute", inset: 0, transform: `translateY(${(1 - ip(t, 35.1, 35.9)) * 700 + lout * 900}px)`}}><Bands y={1620} amp={230} /></div>
    </AbsoluteFill>
  );
};

// ======================= CENA 6 — CAMINHÕES E TRABALHO =======================
const CARDS = [
  {src: "diego_geladeira.jpg", w: 640, h: 590, f: 38.42, chip: "PROTEÇÃO", pos: "50% 40%"},
  {src: "capas.jpg", w: 640, h: 571, f: 39.08, chip: "ORGANIZAÇÃO"},
  {src: "frota.jpg", w: 470, h: 578, f: 39.74, chip: null},
];
const Scene6 = ({t}) => {
  const tin = ip(t, 36.45, 37.15);
  const tout = ip(t, 38.25, 38.65, 0, 1, EI);
  const panX = kf(t, [36.5, 38.5], [-40, -820], (x) => x);
  const cam = fit("CAMINHÕES", TW, 170);
  const trab = fit("TRABALHO", TW, 170);
  const cardsOut = ip(t, 40.3, 40.75, 0, 1, EI);
  return (
    <AbsoluteFill>
      <Line t={t} a={36.54} out={38.25} y={260}><Words t={t} size={60} words={[["Veja", 36.58], ["nossos", 36.82]]} /></Line>
      <El t={t} inn={[37.08, 0.5, "zoom"]} out={[38.25, 0.3, "left"]} x={0} y={336} w={W}><Big size={cam} grad>CAMINHÕES</Big></El>
      {/* faixa fotográfica dos caminhões, proporção original 1272x482 */}
      {t < 38.7 && (
        <div style={{position: "absolute", left: 0, top: 640, width: W, height: 760, perspective: 1800}}>
          <div style={{position: "absolute", left: panX - tout * 1200, top: 20, transform: `rotateY(${-8 + tin * 4}deg) scale(${0.85 + 0.15 * tin})`, transformOrigin: "50% 50%", opacity: Math.min(1, tin * 2), filter: (1 - tin) * 16 + tout * 20 > 0.5 ? `blur(${(1 - tin) * 16 + tout * 20}px)` : undefined}}>
            <PhotoCard src="caminhoes.jpg" w={1900} h={720} radius={40} fit="fill" />
          </div>
        </div>
      )}
      <Line t={t} a={38.32} out={39.36} y={260}><Words t={t} size={60} words={[["acompanhe", 38.36], ["nosso", 38.64]]} /></Line>
      <El t={t} inn={[38.88, 0.45, "left"]} out={[39.36, 0.3, "up"]} x={0} y={336} w={W}><Big size={trab} grad>TRABALHO</Big></El>
      {/* carrossel de trabalho: um foco por vez */}
      {on(t, 38.2, 40.8) && (
        <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, perspective: 1600, opacity: 1 - cardsOut}}>
          {CARDS.map((c, i) => {
            const u = kf(t, [c.f - 0.5, c.f - 0.1, c.f + 0.35, c.f + 0.65], [-1, 0, 0, 1], EIO); // -1 direita, 0 centro, 1 esquerda
            const x = 540 + -u * 470;
            const s = 1 - Math.abs(u) * 0.4;
            const ry = u * 32;
            const appear = ip(t, c.f - 0.75, c.f - 0.45);
            const bl = Math.abs(u) * 7 + cardsOut * 16;
            return (
              <div key={i} style={{position: "absolute", left: x - c.w / 2, top: 1040 - c.h / 2, width: c.w, height: c.h, transform: `rotateY(${ry}deg) scale(${s * (1 + cardsOut * 0.6)})`, zIndex: 10 - Math.round(Math.abs(u) * 5), opacity: appear * (1 - Math.max(0, Math.abs(u) - 0.6)), filter: `brightness(${1 - Math.abs(u) * 0.45})${bl > 0.5 ? ` blur(${bl}px)` : ""}`}}>
                <PhotoCard src={c.src} w={c.w} h={c.h} pos={c.pos} />
                {c.chip && <div style={{position: "absolute", left: 30, top: c.h - 50, opacity: ip(t, c.f - 0.1, c.f + 0.2), transform: `translateY(${(1 - ip(t, c.f - 0.1, c.f + 0.25)) * 30}px)`}}><Chip>{c.chip}</Chip></div>}
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ======================= CENA 7 — ORIGEM → DESTINO =======================
const A = [250, 1350], B = [820, 870];
const C1 = [720, 1450], C2 = [300, 900];
const bez = (u) => {
  const v = 1 - u;
  return [0, 1].map((k) => v * v * v * A[k] + 3 * v * v * u * C1[k] + 3 * v * u * u * C2[k] + u * u * u * B[k]);
};
const ROUTE = `M ${A[0]} ${A[1]} C ${C1[0]} ${C1[1]} ${C2[0]} ${C2[1]} ${B[0]} ${B[1]}`;
const PinMark = ({x, y, p, label, lp}) => (
  <div style={{position: "absolute", left: x, top: y}}>
    <div style={{position: "absolute", left: -70, top: -14, width: 140, height: 28, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(34,199,245,0.8), transparent)", transform: `scale(${p})`}} />
    <svg width={110} height={140} viewBox="0 0 110 140" style={{position: "absolute", left: -55, top: -140 - (1 - p) * 260, opacity: Math.min(1, p * 3), filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.5)) drop-shadow(0 0 18px rgba(34,199,245,0.7))"}}>
      <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FE7FF" /><stop offset="1" stopColor="#1446E0" /></linearGradient></defs>
      <path d="M55 136 C55 136 8 84 8 50 A47 47 0 1 1 102 50 C102 84 55 136 55 136 Z" fill="url(#pg)" stroke="#fff" strokeWidth={5} />
      <circle cx={55} cy={50} r={17} fill="#fff" />
    </svg>
    {label && (
      <div style={{position: "absolute", left: label[1], top: label[2], opacity: lp, transform: `translateY(${(1 - lp) * 20}px)`, whiteSpace: "nowrap"}}>
        <Chip style={{fontSize: 34, padding: "12px 24px"}}>{label[0]}</Chip>
      </div>
    )}
  </div>
);
const Scene7 = ({t}) => {
  const enter = ip(t, 40.3, 40.95);
  const draw = ip(t, 42.64, 43.5, 0, 1, EIO);
  const tu = kf(t, [42.7, 44.7], [0, 1], EIO);
  const [tx, ty] = bez(tu);
  const [tx2, ty2] = bez(Math.min(1, tu + 0.01));
  const ang = (Math.atan2(ty2 - ty, tx2 - tx) * 180) / Math.PI;
  const zoom = ip(t, 44.85, 45.6, 0, 1, EI);
  const zs = 1 + zoom * 5;
  const said = fit("SAINDO,", TW, 140);
  const levar = fit("LEVAR.", TW, 160);
  const vai = fit("VAI", TW, 160);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transformOrigin: `${B[0]}px ${B[1] - 60}px`, transform: `scale(${zs})`, opacity: 1 - ip(t, 45.2, 45.6), filter: zoom > 0.02 ? `blur(${zoom * 10}px)` : undefined}}>
        {/* plano do mapa em perspectiva */}
        <div style={{position: "absolute", left: 0, top: 560, width: W, height: 1360, perspective: 1300, opacity: enter}}>
          <div style={{position: "absolute", left: -500, top: -60, width: 2080, height: 1800, transform: `rotateX(${58 - enter * 6}deg) translateY(${(1 - enter) * 200}px)`, transformOrigin: "50% 40%", background: "repeating-linear-gradient(0deg, rgba(155,235,255,0.13) 0 2px, transparent 2px 90px), repeating-linear-gradient(90deg, rgba(155,235,255,0.13) 0 2px, transparent 2px 90px), radial-gradient(60% 50% at 50% 40%, rgba(20,70,224,0.45), transparent 70%)", maskImage: "radial-gradient(70% 60% at 50% 40%, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 40%, black 30%, transparent 75%)"}}>
            {[[260, 0, 30, 1800], [1400, 0, 22, 1800], [0, 640, 2080, 26], [0, 1180, 2080, 18]].map((r, i) => (
              <div key={i} style={{position: "absolute", left: r[0], top: r[1], width: r[2], height: r[3], background: "rgba(155,235,255,0.12)"}} />
            ))}
          </div>
        </div>
        {/* trajetória com as cores da marca */}
        <svg width={W} height={H} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          <path d={ROUTE} fill="none" stroke="rgba(0,10,40,0.6)" strokeWidth={46} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} transform="translate(0,14)" style={{filter: "blur(8px)"}} />
          <path d={ROUTE} fill="none" stroke="#FFFFFF" strokeWidth={36} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={ROUTE} fill="none" stroke={C.cyan} strokeWidth={24} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{filter: "drop-shadow(0 0 14px rgba(34,199,245,0.9))"}} />
          <path d={ROUTE} fill="none" stroke={C.blue} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </svg>
        <PinMark x={A[0]} y={A[1]} p={ip(t, 40.85, 41.3, 0, 1, EO)} label={["SAINDO DE", -120, 30]} lp={ip(t, 41.85, 42.2)} />
        <PinMark x={B[0]} y={B[1]} p={ip(t, 43.1, 43.5, 0, 1, EO)} label={["PARA ONDE VAI", -170, -250]} lp={ip(t, 43.2, 43.55)} />
        {/* marcador do caminhão percorrendo a trajetória */}
        {t > 42.65 && (
          <div style={{position: "absolute", left: tx - 62, top: ty - 62, width: 124, height: 124, borderRadius: "50%", background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.45), 0 0 0 8px rgba(34,199,245,0.5), 0 0 40px rgba(34,199,245,0.8)", display: "flex", alignItems: "center", justifyContent: "center", opacity: ip(t, 42.65, 42.9)}}>
            <div style={{transform: `scaleX(${Math.cos((ang * Math.PI) / 180) < 0 ? -1 : 1})`}}><Icon name="truck" size={84} p={1} glow={0} color={C.blue} sw={14} /></div>
          </div>
        )}
        {/* o que precisa levar */}
        {[["box", 43.86, 300, 1010], ["sofa", 44.06, 560, 1180], ["fridge", 44.26, 640, 960]].map(([ic, a, x, y], i) => {
          const p = ip(t, a, a + 0.35, 0, 1, EO);
          return (
            <div key={i} style={{position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 30, background: "linear-gradient(160deg, rgba(255,255,255,0.22), rgba(120,190,255,0.08))", boxShadow: "inset 0 0 0 2px rgba(155,235,255,0.5), 0 14px 30px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + 0.6 * p}) translateY(${(1 - p) * 40}px)`, opacity: p}}>
              <Icon name={ic} size={88} p={p} glow={0.5} sw={14} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* textos */}
      <AbsoluteFill style={{opacity: 1 - ip(t, 44.85, 45.2)}}>
        <Line t={t} a={39.4} out={42.45} y={250}><Words t={t} size={58} words={[["e", 39.4], ["conte", 39.82], ["para", 40.08], ["a", 40.36], ["gente", 40.42]]} /></Line>
        <Line t={t} a={40.66} out={42.45} y={325}><Words t={t} size={58} words={[["de", 40.7], ["onde", 41.16], ["você", 41.38], ["está", 41.72]]} /></Line>
        <El t={t} inn={[41.86, 0.45, "zoom"]} out={[42.45, 0.3, "left"]} x={0} y={400} w={W}><Big size={said} grad italic>SAINDO,</Big></El>
        <Line t={t} a={42.6} out={43.36} y={260}><Words t={t} size={60} words={[["para", 42.64], ["onde", 42.82]]} /></Line>
        <El t={t} inn={[43.1, 0.4, "pop"]} out={[43.36, 0.3, "left"]} x={0} y={336} w={W}><Big size={vai} grad italic>VAI</Big></El>
        <Line t={t} a={43.4} y={260}><Words t={t} size={60} words={[["e", 43.44], ["o", 43.7], ["que", 43.86], ["precisa", 44.18]]} /></Line>
        <El t={t} inn={[44.44, 0.4, "left"]} x={0} y={336} w={W}><Big size={levar} grad italic>LEVAR.</Big></El>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ======================= CENA 8 — NOVA CASA, NOVO CAPÍTULO =======================
const Scene8 = ({t}) => {
  // abertura circular a partir do pino de destino
  const r = kf(t, [44.95, 45.75], [0, 1500], EIO);
  const cx = kf(t, [44.95, 45.75], [B[0], 540]);
  const cy = kf(t, [44.95, 45.75], [B[1] - 85, 900]);
  const kb = 1.12 - ip(t, 45, 56, 0, 1, (x) => x) * 0.1;
  const dark = ip(t, 52.0, 52.6) * 0.35;
  const hist = fit("NOVA HISTÓRIA", TW, 130);
  const cap = fit("CAPÍTULO", TW, 170);
  const end = fit("ENDEREÇO.", TW, 160);
  const ag = fit("AGORA,", TW, 150);
  const che = fit("CHEGAR ATÉ ELE?", TW, 120);
  return (
    <AbsoluteFill style={{clipPath: t < 45.8 ? `circle(${r}px at ${cx}px ${cy}px)` : undefined}}>
      <Img src={staticFile("diego/u_novacasa.jpg")} style={{position: "absolute", left: -640, top: 0, height: H, width: (H * 1400) / 935, objectFit: "cover", transform: `scale(${kb})`, transformOrigin: "60% 60%", filter: "saturate(0.9) brightness(1.05)"}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(4,21,69,0.25), rgba(6,32,95,0.2))", mixBlendMode: "multiply"}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(2,10,34,0.95) 0%, rgba(2,10,34,0.82) 22%, rgba(2,10,34,0.25) 42%, rgba(2,10,34,0) 55%, rgba(2,10,34,0.55) 100%)`}} />
      <AbsoluteFill style={{background: C.ink, opacity: dark}} />
      <Line t={t} a={45.2} out={48.8} y={250}><Words t={t} size={58} words={[["Assim", 45.24], ["como", 45.56], ["o", 45.88], ["Paulo,", 46.02, true]]} /></Line>
      <Line t={t} a={46.4} out={48.8} y={325}><Words t={t} size={58} words={[["você", 46.44], ["tem", 46.74], ["uma", 46.9]]} /></Line>
      <El t={t} inn={[47.28, 0.5, "zoom"]} out={[48.8, 0.32, "up"]} x={0} y={405} w={W}><Big size={hist} grad>NOVA HISTÓRIA</Big></El>
      <Line t={t} a={47.98} out={48.8} y={405 + hist * 1.05}><Words t={t} size={58} words={[["pela", 48.02], ["frente.", 48.32]]} /></Line>

      <Line t={t} a={48.96} out={50.7} y={250}><Words t={t} size={58} words={[["O", 49.0], ["próximo", 49.2]]} /></Line>
      <El t={t} inn={[49.56, 0.5, "left"]} out={[50.7, 0.3, "left"]} x={0} y={326} w={W}><Big size={cap} grad italic>CAPÍTULO</Big></El>
      <Line t={t} a={50.04} out={50.7} y={326 + cap * 1.0}><Words t={t} size={58} words={[["da", 50.08], ["sua", 50.36], ["vida", 50.58]]} /></Line>
      <Line t={t} a={50.82} out={52.2} y={250}><Words t={t} size={58} words={[["já", 50.86], ["tem", 51.34]]} /></Line>
      <El t={t} inn={[51.52, 0.45, "zoom"]} out={[52.2, 0.3, "up"]} x={0} y={326} w={W}><Big size={end} grad>ENDEREÇO.</Big></El>

      <El t={t} inn={[52.36, 0.45, "zoom"]} out={[54.7, 0.3, "up"]} x={0} y={250} w={W}><Big size={ag} italic>AGORA,</Big></El>
      <Line t={t} a={53.0} out={54.7} y={250 + ag * 1.0}><Words t={t} size={58} words={[["vamos", 53.04], ["conversar", 53.3]]} /></Line>
      <Line t={t} a={53.8} out={54.7} y={325 + ag * 1.0}><Words t={t} size={58} words={[["sobre", 53.84], ["como", 54.16]]} /></Line>
      <El t={t} inn={[54.4, 0.45, "left"]} out={[54.85, 0.3, "zoom"]} x={0} y={405 + ag * 1.0} w={W}><Big size={che} grad italic>CHEGAR ATÉ ELE?</Big></El>
    </AbsoluteFill>
  );
};
// álbum na nova casa
const AlbumNew = ({t}) => {
  const land = ip(t, 45.45, 46.25, 0, 1, EO);
  const open = ip(t, 49.0, 49.75, 0, 1, EIO);
  const push = kf(t, [49.0, 49.8, 52.3, 54.7], [0.95, 1.02, 1.08, 1.0]);
  const s = push * (1 + (1 - land) * 0.4);
  const y = kf(t, [45.45, 46.25, 49.0, 49.8, 52.3, 54.7], [1900, 1230, 1230, 1180, 1200, 1300], EO);
  const cam = {sx: 540 + open * 30, sy: y, s, fx: 280, fy: 360, rz: -4 * (1 - land) + 2 * (1 - open) - 1, ry: -6 * open};
  return (
    <div style={{opacity: Math.min(1, land * 3), position: "absolute", inset: 0}}>
      <CamAlbum t={t} cam={cam} blur={(1 - land) * 14}>
        <Album open={open} page={<PageNew t={t} />} />
      </CamAlbum>
    </div>
  );
};

// ======================= CENA 9 — MARCA E CONVITE =======================
const Scene9 = ({t}) => {
  const lg = ip(t, 55.2, 55.95);
  const ly = kf(t, [55.2, 56.3], [700, 610]);
  const sh = ((t - 58.9) % 2.2) / 2.2;
  const cta = ip(t, 58.6, 59.05, 0, 1, EO);
  return (
    <AbsoluteFill>
      <Rays t={t} o={lg * 0.9} />
      <div style={{position: "absolute", inset: 0, transform: `translateY(${(1 - ip(t, 55.0, 56.0)) * 500}px)`}}>
        <Bands y={1650 + Math.sin(t * 0.8) * 14} amp={240} />
      </div>
      <div style={{position: "absolute", left: 540 - 320, top: ly - 320, width: 640, height: 640, transform: `scale(${1.45 - 0.45 * lg})`, opacity: Math.min(1, lg * 2), filter: lg < 0.99 ? `blur(${(1 - lg) * 22}px)` : undefined}}>
        <div style={{position: "absolute", inset: -30, borderRadius: "50%", boxShadow: `0 0 ${140 * lg}px rgba(34,199,245,0.5)`}} />
        <Logo size={640} />
      </div>
      <El t={t} inn={[57.18, 0.3, "fade"]} x={M} y={1000} w={TW}><Words t={t} size={58} words={[["Fale", 57.22], ["com", 57.36], ["a", 57.58], ["nossa", 57.64], ["equipe", 57.84], ["e", 58.34]]} /></El>
      <div style={{position: "absolute", left: 0, width: W, top: 1150, display: "flex", justifyContent: "center", opacity: cta, transform: `scale(${0.7 + 0.3 * cta})`, filter: cta < 0.99 ? `blur(${(1 - cta) * 10}px)` : undefined}}>
        <div style={{position: "relative", overflow: "hidden", padding: "30px 64px", borderRadius: 80, background: "linear-gradient(90deg, #1446E0, #22C7F5)", boxShadow: "0 20px 50px rgba(0,8,40,0.6), 0 0 60px rgba(34,199,245,0.55), inset 0 0 0 3px rgba(255,255,255,0.35)", fontFamily: FONT, fontWeight: 900, fontSize: fit("PEÇA SEU ORÇAMENTO", 780, 64), color: "#fff", whiteSpace: "nowrap", letterSpacing: "0.01em"}}>
          PEÇA SEU ORÇAMENTO
          <div style={{position: "absolute", top: 0, bottom: 0, width: 140, left: -200 + sh * 1300, background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)", transform: "skewX(-20deg)", opacity: t > 58.9 ? 1 : 0}} />
        </div>
      </div>
      <El t={t} inn={[59.3, 0.6, "up"]} x={M} y={1335} w={TW}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.92)", textShadow: "0 4px 18px rgba(0,0,0,0.6)"}}>
          <div style={{display: "flex", alignItems: "center", gap: 14}}>
            <svg width={40} height={40} viewBox="0 0 40 40"><rect x={3} y={3} width={34} height={34} rx={10} fill="none" stroke="#fff" strokeWidth={3.5} /><circle cx={20} cy={20} r={8} fill="none" stroke="#fff" strokeWidth={3.5} /><circle cx={30} cy={10} r={2.5} fill="#fff" /></svg>
            @diegomudancasbh
          </div>
          <div style={{color: C.ice}}>diegomudancas.com.br</div>
        </div>
      </El>
    </AbsoluteFill>
  );
};

// ======================= MONTAGEM =======================
export const DiegoFilm = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam3 = albCam(t);
  const albOpen = kf(t, [19.75, 20.7, 28.55, 29.25], [0, 1, 1, 0], EIO);
  const albTurn = ip(t, 22.82, 23.3, 0, 1, EIO);
  const albWrap = ip(t, 29.85, 30.5, 0, 1, EIO);
  const albBlur = swing(t, 30.5, 31.1, 10);
  const bgGlow = t < 31.3 ? C.blue : C.royal;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: "hidden"}}>
      {/* fundo contínuo (cenas 1–7 e 9) */}
      {t < 45.9 && <Bg t={t} glow={bgGlow} glowY={t < 13 ? 0.42 : 0.6} warm={t > 17.5 && t < 31 ? ip(t, 17.5, 19) * (1 - ip(t, 30, 31)) : 0} />}

      {on(t, 0, 5.7) && <Scene1 t={t} />}
      {on(t, 4.3, 13.1) && <ListCard t={t} />}
      {on(t, 5.5, 13.1) && <Scene2 t={t} />}

      {/* cenas 3–4: caixas, álbum e textos */}
      {on(t, 12.4, 19.9) && <Scene3 t={t} />}
      {on(t, 16.0, 31.5) && (
        <div style={{position: "absolute", inset: 0, zIndex: 1, clipPath: t < 17.5 ? "inset(0 0 calc(100% - 1290px) 0)" : undefined, opacity: t > 31.3 ? 0 : 1}}>
          <AbsoluteFill style={{background: "radial-gradient(40% 30% at 50% 58%, rgba(155,235,255,0.25), transparent 70%)", opacity: ip(t, 17.6, 18.8) * (1 - ip(t, 29.5, 31))}} />
          <CamAlbum t={t} cam={cam3} blur={albBlur}>
            <Album open={albOpen} turn={albTurn} page={<PageRoute t={t} />} next={<PageLife t={t} />} wrap={albWrap} />
          </CamAlbum>
        </div>
      )}
      {on(t, 13.06, 17.6) && (
        // caixa da frente repetida acima do álbum para que ele surja de dentro dela
        <div style={{position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none"}}>
          <div style={{position: "absolute", left: 540, top: 1420, perspective: 1500, ...S3D}}>
            <Box3D w={440} h={330} d={340} rot={-14} tilt={-12} tape={ip(t, 13.75, 14.25, 0, 1, EIO)} label="Mudança do Paulo" />
          </div>
        </div>
      )}
      {on(t, 19.5, 31.4) && <div style={{position: "absolute", inset: 0, zIndex: 3}}><Scene4Text t={t} /></div>}
      <div style={{position: "absolute", inset: 0, zIndex: 4}}><WaveWipe t={t} t0={30.85} dur={1.1} /></div>

      {on(t, 31.3, 37.0) && <div style={{position: "absolute", inset: 0, zIndex: 3}}><Scene5 t={t} /></div>}
      {on(t, 36.4, 40.9) && <div style={{position: "absolute", inset: 0, zIndex: 3}}><Scene6 t={t} /></div>}
      {on(t, 39.3, 45.7) && <div style={{position: "absolute", inset: 0, zIndex: 3}}><Scene7 t={t} /></div>}
      {on(t, 44.9, 55.4) && (
        <div style={{position: "absolute", inset: 0, zIndex: 4}}>
          <Scene8 t={t} />
          {t > 45.4 && <div style={{position: "absolute", inset: 0}}><AlbumNew t={t} /></div>}
          {/* textos acima do álbum */}
        </div>
      )}
      {on(t, 54.75, 62.1) && (
        <div style={{position: "absolute", inset: 0, zIndex: 5, opacity: t < 55.3 ? 0 : 1}}>
          <Bg t={t} glow={C.royal} glowY={0.36} />
          <Scene9 t={t} />
        </div>
      )}
      <div style={{position: "absolute", inset: 0, zIndex: 6}}><WaveWipe t={t} t0={54.75} dur={1.1} /></div>

      <Audio src={staticFile("diego/locucao.mp3")} volume={1} />
      <Audio src={staticFile("diego/sfx.wav")} volume={1} />
    </AbsoluteFill>
  );
};

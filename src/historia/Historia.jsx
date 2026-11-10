// "Toda casa guarda uma história" — Diego Mudanças (vertical, 33 s, narração Jessica/ElevenLabs).
// Linguagem: tipografia em movimento sobre fundo alumínio (o baú do caminhão), vídeos reais dentro das
// letras e em telas divididas, objetos desenhados em linha que recebem a capa azul, e a porta de
// enrolar do baú como transição. Todos os cortes seguem os tempos das palavras da narração.
import React from "react";
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {FONT} from "../diego/kit";
import {cl, lerp, seg, ss, eio, eo, ei} from "../three/kit";

export const HIS_FPS = 30;
export const HIS_T = 33;
const ALU = "#EEF1F5", ALU2 = "#DDE3EA", NAVY = "#0A1B4D", ROYAL = "#2153D2", CYAN = "#2DB5E0", INK2 = "#46526E";
const f = (n) => staticFile("historia/" + n);
const back = (x) => { x = cl(x); const c = 1.5; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }; // leve ultrapassagem

/* ---------- vídeo recortado (começa no ponto certo do arquivo) ---------- */
function Clip({src, from, at, dur, style}) {
  const fps = 30;
  return (
    <Sequence from={Math.round(at * fps)} durationInFrames={Math.round(dur * fps)} layout="none">
      <OffthreadVideo src={f(src)} startFrom={Math.round(from * fps)} muted style={{width: "100%", height: "100%", objectFit: "cover", ...style}} />
    </Sequence>
  );
}

/* ---------- palavra que sobe de dentro de uma máscara ---------- */
function Word({t, at, out = 99, children, size = 150, color = NAVY, weight = 900, italic = false, style = {}}) {
  const a = eo(seg(t, at, at + 0.45)), b = ei(seg(t, out, out + 0.3));
  return (
    <div style={{overflow: "hidden", lineHeight: 0.98, paddingBottom: "0.04em", ...style}}>
      <div style={{transform: `translateY(${(1 - a) * 105 - b * 105}%)`, fontFamily: FONT, fontWeight: weight, fontStyle: italic ? "italic" : "normal", fontSize: size, letterSpacing: "-0.035em", color, whiteSpace: "nowrap"}}>{children}</div>
    </div>
  );
}

/* ---------- porta de enrolar do baú ---------- */
// p: 0 = aberta (fora da tela, em cima), 1 = fechada (cobre a tela)
function Door({p, livery = 0, t}) {
  if (p <= 0) return null;
  const y = (1 - p) * -100;
  return (
    <AbsoluteFill style={{transform: `translateY(${y}%)`}}>
      <AbsoluteFill style={{background: `repeating-linear-gradient(180deg, #F7F9FB 0px, #E9EDF2 46px, #C9D0D9 50px, #FFFFFF 52px, #F2F5F8 64px)`, boxShadow: "0 30px 60px rgba(0,0,0,.35)"}} />
      {/* barra inferior da porta, com puxador */}
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 34, background: "linear-gradient(180deg,#B8C0CB,#8F99A6)"}} />
      <div style={{position: "absolute", left: "50%", bottom: 8, width: 180, height: 16, marginLeft: -90, borderRadius: 8, background: "#5E6875"}} />
      {livery > 0 && <Livery t={t} k={livery} />}
    </AbsoluteFill>
  );
}
// pintura da frota na porta: faixas azuis diagonais e o letreiro
function Livery({t, k}) {
  const paint = (a, d = 0.55) => eo(seg(t, a, a + d));
  const s1 = paint(23.84), s2 = paint(23.98), logo = paint(24.05, 0.7);
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
        <defs>
          <clipPath id="sw1"><rect x="0" y="0" width={1080 * s1} height="1920" /></clipPath>
          <clipPath id="sw2"><rect x={1080 * (1 - s2)} y="0" width="1080" height="1920" /></clipPath>
        </defs>
        <g clipPath="url(#sw1)"><path d="M-40 1900 L640 1640 L800 1640 L60 1920 Z" fill={ROYAL} /><path d="M160 1920 L860 1640 L920 1640 L240 1920 Z" fill={NAVY} /></g>
        <g clipPath="url(#sw2)"><path d="M1120 330 L560 560 L440 560 L1120 260 Z" fill={ROYAL} opacity=".95" /><path d="M1120 400 L700 560 L650 560 L1120 370 Z" fill={NAVY} /></g>
      </svg>
      <div style={{position: "absolute", left: 140, right: 140, top: 620, height: 420, opacity: logo, transform: `scale(${0.94 + 0.06 * logo})`,
        WebkitMaskImage: `url(${staticFile("craft/letreiro.png")})`, maskImage: `url(${staticFile("craft/letreiro.png")})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", background: NAVY}} />
    </AbsoluteFill>
  );
}

/* ---------- objetos desenhados em linha ---------- */
const ICONS = {
  cafe: ["M60 70 H200 V170 a50 50 0 0 1 -50 50 H110 a50 50 0 0 1 -50 -50 Z", "M200 95 h20 a30 30 0 0 1 0 60 h-20", "M40 245 H220", "M105 20 q-12 18 0 32 q12 14 0 30", "M150 15 q-12 18 0 32 q12 14 0 30"],
  fotos: ["M40 40 H220 V220 H40 Z", "M62 62 H198 V198 H62 Z", "M70 190 L115 135 L145 168 L165 148 L192 190", "M168 100 a14 14 0 1 0 0.1 0"],
  cristaleira: ["M60 20 H200 V250 H60 Z", "M130 20 V170", "M60 170 H200", "M60 95 H200", "M78 40 V150 M182 40 V150", "M95 205 H165", "M75 250 V262 M185 250 V262"],
};
function Drawing({name, t, at, x, y, s = 1, color = NAVY, cover = 0}) {
  const d = eo(seg(t, at, at + 0.9));
  return (
    <div style={{position: "absolute", left: x, top: y, width: 260 * s, height: 280 * s}}>
      <svg viewBox="0 0 260 280" width={260 * s} height={280 * s} style={{overflow: "visible"}}>
        {ICONS[name].map((p, i) => <path key={i} d={p} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cl(d * 1.4 - i * 0.08)} />)}
      </svg>
      {cover > 0 && <Cover p={cover} s={s} />}
    </div>
  );
}
// a capa azul acolchoada desce sobre o objeto
function Cover({p, s}) {
  const h = 290 * s * eo(p);
  return (
    <div style={{position: "absolute", left: -18 * s, top: -14 * s, width: 296 * s, height: h, overflow: "hidden", borderRadius: `${22 * s}px ${22 * s}px ${14 * s}px ${14 * s}px`, boxShadow: "0 18px 30px rgba(10,27,77,.25)"}}>
      <div style={{position: "absolute", inset: 0, height: 290 * s, background: `radial-gradient(circle at 50% 40%, #2D5FDC 0%, ${ROYAL} 70%), ${ROYAL}`,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(14,38,120,.55) 0 3px, transparent 3px ${30 * s}px), repeating-linear-gradient(0deg, rgba(14,38,120,.55) 0 3px, transparent 3px ${38 * s}px), radial-gradient(circle at 50% 40%, #2D5FDC 0%, ${ROYAL} 75%)`}} />
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 10 * s, background: "#13318C"}} />
    </div>
  );
}

/* ---------- faixa que corre (marquee) ---------- */
function Band({t, at, text, y, bg, dir = 1}) {
  const a = eo(seg(t, at, at + 0.5));
  const x = dir * (1 - a) * 1100 - dir * (t - at) * 140;
  return (
    <div style={{position: "absolute", left: -200, right: -200, top: y, height: 150, background: bg, transform: `translateX(${x}px) rotate(-4deg)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 60, boxShadow: "0 20px 40px rgba(0,0,0,.3)"}}>
      {[0, 1, 2].map((i) => <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap"}}>{text}</span>)}
    </div>
  );
}

/* ---------- peça que voa até o seu lugar na grade ---------- */
function Tile({t, at, from, x, y, w, h, children}) {
  const a = back(seg(t, at, at + 0.55)), o = eo(seg(t, at, at + 0.2));
  const dx = from[0] * (1 - a), dy = from[1] * (1 - a);
  return (
    <div style={{position: "absolute", left: x, top: y, width: w, height: h, transform: `translate(${dx}px, ${dy}px) rotate(${(1 - a) * from[2]}deg)`, opacity: o, borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 50px rgba(10,27,77,.28)", background: ALU2}}>{children}</div>
  );
}

export const Historia = () => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;

  /* portas */
  const door1 = t < 11.3 ? ss(seg(t, 10.95, 11.3)) : 1 - ss(seg(t, 11.32, 11.66));
  const door2 = t < 20.78 ? ss(seg(t, 20.45, 20.78)) : 1 - ss(seg(t, 20.8, 21.12));
  const door3 = (() => { const u = seg(t, 23.4, 23.84); return u < 1 ? ss(u) : 1; })();
  const settle = t > 23.84 ? Math.exp(-(t - 23.84) * 9) * Math.sin((t - 23.84) * 40) * 0.012 : 0;

  /* cena 1 (0–2,4): Toda casa guarda uma história */
  const s1out = eio(seg(t, 2.3, 2.6));
  /* cena 2 e 3 (2,4–11,3): objetos e capas */
  const s2in = eio(seg(t, 2.3, 2.6));
  const gather = eio(seg(t, 7.06, 7.55)); // objetos se alinham
  /* cena 4 (11,3–14,84): item por item */
  /* cena 5 (14,84–20,6): caminhão, BH, cidades e estados */
  const wipe = seg(t, 14.68, 15.0);
  /* cena 6 (20,78–23,6): na casa nova, tudo no lugar */

  return (
    <AbsoluteFill style={{background: ALU, fontFamily: FONT}}>
      {/* ===== cena 1 ===== */}
      {t < 2.65 && (
        <AbsoluteFill style={{transform: `translateY(${-s1out * 100}%)`}}>
          <div style={{position: "absolute", left: 70, top: 560}}>
            <Word t={t} at={0.0} size={190}>Toda</Word>
            <Word t={t} at={0.45} size={190}>casa</Word>
            <Word t={t} at={0.88} size={112} color={INK2} weight={800} style={{marginTop: 18}}>guarda uma</Word>
          </div>
          {/* HISTÓRIA com a vista aérea das casas de BH dentro das letras */}
          <svg width="0" height="0" style={{position: "absolute"}}>
            <defs><clipPath id="histTxt"><text x="70" y="1255" fontFamily="Montserrat" fontWeight="900" fontSize="186" letterSpacing="-6">HISTÓRIA</text></clipPath></defs>
          </svg>
          <AbsoluteFill style={{clipPath: "url(#histTxt)", opacity: eo(seg(t, 1.5, 1.8))}}>
            <AbsoluteFill style={{transform: `scale(${1.25 - 0.12 * seg(t, 1.5, 2.6)}) translateY(${(1 - eo(seg(t, 1.5, 2.0))) * 80}px)`}}>
              <Clip src="drone.mp4" from={6.0} at={1.4} dur={1.3} style={{filter: "saturate(1.25) contrast(1.15) brightness(.78)"}} />
            </AbsoluteFill>
            <AbsoluteFill style={{background: "rgba(10,27,77,.28)", mixBlendMode: "multiply"}} />
          </AbsoluteFill>
          <svg width="1080" height="1920" style={{position: "absolute", inset: 0, opacity: eo(seg(t, 1.5, 1.8))}}>
            <text x="70" y="1255" fontFamily="Montserrat" fontWeight="900" fontSize="186" letterSpacing="-6" fill="none" stroke={NAVY} strokeWidth="3">HISTÓRIA</text>
          </svg>
          <div style={{position: "absolute", left: 74, top: 1300, width: 940 * eo(seg(t, 1.7, 2.2)), height: 10, background: ROYAL}} />
        </AbsoluteFill>
      )}

      {/* ===== cenas 2 e 3 ===== */}
      {t >= 2.3 && t < 11.4 && (
        <AbsoluteFill style={{transform: `translateY(${(1 - s2in) * 100}%)`}}>
          {[
            ["cafe", 2.52, "O primeiro café", 260],
            ["fotos", 3.92, "As fotos na estante", 700],
            ["cristaleira", 5.58, "A cristaleira da família", 1140],
          ].map(([ic, at, txt, y], i) => {
            const gx = 90 + i * 320, gy = 560; // posição alinhada (cena 3)
            const x = lerp(80, gx, gather), yy = lerp(y, gy, gather), sc = lerp(1, 1.0, gather);
            const cover = eo(seg(t, 9.3 + i * 0.6, 9.3 + i * 0.6 + 0.55));
            return (
              <React.Fragment key={ic}>
                <Drawing name={ic} t={t} at={at} x={x} y={yy} s={sc} cover={cover} />
                <div style={{position: "absolute", left: 380, top: y + 70, opacity: 1 - gather, width: 640}}>
                  <Word t={t} at={at + 0.1} size={76} weight={800}>{txt.split(" ").slice(0, 2).join(" ")}</Word>
                  <Word t={t} at={at + 0.25} size={76} weight={800} color={ROYAL}>{txt.split(" ").slice(2).join(" ")}</Word>
                </div>
              </React.Fragment>
            );
          })}
          {/* cena 3: texto */}
          <div style={{position: "absolute", left: 80, top: 1060}}>
            <Word t={t} at={7.5} size={84} weight={800} color={INK2}>Quando chega</Word>
            <Word t={t} at={7.66} size={84} weight={800} color={INK2}>a hora de mudar,</Word>
            <div style={{height: 36}} />
            <Word t={t} at={9.02} size={112}>a gente cuida</Word>
            <Word t={t} at={9.62} size={112} color={ROYAL}>de cada uma.</Word>
          </div>
        </AbsoluteFill>
      )}

      {/* ===== cena 4: item por item ===== */}
      {t >= 11.25 && t < 15.0 && (
        <AbsoluteFill style={{background: NAVY}}>
          <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 940, overflow: "hidden"}}>
            <div style={{position: "absolute", inset: 0, transform: `translateX(${-30 * seg(t, 11.3, 15)}px) scale(1.12)`}}><Clip src="video-15.mp4" from={13.4} at={11.25} dur={3.8} style={{objectPosition: "50% 35%"}} /></div>
          </div>
          <div style={{position: "absolute", left: 0, right: 0, top: 980, bottom: 0, overflow: "hidden"}}>
            <div style={{position: "absolute", inset: 0, transform: `translateX(${30 * seg(t, 11.3, 15)}px) scale(1.12)`}}><Clip src="video-08.mp4" from={1.0} at={11.25} dur={3.8} style={{objectPosition: "50% 40%"}} /></div>
          </div>
          {/* faixa central com as palavras carimbadas */}
          <div style={{position: "absolute", left: 0, right: 0, top: 860, height: 200, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", gap: 28}}>
            {t < 13.3 ? [["ITEM", 11.92], ["POR", 12.32], ["ITEM", 12.56]].map(([w, at], i) => {
              const a = seg(t, at, at + 0.18);
              return <span key={i} style={{fontWeight: 900, fontSize: 120, color: i === 1 ? CYAN : "#fff", letterSpacing: "-0.03em", opacity: a > 0 ? 1 : 0, transform: `scale(${a > 0 ? 1.6 - 0.6 * eo(a) : 1.6})`, display: "inline-block"}}>{w}</span>;
            }) : (
              <div style={{textAlign: "center"}}>
                <Word t={t} at={13.34} size={86} color="#fff">Protegemos</Word>
                <Word t={t} at={13.96} size={86} color={CYAN}>cada móvel.</Word>
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* ===== cena 5: caminhão, BH, cidades e estados ===== */}
      {t >= 14.7 && t < 21.0 && (
        <AbsoluteFill style={{clipPath: `inset(0 0 0 ${(1 - eo(wipe)) * 100}%)`}}>
          {/* 14,84–17,1: o caminhão */}
          {t < 17.25 && (
            <AbsoluteFill>
              <AbsoluteFill style={{transform: `scale(${1.1 - 0.06 * seg(t, 14.84, 17.2)})`}}><Clip src="video-07.mp4" from={13.6} at={14.7} dur={2.6} style={{objectPosition: "45% 50%"}} /></AbsoluteFill>
              <AbsoluteFill style={{background: "linear-gradient(0deg, rgba(10,27,77,.85) 0%, rgba(10,27,77,0) 38%)"}} />
              <div style={{position: "absolute", left: 70, bottom: 260}}>
                <Word t={t} at={15.2} size={92} color="#fff">E levamos tudo</Word>
                <Word t={t} at={15.95} size={92} color={CYAN}>no nosso caminhão.</Word>
              </div>
            </AbsoluteFill>
          )}
          {/* 17,12–20,6: BH visto do alto */}
          {t >= 17.05 && (
            <AbsoluteFill style={{opacity: eo(seg(t, 17.05, 17.25))}}>
              <AbsoluteFill style={{transform: `scale(${1.18 - 0.1 * seg(t, 17.1, 20.8)})`}}><Clip src="drone.mp4" from={6.6} at={17.0} dur={4.0} /></AbsoluteFill>
              <AbsoluteFill style={{background: "rgba(10,27,77,.28)"}} />
              <div style={{position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontWeight: 900, fontSize: 520, lineHeight: 1, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: "10px #fff",
                transform: `scale(${1.3 - 0.3 * eo(seg(t, 17.12, 17.6))})`, opacity: eo(seg(t, 17.12, 17.4))}}>BH</div>
              <div style={{position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontWeight: 800, fontSize: 60, color: "#fff", opacity: eo(seg(t, 17.3, 17.7)), textShadow: "0 4px 20px rgba(0,0,0,.5)"}}>aqui em Belo Horizonte,</div>
              <Band t={t} at={18.18} text="OUTRAS CIDADES" y={1100} bg={ROYAL} dir={1} />
              <Band t={t} at={19.62} text="OUTROS ESTADOS" y={1380} bg={NAVY} dir={-1} />
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}

      {/* ===== cena 6: na casa nova, cada coisa no seu lugar ===== */}
      {t >= 20.7 && t < 24.0 && (
        <AbsoluteFill style={{background: ALU}}>
          <div style={{position: "absolute", left: 70, top: 170}}>
            <Word t={t} at={20.9} size={110}>Na casa nova,</Word>
          </div>
          <Tile t={t} at={21.0} from={[-900, -200, -14]} x={70} y={420} w={460} h={640}><Clip src="video-09.mp4" from={36.0} at={21.0} dur={3.0} style={{objectPosition: "50% 0%", transform: "scale(1.38)", transformOrigin: "50% 0%"}} /></Tile>
          <Tile t={t} at={22.3} from={[900, -300, 12]} x={550} y={420} w={460} h={300}><Img src={f("capas.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} /></Tile>
          <Tile t={t} at={22.66} from={[900, 300, -10]} x={550} y={740} w={460} h={320}><Clip src="video-08.mp4" from={4.2} at={21.0} dur={3.0} style={{objectPosition: "50% 45%"}} /></Tile>
          <Tile t={t} at={22.88} from={[-200, 900, 8]} x={70} y={1080} w={940} h={420}><Img src={f("caminhao_rua.jpg")} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 72%"}} /></Tile>
          <div style={{position: "absolute", left: 70, top: 1560}}>
            <Word t={t} at={22.12} size={92} color={ROYAL}>cada coisa</Word>
            <Word t={t} at={22.66} size={92} color={ROYAL}>no seu lugar.</Word>
          </div>
        </AbsoluteFill>
      )}

      {/* ===== portas ===== */}
      <Door p={door1} t={t} />
      <Door p={door2} t={t} />

      {/* ===== final: a porta fecha com a pintura da frota ===== */}
      {t >= 23.4 && (
        <AbsoluteFill style={{transform: `translateY(${settle * 100}%)`}}>
          <Door p={door3} livery={t >= 23.84 ? 1 : 0} t={t} />
          {t >= 25.0 && (
            <div style={{position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center"}}>
              <Word t={t} at={25.16} size={66} weight={800} style={{display: "flex", justifyContent: "center"}}>Conectando destinos,</Word>
              <Word t={t} at={26.68} size={66} weight={800} color={ROYAL} style={{display: "flex", justifyContent: "center"}}>transportando recomeços.</Word>
            </div>
          )}
          {t >= 27.9 && (() => {
            const a = back(seg(t, 28.04, 28.5)), b = eo(seg(t, 28.5, 29.0));
            return (
              <div style={{position: "absolute", left: 0, right: 0, top: 1330, display: "flex", flexDirection: "column", alignItems: "center", gap: 18}}>
                <div style={{display: "flex", alignItems: "center", gap: 18, padding: "22px 46px", borderRadius: 18, background: "#1FA855", color: "#fff", fontWeight: 800, fontSize: 52, transform: `scale(${a})`, boxShadow: "0 18px 36px rgba(10,27,77,.3)"}}>
                  <svg width="50" height="50" viewBox="0 0 32 32"><path d="M16 3.5A12.5 12.5 0 0 0 5.2 22.3L3.6 28.4l6.3-1.6A12.5 12.5 0 1 0 16 3.5Z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /><path d="M11.6 9.8c.4 0 .8 0 1 .6l1.2 2.8c.1.3.1.6-.1.9l-.8 1c-.2.2-.2.5 0 .8.6 1 1.4 2 2.3 2.7.8.7 1.7 1.2 2.6 1.6.3.1.6.1.8-.2l1-1.2c.3-.3.6-.3.9-.2l2.7 1.3c.4.2.6.5.5.9-.2 1.6-1.6 2.8-3.2 2.8-4.9-.4-9.6-5.1-10-10 0-1.6 1.2-3 2.7-3.1Z" fill="#fff" /></svg>
                  (31) 98120-3121
                </div>
                <div style={{fontWeight: 800, fontSize: 42, color: NAVY, opacity: b}}>@diegomudancasbh</div>
              </div>
            );
          })()}
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{background: "#000", opacity: 1 - eo(seg(t, 0, 0.25))}} />
      <Audio src={f("narracao.mp3")} volume={1} />
      <Audio src={f("musica.wav")} volume={1} />
      <Audio src={f("sfx.wav")} volume={1} />
    </AbsoluteFill>
  );
};

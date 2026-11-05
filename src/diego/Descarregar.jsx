// "HORA DE DESCARREGAR": edição do vídeo do caminhão. O caminhão é o protagonista:
// o título ocupa o topo enquanto há espaço livre, vira uma etiqueta compacta sob as rodas durante o
// plano fechado (quando o caminhão enche a tela) e volta ao topo no plano aberto final.
import React from "react";
import {AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";
import {W, H, C, FONT, EIO, ip, fit, El, Big, Logo, Icon} from "./kit";

export const DESC_FPS = 24;
export const DESC_DURATION = 10;
const M = 90;
const TW = W - 2 * M;
const lin = (x) => x;

export const Descarregar = () => {
  const frame = useCurrentFrame();
  const t = frame / DESC_FPS;
  const hs = fit("HORA DE", TW, 200);
  const ds = fit("DESCARREGAR", TW, 200);
  const Y0 = 300;
  const sweep = ip(t, 4.3, 5.7, 0, 1, EIO);
  // logo: some durante o plano fechado para não cobrir o caminhão
  const logoOn = Math.min(1, ip(t, 0.35, 0.8) * (1 - ip(t, 1.7, 2.1)) + ip(t, 6.9, 7.3));
  const topVeil = Math.max(ip(t, 0.1, 0.6) * (1 - ip(t, 1.35, 1.8)), ip(t, 6.8, 7.3));
  const botVeil = ip(t, 1.8, 2.3) * (1 - ip(t, 6.4, 6.9));
  const pillWords = [["HORA", 2.15], ["DE", 2.3], ["DESCARREGAR", 2.45]];
  return (
    <AbsoluteFill style={{background: C.ink, overflow: "hidden"}}>
      <OffthreadVideo src={staticFile("diego/descarregar_1080.mp4")} muted style={{width: W, height: H}} />

      {/* luz passando pela plotagem do leão */}
      <div style={{position: "absolute", left: 0, top: 140, width: W, height: 1540, overflow: "hidden", pointerEvents: "none", opacity: sweep > 0 && sweep < 1 ? 1 : 0}}>
        <div style={{position: "absolute", top: -80, bottom: -80, width: 300, left: -380 + sweep * 1500, background: "linear-gradient(100deg, transparent, rgba(190,235,255,0.34), transparent)", transform: "skewX(-18deg)", mixBlendMode: "screen"}} />
      </div>

      {/* véus: topo (prédios claros) e base (chão) */}
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(2,10,34,0.88) 0%, rgba(4,21,69,0.64) 22%, rgba(6,32,95,0.24) 34%, transparent 42%)", opacity: topVeil}} />
      <AbsoluteFill style={{background: "linear-gradient(0deg, rgba(2,10,34,0.9) 0%, rgba(4,21,69,0.55) 6%, transparent 12%)", opacity: botVeil}} />

      {/* assinatura discreta (fora do plano fechado) */}
      <div style={{position: "absolute", left: (W - 210) / 2, top: 62, opacity: logoOn}}>
        <Logo size={210} p={ip(t, 0.4, 1.5, 0, 1, lin)} lionIn={0.4} glow={0.7} />
      </div>

      {/* FASE 1 — título no topo enquanto há espaço; sai para baixo quando o caminhão sobe */}
      <El t={t} inn={[0.25, 0.55, "zoom"]} out={[1.28, 0.35, "down"]} x={0} y={Y0} w={W}><Big size={hs} italic>HORA DE</Big></El>
      <El t={t} inn={[0.55, 0.5, "left"]} out={[1.32, 0.35, "down"]} x={0} y={Y0 + hs * 1.0} w={W}><Big size={ds} grad italic>DESCARREGAR</Big></El>

      {/* FASE 2 — etiqueta compacta sob as rodas durante o plano fechado */}
      <El t={t} inn={[1.95, 0.5, "up"]} out={[6.4, 0.4, "down"]} x={0} y={1738} w={W}>
        <div style={{display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 34px 14px 24px", borderRadius: 60, background: "linear-gradient(90deg, rgba(20,70,224,0.94), rgba(34,199,245,0.94))", boxShadow: "0 12px 30px rgba(0,8,40,0.55), 0 0 30px rgba(34,199,245,0.5), inset 0 0 0 2px rgba(255,255,255,0.25)"}}>
          <Icon name="box" size={56} p={ip(t, 2.0, 2.6, 0, 1, EIO)} glow={0.3} sw={14} color="#fff" />
          <div style={{display: "flex", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: 40, letterSpacing: "0.05em", color: "#fff", whiteSpace: "nowrap"}}>
            {pillWords.map(([w, ts], i) => {
              const p = ip(t, ts - 0.05, ts + 0.3);
              return <span key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 6}px)` : undefined, display: "inline-block"}}>{w}</span>;
            })}
          </div>
        </div>
      </El>

      {/* FASE 3 — plano aberto: título completo de volta ao topo */}
      <El t={t} inn={[7.3, 0.55, "zoom"]} x={0} y={Y0} w={W}><Big size={hs} italic>HORA DE</Big></El>
      <El t={t} inn={[7.65, 0.5, "left"]} x={0} y={Y0 + hs * 1.0} w={W}><Big size={ds} grad italic>DESCARREGAR</Big></El>
      <El t={t} inn={[8.15, 0.4, "fade"]} x={0} y={Y0 + hs * 1.0 + ds * 1.12} w={W}>
        <div style={{width: 260 * ip(t, 8.15, 8.8, 0, 1, EIO), height: 5, borderRadius: 3, background: "linear-gradient(90deg, transparent, #22C7F5, transparent)", boxShadow: "0 0 18px #22C7F5"}} />
      </El>

      <Audio src={staticFile("diego/descarregar_audio.wav")} volume={1} />
    </AbsoluteFill>
  );
};

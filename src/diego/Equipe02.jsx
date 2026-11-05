// "EQUIPE 02 em execução — Paquetá, Belo Horizonte": edição do vídeo de drone.
// O caminhão é o protagonista: o texto fica sempre fora da caixa do caminhão (mapeada em drone_track.json),
// uma marcação leve o acompanha, e a mensagem completa fecha o vídeo quando ele sai de quadro.
import React from "react";
import {AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";
import {W, H, C, FONT, EO, EI, EIO, ip, kf, fit, El, Big, Logo, GRAD, Chip} from "./kit";
import TRACK from "./drone_track.json";

export const EQ_FPS = 24;
export const EQUIPE_DURATION = 20;
const M = 90;
const TW = W - 2 * M;
const lin = (x) => x;

// caixa do caminhão em px (interpolada)
const truck = (t) => {
  const ts = TRACK.map((r) => r[0]);
  const g = (k) => kf(t, ts, TRACK.map((r) => r[k]), lin);
  return {x0: g(1) * W, x1: g(2) * W, y0: g(3) * H, y1: g(4) * H};
};

const Pin = ({s = 30}) => (
  <svg width={s} height={s * 1.2} viewBox="0 0 30 36"><path d="M15 35 C15 35 3 22 3 13 A12 12 0 1 1 27 13 C27 22 15 35 15 35 Z" fill="#fff" /><circle cx={15} cy={13} r={5} fill={C.blue} /></svg>
);
const LiveDot = ({pulse, s = 20}) => (
  <span style={{display: "inline-block", width: s, height: s, borderRadius: "50%", background: "#fff", boxShadow: `0 0 0 ${s * 0.25 + s * 0.45 * pulse}px rgba(255,255,255,${0.4 * (1 - pulse)})`}} />
);

// marcação que acompanha o caminhão (rótulo + haste + ponto na capota)
const TruckTag = ({t, pulse}) => {
  const a = ip(t, 1.6, 2.0) * (1 - ip(t, 9.3, 9.9));
  if (a <= 0.01) return null;
  const b = truck(t);
  const ax = (b.x0 + b.x1) / 2, ay = b.y0 + 0.012 * H;
  const cx = Math.max(190, Math.min(W - 190, ax));
  const ty = Math.min(ay - 96, 1640);
  const pop = ip(t, 1.6, 2.1, 0, 1, EO);
  return (
    <AbsoluteFill style={{opacity: a, pointerEvents: "none"}}>
      <svg width={W} height={H} style={{position: "absolute", left: 0, top: 0, overflow: "visible", filter: "drop-shadow(0 0 10px rgba(34,199,245,0.9))"}}>
        <line x1={cx} y1={ty} x2={ax} y2={ay} stroke={C.cyan} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 0" opacity={0.95} />
        <circle cx={ax} cy={ay} r={8 + 4 * pulse} fill="none" stroke={C.cyan} strokeWidth={3} opacity={1 - 0.5 * pulse} />
        <circle cx={ax} cy={ay} r={4} fill="#fff" />
      </svg>
      <div style={{position: "absolute", left: cx, top: ty, transform: `translate(-50%,-100%) scale(${0.6 + 0.4 * pop})`, transformOrigin: "50% 100%"}}>
        <Chip style={{fontSize: 34, padding: "10px 26px", gap: 12, letterSpacing: "0.08em", boxShadow: "0 10px 26px rgba(0,8,40,0.55), 0 0 26px rgba(34,199,245,0.5)"}}>
          <LiveDot pulse={pulse} s={16} />
          EQUIPE 02
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

export const Equipe02 = () => {
  const frame = useCurrentFrame();
  const t = frame / EQ_FPS;
  const pulse = (t * 1.1) % 1;
  const eq = fit("EQUIPE 02", TW, 190);
  const pq = fit("PAQUETÁ", TW, 190);
  const A0 = 300; // topo do bloco de legenda (fases A e B)
  const midVeil = ip(t, 9.9, 10.9) ;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: "hidden"}}>
      <OffthreadVideo src={staticFile("diego/drone_paqueta.mp4")} muted style={{width: W, height: H}} />

      {/* véus de contraste: topo (céu e prédios claros) e, no fechamento, faixa central */}
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(2,10,34,0.86) 0%, rgba(4,21,69,0.62) 22%, rgba(6,32,95,0.22) 34%, transparent 42%)", opacity: ip(t, 0.2, 1.0) * (1 - 0.45 * ip(t, 9.9, 10.9))}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg, transparent 22%, rgba(2,10,34,0.62) 36%, rgba(2,10,34,0.62) 66%, transparent 80%)", opacity: midVeil}} />

      {/* assinatura discreta */}
      <div style={{position: "absolute", left: (W - 210) / 2, top: 62, opacity: ip(t, 0.35, 0.8)}}>
        <Logo size={210} p={ip(t, 0.4, 1.6, 0, 1, lin)} lionIn={0.4} glow={0.7} />
      </div>

      {/* FASE A — EQUIPE 02 / EM EXECUÇÃO */}
      <El t={t} inn={[0.62, 0.55, "zoom"]} out={[4.0, 0.4, "up"]} x={0} y={A0} w={W}>
        <Big size={eq} italic>EQUIPE&nbsp;<span style={{display: "inline-block", ...GRAD}}>02</span></Big>
      </El>
      <El t={t} inn={[1.4, 0.5, "left"]} out={[4.0, 0.4, "up"]} x={0} y={A0 + eq * 1.06} w={W}>
        <Chip style={{fontSize: 44, padding: "16px 36px", letterSpacing: "0.08em"}}><LiveDot pulse={pulse} />EM EXECUÇÃO</Chip>
      </El>

      {/* FASE B — NO BAIRRO PAQUETÁ / BELO HORIZONTE */}
      <El t={t} inn={[4.4, 0.45, "up"]} mask out={[9.6, 0.4, "up"]} x={0} y={A0} w={W}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: "0.5em", paddingLeft: "0.5em", color: C.ice, textShadow: "0 4px 18px rgba(0,8,40,0.8)"}}>NO BAIRRO</div>
      </El>
      <El t={t} inn={[4.62, 0.5, "left"]} out={[9.6, 0.4, "up"]} x={0} y={A0 + 50} w={W}>
        <Big size={pq} grad italic>PAQUETÁ</Big>
      </El>
      <El t={t} inn={[5.2, 0.45, "pop"]} out={[9.6, 0.4, "up"]} x={0} y={A0 + 50 + pq * 1.06} w={W}>
        <Chip style={{fontSize: 40, padding: "14px 32px", letterSpacing: "0.1em"}}><Pin s={30} />BELO HORIZONTE</Chip>
      </El>

      {/* acompanha o caminhão */}
      <TruckTag t={t} pulse={pulse} />

      {/* FASE C — mensagem completa quando o caminhão sai de quadro */}
      <El t={t} inn={[10.3, 0.55, "zoom"]} x={0} y={600} w={W}>
        <Big size={eq} italic>EQUIPE&nbsp;<span style={{display: "inline-block", ...GRAD}}>02</span></Big>
      </El>
      <El t={t} inn={[10.8, 0.5, "left"]} x={0} y={600 + eq * 1.06} w={W}>
        <Chip style={{fontSize: 44, padding: "16px 36px", letterSpacing: "0.08em"}}><LiveDot pulse={pulse} />EM EXECUÇÃO</Chip>
      </El>
      <El t={t} inn={[11.3, 0.4, "fade"]} x={0} y={600 + eq * 1.06 + 120} w={W}>
        <div style={{width: 240 * ip(t, 11.3, 11.9, 0, 1, EIO), height: 5, borderRadius: 3, background: "linear-gradient(90deg, transparent, #22C7F5, transparent)", boxShadow: "0 0 18px #22C7F5"}} />
      </El>
      <El t={t} inn={[11.6, 0.45, "up"]} mask x={0} y={600 + eq * 1.06 + 150} w={W}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: "0.5em", paddingLeft: "0.5em", color: C.ice, textShadow: "0 4px 18px rgba(0,8,40,0.8)"}}>NO BAIRRO</div>
      </El>
      <El t={t} inn={[11.85, 0.5, "left"]} x={0} y={600 + eq * 1.06 + 200} w={W}>
        <Big size={pq} grad italic>PAQUETÁ</Big>
      </El>
      <El t={t} inn={[12.5, 0.45, "pop"]} x={0} y={600 + eq * 1.06 + 200 + pq * 1.06} w={W}>
        <Chip style={{fontSize: 40, padding: "14px 32px", letterSpacing: "0.1em"}}><Pin s={30} />BELO HORIZONTE</Chip>
      </El>

      <Audio src={staticFile("diego/equipe02_audio.wav")} volume={1} />
    </AbsoluteFill>
  );
};

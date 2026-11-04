import React from "react";
import {AbsoluteFill, Img, staticFile} from "remotion";
import {P, K, SP, EO, EIO, ES, EI, cl, mix, FONT} from "./lib";
import {Caption, L} from "./ui";

// ondas da marca em tela cheia; p 0..1 sobe e cobre a tela
const Waves = ({p, t, settle = 0}) => {
  const y = mix(2300, -400, p) + settle * 1500;
  const s = (k) => Math.sin(t * 1.2 + k) * 30;
  return (
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
      <defs>
        <linearGradient id="bwNavy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0B1F5C" /><stop offset="1" stopColor="#061232" /></linearGradient>
        <linearGradient id="bwBlue" x1="0" x2="1"><stop offset="0" stopColor="#1E6FF0" /><stop offset="1" stopColor="#27C0F5" /></linearGradient>
      </defs>
      <path d={`M -100 ${y + 240 + s(0)} C 300 ${y + 60 + s(1)}, 700 ${y + 420 + s(2)}, 1180 ${y + 120 + s(3)} L 1180 ${y + 4000} L -100 ${y + 4000} Z`} fill="url(#bwBlue)" />
      <path d={`M -100 ${y + 330 + s(1)} C 300 ${y + 150 + s(2)}, 700 ${y + 510 + s(3)}, 1180 ${y + 210 + s(4)} L 1180 ${y + 4000} L -100 ${y + 4000} Z`} fill="#FFFFFF" />
      <path d={`M -100 ${y + 380 + s(2)} C 300 ${y + 200 + s(3)}, 700 ${y + 560 + s(4)}, 1180 ${y + 260 + s(5)} L 1180 ${y + 4000} L -100 ${y + 4000} Z`} fill="url(#bwNavy)" />
    </svg>
  );
};

export const SceneBrand = ({t}) => {
  const cover = P(t, 52.15, 52.85, EIO);
  const badge = SP(t, 55.2, 9, 0.55);
  const badgeOn = t > 55.15;
  const lift = P(t, 56.9, 57.6, EIO); // selo sobe para abrir espaço ao CTA
  const sweep = P(t, 55.7, 56.6, EIO);
  const ring = P(t, 55.2, 56.4, EO);
  const bs = mix(0.2, 1, cl(badge, 0, 1.1)) * mix(1, 0.78, lift);
  const by = mix(900, 700, lift);
  return (
    <AbsoluteFill>
      {/* fundo da marca */}
      <AbsoluteFill style={{background: "radial-gradient(90% 60% at 50% 40%, #12348C 0%, #0A1C4A 55%, #050E28 100%)", opacity: P(t, 52.6, 52.9)}} />
      <AbsoluteFill style={{opacity: P(t, 52.6, 52.9) * 0.5, background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 26px)"}} />
      {t < 53.2 && <Waves p={cover} t={t} />}
      {/* ondas assentadas na base */}
      {t > 52.7 && (
        <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
          <defs><linearGradient id="bwB2" x1="0" x2="1"><stop offset="0" stopColor="#1E6FF0" /><stop offset="1" stopColor="#27C0F5" /></linearGradient></defs>
          {(() => {
            const y = mix(2100, 1650, P(t, 52.7, 53.5, EO));
            const s = (k) => Math.sin(t * 1.1 + k) * 18;
            return (
              <g>
                <path d={`M -50 ${y + 40 + s(0)} C 300 ${y - 120 + s(1)}, 700 ${y + 160 + s(2)}, 1130 ${y - 80 + s(3)} L 1130 2000 L -50 2000 Z`} fill="url(#bwB2)" />
                <path d={`M -50 ${y + 110 + s(1)} C 300 ${y - 50 + s(2)}, 700 ${y + 230 + s(3)}, 1130 ${y - 10 + s(4)} L 1130 2000 L -50 2000 Z`} fill="#fff" />
                <path d={`M -50 ${y + 150 + s(2)} C 300 ${y - 10 + s(3)}, 700 ${y + 270 + s(4)}, 1130 ${y + 30 + s(5)} L 1130 2000 L -50 2000 Z`} fill="#0B1F5C" />
              </g>
            );
          })()}
        </svg>
      )}
      {/* pergunta */}
      <Caption t={t} y={720} out={55.05} lines={[
        L("Agora, vamos", [52.4, 53.04], {size: 64, weight: 700}),
        L("*conversar*", [53.3], {size: 112, weight: 900}),
        L("sobre como", [53.82, 54.16], {size: 64, weight: 700}),
        L("chegar até ele?", [54.44, 54.78, 54.98], {size: 64, weight: 700}),
      ]} />
      {/* selo */}
      {badgeOn && (
        <div style={{position: "absolute", left: 540, top: by, width: 0, height: 0}}>
          <div style={{position: "absolute", left: -480, top: -480, width: 960, height: 960, borderRadius: "50%", border: "4px solid rgba(39,192,245,0.6)", transform: `scale(${mix(0.5, 1.15, ring)})`, opacity: 1 - ring}} />
          <div style={{position: "absolute", left: -380, top: -380, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(39,192,245,0.45), transparent 65%)", transform: `scale(${bs * 1.3})`}} />
          <div style={{position: "absolute", left: -340, top: -340, width: 680, height: 680, transform: `scale(${bs}) rotate(${(1 - cl(badge)) * -12}deg)`, filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.5))"}}>
            <Img src={staticFile("brand/badge.png")} style={{width: 680, height: 680}} />
            {/* brilho que atravessa o selo */}
            <div style={{position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", mixBlendMode: "screen"}}>
              <div style={{position: "absolute", top: -100, bottom: -100, width: 180, left: `${mix(-40, 130, sweep)}%`, transform: "rotate(18deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", opacity: sweep > 0 && sweep < 1 ? 1 : 0}} />
            </div>
          </div>
        </div>
      )}
      {/* chamada final */}
      <div style={{position: "absolute", left: 0, width: 1080, top: 1050, textAlign: "center", fontFamily: FONT}}>
        <div style={{fontSize: 56, fontWeight: 700, color: "#fff", opacity: P(t, 57.2, 57.6), transform: `translateY(${(1 - P(t, 57.2, 57.7, EO)) * 30}px)`, textShadow: "0 6px 20px rgba(0,0,0,0.4)"}}>Fale com a nossa equipe</div>
        <div style={{display: "inline-block", marginTop: 34, padding: "26px 64px", borderRadius: 80, background: "linear-gradient(180deg,#5CD6FF,#27C0F5 45%,#1E8CF0)", boxShadow: "0 18px 40px rgba(0,30,90,0.5), inset 0 2px 0 rgba(255,255,255,0.6)", fontSize: 66, fontWeight: 900, fontStyle: "italic", color: "#071A4A", transform: `scale(${cl(SP(t, 58.55, 11, 0.5), 0, 1.15)})`}}>Peça seu orçamento</div>
        <div style={{marginTop: 54, opacity: P(t, 59.3, 59.8), display: "flex", flexDirection: "column", alignItems: "center", gap: 18}}>
          <div style={{display: "flex", alignItems: "center", gap: 18, fontSize: 46, fontWeight: 800, color: "#fff"}}>
            <svg width="48" height="48" viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="12" fill="none" stroke="#fff" strokeWidth="4" /><circle cx="24" cy="24" r="9" fill="none" stroke="#fff" strokeWidth="4" /><circle cx="35" cy="13" r="2.6" fill="#fff" /></svg>
            @diegomudancasbh
          </div>
          <div style={{fontSize: 40, fontWeight: 700, color: "#BFE9FF"}}>www.diegomudancas.com.br</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

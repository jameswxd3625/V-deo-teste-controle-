import React from "react";
import {AbsoluteFill} from "remotion";
import {P, EO, EI, cl, FONT} from "../lib";
import WORDS from "../../words.json";

// unidades de sentido: [índice da 1ª palavra, índice da última, posição]
// posições: top (acima da ação), bottom (abaixo dos rostos), mid (centro, tela da marca)
const norm = (w) => w.toLowerCase().replace(/[^a-zà-ú0-9]/gi, "");
const find = (from, word) => {
  for (let i = from; i < WORDS.length; i++) if (norm(WORDS[i].w) === norm(word)) return i;
  throw new Error("palavra não encontrada: " + word);
};
// cada unidade definida pelo texto exato (para conferir com a locução)
const UNITS_TXT = [
  ["Eu sei que você está pensando em se mudar.", "bottom"],
  ["E só de imaginar, já vem aquela lista.", "top"],
  ["Organizar as caixas,", "top"],
  ["cuidar dos móveis,", "top"],
  ["escolher o transporte", "top"],
  ["e torcer para tudo dar certo.", "top"],
  ["Esse aqui é o Paulo.", "top"],
  ["No meio das caixas,", "top"],
  ["ele encontrou um álbum de família", "top"],
  ["e parou por um instante.", "top"],
  ["Porque não é só levar as coisas", "top"],
  ["de um endereço para outro.", "top"],
  ["É a sua casa.", "top"],
  ["São suas conquistas.", "top"],
  ["É aquilo que você levou tempo para construir.", "top"],
  ["E tudo isso merece cuidado.", "top"],
  ["Na hora de escolher quem vai acompanhar essa mudança,", "bottom"],
  ["conheça a Diego Mudanças.", "top"],
  ["Veja nossos caminhões,", "top"],
  ["acompanhe nosso trabalho", "top"],
  ["e conte para a gente", "top"],
  ["de onde você está saindo,", "top"],
  ["para onde vai", "top"],
  ["e o que precisa levar.", "top"],
  ["Assim como o Paulo,", "top"],
  ["você tem uma nova história pela frente.", "top"],
  ["O próximo capítulo da sua vida", "top"],
  ["já tem endereço.", "top"],
  ["Agora, vamos conversar", "mid"],
  ["sobre como chegar até ele?", "mid"],
];
// a assinatura falada ("Diego Mudanças." e o convite final) é coberta pela própria tela da marca
let cursor = 0;
export const UNITS = UNITS_TXT.map(([txt, pos]) => {
  const ws = txt.split(" ");
  const a = find(cursor, ws[0]);
  const b = a + ws.length - 1;
  cursor = b + 1;
  return {txt, ws, a, b, pos, t0: WORDS[a].s, t1: WORDS[b].e};
});

export const Subtitles = ({t}) => {
  const i = UNITS.findIndex((u, k) => {
    const next = UNITS[k + 1];
    const end = next ? Math.min(u.t1 + 0.55, next.t0 - 0.06) : u.t1 + 0.6;
    return t >= u.t0 - 0.12 && t < end;
  });
  if (i < 0) return null;
  const u = UNITS[i];
  const next = UNITS[i + 1];
  const end = next ? Math.min(u.t1 + 0.55, next.t0 - 0.06) : u.t1 + 0.6;
  const pin = P(t, u.t0 - 0.12, u.t0 + 0.12, EO);
  const pout = 1 - P(t, end - 0.12, end, EI);
  const o = Math.min(pin, pout);
  const mid = u.pos === "mid";
  const top = u.pos === "top" ? 230 : u.pos === "bottom" ? 1450 : 820;
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div style={{position: "absolute", left: 80, right: 80, top, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - pin) * 14}px)`}}>
        <div style={{maxWidth: 900, padding: mid ? 0 : "18px 30px 20px", borderRadius: 26, background: mid ? "transparent" : "rgba(6,16,44,0.74)", boxShadow: mid ? "none" : "0 10px 30px rgba(0,0,0,0.25)", textAlign: "center", fontFamily: FONT, fontWeight: mid ? 800 : 700, fontSize: mid ? 70 : 52, lineHeight: 1.22, color: "#fff", letterSpacing: "-0.005em", textShadow: mid ? "0 6px 24px rgba(0,0,0,0.45)" : "none"}}>
          {u.ws.map((w, k) => {
            const wi = u.a + k;
            const spoken = t >= WORDS[wi].s - 0.03;
            const nxt = WORDS[wi + 1];
            const now = spoken && (!nxt || t < nxt.s - 0.03) && t < WORDS[wi].e + 0.35;
            return (
              <React.Fragment key={k}>
                <span style={{color: now ? "#5CD6FF" : spoken ? "#FFFFFF" : "rgba(255,255,255,0.62)"}}>{w}</span>{k < u.ws.length - 1 ? " " : ""}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

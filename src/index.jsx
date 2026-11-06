import React from "react";
import {registerRoot, Composition, AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, interpolate} from "remotion";
import {C, FONT, BlueBg, WhiteBg, Scene, Group, Txt, Coin, Card, Draw, Words, pop, slide, sec, ease} from "./parts";
import {MotionV2, FPS_V2} from "./v2";
import {MotionV3, FPS_V3} from "./v3";
import {DiegoFilm, DIEGO_DURATION} from "./diego/Diego";
import {Equipe02, EQUIPE_DURATION, EQ_FPS} from "./diego/Equipe02";
import {Descarregar, DESC_DURATION, DESC_FPS} from "./diego/Descarregar";
import {HeroLoop, JourneyLoop, ProtectLoop, JOURNEY_T, PROTECT_T} from "./site/SiteLoops";
import {HeroReal, HERO3_T} from "./site/HeroReal";
import {HeroScene, ProtectScene, HERO_T, PROT_T, SvHome, SvWrap, SvTruck, SvStorage, SV_T} from "./site/Scenes";
import {CoinArrows, IconTech, IconAI, IconChart, Check, Building, Gear, Hammer, GavelBase, Man} from "./icons";

const cl = (v) => Math.max(0, Math.min(1, v));
const lerp = (t, ts, vs) => interpolate(t, ts, vs, {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
const Logo = ({w = 780, f = 0, at = 0}) => {
  const p = pop(f, at, 20);
  return (
    <div style={{width: w, height: (w * 286) / 793, borderRadius: w * 0.07, overflow: "hidden", transform: `scale(${p})`, boxShadow: "0 30px 60px rgba(5,31,110,0.35), 0 0 0 3px rgba(255,255,255,0.8)"}}>
      <Img src={staticFile("logo.png")} style={{width: "100%", height: "100%", display: "block"}} />
    </div>
  );
};
// área segura: margem lateral de 80 px
const Center = ({children, y = 0, align = "center", style}) => (
  <div style={{position: "absolute", inset: 0, padding: "0 80px", display: "flex", flexDirection: "column", alignItems: align, justifyContent: "center", transform: `translateY(${y}px)`, ...style}}>{children}</div>
);
const Flash = ({f, dur = 12}) => <div style={{position: "absolute", inset: 0, background: "#fff", opacity: Math.max(0, 1 - f / dur)}} />;

// ---- moedas com trajetória contínua entre cenas (t em segundos absolutos) ----
const COINS_A = [
  {sym: "%", s: 260, bl: 0, t0: 0, P: [[0, 870, 300], [2.2, 910, 250], [4.5, 960, 120], [8, 1060, -40]]},
  {sym: "%", s: 110, bl: 2, t0: 0.1, P: [[0, 140, 430], [4, 110, 620], [8, 90, 900]]},
  {sym: "%", s: 150, bl: 1, t0: 0.2, P: [[0, 940, 1250], [4, 970, 1500], [8, 1000, 1800]]},
  {sym: "%", s: 330, bl: 5, t0: 0, P: [[0, 100, 1620], [2.2, 60, 1520], [6, -30, 1300]]},
  {sym: "%", s: 120, bl: 0, t0: 0.3, P: [[0, 780, 1700], [4, 720, 1850], [5, 700, 2050]]},
  {sym: "$", s: 200, bl: 0, t0: 2.0, P: [[2, 130, 330], [8, 120, 150]]},
  {sym: "$", s: 130, bl: 0, t0: 2.2, P: [[2.2, 950, 520], [8, 990, 760]]},
  {sym: "$", s: 330, bl: 4, t0: 2.2, P: [[2.2, 1000, 1840], [8, 1080, 1860]]},
  {sym: "$", s: 120, bl: 0, t0: 2.4, P: [[2.4, 140, 1420], [8, 110, 1150]]},
];
const CoinLayer = ({list, f, a}) => list.map((c, i) => {
  const t = a + f / 30;
  const xs = c.P.map((p) => p[0]);
  return <Coin key={i} x={lerp(t, xs, c.P.map((p) => p[1]))} y={lerp(t, xs, c.P.map((p) => p[2]))} s={c.s} sym={c.sym} blur={c.bl} ph={i * 17} f={f} at={sec(c.t0) - sec(a)} />;
});
// moedas em primeiro plano cruzando rápido nos cortes (cobrem a troca de cena)
const CROSS = [[2.0, -300, 1750, 1350, 150, "$"], [4.4, 1400, 1650, -300, 250, "%"], [6.05, -300, 300, 1400, 1500, "$"]];
const Cross = ({frame}) => CROSS.map(([t, x0, y0, x1, y1, sym], i) => {
  const p = (frame - sec(t)) / 14;
  if (p < 0 || p > 1) return null;
  const e = ease(p);
  return <Coin key={i} x={x0 + (x1 - x0) * e} y={y0 + (y1 - y0) * e} s={380} sym={sym} blur={7} ph={i * 9} f={frame} at={-20} />;
});

// ---- S1 ----
const S1 = ({f}) => (
  <Center y={-60}>
    <Txt f={f} style={{fontFamily: FONT, fontWeight: 900, fontSize: 420, color: "#fff", letterSpacing: -14, lineHeight: 1, transform: `scale(${0.7 + 0.3 * pop(f, 0, 18)})`, opacity: cl(f / 6), textShadow: "0 20px 50px rgba(0,10,60,0.5)"}}>12%</Txt>
    <Txt f={f} style={{fontFamily: FONT, fontWeight: 400, fontSize: 130, color: "#fff", opacity: cl((f - 25) / 8), transform: `translateY(${(1 - slide(f, 25)) * 40}px)`}}>de <span style={{fontWeight: 800}}>imposto</span></Txt>
    <div style={{position: "relative", width: 640, height: 60, marginLeft: -20}}><Draw d="M10 30 C 150 6, 360 50, 630 14" p={slide(f, 38, 22)} w={640} h={60} width={11} /></div>
  </Center>
);

// ---- S2 ----
const S2 = ({f}) => (
  <Card x={540} y={960} w={900} h={520} rot={-4} scale={0.88 + 0.12 * pop(f, 0, 18)} style={{padding: "0 50px", gap: 36}}>
    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 200, color: "#fff", textShadow: "0 8px 20px rgba(0,10,60,0.4)", width: 140, textAlign: "center"}}>$</div>
    <Words items={[{t: "Imagine", at: 2.26}, {t: "pagar", at: 2.6}, {t: "esse", at: 2.94}, {t: "valor", at: 3.2, b: true}, {t: "todos", at: 3.46}, {t: "os", at: 3.9}, {t: "meses", at: 4.22, gold: true}]} f={f} a={2.15} size={76} justify="flex-start" style={{flex: 1, maxWidth: 600}} />
  </Card>
);

// ---- S3 ----
const S3 = ({f}) => {
  const p = slide(f, 12, 40);
  const pts = [[0, 300], [90, 260], [170, 280], [260, 200], [340, 220], [430, 120], [500, 60]];
  const d = "M" + pts.map((q) => q.join(" ")).join(" L");
  return (
    <>
      <Card x={540} y={640} w={900} h={640} rot={2} scale={0.88 + 0.12 * pop(f, 0, 18)} style={{flexDirection: "column", alignItems: "flex-start", padding: "46px 60px"}}>
        <Txt f={f} style={{fontFamily: FONT, fontWeight: 500, fontSize: 58, color: "#fff"}}>Faturamento</Txt>
        <div style={{position: "relative", width: 520, height: 340, marginTop: 36, marginLeft: 90}}>
          <svg width="520" height="340" style={{position: "absolute", overflow: "visible"}}>
            {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="520" y1={40 + i * 85} y2={40 + i * 85} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />)}
            <path d={`${d} L500 340 L0 340 Z`} fill="rgba(246,181,42,0.18)" style={{clipPath: `inset(0 ${100 - p * 100}% 0 0)`}} />
          </svg>
          <Draw d={d} p={p} w={520} h={340} width={14} />
        </div>
      </Card>
      <Center y={560}><Words items={[{t: "sobre", at: 4.52}, {t: "o", at: 4.78}, {t: "faturamento", at: 4.92, gold: true}, {t: "da", at: 5.38}, {t: "sua", at: 5.7}, {t: "empresa", at: 5.86}]} f={f} a={4.5} size={96} /></Center>
    </>
  );
};

// ---- S4 ----
const S4 = ({f}) => (
  <>
    <Txt f={f} style={{position: "absolute", left: 80, right: 80, top: 330, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 290, letterSpacing: -10, color: "rgba(255,255,255,0.16)", opacity: slide(f, 0, 24), transform: `scale(${0.94 + 0.06 * slide(f, 0, 24)})`}}>-12%</Txt>
    <div style={{position: "absolute", left: 90, top: 1540, transform: `scale(${pop(f, 14, 16)})`}}><Check size={150} rot={10} /></div>
    <div style={{position: "absolute", left: 140, top: 280, transform: `translateY(${(1 - slide(f, 0, 22)) * 260}px)`}}><Man size={800} f={f} /></div>
    <Center y={560}><Words items={[{t: "e", at: 6.28}, {t: "achar", at: 6.6}, {t: "que", at: 6.9}, {t: "é", at: 7.0}, {t: "normal.", at: 7.06, gold: true}]} f={f} a={6.2} size={118} /></Center>
  </>
);

// ---- S5 ----
const S5 = ({f}) => (
  <>
    <WhiteBg f={f} />
    <Draw d="M540 560 a 400 400 0 1 1 -0.1 0" p={slide(f, 4, 30)} stroke="#9fb2d8" width={5} glow={false} />
    <Center>
      <Txt f={f} a={7.8} style={{fontFamily: FONT, fontWeight: 500, fontSize: 80, color: C.navy, opacity: cl((f - 2) / 8), marginBottom: 50}}>Na</Txt>
      <Logo w={820} f={f} at={4} />
    </Center>
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>{[[780, 840], [300, 1100], [860, 1080]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6 + 6 * Math.sin((f + i * 8) / 5)} fill={C.gold} opacity={cl((f - 12) / 6) * 0.9} />)}</svg>
    <Flash f={f} />
  </>
);

// ---- S6: ícone à esquerda, texto à direita (como a referência) ----
const S6 = ({f}) => (
  <>
    <WhiteBg f={f} />
    <div style={{position: "absolute", left: 70, top: 700, transform: `scale(${pop(f, 0, 20)}) rotate(${(1 - pop(f, 0, 20)) * -25}deg)`}}><CoinArrows size={340} f={f} /></div>
    <div style={{position: "absolute", left: 450, top: 740, width: 560}}>
      <Words items={[{t: "analisamos", at: 8.8}, {t: "suas", at: 9.32}, {t: "atividades", at: 9.54, gold: true}]} f={f} a={8.75} size={90} color={C.navy} justify="flex-start" from="right" style={{maxWidth: 560}} />
    </div>
  </>
);

// ---- S7 ----
const S7 = ({f}) => {
  const swap = sec(11.5) - sec(10.45);
  const A = 1 - cl((f - swap) / 8), B = cl((f - swap - 4) / 10);
  return (
    <>
      <WhiteBg f={f} />
      <div style={{opacity: A, position: "absolute", inset: 0, transform: `translateX(${-cl((f - swap) / 8) * 30}px)`}}>
        <svg width="1080" height="300" style={{position: "absolute", left: 0, top: 560}}>{[0, 1, 2].map((i) => <path key={i} d={`M${80 + i * 100} 40 l70 80 -70 80`} fill="none" stroke={C.royal} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" opacity={cl((f - 4 - i * 5) / 8)} />)}</svg>
        <Center y={160} align="flex-start" style={{padding: "0 110px"}}><Words items={[{t: "seu", at: 10.52}, {t: "regime", at: 10.6, gold: true}, {t: "tributário", at: 10.92, b: true}]} f={f} a={10.45} size={140} color={C.navy} justify="flex-start" /></Center>
      </div>
      <div style={{opacity: B, position: "absolute", inset: 0}}>
        {[300, 440, 580].map((r, i) => <Draw key={i} d={`M${540 - r} 1060 a ${r} ${r} 0 1 1 ${2 * r} 0`} p={slide(f, swap + 4 + i * 5, 26)} stroke={i === 1 ? C.gold : C.royal} width={i === 1 ? 9 : 6} glow={i === 1} />)}
        <Center y={140}><Words items={[{t: "e", at: 11.6}, {t: "toda", at: 11.86}, {t: "a", at: 12.18}, {t: "operação", at: 12.34, gold: true}]} f={f} a={10.45} size={120} color={C.navy} /></Center>
      </div>
    </>
  );
};

// ---- S8: cartões sobem em sequência ----
const S8 = ({f}) => {
  const rows = [[IconTech, "tecnologia", 13.32], [IconAI, "inteligência artificial", 14.32], [IconChart, "análise contábil", 15.66]];
  return rows.map(([Ic, label, at], i) => {
    const p = slide(f, sec(at) - sec(13.1) - 4, 20);
    return (
      <Card key={label} x={540} y={680 + i * 330 + (1 - p) * 110} w={900} h={270} style={{padding: "0 50px", gap: 36, opacity: p}}>
        <Ic size={160} />
        <Txt f={f} a={13.1} style={{fontFamily: FONT, fontWeight: 500, fontSize: 68, color: "#fff", lineHeight: 1.08, flex: 1}}>{label}</Txt>
      </Card>
    );
  });
};

// ---- S9: texto à esquerda, confirmações à direita ----
const S9 = ({f}) => (
  <>
    {[[920, 420, 170, 14, 0], [960, 1320, 130, -10, 5], [880, 1600, 200, 8, 9], [160, 1420, 140, -8, 3]].map(([x, y, s, r, at], i) => (
      <div key={i} style={{position: "absolute", left: x - s / 2, top: y - s / 2 + Math.sin((f + i * 12) / 20) * 14, transform: `scale(${pop(f, at, 16)})`, filter: i === 3 ? "blur(3px)" : undefined}}><Check size={s} rot={r} /></div>
    ))}
    <Center align="flex-start" y={-20} style={{padding: "0 110px"}}>
      <Words items={[{t: "buscamos", at: 16.96, color: "#cfe0ff"}]} f={f} a={16.75} size={84} from="right" justify="flex-start" />
      <Words items={[{t: "uma", at: 17.3}, {t: "estrutura", at: 17.48}]} f={f} a={16.75} size={120} from="right" justify="flex-start" />
      <Words items={[{t: "mais", at: 17.92}, {t: "eficiente", at: 18.26, gold: true}]} f={f} a={16.75} size={120} from="right" justify="flex-start" />
      <Words items={[{t: "para", at: 18.82}, {t: "a", at: 19.1}, {t: "sua", at: 19.18}, {t: "empresa", at: 19.28, b: true}]} f={f} a={16.75} size={78} from="right" justify="flex-start" color="#cfe0ff" style={{marginTop: 24}} />
    </Center>
  </>
);

// ---- S10: martelo (empurrado para a esquerda pelo wipe da cena seguinte) ----
const S10 = ({f}) => {
  const hit = sec(20.55) - sec(19.9);
  const rot = f < hit ? -40 + ease(cl(f / hit)) * 40 : -Math.max(0, 8 - (f - hit)) * 1.5;
  return (
    <>
      <div style={{position: "absolute", left: 220, top: 700, transform: `scale(${pop(f, 2, 18)})`}}><GavelBase w={640} /></div>
      <div style={{position: "absolute", left: 250, top: 180, transform: `translateY(${f >= hit ? Math.sin((f - hit) * 1.4) * Math.max(0, 6 - (f - hit) / 3) : 0}px)`, opacity: cl(f / 6)}}><Hammer size={560} rot={rot} /></div>
      <div style={{position: "absolute", left: 220, top: 700, width: 640, height: 60, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(246,181,42,${f >= hit ? 0.7 * Math.max(0, 1 - (f - hit) / 14) : 0}), transparent 70%)`}} />
      <Center y={430} style={{opacity: 1 - cl((f - 43) / 6)}}><Words items={[{t: "sempre", at: 20.0}, {t: "dentro", at: 20.36}, {t: "da", at: 20.76}, {t: "lei.", at: 21.0, gold: true}]} f={f} a={19.9} size={120} /></Center>
    </>
  );
};

// ---- S11 ----
const S11 = ({f}) => {
  const swap = sec(22.8) - sec(21.5);
  const A = 1 - cl((f - swap) / 8), B = cl((f - swap - 3) / 10);
  const sh = slide(f, 14, 22);
  return (
    <>
      <WhiteBg f={f} />
      <div style={{position: "absolute", left: 375, top: 190 + (1 - sh) * -200 - B * 30, opacity: sh}}><Building size={330} /></div>
      <div style={{position: "absolute", left: 330, top: 1380 + (1 - sh) * 300, opacity: sh}}><Gear size={420} rot={f * 1.2} /></div>
      <div style={{position: "absolute", inset: 0, opacity: A}}><Center><Words items={[{t: "Vai", at: 21.58}, {t: "abrir", at: 21.68}, {t: "sua", at: 21.94}, {t: "empresa?", at: 22.12, b: true, color: C.navy}]} f={f} a={21.5} size={130} color={C.navy} /></Center></div>
      <div style={{position: "absolute", inset: 0, opacity: B}}>
        <Center>
          <Words items={[{t: "Comece", at: 22.88}, {t: "do", at: 23.32}, {t: "jeito", at: 23.48}, {t: "certo.", at: 23.72, gold: true}]} f={f} a={21.5} size={128} color={C.navy} />
          <div style={{position: "relative", width: 560, height: 50}}><Draw d="M10 25 C 140 5, 340 40, 550 12" p={slide(f, sec(23.8) - sec(21.5), 20)} w={560} h={50} width={11} /></div>
        </Center>
      </div>
    </>
  );
};

// ---- S12: CTA + assinatura ----
const S12 = ({f}) => {
  const out = sec(27.55) - sec(24.4);
  const T = 1 - cl((f - out) / 10);
  const L = cl((f - out - 6) / 6);
  return (
    <>
      <WhiteBg f={f} />
      <div style={{position: "absolute", inset: 0, opacity: T, transform: `translateY(${-cl((f - out) / 10) * 120}px)`}}>
        <Center>
          <Words items={[{t: "Abra", at: 24.6}, {t: "seu", at: 24.86, gold: true}, {t: "CNPJ", at: 25.02, gold: true}]} f={f} a={24.4} size={140} color={C.navy} />
          <div style={{position: "relative", width: 700, height: 50}}><Draw d="M10 28 C 160 6, 400 44, 690 12" p={slide(f, sec(25.1) - sec(24.4), 20)} w={700} h={50} width={12} /></div>
          <Words items={[{t: "com", at: 25.8}, {t: "a", at: 26.12}, {t: "Conttrole", at: 26.22, color: C.royal, b: true}]} f={f} a={24.4} size={116} color={C.navy} style={{marginTop: 30}} />
          <Words items={[{t: "Contabilidade", at: 26.84}]} f={f} a={24.4} size={92} weight={400} color={C.navy} />
        </Center>
      </div>
      <div style={{position: "absolute", inset: 0, opacity: L}}>
        <Draw d="M540 560 a 400 400 0 1 1 -0.1 0" p={slide(f, out + 6, 28)} stroke="#9fb2d8" width={5} glow={false} />
        <Center><Logo w={820} f={f} at={out + 6} /></Center>
        <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>{[[800, 850], [280, 1110], [880, 1090]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6 + 6 * Math.sin((f + i * 8) / 5)} fill={C.gold} opacity={cl((f - out - 14) / 6) * 0.9} />)}</svg>
      </div>
    </>
  );
};

const Ad = () => {
  const frame = useCurrentFrame();
  const sc = (S, a, b, extra = {}) => <Scene key={a} frame={frame} a={a} b={b} {...extra}>{(f) => <S f={f} />}</Scene>;
  return (
    <AbsoluteFill style={{background: "#fff"}}>
      {/* grupo azul 1: fundo e moedas contínuos de 0 a 8 s */}
      <Group frame={frame} a={0} b={7.9}>{(f) => <CoinLayer list={COINS_A} f={f} a={0} />}</Group>
      {sc(S1, 0, 2.25, {inY: 0})}
      {sc(S2, 2.15, 4.65, {inY: 90})}
      {sc(S3, 4.5, 6.3, {inY: 90})}
      {sc(S4, 6.2, 7.95, {inY: 90})}
      <Cross frame={frame} />
      {sc(S5, 7.8, 8.95)}
      {sc(S6, 8.75, 10.6)}
      {sc(S7, 10.45, 13.25)}
      {/* grupo azul 2: fundo contínuo de 13,1 a 22,0 s */}
      <Group frame={frame} a={13.1} b={22.05}>{(f) => <CoinLayer list={[{sym: "%", s: 140, bl: 2, t0: 13.1, P: [[13.1, 960, 260], [22, 1000, 500]]}, {sym: "$", s: 240, bl: 5, t0: 13.2, P: [[13.2, 110, 1740], [22, 60, 1600]]}]} f={f} a={13.1} />}</Group>
      {sc(S8, 13.1, 16.95, {inY: 80})}
      {sc(S9, 16.75, 19.8)}
      {sc(S10, 19.9, 22.0, {push: 21.5})}
      {sc(S11, 21.5, 24.55, {wipe: true})}
      {sc(S12, 24.4, 30)}
      <Audio src={staticFile("narracao.mp3")} volume={1} />
      <Audio src={staticFile("bed.wav")} volume={(fr) => (fr / 30 < 27.9 ? 0.55 : 0.85)} />
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <>
    <Composition id="DiegoMudancas" component={DiegoFilm} durationInFrames={DIEGO_DURATION * 30} fps={30} width={1080} height={1920} />
    <Composition id="Equipe02" component={Equipe02} durationInFrames={Math.round(EQUIPE_DURATION * EQ_FPS)} fps={EQ_FPS} width={1080} height={1920} />
    <Composition id="Descarregar" component={Descarregar} durationInFrames={Math.round(DESC_DURATION * DESC_FPS)} fps={DESC_FPS} width={1080} height={1920} />
    <Composition id="HeroV2Desktop" component={HeroScene} durationInFrames={HERO_T * 30} fps={30} width={1920} height={1080} defaultProps={{mobile: false}} />
    <Composition id="HeroV2Mobile" component={HeroScene} durationInFrames={HERO_T * 30} fps={30} width={1080} height={1920} defaultProps={{mobile: true}} />
    <Composition id="ProtectV2" component={ProtectScene} durationInFrames={Math.round(PROT_T * 30)} fps={30} width={1080} height={1080} />
    <Composition id="HeroReal" component={HeroReal} durationInFrames={Math.round(HERO3_T * 30)} fps={30} width={1080} height={1440} />
    <Composition id="SvHome" component={SvHome} durationInFrames={SV_T * 30} fps={30} width={1080} height={1440} />
    <Composition id="SvWrap" component={SvWrap} durationInFrames={SV_T * 30} fps={30} width={1080} height={1080} />
    <Composition id="SvTruck" component={SvTruck} durationInFrames={SV_T * 30} fps={30} width={1440} height={960} />
    <Composition id="SvStorage" component={SvStorage} durationInFrames={SV_T * 30} fps={30} width={1080} height={1440} />
    <Composition id="SiteHeroDesktop" component={HeroLoop} durationInFrames={240} fps={30} width={1920} height={1080} defaultProps={{mobile: false}} />
    <Composition id="SiteHeroMobile" component={HeroLoop} durationInFrames={240} fps={30} width={1080} height={1920} defaultProps={{mobile: true}} />
    <Composition id="SiteJourney" component={JourneyLoop} durationInFrames={JOURNEY_T * 30} fps={30} width={1080} height={1080} />
    <Composition id="SiteProtect" component={ProtectLoop} durationInFrames={PROTECT_T * 30} fps={30} width={1080} height={1080} />
    <Composition id="Anuncio" component={Ad} durationInFrames={900} fps={30} width={1080} height={1920} />
    <Composition id="ConttroleMotionV3" component={MotionV3} durationInFrames={6 * FPS_V3} fps={FPS_V3} width={1080} height={1920} />
    <Composition id="ConttroleMotionV2" component={MotionV2} durationInFrames={6 * FPS_V2} fps={FPS_V2} width={1080} height={1920} />
  </>
));

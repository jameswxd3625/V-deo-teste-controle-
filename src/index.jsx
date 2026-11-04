import React from "react";
import {registerRoot, Composition, AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, interpolate} from "remotion";
import {C, FONT, BlueBg, WhiteBg, Scene, Coin, Card, Draw, Words, pop, slide, sec, ease} from "./parts";
import {CoinArrows, IconTech, IconAI, IconChart, Check, Building, Gear, Hammer, GavelBase, Man} from "./icons";

const cl = (v) => Math.max(0, Math.min(1, v));
const Logo = ({w = 780, f = 0, at = 0}) => {
  const p = pop(f, at, 20);
  return (
    <div style={{width: w, height: (w * 286) / 793, borderRadius: w * 0.07, overflow: "hidden", transform: `scale(${p})`, boxShadow: "0 30px 60px rgba(5,31,110,0.35), 0 0 0 3px rgba(255,255,255,0.8)"}}>
      <Img src={staticFile("logo.png")} style={{width: "100%", height: "100%", display: "block"}} />
    </div>
  );
};
const Center = ({children, y = 0, style}) => (
  <div style={{position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${y}px)`, ...style}}>{children}</div>
);
const Flash = ({f, at = 0, dur = 14}) => <div style={{position: "absolute", inset: 0, background: "#fff", opacity: Math.max(0, 1 - (f - at) / dur)}} />;

// ---- S1: 12% de imposto ----
const S1 = ({f}) => (
  <>
    <BlueBg f={f} />
    <Coin x={870} y={300} s={260} sym="%" f={f} ph={0} at={2} />
    <Coin x={160} y={420} s={110} sym="%" f={f} ph={20} at={6} blur={2} />
    <Coin x={930} y={1250} s={150} sym="%" f={f} ph={40} at={8} blur={1} />
    <Coin x={110} y={1620} s={330} sym="%" f={f} ph={60} at={4} blur={5} />
    <Coin x={780} y={1700} s={120} sym="%" f={f} ph={80} at={10} />
    <Center y={-60}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 420, color: "#fff", letterSpacing: -14, lineHeight: 1, transform: `scale(${0.7 + 0.3 * pop(f, 0, 18)})`, opacity: cl(f / 6), textShadow: "0 20px 50px rgba(0,10,60,0.5)"}}>12%</div>
      <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 130, color: "#fff", opacity: cl((f - 25) / 8), transform: `translateY(${(1 - slide(f, 25)) * 40}px)`}}>de <b style={{fontWeight: 900}}>imposto</b></div>
      <div style={{position: "relative", width: 700, height: 60}}><Draw d="M10 30 C 160 6, 380 50, 690 14" p={slide(f, 38, 22)} w={700} h={60} width={11} /></div>
    </Center>
  </>
);

// ---- S2: pagar esse valor todos os meses ----
const S2 = ({f}) => (
  <>
    <BlueBg f={f} />
    <Coin x={140} y={330} s={200} sym="$" f={f} ph={5} at={0} />
    <Coin x={930} y={480} s={130} sym="$" f={f} ph={30} at={4} />
    <Coin x={960} y={1500} s={330} sym="$" f={f} ph={55} at={2} blur={4} />
    <Coin x={150} y={1380} s={120} sym="$" f={f} ph={70} at={6} />
    <Coin x={540} y={1760} s={170} sym="$" f={f} ph={10} at={8} blur={3} />
    <Card x={540} y={940} w={900} h={480} rot={-5} scale={0.85 + 0.15 * pop(f, 0, 18)} style={{padding: "0 60px", gap: 40}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 210, color: "#fff", textShadow: "0 8px 20px rgba(0,10,60,0.4)"}}>$</div>
      <Words items={[{t: "pagar", at: 2.6}, {t: "esse", at: 2.94}, {t: "valor", at: 3.2}, {t: "todos", at: 3.46}, {t: "os", at: 3.9}, {t: "meses", at: 4.22, gold: true}]} f={f} a={2.15} size={86} justify="flex-start" style={{flex: 1}} />
    </Card>
    <Center y={-520}><Words items={[{t: "Imagine", at: 2.26}]} f={f} a={2.15} size={120} color="#cfe0ff" /></Center>
  </>
);

// ---- S3: faturamento ----
const S3 = ({f}) => {
  const p = slide(f, 14, 40);
  const pts = [[0, 330], [90, 290], [170, 310], [260, 230], [340, 250], [430, 150], [520, 90]];
  const d = "M" + pts.map((q) => q.join(" ")).join(" L");
  return (
    <>
      <BlueBg f={f} />
      <Coin x={960} y={140} s={130} sym="$" f={f} ph={9} at={0} blur={2} />
      <Coin x={120} y={1500} s={260} sym="$" f={f} ph={39} at={3} blur={4} />
      <Center y={-560}><Words items={[{t: "sobre", at: 4.52}, {t: "o", at: 4.78}, {t: "faturamento", at: 4.92, gold: true}]} f={f} a={4.5} size={110} /></Center>
      <Card x={540} y={1010} w={900} h={720} rot={3} scale={0.85 + 0.15 * pop(f, 4, 18)} style={{flexDirection: "column", alignItems: "flex-start", padding: "50px 60px"}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 64, color: "#fff"}}>Faturamento</div>
        <div style={{position: "relative", width: 560, height: 380, marginTop: 40, marginLeft: 70}}>
          <svg width="560" height="380" style={{position: "absolute", overflow: "visible"}}>
            {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="560" y1={60 + i * 90} y2={60 + i * 90} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />)}
            <path d={`${d} L520 380 L0 380 Z`} fill="rgba(246,181,42,0.18)" style={{clipPath: `inset(0 ${100 - p * 100}% 0 0)`}} />
          </svg>
          <Draw d={d} p={p} w={560} h={380} width={14} />
        </div>
      </Card>
      <Center y={640}><Words items={[{t: "da", at: 5.38}, {t: "sua", at: 5.7}, {t: "empresa", at: 5.86}]} f={f} a={4.5} size={100} color="#cfe0ff" /></Center>
    </>
  );
};

// ---- S4: achar que é normal ----
const S4 = ({f}) => (
  <>
    <BlueBg f={f} />
    <div style={{position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 420, color: "rgba(255,255,255,0.14)", transform: `translateX(${(1 - slide(f, 0, 24)) * -200}px)`}}>-12%</div>
    <div style={{position: "absolute", left: 90, top: 1560, transform: `scale(${pop(f, 14, 16)})`}}><Check size={160} rot={10} /></div>
    <div style={{position: "absolute", left: 140, top: 520, transform: `translateY(${(1 - slide(f, 0, 22)) * 300}px)`}}><Man size={800} f={f} /></div>
    <Center y={-640}><Words items={[{t: "e", at: 6.28}, {t: "achar", at: 6.6}, {t: "que", at: 6.9}, {t: "é", at: 7.0}, {t: "normal.", at: 7.06, gold: true}]} f={f} a={6.2} size={120} /></Center>
  </>
);

// ---- S5: logo ----
const S5 = ({f}) => (
  <>
    <WhiteBg f={f} />
    <Draw d="M540 560 a 400 400 0 1 1 -0.1 0" p={slide(f, 4, 30)} w={1080} h={1920} stroke="#9fb2d8" width={5} glow={false} />
    <Center y={0}>
      <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 80, color: C.navy, opacity: cl((f - 2) / 8), marginBottom: 50}}>Na</div>
      <Logo w={820} f={f} at={4} />
    </Center>
    <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>{[[780, 840], [300, 1100], [860, 1080]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6 + 6 * Math.sin((f + i * 8) / 5)} fill={C.gold} opacity={cl((f - 12) / 6) * 0.9} />)}</svg>
    <Flash f={f} dur={10} />
  </>
);

// ---- S6: analisamos suas atividades ----
const S6 = ({f}) => (
  <>
    <WhiteBg f={f} />
    <div style={{position: "absolute", left: 330, top: 380, transform: `scale(${pop(f, 0, 20)}) rotate(${(1 - pop(f, 0, 20)) * -25}deg)`}}><CoinArrows size={420} f={f} /></div>
    <Center y={330}><Words items={[{t: "analisamos", at: 8.8}, {t: "suas", at: 9.32}, {t: "atividades", at: 9.54, gold: true}]} f={f} a={8.75} size={150} color={C.navy} from="right" style={{width: 900}} /></Center>
  </>
);

// ---- S7: regime tributário / toda a operação ----
const S7 = ({f}) => {
  const swap = sec(11.5) - sec(10.45);
  const A = 1 - cl((f - swap) / 8), B = cl((f - swap - 4) / 10);
  return (
    <>
      <WhiteBg f={f} />
      <div style={{opacity: A, position: "absolute", inset: 0, transform: `translateX(${-cl((f - swap) / 8) * 200}px)`}}>
        <Center y={-80}>
          <Words items={[{t: "seu", at: 10.52}, {t: "regime", at: 10.6, gold: true}, {t: "tributário", at: 10.92}]} f={f} a={10.45} size={160} color={C.navy} />
        </Center>
        <svg width="1080" height="400" style={{position: "absolute", left: 0, top: 1100}}>{[0, 1, 2].map((i) => <path key={i} d={`M${330 + i * 140} 40 l90 100 -90 100`} fill="none" stroke={C.royal} strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" opacity={cl((f - 6 - i * 5) / 8)} />)}</svg>
      </div>
      <div style={{opacity: B, position: "absolute", inset: 0}}>
        {[300, 440, 580].map((r, i) => <Draw key={i} d={`M${540 - r} 960 a ${r} ${r} 0 1 1 ${2 * r} 0`} p={slide(f, swap + 4 + i * 5, 26)} stroke={i === 1 ? C.gold : C.royal} width={i === 1 ? 9 : 6} glow={i === 1} />)}
        <Center y={-30}><Words items={[{t: "e", at: 11.6}, {t: "toda", at: 11.86}, {t: "a", at: 12.18}, {t: "operação", at: 12.34, gold: true}]} f={f} a={10.45} size={150} color={C.navy} /></Center>
      </div>
    </>
  );
};

// ---- S8: tecnologia / IA / análise ----
const S8 = ({f}) => {
  const rows = [[IconTech, "tecnologia", 13.32], [IconAI, "inteligência artificial", 14.32], [IconChart, "análise contábil", 15.66]];
  return (
    <>
      <BlueBg f={f} />
      <Coin x={950} y={300} s={140} sym="%" f={f} ph={2} at={0} blur={2} />
      <Coin x={110} y={1700} s={240} sym="$" f={f} ph={30} at={2} blur={5} />
      <Center y={-640}><Words items={[{t: "Com", at: 13.2}]} f={f} a={13.1} size={110} color="#cfe0ff" /></Center>
      {rows.map(([Ic, label, at], i) => {
        const p = slide(f, sec(at) - sec(13.1) - 4, 20);
        return (
          <Card key={label} x={540 + (1 - p) * 700} y={650 + i * 340} w={900} h={270} rot={0} style={{padding: "0 50px", gap: 40, opacity: p}}>
            <Ic size={170} /><div style={{fontFamily: FONT, fontWeight: 700, fontSize: label.length > 12 ? 70 : 90, color: "#fff", lineHeight: 1.05}}>{label}</div>
          </Card>
        );
      })}
    </>
  );
};

// ---- S9: estrutura mais eficiente ----
const S9 = ({f}) => (
  <>
    <BlueBg f={f} />
    {[[900, 360, 190, 14, 0], [160, 780, 140, -18, 6], [930, 1260, 170, 8, 12], [170, 1620, 220, -8, 3], [820, 1750, 120, 20, 9]].map(([x, y, s, r, at], i) => (
      <div key={i} style={{position: "absolute", left: x - s / 2, top: y - s / 2 + Math.sin((f + i * 12) / 20) * 14, transform: `scale(${pop(f, at, 16)})`, filter: i === 3 ? "blur(4px)" : undefined}}><Check size={s} rot={r} /></div>
    ))}
    <Center y={-40}>
      <Words items={[{t: "buscamos", at: 16.96, color: "#cfe0ff"}]} f={f} a={16.75} size={100} from="right" />
      <Words items={[{t: "uma", at: 17.3}, {t: "estrutura", at: 17.48}]} f={f} a={16.75} size={150} from="right" />
      <Words items={[{t: "mais", at: 17.92}, {t: "eficiente", at: 18.26, gold: true}]} f={f} a={16.75} size={150} from="right" />
      <Words items={[{t: "para a sua empresa", at: 18.82, color: "#cfe0ff"}]} f={f} a={16.75} size={90} from="right" style={{marginTop: 30}} />
    </Center>
  </>
);

// ---- S10: sempre dentro da lei ----
const S10 = ({f}) => {
  const hit = sec(20.55) - sec(19.8);
  const rot = f < hit ? -40 + ease(cl(f / hit)) * 40 : -Math.max(0, 8 - (f - hit)) * 1.5;
  return (
    <>
      <BlueBg f={f} />
      <div style={{position: "absolute", left: 220, top: 1180, transform: `scale(${pop(f, 2, 18)})`}}><GavelBase w={640} /></div>
      <div style={{position: "absolute", left: 250, top: 640, transform: `translateY(${f >= hit ? Math.sin((f - hit) * 1.4) * Math.max(0, 6 - (f - hit) / 3) : 0}px)`, opacity: cl(f / 6)}}><Hammer size={560} rot={rot} /></div>
      <div style={{position: "absolute", left: 540 - 430 + 40, top: 1150, width: 700, height: 60, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(246,181,42,${f >= hit ? 0.7 * Math.max(0, 1 - (f - hit) / 14) : 0}), transparent 70%)`}} />
      <Center y={-520}><Words items={[{t: "sempre", at: 20.0}, {t: "dentro", at: 20.36}, {t: "da", at: 20.76}, {t: "lei.", at: 21.0, gold: true}]} f={f} a={19.8} size={140} /></Center>
    </>
  );
};

// ---- S11: vai abrir sua empresa? / comece do jeito certo ----
const S11 = ({f}) => {
  const swap = sec(22.8) - sec(21.4);
  const A = 1 - cl((f - swap) / 8), B = cl((f - swap - 3) / 10);
  const sh = slide(f, 0, 22);
  return (
    <>
      <WhiteBg f={f} />
      <div style={{position: "absolute", left: 375, top: 190 + (1 - sh) * -200 - B * 40}}><Building size={330} /></div>
      <div style={{position: "absolute", left: 330, top: 1380 + (1 - sh) * 300, }}><Gear size={420} rot={f * 1.2} /></div>
      <div style={{position: "absolute", inset: 0, opacity: A}}><Center y={0}><Words items={[{t: "Vai", at: 21.58}, {t: "abrir", at: 21.68}, {t: "sua", at: 21.94}, {t: "empresa?", at: 22.12}]} f={f} a={21.4} size={140} color={C.navy} style={{width: 900}} /></Center></div>
      <div style={{position: "absolute", inset: 0, opacity: B}}>
        <Center y={0}>
          <Words items={[{t: "Comece", at: 22.88}, {t: "do", at: 23.32}]} f={f} a={21.4} size={150} color={C.navy} />
          <Words items={[{t: "jeito", at: 23.48}, {t: "certo.", at: 23.72, gold: true}]} f={f} a={21.4} size={150} color={C.navy} />
          <div style={{position: "relative", width: 620, height: 50}}><Draw d="M10 25 C 150 5, 380 40, 610 12" p={slide(f, sec(23.8) - sec(21.4), 20)} w={620} h={50} width={11} /></div>
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
        <Center y={0}>
          <Words items={[{t: "Abra", at: 24.6}, {t: "seu", at: 24.86, gold: true}, {t: "CNPJ", at: 25.02, gold: true}]} f={f} a={24.4} size={170} color={C.navy} />
          <div style={{position: "relative", width: 760, height: 50}}><Draw d="M10 28 C 180 6, 440 44, 750 12" p={slide(f, sec(25.1) - sec(24.4), 20)} w={760} h={50} width={12} /></div>
          <Words items={[{t: "com", at: 25.8}, {t: "a", at: 26.12}, {t: "Conttrole", at: 26.22, color: C.royal}]} f={f} a={24.4} size={150} color={C.navy} style={{marginTop: 30}} />
          <Words items={[{t: "Contabilidade", at: 26.84, color: C.navy}]} f={f} a={24.4} size={120} weight={500} />
        </Center>
      </div>
      <div style={{position: "absolute", inset: 0, opacity: L}}>
        <Draw d="M540 560 a 400 400 0 1 1 -0.1 0" p={slide(f, out + 6, 28)} stroke="#9fb2d8" width={5} glow={false} />
        <Center y={0}><Logo w={820} f={f} at={out + 6} /></Center>
        <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>{[[800, 850], [280, 1110], [880, 1090]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6 + 6 * Math.sin((f + i * 8) / 5)} fill={C.gold} opacity={cl((f - out - 14) / 6) * 0.9} />)}</svg>
      </div>
    </>
  );
};

const SCENES = [[S1, 0, 2.25], [S2, 2.15, 4.65], [S3, 4.5, 6.3], [S4, 6.2, 7.95], [S5, 7.8, 8.95], [S6, 8.75, 10.6], [S7, 10.45, 13.25], [S8, 13.1, 16.95], [S9, 16.75, 19.95], [S10, 19.8, 21.55], [S11, 21.4, 24.55], [S12, 24.4, 30]];

const Ad = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: "#fff"}}>
      {SCENES.map(([S, a, b], i) => <Scene key={i} frame={frame} a={a} b={b}>{(f) => <S f={f} />}</Scene>)}
      <Audio src={staticFile("narracao.mp3")} volume={1} />
      <Audio src={staticFile("bed.wav")} volume={(fr) => {
        // trilha mais baixa durante a fala (0–27,9 s)
        const s = fr / 30;
        return s < 27.9 ? 0.55 : 0.85;
      }} />
    </AbsoluteFill>
  );
};

registerRoot(() => <Composition id="Anuncio" component={Ad} durationInFrames={900} fps={30} width={1080} height={1920} />);

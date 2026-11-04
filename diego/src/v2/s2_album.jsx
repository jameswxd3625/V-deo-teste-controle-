import React from "react";
import {AbsoluteFill} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, wob, FONT} from "../lib";
import {Scene3D, G, Face, Cuboid, Ground} from "./three";
import {Box3D, Sofa3D, AlbumClosed3D, ALB, Fragile} from "./props3d";
import {OldRoom, LampBB, PlantBB, Human, HandTop, AlbumFlat} from "./env3d";
import {Person, PAULO, PAULO_YOUNG, PAULO_GOWN, ANA, KID, mixPose} from "./Person";

// ---------------- fotos ilustradas (mesmos personagens) ----------------
const Sky = ({a = "#9CC9EE", b = "#E6F2FB", id}) => (<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs><rect width="400" height="300" fill={`url(#${id})`} /></>);
export const PhotoHouse = ({id = "ph"}) => (
  <g>
    <Sky id={`${id}s`} />
    <path d="M 0 214 Q 200 196 400 216 L 400 300 L 0 300 Z" fill="#7DB36A" />
    <rect x={160} y={96} width={210} height={130} fill="#F6F1E7" /><path d="M 146 104 L 265 40 L 384 104 Z" fill="#C2583A" />
    <rect x={250} y={150} width={46} height={76} fill="#6B4430" /><rect x={182} y={128} width={44} height={40} fill="#9CC9EE" stroke="#fff" strokeWidth={5} /><rect x={312} y={128} width={44} height={40} fill="#9CC9EE" stroke="#fff" strokeWidth={5} />
    <Person c={ANA} x={70} y={292} s={0.2} e={{smile: 0.8, open: 0.4}} pose={{armR: [-30, -40]}} shadow={false} />
    <Person c={KID} x={118} y={292} s={0.14} e={{smile: 0.9, open: 0.5}} pose={{armL: [150, 10]}} shadow={false} />
    <Person c={PAULO_YOUNG} x={178} y={292} s={0.21} e={{smile: 0.85, open: 0.5}} pose={{armR: [-160, -10], handR: "grip"}} shadow={false} />
    <g transform="translate(212 76)"><circle r={7} fill="none" stroke="#E2B45E" strokeWidth={3} /><path d="M 5 5 L 16 18 M 12 13 L 16 10" stroke="#E2B45E" strokeWidth={3} /></g>
  </g>
);
const PhotoBuilding = ({id = "pb"}) => (
  <g>
    <Sky id={`${id}s`} a="#B8C7DA" b="#EEF2F6" />
    <rect x={90} y={30} width={220} height={270} fill="#D9C7A8" />
    {Array.from({length: 4}, (_, r) => Array.from({length: 3}, (_, c) => <g key={`${r}${c}`}><rect x={110 + c * 68} y={48 + r * 58} width={44} height={36} fill="#7E97B5" /><rect x={104 + c * 68} y={86 + r * 58} width={56} height={6} fill="#A8957A" /></g>))}
    <rect x={170} y={250} width={60} height={50} fill="#5A3D2C" /><path d="M 0 290 L 400 290 L 400 300 L 0 300 Z" fill="#8A8F99" />
  </g>
);
const PhotoGrad = ({id = "pg"}) => (
  <g>
    <Sky id={`${id}s`} a="#C9D9EA" b="#F4F1EA" />
    <rect x={0} y={214} width={400} height={86} fill="#B8A890" />
    <Person c={ANA} x={140} y={292} s={0.2} e={{smile: 0.9, open: 0.5}} pose={{armR: [-50, -70]}} shadow={false} />
    <Person c={PAULO_GOWN} x={245} y={292} s={0.215} e={{smile: 0.95, open: 0.65}} pose={{armR: [-170, 0], handR: "grip", head: -4}} shadow={false} />
    <g transform="translate(245 98)"><path d="M -32 -4 L 0 -16 L 32 -4 L 0 8 Z" fill="#111" /><rect x={-16} y={-2} width={32} height={10} fill="#111" /><path d="M 26 -4 L 32 16" stroke="#E2B45E" strokeWidth={2.5} /></g>
    <g transform="translate(281 54) rotate(-20)"><rect x={-24} y={-6} width={48} height={12} rx={6} fill="#F6EFDF" /><rect x={-4} y={-7} width={8} height={14} fill="#C0262D" /></g>
  </g>
);
const PhotoPaint = ({id = "pp"}) => (
  <g>
    <rect width="400" height="300" fill="#EDE6DA" /><rect x={0} y={0} width={230} height={244} fill="#5F8FD6" />
    <rect x={0} y={244} width={400} height={56} fill="#B38A62" />
    <Person c={PAULO_YOUNG} x={150} y={292} s={0.21} e={{smile: 0.8, open: 0.4}} pose={{armR: [-165, -15], handR: "grip", turn: 0.3}} shadow={false} />
    <g transform="translate(176 48)"><rect x={-4} y={0} width={8} height={40} fill="#555" /><rect x={-22} y={-14} width={44} height={16} rx={6} fill="#4C7FD0" /></g>
    <Person c={ANA} x={290} y={292} s={0.2} e={{smile: 0.85, open: 0.6}} pose={{armL: [60, -60]}} shadow={false} />
    <rect x={318} y={252} width={30} height={34} rx={4} fill="#DADDE2" /><rect x={318} y={252} width={30} height={8} fill="#5F8FD6" />
  </g>
);

// foto montada na página (HTML)
const Pic = ({x, y, w, h, rot = 0, cap, children}) => (
  <div style={{position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, background: "#FFFDF8", boxShadow: "0 10px 22px rgba(60,30,10,0.28)"}}>
    <svg style={{position: "absolute", left: 16, top: 16}} width={w - 32} height={h - 32 - (cap ? 54 : 0)} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">{children}<rect width="400" height="300" fill="#FFB25E" opacity={0.1} /></svg>
    {cap && <div style={{position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontWeight: 800, fontSize: 34, color: "#5A3A26"}}>{cap}</div>}
    {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b], i) => <div key={i} style={{position: "absolute", width: 0, height: 0, [a ? "right" : "left"]: 0, [b ? "bottom" : "top"]: 0, borderStyle: "solid", borderWidth: 22, borderColor: `${b ? "transparent" : "#2B1D14"} ${a ? "#2B1D14" : "transparent"} ${b ? "#2B1D14" : "transparent"} ${a ? "transparent" : "#2B1D14"}`, opacity: 0.85}} />)}
  </div>
);
const PW = 600, PD = 780;
const PageBg = ({side}) => (
  <div style={{position: "absolute", inset: 0, background: "#F3EADB"}}>
    <div style={{position: "absolute", top: 0, bottom: 0, width: 90, [side < 0 ? "right" : "left"]: 0, background: `linear-gradient(${side < 0 ? 270 : 90}deg, rgba(0,0,0,0.22), transparent)`}} />
  </div>
);
const A_L = () => <><PageBg side={-1} /><Pic x={300} y={380} w={500} h={520} rot={-2.5} cap="Nossa casa"><PhotoHouse id="aL" /></Pic></>;
const A_R = () => <><PageBg side={1} /><Pic x={300} y={330} w={420} h={430} rot={3} cap="Primeiro endereço"><PhotoBuilding id="aR" /></Pic><div style={{position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontWeight: 800, fontSize: 40, color: "#8A6A52"}}>2009</div></>;
const B_L = () => <><PageBg side={-1} /><Pic x={300} y={380} w={500} h={520} rot={2} cap="Formatura"><PhotoGrad id="bL" /></Pic></>;
const B_R = () => <><PageBg side={1} /><Pic x={300} y={390} w={500} h={520} rot={-3} cap="Mãos à obra"><PhotoPaint id="bR" /></Pic></>;
const CoverArt = () => (
  <div style={{position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 30% 20%, #96502E, ${ALB.cover} 55%, ${ALB.coverD})`, borderRadius: 14}}>
    <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "rgba(0,0,0,0.25)"}} />
    <div style={{position: "absolute", left: 100, right: 50, top: 60, bottom: 60, border: `3px dashed ${ALB.gold}`, borderRadius: 10, opacity: 0.85}} />
    <div style={{position: "absolute", left: 60, right: 0, top: 300, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: ALB.gold}}>Nossa<br />Família</div>
  </div>
);
// folha: gira em torno da lombada (eixo z em x=0). ang 0 = deitada à direita; 180 = à esquerda
const Leaf = ({ang, front, back, lift = 0}) => (
  <G rz={-ang}>
    <G x={PW / 2} y={-2 - lift}>
      <Face w={PW} h={PD} tf="rotateX(90deg)">{front}</Face>
      <Face w={PW} h={PD} tf="rotateX(-90deg) rotateZ(180deg)">{back}</Face>
    </G>
  </G>
);

const HOLD = {spine: 3, head: 18, turn: 0.05, ikL: [-112, -585], ikR: [112, -585], wristL: 170, wristR: -170, foreL: 0.42, foreR: 0.42, handL: "thumb", handR: "thumb", armsOver: true};
const LOOK_BOX = {spine: 10, head: 20, turn: 0.55, ikR: [300, -500], wristR: -20, handR: "open", armL: [8, -20]};

export const Shot2 = ({t}) => {
  // ===== G1/G3: Paulo com a caixa e com o álbum (3D) =====
  if (t < 15.9 || (t >= 17.4 && t < 19.5)) {
    const g1 = t < 15.9;
    const cam = g1
      ? KO(t, [[14.5, {tx: 80, ty: -560, tz: 0, yaw: 10, pitch: 4, dist: 1750, persp: 1500}], [15.9, {tx: 150, ty: -520, tz: 0, yaw: 16, pitch: 10, dist: 1350, persp: 1400}]], ES)
      : KO(t, [[17.4, {tx: -100, ty: -720, tz: 0, yaw: 4, pitch: 2, dist: 1300, persp: 1500}], [19.5, {tx: -100, ty: -760, tz: 0, yaw: 2, pitch: 1, dist: 820, persp: 1500}]], ES);
    const reach = P(t, 14.75, 15.5, EIO);
    const pose = g1 ? mixPose({spine: 2, head: 6, turn: 0.3, armL: [10, -8], armR: [-12, 10]}, LOOK_BOX, reach) : HOLD;
    const soft = P(t, 17.6, 18.6, EIO);
    const e = g1 ? {smile: 0.1, look: [0.7, 0.8], brow: reach * 0.35} : {smile: mix(0.25, 0.6, soft), brow: mix(0.1, 0.35, soft), look: [0, 1], blink: t > 18.35 && t < 18.6 ? 0.9 : mix(0.2, 0.45, soft)};
    return (
      <AbsoluteFill style={{background: "#1A2036"}}>
        <Scene3D cam={cam}>
          <OldRoom />
          <Sofa3D x={250} z={-950} cover={0} />
          <LampBB x={950} z={-900} yaw={cam.yaw} />
          <G x={-800} z={-500}><Box3D seed={11} /><G y={-260}><Box3D w={280} h={220} d={260} seed={12} ry={6} /></G></G>
          <G x={g1 ? 300 : 420} z={0}><Box3D seed={13} /><G y={-260}><Box3D w={300} h={220} d={280} flaps={P(t, 14.5, 14.9, EO) * (g1 ? 1 : 1)} seed={14} inside={g1 ? <G y={60}><AlbumClosed3D /></G> : null} /></G></G>
          <Human c={PAULO} x={-100} z={0} yaw={cam.yaw} pose={pose} e={e}
            hold={g1 ? undefined : () => <AlbumFlat x={0} y={-585} w={236} h={296} rot={-2} />} />
        </Scene3D>
        {!g1 && <AbsoluteFill style={{background: "radial-gradient(70% 50% at 50% 45%, rgba(255,180,100,0.16), transparent 70%)", opacity: soft, mixBlendMode: "screen"}} />}
        {!g1 && Array.from({length: 24}, (_, i) => {
          const px = (i * 173) % 1080, py = (((i * 397) % 1920) - (t - 17.4) * (12 + (i % 5) * 5) + 1920) % 1920;
          return <div key={i} style={{position: "absolute", left: px + Math.sin(t + i) * 12, top: py, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: "50%", background: "#FFE2B0", opacity: 0.35 * soft}} />;
        })}
      </AbsoluteFill>
    );
  }
  // ===== G2: mãos retiram o álbum da caixa (close de cima) =====
  if (t < 17.4) {
    const lift = P(t, 16.25, 17.2, EIO);
    const handIn = P(t, 15.9, 16.3, EO);
    const sc = mix(1, 1.32, lift);
    const z = mix(1, 1.06, P(t, 15.9, 17.4, ES));
    return (
      <AbsoluteFill style={{background: "#8F5E2E"}}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <g transform={`translate(540 960) scale(${z}) translate(-540 -960)`}>
            {/* interior da caixa */}
            <rect width="1080" height="1920" fill="#C99258" />
            <rect x={120} y={360} width={840} height={1200} fill="#5E3E1F" />
            <path d="M 120 360 L 960 360 L 900 420 L 180 420 Z" fill="#7A532C" /><path d="M 120 1560 L 960 1560 L 900 1500 L 180 1500 Z" fill="#4A3018" />
            <path d="M 120 360 L 180 420 L 180 1500 L 120 1560 Z" fill="#6A4524" /><path d="M 960 360 L 900 420 L 900 1500 L 960 1560 Z" fill="#553719" />
            {/* papel amassado */}
            {[[240, 520, 70], [820, 600, 80], [300, 1380, 90], [780, 1400, 70], [520, 1450, 60]].map(([x, y, r], i) => <path key={i} d={`M ${x - r} ${y} Q ${x - r * 0.4} ${y - r} ${x + r * 0.2} ${y - r * 0.8} Q ${x + r} ${y - r * 0.3} ${x + r * 0.8} ${y + r * 0.4} Q ${x} ${y + r} ${x - r * 0.7} ${y + r * 0.5} Z`} fill="#E9E1D2" opacity={0.9} />)}
            {/* sombra do álbum que cresce ao subir */}
            <rect x={540 - 230 + lift * 40} y={960 - 290 + lift * 60} width={460} height={580} rx={18} fill="#000" opacity={0.45 - lift * 0.2} filter="url(#v2soft)" />
            <g transform={`translate(540 960) scale(${sc}) rotate(${mix(-4, 2, lift)}) translate(-540 -960)`}>
              <AlbumFlat x={540} y={960} w={460} h={580} />
              {/* mãos: polegares sobre a capa, dedos por baixo */}
              <g opacity={handIn}>
                <HandTop x={mix(250, 330, handIn)} y={mix(1500, 1190, handIn)} rot={16} s={0.72} side={-1} mode="grip" />
                <HandTop x={mix(830, 750, handIn)} y={mix(1500, 1190, handIn)} rot={-16} s={0.72} side={1} mode="grip" />
              </g>
            </g>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  // ===== H/I: álbum aberto (3D, de cima) =====
  const open = P(t, 19.62, 20.4, EIO);
  const flip = P(t, 24.3, 25.0, EIO);
  const close = P(t, 28.95, 29.6, EIO);
  const cam = KO(t, [
    [19.5, {tx: 300, ty: 0, tz: 0, yaw: 0, pitch: 88, dist: 1250, persp: 1500}],
    [20.5, {tx: 0, ty: 0, tz: 40, yaw: 0, pitch: 72, dist: 1750, persp: 1500}],
    [22.9, {tx: 0, ty: 0, tz: 40, yaw: 0, pitch: 70, dist: 1680, persp: 1500}],
    [23.6, {tx: -300, ty: 0, tz: -10, yaw: 0, pitch: 80, dist: 1080, persp: 1500}],
    [24.2, {tx: -300, ty: 0, tz: -10, yaw: 0, pitch: 80, dist: 1050, persp: 1500}],
    [24.9, {tx: -300, ty: 0, tz: -10, yaw: 0, pitch: 80, dist: 1060, persp: 1500}],
    [25.9, {tx: -300, ty: 0, tz: -10, yaw: 0, pitch: 80, dist: 1020, persp: 1500}],
    [26.6, {tx: 300, ty: 0, tz: 0, yaw: 0, pitch: 80, dist: 1060, persp: 1500}],
    [28.3, {tx: 300, ty: 0, tz: 0, yaw: 0, pitch: 80, dist: 1000, persp: 1500}],
    [29.0, {tx: 0, ty: 0, tz: 40, yaw: 0, pitch: 72, dist: 1750, persp: 1500}],
    [29.8, {tx: 300, ty: 0, tz: 60, yaw: 0, pitch: 76, dist: 1500, persp: 1500}],
  ], ES);
  // I: álbum entra na caixa e as abas fecham
  if (t >= 30.25) {
    const down = P(t, 30.25, 30.75, EIO);
    const flaps = 1 - P(t, 30.8, 31.15, EIO);
    const tape = P(t, 31.12, 31.42, EIO);
    const camB = KO(t, [[30.25, {tx: 0, ty: -260, tz: 0, yaw: 6, pitch: 60, dist: 1500, persp: 1500}], [31.46, {tx: 0, ty: -300, tz: 0, yaw: 10, pitch: 52, dist: 1250, persp: 1500}]], ES);
    return (
      <AbsoluteFill style={{background: "#1A2036"}}>
        <Scene3D cam={camB}>
          <OldRoom />
          <Box3D x={0} z={0} w={420} h={300} d={380} flaps={flaps} tape={tape} fragile
            inside={<G y={mix(-420, 110, down)}><AlbumClosed3D /></G>} seed={21} />
          {t > 31.25 && <G y={-302} z={60} s={SP(t, 31.25, 16, 0.5)}><Face w={260} h={84} tf="rotateX(90deg) rotateZ(-4deg)"><Fragile w={260} h={84} /></Face></G>}
        </Scene3D>
      </AbsoluteFill>
    );
  }
  const handsRest = P(t, 29.4, 29.95, EO);
  return (
    <AbsoluteFill style={{background: "radial-gradient(80% 60% at 50% 45%, #474B58, #1C1E26)"}}>
      <Scene3D cam={cam}>
        {/* colo / tecido escuro sob o álbum */}
        <Ground w={3600} d={3600} y={60} bg="radial-gradient(closest-side, #3B4150, #232733)" />
        <G y={0}>
          {/* contracapa e bloco de páginas */}
          <G x={PW / 2} y={20}><Cuboid w={PW + 10} h={36} d={PD + 10} col="#EFE4D0" faces={{top: "#F1E7D5", bottom: ALB.coverD}} /></G>
          {open > 0.5 && close < 0.5 && <G x={-PW / 2} y={20}><Cuboid w={PW + 10} h={36} d={PD + 10} col="#EFE4D0" faces={{top: "#F1E7D5", bottom: ALB.coverD}} /></G>}
          {/* página direita sob a folha */}
          <G x={PW / 2} y={-1}><Face w={PW} h={PD} tf="rotateX(90deg)">{flip > 0 ? <B_R /> : <A_R />}</Face></G>
          {/* página esquerda estática */}
          {open >= 1 && close <= 0 && <G x={-PW / 2} y={-1}><Face w={PW} h={PD} tf="rotateX(90deg)">{flip >= 0.5 ? <B_L /> : <A_L />}</Face></G>}
          {flip > 0 && flip < 1 && <Leaf ang={flip * 180} lift={2} front={<A_R />} back={<B_L />} />}
          {(open < 1 || close > 0) && <Leaf ang={close > 0 ? 180 * (1 - close) : open * 180} lift={4} front={<CoverArt />} back={close > 0 ? <B_L /> : <A_L />} />}
          {/* mãos de Paulo segurando as bordas inferiores / repousando sobre a capa */}
          <G y={-16}>
            <Face w={1600} h={1400} tf="rotateX(90deg)" style={{pointerEvents: "none"}} back>
              <svg width="1600" height="1400" viewBox="-800 -700 1600 1400" style={{overflow: "visible"}}>
                {close < 0.3 && <>
                  <HandTop x={-540} y={330} rot={-30} s={0.6} side={-1} mode="grip" />
                  <HandTop x={540} y={330} rot={30} s={0.6} side={1} mode="grip" />
                </>}
                {close >= 0.3 && <>
                  <HandTop x={mix(-60, 160, handsRest)} y={mix(900, 260, handsRest)} rot={-14} s={0.7} side={-1} mode="flat" />
                  <HandTop x={mix(660, 450, handsRest)} y={mix(900, 300, handsRest)} rot={12} s={0.7} side={1} mode="flat" />
                </>}
              </svg>
            </Face>
          </G>
        </G>
      </Scene3D>
      <AbsoluteFill style={{background: "radial-gradient(90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.45))"}} />
    </AbsoluteFill>
  );
};

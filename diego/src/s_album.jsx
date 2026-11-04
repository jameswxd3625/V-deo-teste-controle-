import React from "react";
import {AbsoluteFill} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, FONT} from "./lib";
import {Cam, Stage, Caption, L} from "./ui";
import {Character, PAULO, PAULO_YOUNG, PAULO_GRAD, ANA, KID} from "./Character";
import {ALBUM} from "./props";

// ---------- fotos ilustradas (viewBox 400x300) ----------
const Sky = ({c1 = "#9CC9EE", c2 = "#E6F2FB"}) => (
  <>
    <defs><linearGradient id={`sky${c1}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
    <rect width="400" height="300" fill={`url(#sky${c1})`} />
  </>
);
const PhotoHouse = () => (
  <g>
    <Sky />
    <path d="M 0 210 Q 200 190 400 214 L 400 300 L 0 300 Z" fill="#7DB36A" />
    {/* casa */}
    <rect x={150} y={96} width={210} height={130} fill="#F6F1E7" />
    <path d="M 136 104 L 255 40 L 374 104 Z" fill="#C2583A" />
    <rect x={238} y={150} width={46} height={76} fill="#6B4430" />
    <circle cx={276} cy={190} r={3} fill="#E2B45E" />
    <rect x={172} y={128} width={44} height={40} fill="#9CC9EE" stroke="#fff" strokeWidth={5} />
    <rect x={302} y={128} width={44} height={40} fill="#9CC9EE" stroke="#fff" strokeWidth={5} />
    <path d="M 20 230 C 10 150, 70 130, 80 200 Z" fill="#3E7D45" />
    <g transform="translate(0 4)">
      <Character c={ANA} x={80} y={292} s={0.2} pose={{aA: [10, 0], aB: [-24, -30]}} e={{smile: 0.8, open: 0.5}} shadow={false} />
      <Character c={KID} x={128} y={292} s={0.13} pose={{aA: [150, 10], aB: [-10, 0]}} e={{smile: 0.9, open: 0.6}} shadow={false} />
      <Character c={PAULO_YOUNG} x={186} y={292} s={0.21} pose={{aA: [10, 0], aB: [-150, -10]}} e={{smile: 0.85, open: 0.6}} shadow={false} />
      {/* chaves erguidas */}
      <g transform="translate(222 92)"><circle r={7} fill="none" stroke="#E2B45E" strokeWidth={3} /><path d="M 5 5 L 16 18 M 12 13 L 16 10" stroke="#E2B45E" strokeWidth={3} /></g>
    </g>
  </g>
);
const PhotoBuilding = () => (
  <g>
    <Sky c1="#B8C7DA" c2="#EEF2F6" />
    <rect x={90} y={30} width={220} height={270} fill="#D9C7A8" />
    {Array.from({length: 4}, (_, r) => Array.from({length: 3}, (_, c) => (
      <g key={`${r}${c}`}>
        <rect x={110 + c * 68} y={48 + r * 58} width={44} height={36} fill="#7E97B5" />
        <rect x={104 + c * 68} y={86 + r * 58} width={56} height={6} fill="#A8957A" />
      </g>
    )))}
    <rect x={170} y={250} width={60} height={50} fill="#5A3D2C" />
    <rect x={240} y={262} width={34} height={20} rx={3} fill="#1E2A44" />
    <path d="M 0 290 L 400 290 L 400 300 L 0 300 Z" fill="#8A8F99" />
  </g>
);
const PhotoGrad = () => (
  <g>
    <Sky c1="#C9D9EA" c2="#F4F1EA" />
    <rect x={0} y={210} width={400} height={90} fill="#B8A890" />
    <path d="M 0 60 L 400 60" stroke="#fff" strokeWidth={3} opacity={0.5} />
    <Character c={ANA} x={130} y={292} s={0.2} pose={{aA: [10, 0], aB: [-40, -60]}} e={{smile: 0.9, open: 0.5}} shadow={false} />
    <Character c={PAULO_GRAD} x={240} y={292} s={0.215} pose={{aA: [30, -30], aB: [-170, 0], head: -4}} e={{smile: 0.95, open: 0.7}} shadow={false} />
    {/* capelo */}
    <g transform="translate(240 92)">
      <path d="M -30 -6 L 0 -18 L 30 -6 L 0 6 Z" fill="#111" />
      <rect x={-16} y={-4} width={32} height={10} fill="#111" />
      <path d="M 24 -6 L 30 14" stroke="#E2B45E" strokeWidth={2.5} />
    </g>
    {/* diploma */}
    <g transform="translate(274 54) rotate(-20)"><rect x={-24} y={-6} width={48} height={12} rx={6} fill="#F6EFDF" /><rect x={-4} y={-7} width={8} height={14} fill="#C0262D" /></g>
  </g>
);
const PhotoPaint = () => (
  <g>
    <rect width="400" height="300" fill="#EDE6DA" />
    <rect x={0} y={0} width={230} height={240} fill="#5F8FD6" />
    <path d="M 230 0 L 238 0 L 236 240 L 228 240 Z" fill="#5F8FD6" opacity={0.6} />
    <rect x={0} y={240} width={400} height={60} fill="#B38A62" />
    <Character c={PAULO_YOUNG} x={150} y={292} s={0.21} pose={{aA: [10, 0], aB: [-160, -20], turn: 0.3}} e={{smile: 0.8, open: 0.4}} shadow={false} />
    {/* rolo */}
    <g transform="translate(176 52)"><rect x={-4} y={0} width={8} height={40} fill="#555" /><rect x={-20} y={-14} width={40} height={16} rx={6} fill="#4C7FD0" /></g>
    <Character c={ANA} x={290} y={292} s={0.2} pose={{aA: [40, -60], aB: [-10, 0]}} e={{smile: 0.85, open: 0.6}} shadow={false} />
    <rect x={318} y={250} width={30} height={34} rx={4} fill="#DADDE2" /><rect x={318} y={250} width={30} height={8} fill="#5F8FD6" />
  </g>
);

const Pic = ({x, y, w, h, rot = 0, children, cap}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} fill="#3A2412" opacity={0.28} filter="url(#softShadow)" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#FFFDF8" />
    <svg x={-w / 2 + 16} y={-h / 2 + 16} width={w - 32} height={h - 32 - (cap ? 46 : 0)} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      {children}
      <rect width="400" height="300" fill="#FFB25E" opacity={0.10} />
    </svg>
    {cap && <text x={0} y={h / 2 - 22} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={800} fontSize={30} fill="#5A3A26">{cap}</text>}
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
      <path key={i} d={`M ${(sx * w) / 2} ${(sy * h) / 2} l ${-sx * 40} 0 l ${sx * 40} ${-sy * 40} Z`} fill="#2B1D14" opacity={0.85} />
    ))}
  </g>
);

// página do álbum (origem no canto superior esquerdo), 500 x 720
const PW = 500, PH = 720;
const Page = ({side, children}) => (
  <g>
    <rect x={0} y={0} width={PW} height={PH} fill="#F3EADB" />
    <rect x={0} y={0} width={PW} height={PH} fill="url(#leatherTex)" opacity={0.12} />
    <rect x={side < 0 ? PW - 70 : 0} y={0} width={70} height={PH} fill={`url(#spine${side < 0 ? "L" : "R"})`} />
    {children}
  </g>
);

const SpreadA_L = () => <Page side={-1}><Pic x={250} y={350} w={420} h={430} rot={-2.5} cap="Nossa casa"><PhotoHouse /></Pic></Page>;
const SpreadA_R = () => <Page side={1}><Pic x={250} y={250} w={340} h={330} rot={3} cap="Primeiro endereço"><PhotoBuilding /></Pic><text x={250} y={600} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={800} fontSize={34} fill="#8A6A52">2009</text></Page>;
const SpreadB_L = () => <Page side={-1}><Pic x={250} y={340} w={420} h={430} rot={2} cap="Formatura"><PhotoGrad /></Pic></Page>;
const SpreadB_R = () => <Page side={1}><Pic x={250} y={360} w={420} h={430} rot={-3} cap="Mãos à obra"><PhotoPaint /></Pic></Page>;

const Cover = ({inside = false}) => (
  <g>
    <rect x={0} y={0} width={PW} height={PH} rx={14} fill={inside ? "#5E2C17" : ALBUM.cover} />
    <rect x={0} y={0} width={PW} height={PH} rx={14} fill="url(#leatherTex)" opacity={0.5} />
    {!inside && (
      <g>
        <rect x={40} y={40} width={PW - 80} height={PH - 80} rx={10} fill="none" stroke={ALBUM.gold} strokeWidth={4} strokeDasharray="12 8" opacity={0.85} />
        <text x={PW / 2} y={PH / 2 - 10} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={900} fontSize={66} fill={ALBUM.gold}>Nossa</text>
        <text x={PW / 2} y={PH / 2 + 66} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={900} fontSize={66} fill={ALBUM.gold}>Família</text>
        <rect x={0} y={0} width={PW} height={PH * 0.4} rx={14} fill="#fff" opacity={0.06} />
      </g>
    )}
  </g>
);

// folha que gira em torno da lombada (x=0): u 0 -> à direita; 1 -> à esquerda
const Leaf = ({u, front, back}) => {
  const a = u * Math.PI;
  const sx = Math.cos(a);
  const lift = Math.sin(a);
  return (
    <g transform={`scale(${sx} 1)`}>
      {/* sombra projetada durante a virada */}
      <rect x={0} y={0} width={PW} height={PH} fill="#000" opacity={0.25 * lift} filter="url(#blur14)" transform={`translate(${30 * lift} ${20 * lift})`} />
      {sx >= 0 ? front : <g transform={`scale(-1 1) translate(${-PW} 0)`}>{back}</g>}
      <rect x={0} y={0} width={PW} height={PH} fill={sx >= 0 ? "#000" : "#fff"} opacity={0.18 * lift} />
    </g>
  );
};

// mãos de Paulo (mangas mostarda) vindas de baixo
const Hands = ({p, x = 0}) => (
  <g transform={`translate(${x} ${mix(900, 0, p)})`} opacity={cl(p * 3)}>
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 170} 0) rotate(${sd * -12})`}>
        <rect x={-95} y={250} width={190} height={700} rx={70} fill="#D69A36" />
        <rect x={-95} y={250} width={190} height={60} rx={30} fill="#B07722" />
        <path d="M -78 170 C -84 60, -40 -20, 10 -20 C 70 -20, 90 60, 80 170 L 80 270 L -78 270 Z" fill="#B47652" />
        <path d={`M ${sd * 60} 120 C ${sd * 110} 100, ${sd * 120} 40, ${sd * 90} 10`} stroke="#94593A" strokeWidth={22} fill="none" strokeLinecap="round" />
        {[-48, -16, 16, 48].map((fx, i) => <path key={i} d={`M ${fx} 40 L ${fx} -10`} stroke="#94593A" strokeWidth={3} opacity={0.5} />)}
      </g>
    ))}
  </g>
);

export const SceneAlbum = ({t}) => {
  // abertura 19.62 / virada 24.38 / fechamento 29.1
  const openU = P(t, 19.62, 20.35, EIO);
  const flipU = P(t, 24.3, 24.95, EIO);
  const closeU = P(t, 29.0, 29.6, EIO);
  // câmera em coordenadas do álbum (lombada em x=0, topo y=0)
  const cam = KO(t, [
    [19.35, {x: 250, y: 360, z: 2.4}],
    [19.6, {x: 250, y: 360, z: 1.9}],
    [20.4, {x: 0, y: 380, z: 1.0}],
    [22.9, {x: 0, y: 380, z: 1.04}],
    [23.5, {x: -250, y: 360, z: 1.9}],
    [24.2, {x: -250, y: 360, z: 1.96}],
    [24.9, {x: -250, y: 350, z: 1.85}],
    [25.9, {x: -250, y: 350, z: 1.92}],
    [26.6, {x: 250, y: 370, z: 1.85}],
    [28.3, {x: 250, y: 370, z: 1.92}],
    [29.0, {x: 0, y: 380, z: 1.0}],
    [29.7, {x: 250, y: 380, z: 1.08}],
    [30.6, {x: 250, y: 400, z: 1.0}],
  ], ES);
  // caixa: o álbum desce para dentro e as abas fecham (30.4 -> 31.4)
  const sink = P(t, 30.35, 30.95, EIO);
  const flaps = P(t, 30.9, 31.35, EIO);
  const z = cam.z * mix(1, 0.62, sink);
  return (
    <AbsoluteFill>
      <Stage bg="#2A2420">
        <defs>
          <linearGradient id="spineL" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.28" /></linearGradient>
          <linearGradient id="spineR" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity="0.28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
          <linearGradient id="capShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B0D14" stopOpacity="0.85" /><stop offset="0.6" stopColor="#0B0D14" stopOpacity="0.45" /><stop offset="1" stopColor="#0B0D14" stopOpacity="0" /></linearGradient>
          <radialGradient id="lapBg" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#4A4E5C" /><stop offset="1" stopColor="#1C1E26" /></radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#lapBg)" />
        {/* interior da caixa (aparece ao recuar) */}
        <g opacity={sink}>
          <rect x={0} y={0} width={1080} height={1920} fill="#8F5E2E" />
          <rect x={60} y={360} width={960} height={1200} fill="#5B3D20" />
          <rect x={60} y={360} width={960} height={1200} fill="url(#kraftTex)" opacity={0.3} />
          {/* plástico bolha */}
          {Array.from({length: 60}, (_, i) => <circle key={i} cx={100 + (i % 10) * 95} cy={420 + Math.floor(i / 10) * 200 + (i % 2) * 40} r={30} fill="#fff" opacity={0.05} />)}
        </g>
        <Cam c={{x: cam.x, y: cam.y, z}}>
          <g transform="translate(0 0)">
            {/* sombra do álbum */}
            <rect x={-PW - 10} y={20} width={PW * 2 + 20} height={PH} rx={20} fill="#000" opacity={0.45} filter="url(#blur14)" />
            {/* página esquerda (interior da capa / página B_L) */}
            {openU >= 1 && closeU <= 0 && (
              <g transform={`translate(${-PW} 0)`}>{flipU > 0.5 ? <SpreadB_L /> : <SpreadA_L />}</g>
            )}
            {/* página direita estática */}
            <g>{flipU > 0 ? <SpreadB_R /> : <SpreadA_R />}</g>
            {/* folha virando (A_R -> B_L) */}
            {flipU > 0 && flipU < 1 && <Leaf u={flipU} front={<SpreadA_R />} back={<SpreadB_L />} />}
            {/* capa: abre (0->1) e fecha (1->0) */}
            {(openU < 1 || closeU > 0) && <Leaf u={closeU > 0 ? 1 - closeU : openU} front={<Cover />} back={closeU > 0 ? <SpreadB_L /> : <SpreadA_L />} />}
          </g>
        </Cam>
        {/* abas da caixa fechando */}
        {flaps > 0 && (
          <g>
            <path d={`M 0 0 L 1080 0 L 1080 ${mix(0, 960, flaps)} L 0 ${mix(0, 960, flaps)} Z`} fill="#C99460" />
            <path d={`M 0 1920 L 1080 1920 L 1080 ${mix(1920, 960, flaps)} L 0 ${mix(1920, 960, flaps)} Z`} fill="#D9A46A" />
            <rect x={0} y={0} width={1080} height={1920} fill="url(#kraftTex)" opacity={0.25 * flaps} />
            <rect x={0} y={mix(950, 940, flaps)} width={1080} height={20} fill="#000" opacity={0.25} />
          </g>
        )}
        {/* fita adesiva e etiqueta */}
        {t > 31.1 && (
          <g>
            <rect x={0} y={880} width={1080 * P(t, 31.12, 31.42, EIO)} height={160} fill="#E8D2A8" opacity={0.92} />
            <g transform={`translate(540 960) scale(${SP(t, 31.3, 14, 0.5)}) rotate(-4)`}>
              <rect x={-230} y={-60} width={460} height={120} fill="#F5F0E6" />
              <rect x={-230} y={-60} width={460} height={120} fill="none" stroke="#C0262D" strokeWidth={6} />
              <text x={30} y={22} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={64} fill="#C0262D" letterSpacing="6">FRÁGIL</text>
              <path d="M -190 -30 L -150 -30 L -156 2 Q -170 18 -184 2 Z M -170 12 L -170 40 M -186 40 L -154 40" stroke="#C0262D" strokeWidth={6} fill="none" />
            </g>
          </g>
        )}
        <rect x={0} y={0} width={1080} height={620} fill="url(#capShade)" />
        {/* mãos repousam sobre o álbum fechado */}
        {t > 29.3 && sink < 0.5 && <g transform="translate(540 1180)"><Hands p={P(t, 29.35, 29.95, EO) * (1 - P(t, 30.3, 30.6, EI))} /></g>}
      </Stage>
      <Caption t={t} y={170} size={66} out={22.95} lines={[
        L("Não é só levar coisas", [19.62, 19.94, 20.16, 20.5, 21.06], {weight: 700, size: 58}),
        L("de um *endereço* para outro.", [21.36, 21.54, 21.72, 22.16, 22.4], {size: 66, weight: 900}),
      ]} />
      <Caption t={t} y={200} out={24.0} lines={[L("É a sua *casa.*", [23.1, 23.3, 23.42, 23.62], {size: 96, weight: 900})]} />
      <Caption t={t} y={200} out={25.85} lines={[L("São suas *conquistas.*", [24.38, 24.62, 25.06], {size: 88, weight: 900})]} />
      <Caption t={t} y={170} out={28.4} lines={[
        L("É aquilo que você levou", [26.16, 26.32, 26.56, 26.76, 27.04], {weight: 700, size: 58}),
        L("*tempo* para construir.", [27.36, 27.74, 28.06], {size: 80, weight: 900}),
      ]} />
      <Caption t={t} y={230} out={30.8} lines={[
        L("E tudo isso", [28.52, 29.12, 29.5], {weight: 700, size: 62}),
        L("merece *cuidado.*", [29.98, 30.46], {size: 96, weight: 900}),
      ]} />
    </AbsoluteFill>
  );
};

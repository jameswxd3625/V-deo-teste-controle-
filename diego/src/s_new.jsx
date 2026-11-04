import React from "react";
import {AbsoluteFill, staticFile} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, wob} from "./lib";
import {Cam, Stage, Caption, L} from "./ui";
import {Character, PAULO, ANA, KID, MOVER1, lerpPose} from "./Character";
import {Box, AlbumClosed, Sofa, Plant, QuiltCover} from "./props";
import {Truck} from "./Truck";
import {Morning} from "./s_street";

// casa nova (fachada frontal). Origem: chão, centro
const House = ({x, y, s = 1, plate = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <linearGradient id="hWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EDEFF3" /></linearGradient>
      <linearGradient id="hGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE9C2" /><stop offset="1" stopColor="#F2C58A" /></linearGradient>
    </defs>
    <ellipse cx={0} cy={8} rx={760} ry={40} fill="#000" opacity={0.2} filter="url(#softShadow)" />
    <rect x={-640} y={-900} width={1280} height={900} fill="url(#hWall)" />
    <rect x={-700} y={-960} width={1400} height={70} fill="#8B5E3C" />
    {/* ripas de madeira */}
    <g>{Array.from({length: 11}, (_, i) => <rect key={i} x={240 + i * 36} y={-890} width={22} height={890} fill={i % 2 ? "#B07A4E" : "#9C6A42"} />)}</g>
    {/* janelão */}
    <rect x={-560} y={-760} width={640} height={460} fill="url(#hGlass)" />
    <path d="M -240 -760 V -300 M -560 -530 H 80" stroke="#2B2F3A" strokeWidth={14} />
    <rect x={-570} y={-770} width={660} height={480} fill="none" stroke="#2B2F3A" strokeWidth={14} />
    <path d="M -540 -740 L -380 -740 L -540 -560 Z" fill="#fff" opacity={0.35} />
    {/* porta */}

    <g>
      <rect x={110} y={-640} width={120} height={640} fill="#6E4A36" />
      <rect x={110} y={-640} width={120} height={640} fill="none" stroke="#2B2F3A" strokeWidth={10} />
      <rect x={210} y={-340} width={8} height={70} rx={4} fill="#D8B46A" />
    </g>
    {plate && <g transform="translate(170 -720)"><rect x={-56} y={-34} width={112} height={68} rx={10} fill="#0A1C4A" /><text x={0} y={18} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill="#fff">128</text></g>}
    {/* jardim */}
    <Plant x={-620} y={0} s={1.3} />
    <Plant x={560} y={0} s={1.1} />
    <rect x={-760} y={-14} width={1520} height={30} fill="#7DB36A" />
  </g>
);

// ---------- 45.0 -> 46.4: caminhão chega à casa nova ----------
export const SceneArrive = ({t}) => {
  const drive = P(t, 44.9, 46.0, (u) => 1 - Math.pow(1 - u, 3));
  const tx = mix(-2200, -200, drive);
  const cam = KO(t, [[44.9, {x: 300, y: 1260, z: 0.62}], [46.4, {x: 420, y: 1240, z: 0.68}]], ES);
  return (
    <AbsoluteFill>
      <Stage bg="#A9CDF2">
        <Cam c={cam}>
          <Morning cx={cam.x} />
          <House x={1200} y={1560} s={0.9} />
          <rect x={-3000} y={1540} width={7000} height={40} fill="#C8CCD3" />
          <rect x={-3000} y={1580} width={7000} height={500} fill="#4A4F5A" />
          {Array.from({length: 20}, (_, i) => <rect key={i} x={-3000 + i * 360} y={1800} width={180} height={14} fill="#E8E8E8" opacity={0.7} />)}
          <Truck x={tx} y={1600} s={1} spin={drive * 1400} bounce={Math.sin(t * 30) * 2 * (1 - drive)} light={0.8} />
        </Cam>
      </Stage>
      <Caption t={t} y={260} out={46.3} lines={[L("Assim como o *Paulo,*", [45.24, 45.56, 45.9, 46.02], {size: 76, weight: 900})]} />
    </AbsoluteFill>
  );
};

// ---------- 46.3 -> 49.0: de dentro do baú, as portas se abrem para a casa nova ----------
export const ScenePOV = ({t}) => {
  const open = P(t, 46.4, 47.2, EIO);
  const push = P(t, 48.45, 49.0, EI);
  const cam = KO(t, [[46.3, {x: 540, y: 960, z: 1.0}], [48.4, {x: 540, y: 980, z: 1.06}]], ES);
  const z = cam.z * (1 + push * 2.6);
  return (
    <AbsoluteFill>
      <Stage bg="#0E1220">
        {/* exterior visto pela abertura */}
        <g transform={`translate(540 ${960}) scale(${z}) translate(-540 ${-cam.y})`}>
          <g transform="translate(540 0)">
            <Morning cx={0} far={0.05} mid={0.1} />
          </g>
          <House x={540} y={1500} s={0.62} />
          <rect x={-800} y={1490} width={2700} height={600} fill="#C8CCD3" />
          <Character c={PAULO} x={430} y={1560} s={0.5} pose={{aA: [40, -20], aB: [-40, 20], turn: 0}} e={{smile: 0.85, open: 0.35}} />
          <Character c={ANA} x={650} y={1560} s={0.47} pose={{aA: [8, 0], aB: [-20, -40]}} e={{smile: 0.85}} />
          <Character c={KID} x={740} y={1560} s={0.3} pose={{aA: [8, 0], aB: [-150 + Math.sin(t * 8) * 18, -20]}} e={{smile: 0.95, open: 0.5}} />
        </g>
        {/* moldura interna do baú e portas */}
        {(() => {
          const sx = Math.cos(open * Math.PI * 0.62);
          return (
            <g>
              <path d="M 0 0 H 1080 V 1920 H 0 Z M 120 260 V 1700 H 960 V 260 Z" fill="#141826" fillRule="evenodd" opacity={1 - push} />
              <path d="M 0 0 L 120 260 L 120 1700 L 0 1920 Z" fill="#1B2030" opacity={1 - push} />
              <path d="M 1080 0 L 960 260 L 960 1700 L 1080 1920 Z" fill="#1B2030" opacity={1 - push} />
              <path d="M 0 1920 L 120 1700 L 960 1700 L 1080 1920 Z" fill="#232838" opacity={1 - push} />
              {/* cinta de amarração e capas nas bordas */}
              <g opacity={1 - push}>
                <QuiltCover x={-80} y={900} w={210} h={820} r={30} logo={false} shade={0.35} />
                <QuiltCover x={950} y={980} w={210} h={760} r={30} logo={false} shade={0.35} />
              </g>
              {open < 1 && (
                <g>
                  <g transform={`translate(120 0) scale(${sx} 1) translate(-120 0)`}>
                    <rect x={120} y={260} width={420} height={1440} fill="#C9CED8" />
                    <rect x={120} y={260} width={420} height={1440} fill="#000" opacity={0.25} />
                  </g>
                  <g transform={`translate(960 0) scale(${sx} 1) translate(-960 0)`}>
                    <rect x={540} y={260} width={420} height={1440} fill="#C9CED8" />
                    <rect x={540} y={260} width={420} height={1440} fill="#000" opacity={0.3} />
                  </g>
                </g>
              )}
              {/* luz invadindo */}
              <rect x={0} y={0} width={1080} height={1920} fill="#FFF6DE" opacity={0.35 * Math.sin(open * Math.PI) + push * 0.9} />
            </g>
          );
        })()}
      </Stage>
      <Caption t={t} y={330} out={48.5} lines={[
        L("você tem uma", [46.44, 46.72, 46.9], {size: 62, weight: 700}),
        L("*nova* *história*", [47.32, 47.58], {size: 92, weight: 900}),
        L("pela frente.", [48.0, 48.32], {size: 62, weight: 700}),
      ]} />
    </AbsoluteFill>
  );
};

// ---------- 48.9 -> 52.6: álbum no novo lar ----------
const NewRoom = ({t}) => (
  <g>
    <defs>
      <linearGradient id="wallNew" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7F3EC" /><stop offset="1" stopColor="#EDE6DA" /></linearGradient>
      <linearGradient id="floorNew" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D6B48C" /><stop offset="1" stopColor="#E4C7A2" /></linearGradient>
      <linearGradient id="sunBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF4D6" stopOpacity="0.7" /><stop offset="1" stopColor="#FFF4D6" stopOpacity="0" /></linearGradient>
    </defs>
    <rect x={-600} y={-300} width={2400} height={1560} fill="url(#wallNew)" />
    <rect x={-600} y={1250} width={2400} height={1200} fill="url(#floorNew)" />
    {Array.from({length: 12}, (_, i) => <path key={i} d={`M -600 ${1270 + i * i * 7} L 1800 ${1270 + i * i * 7}`} stroke="#B8946C" strokeWidth={2} opacity={0.4} />)}
    <rect x={-600} y={1236} width={2400} height={20} fill="#E2D8CA" />
    {/* janelão com jardim */}
    <rect x={-120} y={260} width={560} height={800} fill="#9FD18F" />
    <rect x={-120} y={260} width={560} height={420} fill="#BFE3F7" />
    <circle cx={60} cy={640} r={180} fill="#5FA463" /><circle cx={300} cy={600} r={150} fill="#6DB56E" />
    <rect x={-130} y={250} width={580} height={820} fill="none" stroke="#3A3530" strokeWidth={16} />
    <path d="M 160 250 V 1070" stroke="#3A3530" strokeWidth={12} />
    {/* feixes de sol */}
    <path d="M -120 260 L 440 260 L 1100 1500 L 300 1700 Z" fill="url(#sunBeam)" opacity={0.6} />
    <Sofa x={-80} y={1330} w={520} />
    {/* estante */}
    <g>
      <rect x={640} y={760} width={420} height={22} rx={4} fill="#9C6A42" />
      <rect x={640} y={1060} width={420} height={22} rx={4} fill="#9C6A42" />
      <rect x={640} y={782} width={420} height={12} fill="#000" opacity={0.1} />
      <Plant x={980} y={760} s={0.5} sway={wob(t, 3, 0.5) * 2} />
      {/* foto nova: a família diante da casa nova */}
      <g transform="translate(700 600) rotate(-3)">
        <rect x={0} y={0} width={150} height={160} fill="#2B2420" />
        <rect x={10} y={10} width={130} height={140} fill="#FBF8F1" />
        <rect x={18} y={18} width={114} height={100} fill="#BFE3F7" />
        <rect x={40} y={60} width={70} height={58} fill="#fff" /><rect x={36} y={52} width={78} height={10} fill="#8B5E3C" /><rect x={84} y={80} width={14} height={38} fill="#6E4A36" />
        <rect x={18} y={112} width={114} height={6} fill="#7DB36A" />
      </g>
      <g transform="translate(920 1060)"><rect x={-70} y={-120} width={50} height={120} fill="#1558D6" /><rect x={-20} y={-100} width={40} height={100} fill="#E2574C" /><rect x={20} y={-110} width={36} height={110} fill="#2E9C8F" /></g>
    </g>
  </g>
);

const HOLD = {torso: 2, head: 10, turn: 0.1, aA: [28, -80], aB: [-28, 80]};
const PLACE = {torso: 8, head: 6, turn: 0.55, aA: [10, -40], aB: [-58, -40]};
const DONE = {torso: 0, head: 2, turn: 0.35, aA: [8, 4], aB: [-30, -70]};

export const SceneHome = ({t}) => {
  const walkU = P(t, 49.0, 50.0, EIO);
  const px = mix(330, 470, walkU);
  const ph = (t - 49.0) * 9;
  const wk = t > 49.0 && t < 50.0 ? Math.sin(ph) : 0;
  let pose = lerpPose(HOLD, PLACE, P(t, 49.9, 50.6, EIO));
  if (t > 50.9) pose = lerpPose(PLACE, DONE, P(t, 50.9, 51.5, EIO));
  pose = {...pose, lA: [wk * 18, 0], lB: [-wk * 18, 0]};
  const placed = t > 50.62;
  const shelf = {x: 790, y: 1060};
  const cam = KO(t, [
    [48.9, {x: 520, y: 1000, z: 1.25}],
    [49.4, {x: 540, y: 980, z: 1.0}],
    [50.8, {x: 600, y: 960, z: 1.04}],
    [51.6, {x: 760, y: 900, z: 1.45}],
    [52.6, {x: 790, y: 920, z: 1.7}],
  ], ES);
  const fadeIn = 1 - P(t, 48.9, 49.3, EO);
  return (
    <AbsoluteFill>
      <Stage bg="#F7F3EC">
        <Cam c={cam}>
          <NewRoom t={t} />
          <Character c={ANA} x={60} y={1520} s={0.82} pose={{aA: [8, 0], aB: [-24, -40], turn: 0.4}} e={{smile: 0.75}} />
          <Character c={KID} x={210} y={1540} s={0.52} pose={{aA: [8, 0], aB: [-10, 0], turn: 0.5}} e={{smile: 0.9, open: 0.3}} />
          <Box x={140} y={1560} w={300} h={200} fragile open={1} seed={41} />
          <Character c={PAULO} x={px} y={1620} s={0.95} pose={pose} e={{smile: mix(0.5, 0.85, P(t, 50.8, 51.4)), open: P(t, 51.0, 51.4) * 0.25, look: [mix(0.2, 0.7, P(t, 49.9, 50.4)), 0.3], blink: t > 51.6 && t < 51.75 ? 1 : 0}}
            hold={!placed ? (hp) => {
              const u = P(t, 49.9, 50.6, EIO);
              return <AlbumClosed x={mix(hp[0], (shelf.x - px) / 0.95, u)} y={mix(hp[1] - 20, (shelf.y - 114 - 1620) / 0.95, u)} w={mix(250, 180 / 0.95, u)} h={mix(200, 230 / 0.95, u)} rot={mix(-2, 0, u)} />;
            } : undefined}
            holdUnder={!placed} />
          {/* álbum de pé na estante, capa à mostra */}
          {placed && <AlbumClosed x={shelf.x} y={shelf.y - 114} w={180} h={230} rot={0} />}
        </Cam>
        <rect width="1080" height="1920" fill="#FFF6DE" opacity={fadeIn} />
      </Stage>
      <Caption t={t} y={200} out={52.3} lines={[
        L("O *próximo* *capítulo*", [49.0, 49.2, 49.6], {size: 80, weight: 900}),
        L("da sua vida já tem", [50.08, 50.34, 50.58, 50.84, 51.34], {size: 60, weight: 700}),
        L("*endereço.*", [51.56], {size: 92, weight: 900}),
      ]} color="#0A1C4A" shadow={false} />
    </AbsoluteFill>
  );
};

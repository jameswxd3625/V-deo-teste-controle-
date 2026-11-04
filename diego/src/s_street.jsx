import React from "react";
import {AbsoluteFill} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, wob} from "./lib";
import {Cam, Stage, Caption, L} from "./ui";
import {Character, MOVER1, MOVER2} from "./Character";
import {Box, QuiltCover, Fridge} from "./props";
import {Truck, TruckRear} from "./Truck";

const walk = (t, t0, t1, amp = 20) => {
  if (t < t0 || t > t1) return {lA: [3, 0], lB: [-3, 0], bob: 0};
  const ph = (t - t0) * 9;
  const k = Math.sin(ph);
  return {lA: [k * amp, Math.max(0, -k) * 30], lB: [-k * amp, Math.max(0, k) * 30], bob: Math.abs(Math.sin(ph)) * -8};
};

// paisagem de BH pela manhã (camadas com paralaxe)
export const Morning = ({cx, far = 0.25, mid = 0.55}) => (
  <g>
    <defs>
      <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4F8FE0" /><stop offset="0.6" stopColor="#A9CDF2" /><stop offset="1" stopColor="#E8F2FB" /></linearGradient>
    </defs>
    <rect x={-3000} y={-1500} width={9000} height={3200} fill="url(#skyDay)" />
    <g transform={`translate(${cx * (1 - far)} 0)`}>
      <path d="M -2600 1130 L -2300 1010 L -2100 1050 L -1800 940 L -1550 990 L -1300 900 L -1050 960 L -800 880 L -500 950 L -250 890 L 0 960 L 300 880 L 600 940 L 900 870 L 1200 950 L 1500 900 L 1800 970 L 2100 900 L 2400 980 L 2800 930 L 3200 1000 L 3200 1300 L -2600 1300 Z" fill="#7FA3C9" />
      <path d="M -2600 1170 L -2200 1100 L -1900 1130 L -1500 1060 L -1100 1120 L -700 1050 L -300 1110 L 100 1040 L 500 1100 L 900 1050 L 1300 1110 L 1700 1050 L 2100 1110 L 2600 1060 L 3200 1120 L 3200 1300 L -2600 1300 Z" fill="#6A9A7E" opacity={0.85} />
    </g>
    <g transform={`translate(${cx * (1 - mid)} 0)`}>
      {Array.from({length: 26}, (_, i) => {
        const x = -2400 + i * 210 + ((i * 37) % 60), h = 180 + ((i * 97) % 220), w = 120 + ((i * 53) % 70);
        return (
          <g key={i}>
            <rect x={x} y={1260 - h} width={w} height={h} fill={i % 3 ? "#C7D3E3" : "#B4C3D8"} />
            {Array.from({length: Math.floor(h / 40)}, (_, k) => <rect key={k} x={x + 14} y={1260 - h + 18 + k * 40} width={w - 28} height={10} fill="#93A8C4" opacity={0.6} />)}
          </g>
        );
      })}
    </g>
  </g>
);

const Tree = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-320} width={28} height={320} fill="#6B4A35" />
    <circle cx={-70} cy={-360} r={110} fill="#3F8A4B" /><circle cx={60} cy={-390} r={120} fill="#4A9A56" /><circle cx={0} cy={-470} r={110} fill="#57A962" /><circle cx={-10} cy={-330} r={90} fill="#3A7F45" />
  </g>
);

// prédio antigo (o mesmo da foto "Primeiro endereço")
const OldBuilding = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-1500} width={760} height={1500} fill="#D9C7A8" />
    {Array.from({length: 6}, (_, r) => Array.from({length: 3}, (_, c) => (
      <g key={`${r}${c}`}>
        <rect x={70 + c * 230} y={-1430 + r * 220} width={150} height={120} fill="#7E97B5" />
        <rect x={52 + c * 230} y={-1300 + r * 220} width={186} height={18} fill="#A8957A" />
      </g>
    )))}
    <rect x={300} y={-260} width={180} height={260} fill="#5A3D2C" />
    <rect x={300} y={-260} width={180} height={260} fill="#000" opacity={0.25} />
  </g>
);

export const SceneStreet = ({t}) => {
  const cam = KO(t, [
    [36.35, {x: 1420, y: 1240, z: 1.55}],
    [36.7, {x: 1300, y: 1240, z: 1.35}],
    [38.1, {x: 700, y: 1220, z: 0.92}],
    [38.5, {x: 640, y: 1240, z: 0.9}],
    [39.6, {x: 120, y: 1320, z: 1.02}],
  ], ES);
  // equipe carregando o sofá pela rampa (38.3 -> 39.6)
  const u = P(t, 38.2, 39.7, (x) => x);
  const sofaX = mix(-760, -250, u);
  const rampY = (x) => (x > -420 ? 1600 - ((x + 420) / 420) * 170 : 1600);
  const w = walk(t, 38.2, 39.7);
  const boxX = mix(-1100, -560, P(t, 38.4, 39.7, (x) => x));
  return (
    <AbsoluteFill>
      <Stage bg="#A9CDF2">
        <Cam c={cam}>
          <Morning cx={cam.x - 600} />
          <OldBuilding x={-1500} y={1560} />
          <Tree x={-600} y={1560} s={1.1} />
          <Tree x={1900} y={1560} s={1.2} />
          {/* calçada e rua */}
          <rect x={-3000} y={1540} width={7000} height={40} fill="#C8CCD3" />
          <rect x={-3000} y={1580} width={7000} height={500} fill="#4A4F5A" />
          {Array.from({length: 20}, (_, i) => <rect key={i} x={-3000 + i * 360} y={1800} width={180} height={14} fill="#E8E8E8" opacity={0.7} />)}
          <Truck x={0} y={1600} s={1} light={0.6} />
          {/* rampa */}
          <path d="M 0 1430 L -420 1600 L -420 1610 L 0 1446 Z" fill="#8D939E" />
          <path d="M 0 1430 L -420 1600" stroke="#C7CCD4" strokeWidth={6} />
          {/* sofá coberto carregado por dois */}
          {t > 38.1 && (
            <g>
              <Character c={MOVER2} x={sofaX - 210} y={rampY(sofaX - 210) + w.bob} s={0.44} pose={{...w, aA: [-30, -60], aB: [30, 60], turn: 0.4}} e={{smile: 0.5}} />
              <g transform={`translate(${sofaX} ${rampY(sofaX) - 205 + w.bob * 0.4}) rotate(${sofaX > -420 ? -22 : 0})`}>
                <QuiltCover x={-230} y={-90} w={460} h={170} r={30} logoScale={0.42} />
              </g>
              <Character c={MOVER1} x={sofaX + 210} y={rampY(sofaX + 210) + w.bob} s={0.44} pose={{...w, aA: [-30, -60], aB: [30, 60], turn: -0.3}} e={{smile: 0.55}} />
            </g>
          )}
          {/* terceiro: a caixa do álbum, carregada com cuidado */}
          {t > 38.3 && (
            <Character c={{...MOVER1, id: "m3", skin: "#C98E68", skinS: "#A8714E", skinH: "#DDA683", hair: "#1E1410", hairType: "buzz"}} x={boxX} y={1600 + w.bob} s={0.44} pose={{...w, aA: [-28, -70], aB: [28, 70]}} e={{smile: 0.4}}
              hold={(hp) => <Box x={hp[0] - 150} y={hp[1] - 150} w={300} h={210} fragile seed={21} />} />
          )}
        </Cam>
      </Stage>
      <Caption t={t} y={250} out={38.2} lines={[L("Veja nossos *caminhões*", [36.58, 36.82, 37.12], {size: 76, weight: 900})]} />
      <Caption t={t} y={250} out={39.55} lines={[L("Acompanhe nosso *trabalho*", [38.36, 38.66, 38.92], {size: 72, weight: 900})]} />
    </AbsoluteFill>
  );
};

// traseira: portas fecham sobre a carga protegida
export const SceneRear = ({t}) => {
  const close = P(t, 39.75, 40.25, EIO);
  const cam = KO(t, [[39.55, {x: 0, y: 1220, z: 1.25}], [40.2, {x: 0, y: 1180, z: 1.35}], [40.75, {x: 0, y: 600, z: 1.1}]], ES);
  return (
    <AbsoluteFill>
      <Stage bg="#A9CDF2">
        <Cam c={cam}>
          <Morning cx={0} far={0.1} mid={0.2} />
          <rect x={-3000} y={1540} width={7000} height={40} fill="#C8CCD3" />
          <rect x={-3000} y={1580} width={7000} height={500} fill="#4A4F5A" />
          <TruckRear x={0} y={1600} s={1} open={1 - close}>
            <g>
              <rect x={-320} y={-780} width={640} height={620} fill="#262B38" />
              <Fridge x={-170} y={-180} w={190} h={440} cover={1} />
              <g transform="translate(70 -180) rotate(0)"><QuiltCover x={-60} y={-420} w={250} h={420} r={26} logoScale={0.6} /></g>
              <Box x={-80} y={-380} w={200} h={150} seed={31} />
              <Box x={-90} y={-232} w={220} h={160} fragile seed={32} />
              <path d="M -310 -520 L 310 -560" stroke="#E8B030" strokeWidth={10} opacity={0.9} />
            </g>
          </TruckRear>
        </Cam>
      </Stage>
      <Caption t={t} y={200} lines={[L("Conte para a gente", [39.8, 40.08, 40.34, 40.42], {size: 62, weight: 700})]} />
    </AbsoluteFill>
  );
};

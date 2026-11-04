import React from "react";
import {AbsoluteFill, staticFile} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, wob, FONT} from "../lib";
import {Scene3D, G, Face, Cuboid, Ground, Billboard} from "./three";
import {Box3D, Sofa3D, QuiltDrape, Fridge3D, AlbumClosed3D, Fragile, quiltBg} from "./props3d";
import {OldRoom, LampBB, PlantBB, Human, CityView} from "./env3d";
import {PAULO, MOVER1, MOVER2, MOVER3, mixPose} from "./Person";
import {Truck3D, TK} from "./Truck3D";

const walkPose = (t, t0, t1, base = {}) => {
  const on = t > t0 && t < t1;
  const k = on ? Math.sin((t - t0) * 9.5) : 0;
  return {...base, legL: [k * 18, Math.max(0, -k) * 26], legR: [-k * 18, Math.max(0, k) * 26], bob: on ? Math.abs(k) * -10 : 0};
};
// pilha de capas azuis dobradas (2D, nas mãos)
const Folded = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0 ${-i * 44})`}>
        <rect x={-150} y={-44} width={300} height={50} rx={20} fill={i % 2 ? "#1A56C8" : "#2263DA"} />
        <path d="M -140 -20 L 140 -20" stroke="#0D2F78" strokeWidth={3} strokeDasharray="8 6" opacity={0.6} />
        <rect x={-150} y={-44} width={300} height={16} rx={8} fill="#fff" opacity={0.08} />
      </g>
    ))}
  </g>
);

// ===================== 31.46 -> 36.55: a equipe chega; a capa Diego =====================
export const Shot3 = ({t}) => {
  if (t < 34.45) {
    const door = P(t, 31.62, 32.3, EIO);
    const cam = KO(t, [[31.46, {tx: 1050, ty: -640, tz: -900, yaw: -14, pitch: 2, dist: 1500, persp: 1500}], [32.3, {tx: 1000, ty: -640, tz: -800, yaw: -18, pitch: 3, dist: 2000, persp: 1500}], [34.45, {tx: 900, ty: -640, tz: -700, yaw: -22, pitch: 3, dist: 2300, persp: 1500}]], ES);
    const m1 = P(t, 32.15, 33.1, EIO), m2 = P(t, 32.45, 33.4, EIO);
    const w1 = walkPose(t, 32.15, 33.1), w2 = walkPose(t, 32.45, 33.4);
    const welcome = P(t, 32.7, 33.2, EIO);
    return (
      <AbsoluteFill style={{background: "#A9B8D2"}}>
        <Scene3D cam={cam}>
          <OldRoom day door={door} />
          <Sofa3D x={250} z={-950} cover={0} />
          <G x={250} z={-950}><QuiltDrape w={1150} h={440} d={520} p={1} sheet ry={cam.yaw} /></G>
          <G x={-300} z={520}><Box3D fragile seed={31} /></G>
          <G x={-900} z={-300}><Box3D seed={4} /><G y={-260}><Box3D w={300} h={240} d={290} seed={5} ry={-4} /></G></G>
          {t > 32.1 && <Human c={MOVER2} x={mix(1250, 1350, m2)} z={mix(-1700, -980, m2)} y={w2.bob} yaw={cam.yaw} pose={{...w2, armL: [8, -6], armR: [-24, -60], turn: -0.2}} e={{smile: 0.7}} />}
          {t > 31.9 && <Human c={MOVER1} x={mix(1150, 1000, m1)} z={mix(-1750, -760, m1)} y={w1.bob} yaw={cam.yaw}
            pose={{...w1, ikL: [-150, -560], ikR: [150, -560], foreL: 0.55, foreR: 0.55, wristL: 170, wristR: -170, handL: "grip", handR: "grip", armsOver: true, spine: -3, turn: -0.15}}
            e={{smile: mix(0.4, 0.75, P(t, 33.0, 33.4)), open: P(t, 33.0, 33.3) * 0.3 * (1 - P(t, 33.9, 34.2))}}
            hold={() => <Folded x={0} y={-520} />} />}
          <Human c={PAULO} x={350} z={-300} yaw={cam.yaw} pose={mixPose({turn: 0.4, head: 4}, {turn: 0.55, head: 6, spine: 3, armR: [-70, -30], handR: "open", armL: [10, -10]}, welcome)} e={{smile: mix(0.3, 0.75, welcome), open: welcome * 0.3 * (1 - P(t, 33.8, 34.1))}} />
        </Scene3D>
        <AbsoluteFill style={{background: "linear-gradient(200deg, rgba(255,244,214,0.18), transparent 50%)", mixBlendMode: "screen"}} />
      </AbsoluteFill>
    );
  }
  // capa azul Diego desce sobre o sofá; câmera vai até a marca
  const drop = cl(SP(t, 34.55, 7.5, 0.6), 0, 1.03);
  const cam = KO(t, [[34.45, {tx: 250, ty: -360, tz: -950, yaw: 16, pitch: 10, dist: 1900, persp: 1500}], [35.3, {tx: 250, ty: -260, tz: -700, yaw: 6, pitch: 4, dist: 1350, persp: 1500}], [36.55, {tx: 250, ty: -250, tz: -690, yaw: 2, pitch: 2, dist: 1150, persp: 1500}]], ES);
  const sweep = P(t, 35.3, 36.2, EIO);
  return (
    <AbsoluteFill style={{background: "#A9B8D2"}}>
      <Scene3D cam={cam}>
        <OldRoom day />
        <Sofa3D x={250} z={-950} cover={0} />
        <G x={250} z={-950} y={-(1 - Math.min(1, drop)) * 500}><QuiltDrape w={1170} h={450} d={540} p={Math.min(1, drop * 1.1)} ry={cam.yaw} /></G>
        <Human c={MOVER2} x={-450} z={-1100} yaw={cam.yaw} pose={{ikR: [380, -520], handR: "flat", wristR: -60, spine: 8, head: 10, turn: 0.5, armL: [8, -10]}} e={{smile: 0.45, look: [0.6, 0.6]}} />
        <Human c={MOVER1} x={950} z={-1100} yaw={cam.yaw} pose={{ikL: [-380, -520], handL: "flat", wristL: 60, spine: -8, head: -8, turn: -0.5, armR: [-8, 10]}} e={{smile: 0.45, look: [-0.6, 0.6]}} />
      </Scene3D>
      {/* brilho que atravessa o tecido */}
      <AbsoluteFill style={{background: `linear-gradient(105deg, transparent ${mix(-30, 110, sweep) - 12}%, rgba(255,255,255,0.22) ${mix(-30, 110, sweep)}%, transparent ${mix(-30, 110, sweep) + 12}%)`, opacity: sweep > 0 && sweep < 1 ? 1 : 0, mixBlendMode: "screen"}} />
    </AbsoluteFill>
  );
};

// ===================== 36.55 -> 40.45: o caminhão e o carregamento =====================
const Building = () => (
  <G x={-1900} y={-1200} z={-1500}>
    <Cuboid w={1600} h={2400} d={900} col="#D9C7A8" faces={{front: (
      <div style={{position: "absolute", inset: 0, background: "#D9C7A8"}}>
        {Array.from({length: 7}, (_, r) => Array.from({length: 4}, (_, c) => (
          <div key={`${r}${c}`} style={{position: "absolute", left: 110 + c * 360, top: 90 + r * 300, width: 220, height: 180, background: "linear-gradient(160deg,#9DB2CC,#6F87A6)", boxShadow: "0 22px 0 -8px #A8957A"}} />
        )))}
        <div style={{position: "absolute", left: 640, bottom: 0, width: 320, height: 380, background: "#5A3D2C"}} />
      </div>
    )}} />
  </G>
);
export const Street = ({t, house = false, children}) => (
  <>
    {/* céu e cidade ao fundo */}
    <G z={-6000} y={-2200}><Face w={20000} h={5000} back><CityView w={20000} h={5000} mode="day" /></Face></G>
    <Ground w={20000} d={9000} bg="#4A4F5A" />
    <Ground w={20000} d={900} z={-1150} y={-3} bg="#C8CCD3" />
    <Ground w={20000} d={30} z={-700} y={-4} bg="#E6E8EC" />
    {Array.from({length: 14}, (_, i) => <Ground key={i} w={260} d={22} x={-6000 + i * 900} z={700} y={-3} bg="#E8E8E8" />)}
    {children}
  </>
);
export const TreeBB = ({x, z, yaw, s = 1}) => (
  <Billboard x={x} z={z} w={700 * s} h={1500 * s} yaw={yaw}>
    <svg width={700 * s} height={1500 * s} viewBox="-350 -1500 700 1500">
      <ellipse cx={20} cy={-8} rx={220} ry={34} fill="#000" opacity={0.25} />
      <rect x={-24} y={-760} width={48} height={760} fill="#6B4A35" />
      {[[-150, -900, 240, "#3F8A4B"], [140, -960, 250, "#4A9A56"], [0, -1180, 240, "#57A962"], [-20, -820, 200, "#3A7F45"]].map(([x, y, r, c], i) => <circle key={i} cx={x} cy={y} r={r} fill={c} />)}
    </svg>
  </Billboard>
);

export const Shot4 = ({t}) => {
  const rear = t >= 38.25;
  const cam = !rear
    ? KO(t, [[36.55, {tx: 700, ty: -560, tz: 0, yaw: 62, pitch: 4, dist: 1500, persp: 1400}], [38.25, {tx: 0, ty: -460, tz: 0, yaw: 22, pitch: 5, dist: 3000, persp: 1500}]], ES)
    : KO(t, [[38.25, {tx: -1100, ty: -420, tz: 300, yaw: -42, pitch: 4, dist: 2300, persp: 1500}], [39.7, {tx: -1000, ty: -440, tz: 200, yaw: -54, pitch: 5, dist: 2000, persp: 1500}], [40.45, {tx: -900, ty: -460, tz: 0, yaw: -84, pitch: 3, dist: 1500, persp: 1500}]], ES);
  const open = rear ? 1 - P(t, 39.75, 40.25, EIO) : 0;
  // carregamento: equipe com sofá coberto entra; caixa do álbum é acomodada
  const load = P(t, 38.25, 39.62, (u) => u);
  const lx = mix(-2100, -520, load);
  const ramp = (x) => -170 * cl((x + 1250) / 450);
  const w = walkPose(t, 38.25, 39.62);
  const boxIn = P(t, 38.9, 39.6, EIO);
  const cargo = (
    <G y={TK.boxH / 2} s={0.42}>
      <G x={-500} z={-200}><QuiltDrape w={1240} h={520} d={560} p={1} ry={cam.yaw} /></G>
      <G x={500} z={180}><Fridge3D cover={1} /></G>
      <G x={-1050} z={320}><Box3D seed={42} /></G>
      {boxIn > 0.98 && <G x={-1050} y={-260} z={320}><Box3D w={300} h={230} d={280} fragile seed={41} /></G>}
    </G>
  );
  return (
    <AbsoluteFill style={{background: "#A9CDF2"}}>
      <Scene3D cam={cam}>
        <Street t={t}>
          <Building />
          <TreeBB x={1800} z={-1100} yaw={cam.yaw} s={1.3} />
          <TreeBB x={-3600} z={-1100} yaw={cam.yaw} s={1.2} />
          <Truck3D x={0} z={0} open={open} cargo={rear ? cargo : null} />
          {rear && t < 39.62 && (
            <>
              <Human c={MOVER2} x={lx - 260} z={-90} s={0.42} y={w.bob * 0.42 + ramp(lx - 260)} yaw={cam.yaw} pose={{...w, ikL: [-120, -470], ikR: [120, -470], foreL: 0.6, foreR: 0.6, wristL: 170, wristR: -170, handL: "grip", handR: "grip", armsOver: true, spine: -5}} e={{smile: 0.45}} />
              <G x={lx} y={-200 + ramp(lx)} z={-60}><QuiltDrape w={520} h={200} d={230} p={1} ry={cam.yaw} /></G>
              <Human c={MOVER1} x={lx + 260} z={-30} s={0.42} y={w.bob * 0.42 + ramp(lx + 260)} yaw={cam.yaw} pose={{...w, ikL: [-120, -470], ikR: [120, -470], foreL: 0.6, foreR: 0.6, wristL: 170, wristR: -170, handL: "grip", handR: "grip", armsOver: true, spine: -5}} e={{smile: 0.5}} />
            </>
          )}
          {rear && boxIn < 0.98 && (
            <Human c={MOVER3} x={mix(-1700, -1050, boxIn)} z={180} s={0.42} yaw={cam.yaw}
              pose={{ikL: [-150, -500], ikR: [150, -500], foreL: 0.55, foreR: 0.55, wristL: 165, wristR: -165, handL: "grip", handR: "grip", armsOver: true, spine: -4, head: 8, turn: 0.2}} e={{smile: 0.35, look: [0, 0.7]}}
              hold={() => <g transform="translate(0 -560)"><rect x={-150} y={-110} width={300} height={220} fill="#C99258" /><g transform="translate(-110 -10)"><rect width="220" height="64" fill="#F6F1E6" stroke="#C0262D" strokeWidth="5" /><text x="118" y="45" textAnchor="middle" fontFamily="Montserrat" fontWeight="900" fontSize="34" fill="#C0262D">FRÁGIL</text></g></g>} />
          )}
        </Street>
      </Scene3D>
    </AbsoluteFill>
  );
};

import React from "react";
import {AbsoluteFill, staticFile, Img} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, wob, FONT} from "../lib";
import {Scene3D, G, Face, Cuboid, Ground, Billboard} from "./three";
import {Box3D, Sofa3D, QuiltDrape, AlbumClosed3D, ALB, quiltBg} from "./props3d";
import {Human, AlbumFlat, PlantBB, CityView} from "./env3d";
import {PAULO, ANA, KID, MOVER1, mixPose} from "./Person";
import {Truck3D, TK} from "./Truck3D";
import {Street, TreeBB} from "./s3_diego";

// ===================== mapa (40.45 -> 45.0) =====================
const ROUTE = [[-700, 1100], [-700, 600], [-200, 600], [-200, 100], [400, 100], [400, -500], [800, -500], [800, -1000]];
const segs = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
const TOT = segs.reduce((a, b) => a + b, 0);
const along = (u) => {
  let d = u * TOT;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) { const k = d / segs[i]; const a = ROUTE[i], b = ROUTE[i + 1]; return {x: mix(a[0], b[0], k), z: mix(a[1], b[1], k), ry: b[0] !== a[0] ? (b[0] > a[0] ? 0 : 180) : (b[1] < a[1] ? 90 : -90)}; }
    d -= segs[i];
  }
  const L = ROUTE[ROUTE.length - 1]; return {x: L[0], z: L[1], ry: 90};
};
const MapArt = ({draw}) => {
  const d = ROUTE.map((p, i) => `${i ? "L" : "M"} ${p[0] + 1500} ${p[1] + 2000}`).join(" ");
  return (
    <svg width="3000" height="4000" viewBox="0 0 3000 4000">
      <rect width="3000" height="4000" fill="#0A1F52" />
      {Array.from({length: 12}, (_, i) => <path key={i} d={`M 0 ${300 + i * 320} C 900 ${150 + i * 320}, 1800 ${480 + i * 320}, 3000 ${260 + i * 320}`} stroke="#27C0F5" strokeOpacity={0.07} strokeWidth={6} fill="none" />)}
      {Array.from({length: 13}, (_, r) => Array.from({length: 10}, (_, c) => {
        const park = (r * 7 + c) % 11 === 3;
        return <rect key={`${r}${c}`} x={60 + c * 300} y={40 + r * 300} width={250} height={250} rx={24} fill={park ? "#0E4A5C" : "#10295F"} />;
      }))}
      <path d={d} stroke="#16357A" strokeWidth={44} fill="none" strokeLinejoin="round" />
      <path d={d} stroke="#27C0F5" strokeWidth={30} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} opacity={0.45} />
      <path d={d} stroke="#BFF0FF" strokeWidth={12} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
    </svg>
  );
};
const Pin = ({x, z, p, icon, yaw}) => (
  <Billboard x={x} z={z} w={260} h={420} yaw={yaw}>
    <svg width="260" height="420" viewBox="-130 -400 260 420" style={{transform: `scale(${cl(p, 0, 1.25)})`, transformOrigin: "50% 95%"}}>
      <defs><linearGradient id={`pg${icon}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#27C0F5" /><stop offset="1" stopColor="#1558D6" /></linearGradient></defs>
      <ellipse cx={0} cy={6} rx={70} ry={18} fill="#000" opacity={0.4} />
      <path d="M 0 0 C -30 -60, -110 -130, -110 -210 A 110 110 0 1 1 110 -210 C 110 -130, 30 -60, 0 0 Z" fill={`url(#pg${icon})`} />
      <circle cx={0} cy={-210} r={72} fill="#fff" />
      <g transform="translate(0 -210) scale(1.5)" stroke="#0A1C4A" strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round">
        {icon === "apt" ? <><rect x={-20} y={-24} width={40} height={50} /><path d="M -10 -12 h6 M 4 -12 h6 M -10 2 h6 M 4 2 h6" /></> : <><path d="M -26 0 L 0 -24 L 26 0" /><path d="M -18 -6 V 24 H 18 V -6" /></>}
      </g>
    </svg>
  </Billboard>
);
const Chip = ({p, label, icon, x, y, w = 300}) => (
  <div style={{position: "absolute", left: x - w / 2, top: y - 60, width: w, height: 120, borderRadius: 60, background: "rgba(14,42,110,0.92)", border: "3px solid #27C0F5", display: "flex", alignItems: "center", gap: 18, paddingLeft: 22, boxSizing: "border-box", transform: `scale(${cl(p, 0, 1.15)})`, opacity: cl(p * 2), fontFamily: FONT, fontWeight: 800, fontSize: 42, color: "#fff", boxShadow: "0 18px 40px rgba(0,0,0,0.4)"}}>
    <div style={{width: 80, height: 80, borderRadius: 40, background: "linear-gradient(180deg,#27C0F5,#1558D6)", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <svg width="50" height="50" viewBox="-25 -25 50 50" stroke="#fff" strokeWidth={4.5} fill="none" strokeLinejoin="round" strokeLinecap="round">
        {icon === "sofa" && <><rect x={-20} y={-6} width={40} height={15} rx={4} /><path d="M -20 -6 V -16 H 20 V -6 M -15 9 V 16 M 15 9 V 16" /></>}
        {icon === "fridge" && <><rect x={-12} y={-21} width={24} height={42} rx={4} /><path d="M -12 -4 H 12 M 6 -15 V -9 M 6 2 V 12" /></>}
        {icon === "box" && <><rect x={-18} y={-13} width={36} height={30} rx={3} /><path d="M -18 -4 H 18 M 0 -13 V -4" /></>}
      </svg>
    </div>
    {label}
  </div>
);
export const Shot5 = ({t}) => {
  const draw = P(t, 42.2, 43.35, EIO);
  const tr = along(P(t, 42.2, 43.35, EIO));
  const cam = KO(t, [[40.45, {tx: -700, ty: 0, tz: 1000, yaw: 0, pitch: 70, dist: 1500, persp: 1400}], [41.9, {tx: -650, ty: 0, tz: 900, yaw: -8, pitch: 58, dist: 1900, persp: 1400}], [43.4, {tx: 300, ty: 0, tz: -200, yaw: 8, pitch: 52, dist: 2500, persp: 1400}], [44.95, {tx: 150, ty: 0, tz: 0, yaw: 4, pitch: 50, dist: 2900, persp: 1400}]], ES);
  return (
    <AbsoluteFill style={{background: "#061232"}}>
      <Scene3D cam={cam}>
        <Ground w={3000} d={4000} bg="#0A1F52"><MapArt draw={draw} /></Ground>
        <Pin x={-700} z={1100} p={SP(t, 41.15, 12, 0.45)} icon="apt" yaw={cam.yaw} />
        <Pin x={800} z={-1000} p={SP(t, 42.85, 12, 0.45)} icon="house" yaw={cam.yaw} />
        {t > 42.0 && <G x={tr.x} z={tr.z} ry={tr.ry} s={0.2}><Truck3D spin={t * 400} /></G>}
      </Scene3D>
      <Chip x={290} y={1500} p={SP(t, 44.2, 13, 0.5)} label="Sofá" icon="sofa" w={300} />
      <Chip x={760} y={1500} p={SP(t, 44.35, 13, 0.5)} label="Geladeira" icon="fridge" w={420} />
      <Chip x={540} y={1660} p={SP(t, 44.5, 13, 0.5)} label="Caixas" icon="box" w={330} />
    </AbsoluteFill>
  );
};

// ===================== casa nova (exterior) =====================
const House = ({x = -3000, z = -1700}) => (
  <G x={x} z={z}>
    <G y={-700}><Cuboid w={2600} h={1400} d={1200} col="#F4F5F7" faces={{front: (
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg,#FFFFFF,#ECEEF2)"}}>
        <div style={{position: "absolute", right: 0, top: 0, width: 760, bottom: 0, background: "repeating-linear-gradient(90deg,#9C6A42 0 40px,#B07A4E 40px 70px)"}} />
        <div style={{position: "absolute", left: 160, top: 260, width: 1100, height: 700, background: "linear-gradient(160deg,#FFE9C2,#F2C58A)", border: "22px solid #2B2F3A"}}>
          <div style={{position: "absolute", left: 520, top: 0, bottom: 0, width: 18, background: "#2B2F3A"}} />
          <div style={{position: "absolute", left: 30, top: 30, width: 260, height: 300, background: "rgba(255,255,255,0.35)", transform: "skewX(-14deg)"}} />
        </div>
        <div style={{position: "absolute", left: 1420, bottom: 0, width: 280, height: 1000, background: "#6E4A36", border: "14px solid #2B2F3A", borderBottom: 0}}><div style={{position: "absolute", right: 30, top: 470, width: 16, height: 120, borderRadius: 8, background: "#D8B46A"}} /></div>
        <div style={{position: "absolute", left: 1440, top: 120, width: 240, height: 110, borderRadius: 16, background: "#0A1C4A", color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 72, display: "flex", alignItems: "center", justifyContent: "center"}}>128</div>
      </div>
    ), top: "#8B5E3C"}} /></G>
    <G y={-1420}><Cuboid w={2800} h={60} d={1300} col="#8B5E3C" /></G>
    <Ground w={3200} d={500} z={800} y={-2} bg="#7DB36A" />
  </G>
);

export const Shot6 = ({t}) => {
  if (t < 46.35) {
    const drive = P(t, 44.95, 46.05, (u) => 1 - Math.pow(1 - u, 2.6));
    const tx = mix(-5200, 0, drive);
    const stop = t > 46.0 ? Math.sin((t - 46.0) * 18) * 1.6 * Math.exp(-(t - 46.0) * 6) : 0;
    const cam = KO(t, [[44.95, {tx: -1400, ty: -520, tz: 0, yaw: 30, pitch: 4, dist: 3600, persp: 1500}], [46.35, {tx: -600, ty: -520, tz: 0, yaw: 24, pitch: 4, dist: 3300, persp: 1500}]], ES);
    return (
      <AbsoluteFill style={{background: "#A9CDF2"}}>
        <Scene3D cam={cam}>
          <Street t={t}>
            <House x={-1500} z={-2000} />
            <TreeBB x={1200} z={-1300} yaw={cam.yaw} s={1.3} />
            <TreeBB x={-3900} z={-1300} yaw={cam.yaw} s={1.2} />
            <Truck3D x={tx} z={0} spin={((tx + 5200) / (2 * Math.PI * TK.wheelR)) * 360} pitch={stop} headlight={1} />
          </Street>
        </Scene3D>
      </AbsoluteFill>
    );
  }
  // ponto de vista de dentro do baú: as portas se abrem para a casa nova
  const open = P(t, 46.45, 47.3, EIO);
  const push = P(t, 48.4, 49.0, EI);
  const cam = {tx: -800, ty: -440, tz: 0, yaw: 90, pitch: 1, dist: 380 - push * 700, persp: 1000};
  return (
    <AbsoluteFill style={{background: "#0E1220"}}>
      <Scene3D cam={cam}>
        <Street t={t}>
          <G x={-3900} ry={90}><House x={0} z={0} /></G>
          <G x={-1750}>
            <Human c={PAULO} x={0} z={-60} s={0.42} yaw={90} pose={{armL: [40, -30], armR: [-40, 30], turn: 0.05}} e={{smile: 0.9, open: 0.4}} />
            <Human c={ANA} x={-150} z={190} s={0.4} yaw={90} pose={{armR: [-30, -40]}} e={{smile: 0.85}} />
            <Human c={KID} x={-80} z={330} s={0.26} yaw={90} pose={{armR: [-150 + Math.sin(t * 8) * 18, -20]}} e={{smile: 0.95, open: 0.5}} />
          </G>
          <Truck3D x={0} z={0} open={open} interior cargo={<G y={TK.boxH / 2} s={0.42}><G x={500} z={-300}><Box3D seed={51} /></G><G x={500} z={300}><Box3D seed={52} /></G></G>} />
        </Street>
      </Scene3D>
      <AbsoluteFill style={{background: "#FFF6DE", opacity: 0.3 * Math.sin(open * Math.PI) + push}} />
    </AbsoluteFill>
  );
};

// ===================== novo lar (49.0 -> 52.4) =====================
const NewRoom = () => (
  <>
    <Ground w={6000} d={5000} bg="repeating-linear-gradient(90deg, #C9A27A 0 2px, #DDBB94 2px 200px), #DDBB94">
      <div style={{position: "absolute", left: "30%", top: "8%", width: "36%", height: "50%", background: "linear-gradient(180deg, rgba(255,246,222,0.55), transparent)", transform: "skewX(-14deg)"}} />
    </Ground>
    <G z={-1300} y={-850}><Face w={6000} h={1700} bg="linear-gradient(180deg,#F7F3EC,#EDE6DA)" back>
      <div style={{position: "absolute", left: 1900, top: 220, width: 1000, height: 1100, background: "#2E2A26"}}>
        <div style={{position: "absolute", inset: 18, background: "linear-gradient(180deg,#BFE3F7 0 45%, #9FD18F 45%)"}}>
          <div style={{position: "absolute", left: 80, top: 260, width: 360, height: 360, borderRadius: "50%", background: "#5FA463"}} />
          <div style={{position: "absolute", left: 480, top: 220, width: 300, height: 300, borderRadius: "50%", background: "#6DB56E"}} />
        </div>
        <div style={{position: "absolute", left: 491, top: 0, width: 18, bottom: 0, background: "#2E2A26"}} />
      </div>
      <div style={{position: "absolute", left: 1500, top: 0, width: 1800, height: 1700, background: "linear-gradient(200deg, rgba(255,246,222,0.45), transparent 60%)"}} />
    </Face></G>
    <G x={-1800} y={-850}><Face w={5000} h={1700} tf="rotateY(90deg)" bg="linear-gradient(180deg,#EFE9DF,#E4DBCD)" back /></G>
  </>
);
const SHELF = {x: 750, y: -760, z: -1180};
export const Shot7 = ({t}) => {
  const px = mix(150, 330, P(t, 49.0, 49.9, EIO));
  const wk = t > 49.0 && t < 49.9 ? Math.sin((t - 49.0) * 10) : 0;
  const reach = P(t, 49.9, 50.6, EIO);
  const placed = t >= 50.6;
  const back = P(t, 50.8, 51.3, EIO);
  const HOLD = {spine: 2, head: 10, turn: 0.15, ikL: [-112, -585], ikR: [112, -585], wristL: 170, wristR: -170, foreL: 0.42, foreR: 0.42, handL: "thumb", handR: "thumb", armsOver: true};
  const target = [SHELF.x - px - 30, SHELF.y - 120];
  let pose = mixPose(HOLD, {spine: 6, head: 2, turn: 0.6, ikR: target, wristR: -10, handR: "thumb", foreR: 1, armL: [12, -30], armsOver: false}, reach);
  if (placed) pose = mixPose(pose, {spine: 0, head: 4, turn: 0.4, armR: [-10, 8], handR: "relax", armL: [10, -10], armsOver: false}, back);
  pose = {...pose, legL: [wk * 16, Math.max(0, -wk) * 22], legR: [-wk * 16, Math.max(0, wk) * 22]};
  const cam = KO(t, [[48.95, {tx: 400, ty: -620, tz: -500, yaw: 10, pitch: 4, dist: 2500, persp: 1500}], [50.5, {tx: 520, ty: -680, tz: -700, yaw: 14, pitch: 3, dist: 2000, persp: 1500}], [51.4, {tx: 640, ty: -760, tz: -900, yaw: 16, pitch: 2, dist: 1500, persp: 1500}], [52.45, {tx: 740, ty: -880, tz: -1100, yaw: 12, pitch: 1, dist: 700, persp: 1500}]], ES);
  const holdAlbum = !placed ? (() => {
    const hx = mix(0, target[0], reach), hy = mix(-585, target[1], reach);
    return <AlbumFlat x={hx} y={hy} w={236} h={296} rot={mix(-2, 0, reach)} />;
  }) : undefined;
  return (
    <AbsoluteFill style={{background: "#F7F3EC"}}>
      <Scene3D cam={cam}>
        <NewRoom />
        <Sofa3D x={-700} z={-900} cover={0} />
        <G x={-1180} y={-350} z={-900}><Cuboid w={160} h={30} d={420} col="#1A56C8" faces={{top: quiltBg(false)}} /></G>
        {/* estante */}
        <G x={SHELF.x} y={SHELF.y + 15} z={SHELF.z}><Cuboid w={700} h={30} d={240} col="#9C6A42" /></G>
        <G x={SHELF.x} y={SHELF.y - 420} z={SHELF.z}><Cuboid w={700} h={30} d={240} col="#9C6A42" /></G>
        <G x={SHELF.x + 230} y={SHELF.y - 437} z={SHELF.z}><Billboard w={200} h={300} yaw={cam.yaw}>
          <svg width="200" height="300" viewBox="-100 -300 200 300"><rect x={-70} y={-200} width={140} height={190} fill="#2B2420" /><rect x={-60} y={-190} width={120} height={150} fill="#FBF8F1" /><rect x={-52} y={-182} width={104} height={110} fill="#BFE3F7" /><rect x={-30} y={-140} width={60} height={60} fill="#fff" /><rect x={-34} y={-148} width={68} height={10} fill="#8B5E3C" /><rect x={6} y={-120} width={12} height={40} fill="#6E4A36" /><rect x={-52} y={-78} width={104} height={6} fill="#7DB36A" /></svg>
        </Billboard></G>
        <G x={SHELF.x - 250} y={SHELF.y - 437} z={SHELF.z}><Billboard w={220} h={420} yaw={cam.yaw}><svg width="220" height="420" viewBox="-110 -420 220 420"><path d="M -40 -110 L 40 -110 L 30 0 L -30 0 Z" fill="#E8E2D8" />{[[-60, -330, -20], [0, -400, 0], [60, -320, 24]].map(([lx, ly, a], i) => <g key={i} transform={`translate(0 -110) rotate(${a})`}><path d={`M 0 0 C ${lx * 0.2} ${ly * 0.4}, ${lx * 0.6} ${ly * 0.7}, ${lx * 0.3} ${ly + 110}`} stroke="#2F6B3A" strokeWidth={6} fill="none" /><ellipse cx={lx * 0.3} cy={ly + 80} rx={34} ry={70} fill={i % 2 ? "#3F8A4B" : "#2F7440"} /></g>)}</svg></Billboard></G>
        {placed && <AlbumClosed3D x={SHELF.x - 20} y={SHELF.y - ALB.d / 2} z={SHELF.z + 40} standing />}
        <G x={-200} z={300}><Box3D fragile flaps={1} seed={61} /></G>
        <Human c={ANA} x={-1300} z={-400} yaw={cam.yaw} pose={{turn: 0.5, armR: [-24, -40]}} e={{smile: 0.75}} />
        <Human c={KID} x={-1050} z={-350} yaw={cam.yaw} pose={{turn: 0.5}} e={{smile: 0.9, open: 0.3}} />
        <Human c={PAULO} x={px} z={-760} yaw={cam.yaw} pose={pose} hold={holdAlbum}
          e={{smile: mix(0.5, 0.85, P(t, 50.8, 51.4)), open: P(t, 51.0, 51.4) * 0.25, look: [mix(0.2, 0.75, reach), mix(0.6, 0.2, reach)], blink: t > 51.7 && t < 51.85 ? 1 : 0}} />
      </Scene3D>
      <AbsoluteFill style={{background: "radial-gradient(70% 50% at 70% 25%, rgba(255,240,200,0.25), transparent 70%)", mixBlendMode: "screen"}} />
    </AbsoluteFill>
  );
};

// ===================== marca (52.4 -> 62) =====================
export const Shot8 = ({t}) => {
  const leave = P(t, 52.2, 53.6, (u) => u * u);
  const waves = P(t, 52.55, 53.35, EIO);
  const badge = SP(t, 55.2, 9, 0.55);
  const lift = P(t, 56.9, 57.6, EIO);
  const sweep = P(t, 55.7, 56.6, EIO);
  const ring = P(t, 55.2, 56.4, EO);
  const bs = mix(0.2, 1, cl(badge, 0, 1.1)) * mix(1, 0.8, lift);
  const by = mix(880, 690, lift);
  const cam = {tx: -500, ty: -600, tz: 0, yaw: -8, pitch: 4, dist: 3600, persp: 1500};
  const tx = mix(0, 6000, leave);
  return (
    <AbsoluteFill style={{background: "#061232"}}>
      {t < 53.4 && (
        <AbsoluteFill>
          <Scene3D cam={cam}>
            <Street t={t}>
              <House x={-1500} z={-2000} />
              <TreeBB x={1200} z={-1300} yaw={cam.yaw} s={1.3} />
              <G x={-1600} z={-950}>
                <Human c={PAULO} x={0} s={0.42} yaw={cam.yaw} pose={{armR: [-150 + Math.sin(t * 7) * 15, -20], turn: 0.3}} e={{smile: 0.85, open: 0.3}} />
                <Human c={ANA} x={-260} s={0.4} yaw={cam.yaw} pose={{armL: [8, -6]}} e={{smile: 0.85}} />
                <Human c={KID} x={240} s={0.26} yaw={cam.yaw} pose={{armR: [-150 + Math.sin(t * 9) * 18, -20]}} e={{smile: 0.95, open: 0.5}} />
              </G>
              <Truck3D x={tx} z={0} spin={(tx / (2 * Math.PI * TK.wheelR)) * 360} />
            </Street>
          </Scene3D>
        </AbsoluteFill>
      )}
      {/* ondas da marca nascem da pintura do caminhão e cobrem a tela */}
      <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
        <defs>
          <linearGradient id="ewB" x1="0" x2="1"><stop offset="0" stopColor="#1E6FF0" /><stop offset="1" stopColor="#27C0F5" /></linearGradient>
          <radialGradient id="ewN" cx="0.5" cy="0.35" r="0.9"><stop offset="0" stopColor="#12348C" /><stop offset="0.55" stopColor="#0A1C4A" /><stop offset="1" stopColor="#050E28" /></radialGradient>
        </defs>
        {(() => {
          const y = mix(2300, -500, waves);
          const yy = t > 53.35 ? mix(-500, 1650, P(t, 53.35, 54.3, EO)) + Math.sin(t * 1.1) * 14 : y;
          const s = (k) => Math.sin(t * 1.2 + k) * 24;
          return (
            <g>
              {t > 53.35 && <rect width="1080" height="1920" fill="url(#ewN)" />}
              <path d={`M -100 ${yy + 240 + s(0)} C 300 ${yy + 60 + s(1)}, 700 ${yy + 420 + s(2)}, 1180 ${yy + 120 + s(3)} L 1180 ${yy + 4000} L -100 ${yy + 4000} Z`} fill="url(#ewB)" />
              <path d={`M -100 ${yy + 330 + s(1)} C 300 ${yy + 150 + s(2)}, 700 ${yy + 510 + s(3)}, 1180 ${yy + 210 + s(4)} L 1180 ${yy + 4000} L -100 ${yy + 4000} Z`} fill="#FFFFFF" />
              <path d={`M -100 ${yy + 380 + s(2)} C 300 ${yy + 200 + s(3)}, 700 ${yy + 560 + s(4)}, 1180 ${yy + 260 + s(5)} L 1180 ${yy + 4000} L -100 ${yy + 4000} Z`} fill={t > 53.35 ? "#0B1F5C" : "url(#ewN)"} />
            </g>
          );
        })()}
      </svg>
      {t > 55.15 && (
        <div style={{position: "absolute", left: 540, top: by, width: 0, height: 0}}>
          <div style={{position: "absolute", left: -480, top: -480, width: 960, height: 960, borderRadius: "50%", border: "4px solid rgba(39,192,245,0.6)", transform: `scale(${mix(0.5, 1.15, ring)})`, opacity: 1 - ring}} />
          <div style={{position: "absolute", left: -380, top: -380, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(39,192,245,0.45), transparent 65%)", transform: `scale(${bs * 1.3})`}} />
          <div style={{position: "absolute", left: -340, top: -340, width: 680, height: 680, transform: `scale(${bs}) rotate(${(1 - cl(badge)) * -12}deg)`, filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.5))"}}>
            <Img src={staticFile("brand/badge.png")} style={{width: 680, height: 680}} />
            <div style={{position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", mixBlendMode: "screen"}}>
              <div style={{position: "absolute", top: -100, bottom: -100, width: 180, left: `${mix(-40, 130, sweep)}%`, transform: "rotate(18deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", opacity: sweep > 0 && sweep < 1 ? 1 : 0}} />
            </div>
          </div>
        </div>
      )}
      {/* convite (é também a legenda das falas finais) */}
      <div style={{position: "absolute", left: 0, width: 1080, top: 1040, textAlign: "center", fontFamily: FONT}}>
        <div style={{fontSize: 58, fontWeight: 700, color: "#fff", opacity: P(t, 57.15, 57.5), transform: `translateY(${(1 - P(t, 57.15, 57.6, EO)) * 30}px)`, textShadow: "0 6px 20px rgba(0,0,0,0.4)"}}>Fale com a nossa equipe</div>
        <div style={{display: "inline-block", marginTop: 34, padding: "26px 64px", borderRadius: 80, background: "linear-gradient(180deg,#5CD6FF,#27C0F5 45%,#1E8CF0)", boxShadow: "0 18px 40px rgba(0,30,90,0.5), inset 0 2px 0 rgba(255,255,255,0.6)", fontSize: 68, fontWeight: 900, fontStyle: "italic", color: "#071A4A", transform: `scale(${cl(SP(t, 58.5, 11, 0.5), 0, 1.15)})`}}>Peça seu orçamento</div>
        <div style={{marginTop: 54, opacity: P(t, 59.3, 59.8), display: "flex", flexDirection: "column", alignItems: "center", gap: 18}}>
          <div style={{display: "flex", alignItems: "center", gap: 18, fontSize: 48, fontWeight: 800, color: "#fff"}}>
            <svg width="50" height="50" viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="12" fill="none" stroke="#fff" strokeWidth="4" /><circle cx="24" cy="24" r="9" fill="none" stroke="#fff" strokeWidth="4" /><circle cx="35" cy="13" r="2.6" fill="#fff" /></svg>
            @diegomudancasbh
          </div>
          <div style={{fontSize: 42, fontWeight: 700, color: "#BFE9FF"}}>www.diegomudancas.com.br</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

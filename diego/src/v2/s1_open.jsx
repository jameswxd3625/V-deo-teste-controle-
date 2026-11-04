import React from "react";
import {AbsoluteFill} from "remotion";
import {P, K, KO, SP, EO, EIO, ES, EI, cl, mix, wob, FONT} from "../lib";
import {Scene3D, G, Face, Cuboid, Ground, Billboard} from "./three";
import {Box3D, Sofa3D, QuiltDrape} from "./props3d";
import {OldRoom, LampBB, PlantBB, Human, HandTop} from "./env3d";
import {PAULO, mixPose} from "./Person";
import {NameSuper} from "../ui";

const ITEMS = ["Organizar as caixas", "Cuidar dos móveis", "Escolher o transporte", "Torcer pra dar certo"];
const ListPaper = ({t}) => (
  <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg,#FFFDF7,#F2ECDF)", fontFamily: FONT, boxShadow: "inset 0 0 0 1px #E2DACB"}}>
    {Array.from({length: 9}, (_, i) => <div key={i} style={{position: "absolute", left: 24, right: 24, top: 120 + i * 48, height: 2, background: "#D9DEE8"}} />)}
    <div style={{position: "absolute", left: 30, top: 34, fontSize: 40, fontWeight: 900, fontStyle: "italic", color: "#0A1C4A"}}>Lista da mudança</div>
    <div style={{position: "absolute", left: 30, top: 88, width: 300, height: 4, background: "#27C0F5"}} />
    {ITEMS.map((it, i) => {
      const p = P(t, 4.3 + i * 0.28, 4.75 + i * 0.28, EIO);
      return (
        <div key={i} style={{position: "absolute", left: 30, top: 134 + i * 76, display: "flex", alignItems: "center", gap: 14}}>
          <div style={{width: 30, height: 30, border: "3.5px solid #0A1C4A", borderRadius: 6, opacity: cl(p * 4)}} />
          <div style={{fontSize: 30, fontWeight: 700, color: "#1B2238", whiteSpace: "nowrap", clipPath: `inset(0 ${100 - p * 100}% 0 0)`}}>{it}</div>
        </div>
      );
    })}
  </div>
);

// ---------- celular: busca de transporte ----------
const Phone = ({t}) => {
  const sc = P(t, 8.9, 9.9, EIO) * 120;
  return (
    <div style={{position: "absolute", left: 230, top: 520, width: 620, height: 1180, borderRadius: 70, background: "#16181E", boxShadow: "0 50px 100px rgba(0,0,0,0.55), inset 0 0 0 4px #33363F", transform: `rotate(${mix(-6, -2, P(t, 8.55, 9.2))}deg) translateY(${(1 - P(t, 8.55, 9.1, EO)) * 500}px)`}}>
      <div style={{position: "absolute", inset: 22, borderRadius: 52, overflow: "hidden", background: "#F4F6FA", fontFamily: FONT}}>
        <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 170, background: "#E6EAF1"}} />
        <div style={{position: "absolute", left: 36, right: 36, top: 70, height: 72, borderRadius: 36, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", paddingLeft: 30, fontSize: 30, fontWeight: 600, color: "#3A4256"}}>🔍&nbsp; transporte de mudança</div>
        <div style={{position: "absolute", left: 0, right: 0, top: 200 - sc}}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{margin: "0 36px 26px", height: 170, borderRadius: 26, background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.07)", position: "relative"}}>
              <div style={{position: "absolute", left: 24, top: 30, width: 110, height: 110, borderRadius: 20, background: "#DDE3EC"}} />
              <div style={{position: "absolute", left: 160, top: 40, width: 280, height: 20, borderRadius: 10, background: "#C7CFDB"}} />
              <div style={{position: "absolute", left: 160, top: 80, width: 200, height: 16, borderRadius: 8, background: "#DDE3EC"}} />
              <div style={{position: "absolute", left: 160, top: 112, width: 240, height: 16, borderRadius: 8, background: "#DDE3EC"}} />
              <div style={{position: "absolute", right: 30, top: 54, width: 56, height: 56, borderRadius: 28, border: "4px solid #9AA6B8", color: "#9AA6B8", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"}}>?</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const STAND = {spine: 0, head: 0, turn: 0.1};
export const Shot1 = ({t}) => {
  // ----- câmera por trechos -----
  let cam, shot;
  if (t < 2.55) {
    shot = "A";
    cam = KO(t, [[0, {tx: -280, ty: -1010, tz: -1300, yaw: 0, pitch: 0, dist: 1150, persp: 1600}], [2.6, {tx: 0, ty: -640, tz: -300, yaw: -12, pitch: 7, dist: 2900, persp: 1600}]], ES);
  } else if (t < 5.6) {
    shot = "A2";
    cam = KO(t, [[2.55, {tx: 120, ty: -500, tz: -260, yaw: -10, pitch: 30, dist: 2000, persp: 1500}], [4.2, {tx: 230, ty: -290, tz: -190, yaw: -4, pitch: 58, dist: 1150, persp: 1500}], [5.6, {tx: 235, ty: -290, tz: -185, yaw: -3, pitch: 60, dist: 1080, persp: 1500}]], ES);
  } else if (t < 7.05) {
    shot = "B";
    cam = KO(t, [[5.6, {tx: -300, ty: -300, tz: 520, yaw: 24, pitch: 38, dist: 900, persp: 1300}], [7.05, {tx: -290, ty: -290, tz: 520, yaw: 14, pitch: 42, dist: 820, persp: 1300}]], ES);
  } else if (t < 8.55) {
    shot = "C";
    cam = KO(t, [[7.05, {tx: 250, ty: -360, tz: -950, yaw: -34, pitch: 12, dist: 2100, persp: 1500}], [8.55, {tx: 260, ty: -340, tz: -950, yaw: -28, pitch: 10, dist: 1800, persp: 1500}]], ES);
  } else if (t < 10.1) {
    shot = "D";
    cam = {tx: 300, ty: -700, tz: -700, yaw: 6, pitch: 4, dist: 2200, persp: 1500};
  } else {
    shot = "E";
    cam = KO(t, [[10.1, {tx: -760, ty: -560, tz: -300, yaw: -8, pitch: -4, dist: 1650, persp: 1400}], [12.2, {tx: -720, ty: -600, tz: -300, yaw: -3, pitch: -2, dist: 1450, persp: 1400}], [12.7, {tx: -640, ty: -640, tz: -300, yaw: 2, pitch: 0, dist: 1900, persp: 1500}], [14.6, {tx: -620, ty: -620, tz: -300, yaw: 4, pitch: 1, dist: 1750, persp: 1500}]], ES);
  }
  // tremor de câmera na mão durante a tensão
  if (t > 10.3 && t < 12.4) { cam = {...cam, yaw: cam.yaw + wob(t, 1, 3) * 0.5, pitch: cam.pitch + wob(t, 2, 3) * 0.35}; }

  // ----- pilha balançando -----
  const sway = t > 10.25 && t < 12.45 ? Math.sin((t - 10.25) * 6.5) * mix(0.5, 5, P(t, 10.25, 11.9)) * (1 - P(t, 12.25, 12.45)) : 0;
  const settle = t > 12.25 ? Math.sin((t - 12.25) * 14) * 1.2 * Math.exp(-(t - 12.25) * 5) : 0;
  // ----- Paulo -----
  const pIn = P(t, 11.85, 12.3, EO);
  const px = mix(200, -470, pIn);
  const walk = t > 11.85 && t < 12.3 ? Math.sin((t - 11.85) * 16) : 0;
  const catchP = P(t, 12.1, 12.35, EO);
  const pose = mixPose(
    {...STAND, legL: [walk * 16, Math.max(0, -walk) * 24], legR: [-walk * 16, Math.max(0, walk) * 24], armL: [12 + walk * 10, -14], armR: [-12 - walk * 10, 14]},
    {spine: -6, head: -4, turn: -0.35, ikL: [-292, -728], wristL: 70, handL: "flat", armR: [-14, 18], legL: [8, -4], legR: [-10, 6]},
    catchP
  );
  const relief = P(t, 12.8, 13.4, EIO);
  const pose2 = t > 12.6 ? mixPose(pose, {spine: -3, head: 5, turn: 0.15, ikL: [-292, -728], wristL: 70, handL: "flat", armR: [-30, 70], handR: "relax"}, relief) : pose;
  const e = t < 12.6 ? {smile: -0.15, worry: 1, brow: 0.5, open: 0.25} : {smile: mix(0.05, 0.55, relief), brow: 0.15, blink: t > 13.6 && t < 13.74 ? 1 : 0, look: [mix(-0.6, 0.1, relief), 0]};

  // ----- fita e abas (plano B) -----
  const flaps = 1 - P(t, 5.62, 6.05, EIO);
  const tape = P(t, 6.15, 6.85, EIO);
  // ----- lençol caindo (plano C) -----
  const sheet = t < 7.05 ? 0 : cl(SP(t, 7.15, 5.2, 0.6), 0, 1.03);

  return (
    <AbsoluteFill style={{background: "#1A2036"}}>
      {shot === "D" ? (
        <>
          <div style={{position: "absolute", inset: 0, filter: "blur(18px)", transform: "scale(1.08)"}}>
            <Scene3D cam={cam}><OldRoom /><Sofa3D x={250} z={-950} cover={0} /><LampBB x={950} z={-900} yaw={cam.yaw} /></Scene3D>
          </div>
          <AbsoluteFill style={{background: "rgba(10,16,40,0.35)"}} />
          <Phone t={t} />
          <svg width="1080" height="1920" style={{position: "absolute", inset: 0}}>
            <HandTop x={300} y={1560} rot={28} s={1.55} side={-1} mode="grip" />
          </svg>
        </>
      ) : (
        <Scene3D cam={cam}>
          <OldRoom t={t} />
          <Sofa3D x={250} z={-950} cover={0} />
          {(shot === "C") && <G x={250} z={-950}><QuiltDrape w={1150} h={440} d={520} p={sheet} sheet ry={cam.yaw} /></G>}
          <LampBB x={950} z={-900} yaw={cam.yaw} />
          <PlantBB x={-1500} z={-1000} yaw={cam.yaw} />
          {/* mesa de centro com a lista */}
          <G x={230} y={-140} z={-190}><Cuboid w={720} h={280} d={420} col="#5A3F2E" ry={cam.yaw} faces={{top: "linear-gradient(180deg,#6E4C36,#5E402D)"}} /></G>
          <G x={235} y={-282} z={-185} ry={-4}><Face w={430} h={520} tf="rotateX(90deg)" back style={{boxShadow: "0 10px 20px rgba(0,0,0,0.3)"}}><ListPaper t={t} /></Face></G>
          <G x={460} y={-292} z={-130} ry={-30}><Cuboid w={220} h={14} d={14} col="#1E6FF0" ry={cam.yaw} /></G>
          {/* caixas pelo cômodo */}
          <Box3D x={1300} z={-500} seed={1} />
          <Box3D x={1300} z={-500} y={-260} w={280} h={220} d={260} seed={2} ry={8} />
          <Box3D x={-300} z={520} flaps={shot === "B" ? flaps : 0} tape={shot === "B" ? tape : (t > 7 ? 1 : 0)} seed={3} />
          {shot === "B" && (
            <G x={-300 - 160 + tape * 300} y={-262} z={520}>
              <Face w={300} h={360} tf="rotateX(90deg) rotateZ(-90deg)" back>
                <svg width="300" height="360" viewBox="-150 -200 300 360"><HandTop x={0} y={0} s={0.38} side={1} mode="flat" /></svg>
              </Face>
            </G>
          )}
          {/* pilha que balança */}
          <G x={-900} z={-300} rz={sway + settle} origin="0 0 0">
            <Box3D seed={4} />
            <G y={-260} rz={(sway + settle) * 0.5}><Box3D w={300} h={240} d={290} seed={5} ry={-4} />
              <G y={-240} rz={(sway + settle) * 0.9}><Box3D w={270} h={220} d={260} seed={6} ry={6} fragile /></G>
            </G>
          </G>
          {(shot === "E" && t > 11.8) && <Human c={PAULO} x={px} z={-250} yaw={cam.yaw} pose={t > 12.6 ? pose2 : pose} e={e} />}
        </Scene3D>
      )}
      {/* tom noturno com luz quente */}
      <AbsoluteFill style={{background: "radial-gradient(80% 60% at 70% 30%, rgba(255,170,90,0.10), transparent 60%)", mixBlendMode: "screen", pointerEvents: "none"}} />
      <NameSuper t={t} at={13.35} x={110} y={1180} name="Paulo" sub="Esse aqui é o" />
    </AbsoluteFill>
  );
};

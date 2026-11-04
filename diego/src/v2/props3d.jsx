import React from "react";
import {staticFile} from "remotion";
import {G, Face, Cuboid, shadeFor} from "./three";

const KRAFT = "linear-gradient(180deg,#D6A266,#C08A50)";
const kraftTex = (base = "#C99258") => `repeating-linear-gradient(0deg, rgba(120,70,20,0.05) 0 3px, transparent 3px 9px), ${base}`;

// etiqueta FRÁGIL
export const Fragile = ({w = 220, h = 70}) => (
  <div style={{width: w, height: h, background: "#F6F1E6", border: "4px solid #C0262D", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Montserrat", fontWeight: 900, color: "#C0262D", fontSize: h * 0.42, letterSpacing: 3, boxSizing: "border-box"}}>
    <svg width={h * 0.5} height={h * 0.6} viewBox="0 0 20 24"><path d="M3 1 H17 L15 9 Q10 14 5 9 Z M10 12 V21 M5 22 H15" stroke="#C0262D" strokeWidth="2.2" fill="none" /></svg>
    FRÁGIL
  </div>
);

// ---------- caixa de papelão com abas ----------
// origem: centro da base no chão. flaps: 0 fechada .. 1 aberta. tape: 0..1 (fita sobre a tampa)
export const Box3D = ({x = 0, y = 0, z = 0, ry = 0, w = 320, h = 260, d = 300, flaps = 0, tape = 1, fragile = false, inside, seed = 0, sideTape = true}) => {
  const fa = flaps * 112; // graus de abertura
  const flapW = (len, wid, tf, n) => <Face w={len} h={wid} tf={tf} bg={kraftTex("#D2A06A")} shade={shadeFor(n, ry, 0.5)} back />;
  return (
    <G x={x} y={y} z={z} ry={ry}>
      {/* sombra de contato */}
      <G y={-1}><Face w={w * 1.5} h={d * 1.5} tf="rotateX(90deg)" style={{background: "radial-gradient(closest-side, rgba(0,0,0,0.45), transparent)"}} back /></G>
      <G y={-h / 2}>
        <Cuboid w={w} h={h} d={d} ry={ry} amb={0.5} skip={{top: flaps > 0.01}}
          faces={{
            front: (
              <div style={{position: "absolute", inset: 0, background: kraftTex()}}>
                {sideTape && <div style={{position: "absolute", left: w / 2 - 26, width: 52, top: 0, height: h * 0.3 * tape, background: "rgba(236,214,170,0.85)"}} />}
                {fragile && <div style={{position: "absolute", left: w * 0.13, top: h * 0.46}}><Fragile w={w * 0.74} h={h * 0.24} /></div>}
                <div style={{position: "absolute", left: 14, top: 14, width: 60, height: 22, border: "2px solid rgba(90,50,20,0.35)"}} />
              </div>
            ),
            back: kraftTex(), left: kraftTex("#B98149"), right: kraftTex("#B98149"),
            top: (
              <div style={{position: "absolute", inset: 0, background: kraftTex("#DDAE74")}}>
                <div style={{position: "absolute", left: 0, right: 0, top: d / 2 - 1, height: 2, background: "rgba(90,50,20,0.4)"}} />
                <div style={{position: "absolute", left: w / 2 - 28, width: 56, top: 0, bottom: 0, background: "rgba(236,214,170,0.9)", transform: `scaleY(${tape})`, transformOrigin: "top"}} />
              </div>
            ),
          }}
        />
        {flaps > 0.01 && (
          <>
            {/* interior */}
            <G y={h / 2 - 2}><Face w={w - 6} h={d - 6} tf="rotateX(90deg)" bg="#6E4A26" back /></G>
            <G z={-d / 2 + 2}><Face w={w - 4} h={h - 4} bg="#7A532C" back /></G>
            <G x={-w / 2 + 2}><Face w={d - 4} h={h - 4} tf="rotateY(90deg)" bg="#5E3E1F" back /></G>
            <G x={w / 2 - 2}><Face w={d - 4} h={h - 4} tf="rotateY(-90deg)" bg="#86592E" back /></G>
            <G z={d / 2 - 2}><Face w={w - 4} h={h - 4} tf="rotateY(180deg)" bg="#6A4524" back /></G>
            {inside}
            {/* abas: frente/trás (giram em x), laterais (giram em z) */}
            <G y={-h / 2} z={d / 2} rx={fa}><G z={-d / 4}>{flapW(w, d / 2, "rotateX(90deg)", [0, -1, 0])}</G></G>
            <G y={-h / 2} z={-d / 2} rx={-fa}><G z={d / 4}>{flapW(w, d / 2, "rotateX(90deg)", [0, -1, 0])}</G></G>
            <G y={-h / 2} x={-w / 2} rz={fa * 0.92}><G x={w / 4}>{flapW(w / 2, d - 4, "rotateX(90deg)", [0, -1, 0])}</G></G>
            <G y={-h / 2} x={w / 2} rz={-fa * 0.92}><G x={-w / 4}>{flapW(w / 2, d - 4, "rotateX(90deg)", [0, -1, 0])}</G></G>
          </>
        )}
      </G>
    </G>
  );
};

// ---------- álbum de família ----------
export const ALB = {w: 230, d: 290, t: 34, cover: "#7A3A20", coverD: "#5A2814", gold: "#E2B45E", page: "#F3EADB"};
export const AlbumCover = ({w = ALB.w, d = ALB.d}) => (
  <div style={{position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 30% 20%, #96502E, ${ALB.cover} 55%, ${ALB.coverD})`, borderRadius: 8}}>
    <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: w * 0.1, background: "rgba(0,0,0,0.25)"}} />
    <div style={{position: "absolute", left: w * 0.16, right: w * 0.08, top: d * 0.07, bottom: d * 0.07, border: `2px dashed ${ALB.gold}`, borderRadius: 6, opacity: 0.85}} />
    <div style={{position: "absolute", left: w * 0.1, right: 0, top: d * 0.36, textAlign: "center", fontFamily: "Montserrat", fontStyle: "italic", fontWeight: 900, fontSize: w * 0.15, lineHeight: 1.05, color: ALB.gold, textShadow: "0 1px 0 rgba(0,0,0,0.35)"}}>Nossa<br />Família</div>
  </div>
);
// álbum fechado (cuboide) para mãos/estantes
export const AlbumClosed3D = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, standing = false}) => (
  <G x={x} y={y} z={z} rx={rx} ry={ry} rz={rz}>
    {standing
      ? <Cuboid w={ALB.w} h={ALB.d} d={ALB.t} ry={ry} faces={{front: <AlbumCover />, back: ALB.coverD, left: ALB.coverD, right: "#EFE4D0", top: "#EFE4D0", bottom: "#EFE4D0"}} />
      : <Cuboid w={ALB.w} h={ALB.t} d={ALB.d} ry={ry} faces={{top: <AlbumCover />, bottom: ALB.coverD, left: ALB.coverD, right: "#EFE4D0", front: "#EFE4D0", back: "#EFE4D0"}} />}
  </G>
);

// ---------- sofá ----------
export const Sofa3D = ({x = 0, z = 0, ry = 0, w = 1100, col = "#8C919B", colD = "#727782", cover = 0, cushion = "#D59A3A"}) => {
  const d = 480;
  return (
    <G x={x} z={z} ry={ry}>
      <G y={-1}><Face w={w * 1.25} h={d * 1.5} tf="rotateX(90deg)" style={{background: "radial-gradient(closest-side, rgba(0,0,0,0.45), transparent)"}} back /></G>
      {/* base, assento, encosto, braços */}
      <G y={-60} z={0}><Cuboid w={w - 40} h={80} d={d - 20} col={colD} ry={ry} /></G>
      <G y={-150} z={30}><Cuboid w={w - 200} h={100} d={d - 80} col={col} ry={ry} radius={18} /></G>
      <G y={-280} z={-d / 2 + 70}><Cuboid w={w - 160} h={300} d={120} col={colD} ry={ry} radius={26} /></G>
      {[-1, 1].map((sd) => <G key={sd} x={sd * (w / 2 - 70)} y={-190}><Cuboid w={140} h={260} d={d} col={col} ry={ry} radius={30} /></G>)}
      {cover < 0.02 && <G x={-w / 2 + 230} y={-290} z={-d / 2 + 160} rz={-8}><Cuboid w={190} h={160} d={50} col={cushion} ry={ry} radius={30} /></G>}
      {cover > 0 && <QuiltDrape w={w + 40} h={420} d={d + 30} p={cover} ry={ry} />}
    </G>
  );
};

// capa acolchoada (azul Diego) cobrindo um volume: topo + frente + laterais; p = descida
export const quiltBg = (logo = true) => quiltBgFn(logo);
const quiltBgFn = (logo = true) => (
  <div style={{position: "absolute", inset: 0, background: "linear-gradient(160deg,#2C72EA,#1A56C8 55%,#123F9C)"}}>
    <div style={{position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(11,47,126,0.55) 0 3px, transparent 3px 46px), repeating-linear-gradient(-45deg, rgba(11,47,126,0.55) 0 3px, transparent 3px 46px)"}} />
    <div style={{position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10) 0 14px, transparent 15px)", backgroundSize: "33px 33px"}} />
    {logo && <img src={staticFile("brand/wordmark_white.png")} style={{position: "absolute", left: "50%", top: "50%", width: "46%", transform: "translate(-50%,-50%)", opacity: 0.94}} />}
    <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.12), transparent 40%, rgba(0,0,0,0.25))"}} />
  </div>
);
const sheetBg = () => (
  <div style={{position: "absolute", inset: 0, background: "linear-gradient(170deg,#F4EFE6,#E3DACB 60%,#CFC4B2)"}}>
    <div style={{position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(92deg, rgba(110,90,60,0.16) 0 10px, rgba(255,255,255,0.12) 10px 22px, transparent 22px 96px)"}} />
    <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.15), transparent 40%, rgba(60,40,20,0.22))"}} />
  </div>
);
export const QuiltDrape = ({w, h, d, p = 1, ry = 0, logoFront = true, sheet = false}) => {
  const hh = h * Math.min(1, p);
  const quiltBg = sheet ? sheetBg : quiltBgFn;
  return (
    <G y={-h}>
      <G y={-4}><Face w={w} h={d} tf="rotateX(90deg)" shade={shadeFor([0, -1, 0], ry, 0.5)} style={{borderRadius: 30}}>{quiltBg(false)}</Face></G>
      <G z={d / 2} y={hh / 2}><Face w={w} h={hh} shade={shadeFor([0, 0, 1], ry, 0.5)} style={{borderRadius: "0 0 26px 26px"}}>{quiltBg(logoFront && p > 0.6)}</Face></G>
      {[-1, 1].map((sd) => <G key={sd} x={sd * w / 2} y={hh / 2}><Face w={d} h={hh} tf={`rotateY(${sd * 90}deg)`} shade={shadeFor([sd, 0, 0], ry, 0.5)}>{quiltBg(false)}</Face></G>)}
      <G z={-d / 2} y={hh / 2}><Face w={w} h={hh} tf="rotateY(180deg)" shade={shadeFor([0, 0, -1], ry, 0.5)}>{quiltBg(false)}</Face></G>
    </G>
  );
};

// geladeira (opcionalmente coberta)
export const Fridge3D = ({x = 0, z = 0, ry = 0, cover = 0}) => (
  <G x={x} z={z} ry={ry}>
    <G y={-1}><Face w={500} h={500} tf="rotateX(90deg)" style={{background: "radial-gradient(closest-side, rgba(0,0,0,0.45), transparent)"}} back /></G>
    {cover < 0.98 && <G y={-500}><Cuboid w={380} h={1000} d={380} col="#E8EBEF" ry={ry} radius={14} faces={{front: <div style={{position: "absolute", inset: 0, background: "linear-gradient(90deg,#F4F6F8,#D9DDE3)"}}><div style={{position: "absolute", left: 0, right: 0, top: 380, height: 4, background: "#B9BEC6"}} /><div style={{position: "absolute", right: 30, top: 120, width: 14, height: 160, borderRadius: 7, background: "#9AA0AA"}} /></div>}} /></G>}
    {cover > 0 && <QuiltDrape w={400} h={1010} d={400} p={cover} ry={ry} />}
  </G>
);

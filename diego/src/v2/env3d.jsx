import React from "react";
import {staticFile} from "remotion";
import {G, Face, Cuboid, Ground, Billboard, shadeFor} from "./three";
import {Person} from "./Person";
import {ALB} from "./props3d";

// ---------- personagem no espaço 3D ----------
export const Human = ({c, pose, e, x = 0, z = 0, y = 0, s = 1, yaw = 0, flip = 1, hold, holdLayer, rim}) => {
  const W = 760, H = 1200;
  return (
    <Billboard x={x} y={y} z={z} w={W * s} h={H * s} yaw={yaw}>
      <svg width={W * s} height={H * s} viewBox={`${-W / 2} ${-H + 40} ${W} ${H}`} style={{overflow: "visible"}}>
        <Person c={c} pose={pose} e={e} flip={flip} hold={hold} holdLayer={holdLayer} rim={rim} />
      </svg>
    </Billboard>
  );
};

// ---------- álbum desenhado em 2D (mesma arte do 3D) ----------
export const AlbumFlat = ({x = 0, y = 0, w = ALB.w, h = ALB.d, rot = 0, thick = 16}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <defs>
      <radialGradient id="albF" cx="0.3" cy="0.2" r="1"><stop offset="0" stopColor="#96502E" /><stop offset="0.55" stopColor={ALB.cover} /><stop offset="1" stopColor={ALB.coverD} /></radialGradient>
    </defs>
    <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h + thick * 0.5} rx={8} fill="#EFE4D0" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="url(#albF)" />
    <rect x={-w / 2} y={-h / 2} width={w * 0.1} height={h} fill="#000" opacity={0.25} />
    <rect x={-w / 2 + w * 0.16} y={-h / 2 + h * 0.07} width={w * 0.76} height={h * 0.86} rx={6} fill="none" stroke={ALB.gold} strokeWidth={2.2} strokeDasharray="6 4" opacity={0.85} />
    <text x={w * 0.05} y={-h * 0.02} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={900} fontSize={w * 0.15} fill={ALB.gold}>Nossa</text>
    <text x={w * 0.05} y={h * 0.15} textAnchor="middle" fontFamily="Montserrat" fontStyle="italic" fontWeight={900} fontSize={w * 0.15} fill={ALB.gold}>Família</text>
  </g>
);

// ---------- mão vista de cima (close-ups) ----------
// side: -1 esquerda, 1 direita. mode: "flat" (apoiada), "grip" (segurando borda: polegar em cima, dedos por baixo)
export const HandTop = ({x = 0, y = 0, rot = 0, s = 1, side = 1, mode = "flat", skin = "#B97A55", skinS = "#8E5639", skinH = "#D49A74", sleeve = "#D59A3A", sleeveS = "#A8701F"}) => {
  const fl = side < 0 ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * fl} ${s})`}>
      <defs>
        <linearGradient id={`hk${side}${mode}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={skinH} /><stop offset="0.6" stopColor={skin} /><stop offset="1" stopColor={skinS} /></linearGradient>
      </defs>
      {/* antebraço e manga dobrada */}
      <path d="M -70 120 C -76 220, -80 420, -90 700 L 110 700 C 96 420, 92 220, 86 120 Z" fill={`url(#hk${side}${mode})`} />
      <path d="M -96 330 C -40 314, 60 314, 118 330 L 140 760 L -120 760 Z" fill={sleeve} />
      <path d="M -96 330 C -40 314, 60 314, 118 330 L 120 376 C 60 360, -40 360, -98 376 Z" fill={sleeveS} />
      {/* dorso da mão */}
      <path d="M -72 130 C -84 70, -70 -6, -40 -30 C -10 -46, 40 -44, 66 -26 C 86 -4, 92 70, 86 130 Z" fill={`url(#hk${side}${mode})`} />
      {/* dedos */}
      {(mode === "flat" ? [[-44, -30, -112, -6], [-14, -40, -140, -2], [16, -40, -134, 2], [44, -30, -108, 8]] : [[-44, -30, -64, -6], [-14, -40, -74, -2], [16, -40, -72, 2], [44, -30, -60, 8]]).map(([fx, fy, len, a], i) => (
        <g key={i} transform={`translate(${fx} ${fy}) rotate(${a})`}>
          <path d={`M -15 10 C -17 ${len * 0.5}, -13 ${len + 6}, 0 ${len - 4} C 13 ${len + 6}, 17 ${len * 0.5}, 15 10 Z`} fill={i % 2 ? skin : skinH} stroke={skinS} strokeWidth={2} strokeOpacity={0.5} />
          <path d={`M -9 ${len * 0.42} q 9 5 18 0 M -9 ${len * 0.72} q 9 4 18 0`} stroke={skinS} strokeWidth={2} fill="none" opacity={0.55} />
          {mode === "flat" && <ellipse cx={0} cy={len + 4} rx={9} ry={11} fill="#E8B9A0" opacity={0.75} />}
        </g>
      ))}
      {/* polegar */}
      <path d={mode === "flat" ? "M -66 70 C -110 40, -150 -10, -146 -40 C -140 -60, -118 -56, -108 -36 C -94 -6, -70 20, -54 36 Z" : "M -66 70 C -100 40, -120 -10, -112 -50 C -104 -70, -82 -64, -78 -40 C -72 -6, -62 20, -50 36 Z"} fill={skin} stroke={skinS} strokeWidth={2} strokeOpacity={0.55} />
      {/* juntas */}
      {[-44, -14, 16, 44].map((kx) => <path key={kx} d={`M ${kx - 10} -12 q 10 -6 20 0`} stroke={skinS} strokeWidth={2.4} fill="none" opacity={0.5} />)}
    </g>
  );
};

// ---------- janela com vista de BH ----------
export const CityView = ({w, h, mode = "dusk"}) => {
  const sky = mode === "dusk" ? ["#1F2D57", "#5B5C8E", "#D98B6A", "#F4B66E"] : ["#4F8FE0", "#8FBDEB", "#C9E2F7", "#EAF4FC"];
  return (
    <svg width={w} height={h} viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={`cv${mode}`} x1="0" y1="0" x2="0" y2="1">{sky.map((c, i) => <stop key={i} offset={i / 3} stopColor={c} />)}</linearGradient></defs>
      <rect width="600" height="800" fill={`url(#cv${mode})`} />
      <path d="M 0 520 L 60 480 L 110 500 L 170 440 L 220 462 L 280 420 L 340 450 L 400 410 L 460 446 L 520 420 L 600 450 L 600 800 L 0 800 Z" fill={mode === "dusk" ? "#3A3866" : "#7FA3C9"} />
      {Array.from({length: 11}, (_, i) => {
        const x = i * 56 - 10, y = 560 + ((i * 53) % 120), bw = 46 + ((i * 17) % 20);
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={800 - y} fill={mode === "dusk" ? (i % 2 ? "#262B4D" : "#2E3459") : (i % 2 ? "#C7D3E3" : "#B4C3D8")} />
            {mode === "dusk" && Array.from({length: 12}, (_, k) => ((i * 7 + k * 3) % 5 < 2 ? <rect key={k} x={x + 7 + (k % 3) * 13} y={y + 12 + Math.floor(k / 3) * 26} width={7} height={10} fill="#FFD08A" opacity={0.9} /> : null))}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- sala antiga (noite ou manhã do dia da mudança) ----------
// parede do fundo em 3 partes para abrir o vão da porta de entrada (x 900..1500)
export const OldRoom = ({t = 0, lamp = 1, day = false, door = 0, hall}) => {
  const wallBg = day ? "linear-gradient(180deg,#8EA0C0,#A9B8D2)" : "linear-gradient(180deg,#34446A,#4B5A7D)";
  const wallFrame = (x0, x1, y0, y1, children) => (
    <G x={(x0 + x1) / 2} y={(y0 + y1) / 2} z={-1300}><Face w={x1 - x0} h={y1 - y0} bg={wallBg} back style={{backgroundSize: "6000px 1700px", backgroundPosition: `${-(x0 + 3000)}px ${-(y0 + 1700)}px`}}>{children}</Face></G>
  );
  return (
    <>
      <Ground w={6000} d={5000} z={0} bg={day ? "repeating-linear-gradient(90deg, #7A5640 0 2px, #8E6A50 2px 180px), #8E6A50" : "repeating-linear-gradient(90deg, #5B3E2C 0 2px, #6E4C36 2px 180px), #6E4C36"}>
        {!day && <div style={{position: "absolute", inset: 0, background: `radial-gradient(40% 30% at 70% 40%, rgba(255,190,110,${0.28 * lamp}), transparent 70%)`}} />}
        {day && <div style={{position: "absolute", left: "38%", top: "10%", width: "30%", height: "45%", background: "linear-gradient(180deg, rgba(255,244,214,0.28), transparent)", transform: "skewX(-12deg)"}} />}
        <div style={{position: "absolute", left: "40%", top: "44%", width: "26%", height: "18%", borderRadius: "50%", background: "#3A4A6A", opacity: 0.55}} />
      </Ground>
      {wallFrame(-3000, 900, -1700, 0, (
        <>
          <div style={{position: "absolute", left: 2400, top: 260, width: 640, height: 860, background: "#1E2336", boxShadow: "0 30px 60px rgba(0,0,0,0.4)"}}>
            <div style={{position: "absolute", inset: 22}}><CityView w={596} h={816} mode={day ? "day" : "dusk"} /></div>
            <div style={{position: "absolute", left: 300, top: 0, width: 18, bottom: 0, background: "#1E2336"}} />
            <div style={{position: "absolute", left: 0, right: 0, top: 410, height: 18, background: "#1E2336"}} />
            <div style={{position: "absolute", left: 30, top: 30, width: 160, height: 300, background: "linear-gradient(160deg, rgba(255,255,255,0.10), transparent)"}} />
          </div>
          <div style={{position: "absolute", left: 3300, top: 420, width: 300, height: 240, background: "#2B2420", boxShadow: "0 20px 40px rgba(0,0,0,0.35)"}}><div style={{position: "absolute", inset: 16, background: "linear-gradient(180deg,#9DB7D8,#C9D9EA 60%,#4C6A58 61%)"}} /></div>
          <div style={{position: "absolute", left: 3680, top: 470, width: 180, height: 230, background: "rgba(255,255,255,0.07)"}} />
          <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 26, background: "#2C3552"}} />
          {!day && <div style={{position: "absolute", left: 3300, top: 0, width: 600, height: 1700, background: `radial-gradient(60% 40% at 80% 30%, rgba(255,200,120,${0.35 * lamp}), transparent 70%)`}} />}
        </>
      ))}
      {wallFrame(1500, 3000, -1700, 0, <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 26, background: "#2C3552"}} />)}
      {wallFrame(900, 1500, -1700, -1160, null)}
      {/* batente */}
      <G x={1200} y={-1160} z={-1296}><Face w={640} h={28} bg="#F4F5F8" /></G>
      <G x={890} y={-580} z={-1296}><Face w={24} h={1160} bg="#F4F5F8" /></G>
      <G x={1510} y={-580} z={-1296}><Face w={24} h={1160} bg="#F4F5F8" /></G>
      {/* corredor iluminado atrás da porta */}
      <G x={1200} y={-580} z={-1900}><Face w={900} h={1160} bg="linear-gradient(180deg,#F2E6D2,#D8C6AA)" back><div style={{position: "absolute", left: 300, top: 120, width: 300, height: 400, background: "#FFF6E0", opacity: 0.8}} /></Face></G>
      <G x={1200} y={-1} z={-1600}><Face w={900} h={600} tf="rotateX(90deg)" bg="#C9B394" back /></G>
      {[900, 1500].map((xx) => <G key={xx} x={xx} y={-580} z={-1600}><Face w={600} h={1160} tf="rotateY(90deg)" bg="#E2D3BA" back /></G>)}
      {hall}
      {/* folha da porta: abre para dentro (em direção à câmera) */}
      <G x={900} y={-580} z={-1300} ry={-door * 100}>
        <G x={300}><Face w={600} h={1160} bg="linear-gradient(90deg,#8B5E44,#7A5038)" back>
          <div style={{position: "absolute", left: 50, top: 60, width: 500, height: 460, border: "6px solid rgba(0,0,0,0.15)", borderRadius: 10}} />
          <div style={{position: "absolute", left: 50, top: 600, width: 500, height: 460, border: "6px solid rgba(0,0,0,0.15)", borderRadius: 10}} />
          <div style={{position: "absolute", right: 46, top: 560, width: 26, height: 26, borderRadius: 13, background: "#D8B46A"}} />
        </Face></G>
      </G>
      <G x={-1800} y={-850} z={0}><Face w={5000} h={1700} tf="rotateY(90deg)" bg={day ? "linear-gradient(180deg,#7E91B4,#98A9C6)" : "linear-gradient(180deg,#2B3858,#3C4A6C)"} back /></G>
    </>
  );
};

// luminária de piso (billboard 2D)
export const LampBB = ({x, z, yaw, on = 1}) => (
  <Billboard x={x} z={z} w={320} h={1500} yaw={yaw}>
    <svg width="320" height="1500" viewBox="-160 -1500 320 1500">
      <defs><radialGradient id="lmpG" cx="0.5" cy="1" r="0.9"><stop offset="0" stopColor="#FFF4D6" /><stop offset="1" stopColor="#F6C978" /></radialGradient></defs>
      <circle cx={0} cy={-1240} r={150} fill="#FFCB7A" opacity={0.25 * on} />
      <ellipse cx={0} cy={-6} rx={70} ry={12} fill="#000" opacity={0.3} />
      <rect x={-44} y={-16} width={88} height={14} rx={7} fill="#2A2522" />
      <rect x={-6} y={-1200} width={12} height={1188} fill="#2A2522" />
      <path d="M -110 -1180 L 110 -1180 L 76 -1340 L -76 -1340 Z" fill="url(#lmpG)" />
      <ellipse cx={0} cy={-1180} rx={110} ry={12} fill="#FFE9B8" opacity={on} />
    </svg>
  </Billboard>
);

export const PlantBB = ({x, z, yaw, s = 1}) => (
  <Billboard x={x} z={z} w={500 * s} h={800 * s} yaw={yaw}>
    <svg width={500 * s} height={800 * s} viewBox="-250 -800 500 800">
      <ellipse cx={0} cy={-4} rx={90} ry={14} fill="#000" opacity={0.3} />
      <path d="M -70 -150 L 70 -150 L 54 0 L -54 0 Z" fill="#E8E2D8" /><path d="M -70 -150 L 70 -150 L 66 -120 L -66 -120 Z" fill="#D4CCBF" />
      {[[-90, -460, -30], [-20, -560, -8], [60, -500, 18], [110, -380, 34], [-120, -330, -44], [10, -440, 4], [80, -300, 50]].map(([lx, ly, a], i) => (
        <g key={i} transform={`translate(0 -150) rotate(${a})`}>
          <path d={`M 0 0 C ${lx * 0.2} ${ly * 0.4}, ${lx * 0.6} ${ly * 0.7}, ${lx * 0.3} ${ly + 160}`} stroke="#2F6B3A" strokeWidth={7} fill="none" />
          <path d={`M ${lx * 0.3} ${ly + 160} C ${lx * 0.3 - 80} ${ly + 210}, ${lx * 0.3 - 40} ${ly + 80}, ${lx * 0.3} ${ly + 26} C ${lx * 0.3 + 40} ${ly + 80}, ${lx * 0.3 + 80} ${ly + 210}, ${lx * 0.3} ${ly + 160} Z`} fill={i % 2 ? "#3F8A4B" : "#2F7440"} />
        </g>
      ))}
    </svg>
  </Billboard>
);

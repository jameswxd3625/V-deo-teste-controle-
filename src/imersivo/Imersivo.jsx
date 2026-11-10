// Diego Mudanças — vídeo imersivo (vertical, 32 s).
// A câmera percorre um corredor 3D na cor da marca, guiada pela linha da rota, passando por fotos
// e telas com vídeos reais. Ela mergulha no vídeo do caminhão, atravessa a tela e termina no leão.
import React, {useMemo, useState, useEffect, useRef} from "react";
import * as THREE from "three";
import {ThreeCanvas} from "@remotion/three";
import {useThree} from "@react-three/fiber";
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from "remotion";
import {FONT} from "../diego/kit";
import {V, cl, lerp, seg, ss, eio, eo, ei} from "../three/kit";

export const IMV_FPS = 30;
export const IMV_T = 32;
const NAVY = "#040B26", SKY = "#8FD3EE", CYAN = "#2DB5E0";
const f = (n) => staticFile("imersivo/" + n);

/* ---------------- texturas ---------------- */
function useTextures(list) {
  const [tex, setTex] = useState(null);
  const [h] = useState(() => delayRender("texturas"));
  useEffect(() => {
    const loader = new THREE.TextureLoader(), out = {};
    Promise.all(list.map(([k, src]) => new Promise((res) => loader.load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; out[k] = t; res(); }, undefined, () => res()))))
      .then(() => { setTex(out); continueRender(h); });
  }, []);
  return tex;
}
const glowTex = (() => {
  let t = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return (t = new THREE.CanvasTexture(c));
  };
})();

/* ---------------- câmera: curva suave pelos pontos-chave ---------------- */
const KEYS = [
  [0.0, V(0, 1.95, 6.5), V(0, 2.2, -56)],
  [3.2, V(0, 1.72, 1.2), V(-0.7, 1.7, -8)],
  [5.4, V(0.35, 1.66, -4.4), V(1.1, 1.66, -14)],
  [7.8, V(0, 1.66, -9.4), V(0, 1.75, -17)],
  [10.4, V(0, 1.74, -12.6), V(0, 1.76, -17)],
  [12.6, V(0, 1.78, -14.6), V(0, 2.0, -27)],
  [15.2, V(-0.15, 1.95, -19.4), V(0, 2.15, -28)],
  [17.6, V(0, 2.2, -23.288), V(0, 2.2, -28)],
];
const KEYS2 = [
  [20.0, V(0, 1.72, -28.9), V(0.6, 1.7, -36)],
  [22.4, V(0.1, 1.7, -34.0), V(0, 1.76, -42.5)],
  [24.4, V(0, 1.74, -37.4), V(0, 1.76, -42.5)],
  [26.8, V(0, 1.76, -38.2), V(0, 1.76, -42.5)],
  [28.4, V(0, 2.25, -44.0), V(0, 2.55, -56)],
  [29.7, V(0, 2.55, -50.6), V(0, 2.6, -56)],
];
function path(keys) {
  return {keys, p: new THREE.CatmullRomCurve3(keys.map((k) => k[1]), false, "centripetal"), q: new THREE.CatmullRomCurve3(keys.map((k) => k[2]), false, "centripetal")};
}
const P1 = path(KEYS), P2 = path(KEYS2);
function camAt(t) {
  const P = t < 19.999 ? P1 : P2, K = P.keys;
  const tt = cl(t, K[0][0], K[K.length - 1][0]);
  let i = 0; while (i < K.length - 2 && tt > K[i + 1][0]) i++;
  let fr = (tt - K[i][0]) / (K[i + 1][0] - K[i][0]);
  // início e fim de cada trecho com aceleração suave; no meio, velocidade contínua
  if (i === 0) fr = fr * fr * (2 - fr) * 0.5 + fr * 0.5;
  const u = (i + fr) / (K.length - 1);
  return {pos: P.p.getPoint(u), target: P.q.getPoint(u)};
}
function Cam({t}) {
  const {camera, size} = useThree();
  const {pos, target} = camAt(t);
  // leve respiração de câmera na mão (muito sutil)
  pos.x += Math.sin(t * 0.9) * 0.012; pos.y += Math.sin(t * 1.3 + 1) * 0.008;
  camera.position.copy(pos); camera.fov = 46; camera.near = 0.05; camera.far = 200; camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix(); camera.lookAt(target);
  return null;
}

/* ---------------- peças da cena ---------------- */
function Frame({w, h, children, glow = 0.35, opacity = 1}) {
  const g = useMemo(glowTex, []);
  return (
    <group>
      <mesh position={[0, 0, -0.06]} scale={[w * 1.9, h * 1.5, 1]}><planeGeometry /><meshBasicMaterial map={g} color="#1F4FCC" transparent opacity={glow * opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      <mesh position={[0, 0, -0.025]}><planeGeometry args={[w + 0.07, h + 0.07]} /><meshBasicMaterial color="#C9E9F7" transparent opacity={0.9 * opacity} toneMapped={false} /></mesh>
      <mesh position={[0, 0, -0.02]}><planeGeometry args={[w + 0.035, h + 0.035]} /><meshBasicMaterial color="#0A1B4D" transparent opacity={opacity} toneMapped={false} /></mesh>
      {children}
    </group>
  );
}
function Photo({tex, w = 1.5, pos, rotY = 0, t, i = 0, show = 1}) {
  if (!tex) return null;
  const h = w * (tex.image.height / tex.image.width);
  const bob = Math.sin(t * 0.7 + i * 1.7) * 0.025;
  const g = useMemo(glowTex, []);
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[0, rotY + Math.sin(t * 0.5 + i) * 0.015, 0]} scale={0.92 + 0.08 * show}>
      <Frame w={w} h={h} opacity={show}>
        <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} transparent opacity={show} toneMapped={false} /></mesh>
      </Frame>
      {/* poça de luz no chão */}
      <mesh position={[0, -pos[1] - bob + 0.012, 0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={[w * 2.2, 1.6, 1]}><planeGeometry /><meshBasicMaterial map={g} color="#2DB5E0" transparent opacity={0.16 * show} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
}
// tela com vídeo real: carrega o quadro exato do trecho a cada frame (determinístico na renderização)
function useFrameTex(dir, n, t, t0) {
  const idx = Math.max(1, Math.min(n, Math.floor((t - t0) * 30) + 1));
  const active = t >= t0 - 0.01;
  const {advance} = useThree();
  const pending = useRef(null);
  const [state, setState] = useState({idx: 0, tex: null});
  useEffect(() => {
    if (!active) return;
    const h = delayRender("quadro " + dir + idx);
    pending.current = h;
    new THREE.TextureLoader().load(f(`fr/${dir}/${String(idx).padStart(4, "0")}.jpg`), (tx) => {
      tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
      setState((old) => { if (old.tex) old.tex.dispose(); return {idx, tex: tx}; });
    }, undefined, () => { pending.current = null; continueRender(h); });
  }, [idx, active]);
  // depois que a textura nova entrou na cena, redesenha o WebGL e só então libera a captura do quadro
  useEffect(() => {
    if (pending.current == null || !state.tex) return;
    const h = pending.current; pending.current = null;
    advance(performance.now());
    requestAnimationFrame(() => { advance(performance.now()); continueRender(h); });
  }, [state]);
  return state.tex;
}
function VideoScreen({dir, n, w, h, pos, rotY = 0, t, t0, t1, slide = null}) {
  const tex = useFrameTex(dir, n, t, t0);
  const g = useMemo(glowTex, []);
  if (t < t0 || t > t1) return null;
  const on = eo(seg(t, t0, t0 + 0.45));
  let x = pos[0], ry = rotY, z = pos[2];
  if (slide) { const u = eio(seg(t, slide.t0, slide.t1)); x += slide.dx * u; ry += slide.ry * u; z += (slide.dz || 0) * u; }
  return (
    <group position={[x, pos[1], z]} rotation={[0, ry, 0]} scale={0.9 + 0.1 * on}>
      <Frame w={w} h={h} glow={0.45 * on} opacity={1}>
        {/* a tela "acende": vai do preto à imagem, sem ficar transparente */}
        <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial key={tex ? tex.uuid : "vazio"} map={tex || null} color={tex ? new THREE.Color(on, on, on) : "#000000"} toneMapped={false} /></mesh>
      </Frame>
      <mesh position={[0, -pos[1] + 0.012, 0.4]} rotation={[-Math.PI / 2, 0, 0]} scale={[w * 2.4, 2.0, 1]}><planeGeometry /><meshBasicMaterial map={g} color="#2DB5E0" transparent opacity={0.2 * on} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
}
function Route({t}) {
  const len = 64, draw = eo(seg(t, 0.35, 2.6));
  const g = useMemo(glowTex, []);
  return (
    <group>
      {/* linha da rota no chão, desenhada a partir da câmera */}
      <mesh position={[0, 0.006, 6 - (len * draw) / 2]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, Math.max(0.001, len * draw), 1]}>
        <planeGeometry args={[0.05, 1]} /><meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.005, 6 - (len * draw) / 2]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, Math.max(0.001, len * draw), 1]}>
        <planeGeometry args={[0.5, 1]} /><meshBasicMaterial color={CYAN} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* faixas laterais discretas, como as linhas da pintura dos caminhões */}
      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, 0.004, -22]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.02, 64]} /><meshBasicMaterial color="#1F4FCC" transparent opacity={0.55 * draw} toneMapped={false} /></mesh>
      ))}
      {/* ponto de luz que corre à frente da câmera */}
      <mesh position={[0, 0.02, 6 - len * draw]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.9, 0.9, 1]}><planeGeometry /><meshBasicMaterial map={g} color="#BFEFFF" transparent opacity={draw < 1 ? 0.9 : 0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
}
function Lion({tex, t}) {
  const g = useMemo(glowTex, []);
  const appear = eo(seg(t, 0.9, 3.0)), pulse = 0.85 + 0.15 * Math.sin(t * 1.6), fin = ss(seg(t, 27.5, 29.6));
  return (
    <group position={[0, 2.6, -56]}>
      <mesh position={[0, 0, -0.4]} scale={[12, 12, 1]}><planeGeometry /><meshBasicMaterial map={g} color="#1F4FCC" transparent opacity={(0.5 * pulse + 0.4 * fin) * appear} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} /></mesh>
      <mesh scale={[5.6, 5.6, 1]}><planeGeometry /><meshBasicMaterial map={tex} transparent opacity={appear} fog={false} toneMapped={false} /></mesh>
    </group>
  );
}

function Scene({tex}) {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const s = (a) => Math.round(a * fps);
  return (
    <>
      <Cam t={t} />
      <color attach="background" args={[NAVY]} />
      <fog attach="fog" args={[NAVY, 7, 30]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 3, -10]} intensity={30} distance={22} color="#2DB5E0" />
      <pointLight position={[0, 3, -30]} intensity={30} distance={22} color="#2153D2" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -22]}><planeGeometry args={[30, 70]} /><meshStandardMaterial color="#071538" roughness={0.38} metalness={0.55} /></mesh>
      <Route t={t} />
      <Lion tex={tex.leao} t={t} />
      {/* fotos ao longo do caminho */}
      <Photo tex={tex.atendimento} pos={[-1.75, 1.62, -4.4]} rotY={0.5} t={t} i={0} />
      <Photo tex={tex.embalagem} pos={[1.75, 1.62, -8.7]} rotY={-0.5} t={t} i={1} />
      <Photo tex={tex.mudanca} pos={[-1.95, 1.7, -21.6]} rotY={0.5} t={t} i={2} />
      <Photo tex={tex.transporte} pos={[2.05, 1.7, -24.0]} rotY={-0.5} t={t} i={3} />
      <Photo tex={tex.chegada} pos={[-1.7, 1.62, -32.6]} rotY={0.5} t={t} i={4} />
      <Photo tex={tex.guarda} pos={[1.7, 1.62, -35.2]} rotY={-0.5} t={t} i={5} />
      {/* telas com vídeo real */}
      <VideoScreen dir="p3" n={132} w={1.8} h={1.8} pos={[0, 1.76, -17]} t={t} t0={7.6} t1={13.5} slide={{t0: 12.1, t1: 13.4, dx: 3.6, ry: -0.7, dz: -1}} />
      <VideoScreen dir="cam" n={150} w={2.25} h={4.0} pos={[0, 2.2, -28]} t={t} t0={15.0} t1={20.0} />
      <VideoScreen dir="dan" n={138} w={1.7} h={1.7 * 854 / 480} pos={[0, 1.76, -42.5]} t={t} t0={22.4} t1={28.0} slide={{t0: 26.9, t1: 27.9, dx: -3.8, ry: 0.7, dz: -1}} />
    </>
  );
}

/* ---------------- textos ---------------- */
function Line({children, t, t0, t1, d = 0, size = 74, color = "#fff", italic = false, weight = 800}) {
  const a = eo(seg(t, t0 + d, t0 + d + 0.55)), b = ei(seg(t, t1 - 0.35, t1));
  return (
    <div style={{overflow: "hidden", padding: "0.06em 0.12em"}}>
      <div style={{transform: `translateY(${(1 - a) * 110 - b * 30}%)`, opacity: 1 - b, fontFamily: FONT, fontWeight: weight, fontStyle: italic ? "italic" : "normal", fontSize: size, lineHeight: 1.08, letterSpacing: "-0.02em", color, textShadow: "0 6px 30px rgba(2,8,30,.65)"}}>{children}</div>
    </div>
  );
}
function Caption({t, t0, t1, a, b, small = false}) {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  return (
    <div style={{position: "absolute", left: 70, right: 70, bottom: 230, textAlign: "left"}}>
      <Line t={t} t0={t0} t1={t1}>{a}</Line>
      <Line t={t} t0={t0} t1={t1} d={0.12} color={SKY} size={small ? 52 : 74} weight={small ? 700 : 800}>{b}</Line>
    </div>
  );
}

/* ---------------- final: marca e contatos ---------------- */
function EndCard({t}) {
  const T0 = 29.6;
  if (t < T0) return null;
  const k = (d, dur = 0.7) => eo(seg(t, T0 + d, T0 + d + dur));
  const lion = k(0, 0.9), logo = k(0.25), s1 = k(0.45), s2 = k(0.6), c1 = k(0.95), c2 = k(1.1);
  const up = (v) => ({opacity: v, transform: `translateY(${(1 - v) * 40}px)`});
  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 45% at 50% 34%, #123596 0%, #0A1B4D 45%, ${NAVY} 100%)`, alignItems: "center", fontFamily: FONT}}>
      <Img src={staticFile("diego/leao.png")} style={{position: "absolute", top: 260, width: 560, height: 560, opacity: lion, transform: `scale(${1.25 - 0.25 * lion})`, filter: "drop-shadow(0 0 60px rgba(45,181,224,.45))"}} />
      <Img src={staticFile("craft/letreiro.png")} style={{position: "absolute", top: 860, width: 640, ...up(logo)}} />
      <div style={{position: "absolute", top: 1250, width: 940, textAlign: "center"}}>
        <div style={{fontWeight: 800, fontSize: 60, color: "#fff", lineHeight: 1.12, ...up(s1)}}>Conectando destinos,</div>
        <div style={{fontWeight: 800, fontSize: 60, color: SKY, lineHeight: 1.12, ...up(s2)}}>transportando recomeços.</div>
      </div>
      <div style={{position: "absolute", top: 1500, display: "flex", flexDirection: "column", alignItems: "center", gap: 22}}>
        <div style={{display: "flex", alignItems: "center", gap: 18, padding: "22px 44px", borderRadius: 16, background: "#2153D2", fontWeight: 800, fontSize: 46, color: "#fff", ...up(c1)}}>
          <svg width="46" height="46" viewBox="0 0 32 32"><path d="M16 3.5A12.5 12.5 0 0 0 5.2 22.3L3.6 28.4l6.3-1.6A12.5 12.5 0 1 0 16 3.5Z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /><path d="M11.6 9.8c.4 0 .8 0 1 .6l1.2 2.8c.1.3.1.6-.1.9l-.8 1c-.2.2-.2.5 0 .8.6 1 1.4 2 2.3 2.7.8.7 1.7 1.2 2.6 1.6.3.1.6.1.8-.2l1-1.2c.3-.3.6-.3.9-.2l2.7 1.3c.4.2.6.5.5.9-.2 1.6-1.6 2.8-3.2 2.8-4.9-.4-9.6-5.1-10-10 0-1.6 1.2-3 2.7-3.1Z" fill="#fff" /></svg>
          (31) 98120-3121
        </div>
        <div style={{fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,.88)", ...up(c2)}}>@diegomudancasbh</div>
      </div>
    </AbsoluteFill>
  );
}

export const Imersivo = () => {
  const frame = useCurrentFrame(), {fps, width, height} = useVideoConfig(), t = frame / fps;
  const tex = useTextures([
    ["atendimento", f("atendimento.webp")], ["embalagem", f("embalagem-completa.webp")], ["mudanca", f("mudanca-residencial-comercial.webp")],
    ["transporte", f("transporte.webp")], ["chegada", f("chegada.webp")], ["guarda", f("guarda.webp")], ["leao", staticFile("diego/leao.png")],
  ]);
  // tela cheia do caminhão (mergulho) e passagem de luz para a marca
  const full = ss(seg(t, 17.25, 17.6)) * (1 - ss(seg(t, 19.82, 20.18)));
  const flash = Math.max(0, 1 - Math.abs(t - 29.6) / 0.28) * 0.95;
  const intro = 1 - eo(seg(t, 0, 0.8));
  return (
    <AbsoluteFill style={{background: NAVY}}>
      {tex && t < 29.9 && (
        <ThreeCanvas width={width} height={height} gl={{antialias: true, preserveDrawingBuffer: true}}>
          <Scene tex={tex} />
        </ThreeCanvas>
      )}
      <Sequence from={Math.round(15.0 * fps)} durationInFrames={Math.round(5.0 * fps)}>
        <AbsoluteFill style={{opacity: full}}>
          <OffthreadVideo src={f("caminhao.mp4")} muted style={{width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + 0.05 * seg(t, 17.6, 20)})`}} />
        </AbsoluteFill>
      </Sequence>
      {/* leitura: degradê na base e vinheta suave */}
      <AbsoluteFill style={{background: "linear-gradient(0deg, rgba(4,11,38,.82) 0%, rgba(4,11,38,.35) 24%, rgba(4,11,38,0) 40%)", pointerEvents: "none"}} />
      <AbsoluteFill style={{background: "radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,6,20,.55) 100%)"}} />
      <Caption t={t} t0={0.9} t1={3.0} a="Toda mudança" b="é um recomeço." />
      <Caption t={t} t0={3.4} t1={5.9} a="Você conta" b="o que precisa." />
      <Caption t={t} t0={6.0} t1={8.3} a="A gente embala" b="item por item." />
      <Caption t={t} t0={8.7} t1={12.0} a="Uma capa para" b="cada móvel." />
      <Caption t={t} t0={13.0} t1={15.6} a="Frota própria," b="pronta para a sua mudança." small />
      <Caption t={t} t0={17.8} t1={19.8} a="BH, outras cidades" b="e outros estados." />
      <Caption t={t} t0={20.4} t1={22.6} a="Na chegada," b="tudo no lugar." />
      <Caption t={t} t0={23.0} t1={26.8} a="“Do jeito que veio," b="chegou.” — Seu Daniel" />
      <EndCard t={t} />
      <AbsoluteFill style={{background: "#E9F8FF", opacity: flash, mixBlendMode: "screen"}} />
      <AbsoluteFill style={{background: "#000", opacity: intro}} />
      <Audio src={f("musica.wav")} volume={1} />
      <Audio src={f("sfx.wav")} volume={1} />
    </AbsoluteFill>
  );
};

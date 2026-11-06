// Demonstração "Proteger minha geladeira / sofá / cama": dois funcionários da Diego
// colocam juntos a capa azul acolchoada. Cena 3D renderizada com Remotion + three.js.
import React, {useMemo, useState, useEffect} from "react";
import * as THREE from "three";
import {ThreeCanvas} from "@remotion/three";
import {useThree} from "@react-three/fiber";
import {useCurrentFrame, useVideoConfig, delayRender, continueRender, staticFile} from "remotion";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {V, UP, cl, lerp, seg, ss, eio, eo, ei, kf} from "./kit";
import {Worker, walk} from "./human";
import {Cover} from "./cover";
import {PLANS} from "./plans";

/* ---------------- imagens ---------------- */
export function useImg(src) {
  const [img, setImg] = useState(null);
  const [h] = useState(() => delayRender("img " + src));
  useEffect(() => { const i = new Image(); i.onload = () => { setImg(i); continueRender(h); }; i.onerror = () => continueRender(h); i.src = src; }, []);
  return img;
}

/* ---------------- ambiente ---------------- */
function woodTex() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 1024; const x = c.getContext("2d");
  const pw = 1024 / 7;
  for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) {
    const off = (i % 2) * 170 + j * 341, h = 341;
    const base = [196, 160, 118].map((v, k) => v + Math.round((Math.sin(i * 12.9 + j * 4.1 + k) * 0.5 + 0.5) * 14 - 7));
    x.fillStyle = `rgb(${base})`; x.fillRect(i * pw, (off % 1024), pw, h); x.fillRect(i * pw, (off % 1024) - 1024, pw, h);
    for (let g = 0; g < 26; g++) { x.strokeStyle = `rgba(110,72,40,${0.04 + (g % 5) * 0.012})`; x.lineWidth = 1 + (g % 3); x.beginPath(); const gx = i * pw + 6 + (g * 37 % (pw - 12)); x.moveTo(gx, 0); x.bezierCurveTo(gx + 6, 300, gx - 6, 700, gx + 3, 1024); x.stroke(); }
    x.fillStyle = "rgba(70,45,25,.35)"; x.fillRect(i * pw, (off % 1024), pw, 2);
  }
  for (let i = 0; i <= 7; i++) { x.fillStyle = "rgba(70,45,25,.4)"; x.fillRect(i * pw - 1, 0, 2, 1024); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function Room({backZ = -1.25}) {
  const wood = useMemo(woodTex, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[10, 10]} /><meshStandardMaterial map={wood} roughness={0.55} /></mesh>
      <mesh position={[0, 1.6, backZ]} receiveShadow><planeGeometry args={[10, 3.2]} /><meshStandardMaterial color="#E9E7E2" roughness={0.95} /></mesh>
      <mesh position={[-2.4, 1.6, backZ + 2]} rotation-y={Math.PI / 2} receiveShadow><planeGeometry args={[6, 3.2]} /><meshStandardMaterial color="#E4E2DC" roughness={0.95} /></mesh>
      <mesh position={[0, 0.05, backZ + 0.01]}><boxGeometry args={[10, 0.1, 0.02]} /><meshStandardMaterial color="#F7F7F5" roughness={0.6} /></mesh>
      <mesh position={[-2.39, 0.05, backZ + 2]} rotation-y={Math.PI / 2}><boxGeometry args={[6, 0.1, 0.02]} /><meshStandardMaterial color="#F7F7F5" roughness={0.6} /></mesh>
      {/* janela na parede lateral (luz do dia) */}
      <mesh position={[-2.38, 1.55, backZ + 1.6]} rotation-y={Math.PI / 2}><planeGeometry args={[1.3, 1.3]} /><meshBasicMaterial color="#FBFCFF" /></mesh>
      {/* vaso com planta */}
      <group position={[1.75, 0, backZ + 0.35]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow><cylinderGeometry args={[0.17, 0.13, 0.4, 28]} /><meshStandardMaterial color="#F2F1EE" roughness={0.5} /></mesh>
        {Array.from({length: 9}, (_, i) => {
          const a = i * 2.4, r = 0.08 + (i % 3) * 0.03;
          return <mesh key={i} castShadow position={[Math.cos(a) * r, 0.62 + (i % 4) * 0.1, Math.sin(a) * r]} rotation={[Math.sin(a) * 0.5, a, Math.cos(a) * 0.5]} scale={[0.07, 0.26, 0.025]}><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={i % 2 ? "#3E6B3A" : "#4E7F45"} roughness={0.7} /></mesh>;
        })}
      </group>
    </group>
  );
}

/* ---------------- peças ---------------- */
const rbox = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 4, r);
function buildFridge(zc) {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({color: "#F4F5F7", roughness: 0.32, metalness: 0.08});
  const body = new THREE.Mesh(rbox(0.7, 1.77, 0.68, 0.03), white); body.position.set(0, 0.03 + 0.885, zc); g.add(body);
  const gap = new THREE.Mesh(new THREE.BoxGeometry(0.69, 0.006, 0.01), new THREE.MeshStandardMaterial({color: "#9AA2AD"})); gap.position.set(0, 1.27, zc + 0.341); g.add(gap);
  const hm = new THREE.MeshStandardMaterial({color: "#B9C0C9", roughness: 0.25, metalness: 0.6});
  const h1 = new THREE.Mesh(rbox(0.03, 0.26, 0.035, 0.012), hm); h1.position.set(0.28, 1.5, zc + 0.36); g.add(h1);
  const h2 = new THREE.Mesh(rbox(0.03, 0.5, 0.035, 0.012), hm); h2.position.set(0.28, 0.93, zc + 0.36); g.add(h2);
  const kick = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.02), new THREE.MeshStandardMaterial({color: "#4B515A"})); kick.position.set(0, 0.06, zc + 0.33); g.add(kick);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
function buildSofa() {
  const g = new THREE.Group();
  const fab = new THREE.MeshStandardMaterial({color: "#B5AB9E", roughness: 0.92}), fabD = new THREE.MeshStandardMaterial({color: "#A59B8E", roughness: 0.92});
  const wood = new THREE.MeshStandardMaterial({color: "#4A372A", roughness: 0.6});
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  add(rbox(2.1, 0.28, 0.88, 0.04), fabD, 0, 0.26, -0.51);
  for (const x of [-0.55, 0, 0.55]) add(rbox(0.54, 0.11, 0.62, 0.045), fab, x, 0.455, -0.38);
  for (const x of [-0.95, 0.95]) add(rbox(0.22, 0.52, 0.88, 0.07), fab, x, 0.38, -0.51);
  add(rbox(1.66, 0.48, 0.2, 0.08), fab, 0, 0.64, -0.85);
  for (const [x, z] of [[-1.0, -0.12], [1.0, -0.12], [-1.0, -0.9], [1.0, -0.9]]) add(new THREE.CylinderGeometry(0.022, 0.016, 0.12, 12), wood, x, 0.06, z);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
function mattressTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#F3F3F1"; x.fillRect(0, 0, 512, 512); x.strokeStyle = "rgba(160,165,175,.55)"; x.lineWidth = 2;
  for (let i = -512; i < 1024; i += 46) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 512, 512); x.stroke(); x.beginPath(); x.moveTo(i + 512, 0); x.lineTo(i, 512); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 4); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function buildBed() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.38, 0.36, 1.88, 0.02), new THREE.MeshStandardMaterial({color: "#4E5560", roughness: 0.9})); base.position.set(0, 0.22, -1.06); g.add(base);
  const mt = new THREE.Mesh(rbox(1.38, 0.23, 1.88, 0.06), new THREE.MeshStandardMaterial({map: mattressTex(), roughness: 0.85})); mt.position.set(0, 0.515, -1.06); g.add(mt);
  for (const [x, z] of [[-0.62, -0.2], [0.62, -0.2], [-0.62, -1.92], [0.62, -1.92]]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 12), new THREE.MeshStandardMaterial({color: "#222"})); f.position.set(x, 0.02, z); g.add(f); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

const ZF = -0.55; // centro da geladeira em z (mesmo valor de plans.js)
export const PIECES = {
  geladeira: {
    T: 13.4, x0: -0.35, x1: 0.35, z0: ZF - 0.34, z1: ZF + 0.38, tent: 0.03,
    H: () => 1.8, build: () => buildFridge(ZF), backZ: -1.25,
    logo: {where: "skirt", s: 0.5, w: 0.44},
  },
  sofa: {
    T: 15, x0: -1.05, x1: 1.05, z0: -0.95, z1: -0.07, tent: 0.14,
    H: (x, z) => { if (Math.abs(x) > 0.81) return 0.645; if (z < -0.72) return 0.885 - Math.max(0, (Math.abs(x) - 0.74)) * 0.6; return 0.515; },
    build: buildSofa, backZ: -1.3,
    logo: {where: "top", u: 1.072, v: 0.44, w: 0.44},
  },
  cama: {
    T: 14.4, x0: -0.69, x1: 0.69, z0: -2.0, z1: -0.12, tent: 0.04,
    H: (x, z) => { const ex = Math.min(x + 0.69, 0.69 - x), ez = Math.min(z + 2.0, -0.12 - z); const e = Math.min(ex, ez); return 0.63 - Math.max(0, 0.05 - e) * 0.5; },
    build: buildBed, backZ: -2.35,
    logo: {where: "skirt", s: 0.3, w: 0.36},
  },
};

/* ---------------- postura automática (alcance dos braços) ---------------- */
function shoulders(root, F, ph, h) {
  const R = new THREE.Vector3().crossVectors(F, UP).normalize();
  const P = root.clone().setY(ph);
  const T = UP.clone().multiplyScalar(Math.cos(h)).addScaledVector(F, Math.sin(h));
  return [P.clone().addScaledVector(T, 0.455).addScaledVector(R, -0.195), P.clone().addScaledVector(T, 0.455).addScaledVector(R, 0.195)];
}
function posture(root, F, hands, base = 0.99) {
  const pose = (k) => [ (52 * Math.PI / 180) * Math.pow(k, 0.9), base - 0.46 * Math.pow(k, 1.15) ];
  const ok = (k) => {
    const [h, ph] = pose(k); const [sL, sR] = shoulders(root, F, ph, h);
    const dL = hands.L ? sL.distanceTo(hands.L) : 0, dR = hands.R ? sR.distanceTo(hands.R) : 0;
    return Math.max(dL, dR) <= 0.585;
  };
  if (ok(0)) return pose(0);
  // menor esforço que alcança; se nada alcança, a postura que mais aproxima
  const dist = (k) => { const [h, ph] = pose(k); const [sL, sR] = shoulders(root, F, ph, h); return Math.max(hands.L ? sL.distanceTo(hands.L) : 0, hands.R ? sR.distanceTo(hands.R) : 0); };
  if (!ok(1)) { const hy = Math.min(hands.L ? hands.L.y : 9, hands.R ? hands.R.y : 9); if (hy > 1.2) return pose(0); let bk = 0, bd = 1e9; for (let k = 0; k <= 1.0001; k += 0.05) { const d = dist(k) + k * 0.25; if (d < bd) { bd = d; bk = k; } } return pose(bk); }
  let lo = 0, hi = 1;
  for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (ok(m)) hi = m; else lo = m; }
  return pose(hi);
}



/* ---------------- cena ---------------- */
function Scene({item, logo, chestLogo}) {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const pc = PIECES[item];
  const objs = useMemo(() => {
    const ct = new THREE.Texture(chestLogo); ct.needsUpdate = true; ct.colorSpace = THREE.SRGBColorSpace;
    return {
      piece: pc.build(),
      cover: new Cover(pc, logo),
      A: new Worker({skin: "#7B4E33", hair: "#15100C", logoTex: ct}),
      B: new Worker({skin: "#5E3B27", hair: "#120D0A", logoTex: ct}),
    };
  }, [item]);
  const plan = PLANS[item](t, objs.cover);
  const pose = (w, hands, look) => {
    const F = w.F.clone().setY(0).normalize();
    const [hinge, ph] = posture(w.root, F, hands);
    const feet = w.walking || (w.lift && (w.lift.L || w.lift.R)) ? w.feet : w.feet;
    return {root: w.root, F, ph: ph + (w.bob || 0), hinge, feet, footF: {L: F, R: F}, lift: w.lift, hands, look, swing: hands.L || hands.R ? null : w.swing};
  };
  objs.A.update(pose(plan.A, plan.handsA, plan.look));
  objs.B.update(pose(plan.B, plan.handsB, plan.look));
  return (
    <>
      <PerspCam {...plan.cam} />
      <hemisphereLight args={["#F6F8FC", "#B59A7A", 0.75]} />
      <directionalLight position={[-2.6, 4.6, 3.2]} intensity={2.3} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-3.2} shadow-camera-right={3.2} shadow-camera-top={3.2} shadow-camera-bottom={-3.2} shadow-camera-near={0.5} shadow-camera-far={14} shadow-radius={6} />
      <directionalLight position={[3.5, 2.4, 2.5]} intensity={0.55} />
      <directionalLight position={[0, 3, -3]} intensity={0.35} />
      <Room backZ={pc.backZ} />
      <primitive object={objs.piece} />
      <primitive object={objs.cover.group} />
      <primitive object={objs.A.group} />
      <primitive object={objs.B.group} />
    </>
  );
}

function PerspCam({pos, target, fov}) {
  const {camera, size} = useThree();
  camera.position.copy(pos); camera.fov = fov; camera.aspect = size.width / size.height; camera.near = 0.05; camera.far = 60;
  camera.updateProjectionMatrix(); camera.lookAt(target);
  return null;
}

export const Protect3D = ({item = "geladeira"}) => {
  const {width, height} = useVideoConfig();
  const logo = useImg(staticFile("craft/letreiro.png"));
  if (!logo) return null;
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}} style={{background: "#E9E7E2"}}>
      <Scene item={item} logo={logo} chestLogo={logo} />
    </ThreeCanvas>
  );
};


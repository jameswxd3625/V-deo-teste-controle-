import React, {useMemo, useEffect} from "react";
import {ThreeCanvas} from "@remotion/three";
import {useThree} from "@react-three/fiber";
import * as THREE from "three";
import {RoomEnvironment} from "three/examples/jsm/environments/RoomEnvironment.js";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";
import fontJson from "three/examples/fonts/helvetiker_bold.typeface.json";
import {useCurrentFrame} from "remotion";
import {FPS, W, H} from "./lib";

// perfil torneado da moeda: face rebaixada, aro saliente e borda arredondada
const coinGeo = (() => {
  const p = [];
  const add = (x, y) => p.push(new THREE.Vector2(x, y));
  add(0.0001, 0.07); add(0.80, 0.07); add(0.83, 0.085); add(0.86, 0.115); add(0.95, 0.115);
  add(0.985, 0.10); add(1.0, 0.07); add(1.0, -0.07); add(0.985, -0.10); add(0.95, -0.115);
  add(0.86, -0.115); add(0.83, -0.085); add(0.80, -0.07); add(0.0001, -0.07);
  const g = new THREE.LatheGeometry(p, 96);
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
})();
const font = new FontLoader().parse(fontJson);
const glyph = (ch) => {
  const g = new TextGeometry(ch, {font, size: 0.95, depth: 0.06, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.022, bevelSegments: 3});
  g.computeBoundingBox();
  const b = g.boundingBox;
  g.translate(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, 0);
  const s = ch === "%" ? 0.92 : 1.05;
  g.scale(s, s, 1);
  return g;
};
const GLY = {$: glyph("$"), "%": glyph("%")};

const Env = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
    pm.dispose();
  }, [gl, scene]);
  return null;
};

const gold = new THREE.MeshStandardMaterial({color: new THREE.Color("#ffbe3b"), metalness: 1, roughness: 0.26, envMapIntensity: 1.25});
const goldFace = new THREE.MeshStandardMaterial({color: new THREE.Color("#f6ad2a"), metalness: 1, roughness: 0.38, envMapIntensity: 1.1});

const Coin = ({c, t}) => {
  // c: {sym, p:[[t,x,y,z],...], s, rx, ry, spin, phase}
  const k = c.p;
  let x = k[0][1], y = k[0][2], z = k[0][3];
  for (let i = 0; i < k.length - 1; i++) {
    if (t >= k[i][0] && t <= k[i + 1][0]) {
      const u = (t - k[i][0]) / (k[i + 1][0] - k[i][0]);
      const e = c.ease ? c.ease(u) : u * u * (3 - 2 * u);
      x = k[i][1] + (k[i + 1][1] - k[i][1]) * e;
      y = k[i][2] + (k[i + 1][2] - k[i][2]) * e;
      z = k[i][3] + (k[i + 1][3] - k[i][3]) * e;
    } else if (t > k[k.length - 1][0]) {
      [, x, y, z] = k[k.length - 1];
    }
  }
  const bob = Math.sin(t * 1.3 + c.phase) * 0.08;
  return (
    <group position={[x, y + bob, z]} rotation={[c.rx + Math.sin(t * 0.7 + c.phase) * 0.25, c.ry + t * c.spin, Math.sin(t * 0.5 + c.phase) * 0.15]} scale={c.s}>
      <mesh geometry={coinGeo} material={gold} />
      <mesh geometry={GLY[c.sym]} material={goldFace} position={[0, 0, 0.045]} />
      <mesh geometry={GLY[c.sym]} material={goldFace} position={[0, 0, -0.045]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

// camada de moedas (unidades: câmera em z=20, fov 30 -> altura visível ≈ 10.7 un.)
export const Coins3D = ({coins, blur = 0, opacity = 1}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <div style={{position: "absolute", inset: 0, filter: blur ? `blur(${blur}px)` : undefined, opacity}}>
      <ThreeCanvas width={W} height={H} camera={{fov: 30, position: [0, 0, 20], near: 0.1, far: 100}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
        <Env />
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 8]} intensity={2.2} color="#fff3dc" />
        <directionalLight position={[-6, -2, -4]} intensity={2.4} color="#3d7bff" />
        <pointLight position={[0, -6, 6]} intensity={30} color="#2a66ff" distance={30} />
        {coins.map((c, i) => <Coin key={i} c={c} t={t} />)}
      </ThreeCanvas>
    </div>
  );
};

// Utilidades para as cenas 3D (tudo é função pura do tempo, como o Remotion exige).
import * as THREE from "three";

export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => cl((t - a) / (b - a));
export const ss = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
export const eio = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eo = (x) => 1 - Math.pow(1 - cl(x), 3);
export const ei = (x) => Math.pow(cl(x), 2.2);
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const UP = new THREE.Vector3(0, 1, 0);

// interpolação por quadros-chave: keys = [[t, valor], ...]; valor número ou Vector3
export function kf(t, keys, ease = eio) {
  if (t <= keys[0][0]) return clone(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1], [t1, b] = keys[i];
      const u = ease((t - t0) / (t1 - t0));
      return mix(a, b, u);
    }
  }
  return clone(keys[keys.length - 1][1]);
}
const clone = (v) => (v && v.isVector3 ? v.clone() : v);
export const mix = (a, b, u) => (a && a.isVector3 ? a.clone().lerp(b, u) : a + (b - a) * u);

// IK de dois ossos (braço/perna) com vetor de polo
export function ik2(root, target, l1, l2, pole) {
  const d0 = target.clone().sub(root);
  let d = d0.length();
  const dir = d0.clone().normalize();
  d = cl(d, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const end = root.clone().addScaledVector(dir, d);
  const a = (l1 * l1 + d * d - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const pv = pole.clone().sub(root);
  pv.addScaledVector(dir, -pv.dot(dir));
  if (pv.lengthSq() < 1e-8) pv.set(0, -1, 0);
  pv.normalize();
  const mid = root.clone().addScaledVector(dir, a).addScaledVector(pv, h);
  return {mid, end, reached: d0.length() <= l1 + l2};
}

// posiciona um cilindro de altura 1 entre a e b
const _q = new THREE.Quaternion();
export function between(mesh, a, b, r = null) {
  const d = b.clone().sub(a);
  const len = d.length();
  mesh.position.copy(a).addScaledVector(d, 0.5);
  _q.setFromUnitVectors(UP, d.normalize());
  mesh.quaternion.copy(_q);
  mesh.scale.set(r || 1, len, r || 1);
}

// base ortonormal: y = up, z = frente
export function basisQuat(up, fwd) {
  const y = up.clone().normalize();
  const z = fwd.clone().addScaledVector(y, -fwd.dot(y)).normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

// ruído determinístico
export const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// Coreografias da colocação da capa. Tudo em segundos; as mãos seguem pontos reais da capa
// (pega na barra, borda ou superfície) e a postura do corpo é resolvida pelo alcance dos braços.
import * as THREE from "three";
import {V, UP, cl, lerp, seg, ss, eio, ei, kf} from "./kit";
import {walk} from "./human";

export const faceTo = (from, to) => to.clone().sub(from).setY(0).normalize();
const Rof = (F) => new THREE.Vector3().crossVectors(F, UP).normalize();

const Rof0 = (F) => new THREE.Vector3().crossVectors(F, UP).normalize();
export function walker(t, t0, t1, a, b, Fend) {
  const u = eio(seg(t, t0, t1)), st = seg(t, t1, t1 + 0.35);
  const w = walk(a, b, u, eio(st));
  let F = w.dir.clone();
  if (Fend) F = F.lerp(Fend, ss(seg(t, t1 - 0.2, t1 + 0.45))).normalize();
  // pés lado a lado em relação ao corpo (evita pernas cruzadas ao girar ou andar de lado)
  const Rd = Rof(w.dir), Rf = Rof(F), wd = 0.11;
  const feet = {L: w.feet.L.clone().addScaledVector(Rd, wd).addScaledVector(Rf, -wd), R: w.feet.R.clone().addScaledVector(Rd, -wd).addScaledVector(Rf, wd)};
  return {...w, feet, F, walking: u > 0 && u < 1};
}
// encadeia trechos de caminhada: [[t0,t1,a,b,Fend], ...]
function route(t, legs) {
  let cur = null;
  for (const [t0, t1, a, b, Fe] of legs) if (!cur || t >= t0) cur = walker(t, t0, t1, a, b, Fe);
  return cur;
}
// mão de descanso (braços soltos, um pouco à frente)
const rest = (w) => { const R = Rof(w.F); return {L: w.root.clone().addScaledVector(R, -0.23).addScaledVector(w.F, 0.06).setY(0.86), R: w.root.clone().addScaledVector(R, 0.23).addScaledVector(w.F, 0.06).setY(0.86)}; };
// sequência de alvos das mãos com transições suaves; f(t) devolve {L,R} ou "free" (braços soltos)
function seq(t, w, list) {
  let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k][0]) i = k;
  const val = (k) => { const v = list[k][1](t); return v === "free" ? rest(w) : v; };
  let v = val(i);
  const b = list[i][2] || 0.3;
  if (i > 0 && t < list[i][0] + b) { const p = val(i - 1), u = ss((t - list[i][0]) / b); v = {L: p.L.clone().lerp(v.L, u), R: p.R.clone().lerp(v.R, u)}; }
  const free = list[i][1](t) === "free" && t >= list[i][0] + b;
  return free ? {L: null, R: null} : v;
}
const carryHands = (bundle, w, k = 0.2) => { const R = Rof(w.F); return {L: bundle.clone().addScaledVector(R, -k), R: bundle.clone().addScaledVector(R, k)}; };
const carryPos = (w) => w.root.clone().addScaledVector(w.F, 0.34).setY(1.04 + (w.bob || 0));

/* ---------------- geladeira ---------------- */
export const ZF = -0.55;
export function planFridge(t, cover) {
  const zf = ZF + 0.38 + 0.022;
  const cL = V(-0.372, 0, zf), cR = V(0.372, 0, zf);
  const posA = V(-0.76, 0, 0.18), posB = V(0.76, 0, 0.18);
  const A = route(t, [[0.4, 2.3, V(-2.9, 0, 0.6), posA, faceTo(posA, cL)], [10.25, 11.15, posA, V(-0.98, 0, 0.22), V(0.35, 0, 1).normalize()]]);
  const B = route(t, [[0.5, 2.4, V(2.9, 0, 0.6), posB, faceTo(posB, cR)], [10.3, 11.2, posB, V(0.98, 0, 0.22), V(-0.35, 0, 1).normalize()]]);

  const onTop = V(-0.06, 1.88, ZF + 0.1);
  const lift = ss(seg(t, 2.6, 3.5));
  const bundle = carryPos(A).lerp(onTop, lift); bundle.y += Math.sin(Math.PI * lift) * 0.14;
  const open = eio(seg(t, 3.75, 5.0));
  const pull = lerp(0.04, 0.86, eio(seg(t, 5.2, 8.3)));
  const drop = ei(seg(t, 8.5, 8.78)) * 0.3 - Math.sin(Math.PI * seg(t, 8.78, 9.02)) * 0.01;
  const folds = lerp(1, 0.35, eio(seg(t, 9.0, 9.95)));
  const tA = Math.sin(Math.PI * seg(t, 9.15, 9.75)), tB = Math.sin(Math.PI * seg(t, 9.25, 9.85));
  const tugs = [{c: V(-0.39, 0.12, zf), d: V(-0.014, 0, 0.012).multiplyScalar(tA), r: 0.12}, {c: V(0.39, 0.12, zf), d: V(0.014, 0, 0.012).multiplyScalar(tB), r: 0.12}];
  cover.update({open, bundle, pull, drop, folds, tugs, tuck: 0});

  const gripA = () => ({L: cover.grip(-0.37, zf - 0.26), R: cover.grip(-0.33, zf)});
  const gripB = () => ({L: cover.grip(0.33, zf), R: cover.grip(0.37, zf - 0.26)});
  const relA = {L: V(-0.5, 0.42, zf - 0.28), R: V(-0.46, 0.42, zf + 0.08)}, relB = {L: V(0.46, 0.42, zf + 0.08), R: V(0.5, 0.42, zf - 0.28)};
  const adjA = (tt) => ({R: V(-0.39, 0.2, zf + 0.025).add(V(-0.014, 0, 0.012).multiplyScalar(tA)), L: V(-0.41, 0.22, zf - 0.2)});
  const adjB = (tt) => ({L: V(0.39, 0.2, zf + 0.025).add(V(0.014, 0, 0.012).multiplyScalar(tB)), R: V(0.41, 0.22, zf - 0.2)});
  const handsA = seq(t, A, [
    [0, () => carryHands(bundle, A, 0.2 - 0.06 * lift)],
    [3.45, gripA, 0.3],
    [8.35, () => relA, 0.3],
    [8.9, adjA, 0.3],
    [9.95, () => "free", 0.45],
  ]);
  const handsB = seq(t, B, [
    [0, () => "free"],
    [2.75, () => ({L: V(0.3, 1.76, zf + 0.06), R: V(0.38, 1.78, zf - 0.22)}), 0.55],
    [3.5, gripB, 0.3],
    [8.4, () => relB, 0.3],
    [8.95, adjB, 0.3],
    [10.0, () => "free", 0.45],
  ]);
  const cam = {
    pos: kf(t, [[0, V(0.9, 2.05, 4.6)], [10.0, V(0.75, 1.95, 4.45)], [11.8, V(0.2, 1.55, 5.2)], [13.4, V(0.15, 1.5, 5.0)]]),
    target: kf(t, [[0, V(0, 0.92, -0.3)], [10.0, V(0, 0.88, -0.3)], [11.8, V(0, 0.95, -0.35)], [13.4, V(0, 0.95, -0.35)]]),
    fov: 31,
  };
  return {A, B, handsA, handsB, cam, look: V(0, 1.0, ZF)};
}

/* ---------------- sofá ---------------- */
export function planSofa(t, cover) {
  const zf = -0.07 + 0.022;
  const posA = V(-1.25, 0, 0.32), posB = V(1.25, 0, 0.32);
  const sideA = V(-1.45, 0, -0.66), sideB = V(1.45, 0, -0.66);
  const A = route(t, [[0.4, 2.3, V(-3.3, 0, 0.75), posA, faceTo(posA, V(-0.7, 0, -0.35))], [9.35, 10.35, posA, sideA, V(1, 0, -0.1).normalize()], [12.45, 13.35, sideA, V(-1.32, 0, 0.5), V(0.35, 0, 1).normalize()]]);
  const B = route(t, [[0.5, 2.4, V(3.3, 0, 0.75), posB, faceTo(posB, V(0.7, 0, -0.35))], [9.4, 10.4, posB, sideB, V(-1, 0, -0.1).normalize()], [12.5, 13.4, sideB, V(1.32, 0, 0.5), V(-0.35, 0, 1).normalize()]]);

  const onSeat = V(-0.62, 0.62, -0.3);
  const lift = ss(seg(t, 2.6, 3.5));
  const bundle = carryPos(A).lerp(onSeat, lift); bundle.y += Math.sin(Math.PI * lift) * 0.1;
  const open = eio(seg(t, 3.75, 5.15));
  const pull = lerp(0.05, 0.88, eio(seg(t, 5.3, 7.4)));
  const drop = ei(seg(t, 7.55, 7.8)) * 0.25;
  const tuckArm = eio(seg(t, 8.0, 9.1)), tuckBack = eio(seg(t, 10.7, 12.2));
  const tuck = (x, z) => (z < -0.72 ? tuckBack : Math.abs(x) > 0.7 ? tuckArm : Math.max(tuckArm * 0.6, tuckBack * 0.9));
  const folds = lerp(1, 0.4, eio(seg(t, 7.8, 9.0)));
  cover.update({open, bundle, pull, drop, folds, tuck});

  const gA = () => ({L: cover.grip(-1.07, zf - 0.32), R: cover.grip(-0.88, zf)}), gB = () => ({L: cover.grip(0.88, zf), R: cover.grip(1.07, zf - 0.32)});
  const relA = {L: V(-1.16, 0.4, zf - 0.3), R: V(-0.9, 0.4, zf + 0.1)}, relB = {L: V(0.9, 0.4, zf + 0.1), R: V(1.16, 0.4, zf - 0.3)};
  // acomodar os braços do sofá: as mãos correm sobre o braço empurrando o tecido para dentro
  const armA = (tt) => { const u = seg(tt, 8.0, 9.1), z = lerp(-0.18, -0.62, eio(u)); return {L: V(-0.99, 0.69, z - 0.1), R: V(-0.82, 0.6 - 0.03 * Math.sin(Math.PI * u), z + 0.05)}; };
  const armB = (tt) => { const u = seg(tt, 8.0, 9.1), z = lerp(-0.18, -0.62, eio(u)); return {R: V(0.99, 0.69, z - 0.1), L: V(0.82, 0.6 - 0.03 * Math.sin(Math.PI * u), z + 0.05)}; };
  // acomodar o encosto
  const backA = (tt) => { const u = seg(tt, 10.7, 12.2), x = lerp(0.88, 0.32, eio(u)); return {L: V(-x, 0.93, -0.93), R: V(-x + 0.1, 0.84 - 0.025 * Math.sin(Math.PI * u * 2), -0.73)}; };
  const backB = (tt) => { const u = seg(tt, 10.7, 12.2), x = lerp(0.88, 0.32, eio(u)); return {R: V(x, 0.93, -0.93), L: V(x - 0.1, 0.84 - 0.025 * Math.sin(Math.PI * u * 2), -0.73)}; };
  const handsA = seq(t, A, [[0, () => carryHands(bundle, A, 0.2)], [3.45, gA, 0.3], [7.45, () => relA, 0.3], [7.85, armA, 0.35], [9.2, () => "free", 0.35], [10.5, backA, 0.4], [12.3, () => "free", 0.4]]);
  const handsB = seq(t, B, [[0, () => "free"], [3.0, () => ({L: V(0.7, 0.85, zf + 0.12), R: V(1.0, 0.85, zf - 0.2)}), 0.5], [3.6, gB, 0.3], [7.5, () => relB, 0.3], [7.85, armB, 0.35], [9.25, () => "free", 0.35], [10.55, backB, 0.4], [12.35, () => "free", 0.4]]);
  const cam = {
    pos: kf(t, [[0, V(1.1, 2.35, 5.3)], [12.3, V(0.9, 2.25, 5.2)], [13.9, V(0.15, 1.8, 6.1)], [15, V(0.1, 1.78, 5.95)]]),
    target: kf(t, [[0, V(0, 0.55, -0.4)], [12.3, V(0, 0.55, -0.45)], [13.9, V(0, 0.62, -0.5)], [15, V(0, 0.62, -0.5)]]),
    fov: 32,
  };
  return {A, B, handsA, handsB, cam, look: V(0, 0.6, -0.5)};
}

/* ---------------- cama box ---------------- */
export function planBed(t, cover) {
  const zf = -0.12 + 0.022;
  const posA = V(-1.0, 0, 0.3), posB = V(1.0, 0, 0.3);
  const midA = V(-1.14, 0, -0.95), midB = V(1.14, 0, -0.95);
  const A = route(t, [[0.4, 2.3, V(-3.1, 0, 0.8), posA, faceTo(posA, V(-0.45, 0, -0.45))], [9.25, 10.4, posA, midA, V(1, 0, 0)], [12.05, 13.1, midA, V(-1.05, 0, 0.55), V(0.35, 0, 1).normalize()]]);
  const B = route(t, [[0.5, 2.4, V(3.1, 0, 0.8), posB, faceTo(posB, V(0.45, 0, -0.45))], [9.3, 10.45, posB, midB, V(-1, 0, 0)], [12.1, 13.15, midB, V(1.05, 0, 0.55), V(-0.35, 0, 1).normalize()]]);

  const onBed = V(-0.3, 0.72, -0.42);
  const lift = ss(seg(t, 2.6, 3.5));
  const bundle = carryPos(A).lerp(onBed, lift); bundle.y += Math.sin(Math.PI * lift) * 0.1;
  const open = eio(seg(t, 3.75, 5.25));
  const pull = lerp(0.06, 0.82, eio(seg(t, 5.4, 7.6)));
  const drop = ei(seg(t, 7.72, 7.98)) * 0.2;
  const tk = eio(seg(t, 10.6, 11.95));
  const folds = lerp(1, 0.4, eio(seg(t, 8.0, 9.0)));
  const tA = Math.sin(Math.PI * seg(t, 8.15, 8.9)), tB = Math.sin(Math.PI * seg(t, 8.25, 9.0));
  const tugs = [{c: V(-0.72, 0.15, zf), d: V(-0.014, 0, 0.013).multiplyScalar(tA), r: 0.14}, {c: V(0.72, 0.15, zf), d: V(0.014, 0, 0.013).multiplyScalar(tB), r: 0.14}];
  cover.update({open, bundle, pull, drop, folds, tugs, tuck: tk});

  const gA = () => ({L: cover.grip(-0.72, zf - 0.36), R: cover.grip(-0.5, zf)}), gB = () => ({L: cover.grip(0.5, zf), R: cover.grip(0.72, zf - 0.36)});
  const relA = {L: V(-0.8, 0.36, zf - 0.36), R: V(-0.55, 0.36, zf + 0.1)}, relB = {L: V(0.55, 0.36, zf + 0.1), R: V(0.8, 0.36, zf - 0.36)};
  const adjA = () => ({R: V(-0.735, 0.22, zf + 0.025).add(V(-0.014, 0, 0.013).multiplyScalar(tA)), L: V(-0.75, 0.28, zf - 0.22)});
  const adjB = () => ({L: V(0.735, 0.22, zf + 0.025).add(V(0.014, 0, 0.013).multiplyScalar(tB)), R: V(0.75, 0.28, zf - 0.22)});
  // acompanhar o volume do colchão: as mãos alisam a borda de cima
  const smA = (tt) => { const u = seg(tt, 10.6, 11.95), z = lerp(-0.62, -1.32, eio(u)); return {L: V(-0.64, 0.665, z - 0.16), R: V(-0.64, 0.665, z + 0.16)}; };
  const smB = (tt) => { const u = seg(tt, 10.6, 11.95), z = lerp(-0.62, -1.32, eio(u)); return {R: V(0.64, 0.665, z - 0.16), L: V(0.64, 0.665, z + 0.16)}; };
  const handsA = seq(t, A, [[0, () => carryHands(bundle, A, 0.2)], [3.45, gA, 0.3], [7.65, () => relA, 0.3], [7.95, adjA, 0.3], [9.05, () => "free", 0.35], [10.45, smA, 0.4], [12.0, () => "free", 0.4]]);
  const handsB = seq(t, B, [[0, () => "free"], [3.0, () => ({L: V(0.45, 0.85, zf + 0.12), R: V(0.75, 0.85, zf - 0.3)}), 0.5], [3.6, gB, 0.3], [7.7, () => relB, 0.3], [8.0, adjB, 0.3], [9.1, () => "free", 0.35], [10.5, smB, 0.4], [12.05, () => "free", 0.4]]);
  const cam = {
    pos: kf(t, [[0, V(1.6, 2.6, 4.6)], [11.95, V(1.4, 2.5, 4.5)], [13.4, V(0.2, 1.85, 4.9)], [14.4, V(0.15, 1.8, 4.75)]]),
    target: kf(t, [[0, V(0, 0.45, -0.85)], [11.95, V(0, 0.45, -0.85)], [13.4, V(0, 0.4, -0.6)], [14.4, V(0, 0.4, -0.6)]]),
    fov: 34,
  };
  return {A, B, handsA, handsB, cam, look: V(0, 0.6, -0.9)};
}

export const PLANS = {geladeira: planFridge, sofa: planSofa, cama: planBed};

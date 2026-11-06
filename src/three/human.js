// Funcionário da Diego: corpo articulado (proporções de um adulto de 1,78 m),
// uniforme marinho com detalhe ciano, calça marinho, calçado preto.
// A pose é calculada a cada quadro: IK de dois ossos em braços e pernas, pés plantados.
import * as THREE from "three";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {V, UP, ik2, between, basisQuat, cl, lerp} from "./kit";

const NAVY = "#18265A", NAVY_D = "#141B33", CYAN = "#22B3DD", SHOE = "#16181C";
const L = {upper: 0.3, fore: 0.265, thigh: 0.45, shin: 0.44, ankle: 0.075};

const std = (c, r = 0.75, m = 0) => new THREE.MeshStandardMaterial({color: c, roughness: r, metalness: m});
const cyl = new THREE.CylinderGeometry(1, 1, 1, 18, 1, true);
const cylT = (a, b) => new THREE.CylinderGeometry(b, a, 1, 18, 1, false); // a: raio na base (início), b: no topo (fim)
const sph = new THREE.SphereGeometry(1, 24, 18);

export class Worker {
  constructor({skin = "#7A4E35", hair = "#17120E", logoTex = null} = {}) {
    const g = (this.group = new THREE.Group());
    const mShirt = std(NAVY, 0.8), mPants = std(NAVY_D, 0.85), mSkin = std(skin, 0.55), mCyan = std(CYAN, 0.6), mShoe = std(SHOE, 0.5), mHair = std(hair, 0.9);
    const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    this.m = {
      pelvis: add(new RoundedBoxGeometry(0.33, 0.17, 0.2, 4, 0.06), mPants),
      belly: add(new RoundedBoxGeometry(0.315, 0.3, 0.19, 4, 0.07), mShirt),
      chest: add(new RoundedBoxGeometry(0.37, 0.3, 0.2, 4, 0.07), mShirt),
      collar: add(new THREE.TorusGeometry(0.068, 0.016, 8, 24), mCyan),
      neck: add(cylT(0.052, 0.047), mSkin),
      head: add(sph, mSkin),
      hair: add(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), mHair),
      nose: add(sph, mSkin),
      earL: add(sph, mSkin), earR: add(sph, mSkin),
    };
    for (const s of ["L", "R"]) {
      this.m["sh" + s] = add(sph, mShirt);
      this.m["sleeve" + s] = add(cylT(0.066, 0.058), mShirt);
      this.m["band" + s] = add(cylT(0.06, 0.06), mCyan);
      this.m["upper" + s] = add(cylT(0.05, 0.043), mSkin);
      this.m["elbow" + s] = add(sph, mSkin);
      this.m["fore" + s] = add(cylT(0.042, 0.033), mSkin);
      this.m["hand" + s] = add(new RoundedBoxGeometry(0.082, 0.1, 0.034, 3, 0.015), mSkin);
      this.m["thumb" + s] = add(new RoundedBoxGeometry(0.024, 0.055, 0.024, 2, 0.01), mSkin);
      this.m["thigh" + s] = add(cylT(0.082, 0.062), mPants);
      this.m["knee" + s] = add(sph, mPants);
      this.m["shin" + s] = add(cylT(0.058, 0.046), mPants);
      this.m["shoe" + s] = add(new RoundedBoxGeometry(0.105, 0.085, 0.27, 3, 0.03), mShoe);
      this.m["stripe" + s] = add(cylT(0.06, 0.05), mCyan);
    }
    if (logoTex) {
      const lg = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.06), new THREE.MeshStandardMaterial({map: logoTex, transparent: true, roughness: 0.8}));
      this.m.logo = lg; g.add(lg);
    }
    this.mats = {mSkin};
  }

  // s = {root, F, ph, hinge, lean, feet:{L,R}, footF:{L,R}, lift:{L,R}, hands:{L,R} (Vector3 ou null), look}
  update(s) {
    const m = this.m;
    const F = s.F.clone().setY(0).normalize();
    const R = new THREE.Vector3().crossVectors(F, UP).normalize(); // direita da pessoa
    const P = s.root.clone().setY(s.ph);
    const h = s.hinge || 0;
    const T = UP.clone().multiplyScalar(Math.cos(h)).addScaledVector(F, Math.sin(h)).normalize();
    const side = {L: -1, R: 1};

    // tronco
    m.pelvis.position.copy(P).addScaledVector(UP, -0.02);
    m.pelvis.quaternion.copy(basisQuat(UP.clone().lerp(T, 0.35), F));
    m.belly.position.copy(P).addScaledVector(T, 0.17);
    m.belly.quaternion.copy(basisQuat(T, F));
    m.chest.position.copy(P).addScaledVector(T, 0.36);
    m.chest.quaternion.copy(basisQuat(T, F));
    const neckB = P.clone().addScaledVector(T, 0.5);
    const headUp = T.clone().lerp(UP, 0.45).normalize();
    const lookF = s.look ? s.look.clone().sub(neckB).normalize() : F.clone().addScaledVector(UP, -0.15).normalize();
    const hq = basisQuat(headUp, lookF.clone().lerp(F, 0.3));
    const neckT = neckB.clone().addScaledVector(headUp, 0.07);
    between(m.neck, neckB.clone().addScaledVector(T, -0.03), neckT);
    m.collar.position.copy(neckB).addScaledVector(T, -0.005);
    m.collar.quaternion.copy(basisQuat(F.clone().multiplyScalar(-1), T)).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2));
    m.collar.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), T));
    const head = neckT.clone().addScaledVector(headUp, 0.1);
    m.head.position.copy(head); m.head.quaternion.copy(hq); m.head.scale.set(0.092, 0.118, 0.104);
    m.hair.position.copy(head).addScaledVector(headUp, 0.012); m.hair.quaternion.copy(hq); m.hair.scale.set(0.097, 0.112, 0.109);
    const hf = V(0, 0, 1).applyQuaternion(hq), hr = V(1, 0, 0).applyQuaternion(hq), hu = V(0, 1, 0).applyQuaternion(hq);
    m.nose.position.copy(head).addScaledVector(hf, 0.1).addScaledVector(hu, -0.015); m.nose.scale.set(0.017, 0.024, 0.02); m.nose.quaternion.copy(hq);
    m.earL.position.copy(head).addScaledVector(hr, -0.094); m.earL.scale.set(0.012, 0.026, 0.018);
    m.earR.position.copy(head).addScaledVector(hr, 0.094); m.earR.scale.set(0.012, 0.026, 0.018);
    if (m.logo) {
      m.logo.position.copy(P).addScaledVector(T, 0.42).addScaledVector(F, 0.112).addScaledVector(R, -0.09);
      m.logo.quaternion.copy(basisQuat(T, F));
    }

    // braços
    for (const k of ["L", "R"]) {
      const sd = side[k];
      const sh = P.clone().addScaledVector(T, 0.455).addScaledVector(R, sd * 0.195);
      let wristT, handDir;
      if (s.hands && s.hands[k]) {
        const grip = s.hands[k];
        handDir = grip.clone().sub(sh).normalize();
        wristT = grip.clone().addScaledVector(handDir, -0.055);
      } else {
        wristT = sh.clone().addScaledVector(UP, -0.54).addScaledVector(R, sd * 0.06).addScaledVector(F, 0.04 + (s.swing ? s.swing[k] : 0));
        handDir = wristT.clone().sub(sh).normalize();
      }
      const pole = sh.clone().addScaledVector(R, sd * 0.35).addScaledVector(UP, -0.45).addScaledVector(F, -0.25);
      const {mid: el, end: wr} = ik2(sh, wristT, L.upper, L.fore, pole);
      m["sh" + k].position.copy(sh); m["sh" + k].scale.setScalar(0.068);
      const sleeveEnd = sh.clone().lerp(el, 0.52);
      between(m["sleeve" + k], sh, sleeveEnd);
      between(m["band" + k], sleeveEnd.clone().lerp(sh, 0.12), sleeveEnd.clone().lerp(el, 0.04));
      between(m["upper" + k], sh, el);
      m["elbow" + k].position.copy(el); m["elbow" + k].scale.setScalar(0.043);
      between(m["fore" + k], el, wr);
      const fd = wr.clone().sub(el).normalize();
      // mão: segue o antebraço e gira em direção ao ponto de pega
      const hd = fd.clone().lerp(handDir, 0.5).normalize();
      const palm = R.clone().multiplyScalar(-sd).addScaledVector(hd, -R.clone().multiplyScalar(-sd).dot(hd)).normalize();
      m["hand" + k].position.copy(wr).addScaledVector(hd, 0.05);
      m["hand" + k].quaternion.copy(basisQuat(hd, palm));
      m["thumb" + k].position.copy(wr).addScaledVector(hd, 0.03).addScaledVector(palm, 0.022).addScaledVector(F, 0.02);
      m["thumb" + k].quaternion.copy(basisQuat(hd.clone().lerp(palm, 0.4).normalize(), palm));
    }

    // pernas (pés plantados)
    for (const k of ["L", "R"]) {
      const sd = side[k];
      const hip = P.clone().addScaledVector(R, sd * 0.1).addScaledVector(UP, -0.06);
      const fF = (s.footF && s.footF[k]) ? s.footF[k].clone().setY(0).normalize() : F;
      const foot = s.feet[k].clone();
      const lift = s.lift ? s.lift[k] || 0 : 0;
      const ankle = foot.clone().setY(L.ankle + lift).addScaledVector(fF, -0.05);
      const pole = hip.clone().addScaledVector(fF, 1).addScaledVector(R, sd * 0.12);
      const {mid: kn, end: an} = ik2(hip, ankle, L.thigh, L.shin, pole);
      between(m["thigh" + k], hip, kn);
      m["knee" + k].position.copy(kn); m["knee" + k].scale.setScalar(0.06);
      between(m["shin" + k], kn, an);
      between(m["stripe" + k], kn.clone().lerp(an, 0.75), kn.clone().lerp(an, 0.8));
      m["stripe" + k].scale.x = m["stripe" + k].scale.z = 1.01;
      const toe = an.clone().addScaledVector(fF, 0.07).setY(an.y - 0.035);
      m["shoe" + k].position.copy(toe);
      const pitch = lift > 0.005 ? cl(lift * 2, 0, 0.35) : 0;
      m["shoe" + k].quaternion.copy(basisQuat(UP.clone().addScaledVector(fF, -pitch).normalize(), fF));
    }
    return {P, T, F, R};
  }
}

// passada com pés plantados: start/end no chão, distância percorrida d (0..D)
export function walk(start, end, u, settle = 0, stride = 0.62, width = 0.11) {
  const D = start.distanceTo(end);
  const dir = end.clone().sub(start).setY(0).normalize();
  const R = new THREE.Vector3().crossVectors(dir, UP).normalize();
  const h = stride / 2;
  const d = D * u;
  const q = (k) => cl(k * h, 0, D);
  const n = Math.min(Math.floor(d / h), Math.max(0, Math.ceil(D / h) - 1));
  const frac = cl((d - n * h) / h);
  const moving = n % 2 === 0 ? "L" : "R", still = moving === "L" ? "R" : "L";
  const pos = (k) => start.clone().addScaledVector(dir, k);
  const feet = {}, lift = {L: 0, R: 0};
  feet[still] = pos(q(n));
  let mv = lerp(q(n - 1), q(n + 1), frac);
  let liftV = Math.sin(Math.PI * frac) * 0.07 * (u > 0 && u < 1 ? 1 : 0);
  if (u >= 1) { mv = lerp(lerp(q(n - 1), q(n + 1), frac), D, settle); liftV = Math.sin(Math.PI * settle) * 0.05 * (settle < 1 ? 1 : 0); }
  feet[moving] = pos(mv);
  feet.L.addScaledVector(R, -width); feet.R.addScaledVector(R, width);
  lift[moving] = liftV;
  const root = start.clone().addScaledVector(dir, d);
  const moving01 = u > 0 && u < 1 ? 1 : 0;
  const bob = moving01 * (-0.03 + 0.03 * Math.sin(Math.PI * frac));
  const swing = {L: 0, R: 0};
  swing[moving] = -0.1 * Math.cos(Math.PI * frac) * moving01; swing[still] = -swing[moving];
  return {root, feet, lift, bob, dir, swing};
}

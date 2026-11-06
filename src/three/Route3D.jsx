// Percurso ilustrativo em 3D: bairro em perspectiva, dois endereços marcados e o caminhão
// da Diego (baú branco, leão azul, letreiro e faixas) indo da saída ao destino.
import React, {useMemo} from "react";
import * as THREE from "three";
import {ThreeCanvas} from "@remotion/three";
import {useThree} from "@react-three/fiber";
import {useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender} from "remotion";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {V, UP, cl, lerp, seg, ss, eio, eo, hash} from "./kit";
import {useImg} from "./Protect3D";

/* ---------------- trajeto (com curvas arredondadas) ---------------- */
const LANE = 1.75;
const PTS = [V(9, 0, LANE), V(40 + LANE, 0, LANE), V(40 + LANE, 0, -36 + LANE), V(66, 0, -36 + LANE)];
const RAD = 7;
function buildPath() {
  const out = [];
  const push = (p) => out.push(p.clone());
  push(PTS[0]);
  for (let i = 1; i < PTS.length - 1; i++) {
    const a = PTS[i - 1], b = PTS[i], c = PTS[i + 1];
    const d1 = b.clone().sub(a).normalize(), d2 = c.clone().sub(b).normalize();
    const p1 = b.clone().addScaledVector(d1, -RAD), p2 = b.clone().addScaledVector(d2, RAD);
    for (let k = 0; k <= 1.0001; k += 0.5) push(a.clone().lerp(p1, k)); // trecho reto
    for (let k = 1; k <= 24; k++) { const u = k / 24; const q = p1.clone().multiplyScalar((1 - u) ** 2).addScaledVector(b, 2 * u * (1 - u)).addScaledVector(p2, u * u); push(q); }
  }
  push(PTS[PTS.length - 1]);
  // reamostra por comprimento de arco
  const L = [0]; for (let i = 1; i < out.length; i++) L.push(L[i - 1] + out[i].distanceTo(out[i - 1]));
  return {pts: out, L, len: L[L.length - 1]};
}
const PATH = buildPath();
function at(s) {
  s = cl(s, 0, PATH.len);
  let i = 1; while (i < PATH.L.length - 1 && PATH.L[i] < s) i++;
  const u = (s - PATH.L[i - 1]) / Math.max(1e-6, PATH.L[i] - PATH.L[i - 1]);
  return PATH.pts[i - 1].clone().lerp(PATH.pts[i], u);
}
const heading = (s) => { const a = at(s - 1.2), b = at(s + 1.2); return Math.atan2(-(b.z - a.z), b.x - a.x); };
const curvature = (s) => { const h1 = heading(s - 1.5), h2 = heading(s + 1.5); let d = h2 - h1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d / 3; };

/* ---------------- perfil de velocidade (simulado uma vez) ---------------- */
const T_GO = 2.7, VMAX = 18, VCURVE = 9, ACC = 4.0, DEC = 3.4;
const STOP_S = PATH.len - 3.2;
const SIM = (() => {
  const vlim = (s) => { let m = VMAX; for (let k = -10; k <= 10; k += 1) { const c = Math.abs(curvature(s + k)); if (c > 0.02) m = Math.min(m, VCURVE + Math.abs(k) * 0.9); } return m; };
  const dt = 1 / 120, tab = [{t: 0, s: 0, v: 0, a: 0}];
  let s = 0, v = 0, t = 0;
  while (s < STOP_S - 0.002 && t < 40) {
    const remain = STOP_S - s;
    let target = Math.min(vlim(s), Math.sqrt(Math.max(0, 2 * DEC * remain)));
    // olha à frente para frear antes da curva
    for (let k = 2; k < 30; k += 2) target = Math.min(target, Math.sqrt(vlim(s + k) ** 2 + 2 * DEC * k));
    const a = v < target ? Math.min(ACC, (target - v) / dt) : Math.max(-DEC * 1.2, (target - v) / dt);
    v = Math.max(0, v + a * dt); s += v * dt; t += dt;
    tab.push({t, s, v, a});
  }
  return tab;
})();
export const ROUTE3D_T = Math.ceil((T_GO + SIM[SIM.length - 1].t + 1.6) * 10) / 10;
export const ROUTE3D_ARRIVE = T_GO + SIM[SIM.length - 1].t;
function motion(t) {
  const tt = t - T_GO;
  if (tt <= 0) return {s: 0, v: 0, a: 0};
  if (tt >= SIM[SIM.length - 1].t) { const e = SIM[SIM.length - 1]; return {s: e.s, v: 0, a: 0, after: tt - e.t}; }
  const i = Math.min(SIM.length - 1, Math.floor(tt * 120));
  return SIM[i];
}

/* ---------------- texturas ---------------- */
function canvas(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function tint(img, color) { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const x = c.getContext("2d"); x.drawImage(img, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height); return c; }
// lateral do baú: alumínio em gomos horizontais, leão perto da cabine, letreiro marinho e faixas azuis
function sideTex(lion, letreiroNavy, frontOnRight) {
  return canvas(1300, 640, (x, W, H) => {
    x.fillStyle = "#F3F5F7"; x.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 14) { x.fillStyle = "rgba(120,130,145,.16)"; x.fillRect(0, y, W, 2); x.fillStyle = "rgba(255,255,255,.6)"; x.fillRect(0, y + 2, W, 1); }
    const fx = (v) => (frontOnRight ? W - v : v); // posição medida a partir da frente
    // faixas diagonais azul royal e marinho (como na pintura da frota)
    const band = (x0, w, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(fx(x0), H); x.lineTo(fx(x0 + w), H); x.lineTo(fx(x0 + w + 170), H * 0.55); x.lineTo(fx(x0 + 170), H * 0.55); x.closePath(); x.fill(); };
    x.globalAlpha = 0.95; band(W * 0.62, 90, "#1F4FCC"); band(W * 0.62 + 110, 34, "#12317F"); band(W * 0.06, 60, "#1F4FCC"); x.globalAlpha = 1;
    // leão
    const lw = H * 0.92;
    x.save(); x.translate(fx(30 + lw / 2), H * 0.5); if (frontOnRight) x.scale(-1, 1); x.drawImage(lion, -lw / 2, -lw / 2, lw, lw); x.restore();
    // letreiro
    const tw = W * 0.38, th = tw * letreiroNavy.height / letreiroNavy.width;
    x.drawImage(letreiroNavy, fx(W * 0.45 + (frontOnRight ? tw : 0)), H * 0.2, tw, th);
    x.fillStyle = "#12317F"; x.font = "italic 800 30px M, sans-serif"; x.textAlign = "center";
    x.fillText("Servir a Deus tem nos feito muito bem!", fx(W * 0.45 + tw / 2 - (frontOnRight ? 0 : 0)) + (frontOnRight ? -0 : 0), H * 0.12);
  });
}
function facadeTex(seed, color) {
  return canvas(256, 256, (x, W, H) => {
    x.fillStyle = color; x.fillRect(0, 0, W, H);
    const cols = 4, rows = 4;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const lit = hash(seed + i * 7 + j * 13) > 0.7;
      x.fillStyle = lit ? "#9FB6CF" : "#7D90A6"; x.fillRect(i * 64 + 14, j * 64 + 14, 36, 40);
      x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(i * 64 + 14, j * 64 + 14, 36, 4);
    }
  });
}
function label(text, bg, fg = "#fff") {
  const t = canvas(512, 160, (x, W, H) => {
    x.fillStyle = bg; const r = 60; x.beginPath(); x.moveTo(r, 20); x.arcTo(W - 10, 20, W - 10, H - 20, r); x.arcTo(W - 10, H - 20, 10, H - 20, r); x.arcTo(10, H - 20, 10, 20, r); x.arcTo(10, 20, W - 10, 20, r); x.fill();
    x.fillStyle = fg; x.font = "800 74px M, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, W / 2, H / 2 + 4);
  });
  return t;
}

/* ---------------- caminhão ---------------- */
function buildTruck(tex) {
  const g = new THREE.Group(); // frente aponta para +x
  const body = new THREE.Group(); g.add(body);
  const white = new THREE.MeshStandardMaterial({color: "#F6F7F9", roughness: 0.35, metalness: 0.05});
  const black = new THREE.MeshStandardMaterial({color: "#1C1F24", roughness: 0.7});
  const glass = new THREE.MeshStandardMaterial({color: "#1E2A38", roughness: 0.08, metalness: 0.4});
  const chrome = new THREE.MeshStandardMaterial({color: "#C9CED6", roughness: 0.2, metalness: 0.9});
  const blue = new THREE.MeshStandardMaterial({color: "#1F4FCC", roughness: 0.45});
  const add = (geo, mat, x, y, z, parent = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  // chassi
  add(new THREE.BoxGeometry(6.6, 0.28, 1.0), black, -0.6, 0.72, 0, g);
  // baú
  const boxL = 5.1, boxW = 2.44, boxH = 2.5, bx = -1.75, by = 1.0 + boxH / 2;
  const sideL = new THREE.MeshStandardMaterial({map: tex.sideL, roughness: 0.4, metalness: 0.1});
  const sideR = new THREE.MeshStandardMaterial({map: tex.sideR, roughness: 0.4, metalness: 0.1});
  const boxMats = [white, white, white, black, sideR, sideL]; // +x, -x, +y, -y, +z, -z
  const box = add(new THREE.BoxGeometry(boxL, boxH, boxW), boxMats, bx, by, 0);
  add(new THREE.BoxGeometry(boxL + 0.04, 0.08, boxW + 0.04), chrome, bx, 1.0, 0);
  add(new THREE.BoxGeometry(0.03, boxH - 0.2, 0.02), chrome, bx - boxL / 2 - 0.01, by, 0);
  // cabine
  const cab = add(new RoundedBoxGeometry(1.75, 2.15, 2.3, 4, 0.16), white, 1.72, 1.98, 0);
  add(new THREE.BoxGeometry(0.06, 0.95, 2.05), glass, 2.58, 2.45, 0).rotation.z = -0.12; // para-brisa
  for (const z of [-1.151, 1.151]) { const w = add(new THREE.BoxGeometry(0.85, 0.75, 0.02), glass, 1.85, 2.45, z); }
  add(new THREE.BoxGeometry(0.08, 0.55, 2.0), black, 2.6, 1.25, 0); // grade
  add(new THREE.BoxGeometry(0.05, 0.06, 1.9), chrome, 2.63, 1.42, 0);
  for (const z of [-0.85, 0.85]) add(new THREE.BoxGeometry(0.06, 0.18, 0.36), new THREE.MeshStandardMaterial({color: "#FFF7E0", emissive: "#FFF2CC", emissiveIntensity: 0.3}), 2.62, 1.48, z);
  add(new THREE.BoxGeometry(0.2, 0.3, 2.3), black, 2.55, 0.9, 0); // para-choque
  // faixa azul na porta
  for (const z of [-1.156, 1.156]) { const s = add(new THREE.BoxGeometry(1.4, 0.22, 0.01), blue, 1.6, 1.35, z); s.rotation.z = 0.32; }
  // retrovisores
  for (const z of [-1.3, 1.3]) { add(new THREE.BoxGeometry(0.06, 0.06, 0.22), black, 2.4, 2.5, z * 0.95); add(new THREE.BoxGeometry(0.08, 0.32, 0.14), black, 2.42, 2.4, z); }
  // rodas
  const tireG = new THREE.CylinderGeometry(0.48, 0.48, 0.32, 32); tireG.rotateX(Math.PI / 2);
  const rimG = new THREE.CylinderGeometry(0.27, 0.27, 0.34, 24); rimG.rotateX(Math.PI / 2);
  const tireM = new THREE.MeshStandardMaterial({color: "#1A1B1E", roughness: 0.9});
  const wheels = [];
  for (const [x, z, front] of [[1.9, -1.0, 1], [1.9, 1.0, 1], [-2.6, -1.0, 0], [-2.6, 1.0, 0], [-2.6, -0.66, 0], [-2.6, 0.66, 0]]) {
    const piv = new THREE.Group(); piv.position.set(x, 0.48, z); g.add(piv);
    const spin = new THREE.Group(); piv.add(spin);
    const t = new THREE.Mesh(tireG, tireM); t.castShadow = true; spin.add(t);
    const r = new THREE.Mesh(rimG, chrome); spin.add(r);
    for (let k = 0; k < 6; k++) { const n = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.35), black); const a = k / 6 * Math.PI * 2; n.position.set(Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0); spin.add(n); }
    wheels.push({piv, spin, front: !!front});
  }
  // para-lamas
  for (const z of [-1.0, 1.0]) add(new THREE.BoxGeometry(1.1, 0.06, 0.4), black, 1.9, 1.0, z);
  return {g, body, wheels};
}

function buildHouse(w, d, h, wall, roof) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({color: wall, roughness: 0.85})); m.position.y = h / 2; m.castShadow = m.receiveShadow = true; g.add(m);
  const shape = new THREE.Shape(); shape.moveTo(-w / 2 - 0.3, 0); shape.lineTo(w / 2 + 0.3, 0); shape.lineTo(0, h * 0.45); shape.closePath();
  const r = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: d + 0.6, bevelEnabled: false}), new THREE.MeshStandardMaterial({color: roof, roughness: 0.8})); r.position.set(0, h, -d / 2 - 0.3); r.castShadow = true; g.add(r);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.06), new THREE.MeshStandardMaterial({color: "#5B4636"})); door.position.set(0, 1.05, d / 2 + 0.02); g.add(door);
  for (const x of [-w / 3, w / 3]) { const wi = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 0.06), new THREE.MeshStandardMaterial({color: "#8FA6BE", roughness: 0.2})); wi.position.set(x, 1.6, d / 2 + 0.02); g.add(wi); }
  return g;
}
function buildPin(color, iconTex) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color, roughness: 0.35});
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 24), mat); head.position.y = 3.2; head.castShadow = true; g.add(head);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.78, 2.2, 32), mat); cone.rotation.x = Math.PI; cone.position.y = 2.0; cone.castShadow = true; g.add(cone);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshBasicMaterial({color: "#ffffff"})); disc.position.set(0, 3.2, 1.06); g.add(disc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.55, 48), new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.55})); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; g.add(ring);
  return {g, head, ring, disc};
}

/* ---------------- cidade ---------------- */
function buildCity(tex) {
  const g = new THREE.Group();
  const asphalt = new THREE.MeshStandardMaterial({color: "#50555D", roughness: 0.95});
  const walk = new THREE.MeshStandardMaterial({color: "#DCD8D1", roughness: 0.9});
  const curb = new THREE.MeshStandardMaterial({color: "#C3BEB6", roughness: 0.9});
  const lineM = new THREE.MeshBasicMaterial({color: "#F2F2EE"});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({color: "#D9DDD2", roughness: 1})); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const roads = [ // [x0,z0,x1,z1] (eixo central), largura 7
    [-60, 0, 140, 0], [40, 60, 40, -120], [-60, -36, 140, -36], [0, 60, 0, -120], [84, 60, 84, -120], [-60, -72, 140, -72], [-60, 36, 140, 36],
  ];
  for (const [x0, z0, x1, z1] of roads) {
    const horiz = z0 === z1, len = horiz ? Math.abs(x1 - x0) : Math.abs(z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const r = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : 7, 0.04, horiz ? 7 : len), asphalt); r.position.set(cx, 0.02, cz); r.receiveShadow = true; g.add(r);
    for (const sgn of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : 2.2, 0.16, horiz ? 2.2 : len), walk);
      w.position.set(cx + (horiz ? 0 : sgn * 4.6), 0.08, cz + (horiz ? sgn * 4.6 : 0)); w.receiveShadow = true; g.add(w);
      const c = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : 0.14, 0.18, horiz ? 0.14 : len), curb);
      c.position.set(cx + (horiz ? 0 : sgn * 3.5), 0.09, cz + (horiz ? sgn * 3.5 : 0)); g.add(c);
    }
    for (let k = -len / 2 + 2; k < len / 2; k += 6) {
      const d = new THREE.Mesh(new THREE.BoxGeometry(horiz ? 2.6 : 0.16, 0.01, horiz ? 0.16 : 2.6), lineM);
      d.position.set(cx + (horiz ? k : 0), 0.045, cz + (horiz ? 0 : k)); g.add(d);
    }
  }
  // cruzamentos limpos
  for (const x of [0, 40, 84]) for (const z of [36, 0, -36, -72]) { const c = new THREE.Mesh(new THREE.BoxGeometry(7, 0.05, 7), asphalt); c.position.set(x, 0.025, z); g.add(c); }
  // quadras com prédios e casas
  const xs = [-60, 0, 40, 84, 140], zs = [60, 36, 0, -36, -72, -120];
  const cols = ["#F1EEE8", "#E8E4DC", "#EEF0F2", "#E3E7EA", "#F4F1EA", "#DCE2E6"];
  let n = 0;
  const reserved = [[11, 12], [62, -27]]; // saída e destino
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const bx0 = xs[i] + 6, bx1 = xs[i + 1] - 6, bz0 = zs[j + 1] + 6, bz1 = zs[j] - 6;
    for (let x = bx0; x < bx1 - 4; x += 11) for (let z = bz0; z < bz1 - 4; z += 12) {
      n++;
      const cx = x + 5, cz = z + 5.5;
      if (reserved.some(([rx, rz]) => Math.abs(rx - cx) < 9 && Math.abs(rz - cz) < 9)) continue;
      const h = 3.6 + Math.floor(hash(n) * 4) * 3.0, w = 8 + hash(n + 3) * 2, d = 8.5 + hash(n + 5) * 2;
      const col = cols[n % cols.length];
      const mat = new THREE.MeshStandardMaterial({color: col, roughness: 0.9});
      const fac = new THREE.MeshStandardMaterial({map: tex.facades[n % tex.facades.length], roughness: 0.85});
      fac.map.wrapS = fac.map.wrapT = THREE.RepeatWrapping;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [fac, fac, mat, mat, fac, fac]);
      b.position.set(cx, h / 2, cz); b.castShadow = b.receiveShadow = true; g.add(b);
      // árvores na calçada
      if (hash(n + 11) > 0.45) {
        const tx = cx + (hash(n + 2) - 0.5) * 6, tz = cz + (hash(n + 4) - 0.5) * 6;
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.2, 8), new THREE.MeshStandardMaterial({color: "#6E5843"})); tr.position.set(tx, 1.1, tz); tr.castShadow = true;
        const cn = new THREE.Mesh(new THREE.SphereGeometry(1.9, 16, 12), new THREE.MeshStandardMaterial({color: hash(n) > 0.5 ? "#7FA06A" : "#6F955D", roughness: 0.9})); cn.position.set(tx, 3.3, tz); cn.castShadow = true;
        if (Math.abs(tx - 40) > 6 && Math.abs(tz) > 6 && Math.abs(tz + 36) > 6) { g.add(tr); g.add(cn); }
      }
    }
  }
  // árvores alinhadas nas calçadas do trajeto
  for (let x = -30; x < 130; x += 13) for (const z of [-5.2, 5.2, -36 - 5.2, -36 + 5.2]) {
    if (Math.abs(x - 40) < 8 || Math.abs(x - 84) < 7 || Math.abs(x) < 6 || Math.abs(x - 11) < 6 && z > 0 || Math.abs(x - 62) < 7 && z > -36 && z < -20) continue;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.0, 8), new THREE.MeshStandardMaterial({color: "#6E5843"})); tr.position.set(x, 1.0, z); tr.castShadow = true; g.add(tr);
    const cn = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), new THREE.MeshStandardMaterial({color: "#7A9C64", roughness: 0.9})); cn.position.set(x, 2.9, z); cn.castShadow = true; g.add(cn);
  }
  // casas da saída e do destino
  const o = buildHouse(9, 8, 3.6, "#F5F3EE", "#B7654B"); o.position.set(11, 0, 12); g.add(o);
  const d = buildHouse(9, 8, 3.6, "#EEF2F5", "#3E5C88"); d.position.set(62, 0, -27); g.add(d);
  return g;
}

/* ---------------- cena ---------------- */
function Cam({pos, target}) {
  const {camera, size} = useThree();
  camera.position.copy(pos); camera.fov = 30; camera.near = 0.5; camera.far = 600; camera.aspect = size.width / size.height; camera.updateProjectionMatrix(); camera.lookAt(target);
  return null;
}

function Scene({imgs}) {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const W = useMemo(() => {
    const navy = tint(imgs.letreiro, "#12317F");
    const tex = {sideL: sideTex(imgs.lion, navy, false), sideR: sideTex(imgs.lion, navy, true), facades: ["#EDEAE4", "#E4E8EB", "#F0EDE6"].map((c, i) => facadeTex(i * 31, c))};
    const truck = buildTruck(tex);
    const city = buildCity(tex);
    const pinO = buildPin("#22B3DD"), pinD = buildPin("#1F4FCC");
    pinO.g.position.set(11, 0, 6.6); pinD.g.position.set(62, 0, -32.2);
    const lab = {o: new THREE.Sprite(new THREE.SpriteMaterial({map: label("Saída", "#0A1B4D"), depthTest: false})), d: new THREE.Sprite(new THREE.SpriteMaterial({map: label("Destino", "#1F4FCC"), depthTest: false}))};
    lab.o.scale.set(4.6, 1.44, 1); lab.d.scale.set(5.2, 1.62, 1);
    const ribbon = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({color: "#2DB5E0", transparent: true, opacity: 0.9}));
    const check = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), new THREE.MeshBasicMaterial({color: "#22B3DD"}));
    pinD.g.add(check); check.position.set(0, 3.2, 1.08);
    return {truck, city, pinO, pinD, lab, ribbon, check};
  }, []);

  // caminhão
  const m = motion(t);
  const p = at(m.s), hd = heading(m.s), k = curvature(m.s);
  const tr = W.truck;
  tr.g.position.copy(p); tr.g.rotation.set(0, hd, 0);
  // suspensão: mergulha ao frear, levanta ao acelerar, inclina para fora na curva, assenta ao parar
  const settle = m.after != null ? Math.exp(-m.after * 3) * Math.sin(m.after * 11) * 0.012 : 0;
  tr.body.rotation.z = cl(-m.a * 0.0065, -0.02, 0.02) + settle;
  tr.body.rotation.x = cl(m.v * m.v * k * 0.0042, -0.025, 0.025);
  tr.body.position.y = Math.sin(m.s * 1.7) * 0.012 * cl(m.v / 8);
  const wb = 4.5;
  for (const w of tr.wheels) { w.spin.rotation.z = -m.s / 0.48; if (w.front) w.piv.rotation.y = Math.atan(wb * k) * 1.0; }

  // pinos
  const dropO = eo(seg(t, 0.25, 0.85)), bounceO = Math.sin(Math.PI * seg(t, 0.85, 1.15)) * 0.25;
  W.pinO.g.position.y = (1 - dropO) * 6 - bounceO * 0; W.pinO.g.scale.set(1 + bounceO * 0.1, 1 - bounceO * 0.12, 1 + bounceO * 0.1); W.pinO.g.visible = t > 0.25;
  const dShow = eo(seg(t, 2.2, 2.8));
  W.pinD.g.position.y = (1 - dShow) * 6; W.pinD.g.visible = t > 2.2;
  const arr = seg(t, ROUTE3D_ARRIVE, ROUTE3D_ARRIVE + 0.5);
  W.check.scale.setScalar(Math.max(0.001, eo(arr)));
  W.lab.o.position.set(11, 5.9 + (1 - dropO) * 6, 6.6); W.lab.o.material.opacity = seg(t, 0.6, 1.0);
  W.lab.d.position.set(62, 5.9 + (1 - dShow) * 6, -32.2); W.lab.d.material.opacity = seg(t, 2.6, 3.0);
  // trajeto aparece enquanto o caminhão sai
  const drawS = PATH.len * eio(seg(t, 2.0, 3.6));
  if (drawS > 0.3) {
    const pts = [], n = Math.max(2, Math.ceil(drawS / 0.6));
    for (let i = 0; i <= n; i++) pts.push(at((i / n) * drawS));
    const pos = [], idx = [];
    pts.forEach((q, i) => { const h2 = heading((i / n) * drawS); const nx = Math.sin(h2), nz = Math.cos(h2); pos.push(q.x - nx * 0.55, 0.06, q.z - nz * 0.55, q.x + nx * 0.55, 0.06, q.z + nz * 0.55); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    W.ribbon.geometry.dispose(); const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(idx); W.ribbon.geometry = gg; W.ribbon.visible = true;
  } else W.ribbon.visible = false;

  // câmera acompanha com atraso suave (média do caminho recente)
  let cx = 0, cz = 0, nS = 0;
  for (let i = 0; i < 12; i++) { const q = at(motion(t - i * 0.09).s); cx += q.x; cz += q.z; nS++; }
  const focus = V(cx / nS, 0, cz / nS);
  const intro = 1 - ss(seg(t, 2.6, 4.2));
  focus.lerp(V(13, 0, 4), intro * 0.5);
  const camOff = V(11, 44, -30).multiplyScalar(lerp(1.0, 0.9, ss(seg(t, ROUTE3D_ARRIVE - 1.5, ROUTE3D_ARRIVE + 0.8))));
  const target = focus.clone().add(V(0, 0.5, 2.5));
  const pos = target.clone().add(camOff);

  return (
    <>
      <Cam pos={pos} target={target} />
      <color attach="background" args={["#DDE5EC"]} />
      <fog attach="fog" args={["#DDE5EC", 70, 160]} />
      <hemisphereLight args={["#F3F6FA", "#B8B3A6", 0.85]} />
      <directionalLight position={[focus.x - 22, 40, focus.z + 28]} target-position={[focus.x, 0, focus.z]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34} shadow-camera-far={120} shadow-bias={-0.0006} shadow-normalBias={0.05} />
      <primitive object={W.city} />
      <primitive object={W.ribbon} />
      <primitive object={W.pinO.g} />
      <primitive object={W.pinD.g} />
      <primitive object={W.lab.o} />
      <primitive object={W.lab.d} />
      <primitive object={tr.g} />
      <TargetFix focus={focus} />
    </>
  );
}
// mantém o alvo da luz direcional no foco (para a sombra acompanhar o caminhão)
function TargetFix({focus}) {
  const {scene} = useThree();
  scene.traverse((o) => { if (o.isDirectionalLight && o.castShadow) { o.target.position.copy(focus); o.target.updateMatrixWorld(); } });
  return null;
}

function useFont() {
  const [h] = React.useState(() => delayRender("font"));
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    const f = new FontFace("M", `url(${staticFile("fonts/Montserrat-800.ttf")})`, {weight: "800"});
    const fi = new FontFace("M", `url(${staticFile("fonts/Montserrat-800i.ttf")})`, {weight: "800", style: "italic"});
    Promise.all([f.load(), fi.load()]).then((l) => { l.forEach((x) => document.fonts.add(x)); setOk(true); continueRender(h); }).catch(() => { setOk(true); continueRender(h); });
  }, []);
  return ok;
}

export const Route3D = () => {
  const {width, height} = useVideoConfig();
  const lion = useImg(staticFile("diego/leao.png")), letreiro = useImg(staticFile("craft/letreiro.png"));
  const font = useFont();
  if (!lion || !letreiro || !font) return null;
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}}>
      <Scene imgs={{lion, letreiro}} />
    </ThreeCanvas>
  );
};

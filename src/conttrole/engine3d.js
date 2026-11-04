// Motor 3D mínimo em SVG: câmera em perspectiva, caixas com sombreamento por face,
// sombras projetadas, contato e reflexo no piso. Unidades do mundo: y para cima, piso em y=0.
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
export const lerp3 = (a, b, p) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];

export const makeCam = (pos, target, fov, W = 1080, H = 1920) => {
  const f = norm(sub(target, pos));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const F = H / 2 / Math.tan((fov * Math.PI) / 360);
  const proj = (p) => {
    const d = sub(p, pos);
    const z = Math.max(dot(d, f), 0.05);
    return [W / 2 + (dot(d, r) * F) / z, H / 2 - (dot(d, u) * F) / z, z];
  };
  return {pos, f, r, u, F, proj};
};

// luz principal (de cima, à direita e à frente)
export const LIGHT = norm([0.55, 1.0, 0.4]);

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mixc = (a, b, p) => {
  const A = typeof a === "string" ? hex(a) : a;
  const B = typeof b === "string" ? hex(b) : b;
  return [0, 1, 2].map((k) => A[k] + (B[k] - A[k]) * p);
};
export const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// materiais derivados da logo: prata ("TROLE") e azul ("CONT")
export const MAT = {
  silver: {dark: "#454A59", light: "#CDD0D8", top: "#EDEEF1", edge: "#FFFFFF"},
  shade: {dark: "#03091F", light: "#1C2848", top: "#2A3658", edge: "#5A6A90"},
  blue: {dark: "#06307F", light: "#1E78FA", top: "#5DB2FF", edge: "#B6E0FF"},
};
export const blendMat = (a, b, p) => ({
  dark: mixc(a.dark, b.dark, p),
  light: mixc(a.light, b.light, p),
  top: mixc(a.top, b.top, p),
  edge: mixc(a.edge, b.edge, p),
});

const FACES = [
  {i: [4, 6, 7, 5], n: [1, 0, 0], k: "+x"},
  {i: [0, 1, 3, 2], n: [-1, 0, 0], k: "-x"},
  {i: [2, 3, 7, 6], n: [0, 1, 0], k: "+y"},
  {i: [0, 4, 5, 1], n: [0, -1, 0], k: "-y"},
  {i: [1, 5, 7, 3], n: [0, 0, 1], k: "+z"},
  {i: [0, 2, 6, 4], n: [0, 0, -1], k: "-z"},
];
const rotY = (v, a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};

// box: {x, y (base), z, w, h, d, yaw (graus), mat}
export const boxVerts = (b) => {
  const out = [];
  const a = ((b.yaw || 0) * Math.PI) / 180;
  for (let ix = 0; ix < 2; ix++)
    for (let iy = 0; iy < 2; iy++)
      for (let iz = 0; iz < 2; iz++) {
        const lv = [(ix - 0.5) * b.w, iy * b.h, (iz - 0.5) * b.d];
        out[(ix << 2) | (iy << 1) | iz] = add(rotY(lv, a), [b.x, b.y, b.z]);
      }
  return out;
};
export const boxFaces = (b, cam, mirror = false) => {
  const V = boxVerts(b).map((v) => (mirror ? [v[0], -v[1], v[2]] : v));
  const a = ((b.yaw || 0) * Math.PI) / 180;
  const camPos = cam.pos;
  const res = [];
  for (const F of FACES) {
    let n = rotY(F.n, a);
    if (mirror) n = [n[0], -n[1], n[2]];
    const c = mul(F.i.reduce((s, k) => add(s, V[k]), [0, 0, 0]), 0.25);
    if (dot(n, sub(c, camPos)) >= 0) continue;
    const nl = mirror ? [n[0], -n[1], n[2]] : n;
    const lam = Math.max(0, dot(nl, LIGHT));
    const m = b.mat;
    const col = F.k === "+y" ? (Array.isArray(m.top) ? m.top : hex(m.top)) : mixc(m.dark, m.light, 0.18 + 0.82 * lam);
    res.push({k: F.k, pts: F.i.map((k) => cam.proj(V[k])), world: F.i.map((k) => V[k]), col, n});
  }
  return res;
};

// envoltória convexa (Andrew)
export const hull = (P) => {
  const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  up.pop();
  lo.pop();
  return lo.concat(up);
};
export const shadowPoly = (b, cam) => {
  const V = boxVerts(b).map((v) => sub(v, mul(LIGHT, v[1] / LIGHT[1])));
  return hull(V.map((v) => cam.proj(v)));
};
export const footPoly = (b, cam, grow = 0.06) => {
  const g = {...b, w: b.w + grow, d: b.d + grow, h: 0.0001, y: 0};
  return hull(boxVerts(g).map((v) => cam.proj(v)));
};
export const ptsStr = (P) => P.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

// matriz afim para escrever texto num plano 3D: origem o, eixo x do texto ux, eixo "para baixo" uy (unidades por 100 px de texto)
export const planeMatrix = (cam, o, ux, uy) => {
  const P0 = cam.proj(o);
  const P1 = cam.proj(add(o, mul(ux, 0.01)));
  const P2 = cam.proj(add(o, mul(uy, 0.01)));
  return `matrix(${P1[0] - P0[0]} ${P1[1] - P0[1]} ${P2[0] - P0[0]} ${P2[1] - P0[1]} ${P0[0]} ${P0[1]})`;
};

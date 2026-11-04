// geometria 2D para silhuetas orgânicas
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, k) => [a[0] * k, a[1] * k];
export const len = (a) => Math.hypot(a[0], a[1]);
export const nrm = (a) => { const l = len(a) || 1e-6; return [a[0] / l, a[1] / l]; };
export const perp = (a) => [-a[1], a[0]];
export const rot = ([x, y], r) => [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
export const deg = (d) => (d * Math.PI) / 180;
export const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const f = (n) => Math.round(n * 10) / 10;

// curva suave (Catmull-Rom -> Bézier) por uma lista de pontos
export const smooth = (pts, closed = false, tension = 0.5) => {
  const n = pts.length;
  if (n < 2) return "";
  const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + " Z" : d;
};

// contorno de um membro: linha central + larguras (meia-largura) em cada ponto
// bias desloca o perfil para um lado (músculo), por ponto
export const limb = (C, Wd, {capStart = true, capEnd = true, bias} = {}) => {
  const n = C.length;
  const N = C.map((p, i) => {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)];
    return nrm(perp(sub(b, a)));
  });
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const b = bias ? bias[i] : 0;
    L.push(add(C[i], mul(N[i], Wd[i] * (1 + b))));
    R.push(add(C[i], mul(N[i], -Wd[i] * (1 - b))));
  }
  const dirS = nrm(sub(C[0], C[1])), dirE = nrm(sub(C[n - 1], C[n - 2]));
  const pts = [...L];
  if (capEnd) pts.push(add(C[n - 1], mul(dirE, Wd[n - 1] * 0.75)));
  pts.push(...R.reverse());
  if (capStart) pts.push(add(C[0], mul(dirS, Wd[0] * 0.6)));
  return {d: smooth(pts, true), L, R: R.reverse()};
};

// gradiente cilíndrico perpendicular ao eixo de um segmento (sombreamento de volume)
export const cyl = (A, B, w, light = [-0.6, -0.8]) => {
  const n = nrm(perp(sub(B, A)));
  const s = n[0] * light[0] + n[1] * light[1] >= 0 ? 1 : -1;
  const m = lerp2(A, B, 0.5);
  return {x1: m[0] + n[0] * w * s, y1: m[1] + n[1] * w * s, x2: m[0] - n[0] * w * s, y2: m[1] - n[1] * w * s};
};

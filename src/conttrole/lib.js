import {Easing} from "remotion";

export const FPS = 30;
export const DUR = 888; // 29,6 s
export const W = 1080;
export const H = 1920;

// Paleta extraída da logo
export const K = {
  bg: "#00081F", // fundo externo da logo
  deep: "#010F36", // centro do fundo da logo
  navy: "#04205F",
  blue: "#1570F9", // "CONT"
  sky: "#0C93FA", // seta
  light: "#7CC2FF",
  silver: "#CACAC8", // "TROLE"
  white: "#FFFFFF",
};
export const FONT = "Montserrat, sans-serif";

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mix = (a, b, p) => a + (b - a) * p;
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  back: Easing.bezier(0.34, 1.45, 0.64, 1),
  lin: (x) => x,
};
// progresso 0..1 entre os instantes a e b (segundos)
export const r = (t, a, b, e = E.out) => e(clamp((t - a) / (b - a)));
// interpolação por keyframes [[t, v], ...]
export const kf = (t, keys, e = E.inOut) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return mix(v0, v1, e((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};

// ângulo 0 = topo, sentido horário
export const pt = (cx, cy, R, a) => [cx + R * Math.sin((a * Math.PI) / 180), cy - R * Math.cos((a * Math.PI) / 180)];
export const arc = (cx, cy, R, a0, a1) => {
  if (a1 - a0 < 0.05) return "";
  const [x0, y0] = pt(cx, cy, R, a0);
  const [x1, y1] = pt(cx, cy, R, Math.min(a1, a0 + 359.9));
  return `M${x0} ${y0} A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

// amostragem de curva (cúbica + quadrática) com comprimento acumulado
const cubic = (p0, p1, p2, p3, s) => {
  const u = 1 - s;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * s * p1[k] + 3 * u * s * s * p2[k] + s * s * s * p3[k]);
};
const quad = (p0, p1, p2, s) => {
  const u = 1 - s;
  return [0, 1].map((k) => u * u * p0[k] + 2 * u * s * p1[k] + s * s * p2[k]);
};
export const samplePath = (segs, n = 200) => {
  const pts = [];
  segs.forEach((sg, si) => {
    for (let i = si === 0 ? 0 : 1; i <= n; i++) {
      const s = i / n;
      pts.push(sg.length === 4 ? cubic(...sg, s) : quad(...sg, s));
    }
  });
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = L[L.length - 1];
  // devolve pontos até a fração p e a posição/ângulo da cabeça
  const upTo = (p) => {
    const target = clamp(p) * total;
    const out = [];
    let head = pts[0];
    let ang = 0;
    for (let i = 0; i < pts.length; i++) {
      if (L[i] <= target) {
        out.push(pts[i]);
        head = pts[i];
        if (i > 0) ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
      } else {
        const f = (target - L[i - 1]) / (L[i] - L[i - 1]);
        head = [mix(pts[i - 1][0], pts[i][0], f), mix(pts[i - 1][1], pts[i][1], f)];
        out.push(head);
        ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
        break;
      }
    }
    return {d: out.length > 1 ? "M" + out.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" L") : "", head, ang};
  };
  // trecho entre as frações a e b
  const between = (a, b) => {
    const A = clamp(a) * total;
    const {d, head, ang} = upTo(b);
    if (!d) return {d: "", head, ang};
    const keep = [];
    for (let i = 0; i < pts.length && L[i] <= clamp(b) * total; i++) if (L[i] >= A) keep.push(pts[i]);
    keep.push(head);
    return {d: keep.length > 1 ? "M" + keep.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" L") : "", head, ang};
  };
  return {upTo, between, total};
};

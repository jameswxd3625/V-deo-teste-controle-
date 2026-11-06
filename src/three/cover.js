// Capa acolchoada da Diego como malha deformável.
// Topo: campo de alturas sobre a peça (com "tenda" nas reentrâncias, que some quando a equipe acomoda).
// Saia: cada ponto tem uma coordenada de tecido s (distância a partir da borda do topo).
// O tecido já puxado (s <= puxado) fica rente à peça; o restante fica franzido junto à barra.
import * as THREE from "three";
import {V, UP, cl, ss, lerp, hash} from "./kit";

const CELL_W = 0.09, CELL_H = 0.12; // gomos de ~9 x 12 cm, como nas capas reais

// ---------- texturas ----------
function quiltCanvas(wM, hM, ppm, logo) {
  const W = Math.max(64, Math.round(wM * ppm)), H = Math.max(64, Math.round(hM * ppm));
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#1F4FCC"; x.fillRect(0, 0, W, H);
  const cw = CELL_W * ppm, ch = CELL_H * ppm;
  for (let i = 0; i * cw < W + cw; i++) for (let j = 0; j * ch < H + ch; j++) {
    const cx = i * cw + cw / 2, cy = j * ch + ch / 2;
    const g = x.createRadialGradient(cx, cy - ch * 0.08, 1, cx, cy, Math.max(cw, ch) * 0.62);
    g.addColorStop(0, "#2D5FDF"); g.addColorStop(0.7, "#2152D2"); g.addColorStop(1, "#1A44B4");
    x.fillStyle = g; x.fillRect(i * cw, j * ch, cw, ch);
  }
  x.strokeStyle = "rgba(14,38,120,0.85)"; x.lineWidth = Math.max(1, ppm * 0.0035); x.setLineDash([ppm * 0.008, ppm * 0.006]);
  for (let i = 0; i * cw <= W; i++) { x.beginPath(); x.moveTo(i * cw, 0); x.lineTo(i * cw, H); x.stroke(); }
  for (let j = 0; j * ch <= H; j++) { x.beginPath(); x.moveTo(0, j * ch); x.lineTo(W, j * ch); x.stroke(); }
  x.setLineDash([]);
  // leve variação do tecido
  for (let k = 0; k < W * H / 900; k++) { x.fillStyle = `rgba(255,255,255,${0.015 + hash(k) * 0.02})`; x.fillRect(hash(k * 3.1) * W, hash(k * 7.7) * H, 1.5, 1.5); }
  if (logo) {
    const {img, u, v, w, mirror} = logo; // metros
    const lw = w * ppm, lh = lw * img.height / img.width;
    x.save(); x.translate(u * ppm, v * ppm); if (mirror) x.scale(-1, 1);
    x.globalAlpha = 0.95; x.drawImage(img, -lw / 2, -lh / 2, lw, lh); x.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.flipY = false;
  return t;
}

let _normalTile = null;
function quiltNormal() {
  if (_normalTile) return _normalTile;
  const W = 64, H = 84, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), img = x.createImageData(W, H);
  const hgt = (i, j) => { const u = (i / W) * 2 - 1, v = (j / H) * 2 - 1; return Math.pow(Math.max(0, 1 - u * u), 0.6) * Math.pow(Math.max(0, 1 - v * v), 0.6); };
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const dx = (hgt((i + 1) % W, j) - hgt((i - 1 + W) % W, j)) * 2.2, dy = (hgt(i, (j + 1) % H) - hgt(i, (j - 1 + H) % H)) * 2.2;
    const n = V(-dx, -dy, 1).normalize(), p = (j * W + i) * 4;
    img.data[p] = (n.x * 0.5 + 0.5) * 255; img.data[p + 1] = (n.y * 0.5 + 0.5) * 255; img.data[p + 2] = (n.z * 0.5 + 0.5) * 255; img.data[p + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.flipY = false;
  return (_normalTile = t);
}

function fabricMat(map, wM, hM) {
  const n = quiltNormal().clone(); n.needsUpdate = true;
  n.repeat.set(1 / CELL_W, 1 / CELL_H);
  map.repeat.set(1 / wM, 1 / hM);
  return new THREE.MeshStandardMaterial({map, normalMap: n, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.82, side: THREE.DoubleSide});
}

// ---------- capa ----------
export class Cover {
  // piece: {x0,x1,z0,z1, H(x,z), tent, logo:{where:'skirt'|'top', ...}}
  constructor(piece, logoImg) {
    this.pc = piece;
    const m = (this.m = 0.022);
    const x0 = piece.x0 - m, x1 = piece.x1 + m, z0 = piece.z0 - m, z1 = piece.z1 + m;
    Object.assign(this, {x0, x1, z0, z1});
    const step = 0.025;
    this.nx = Math.ceil((x1 - x0) / step) + 1; this.nz = Math.ceil((z1 - z0) / step) + 1;
    // alturas base e "tenda"
    const raw = new Float32Array(this.nx * this.nz);
    for (let j = 0; j < this.nz; j++) for (let i = 0; i < this.nx; i++) {
      const x = cl(lerp(x0, x1, i / (this.nx - 1)), piece.x0 + 0.001, piece.x1 - 0.001), z = cl(lerp(z0, z1, j / (this.nz - 1)), piece.z0 + 0.001, piece.z1 - 0.001);
      raw[j * this.nx + i] = piece.H(x, z);
    }
    let b = raw.slice();
    const r = Math.max(1, Math.round((piece.tent || 0.1) / step));
    for (let pass = 0; pass < 3; pass++) {
      const o = new Float32Array(b.length);
      for (let j = 0; j < this.nz; j++) for (let i = 0; i < this.nx; i++) {
        let s = 0, n = 0;
        for (let k = -r; k <= r; k++) { const ii = cl(i + k, 0, this.nx - 1); s += b[j * this.nx + ii]; n++; }
        o[j * this.nx + i] = s / n;
      }
      const o2 = new Float32Array(b.length);
      for (let j = 0; j < this.nz; j++) for (let i = 0; i < this.nx; i++) {
        let s = 0, n = 0;
        for (let k = -r; k <= r; k++) { const jj = cl(j + k, 0, this.nz - 1); s += o[jj * this.nx + i]; n++; }
        o2[j * this.nx + i] = s / n;
      }
      b = o2;
    }
    this.raw = raw; this.tent = new Float32Array(raw.length);
    for (let k = 0; k < raw.length; k++) this.tent[k] = Math.max(raw[k], b[k] * 0.985);

    // perímetro (retângulo de cantos arredondados)
    const rc = 0.035, pts = [];
    const corners = [[x1 - rc, z1 - rc, 0], [x0 + rc, z1 - rc, Math.PI / 2], [x0 + rc, z0 + rc, Math.PI], [x1 - rc, z0 + rc, 1.5 * Math.PI]];
    // frente (z1) da direita para a esquerda, depois esquerda, fundo, direita
    const edge = (a, bb, n) => { for (let k = 0; k < n; k++) pts.push(a.clone().lerp(bb, k / n)); };
    const arc = (cx, cz, a0) => { for (let k = 0; k < 6; k++) { const a = a0 + (k / 6) * Math.PI / 2; pts.push(V(cx + Math.cos(a) * rc, 0, cz + Math.sin(a) * rc)); } };
    const sp = 0.02;
    arc(corners[0][0], corners[0][1], 0); edge(V(x1 - rc, 0, z1), V(x0 + rc, 0, z1), Math.ceil((x1 - x0) / sp));
    arc(corners[1][0], corners[1][1], Math.PI / 2); edge(V(x0, 0, z1 - rc), V(x0, 0, z0 + rc), Math.ceil((z1 - z0) / sp));
    arc(corners[2][0], corners[2][1], Math.PI); edge(V(x0 + rc, 0, z0), V(x1 - rc, 0, z0), Math.ceil((x1 - x0) / sp));
    arc(corners[3][0], corners[3][1], 1.5 * Math.PI); edge(V(x1, 0, z0 + rc), V(x1, 0, z1 - rc), Math.ceil((z1 - z0) / sp));
    this.per = pts; this.K = pts.length;
    this.nrm = pts.map((p, k) => { const a = pts[(k - 1 + this.K) % this.K], c = pts[(k + 1) % this.K]; const t = c.clone().sub(a).normalize(); return V(-t.z, 0, t.x).multiplyScalar(-1); });
    // garante normal para fora
    this.nrm.forEach((n, k) => { const p = pts[k]; const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; if (n.x * (p.x - cx) + n.z * (p.z - cz) < 0) n.multiplyScalar(-1); });
    this.uM = []; let acc = 0; for (let k = 0; k < this.K; k++) { this.uM.push(acc); acc += pts[k].distanceTo(pts[(k + 1) % this.K]); } this.perLen = acc;
    this.NS = 46;
    // índice do meio da frente (para a marca)
    this.frontMid = pts.reduce((best, p, k) => (Math.abs(p.x - (x0 + x1) / 2) + Math.abs(p.z - z1) < Math.abs(pts[best].x - (x0 + x1) / 2) + Math.abs(pts[best].z - z1) ? k : best), 0);

    // geometrias
    const top = new THREE.BufferGeometry(), nT = this.nx * this.nz;
    top.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nT * 3), 3));
    top.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(nT * 2), 2));
    const idx = [];
    for (let j = 0; j < this.nz - 1; j++) for (let i = 0; i < this.nx - 1; i++) { const a = j * this.nx + i, b2 = a + 1, c = a + this.nx, d = c + 1; idx.push(a, c, b2, b2, c, d); }
    top.setIndex(idx);
    const sk = new THREE.BufferGeometry(), nS = (this.K + 1) * this.NS;
    sk.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nS * 3), 3));
    sk.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(nS * 2), 2));
    const id2 = [];
    for (let k = 0; k < this.K; k++) for (let r2 = 0; r2 < this.NS - 1; r2++) { const a = k * this.NS + r2, b2 = a + 1, c = a + this.NS, d = c + 1; id2.push(a, b2, c, b2, d, c); }
    sk.setIndex(id2);

    // texturas: topo em metros (comprimento de arco em z) e saia em metros (perímetro x s)
    this.topH = 0; this.computeTopArc(0);
    const maxS = Math.max(...pts.map((p, k) => this.edgeY(k, 0))) + 0.05;
    const lg = piece.logo;
    const topMap = quiltCanvas(x1 - x0, this.topArcMax, lg.where === "top" ? 640 : 300, lg.where === "top" ? {img: logoImg, u: lg.u, v: lg.v, w: lg.w} : null);
    const skMap = quiltCanvas(this.perLen, maxS, lg.where === "skirt" ? Math.min(560, 7600 / this.perLen) : 260, lg.where === "skirt" ? {img: logoImg, u: this.uM[this.frontMid], v: lg.s, w: lg.w, mirror: true} : null);
    this.maxS = maxS;
    this.topMesh = new THREE.Mesh(top, fabricMat(topMap, x1 - x0, this.topArcMax));
    this.skMesh = new THREE.Mesh(sk, fabricMat(skMap, this.perLen, maxS));
    const pip = new THREE.MeshStandardMaterial({color: "#13318C", roughness: 0.7});
    this.pipTop = new THREE.Mesh(new THREE.BufferGeometry(), pip);
    this.pipHem = new THREE.Mesh(new THREE.BufferGeometry(), pip);
    this.group = new THREE.Group();
    for (const mm of [this.topMesh, this.skMesh, this.pipTop, this.pipHem]) { mm.castShadow = true; mm.receiveShadow = true; this.group.add(mm); }
  }

  hTop(i, j, tuck) {
    const k = j * this.nx + i, t = typeof tuck === "function" ? tuck(lerp(this.x0, this.x1, i / (this.nx - 1)), lerp(this.z0, this.z1, j / (this.nz - 1))) : tuck;
    return lerp(this.tent[k], this.raw[k], t) + 0.012;
  }
  computeTopArc(tuck) {
    let mx = 0;
    this.arc = new Float32Array(this.nx * this.nz);
    for (let i = 0; i < this.nx; i++) {
      let acc = 0, py = this.hTop(i, 0, tuck), pz = this.z0;
      for (let j = 0; j < this.nz; j++) {
        const y = this.hTop(i, j, tuck), z = lerp(this.z0, this.z1, j / (this.nz - 1));
        if (j) acc += Math.hypot(y - py, z - pz);
        this.arc[j * this.nx + i] = acc; py = y; pz = z;
      }
      mx = Math.max(mx, acc);
    }
    this.topArcMax = mx + 0.02;
  }
  // altura da borda do topo no ponto k do perímetro
  edgeY(k, tuck) {
    const p = this.per[k];
    const i = Math.round(cl((p.x - this.x0) / (this.x1 - this.x0)) * (this.nx - 1)), j = Math.round(cl((p.z - this.z0) / (this.z1 - this.z0)) * (this.nz - 1));
    return this.hTop(i, j, tuck);
  }

  // st = {pull 0..1, open 0..1, bundle: Vector3 centro do pacote, tuck (num|fn), folds 0..1, tugs:[{c,d,r}], drop (queda final), t}
  update(st) {
    const {x0, x1, z0, z1, nx, nz, K, NS} = this;
    const tuck = st.tuck ?? 0;
    const Ac = V((x0 + x1) / 2, 0, (z0 + z1) / 2);
    let topMax = 0;
    for (let k = 0; k < this.raw.length; k++) topMax = Math.max(topMax, this.raw[k]);
    Ac.y = topMax + 0.02;
    const S = V(0.24, 0.16, 0.3);
    const maxR = Math.hypot((x1 - x0) / 2, (z1 - z0) / 2) + 0.4;
    const open = st.open ?? 1, B = st.bundle || Ac;
    const crumple = (p, seed) => {
      // pacote dobrado: comprime em torno do centro, com pequenas irregularidades
      const q = p.clone().sub(Ac).multiply(S).add(B);
      q.x += (hash(seed) - 0.5) * 0.02; q.y += (hash(seed + 9) - 0.5) * 0.02; q.z += (hash(seed + 5) - 0.5) * 0.02;
      return q;
    };
    const morph = (p, seed) => {
      if (open >= 1) return p;
      const r = Math.hypot(p.x - Ac.x, p.z - Ac.z) / maxR + (Ac.y - p.y) * 0.5;
      const mi = ss(cl(open * 1.6 - r * 0.6));
      const q = crumple(p, seed);
      // desdobra em arco (o tecido sobe um pouco antes de assentar)
      const out = q.lerp(p, mi); out.y += Math.sin(Math.PI * mi) * 0.06;
      return out;
    };
    const tug = (p) => {
      if (!st.tugs) return p;
      for (const g of st.tugs) { const w = Math.exp(-p.distanceToSquared(g.c) / (g.r * g.r)); p.addScaledVector(g.d, w); }
      return p;
    };

    // topo
    const pos = this.topMesh.geometry.attributes.position.array, uv = this.topMesh.geometry.attributes.uv.array;
    this.computeTopArc(tuck);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      const p = V(lerp(x0, x1, i / (nx - 1)), this.hTop(i, j, tuck), lerp(z0, z1, j / (nz - 1)));
      const q = tug(morph(p, k));
      pos[k * 3] = q.x; pos[k * 3 + 1] = q.y; pos[k * 3 + 2] = q.z;
      uv[k * 2] = p.x - x0; uv[k * 2 + 1] = this.arc[k];
    }
    // saia
    const sp = this.skMesh.geometry.attributes.position.array, su = this.skMesh.geometry.attributes.uv.array;
    const pull = st.pull ?? 1, folds = st.folds ?? 1, drop = st.drop ?? 0;
    this.hem = [];
    for (let kk = 0; kk <= K; kk++) {
      const k = kk % K, p0 = this.per[k], n = this.nrm[k];
      const e = this.edgeY(k, tuck);
      const Ls = Math.max(0.02, e - 0.012);
      const pl = Math.min(Ls, Ls * pull + drop);
      const E = Ls - pl, Er = E / Ls;
      const ph = this.uM[k];
      for (let r = 0; r < NS; r++) {
        const s = (r / (NS - 1)) * Ls;
        let y, out;
        if (s <= pl) {
          y = e - s;
          const w = ss(1 - (pl - s) / 0.28);
          out = w * (0.006 + 0.03 * Er) * folds * (0.5 + 0.5 * Math.sin(ph * 2 * Math.PI / 0.13 + 1.3));
          out += 0.004 * folds * Math.sin(ph * 2 * Math.PI / 0.07) * w;
        } else {
          const t = s - pl;
          y = e - pl - t * 0.17;
          out = (0.02 + 0.06 * Er) * (0.55 + 0.45 * Math.sin(t * Math.PI / 0.045)) + 0.012 * Math.sin(ph * 2 * Math.PI / 0.15);
        }
        const q = tug(morph(V(p0.x + n.x * out, Math.max(0.006, y), p0.z + n.z * out), 5000 + kk * NS + r));
        const vi = (kk * NS + r);
        sp[vi * 3] = q.x; sp[vi * 3 + 1] = q.y; sp[vi * 3 + 2] = q.z;
        su[vi * 2] = this.uM[k] + (kk === K ? this.perLen : 0); su[vi * 2 + 1] = s;
        if (r === NS - 1 && kk < K) this.hem.push(q.clone());
        if (r === 0 && kk < K) (this.edge || (this.edge = []))[k] = q.clone();
      }
    }
    for (const g of [this.topMesh.geometry, this.skMesh.geometry]) { g.attributes.position.needsUpdate = true; g.attributes.uv.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere(); }
    // vivos (acabamento) na borda do topo e na barra
    const tube = (arr, r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arr, true), Math.min(400, arr.length * 2), r, 6, true);
    this.pipTop.geometry.dispose(); this.pipTop.geometry = tube(this.edge, 0.007);
    this.pipHem.geometry.dispose(); this.pipHem.geometry = tube(this.hem, 0.008);
  }

  // ponto de pega na barra mais próximo de (x,z), com afastamento para a mão
  grip(x, z, off = 0.035, up = 0.02) {
    let best = 0, bd = 1e9;
    this.per.forEach((p, k) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = k; } });
    return this.hem[best].clone().addScaledVector(this.nrm[best], off).add(V(0, up, 0));
  }
  // ponto de pega na borda superior (para acomodar)
  gripEdge(x, z, off = 0.03) {
    let best = 0, bd = 1e9;
    this.per.forEach((p, k) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = k; } });
    return this.edge[best].clone().addScaledVector(this.nrm[best], off);
  }
}

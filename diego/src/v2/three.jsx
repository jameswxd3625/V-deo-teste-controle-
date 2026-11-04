import React from "react";

// ---------------- motor 3D em CSS (perspectiva real, sem WebGL) ----------------
// Convenção: x direita, y para baixo (chão em y=0, objetos em y negativo), z para a câmera.
// Câmera: alvo (tx,ty,tz), yaw (gira em torno de y), pitch (inclina), dist, persp (distância focal em px)
export const Scene3D = ({cam, children, w = 1080, h = 1920, persp = 1700, style}) => (
  <div style={{position: "absolute", left: 0, top: 0, width: w, height: h, perspective: `${cam.persp || persp}px`, perspectiveOrigin: "50% 50%", overflow: "hidden", ...style}}>
    <div style={{position: "absolute", left: w / 2, top: h / 2, width: 0, height: 0, transformStyle: "preserve-3d",
      transform: `translateZ(${(cam.persp || persp) - cam.dist}px) rotateX(${-cam.pitch}deg) rotateY(${-cam.yaw}deg) translate3d(${-cam.tx}px, ${-cam.ty}px, ${-cam.tz}px)`}}>
      {children}
    </div>
  </div>
);

export const G = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, children, origin, style}) => (
  <div style={{position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d", transformOrigin: origin || "0 0 0",
    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale3d(${s}, ${s}, ${s})`, ...style}}>
    {children}
  </div>
);

// face retangular centrada na origem local, com transformação própria
export const Face = ({w, h, tf = "", bg, children, shade = 0, style, back = false, light = 0}) => (
  <div style={{position: "absolute", left: -w / 2, top: -h / 2, width: w, height: h, transform: tf, background: bg, backfaceVisibility: back ? "visible" : "hidden", transformStyle: "flat", overflow: "hidden", ...style}}>
    {children}
    {shade > 0 && <div style={{position: "absolute", inset: 0, background: "#000", opacity: shade, pointerEvents: "none"}} />}
    {light > 0 && <div style={{position: "absolute", inset: 0, background: "#fff", opacity: light, pointerEvents: "none"}} />}
  </div>
);

// iluminação simples: sombra por orientação da face (normal no espaço do mundo após o giro do objeto)
const L = [-0.45, -0.75, 0.48]; // luz vinda de cima, à esquerda e da frente
export const shadeFor = (n, ry = 0, amb = 0.42) => {
  const r = (ry * Math.PI) / 180;
  const nx = n[0] * Math.cos(r) + n[2] * Math.sin(r), nz = -n[0] * Math.sin(r) + n[2] * Math.cos(r), ny = n[1];
  const d = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
  return Math.max(0, Math.min(0.75, 1 - (amb + (1 - amb) * d))) * 0.9;
};

// paralelepípedo: faces opcionais (conteúdo React ou cor); centro na base inferior frontal-esquerda? -> centro geométrico
export const Cuboid = ({w, h, d, col = "#ccc", faces = {}, ry = 0, skip = {}, radius = 0, amb}) => {
  const F = (key, fw, fh, tf, n) => skip[key] ? null : (
    <Face key={key} w={fw} h={fh} tf={tf} bg={typeof faces[key] === "string" ? faces[key] : (faces[key] ? undefined : col)} shade={shadeFor(n, ry, amb)} style={{borderRadius: radius}}>
      {typeof faces[key] === "object" ? faces[key] : null}
    </Face>
  );
  return (
    <>
      {F("front", w, h, `translateZ(${d / 2}px)`, [0, 0, 1])}
      {F("back", w, h, `rotateY(180deg) translateZ(${d / 2}px)`, [0, 0, -1])}
      {F("right", d, h, `rotateY(90deg) translateZ(${w / 2}px)`, [1, 0, 0])}
      {F("left", d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, [-1, 0, 0])}
      {F("top", w, d, `rotateX(90deg) translateZ(${h / 2}px)`, [0, -1, 0])}
      {F("bottom", w, d, `rotateX(-90deg) translateZ(${h / 2}px)`, [0, 1, 0])}
    </>
  );
};

// cilindro (eixo z): pneus, rolos
export const Cylinder = ({r, depth, n = 20, col = "#222", cap, ry = 0, capBack}) => {
  const seg = 2 * r * Math.tan(Math.PI / n) + 1;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = (i * 360) / n;
        const nn = [Math.sin((a * Math.PI) / 180), -Math.cos((a * Math.PI) / 180), 0];
        return <Face key={i} w={seg} h={depth} tf={`rotateZ(${a}deg) translateY(${-r}px) rotateX(90deg)`} bg={col} shade={shadeFor(nn, ry, 0.35)} />;
      })}
      <Face w={r * 2} h={r * 2} tf={`translateZ(${depth / 2}px)`} style={{borderRadius: "50%"}}>{cap}</Face>
      <Face w={r * 2} h={r * 2} tf={`rotateY(180deg) translateZ(${depth / 2}px)`} style={{borderRadius: "50%"}}>{capBack || cap}</Face>
    </>
  );
};

// plano de chão (horizontal) com conteúdo, centrado em (x,z)
export const Ground = ({w, d, x = 0, z = 0, y = 0, children, bg}) => (
  <G x={x} y={y} z={z}><Face w={w} h={d} tf="rotateX(90deg)" bg={bg} back>{children}</Face></G>
);

// recorte 2D voltado para a câmera (personagens): compensa o yaw da câmera
export const Billboard = ({x = 0, y = 0, z = 0, w, h, yaw = 0, children, ax = 0.5, ay = 1}) => (
  <G x={x} y={y} z={z} ry={yaw}>
    <div style={{position: "absolute", left: -w * ax, top: -h * ay, width: w, height: h}}>{children}</div>
  </G>
);

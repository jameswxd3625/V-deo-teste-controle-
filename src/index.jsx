import React from "react";
import {registerRoot, Composition, AbsoluteFill, useCurrentFrame, interpolate, Easing} from "remotion";

const Teste = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 20], [0, 1], {extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  const y = interpolate(f, [0, 20], [40, 0], {extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: "#1e63e9", justifyContent: "center", alignItems: "center"}}>
      <div style={{color: "#fff", fontSize: 64, fontWeight: 800, fontFamily: "sans-serif", opacity: o, transform: `translateY(${y}px)`}}>Conttrole</div>
    </AbsoluteFill>
  );
};

registerRoot(() => <Composition id="Teste" component={Teste} durationInFrames={60} fps={30} width={360} height={640} />);

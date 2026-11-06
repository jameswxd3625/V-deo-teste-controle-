import React from "react";
import {ThreeCanvas} from "@remotion/three";
import {useCurrentFrame} from "remotion";
export const T3 = () => {
  const f = useCurrentFrame();
  return (
    <ThreeCanvas width={1080} height={1080} shadows camera={{position: [3, 3, 5], fov: 35}} style={{background: "#ddd"}}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 4]} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
      <mesh rotation={[0, f / 20, 0]} castShadow position={[0, 0.5, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#2153D2" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10, 10]} /><meshStandardMaterial color="#eee" /></mesh>
    </ThreeCanvas>
  );
};

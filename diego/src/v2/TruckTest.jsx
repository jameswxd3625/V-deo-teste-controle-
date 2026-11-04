import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {Scene3D, G, Face, Ground} from "./three";
import {Truck3D} from "./Truck3D";
export const TruckTest = () => {
  const f = useCurrentFrame();
  const cams = [
    {tx: 0, ty: -380, tz: 0, yaw: 28, pitch: -6, dist: 2600, persp: 1500},
    {tx: -500, ty: -420, tz: 0, yaw: -38, pitch: -8, dist: 2300, persp: 1500},
    {tx: 350, ty: -330, tz: 100, yaw: 55, pitch: -4, dist: 1500, persp: 1300},
  ];
  const cam = cams[f % 3];
  return (
    <AbsoluteFill style={{background: "linear-gradient(180deg,#4F8FE0,#A9CDF2 55%,#E8F2FB)"}}>
      <Scene3D cam={cam}>
        <Ground w={9000} d={9000} bg="linear-gradient(180deg,#4A4F5A,#3E434D)" />
        <Ground w={9000} d={300} z={-700} y={-2} bg="#C8CCD3" />
        <Truck3D open={f % 3 === 1 ? 0.7 : 0} spin={0} />
      </Scene3D>
    </AbsoluteFill>
  );
};

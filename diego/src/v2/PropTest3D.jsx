import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {Scene3D, G, Face, Ground, Billboard} from "./three";
import {Box3D, AlbumClosed3D, Sofa3D, Fridge3D} from "./props3d";
import {Person, PersonDefs, PAULO} from "./Person";
export const PropTest3D = () => {
  const f = useCurrentFrame();
  const cam = [{tx: 0, ty: -450, tz: 0, yaw: 18, pitch: 12, dist: 3000, persp: 1600}, {tx: -300, ty: -200, tz: 300, yaw: -20, pitch: 40, dist: 1700, persp: 1400}][f % 2];
  return (
    <AbsoluteFill style={{background: "#2C3550"}}>
      <PersonDefs />
      <Scene3D cam={cam}>
        <Ground w={6000} d={4000} bg="linear-gradient(180deg,#5A3F2E,#7A5640)" />
        <G z={-900} y={-800}><Face w={6000} h={1600} bg="#46567A" back /></G>
        <Sofa3D x={500} z={-500} cover={f % 2} />
        <Fridge3D x={1300} z={-300} cover={1} />
        <Box3D x={-400} z={200} fragile flaps={0} />
        <Box3D x={-300} z={700} flaps={1} inside={<AlbumClosed3D y={60} rx={0} />} />
        <Box3D x={-900} z={300} flaps={0.5} seed={2} />
        <Billboard x={200} z={300} w={500} h={1100} yaw={cam.yaw}>
          <svg width="500" height="1100" viewBox="-250 -1080 500 1100"><Person c={PAULO} e={{smile: 0.4}} /></svg>
        </Billboard>
      </Scene3D>
    </AbsoluteFill>
  );
};

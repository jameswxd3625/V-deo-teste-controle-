import React from "react";
import {AbsoluteFill} from "remotion";
import {Box, AlbumClosed, Sofa, Fridge, FloorLamp, Plant, WorldDefs, QuiltCover} from "./props";
import {Truck, TruckRear, TruckDefs} from "./Truck";
export const PropTest = () => (
  <AbsoluteFill style={{background: "#9fb0c8"}}>
    <WorldDefs /><TruckDefs />
    <svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <Truck x={30} y={560} s={0.62} />
      <TruckRear x={830} y={1100} s={0.5} open={0.35} />
      <Box x={60} y={760} fragile />
      <Box x={60} y={1050} open={0.8} seed={2} />
      <AlbumClosed x={500} y={900} />
      <Sofa x={300} y={1500} covered={0} />
      <Sofa x={780} y={1500} w={480} covered={1} />
      <Fridge x={200} y={1880} cover={1} />
      <FloorLamp x={500} y={1880} />
      <Plant x={850} y={1880} />
    </svg>
  </AbsoluteFill>
);

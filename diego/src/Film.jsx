import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {FPS, P, EI, EO} from "./lib";
import {WorldDefs} from "./props";
import {TruckDefs} from "./Truck";
import {Finish} from "./ui";
import {SceneOld} from "./s_old";
import {SceneAlbum} from "./s_album";
import {SceneDoor} from "./s_door";
import {SceneStreet, SceneRear} from "./s_street";
import {SceneMap} from "./s_map";
import {SceneArrive, ScenePOV, SceneHome} from "./s_new";
import {SceneBrand} from "./s_brand";

export const DURATION = Math.round(62 * FPS);
// [início, fim, componente, fade-in]
const SCENES = [
  [0, 19.5, SceneOld],
  [19.42, 31.46, SceneAlbum, 0.08],
  [31.46, 36.7, SceneDoor],
  [36.25, 39.6, SceneStreet],
  [39.6, 40.5, SceneRear],
  [40.3, 45.2, SceneMap, 0.25],
  [44.95, 46.45, SceneArrive, 0.2],
  [46.3, 49.0, ScenePOV, 0.12],
  [48.9, 52.9, SceneHome],
  [52.1, 62.1, SceneBrand],
];
export const Film = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <WorldDefs /><TruckDefs />
      {SCENES.map(([a, b, C, fin = 0], i) => (t >= a && t < b ? (
        <AbsoluteFill key={i} style={{opacity: fin ? P(t, a, a + fin, EO) : 1}}><C t={t} /></AbsoluteFill>
      ) : null))}
      <Finish t={t} />
    </AbsoluteFill>
  );
};

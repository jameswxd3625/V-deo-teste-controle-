import React from "react";
import {registerRoot, Composition} from "remotion";
import {loadFonts} from "./lib";
import {CharTest} from "./CharTest";
import {PropTest} from "./PropTest";
import {Film, DURATION} from "./Film";
import {Test2} from "./v2/Test2";
import {TruckTest} from "./v2/TruckTest";
import {PropTest3D} from "./v2/PropTest3D";
import {Film2, DURATION2} from "./v2/Film2";
loadFonts();
registerRoot(() => (
  <>
    <Composition id="DiegoFilm2" component={Film2} durationInFrames={DURATION2} fps={30} width={1080} height={1920} />
    <Composition id="PropTest3D" component={PropTest3D} durationInFrames={2} fps={30} width={1080} height={1920} />
    <Composition id="TruckTest" component={TruckTest} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Test2" component={Test2} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="DiegoFilm" component={Film} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
    <Composition id="PropTest" component={PropTest} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="CharTest" component={CharTest} durationInFrames={30} fps={30} width={1080} height={1920} />
  </>
));

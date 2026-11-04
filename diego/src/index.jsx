import React from "react";
import {registerRoot, Composition} from "remotion";
import {loadFonts} from "./lib";
import {CharTest} from "./CharTest";
import {PropTest} from "./PropTest";
import {Film, DURATION} from "./Film";
loadFonts();
registerRoot(() => (
  <>
    <Composition id="DiegoFilm" component={Film} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
    <Composition id="PropTest" component={PropTest} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="CharTest" component={CharTest} durationInFrames={30} fps={30} width={1080} height={1920} />
  </>
));

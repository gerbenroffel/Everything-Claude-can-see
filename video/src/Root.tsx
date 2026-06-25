import React from 'react';
import { Composition } from 'remotion';
import { GerbenIntro } from './Composition';

export const Root: React.FC = () => (
  <Composition
    id="GerbenIntro"
    component={GerbenIntro}
    durationInFrames={360}
    fps={30}
    width={1920}
    height={1080}
  />
);

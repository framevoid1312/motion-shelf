import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';

// REEL 2026 — v4. 35 s @ 30 fps, 150 BPM (1 beat = 12 frames).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel2026"
        component={Film}
        durationInFrames={1050}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{samples: 4, withAudio: true}}
      />
      <Composition
        id="Reel2026Draft"
        component={Film}
        durationInFrames={1050}
        fps={30}
        width={960}
        height={540}
        defaultProps={{samples: 1, withAudio: false}}
      />
    </>
  );
};

import React from 'react';
import {Composition} from 'remotion';
import {BrutalistReel, ReelProps} from './BrutalistReel';
import {totalFrames} from './timing';

const defaultProps: ReelProps = {
  // 120 BPM score in /public (see audio/README.md to re-render it)
  audioSrc: 'LockupInMotion_score.wav',
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BrutalistReel"
      component={BrutalistReel}
      width={1080}
      height={1080}
      fps={30}
      durationInFrames={totalFrames(30)}
      defaultProps={defaultProps}
    />
    {/* Same piece at 60 fps — all timing is beat-based, so it just scales. */}
    <Composition
      id="BrutalistReel60"
      component={BrutalistReel}
      width={1080}
      height={1080}
      fps={60}
      durationInFrames={totalFrames(60)}
      defaultProps={defaultProps}
    />
  </>
);

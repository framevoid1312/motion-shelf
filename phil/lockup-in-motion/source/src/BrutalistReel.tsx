import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Grain} from './components/Texture';
import * as O from './shots/Opening';
import * as A from './shots/Assets';
import * as F from './shots/Finale';

export type ReelProps = {
  /** file in /public, e.g. "track.mp3" — leave empty for a silent render */
  audioSrc: string;
};

/**
 * Edit decision list, in seconds. At 120 BPM every boundary is a multiple of
 * 0.125 s (a 1/16 note), so cuts land on the grid at any fps.
 */
const EDL: [start: number, end: number, Shot: React.FC][] = [
  [0, 0.5, O.PixelBlocks],
  [0.5, 1.1875, O.StudioLetters],
  [1.1875, 1.375, O.RingGlyph],
  [1.375, 1.6875, O.PanelGlyph],
  [1.6875, 2.1875, O.StreakGlobe],
  [2.1875, 2.6875, O.LockupWord],
  [2.6875, 3.15625, O.InWord],
  [3.15625, 3.5625, O.MotionWord],
  [3.5625, 4.0, O.Breath],
  [4.0, 4.25, A.Fifty],
  [4.25, 5.125, A.Bespoke],
  [5.125, 5.875, A.Blocks],
  [5.875, 6.875, A.Formats],
  [6.875, 7.5, A.Www],
  [7.5, 7.6875, A.FlashSi],
  [7.6875, 8.0625, A.ThreeSixFive],
  [8.0625, 8.375, A.BlobMorph],
  [8.375, 8.8125, A.PillsChart],
  [8.8125, 9.125, A.Grids],
  [9.125, 9.375, A.Wave],
  [9.375, 9.5625, A.Decoder],
  [9.5625, 10.125, A.Bone],
  [10.125, 10.6875, A.Edition],
  [10.6875, 11.125, A.Ring],
  [11.125, 11.5, A.Invader],
  [11.5, 11.875, A.Register],
  [11.875, 12.0625, A.Serial],
  [12.0625, 12.34375, A.Dots],
  [12.34375, 15.375, F.SheetShot],
  [15.375, 15.5, F.SheetChop],
  [15.5, 16.0, F.PixelCollapse],
  [16.0, 16.9375, F.Cross],
  [16.9375, 17.6875, F.BrandLockup],
  [17.6875, 20.0, F.Url],
];

export const BrutalistReel: React.FC<ReelProps> = ({audioSrc}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {EDL.map(([s, e, Shot], i) => {
        const from = Math.round(s * fps);
        return (
          <Sequence key={i} name={Shot.name || `shot-${i}`} from={from} durationInFrames={Math.round(e * fps) - from}>
            <Shot />
          </Sequence>
        );
      })}
      <Grain opacity={0.07} />
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
    </AbsoluteFill>
  );
};

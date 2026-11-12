import {useCurrentFrame, useVideoConfig} from 'remotion';

/** 120 BPM → 1 beat = 0.5 s, 1/8 = 0.25 s, 1/16 = 0.125 s. Every shot boundary sits on that grid. */
export const BPM = 120;
export const TOTAL_BEATS = 40; // 20 s

export const SIXTEENTH = 60 / BPM / 4;
export const totalFrames = (fps: number) => Math.round(((TOTAL_BEATS * 60) / BPM) * fps);

/** Shot-local clock in seconds (Sequence-relative). */
export const useShot = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return {
    frame,
    fps,
    t,
    /** true while a <= t < b */
    on: (a: number, b = Infinity) => t >= a - 1e-6 && t < b - 1e-6,
    /** index of the current 1/16 step */
    step: Math.floor(t / SIXTEENTH + 1e-6),
    /** index of a fast ~15 Hz flicker tick */
    tick: Math.floor(t * 15),
  };
};

/** Pick the keyframe whose time is <= t (hard, stepped animation). */
export function stepped<T>(t: number, keys: [number, T][]): T {
  let v = keys[0][1];
  for (const [k, val] of keys) if (t >= k - 1e-6) v = val;
  return v;
}

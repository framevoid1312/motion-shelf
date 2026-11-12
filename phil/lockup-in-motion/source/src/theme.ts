import type {CSSProperties} from 'react';
import {loadFont as loadGrotesk} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/SpaceMono';

export const BLACK = '#000000';
export const WHITE = '#FFFFFF';
export const SHEET_BG = '#161616';

export const GROTESK = loadGrotesk('normal', {weights: ['500', '600', '700', '800'], subsets: ['latin']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']}).fontFamily;

/** Big words: tight neo-grotesk */
export const grotesk = (size: number, weight = 600): CSSProperties => ({
  fontFamily: GROTESK,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: -0.035 * size, // overridden per use where the reference is wider
  lineHeight: 0.92,
  color: WHITE,
  whiteSpace: 'pre',
});

/** Technical labels: small monospace */
export const mono = (size = 14, weight: 400 | 700 = 400): CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: 0.02 * size,
  lineHeight: 1.25,
  textTransform: 'uppercase',
  color: WHITE,
  whiteSpace: 'pre',
});

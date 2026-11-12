import React from 'react';
import {random} from 'remotion';
import {useShot} from '../timing';

export const SYMBOLS = '$*^%()<>,:;"-0#&!?/=+';
/** Noise pool for the reference-style decoder: mostly letters/digits + a few symbols. */
export const NOISE = 'ABCDEFGHKLMNOPRSTUVXZ0123456789$*^%()<>,:;"-#&!?/=+';

/**
 * Decoder text. Times in shot-local seconds. Layout never shifts.
 * mode "scramble": chars resolve left→right; the unresolved tail is random noise.
 * mode "reveal":   no noise — letters pop in (and out) in random order, like the
 *                  reference's URL / brand dissolve.
 */
export const ScrambleText: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  hold?: number;
  outAt?: number;
  outSpan?: number;
  mode?: 'scramble' | 'reveal';
  span?: number;
  seed?: string;
  style?: React.CSSProperties;
}> = ({text, start = 0, stagger = 0.025, hold = 0.12, outAt, outSpan = 0.15, mode = 'scramble', span = 0.3, seed = 'sc', style}) => {
  const {t, tick} = useShot();
  const out = Array.from(text)
    .map((ch, i) => {
      if (ch === ' ' || ch === '\n') return ch;
      const r = random(`${seed}-r-${i}`);
      const noise = NOISE[Math.floor(random(`${seed}-${i}-${tick}`) * NOISE.length)];
      if (outAt !== undefined) {
        const vanish = outAt + r * outSpan;
        if (t >= vanish + (mode === 'reveal' ? 0 : 0.05)) return ' ';
        if (t >= vanish) return noise;
      }
      if (mode === 'reveal') return t >= start + r * span ? ch : ' ';
      const appear = start + i * stagger * 0.4;
      const resolve = start + i * stagger + hold + r * 0.04;
      if (t < appear) return ' ';
      if (t >= resolve) return ch;
      return noise;
    })
    .join('');
  return <span style={{whiteSpace: 'pre', ...style}}>{out}</span>;
};

/**
 * Type-on: letters appear one by one (layout reserved), the newest letter is
 * motion-blurred and nudged; optional overline bar above one letter.
 */
export const TypeOn: React.FC<{
  text: string;
  start?: number;
  interval?: number;
  overline?: number | null;
  overlineFrom?: number;
  blurFor?: number;
  /** letters to drop (gappy) — indexes hidden after reveal */
  holes?: number[];
  style?: React.CSSProperties;
}> = ({text, start = 0, interval = 0.0625, overline = null, overlineFrom = 0, blurFor = 0.09, holes = [], style}) => {
  const {t} = useShot();
  const chars = Array.from(text);
  const n = t < start ? 0 : Math.min(chars.length, Math.floor((t - start) / interval + 1e-6) + 1);
  const age = t - start - (n - 1) * interval;

  return (
    <div style={{display: 'flex', ...style}}>
      {chars.map((c, i) => {
        const shown = i < n && !holes.includes(i);
        const fresh = i === n - 1 && age < blurFor;
        return (
          <span
            key={i}
            style={{
              position: 'relative',
              whiteSpace: 'pre',
              visibility: shown ? 'visible' : 'hidden',
              filter: fresh ? 'blur(6px)' : undefined,
              opacity: fresh ? 0.75 : 1,
              transform: fresh ? 'translateX(10px)' : undefined,
            }}
          >
            {c}
            {overline === i && t >= overlineFrom && (
              <span style={{position: 'absolute', left: '6%', right: '6%', top: '-0.2em', height: '0.075em', background: 'currentColor'}} />
            )}
          </span>
        );
      })}
    </div>
  );
};

/** SVG text with letters hidden by mask (layout preserved via transparent tspans). */
export const GappyText: React.FC<
  {text: string; hidden: (i: number) => boolean} & React.SVGProps<SVGTextElement>
> = ({text, hidden, ...rest}) => (
  <text {...rest}>
    {Array.from(text).map((c, i) => (
      <tspan key={i} fillOpacity={hidden(i) ? 0 : 1}>
        {c}
      </tspan>
    ))}
  </text>
);

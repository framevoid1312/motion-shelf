import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

/** Very light global film grain (the black stays black-ish, like the reference). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.08}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seed = Math.floor((frame * 30) / fps) % 24;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity}}>
      <svg width={1080} height={1080}>
        <filter id={`g-${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={seed} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  5 0 0 0 -2.7" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Photocopy grit: adds signed high-frequency noise to whatever is underneath. */
const Grit: React.FC<{id: string; seed: number; amount?: number}> = ({id, seed, amount = 0.55}) => (
  <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency={0.6} numOctaves={2} seed={seed} result="n" />
    <feColorMatrix in="n" type="matrix" values="5 0 0 0 -2  5 0 0 0 -2  5 0 0 0 -2  0 0 0 0 1" result="ng" />
    <feComposite in="SourceGraphic" in2="ng" operator="arithmetic" k1={0} k2={1} k3={amount} k4={-amount / 2} />
  </filter>
);

/**
 * Procedural stand-in for the reference's grainy B/W footage (crumpled / faceted
 * sculpture shot on film):
 *   1. dark charcoal base with subtle low-frequency variation
 *   2. flat planar facets with soft gradients and bright crisp creases
 *   3. hard-edged black blotches
 *   4. strong photocopy grain over everything, re-seeded every frame
 */
export const TexturePanel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  seed?: string;
  bright?: number;
  drift?: number;
  shards?: number;
}> = ({x, y, w, h, seed = 'tp', bright = 1, drift = 1, shards = 7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const gs = Math.floor((frame * 30) / fps) % 16;
  const id = `tp-${seed}-${Math.round(w)}-${Math.round(h)}`;
  const sn = Math.floor(random(`${seed}-stone`) * 200);
  const L = Math.min(3.2, bright);
  const sx = Math.max(w, h);
  const g = (v: number) => {
    const c = Math.max(0, Math.min(255, Math.round(v * 255)));
    return `rgb(${c},${c},${c})`;
  };

  const facets = Array.from({length: shards}, (_, i) => {
    const r = (k: number) => random(`${seed}-${i}-${k}`);
    const cx = r(0) * w;
    const cy = r(1) * h;
    const size = (0.35 + r(2) * 0.8) * sx;
    const ang = -70 + r(3) * 140 + t * drift * (r(4) - 0.5) * 16;
    const pts = [0, 1, 2, 3].map((k) => {
      const a = (k / 4) * Math.PI * 2 + (r(10 + k) - 0.5) * 1.1;
      const rad = size * (0.25 + r(20 + k) * 0.6) * (k % 2 ? 0.35 : 1);
      return `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
    });
    return {
      cx: cx + t * drift * (r(5) - 0.5) * 36,
      cy,
      ang,
      pts: pts.join(' '),
      edge: pts.slice(0, 2).join(' '),
      lo: (0.03 + r(6) * 0.08) * L,
      hi: (0.12 + r(7) * 0.3) * L,
      crease: r(8) > 0.3,
      gx: r(9) > 0.5,
    };
  });

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`${id}-c`}>
          <rect width={w} height={h} />
        </clipPath>
        <Grit id={`${id}-grit`} seed={gs} amount={0.3} />
        <filter id={`${id}-stone`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={(4 / sx).toFixed(5)} numOctaves={3} seed={sn} />
          <feColorMatrix type="matrix" values={`${0.9 * L} 0 0 0 ${-0.3 * L}  ${0.9 * L} 0 0 0 ${-0.3 * L}  ${0.9 * L} 0 0 0 ${-0.3 * L}  0 0 0 0 1`} />
        </filter>
        <filter id={`${id}-blot`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={(2.6 / sx).toFixed(5)} numOctaves={3} seed={sn + 7} />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 13.6" />
        </filter>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={1.2} />
        </filter>
        {facets.map((f, i) => (
          <linearGradient key={i} id={`${id}-l${i}`} x1="0" y1="0" x2={f.gx ? 1 : 0.3} y2={f.gx ? 0.2 : 1}>
            <stop offset="0" stopColor={g(f.hi)} />
            <stop offset="0.55" stopColor={g((f.hi + f.lo) / 2)} />
            <stop offset="1" stopColor={g(f.lo)} />
          </linearGradient>
        ))}
      </defs>
      <g clipPath={`url(#${id}-c)`} filter={`url(#${id}-grit)`}>
        <rect width={w} height={h} fill={g(0.07 * L)} />
        <g transform={`translate(${-t * drift * 12} 0)`}>
          <rect width={w + 40} height={h} filter={`url(#${id}-stone)`} opacity={0.6} />
        </g>
        <g filter={`url(#${id}-soft)`}>
          {facets.map((f, i) => (
            <g key={i} transform={`translate(${f.cx} ${f.cy}) rotate(${f.ang})`}>
              <polygon points={f.pts} fill={`url(#${id}-l${i})`} />
              {f.crease && <polyline points={f.edge} fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={1.4} />}
            </g>
          ))}
        </g>
        <rect width={w} height={h} filter={`url(#${id}-blot)`} />
      </g>
    </g>
  );
};

/** Row of blurred lens/light streaks (the horizontal "glass" shapes in the reference). */
export const Streaks: React.FC<{x: number; y: number; w: number; h?: number; n?: number; seed?: string}> = ({
  x,
  y,
  w,
  h = 70,
  n = 3,
  seed = 'st',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const id = `st-${seed}`;
  const L = w / n - 14;
  return (
    <g transform={`translate(${x} ${y - h / 2})`}>
      <defs>
        <linearGradient id={`${id}-v`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
          <stop offset="0.5" stopColor="#9a9a9a" stopOpacity={0.8} />
          <stop offset="1" stopColor="#333" stopOpacity={0.4} />
        </linearGradient>
        <filter id={`${id}-b`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={3.5} />
        </filter>
        <Grit id={`${id}-grit`} seed={Math.floor(t * 30) % 12} amount={1.2} />
      </defs>
      <g filter={`url(#${id}-grit)`}>
        <rect x={-10} y={-10} width={w + 20} height={h + 20} fill="#000" opacity={0.01} />
        {Array.from({length: n}, (_, i) => {
          const sk = (random(`${seed}-${i}`) - 0.5) * 10;
          const ox = i * (L + 14) + t * 30 * (random(`${seed}-d${i}`) - 0.3);
          const hh = h * (0.7 + random(`${seed}-h${i}`) * 0.3);
          const k = hh * 0.55;
          return (
            <polygon
              key={i}
              transform={`translate(${ox} ${(h - hh) / 2}) skewX(${sk})`}
              points={`0,${hh / 2} ${k},0 ${L - k},0 ${L},${hh / 2} ${L - k},${hh} ${k},${hh}`}
              fill={`url(#${id}-v)`}
              filter={`url(#${id}-b)`}
            />
          );
        })}
      </g>
    </g>
  );
};

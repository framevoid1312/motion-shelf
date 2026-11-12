import React from 'react';
import {random} from 'remotion';
import {GROTESK, MONO, WHITE} from '../theme';

/* All icons are SVG <g> fragments drawn around a local origin.        */
/* Stroke-only monochrome, matched to the reference sheet's language.   */

type XY = {x?: number; y?: number};
const at = (x = 0, y = 0) => `translate(${x} ${y})`;

/* ── Globe / WWW ─────────────────────────────────────────── */

export const WireGlobe: React.FC<XY & {r: number; rot?: number; sw?: number; fill?: string}> = ({x, y, r, rot = 0, sw = 3, fill = 'none'}) => (
  <g transform={at(x, y)} fill="none" stroke={WHITE} strokeWidth={sw}>
    <circle r={r} fill={fill} />
    {[0, 1, 2].map((k) => {
      const a = (k / 3) * Math.PI + rot;
      return <ellipse key={k} rx={Math.abs(Math.cos(a)) * r} ry={r} />;
    })}
    {[-0.5, 0, 0.5].map((p) => (
      <line key={p} x1={-Math.cos(Math.asin(p)) * r} x2={Math.cos(Math.asin(p)) * r} y1={p * r} y2={p * r} />
    ))}
  </g>
);

export const WwwBadge: React.FC<XY & {r: number; globe?: number; rot?: number; sw?: number}> = ({x, y, r, globe = 0, rot = 0, sw = 5}) => (
  <g transform={at(x, y)}>
    {globe > 0 && <WireGlobe x={-globe} r={r * 0.96} rot={rot} sw={sw * 0.8} fill="#000" />}
    <circle r={r} fill="#000" stroke={WHITE} strokeWidth={sw} />
    <text textAnchor="middle" dominantBaseline="central" fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 700, fontSize: r * 0.54, letterSpacing: -r * 0.02}}>
      WWW
    </text>
  </g>
);

export const EarthSolid: React.FC<XY & {r: number}> = ({x, y, r}) => {
  const P = (d: string) => d.replace(/-?\d*\.?\d+/g, (n) => String(+(parseFloat(n) * r).toFixed(1)));
  return (
    <g transform={at(x, y)}>
      <defs>
        <clipPath id={`earth-${r}`}>
          <circle r={r} />
        </clipPath>
        <radialGradient id={`earth-sh-${r}`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.75} />
        </radialGradient>
      </defs>
      <circle r={r} fill="#6e6e6e" />
      <g clipPath={`url(#earth-${r})`} fill={WHITE}>
        <path d={P('M-0.9 -0.3 C-0.7 -0.8 0.2 -1.0 0.6 -0.7 C0.75 -0.55 0.5 -0.35 0.3 -0.4 C0.1 -0.45 0 -0.25 -0.15 -0.3 C-0.35 -0.35 -0.4 -0.15 -0.6 -0.15 C-0.8 -0.15 -0.95 -0.1 -0.9 -0.3 Z')} />
        <path d={P('M-0.55 -0.05 C-0.3 -0.15 0.05 -0.15 0.15 0.05 C0.25 0.25 0.1 0.45 0 0.65 C-0.1 0.85 -0.3 0.8 -0.3 0.6 C-0.3 0.4 -0.6 0.3 -0.65 0.1 C-0.7 0 -0.65 -0.02 -0.55 -0.05 Z')} />
        <path d={P('M0.3 -0.25 C0.5 -0.3 0.7 -0.15 0.65 0.05 C0.6 0.2 0.45 0.15 0.4 0 C0.35 -0.1 0.25 -0.15 0.3 -0.25 Z')} />
        <ellipse cx={r * 0.62} cy={r * 0.5} rx={r * 0.07} ry={r * 0.12} />
      </g>
      <circle r={r} fill={`url(#earth-sh-${r})`} />
    </g>
  );
};

/* ── Marks ───────────────────────────────────────────────── */

export const Crosshair: React.FC<XY & {w: number; spread: number; sw?: number}> = ({x, y, w, spread, sw = 3}) => {
  const s = spread;
  return (
    <g transform={at(x, y)} stroke={WHITE} strokeWidth={sw} fill="none">
      <line x1={-w / 2} x2={w / 2} y1={0} y2={0} />
      <circle r={sw * 3.2} fill={WHITE} stroke="none" />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy) => <line key={`${sx}${sy}`} x1={sx * s * 0.4} x2={sx * s * 1.1} y1={sy * s * 0.9} y2={sy * s * 0.9} />),
      )}
      <line x1={0} x2={0} y1={-s * 0.55} y2={-s * 0.3} />
      <line x1={0} x2={0} y1={s * 0.3} y2={s * 0.55} />
    </g>
  );
};

/** Gooey metaball dumbbell; `neck` animates the bridge thickness. */
export const Dumbbell: React.FC<XY & {w: number; r: number; neck: number; id: string}> = ({x, y, w, r, neck, id}) => (
  <g transform={at(x, y)}>
    <defs>
      <filter id={`goo-${id}`} x="-20%" y="-60%" width="140%" height="220%">
        <feGaussianBlur stdDeviation={r * 0.28} />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" />
      </filter>
    </defs>
    <g filter={`url(#goo-${id})`} fill={WHITE}>
      <circle cx={-w / 2 + r} r={r} />
      <circle cx={w / 2 - r} r={r} />
      <rect x={-w / 2 + r} y={-neck / 2} width={w - 2 * r} height={neck} />
    </g>
  </g>
);

export const CopyrightRing: React.FC<XY & {r: number; spin?: number; center?: 'c' | 'i'; id: string; text?: string}> = ({
  x,
  y,
  r,
  spin = 0,
  center = 'c',
  id,
  text = 'ALL RIGHTS RESERVED - COPYRIGHT - ',
}) => {
  const tr = r * 0.97;
  return (
    <g transform={at(x, y)}>
      <defs>
        <path id={id} d={`M 0,0 m -${tr},0 a ${tr},${tr} 0 1,0 ${2 * tr},0 a ${tr},${tr} 0 1,0 -${2 * tr},0`} />
      </defs>
      <g transform={`rotate(${spin + 180})`}>
        <text fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 800, fontSize: r * 0.3, letterSpacing: r * 0.01}}>
          <textPath href={`#${id}`} textLength={2 * Math.PI * tr * 0.98}>
            {text}
          </textPath>
        </text>
      </g>
      <circle r={r * 0.62} fill="none" stroke={WHITE} strokeWidth={r * 0.13} />
      {center === 'c' ? (
        <path
          d={`M ${r * 0.22} ${-r * 0.2} A ${r * 0.3} ${r * 0.3} 0 1 0 ${r * 0.22} ${r * 0.2}`}
          fill="none"
          stroke={WHITE}
          strokeWidth={r * 0.13}
        />
      ) : (
        <rect x={-r * 0.07} y={-r * 0.32} width={r * 0.14} height={r * 0.64} fill={WHITE} />
      )}
    </g>
  );
};

export const StarBurst: React.FC<XY & {r: number; points?: number}> = ({x, y, r, points = 8}) => {
  const pts = Array.from({length: points * 2}, (_, i) => {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(' ');
  return <polygon transform={at(x, y)} points={pts} fill={WHITE} />;
};

export const Sparkle: React.FC<XY & {r: number}> = ({x, y, r}) => (
  <path transform={at(x, y)} d={`M0 ${-r} Q0 0 ${r} 0 Q0 0 0 ${r} Q0 0 ${-r} 0 Q0 0 0 ${-r}Z`} fill={WHITE} />
);

export const Flower: React.FC<XY & {r: number}> = ({x, y, r}) => (
  <g transform={at(x, y)} fill={WHITE}>
    {[0, 1, 2, 3].map((k) => (
      <circle key={k} cx={Math.cos((k * Math.PI) / 2) * r * 0.5} cy={Math.sin((k * Math.PI) / 2) * r * 0.5} r={r * 0.5} />
    ))}
    <circle r={r * 0.18} fill="#161616" />
  </g>
);

export const EyeIcon: React.FC<XY & {w: number; r: number}> = ({x, y, w, r}) => (
  <g transform={at(x, y)} fill="none" stroke={WHITE} strokeWidth={3}>
    <line x1={-w / 2} x2={w / 2} />
    <circle cx={-r * 0.35} r={r} />
    <circle cx={r * 0.35} r={r} />
  </g>
);

export const DotGrid: React.FC<XY & {cols: number; rows: number; gap: number; r: number; tri?: boolean}> = ({x, y, cols, rows, gap, r, tri}) => (
  <g transform={at(x, y)} fill={WHITE}>
    {Array.from({length: cols * rows}, (_, i) => {
      const c = i % cols;
      const rr = Math.floor(i / cols);
      if (tri && c < cols - 1 - rr) return null;
      return tri ? (
        <rect key={i} x={c * gap} y={rr * gap} width={r * 2} height={r * 2} />
      ) : (
        <circle key={i} cx={c * gap} cy={rr * gap} r={r} />
      );
    })}
  </g>
);

/** Dot matrix with per-tick radius flicker. */
export const DotMatrix: React.FC<XY & {cols: number; rows: number; gap: number; r: number; seed: string; tick: number}> = ({
  x,
  y,
  cols,
  rows,
  gap,
  r,
  seed,
  tick,
}) => (
  <g transform={at(x, y)} fill={WHITE}>
    {Array.from({length: cols * rows}, (_, i) => {
      const v = random(`${seed}-${i}-${Math.floor(tick / 2)}`);
      if (v < 0.08) return null;
      const rr = v < 0.3 ? r * 0.55 : r;
      return <circle key={i} cx={(i % cols) * gap - ((cols - 1) * gap) / 2} cy={Math.floor(i / cols) * gap - ((rows - 1) * gap) / 2} r={rr} />;
    })}
  </g>
);

export const CircledDigit: React.FC<XY & {r: number; digit: string; sw?: number}> = ({x, y, r, digit, sw = 4}) => (
  <g transform={at(x, y)}>
    <circle r={r} fill="none" stroke={WHITE} strokeWidth={sw} />
    <text textAnchor="middle" dominantBaseline="central" fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 700, fontSize: r * 1.25}}>
      {digit}
    </text>
  </g>
);

export const Hatch: React.FC<XY & {w: number; h: number; n?: number; id: string; offset?: number; back?: boolean; rx?: number}> = ({x, y, w, h, n = 8, id, offset = 0, back = true, rx = 0}) => {
  const pitch = (w + h) / n;
  return (
    <g transform={at(x, y)}>
      <defs>
        <clipPath id={id}>
          <rect width={w} height={h} rx={rx} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} stroke={WHITE} strokeWidth={pitch * 0.45}>
        {Array.from({length: n + 2}, (_, i) => {
          const sx = i * pitch - h + (offset % pitch);
          return back ? <line key={i} x1={sx} y1={0} x2={sx + h} y2={h} /> : <line key={i} x1={sx} y1={h} x2={sx + h} y2={0} />;
        })}
      </g>
    </g>
  );
};

/* ── Data ────────────────────────────────────────────────── */

export const Waveform: React.FC<XY & {w: number; h: number; count: number; seed: string; tick: number; sw?: number; reveal?: number}> = ({
  x,
  y,
  w,
  h,
  count,
  seed,
  tick,
  sw = 2,
  reveal = 1,
}) => (
  <g transform={at(x, y)} stroke={WHITE} strokeWidth={sw}>
    {Array.from({length: Math.floor(count * reveal)}, (_, i) => {
      const v = random(`${seed}-${i}-${tick}`);
      const hh = (0.12 + Math.pow(v, 2.2) * 0.88) * h;
      return <line key={i} x1={(i / count) * w} x2={(i / count) * w} y1={-hh / 2} y2={hh / 2} />;
    })}
  </g>
);

export const HangBars: React.FC<XY & {w: number; h: number; count: number; seed: string; tick: number}> = ({x, y, w, h, count, seed, tick}) => {
  const bw = (w / count) * 0.45;
  return (
    <g transform={at(x, y)} fill={WHITE}>
      <rect width={w} height={4} />
      {Array.from({length: count}, (_, i) => {
        const v = random(`${seed}-${i}-${Math.floor(tick / 2)}`);
        return <rect key={i} x={(i / count) * w} y={0} width={bw} height={h * (0.25 + v * 0.75)} />;
      })}
    </g>
  );
};

export const LineChart: React.FC<XY & {w: number; h: number; step: number; seed?: string; ms?: number}> = ({x, y, w, h, step, seed = 'lc', ms = 11}) => {
  const xs = [0.15, 0.55, 0.95].map((v) => v * w);
  const line = (k: number) => xs.map((_, i) => h * (0.15 + random(`${seed}-${k}-${i}-${step}`) * 0.7));
  const a = line(0);
  const b = line(1);
  return (
    <g transform={at(x, y)}>
      <g stroke={WHITE} strokeWidth={1.6} fill="none">
        <line x1={0} y1={0} x2={0} y2={h} />
        <line x1={0} y1={h} x2={w} y2={h} />
        <polyline points={xs.map((px, i) => `${px},${a[i]}`).join(' ')} />
        <polyline points={xs.map((px, i) => `${px},${b[i]}`).join(' ')} />
      </g>
      {[a, b].flatMap((ln, k) => xs.map((px, i) => <rect key={`${k}${i}`} x={px - ms / 2} y={ln[i] - ms / 2} width={ms} height={ms} fill={WHITE} />))}
      {[10, 8, 6, 4, 2, 0].map((n, i) => (
        <text key={n} x={-8} y={(i / 5) * h + 3} textAnchor="end" fill={WHITE} style={{fontFamily: MONO, fontSize: Math.max(8, h * 0.075)}}>
          {n}
        </text>
      ))}
    </g>
  );
};

export const PixelGridIcon: React.FC<XY & {cols: number; rows: number; cell: number; seed: string; tick?: number; mask?: string[]; sw?: number}> = ({x, y, cols, rows, cell, seed, tick = 0, mask, sw = 1.6}) => (
  <g transform={at(x, y)} fill="none" stroke={WHITE} strokeWidth={sw}>
    {Array.from({length: cols * rows}, (_, i) => {
      if (mask) {
        if (mask[Math.floor(i / cols)]?.[i % cols] !== '#') return null;
        return <rect key={i} x={(i % cols) * cell} y={Math.floor(i / cols) * cell} width={cell * 0.84} height={cell * 0.84} />;
      }
      const v = random(`${seed}-${i}-${Math.floor(tick / 3)}`);
      if (v < 0.3) return null;
      return <rect key={i} x={(i % cols) * cell} y={Math.floor(i / cols) * cell} width={cell * 0.78} height={cell * 0.78} fill={v > 0.9 ? WHITE : 'none'} />;
    })}
  </g>
);

/* ── Bands & shapes ──────────────────────────────────────── */

/** Stacked thick step-bands (right column of the sheet). */
export const StepStack: React.FC<XY & {w: number; n: number; pitch: number; sw: number; shift?: number}> = ({x, y, w, n, pitch, sw, shift = 0}) => (
  <g transform={at(x, y)} stroke={WHITE} strokeWidth={sw} fill="none" strokeLinejoin="miter">
    {Array.from({length: n}, (_, i) => {
      const d = pitch * 1.4;
      const mid = w * (0.35 + 0.08 * Math.sin(i * 0.9 + shift));
      return <polyline key={i} points={`0,${i * pitch} ${mid},${i * pitch} ${mid + d},${i * pitch + d} ${w},${i * pitch + d}`} />;
    })}
  </g>
);

/** Outlined parallel zigzag band. */
export const ZigBand: React.FC<XY & {w: number; h: number; n?: number; teeth?: number; phase?: number}> = ({x, y, w, h, n = 4, teeth = 7, phase = 0}) => (
  <g transform={at(x, y)} stroke={WHITE} strokeWidth={1.6} fill="none">
    {Array.from({length: n}, (_, k) => {
      const off = k * (h / (n * 1.6));
      const pts = Array.from({length: teeth * 2 + 1}, (_, i) => {
        const px = (i / (teeth * 2)) * w;
        const py = (i % 2 ? h * 0.55 : 0) + off + (i % 2 ? 0 : Math.sin(i + phase) * 2);
        return `${px},${py}`;
      }).join(' ');
      return <polyline key={k} points={pts} />;
    })}
  </g>
);

/** Rounded "blob" glyph built from thick round-capped strokes. */
export const BlobGlyph: React.FC<XY & {paths: string[]; sw: number}> = ({x, y, paths, sw}) => (
  <g transform={at(x, y)} stroke={WHITE} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {paths.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </g>
);

export const Protractor: React.FC<XY & {w: number; h: number; rot?: number; id: string}> = ({x, y, w, h, rot = 0, id}) => {
  const cx = w * 0.88;
  const cy = h * 0.5;
  return (
    <g transform={at(x, y)}>
      <defs>
        <clipPath id={id}>
          <rect width={w} height={h} />
        </clipPath>
      </defs>
      <rect width={w} height={h} fill={WHITE} />
      <g clipPath={`url(#${id})`} stroke="#000" strokeWidth={2} fill="none">
        {[0.35, 0.7, 1.05, 1.45].map((k) => (
          <circle key={k} cx={cx} cy={cy} r={h * k} />
        ))}
        {[-60, -30, 0, 30, 60].map((a) => {
          const r = ((a + rot + 180) * Math.PI) / 180;
          return <line key={a} x1={cx} y1={cy} x2={cx + Math.cos(r) * w * 1.5} y2={cy + Math.sin(r) * w * 1.5} />;
        })}
        <line x1={0} y1={cy} x2={w} y2={cy} />
      </g>
    </g>
  );
};

export const Pill: React.FC<XY & {w: number; h: number; text?: string; size?: number; sw?: number}> = ({x, y, w, h, text, size, sw = 3}) => (
  <g transform={at(x, y)}>
    <rect width={w} height={h} rx={h / 2} fill="none" stroke={WHITE} strokeWidth={sw} />
    {text !== undefined && (
      <text x={h * 0.45} y={h / 2} dominantBaseline="central" fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 700, fontSize: size ?? h * 0.55, letterSpacing: -0.5}}>
        {text}
      </text>
    )}
  </g>
);

export const CopyBlock: React.FC<XY & {w: number; h: number}> = ({x, y, w, h}) => {
  const lines = [
    'ALL GRAPHICS SUPPLIED AS PART OF THIS PACK ARE',
    'LICENSED FOR USE IN PERSONAL AND COMMERCIAL WORK.',
    'NO PART MAY BE RESOLD OR REDISTRIBUTED AS-IS, IN',
    'ANY FORM OR BY ANY MEANS, DIGITAL OR PRINTED,',
    'WITHOUT THE PRIOR WRITTEN PERMISSION OF THE STUDIO',
  ];
  return (
    <g transform={at(x, y)}>
      <rect width={w} height={h} rx={6} fill={WHITE} />
      <circle cx={h * 0.5} cy={h / 2} r={h * 0.32} fill="none" stroke="#000" strokeWidth={h * 0.08} />
      <path d={`M ${h * 0.58} ${h * 0.4} A ${h * 0.13} ${h * 0.13} 0 1 0 ${h * 0.58} ${h * 0.6}`} fill="none" stroke="#000" strokeWidth={h * 0.07} />
      {lines.map((l, i) => (
        <text key={i} x={h * 0.98} y={h * 0.2 + i * (h * 0.15)} fill="#000" textLength={w - h * 1.1} lengthAdjust="spacingAndGlyphs" style={{fontFamily: GROTESK, fontWeight: 700, fontSize: h * 0.12}}>
          {l}
        </text>
      ))}
    </g>
  );
};

export const Folder: React.FC<XY & {w: number; h: number; filled?: boolean; label?: string}> = ({x, y, w, h, filled, label}) => (
  <g transform={at(x, y)}>
    <path
      d={`M0 ${h * 0.15} L0 ${h} L${w} ${h} L${w} ${h * 0.25} L${w * 0.45} ${h * 0.25} L${w * 0.35} ${h * 0.05} L0 ${h * 0.05}Z`}
      fill={filled ? WHITE : 'none'}
      stroke={WHITE}
      strokeWidth={2}
    />
    {label && (
      <text x={w * 0.5} y={h * 0.7} textAnchor="middle" fill={filled ? '#000' : WHITE} style={{fontFamily: MONO, fontSize: h * 0.18, fontWeight: 700}}>
        {label}
      </text>
    )}
  </g>
);

export const Slider: React.FC<XY & {w: number; h: number; pos: number}> = ({x, y, w, h, pos}) => (
  <g transform={at(x, y)}>
    <rect width={w} height={h} rx={h / 2} fill="none" stroke={WHITE} strokeWidth={2} />
    {Array.from({length: 22}, (_, i) => (
      <line key={i} x1={h * 0.8 + i * ((w - h * 1.6) / 21)} x2={h * 0.8 + i * ((w - h * 1.6) / 21)} y1={h * 0.3} y2={h * 0.7} stroke={WHITE} strokeWidth={1.4} />
    ))}
    <circle cx={h / 2 + pos * (w - h)} cy={h / 2} r={h * 0.55} fill="#161616" stroke={WHITE} strokeWidth={2.5} />
  </g>
);

/** "New edition" product strip with a geometric arrow+D mark. */
export const EditionBar: React.FC<
  XY & {w: number; h: number; label: string; caption: string; hideLabel?: (i: number) => boolean; hideCaption?: (i: number) => boolean; flip?: boolean}
> = ({x, y, w, h, label, caption, hideLabel = () => false, hideCaption = () => false, flip = false}) => {
  const u = h * 0.16;
  const fs = h * 0.3;
  return (
    <g transform={at(x, y)}>
      <text y={-h * 0.18} fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 700, fontSize: fs, letterSpacing: -0.5}}>
        {Array.from(label).map((c, i) => (
          <tspan key={i} fillOpacity={hideLabel(i) ? 0 : 1}>
            {c}
          </tspan>
        ))}
      </text>
      <path d={`M0 0 H${w} V${h - u} L${w - u} ${h} H0Z`} fill={WHITE} />
      {/* arrow ↙ */}
      <g transform={`translate(${u * 6} ${flip ? u * 5.4 : u}) scale(-1 ${flip ? -1 : 1})`} fill="#000">
        <polygon points={`${u * 4},0 ${u * 5},${u} ${u * 2.4},${u * 3.6} ${u * 4},${u * 3.6} ${u * 4},${u * 4.4} 0,${u * 4.4} 0,${u * 0.6} ${u * 0.8},${u * 0.6} ${u * 0.8},${u * 2.9}`} />
      </g>
      {/* D */}
      <path
        transform={`translate(${u * 7} ${u})`}
        fillRule="evenodd"
        d={`M0 0 H${u * 3.4} L${u * 4.6} ${u * 1.2} V${u * 3.2} L${u * 3.4} ${u * 4.4} H0Z M${u * 1.4} ${u * 1.3} V${u * 3.1} H${u * 2.9} V${u * 1.3}Z`}
        fill="#000"
      />
      <circle cx={w - u * 1.6} cy={u * 1.4} r={u * 0.75} fill="none" stroke="#000" strokeWidth={u * 0.22} />
      <text x={w - u * 1.6} y={u * 1.45} textAnchor="middle" dominantBaseline="central" fill="#000" style={{fontFamily: GROTESK, fontWeight: 800, fontSize: u}}>
        R
      </text>
      <text x={u * 0.6} y={h + fs * 1.25} textLength={w - u * 1.2} lengthAdjust="spacing" fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 700, fontSize: fs * 0.95}}>
        {Array.from(caption).map((c, i) => (
          <tspan key={i} fillOpacity={hideCaption(i) ? 0 : 1}>
            {c}
          </tspan>
        ))}
      </text>
    </g>
  );
};

/** Condensed outline lettering, squeezed with textLength. */
export const CondensedOutline: React.FC<XY & {lines: string[]; w: number; size: number}> = ({x, y, lines, w, size}) => (
  <g transform={at(x, y)}>
    {lines.map((l, i) => (
      <text
        key={i}
        y={size * 0.82 * (i + 1)}
        textLength={w}
        lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke={WHITE}
        strokeWidth={1.4}
        style={{fontFamily: GROTESK, fontWeight: 800, fontSize: size}}
      >
        {l}
      </text>
    ))}
  </g>
);

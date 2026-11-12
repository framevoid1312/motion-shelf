import React from 'react';
import {random} from 'remotion';
import {BRAND} from '../brand';
import {GROTESK, MONO, SHEET_BG, WHITE} from '../theme';
import {CopyrightRing, Crosshair, Dumbbell, EyeIcon, Flower, Hatch, LineChart, PixelGridIcon, Sparkle, StarBurst, Waveform, WireGlobe, WwwBadge} from './Icons';
import {PixelGlyph, seededGlyph} from './Pixel';

/*
 * The climax sheet. 810 × 810 design space; every coordinate below was measured
 * from the reference frame (sheet spans 104 → 976 px at 1080). Driven by the
 * shot clock so elements keep flickering, typing and ticking while it holds.
 */

type R = [number, number, number, number];
/** Rounded-bar micro glyphs (row 1). Two variants each, swapped on 1/8 notes. */
const MICRO: {fill: boolean; v: R[][]}[] = [
  {fill: true, v: [
    [[30, 22, 40, 11], [24, 40, 52, 11], [62, 46, 24, 11], [38, 61, 34, 11]],
    [[26, 22, 48, 11], [40, 40, 44, 11], [26, 58, 24, 11], [58, 58, 38, 11]],
  ]},
  {fill: false, v: [
    [[150, 22, 38, 11], [118, 40, 26, 22], [148, 40, 46, 11], [150, 60, 30, 11]],
    [[120, 22, 30, 11], [140, 38, 52, 11], [118, 56, 40, 14], [166, 58, 26, 11]],
  ]},
  {fill: true, v: [
    [[212, 22, 32, 11], [212, 22, 11, 40], [232, 44, 18, 11], [256, 50, 34, 11], [270, 38, 11, 26]],
    [[222, 24, 46, 11], [212, 40, 32, 11], [250, 48, 11, 22], [260, 60, 30, 11]],
  ]},
  {fill: false, v: [
    [[305, 40, 24, 26], [316, 58, 24, 11], [340, 22, 38, 11], [358, 30, 11, 40]],
    [[310, 24, 42, 11], [305, 44, 30, 11], [346, 44, 11, 26], [360, 60, 24, 11]],
  ]},
];

const COPY_LINES = [
  'ALL GRAPHICS SUPPLIED AS PART OF THIS PACK ARE LICENSED',
  'FOR USE IN PERSONAL AND COMMERCIAL WORK. NO PART MAY BE',
  'RESOLD OR REDISTRIBUTED AS-IS, IN ANY FORM OR BY ANY',
  'MEANS, DIGITAL OR PRINTED, WITHOUT THE PRIOR WRITTEN',
  'PERMISSION OF THE STUDIO, EXCEPT IN THE CASE OF BRIEF',
  'QUOTATIONS EMBODIED IN CRITICAL REVIEWS AND PREVIEWS',
];

const txt = (size: number, weight = 700): React.CSSProperties => ({fontFamily: GROTESK, fontWeight: weight, fontSize: size});

export const LockupSheet: React.FC<{t: number; tick: number; step: number; size?: number}> = ({t, tick, step, size = 872}) => {
  const eighth = Math.floor(step / 2);
  const typed = Math.max(0, Math.min(1, (t - 0.875) / 0.45));
  const tag = BRAND.tagline.slice(0, Math.round(BRAND.tagline.length * typed));
  const flick = (k: string) => (i: number) => random(`${k}-${i}-${tick}`) < 0.18;
  const sup = (s: string, n: string, yy: number) => (
    <text key={s} x={708} y={yy} fill={WHITE} style={{...txt(23), letterSpacing: -0.7}}>
      {s}
      <tspan dy={-9} dx={1} style={{fontSize: 12}}>
        {n}
      </tspan>
    </text>
  );

  // protractor
  const PX = 25, PY = 85, PW = 225, PH = 155, PCX = 240, PCY = 163;
  // tube band (row 2)
  const tube = (x: number) => `${x},162 ${x + 8},162 ${x + 8},182 ${x + 40},214 ${x + 40},238 ${x + 32},238 ${x + 32},216 ${x},184`;
  // edition bar geometry
  const EX = 372, EY = 477, EW = 301, EH = 47, u = EH * 0.16;

  return (
    <svg width={size} height={size} viewBox="0 0 810 810">
      <rect width={810} height={810} fill={SHEET_BG} />

      {/* ── row 1 ── */}
      {MICRO.map((g, k) => {
        const v = g.v[(eighth + k) % 2];
        return (
          <g key={k} fill={g.fill ? WHITE : 'none'} stroke={g.fill ? 'none' : '#cfcfcf'} strokeWidth={1.6}>
            {v.map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx={Math.min(w, h) / 2} />
            ))}
          </g>
        );
      })}
      {[410, 433, 457].flatMap((x) => [34, 58].map((y) => <Sparkle key={`${x}${y}`} x={x} y={y} r={9} />))}
      <Flower x={507} y={47} r={25} />
      <EyeIcon x={593} y={47} w={90} r={23} />
      <circle cx={593} cy={47} r={7} fill="none" stroke={WHITE} strokeWidth={3} />
      <circle cx={593} cy={47} r={2.5} fill={WHITE} />
      <g fill={WHITE}>
        {Array.from({length: 20}, (_, i) => {
          const x = 650 + (i % 4) * 13.5;
          const y = 22 + Math.floor(i / 4) * 10.2;
          return <polygon key={i} points={`${x},${y} ${x + 11},${y} ${x},${y + 8}`} />;
        })}
        {Array.from({length: 20}, (_, i) => (
          <circle key={`d${i}`} cx={722 + (i % 5) * 11.2} cy={27 + Math.floor(i / 5) * 12.5} r={4.5} />
        ))}
      </g>

      {/* ── row 2 ── */}
      <defs>
        <clipPath id="pro-clip">
          <rect x={PX} y={PY} width={PW} height={PH} />
        </clipPath>
      </defs>
      <rect x={PX} y={PY} width={PW} height={PH} fill={WHITE} />
      <g clipPath="url(#pro-clip)" fill="none" stroke="#000" strokeWidth={1.8}>
        {Array.from({length: 8}, (_, i) => (
          <line key={i} x1={PX + 25 + i * 25} x2={PX + 25 + i * 25} y1={PY} y2={PY + PH} stroke="#c8c8c8" strokeWidth={1} />
        ))}
        {[58, 108, 156].map((r) => (
          <circle key={r} cx={PCX} cy={PCY} r={r} />
        ))}
        {[-62, -38, -14, 14, 38, 62].map((a) => {
          const rad = ((a + 180 + (step % 4) * 2) * Math.PI) / 180;
          return <line key={a} x1={PCX} y1={PCY} x2={PCX + Math.cos(rad) * 400} y2={PCY + Math.sin(rad) * 400} />;
        })}
        <line x1={PX} y1={PCY} x2={PCX} y2={PCY} />
      </g>
      {[272, 355, 408, 490, 543].map((x, k) => (
        <PixelGlyph key={k} rows={seededGlyph(`pw${k}-${Math.floor(step / 3)}`, 5, 5, 0.55)} cell={10.6} x={x} y={92} center={false} />
      ))}
      <g fill="none" stroke="#d8d8d8" strokeWidth={1.5} strokeLinejoin="round">
        {Array.from({length: 14}, (_, i) => (
          <polygon key={i} points={tube(278 + i * 21.5 + (step % 2) * 2)} />
        ))}
      </g>
      <WwwBadge x={730} y={160} r={54} globe={59} rot={t * 2} sw={4} />

      {/* ── tagline + tags + step stack ── */}
      <rect x={22} y={255} width={583} height={46} rx={23} fill="none" stroke={WHITE} strokeWidth={3} />
      <text x={43} y={279} dominantBaseline="central" fill={WHITE} style={txt(27)} textLength={tag.length ? (542 * tag.length) / BRAND.tagline.length : undefined} lengthAdjust="spacingAndGlyphs">
        {tag}
      </text>
      <g>
        <polygon points="622,253 632.5,244 643,253 643,273 632.5,266 622,273" fill={WHITE} />
        <g stroke="#000" strokeWidth={2.4} fill="none">
          <line x1={632.5} y1={252} x2={632.5} y2={265} />
          <polyline points="627,257 632.5,251 638,257" />
        </g>
        <polygon points="656,253 666.5,244 677,253 677,273 666.5,266 656,273" fill="none" stroke={WHITE} strokeWidth={1.6} />
        <g stroke={WHITE} strokeWidth={2.4} fill="none">
          <line x1={666.5} y1={252} x2={666.5} y2={265} />
          <polyline points="661,257 666.5,251 672,257" />
        </g>
      </g>
      <defs>
        <clipPath id="stack-clip">
          <rect x={702} y={226} width={78} height={322} />
        </clipPath>
      </defs>
      <g clipPath="url(#stack-clip)" stroke={WHITE} strokeWidth={10} fill="none" strokeLinejoin="miter">
        {Array.from({length: 21}, (_, i) => {
          const y = 222 + i * 16.5;
          const d = 18;
          const mid = 726 + 9 * Math.sin(i * 0.55 + step * 0.35);
          return <polyline key={i} points={`700,${y + d} ${mid},${y + d} ${mid + d},${y} 782,${y}`} />;
        })}
      </g>

      {/* ── copy block + hanging bars ── */}
      <rect x={25} y={312} width={335} height={62} rx={6} fill={WHITE} />
      <circle cx={52} cy={343} r={19} fill="none" stroke="#000" strokeWidth={5} />
      <path d="M 58 334 A 11 11 0 1 0 58 352" fill="none" stroke="#000" strokeWidth={4.5} />
      {COPY_LINES.map((l, i) => (
        <text key={i} x={92} y={322.5 + i * 8.9} textLength={260} lengthAdjust="spacingAndGlyphs" fill="#000" style={txt(7.6)}>
          {l}
        </text>
      ))}
      <g fill={WHITE}>
        <rect x={373} y={312} width={297} height={3.5} />
        {Array.from({length: 48}, (_, i) => {
          const v = random(`hb-${i}-${Math.floor(tick / 2)}`);
          return <rect key={i} x={373 + i * 6.2} y={312} width={3.4} height={62 * (0.3 + v * 0.7)} />;
        })}
      </g>

      {/* ── pixel grids + waveform ── */}
      {[22, 112, 205, 297].map((x, k) => (
        <PixelGridIcon key={k} x={x} y={386} cols={6} rows={5} cell={11.2} seed={`pg${k}`} tick={tick} sw={1.4} />
      ))}
      <Waveform x={373} y={412} w={297} h={36} count={60} seed="wv" tick={tick} sw={1.5} />

      {/* ── chart + files + edition ── */}
      <LineChart x={47} y={467} w={168} h={76} step={step} ms={6} />
      <g>
        <path d="M234 465 L234 500 L292 500 L292 470 L262 470 L256 461 L234 461Z" fill={WHITE} />
        <text x={263} y={491} textAnchor="middle" fill="#000" style={{fontFamily: MONO, fontSize: 8, fontWeight: 700, fontStyle: 'italic'}}>
          FILE
        </text>
        <path d="M298 465 L298 500 L356 500 L356 470 L326 470 L320 461 L298 461Z" fill="none" stroke={WHITE} strokeWidth={1.8} />
        <text x={327} y={491} textAnchor="middle" fill={WHITE} style={{fontFamily: MONO, fontSize: 8, fontWeight: 700, fontStyle: 'italic'}}>
          FILE
        </text>
        <polygon points="240,506 274,506 274,540 268,546 234,546 234,512" fill="none" stroke={WHITE} strokeWidth={1.8} />
        <polygon points="286,506 318,506 318,540 312,546 280,546 280,512" fill={WHITE} />
      </g>
      <text x={EX} y={EY - 7} fill={WHITE} style={{...txt(19), letterSpacing: -0.4}}>
        {Array.from(BRAND.edition).map((c, i) => (
          <tspan key={i} fillOpacity={flick('nl')(i) ? 0 : 1}>
            {c}
          </tspan>
        ))}
      </text>
      <path d={`M${EX} ${EY} H${EX + EW} V${EY + EH - u} L${EX + EW - u} ${EY + EH} H${EX}Z`} fill={WHITE} />
      <g transform={`translate(${EX + u * 6} ${EY + u}) scale(-1 1)`} fill="#000">
        <polygon points={`${u * 4},0 ${u * 5},${u} ${u * 2.4},${u * 3.6} ${u * 4},${u * 3.6} ${u * 4},${u * 4.4} 0,${u * 4.4} 0,${u * 0.6} ${u * 0.8},${u * 0.6} ${u * 0.8},${u * 2.9}`} />
      </g>
      <path
        transform={`translate(${EX + u * 7} ${EY + u})`}
        fillRule="evenodd"
        d={`M0 0 H${u * 3.4} L${u * 4.6} ${u * 1.2} V${u * 3.2} L${u * 3.4} ${u * 4.4} H0Z M${u * 1.4} ${u * 1.3} V${u * 3.1} H${u * 2.9} V${u * 1.3}Z`}
        fill="#000"
      />
      <circle cx={EX + EW - 19} cy={EY + 12} r={7.5} fill="none" stroke="#000" strokeWidth={1.6} />
      <text x={EX + EW - 19} y={EY + 12.5} textAnchor="middle" dominantBaseline="central" fill="#000" style={txt(9, 800)}>
        R
      </text>
      <text x={EX + 6} y={EY + EH + 20} textLength={EW - 12} lengthAdjust="spacing" fill={WHITE} style={txt(16)}>
        {Array.from(BRAND.copyright).map((c, i) => (
          <tspan key={i} fillOpacity={flick('nc')(i) ? 0 : 1}>
            {c}
          </tspan>
        ))}
      </text>

      {/* ── badges row ── */}
      <text x={27} y={655} textLength={195} lengthAdjust="spacingAndGlyphs" fill={WHITE} stroke={SHEET_BG} strokeWidth={1.3} style={txt(134, 800)}>
        DESIGN IN PROGRESS
      </text>
      <StarBurst x={257} y={595} r={25} />
      <rect x={297} y={560} width={113} height={48} rx={24} fill="none" stroke={WHITE} strokeWidth={2.5} />
      <WireGlobe x={322} y={584} r={17} sw={2} rot={t * 1.5} />
      <g fill={WHITE}>
        <path d="M345 574 q8 -6 14 0 l-2 8 q-6 4 -10 -2z" />
        <path d="M356 586 q5 0 6 6 l-3 9 q-4 -6 -3 -15z" />
        <path d="M366 572 q10 -4 18 0 q6 4 2 9 l-8 2 q-2 6 -6 4 q-6 -6 -6 -15z" />
        <path d="M384 592 q6 -2 8 3 l-4 4 q-4 -2 -4 -7z" />
      </g>
      <text x={353} y={569} textAnchor="middle" fill={WHITE} style={txt(5.5)}>
        INTERNATIONAL
      </text>
      <text x={353} y={604} textAnchor="middle" fill={WHITE} style={txt(5.5)}>
        RECOGNITION
      </text>
      <g>
        <circle cx={448} cy={585} r={25} fill="none" stroke={WHITE} strokeWidth={2} />
        <path d="M430 572 q8 -10 20 -6 q4 8 -4 12 q-6 2 -6 10 q-6 2 -10 -6z M452 590 q10 -4 16 2 q-2 10 -10 12 q-6 -4 -6 -14z M458 566 q6 -2 10 4 l-6 2z" fill={WHITE} />
      </g>
      <Hatch x={490} y={560} w={120} h={54} n={7} id="sheet-hatch" offset={step * 4} rx={6} />
      <CopyrightRing x={668} y={588} r={29} spin={t * 70} id="sheet-ring" />
      {sup('Three', '3', 576)}
      {sup('Six', '6', 599)}
      {sup('Five', '5', 622)}

      {/* ── merch row ── */}
      <g fill="none" stroke={WHITE} strokeWidth={2.4}>
        <circle cx={253} cy={637} r={16.5} />
        <ellipse cx={285} cy={637} rx={11} ry={16.5} />
        <circle cx={317} cy={637} r={16.5} />
      </g>
      {[['3', 253], ['6', 285], ['5', 317]].map(([d, x]) => (
        <text key={d} x={x as number} y={638} textAnchor="middle" dominantBaseline="central" fill={WHITE} style={txt(21)}>
          {d}
        </text>
      ))}
      <rect x={343} y={623} width={123} height={29} fill="none" stroke={WHITE} strokeWidth={1.5} />
      <line x1={343} x2={466} y1={637.5} y2={637.5} stroke={WHITE} strokeWidth={1.5} />
      <text x={347} y={634} fill={WHITE} textLength={115} lengthAdjust="spacingAndGlyphs" style={txt(8)}>
        OFFICIAL MERCHANDISE — 365
      </text>
      <text x={347} y={648.5} fill={WHITE} textLength={115} lengthAdjust="spacingAndGlyphs" style={txt(8)}>
        MADE IN THE STUDIO, VOL. 3
      </text>
      <Dumbbell x={511} y={640} w={59} r={9.5} neck={5 + Math.abs(Math.sin(t * 9)) * 5} id="sheet-db" />
      <Crosshair x={617} y={640} w={114} spread={16 + (step % 2) * 2} sw={1.8} />
      <g fill={WHITE}>
        {(eighth % 2
          ? [[715, 627], [741, 627], [688, 640], [728, 640], [768, 640]]
          : [[702, 627], [741, 627], [688, 640], [715, 640], [768, 640]]
        ).map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={13.3} height={13.3} />
        ))}
      </g>
      <g fill={WHITE}>
        {Array.from({length: 30}, (_, i) => {
          const r = random(`tk-${i}`);
          if (r < 0.45) return null;
          return <rect key={i} x={490 + i * 9.8} y={665} width={2} height={8} />;
        })}
        <rect x={626} y={694} width={9} height={2} />
      </g>

      {/* ── footer utilities ── */}
      <rect x={28} y={664} width={100} height={28} fill="none" stroke={WHITE} strokeWidth={1.4} />
      <line x1={48} x2={48} y1={664} y2={692} stroke={WHITE} strokeWidth={1.4} />
      <StarBurst x={38} y={678} r={7} points={12} />
      <text x={54} y={675} fill={WHITE} style={txt(7.5)}>
        VOL. 03 — 2026
      </text>
      <text x={54} y={687} fill={WHITE} style={txt(7.5, 500)}>
        Assembled in-house
      </text>
      <rect x={145} y={665} width={197} height={28} rx={14} fill={WHITE} />
      <g stroke="#000" strokeWidth={1.3}>
        {Array.from({length: 40}, (_, i) => (
          <line key={i} x1={162 + i * 4.1} x2={162 + i * 4.1} y1={672} y2={686} />
        ))}
      </g>
      <circle cx={170 + (0.5 + 0.38 * Math.sin(t * 3)) * 150} cy={679} r={12} fill={WHITE} stroke={SHEET_BG} strokeWidth={2.4} />
      <circle cx={170 + (0.5 + 0.38 * Math.sin(t * 3)) * 150} cy={679} r={14.5} fill="none" stroke={WHITE} strokeWidth={1.2} />
      <circle cx={382} cy={679} r={16} fill="none" stroke={WHITE} strokeWidth={2.2} />
      <g fill="none" stroke={WHITE} strokeWidth={1.8}>
        <circle cx={427} cy={679} r={17} />
        <circle cx={451} cy={679} r={17} />
      </g>
      <text x={439} y={680} textAnchor="middle" dominantBaseline="central" fill={WHITE} style={txt(8)}>
        COLLAB
      </text>

      {/* ── title block ── */}
      <text x={24} y={752} fill={WHITE} style={{...txt(43.5, 800), letterSpacing: -1.6}}>
        LOCKUP
      </text>
      <text x={24} y={787} fill={WHITE} style={{...txt(43.5, 800), letterSpacing: -1.6}}>
        IN MOTION
      </text>
      <text x={276} y={787} fill={WHITE} style={{fontFamily: MONO, fontSize: 7}}>
        {`${BRAND.studio.toUpperCase()} × ${BRAND.partner} DESIGN`}
      </text>
      <text x={490} y={787} fill={WHITE} style={{fontFamily: MONO, fontSize: 7}}>
        {BRAND.volume}
      </text>
      <circle cx={747} cy={750} r={33} fill="none" stroke={WHITE} strokeWidth={5} />
      <text x={747} y={752} textAnchor="middle" dominantBaseline="central" fill={WHITE} style={txt(46)}>
        3
      </text>
    </svg>
  );
};

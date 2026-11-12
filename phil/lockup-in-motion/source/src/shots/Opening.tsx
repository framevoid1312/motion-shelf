import React from 'react';
import {random} from 'remotion';
import {Abs, Shot, Svg} from '../components/Layout';
import {CHECKERS, PixelGlyph, QUERY} from '../components/Pixel';
import {EarthSolid, Hatch} from '../components/Icons';
import {Streaks, TexturePanel} from '../components/Texture';
import {ScrambleText, TypeOn} from '../components/Type';
import {BRAND} from '../brand';
import {grotesk, mono, WHITE} from '../theme';
import {stepped, useShot} from '../timing';

/** Headline size/weight measured from the reference (cap height ≈ 105 px). */
const WORD = 145;
const word = {...grotesk(WORD, 500), letterSpacing: -0.035 * WORD};
const COL = 241; // left edge of the headline words in the reference
const SPEC = 'LOCKUP IN MOTION\n50 BESPOKE MOTION ASSETS\n20 —@0';

/* 0.000 → 0.500 · grey pixel checker flicker */
export const PixelBlocks: React.FC = () => {
  const {tick} = useShot();
  const rows = CHECKERS[Math.floor(random(`pb-${tick}`) * CHECKERS.length)];
  return (
    <Shot>
      <Svg>
        <PixelGlyph rows={rows} cell={64} x={540} y={540} />
      </Svg>
    </Shot>
  );
};

/* 0.500 → 1.1875 · logotype glyphs jump on the 1/16 grid, then settle */
export const StudioLetters: React.FC = () => {
  const {t, on, step} = useShot();
  const glyphs = Array.from(BRAND.mark);
  const appearAt = [0, 0.0625, 0.125, 0.1875];
  const settled = t >= 0.4375;
  return (
    <Shot>
      <Svg>
        {on(0.375, 0.5) && <Streaks x={300} y={130} w={480} h={46} n={2} seed="so" />}
        {on(0.5) && <TexturePanel x={290} y={300} w={500} h={480} seed="so-p" bright={3} />}
      </Svg>
      {on(0.125) && (
        <Abs x={227} y={146} anchor="tl" style={mono(11)}>
          <ScrambleText text={'LOCKUP IN MOTION\n50 BESPOKE MOTION'} start={0.125} seed="so-l" stagger={0.006} hold={0.05} />
        </Abs>
      )}
      <Abs x={540} y={540}>
        <div style={{display: 'flex', alignItems: 'flex-start', ...grotesk(148, 500), letterSpacing: -4}}>
          {glyphs.map((c, i) => {
            const shown = t >= (appearAt[i] ?? 0.2);
            const r = random(`st-${i}-${step}`);
            const dy = settled ? 0 : [-62, 0, 0, 58][Math.floor(r * 4)];
            const blur = i === 0 && t < 0.0625;
            if (c === '-') {
              return (
                <span key={i} style={{display: 'inline-block', width: 34, visibility: shown ? 'visible' : 'hidden', transform: `translateY(${dy}px)`}}>
                  <span style={{display: 'block', marginTop: 46, height: 11, background: WHITE}} />
                </span>
              );
            }
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  visibility: shown ? 'visible' : 'hidden',
                  transform: `translateY(${dy}px)`,
                  filter: blur ? 'blur(7px)' : undefined,
                  opacity: blur ? 0.7 : 1,
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
      </Abs>
    </Shot>
  );
};

/* 1.1875 → 1.375 · thin ring, streak, pixel glyph drops in */
export const RingGlyph: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      <Svg>
        {on(0, 0.0625) && <Streaks x={300} y={300} w={300} h={40} n={2} seed="rg" />}
        <circle cx={540} cy={540} r={275} fill="none" stroke={WHITE} strokeWidth={2.5} />
        {on(0.0625) && <PixelGlyph rows={QUERY} cell={50} x={540} y={540} />}
      </Svg>
    </Shot>
  );
};

/* 1.375 → 1.6875 · portrait panel + glyph, then a hairline */
export const PanelGlyph: React.FC = () => {
  const {on, step} = useShot();
  return (
    <Shot>
      <Svg>
        <TexturePanel x={0} y={120} w={580} h={780} seed="pg" />
        {on(0, 0.25) && (
          <PixelGlyph rows={step % 2 ? ['.###.', '##...', '#.###', '#..#.', '.#..#'] : ['.###', '###.', '.##.', '..#.']} cell={44} x={520} y={540} />
        )}
        {on(0.25) && <line x1={100} x2={960} y1={572} y2={572} stroke={WHITE} strokeWidth={2} />}
      </Svg>
      <Abs x={700} y={620} anchor="l" style={mono(10)}>
        <ScrambleText text={'STUDIO 1.0FR — 20.10\nLAT 52.52 / 13.40'} seed="pg-l" stagger={0.006} hold={0.05} />
      </Abs>
    </Shot>
  );
};

/* 1.6875 → 2.1875 · light streaks, earth pops, white block, then the hatch */
export const StreakGlobe: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      <Svg>
        {on(0, 0.3125) && <Streaks x={-40} y={520} w={1160} h={120} n={3} seed="sg" />}
        {on(0.125, 0.3125) && <EarthSolid x={470} y={455} r={130} />}
        {on(0.1875, 0.3125) && <rect x={520} y={430} width={430} height={440} fill={WHITE} />}
        {on(0.3125, 0.375) && <TexturePanel x={0} y={380} w={1080} h={290} seed="sg-p" bright={2} />}
        {on(0.3125, 0.375) && <Streaks x={-40} y={520} w={1160} h={100} n={3} seed="sg2" />}
        {on(0.3125) && <Hatch x={455} y={325} w={330} h={150} n={7} id="sg-h" />}
      </Svg>
      {on(0.3125) && (
        <Abs x={232} y={620} anchor="l" style={mono(9)}>
          51.50° N, 0.12° W
        </Abs>
      )}
    </Shot>
  );
};

/* 2.1875 → 2.6875 · L · LO · LOCK · LOCKU · LOCKUP (overline on L) */
export const LockupWord: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      <Svg>{on(0, 0.3125) && <TexturePanel x={432} y={108} w={508} h={810} seed="lw" bright={on(0.125) ? 1.4 : 0.9} />}</Svg>
      {on(0.0625, 0.125) && <div style={{position: 'absolute', left: 430, top: 300, width: 100, height: 100, background: WHITE}} />}
      <Abs x={227} y={232} anchor="tl" style={mono(10)}>
        <ScrambleText text="AFTER EFFECTS AEE7F B35=" seed="lw-l" start={0.06} stagger={0.006} hold={0.05} />
      </Abs>
      <Abs x={COL} y={540} anchor="l">
        <TypeOn text={'LOCKUP'} interval={0.075} overline={0} overlineFrom={0.12} style={word} />
      </Abs>
      {on(0.4375) && <div style={{position: 'absolute', left: 247, top: 632, width: 11, height: 11, background: WHITE}} />}
    </Shot>
  );
};

/* 2.6875 → 3.15625 · IN — streak, panel flash, inverted block */
export const InWord: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      <Svg>
        {on(0.0625, 0.1875) && <Streaks x={240} y={330} w={260} h={50} n={2} seed="in" />}
        {on(0.1875, 0.375) && <TexturePanel x={130} y={270} w={500} h={510} seed="in-p" bright={2.4} />}
        {on(0.1875) &&
          Array.from({length: 28}, (_, i) => (
            <rect key={i} x={360 + i * 20} y={600} width={2} height={i % 4 ? 6 : 12} fill={WHITE} opacity={i % 3 === 1 ? 0 : 1} />
          ))}
        {on(0.375) && <rect x={COL} y={486} width={410} height={4} fill={WHITE} />}
      </Svg>
      <Abs x={COL} y={540} anchor="l">
        <TypeOn text={'IN'} interval={0.02} overline={0} overlineFrom={0} style={word} />
      </Abs>
      {on(0.375) && <div style={{position: 'absolute', left: 230, top: 520, width: 380, height: 260, background: WHITE, mixBlendMode: 'difference'}} />}
      {on(0.375) && (
        <Abs x={227} y={216} anchor="tl" style={mono(10)}>
          {SPEC}
        </Abs>
      )}
    </Shot>
  );
};

/* 3.15625 → 3.5625 · MOTION, last letter blurred under an overline */
export const MotionWord: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      <Svg>{on(0.0625, 0.40625) && <TexturePanel x={110} y={500} w={540} h={290} seed="mo" bright={on(0.34375) ? 0.5 : 1} />}</Svg>
      {on(0, 0.34375) && (
        <Abs x={335} y={540} anchor="l">
          <TypeOn text={'MOTION'} interval={0.02} blurFor={0.4} overline={5} overlineFrom={0.06} style={word} />
        </Abs>
      )}
      <Abs x={227} y={216} anchor="tl" style={mono(10)}>
        {SPEC}
      </Abs>
      {on(0.125) && (
        <Abs x={862} y={636} anchor="r" style={mono(10)}>
          <ScrambleText text="SI-O /50 AE MOV AC@" start={0.125} seed="mo-l" stagger={0.006} hold={0.05} />
        </Abs>
      )}
      {on(0.21875, 0.34375) && <div style={{position: 'absolute', left: 232, top: 300, width: 56, height: 56, background: WHITE, filter: 'blur(6px)'}} />}
      {on(0.34375) && <div style={{position: 'absolute', left: 249, top: 318, width: 22, height: 22, background: WHITE}} />}
    </Shot>
  );
};

/* 3.5625 → 4.000 · breath — empty frame, a single dash */
export const Breath: React.FC = () => {
  const {on} = useShot();
  return <Shot>{on(0.3125) && <div style={{position: 'absolute', left: 506, top: 540, width: 22, height: 3, background: WHITE}} />}</Shot>;
};


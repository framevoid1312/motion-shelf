import React from 'react';
import {random} from 'remotion';
import {Abs, Shot, Svg} from '../components/Layout';
import {HOOK, INVADER, INVADER_B, PixelGlyph} from '../components/Pixel';
import {
  BlobGlyph,
  CopyrightRing,
  Crosshair,
  DotMatrix,
  Dumbbell,
  EditionBar,
  LineChart,
  Pill,
  PixelGridIcon,
  Waveform,
  WwwBadge,
} from '../components/Icons';
import {Streaks, TexturePanel} from '../components/Texture';
import {ScrambleText} from '../components/Type';
import {BRAND} from '../brand';
import {GROTESK, mono, WHITE} from '../theme';
import {stepped, useShot} from '../timing';

const Block: React.FC<{x: number; y: number; w: number; h: number; blur?: number}> = ({x, y, w, h, blur}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: WHITE, filter: blur ? `blur(${blur}px)` : undefined}} />
);
const L = 227; // left label column
const LABEL_Y = 369;
const LABEL = mono(30);
/** fast, reference-style decode for labels */

/* 4.000 → 4.250 · "50" with a sliding rule; the label starts setting */
export const Fifty: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      <Abs x={540} y={540} style={mono(96)}>
        <ScrambleText text="50" seed="ff" hold={0.05} stagger={0.02} />
      </Abs>
      {on(0.09375, 0.1875) && <Block x={243} y={540} w={165} h={2} />}
      {on(0.1875) && <Block x={640} y={540} w={165} h={2} />}
      {on(0.1875) && (
        <Abs x={L} y={LABEL_Y} anchor="tl" style={LABEL}>
          <ScrambleText text={BRAND.assets[0]} start={0.1875} seed="ff-l" stagger={0.002} hold={0.01} />
        </Abs>
      )}
    </Shot>
  );
};

/* 4.250 → 5.125 · spec labels set and re-set */
export const Bespoke: React.FC = () => {
  const {on} = useShot();
  const stacked = on(0.5625);
  return (
    <Shot>
      {!stacked && (
        <>
          <Abs x={L} y={LABEL_Y} anchor="tl" style={LABEL}>
            {BRAND.assets[0]}
          </Abs>
          <Abs x={508} y={LABEL_Y} anchor="tl" style={LABEL}>
            <ScrambleText text={BRAND.assets[1]} seed="b2" stagger={0.004} hold={0.03} />
          </Abs>
        </>
      )}
      {stacked && (
        <Abs x={L} y={LABEL_Y} anchor="tl" style={{...LABEL, lineHeight: 1.05}}>
          {`${BRAND.assets[0]}\n${BRAND.assets[1]}`}
        </Abs>
      )}
      {on(0, 0.125) && <Block x={462} y={540} w={156} h={2} />}
      {on(0.4375, 0.5625) && <Block x={L} y={497} w={162} h={2} />}
    </Shot>
  );
};

/* 5.125 → 5.875 · stepped white blocks (pure graphic beat) */
export const Blocks: React.FC = () => {
  const {t, on} = useShot();
  const f = (v: number) => v * 1080;
  const frames: [number, React.ReactNode][] = [
    [0, null],
    [0.0625, <Block key="a" x={f(0.23)} y={f(0.555)} w={f(0.135)} h={f(0.145)} />],
    [
      0.1875,
      <>
        <Block x={f(0.23)} y={f(0.5)} w={f(0.6)} h={f(0.13)} />
        <Block x={f(0.23)} y={f(0.6)} w={f(0.135)} h={f(0.1)} />
      </>,
    ],
    [
      0.25,
      <>
        <Block x={f(0.23)} y={f(0.5)} w={f(0.6)} h={f(0.13)} />
        <Block x={f(0.23)} y={f(0.6)} w={f(0.135)} h={f(0.1)} />
        <Block x={f(0.6)} y={f(0.27)} w={f(0.23)} h={f(0.33)} />
      </>,
    ],
    [
      0.375,
      <>
        <Abs x={243} y={f(0.545)} anchor="l" style={mono(88)}>
          50
        </Abs>
        <Block x={f(0.53)} y={f(0.5)} w={f(0.13)} h={f(0.13)} />
      </>,
    ],
    [
      0.5,
      <>
        <Block x={f(0.19)} y={f(0.28)} w={f(0.38)} h={f(0.12)} />
        <Block x={f(0.6)} y={f(0.38)} w={f(0.13)} h={f(0.12)} />
      </>,
    ],
    [
      0.5625,
      <>
        <Block x={f(0.19)} y={f(0.37)} w={f(0.39)} h={f(0.13)} />
        <Block x={f(0.6)} y={f(0.38)} w={f(0.13)} h={f(0.12)} />
      </>,
    ],
    [0.625, <Block key="z" x={f(0.18)} y={f(0.48)} w={f(0.39)} h={f(0.14)} blur={7} />],
  ];
  return (
    <Shot>
      {(on(0, 0.5) || on(0.5625, 0.625)) && (
        <Abs x={L} y={LABEL_Y} anchor="tl" style={{...LABEL, lineHeight: 1.05}}>
          {on(0.5625) ? BRAND.assets[0] : `${BRAND.assets[0]}\n${BRAND.assets[1]}`}
        </Abs>
      )}
      {stepped(t, frames)}
    </Shot>
  );
};

/* 5.875 → 6.875 · landscape panel, format label decodes, block hops */
export const Formats: React.FC = () => {
  const {t, on} = useShot();
  const sq = stepped<[number, number] | null>(t, [
    [0, null],
    [0.3125, [420, 378]],
    [0.4375, [552, 508]],
    [0.625, null],
  ]);
  return (
    <Shot>
      <Svg>{on(0, 0.4375) && <TexturePanel x={313} y={335} w={567} h={453} seed="fm" bright={1.2} />}</Svg>
      {sq && <Block x={sq[0]} y={sq[1]} w={140} h={135} />}
      <Abs x={L} y={702} anchor="l" style={mono(30)}>
        <ScrambleText text={BRAND.formats} seed="fm-l" stagger={0.035} hold={0.12} />
      </Abs>
    </Shot>
  );
};

/* 6.875 → 7.500 · WWW badge, a globe slides out from behind */
export const Www: React.FC = () => {
  const {t, on} = useShot();
  const g = stepped(t, [
    [0, 0],
    [0.1875, 22],
    [0.3125, 60],
    [0.4375, 100],
  ]);
  return (
    <Shot>
      <Svg>
        {on(0.375, 0.5625) && <TexturePanel x={300} y={290} w={480} h={130} seed="ww" bright={2} />}
        <WwwBadge x={540 + g / 2} y={540} r={140} globe={g} rot={t * 3} sw={8} />
      </Svg>
    </Shot>
  );
};

/* 7.500 → 7.6875 · bright texture cut, then a decoded stub */
export const FlashSi: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      <Svg>
        {on(0, 0.09375) && <TexturePanel x={290} y={290} w={500} h={500} seed="fs" bright={2.4} />}
        {on(0.09375) && <Streaks x={300} y={320} w={480} h={46} n={2} seed="fs2" />}
      </Svg>
      {on(0.09375) && (
        <Abs x={540} y={540} style={mono(80)}>
          SI&lt;
        </Abs>
      )}
    </Shot>
  );
};

/* 7.6875 → 8.0625 · Three³ / Six⁶ / Five⁵ stack (SVG for exact baselines) */
export const ThreeSixFive: React.FC = () => {
  const {on} = useShot();
  const size = 118;
  const line = (word: string, sup: string, y: number) => (
    <text x={340} y={y} fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 700, fontSize: size, letterSpacing: -0.025 * size}}>
      {word}
      <tspan dx={6} dy={-size * 0.4} style={{fontSize: size * 0.42}}>
        {sup}
      </tspan>
    </text>
  );
  return (
    <Shot>
      <Svg>
        {on(0.1875) && <TexturePanel x={0} y={470} w={930} h={270} seed="ts" bright={1.3} />}
        {line('Three', '3', 470)}
        {on(0.03, 0.0625) && (
          <text x={530} y={540} textAnchor="middle" fill={WHITE} style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 50}}>
            6
          </text>
        )}
        {on(0.0625) && line('Six', '6', 557)}
        {on(0.1875) && line('Five', '5', 692)}
      </Svg>
    </Shot>
  );
};

/* 8.0625 → 8.375 · chunky rounded glyphs morph */
const BLOBS = [
  ['M-160 60 L-160 0 L-40 0 L-40 60', 'M-40 0 L-40 -70 L40 -70', 'M90 -70 L90 60 L150 60'],
  ['M-170 70 L-170 10 L-70 10 L-70 70 L-170 70', 'M-10 70 L-10 -50', 'M-10 -10 L60 -10', 'M120 -70 L120 0'],
  ['M-130 70 L20 70 L20 -50', 'M20 -50 L90 -50 L90 0 L20 0'],
];
export const BlobMorph: React.FC = () => {
  const {t, on} = useShot();
  const k = Math.min(BLOBS.length - 1, Math.floor(t / 0.09375));
  return (
    <Shot>
      <Svg>
        {on(0, 0.1875) && <TexturePanel x={0} y={440} w={930} h={280} seed="ts" bright={1.1} />}
        <BlobGlyph x={540} y={540} paths={BLOBS[k]} sw={58} />
      </Svg>
    </Shot>
  );
};

/* 8.375 → 8.8125 · pills, then a line chart, over a portrait panel */
export const PillsChart: React.FC = () => {
  const {on, step} = useShot();
  return (
    <Shot>
      <Svg>
        <TexturePanel x={432} y={270} w={430} h={530} seed="pc" />
        {on(0, 0.125) && (
          <>
            <Pill x={340} y={395} w={150} h={46} sw={4} />
            <Pill x={350} y={510} w={44} h={140} sw={4} />
            <Pill x={410} y={630} w={170} h={46} sw={4} />
          </>
        )}
        {on(0.125) && <LineChart x={270} y={390} w={560} h={300} step={step} />}
      </Svg>
    </Shot>
  );
};

/* 8.8125 → 9.125 · two static outline pixel grids */
const GRID_A = ['######', '#.##.#', '######', '#.##.#', '######', '##..##'];
const GRID_B = ['##.##.', '#..###', '##.#..', '.###.#', '#.#.##', '###..#'];
export const Grids: React.FC = () => (
  <Shot>
    <Svg>
      <PixelGridIcon x={292} y={420} cols={6} rows={6} cell={34} seed="gA" mask={GRID_A} sw={2.4} />
      <PixelGridIcon x={540} y={420} cols={6} rows={6} cell={34} seed="gB" mask={GRID_B} sw={2.4} />
    </Svg>
  </Shot>
);

/* 9.125 → 9.375 · thin waveform draws out */
export const Wave: React.FC = () => {
  const {t, tick} = useShot();
  return (
    <Shot>
      <Svg>
        <Waveform x={205} y={540} w={680} h={70} count={64} seed="wf" tick={tick} sw={1.6} reveal={Math.min(1, 0.35 + t * 4)} />
      </Svg>
    </Shot>
  );
};

/* 9.375 → 9.5625 · decoder burst */
export const Decoder: React.FC = () => {
  const {on} = useShot();
  const st = {...mono(74), lineHeight: 1.18};
  return (
    <Shot>
      <Svg>{on(0.09375) && <TexturePanel x={120} y={498} w={850} h={120} seed="dc" bright={2} />}</Svg>
      <Abs x={195} y={400} anchor="tl" style={st}>
        <ScrambleText text={'50 BESPOKE'} seed="dc-1" hold={0.03} stagger={0.012} />
        {'\n'}
        {on(0.09375) && <ScrambleText text={'027.21 $66(76'} start={0.09375} seed="dc-2" hold={0.05} stagger={0.01} />}
        {'\n'}
        {on(0.09375) && <ScrambleText text={'$('} start={0.09375} seed="dc-3" hold={0.05} stagger={0.01} />}
      </Abs>
    </Shot>
  );
};

/* 9.5625 → 10.125 · gooey dumbbell */
export const Bone: React.FC = () => {
  const {t, on} = useShot();
  return (
    <Shot>
      <Svg>
        {on(0, 0.0625) && <TexturePanel x={200} y={470} w={760} h={140} seed="bn-p" bright={2} />}
        {on(0, 0.125) && <Streaks x={560} y={520} w={300} h={60} n={2} seed="bn" />}
        <Dumbbell x={540} y={540} w={380} r={56} neck={on(0, 0.0625) ? 4 : 22 + Math.abs(Math.sin(t * 7)) * 36} id="bone" />
      </Svg>
    </Shot>
  );
};

/* 10.125 → 10.6875 · NEW EDITION strip assembles letter by letter, mark flips */
export const Edition: React.FC = () => {
  const {t, on} = useShot();
  const p = Math.min(1, t / 0.45);
  const hide = (k: string) => (i: number) => random(`${k}-${i}`) > p;
  return (
    <Shot>
      <Svg>
        {on(0, 0.4375) ? (
          <TexturePanel x={432} y={130} w={508} h={820} seed="ed" bright={1.2} />
        ) : (
          <TexturePanel x={0} y={300} w={1080} h={470} seed="ed2" />
        )}
        <EditionBar
          x={227}
          y={490}
          w={627}
          h={100}
          label={BRAND.edition}
          caption={BRAND.copyright}
          hideLabel={hide('el')}
          hideCaption={hide('ec')}
          flip={t < 0.25}
        />
      </Svg>
      <Abs x={830} y={355} anchor="tl" style={mono(9)}>
        <ScrambleText text="52.52° N, 13.40° E" seed="ed-l" stagger={0.006} hold={0.05} />
      </Abs>
    </Shot>
  );
};

/* 10.6875 → 11.125 · © ring spins into place */
export const Ring: React.FC = () => {
  const {t, on} = useShot();
  const spin = stepped(t, [
    [0, -50],
    [0.0625, -28],
    [0.125, -12],
    [0.1875, 0],
  ]);
  return (
    <Shot>
      <Svg>
        {on(0, 0.1875) && <TexturePanel x={0} y={330} w={1080} h={420} seed="rn" bright={1.3} />}
        <CopyrightRing x={540} y={540} r={160} spin={spin} center={on(0.0625) ? 'c' : 'i'} id="ring-big" />
      </Svg>
    </Shot>
  );
};

/* 11.125 → 11.500 · pixel invader stutter */
export const Invader: React.FC = () => {
  const {t, on} = useShot();
  const rows = stepped(t, [
    [0, INVADER],
    [0.125, INVADER_B],
    [0.1875, HOOK],
  ]);
  return (
    <Shot>
      <Svg>
        {on(0.125, 0.25) && <TexturePanel x={540} y={380} w={540} h={290} seed="iv" bright={1.6} />}
        {on(0.1875, 0.3125) && <rect x={540} y={372} width={540} height={4} fill="#9a9a9a" />}
        {on(0, 0.3125) && <PixelGlyph rows={rows} cell={32} x={on(0.125) ? 560 : 540} y={540} />}
      </Svg>
    </Shot>
  );
};

/* 11.500 → 11.875 · registration crosshair opens */
export const Register: React.FC = () => {
  const {t, on} = useShot();
  const k = stepped(t, [
    [0, 0.4],
    [0.0625, 0.65],
    [0.125, 0.85],
    [0.25, 1],
  ]);
  return (
    <Shot>
      <Svg>
        {on(0.0625, 0.1875) && <TexturePanel x={0} y={420} w={540} h={240} seed="rg-p" bright={1.6} />}
        <Crosshair x={540} y={540} w={420 * k} spread={56 * k} sw={5} />
      </Svg>
    </Shot>
  );
};

/* 11.875 → 12.0625 · serial number stub (beat of black first) */
export const Serial: React.FC = () => {
  const {on} = useShot();
  return (
    <Shot>
      {on(0.125) && (
        <Abs x={205} y={378} anchor="tl" style={{...mono(96), lineHeight: 1.08}}>
          {'LOC794\n-2'}
        </Abs>
      )}
    </Shot>
  );
};

/* 12.0625 → 12.34375 · dot matrix on a tall panel */
export const Dots: React.FC = () => {
  const {tick} = useShot();
  return (
    <Shot>
      <Svg>
        <TexturePanel x={324} y={108} w={432} h={886} seed="dt" />
        <DotMatrix x={540} y={540} cols={5} rows={5} gap={62} r={19} seed="dm" tick={tick} />
      </Svg>
    </Shot>
  );
};

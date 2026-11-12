import React from 'react';
import {Abs, Shot, Svg} from '../components/Layout';
import {LockupSheet} from '../components/LockupSheet';
import {DotMatrix} from '../components/Icons';
import {PixelGlyph} from '../components/Pixel';
import {Streaks, TexturePanel} from '../components/Texture';
import {ScrambleText} from '../components/Type';
import {BRAND} from '../brand';
import {GROTESK, WHITE} from '../theme';
import {stepped, useShot} from '../timing';

/** Sheet placement measured from the reference: 104 → 976 px. */
const SHEET = {x: 104, y: 104, size: 872};

/* 12.375 → 15.375 · the lockup sheet: assembles, lives, flashes, inverts */
export const SheetShot: React.FC = () => {
  const {t, tick, step, on} = useShot();

  const clip = stepped(t, [
    [0, 'inset(48% 26% 4% 4%)'],
    [0.0625, 'inset(4% 4% 4% 40%)'],
    [0.125, 'inset(0% 0% 0% 0%)'],
  ]);
  const inverted = on(2.9375);
  const dim = on(1.5, 1.625) ? 0.62 : on(2.8125, 2.9375) ? 0.66 : 1;

  return (
    <Shot>
      <Svg>
        {on(0, 0.0625) && <TexturePanel x={324} y={0} w={432} h={420} seed="dt" />}
        {on(0, 0.0625) && <DotMatrix x={540} y={230} cols={5} rows={3} gap={62} r={19} seed="dm" tick={tick} />}
        {on(0.0625, 0.25) && <TexturePanel x={0} y={0} w={560} h={1080} seed="sh1" bright={1.2} />}
      </Svg>
      <div
        style={{
          position: 'absolute',
          left: SHEET.x,
          top: SHEET.y,
          clipPath: clip,
          opacity: dim,
          filter: inverted ? 'invert(0.9)' : undefined,
        }}
      >
        <LockupSheet t={t} tick={tick} step={step} size={SHEET.size} />
      </div>
      {/* partial overlays while it assembles */}
      {on(0.125, 0.3125) && (
        <Svg>
          <TexturePanel x={104} y={0} w={420} h={340} seed="sh2" bright={1.3} />
        </Svg>
      )}
      {on(0.0625, 0.125) && <div style={{position: 'absolute', left: 108, top: 590, width: 300, height: 290, background: WHITE}} />}
      {on(0.0625, 0.125) && <div style={{position: 'absolute', left: 650, top: 0, width: 330, height: 260, background: WHITE}} />}
      {/* mid-sheet glitch: grey corner → inverted window → white blocks */}
      {on(1.25, 1.3125) && <div style={{position: 'absolute', left: 104, top: 104, width: 290, height: 230, background: 'rgba(160,160,160,0.55)', mixBlendMode: 'screen'}} />}
      {on(1.3125, 1.4375) && <div style={{position: 'absolute', left: 205, top: 335, width: 670, height: 640, background: WHITE, mixBlendMode: 'difference'}} />}
      {on(1.4375, 1.5) && (
        <>
          <div style={{position: 'absolute', left: 200, top: 0, width: 660, height: 390, background: WHITE}} />
          <div style={{position: 'absolute', left: 110, top: 572, width: 300, height: 290, background: WHITE}} />
        </>
      )}
    </Shot>
  );
};

/* 15.375 → 15.500 · sheet gets chopped */
export const SheetChop: React.FC = () => {
  const {t, tick, step} = useShot();
  return (
    <Shot>
      <div style={{position: 'absolute', left: SHEET.x, top: SHEET.y, filter: 'invert(0.9)'}}>
        <LockupSheet t={3 + t} tick={tick} step={step} size={SHEET.size} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 540, background: '#000'}} />
      <div style={{position: 'absolute', left: 540, top: 300, width: 24, height: 24, background: WHITE}} />
      <div style={{position: 'absolute', left: 104, top: 540, width: 436, height: 436, background: '#2a2a2a', mixBlendMode: 'multiply'}} />
    </Shot>
  );
};

/* 15.500 → 16.000 · tall panel, grey pixels collapse to one */
export const PixelCollapse: React.FC = () => {
  const {t, on} = useShot();
  const rows = stepped(t, [
    [0, ['.+', '+-']],
    [0.125, ['+.', '-+']],
    [0.25, ['+', '-']],
    [0.375, ['.']],
  ]);
  return (
    <Shot>
      <Svg>
        {on(0, 0.375) && <TexturePanel x={216} y={216} w={470} h={640} seed="pxc" bright={1.2} />}
        <PixelGlyph rows={rows} cell={46} x={560} y={540} />
      </Svg>
    </Shot>
  );
};

/* 16.000 → 16.875 · the × — hourglass stem, panel, then it settles small */
export const Cross: React.FC = () => {
  const {t, on} = useShot();
  const size = stepped(t, [
    [0, 0],
    [0.125, 86],
    [0.5, 44],
  ]);
  const sw = size > 60 ? 9 : 4;
  return (
    <Shot>
      <Svg>
        {on(0.125, 0.25) && <TexturePanel x={260} y={390} w={370} h={300} seed="cx" bright={1.2} />}
        {on(0.25, 0.375) && <Streaks x={250} y={545} w={580} h={60} n={3} seed="cx2" />}
        {on(0, 0.125) && <polygon points="530,500 550,500 543,540 550,580 530,580 537,540" fill={WHITE} />}
        {size > 0 && (
          <g stroke={on(0.125, 0.25) ? '#cfcfcf' : WHITE} strokeWidth={sw}>
            <line x1={540 - size / 2} y1={540 - size / 2} x2={540 + size / 2} y2={540 + size / 2} />
            <line x1={540 + size / 2} y1={540 - size / 2} x2={540 - size / 2} y2={540 + size / 2} />
          </g>
        )}
      </Svg>
    </Shot>
  );
};

/** Word that slides up out of a mask over two frames (reference brand reveal). */
const SlideUp: React.FC<{start: number; children: React.ReactNode; style?: React.CSSProperties}> = ({start, children, style}) => {
  const {t} = useShot();
  if (t < start) return <span style={{...style, visibility: 'hidden'}}>{children}</span>;
  const k = Math.min(1, (t - start) / 0.0667);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', ...style}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - k) * 60}%)`}}>{children}</span>
    </span>
  );
};

/* 16.875 → 17.6875 · brand lockup slides in around the × */
export const BrandLockup: React.FC = () => (
  <Shot>
    <div style={{position: 'absolute', right: 1080 - 522, top: 540, transform: 'translateY(-50%)', display: 'flex', alignItems: 'flex-start'}}>
      <SlideUp start={0} style={{fontFamily: GROTESK, fontSize: 50, fontWeight: 500, letterSpacing: -1.5, color: WHITE, lineHeight: 1.2}}>
        {BRAND.studio}
      </SlideUp>
      <SlideUp start={0} style={{fontFamily: GROTESK, fontSize: 15, fontWeight: 700, color: WHITE, marginLeft: 2, marginTop: 8, lineHeight: 1}}>
        TM
      </SlideUp>
    </div>
    <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
      <g stroke={WHITE} strokeWidth={3.4}>
        <line x1={529} y1={529} x2={551} y2={551} />
        <line x1={551} y1={529} x2={529} y2={551} />
      </g>
    </svg>
    <div style={{position: 'absolute', left: 560, top: 540, transform: 'translateY(-50%)'}}>
      <SlideUp start={0.0625} style={{fontFamily: GROTESK, fontSize: 46, fontWeight: 800, letterSpacing: -0.5, color: WHITE, lineHeight: 1.2, transform: 'scaleX(1.12)', transformOrigin: 'left'}}>
        {BRAND.partner}
      </SlideUp>
    </div>
  </Shot>
);

/* 17.6875 → 20.000 · URL letters pop in at random, hold, pop out */
export const Url: React.FC = () => (
  <Shot>
    <Abs x={540} y={540} style={{fontFamily: GROTESK, fontWeight: 500, fontSize: 30, letterSpacing: '0.04em', color: WHITE}}>
      <ScrambleText text={BRAND.url} mode="reveal" start={0} span={0.3} outAt={2.04} outSpan={0.12} seed="url" />
    </Abs>
  </Shot>
);

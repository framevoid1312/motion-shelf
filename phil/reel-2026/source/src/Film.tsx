import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  AbsoluteFill,
  HtmlInCanvas,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio} from '@remotion/media';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {noise} from '@remotion/effects/noise';
import {pixelDissolve} from '@remotion/effects/pixel-dissolve';
import {vignette} from '@remotion/effects/vignette';
import {zoomBlur} from '@remotion/effects/zoom-blur';
import {makeOcean, makeRibbons} from './three-assets';

type Engine = {paint: (t: number) => void; cutTimes: () => number[]};
type Loaded = {engine: Engine; frame: HTMLCanvasElement; cuts: number[]};

// ---------------------------------------------------------------- async setup, cached per tab
function useAsyncOnce<T>(key: string, cache: Map<string, Promise<T>>, make: () => Promise<T>) {
  const [value, setValue] = useState<T | null>(null);
  const [h] = useState(() => delayRender(`init:${key}`, {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    if (!cache.has(key)) cache.set(key, make());
    cache
      .get(key)!
      .then((v) => {
        setValue(v);
        continueRender(h);
      })
      .catch(cancelRender);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return value;
}

const cache = new Map<string, Promise<Loaded>>();

async function loadEngine(width: number, height: number): Promise<Loaded> {
  const faces = [
    new FontFace('IT', `url(${staticFile('fonts/IT-700.woff2')})`, {weight: '700'}),
    new FontFace('GM', `url(${staticFile('fonts/GM-400.woff2')})`, {weight: '400'}),
    new FontFace('GM', `url(${staticFile('fonts/GM-500.woff2')})`, {weight: '500'}),
  ];
  await Promise.all(faces.map((f) => f.load()));
  faces.forEach((f) => document.fonts.add(f));
  const src = await (await fetch(staticFile('engine.js'))).text();
  const S = width / 1920;
  const env: Record<string, unknown> = {
    S,
    bg: document.createElement('canvas'),
    fg: document.createElement('canvas'),
    gl: document.createElement('canvas'),
    gooBlur: null,
    nocap: false,
    ribbons: makeRibbons(),
    ocean: makeOcean(width, height),
  };
  // eslint-disable-next-line no-new-func
  const engine = new Function('env', src)(env) as Engine;
  return {engine, frame: env.bg as HTMLCanvasElement, cuts: engine.cutTimes()};
}

// ---------------------------------------------------------------- the effect schedule (film finish + section joins)
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const oX = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const iX = (p: number) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10));

function effectsAt(t: number, frame: number, cuts: number[]) {
  // chromatic aberration: a 2-frame kick on every hard cut, a long one on the 2026 slam
  let last = -1;
  let idx = 0;
  for (let i = 0; i < cuts.length; i++) if (cuts[i] <= t + 1e-6) {
    last = cuts[i];
    idx = i;
  }
  const dt = t - last;
  let ca = last >= 0 && dt < 0.07 ? 10 * (1 - dt / 0.07) : 0;
  if (t >= 11.75 && t < 14.85) ca = 0; // the dot ocean moirés under RGB split; zoom blur carries those cuts
  if (t >= 4.4) ca = Math.max(ca, 26 * Math.exp(-(t - 4.4) * 9));
  // zoom blur: the dive into the ocean, and the fly-through out of it
  let zb = 0;
  if (t >= 11.7 && t < 11.8) zb = 34 * P(t, 11.7, 11.8);
  if (t >= 11.8) zb = Math.max(zb, 34 * Math.exp(-(t - 11.8) * 16));
  if (t >= 14.3 && t < 14.8) zb = Math.max(zb, 110 * iX(P(t, 14.3, 14.8)));
  if (t >= 14.8) zb = Math.max(zb, 80 * Math.exp(-(t - 14.8) * 25));
  if (zb < 0.5) zb = 0;
  // pixel dissolve: the burst breaks into blocks, the ASCII field assembles out of them
  let pd = 0;
  if (t >= 26.55 && t < 26.8) pd = oX(P(t, 26.55, 26.8));
  if (t >= 26.8 && t < 27.2) pd = 1 - oX(P(t, 26.8, 27.2));
  // the end: the card breaks into blocks and goes to black
  if (t >= 34.3) pd = oX(P(t, 34.3, 34.9));
  return [
    zoomBlur({amount: zb, samples: 24, disabled: zb === 0}),
    pixelDissolve({progress: pd, columns: 96, rows: 54, seed: 7, feather: 0.15, disabled: pd === 0}),
    chromaticAberration({amount: ca, angle: (idx * 47) % 360, disabled: ca < 0.5}),
    vignette({amount: 0.34, radius: 0.8, feather: 0.65, roundness: 0.5}),
    noise({amount: 0.05, seed: frame}),
  ];
}

// ---------------------------------------------------------------- the film
export const Film: React.FC<{samples: number; withAudio: boolean; fx?: string}> = ({samples, withAudio, fx = 'all'}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const loaded = useAsyncOnce(`engine-${width}x${height}`, cache, () => loadEngine(width, height));
  const ref = useRef<HTMLCanvasElement>(null);
  const bloomA = useRef<HTMLCanvasElement>(Object.assign(document.createElement('canvas'), {width: Math.round(width / 4), height: Math.round(height / 4)}));
  const bloomB = useRef<HTMLCanvasElement>(Object.assign(document.createElement('canvas'), {width: Math.round(width / 12), height: Math.round(height / 12)}));

  // Pose the engine: average `samples` sub-frames inside a forward 180° shutter. Cuts sit on the
  // 30 fps grid, so the shutter never reaches the next shot.
  useLayoutEffect(() => {
    if (!loaded || !ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    const shutter = 0.5 / fps;
    for (let j = 0; j < samples; j++) {
      loaded.engine.paint(frame / fps + (samples > 1 ? (j * shutter) / samples : 0));
      ctx.globalAlpha = 1 / (j + 1);
      ctx.drawImage(loaded.frame, 0, 0, width, height);
    }
    ctx.globalAlpha = 1;
    // Bloom: two blurred downsamples screened back on top (black stays black, lime and white bleed).
    const b1 = bloomA.current;
    const b2 = bloomB.current;
    const c1 = b1.getContext('2d')!;
    const c2 = b2.getContext('2d')!;
    c1.clearRect(0, 0, b1.width, b1.height);
    c1.filter = 'blur(2px)';
    c1.drawImage(ref.current, 0, 0, b1.width, b1.height);
    c1.filter = 'none';
    c2.clearRect(0, 0, b2.width, b2.height);
    c2.filter = 'blur(3px)';
    c2.drawImage(b1, 0, 0, b2.width, b2.height);
    c2.filter = 'none';
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = 0.34;
    ctx.drawImage(b1, 0, 0, width, height);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(b2, 0, 0, width, height);
    ctx.restore();
  }, [frame, loaded, samples, fps, width, height]);

  const t = frame / fps;
  return (
    <AbsoluteFill style={{backgroundColor: '#070707'}}>
      <HtmlInCanvas width={width} height={height} effects={loaded && fx !== 'none' ? effectsAt(t, frame, loaded.cuts) : []}>
        <canvas ref={ref} width={width} height={height} style={{width, height, display: 'block'}} />
      </HtmlInCanvas>
      {withAudio ? <Audio src={staticFile('mix.wav')} /> : null}
    </AbsoluteFill>
  );
};

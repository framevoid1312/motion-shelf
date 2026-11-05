// bundle once, render many stills (out of order) — usage: node stills.mjs <comp> <outdir> <samples> f1,f2,...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [comp='Reel2026', out='out/stills', samples='1', frames=''] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const SANDBOX = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(SANDBOX) ? SANDBOX : null;
const chromiumOptions = {gl: browserExecutable ? 'swangle' : 'angle'};
const inputProps = {samples: Number(samples), withAudio: false};
const composition = await selectComposition({serveUrl, id: comp, inputProps, browserExecutable, chromiumOptions});
for (const f of frames.split(',').map(Number)) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, output: `${out}/f_${String(f).padStart(4, '0')}.png`, frame: f, inputProps, browserExecutable, chromiumOptions, overwrite: true});
  console.log('frame', f, (Date.now() - t0) + 'ms');
}

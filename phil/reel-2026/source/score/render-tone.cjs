// node render-tone.cjs <dir> <out.wav> — drives score.js headlessly (Tone.Offline) and writes a 32-bit float WAV
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const dir = path.resolve(process.argv[2]);
  const out = process.argv[3];
  const browser = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const page = await browser.newPage();
  page.on('console', (m) => console.log('[page]', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('file://' + path.join(dir, 'index.html'));
  const ev = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));
  const t0 = Date.now();
  const r = await page.evaluate(async (ev) => window.renderScore(ev, 35), ev);
  fs.writeFileSync(out, Buffer.from(r.b64, 'base64'));
  console.log(`rendered ${(r.n / 48000).toFixed(2)} s in ${((Date.now() - t0) / 1000).toFixed(1)} s, peak ${r.peak.toFixed(3)}`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

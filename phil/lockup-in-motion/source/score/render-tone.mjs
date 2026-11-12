// Headless offline render of score.js to WAV: node render-tone.mjs <seconds> <out.wav>
import puppeteer from 'puppeteer-core';
import {readFileSync, writeFileSync} from 'node:fs';
import http from 'node:http';

// localhost counts as a secure context, which Tone's AudioWorklet effects (BitCrusher) require
const server = http.createServer((_, res) => { res.writeHead(200, {'content-type': 'text/html'}); res.end('<html><body></body></html>'); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));

const [seconds = '20', out = 'score_raw.wav'] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  headless: true,
});
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.goto(`http://localhost:${server.address().port}/`);
await page.addScriptTag({content: readFileSync(new URL('./node_modules/tone/build/Tone.js', import.meta.url), 'utf8')});
await page.addScriptTag({content: readFileSync(new URL('./score.js', import.meta.url), 'utf8')});
const t0 = Date.now();
const b64 = await page.evaluate((s) => window.renderScore(s), Number(seconds));
writeFileSync(out, Buffer.from(b64, 'base64'));
await browser.close();
server.close();
console.log(`wrote ${out} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

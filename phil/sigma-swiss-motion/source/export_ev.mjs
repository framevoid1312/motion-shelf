// dump window.EV + window.TL from a film page -> <film>/events.json
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const film = process.argv[2], root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise((ok) => srv.listen(0, ok));
const b = await chromium.launch(); const pg = await b.newPage();
pg.on('pageerror', (e) => console.error('page error', e));
await pg.goto(`http://127.0.0.1:${srv.address().port}/${film}/index.html?render=1`);
await pg.waitForFunction(() => window.filmReady === true);
const data = await pg.evaluate(() => ({ ev: window.EV, tl: window.TL }));
fs.writeFileSync(path.join(root, film, 'events.json'), JSON.stringify(data));
console.log(data.ev.length, 'events'); await b.close(); srv.close();

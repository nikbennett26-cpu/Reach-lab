// Headless smoke test (needs: npm i && npx playwright install chromium).
// Draws a tag, buffs it, rotates mid-drip, draws again — fails on any page error, a buff that lifts nothing,
// or a wall that stops taking ink after rotating.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
const html = readFileSync('index.html');
const srv = createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(html); }).listen(0);
const url = `http://localhost:${srv.address().port}/index.html`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fail = m => { console.error('FAIL: ' + m); process.exitCode = 1; };
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ['--no-sandbox'] } : {});
const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
await ctx.addInitScript(() => { for (const k of ['rlGuide', 'mtbCoach', 'rlGetApp']) localStorage.setItem(k, '1'); });
const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p), errs = [];
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (/^FRAME/.test(m.text())) errs.push(m.text()); });
await p.goto(url + '?app=android'); await sleep(1800);
for (let k = 0; k < 4; k++) { await p.evaluate(() => { for (const b of document.querySelectorAll('button')) if (/^(start writing|got it|not now|done|skip guide)$/i.test(b.textContent.trim()) && b.offsetParent) b.click(); }); await sleep(150); }
await p.evaluate(() => { window.__rlSel('ept10', 'wplastic'); const P = window.__rlP(); P.fillPen(P.pen, { id: 't', ink: 'alcohol', colors: ['#202a70'], label: 'T', props: null }, false); Object.assign(P.pen, { life: 1, mix: 1, capped: false, sat: 1.2 }); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
const send = (type, x, y, f = .5) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 9, radiusY: 9, force: f, id: 1 }] });
const line = async (x0, y0, x1, y1, dl = 10) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 8)); await send('touchStart', x0, y0); for (let i = 1; i <= n; i++) { await sleep(dl); await send('touchMove', x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); } await send('touchEnd'); };
const lum = (x, y, w, h) => p.evaluate(([x, y, w, h]) => { const c = document.querySelector('#cv'), k = c.width / c.getBoundingClientRect().width, d = c.getContext('2d').getImageData(x * k, y * k, w * k, h * k).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4) / 3; }, [x, y, w, h]);
for (const x of [80, 140, 200, 260]) await line(x, 320, x, 440);
await sleep(2500);
const before = await lum(70, 370, 200, 12);
await p.evaluate(() => document.querySelector('[data-tool=buff]').click()); await sleep(200);
for (let r = 0; r < 4; r++) await line(40, 372 + r * 3, 300, 374 + r * 3, 16);
await sleep(600);
const after = await lum(70, 370, 200, 12);
if (!(after > before + 8)) fail(`buff did not lift ink (lum ${before.toFixed(1)} -> ${after.toFixed(1)})`);
await p.evaluate(() => document.querySelector('[data-tool=draw]')?.click()); await sleep(150);
await line(320, 300, 320, 420);
await p.setViewportSize({ width: 860, height: 412 }); await sleep(1500);
await p.setViewportSize({ width: 412, height: 860 }); await sleep(1500);
const s0 = await lum(330, 600, 40, 40); await line(350, 560, 350, 660); await sleep(500);
const s1 = await lum(330, 600, 40, 40);
if (!(s1 < s0 - 3)) fail('wall did not take ink after rotating');
if (errs.length) fail('page errors: ' + errs.slice(0, 3).join(' | '));
console.log(process.exitCode ? 'smoke test FAILED' : `smoke test passed (buff lum ${before.toFixed(0)}→${after.toFixed(0)}, ink after rotate ${s0.toFixed(0)}→${s1.toFixed(0)})`);
await b.close(); srv.close();

// Fast checks with no dependencies: index.html is up to date with src/, and every script in it parses.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
execFileSync(process.execPath, ['tools/build.mjs', '--check'], { stdio: 'inherit' });
const html = readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((code, i) => {
  try { new vm.Script(code, { filename: `index.html <script> #${i + 1}` }); }
  catch (e) { console.error(e.message); process.exit(1); }
});
console.log(`${scripts.length} scripts parse OK`);

// Reach Lab build: stitches src/ back into the single-page index.html that the website and the Android app load.
// Usage: node tools/build.mjs            -> writes index.html
//        node tools/build.mjs --check    -> exits 1 if index.html is not exactly what src/ builds
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const parts = JSON.parse(readFileSync(join(src, 'parts.json'), 'utf8'));

let html = parts.map(p => readFileSync(join(src, p), 'utf8')).join('');
// @@DATAURI:image/png:name@@ -> inline data URI;  @@B64:name@@ -> bare base64 (for the shake sound)
html = html.replace(/@@DATAURI:([a-z]+\/[a-z0-9+.-]+):([^@]+)@@/g,
  (_, mime, name) => `data:${mime};base64,` + readFileSync(join(src, 'assets', name)).toString('base64'));
html = html.replace(/@@B64:([^@]+)@@/g, (_, name) => readFileSync(join(src, 'assets', name)).toString('base64'));

const out = join(root, 'index.html');
if (process.argv.includes('--check')) {
  const cur = readFileSync(out, 'utf8');
  if (cur !== html) { console.error('index.html is out of date — run: node tools/build.mjs'); process.exit(1); }
  console.log('index.html matches src/ (' + html.length + ' bytes)');
} else {
  writeFileSync(out, html);
  console.log('built index.html (' + html.length + ' bytes from ' + parts.length + ' parts)');
}

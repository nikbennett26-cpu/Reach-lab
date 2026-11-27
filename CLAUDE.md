# Reach Lab — notes for Claude

- Edit files in `src/`, never `index.html` directly. Run `node tools/build.mjs`, then `node tools/check.mjs` and `node tools/smoke.mjs` before committing.
- `src/js/*.js` are consecutive slices of ONE script block (shared scope, `const`/`let` order matters). Keep new code in the file whose section it belongs to; add a new file to `src/parts.json` if you split one.
- Assets are referenced as `@@DATAURI:mime:name@@` / `@@B64:name@@` placeholders and inlined by the build.
- `main` is live: the README link serves `index.html` from `main`. Work on a branch and open a PR.
- Android: bump `versionCode`/`versionName` in `android/app/build.gradle`. Release signing uses the owner's keystore (`android/keystore.properties`, not committed).
- Brew Lab → buff: `stainModel()` (29-brew-chemistry.js) is the single source for stain/ghost/hold; the buff reads per-ink stats stamped into the wall's buff map (`stampBuffMap`/`buffMapAt` in 12-buff-model.js). If you add a stat, store it in the map too.

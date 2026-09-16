# Build / configuration / pipeline

**There is no build step.** Perchance generators are executed exactly as authored:
`main.pjs` (lists + JS) and `index.html` (the body markup) are served by the platform's
engine, which evaluates square-bracket blocks and scripts at page load.

- No bundler, transpiler, minifier or CSS preprocessor.
- No `package.json`, lockfile, Makefile, CI config or Dockerfile.
- No environment variables, no secrets, no API keys.
- No assets to compile or upload.

The only thing resembling a "vendored dependency" is big.js v4.0.2, which is already
minified upstream and pasted into `main.pjs` (see `../20-external-code/VENDOR.md`).

## How this export package was produced

1. Read `main.pjs` and `index.html` directly from the generator workspace (byte-exact).
2. Extracted the inlined big.js v4.0.2 minified bundle from `init()` with the pattern
   `/\* big\.js v4\.0\.2 … \*\/\s*\n\s*([^\n]+)/` and saved it as
   `20-external-code/big.js-4.0.2.min.js`.
3. Split `main.pjs` at line 70/71 into `modules/numerals-to-words.core.pjs` (logic)
   and `modules/word-tables.pjs` (`init()` + data tables) for readability.
4. Wrote `00-MANIFEST.md` with byte counts and SHA-256 of every file, then zipped.

**To restore the exact generator:** copy `10-internal-code/main.pjs` and
`10-internal-code/index.html` back into the code/HTML panels — nothing else is needed.

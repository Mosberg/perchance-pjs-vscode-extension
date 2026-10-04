# Build & config

The generator itself needs no build step: Perchance loads main.pjs (lists/plugin code) and index.html directly.
The single build artifact in the project is the minified marked bundle inlined into main.pjs; these tools cover it
plus package verification.

| file | purpose |
| --- | --- |
| package.json | package manifest: categories, dependency versions and exact runtime URLs |
| tools/extract-marked-bundle.mjs | re-extract the byte-exact inline marked bundle out of main.pjs |
| tools/rebuild-marked-bundle.mjs | rebuild an equivalent IIFE marked bundle from npm with esbuild |
| tools/verify-checksums.sh | sha256sum -c over the whole package |
| ../checksums.sha256.txt | SHA-256 of every file in the package |

Runtime CDN dependency (loaded lazily by the plugin, from main.pjs):
https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022 plus one URL per used language grammar.
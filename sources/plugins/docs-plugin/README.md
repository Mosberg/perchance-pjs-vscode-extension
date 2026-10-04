# Perchance docs-plugin - complete asset package

| | |
| --- | --- |
| generator | https://perchance.org/docs-plugin |
| generator name | docs-plugin |
| generator public id | b501226e3cd4650ab6d29de25844b3c3 |
| package generated | 2026-09-16 |
| files in package | see MANIFEST.md (30 files, ~344 KB) |

## What this generator is

A Perchance plugin generator. main.pjs ends with ```$output(opts) => ...```, so a generator that does
```docsPlugin = {import:docs-plugin}``` receives a function docsPlugin(options). Calling it turns every
<script type="text/markdown" data-hash="..." data-title="..." data-desc="..."> block in that generator's HTML
into one page of a documentation site: hash routing, responsive sidebar / table of contents, copy-page buttons,
copy buttons on every code block, and syntax highlighting. index.html here is the plugin's own documentation and
simultaneously its usage demo.

Options: ```docsPlugin({ pageCopyButtons: false })``` disables the copy buttons (default true). With a single
markdown page the sidebar/TOC/menu are hidden automatically.

## Package layout (by category)

| directory | category | contents |
| --- | --- | --- |
| 01-internal-code/ | internal code | main.pjs (62,276 B), index.html (4,041 B), docs-plugin.readable.js (readability view) |
| 02-external-code/ | external code (loaded at runtime from a CDN) | highlight.js 11.11.1: esm.sh shims + the modules they re-export, LICENSE, package.json |
| 03-third-party-assets/ | third-party assets (vendored into the bundle) | marked IIFE bundle (byte-exact), marked LICENSE/package.json, upstream reference build, PROVENANCE.md, LICENSES.md |
| 04-project-resources/ | project resources | README describing the content assets; examples/ - two generators that use the plugin |
| 05-build-config/ | build / config | package.json manifest, extract & rebuild scripts, checksum verifier, MANIFEST.md + checksums.sha256.txt |
| ALL_CODE.md | documentation | every text file in this package, in full, in one file |
| MANIFEST.md | documentation | per-file size + SHA-256 + description |
| checksums.sha256.txt | documentation | sha256sum-compatible manifest |

## Dependencies (everything the generator loads)

| dependency | version | how it is delivered | source |
| --- | --- | --- | --- |
| marked | minified bundle, API surface matches >= 14.1 | inlined into main.pjs as ```var __docsMarkedBundle``` | npm 'marked' (MIT) |
| highlight.js core | 11.11.1 | dynamic ```import()``` from esm.sh at first code block | https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022 |
| highlight.js javascript grammar | 11.11.1 | dynamic import() from esm.sh | .../lib/languages/javascript?target=es2022 |
| highlight.js json grammar | 11.11.1 | dynamic import() from esm.sh | .../lib/languages/json?target=es2022 |
| highlight.js xml grammar | 11.11.1 | dynamic import() from esm.sh | .../lib/languages/xml?target=es2022 |

No other third-party code, and no images, audio, fonts, models, shaders or data files are used. The only CSS is a
string built at runtime by injectStyles() in main.pjs.

## How the code fits together (facts, for orientation)

- ```docsPlugin = [$output]``` on line 1 of main.pjs re-exports the result of the ```$output(opts) =>``` function,
  so importers get the plugin function rather than the generator root.
- init(options) in main.pjs: merges settings, injects the stylesheet, builds the app shell (nav, scrim, bar, article,
  bottom table of contents), collects the markdown script blocks, then routes on location.hash.
- Pages are read from <script type="text/markdown" data-hash data-title data-desc> nodes; marked.parse() renders them;
  the highlighted variant is produced lazily, then swapped in without losing scroll position.
- highlight.js is loaded on demand: core first, then only the grammars actually used on the page.
- Code fences are mapped through highlightLanguageMap (js/javascript -> javascript, json/jsonc -> json,
  json5 -> javascript, html/xml/svg -> xml); json5 is registered as an alias of javascript.
- copyText() prefers navigator.clipboard and falls back to a hidden textarea + document.execCommand.
- External links get target=_blank and rel=noreferrer noopener.

## Rebuilding / regenerating

```sh
node 05-build-config/tools/extract-marked-bundle.mjs   # re-extract the shipped marked bundle from main.pjs
node 05-build-config/tools/rebuild-marked-bundle.mjs   # rebuild an equivalent bundle from npm (needs marked + esbuild)
sh 05-build-config/tools/verify-checksums.sh           # verify every file against checksums.sha256.txt
```

## Provenance caveats

- The marked bundle is minified, so its exact upstream version cannot be proven from the file itself; see
  03-third-party-assets/marked/PROVENANCE.md. The feature probe points to marked >= 14.1 (14.1-16.x line).
- highlight.js is not vendored into the generator: it is hotlinked from esm.sh with a pinned version and
  ?target=es2022. Copies of the exact bytes those URLs served are included under 02-external-code/.
- No build step is required to run the generator; the only artifact from a build is the marked bundle.

## License

The plugin source belongs to the generator author. Bundled/loaded third-party code is MIT (marked) and
BSD-3-Clause (highlight.js) - see 03-third-party-assets/LICENSES.md.
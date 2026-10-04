# Pattern Maker Plugin — complete source & asset package

Complete, self-contained export of the Perchance generator **`pattern-maker-plugin`**
(<https://perchance.org/pattern-maker-plugin>), including every script, asset, third-party
dependency, configuration file and the build/extraction tooling.

Nothing is summarised: every file listed in `MANIFEST.json` is present here **verbatim**
(incl. SHA-256 + byte size), and every externally-hosted resource the generator references
has been downloaded into this package so it works offline.

---

## Contents by category

### 01-internal-code — the generator itself (first-party code)

| File | What it is |
| --- | --- |
| `main.pjs` | The generator's per-chance-js source: the exported `$output(opts)` plugin function, the helper `renderImageDataToOutputElement()`, the `onElementRemoved()` MutationObserver helper, the `defaultPatternSettings` config list, and the demo `patternOptions1` list. |
| `index.html` | The generator page body: documentation, the interactive pixel-drawing tool, the "image → data URL" converter, all inline `<script>`s, and the inline `[$output(patternOptions1)]` demo. |
| `wavefunction-collapse.worker.js` | The minified Wave Function Collapse worker extracted verbatim from the `workerScriptBlob` template string in `main.pjs`, plus its provenance header. This is the actual code that runs in the 5 Web Workers. |

### 02-external-code — third-party code (vendored, unmodified)

`wavefunctioncollapse/` — the complete upstream repository snapshot
(<https://github.com/kchapelier/wavefunctioncollapse>, MIT), which is the JavaScript port of
Maxim Gumin's algorithm that the plugin's worker is built from:

* `model.js`, `overlapping-model.js`, `simple-tiled-model.js`, `random-indice.js`, `index.js` — the library source.
* `example/` — upstream demos, sample data, the custom `castle` / `summer` tilesets and `.definition.js` tile configs.
* `LICENSE`, `README.md`, `package.json`, `package-lock.json`, `.gitignore` — upstream licence/config.

### 03-third-party-assets — images referenced by the plugin & its docs

Every image URL used by `main.pjs` / `index.html`, downloaded byte-exact (all were hosted on
imgur, which is known to delete old images — these local copies are the durable ones):

| File | Original URL | Role |
| --- | --- | --- |
| `images/example-input-image__i.imgur.com_V4trUZG.png` | <https://i.imgur.com/V4trUZG.png> | the default `inputImage` in `main.pjs`, also shown/demoed in the docs |
| `images/example-input-image-alt__i.imgur.com_9A0FSw0.png` | <https://i.imgur.com/9A0FSw0.png> | second example input image (commented alternative in `main.pjs`) |
| `images/example-patterns-illustration__i.imgur.com_XjdAKur.png` | <https://i.imgur.com/XjdAKur.png> | the "input (left) → generated output (right)" illustration at the top of the docs |
| `images/embedded-example-input-image__from-index.html.png` | inline `data:image/png;base64,…` in `index.html` | the example input image embedded as a data URL in the docs (decoded back to PNG, 15×23) |

### 04-project-resources — configuration/data resources shipped in the docs

`example-pattern-options/` — the three ready-to-paste `patternOptions` list configs from the docs:
`patternOptions-emoji-grid.pjs.txt` (an 11×12 emoji `inputTextGrid`), `patternOptions-data-url.pjs.txt`
(embedded PNG data URL), `patternOptions-imgur.txt` (remote image URL). These are the data inputs the
plugin consumes.

### 05-build-config — build / tooling / config

| File | What it is |
| --- | --- |
| `BUILD.md` | Explains that there is **no build pipeline** (Perchance compiles `main.pjs` + `index.html` in the browser), the worker-pin date, and a table of every configurable setting. |
| `extract-worker.mjs` | Node script (`node 05-build-config/extract-worker.mjs`) that regenerates `01-internal-code/wavefunction-collapse.worker.js` from `main.pjs`. |

---

## External resources referenced at runtime (not vendorable)

These are URLs the generator/lib points at; they are *not* code it loads, and are kept as links:

* **Perchance engine + plugin system** — <https://perchance.org/> (compiles `main.pjs`/`index.html`, provides `root`, `$output`, `{import:…}`). The plugin is published as `https://perchance.org/pattern-maker-plugin`; consumers use `patternMaker = {import:pattern-maker-plugin}`.
* **`https://emojicombos.com/emoji-art-editor`** — recommended external emoji-art editor (docs link).
* **`https://photopea.com`** — recommended external image editor (docs link).
* **`https://perchance.org/upload`** — recommended image host for `inputImage` (imgur no longer recommended by the docs).
* **`https://github.com/mxgmn/WaveFunctionCollapse`** — Maxim Gumin's original C# algorithm / `@mxgmn` (credit only).
* Example consumer generators: `pattern-maker-plugin-example`, `pattern-maker-plugin-example-data-url`, `pattern-maker-plugin-emoji-example`.

## Licence / credit

Plugin code © its Perchance author. Bundled algorithm: `kchapelier/wavefunctioncollapse` (MIT, see
`02-external-code/wavefunctioncollapse/LICENSE`), ported from `mxgmn/WaveFunctionCollapse` (MIT).

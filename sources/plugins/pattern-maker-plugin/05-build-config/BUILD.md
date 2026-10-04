# Build & config

## There is no build pipeline

This is a Perchance generator. Its entire "build" is performed by the Perchance engine
in the visitor's browser at page-load time:

1. `01-internal-code/main.pjs` is parsed as per-chance-js (pjs). Top-level names
   (`$output`, `renderImageDataToOutputElement`, `onElementRemoved`, `defaultPatternSettings`,
   `patternOptions1`) become properties of the generator's `root` object.
2. `01-internal-code/index.html` is rendered as the page body; square-bracket blocks
   (`[$output(patternOptions1)]`) are evaluated by the same engine, and `<script>` tags run
   after all template evaluation.
3. `$output(opts)` publishes itself, so other generators can do
   `patternMaker = {import:pattern-maker-plugin}` and call `[patternMaker(opts)]`.

There are **no** npm dependencies, bundlers, transpilers, environment variables, secrets,
or server-side components. `05-build-config/extract-worker.mjs` is a convenience script only
(it reproduces `01-internal-code/wavefunction-collapse.worker.js` from `main.pjs`).

## Configuration knobs (all in-theme, no env files)

| Where | Key | Default | Meaning |
| --- | --- | --- | --- |
| `main.pjs` → `defaultPatternSettings` | `n` | 3 | pattern/chunk size (2–4 recommended) |
| | `symmetry` | 8 | allowed rotations/flips, 1–8 |
| | `ground` | 0 | pattern id forced onto the bottom row |
| | `periodic` | 0 | 1 = output tiles seamlessly |
| | `periodicInput` | 1 | 1 = input is treated as a repeatable texture |
| | `width` / `height` | 50 / 50 | output size in pixels (or grid cells) |
| | `magnify` | 5 (image) / 0.6 (text) | display scale of the output |
| `main.pjs` | `workerCount` | 5 | parallel workers racing for the first success |
| `main.pjs` | `maxTries` | 4 | per-worker retries before reporting failure |

## Upstream pin

The embedded worker was copied from `kchapelier/wavefunctioncollapse` on **2022-05-19**
(comment in `main.pjs`). The package vendors the full `master` snapshot under
`02-external-code/wavefunctioncollapse/`, MIT-licensed (see its `LICENSE` file).

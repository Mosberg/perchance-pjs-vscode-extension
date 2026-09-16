# Build pipeline

Inputs: the internal sources (`creator.js`, `engine.js`, `ui.js`, and
`data/catalog.json`). Output: a single self-contained ES module that
`main.pjs` loads as `BUNDLE_URL`.

## Node + esbuild (canonical)

```
npm install        # installs esbuild 0.21.5
npm run build      # -> dist/lpc-creator-plugin.js
```

`build/build.mjs` bundles from `--src` (default `../src`) into `--out`
(default `../dist/lpc-creator-plugin.js`). It uses a virtual entry
`export * from "./creator.js"` so every public export in `creator.js` is
re-exported by the bundle; `catalog.json` is *not* bundled - `creator.js`
fetches it at runtime from `CATALOG_URL`.

## Browser / no-Node (esbuild-wasm)

The same build runs in any JS runtime (used by the AI workspace, since it has
no Node):

```js
const esbuild = (await import("https://esm.sh/esbuild-wasm@0.21.5")).default;
await esbuild.initialize({ wasmURL: "https://esm.sh/esbuild-wasm@0.21.5/esbuild.wasm" });
// entry-point -> src/creator.js, an onResolve/onLoad plugin that reads the
// workspace files; bundle:true, format:"esm", write:false.
```

## Publish

1. Upload `dist/lpc-creator-plugin.js` and `data/catalog.json` to a host.
2. Paste the URLs into `main.pjs` (`BUNDLE_URL` / `CATALOG_URL`).
3. Bump `PLUGIN_VERSION` in `creator.js` before rebuilding.

## Layout mapping (category folders vs. project tree)

The category folders in this archive map to the live project like so:

| archive | project |
| --- | --- |
| `01-internal-code/` | `main.pjs`, `index.html`, `src/*.js`, `src/README.md` |
| `02-data/catalog.json` | `src/data/catalog.json` |
| `03-build/` | (build tooling; not part of the runtime) |
| `04-external-code/lpc-creator-plugin.js` | the hosted bundle |
| `04-external-code/kv-plugin.main.pjs` | `imports/kv-plugin/main.pjs` |

To re-run the Node pipeline against this archive, copy `01-internal-code/src/` to a
project `src/` and run `node build/build.mjs --src src --out dist/lpc-creator-plugin.js`.

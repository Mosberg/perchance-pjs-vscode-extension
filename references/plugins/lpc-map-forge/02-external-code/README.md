# 02 — External code (third-party dependencies)

Code this project depends on but does not own.

## `perchance-plugins/`

`main.pjs` opens with two plugin imports:

```
generateText = {import:ai-text-plugin}
kv     = {import:kv-plugin}
```

Their full, current source is vendored here for offline reference, exactly as the Perchance
platform serves it:

| File | Used for | Source |
| --- | --- | --- |
| `perchance-plugins/ai-text-plugin/main.pjs` | The AI world designer ("Generate from description") and "Name this map" (streamed text generation). | `{import:ai-text-plugin}` — Perchance official plugin (platform-provided). |
| `perchance-plugins/kv-plugin/main.pjs` | Browser-local save slots (IndexedDB key/value store, per-generator origin). | `{import:kv-plugin}` — Perchance official plugin (platform-provided). |

Both are invoked through `root.*` at runtime (`root.generateText(...)`, `root.kv.<folder>.*`).
They are **not** bundled into `06-dist/forge-bundle.js`; the platform resolves them at page
load. Because they are external, also keep the `{import:...}` lines in `main.pjs` — the vendored
copies here are reference only.

## `build-time`

| Dependency | Version | Role |
| --- | --- | --- |
| `esbuild` (npm) | `^0.21.5` | Bundles + minifies `src/` into `06-dist/forge-bundle.js`. |
| `esbuild-wasm` (esm.sh) | `0.21.5` | The browser-side equivalent used inside the Perchance editor (see `05-build-config/README.md`). |

## Platform runtime

The generator also depends on the **Perchance engine** itself — `main.pjs` pjs lists and
`[square-bracket]` templating inside `index.html`, the `{import:}` system, `$meta`, the
implicitly-loaded-runtime model, and Perchance's `upload_file`-hosted asset URLs. No engine
source is included here; it is platform infrastructure, not a project dependency you vendor.

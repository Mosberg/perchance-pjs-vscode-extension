# LPC Character Creator - complete source & asset package

Version **1.4.1** · Perchance generator (`lpcCreatorPlugin()` facade + shadow-DOM UI + LPC sprite engine)

This archive contains the project's own code, configuration and generated data,
plus exact pointers and tooling for the third-party art it consumes. Nothing is
summarised - every file is the full source/asset.

---

## 01-internal-code/  (project source)

| file | what it is |
| --- | --- |
| `main.pjs` | Perchance-js generator code: `$meta` (title/description/tags/image), the `kv = {import:kv-plugin}` dependency, and the `lpcCreatorPlugin()` facade that importers receive (holds `BUNDLE_URL` / `CATALOG_URL` / `VERSION`). |
| `index.html` | Generator body; mounts the shadow-DOM UI into `#lpcHost`. |
| `src/creator.js` | Application layer + public plugin API (`mountLpcCreator`, `openCreator`, `renderFrame`, `renderAnimSheet`, `renderFullSheet`, `createSprite`, `animationsFor`, `attackAnimation`, `animationMap`, `equipmentAnimations`, `characterToCode/FromCode`, `getCatalog`). Also installs `window.__lpc`. |
| `src/engine.js` | Sprite engine: catalog loading, layer compositing, palette recolouring, standard + custom animation frame resolution, sheet rendering, share-link codec. Holds the pinned `COMMIT`/`CDN`. |
| `src/ui.js` | Shadow-DOM HTML template + CSS for the entire UI. |
| `src/README.md` | Architecture, catalog schema, build recipe, public API reference, behaviour notes. |

## 02-data/  (generated data)

| file | what it is |
| --- | --- |
| `catalog.json` | 657 items, category tree, palette/material definitions, per-layer credits (maps to `src/data/catalog.json` at runtime; also served as `CATALOG_URL`). |

## 03-build/  (build pipeline)

| file | what it is |
| --- | --- |
| `build.mjs` | esbuild bundler: `src/creator.js` (+ `engine.js`, `ui.js`) -> one self-contained ES module. `--src`/`--out` configurable. |
| `package.json` | `npm run build` + `esbuild@0.21.5` devDependency. |
| `BUILD.md` | Node and esbuild-wasm recipes, publish steps, and the category-folder -> project-tree mapping. |

## 04-external-code/  (built + vendored dependencies)

| file | what it is |
| --- | --- |
| `lpc-creator-plugin.js` | The **built** single-file ES module (`dist/lpc-creator-plugin.js`) - exactly what `BUNDLE_URL` serves. Generated from `src/*.js`; do not hand-edit. |
| `kv-plugin.main.pjs` | Source of the third-party Perchance `kv-plugin` (imported as `{import:kv-plugin}`), vendored for reference. |

## 05-assets/  (project assets)

| file | what it is |
| --- | --- |
| `meta-image.jpg` | The `$meta.image` screenshot (1440x900) shown in generator listings / social cards. |

## 06-third-party/  (external art + attribution)

| file | what it is |
| --- | --- |
| `ATTRIBUTION.md` | Full credits: every layer key -> authors, licenses, note (from `catalog.json -> credits`), plus the aggregated author/license/URL list. |
| `PINNED-CDN.md` | The pinned jsDelivr base URL, how paths map to URLs, how to clone the complete upstream art repo, license summary. |
| `referenced-assets.txt` | Every sprite path the engine can construct from the catalog (76,802 candidate paths). URL = pinned CDN base + path. |
| `fetch-assets.mjs` | Downloads the referenced set from the pinned CDN into `./spritesheets/` (skips 404s). |

---

## External runtime URLs (live generator)

| use | URL |
| --- | --- |
| Built bundle (`BUNDLE_URL`) | https://user.uploads.dev/file/5055a3d3b25948a3c6980c81491f9e3c.js |
| Catalog (`CATALOG_URL`) | https://user.uploads.dev/file/62294525be9572725bf48e04093c8adb.json |
| `$meta.image` | https://user.uploads.dev/file/4b4e2412916737e0955207d055e5149f.jpg |
| Sprite art (pinned commit 553ba7562534cbf32e7d9a502660f569d6b26512) | https://cdn.jsdelivr.net/gh/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator@553ba7562534cbf32e7d9a502660f569d6b26512/ |

## External dependencies (declared)

| dependency | kind |
| --- | --- |
| `kv-plugin` (`{import:kv-plugin}`) | Perchance platform plugin - per-user IndexedDB key/value storage (saved characters, library). |
| esbuild 0.21.5 | Build tool (bundling only; not shipped at runtime). |
| Universal LPC Spritesheet Character Generator | Third-party sprite art + sheet/palette definitions (see `06-third-party/`). |

## Notes / size reality

- The **third-party art library is large** (upstream `spritesheets/` is tens of
  thousands of files, well over 86 MB) and is intentionally **not** copied into
  this archive: it is public and hot-linked from the pinned CDN. Use
  `PINNED-CDN.md` (clone the repo at the pinned commit for *all* art) or
  `fetch-assets.mjs` (referenced subset only).
- `referenced-assets.txt` is a superset: some item/animation/body-type
  combinations have no art upstream, so a few paths 404 by design.
- The generator is currently **unsaved** in the Perchance editor; the live
  `lpc-character-creator` generator still serves an older build (1.2.0) until
  this is saved.

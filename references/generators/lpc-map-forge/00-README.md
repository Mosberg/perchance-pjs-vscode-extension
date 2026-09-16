# LPC Map Forge — complete project package

Everything used by the **LPC Map Forge** Perchance generator: procedural top-down LPC map
generator + editor (`https://perchance.org/lpc-map-forge-v2`), plugin version **1.5.1**.

This archive is a complete, organised export: full source of every script and config file,
every image asset (built atlases + the original source sheets they were cut from), the docs,
and the built distributable bundle. Nothing is summarised or minified except where noted
(`06-dist/forge-bundle.js`, which is the minified build output of `01-internal-code/src/`).

## Contents

| Folder | What is in it |
| --- | --- |
| `00-README.md` | This file. |
| `00-MANIFEST.md` | Every file in the archive: path, size, category, one-line role. |
| `00-FULL-SOURCE.md` | **Every text file of the project, in full, in fenced code blocks**, organised by category. One-document mirror of the source tree. |
| `01-internal-code/` | The project's own code: `main.pjs`, `index.html` and the whole `src/` ES-module tree. |
| `02-external-code/` | Third-party code the project depends on: the Perchance plugins it imports (`ai-text-plugin`, `kv-plugin`), and notes on the build-time npm dependency. |
| `03-third-party-assets/` | The art: the built atlases the generator ships (`terrain.png`, `props.png`), the original LPC source sheets they were packed from, and the licensing/credits file. |
| `04-project-resources/` | Human-facing project resources: `README.md`, `SPEC.md`, `TODO.md`, `props-sources.json`, `credits.txt`. |
| `05-build-config/` | The build pipeline: `build.mjs`, `package.json`, this folder's README. |
| `06-dist/` | The built distributable: `forge-bundle.js` (minified ES module). |

## What this project is

A fully client-side procedural map generator and tile editor for the **Liberated Pixel Cup**
(LPC) tileset:

* a terrain pipeline — domain-warped fBm elevation, priority-flood hydrology, real lakes/rivers
  with flow accumulation, coastal shelves, moisture/temperature/rockiness fields, biome
  assignment, weighted-A* roads, settlements (villages, farms, graveyards, harbours, ruins,
  mines, camps), terrain-aware prop scattering;
* 31 parameters + theme + seed deterministically define a map;
* an AI designer (`ai-text-plugin`) that turns an English description into a full parameter set,
  and names/legend-ises the current map;
* an editor — paint/rect/line/fill/eyedropper, prop palette, prefab stamping (21 prefabs),
  region clone/copy-paste, labels, undo/redo, pan/zoom, layer toggles;
* export — PNG/WebP/JPEG at up to 8192px, full map JSON, Tiled `.tmx`, and browser-local save
  slots (`kv-plugin`);
* a reusable plugin facade (`lpcMapForgePlugin()` via `$output`) so the author's other
  generators can import a headless generator or embed the editor.

## Running / rebuilding

There is nothing to compile to *use* the project — `index.html` + `main.pjs` + `src/` is the
whole app, and Perchance serves it directly.

To rebuild the distributable bundle used by the plugin facade:

```bash
cd 05-build-config
npm install
npm run build          # reads ../01-internal-code/src -> writes ../06-dist/forge-bundle.js
```

The bundle is then hosted (Perchance `upload_file`) and its URL placed in `main.pjs` in the
`lpcMapForgePlugin()` facade (`BUNDLE_URL`), together with `TILESET_URL`, `PROPS_URL` and
`VERSION`. Full rebuild instructions, including the browser-side esbuild-wasm recipe that the
Perchance editor itself uses, are in `04-project-resources/README.md`.

## Runtime dependencies (not bundled)

* **Perchance platform** — the generator runtime (`main.pjs` pjs lists + square-bracket
  templating, the `{import:...}` system, `$meta`).
* **`ai-text-plugin`** and **`kv-plugin`** — Perchance plugins, imported in `main.pjs`.
  Their source is included under `02-external-code/perchance-plugins/`.
* **The built atlases** — `terrain.png` and `props.png`, hosted by Perchance's upload service and
  referenced by `TILESET_URL` / `PROPS_URL` in `main.pjs`.
* **esbuild** — build-time only (`05-build-config/package.json`).

No server component, no accounts, no runtime uploads. Saved maps live in the browser
(IndexedDB via `kv-plugin`) and are never synced anywhere.

## Licensing

* Code: the project's own code is the author's (`Mosberg`).
* Art: LPC assets — CC-BY-SA 3.0 / GPL 3.0, as documented per-pack in
  `04-project-resources/credits.txt` and `04-project-resources/props-sources.json`.
  Attribution requirements for every source pack are listed there; keep that file with the art.

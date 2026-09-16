# LPC Animal & Monster Creator — handout

Created by **Mosberg** (https://github.com/Mosberg). Version 1.0.0.

A Perchance generator that catalogues **39 LPC animals, monsters and mythical creatures**
(59 variants, 118 animations, 1392 individual frames, 96 sprite sheets from 17 OpenGameArt packs)
and gives you: an animated 4-direction editor UI, game-ready sprite-sheet / JSON export, and an
importable plugin API so a game can render the same creatures at runtime.

## What is in this archive

| folder | contents |
| --- | --- |
| `01-internal-code/` | `main.pjs`, `index.html` and the full `src/` tree (`sheets/` excluded, since those PNGs are the byte-identical copies in `03-third-party-assets/sheets/`). **This is a drop-in Perchance generator project** — copy it into a generator, or merge `03-third-party-assets/sheets/` into `src/sheets/` first for a 100% complete tree. |
| `02-external-code/` | The deployed plugin bundle (byte-exact), the same bundle unminified, the vendored `kv-plugin` source, and notes on the one build-time library (`esbuild-wasm`). |
| `03-third-party-assets/` | All 96 sprite-sheet PNGs, exactly as shipped. Third-party LPC art — read `THIRD-PARTY-CREDITS.md`. |
| `04-project-resources/` | `catalog.json` (the dataset), `urls.json` (sheet URL map), `listing-image.jpg` (the `$meta.image`). |
| `05-build-and-config/` | The build pipeline (`build-catalog.mjs`, `build-bundle.mjs`) and the build/config docs. |
| `MANIFEST.md` / `MANIFEST.json` | Complete inventory: every file, bytes, SHA-256, role. |
| `THIRD-PARTY-CREDITS.md` | Per-pack authors, licences and source URLs (17 packs). |
| `EXTERNAL.md` | Every hosted artefact, including all 96 sheet PNG URLs. |
| `HOSTED-FILES.md` | A permanent download URL for every individual source file. |

## Nothing is missing

This project has **no audio, no 3D models, no shaders and no prefabs**. The complete asset set is:
96 sprite-sheet PNGs + 1 listing JPEG + 3 JSON data files
(`catalog.json`, `urls.json`, `MANIFEST.json`) — all present.

## How the pieces fit together

```
main.pjs ── $meta, kv import, lpcAnimalMonsterCreator() facade, $output
   │            └── import(BUNDLE_URL) ──────────┐  (only when another generator imports this one)
index.html ── boots ./src/lpc-creatures/index.js
   │
   └── src/lpc-creatures/
        core.js    UI-free engine  (catalog, caches, frame maths, render, sprite, codec)
        app.js     shadow-DOM editor UI (3 columns, tabs, filters, export/share modals, playground)
        styles.js  the UI's CSS
        index.js   mountAnimalCreator()/openAnimalCreator()
        catalog.json   the dataset  ← built by tools/build-catalog.mjs from src/sheets/**
        urls.json      sheet rel-path → hosted PNG URL
src/plugin.js ── public plugin API, built by tools/build-bundle.mjs into the hosted BUNDLE_URL
```

## Rebuild / redeploy

See `01-internal-code/src/BUILD.md` (identical copy in `05-build-and-config/BUILD.md`). Short version:
the editor UI updates automatically when you save; only the catalog + bundle are hosted artefacts
and need a rebuild + re-upload if their sources change.

## Licensing

- **Code** (`main.pjs`, `index.html`, `src/**`, build tools): Mosberg's own work.
- **Art** (`03-third-party-assets/`, and the hosted sheet PNGs): LPC community packs, mostly
  CC-BY-SA / GPL / OGA-BY. Attribution is required — see `THIRD-PARTY-CREDITS.md`.

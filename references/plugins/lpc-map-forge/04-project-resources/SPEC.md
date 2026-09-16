# SPEC — LPC Map Forge

## Original request #1 (verbatim)

> Create an ai procedurally lpc 2d top down map generator and editor scouver the internet for lpc
> tiles and map generation
> https://opengameart.org/art-search-advanced?keys=Lpc&title=&field_art_tags_tid_op=or&field_art_tags_tid=&name=&field_art_type_tid%5B%5D=9&sort_by=count&sort_order=DESC&items_per_page=24&Collection=

## Original request #2 (verbatim)

> Improve, Optimize and implement more features, functions, options and settings and check my github
> repo there I have more tilesets, props, etc. https://github.com/Mosberg/LPCGame analyze each image
> properly and create a new combined tileset or integrate the useful tilesets like, terrain, props,
> buildings, plants, tress, crops, etc.

### Requirements derived from request #2

| # | Requirement | How it is satisfied |
| --- | --- | --- |
| R8 | **Check the GitHub repo** and analyse every image | The whole `Mosberg/LPCGame` repo was downloaded and every image was decoded and compared pixel-by-pixel against the shipped atlases. Result: the repo *is* this generator's asset home — `src/terrain.png` matches the repo's terrain tileset tile-for-tile (2048/2048), and every useful prop sheet is already in `src/props.png`. The sources of all 17 packed sheets were then tracked down to their original OpenGameArt packs and each one was **confirmed by SHA-256**: "LPC Tile Atlas" (`Atlas_0.zip`) → `terrain_atlas` + `base_out_atlas`; "LPC Tile Atlas2" (`Atlas2.zip`) → `build_atlas` + `obj_misk_atlas` (the cherry trees, torii gate, buildings and stalls); "[LPC] Dungeon Elements" → `dungeonex`; Daneeklu's "[LPC] Farming tilesets…" → `plants`, `farming_fishing`, `fence`, `fence_alt` and the seven decal sheets; "[LPC] House interior and decorations" (Reemax) → `interior` (one sprite). A second analysis pass re-scanned every repo sheet against the atlas and recovered **20 further sprites** that had been missed (tents, mine cart, hay cart, fish stall + 6 fish piles, market counter, firewood pile, stacked sacks, bookcase, tall wardrobe, curtains, checkered/fur rugs, skeleton, old chest), appended to the atlas and wired into the prefabs/world. The audit is written up in `README.md` → "Asset provenance & audit", `props-sources.json` (`verifiedProvenance` + `lateAdditions`), and `credits.txt`. |
| R9 | **Create a combined tileset, or integrate the useful tilesets** (terrain, props, buildings, plants, trees, crops, ...) | No new sheet was needed — the repo's art was already integrated, so instead of making a redundant combined tileset the work went into *proving* the provenance and tightening the integration. The farming pack's seven terrain-style sheets (`plowed_soil`, `wheat`, `youngwheat`, `tallgrass`, `sand`, `sandwater`, `reed`) are not LPC autotile terrain; they are present as 32x32 **decals** in the prop atlas and the farm/wheatfield prefabs paint whole fields with them (a scalable `crops` slider controls the field size). Deliberately excluded: `ui/`, `magic/` (animated), `character/`, the `interior/` wall/floor tiling (needs its own tiling system — only the grandfather-clock, bookcase, wardrobe and curtain sprites are used) and the animated GIF props. |
| R10 | **More features, functions, options and settings** | Prefab/stamp library (`src/prefabs.js`, 21 prefabs, `K`), region clone/copy-paste (`C`), map labels + Labels tab (`M`), Tiled `.tmx` export, 18 extra sliders (beach width, flowers, ore, reeds, prop density, village size, graveyards, ruins, harbours, crops, wild camps, ... — 31 total), water-tint selector, copy/paste-settings buttons, Randomise/Reset, field debug overlay selector, and a mobile layout fix (wrapping top bar, scrim-backed drawers). |
| R11 | **Optimise** | Per-cell tile cache with an auto-growing cache canvas, a whole-world composite for the zoomed-out view (patched in place after edits instead of rebuilt), sprite shadows cached per size, and `planCell` reuse in the Tiled exporter so export and rendering can never disagree. |

## Requirements derived from it

| # | Requirement | How it is satisfied |
| --- | --- | --- |
| R1 | **Procedural** 2D top-down map generation — not hand-authored, and not a single "noise blob" | A full terrain pipeline: domain-warped fBm + ridged noise elevation, priority-flood hydrology, real lakes and rivers with flow accumulation, coastal shelves, moisture/temperature/rockiness fields, biome assignment, roads by weighted A*, settlements with graveyards/harbours/ruins/farms, terrain-aware prop scattering. 31 sliders + theme + seed fully determine the output (`world.js`). |
| R2 | Uses **LPC** (Liberated Pixel Cup) tiles | Assets were researched and downloaded from OpenGameArt (the LPC art-search listing the user linked): `[LPC] Terrains` (autotile sheet), `[LPC] Trees`, `[LPC] Conifers`, `[LPC] Flowers/Plants/Fungi/Wood`, the LPC base assets, the two LPC Tile Atlases (adrix89's 1024x1024 compilations), `[LPC] Dungeon Elements`, `[LPC] Farming tilesets…` and `[LPC] House interior and decorations`. Attribution in `credits.txt`. |
| R3 | **Editor** — the generated map must be editable | Paint / rectangle / line / flood-fill / eyedropper, prop placement with scale and a searchable categorised palette, prop select-move-delete-flip, prefab stamping (place/clear whole clusters), region clone/copy-paste, named map labels, brush size, square/round brush, pan & zoom, grid, prop, shadow and field-debug toggles, undo/redo, re-scatter vegetation, clear props. |
| R4 | **AI** driven | `ai-text-plugin`: "Generate from description" turns an English prompt into theme + size + seed + all 31 parameters and regenerates; "Name this map" invents a title and a one-line legend for the current world. Both stream their output into the panel. |
| R5 | Practical outputs | Full-resolution PNG/WebP/JPEG export (auto-chosen scale or 1x-4x, up to 8192px), JSON export/import of the complete map, a Tiled `.tmx` export (terrain tile layers + props as objects), and browser-local save slots (`kv-plugin`). |
| R6 | Sourced by **scouring the internet** for LPC tiles | The LPC art-search page and the individual pack pages were fetched and read to find the highest-quality, complete, licence-compatible packs; the sheets were inspected and cropped programmatically rather than guessed at. Provenance and rebuild instructions are preserved in `src/props-sources.json` and `src/README.md`. |
| R7 | **Reusable as a plugin** alongside the author's game (`2d-top-down-rpg-multiplayer`) and the `lpc-character-creator-v2` plugin | The generator exposes `lpcMapForgePlugin()` via `$output`, mirroring the character creator's facade: a lazy loader in front of a hosted ES-module bundle. Importers get a headless API (`generate`, `toTileGrid`, `serialize`/`deserialize`, `buildTmx`, `renderFull`/`renderMinimap`/`toDataUrl`) and an embeddable editor (`mount`/`open`, shadow-DOM isolated, with `onChange`, `getMap`/`setMap`, prefab/label/clipboard helpers). All logic stays in one place: the standalone page and the bundle are both entries into `src/forge.js`. |

## Non-goals / constraints

* No server component, no accounts, no uploads — the generator is entirely client-side.
* Saved maps live in the browser (`kv-plugin`, IndexedDB) and are not shared or synced.
* The tileset is the LPC `terrain-v7` autotile set; no runtime tile generation.

## Product decisions worth remembering

* Corners, not cells: a `W` x `H` map stores `(W+1) x (H+1)` terrain values. This is what makes the
  universal corner-autotiling work and is why `world.cw = W + 1`.
* The minimap is a floating overlay in the bottom-right of the canvas (it was originally a right-panel
  section, but that pushed the panel into a scroll and clipped the minimap at 900px height).
* Dark theme, 248px left palette / flexible stage / 284px right settings, thin status bar. Below
  900px width the panels become drawers opened from the top bar.
* PNG export picks the largest scale from `[4,3,2,1,0.5,0.25]` that keeps the long edge ≤ 4096px.
* `$meta.header.mode = minimal` so the generator is a full-bleed app rather than sitting under the
  full Perchance header.
* The plugin form uses the **character-creator facade pattern**: a tiny lazy loader in `main.pjs`
  pointing at a hosted bundle, rather than trying to have importers reach into this generator's
  `src/` tree (imported generators do not share an origin). The bundle is `src/forge.js` bundled with
  esbuild-wasm; `src/ui.js` holds the UI as strings so the shadow-root editor and the standalone page
  share one copy of the markup/CSS.
* `mount`/`open` deliberately use a **shadow root**: the panel CSS is aggressive (global `button`,
  `input`, `dialog`, `#app` rules) and would otherwise leak into the host game.
* Host `config` values seed the forge's defaults (`useHostConfig`), but explicit `mount`/`open`
  `params`/`theme`/`seed`/`size` options are applied afterwards so they always win.
* The tile grid helper (`toTileGrid`) picks the highest-`RANK` (topmost) corner terrain per cell —
  that is the surface a game should treat as the cell's material.
* The generator is the *consumer* of the author's `Mosberg/LPCGame` art repo, not a sibling: the
  repo's `terrain_tileset.png` is byte-identical to `src/terrain.png`, so "integrating the repo's
  tilesets" was already done. New art should be appended to the atlases, never re-pulled from the
  repo, to avoid duplicate rows.
* Props in the Tiled export are objects, not tiles: the prop atlas is an irregular shelf pack and a
  Tiled tileset can only describe a regular grid, so exporting props as tiles would crop sprites.
  Objects carry the exact rectangle plus `sprite`/`kind`/`label`/`flip` metadata instead.
* Never register a `beforeunload` handler when running inside an iframe: it blocks the Perchance
  preview's reload machinery (and its native confirm dialog can wedge the whole preview). The
  handler is top-level-only, and the boot busy overlay is cleared in a `finally` so a thrown error
  can't leave a spinning overlay covering the app.

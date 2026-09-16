# LPC Map Forge

A procedural top-down fantasy map **generator + editor** built on the Liberated Pixel Cup (LPC)
tileset, running entirely in the browser on Perchance. It generates a whole world (elevation,
oceans, lakes, rivers, roads, biomes, vegetation) from a handful of parameters, lets you paint and
place props on top of it, stamps whole prefab buildings/villages, copies and pastes regions, drops
named map labels, and exports the result as PNG, JSON or a Tiled `.tmx` map. An AI "world designer"
turns a plain English description into a parameter set.

It ships in **two forms** from the same source:

1. **The standalone editor** — visit the generator's page (`https://perchance.org/<generatorName>`)
   and the full-screen editor mounts automatically.
2. **An importable Perchance plugin** — another generator (e.g. the `2d-top-down-rpg-multiplayer`
   game) imports this one and gets a headless map API plus an embeddable editor. This mirrors the
   `lpc-character-creator-v2` facade design so the two plugins compose cleanly.

All logic lives in ONE copy in `src/`; both forms are thin entry points into `src/forge.js`.

---

## Using it as a plugin

In the host generator's `main.pjs`:

```
mapForge = {import:lpc-map-forge}
```

`mapForge` is now the object returned by `lpcMapForgePlugin()` (see `main.pjs`). Every call is lazy:
the first one downloads the hosted ES-module bundle and the tileset/props PNGs.

Headless use (no editor UI):

```js
// a JSON-safe map: { format, version, name, legend, params, W, H, cw, ch, corners[], props[] }
let map = await mapForge.generate({ theme: "volcanic", width: 96, seed: 7, island: 0.6 });

// gameplay grid: tiles[i] is an index into mapForge.info().terrains
let { W, H, tiles } = await mapForge.toTileGrid(map);

// rendering (lazily loads the tileset + prop atlas)
let dataUrl = await mapForge.toDataUrl(map, 1);            // full-map PNG
let mini    = await mapForge.renderMinimapCanvas(map, 320); // <canvas>
let full    = await mapForge.renderFullCanvas(map, 2);      // <canvas> at 2x

// round-trip
let world = await mapForge.deserialize(map);
let again = await mapForge.serialize(world, { name: "Embervale" });

// Tiled export (terrain as tile layers, props as objects)
let tmx = await mapForge.toTmx(map, { name: "Embervale" });  // XML string
```

Embedded editor (rendered into a **shadow root**, so its CSS/ids can never clash with the host):

```js
let editor = await mapForge.mount(containerEl, {
  params: { seed: 7, theme: "boreal" }, // overrides host `config` defaults
  map: map,                             // optional: open with an existing map instead of generating
  name: "Embervale",                    // optional map name
  showAI: true,                         // hide the AI designer panel with false
  showSave: true,                       // hide the Save/Load buttons with false
  useHostConfig: true,                  // false = ignore the host generator's `config` defaults
  onClose: (editor) => {},              // when set, a Close button appears in the toolbar
});
let data = editor.getMap();             // serialize the current map at any time
editor.setMap(data);                    // load a map
editor.setSeed(123); editor.setTheme("desert"); editor.setSize(128);
editor.setParams({ forest: 0.9 });
let off = editor.onChange(({ reason, world }) => { /* "generate" | "load" | "paint" | ... */ });
off();
let mini = await editor.renderMinimap(256);
editor.exportPng(); editor.exportJson(); editor.exportTmx();
editor.destroy();                        // detach listeners + clear the shadow root
```

Label / prefab / clipboard helpers on the instance API (also handy from `page_eval`):

```js
editor.labels();                          // [{tx, ty, name}]
editor.setLabels([{tx: 20, ty: 30, name: "Embervale"}]); editor.addLabel(5, 5, "Camp");
editor.prefabIndex; editor.setPrefab(3);  // see mapForge.PREFABS
editor.stampPrefab(3, 40, 40);            // stamp prefab #3 with its top-left tile at (40, 40)
editor.copyRegion(40, 40, 52, 50); editor.pasteRegion(70, 70); editor.clearClip();
editor.scatter();                         // re-scatter scatterable props over the whole map
```

Full-screen modal (adds and removes its own overlay element):

```js
let editor = await mapForge.open({ onClose: () => {} });
editor.close();
```

Notes:
* `mount`/`open` need `root.kv` for Save/Load and `root.generateText` for the AI designer; those
  features degrade to a toast when the host does not import those plugins.
* `mapForge.info()` returns `{ version, themes, terrains, sizes }` — the catalog you need to map a
  `toTileGrid` index back to a terrain name.

---

## Controls (standalone editor)

| Action | Binding |
| --- | --- |
| Paint terrain | left drag (`B`) |
| Rectangle / Line | left drag (`R` / `L`) |
| Flood fill | click (`F`) |
| Eyedropper | click (`I`) |
| Place prop | click, `[`/`]` change brush size (`T`) |
| Stamp prefab | click to place, Shift-click to clear its footprint (`K`) |
| Clone / copy-paste | drag a rectangle to copy (`C`), then click to paste the clipboard centred there |
| Select / move / delete prop | click, drag, `Delete`, `E` flips (`V`) |
| Labels | `M`, then click the map (drag a label to move it) |
| Erase | drag (`X`) |
| Pan | middle drag, or hold `Space`, or `H` |
| Zoom | mouse wheel, `0` = fit |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Shift+Z` (or `Ctrl+Y`) |
| Toggle grid / props | `G` / `P` |
| Deselect | `Esc` |

Toolbar: **Generate** (re-roll with current settings), **Undo/Redo**, **Save/Load** (browser-local
`kv-plugin` slots), **Export** (PNG/WebP/JPEG at 1x–4x or auto), **JSON** (export/import the whole
map), **TMX** (Tiled map: terrain tile layers + props as objects), **Fit**, **Grid**, **Props**,
**Shadows**, **Randomise**, **Reset**.

Right panel: theme, seed, size, water tint, **31 sliders** (sea level, island-ness, beach width,
fragmentation, relief, temperature, moisture, snow, autumn, rivers, lakes, forest, plants, flowers,
rocks, ore, lava, reeds, prop density, paths, farms, field crops, villages, village size, market
wares, landmarks, wild camps, graveyards, ruins, harbours, wildlife), copy/paste-settings buttons,
the **AI world designer**, and map info. The four
left-panel tabs are **Terrain**, **Props** (searchable, filtered by category), **Stamps** (prefabs)
and **Labels**.

On narrow screens (< 900px) the two side panels become slide-in drawers via the **Palette** /
**Settings** buttons in the top bar.

---

## Files

Everything that ships lives in `src/` (plus `main.pjs` and `index.html`).

| File | Role |
| --- | --- |
| `main.pjs` | `$meta`, plugin imports (`ai-text-plugin`, `kv-plugin`), the `config` list of default parameter values, and `lpcMapForgePlugin()` — the importable facade (bundle/tileset/props URLs + lazy loader). `$output = [lpcMapForgePlugin()]` is what an importer receives. |
| `index.html` | Thin bootstrap only: a host `<div>` and a module script that calls `mountMapForge(host, {fullscreen:true})`. |
| `src/forge.js` | **The whole app.** `mountMapForge(container, options)` builds the editor inside a shadow root and returns an instance API; `openMapForge(options)` wraps it in a modal. Also the headless API: `generate`, `serialize`/`deserialize`, `toTileGrid`, `buildTmx` (Tiled export), `renderFull`/`renderMinimap` (+ `*Canvas`/`toDataUrl`), `pluginInfo`, and re-exports of `THEMES`/`DEFAULT_PARAMS`/`TERRAINS`/`PROPS`/`PREFABS`. |
| `src/ui.js` | `UI_CSS` + `UI_HTML` — the editor's styles and markup as strings, injected into the shadow root. Single source of truth for the UI. |
| `src/world.js` | The generator. `THEMES`, `DEFAULT_PARAMS`, `normalizeParams`, `generateWorld`, `scatterWorldProps`, `planSettlements` (villages, farms, graveyards, harbours, ruins, roads). |
| `src/editor.js` | `Editor`: pointer tools, brush/rect/line/fill, prop placement & selection, prefab stamping, region copy/paste, labels, view transform, undo/redo history, minimap + status callbacks, `attach(canvas)`/`detach()`. |
| `src/render.js` | `Renderer`: tile cache, corner-autotiling (`planCell`/`slotFor`), prop shadows/sprites, the low-zoom composite image, `renderFull` (export) and `renderMinimap`. `load({tilesetUrl, propsUrl})` takes asset URLs so the hosted bundle can load them cross-origin. |
| `src/noise.js` | Deterministic math utilities: `clamp/lerp/smoothstep`, `hash*`, `mulberry32`, `valueNoise2D`, `fbm2D`, `ridge2D`, `warp2D`. |
| `src/tileset.js` | Data for the LPC `terrain-v7` universal corner-autotile tileset: terrain names, pure-fill tile ids, draw priority, and the `MASKS[t][16]` transition table. |
| `src/props.js` | Data for the prop atlas: `PROPS` rows `[sx, sy, w, h, kind, palette, species, name]`, anchor = bottom-centre. Also `PROPS_IMAGE`/`ATLAS_WIDTH`/`ATLAS_HEIGHT`. |
| `src/prefabs.js` | The hand-authored prefab (stamp) library: 21 named clusters of atlas sprites on a tile grid (`PREFABS`), plus `spriteIndex`/`prefabBounds`/`buildPrefab`. Parts are referenced by display name or `{kind, pal, w, h}` spec so the library survives atlas reordering. |
| `src/terrain.png` | The tileset image (1024x2048, 32 columns of 32x32 tiles). |
| `src/props.png` | 2048x3576 packed prop atlas (960 sprites; sprites are only ever appended, never moved, so saved maps keep working). |
| `src/props-sources.json` | The ORIGINAL source-sheet rectangles the atlas was packed from, the source download URLs, and `verifiedProvenance` — the SHA-256-checked mapping from every packed sheet to its source pack. |
| `src/credits.txt` | Full attribution for every source pack (CC-BY 4.0 / CC-BY 3.0 / CC-BY-SA 3.0 / GPL). |
| `src/SPEC.md` | The user's specification and the feature list derived from it. |
| `src/TODO.md` | Known rough edges and next ideas. |

In the standalone page `window.__app` is the mounted instance (it also gets set for each `mount`
call, last one wins — prefer the value returned by `mount`).

---

## How a world is generated (`world.js` → `generateWorld`)

1. **Elevation** — domain-warped 6-octave `fbm2D` mixed with a ridged multifractal weighted by
   "landness", then pushed down by an island falloff (`smoothstep` over elliptical radius with noisy
   coastline) times `params.island`. Normalised to 0..1.
2. **Priority flood** — a min-heap flood from the map border (`priorityFlood`) computes the
   "filled" height and, importantly, a **spill order** ranking every cell by the level at which it
   would flood. This is the standard terrain-analysis trick that makes lakes and rivers physical
   rather than painted on.
3. **Lakes** — depressions that survive `pruneLakes` (small ones are removed, threshold scales with
   the `lakes` slider) become water.
4. **Ocean** — connect the border: every border cell below `seaLevel` flood-fills inward, so the
   outer ocean is always connected and any water enclosed by land is a lake.
5. **Rivers** — accumulate flow downhill in the priority-flood order (`flowAccumulate`), take the
   top `~1-5%` of land flow values as a percentile threshold, then carve those cells into water and
   widen each one by flow strength (1 to 9 cells, squared ease-in). Water depth is written at the
   same time and reused by the shallows/deep tiles.
6. **Shelf** — for ocean cells, depth is `min(shelf, basin)` where shelf grows with distance from
   land and basin grows with depth below sea level, clamped to 0.12..3.2, which reproduces the
   tile set's shallow→deep ramp along the coast.
7. **Fields** — moisture (fbm + distance-to-water bonus), temperature (fbm − polar latitude
   gradient − elevation lapse rate + humidity bonus), rockiness (fbm).
8. **Terrain** — `buildTerrain` turns each corner of the lattice into a terrain index using all of
   the above: water depth bands, frozen water, beaches, snowline (`snowT` from the `snow` slider and
   elevation), rockiness bands, then a moisture ladder (sand/earth → dead grass → grass → dark grass
   → mud/roots). Micro-noise offsets (`ma`, `mb`) break up the banding.
9. **Roads** — `carvePaths` runs weighted A* between random land pairs (cost 1.4 on sand/gravel/
   dirt, 4 elsewhere, 320 across water) and paints `Dirt_Tan` or `Gravel_1` paths.
10. **Props** — `scatterProps` walks three jittered lattices (trees every ~38px, rocks ~46px,
    bushes+plants ~13px), samples the field values at each point, and rolls a terrain-dependent
    weight table. Trees are clumped by a low-frequency noise (`clump`), coloured by
    temperature/autumn palette, and switched to conifers in cold/snowy biomes. A 10px occupancy
    grid enforces per-kind minimum spacing so sprites never merge. Props are sorted by `y` so the
    renderer can draw them in correct back-to-front order.
11. **Settlements** — `planSettlements` layers the hand-built places on top: village cores (a
    cobbled plaza ringed by houses, stalls, wells, lanterns and a windmill), roads + bridges/fords
    between them, **farmsteads** (tilled strips painted from the field decals, fenced, with
    `crops` scaling how thickly they are planted), **graveyards**, **harbours** (docks, moored
    boats, fish piles), **ruins** (relics: chests and bones) and **wild camps** (`camps`: a canvas
    tent, cook fire, cauldron, firewood, fur rug and carts, pitched far from any village). Each is
    gated by `landmarks` times its own slider and never overwrites a blocked cell.

Everything is driven by `mulberry32(seed)`, so a seed fully determines the map.

`scatterWorldProps(world, params, salt)` re-runs only step 10 against an existing world — that is
the **Scatter props** button.

---

## How terrain is drawn (`render.js`)

The LPC `terrain-v7` set is a **universal corner-autotile** tileset: every terrain ships one tile per
non-empty subset of the 4 quadrants of a cell. So a map cell is defined by the *four terrains at its
corners* (that is why worlds are `W+1` x `H+1` corners for a `W` x `H` map).

`planCell(corners, salt)`:
1. collect the distinct corner terrains, sort by `RANK` (draw priority, lowest first);
2. emit the pure fill of the lowest-priority terrain (`BASE[t]`, randomised among variants via
   `salt`) so there are never pixel gaps;
3. for each terrain in priority order, build a 4-bit mask of which corners equal it and append
   `MASKS[t][mask]` (higher priority paints on top).

The resulting id list is turned into a cache key by `tileKey`, and the composited 32x32 cell is
cached in an offscreen canvas keyed by that string. `cellSlot`/`slotFor` map a cell to its cache
slot; `invalidateCells` re-renders only what changed after an edit.

Two render paths keep it fast:
* **Zoomed in** (`zoom * TILE * dpr > ppt`): draw each visible cell's cached tile — crisp at any dpr.
* **Zoomed out**: blit a pre-composited whole-world image (`ensureWorldImage`), so the fit view draws
  one image instead of thousands of tiles. `pptFor` picks the composite resolution (32 px/tile on a
  96 map, down to 8 px/tile on a 512 map). The composite is regenerated lazily and *patched* in
  place by `invalidateCells` after small edits.

Props are drawn bottom-anchored from the atlas with a soft elliptical shadow (`shadowSprite`, cached
per size) and an optional horizontal flip, sorted by `y`.

---

## Prefabs, clone/labels and the Tiled export

* **Prefabs (stamps)** — `src/prefabs.js` holds 21 hand-authored clusters (homestead, farmstead,
  wheat field, market square, village well, camp, harbour, graveyard, shrine, ruins, paddock,
  windmill, blacksmith, mine, bridge, orchard, kitchen garden, inn, crypt, nomad camp, fishmonger). A
  prefab is a list of `{dx, dy, s, flip, d}` parts on a tile grid; `buildPrefab(index,
  tx, ty, scale)` converts it into prop records, and the editor's stamp tool previews/places/removes
  one atomically (Shift-click clears the footprint). Fence rings and gate tiles are generated by
  `fenceRing`/`fenceSprite` from the fence sprite triplets in the atlas.
* **Clone** — the clone tool drags out a rectangle (`copyRegion`) capturing the underlying corner
  bytes plus the props inside it (stored as tile offsets), then a subsequent click (`pasteAt`)
  re-stamps the corners and re-adds the props centred on the clicked tile.
* **Labels** — `world.labels = [{tx, ty, name}]`, persisted with the map (JSON save, `kv` slots and
  the Tiled export's map properties). They are drawn as rounded badges in the editor overlay and in
  `renderFull`, as dots on the minimap, and survive `regenerate()`.
* **Tiled export** (`buildTmx`) — writes `terrain.png` as a regular 2048-tile tileset (`firstgid`
  1, 32 columns) and one `<layer>` per composite id returned by `planCell`, so the layers stack in
  the same order the renderer composites them and the result is pixel-identical (a cell using four
  different corner terrains needs five layers; most need one or two). Props become `<object>`s in an
  objectgroup carrying `sprite` (atlas row), `kind`, `label` and `flip`, because the prop atlas is an
  irregular shelf pack and Tiled tilesets can only describe a regular grid — objects keep every
  sprite's exact rectangle and metadata without lossy cropping. Map `<properties>` carry the name,
  legend, seed, theme, size and the full params JSON so the map can be regenerated from the seed.

## Asset provenance & audit

`src/terrain.png` and `src/props.png` are the **only** art the generator needs, and they already
contain everything useful from the upstream `Mosberg/LPCGame` repo (the repo is this generator's own
asset home — its README lists the same bundles):

* `src/terrain.png` is byte-identical to the repo's `src/images/terrain/terrain_tileset.png`
  (all 2048 tiles match), so no terrain tile is missing.
* The farming pack's seven terrain-style sheets (`plowed_soil`, `wheat`, `youngwheat`, `tallgrass`,
  `sand`, `sandwater`, `reed`) are not autotile terrain in LPC, so they were integrated as 32x32
  **decal** sprites in `props.png` (`plowed soil`, `wheat field`, `young wheat`, `tall grass`,
  `sand fill`, `sand/water`, `reed field`) and the farm prefabs paint whole fields with them.
* `props.png` also absorbs the repo's trees/plants/fungi/wood, fences, dungeonex props,
  farming/fishing props and build/base object atlases, plus 104 `obj_misk_atlas` props; the 306
  rectangles that were placed are recorded in `props-sources.json`.
* **Every one of those sources is now hash-verified.** `props-sources.json` → `verifiedProvenance`
  lists, for each packed sheet, the SHA-256 of the repo file, the pack it came from and the file
  inside that pack. The provenance is: `terrain_atlas.png` + `base_out_atlas.png` → "LPC Tile Atlas"
  (`Atlas_0.zip`, compiled by adrix89); `build_atlas.png` + `obj_misk_atlas.png` → "LPC Tile Atlas2"
  (`Atlas2.zip`, adrix89) — this is where the cherry trees, torii gate, buildings, stalls and most
  town furniture come from; `dungeonex.png` → "[LPC] Dungeon Elements" (Sharm / William.Thompsonj);
  `plants.png`, `farming_fishing.png`, `fence.png`, `fence_alt.png` and the seven decal sheets →
  Daneeklu's "[LPC] Farming tilesets…" pack; `interior.png` → "[LPC] House interior and decorations"
  (Reemax, one sprite: the grandfather clock). `credits.txt` carries the full attribution for all of
  them, including the LPC authors listed inside each atlas's own attribution file.
* A second integration pass re-audited every repo image with connected-component analysis (see
  `scratch/analysis/`; `unmatched-*.json` are the sprite rects that were NOT yet in the atlas and
  `split-*.json` the same after splitting merged blobs). It appended **20 more sprites** at the end
  of `props.png` (rows 940-959, species 800-819), all byte-verified copies of their source rects:
  `tent`, `mine cart`, `hay cart` (build_atlas), `market counter`, `fish stall`, `green/blue/red fish
  pile`, `eel pile`, `green/red fish pair`, `firewood pile`, `stacked sacks` (farming_fishing),
  `bookcase`, `tall wardrobe`, `curtains`, `checkered rug` (obj_misk_atlas), `fur rug` (build_atlas),
  `skeleton`, `old chest` (dungeonex). The exact source rects are recorded in
  `props-sources.json` → `lateAdditions`.
* Deliberately **not** integrated: `ui/*` and `magic/*` (UI + animated spell effects), the
  `character/*` spritesheets, the `interior/*` wall/floor tiling (needs its own tiling system — only
  the single grandfather-clock sprite is used), and the animated GIF props (`fire.gif`, `boil.gif`) —
  none of them are map tiles. The C.Nilsson pack was examined too but contributes nothing that the
  two Tile Atlases don't already ship (they credit him directly).

If you add art later, append new rows to `props.js` (order is stable — saved maps reference row
indices) and add any new prefabs to `prefabs.js`.



* **Saved maps** — `kv-plugin` folder `lpcMaps`; each slot is
  `{format, version, name, legend, saved, params, W, H, cw, ch, corners, props}` (`corners` is a
  plain array so it survives structured cloning). Slot keys are user-chosen strings. In the plugin
  form this uses the HOST generator's `root.kv`, so maps saved from the game are visible to the game.
* **Nothing else is persisted.** There is no server component; the generator is fully client-side.

## AI integration (`main.pjs` imports `ai-text-plugin`)

Two calls, both prefix-cache friendly (static instructions first, then the varying payload):

* **Generate from description** — `AI_PREFIX` asks for a JSON object with `name`, `legend`, `theme`
  and the numeric parameters; the response is streamed into the panel, parsed with `extractJson`,
  clamped, and applied before regenerating.
* **Name this map** — `NAME_PREFIX` plus a compact JSON summary of the current world and asks for a
  name + one-line legend.

Both use `plugin("generateText")`, i.e. the HOST generator's ai-text-plugin when embedded.

---

## Rebuilding the plugin bundle

> **The hosted bundle is current** as of plugin `VERSION = 1.5.1`: the bundle was rebuilt from this
> `src/` tree and `PROPS_URL` was re-uploaded with the grown prop atlas (2048x3576, 960 sprites;
> terrain.png is still byte-identical to the hosted copy). It therefore carries the prefab library,
> clone/copy-paste, labels, graves/ruins/harbours, wild camps, field crops, the camp/fishing/interior
> sprite pack, water tint and the Tiled export. Only the standalone page's `src/` files are read
> directly, so if you edit `src/` you must re-run the recipe below for importers to see the change.

`main.pjs` points at a hosted ES-module bundle (`BUNDLE_URL`) plus the tileset/props PNGs. The bundle
is just `src/forge.js` and its imports, bundled. **Edit `src/` → rebuild → re-upload → paste the new
`BUNDLE_URL` into `main.pjs`.** (The PNG assets only change if `terrain.png`/`props.png` change.)

`execute_js` recipe (esbuild-wasm, bundle from the workspace filesystem):

```js
const { default: esbuild } = await import("https://esm.sh/esbuild-wasm@0.21.5?bundle");
await esbuild.initialize({ wasmURL: "https://esm.sh/esbuild-wasm@0.21.5/esbuild.wasm" });
const norm = (p) => { const a = []; for (const s of p.split("/")) { if (!s || s === ".") continue; if (s === "..") a.pop(); else a.push(s); } return a.join("/"); };
const dirname = (p) => { const i = p.lastIndexOf("/"); return i < 0 ? "" : p.slice(0, i); };
const wsPlugin = {
  name: "ws",
  setup(build) {
    build.onResolve({ filter: /^\./ }, (a) => ({ path: norm((a.resolveDir || "") + "/" + a.path), namespace: "ws" }));
    build.onLoad({ filter: /.*/, namespace: "ws" }, async (a) => ({ contents: await fs.readTextFile(a.path), loader: "js", resolveDir: dirname(a.path) }));
  },
};
const r = await esbuild.build({
  stdin: { contents: 'export * from "./forge.js";', resolveDir: "src", loader: "js" },
  bundle: true, format: "esm", target: "es2020", minify: false, write: false, plugins: [wsPlugin],
});
await fs.writeFile("scratch/forge-bundle.js", r.outputFiles[0].contents);
```

Then `upload_file` `scratch/forge-bundle.js` and replace `BUNDLE_URL` in `main.pjs` (and bump
`VERSION`). Bundle size is ~280 KB unminified (~70 KB gzipped on the wire). If you add a new export
to `src/forge.js`, also add the matching method to `lpcMapForgePlugin()` in `main.pjs` — the facade
whitelists methods, so an unlisted one throws "method is unavailable".

---

## Rebuilding the tile/prop assets

`src/terrain.png` and `src/props.png` are already correct and committed; you only need this section
if you want to regenerate or extend them. All source packs are on OpenGameArt and share the same
licensing family (CC-BY 4.0 / CC-BY 3.0 / CC-BY-SA 3.0 / GPL). See `credits.txt` for the full author
list and `props-sources.json` → `verifiedProvenance` for which sheet came from which pack (every one
is SHA-256-verified against the downloaded zip).

```
https://opengameart.org/sites/default/files/lpc-terrains.zip                  # terrain-v7.png + .tsx (the autotile table)
https://opengameart.org/sites/default/files/lpc-trees.zip                     # trees-green/brown/orange/pale/dead.png
https://opengameart.org/sites/default/files/lpc-conifers.zip                  # conifers.png
https://opengameart.org/sites/default/files/lpc-flowers-plants-fungi-wood.zip # plants.png
https://opengameart.org/sites/default/files/lpc_base_assets.zip               # base tiles incl. rock.png (the 2 rock props)
https://opengameart.org/sites/default/files/Atlas_0.zip                       # LPC Tile Atlas  -> terrain_atlas.png, base_out_atlas.png
https://opengameart.org/sites/default/files/Atlas2.zip                        # LPC Tile Atlas2 -> build_atlas.png, obj_misk_atlas.png
https://opengameart.org/sites/default/files/dungeon_0.zip                     # LPC Dungeon Elements -> dungeonex.png
https://opengameart.org/sites/default/files/submission_daneeklu.zip           # LPC Farming -> farming_fishing/plants/fence*/7 decal sheets
https://opengameart.org/sites/default/files/LPC_house_interior_0.zip          # LPC House interior -> interior.png (clock only)
```

* **terrain.png** is `terrain-v7.png` used verbatim (32 columns x 32px tiles). `tileset.js` encodes
  the tile indices straight from `terrain-v7.tsx`; if you swap the sheet, the `BASE`/`MASKS`
  indices must be regenerated from the new `.tsx`.
* **props.png** was packed from the original sheets: `props-sources.json` lists the candidate
  rectangles per sheet, and `props.js` lists the subset that made it in, in atlas order. To repack:
  fill a 2048px-wide shelf packer with the selected rects (a few px of padding), copy them
  top-left to bottom-right row by row, then rewrite each `props.js` row's `sx`/`sy` from the packer
  output. **Keep the row ORDER stable** — `species` and the row index are what saved maps reference,
  so appending new sprites at the END is safe while reordering/removing is not.
* Prop sprites are 8..271px wide at native pixel-art resolution and are drawn at 1:1 with the tile
  grid (a 271px-wide tree covers ~8.5 tiles) — that is intentional, LPC prop art is oversized
  relative to its 32px tiles.

## Conventions for future edits

* `src/` is the shipped, public, quota-consuming file tree: only files the generator actually uses.
* **Keep comments minimal.** The codebase uses file/section headers and at most a short note above a
  major exported function (`prefabs.js`'s header, `render.js`'s section headers, `buildTmx`); don't
  add line-by-line commentary.
* Never publish the generator as part of a task unless the user asks.
* Never write the literal `{import:...}` token in a `.pjs` comment — the engine's import scanner
  treats it as a real import (a comment mentioning `lpc-map-forge` once created a self-import).
* `main.pjs` holds data/configuration; user-facing UI logic belongs in `src/forge.js` / `src/ui.js`.
* Keep `src/tileset.js`'s terrain order in sync with `world.js` (both index the same 34 terrains).
* Adding a prop kind means touching three places: `props.js` (the row), `PROP_GROUPS` /
  `weightsFor` in `world.js` (how it spawns), and `PROP_CATS` in `forge.js` (the palette tab).
* Keep the standalone page and the plugin bundle in lockstep: **any `src/` change must be
  re-bundled and re-uploaded** or importers keep the old code.

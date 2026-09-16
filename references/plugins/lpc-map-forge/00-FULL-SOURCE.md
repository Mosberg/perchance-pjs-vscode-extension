# LPC Map Forge — full source (complete, unminified)

Every text file of the project, verbatim, organised by category. Binary assets (PNGs) are not
inlined here; they ship as real files under `03-third-party-assets/`.

---

## 00-README.md

_4571 bytes_

```markdown
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

```

## 01-internal-code/main.pjs

_5245 bytes_

```javascript
// Created by Mosberg https://github.com/Mosberg

$meta
  title = LPC Map Forge - procedural 2D map generator + editor
  description = Generate a procedural top-down fantasy world from the Liberated Pixel Cup tileset, then paint terrain, place props, and export your map as PNG or JSON. Describe a world in plain English and the AI designer configures the terrain, biomes, rivers and vegetation for you.
  image = https://user.uploads.dev/file/b1a4ff3e45d1aff5846e50e0b51a7055.jpg
  tags = map, generator, procedural, tileset, lpc, world, editor, fantasy, rpg, level, pixel-art
  header
    mode = minimal

generateText = {import:ai-text-plugin}
kv = {import:kv-plugin}

// ---------------------------------------------------------------------------
// Importable plugin facade.
//
// Importing this generator (as `lpc-map-forge`) yields the object returned
// below (see `$output` at the bottom of this file). It is the same facade
// pattern as `lpc-character-creator-v2`: a tiny lazy loader in front of a
// hosted ES module bundle, so the (large) generator + renderer + editor code
// only downloads when the host actually calls into it.
//
// Headless use (no DOM needed beyond a canvas):
//   let forge = root.mapForge;
//   let map   = await forge.generate({ theme: "volcanic", width: 96, seed: 7 });
//   let grid  = await forge.toTileGrid(map);          // per-cell terrain index
//   let url   = await forge.toDataUrl(map, 1);        // full-map PNG data URL
//   let mini  = await forge.renderMinimapCanvas(map, 320);
//
// Embedded editor (shadow-DOM, fully isolated from the host page):
//   let editor = await forge.mount(containerEl, { params: { seed: 7 } });
//   editor.getMap(); editor.setMap(map); editor.onChange(...); editor.destroy();
//   // or a fullscreen modal:  await forge.open({ onClose: () => {} });
//
// The asset URLs are centralized here so a future bundle update only needs the
// versioned URLs below changed. Rebuild recipe: `src/README.md`.
lpcMapForgePlugin() =>
  const BUNDLE_URL = "https://user.uploads.dev/file/445502302a2cce22c265bda8ab0e3c7d.js";
  const TILESET_URL = "https://user.uploads.dev/file/36c1d0f3ab45543e18be2249439688d7.png";
  const PROPS_URL = "https://user.uploads.dev/file/25de81c0ec6252a077c4a19d1dd8579c.png";
  const VERSION = "1.5.1";
  let modulePromise;
  const load = () => {
    if (!modulePromise) {
      modulePromise = import(BUNDLE_URL).catch((error) => {
        modulePromise = null;
        throw error;
      });
    }
    return modulePromise;
  };
  const options = (value) => Object.assign({ tilesetUrl: TILESET_URL, propsUrl: PROPS_URL }, value || {});
  const call = async (method, args) => {
    const module = await load();
    if (typeof module[method] !== "function") {
      throw new Error("LPC map forge method is unavailable: " + method);
    }
    return module[method](...args);
  };
  return {
    version: VERSION,
    bundleUrl: BUNDLE_URL,
    tilesetUrl: TILESET_URL,
    propsUrl: PROPS_URL,
    load,
    // catalog: { version, themes, terrains, sizes }
    info: () => call("pluginInfo", []),
    // map data in / out (JSON-safe; { format, params, W, H, cw, ch, corners, props, ... })
    generate: (params, o) => call("generate", [params || {}]),
    generateWorld: (params) => call("generateWorld", [params || {}]),
    serialize: (world, meta) => call("serialize", [world, meta || {}]),
    deserialize: (data, fallbackParams) => call("deserialize", [data, fallbackParams]),
    // gameplay helper: { W, H, tiles: number[] } where tiles[i] is a TERRAINS index
    toTileGrid: (world) => call("toTileGrid", [world]),
    // Tiled export: an XML string ready to save as .tmx (terrain layers + props as objects)
    toTmx: (world, meta) => call("buildTmx", [world, meta || {}]),
    // rendering (lazily loads the tileset + prop atlas)
    renderFull: (world, scale, o) => call("renderFull", [world, scale || 1, options(o)]),
    renderFullCanvas: (world, scale, o) => call("renderFullCanvas", [world, scale || 1, options(o)]),
    renderMinimap: (world, size, o) => call("renderMinimap", [world, size || 320, options(o)]),
    renderMinimapCanvas: (world, size, o) => call("renderMinimapCanvas", [world, size || 320, options(o)]),
    toDataUrl: (world, scale, o) => call("toDataUrl", [world, scale || 1, options(o)]),
    // the editor: `mount` embeds it in a container, `open` shows a modal overlay
    mount: (container, o) => call("mountMapForge", [container, options(o)]),
    open: (o) => call("openMapForge", [options(o)]),
  };

$output = [lpcMapForgePlugin()]

config
  theme = temperate
  seed = 478211
  width = 96
  height = 96
  seaLevel = 0.44
  island = 0.45
  shore = 0.5
  relief = 0.5
  temperature = 0.58
  moisture = 0.55
  snow = 0.45
  autumn = 0.08
  rivers = 0.55
  lakes = 0.5
  forest = 0.42
  plants = 0.45
  flowers = 0.5
  rocks = 0.3
  ore = 0.35
  lava = 0.5
  paths = 0.3
  farms = 0.4
  crops = 1
  villages = 0.35
  villageSize = 1
  market = 1
  landmarks = 1
  camps = 0.5
  graves = 1
  ruins = 1
  harbors = 1
  wildlife = 1
  reeds = 0.4
  propDensity = 1
  fragment = 0.1
  waterTint = auto

themes
  temperate
  autumn
  tropical
  desert
  tundra
  boreal
  swamp
  highland
  volcanic
  archipelago

```

## 01-internal-code/index.html

_1144 bytes_

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta
    name="description"
    content="Create and edit maps for LPC-based games."
  />
  <meta name="author" content="Mosberg" />
  <meta
    name="keywords"
    content="lpc, character creator, sprite, spritesheet, avatar, pixel art, rpg, fantasy, map editor"
  />
  <link
    rel="icon"
    href="https://mosberg.github.io/LPCGame/src/images/embervale.webp"
  />

  <title>LPC Map Forge</title>
</head>

<style>
  html,
  body {
    height: 100%;
  }
  body {
    margin: 0;
    overflow: hidden;
    background: #0d1117;
  }
  #forgeHost {
    display: block;
    height: 100%;
  }
</style>

<div id="forgeHost"></div>

<script type="module">
  import { mountMapForge } from "./src/forge.js";
  mountMapForge(document.getElementById("forgeHost"), {
    fullscreen: true,
  }).catch((e) => {
    console.error(e);
    document.getElementById("forgeHost").innerHTML =
      '<div style="padding:24px;color:#e8ecf3;font-family:sans-serif">Failed to start: ' +
      String((e && e.message) || e) +
      "</div>";
  });
</script>

```

## 01-internal-code/src/forge.js

_66416 bytes_

```javascript
import { Renderer, planCell } from "./render.js";
import { Editor } from "./editor.js";
import { generateWorld, DEFAULT_PARAMS, THEMES, normalizeParams, scatterWorldProps } from "./world.js";
import { TERRAINS, TERRAIN_INDEX, BASE, RANK, TILE, COLUMNS, TILESET_IMAGE } from "./tileset.js";
import { PROPS } from "./props.js";
import { PREFABS, prefabBounds } from "./prefabs.js";
import { mulberry32, valueNoise2D, clamp, hash2i } from "./noise.js";
import { UI_CSS, UI_HTML } from "./ui.js";

export { THEMES, DEFAULT_PARAMS, TERRAINS, normalizeParams, generateWorld };
export { PROPS } from "./props.js";
export { PREFABS } from "./prefabs.js";

const SIZES = [48, 64, 96, 128, 160, 192, 256];
const KV_FOLDER = "lpcMaps";
const FORMAT = "lpc-map-forge";
const VERSION = 1;

const SLIDERS = [
  ["seaLevel", "Sea level"],
  ["island", "Island-ness"],
  ["shore", "Beach"],
  ["fragment", "Fragmentation"],
  ["relief", "Relief"],
  ["temperature", "Temperature"],
  ["moisture", "Moisture"],
  ["snow", "Snow"],
  ["autumn", "Autumn"],
  ["rivers", "Rivers"],
  ["lakes", "Lakes"],
  ["forest", "Forest"],
  ["plants", "Plants"],
  ["flowers", "Flowers"],
  ["rocks", "Rocks"],
  ["ore", "Ore"],
  ["lava", "Lava"],
  ["reeds", "Reeds"],
  ["propDensity", "Prop density"],
  ["paths", "Paths"],
  ["farms", "Farms"],
  ["crops", "Field crops"],
  ["villages", "Villages"],
  ["villageSize", "Village size"],
  ["market", "Market wares"],
  ["landmarks", "Landmarks"],
  ["camps", "Wild camps"],
  ["graves", "Graveyards"],
  ["ruins", "Ruins"],
  ["harbors", "Harbours"],
  ["wildlife", "Wildlife"],
];

const THEME_INHERIT = ["temperature", "moisture", "relief", "autumn", "snow", "island", "seaLevel", "fragment", "farms", "villages", "reeds", "lava"];

const PROP_CATS = [
  { id: "all", label: "All" },
  { id: "trees", label: "Trees", kinds: ["tree", "cherry", "fruit_tree", "dead_tree", "conifer", "conifer_snow"] },
  { id: "bush", label: "Bushes", kinds: ["bush", "plant", "mushroom"] },
  { id: "crop", label: "Crops", kinds: ["crop", "reed"] },
  { id: "rock", label: "Rocks", kinds: ["rock", "log", "stump"] },
  { id: "building", label: "Buildings", kinds: ["structure"] },
  { id: "fence", label: "Fences", kinds: ["fence"] },
  { id: "village", label: "Village", kinds: ["barrel", "cart", "sack", "sign", "lantern", "statue", "stall", "boat"] },
  { id: "grave", label: "Graves", kinds: ["gravestone"] },
  { id: "life", label: "Wildlife", kinds: ["animal"] },
  { id: "ground", label: "Ground", kinds: ["decal"] },
  { id: "goods", label: "Goods", kinds: ["good"] },
  { id: "interior", label: "Interior", kinds: ["furniture"] },
];

const AI_PREFIX = `You are the world designer for a top-down fantasy map generator built on the Liberated Pixel Cup (LPC) terrain tileset: grass, light/dark/dead grass, soil, dirt (tan/brown/dark), sand, gravel, snow, ice, mud, cracked earth, rock (white/gray/dark/black), stone, mudstone, shallow/deep ocean water, rivers, lakes and lava.

Translate the player's description into generator settings. Reply with ONLY one JSON object - no prose, no markdown code fence. Use exactly these keys:

{"name":"<evocative map name, 2-4 words>","legend":"<1-2 sentences describing the major regions, landmarks and mood of this map>","theme":"temperate|autumn|tropical|desert|tundra|boreal|swamp|highland|volcanic|archipelago","size":48|64|96|128|160|192|256,"seed":<any integer>,"seaLevel":<0..1>,"island":<0..1>,"shore":<0..1>,"fragment":<0..1>,"relief":<0..1>,"temperature":<0..1>,"moisture":<0..1>,"snow":<0..1>,"autumn":<0..1>,"rivers":<0..1>,"lakes":<0..1>,"forest":<0..1.5>,"plants":<0..1.5>,"flowers":<0..1.5>,"rocks":<0..1.5>,"ore":<0..1.5>,"lava":<0..1.5>,"reeds":<0..1.5>,"propDensity":<0.2..2>,"paths":<0..1>,"farms":<0..1.5>,"crops":<0..2>,"villages":<0..1.5>,"villageSize":<0.4..1.8>,"market":<0..2>,"landmarks":<0..1.6>,"camps":<0..2>,"graves":<0..2>,"ruins":<0..2>,"harbors":<0..2>,"wildlife":<0..2>}

Field meanings: seaLevel higher = more ocean; island higher = smaller landmass ringed by water; shore = width of the sandy/gravel beach band along every coastline (0 = cliffs and rocks plunge straight into the water, 1 = wide dunes and beaches); fragment higher = the land breaks up into many separate islands and inlets (0 = one solid continent); relief higher = taller mountains and deeper valleys; temperature higher = warmer; moisture higher = wetter (lush/swampy); snow higher = more snow; autumn higher = more orange foliage; rivers/lakes = water feature abundance; forest/plants = vegetation density; flowers = density of colourful wildflower clumps on grassland and meadows; rocks = exposed rock, boulders and scree; ore = exposed ore veins, nuggets and mineral outcrops on rock and mountain terrain; lava = amount of molten lava and cracked volcanic ground (only appears on hot, dry, rocky terrain - 0 = none, 1.5 = a molten wasteland of lava lakes and fissures); propDensity = overall density of ALL scattered ground detail (trees, bushes, plants, rocks, reeds) as a multiplier - use about 0.3 for a sparse, windswept or barren look and about 1.8 for a dense overgrown jungle or deep forest floor; paths = number of dirt trails carved between flat regions; farms = amount of farmland (tilled fields, crops and fences around settlements); crops = how thickly planted those fields are (0 = bare tilled soil, 1 = normal, 2 = densely cropped); villages = number of settled places (cobbled plaza with wells, statues, market stalls, carts, barrels, lanterns, houses and a windmill, joined by roads and bridges); villageSize = how far each settlement sprawls (0.4 = a tiny hamlet, 1.8 = a sprawling town); market = how busy each settlement's market is - market stalls and the goods piled on them, from produce baskets and pots to vases and trinkets (0 = none, 2 = a bustling bazaar); reeds = density of reeds and lily pads along water edges; landmarks = amount of special landmark features and how often they appear; camps = number of wild camps in the backcountry (canvas tents, cook fires, cauldrons, firewood and carts, pitched far from any village); graves = density of graveyards next to settlements (rows of headstones, iron fences and dead trees); ruins = density of crumbling ruins scattered through the wild (broken walls, collapsed buildings); harbors = density of stone harbours along the coast (docks, piers and moored boats); wildlife = number of grazing animals (cows on open grass, deer in woodland) roaming the wild.

Be decisive and express the description strongly - push values well away from 0.5 when the description implies it. Pick a theme whose baseline matches the world (e.g. tropical for jungle islands, volcanic for lava, tundra for frozen wastes).

Player description:
`;

const NAME_PREFIX = `You are naming and describing a map from a top-down fantasy map generator. You will be given the map's generator settings and statistics. Reply with ONLY one JSON object - no prose, no markdown fence: {"name":"<evocative 2-4 word map name>","legend":"<1-2 sentences describing the regions, landmarks and mood>"}.

Map data:
`;

function el(tag, props, children) {
  const n = document.createElement(tag);
  if (props) for (const k of Object.keys(props)) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "html") n.innerHTML = v;
    else if (k === "style" && typeof v === "object") Object.assign(n.style, v);
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) n.setAttribute(k, "");
    else n.setAttribute(k, v);
  }
  if (children != null) for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return n;
}

function rootScope() {
  try { if (typeof root !== "undefined" && root) return root; } catch (e) {}
  return window.root || null;
}

function plugin(name) {
  const r = rootScope();
  return r ? r[name] : null;
}

function fmt(v) { return Number(v).toFixed(2); }
function r2(v) { return Math.round(v * 100) / 100; }

export function serialize(world, meta) {
  const m = meta || {};
  const out = {
    format: FORMAT,
    version: VERSION,
    name: m.name != null ? String(m.name) : (world.name || ""),
    legend: m.legend != null ? String(m.legend) : (world.legend || ""),
    params: { ...(world.params || {}) },
    W: world.W, H: world.H, cw: world.cw, ch: world.ch,
    corners: Array.from(world.corners),
    props: (world.props || []).map((p) => ({ ...p })),
    labels: (world.labels || []).map((l) => ({ ...l })),
  };
  if (m.saved) out.saved = m.saved;
  if (world.stats) out.stats = { ...world.stats };
  return out;
}

export function deserialize(data, fallbackParams) {
  if (!data || typeof data.W !== "number" || !Array.isArray(data.corners)) throw new Error("not a map file");
  const W = data.W, H = data.H, cw = data.cw || W + 1, ch = data.ch || H + 1;
  const n = cw * ch;
  const corners = Uint8Array.from(data.corners);
  if (corners.length !== n) throw new Error("corner count mismatch");
  const z = () => new Float32Array(n);
  const p = normalizeParams(data.params || fallbackParams);
  return {
    params: p, W, H, cw, ch, corners,
    props: Array.isArray(data.props) ? data.props.map((r) => ({ ...r })) : [],
    labels: Array.isArray(data.labels) ? data.labels.map((l) => ({ ...l })) : [],
    fields: { elev: z(), water: new Uint8Array(n), depth: z(), moist: z(), temp: z(), rock: z(), flow: z(), distWater: z() },
    stats: data.stats ? { ...data.stats } : null,
    name: data.name || "",
    legend: data.legend || "",
  };
}

export function generate(params) {
  return serialize(generateWorld(params || {}));
}

export function toTileGrid(world) {
  const W = world.W, H = world.H, cw = world.cw, corners = world.corners;
  const tiles = new Uint8Array(W * H);
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const c0 = corners[ty * cw + tx];
      const c1 = corners[ty * cw + tx + 1];
      const c2 = corners[(ty + 1) * cw + tx];
      const c3 = corners[(ty + 1) * cw + tx + 1];
      let best = c0;
      if (RANK[c1] > RANK[best]) best = c1;
      if (RANK[c2] > RANK[best]) best = c2;
      if (RANK[c3] > RANK[best]) best = c3;
      tiles[ty * W + tx] = best;
    }
  }
  return { W, H, tiles: Array.from(tiles) };
}

const TERRAIN_ATLAS = { width: 1024, height: 2048 };

function xmlEscape(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]
  ));
}

// Exports the world as a Tiled (.tmx) map. The terrain is written as a stack of
// tile layers (one per composite id produced by `planCell`, so the result is
// pixel-identical to the editor's own rendering) and every prop becomes an
// object carrying its atlas sprite index, kind and flip flag.
export function buildTmx(world, meta) {
  const m = meta || {};
  const W = world.W, H = world.H, cw = world.cw, corners = world.corners;
  const cells = new Array(W * H);
  let layers = 1;
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const ids = planCell([
        corners[ty * cw + tx], corners[ty * cw + tx + 1],
        corners[(ty + 1) * cw + tx], corners[(ty + 1) * cw + tx + 1],
      ], hash2i(tx, ty, 0x9e37) >>> 0);
      cells[ty * W + tx] = ids;
      if (ids.length > layers) layers = ids.length;
    }
  }
  const props = world.props || [];
  const out = [];
  out.push('<?xml version="1.0" encoding="UTF-8"?>');
  out.push('<map version="1.10" tiledversion="1.10.2" orientation="orthogonal" renderorder="right-down" width="' + W + '" height="' + H + '" tilewidth="' + TILE + '" tileheight="' + TILE + '" infinite="0" nextlayerid="' + (layers + 2) + '" nextobjectid="' + (props.length + 1) + '">');
  out.push('  <properties>');
  out.push('    <property name="format" value="lpc-map-forge"/>');
  if (m.name) out.push('    <property name="name" value="' + xmlEscape(m.name) + '"/>');
  if (m.legend) out.push('    <property name="legend" value="' + xmlEscape(m.legend) + '"/>');
  out.push('    <property name="seed" type="int" value="' + (world.params && world.params.seed || 0) + '"/>');
  out.push('    <property name="theme" value="' + xmlEscape((world.params && world.params.theme) || "") + '"/>');
  out.push('    <property name="size" value="' + W + "x" + H + '"/>');
  out.push('    <property name="params" value="' + xmlEscape(JSON.stringify(world.params || {})) + '"/>');
  out.push('  </properties>');
  const tilesetCols = COLUMNS;
  const tilesetRows = Math.max(1, Math.floor(TERRAIN_ATLAS.height / TILE));
  out.push('  <tileset firstgid="1" name="terrain" tilewidth="' + TILE + '" tileheight="' + TILE + '" tilecount="' + (tilesetCols * tilesetRows) + '" columns="' + tilesetCols + '">');
  out.push('    <image source="terrain.png" width="' + TERRAIN_ATLAS.width + '" height="' + TERRAIN_ATLAS.height + '"/>');
  out.push('  </tileset>');
  for (let k = 0; k < layers; k++) {
    out.push('  <layer id="' + (k + 1) + '" name="' + (k === 0 ? "Ground" : "Overlay " + k) + '" width="' + W + '" height="' + H + '">');
    out.push('    <data encoding="csv">');
    for (let ty = 0; ty < H; ty++) {
      const row = new Array(W);
      for (let tx = 0; tx < W; tx++) {
        const ids = cells[ty * W + tx];
        row[tx] = ids[k] != null ? ids[k] + 1 : 0;
      }
      out.push("      " + row.join(",") + (ty === H - 1 ? "" : ","));
    }
    out.push('    </data>');
    out.push('  </layer>');
  }
  out.push('  <objectgroup id="' + (layers + 1) + '" name="Props">');
  let id = 0;
  for (const p of props) {
    const row = PROPS[p.s];
    if (!row) continue;
    const sc = p.sc || 1;
    const w = Math.round(row[2] * sc), h = Math.round(row[3] * sc);
    const x = Math.round(p.x - w / 2), y = Math.round(p.y - h);
    out.push('    <object id="' + (++id) + '" name="' + xmlEscape(row[7] || row[4] + " " + row[5]) + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '">');
    out.push('      <properties>');
    out.push('        <property name="sprite" type="int" value="' + p.s + '"/>');
    out.push('        <property name="kind" value="' + xmlEscape(row[4]) + '"/>');
    if (row[7]) out.push('        <property name="label" value="' + xmlEscape(row[7]) + '"/>');
    if (p.flip) out.push('        <property name="flip" type="bool" value="true"/>');
    if (sc !== 1) out.push('        <property name="scale" type="float" value="' + sc + '"/>');
    out.push('      </properties>');
    out.push('    </object>');
  }
  out.push('  </objectgroup>');
  out.push('</map>');
  return out.join("\n");
}

let headlessRenderer = null;
async function ensureHeadless(opts) {
  if (!headlessRenderer) headlessRenderer = new Renderer();
  if (!headlessRenderer.ready) await headlessRenderer.load({ tilesetUrl: opts && opts.tilesetUrl, propsUrl: opts && opts.propsUrl });
  return headlessRenderer;
}

export async function renderFull(world, scale, opts) {
  const r = await ensureHeadless(opts || {});
  return r.renderFull(world, scale || 1, opts || {});
}

export async function renderMinimap(world, size, opts) {
  const r = await ensureHeadless(opts || {});
  return r.renderMinimap(world, size || 320);
}

export async function renderFullCanvas(world, scale, opts) {
  const src = await renderFull(world, scale, opts);
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  c.getContext("2d").drawImage(src, 0, 0);
  return c;
}

export async function renderMinimapCanvas(world, size, opts) {
  const src = await renderMinimap(world, size, opts);
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  c.getContext("2d").drawImage(src, 0, 0);
  return c;
}

export async function toDataUrl(world, scale, opts) {
  const src = await renderFull(world, scale, opts);
  const blob = src.convertToBlob ? await src.convertToBlob({ type: "image/png" }) : null;
  if (!blob) throw new Error("Render failed");
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error("encode failed"));
    fr.readAsDataURL(blob);
  });
}

export const PLUGIN_VERSION = "1.0.0";
export function pluginInfo() {
  return { name: "lpc-map-forge", version: PLUGIN_VERSION, themes: Object.keys(THEMES), terrains: TERRAINS.slice(), sizes: SIZES.slice() };
}

export async function mountMapForge(container, options) {
  const o = options || {};
  const shadow = container.shadowRoot || container.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${UI_CSS}</style>${UI_HTML}`;
  if (o.fullscreen) container.classList.add("forge-fullscreen");
  else container.classList.remove("forge-fullscreen");
  if (o.className) container.classList.add(...String(o.className).split(/\s+/).filter(Boolean));

  const $ = (id) => shadow.querySelector("#" + id);
  const $$ = (sel) => shadow.querySelectorAll(sel);
  const closeDrawers = () => { const l = $("left"), r = $("right"); if (l) l.classList.remove("open"); if (r) r.classList.remove("open"); };
  const PANEL_TOOLS = new Set(["prop", "stamp", "label"]);

  const renderer = new Renderer();
  const editor = new Editor(renderer);
  let params = normalizeParams({ ...DEFAULT_PARAMS });
  const optionParams = o.params || null;
  const optionTheme = o.theme && THEMES[o.theme] ? o.theme : null;
  const optionSeed = o.seed != null ? (Math.floor(Number(o.seed) || 0) >>> 0) : null;
  const optionSize = o.size ? (Number(o.size) || 0) : 0;
  function applyOptions() {
    if (optionParams) params = normalizeParams({ ...params, ...optionParams });
    if (optionTheme) params.theme = optionTheme;
    if (optionSeed != null) params.seed = optionSeed;
    if (optionSize) params.width = params.height = optionSize;
  }
  let world = null;
  let mapName = o.name || "";
  let legend = "";
  let busyDepth = 0;
  let activeCat = "all";
  let propQuery = "";
  let minimapTimer = 0;
  let toastTimer = 0;
  let destroyed = false;
  const listeners = new Set();
  const disposers = [];

  function emit(reason) {
    const payload = { reason, editor, world, params: world ? world.params : params, api };
    for (const cb of Array.from(listeners)) {
      try { cb(payload); } catch (e) { console.error(e); }
    }
  }

  function showBusy(label) {
    busyDepth++;
    $("busyText").textContent = label || "Working";
    $("busy").hidden = false;
  }
  function hideBusy() {
    busyDepth = Math.max(0, busyDepth - 1);
    if (!busyDepth) $("busy").hidden = true;
  }
  function nextFrame() {
    return new Promise((r) => requestAnimationFrame(() => setTimeout(r, 16)));
  }
  async function withBusy(label, fn) {
    showBusy(label);
    await nextFrame();
    try { return await fn(); } finally { hideBusy(); }
  }

  function toast(msg, isErr) {
    const t = el("div", { class: "toast" + (isErr ? " err" : ""), text: msg });
    shadow.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), isErr ? 5200 : 2600);
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function safeName() {
    const n = ($("mapName").value || "lpc-map").trim();
    return n.replace(/[^a-z0-9\-_ ]+/gi, "").replace(/\s+/g, "-").toLowerCase() || "lpc-map";
  }

  function applyThemeParams(t, keepTint) {
    if (!t) return;
    for (const k of THEME_INHERIT) if (t[k] !== undefined) params[k] = t[k];
    if (!keepTint) params.waterTint = t.waterTint || "auto";
    params.volcanic = !!t.volcanic;
  }

  function buildTerrainPalette() {
    const ctn = $("terrainPalette");
    ctn.innerHTML = "";
    TERRAINS.forEach((name, i) => {
      const c = document.createElement("canvas");
      c.width = 32; c.height = 32;
      const g = c.getContext("2d");
      g.imageSmoothingEnabled = false;
      const id = BASE[i];
      g.drawImage(renderer.terrainImg, (id % COLUMNS) * TILE, Math.floor(id / COLUMNS) * TILE, TILE, TILE, 0, 0, 32, 32);
      const b = el("button", { class: "swatch", title: name.replace(/_/g, " "), "data-terrain": i }, [c]);
      b.addEventListener("click", () => { editor.setTerrain(i); editor.setTool("brush"); });
      ctn.appendChild(b);
    });
  }

  function propThumb(idx, size) {
    const row = PROPS[idx];
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    const pad = 3;
    const s = Math.min((size - pad * 2) / row[2], (size - pad * 2) / row[3]);
    const w = row[2] * s, h = row[3] * s;
    g.drawImage(renderer.propImg, row[0], row[1], row[2], row[3], (size - w) / 2, (size - h) / 2, w, h);
    return c;
  }

  function propsInCat(id) {
    const out = [];
    const cat = PROP_CATS.find((c) => c.id === id);
    if (!cat) return out;
    const kinds = cat.kinds;
    const q = propQuery.trim().toLowerCase();
    const terms = q ? q.split(/\s+/) : null;
    PROPS.forEach((row, i) => {
      if (id !== "all" && !(kinds && kinds.includes(row[4]))) return;
      if (terms) {
        const hay = ((row[7] ? row[7] + " " : "") + row[4] + " " + row[5] + " #" + row[6]).toLowerCase();
        for (const t of terms) if (!hay.includes(t)) return;
      }
      out.push(i);
    });
    return out;
  }

  function buildPropPalette() {
    const cats = $("propCats");
    cats.innerHTML = "";
    for (const c of PROP_CATS) {
      const b = el("button", { class: "toggle" + (c.id === activeCat ? " on" : ""), text: c.label });
      b.addEventListener("click", () => { activeCat = c.id; buildPropPalette(); });
      cats.appendChild(b);
    }
    const grid = $("propPalette");
    grid.innerHTML = "";
    const ids = propsInCat(activeCat);
    const frag = document.createDocumentFragment();
    for (const i of ids) {
      const row = PROPS[i];
      const b = el("button", {
        class: "propCell" + (i === editor.propIndex ? " on" : ""),
        title: (row[7] ? row[7] : row[4] + " / " + row[5]) + " #" + row[6],
        "data-prop": i,
      }, [propThumb(i, 48)]);
      b.addEventListener("click", () => editor.setProp(i));
      frag.appendChild(b);
    }
    grid.appendChild(frag);
    const count = $("propCount");
    if (count) count.textContent = ids.length + (propQuery.trim() ? " matching sprites" : " sprites");
  }

  const SLIDER_MAX = { forest: 1.5, plants: 1.5, flowers: 1.5, rocks: 1.5, ore: 1.5, lava: 1.5, farms: 1.5, crops: 2, villages: 1.5, reeds: 1.5, propDensity: 2, villageSize: 1.8, market: 2, landmarks: 1.6, camps: 2, graves: 2, ruins: 2, harbors: 2, wildlife: 2 };

  function prefabThumb(index) {
    const pf = PREFABS[index];
    const c = document.createElement("canvas");
    const b = prefabBounds(index);
    if (!pf || !b) return c;
    const bw = Math.max(1, b.x1 - b.x0), bh = Math.max(1, b.y1 - b.y0);
    const pad = 3;
    const s = Math.min(1, 150 / Math.max(bw, bh));
    c.width = Math.max(1, Math.round((bw + pad * 2) * s));
    c.height = Math.max(1, Math.round((bh + pad * 2) * s));
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.save();
    g.translate(pad - b.x0 * s, pad - b.y0 * s);
    g.scale(s, s);
    for (const part of pf.parts) {
      const row = PROPS[part.s];
      if (!row) continue;
      g.drawImage(renderer.propImg, row[0], row[1], row[2], row[3], part.dx * TILE, part.dy * TILE, row[2], row[3]);
    }
    g.restore();
    return c;
  }

  function buildPrefabPalette() {
    const list = $("prefabList");
    if (!list) return;
    list.innerHTML = "";
    const frag = document.createDocumentFragment();
    PREFABS.forEach((pf, i) => {
      const card = el("button", {
        class: "prefabCard" + (i === editor.prefabIndex ? " on" : ""),
        title: pf.label + " - " + pf.hint + " (" + pf.w + "x" + pf.h + " tiles)",
        "data-prefab": i,
      }, [prefabThumb(i), el("span", { text: pf.label })]);
      card.addEventListener("click", () => { editor.setPrefab(i); switchTab("prefabs"); updatePrefabUI(); if (innerWidth <= 900) closeDrawers(); });
      frag.appendChild(card);
    });
    list.appendChild(frag);
  }

  function updatePrefabUI() {
    const list = $("prefabList");
    if (!list) return;
    for (const b of list.querySelectorAll("button")) b.classList.toggle("on", +b.dataset.prefab === editor.prefabIndex);
    const pf = PREFABS[editor.prefabIndex];
    if (pf && $("prefabNote")) $("prefabNote").textContent = pf.label + " - " + pf.hint + " (" + pf.w + "x" + pf.h + " tiles). Click the map to place it; Shift-click clears its footprint.";
  }

  function buildParamSliders() {
    const ctn = $("paramSliders");
    ctn.innerHTML = "";
    for (const [key, label] of SLIDERS) {
      const max = SLIDER_MAX[key] || 1;
      const input = el("input", { type: "range", min: "0", max: String(max), step: "0.01", value: String(params[key]), "data-param": key });
      const val = el("i", { text: fmt(params[key]) });
      input.addEventListener("input", () => { params[key] = +input.value; val.textContent = fmt(params[key]); });
      input.addEventListener("change", () => { params[key] = +input.value; val.textContent = fmt(params[key]); markSettingsChanged(); });
      ctn.appendChild(el("div", { class: "slider" }, [el("span", { text: label }), input, val]));
    }
  }

  function syncSliders(p) {
    const ctn = $("paramSliders");
    for (const [key] of SLIDERS) {
      const input = ctn.querySelector('input[data-param="' + key + '"]');
      if (!input) continue;
      input.value = String(p[key]);
      const i = input.nextElementSibling;
      if (i) i.textContent = fmt(p[key]);
    }
  }

  function markSettingsChanged() {
    $("genBtn").classList.add("primary");
  }

  function buildThemeAndSize() {
    const th = $("themeSel");
    th.innerHTML = "";
    for (const key of Object.keys(THEMES)) th.appendChild(el("option", { value: key, text: THEMES[key].label || key }));
    th.addEventListener("change", () => {
      const t = THEMES[th.value];
      if (t) {
        const keepTint = $("waterSel").value && $("waterSel").value !== "auto";
        applyThemeParams(t, keepTint);
        syncSliders(params);
      }
      params.theme = th.value;
      regenerate();
    });
    const sz = $("sizeSel");
    sz.innerHTML = "";
    for (const s of SIZES) sz.appendChild(el("option", { value: String(s), text: s + " x " + s }));
    sz.value = String(params.width);
    sz.addEventListener("change", () => { params.width = params.height = +sz.value; regenerate(); });
  }

  function syncWorldUI(p) {
    $("themeSel").value = p.theme;
    $("seedInput").value = String(p.seed);
    $("sizeSel").value = String(p.width);
    const tint = (THEMES[p.theme] || {}).waterTint || "auto";
    $("waterSel").value = !p.waterTint || p.waterTint === tint ? "auto" : p.waterTint;
    syncSliders(p);
  }

  function regenerate() {
    return withBusy("Generating world", () => {
      params = normalizeParams(params);
      const keepLabels = world && world.labels && world.labels.length ? world.labels.map((l) => ({ tx: l.tx, ty: l.ty, name: l.name })) : null;
      const w = generateWorld(params);
      w.name = mapName;
      w.legend = legend;
      if (keepLabels && !(w.labels && w.labels.length)) {
        const lim = (l) => ({ tx: Math.max(0, Math.min(w.W - 1, l.tx)), ty: Math.max(0, Math.min(w.H - 1, l.ty)), name: l.name });
        w.labels = keepLabels.map(lim);
      }
      world = w;
      editor.setWorld(w);
      renderer.ensureWorldImage(w);
      syncWorldUI(w.params);
      refreshStats();
      scheduleMinimap();
      buildLabelList();
      $("genBtn").classList.remove("primary");
      emit("generate");
    });
  }

  function refreshStats() {
    if (!world) return;
    const s = world.stats || {};
    const landPct = s.land != null ? Math.round((s.land / (world.cw * world.ch)) * 100) : null;
    $("mapStats").textContent = [
      landPct != null ? landPct + "% land" : null,
      s.riverCells != null ? s.riverCells + " rivers" : null,
      s.pathsMade ? s.pathsMade + (s.pathsMade > 1 ? " roads" : " road") : null,
      s.villages ? s.villages + (s.villages > 1 ? " villages" : " village") : null,
      s.farms ? s.farms + (s.farms > 1 ? " farms" : " farm") : null,
      s.graves ? s.graves + (s.graves > 1 ? " graveyards" : " graveyard") : null,
      s.docks ? s.docks + (s.docks > 1 ? " harbours" : " harbour") : null,
      s.ruins ? s.ruins + (s.ruins > 1 ? " ruins" : " ruin") : null,
    ].filter(Boolean).join(" \u00b7 ");
  }

  function scheduleMinimap() {
    clearTimeout(minimapTimer);
    minimapTimer = setTimeout(drawMinimap, 220);
  }

  function drawMinimap() {
    if (!world || !renderer.ready) return;
    const src = editor.refreshMinimap();
    if (!src) return;
    const cvs = $("minimap");
    cvs.width = src.width;
    cvs.height = src.height;
    const g = cvs.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, src.width, src.height);
    g.drawImage(src, 0, 0);
    $("mapStats").dataset.ready = "1";
    updateMiniBox();
  }

  function updateMiniBox() {
    const box = $("miniBox"), cvs = $("minimap");
    if (!box || !cvs || !world || !editor.view) return;
    const cw = cvs.clientWidth, ch = cvs.clientHeight;
    if (!cw || !ch) return;
    const v = editor.view;
    const mapW = Math.max(1, world.W * TILE), mapH = Math.max(1, world.H * TILE);
    const vw = (editor.viewW || 0) / v.zoom, vh = (editor.viewH || 0) / v.zoom;
    const x = Math.min(cw, Math.max(0, (v.x / mapW) * cw));
    const y = Math.min(ch, Math.max(0, (v.y / mapH) * ch));
    const w = Math.min(cw - x, (vw / mapW) * cw);
    const h = Math.min(ch - y, (vh / mapH) * ch);
    box.style.left = x + "px";
    box.style.top = y + "px";
    box.style.width = Math.max(6, w) + "px";
    box.style.height = Math.max(6, h) + "px";
  }

  function updateToolUI() {
    const rail = $("toolRail");
    for (const b of rail.querySelectorAll("button")) b.classList.toggle("on", b.dataset.tool === editor.tool);
    $("shapeSquare").classList.toggle("on", editor.shape === "square");
    $("shapeRound").classList.toggle("on", editor.shape === "round");
  }

  function updateTerrainUI() {
    const ctn = $("terrainPalette");
    for (const b of ctn.querySelectorAll("button")) b.classList.toggle("on", +b.dataset.terrain === editor.terrain);
    $("terrainNote").textContent = TERRAINS[editor.terrain].replace(/_/g, " ");
  }

  function updatePropUI() {
    for (const b of $("propPalette").querySelectorAll("button")) b.classList.toggle("on", +b.dataset.prop === editor.propIndex);
  }

  function updateHistoryUI() {
    $("undoBtn").disabled = !editor.canUndo();
    $("redoBtn").disabled = !editor.canRedo();
  }

  function switchTab(name) {
    for (const b of $$(".tab")) b.classList.toggle("on", b.dataset.tab === name);
    $("terrainPane").hidden = name !== "terrain";
    $("propPane").hidden = name !== "props";
    $("prefabPane").hidden = name !== "prefabs";
    $("labelPane").hidden = name !== "labels";
  }

  function buildLabelList() {
    const list = $("labelList");
    if (!list) return;
    list.innerHTML = "";
    const labels = (world && world.labels) || [];
    const frag = document.createDocumentFragment();
    labels.forEach((l, i) => {
      const input = el("input", { type: "text", value: l.name || "", maxlength: "40" });
      input.addEventListener("change", () => { editor.renameLabel(i, input.value); buildLabelList(); });
      input.addEventListener("focus", () => { editor.selectedLabel = i; editor.requestDraw(); updateLabelUI(); });
      const row = el("div", { class: "labelRow" + (i === editor.selectedLabel ? " on" : ""), "data-label": i }, [
        el("span", { class: "dot" }),
        input,
        el("button", { title: "Jump to this label", html: "&#10148;", onclick: () => { editor.selectedLabel = i; editor.centerOn((l.tx + 0.5) * TILE, (l.ty + 0.5) * TILE); updateLabelUI(); } }),
        el("button", { title: "Delete this label", html: "&#215;", onclick: () => { editor.removeLabel(i); buildLabelList(); } }),
      ]);
      row.addEventListener("pointerdown", (e) => { if (e.target === row || e.target.classList.contains("dot")) { editor.selectedLabel = i; editor.requestDraw(); updateLabelUI(); } });
      frag.appendChild(row);
    });
    list.appendChild(frag);
    updateLabelUI();
  }

  function updateLabelUI() {
    const labels = (world && world.labels) || [];
    if ($("labelCount")) $("labelCount").textContent = labels.length ? labels.length + (labels.length > 1 ? " labels" : " label") + " \u00b7 drag one on the map to move it" : "No labels yet - type a name and click Place";
    const list = $("labelList");
    if (list) for (const r of list.querySelectorAll(".labelRow")) r.classList.toggle("on", +r.dataset.label === editor.selectedLabel);
  }

  function wireToolbar() {
    $("genBtn").addEventListener("click", () => regenerate());
    $("undoBtn").addEventListener("click", () => editor.undo());
    $("redoBtn").addEventListener("click", () => editor.redo());
    $("fitBtn").addEventListener("click", () => editor.fit());
    $("gridBtn").addEventListener("click", (e) => { editor.opts.grid = !editor.opts.grid; e.currentTarget.classList.toggle("on", editor.opts.grid); editor.requestDraw(); });
    $("propBtn").addEventListener("click", (e) => { editor.opts.props = !editor.opts.props; e.currentTarget.classList.toggle("on", editor.opts.props); editor.requestDraw(); });
    $("shadowBtn").addEventListener("click", (e) => { editor.opts.shadows = !editor.opts.shadows; e.currentTarget.classList.toggle("on", editor.opts.shadows); editor.requestDraw(); });
    $("fieldSel").addEventListener("change", (e) => { editor.opts.field = e.currentTarget.value; editor.requestDraw(); });
    $("randSeedBtn").addEventListener("click", () => {
      params.seed = Math.floor(Math.random() * 1000000000);
      $("seedInput").value = String(params.seed);
      regenerate();
    });
    $("seedInput").addEventListener("change", () => { params.seed = Math.max(0, Math.floor(+$("seedInput").value || 0)); regenerate(); });
    $("resetParamsBtn").addEventListener("click", () => {
      const t = THEMES[params.theme] || {};
      const base = { ...DEFAULT_PARAMS };
      for (const k of THEME_INHERIT) base[k] = t[k] !== undefined ? t[k] : DEFAULT_PARAMS[k];
      base.theme = params.theme;
      base.seed = params.seed;
      base.width = base.height = params.width;
      base.propDensity = params.propDensity;
      base.villageSize = params.villageSize;
      base.market = params.market;
      base.waterTint = t.waterTint || "auto";
      base.volcanic = !!t.volcanic;
      params = base;
      syncSliders(params);
      regenerate();
    });
    $("randomizeBtn").addEventListener("click", () => {
      const r = (a, b) => a + Math.random() * (b - a);
      params.seaLevel = r(0.32, 0.58);
      params.island = r(0.1, 0.8);
      params.fragment = r(0, 0.5);
      params.relief = r(0.2, 0.9);
      params.temperature = r(0.15, 0.95);
      params.moisture = r(0.1, 0.9);
      params.snow = r(0, 0.85);
      params.autumn = r(0, 0.6);
      params.rivers = r(0.15, 0.9);
      params.lakes = r(0.15, 0.9);
      params.forest = r(0.15, 1.1);
      params.plants = r(0.2, 1.1);
      params.rocks = r(0.1, 0.9);
      params.ore = r(0.1, 0.9);
      params.lava = r(0.2, 0.9);
      params.reeds = r(0.1, 0.9);
      params.flowers = r(0.1, 0.9);
      params.shore = r(0.15, 0.9);
      params.propDensity = r(0.7, 1.4);
      params.paths = r(0.1, 0.7);
      params.farms = r(0.1, 1.0);
      params.crops = r(0.5, 1.8);
      params.villages = r(0.15, 0.9);
      params.villageSize = r(0.8, 1.3);
      params.market = r(0.3, 1.6);
      params.landmarks = r(0.1, 1.2);
      params.camps = r(0.1, 1.5);
      params.graves = r(0.2, 1.3);
      params.ruins = r(0.2, 1.3);
      params.harbors = r(0.2, 1.3);
      params.wildlife = r(0.2, 1.4);
      params.seed = Math.floor(Math.random() * 1000000000);
      $("seedInput").value = String(params.seed);
      syncSliders(params);
      regenerate();
      toast("Randomised world");
    });
    $("helpBtn").addEventListener("click", () => $("helpDlg").showModal());
    $("helpClose").addEventListener("click", () => $("helpDlg").close());
    $("propSearch").addEventListener("input", (e) => { propQuery = e.target.value; buildPropPalette(); });
    $("propSearch").addEventListener("keydown", (e) => { if (e.key === "Escape") { e.target.value = ""; propQuery = ""; buildPropPalette(); } });

    for (const b of $("toolRail").querySelectorAll("button")) {
      b.addEventListener("click", () => {
        editor.setTool(b.dataset.tool);
        if (editor.tool === "prop" && editor.propIndex < 0) switchTab("props");
        if (editor.tool === "stamp") switchTab("prefabs");
        if (editor.tool === "label") switchTab("labels");
        if (innerWidth <= 900 && !PANEL_TOOLS.has(editor.tool)) closeDrawers();
      });
    }
    $("labelAddBtn").addEventListener("click", () => {
      editor.setTool("label");
      switchTab("labels");
      const n = ($("labelName").value || "").trim();
      toast(n ? 'Click the map to place "' + n + '"' : "Type a name, or click the map to place a label");
    });
    $("labelName").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("labelAddBtn").click(); } });
    $("brushSize").addEventListener("input", (e) => { editor.setBrushSize(+e.target.value); $("brushSizeVal").textContent = e.target.value; });
    $("propScale").addEventListener("input", (e) => { editor.setPropScale(+e.target.value / 100); $("propScaleVal").textContent = e.target.value + "%"; });
    $("shapeSquare").addEventListener("click", () => { editor.setShape("square"); updateToolUI(); });
    $("shapeRound").addEventListener("click", () => { editor.setShape("round"); updateToolUI(); });
    $("clearPropsBtn").addEventListener("click", () => { if (world && world.props.length) { editor.clearProps(); refreshStats(); scheduleMinimap(); toast("Removed all props"); } });
    $("scatterBtn").addEventListener("click", scatter);

    for (const b of $$(".tab")) b.addEventListener("click", () => switchTab(b.dataset.tab));

    $("leftOpen").addEventListener("click", () => { $("left").classList.toggle("open"); $("right").classList.remove("open"); });
    $("rightOpen").addEventListener("click", () => { $("right").classList.toggle("open"); $("left").classList.remove("open"); });
    $("scrim").addEventListener("pointerdown", closeDrawers);
    $("view").addEventListener("pointerdown", () => { $("left").classList.remove("open"); $("right").classList.remove("open"); });

    const miniCvs = $("minimap");
    let miniDrag = null;
    const miniTo = (e) => {
      if (!world) return;
      const r = miniCvs.getBoundingClientRect();
      const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const fy = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      editor.centerOn(fx * world.W * TILE, fy * world.H * TILE);
      updateMiniBox();
    };
    miniCvs.addEventListener("pointerdown", (e) => {
      miniDrag = e.pointerId;
      try { miniCvs.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      miniTo(e);
    });
    miniCvs.addEventListener("pointermove", (e) => { if (miniDrag === e.pointerId) miniTo(e); });
    const miniUp = (e) => {
      if (miniDrag !== e.pointerId) return;
      miniDrag = null;
      try { miniCvs.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    };
    miniCvs.addEventListener("pointerup", miniUp);
    miniCvs.addEventListener("pointercancel", miniUp);

    $("pngBtn").addEventListener("click", exportPng);
    $("jsonBtn").addEventListener("click", exportJson);
    $("tmxBtn").addEventListener("click", exportTmx);
    $("tilesBtn").addEventListener("click", exportTiles);
    $("importBtn").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", importJson);
    $("saveBtn").addEventListener("click", openSave);
    $("loadBtn").addEventListener("click", openLoad);
    $("aiGenBtn").addEventListener("click", aiGenerate);
    $("aiNameBtn").addEventListener("click", aiName);
    $("waterSel").addEventListener("change", (e) => {
      const v = e.currentTarget.value;
      const t = THEMES[params.theme] || {};
      params.waterTint = v === "auto" ? (t.waterTint || "auto") : v;
      regenerate();
    });
    $("copySettingsBtn").addEventListener("click", async () => {
      const text = JSON.stringify(params, null, 1);
      try {
        await navigator.clipboard.writeText(text);
        toast("Settings copied to the clipboard");
      } catch (err) {
        toast("Clipboard blocked - settings printed to the console", true);
        console.log(text);
      }
    });
    $("pasteSettingsBtn").addEventListener("click", async () => {
      let text = "";
      try { text = await navigator.clipboard.readText(); } catch (err) {}
      if (!text) { toast("Could not read the clipboard - paste JSON here is not supported", true); return; }
      try {
        const obj = JSON.parse(text);
        const src = obj && obj.params ? obj.params : obj;
        if (!src || typeof src !== "object") throw new Error("not an object");
        params = normalizeParams({ ...params, ...src });
        syncWorldUI(params);
        regenerate();
        toast("Settings applied");
      } catch (err) {
        toast("Paste failed: " + (err.message || "invalid JSON"), true);
      }
    });

    $("view").addEventListener("wheel", (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  }

  async function exportPng() {
    if (!world) return;
    const px = world.W * TILE;
    const pref = $("pngScale") ? $("pngScale").value : "auto";
    const format = $("pngFormat") ? $("pngFormat").value : "image/png";
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    let scale = 1;
    if (pref === "auto") {
      for (const s of [4, 3, 2, 1, 0.5, 0.25]) { if (px * s <= 4096) { scale = s; break; } }
    } else {
      scale = Math.max(0.25, Math.min(8, +pref || 1));
      const maxPx = format === "image/png" ? 8192 : 16384;
      if (px * scale > maxPx) {
        scale = maxPx / px;
        toast("Image clamped to " + maxPx + "px wide", true);
      }
    }
    await withBusy("Rendering image", async () => {
      const canvas = renderer.renderFull(world, scale, { hideProps: !!editor.opts.field });
      const opts = { type: format };
      if (format === "image/jpeg") opts.quality = 0.92;
      let blob = canvas.convertToBlob ? await canvas.convertToBlob(opts) : null;
      if (blob && format !== "image/png" && blob.type !== format) {
        blob = await flattenToBlob(canvas, format);
      }
      if (!blob) throw new Error("Render failed");
      download(blob, safeName() + "." + ext);
    });
    toast("Exported " + ext.toUpperCase() + " (" + Math.round(px * scale) + "px wide)");
  }

  async function flattenToBlob(canvas, format) {
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#101418";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    return new Promise((resolve) => out.toBlob(resolve, format, format === "image/jpeg" ? 0.92 : undefined));
  }

  function exportJson() {
    if (!world) return;
    const data = serialize(world, { name: $("mapName").value, legend: $("legendBox").textContent });
    download(new Blob([JSON.stringify(data)], { type: "application/json" }), safeName() + ".json");
    toast("Map JSON exported");
  }

  function exportTmx() {
    if (!world) return;
    const xml = buildTmx(world, { name: $("mapName").value, legend: $("legendBox").textContent });
    download(new Blob([xml], { type: "application/xml" }), safeName() + ".tmx");
    toast("Exported Tiled map (.tmx) with terrain layers and " + world.props.length + " objects");
  }

  function exportTiles() {
    if (!world) return;
    const { W, H, tiles } = toTileGrid(world);
    const out = { format: FORMAT, version: VERSION, name: safeName(), W, H, tileset: TILESET_IMAGE, terrains: TERRAINS, legend: $("legendBox").textContent, tiles };
    download(new Blob([JSON.stringify(out)], { type: "application/json" }), safeName() + ".tiles.json");
    toast("Exported a " + W + "x" + H + " tile-id grid (" + TERRAINS.length + " terrain ids, legend included)");
  }

  async function importJson(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      loadMapData(data);
      toast("Imported " + file.name);
    } catch (err) {
      toast("Import failed: " + err.message, true);
    }
  }

  function loadMapData(data) {
    const w = deserialize(data, params);
    world = w;
    params = w.params;
    mapName = data.name || "Imported map";
    legend = data.legend || "";
    editor.setWorld(w);
    syncWorldUI(w.params);
    $("mapName").value = mapName;
    $("legendBox").textContent = legend;
    refreshStats();
    scheduleMinimap();
    buildLabelList();
    emit("load");
    return w;
  }

  function scatter() {
    if (!world) return;
    const idx = editor.propIndex;
    if (idx >= 0) {
      const n = scatterOne(idx);
      toast(n ? "Scattered " + n + " " + PROPS[idx][4] : "Nothing suitable to place here", !n);
      refreshStats();
      scheduleMinimap();
      emit("edit");
      return;
    }
    withBusy("Scattering props", () => {
      editor._beginOp("scatter");
      world.props = scatterWorldProps(world, world.params);
      editor._commitOp();
      editor.markDirty(true);
      editor.minimapDirty = true;
      editor.afterEdit();
    });
    toast("Scattered " + world.props.length + " props");
    refreshStats();
    scheduleMinimap();
    emit("edit");
  }

  function scatterOne(idx) {
    const row = PROPS[idx];
    const kind = row[4];
    const step = kind === "plant" ? 20 : kind === "bush" ? 26 : kind === "rock" ? 40 : 42;
    const minSep = Math.max(7, row[2] * (kind === "plant" ? 0.32 : 0.55));
    const seed = world.params.seed;
    const rnd = mulberry32((seed ^ 0x51ed) >>> 0);
    const CELL = 16;
    const occ = new Map();
    const gk = (gx, gy) => gx * 100000 + gy;
    const occupy = (x, y) => { const k = gk(Math.floor(x / CELL), Math.floor(y / CELL)); if (!occ.has(k)) occ.set(k, [x, y]); };
    const occupied = (x, y, r) => {
      const span = Math.ceil(r / CELL), gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
      for (let dy = -span; dy <= span; dy++) for (let dx = -span; dx <= span; dx++) {
        const s = occ.get(gk(gx + dx, gy + dy));
        if (s && (s[0] - x) * (s[0] - x) + (s[1] - y) * (s[1] - y) < r * r) return true;
      }
      return false;
    };
    for (const p of world.props) { const pr = PROPS[p.s]; occupy(p.x, p.y); if (pr) occ.get(gk(Math.floor(p.x / CELL), Math.floor(p.y / CELL)))[2] = pr[2]; }
    const water = world.fields && world.fields.water;
    const added = [];
    editor._beginOp("scatter prop");
    const worldW = world.W * TILE, worldH = world.H * TILE;
    for (let y = 4; y < worldH; y += step) {
      for (let x = 4; x < worldW; x += step) {
        const jx = x + (rnd() - 0.5) * step * 0.9;
        const jy = y + (rnd() - 0.5) * step * 0.9;
        if (jx < 2 || jy < 2 || jx > worldW - 2 || jy > worldH - 2) continue;
        const ci = clamp(Math.round(jy / TILE), 0, world.ch - 1) * world.cw + clamp(Math.round(jx / TILE), 0, world.cw - 1);
        if (water && water[ci]) continue;
        const clump = 0.45 + valueNoise2D(jx * 0.0016, jy * 0.0016, seed + 4242) * 1.15;
        if (rnd() > clump) continue;
        if (occupied(jx, jy, minSep)) continue;
        occupy(jx, jy);
        added.push({ x: Math.round(jx), y: Math.round(jy), s: idx, flip: rnd() < 0.5 ? 1 : 0, kind, sc: editor.propScale });
      }
    }
    if (!added.length) { editor._cancelOp(); return 0; }
    world.props = world.props.concat(added);
    world.props.sort((a, b) => a.y - b.y || a.x - b.x);
    editor._commitOp();
    editor.markDirty(true);
    editor.minimapDirty = true;
    editor.afterEdit();
    return added.length;
  }

  function openSave() {
    const dlg = $("saveDlg");
    $("saveName").value = $("mapName").value || "My map";
    dlg.showModal();
    setTimeout(() => $("saveName").select(), 30);
  }

  async function doSave() {
    const slot = $("saveName").value.trim() || "My map";
    const kv = plugin("kv");
    if (!kv) { toast("Storage plugin unavailable", true); return false; }
    const data = serialize(world, { name: $("mapName").value.trim() || slot, legend: $("legendBox").textContent, saved: Date.now() });
    try {
      await kv[KV_FOLDER].set(slot, data);
      if (!$("mapName").value.trim()) $("mapName").value = slot;
      editor.markDirty(false);
      toast("Saved \u201c" + slot + "\u201d");
      return true;
    } catch (err) {
      toast("Save failed: " + err.message, true);
      return false;
    }
  }

  async function openLoad() {
    const kv = plugin("kv");
    const list = $("loadList");
    list.innerHTML = "";
    if (!kv) { list.appendChild(el("div", { class: "aside", text: "Storage plugin unavailable." })); $("loadDlg").showModal(); return; }
    $("loadDlg").showModal();
    list.appendChild(el("div", { class: "aside", text: "Loading\u2026" }));
    let keys = [];
    try { keys = await kv[KV_FOLDER].keys(); } catch (e) {}
    list.innerHTML = "";
    if (!keys || !keys.length) { list.appendChild(el("div", { class: "aside", text: "No saved maps yet." })); return; }
    const metas = [];
    for (const k of keys) {
      let m = null;
      try { m = await kv[KV_FOLDER].get(k); } catch (e) {}
      metas.push({ name: k, saved: m && m.saved, size: m ? m.W + "x" + m.H : "?" });
    }
    metas.sort((a, b) => (b.saved || 0) - (a.saved || 0));
    for (const m of metas) {
      const load = el("button", { class: "primary", text: "Load" });
      load.addEventListener("click", async () => {
        const data = await kv[KV_FOLDER].get(m.name);
        try {
          loadMapData(data);
          $("loadDlg").close();
          toast("Loaded \u201c" + m.name + "\u201d");
        } catch (err) { toast("Load failed: " + err.message, true); }
      });
      const del = el("button", { text: "Delete" });
      del.addEventListener("click", async () => {
        await kv[KV_FOLDER].delete(m.name);
        row.remove();
        toast("Deleted \u201c" + m.name + "\u201d");
      });
      const row = el("div", { class: "dlgRow", style: { justifyContent: "space-between", alignItems: "center" } }, [
        el("div", {}, [el("div", { text: m.name }), el("div", { class: "aside", text: m.size + "  \u00b7  " + (m.saved ? new Date(m.saved).toLocaleString() : "") })]),
        el("div", { style: { display: "flex", gap: "6px" } }, [load, del]),
      ]);
      list.appendChild(row);
    }
  }

  async function aiCall(instruction, onText) {
    const generateText = plugin("generateText");
    if (!generateText) throw new Error("AI plugin unavailable");
    let buf = "";
    const fn = generateText({ instruction, onChunk: (d) => { buf += (d && d.textChunk) || ""; if (onText) onText(buf); } });
    const res = await fn;
    if (typeof res === "string" && res.length >= buf.length) return res;
    if (typeof res === "string" && res) return res;
    if (res && typeof res.text === "string") return res.text;
    return buf;
  }

  function extractJson(text) {
    if (!text) return null;
    let t = String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) return null;
    t = t.slice(a, b + 1);
    try { return JSON.parse(t); } catch (e) {}
    try { return JSON.parse(t.replace(/,\s*([}\]])/g, "$1")); } catch (e) {}
    return null;
  }

  function aiBusy(label) {
    const out = $("aiOut");
    out.innerHTML = "";
    const tx = el("span", { text: label });
    out.append(el("span", { class: "mini-spin" }), tx);
    return tx;
  }

  async function aiGenerate() {
    const desc = $("aiPrompt").value.trim();
    if (!desc) { toast("Describe the world you want first", true); return; }
    const btn = $("aiGenBtn");
    btn.disabled = true;
    const tx = aiBusy("Designing your world\u2026");
    try {
      const text = await aiCall(AI_PREFIX + desc + "\n", (buf) => {
        const s = buf.replace(/\s+/g, " ").trim();
        tx.textContent = s.length > 140 ? s.slice(s.length - 140) : s;
      });
      const spec = extractJson(text);
      if (!spec) throw new Error("Could not understand the AI response - try rephrasing");
      const next = { ...params };
      const AI_LIMITS = { forest: 1.5, plants: 1.5, flowers: 1.5, rocks: 1.5, ore: 1.5, lava: 1.5, farms: 1.5, crops: 2, villages: 1.5, reeds: 1.5, propDensity: 2, villageSize: 1.8, market: 2, landmarks: 1.6, camps: 2, graves: 2, ruins: 2, harbors: 2, wildlife: 2 };
      for (const k of ["seaLevel", "island", "shore", "fragment", "relief", "temperature", "moisture", "snow", "autumn", "rivers", "lakes", "forest", "plants", "flowers", "rocks", "ore", "lava", "reeds", "propDensity", "paths", "farms", "crops", "villages", "villageSize", "market", "landmarks", "camps", "graves", "ruins", "harbors", "wildlife"]) {
        const v = Number(spec[k]);
        if (Number.isFinite(v)) next[k] = clamp(v, 0, AI_LIMITS[k] || 1);
      }
      next.theme = THEMES[spec.theme] ? spec.theme : params.theme;
      next.width = next.height = nearestSize(spec.size) || params.width;
      next.seed = Number.isFinite(Number(spec.seed)) ? Math.floor(Number(spec.seed)) >>> 0 : Math.floor(Math.random() * 1000000000);
      const ex = THEMES[next.theme] || {};
      next.waterTint = ex.waterTint || "auto";
      params = next;
      if (spec.name) { mapName = spec.name; $("mapName").value = spec.name; }
      legend = spec.legend || "";
      $("legendBox").textContent = legend;
      editor.markDirty(true);
      await regenerate();
      const out = $("aiOut");
      out.innerHTML = "";
      out.append(el("b", { text: spec.name || "New world" }));
      out.append(el("div", { text: spec.legend || "" }));
      out.append(el("div", { class: "aside", text: THEMES[next.theme].label + " \u00b7 " + next.width + "x" + next.height + " \u00b7 seed " + next.seed }));
    } catch (err) {
      const out = $("aiOut");
      out.innerHTML = "";
      out.append(el("span", { text: err.message || "Generation failed", style: { color: "var(--danger)" } }));
    } finally {
      btn.disabled = false;
    }
  }

  function nearestSize(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    let best = SIZES[0], bd = Infinity;
    for (const s of SIZES) { const d = Math.abs(s - n); if (d < bd) { bd = d; best = s; } }
    return best;
  }

  async function aiName() {
    if (!world) return;
    const btn = $("aiNameBtn");
    btn.disabled = true;
    const tx = aiBusy("Naming\u2026");
    try {
      const summary = {
        theme: world.params.theme,
        size: world.W + "x" + world.H,
        seaLevel: r2(world.params.seaLevel),
        island: r2(world.params.island),
        relief: r2(world.params.relief),
        temperature: r2(world.params.temperature),
        moisture: r2(world.params.moisture),
        snow: r2(world.params.snow),
        forest: r2(world.params.forest),
        rivers: r2(world.params.rivers),
        landFraction: world.stats ? r2(world.stats.land / (world.cw * world.ch)) : null,
        riverTiles: world.stats ? world.stats.riverCells : null,
        landmarks: r2(world.params.landmarks),
        graveyards: world.stats ? world.stats.graves : null,
        harbours: world.stats ? world.stats.docks : null,
        ruins: world.stats ? world.stats.ruins : null,
        props: world.props.length,
      };
      const text = await aiCall(NAME_PREFIX + JSON.stringify(summary) + "\n", (buf) => {
        const s = buf.replace(/\s+/g, " ").trim();
        tx.textContent = s.length > 120 ? s.slice(s.length - 120) : s;
      });
      const spec = extractJson(text) || {};
      const name = spec.name || String(text).trim().split("\n")[0].slice(0, 60);
      const lg = spec.legend || "";
      mapName = name;
      legend = lg;
      $("mapName").value = name;
      $("legendBox").textContent = lg;
      editor.markDirty(true);
      const out = $("aiOut");
      out.innerHTML = "";
      out.append(el("b", { text: name }));
      if (lg) out.append(el("div", { text: lg }));
    } catch (err) {
      const out = $("aiOut");
      out.innerHTML = "";
      out.append(el("span", { text: err.message || "Naming failed", style: { color: "var(--danger)" } }));
    } finally {
      btn.disabled = false;
    }
  }

  function wireEditor() {
    editor.onStatus = (s) => {
      $("stTile").textContent = s.tx == null ? "-" : s.tx + "," + s.ty;
      $("stTerrain").textContent = s.terrain == null ? "-" : TERRAINS[s.terrain].replace(/_/g, " ");
      $("stProps").textContent = String(s.props);
      $("stZoom").textContent = Math.round(s.zoom * 100) + "%";
      $("stSize").textContent = s.size;
      updateMiniBox();
    };
    editor.onChange = (kind) => {
      if (kind === "tool") updateToolUI();
      else if (kind === "terrain") updateTerrainUI();
      else if (kind === "prop") updatePropUI();
      else if (kind === "prefab") updatePrefabUI();
      else if (kind === "label") updateLabelUI();
      if (kind === "paint" || kind === "edit" || kind === "label") { refreshStats(); scheduleMinimap(); }
      emit(kind);
    };
    editor.onRequestLabel = (tx, ty) => {
      const n = (($("labelName") && $("labelName").value) || "").trim() || "New label";
      editor.addLabel(tx, ty, n);
      buildLabelList();
      if ($("labelName")) $("labelName").value = "";
    };
    editor.onHistory = updateHistoryUI;
    editor.onDirty = (v) => { $("stDirty").textContent = v ? "\u25cf unsaved changes" : ""; };
    const ro = new ResizeObserver(() => { editor.resize(); updateMiniBox(); });
    ro.observe($("stage"));
    disposers.push(() => ro.disconnect());
    if (window === window.top) {
      const onBeforeUnload = (e) => { if (editor.dirty) { e.preventDefault(); e.returnValue = ""; } };
      window.addEventListener("beforeunload", onBeforeUnload);
      disposers.push(() => window.removeEventListener("beforeunload", onBeforeUnload));
    }
  }

  function wireDialogs() {
    $("saveOk").addEventListener("click", async (e) => { e.preventDefault(); if (await doSave()) $("saveDlg").close(); });
    $("saveCancel").addEventListener("click", (e) => { e.preventDefault(); $("saveDlg").close(); });
    $("loadCancel").addEventListener("click", (e) => { e.preventDefault(); $("loadDlg").close(); });
    $("saveName").addEventListener("keydown", async (e) => { if (e.key === "Enter") { e.preventDefault(); if (await doSave()) $("saveDlg").close(); } });
  }

  function applyConfig() {
    if (o.useHostConfig === false) return;
    const r = rootScope();
    const cfg = r && r.config;
    if (!cfg) return;
    for (const k of Object.keys(DEFAULT_PARAMS)) {
      let v;
      try { v = cfg[k]; } catch (e) { continue; }
      if (v == null || v === "") continue;
      const d = DEFAULT_PARAMS[k];
      if (typeof d === "number") { const n = Number(v); if (Number.isFinite(n)) params[k] = n; }
      else if (typeof d === "string") params[k] = String(v);
    }
  }

  let api = null;

  async function boot() {
    applyConfig();
    applyOptions();
    if (o.showAI === false) $("aiSection").hidden = true;
    if (o.showSave === false) { $("saveBtn").hidden = true; $("loadBtn").hidden = true; }
    buildThemeAndSize();
    buildParamSliders();
    wireToolbar();
    wireEditor();
    wireDialogs();
    updateToolUI();
    if (o.onClose) {
      const cb = $("closeBtn");
      cb.hidden = false;
      cb.addEventListener("click", () => { try { o.onClose(api); } catch (e) { console.error(e); } api.destroy(); });
    }
    showBusy("Loading tilesets\u2026");
    try {
      await nextFrame();
      await renderer.load({ tilesetUrl: o.tilesetUrl, propsUrl: o.propsUrl });
      editor.attach($("view"));
      buildTerrainPalette();
      buildPropPalette();
      buildPrefabPalette();
      buildLabelList();
      updateTerrainUI();
      editor.setTerrain(TERRAIN_INDEX.Grass);
      editor.setTool("brush");
      updateTerrainUI();
    } finally {
      hideBusy();
    }
    window.__app = api;
    if (o.map) loadMapData(o.map);
    else await regenerate();
    if (mapName) $("mapName").value = mapName;
    $("legendBox").textContent = legend;
    editor.status();
  }

  api = {
    el: container,
    shadow,
    renderer,
    editor,
    get world() { return world; },
    get params() { return world ? world.params : params; },
    get name() { return mapName; },
    get legend() { return legend; },
    getName: () => mapName,
    getLegend: () => legend,
    setName: (n) => { mapName = String(n || ""); $("mapName").value = mapName; },
    setLegend: (l) => { legend = String(l || ""); $("legendBox").textContent = legend; },
    getMap: () => (world ? serialize(world, { name: mapName, legend }) : null),
    setMap: (data) => loadMapData(data),
    generate: (p) => {
      if (p) {
        const merged = { ...params, ...p };
        const t = THEMES[merged.theme];
        if (t && p.theme && p.theme !== params.theme) {
          for (const k of THEME_INHERIT) if (t[k] !== undefined && p[k] === undefined) merged[k] = t[k];
          if (p.waterTint === undefined) merged.waterTint = t.waterTint || "auto";
          if (p.volcanic === undefined) merged.volcanic = !!t.volcanic;
        }
        params = normalizeParams(merged);
      }
      return regenerate();
    },
    setParams: (p) => { params = normalizeParams({ ...params, ...(p || {}) }); syncWorldUI(params); },
    setSeed: (s) => { params.seed = Math.floor(Number(s) || 0) >>> 0; return regenerate(); },
    setTheme: (t) => { if (THEMES[t]) { params.theme = t; applyThemeParams(THEMES[t]); syncWorldUI(params); } return regenerate(); },
    setSize: (n) => { params.width = params.height = Number(n) || params.width; return regenerate(); },
    get prefabIndex() { return editor.prefabIndex; },
    setPrefab: (i) => { editor.setPrefab(i); switchTab("prefabs"); updatePrefabUI(); },
    stampPrefab: (i, tx, ty) => {
      if (i != null) editor.setPrefab(i);
      editor._beginOp("prefab");
      const n = editor.placePrefab(tx * TILE, ty * TILE);
      editor._commitOp();
      return n;
    },
    scatter: (propIndex) => { if (propIndex != null) editor.setProp(propIndex); return scatter(); },
    labels: () => (world && world.labels ? world.labels.map((l) => ({ tx: l.tx, ty: l.ty, name: l.name })) : []),
    setLabels: (arr) => {
      if (!world) return 0;
      world.labels = (Array.isArray(arr) ? arr : []).map((l) => ({ tx: Math.max(0, Math.min(world.W - 1, Math.floor(l.tx) || 0)), ty: Math.max(0, Math.min(world.H - 1, Math.floor(l.ty) || 0)), name: String((l && l.name) || "Label").slice(0, 40) }));
      editor.selectedLabel = -1;
      buildLabelList();
      editor.markDirty(true);
      editor.requestDraw();
      return world.labels.length;
    },
    addLabel: (tx, ty, name) => { const i = editor.addLabel(tx, ty, name); buildLabelList(); return i; },
    copyRegion: (x0, y0, x1, y1) => { editor.copyRegion(x0, y0, x1, y1); return editor.clip ? { w: editor.clip.w, h: editor.clip.h, props: editor.clip.props.length } : null; },
    pasteRegion: (tx, ty) => editor.pasteAt(tx, ty),
    clearClip: () => editor.clearClip(),
    renderMinimap: async (size) => {
      if (!renderer.ready) await renderer.load({ tilesetUrl: o.tilesetUrl, propsUrl: o.propsUrl });
      return renderer.renderMinimap(world, size || 320);
    },
    renderFull: async (scale, ropts) => {
      if (!renderer.ready) await renderer.load({ tilesetUrl: o.tilesetUrl, propsUrl: o.propsUrl });
      return renderer.renderFull(world, scale || 1, ropts || {});
    },
    exportPng,
    exportJson,
    exportTmx,
    exportTiles,
    toTmx: () => (world ? buildTmx(world, { name: mapName, legend }) : null),
    serialize: () => (world ? serialize(world, { name: mapName, legend }) : null),
    toTileGrid: () => (world ? toTileGrid(world) : null),
    onChange: (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    markDirty: (v) => editor.markDirty(v),
    isDirty: () => editor.dirty,
    focus: () => $("view").focus(),
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      listeners.clear();
      clearTimeout(minimapTimer);
      clearTimeout(toastTimer);
      for (const d of disposers.splice(0)) { try { d(); } catch (e) {} }
      try { editor.detach(); } catch (e) {}
      shadow.innerHTML = "";
      container.classList.remove("forge-fullscreen");
      if (window.__app === api) window.__app = null;
    },
    ready: null,
  };

  api.ready = boot().then(() => api);
  await api.ready;
  return api;
}

export async function openMapForge(options) {
  const o = { ...(options || {}) };
  o.fullscreen = true;
  const outerClose = o.onClose;
  const host = document.createElement("div");
  host.id = "forgeOverlayHost";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483000";
  document.body.appendChild(host);
  let inst = null;
  o.onClose = (i) => { if (outerClose) outerClose(i); };
  try {
    inst = await mountMapForge(host, o);
  } catch (e) {
    host.remove();
    throw e;
  }
  const innerDestroy = inst.destroy.bind(inst);
  inst.destroy = () => { innerDestroy(); host.remove(); };
  inst.close = inst.destroy;
  return inst;
}

```

## 01-internal-code/src/ui.js

_25325 bytes_

```javascript
export const UI_CSS = `
  :host {
    --bg: #0d1117;
    --bg2: #141b24;
    --bg3: #1b2530;
    --line: #26313d;
    --line2: #33404f;
    --fg: #dbe4ee;
    --fg2: #8ea0b4;
    --fg3: #63758a;
    --accent: #4ea3ff;
    --accent2: #2b7fd4;
    --gold: #ffca45;
    --danger: #ff6b6b;
    --ok: #4ade9a;
  }
  :host {
    display: block;
    position: relative;
    height: 100%;
    min-height: 520px;
    text-align: left;
    background: var(--bg);
    color: var(--fg);
    font: 13px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
  }
  :host(.forge-fullscreen) {
    position: fixed;
    inset: 0;
    height: 100vh;
    min-height: 0;
    z-index: 2147483000;
  }
  *, *::before, *::after { box-sizing: border-box; }
  button, input, select, textarea { font: inherit; color: var(--fg); }
  button {
    background: var(--bg3);
    border: 1px solid var(--line2);
    border-radius: 7px;
    padding: 5px 10px;
    cursor: pointer;
    white-space: nowrap;
    transition: background .12s, border-color .12s, transform .06s;
  }
  button:hover { background: #24303d; border-color: #46586b; }
  button:active { transform: translateY(1px); }
  button.primary { background: var(--accent2); border-color: var(--accent); color: #fff; font-weight: 600; }
  button.primary:hover { background: #3489dd; }
  button.toggle.on { background: #23405c; border-color: #3d6f9e; color: #cfe6ff; }
  button:disabled { opacity: .42; cursor: default; }
  select, input[type=number], input[type=text], textarea {
    background: var(--bg2); border: 1px solid var(--line2); border-radius: 7px; padding: 4px 7px;
  }
  textarea { resize: vertical; width: 100%; min-height: 48px; }
  input[type=range] { width: 100%; accent-color: var(--accent); }

  #app {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: 248px 1fr 284px;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: "top top top" "left stage right" "bottom bottom bottom";
  }
  #topbar {
    grid-area: top;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 10px; background: var(--bg2); border-bottom: 1px solid var(--line);
    overflow-x: auto;
  }
  .brand { font-weight: 700; letter-spacing: .3px; margin-right: 8px; white-space: nowrap; }
  .brand b { color: var(--accent); }
  .spacer { flex: 1 1 auto; }
  .sep { width: 1px; align-self: stretch; background: var(--line); margin: 2px 4px; }

  .panel { background: var(--bg2); overflow-y: auto; overflow-x: hidden; }
  #left { grid-area: left; border-right: 1px solid var(--line); }
  #right { grid-area: right; border-left: 1px solid var(--line); }
  .panel section { padding: 10px; border-bottom: 1px solid var(--line); }
  .panel h3 {
    margin: 0 0 7px; font-size: 11px; text-transform: uppercase; letter-spacing: .9px;
    color: var(--fg2); font-weight: 700;
  }
  .toolRail { display: flex; flex-wrap: wrap; gap: 4px; }
  .toolRail button { padding: 5px 7px; flex: 1 1 auto; }
  .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
  .tabs button { flex: 1; min-width: 0; padding: 5px 4px; font-size: 11.5px; }
  .tabs button.on { background: #23405c; border-color: #3d6f9e; color: #cfe6ff; }

  .swatchGrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
  .swatch {
    position: relative; aspect-ratio: 1; border: 1px solid var(--line2); border-radius: 5px;
    background-size: 100% 100%; image-rendering: pixelated; cursor: pointer; padding: 0;
  }
  .swatch.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(255,202,69,.35); }

  .catRow { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 8px; }
  .catRow button { padding: 3px 6px; font-size: 11px; }
  .propGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .propCell {
    position: relative; aspect-ratio: 1; background: #0a0e13; border: 1px solid var(--line2);
    border-radius: 5px; cursor: pointer; overflow: hidden; padding: 0;
  }
  .propCell.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(255,202,69,.35); }
  .propCell canvas { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; display: block; }
  .catNote { color: var(--fg3); font-size: 11px; margin-bottom: 6px; }
  .propSearch {
    width: 100%; box-sizing: border-box; margin-bottom: 7px; padding: 5px 8px;
    background: #0a0e13; border: 1px solid var(--line2); border-radius: 6px; color: var(--fg1, #e8ecf3); font-size: 12px;
  }
  .propSearch:focus { outline: none; border-color: var(--accent); }
  .propCount { color: var(--fg3); font-size: 10.5px; margin-top: 7px; text-align: right; }

  .prefabList { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .prefabCard {
    position: relative; background: #0a0e13; border: 1px solid var(--line2); border-radius: 7px;
    cursor: pointer; padding: 5px 5px 3px; text-align: center; overflow: hidden;
  }
  .prefabCard.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(255,202,69,.35); }
  .prefabCard canvas { display: block; width: 100%; height: 60px; object-fit: contain; image-rendering: pixelated; }
  .prefabCard span { display: block; font-size: 10.5px; color: var(--fg2); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .labelList { display: flex; flex-direction: column; gap: 4px; max-height: 320px; overflow-y: auto; }
  .labelRow { display: flex; align-items: center; gap: 4px; }
  .labelRow input {
    flex: 1 1 auto; min-width: 0; background: #0a0e13; border: 1px solid var(--line2);
    border-radius: 6px; padding: 4px 7px; font-size: 12px;
  }
  .labelRow input:focus { outline: none; border-color: var(--accent); }
  .labelRow button { padding: 5px 9px; font-size: 12px; line-height: 1; flex: 0 0 auto; min-width: 30px; }
  .labelRow .dot { flex: 0 0 8px; height: 8px; border-radius: 50%; background: #7fd0ff; box-shadow: 0 0 0 1px #0a0e13; }
  .labelRow.on input { border-color: var(--gold); color: #ffe9a8; }
  .labelRow.on .dot { background: var(--gold); }

  #stage { grid-area: stage; position: relative; overflow: hidden; background: #080b0f; }
  #view { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair; }
  #view.panning { cursor: grabbing; }
  #view.picking { cursor: copy; }
  #view.erasing { cursor: cell; }
  #view.cloning { cursor: copy; }
  #view.labelling { cursor: text; }
  #hint {
    position: absolute; left: 10px; bottom: 10px; pointer-events: none;
    background: rgba(10,14,19,.88); border: 1px solid var(--line2); border-radius: 7px;
    padding: 5px 9px; color: #b9c9da; font-size: 11.5px; max-width: 78%;
  }
  #busy {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(8,11,15,.62); backdrop-filter: blur(1px); z-index: 5;
  }
  #busy[hidden] { display: none; }
  #busy .box { background: var(--bg2); border: 1px solid var(--line2); border-radius: 12px; padding: 16px 22px; text-align: center; }
  .spinner {
    width: 26px; height: 26px; margin: 0 auto 9px;
    border: 3px solid #2c3b4b; border-top-color: var(--accent); border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  #statusbar {
    grid-area: bottom; display: flex; align-items: center; gap: 12px;
    padding: 5px 10px; background: var(--bg2); border-top: 1px solid var(--line);
    color: var(--fg2); font-size: 11px; font-variant-numeric: tabular-nums; flex-wrap: wrap;
  }
  #statusbar b { color: var(--fg); font-weight: 600; }
  #miniOverlay {
    position: absolute; right: 10px; bottom: 10px; width: 186px; z-index: 3;
    background: rgba(10,14,19,.9); border: 1px solid var(--line2); border-radius: 9px;
    padding: 7px; box-shadow: 0 6px 20px rgba(0,0,0,.45); backdrop-filter: blur(2px);
  }
  #minimap { display: block; width: 100%; image-rendering: pixelated; border: 1px solid var(--line2); border-radius: 6px; background: #0a0e13; cursor: crosshair; }
  #miniWrap { position: relative; }
  #miniBox { position: absolute; pointer-events: none; border: 1px solid rgba(255, 202, 69, 0.9); box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(0, 0, 0, 0.35); border-radius: 3px; }
  #miniOverlay .aside { text-align: center; margin-top: 5px; line-height: 1.4; }
  @media (max-width: 900px) { #miniOverlay { width: 124px; right: 8px; bottom: 8px; } #miniOverlay .aside { font-size: 9.5px; line-height: 1.3; } }

  .row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .row > label { flex: 0 0 74px; color: var(--fg2); font-size: 11px; }
  .row > .val { flex: 0 0 34px; text-align: right; color: var(--fg2); font-size: 11px; font-variant-numeric: tabular-nums; }
  .slider { display: flex; align-items: center; gap: 5px; margin-bottom: 2px; }
  .slider > span { flex: 0 0 78px; color: var(--fg2); font-size: 10.5px; }
  .slider > i { flex: 0 0 26px; text-align: right; color: var(--fg3); font-size: 10.5px; font-style: normal; font-variant-numeric: tabular-nums; }

  .toast {
    position: fixed; left: 50%; bottom: 46px; transform: translateX(-50%);
    background: #1d2a38; border: 1px solid var(--line2); border-radius: 9px;
    padding: 8px 14px; z-index: 40; box-shadow: 0 8px 26px rgba(0,0,0,.5); max-width: 80vw;
  }
  .toast.err { border-color: #7a3b3b; background: #33191b; color: #ffd9d9; }

  .mini-spin {
    display: inline-block; width: 11px; height: 11px; margin-right: 6px;
    border: 2px solid #2c3b4b; border-top-color: var(--accent); border-radius: 50%;
    animation: spin .7s linear infinite; vertical-align: -1px;
  }
  #aiOut { white-space: pre-wrap; word-break: break-word; }
  #loadList .dlgRow { justify-content: space-between; border-bottom: 1px solid var(--line); padding: 7px 0; }
  #loadList .dlgRow:last-child { border-bottom: 0; }

  dialog {
    background: var(--bg2); color: var(--fg); border: 1px solid var(--line2); border-radius: 12px;
    padding: 16px; max-width: 460px; width: 92vw;
  }
  dialog::backdrop { background: rgba(5,8,11,.66); }
  dialog h3 { margin-top: 0; }
  .dlgRow { display: flex; gap: 6px; margin-top: 10px; justify-content: flex-end; }
  .aside { color: var(--fg3); font-size: 11px; }
  .helpGrid { display: grid; grid-template-columns: auto 1fr; gap: 5px 12px; align-items: center; font-size: 12px; }
  .helpGrid b { grid-column: 1 / -1; color: var(--gold); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; margin-top: 8px; }
  .helpGrid b:first-child { margin-top: 0; }
  .helpGrid .keys { display: flex; gap: 3px; }
  .helpGrid span { color: var(--fg2); }
  kbd {
    background: #0a0e13; border: 1px solid var(--line2); border-bottom-width: 2px; border-radius: 4px;
    padding: 1px 5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #cfe6ff;
    white-space: nowrap;
  }

  #scrim { position: absolute; inset: 0; z-index: 29; display: none; background: rgba(4,7,10,.5); }

  @media (max-width: 900px) {
    #app {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto;
      grid-template-areas: "top" "stage" "bottom";
    }
    #topbar {
      flex-wrap: wrap; overflow-x: visible; row-gap: 5px; padding: 6px 8px;
      max-height: 34vh; overflow-y: auto;
    }
    .brand { order: -3; }
    #dpad { order: -2; }
    #topbar .sep { display: none; }
    #topbar button, #topbar select { padding: 4px 8px; font-size: 12px; }
    #left, #right {
      position: absolute; top: 0; bottom: 0; width: min(84vw, 296px); z-index: 30;
      transition: transform .2s; box-shadow: 0 0 30px rgba(0,0,0,.6);
    }
    #left { left: 0; transform: translateX(-102%); }
    #right { right: 0; transform: translateX(102%); }
    #left.open, #right.open { transform: none; }
    #dpad { display: flex !important; }
    #left.open ~ #scrim, #right.open ~ #scrim { display: block; }
    .labelRow input { padding: 7px 8px; font-size: 13px; }
    .labelRow button { min-width: 38px; min-height: 36px; font-size: 14px; }
  }
`;

export const UI_HTML = `
<div id="app">
  <header id="topbar">
    <span class="brand">LPC <b>Map Forge</b></span>
    <button id="genBtn" class="primary" title="Generate a fresh world from the settings on the right">Generate</button>
    <button id="undoBtn" title="Undo (Ctrl+Z)">Undo</button>
    <button id="redoBtn" title="Redo (Ctrl+Shift+Z)">Redo</button>
    <span class="sep"></span>
    <button id="saveBtn" title="Save this map to your browser">Save</button>
    <button id="loadBtn" title="Load a saved map">Load</button>
    <button id="pngBtn" title="Download the full map as an image">Export</button>
    <select id="pngFormat" title="Image format" style="width:auto">
      <option value="image/png">PNG</option>
      <option value="image/webp">WebP</option>
      <option value="image/jpeg">JPEG</option>
    </select>
    <select id="pngScale" title="Image output scale" style="width:auto">
      <option value="auto">auto</option>
      <option value="1">1x</option>
      <option value="2">2x</option>
      <option value="3">3x</option>
      <option value="4">4x</option>
    </select>
    <button id="jsonBtn" title="Download the map data as JSON">JSON</button>
    <button id="tmxBtn" title="Export a Tiled (.tmx) map: terrain tile layers plus props as objects">TMX</button>
    <button id="tilesBtn" title="Export a bare tile-id grid as JSON (tiles[i] indexes the terrain list, which is included) - for engines that prefer their own map format">Tiles</button>
    <button id="importBtn" title="Load map data from a JSON file">Import</button>
    <input type="file" id="importFile" accept=".json,application/json" hidden>
    <span class="sep"></span>
    <button id="fitBtn" title="Fit the map in the view (F)">Fit</button>
    <button id="gridBtn" class="toggle on" title="Show tile grid (G)">Grid</button>
    <button id="propBtn" class="toggle on" title="Show props (P)">Props</button>
    <button id="shadowBtn" class="toggle on" title="Show prop shadows">Shadows</button>
    <select id="fieldSel" title="Overlay a raw generation field (debug/analysis view)" style="width:auto">
      <option value="">Map</option>
      <option value="elev">Elevation</option>
      <option value="water">Water</option>
      <option value="depth">Water depth</option>
      <option value="moist">Moisture</option>
      <option value="temp">Temperature</option>
      <option value="rock">Rockiness</option>
      <option value="flow">River flow</option>
      <option value="distWater">Distance to water</option>
    </select>
    <span class="spacer"></span>
    <button id="helpBtn" title="Keyboard shortcuts and tips">?</button>
    <span id="dpad" style="display:none; gap:4px">
      <button id="leftOpen">Palette</button>
      <button id="rightOpen">Settings</button>
    </span>
    <button id="closeBtn" hidden>Close</button>
  </header>

  <aside id="left" class="panel">
    <section>
      <h3>Tools</h3>
      <div class="toolRail" id="toolRail">
        <button data-tool="brush" class="on" title="Paint terrain (B)">Paint</button>
        <button data-tool="rect" title="Rectangle fill (R)">Rect</button>
        <button data-tool="fill" title="Flood fill (F)">Fill</button>
        <button data-tool="line" title="Line (L)">Line</button>
        <button data-tool="pick" title="Eyedropper (I)">Pick</button>
        <button data-tool="prop" title="Place props (T)">Prop</button>
        <button data-tool="select" title="Select / move / delete props (V)">Select</button>
        <button data-tool="erase" title="Erase props under the brush - drag to sweep (X)">Erase</button>
        <button data-tool="stamp" title="Stamp a prefab (building, farm, harbour...) - Shift-click removes (K)">Stamp</button>
        <button data-tool="clone" title="Copy a rectangle of terrain + props, then click to paste it (C)">Clone</button>
        <button data-tool="label" title="Add or move a named region label (M)">Label</button>
        <button data-tool="pan" title="Pan (H or middle drag)">Pan</button>
      </div>
      <div style="margin-top:8px">
        <div class="slider"><span>Brush size</span><input type="range" id="brushSize" min="1" max="30" value="4"><i id="brushSizeVal">4</i></div>
        <div class="slider"><span>Prop size</span><input type="range" id="propScale" min="50" max="200" value="100"><i id="propScaleVal">100%</i></div>
        <div class="row">
          <label>Shape</label>
          <button id="shapeSquare" class="toggle on">Square</button>
          <button id="shapeRound" class="toggle">Round</button>
        </div>
        <div class="row">
          <label>Randomise</label>
          <button id="scatterBtn" title="Scatter the selected prop naturally over the map">Scatter props</button>
        </div>
        <div class="row">
          <label>Clear props</label>
          <button id="clearPropsBtn" title="Remove every prop from the map">Remove all</button>
        </div>
      </div>
    </section>
    <section>
      <div class="tabs">
        <button class="tab on" data-tab="terrain">Terrain</button>
        <button class="tab" data-tab="props">Props</button>
        <button class="tab" data-tab="prefabs">Stamps</button>
        <button class="tab" data-tab="labels">Labels</button>
      </div>
      <div id="terrainPane">
        <div id="terrainPalette" class="swatchGrid"></div>
        <div class="catNote" id="terrainNote" style="margin-top:7px"></div>
      </div>
      <div id="propPane" hidden>
        <input type="search" id="propSearch" class="propSearch" placeholder="Search props (name, kind, palette)..." autocomplete="off">
        <div class="catRow" id="propCats"></div>
        <div class="propGrid" id="propPalette"></div>
        <div class="propCount" id="propCount"></div>
      </div>
      <div id="prefabPane" hidden>
        <div class="catNote" id="prefabNote" style="margin-bottom:7px">Pick a stamp, then click the map to drop it. Shift-click removes everything inside its footprint.</div>
        <div class="prefabList" id="prefabList"></div>
      </div>
      <div id="labelPane" hidden>
        <div class="catNote" style="margin-bottom:7px">Type a name, then click the map to drop a label. Drag a label to move it. Labels are baked into the exported PNG.</div>
        <div class="row">
          <input type="text" id="labelName" style="flex:1; min-width:0" placeholder="Region name" maxlength="40">
          <button id="labelAddBtn" title="Arm the Label tool so the next map click places this name">Place</button>
        </div>
        <div class="labelList" id="labelList"></div>
        <div class="propCount" id="labelCount"></div>
      </div>
    </section>
  </aside>

  <main id="stage">
    <canvas id="view"></canvas>
    <div id="hint">Left-drag to paint &middot; middle-drag or space to pan &middot; wheel to zoom</div>
    <div id="miniOverlay">
      <div id="miniWrap">
        <canvas id="minimap" title="Click or drag to move the view"></canvas>
        <div id="miniBox"></div>
      </div>
      <div class="aside" id="mapStats"></div>
    </div>
    <div id="busy" hidden><div class="box"><div class="spinner"></div><span id="busyText">Generating world</span></div></div>
  </main>

  <aside id="right" class="panel">
    <section>
      <h3>World settings</h3>
      <div class="row">
        <label>Theme</label>
        <select id="themeSel" style="flex:1"></select>
      </div>
      <div class="row">
        <label>Seed</label>
        <input type="number" id="seedInput" style="flex:1; min-width:0">
        <button id="randSeedBtn" title="Random seed">Roll</button>
      </div>
      <div class="row">
        <label>Size</label>
        <select id="sizeSel" style="flex:1"></select>
      </div>
      <div class="row">
        <label>Water</label>
        <select id="waterSel" style="flex:1">
          <option value="auto">Theme default</option>
          <option value="blue">Clear blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
        </select>
      </div>
      <div id="paramSliders" style="margin-top:8px"></div>
      <div class="row" style="margin-top:4px">
        <button id="resetParamsBtn" style="flex:1" title="Reset every slider to this theme's defaults">Reset theme</button>
        <button id="randomizeBtn" style="flex:1" title="Randomise every world setting and regenerate">Randomize all</button>
      </div>
      <div class="row">
        <button id="copySettingsBtn" style="flex:1" title="Copy the current world settings to the clipboard as JSON">Copy settings</button>
        <button id="pasteSettingsBtn" style="flex:1" title="Apply world settings from JSON on the clipboard">Paste settings</button>
      </div>
    </section>
    <section id="aiSection">
      <h3>AI world designer</h3>
      <textarea id="aiPrompt" placeholder="e.g. a rainy temperate island with tall snowy mountains, dense pine forests in the north and sandy beaches in the south"></textarea>
      <div class="row" style="margin-top:6px">
        <button id="aiGenBtn" class="primary" style="flex:1">Generate from description</button>
      </div>
      <div class="row">
        <button id="aiNameBtn" style="flex:1" title="Invent a name and a short legend for this map">Name this map</button>
      </div>
      <div id="aiOut" class="aside" style="margin-top:6px; min-height:16px"></div>
    </section>
    <section>
      <h3>Map info</h3>
      <div class="row"><label>Name</label><input type="text" id="mapName" style="flex:1" placeholder="Unnamed map"></div>
      <div id="legendBox" class="aside"></div>
    </section>
  </aside>

  <footer id="statusbar">
    <span>Tile <b id="stTile">-</b></span>
    <span>Terrain <b id="stTerrain">-</b></span>
    <span>Props <b id="stProps">0</b></span>
    <span>Zoom <b id="stZoom">100%</b></span>
    <span>Size <b id="stSize">-</b></span>
    <span id="stDirty" style="color:var(--gold)"></span>
  </footer>
  <div id="scrim"></div>
</div>

<dialog id="saveDlg">
  <h3>Save map</h3>
  <div class="row">
    <label>Name</label>
    <input type="text" id="saveName" style="flex:1">
  </div>
  <div class="aside">Saved maps live in this browser and survive reloads. Saving over an existing name replaces it.</div>
  <div class="dlgRow">
    <button id="saveCancel">Cancel</button>
    <button id="saveOk" class="primary">Save</button>
  </div>
</dialog>

<dialog id="loadDlg">
  <h3>Load map</h3>
  <div id="loadList"></div>
  <div class="dlgRow">
    <button id="loadCancel">Close</button>
  </div>
</dialog>

<dialog id="helpDlg">
  <h3>Keyboard shortcuts &amp; tips</h3>
  <div class="helpGrid">
    <b>Tools</b>
    <span class="keys"><kbd>B</kbd></span><span>Paint terrain</span>
    <span class="keys"><kbd>R</kbd></span><span>Rectangle fill</span>
    <span class="keys"><kbd>F</kbd></span><span>Flood fill</span>
    <span class="keys"><kbd>L</kbd></span><span>Line</span>
    <span class="keys"><kbd>I</kbd></span><span>Eyedropper (pick terrain)</span>
    <span class="keys"><kbd>T</kbd></span><span>Place prop</span>
    <span class="keys"><kbd>V</kbd></span><span>Select / move / delete prop</span>
    <span class="keys"><kbd>X</kbd></span><span>Erase props (drag to sweep)</span>
    <span class="keys"><kbd>K</kbd></span><span>Stamp a prefab</span>
    <span class="keys"><kbd>C</kbd></span><span>Clone a region of the map</span>
    <span class="keys"><kbd>M</kbd></span><span>Place / move a region label</span>
    <span class="keys"><kbd>H</kbd></span><span>Pan</span>
    <b>View</b>
    <span class="keys"><kbd>Space</kbd></span><span>Hold to pan</span>
    <span class="keys"><kbd>Wheel</kbd></span><span>Zoom at cursor</span>
    <span class="keys"><kbd>0</kbd></span><span>Fit map to view</span>
    <span class="keys"><kbd>G</kbd></span><span>Toggle tile grid</span>
    <span class="keys"><kbd>P</kbd></span><span>Toggle props</span>
    <b>Editing</b>
    <span class="keys"><kbd>[</kbd><kbd>]</kbd></span><span>Brush size down / up</span>
    <span class="keys"><kbd>Ctrl</kbd><kbd>Z</kbd></span><span>Undo</span>
    <span class="keys"><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>Z</kbd></span><span>Redo</span>
    <span class="keys"><kbd>E</kbd></span><span>Flip the selected prop</span>
    <span class="keys"><kbd>Del</kbd></span><span>Delete the selected prop</span>
    <span class="keys"><kbd>Esc</kbd></span><span>Deselect</span>
  </div>
  <div class="aside">Tip: with the Erase tool the Brush-size slider sets the erase radius, and holding Shift scrubs a single small area. Prop search matches the sprite name, its kind and its palette. With the Prop tool, right-drag (or Shift-click) erases the prop under the cursor. The Stamp tool drops a whole prefab - house plot, farm, market, harbour, graveyard - in one click; the Prop-size slider scales it and Shift-click clears its footprint. The Clone tool copies a rectangle of terrain <em>and</em> props: drag a box to copy it, then click to paste (click repeatedly to stamp it around; the ghost follows the cursor). The Label tool drops named region markers that are drawn on the map, the minimap and the exported PNG.</div>
  <div class="dlgRow">
    <button id="helpClose" class="primary">Got it</button>
  </div>
</dialog>
`;

```

## 01-internal-code/src/world.js

_72051 bytes_

```javascript
import { TERRAIN_INDEX, TILE } from "./tileset.js";
import { PROPS } from "./props.js";
import { clamp, lerp, smoothstep, fbm2D, ridge2D, hash2i, hash3i, mulberry32, seedFromString, valueNoise2D } from "./noise.js";

const TI = TERRAIN_INDEX;

const FLOWER_IDS = [338, 349, 350, 351, 352, 453, 456, 457, 466, 506, 507, 508, 509, 510, 511, 512, 513, 514];
const ORE_NAMES = ["grey ore chunk", "brown nuggets", "grey lump", "ore boulders"];

export const THEMES = {
  temperate: { label: "Temperate", temperature: 0.66, moisture: 0.55, relief: 0.50, autumn: 0.08, snow: 0.5, fragment: 0.10, farms: 0.55, villages: 0.45, reeds: 0.4 },
  autumn: { label: "Autumn", temperature: 0.62, moisture: 0.55, relief: 0.48, autumn: 0.95, snow: 0.35, fragment: 0.10, farms: 0.6, villages: 0.45, reeds: 0.35 },
  tropical: { label: "Tropical", temperature: 0.94, moisture: 0.80, relief: 0.42, autumn: 0.0, snow: 0.05, fragment: 0.34, farms: 0.3, villages: 0.3, reeds: 0.8 },
  desert: { label: "Desert", temperature: 0.94, moisture: 0.06, relief: 0.36, autumn: 0.0, snow: 0.0, fragment: 0.08, farms: 0.1, villages: 0.2, reeds: 0.05 },
  tundra: { label: "Tundra", temperature: 0.22, moisture: 0.48, relief: 0.55, autumn: 0.10, snow: 0.95, fragment: 0.10, farms: 0.08, villages: 0.15, reeds: 0.15 },
  boreal: { label: "Boreal", temperature: 0.36, moisture: 0.62, relief: 0.52, autumn: 0.2, snow: 0.75, fragment: 0.16, farms: 0.2, villages: 0.25, reeds: 0.4 },
  swamp: { label: "Swamp", temperature: 0.78, moisture: 0.95, relief: 0.16, autumn: 0.1, snow: 0.0, waterTint: "green", fragment: 0.30, farms: 0.12, villages: 0.2, reeds: 0.95 },
  highland: { label: "Highland", temperature: 0.60, moisture: 0.52, relief: 0.92, autumn: 0.15, snow: 0.34, fragment: 0.14, farms: 0.35, villages: 0.4, reeds: 0.2 },
  volcanic: { label: "Volcanic", temperature: 0.88, moisture: 0.28, relief: 0.95, autumn: 0.0, snow: 0.1, volcanic: true, lava: 1.15, fragment: 0.20, farms: 0.1, villages: 0.2, reeds: 0.1 },
  archipelago: { label: "Archipelago", temperature: 0.82, moisture: 0.68, relief: 0.45, autumn: 0.05, snow: 0.2, island: 0.92, seaLevel: 0.60, fragment: 0.78, farms: 0.45, villages: 0.5, reeds: 0.55 },
};

export const DEFAULT_PARAMS = {
  seed: 478211,
  width: 96,
  height: 96,
  theme: "temperate",
  seaLevel: 0.44,
  island: 0.45,
  relief: 0.5,
  temperature: 0.58,
  moisture: 0.55,
  snow: 0.45,
  autumn: 0.08,
  rivers: 0.55,
  lakes: 0.5,
  forest: 0.42,
  plants: 0.45,
  rocks: 0.3,
  paths: 0.3,
  farms: 0.4,
  crops: 1,
  villages: 0.35,
  reeds: 0.4,
  propDensity: 1,
  villageSize: 1,
  market: 1,
  landmarks: 1,
  camps: 0.5,
  graves: 1,
  ruins: 1,
  harbors: 1,
  wildlife: 1,
  flowers: 0.5,
  ore: 0.35,
  lava: 0.5,
  shore: 0.5,
  fragment: 0.1,
  waterTint: "auto",
};

const THEME_KEYS = ["temperature", "moisture", "relief", "autumn", "snow", "island", "seaLevel", "fragment", "waterTint", "volcanic", "lava", "farms", "villages", "reeds"];

export function normalizeParams(input) {
  const p = { ...DEFAULT_PARAMS, ...(input || {}) };
  const theme = THEMES[p.theme] ? p.theme : "temperate";
  const th = THEMES[theme];
  const explicit = (k) => input && input[k] !== undefined;
  for (const k of THEME_KEYS) {
    const sameAsDefault = Math.abs(p[k] - DEFAULT_PARAMS[k]) < 1e-9 || p[k] === DEFAULT_PARAMS[k];
    if (!explicit(k) && sameAsDefault && th[k] !== undefined) p[k] = th[k];
  }
  p.theme = theme;
  p.seed = Math.floor(p.seed) >>> 0;
  p.width = clamp(Math.round(p.width), 16, 512);
  p.height = clamp(Math.round(p.height), 16, 512);
  p.seaLevel = clamp(p.seaLevel, 0.05, 0.95);
  p.island = clamp(p.island, 0, 1);
  p.relief = clamp(p.relief, 0, 1);
  p.temperature = clamp(p.temperature, 0, 1);
  p.moisture = clamp(p.moisture, 0, 1);
  p.snow = clamp(p.snow, 0, 1);
  p.autumn = clamp(p.autumn, 0, 1);
  p.rivers = clamp(p.rivers, 0, 1);
  p.lakes = clamp(p.lakes, 0, 1);
  p.forest = clamp(p.forest, 0, 1.5);
  p.plants = clamp(p.plants, 0, 1.5);
  p.rocks = clamp(p.rocks, 0, 1.5);
  p.paths = clamp(p.paths, 0, 1);
  p.farms = clamp(p.farms, 0, 1.5);
  p.crops = clamp(p.crops, 0, 2);
  p.villages = clamp(p.villages, 0, 1.5);
  p.reeds = clamp(p.reeds, 0, 1.5);
  p.propDensity = clamp(p.propDensity, 0, 2);
  p.villageSize = clamp(p.villageSize, 0.4, 1.8);
  p.market = clamp(p.market, 0, 2);
  p.landmarks = clamp(p.landmarks, 0, 1.6);
  p.camps = clamp(p.camps, 0, 2);
  p.graves = clamp(p.graves, 0, 2);
  p.ruins = clamp(p.ruins, 0, 2);
  p.harbors = clamp(p.harbors, 0, 2);
  p.wildlife = clamp(p.wildlife, 0, 2);
  p.flowers = clamp(p.flowers, 0, 1.5);
  p.ore = clamp(p.ore, 0, 1.5);
  p.lava = clamp(p.lava, 0, 1.5);
  p.shore = clamp(p.shore, 0, 1);
  p.fragment = clamp(p.fragment, 0, 1);
  p.volcanic = !!p.volcanic;
  return p;
}

function MinHeap(cap) {
  const keys = new Float64Array(cap);
  const vals = new Int32Array(cap);
  let size = 0;
  const heap = {
    get size() { return size; },
    lastKey: 0,
    push(key, val) {
      let i = size++;
      keys[i] = key; vals[i] = val;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (keys[p] <= keys[i]) break;
        const k = keys[p], v = vals[p];
        keys[p] = keys[i]; vals[p] = vals[i];
        keys[i] = k; vals[i] = v;
        i = p;
      }
    },
    pop() {
      const topKey = keys[0], topVal = vals[0];
      size--;
      if (size > 0) {
        keys[0] = keys[size]; vals[0] = vals[size];
        let i = 0;
        for (;;) {
          const l = i * 2 + 1, r = l + 1;
          let m = i;
          if (l < size && keys[l] < keys[m]) m = l;
          if (r < size && keys[r] < keys[m]) m = r;
          if (m === i) break;
          const k = keys[m], v = vals[m];
          keys[m] = keys[i]; vals[m] = vals[i];
          keys[i] = k; vals[i] = v;
          i = m;
        }
      }
      heap.lastKey = topKey;
      return topVal;
    },
  };
  return heap;
}

export const PROP_GROUPS = (() => {
  const g = { tree: {}, bush: {}, plant: [], rock: [], conifer: [], conifer_snow: [] };
  const EXTRA_KINDS = ["cherry", "fruit_tree", "dead_tree", "mushroom", "reed", "crop", "stump", "log",
    "fence", "structure", "barrel", "cart", "sack", "sign", "lantern", "statue", "stall", "boat",
    "furniture", "good", "decal", "gravestone", "animal"];
  for (const k of EXTRA_KINDS) g[k] = [];
  const byName = {};
  PROPS.forEach((row, i) => {
    const kind = row[4], palette = row[5];
    if (kind === "tree" || kind === "bush") {
      if (!g[kind][palette]) g[kind][palette] = [];
      g[kind][palette].push(i);
    } else if (g[kind]) g[kind].push(i);
    if (row[7] && byName[row[7]] === undefined) byName[row[7]] = i;
  });
  g.treePalettes = Object.keys(g.tree).sort();
  g.bushPalettes = Object.keys(g.bush).sort();
  g.rockByPal = {};
  for (const i of g.rock) {
    const pal = PROPS[i][5];
    (g.rockByPal[pal] = g.rockByPal[pal] || []).push(i);
  }
  g.byName = byName;
  g.reedGreen = g.reed.filter((i) => PROPS[i][5] === "green");
  g.ore = ORE_NAMES.map((n) => byName[n]).filter((i) => i !== undefined);
  g.flower = FLOWER_IDS.filter((i) => PROPS[i] && PROPS[i][4] === "plant");
  return g;
})();

export const DECAL_INDEX = (() => {
  const m = {};
  PROPS.forEach((row, i) => {
    if (row[4] === "decal" && row[7] && m[row[7]] === undefined) m[row[7]] = i;
  });
  return m;
})();

export const SETTLEMENT_KINDS = new Set(["decal", "structure", "fence", "barrel", "cart", "sack",
  "sign", "lantern", "statue", "stall", "boat", "crop", "furniture", "good", "gravestone"]);

export const VILLAGE_PARTS = (() => {
  const m = PROP_GROUPS.byName;
  const g = (n) => (m[n] !== undefined ? m[n] : -1);
  const list = (...n) => n.map(g).filter((x) => x >= 0);
  return {
    camp: g("stone and tile"),
    mine: g("stone steps"),
    torii: g("torii gate red"),
    shinto: g("stone structure"),
    windmill: g("windmill"),
    well: g("water pond"),
    statue: g("stone lion"),
    arch: g("stone arch"),
    sign: list("wooden signs", "inn sign", "tall lamp post", "wooden post", "notice board"),
    stall: list("market stand"),
    counter: g("market counter"),
    fishStall: g("fish stall"),
    fish: list("green fish pile", "blue fish pile", "red fish pile", "eel pile", "green fish pair", "red fish pair"),
    lamp: list("street lamp", "standing torch", "oil lamp"),
    barrel: list("wooden barrel", "wood group", "tall wood"),
    cart: list("wood flatbed", "hay and tools"),
    hay: g("hay cart"),
    sack: list("sack of grain", "sacks of grain", "sack of beans"),
    bench: list("white bench", "wood bench", "bench seat"),
    produce: list("basket of bread", "green melon", "red tomato", "orange fruit", "red apple", "brown potato", "green cabbage",
      "baskets of grains", "baskets of greens", "food pot", "blue vase", "metal tray", "potion bottles",
      "green fish pile", "blue fish pile", "red fish pile", "eel pile", "green fish pair", "red fish pair"),
    greens: list("potted plant", "red chili peppers", "green sprouts", "berry plants", "small berry bushes", "green bushes"),
    crops: list("tall corn stalks", "leafy plants", "carrot with top", "carrot root", "yellow leafy plant", "cucumber", "tall green plant"),
    boat: g("wooden rowboats"),
    ship: g("sampan ship"),
    dock: g("stone dock"),
    gravestone: list("grave cluster", "grave and headstone", "round headstone", "tall grave cross", "grave marker"),
    graveSmall: list("round headstone", "grave marker", "tall grave cross"),
    toro: g("stone lantern"),
    cow: g("cow"),
    deer: g("deer"),
    wheel: list("wheelbarrow", "wheelbarrow with hay", "wheelbarrow empty"),
    ruins: list("stone arch", "stone pillar", "round stone", "wall segment", "stone structure", "stone steps", "stone and tile"),
    relic: list("old chest", "skeleton", "cobweb corner"),
    rubble: list("small stone cluster", "stone pair", "small grey stones", "grey lump", "grey block", "mossy boulder", "brown boulder", "ore boulders"),
    boulder: list("grey boulder", "brown boulder", "mossy boulder", "grey block", "dark boulder"),
    plaza: list("dirt pebbles", "gravel floor", "dirt pebbles", "cave floor"),
    lily: list("white lily pad", "starfish", "fish school"),
  };
})();

function pickFrom(list, rnd) {
  if (!list || !list.length) return -1;
  return list[Math.min(list.length - 1, Math.floor(rnd() * list.length))];
}

export const FENCE_STYLES = { rail: 867, picket: 885 };

function fenceTile(base, up, down, left, right) {
  if (left || right) {
    const c = (left && right) ? 1 : (right ? 0 : 2);
    const row = up ? (down ? 3 : 4) : (down ? 2 : 0);
    return base + row * 3 + c;
  }
  const c = up ? (down ? 1 : 0) : 2;
  return base + 3 + c;
}

function buildFence(out, blocked, cw, ch, cells, style, rnd, gates) {
  const base = FENCE_STYLES[style] === undefined ? style : FENCE_STYLES[style];
  const key = (x, y) => x * 1024 + y;
  const set = new Set();
  for (let i = 0; i < cells.length; i += 2) set.add(key(cells[i], cells[i + 1]));
  let n = 0;
  for (let i = 0; i < cells.length; i += 2) {
    const x = cells[i], y = cells[i + 1];
    const sprite = gates && gates.has(key(x, y)) ? base + 16
      : gates && gates.has(key(x + 1, y)) ? base + 15
      : gates && gates.has(key(x - 1, y)) ? base + 17
      : fenceTile(base,
        set.has(key(x, y - 1)) ? 1 : 0,
        set.has(key(x, y + 1)) ? 1 : 0,
        set.has(key(x - 1, y)) ? 1 : 0,
        set.has(key(x + 1, y)) ? 1 : 0);
    if (addProp(out, blocked, cw, ch, sprite, x, y, rnd, true)) n++;
  }
  return n;
}

function fieldVariant(name, rnd) {
  if (rnd() >= 0.8) return name;
  if (name === "wheat field") return "wheat field 2";
  if (name === "young wheat") return "young wheat 2";
  if (name === "plowed soil") return "plowed soil alt";
  return name;
}

function buildTerrain(cw, ch, elev, filled, depth, moist, temp, rock, distWater, params) {
  const n = cw * ch;
  const corners = new Uint8Array(n);
  const tint = params.waterTint;
  const seed = params.seed;
  const p1 = new Float32Array(n), p2 = new Float32Array(n), p3 = new Float32Array(n);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = y * cw + x;
      p1[i] = valueNoise2D(x * 0.15, y * 0.15, seed + 1234);
      p2[i] = valueNoise2D(x * 0.27 + 17, y * 0.27 + 31, seed + 2468);
      p3[i] = valueNoise2D(x * 0.10 + 53, y * 0.10 + 71, seed + 3579);
    }
  }
  for (let i = 0; i < n; i++) {
    const e = elev[i] - params.seaLevel;
    const d = depth[i];
    const t = temp[i];
    const m = moist[i];
    const r = rock[i];
    const a = p1[i], b = p2[i], cc = p3[i];
    if (d > 0) {
      const frozen = t < 0.15 + params.snow * 0.11;
      const sandy = m < 0.30 || (t > 0.78 && m < 0.62);
      if (frozen) corners[i] = d < 0.75 ? TI.Ice_Melting : TI.Ice;
      else if (tint === "green" && d > 0.35) corners[i] = d < 1.1 ? TI.Water_Green : TI.Water_Deep;
      else if (tint === "purple" && d > 0.35) corners[i] = d < 1.1 ? TI.Water_Purple : TI.Water_Deep;
      else if (d < 0.45) corners[i] = sandy ? TI.Water_Shallows_Sand : TI.Water_Shallows_Dirt;
      else if (d < 1.3) corners[i] = TI.Water;
      else if (d < 2.4 && b > 0.64) corners[i] = TI.Water;
      else corners[i] = TI.Water_Deep;
      continue;
    }
    if (e < 0.04 + params.shore * 0.04 && distWater[i] < 2.2 + params.shore * 4.6) {
      if (t < 0.18) corners[i] = TI.Snow_1;
      else if (t < 0.31) corners[i] = r > 0.58 && a > 0.4 ? TI.Gravel_1 : TI.Stone_Tan;
      else corners[i] = r > 0.76 && a > 0.62 ? TI.Gravel_1 : TI.Sand;
      continue;
    }
    const hill = smoothstep(0.14, 0.62, e);
    const rockiness = clamp(r * 0.55 + hill * 0.45 * (0.35 + 0.80 * params.relief) - 0.10 + (params.volcanic ? 0.12 : 0), 0, 1);
    const ma = a * 0.11 - 0.055;
    const mb = b * 0.10 - 0.05;
    const lava = params.lava;
    const volcanic = params.volcanic || (lava > 0.6 && t > 0.72 && m < 0.34);
    if (volcanic && rockiness > 0.34 + (0.5 - lava) * 0.28 && e > 0.05 - (lava - 0.5) * 0.06 && cc > 0.24 + (0.5 - lava) * 0.20) {
      corners[i] = a > 0.36 ? TI.Lava : TI.Earth_Cracked;
      continue;
    }
    const mm = clamp(m + ma * 0.9 - (params.volcanic ? 0.34 : 0), 0, 1);
    const tt = clamp(t + mb * 0.7, 0, 1);
    const snowT = 0.06 + params.snow * 0.42;
    if (tt < snowT - 0.05 && rockiness < 0.62) {
      corners[i] = cc < 0.55 ? TI.Snow_2 : TI.Snow_1;
      continue;
    }
    if (rockiness > 0.60 + mb) {
      if (t < 0.30) corners[i] = TI.Rock_White;
      else if (m > 0.64) corners[i] = cc < 0.55 ? TI.Mudstone_Brown : TI.Rock_Gray;
      else if (m < 0.30 && hill < 0.55) corners[i] = cc < 0.55 ? TI.Stone_Tan : TI.Earth_Cracked;
      else if (cc < 0.38) corners[i] = TI.Rock_Gray;
      else if (cc < 0.68) corners[i] = TI.Rock_Dark;
      else corners[i] = TI.Stone_White;
      continue;
    }
    if (rockiness > 0.44 + ma) {
      corners[i] = hill > 0.45 ? (cc < 0.5 ? TI.Rock_Gray : TI.Mudstone_Gray) : (m < 0.35 ? TI.Stone_Tan : cc < 0.5 ? TI.Mudstone_Gray : TI.Rock_Gray);
      continue;
    }
    if (tt < snowT + 0.115) {
      if (hill > 0.42 && cc > 0.30) corners[i] = TI.Snow_1;
      else corners[i] = cc < 0.30 ? TI.Grass_Dead : (cc < 0.62 ? TI.Grass_Dark : (cc < 0.80 ? TI.Grass_Dead : TI.Stone_Tan));
      continue;
    }
    if (mm < 0.22) {
      if (cc < 0.42) corners[i] = TI.Sand;
      else if (cc < 0.66) corners[i] = TI.Earth_Cracked;
      else if (cc < 0.86) corners[i] = TI.Stone_Tan;
      else corners[i] = TI.Gravel_1;
    } else if (mm < 0.34) {
      corners[i] = cc < 0.5 ? TI.Grass_Dead : (cc < 0.78 ? TI.Dirt_Tan : TI.Gravel_1);
    } else if (mm < 0.62) {
      corners[i] = cc < 0.78 ? TI.Grass : TI.Grass_Light;
    } else if (mm < 0.80) {
      corners[i] = cc < 0.72 ? TI.Grass_Dark : TI.Soil;
    } else {
      corners[i] = cc < 0.45 ? TI.Mud_Brown : (cc < 0.80 ? TI.Grass_Dark : TI.Dirt_Roots);
    }
  }
  return corners;
}

function priorityFlood(cw, ch, elev) {
  const n = cw * ch;
  const filled = new Float32Array(elev);
  const order = new Int32Array(n).fill(-1);
  const seen = new Uint8Array(n);
  const heap = MinHeap(n + 8);
  for (let x = 0; x < cw; x++) {
    for (const y of [0, ch - 1]) {
      const i = y * cw + x;
      if (!seen[i]) { seen[i] = 1; heap.push(elev[i], i); }
    }
  }
  for (let y = 0; y < ch; y++) {
    for (const x of [0, cw - 1]) {
      const i = y * cw + x;
      if (!seen[i]) { seen[i] = 1; heap.push(elev[i], i); }
    }
  }
  let tick = 0;
  while (heap.size > 0) {
    const i = heap.pop();
    const e = heap.lastKey;
    order[i] = tick++;
    const x = i % cw, y = (i - x) / cw;
    if (x > 0) { const j = i - 1; if (!seen[j]) { seen[j] = 1; filled[j] = Math.max(elev[j], e); heap.push(filled[j], j); } }
    if (x < cw - 1) { const j = i + 1; if (!seen[j]) { seen[j] = 1; filled[j] = Math.max(elev[j], e); heap.push(filled[j], j); } }
    if (y > 0) { const j = i - cw; if (!seen[j]) { seen[j] = 1; filled[j] = Math.max(elev[j], e); heap.push(filled[j], j); } }
    if (y < ch - 1) { const j = i + cw; if (!seen[j]) { seen[j] = 1; filled[j] = Math.max(elev[j], e); heap.push(filled[j], j); } }
  }
  return { filled, order };
}

function pruneLakes(cw, ch, filled, elev, minSize) {
  const n = cw * ch;
  const isPit = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (filled[i] - elev[i] > 0.0015) isPit[i] = 1;
  const seen = new Uint8Array(n);
  const stack = [];
  const water = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!isPit[i] || seen[i]) continue;
    stack.length = 0; stack.push(i); seen[i] = 1;
    const comp = [];
    while (stack.length) {
      const p = stack.pop(); comp.push(p);
      const x = p % cw, y = (p - x) / cw;
      if (x > 0 && isPit[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack.push(p - 1); }
      if (x < cw - 1 && isPit[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack.push(p + 1); }
      if (y > 0 && isPit[p - cw] && !seen[p - cw]) { seen[p - cw] = 1; stack.push(p - cw); }
      if (y < ch - 1 && isPit[p + cw] && !seen[p + cw]) { seen[p + cw] = 1; stack.push(p + cw); }
    }
    if (comp.length >= minSize) for (const p of comp) water[p] = 1;
    else for (const p of comp) filled[p] = elev[p];
  }
  return water;
}

function despeckleWater(cw, ch, water) {
  const n = cw * ch;
  for (let pass = 0; pass < 2; pass++) {
    const flip = [];
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const i = y * cw + x;
        let wn = 0, tot = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
            tot++;
            if (water[ny * cw + nx]) wn++;
          }
        }
        if (water[i] && wn === 0) flip.push(i);
        else if (!water[i] && tot >= 6 && wn >= tot - 1) flip.push(i);
      }
    }
    if (!flip.length) break;
    for (const i of flip) water[i] = water[i] ? 0 : 1;
  }
}

function flowAccumulate(cw, ch, filled, order) {
  const n = cw * ch;
  const list = new Int32Array(n);
  for (let i = 0; i < n; i++) list[i] = i;
  const arr = Array.from(list);
  arr.sort((a, b) => filled[b] - filled[a] || order[b] - order[a]);
  const flow = new Float32Array(n).fill(1);
  for (const i of arr) {
    const x = i % cw, y = (i - x) / cw;
    let best = -1, bestF = Infinity, bestO = Infinity;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        const j = ny * cw + nx;
        const f = filled[j];
        if (f < bestF || (f === bestF && order[j] < bestO)) { bestF = f; bestO = order[j]; best = j; }
      }
    }
    if (best >= 0) flow[best] += flow[i];
  }
  return flow;
}

function distanceTransform(cw, ch, mask) {
  const n = cw * ch;
  const dist = new Float32Array(n).fill(1e9);
  const queue = new Int32Array(n);
  let head = 0, tail = 0;
  for (let i = 0; i < n; i++) if (mask[i]) { dist[i] = 0; queue[tail++] = i; }
  while (head < tail) {
    const i = queue[head++];
    const x = i % cw, y = (i - x) / cw;
    const d = dist[i] + 1;
    if (x > 0 && dist[i - 1] > d) { dist[i - 1] = d; queue[tail++] = i - 1; }
    if (x < cw - 1 && dist[i + 1] > d) { dist[i + 1] = d; queue[tail++] = i + 1; }
    if (y > 0 && dist[i - cw] > d) { dist[i - cw] = d; queue[tail++] = i - cw; }
    if (y < ch - 1 && dist[i + cw] > d) { dist[i + cw] = d; queue[tail++] = i + cw; }
  }
  return dist;
}

function isWaterTerrain(t) {
  return t === TI.Water || t === TI.Water_Deep || t === TI.Water_Shallows_Dirt || t === TI.Water_Shallows_Sand || t === TI.Water_Green || t === TI.Water_Purple || t === TI.Ice || t === TI.Ice_Melting;
}

function carvePaths(cw, ch, corners, elev, params, rnd) {
  const n = cw * ch;
  const land = [];
  for (let i = 0; i < n; i++) if (!isWaterTerrain(corners[i]) && corners[i] !== TI.Lava) land.push(i);
  if (land.length < 60) return 0;
  const count = Math.max(1, Math.round(params.paths * 6));
  const pathTerrain = rnd() < 0.5 ? TI.Dirt_Tan : TI.Gravel_1;
  const cost = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = corners[i];
    cost[i] = isWaterTerrain(t) ? 320 : (t === TI.Sand || t === TI.Gravel_1 || t === TI.Dirt_Tan ? 1.4 : 4);
  }
  const gScore = new Float32Array(n);
  const cameFrom = new Int32Array(n);
  let made = 0;
  for (let k = 0; k < count; k++) {
    let a = -1, b = -1, bestD = -1;
    for (let tries = 0; tries < 60; tries++) {
      const p = land[Math.floor(rnd() * land.length)];
      const q = land[Math.floor(rnd() * land.length)];
      const d = Math.hypot((p % cw) - (q % cw), ((p / cw) | 0) - ((q / cw) | 0));
      if (d > 14 && d < 46 && d > bestD) { bestD = d; a = p; b = q; }
      if (bestD > 30) break;
    }
    if (a < 0 || b < 0) continue;
    gScore.fill(Infinity); cameFrom.fill(-1);
    const heap = MinHeap(n * 6);
    gScore[a] = 0;
    const goalX = b % cw, goalY = (b / cw) | 0;
    const hf = (i) => { const x = i % cw, y = (i - x) / cw; return Math.hypot(x - goalX, y - goalY) * 1.4; };
    heap.push(hf(a), a);
    let found = false, iter = 0;
    while (heap.size > 0 && iter++ < 60000) {
      const i = heap.pop();
      const gi = heap.lastKey;
      if (i === b) { found = true; break; }
      if (gi > gScore[i] + hf(i) + 1e-6) continue;
      const x = i % cw, y = (i - x) / cw;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
          const j = ny * cw + nx;
          const step = Math.hypot(dx, dy) * cost[j] * (1 + Math.abs(elev[j] - elev[i]) * 16);
          const g2 = gScore[i] + step;
          if (g2 < gScore[j] - 1e-6) {
            gScore[j] = g2;
            cameFrom[j] = i;
            heap.push(g2 + hf(j), j);
          }
        }
      }
    }
    if (!found) continue;
    let cur = b, guard = 0;
    while (cur >= 0 && guard++ < 8000) {
      if (!isWaterTerrain(corners[cur]) && corners[cur] !== TI.Lava) corners[cur] = pathTerrain;
      cur = cameFrom[cur];
    }
    made++;
  }
  return made;
}

function softGround(t) {
  return t === TI.Grass || t === TI.Grass_Light || t === TI.Grass_Dark || t === TI.Grass_Dead ||
    t === TI.Soil || t === TI.Dirt_Tan || t === TI.Dirt_Roots || t === TI.Mud_Brown || t === TI.Sand;
}

function buildable(t) {
  return !isWaterTerrain(t) && t !== TI.Lava;
}

function pick(list, rnd) {
  return list && list.length ? list[Math.min(list.length - 1, Math.floor(rnd() * list.length))] : -1;
}

function addDecal(out, blocked, cw, ch, name, tx, ty) {
  const s = typeof name === "number" ? name : DECAL_INDEX[name];
  if (s === undefined || s < 0) return false;
  if (tx < 0 || ty < 0 || tx >= cw - 1 || ty >= ch - 1) return false;
  const row = PROPS[s];
  out.push({ x: tx * TILE + row[2] / 2, y: ty * TILE + row[3], s, flip: 0, kind: "decal", sc: 1 });
  blocked[ty * cw + tx] = 1;
  return true;
}

function addProp(out, blocked, cw, ch, sprite, tx, ty, rnd, block = true) {
  const row = PROPS[sprite];
  if (!row) return false;
  if (tx < 0 || ty < 0 || tx >= cw - 1 || ty >= ch - 1) return false;
  out.push({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE, s: sprite, flip: rnd() < 0.5 ? 1 : 0, kind: row[4], sc: 1 });
  if (block) blocked[ty * cw + tx] = 1;
  return true;
}

function roadCells(cw, ch, corners, elev, a, b) {
  const n = cw * ch;
  const cost = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = corners[i];
    cost[i] = isWaterTerrain(t) ? 90 : (t === TI.Sand || t === TI.Gravel_1 || t === TI.Dirt_Tan ? 1.5 : 4);
  }
  const g = new Float32Array(n).fill(Infinity);
  const from = new Int32Array(n).fill(-1);
  const heap = MinHeap(n * 6);
  const gx = b % cw, gy = (b / cw) | 0;
  const hf = (i) => Math.hypot((i % cw) - gx, ((i / cw) | 0) - gy) * 1.4;
  g[a] = 0;
  heap.push(hf(a), a);
  let iter = 0;
  while (heap.size > 0 && iter++ < 60000) {
    const i = heap.pop();
    const gi = heap.lastKey;
    if (i === b) break;
    if (gi > g[i] + hf(i) + 1e-6) continue;
    const x = i % cw, y = (i - x) / cw;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        const j = ny * cw + nx;
        const step = Math.hypot(dx, dy) * cost[j] * (1 + Math.abs(elev[j] - elev[i]) * 14);
        const g2 = g[i] + step;
        if (g2 < g[j] - 1e-6) {
          g[j] = g2;
          from[j] = i;
          heap.push(g2 + hf(j), j);
        }
      }
    }
  }
  if (b !== a && from[b] < 0) return null;
  const out = [];
  let cur = b, guard = 0;
  while (cur >= 0 && guard++ < 20000) {
    out.push(cur);
    if (cur === a) break;
    cur = from[cur];
  }
  return out;
}

function paintRoad(corners, cells, terrain, blocked, cw, ch) {
  for (const i of cells) {
    if (isWaterTerrain(corners[i]) || corners[i] === TI.Lava) continue;
    corners[i] = terrain;
    const x = i % cw, y = (i - x) / cw;
    blocked[i] = 1;
    if (x > 0) blocked[i - 1] = 1;
    if (x < cw - 1) blocked[i + 1] = 1;
  }
}

function crossWater(corners, cw, ch, cells, out, blocked, rnd) {
  let bridges = 0, fords = 0;
  let i = 0;
  while (i < cells.length) {
    const ci = cells[i];
    if (!isWaterTerrain(corners[ci])) { i++; continue; }
    let j = i;
    while (j < cells.length && isWaterTerrain(corners[cells[j]])) j++;
    const run = cells.slice(i, j);
    if (run.length <= 3) {
      for (const k of run) corners[k] = rnd() < 0.5 ? TI.Sand : TI.Gravel_1;
      fords++;
    } else {
      for (const k of run) {
        const x = k % cw, y = (k - x) / cw;
        addDecal(out, blocked, cw, ch, rnd() < 0.85 ? "stone path" : "gravel floor", x, y);
      }
      bridges++;
    }
    i = j;
  }
  return { bridges, fords };
}

const FIELD_KITS = [
  { dry: ["plowed soil", "wheat field", "young wheat", "tall grass", "wheat field 2", "young wheat 2"], wet: ["reed field", "plowed soil", "wheat field"] },
];

const CAMP_KIT = [
  ["tent", 0, 0, 0.95],
  ["campfire", -1, 2, 0.9],
  ["firewood pile", -2, 1, 0.75],
  ["boiling cauldron", 1, 2, 0.7],
  ["fur rug", 0, 3, 0.45],
  ["wooden barrel", 2, 2, 0.6],
  ["stacked sacks", -2, 3, 0.5],
  ["hay cart", 2, 0, 0.4],
  ["tent", 3, 1, 0.45],
  ["standing torch", -3, 1, 0.5],
  ["green shrub", 3, 3, 0.5],
];

function planSettlements(cw, ch, corners, elev, moist, temp, rock, water, depth, distWater, params, rnd) {
  const W = cw - 1, H = ch - 1;
  const out = [];
  const blocked = new Uint8Array(cw * ch);
  const clear = new Uint8Array(cw * ch);
  const stats = { villages: 0, farms: 0, bridges: 0, fords: 0, roads: 0, graves: 0, docks: 0, ships: 0, ruins: 0, camps: 0 };
  const key = (x, y) => x * 1000 + y;
  const occupyBox = (set, x, y, w, h) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set.add(key(x + i, y + j));
  };
  const boxFree = (set, x, y, w, h) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const bx = x + i, by = y + j;
      if (bx < 1 || by < 1 || bx >= W - 1 || by >= H - 1) return false;
      if (set.has(key(bx, by))) return false;
    }
    return true;
  };
  const boxBuildable = (x, y, w, h) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const bx = x + i, by = y + j;
      if (bx < 0 || by < 0 || bx >= cw || by >= ch) return false;
      if (!buildable(corners[by * cw + bx])) return false;
    }
    return true;
  };
  const Rscale = clamp(Math.min(W, H) / 110, 0.62, 1.35) * clamp(params.villageSize || 1, 0.4, 1.8);
  const V = VILLAGE_PARTS;
  if (params.villages <= 0.001 && params.farms <= 0.001) return { props: out, blocked, clear, stats };

  const cands = [];
  for (let ty = 3; ty < H - 3; ty++) {
    for (let tx = 3; tx < W - 3; tx++) {
      const i = ty * cw + tx;
      if (!buildable(corners[i]) || !softGround(corners[i])) continue;
      let mn = Infinity, mx = -Infinity, bad = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const j = (ty + dy) * cw + tx + dx;
          const e = elev[j];
          if (e < mn) mn = e;
          if (e > mx) mx = e;
          if (!buildable(corners[j])) bad++;
        }
      }
      const flat = 1 - clamp((mx - mn) / 0.10, 0, 1);
      if (flat < 0.30 || bad > 8) continue;
      const nearW = 1 - clamp(distWater[i] / 14, 0, 1);
      cands.push({ i, tx, ty, sc: flat * 1.5 + nearW * 0.9 + clamp(moist[i], 0, 1) * 0.4 + rnd() * 0.35 });
    }
  }
  if (!cands.length) return { props: out, blocked, clear, stats };
  cands.sort((a, b) => b.sc - a.sc);

  const minGap = Math.max(11, Math.round(Math.min(W, H) / 7)) + Math.round((clamp(params.villageSize || 1, 0.4, 1.8) - 1) * 9);
  const want = clamp(Math.round(params.villages * (W * H) / 850), 0, 14);
  const sites = [];
  for (const c of cands) {
    if (sites.length >= want) break;
    let ok = true;
    for (const s of sites) if (Math.hypot(s.tx - c.tx, s.ty - c.ty) < minGap) { ok = false; break; }
    if (ok) sites.push(c);
  }

  let bigBuildings = Math.max(1, Math.round(sites.length * 0.9));
  let windmills = Math.max(1, Math.round(sites.length * 0.6));

  const nearBuildable = (tx, ty, r) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = tx + dx, y = ty + dy;
      if (x < 0 || y < 0 || x >= cw || y >= ch) return false;
      if (!buildable(corners[y * cw + x])) return false;
    }
    return true;
  };

  const waterBox = (cx2, cy2, hw, hh) => {
    for (let y = cy2 - hh; y <= cy2 + hh; y++) {
      for (let x = cx2 - hw; x <= cx2 + hw; x++) {
        if (x < 0 || y < 0 || x >= cw || y >= ch) return false;
        if (!isWaterTerrain(corners[y * cw + x])) return false;
      }
    }
    return true;
  };
  const reveal = (x0, y0, x1, y1) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
      clear[y * cw + x] = 1;
    }
  };
  const placeDock = (wx, wy) => {
    if (V.dock < 0) return false;
    if (wx < 4 || wy < 8 || wx >= W - 4 || wy >= H - 3) return false;
    if (!waterBox(wx, wy + 1, 2, 3)) return false;
    for (let x = wx - 3; x <= wx + 3; x++) {
      if (!buildable(corners[(wy - 5) * cw + x])) return false;
    }
    if (!addProp(out, blocked, cw, ch, V.dock, wx, wy, rnd, false)) return false;
    reveal(wx - 5, wy - 7, wx + 5, wy + 2);
    return true;
  };
  const placeBoat = (wx, wy, sprite, hw, up, down) => {
    if (sprite < 0) return false;
    if (!waterBox(wx, wy, hw, 0)) return false;
    for (let d = 1; d <= up; d++) if (!waterBox(wx, wy - d, hw, 0)) return false;
    for (let d = 1; d <= down; d++) if (!waterBox(wx, wy + d, hw, 0)) return false;
    if (!addProp(out, blocked, cw, ch, sprite, wx, wy, rnd, false)) return false;
    reveal(wx - hw, wy - up, wx + hw, wy + down);
    return true;
  };

  for (const site of sites) {
    const { tx, ty } = site;
    const R = (3.4 + rnd() * 2.2) * Rscale;
    const lim = Math.ceil(R + 2.4);
    for (let dy = -lim; dy <= lim; dy++) {
      for (let dx = -lim; dx <= lim; dx++) {
        const nx = tx + dx, ny = ty + dy;
        if (nx < 1 || ny < 1 || nx >= cw - 1 || ny >= ch - 1) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 <= (R + 2.4) * (R + 2.4)) clear[ny * cw + nx] = 1;
        if (d2 > (R + 1.7) * (R + 1.7)) continue;
        const j = ny * cw + nx;
        if (!buildable(corners[j])) continue;
        if (d2 < R * R) corners[j] = rnd() < 0.62 ? TI.Gravel_1 : TI.Dirt_Tan;
        else if (rnd() < 0.55) corners[j] = TI.Dirt_Tan;
      }
    }
    const plazaR = Math.ceil(R);
    for (let dy = -plazaR; dy <= plazaR; dy++) {
      for (let dx = -plazaR; dx <= plazaR; dx++) {
        if (dx * dx + dy * dy > (R - 0.55) * (R - 0.55)) continue;
        addDecal(out, blocked, cw, ch, pick(V.plaza, rnd), tx + dx, ty + dy);
      }
    }
    const mkt = params.market === undefined ? 1 : clamp(params.market, 0, 2);
    const used = new Set();
    const ring = [];
    const slots = 10 + Math.floor(rnd() * 6) + Math.round(mkt * 3);
    for (let k = 0; k < slots; k++) {
      const ang = (k / slots) * Math.PI * 2 + rnd() * 0.5;
      const rr = R + 0.6 + rnd() * 2.9;
      const x = Math.round(tx + Math.cos(ang) * rr), y = Math.round(ty + Math.sin(ang) * rr);
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      if (!buildable(corners[y * cw + x])) continue;
      ring.push({ x, y, rr });
    }
    if (bigBuildings > 0 && rnd() < 0.7) {
      const kinds = [
        { s: V.torii, w: 7, h: 5, p: 0.5 },
        { s: V.camp, w: 8, h: 8, p: 0.3 },
        { s: V.mine, w: 9, h: 5, p: 0.2 },
      ];
      let roll = rnd(), lm = kinds[0];
      for (const k of kinds) { roll -= k.p; if (roll <= 0) { lm = k; break; } }
      for (let k = 0; k < ring.length; k++) {
        const r = ring[k];
        const bx = r.x - Math.floor(lm.w / 2), by = r.y - (lm.h - 1);
        if (!boxFree(used, bx, by, lm.w, lm.h)) continue;
        if (!boxBuildable(bx, by, lm.w, lm.h)) continue;
        addProp(out, blocked, cw, ch, lm.s, r.x, r.y, rnd);
        occupyBox(used, bx, by, lm.w, lm.h);
        for (let j = 0; j < lm.h; j++) for (let i = 0; i < lm.w; i++) {
          const px = bx + i, py = by + j;
          if (px >= 0 && py >= 0 && px < cw && py < ch) blocked[py * cw + px] = 1;
        }
        bigBuildings--;
        ring.splice(k, 1);
        break;
      }
    }
    const wind = ring.length > 2 && windmills > 0 && rnd() < 0.55;
    const kit = [];
    if (wind) { kit.push({ s: V.windmill, span: 2 }); windmills--; }
    if (V.well >= 0) kit.push({ s: V.well, span: 1 });
    const stalls = Math.round(2 * mkt);
    for (let k = 0; k < stalls; k++) kit.push({ s: pick(V.stall, rnd), span: 1 });
    if (mkt > 0.5 && V.fishStall >= 0 && rnd() < 0.45) kit.push({ s: V.fishStall, span: 4 });
    if (mkt > 0.35 && V.counter >= 0 && rnd() < 0.55) kit.push({ s: V.counter, span: 4 });
    for (let k = 0; k < Math.round(4 * mkt); k++) if (rnd() < 0.5) kit.push({ s: pick(V.produce, rnd), span: 1 });
    if (rnd() < 0.5 * Math.min(1, mkt)) kit.push({ s: pick(V.greens, rnd), span: 1 });
    if (rnd() < 0.5) kit.push({ s: V.statue, span: 1 });
    if (rnd() < 0.4) kit.push({ s: V.shinto, span: 1 });
    const lanterns = 2 + Math.floor(rnd() * 3);
    for (let k = 0; k < lanterns; k++) kit.push({ s: pick(V.lamp, rnd), span: 1 });
    for (let k = 0; k < 2; k++) if (rnd() < 0.7) kit.push({ s: pick(V.barrel, rnd), span: 1 });
    if (rnd() < 0.45) kit.push({ s: pick(V.cart, rnd), span: 2 });
    for (let k = 0; k < 2; k++) if (rnd() < 0.6) kit.push({ s: pick(V.sack, rnd), span: 1 });
    if (rnd() < 0.55) kit.push({ s: pick(V.bench, rnd), span: 1 });
    if (rnd() < 0.6) kit.push({ s: pick(V.sign, rnd), span: 1 });
    let slot = 0;
    for (const item of kit) {
      if (item.s < 0) continue;
      const rw = item.span <= 1 ? 2 : item.span + 2;
      let placedIt = false;
      for (let attempt = 0; attempt < ring.length && !placedIt; attempt++) {
        const r = ring[(slot + attempt) % ring.length];
        if (item.span >= 2 && r.rr < R + 1.6) continue;
        if (!boxFree(used, r.x - 1, r.y - (rw - 1), rw, rw)) continue;
        addProp(out, blocked, cw, ch, item.s, r.x, r.y, rnd);
        occupyBox(used, r.x - 1, r.y - (rw - 1), rw, rw);
        placedIt = true;
        slot = (slot + attempt + 1) % ring.length;
      }
    }
    if (rnd() < 0.8) {
      const bx = tx + 2 + Math.floor(rnd() * 3), by = ty + 2 + Math.floor(rnd() * 3);
      if (nearBuildable(bx, by, 0)) addProp(out, blocked, cw, ch, pick(V.greens, rnd), bx, by, rnd, false);
    }
    const greenSpots = 5 + Math.floor(rnd() * 4);
    for (let k = 0; k < greenSpots; k++) {
      const ang = rnd() * Math.PI * 2, rr = R + 1.2 + rnd() * 2.8;
      const x = Math.round(tx + Math.cos(ang) * rr), y = Math.round(ty + Math.sin(ang) * rr);
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      if (!buildable(corners[y * cw + x])) continue;
      if (used.has(key(x, y))) continue;
      used.add(key(x, y));
      const bush = rnd() < 0.5;
      addProp(out, blocked, cw, ch, bush ? pick(V.greens, rnd) : pickFrom(PROP_GROUPS.plant, rnd), x, y, rnd, false);
    }
    if (rnd() < 0.55) {
      const pw = 5 + Math.floor(rnd() * 3), ph = 4 + Math.floor(rnd() * 2);
      const ang = rnd() * Math.PI * 2, rr = R + 2.6;
      const px0 = Math.round(tx + Math.cos(ang) * rr - pw / 2);
      const py0 = Math.round(ty + Math.sin(ang) * rr - ph / 2);
      const px1 = px0 + pw - 1, py1 = py0 + ph - 1;
      if (px0 >= 2 && py0 >= 2 && px1 < W - 2 && py1 < H - 2) {
        let okp = true;
        for (let y = py0 - 1; y <= py1 + 1 && okp; y++) {
          for (let x = px0 - 1; x <= px1 + 1; x++) {
            if (used.has(key(x, y)) || blocked[y * cw + x]) { okp = false; break; }
          }
        }
        for (let y = py0; y <= py1 && okp; y++) {
          for (let x = px0; x <= px1; x++) {
            const j = y * cw + x;
            if (!buildable(corners[j]) || !softGround(corners[j])) { okp = false; break; }
          }
        }
        if (okp) {
          const yard = [];
          for (let x = px0; x <= px1; x++) { yard.push(x, py0); yard.push(x, py1); }
          for (let y = py0 + 1; y <= py1 - 1; y++) { yard.push(px0, y); yard.push(px1, y); }
          const gx2 = px0 + (pw >> 1);
          const gy2 = Math.sin(ang) < 0 ? py0 : py1;
          buildFence(out, blocked, cw, ch, yard, rnd() < 0.5 ? "picket" : "rail", rnd, new Set([gx2 * 1024 + gy2]));
          for (let y = py0 + 1; y <= py1 - 1; y++) {
            for (let x = px0 + 1; x <= px1 - 1; x++) {
              const roll = rnd();
              if (roll < 0.34) addDecal(out, blocked, cw, ch, "tall grass", x, y);
              else if (roll < 0.52) addDecal(out, blocked, cw, ch, "plowed soil", x, y);
              else if (roll < 0.62) addDecal(out, blocked, cw, ch, "young wheat", x, y);
              used.add(key(x, y));
            }
          }
          const paddockCrops = 1 + Math.floor(rnd() * 3);
          for (let k = 0; k < paddockCrops; k++) {
            const cx2 = px0 + 1 + Math.floor(rnd() * (pw - 2)), cy2 = py0 + 1 + Math.floor(rnd() * (ph - 2));
            addProp(out, blocked, cw, ch, pick(V.crops, rnd), cx2, cy2, rnd, false);
          }
          if (rnd() < 0.5) addProp(out, blocked, cw, ch, pick(V.cart, rnd), px0, py0, rnd, false);
          else if (rnd() < 0.6) addProp(out, blocked, cw, ch, pick(V.sack, rnd), px0, py0, rnd, false);
          for (let y = py0 - 2; y <= py1 + 2; y++) {
            for (let x = px0 - 2; x <= px1 + 2; x++) {
              if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
              clear[y * cw + x] = 1;
            }
          }
        }
      }
    }
    if (params.landmarks > 0.02 && params.graves > 0.02 && rnd() < 0.62 * Math.min(1.25, params.landmarks) * Math.min(1.6, params.graves)) {
      const gw = 4 + Math.floor(rnd() * 4), gh = 3 + Math.floor(rnd() * 3);
      let gbest = null;
      for (let attempt = 0; attempt < 12 && !gbest; attempt++) {
        const gAng = rnd() * Math.PI * 2;
        const gR = R + 2.4 + rnd() * 5;
        const gx0 = Math.round(tx + Math.cos(gAng) * gR - gw / 2);
        const gy0 = Math.round(ty + Math.sin(gAng) * gR - gh / 2);
        if (gx0 < 2 || gy0 < 2 || gx0 + gw >= W - 2 || gy0 + gh >= H - 2) continue;
        const cells = [];
        for (let y = gy0; y < gy0 + gh; y++) {
          for (let x = gx0; x < gx0 + gw; x++) {
            const j = y * cw + x;
            if (used.has(key(x, y)) || blocked[j] || !buildable(corners[j]) || !softGround(corners[j])) continue;
            cells.push(x, y);
          }
        }
        if (cells.length >= Math.max(4, Math.round(gw * gh * 0.5))) gbest = { gx0, gy0, cells };
      }
      if (gbest) {
        const cells = gbest.cells;
        const nGrave = Math.min(cells.length >> 1, 2 + Math.floor(rnd() * 4));
        let placed = 0;
        for (let k = 0; k < nGrave && cells.length >= 2; k++) {
          const idx = (Math.floor(rnd() * (cells.length >> 1))) * 2;
          const gx = cells[idx], gy = cells[idx + 1];
          cells.splice(idx, 2);
          if (addProp(out, blocked, cw, ch, pick(rnd() < 0.3 ? V.graveSmall : V.gravestone, rnd), gx, gy, rnd, false)) placed++;
        }
        if (placed && V.toro >= 0 && rnd() < 0.6 && cells.length >= 2) {
          const idx = (Math.floor(rnd() * (cells.length >> 1))) * 2;
          addProp(out, blocked, cw, ch, V.toro, cells[idx], cells[idx + 1], rnd, false);
        }
        if (placed && V.lamp && V.lamp.length && rnd() < 0.5 && cells.length >= 2) {
          const idx = (Math.floor(rnd() * (cells.length >> 1))) * 2;
          addProp(out, blocked, cw, ch, pick(V.lamp, rnd), cells[idx], cells[idx + 1], rnd, false);
        }
        for (let y = gbest.gy0; y < gbest.gy0 + gh; y++) {
          for (let x = gbest.gx0; x < gbest.gx0 + gw; x++) used.add(key(x, y));
        }
        reveal(gbest.gx0 - 2, gbest.gy0 - 2, gbest.gx0 + gw + 2, gbest.gy0 + gh + 2);
        if (placed) stats.graves++;
      }
    }
    stats.villages++;
  }

  const roadTerrain = rnd() < 0.5 ? TI.Dirt_Tan : TI.Gravel_1;
  for (let k = 0; k + 1 < sites.length; k++) {
    const a = sites[k].i, b = sites[k + 1].i;
    const cells = roadCells(cw, ch, corners, elev, a, b);
    if (!cells) continue;
    const cx = crossWater(corners, cw, ch, cells, out, blocked, rnd);
    stats.bridges += cx.bridges;
    stats.fords += cx.fords;
    paintRoad(corners, cells, roadTerrain, blocked, cw, ch);
    stats.roads++;
  }
  if (sites.length > 2 && rnd() < 0.7) {
    const cells = roadCells(cw, ch, corners, elev, sites[0].i, sites[sites.length - 1].i);
    if (cells) {
      const cx = crossWater(corners, cw, ch, cells, out, blocked, rnd);
      stats.bridges += cx.bridges;
      stats.fords += cx.fords;
      paintRoad(corners, cells, roadTerrain, blocked, cw, ch);
      stats.roads++;
    }
  }

  let dockCount = 0, shipCount = 0;
  if (params.landmarks > 0.02 && params.harbors > 0.02) {
    const wantHarbors = clamp(Math.round((sites.length + 2) * 0.8 * params.landmarks * params.harbors), 1, 16);
    const shoreline = () => {
      for (let attempt = 0; attempt < 40; attempt++) {
        const x = 6 + Math.floor(rnd() * (W - 12));
        const y = 9 + Math.floor(rnd() * (H - 16));
        const j = y * cw + x;
        if (isWaterTerrain(corners[j])) {
          let up = y;
          while (up > 1 && isWaterTerrain(corners[(up - 1) * cw + x])) up--;
          if (up < y) return [x, up + 1];
        } else {
          let dn = y;
          while (dn < H - 1 && !isWaterTerrain(corners[(dn + 1) * cw + x])) dn++;
          if (dn < H - 1) return [x, dn + 1];
        }
      }
      return null;
    };
    let made = 0, htries = 0;
    while (made < wantHarbors && htries++ < wantHarbors * 140 + 240) {
      let wx, wy;
      const useSite = sites.length && rnd() < 0.7;
      if (useSite) {
        const base = sites[Math.floor(rnd() * sites.length)];
        const ang = rnd() * Math.PI * 2, rr = 5 + rnd() * 26;
        wx = Math.round(base.tx + Math.cos(ang) * rr);
        wy = Math.round(base.ty + Math.sin(ang) * rr);
      } else {
        const sh = shoreline();
        if (!sh) break;
        wx = sh[0]; wy = sh[1];
      }
      if (!placeDock(wx, wy)) continue;
      made++; dockCount++;
      if (rnd() < 0.75 && shipCount < 8) {
        for (let k = 0; k < 8; k++) {
          const sx2 = wx + Math.round((rnd() - 0.5) * 22), sy2 = wy + 4 + Math.round(rnd() * 6);
          if (placeBoat(sx2, sy2, V.ship, 7, 2, 1)) { shipCount++; break; }
        }
      }
      for (let k = 0; k < 3; k++) {
        if (rnd() < 0.55) placeBoat(wx + 3 + Math.floor(rnd() * 12), wy + 5, V.boat, 5, 4, 1);
      }
    }
  }
  stats.docks = dockCount;
  stats.ships = shipCount;

  let ruinCount = 0;
  if (params.landmarks > 0.02 && params.ruins > 0.02 && V.ruins && V.ruins.length) {
    const wantRuins = clamp(Math.round((W * H) / 2400 * params.landmarks * params.ruins), 0, 30);
    let made = 0, rtries = 0;
    while (made < wantRuins && rtries++ < wantRuins * 100 + 150) {
      const base = cands[Math.floor(rnd() * Math.min(cands.length, 400))];
      if (!base) break;
      let near = false;
      for (const s2 of sites) {
        const dx = s2.tx - base.tx, dy = s2.ty - base.ty;
        if (dx * dx + dy * dy < 225) { near = true; break; }
      }
      if (near) continue;
      const rx = base.tx, ry = base.ty;
      if (rx < 5 || ry < 5 || rx >= W - 5 || ry >= H - 5) continue;
      const j = ry * cw + rx;
      if (blocked[j] || !buildable(corners[j]) || !softGround(corners[j])) continue;
      const pieces = 3 + Math.floor(rnd() * 5);
      let placed = 0;
      for (let k = 0; k < pieces; k++) {
        const px2 = rx + Math.round((rnd() - 0.5) * 7), py2 = ry + Math.round((rnd() - 0.5) * 6);
        if (px2 < 3 || py2 < 3 || px2 >= W - 3 || py2 >= H - 3) continue;
        const jj = py2 * cw + px2;
        if (blocked[jj] || !buildable(corners[jj]) || !softGround(corners[jj])) continue;
        const sprite = rnd() < 0.45 ? pick(V.ruins, rnd) : pick(V.rubble, rnd);
        if (addProp(out, blocked, cw, ch, sprite, px2, py2, rnd, false)) placed++;
      }
      if (!placed) continue;
      if (rnd() < 0.2 && V.statue >= 0) addProp(out, blocked, cw, ch, V.statue, rx, ry - 1, rnd, false);
      if (rnd() < 0.25 && V.lamp && V.lamp.length) addProp(out, blocked, cw, ch, pick(V.lamp, rnd), rx + 1, ry - 1, rnd, false);
      if (V.relic && V.relic.length && rnd() < 0.4) addProp(out, blocked, cw, ch, pick(V.relic, rnd), rx + 2, ry + 1, rnd, false);
      reveal(rx - 6, ry - 6, rx + 6, ry + 6);
      ruinCount++;
      made++;
    }
  }
  stats.ruins = ruinCount;

  let campCount = 0;
  if (params.landmarks > 0.02 && params.camps > 0.02) {
    const wantCamps = clamp(Math.round((W * H) / 2600 * params.landmarks * params.camps), 0, 24);
    let made = 0, ctries = 0;
    while (made < wantCamps && ctries++ < wantCamps * 130 + 160) {
      const base = cands[Math.floor(rnd() * Math.min(cands.length, 900))];
      if (!base) break;
      let near = false;
      for (const s2 of sites) {
        const dx = s2.tx - base.tx, dy = s2.ty - base.ty;
        if (dx * dx + dy * dy < 576) { near = true; break; }
      }
      if (near) continue;
      const kx = base.tx, ky = base.ty;
      if (kx < 6 || ky < 6 || kx >= W - 6 || ky >= H - 6) continue;
      const kj = ky * cw + kx;
      if (blocked[kj] || !buildable(corners[kj]) || !softGround(corners[kj])) continue;
      reveal(kx - 6, ky - 6, kx + 6, ky + 6);
      let placed = 0;
      for (const [name, ox2, oy2, chance] of CAMP_KIT) {
        if (rnd() > chance) continue;
        const sprite = PROP_GROUPS.byName[name];
        if (sprite === undefined) continue;
        const px2 = kx + ox2, py2 = ky + oy2;
        if (px2 < 2 || py2 < 2 || px2 >= W - 2 || py2 >= H - 2) continue;
        if (isWaterTerrain(corners[py2 * cw + px2])) continue;
        if (addProp(out, blocked, cw, ch, sprite, px2, py2, rnd, false)) placed++;
      }
      if (placed < 2) continue;
      campCount++;
      made++;
    }
  }
  stats.camps = campCount;

  const farmCount = clamp(Math.round(params.farms * (W * H) / 1500), 0, 40);
  let placedFarms = 0, tries = 0;
  while (placedFarms < farmCount && tries++ < farmCount * 80 + 100) {
    const base = sites.length && rnd() < 0.8 ? sites[Math.floor(rnd() * sites.length)] : cands[Math.floor(rnd() * Math.min(cands.length, 300))];
    if (!base) break;
    const fw = 6 + Math.floor(rnd() * 7), fh = 5 + Math.floor(rnd() * 5);
    const ang = rnd() * Math.PI * 2, rr = 4 + rnd() * 12;
    const fx0 = Math.round(base.tx + Math.cos(ang) * rr - fw / 2);
    const fy0 = Math.round(base.ty + Math.sin(ang) * rr - fh / 2);
    const fx1 = fx0 + fw - 1, fy1 = fy0 + fh - 1;
    const M = 1;
    if (fx0 - M < 2 || fy0 - M < 2 || fx1 + M >= W - 1 || fy1 + M >= H - 1) continue;
    let ok = true;
    for (let y = fy0 - M; y <= fy1 + M && ok; y++) {
      for (let x = fx0 - M; x <= fx1 + M; x++) {
        const j = y * cw + x;
        if (!buildable(corners[j]) || !softGround(corners[j]) || blocked[j]) { ok = false; break; }
      }
    }
    if (!ok) continue;
    const wet = moist[(fy0 + (fh >> 1)) * cw + (fx0 + (fw >> 1))] > 0.7;
    const kit = wet ? FIELD_KITS[0].wet : FIELD_KITS[0].dry;
    const strips = [];
    let sx = fx0 + 1;
    while (sx <= fx1 - 1) {
      const sw = Math.min(1 + Math.floor(rnd() * 2), fx1 - sx);
      strips.push({ x0: sx, x1: sx + sw - 1, field: kit[Math.floor(rnd() * kit.length)] });
      sx += sw + 1;
    }
    for (const st of strips) {
      for (let x = st.x0; x <= st.x1; x++) {
        for (let y = fy0 + 1; y <= fy1 - 1; y++) {
          addDecal(out, blocked, cw, ch, fieldVariant(st.field, rnd), x, y);
        }
      }
    }
    const open = rnd() < 0.18;
    if (!open) {
      const ring = [];
      for (let x = fx0; x <= fx1; x++) { ring.push(x, fy0); ring.push(x, fy1); }
      for (let y = fy0 + 1; y <= fy1 - 1; y++) { ring.push(fx0, y); ring.push(fx1, y); }
      const gx = fx0 + (fw >> 1);
      const gates = new Set([gx * 1024 + fy1]);
      buildFence(out, blocked, cw, ch, ring, rnd() < 0.3 ? "picket" : "rail", rnd, gates);
    }
    const cropN = Math.max(0, Math.round((2 + rnd() * 5) * params.crops));
    for (let k = 0; k < cropN; k++) {
      const st = strips[Math.floor(rnd() * strips.length)];
      const x = st.x0 + Math.floor(rnd() * (st.x1 - st.x0 + 1));
      const y = fy0 + 1 + Math.floor(rnd() * (fh - 2));
      addProp(out, blocked, cw, ch, pick(V.crops, rnd), x, y, rnd, false);
    }
    if (rnd() < 0.7) addProp(out, blocked, cw, ch, pick(V.cart, rnd), fx1 + 2, fy1, rnd, false);
    if (rnd() < 0.45) addProp(out, blocked, cw, ch, pick(V.sack, rnd), fx0 - 2, fy1, rnd, false);
    if (rnd() < 0.35) addProp(out, blocked, cw, ch, pick(V.wheel, rnd), fx0 + 1, fy1 + 1, rnd, false);
    if (rnd() < 0.5) addProp(out, blocked, cw, ch, pick(V.greens, rnd), fx0, fy0, rnd, false);
    for (let y = fy0 - 4; y <= fy1 + 4; y++) {
      for (let x = fx0 - 4; x <= fx1 + 4; x++) {
        if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
        clear[y * cw + x] = 1;
      }
    }
    placedFarms++;
  }
  stats.farms = placedFarms;

  for (let i = 0; i < cw * ch; i++) {
    if (!water[i] || depth[i] > 0.9) continue;
    if (rnd() > 0.05 * clamp(0.4 + params.reeds, 0, 2)) continue;
    const x = i % cw, y = (i - x) / cw;
    addDecal(out, blocked, cw, ch, pick(V.lily, rnd), x, y);
  }
  return { props: out, blocked, clear, stats };
}

function scatterProps(cw, ch, corners, moist, temp, rock, water, elev, depth, distWater, params, rnd, blocked, clear) {
  const props = [];
  const CELL = 10;
  const occ = new Map();
  const worldW = (cw - 1) * 32, worldH = (ch - 1) * 32;
  const occKey = (gx, gy) => gx * 100000 + gy;
  const occupied = (x, y, r) => {
    const span = Math.ceil(r / CELL);
    const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
    for (let dy = -span; dy <= span; dy++) for (let dx = -span; dx <= span; dx++) {
      const s = occ.get(occKey(gx + dx, gy + dy));
      if (s === undefined) continue;
      if ((s[0] - x) * (s[0] - x) + (s[1] - y) * (s[1] - y) < r * r) return true;
    }
    return false;
  };
  const occupy = (x, y) => {
    const k = occKey(Math.floor(x / CELL), Math.floor(y / CELL));
    if (!occ.has(k)) occ.set(k, [x, y]);
  };
  const sampleAt = (wx, wy) => {
    const cx = clamp(Math.round(wx / 32), 0, cw - 1);
    const cy = clamp(Math.round(wy / 32), 0, ch - 1);
    const ci = cy * cw + cx;
    return { t: corners[ci], m: moist[ci], temp: temp[ci], r: rock[ci], water: water[ci], e: elev[ci] - params.seaLevel, dw: distWater[ci], cx, cy };
  };
  const seed = params.seed;
  const weightsFor = (s) => {
    const t = s.t;
    const w = { tree: 0, bush: 0, plant: 0, rock: 0, cherry: 0, fruit_tree: 0, dead_tree: 0, mushroom: 0, reed: 0, stump: 0, log: 0, cow: 0, deer: 0, flower: 0, ore: 0 };
    const clump = 0.55 + valueNoise2D(s.cx * 0.09, s.cy * 0.09, seed + 7777) * 0.95;
    if (isWaterTerrain(t) || t === TI.Lava) return w;
    const wet = s.dw <= 2.5;
    if (params.volcanic) {
      w.rock = t === TI.Earth_Cracked ? 0.16 * params.rocks : 0.30 * params.rocks * (0.4 + s.r * 0.8);
      w.ore = 0.20 * params.ore * (0.4 + s.r * 0.8);
      return w;
    }
    if (t === TI.Snow_1 || t === TI.Snow_2) {
      w.tree = 0.50 * params.forest * clump * (0.42 + s.m * 0.7);
      w.rock = 0.17 * params.rocks * (0.4 + s.r * 0.8);
      w.bush = 0.07 * params.plants;
      w.stump = 0.03 * params.forest;
      w.log = 0.02 * params.forest;
    } else if (t === TI.Rock_White) {
      w.rock = 0.20 * params.rocks * (0.4 + s.r * 0.9);
      w.tree = 0.14 * params.forest * clump * (0.35 + s.m * 0.5);
      w.bush = 0.04 * params.plants;
      w.ore = 0.24 * params.ore * (0.4 + s.r * 0.9);
    } else if (t === TI.Grass_Dark || t === TI.Soil || t === TI.Dirt_Roots) {
      w.tree = 0.72 * params.forest * clump * (0.45 + s.m * 0.8);
      w.bush = 0.11 * params.plants;
      w.plant = 0.10 * params.plants;
      w.stump = 0.035 * params.forest * clump;
      w.log = 0.02 * params.forest;
      w.flower = 0.11 * params.flowers;
      w.ore = 0.05 * params.ore;
    } else if (t === TI.Mud_Brown) {
      w.tree = 0.32 * params.forest * clump * (0.4 + s.m * 0.7);
      w.bush = 0.14 * params.plants;
      w.plant = 0.10 * params.plants;
      w.stump = 0.03 * params.forest;
      w.flower = 0.05 * params.flowers;
    } else if (t === TI.Grass || t === TI.Grass_Light) {
      w.tree = 0.13 * params.forest * clump;
      w.bush = 0.05 * params.plants;
      w.plant = 0.16 * params.plants;
      w.log = 0.012 * params.forest;
      w.flower = 0.18 * params.flowers;
    } else if (t === TI.Grass_Dead) {
      w.tree = 0.06 * params.forest * clump;
      w.bush = 0.06 * params.plants;
      w.plant = 0.07 * params.plants;
      w.rock = 0.05 * params.rocks;
      w.stump = 0.03 * params.forest;
      w.flower = 0.06 * params.flowers;
      w.ore = 0.05 * params.ore;
    } else if (t === TI.Sand) {
      w.tree = 0.02 * params.forest * (1 - s.m);
      w.plant = 0.03 * params.plants;
      w.rock = 0.05 * params.rocks;
    } else if (t === TI.Dirt_Tan) {
      w.plant = 0.02 * params.plants;
      w.rock = 0.03 * params.rocks;
      w.log = 0.02 * params.forest;
      w.ore = 0.08 * params.ore;
    } else {
      w.rock = 0.30 * params.rocks * (0.35 + s.r);
      w.tree = 0.05 * params.forest * (1 - s.r) * clump;
      w.plant = 0.02 * params.plants;
      w.stump = 0.02 * params.forest;
      w.ore = 0.28 * params.ore * (0.35 + s.r);
    }
    if (s.temp < 0.28) w.tree *= 0.55;
    if (wet) w.reed = 0.52 * params.reeds;
    if (s.m > 0.5 && (t === TI.Grass_Dark || t === TI.Soil || t === TI.Dirt_Roots || t === TI.Mud_Brown || t === TI.Grass)) {
      w.mushroom = 0.045 * params.plants * Math.min(1.5, clump);
    }
    if (clump > 1.05) {
      w.stump += 0.02 * params.forest;
      w.log += 0.02 * params.forest;
      w.mushroom += 0.02 * params.plants;
    }
    if (s.temp > 0.48 && s.m > 0.42 && t !== TI.Snow_1 && t !== TI.Snow_2 && params.theme !== "volcanic") {
      w.cherry = 0.055 * params.forest * clump;
      w.fruit_tree = 0.03 * params.forest * clump * (s.dw < 14 ? 1.4 : 0.5);
    }
    if (s.temp < 0.34 && params.theme !== "desert") w.dead_tree = 0.02 * params.forest;
    const life = params.wildlife;
    if (life > 0.001 && s.dw > 2.5) {
      if ((t === TI.Grass || t === TI.Grass_Light) && s.m > 0.34 && s.m < 0.88 && s.e < 0.42) {
        w.cow = 0.055 * life * (1 - clamp(s.r, 0, 1) * 0.7);
      }
      if ((t === TI.Grass_Dark || t === TI.Soil || t === TI.Dirt_Roots || t === TI.Grass) && clump > 0.95) {
        w.deer = 0.045 * life;
      }
    }
    return w;
  };
  const palettesForTree = (s) => {
    const t0 = s.temp, aut = params.autumn;
    const out = [];
    const add = (k, w) => { for (let i = 0; i < w; i++) out.push(k); };
    if (params.theme === "desert" || t0 < 0.34) { add("dead", 3); add("pale", 2); return out; }
    add("green", 6);
    if (t0 > 0.52) add("orange", Math.round(aut * 7));
    add("brown", Math.round(1 + aut * 5));
    if (t0 < 0.52) add("pale", 1);
    if (t0 > 0.62) add("green", 3);
    return out;
  };
  const g = PROP_GROUPS;
  const rockPick = (s, snowy, rnd) => {
    const byPal = g.rockByPal;
    const pools = [];
    const add = (pal, w) => {
      const a = byPal[pal];
      if (a && a.length) for (let i = 0; i < w; i++) pools.push(...a);
    };
    if (params.volcanic || (params.lava > 0.6 && s.temp > 0.72 && s.m < 0.34)) {
      add("lava", 8);
      add("brown", 2);
      add("gray", 2);
    } else if (snowy || s.temp < 0.24) {
      add("gray", 6);
      add("dark", 3);
    } else {
      add("gray", 6);
      if (s.dw < 3.2) add("water", 3);
      if (s.m > 0.56) add("moss", 3);
      if (s.m < 0.34 || s.temp > 0.72) add("brown", 3);
      add("dark", 1);
    }
    if (!pools.length) return pickFrom(g.rock, rnd);
    return pools[Math.min(pools.length - 1, Math.floor(rnd() * pools.length))];
  };
  const passes = [
    { step: 64, kinds: ["cow", "deer"], radius: () => 26 },
    { step: 38, kinds: ["tree", "cherry", "fruit_tree", "dead_tree"], radius: (row) => Math.max(11, row[2] * 0.40) },
    { step: 46, kinds: ["rock", "stump", "log", "ore"], radius: (row) => Math.max(8, row[2] * 0.45) },
    { step: 13, kinds: ["bush", "plant", "mushroom", "reed", "flower"], radius: (row) => Math.max(3.5, row[2] * 0.42) },
  ];
  for (const pass of passes) {
    for (let wy = 6; wy < worldH; wy += pass.step) {
      for (let wx = 6; wx < worldW; wx += pass.step) {
        const jx = wx + (rnd() - 0.5) * pass.step * 0.92;
        const jy = wy + (rnd() - 0.5) * pass.step * 0.92;
        const s = sampleAt(jx, jy);
        if (s.water) continue;
        if (blocked && blocked[s.cy * cw + s.cx]) continue;
        if (clear && clear[s.cy * cw + s.cx]) continue;
        const w = weightsFor(s);
        let total = 0;
        for (const k of pass.kinds) total += w[k];
        if (total <= 0) continue;
        if (rnd() > total * params.propDensity) continue;
        let roll = rnd() * total, kind = pass.kinds[0];
        for (const k of pass.kinds) { roll -= w[k]; if (roll < 0) { kind = k; break; } }
        if (w[kind] <= 0) continue;
        let sprite = -1;
        const snowy = s.t === TI.Snow_1 || s.t === TI.Snow_2 || s.t === TI.Rock_White;
        const cold = s.temp < 0.30;
        const coniferChance = snowy ? 0.92 : cold ? clamp((0.40 - s.temp) * 2.6, 0, 0.95) : (params.theme === "boreal" || params.theme === "highland" ? 0.2 : 0);
        if (kind === "tree") {
          if (rnd() < coniferChance) sprite = pickFrom(snowy || s.temp < 0.20 ? g.conifer_snow : g.conifer, rnd);
          if (sprite < 0) {
            const pals = snowy ? ["pale", "dead", "brown"] : palettesForTree(s);
            const pal = pals[Math.floor(rnd() * pals.length)];
            sprite = pickFrom(g.tree[pal] || g.tree[g.treePalettes[0]], rnd);
          }
        } else if (kind === "cherry") sprite = pickFrom(g.cherry, rnd);
        else if (kind === "fruit_tree") sprite = pickFrom(g.fruit_tree, rnd);
        else if (kind === "dead_tree") sprite = pickFrom(g.dead_tree, rnd);
        else if (kind === "stump") sprite = pickFrom(g.stump, rnd);
        else if (kind === "log") sprite = pickFrom(g.log, rnd);
        else if (kind === "mushroom") sprite = pickFrom(g.mushroom, rnd);
        else if (kind === "cow") sprite = g.byName["cow"] === undefined ? -1 : g.byName["cow"];
        else if (kind === "deer") sprite = g.byName["deer"] === undefined ? -1 : g.byName["deer"];
        else if (kind === "reed") sprite = pickFrom(g.reedGreen && g.reedGreen.length ? g.reedGreen : g.reed, rnd);
        else if (kind === "bush") {
          if (snowy) sprite = pickFrom(g.bush.dead || g.bush[g.bushPalettes[0]], rnd);
          else {
            const pals = palettesForTree(s);
            const pal = pals[Math.floor(rnd() * pals.length)];
            sprite = pickFrom(g.bush[pal] || g.bush[g.bushPalettes[0]] || g.bush[g.treePalettes[0]], rnd);
          }
        } else if (kind === "rock") sprite = rockPick(s, snowy, rnd);
        else if (kind === "ore") sprite = pickFrom(g.ore, rnd);
        else if (kind === "flower") sprite = pickFrom(g.flower, rnd);
        else sprite = pickFrom(g.plant, rnd);
        if (sprite < 0) continue;
        const row = PROPS[sprite];
        const sizeR = Math.max(row[2], row[3]);
        const minSep = kind === "tree" || kind === "cherry" ? Math.max(13, row[2] * 0.44)
          : kind === "fruit_tree" || kind === "dead_tree" ? Math.max(8, row[2] * 0.44)
          : kind === "plant" || kind === "mushroom" || kind === "flower" ? Math.max(3.5, sizeR * 0.42)
          : kind === "stump" || kind === "log" ? Math.max(6, sizeR * 0.5)
          : kind === "ore" ? Math.max(7, sizeR * 0.55)
          : kind === "reed" ? Math.max(5, sizeR * 0.45)
          : Math.max(7, row[2] * 0.48);
        if (occupied(jx, jy, minSep)) continue;
        occupy(jx, jy);
        props.push({ x: Math.round(jx), y: Math.round(jy), s: sprite, flip: rnd() < 0.5 ? 1 : 0, kind });
      }
    }
  }
  return props;
}

export function scatterWorldProps(world, params, salt = 0) {
  const p = normalizeParams(params || world.params);
  const f = world.fields;
  const cw = world.cw, ch = world.ch;
  const blocked = new Uint8Array(cw * ch);
  const kept = [];
  for (const pr of world.props) {
    const row = PROPS[pr.s];
    if (!row || !SETTLEMENT_KINDS.has(row[4])) continue;
    kept.push(pr);
    const decal = row[4] === "decal";
    const tx = clamp(decal ? Math.round((pr.x - row[2] / 2) / TILE) : Math.round(pr.x / TILE), 0, cw - 1);
    const ty = clamp(decal ? Math.round((pr.y - row[3]) / TILE) : Math.round(pr.y / TILE), 0, ch - 1);
    blocked[ty * cw + tx] = 1;
    if (!decal) {
      if (tx > 0) blocked[ty * cw + tx - 1] = 1;
      if (tx < cw - 1) blocked[ty * cw + tx + 1] = 1;
      if (ty < ch - 1) blocked[(ty + 1) * cw + tx] = 1;
      if (ty > 0) blocked[(ty - 1) * cw + tx] = 1;
    }
  }
  const rnd = mulberry32((p.seed + 0x51ed + salt) >>> 0);
  const clear = new Uint8Array(cw * ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
          if (blocked[ny * cw + nx]) { near = true; break; }
        }
      }
      if (near) clear[y * cw + x] = 1;
    }
  }
  const natural = scatterProps(cw, ch, world.corners, f.moist, f.temp, f.rock, f.water, f.elev, f.depth, f.distWater, p, rnd, blocked, clear);
  return kept.concat(natural);
}

export function generateWorld(inputParams) {
  const params = normalizeParams(inputParams);
  const W = params.width, H = params.height;
  const cw = W + 1, ch = H + 1;
  const n = cw * ch;
  const seed = params.seed;
  const rnd = mulberry32(seed);
  const elev = new Float32Array(n);
  const cxr = 1 / Math.max(1, cw - 1), cyr = 1 / Math.max(1, ch - 1);
  const freq = 3.6 / Math.max(24, Math.min(W, H));
  const frag = params.fragment;
  const fragScale = freq * (3.4 + 2.6 * frag);
  const warpStrength = 0.14 + params.relief * 0.30;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = y * cw + x;
      const u = x * freq, v = y * freq;
      const wxx = u + (fbm2D(u + 3.1, v + 7.7, seed + 101, 3) * 2 - 1) * warpStrength;
      const wyy = v + (fbm2D(u + 11.3, v + 2.9, seed + 202, 3) * 2 - 1) * warpStrength;
      let e = fbm2D(wxx, wyy, seed + 11, 6, 2.05, 0.5);
      const r = ridge2D(wxx * 1.6, wyy * 1.6, seed + 313, 5, 2.1, 0.5);
      const land = clamp((e - 0.34) / 0.36, 0, 1);
      e = e * (1 - params.relief * 0.42) + r * land * params.relief * 0.7;
      if (frag > 0.001) {
        const uf = x * fragScale, vf = y * fragScale;
        const sky = fbm2D(uf * 0.72 + 4.4, vf * 0.72 + 9.1, seed + 404, 4, 2.1, 0.55);
        const bump = clamp((sky - 0.44) / 0.30, 0, 1);
        const arch = smoothstep(0.30, 0.72, bump);
        e = e * (1 - frag * 0.55) + arch * frag * 1.15;
      }
      const nx = (x * cxr) * 2 - 1, ny = (y * cyr) * 2 - 1;
      const d = Math.sqrt(nx * nx * 0.94 + ny * ny * 1.04);
      const coastNoise = (fbm2D(u * 0.8 + 31, v * 0.8 + 17, seed + 505, 4) * 2 - 1) * 0.30;
      const fall = smoothstep(0.35, 1.05 + coastNoise, d * (1 + 0.20 * (fbm2D(u * 1.5, v * 1.5, seed + 606, 3) * 2 - 1)));
      e -= params.island * fall * 1.35;
      const dEdge = Math.max(Math.abs(nx), Math.abs(ny));
      e -= params.island * 0.5 * smoothstep(0.84, 0.99, dEdge);
      elev[i] = e;
    }
  }
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) { if (elev[i] < lo) lo = elev[i]; if (elev[i] > hi) hi = elev[i]; }
  const span = Math.max(1e-6, hi - lo);
  for (let i = 0; i < n; i++) elev[i] = (elev[i] - lo) / span;

  const { filled, order } = priorityFlood(cw, ch, elev);
  const lakeMin = params.lakes < 0.02 ? Infinity : Math.round(lerp(4, 26, 1 - params.lakes));
  const lakeMask = pruneLakes(cw, ch, filled, elev, lakeMin);
  const oceanMask = new Uint8Array(n);
  {
    const stack = [];
    for (let x = 0; x < cw; x++) {
      for (const y of [0, ch - 1]) { const i = y * cw + x; if (elev[i] < params.seaLevel && !oceanMask[i]) { oceanMask[i] = 1; stack.push(i); } }
    }
    for (let y = 0; y < ch; y++) {
      for (const x of [0, cw - 1]) { const i = y * cw + x; if (elev[i] < params.seaLevel && !oceanMask[i]) { oceanMask[i] = 1; stack.push(i); } }
    }
    while (stack.length) {
      const i = stack.pop(); const x = i % cw, y = (i - x) / cw;
      if (x > 0 && !oceanMask[i - 1] && elev[i - 1] < params.seaLevel) { oceanMask[i - 1] = 1; stack.push(i - 1); }
      if (x < cw - 1 && !oceanMask[i + 1] && elev[i + 1] < params.seaLevel) { oceanMask[i + 1] = 1; stack.push(i + 1); }
      if (y > 0 && !oceanMask[i - cw] && elev[i - cw] < params.seaLevel) { oceanMask[i - cw] = 1; stack.push(i - cw); }
      if (y < ch - 1 && !oceanMask[i + cw] && elev[i + cw] < params.seaLevel) { oceanMask[i + cw] = 1; stack.push(i + cw); }
    }
  }
  const water = new Uint8Array(n);
  const depth = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (oceanMask[i]) { water[i] = 1; depth[i] = 0.3; }
    else if (lakeMask[i]) { water[i] = 1; depth[i] = clamp(0.30 + (filled[i] - elev[i]) * 22, 0.24, 1.6); }
  }
  const flow = flowAccumulate(cw, ch, filled, order);
  const landFlow = [];
  for (let i = 0; i < n; i++) if (!oceanMask[i] && !lakeMask[i]) landFlow.push(flow[i]);
  landFlow.sort((a, b) => b - a);
  const riverFrac = lerp(0.010, 0.050, params.rivers) * (params.rivers < 0.02 ? 0 : 1);
  const riverThresh = params.rivers < 0.02 ? Infinity : Math.max(6, landFlow[Math.min(landFlow.length - 1, Math.floor(landFlow.length * riverFrac))]);
  const riverMax = landFlow[0] || 1;
  let riverCells = 0;
  const WIDEN = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  for (let i = 0; i < n; i++) {
    if (oceanMask[i] || lakeMask[i]) continue;
    const f = flow[i];
    if (f < riverThresh) continue;
    const strength = clamp(Math.sqrt((f - riverThresh) / Math.max(1, riverMax - riverThresh)), 0, 1);
    const x = i % cw, y = (i - x) / cw;
    const wid = 1 + Math.round(Math.pow(strength, 1.35) * (WIDEN.length - 1));
    for (let k = 0; k < wid; k++) {
      const nx = x + WIDEN[k][0], ny = y + WIDEN[k][1];
      if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
      const j = ny * cw + nx;
      if (oceanMask[j] || lakeMask[j]) continue;
      const dd = k === 0 ? 0.22 + strength * 1.15 : (0.22 + strength * 1.15) * (0.9 - k * 0.05);
      if (!water[j]) riverCells++;
      water[j] = 1;
      depth[j] = Math.max(depth[j], Math.min(1.05, dd));
    }
  }
  despeckleWater(cw, ch, water);
  const distWater = distanceTransform(cw, ch, water);
  {
    const landMask = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (!water[i]) landMask[i] = 1;
    const distLand = distanceTransform(cw, ch, landMask);
    for (let i = 0; i < n; i++) {
      if (!oceanMask[i]) continue;
      const shelf = 0.12 + distLand[i] * 0.16 + Math.max(0, distLand[i] - 5) * 0.24;
      const basin = 0.28 + (params.seaLevel - elev[i]) * 7.5;
      depth[i] = clamp(Math.min(shelf, basin), 0.12, 3.2);
    }
  }
  const moist = new Float32Array(n);
  const temp = new Float32Array(n);
  const rock = new Float32Array(n);
  const latr = 1 / Math.max(1, ch - 1);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = y * cw + x;
      const u = x * freq, v = y * freq;
      const wet = smoothstep(7, 0, distWater[i]);
      const baseM = fbm2D(u * 1.0 + 21, v * 1.0 + 53, seed + 707, 3);
      moist[i] = clamp((baseM - 0.58) * 1.35 + params.moisture + wet * 0.16, 0, 1);
      const lat = (ch - 1 - y) * latr;
      const polar = smoothstep(0.62, 1.0, lat) * 0.22;
      const lapse = Math.max(0, elev[i] - params.seaLevel) * (0.30 + 0.42 * params.relief);
      const baseT = fbm2D(u * 0.85 + 71, v * 0.85 + 13, seed + 808, 3);
      temp[i] = clamp((baseT - 0.507) * 1.25 + params.temperature - polar - lapse + wet * 0.10, 0, 1);
      const baseR = fbm2D(u * 1.2 + 91, v * 1.2 + 37, seed + 909, 3);
      rock[i] = clamp((baseR - 0.497) * 1.5 + 0.5, 0, 1);
    }
  }
  const corners = buildTerrain(cw, ch, elev, filled, depth, moist, temp, rock, distWater, params);
  const pathsMade = carvePaths(cw, ch, corners, elev, params, rnd);
  const settle = planSettlements(cw, ch, corners, elev, moist, temp, rock, water, depth, distWater, params, rnd);
  const natural = scatterProps(cw, ch, corners, moist, temp, rock, water, elev, depth, distWater, params, rnd, settle.blocked, settle.clear);
  const props = settle.props.concat(natural);
  props.sort((a, b) => a.y - b.y || a.x - b.x);
  return {
    params, W, H, cw, ch, corners, props,
    labels: [],
    fields: { elev, water, depth, moist, temp, rock, flow, distWater },
    stats: {
      riverCells, pathsMade, props: props.length, land: n - water.reduce((s, v) => s + v, 0),
      villages: settle.stats.villages, farms: settle.stats.farms, roads: settle.stats.roads,
      bridges: settle.stats.bridges, fords: settle.stats.fords,
      graves: settle.stats.graves, docks: settle.stats.docks, ships: settle.stats.ships,
      ruins: settle.stats.ruins,
      camps: settle.stats.camps,
    },
  };
}

```

## 01-internal-code/src/render.js

_18028 bytes_

```javascript
import { TERRAINS, BASE, ORDER, RANK, MASKS, TILE, COLUMNS } from "./tileset.js";
import { PROPS, PROPS_IMAGE } from "./props.js";
import { TILESET_IMAGE } from "./tileset.js";
import { hash2i, clamp } from "./noise.js";

const CACHE_SIZES = [512, 1024, 2048, 4096];

export const DECAL_KIND = "decal";
export const NO_SHADOW = new Set(["plant", "decal", "crop", "reed", "fence", "good", "furniture", "mushroom"]);

export function isDecal(row) {
  return !!row && row[4] === DECAL_KIND;
}

export function planCell(corners, salt) {
  const uniq = [];
  for (let k = 0; k < 4; k++) {
    const t = corners[k];
    if (!uniq.includes(t)) uniq.push(t);
  }
  uniq.sort((a, b) => (RANK[a] ?? -1) - (RANK[b] ?? -1));
  const ids = [];
  const first = uniq[0];
  ids.push(fillId(first, salt));
  for (const t of uniq) {
    let m = 0;
    for (let k = 0; k < 4; k++) if (corners[k] === t) m |= 1 << k;
    const cell = MASKS[t] ? MASKS[t][m] : 0;
    if (!cell) continue;
    ids.push(Array.isArray(cell) ? cell[salt % cell.length] : cell);
  }
  return ids;
}

function fillId(t, salt) {
  const cell = MASKS[t] ? MASKS[t][15] : 0;
  if (Array.isArray(cell) && cell.length) return cell[salt % cell.length];
  if (typeof cell === "number" && cell) return cell;
  return BASE[t];
}

export function tileKey(ids) {
  let s = "";
  for (let i = 0; i < ids.length; i++) s += ids[i] + (i === ids.length - 1 ? "" : ",");
  return s;
}

export class Renderer {
  constructor() {
    this.terrainImg = null;
    this.propImg = null;
    this.ready = false;
    this.cacheLevel = 0;
    this.cacheCanvas = null;
    this.cacheCtx = null;
    this.cacheMap = new Map();
    this.cacheCursor = 0;
    this.composeCount = 0;
    this.shadowCache = new Map();
    this._alloc(0);
  }

  async load(assets = {}) {
    const [t, p] = await Promise.all([
      loadImage(assets.tilesetUrl || TILESET_IMAGE),
      loadImage(assets.propsUrl || PROPS_IMAGE),
    ]);
    this.terrainImg = t;
    this.propImg = p;
    this.ready = true;
    return this;
  }

  _alloc(level) {
    const size = CACHE_SIZES[level];
    this.cacheLevel = level;
    this.cacheCanvas = new OffscreenCanvas(size, size);
    this.cacheCtx = this.cacheCanvas.getContext("2d");
    this.cacheCtx.imageSmoothingEnabled = false;
    this.cols = size / TILE;
    this.cacheMap = new Map();
    this.cacheCursor = 0;
    if (this.slotMap) this.slotMap.fill(-1);
    this.worldImage = null;
    this.worldImageWorld = null;
  }

  invalidate() {
    this.cacheMap.clear();
    this.cacheCursor = 0;
    if (this.slotMap) this.slotMap.fill(-1);
    this.worldImage = null;
    this.worldImageWorld = null;
  }

  pptFor(world) {
    return clamp(Math.floor(4096 / Math.max(world.W, world.H)), 8, 32);
  }

  worldImageValid(world) {
    return !!(this.worldImage && this.worldImageWorld === world && world.W * this.worldImagePpt === this.worldImage.width);
  }

  ensureWorldImage(world) {
    const ppt = this.pptFor(world);
    if (this.worldImageValid(world) && this.worldImagePpt === ppt) return this.worldImage;
    const W = world.W, H = world.H;
    const w = Math.max(1, W * ppt), h = Math.max(1, H * ppt);
    const c = new OffscreenCanvas(w, h);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    this.ensureSlotMap(world);
    const cache = this.cacheCanvas;
    const cols = this.cols;
    if (ppt === TILE) {
      for (let ty = 0; ty < H; ty++) {
        for (let tx = 0; tx < W; tx++) {
          const slot = this.slotFor(world, tx, ty);
          g.drawImage(cache, (slot % cols) * TILE, Math.floor(slot / cols) * TILE, TILE, TILE, tx * ppt, ty * ppt, ppt, ppt);
        }
      }
    } else {
      if (!this.stripCanvas || this.stripCanvas.width !== W * TILE) {
        this.stripCanvas = new OffscreenCanvas(W * TILE, TILE);
        this.stripCtx = this.stripCanvas.getContext("2d");
      }
      const sg = this.stripCtx;
      sg.imageSmoothingEnabled = false;
      const sw = W * ppt;
      for (let ty = 0; ty < H; ty++) {
        for (let tx = 0; tx < W; tx++) {
          const slot = this.slotFor(world, tx, ty);
          sg.drawImage(cache, (slot % cols) * TILE, Math.floor(slot / cols) * TILE, TILE, TILE, tx * TILE, 0, TILE, TILE);
        }
        g.drawImage(this.stripCanvas, 0, 0, W * TILE, TILE, 0, ty * ppt, sw, ppt);
      }
    }
    this.worldImage = c;
    this.worldImageCtx = g;
    this.worldImagePpt = ppt;
    this.worldImageWorld = world;
    return c;
  }

  patchWorldImage(world, x0, y0, x1, y1) {
    if (!this.worldImageValid(world)) return;
    const ppt = this.worldImagePpt;
    const g = this.worldImageCtx;
    g.imageSmoothingEnabled = true;
    const W = world.W, H = world.H;
    const ax = Math.max(0, x0), bx = Math.min(W - 1, x1);
    const ay = Math.max(0, y0), by = Math.min(H - 1, y1);
    for (let y = ay; y <= by; y++) {
      for (let x = ax; x <= bx; x++) {
        const slot = this.slotFor(world, x, y);
        g.drawImage(this.cacheCanvas, (slot % this.cols) * TILE, Math.floor(slot / this.cols) * TILE, TILE, TILE, x * ppt, y * ppt, ppt, ppt);
      }
    }
  }

  ensureSlotMap(world) {
    if (this.slotMap && this.slotW === world.W && this.slotH === world.H) return;
    this.slotMap = new Int32Array(world.W * world.H).fill(-1);
    this.slotW = world.W;
    this.slotH = world.H;
  }

  cornersFor(world, tx, ty) {
    const c = world.corners, cw = world.cw;
    const r0 = ty * cw, r1 = (ty + 1) * cw;
    return [c[r0 + tx], c[r0 + tx + 1], c[r1 + tx], c[r1 + tx + 1]];
  }

  slotFor(world, tx, ty) {
    const i = ty * this.slotW + tx;
    const s = this.slotMap[i];
    if (s >= 0) return s;
    const v = this.cellSlot(this.cornersFor(world, tx, ty), tx, ty);
    this.slotMap[i] = v;
    return v;
  }

  invalidateCells(x0, y0, x1, y1) {
    if (!this.slotMap) return;
    const W = this.slotW, H = this.slotH;
    const ax = Math.max(0, x0), bx = Math.min(W - 1, x1);
    const ay = Math.max(0, y0), by = Math.min(H - 1, y1);
    for (let y = ay; y <= by; y++) {
      const row = y * W;
      for (let x = ax; x <= bx; x++) this.slotMap[row + x] = -1;
    }
    if (this.worldImageWorld) this.patchWorldImage(this.worldImageWorld, ax, ay, bx, by);
  }

  cellSlot(corners, tx, ty) {
    const salt = hash2i(tx, ty, 0x9e37) >>> 0;
    const ids = planCell(corners, salt);
    const key = tileKey(ids);
    let slot = this.cacheMap.get(key);
    if (slot !== undefined) return slot;
    if (this.cacheCursor >= this.cols * this.cols) {
      if (this.cacheLevel + 1 < CACHE_SIZES.length) this._alloc(this.cacheLevel + 1);
      else { this.invalidate(); }
    }
    slot = this.cacheCursor++;
    const sx = (slot % this.cols) * TILE;
    const sy = Math.floor(slot / this.cols) * TILE;
    const ctx = this.cacheCtx;
    for (const id of ids) {
      const ix = (id % COLUMNS) * TILE;
      const iy = Math.floor(id / COLUMNS) * TILE;
      ctx.drawImage(this.terrainImg, ix, iy, TILE, TILE, sx, sy, TILE, TILE);
    }
    this.composeCount++;
    this.cacheMap.set(key, slot);
    return slot;
  }

  drawCell(ctx, world, tx, ty, dx, dy, ts) {
    const slot = this.slotFor(world, tx, ty);
    const sx = (slot % this.cols) * TILE;
    const sy = Math.floor(slot / this.cols) * TILE;
    const size = ts || TILE;
    ctx.drawImage(this.cacheCanvas, sx, sy, TILE, TILE, dx, dy, size, size);
  }

  shadowSprite(w, h) {
    const key = Math.round(w) + "x" + Math.round(h);
    let c = this.shadowCache.get(key);
    if (c) return c;
    const rx = Math.max(3, w * 0.34), ry = Math.max(2, rx * 0.40);
    const pad = 2;
    c = new OffscreenCanvas(Math.ceil(rx * 2 + pad * 2), Math.ceil(ry * 2 + pad * 2));
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, Math.max(c.width, c.height) / 2);
    grad.addColorStop(0, "rgba(0,0,0,0.30)");
    grad.addColorStop(0.55, "rgba(0,0,0,0.18)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.save();
    g.translate(c.width / 2, c.height / 2);
    g.scale(1, ry / rx);
    g.beginPath();
    g.arc(0, 0, rx, 0, Math.PI * 2);
    g.fill();
    g.restore();
    this.shadowCache.set(key, c);
    return c;
  }

  drawPropShadow(ctx, prop) {
    const row = PROPS[prop.s];
    if (!row) return;
    if (NO_SHADOW.has(row[4])) return;
    const sc = prop.sc || 1;
    const w = row[2] * sc, h = row[3] * sc;
    const sh = this.shadowSprite(w, h);
    ctx.drawImage(sh, Math.round(prop.x - sh.width / 2), Math.round(prop.y - sh.height * 0.52));
  }

  drawProp(ctx, prop) {
    const row = PROPS[prop.s];
    if (!row) return;
    const sc = prop.sc || 1;
    const [sx, sy, rw, rh] = row;
    const w = rw * sc, h = rh * sc;
    const dx = Math.round(prop.x - w / 2);
    const dy = Math.round(prop.y - h);
    if (prop.flip) {
      ctx.save();
      ctx.translate(dx + w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.propImg, sx, sy, w, h, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(this.propImg, sx, sy, w, h, dx, dy, w, h);
    }
  }

  render(ctx, world, view, canvasW, canvasH, opts = {}) {
    const z = view.zoom;
    const dpr = opts.dpr || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = opts.background || "#101418";
    ctx.fillRect(0, 0, canvasW, canvasH);
    if (!this.ready) return;
    const tx0 = clamp(Math.floor(view.x / TILE), 0, world.W - 1);
    const ty0 = clamp(Math.floor(view.y / TILE), 0, world.H - 1);
    const tx1 = clamp(Math.ceil((view.x + canvasW / (z * dpr)) / TILE), 0, world.W - 1);
    const ty1 = clamp(Math.ceil((view.y + canvasH / (z * dpr)) / TILE), 0, world.H - 1);
    ctx.setTransform(z * dpr, 0, 0, z * dpr, -view.x * z * dpr, -view.y * z * dpr);
    const viewW = canvasW / (z * dpr), viewH = canvasH / (z * dpr);
    this.ensureSlotMap(world);
    const ppt = this.pptFor(world);
    if (z * TILE * dpr <= ppt) {
      const img = this.ensureWorldImage(world);
      const scale = TILE / ppt;
      const eff = z * TILE * dpr / ppt;
      ctx.imageSmoothingEnabled = eff < 0.9;
      ctx.imageSmoothingQuality = "low";
      ctx.drawImage(img, view.x / scale, view.y / scale, viewW / scale, viewH / scale, view.x, view.y, viewW, viewH);
      ctx.imageSmoothingEnabled = false;
    } else {
      for (let ty = ty0; ty <= ty1; ty++) {
        for (let tx = tx0; tx <= tx1; tx++) {
          this.drawCell(ctx, world, tx, ty, tx * TILE, ty * TILE);
        }
      }
    }
    if (opts.showFields) {
      this.drawFieldOverlay(ctx, world, opts.showFields, tx0, ty0, tx1, ty1);
    }
    if (opts.grid && z >= 0.75) {
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1 / (z * dpr);
      ctx.beginPath();
      for (let tx = tx0; tx <= tx1 + 1; tx++) { ctx.moveTo(tx * TILE, ty0 * TILE); ctx.lineTo(tx * TILE, (ty1 + 1) * TILE); }
      for (let ty = ty0; ty <= ty1 + 1; ty++) { ctx.moveTo(tx0 * TILE, ty * TILE); ctx.lineTo((tx1 + 1) * TILE, ty * TILE); }
      ctx.stroke();
    }
    const props = world.props;
    const yMax = (ty1 + 2) * TILE;
    const yMin = ty0 * TILE - 400;
    let start = 0, end = props.length;
    while (start < end && props[start].y < yMin) start++;
    while (end > start && props[end - 1].y > yMax) end--;
    const xSpan = canvasW / (z * dpr);
    const offX = (p) => p.x < view.x - 400 || p.x > view.x + xSpan + 400;
    if (!opts.hideProps) {
      for (let i = start; i < end; i++) {
        const p = props[i];
        if (offX(p) || !isDecal(PROPS[p.s])) continue;
        this.drawProp(ctx, p);
      }
    }
    if (!opts.hideShadows) {
      for (let i = start; i < end; i++) {
        const p = props[i];
        if (offX(p)) continue;
        this.drawPropShadow(ctx, p);
      }
    }
    if (!opts.hideProps) {
      for (let i = start; i < end; i++) {
        const p = props[i];
        if (isDecal(PROPS[p.s])) continue;
        this.drawProp(ctx, p);
      }
    }
    if (opts.selectedProp != null && props[opts.selectedProp]) {
      const p = props[opts.selectedProp];
      const row = PROPS[p.s];
      const sc = p.sc || 1;
      ctx.strokeStyle = "#ffd34d";
      ctx.lineWidth = 1.5 / (z * dpr);
      ctx.strokeRect(p.x - row[2] * sc / 2, p.y - row[3] * sc, row[2] * sc, row[3] * sc);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawFieldOverlay(ctx, world, fieldName, tx0, ty0, tx1, ty1) {
    const f = world.fields[fieldName];
    if (!f) return;
    ctx.save();
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        let sum = 0;
        for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) sum += f[(ty + oy) * world.cw + tx + ox];
        const v = sum / 4;
        ctx.fillStyle = rampColor(v, fieldName);
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      }
    }
    ctx.restore();
  }

  renderFull(world, scale, opts = {}) {
    const W = Math.round(world.W * TILE * scale);
    const H = Math.round(world.H * TILE * scale);
    const canvas = new OffscreenCanvas(W, H);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = scale < 1;
    this.invalidate();
    this.ensureSlotMap(world);
    for (let ty = 0; ty < world.H; ty++) {
      const r0 = ty * world.cw, r1 = (ty + 1) * world.cw;
      for (let tx = 0; tx < world.W; tx++) {
        this.drawCell(ctx, world, tx, ty, Math.round(tx * TILE * scale), Math.round(ty * TILE * scale), Math.round(TILE * scale));
      }
    }
    if (!opts.hideProps) for (const p of world.props) {
      const row = PROPS[p.s];
      if (!row || !isDecal(row)) continue;
      this.drawPropScaled(ctx, p, scale);
    }
    if (!opts.hideShadows) for (const p of world.props) {
      const row = PROPS[p.s];
      if (!row || NO_SHADOW.has(row[4])) continue;
      const sc = p.sc || 1;
      const sh = this.shadowSprite(row[2] * sc * scale, row[3] * sc * scale);
      ctx.drawImage(sh, Math.round(p.x * scale - sh.width / 2), Math.round((p.y - row[3] * sc * 0.42) * scale - sh.height / 2));
    }
    if (!opts.hideProps) for (const p of world.props) {
      const row = PROPS[p.s];
      if (!row || isDecal(row)) continue;
      this.drawPropScaled(ctx, p, scale);
    }
    if (opts.labels !== false && world.labels && world.labels.length) {
      this.drawLabels(ctx, world, scale, Math.max(10, Math.round(11 * Math.min(3, Math.max(0.6, scale)))));
    }
    return canvas;
  }

  drawLabels(ctx, world, scale, fs) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 " + fs + "px system-ui, sans-serif";
    for (const l of world.labels) {
      const x = (l.tx + 0.5) * TILE * scale, y = (l.ty + 0.5) * TILE * scale;
      const tw = ctx.measureText(l.name || "").width;
      const bw = tw + fs * 0.7, bh = fs + fs * 0.6;
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = "#141b24";
      ctx.strokeStyle = "#7fd0ff";
      ctx.lineWidth = Math.max(1, fs / 11);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, fs * 0.35);
      else ctx.rect(x - bw / 2, y - bh / 2, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#dbe4ee";
      ctx.fillText(l.name || "", x, y + 0.5);
    }
    ctx.restore();
  }

  drawPropScaled(ctx, p, scale) {
    const row = PROPS[p.s];
    if (!row) return;
    const sc = p.sc || 1;
    const [sx, sy, rw, rh] = row;
    const w = rw * sc, h = rh * sc;
    const dx = Math.round((p.x - w / 2) * scale), dy = Math.round((p.y - h) * scale);
    if (p.flip) {
      ctx.save();
      ctx.translate(dx + w * scale, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.propImg, sx, sy, rw, rh, 0, 0, w * scale, h * scale);
      ctx.restore();
    } else {
      ctx.drawImage(this.propImg, sx, sy, rw, rh, dx, dy, w * scale, h * scale);
    }
  }

  renderMinimap(world, size) {
    const mw = size, mh = Math.max(1, Math.round(size * world.H / world.W));
    const c = new OffscreenCanvas(mw, mh);
    const ctx = c.getContext("2d");
    if (!this.ready) return c;
    const img = this.ensureWorldImage(world);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "medium";
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, mw, mh);
    if (world.labels && world.labels.length) {
      const sx = mw / world.W, sy = mh / world.H;
      for (const l of world.labels) {
        const x = (l.tx + 0.5) * sx, y = (l.ty + 0.5) * sy;
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "#141b24";
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "#7fd0ff";
        ctx.stroke();
      }
    }
    return c;
  }
}

const RAMPS = {
  elev: [[8, 22, 48], [24, 76, 128], [60, 140, 90], [140, 170, 80], [150, 130, 100], [235, 235, 240]],
  water: [[8, 20, 40], [40, 120, 200], [190, 230, 255]],
  depth: [[10, 20, 40], [30, 90, 170], [130, 200, 250]],
  moist: [[180, 140, 70], [160, 190, 110], [40, 110, 190]],
  temp: [[60, 90, 200], [90, 180, 160], [220, 190, 90], [220, 90, 60]],
  rock: [[60, 60, 66], [150, 150, 150], [240, 240, 240]],
  flow: [[20, 30, 40], [70, 160, 220]],
  distWater: [[20, 60, 140], [200, 220, 240]],
};

export function rampColor(v, name) {
  const ramp = RAMPS[name] || RAMPS.elev;
  const t = clamp(v, 0, 1) * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(t));
  const f = t - i;
  const a = ramp[i], b = ramp[i + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("failed to load " + src));
    img.src = new URL(src, import.meta.url).href;
  });
}

export { TERRAINS };

```

## 01-internal-code/src/editor.js

_38980 bytes_

```javascript
import { TERRAINS, TERRAIN_INDEX, BASE, TILE, COLUMNS } from "./tileset.js";
import { PROPS } from "./props.js";
import { PREFABS, buildPrefab } from "./prefabs.js";
import { isDecal } from "./render.js";

const MIN_ZOOM = 0.03;
const MAX_ZOOM = 8;

export class Editor {
  constructor(renderer) {
    this.renderer = renderer;
    this.world = null;
    this.canvas = null;
    this.ctx = null;
    this.view = { x: 0, y: 0, zoom: 1 };
    this.opts = { grid: true, props: true, shadows: true, field: "", selectedProp: -1 };
    this.tool = "brush";
    this.terrain = TERRAIN_INDEX.Grass;
    this.propIndex = -1;
    this.prefabIndex = PREFABS.length ? 0 : -1;
    this.propScale = 1;
    this.brushSize = 4;
    this.shape = "square";
    this.clip = null;
    this._cloneSrc = null;
    this.selectedLabel = -1;
    this.labelTool = "label";
    this._undoStack = [];
    this._redoStack = [];
    this._undoBytes = 0;
    this.maxHistBytes = 96 * 1024 * 1024;
    this.dirty = false;
    this.pointer = { tx: 0, ty: 0, px: 0, py: 0, inside: false };
    this.selectedProp = -1;
    this.minimapCanvas = null;
    this.minimapDirty = true;
    this.minimapSize = 320;
    this.onStatus = () => {};
    this.onChange = () => {};
    this.onHistory = () => {};
    this.onDirty = () => {};
    this.onRequestLabel = () => {};
    this._dragging = null;
    this._panning = null;
    this._space = false;
    this._paintLast = null;
    this._pendingSnap = null;
    this._raf = 0;
  }

  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    const cv = canvas;
    const onDown = (e) => this._onDown(e);
    const onMove = (e) => this._onMove(e);
    const onUp = (e) => this._onUp(e);
    const onLeave = () => { this.pointer.inside = false; this.requestDraw(); };
    const onWheel = (e) => this._onWheel(e);
    const onCtx = (e) => e.preventDefault();
    const onKeyDown = (e) => this._onKey(e);
    const onKeyUp = (e) => { if (e.code === "Space") { this._space = false; this._syncCursor(); } };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("contextmenu", onCtx);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    this._teardown = () => {
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("wheel", onWheel);
      cv.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    this.resize();
  }

  detach() {
    if (this._teardown) { this._teardown(); this._teardown = null; }
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    this.canvas = null;
    this.ctx = null;
  }

  setWorld(world, keepView) {
    this.world = world;
    this.selectedProp = -1;
    this.opts.selectedProp = -1;
    this.selectedLabel = -1;
    this._labelDrag = null;
    this._undoStack = [];
    this._redoStack = [];
    this._undoBytes = 0;
    this._pendingSnap = null;
    this.minimapDirty = true;
    if (!keepView) this.fit();
    this.onHistory();
    this.markDirty(false);
    this.status();
    this.requestDraw();
  }

  resize() {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(64, Math.round(r.width * dpr));
    const h = Math.max(64, Math.round(r.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.dpr = dpr;
    }
    this.requestDraw();
  }

  get viewW() { return this.canvas.width / this.dpr; }
  get viewH() { return this.canvas.height / this.dpr; }

  fit() {
    const w = this.world;
    if (!w || !this.canvas) return;
    const pad = 24;
    const zx = (this.viewW - pad * 2) / (w.W * TILE);
    const zy = (this.viewH - pad * 2) / (w.H * TILE);
    this.view.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zx, zy)));
    this.centerOn(w.W * TILE / 2, w.H * TILE / 2);
  }

  centerOn(worldX, worldY) {
    this.view.x = worldX - this.viewW / (2 * this.view.zoom);
    this.view.y = worldY - this.viewH / (2 * this.view.zoom);
    this.clampView();
    this.requestDraw();
  }

  zoomAt(screenX, screenY, factor) {
    const wx = this.view.x + screenX / this.view.zoom;
    const wy = this.view.y + screenY / this.view.zoom;
    this.view.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.view.zoom * factor));
    this.view.x = wx - screenX / this.view.zoom;
    this.view.y = wy - screenY / this.view.zoom;
    this.clampView();
    this.requestDraw();
  }

  clampView() {
    const w = this.world;
    if (!w) return;
    const mw = w.W * TILE, mh = w.H * TILE;
    const vw = this.viewW / this.view.zoom, vh = this.viewH / this.view.zoom;
    const slackX = mw * 0.6, slackY = mh * 0.6;
    this.view.x = Math.max(-slackX, Math.min(mw - vw + slackX, this.view.x));
    this.view.y = Math.max(-slackY, Math.min(mh - vh + slackY, this.view.y));
  }

  screenToWorld(sx, sy) {
    return { x: this.view.x + sx / this.view.zoom, y: this.view.y + sy / this.view.zoom };
  }

  worldToScreen(wx, wy) {
    return { x: (wx - this.view.x) * this.view.zoom, y: (wy - this.view.y) * this.view.zoom };
  }

  localPointer(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  markDirty(v) {
    if (this.dirty === v) return;
    this.dirty = v;
    this.onDirty(v);
  }

  requestDraw() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this.draw(); });
  }

  draw() {
    const w = this.world;
    if (!w || !this.canvas) return;
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#080b0f";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderer.render(ctx, w, this.view, this.canvas.width, this.canvas.height, {
      dpr,
      background: "#0a1420",
      grid: this.opts.grid && this.view.zoom >= 0.5,
      hideProps: !this.opts.props,
      hideShadows: !this.opts.shadows,
      showFields: this.opts.field || false,
      selectedProp: this.opts.selectedProp >= 0 ? this.opts.selectedProp : null,
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._drawOverlay(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  _drawOverlay(ctx) {
    if (!this.world) return;
    this._drawToolOverlay(ctx);
    this._drawLabels(ctx);
  }

  _drawToolOverlay(ctx) {
    const p = this.pointer;
    if (!p.inside || !this.world) return;
    if (this.tool === "pan") return;
    if (this.tool === "clone") {
      this._drawCloneOverlay(ctx);
      return;
    }
    if (this.tool === "prop" && this.propIndex >= 0) {
      const row = PROPS[this.propIndex];
      if (!row) return;
      const decal = isDecal(row);
      const sc = (decal ? 1 : this.propScale) * this.view.zoom;
      const w = row[2] * sc, h = row[3] * sc;
      const a = decal ? this.decalAnchor(p.px, p.py, row) : { x: p.px, y: p.py };
      const s = this.worldToScreen(a.x, a.y);
      ctx.globalAlpha = 0.72;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], s.x - w / 2, s.y - h, w, h);
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffca45";
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(s.x - w / 2) + 0.5, Math.round(s.y - h) + 0.5, Math.round(w), Math.round(h));
      ctx.globalAlpha = 1;
      return;
    }
    if (this.tool === "stamp") {
      const pf = PREFABS[this.prefabIndex];
      if (!pf) return;
      const z = this.view.zoom;
      const ox = p.tx - ((pf.w - 1) >> 1), oy = p.ty - (pf.h - 1);
      ctx.globalAlpha = 0.68;
      ctx.imageSmoothingEnabled = false;
      for (const q of buildPrefab(this.prefabIndex, p.tx, p.ty, this.propScale)) {
        const row = PROPS[q.s];
        if (!row) continue;
        const s = this.worldToScreen(q.x, q.y);
        const w = row[2] * (q.sc || 1) * z, h = row[3] * (q.sc || 1) * z;
        ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], s.x - w / 2, s.y - h, w, h);
      }
      ctx.globalAlpha = 1;
      const a = this.worldToScreen(ox * TILE, oy * TILE);
      const b = this.worldToScreen((ox + pf.w) * TILE, (oy + pf.h) * TILE);
      ctx.strokeStyle = "#ffca45";
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
      return;
    }
    if (this.tool === "select") return;
    if (this.tool === "erase") {
      const s = this.worldToScreen(p.px, p.py);
      const r = Math.max(8, this.brushSize * TILE * 0.5) * this.view.zoom;
      ctx.strokeStyle = "rgba(255,106,106,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,106,106,0.10)";
      ctx.fill();
      return;
    }
    if (this._dragging && (this._dragging.tool === "rect" || this._dragging.tool === "line")) {
      this._drawDragPreview(ctx);
      return;
    }
    const cell = this._brushCells(p.tx, p.ty);
    if (!cell.length) return;
    const sc = this.view.zoom;
    ctx.strokeStyle = "rgba(255,202,69,0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const c of cell) {
      const s = this.worldToScreen(c[0] * TILE, c[1] * TILE);
      const x = Math.round(s.x) + 0.5, y = Math.round(s.y) + 0.5, z = Math.round(TILE * sc);
      ctx.rect(x, y, z, z);
    }
    ctx.stroke();
    if (this.view.zoom >= 0.6) {
      ctx.fillStyle = "rgba(255,202,69,0.10)";
      ctx.fill();
    }
  }

  _drawDragPreview(ctx) {
    const d = this._dragging;
    const zoom = this.view.zoom;
    ctx.strokeStyle = "rgba(255,202,69,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (d.tool === "line") {
      const z = Math.round(TILE * zoom);
      for (const c of this._lineCells(d.tx0, d.ty0, d.tx, d.ty)) {
        const s = this.worldToScreen(c[0] * TILE, c[1] * TILE);
        ctx.rect(Math.round(s.x) + 0.5, Math.round(s.y) + 0.5, z, z);
      }
    } else {
      const ax = Math.min(d.tx0, d.tx), bx = Math.max(d.tx0, d.tx);
      const ay = Math.min(d.ty0, d.ty), by = Math.max(d.ty0, d.ty);
      const a = this.worldToScreen(ax * TILE, ay * TILE);
      const b = this.worldToScreen((bx + 1) * TILE, (by + 1) * TILE);
      if (this.shape === "round" && d.tool !== "clone") {
        ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
      }
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(255,202,69,0.12)";
    ctx.fill();
  }

  _drawCloneOverlay(ctx) {
    const p = this.pointer;
    const z = this.view.zoom;
    if (this._dragging && this._dragging.tool === "clone") {
      this._drawDragPreview(ctx);
      return;
    }
    if (!this.clip) {
      ctx.fillStyle = "rgba(200,220,255,0.85)";
      ctx.font = "12px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Copy: drag a rectangle", 12, 18);
      return;
    }
    const c = this.clip;
    const ox = p.tx - (c.w >> 1), oy = p.ty - (c.h >> 1);
    const a = this.worldToScreen(ox * TILE, oy * TILE);
    const b = this.worldToScreen((ox + c.w) * TILE, (oy + c.h) * TILE);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.imageSmoothingEnabled = false;
    for (const q of this.clip.props) {
      const row = PROPS[q.s];
      if (!row) continue;
      const s = this.worldToScreen((ox + q.dx) * TILE + row[2] / 2, (oy + q.dy) * TILE + row[3]);
      const w = row[2] * (q.sc || 1) * z, h = row[3] * (q.sc || 1) * z;
      ctx.save();
      if (q.flip) {
        ctx.translate(s.x, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], -w / 2, s.y - h, w, h);
      } else {
        ctx.drawImage(this.renderer.propImg, row[0], row[1], row[2], row[3], s.x - w / 2, s.y - h, w, h);
      }
      ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = "#7fd0ff";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(127,208,255,0.10)";
    ctx.fillRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(b.x - a.x), Math.round(b.y - a.y));
  }

  _drawLabels(ctx) {
    const w = this.world;
    const labels = w && w.labels;
    if (!labels || !labels.length) return;
    const z = this.view.zoom;
    const fs = Math.max(9, Math.min(15, Math.round(11 * Math.min(1.6, Math.max(0.85, z)))));
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      const s = this.worldToScreen((l.tx + 0.5) * TILE, (l.ty + 0.5) * TILE);
      if (s.x < -200 || s.y < -120 || s.x > this.viewW + 200 || s.y > this.viewH + 120) continue;
      ctx.save();
      ctx.font = "600 " + fs + "px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(l.name || "").width;
      const padX = 6, bw = tw + padX * 2, bh = fs + 8;
      const bx = Math.round(s.x - bw / 2), by = Math.round(s.y - bh / 2);
      const active = i === this.selectedLabel;
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = active ? "#2b4a6d" : "#141b24";
      ctx.strokeStyle = active ? "#ffca45" : "#7fd0ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx + 0.5, by + 0.5, bw, bh, 4);
      else ctx.rect(bx + 0.5, by + 0.5, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = active ? "#ffe9a8" : "#dbe4ee";
      ctx.fillText(l.name || "", s.x, s.y + 0.5);
      ctx.restore();
    }
  }

  labelAt(tx, ty, tol) {
    const labels = (this.world && this.world.labels) || [];
    const t = tol == null ? 1 : tol;
    for (let i = labels.length - 1; i >= 0; i--) {
      const l = labels[i];
      const hw = t + Math.max(1, ((l.name || "").length >> 1));
      if (ty >= l.ty - t && ty <= l.ty + t && tx >= l.tx - hw && tx <= l.tx + hw) return i;
    }
    return -1;
  }

  _brushCells(cx, cy) {
    const n = this.brushSize;
    const x0 = cx - Math.floor((n - 1) / 2);
    const y0 = cy - Math.floor((n - 1) / 2);
    const out = [];
    if (n <= 1) { out.push([cx, cy]); return out; }
    if (this.shape === "square") {
      for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) out.push([x, y]);
    } else {
      const c = (n - 1) / 2, r = n / 2 - 0.5;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const dx = x - c, dy = y - c;
        if (dx * dx + dy * dy <= r * r) out.push([x0 + x, y0 + y]);
      }
    }
    return out;
  }

  _onDown(e) {
    if (!this.world) return;
    try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const lp = this.localPointer(e);
    const wp = this.screenToWorld(lp.x, lp.y);
    const tx = Math.floor(wp.x / TILE), ty = Math.floor(wp.y / TILE);
    if (e.button === 1 || this._space || this.tool === "pan" || e.button === 2 && this.tool === "pan") {
      this._panning = { sx: lp.x, sy: lp.y, vx: this.view.x, vy: this.view.y };
      this.canvas.classList.add("panning");
      e.preventDefault();
      return;
    }
    if (this.tool === "pick") {
      this.pickTerrain(tx, ty);
      return;
    }
    if (this.tool === "select") {
      this._selectDown(tx, ty, wp, e);
      return;
    }
    if (this.tool === "stamp") {
      this._beginOp("prefab");
      if (e.shiftKey || e.button === 2) this.erasePrefab(wp.x, wp.y);
      else this.placePrefab(wp.x, wp.y);
      this._commitOp();
      return;
    }
    if (this.tool === "prop") {
      this._beginOp("prop");
      if (e.shiftKey || e.button === 2) this.erasePropAt(wp.x, wp.y);
      else this.placeProp(wp.x, wp.y);
      this._commitOp();
      return;
    }
    if (this.tool === "clone") {
      if (tx < 0 || ty < 0 || tx >= this.world.W || ty >= this.world.H) return;
      this._dragging = { tool: "clone", tx0: tx, ty0: ty, tx, ty };
      this.requestDraw();
      return;
    }
    if (this.tool === "label") {
      const hit = this.labelAt(tx, ty, 1);
      if (hit >= 0) {
        this.selectedLabel = hit;
        this.snapshot("move label");
        this._labelDrag = hit;
        this.onChange("label");
      } else if (tx >= 0 && ty >= 0 && tx < this.world.W && ty < this.world.H) {
        this.onRequestLabel(tx, ty);
      }
      this.status();
      this.requestDraw();
      return;
    }
    if (this.tool === "erase") {
      this._beginOp("erase");
      this._erasing = true;
      this._eraseAt(wp.x, wp.y, e.shiftKey);
      this.canvas.classList.add("erasing");
      e.preventDefault();
      return;
    }
    if (tx < 0 || ty < 0 || tx >= this.world.W || ty >= this.world.H) return;
    this._beginOp(this.tool);
    if (this.tool === "fill") {
      this.floodFill(tx, ty);
      this._commitOp();
      this._paintLast = null;
      return;
    }
    this._dragging = { tool: this.tool, tx0: tx, ty0: ty, tx, ty };
    this._paintLast = null;
    if (this.tool === "brush") this._paintStroke(tx, ty);
    this.requestDraw();
  }

  _onMove(e) {
    if (!this.world) return;
    const lp = this.localPointer(e);
    const wp = this.screenToWorld(lp.x, lp.y);
    const tx = Math.floor(wp.x / TILE), ty = Math.floor(wp.y / TILE);
    this.pointer.px = wp.x; this.pointer.py = wp.y;
    this.pointer.tx = tx; this.pointer.ty = ty;
    this.pointer.inside = true;
    if (this._panning) {
      this.view.x = this._panning.vx - (lp.x - this._panning.sx) / this.view.zoom;
      this.view.y = this._panning.vy - (lp.y - this._panning.sy) / this.view.zoom;
      this.clampView();
      this.requestDraw();
      return;
    }
    if (this._dragging) {
      const d = this._dragging;
      if (d.tool === "brush") {
        this._paintStroke(tx, ty);
      } else {
        d.tx = tx; d.ty = ty;
      }
      this.status();
      this.requestDraw();
      return;
    }
    if (this._erasing) {
      this._eraseAt(wp.x, wp.y, e.shiftKey);
      this.status();
      this.requestDraw();
      return;
    }
    if (this._movingProp) {
      const p = this.world.props[this._movingProp];
      if (p) { p.x = Math.round(wp.x); p.y = Math.round(wp.y); this.markDirty(true); this.requestDraw(); }
      return;
    }
    if (this._labelDrag != null) {
      const l = this.world.labels && this.world.labels[this._labelDrag];
      if (l) { l.tx = tx; l.ty = ty; this.markDirty(true); this.requestDraw(); }
      return;
    }
    this.status();
    this.requestDraw();
  }

  _onUp(e) {
    if (this._panning) { this._panning = null; this.canvas.classList.remove("panning"); }
    if (this._erasing) {
      this._erasing = false;
      this.canvas.classList.remove("erasing");
      this._commitOp();
      this.afterEdit();
    }
    if (this._dragging) {
      const d = this._dragging;
      if (d.tool === "rect") this._applyRect(d.tx0, d.ty0, d.tx, d.ty);
      else if (d.tool === "line") this._applyLine(d.tx0, d.ty0, d.tx, d.ty);
      else if (d.tool === "clone") {
        const ax = Math.min(d.tx0, d.tx), bx = Math.max(d.tx0, d.tx);
        const ay = Math.min(d.ty0, d.ty), by = Math.max(d.ty0, d.ty);
        if (bx > ax || by > ay) this.copyRegion(ax, ay, bx, by);
        else if (this.clip) this.pasteAt(d.tx, d.ty);
      }
      this._dragging = null;
      this._paintLast = null;
      this._commitOp();
      this.afterEdit();
    }
    if (this._labelDrag != null) {
      this._labelDrag = null;
      this._commitOp();
      this.afterEdit();
    }
    if (this._movingProp != null) {
      this._movingProp = null;
      this.world.props.sort((a, b) => a.y - b.y || a.x - b.x);
      this.opts.selectedProp = -1;
      this.selectedProp = -1;
      this.afterEdit();
    }
    this.requestDraw();
  }

  _onWheel(e) {
    if (!this.world) return;
    e.preventDefault();
    const lp = this.localPointer(e);
    const f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016));
    this.zoomAt(lp.x, lp.y, f);
    this.status();
  }

  _onKey(e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.code === "Space") { this._space = true; this._syncCursor(); e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && k === "z") {
      e.preventDefault();
      if (e.shiftKey) this.redo(); else this.undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); this.redo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tools = { b: "brush", r: "rect", f: "fill", l: "line", i: "pick", t: "prop", v: "select", x: "erase", h: "pan", k: "stamp", c: "clone", m: "label" };
    if (tools[k]) { this.setTool(tools[k]); return; }
    if (k === "escape") {
      if (this.selectedProp >= 0 || this.selectedLabel >= 0) {
        this.selectedProp = -1;
        this.opts.selectedProp = -1;
        this.selectedLabel = -1;
        this.onChange("select");
        this.requestDraw();
      }
      return;
    }
    if (k === "g") { this.opts.grid = !this.opts.grid; this.onChange("opts"); this.requestDraw(); return; }
    if (k === "p") { this.opts.props = !this.opts.props; this.onChange("opts"); this.requestDraw(); return; }
    if (k === "0") { this.fit(); return; }
    if (k === "[" || k === "]") {
      this.setBrushSize(this.brushSize + (k === "]" ? 1 : -1));
      return;
    }
    if (k === "delete" || k === "backspace") {
      if (this.selectedProp >= 0) { this.snapshot("delete prop"); this.deleteProp(this.selectedProp); }
      return;
    }
    if (k === "e" && this.selectedProp >= 0) {
      const p = this.world.props[this.selectedProp];
      this.snapshot("flip prop");
      p.flip = p.flip ? 0 : 1;
      this.afterEdit();
    }
  }

  _syncCursor() {
    if (!this.canvas) return;
    this.canvas.classList.toggle("panning", !!this._space || this.tool === "pan");
    this.canvas.classList.toggle("picking", this.tool === "pick");
    this.canvas.classList.toggle("erasing", this.tool === "erase");
    this.canvas.classList.toggle("cloning", this.tool === "clone");
    this.canvas.classList.toggle("labelling", this.tool === "label");
  }

  setTool(t) {
    this.tool = t;
    this._dragging = null;
    this._syncCursor();
    this.onChange("tool");
    this.status();
    this.requestDraw();
  }

  setTerrain(i) {
    this.terrain = i;
    this.onChange("terrain");
  }

  setProp(i) {
    this.propIndex = i;
    if (i >= 0 && this.tool !== "prop") this.setTool("prop");
    this.onChange("prop");
  }

  setPrefab(i) {
    this.prefabIndex = Math.max(0, Math.min(PREFABS.length - 1, i | 0));
    if (this.tool !== "stamp") this.setTool("stamp");
    this.onChange("prefab");
    this.status();
    this.requestDraw();
  }

  setBrushSize(n) {
    this.brushSize = Math.max(1, Math.min(30, Math.round(n)));
    this.onChange("brush");
  }

  setPropScale(p) {
    this.propScale = Math.max(0.5, Math.min(2, p));
    this.onChange("brush");
  }

  setShape(s) { this.shape = s; this.onChange("brush"); this.requestDraw(); }

  cornerAt(tx, ty) {
    const w = this.world;
    if (!w) return 0;
    return w.corners[ty * w.cw + tx] || 0;
  }

  pickTerrain(tx, ty) {
    const w = this.world;
    if (tx < 0 || ty < 0 || tx >= w.W || ty >= w.H) return;
    const counts = new Map();
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const t = w.corners[(ty + oy) * w.cw + tx + ox];
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    let best = this.cornerAt(tx, ty), bestN = -1;
    for (const [t, n] of counts) if (n > bestN) { bestN = n; best = t; }
    this.setTerrain(best);
    this.setTool("brush");
  }

  setCorner(x, y, t) {
    const w = this.world;
    if (x < 0 || y < 0 || x >= w.cw || y >= w.ch) return;
    const i = y * w.cw + x;
    if (w.corners[i] !== t) { w.corners[i] = t; return true; }
    return false;
  }

  stamp(tx, ty) {
    const w = this.world;
    if (tx < 0 || ty < 0 || tx >= w.W || ty >= w.H) return false;
    let changed = false;
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      if (this.setCorner(tx + ox, ty + oy, this.terrain)) changed = true;
    }
    if (changed) this.renderer.invalidateCells(tx - 1, ty - 1, tx + 1, ty + 1);
    return changed;
  }

  _paintStroke(tx, ty) {
    const last = this._paintLast;
    let changed = false;
    if (last && (Math.abs(last[0] - tx) > 0 || Math.abs(last[1] - ty) > 0)) {
      const steps = Math.max(Math.abs(tx - last[0]), Math.abs(ty - last[1]));
      for (let s = 1; s <= steps; s++) {
        const ix = Math.round(last[0] + (tx - last[0]) * s / steps);
        const iy = Math.round(last[1] + (ty - last[1]) * s / steps);
        for (const c of this._brushCells(ix, iy)) if (this.stamp(c[0], c[1])) changed = true;
      }
    } else {
      for (const c of this._brushCells(tx, ty)) if (this.stamp(c[0], c[1])) changed = true;
    }
    this._paintLast = [tx, ty];
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  _applyRect(x0, y0, x1, y1) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const cx = (ax + bx + 1) / 2, cy = (ay + by + 1) / 2;
    const rx = (bx - ax + 1) / 2, ry = (by - ay + 1) / 2;
    let changed = false;
    for (let y = ay; y <= by + 1; y++) {
      for (let x = ax; x <= bx + 1; x++) {
        if (this.shape === "round") {
          const dx = (x - cx) / rx, dy = (y - cy) / ry;
          if (dx * dx + dy * dy > 1) continue;
        }
        if (this.setCorner(x, y, this.terrain)) changed = true;
      }
    }
    if (changed) this.renderer.invalidateCells(ax - 1, ay - 1, bx + 1, by + 1);
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  _lineCells(x0, y0, x1, y1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    const out = [];
    for (let s = 0; s <= steps; s++) {
      const ix = steps ? Math.round(x0 + (x1 - x0) * s / steps) : x0;
      const iy = steps ? Math.round(y0 + (y1 - y0) * s / steps) : y0;
      for (const c of this._brushCells(ix, iy)) out.push(c);
    }
    return out;
  }

  _applyLine(x0, y0, x1, y1) {
    let changed = false;
    for (const c of this._lineCells(x0, y0, x1, y1)) if (this.stamp(c[0], c[1])) changed = true;
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  floodFill(tx, ty) {
    const w = this.world;
    if (tx < 0 || ty < 0 || tx >= w.W || ty >= w.H) return;
    const sig = (x, y) => {
      const a = w.corners[y * w.cw + x], b = w.corners[y * w.cw + x + 1];
      const c = w.corners[(y + 1) * w.cw + x], d = w.corners[(y + 1) * w.cw + x + 1];
      return a + "," + b + "," + c + "," + d;
    };
    const target = sig(tx, ty);
    const seen = new Uint8Array(w.W * w.H);
    const stack = [tx, ty];
    let changed = false;
    while (stack.length) {
      const y = stack.pop(), x = stack.pop();
      if (x < 0 || y < 0 || x >= w.W || y >= w.H) continue;
      const i = y * w.W + x;
      if (seen[i]) continue;
      if (sig(x, y) !== target) continue;
      seen[i] = 1;
      if (this.stamp(x, y)) changed = true;
      stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
    }
    if (changed) { this._commitOp(); this.markDirty(true); this.minimapDirty = true; this.onChange("paint"); }
  }

  erasePropAt(wx, wy) {
    for (let i = this.world.props.length - 1; i >= 0; i--) {
      const p = this.world.props[i];
      const row = PROPS[p.s];
      if (!row) continue;
      const sc = p.sc || 1;
      const hw = row[2] * sc / 2, h = row[3] * sc;
      if (wx >= p.x - hw && wx <= p.x + hw && wy >= p.y - h && wy <= p.y) {
        this.world.props.splice(i, 1);
        this.markDirty(true);
        this.minimapDirty = true;
        this.afterEdit();
        return true;
      }
    }
    return false;
  }

  _eraseAt(wx, wy, single) {
    const w = this.world;
    if (!w) return 0;
    const r = single ? 6 : Math.max(8, this.brushSize * TILE * 0.5);
    let removed = 0;
    for (let i = w.props.length - 1; i >= 0; i--) {
      const p = w.props[i];
      const row = PROPS[p.s];
      if (!row) continue;
      const sc = p.sc || 1;
      const hw = row[2] * sc / 2, h = row[3] * sc;
      const nx = Math.max(p.x - hw, Math.min(wx, p.x + hw));
      const ny = Math.max(p.y - h, Math.min(wy, p.y));
      const dx = nx - wx, dy = ny - wy;
      if (dx * dx + dy * dy <= r * r) { w.props.splice(i, 1); removed++; }
    }
    if (removed) {
      this.markDirty(true);
      this.minimapDirty = true;
      this.afterEdit();
    }
    return removed;
  }

  decalAnchor(wx, wy, row) {
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    return { x: tx * TILE + row[2] / 2, y: ty * TILE + row[3] };
  }

  placeProp(wx, wy) {
    if (this.propIndex < 0) return;
    const row = PROPS[this.propIndex];
    if (!row) return;
    const w = this.world;
    if (wx < 0 || wy < 0 || wx > w.W * TILE || wy > w.H * TILE) return;
    const decal = isDecal(row);
    const a = decal ? this.decalAnchor(wx, wy, row) : { x: Math.round(wx), y: Math.round(wy) };
    w.props.push({ x: a.x, y: a.y, s: this.propIndex, flip: decal ? 0 : (Math.random() < 0.5 ? 1 : 0), kind: row[4], sc: decal ? 1 : this.propScale });
    w.props.sort((a, b) => a.y - b.y || a.x - b.x);
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
  }

  placePrefab(wx, wy) {
    const pf = PREFABS[this.prefabIndex];
    if (!pf) return 0;
    const w = this.world;
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    const parts = buildPrefab(this.prefabIndex, tx, ty, this.propScale);
    if (!parts.length) return 0;
    let n = 0;
    for (const q of parts) {
      if (q.x < 0 || q.y < 0 || q.x > w.W * TILE || q.y > w.H * TILE) continue;
      w.props.push(q);
      n++;
    }
    if (!n) return 0;
    w.props.sort((a, b) => a.y - b.y || a.x - b.x);
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
    return n;
  }

  erasePrefab(wx, wy) {
    const pf = PREFABS[this.prefabIndex];
    const w = this.world;
    if (!pf || !w) return 0;
    const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    const ox = tx - ((pf.w - 1) >> 1), oy = ty - (pf.h - 1);
    const x0 = ox * TILE, y0 = oy * TILE, x1 = (ox + pf.w) * TILE, y1 = (oy + pf.h) * TILE;
    let removed = 0;
    for (let i = w.props.length - 1; i >= 0; i--) {
      const p = w.props[i];
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) { w.props.splice(i, 1); removed++; }
    }
    if (removed) {
      this.markDirty(true);
      this.minimapDirty = true;
      this.afterEdit();
    }
    return removed;
  }

  copyRegion(x0, y0, x1, y1) {
    const w = this.world;
    if (!w) return null;
    const ax = Math.max(0, Math.min(x0, x1)), bx = Math.min(w.W - 1, Math.max(x0, x1));
    const ay = Math.max(0, Math.min(y0, y1)), by = Math.min(w.H - 1, Math.max(y0, y1));
    const cw = bx - ax + 1, ch = by - ay + 1;
    if (cw < 1 || ch < 1) return null;
    const corners = new Uint8Array((cw + 1) * (ch + 1));
    for (let y = 0; y <= ch; y++) {
      for (let x = 0; x <= cw; x++) corners[y * (cw + 1) + x] = w.corners[(ay + y) * w.cw + ax + x];
    }
    const px0 = ax * TILE, py0 = ay * TILE, px1 = (bx + 1) * TILE, py1 = (by + 1) * TILE;
    const props = [];
    for (const p of w.props) {
      if (p.x < px0 || p.x > px1 || p.y < py0 || p.y > py1) continue;
      props.push({ dx: (p.x - px0) / TILE, dy: (p.y - py0) / TILE, s: p.s, flip: p.flip || 0, kind: p.kind, sc: p.sc || 1 });
    }
    this.clip = { w: cw, h: ch, corners, props };
    this._cloneSrc = { ax, ay, bx, by };
    return this.clip;
  }

  pasteAt(tx, ty) {
    const w = this.world;
    const c = this.clip;
    if (!w || !c) return 0;
    const ox = tx - (c.w >> 1), oy = ty - (c.h >> 1);
    this._beginOp("clone");
    let wrote = 0;
    const stride = c.w + 1;
    for (let y = 0; y <= c.h; y++) {
      for (let x = 0; x <= c.w; x++) {
        if (this.setCorner(ox + x, oy + y, c.corners[y * stride + x])) wrote++;
      }
    }
    let added = 0;
    for (const q of c.props) {
      const px = (ox + q.dx) * TILE + TILE / 2, py = (oy + q.dy) * TILE + TILE;
      if (px < 0 || py < 0 || px > w.W * TILE || py > w.H * TILE) continue;
      w.props.push({ x: px, y: py, s: q.s, flip: q.flip || 0, kind: q.kind, sc: q.sc || 1 });
      added++;
    }
    if (added) w.props.sort((a, b) => a.y - b.y || a.x - b.x);
    this.renderer.invalidateCells(ox - 1, oy - 1, ox + c.w + 1, oy + c.h + 1);
    this._commitOp();
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
    return added;
  }

  clearClip() {
    this.clip = null;
    this._cloneSrc = null;
    this.requestDraw();
  }

  addLabel(tx, ty, name) {
    const w = this.world;
    if (!w) return -1;
    if (!Array.isArray(w.labels)) w.labels = [];
    w.labels.push({ tx, ty, name: (name || "New label").slice(0, 40) });
    this.selectedLabel = w.labels.length - 1;
    this.markDirty(true);
    this.afterEdit();
    return this.selectedLabel;
  }

  renameLabel(i, name) {
    const w = this.world;
    if (!w || !w.labels || !w.labels[i]) return;
    w.labels[i].name = String(name || "").slice(0, 40);
    this.markDirty(true);
    this.afterEdit();
  }

  removeLabel(i) {
    const w = this.world;
    if (!w || !w.labels || !w.labels[i]) return;
    w.labels.splice(i, 1);
    this.selectedLabel = -1;
    this.markDirty(true);
    this.afterEdit();
  }

  _selectDown(tx, ty, wp, e) {
    let hit = -1;    for (let i = this.world.props.length - 1; i >= 0; i--) {
      const p = this.world.props[i];
      const row = PROPS[p.s];
      if (!row) continue;
      const sc = p.sc || 1;
      const hw = row[2] * sc / 2, h = row[3] * sc;
      if (wp.x >= p.x - hw && wp.x <= p.x + hw && wp.y >= p.y - h && wp.y <= p.y) { hit = i; break; }
    }
    this.selectedProp = hit;
    this.opts.selectedProp = hit;
    if (hit >= 0) {
      this.snapshot("move prop");
      this._movingProp = hit;
    }
    this.status();
    this.onChange("select");
    this.requestDraw();
  }

  deleteProp(i) {
    if (i < 0 || i >= this.world.props.length) return;
    this.world.props.splice(i, 1);
    this.selectedProp = -1;
    this.opts.selectedProp = -1;
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
  }

  clearProps() {
    this.snapshot("clear props");
    this.world.props.length = 0;
    this.markDirty(true);
    this.minimapDirty = true;
    this.afterEdit();
  }

  snapshot(label) {
    if (!this.world) return;
    this._beginOp(label);
    this._commitOp();
  }

  _beginOp(label) {
    if (!this.world || this._pendingSnap) return;
    this._pendingSnap = { label, corners: new Uint8Array(this.world.corners), props: this.world.props.map((p) => ({ ...p })) };
  }

  _commitOp() {
    if (!this._pendingSnap) return;
    this._undoStack = this._undoStack || [];
    this._redoStack = [];
    this._undoStack.push(this._pendingSnap);
    this._undoBytes = (this._undoBytes || 0) + this._pendingSnap.corners.length + this._pendingSnap.props.length * 40;
    this._pendingSnap = null;
    while (this._undoStack.length > 1 && this._undoBytes > this.maxHistBytes) {
      const gone = this._undoStack.shift();
      this._undoBytes -= gone.corners.length + gone.props.length * 40;
    }
    this.onHistory();
  }

  _cancelOp() { this._pendingSnap = null; }

  canUndo() { return !!(this._undoStack && this._undoStack.length); }
  canRedo() { return !!(this._redoStack && this._redoStack.length); }

  _currentState() {
    return { corners: new Uint8Array(this.world.corners), props: this.world.props.map((p) => ({ ...p })) };
  }

  _restore(snap) {
    this.world.corners = new Uint8Array(snap.corners);
    this.world.props = snap.props.map((p) => ({ ...p }));
    this.selectedProp = -1;
    this.opts.selectedProp = -1;
    this.minimapDirty = true;
    this.renderer.invalidate();
    this.markDirty(true);
    this.onHistory();
    this.afterEdit();
  }

  undo() {
    this._undoStack = this._undoStack || [];
    if (!this._undoStack.length) return;
    this._redoStack = this._redoStack || [];
    this._redoStack.push({ ...this._currentState() });
    const snap = this._undoStack.pop();
    this._undoBytes -= snap.corners.length + snap.props.length * 40;
    this._restore(snap);
  }

  redo() {
    this._redoStack = this._redoStack || [];
    if (!this._redoStack.length) return;
    this._undoStack = this._undoStack || [];
    this._undoStack.push({ ...this._currentState() });
    const snap = this._redoStack.pop();
    this._restore(snap);
  }

  afterEdit() {
    this.onChange("edit");
    this.status();
    this.requestDraw();
  }

  refreshMinimap() {
    const w = this.world;
    if (!w) return null;
    this.minimapCanvas = this.renderer.renderMinimap(w, this.minimapSize);
    this.minimapDirty = false;
    return this.minimapCanvas;
  }

  status() {
    const w = this.world;
    if (!w) return;
    const p = this.pointer;
    const inside = p.tx >= 0 && p.ty >= 0 && p.tx < w.W && p.ty < w.H;
    this.onStatus({
      tx: inside ? p.tx : null,
      ty: inside ? p.ty : null,
      terrain: inside ? this.cornerAt(p.tx, p.ty) : null,
      props: w.props.length,
      zoom: this.view.zoom,
      size: w.W + " x " + w.H,
      tool: this.tool,
      selected: this.selectedProp,
      propScale: this.propScale,
      brushSize: this.brushSize,
      shape: this.shape,
      prefab: this.prefabIndex,
      prefabLabel: PREFABS[this.prefabIndex] ? PREFABS[this.prefabIndex].label : null,
      label: this.selectedLabel,
      labelCount: (w.labels || []).length,
      clip: this.clip ? this.clip.w + "x" + this.clip.h : null,
    });
  }
}

export function terrainSwatchUrl(terrainIndex, size = 32) {
  const id = BASE[terrainIndex];
  return { id, ix: (id % COLUMNS) * TILE, iy: Math.floor(id / COLUMNS) * TILE, size };
}

export { TERRAINS, TERRAIN_INDEX, BASE, TILE, COLUMNS, PROPS };

```

## 01-internal-code/src/prefabs.js

_17192 bytes_

```javascript
// Hand-authored prefab (stamp) library for the editor. Each prefab is a cluster of
// atlas sprites on a tile grid that can be dropped onto the map as one unit, so whole
// buildings, farmsteads, harbours, graveyards and camps can be composed from the
// fragment sprites of the LPC base/build sheets.
//
// Parts are referenced by their display name (an optional second argument picks the
// nth sprite of that name) or by a { kind, pal, w, h } spec, so the library keeps
// working if atlas rows are reordered. A part is { dx, dy, s, flip, d } - the tile
// offset from the prefab's top-left cell, the atlas row index, an optional horizontal
// flip and d=1 for decal sprites (drawn under the rest).

import { PROPS } from "./props.js";
import { TILE } from "./tileset.js";

const BY_NAME = {};
PROPS.forEach((row, i) => {
  const n = row[7];
  if (n) (BY_NAME[n] = BY_NAME[n] || []).push(i);
});

export function spriteIndex(ref, nth = 0) {
  if (typeof ref === "number") return ref >= 0 && ref < PROPS.length ? ref : -1;
  if (typeof ref === "string") {
    const a = BY_NAME[ref];
    return a && a[nth] !== undefined ? a[nth] : -1;
  }
  if (ref && typeof ref === "object") {
    for (let i = 0; i < PROPS.length; i++) {
      const r = PROPS[i];
      if (ref.kind && r[4] !== ref.kind) continue;
      if (ref.pal && r[5] !== ref.pal) continue;
      if (ref.w != null && r[2] !== ref.w) continue;
      if (ref.h != null && r[3] !== ref.h) continue;
      if (ref.minH != null && r[3] < ref.minH) continue;
      if (ref.maxH != null && r[3] > ref.maxH) continue;
      if (ref.minW != null && r[2] < ref.minW) continue;
      if (ref.maxW != null && r[2] > ref.maxW) continue;
      return i;
    }
    return -1;
  }
  return -1;
}

const FENCE_RAIL = spriteIndex("fence right end");
const FENCE_PICKET = spriteIndex("picket right end");
const FENCE_BASE = { rail: FENCE_RAIL, picket: FENCE_PICKET };

function fenceSprite(base, up, down, left, right) {
  if (left || right) {
    const c = (left && right) ? 1 : (right ? 0 : 2);
    const row = up ? (down ? 3 : 4) : (down ? 2 : 0);
    return base + row * 3 + c;
  }
  const c = up ? (down ? 1 : 0) : 2;
  return base + 3 + c;
}

function fenceRing(base, x, y, w, h, gate) {
  const cells = [];
  for (let i = 0; i < w; i++) { cells.push([x + i, y]); cells.push([x + i, y + h - 1]); }
  for (let j = 1; j < h - 1; j++) { cells.push([x, y + j]); cells.push([x + w - 1, y + j]); }
  const k = (a, b) => a * 1024 + b;
  const set = new Set(cells.map((c) => k(c[0], c[1])));
  const gateKey = gate ? k(gate[0], gate[1]) : -1;
  const out = [];
  for (const [cx, cy] of cells) {
    let s;
    if (gateKey >= 0 && k(cx, cy) === gateKey) s = base + 16;
    else if (gateKey >= 0 && k(cx + 1, cy) === gateKey) s = base + 15;
    else if (gateKey >= 0 && k(cx - 1, cy) === gateKey) s = base + 17;
    else s = fenceSprite(base,
      set.has(k(cx, cy - 1)) ? 1 : 0,
      set.has(k(cx, cy + 1)) ? 1 : 0,
      set.has(k(cx - 1, cy)) ? 1 : 0,
      set.has(k(cx + 1, cy)) ? 1 : 0);
    out.push({ dx: cx, dy: cy, s, flip: 0 });
  }
  return out;
}

function mk(id, label, hint, w, h, build) {
  const parts = [];
  const p = (ref, dx, dy, o) => {
    const s = spriteIndex(ref, (o && o.n) || 0);
    if (s >= 0) parts.push({ dx, dy, s, flip: o && o.flip ? 1 : 0 });
    return p;
  };
  const d = (ref, dx, dy, o) => {
    const s = spriteIndex(ref, (o && o.n) || 0);
    if (s >= 0) parts.push({ dx, dy, s, flip: 0, d: 1 });
    return d;
  };
  const fence = (x, y, fw, fh, style, gate) => {
    const base = FENCE_BASE[style];
    if (base >= 0) for (const c of fenceRing(base, x, y, fw, fh, gate)) parts.push(c);
  };
  const rail = (y, x0, x1, style) => {
    const base = FENCE_BASE[style || "rail"];
    if (!(base >= 0)) return rail;
    for (let x = x0; x <= x1; x++) {
      parts.push({ dx: x, dy: y, s: fenceSprite(base, 0, 0, x > x0 ? 1 : 0, x < x1 ? 1 : 0), flip: 0 });
    }
    return rail;
  };
  build({ p, d, fence, rail });
  return { id, label, hint, w, h, parts };
}

const FIELD_STRIPS = ["plowed soil", "wheat field", "young wheat", "tall grass", "wheat sparse", "plowed soil alt"];

export const PREFABS = [
  mk("homestead", "Homestead", "A large house with a front yard, cart and lamp", 12, 10, (k) => {
    k.d("dirt pebbles", 4, 9); k.d("dirt pebbles", 5, 9); k.d("dirt pebbles", 6, 9);
    k.d("dirt pebbles", 3, 8); k.d("dirt pebbles", 7, 8);
    k.p("stone and tile", 5, 8);
    k.p("street lamp", 2, 9);
    k.p("wooden barrel", 3, 9, { flip: 1 });
    k.p("wood flatbed", 8, 9);
    k.p("notice board", 10, 9);
    k.p("small berry bushes", 1, 8);
    k.p("potted plant", 11, 8);
    k.p("green shrub", 0, 8);
    k.p("wood bundle", 9, 1);
  }),
  mk("farmstead", "Farmstead", "A picket-fenced plot of tilled fields with crops and a cart", 12, 9, (k) => {
    k.fence(0, 0, 12, 9, "picket", [6, 8]);
    for (let x = 1; x <= 10; x++) {
      const f = FIELD_STRIPS[x % FIELD_STRIPS.length];
      for (let y = 1; y <= 7; y++) k.d(f, x, y);
    }
    k.p("hay and tools", 9, 1);
    k.p("sack of grain", 10, 3);
    k.p("leafy plants", 2, 7);
    k.p("carrot with top", 4, 7);
    k.p("cucumber", 5, 7);
    k.p("tall green plant", 8, 7);
    k.p("wood flatbed", 1, 1);
    k.p("sack of beans", 10, 7);
    k.p("hay cart", 10, 5);
  }),
  mk("wheatfield", "Wheat field", "A bare strip of crop decals", 9, 6, (k) => {
    for (let x = 0; x <= 8; x++) {
      const f = FIELD_STRIPS[x % FIELD_STRIPS.length];
      for (let y = 0; y <= 5; y++) k.d(f, x, y);
    }
    k.p("wooden post", 0, 5);
    k.p("leafy plants", 4, 5);
    k.p("yellow leafy plant", 8, 5);
  }),
  mk("market", "Market square", "A cobbled square with stalls, goods, benches and a statue", 9, 9, (k) => {
    for (let x = 0; x <= 8; x++) for (let y = 0; y <= 8; y++) k.d((x + y) % 3 === 0 ? "dirt pebbles" : "gravel floor", x, y);
    k.p("stone lantern", 4, 4);
    k.p("market stand", 2, 2);
    k.p("market stand", 6, 6, { flip: 1 });
    k.p("green fish pile", 4, 8);
    k.p("red fish pile", 7, 4);
    k.p("wood group", 1, 7);
    k.p("wooden barrel", 3, 8);
    k.p("wooden barrel", 5, 1);
    k.p("sack of grain", 7, 8);
    k.p("sack of beans", 0, 1);
    k.p("basket of bread", 2, 6);
    k.p("baskets of grains", 1, 1);
    k.p("baskets of greens", 0, 3);
    k.p("food pot", 5, 8);
    k.p("blue vase", 8, 4);
    k.p("metal tray", 3, 5);
    k.p("potion bottles", 5, 5);
    k.p("green melon", 6, 3);
    k.p("orange fruit", 7, 3);
    k.p("red apple", 6, 4);
    k.p("wood bench", 0, 4);
    k.p("white bench", 8, 2, { flip: 1 });
    k.p("wooden signs", 7, 0);
    k.p("street lamp", 0, 8);
    k.p("street lamp", 8, 8);
    k.p("stone lion", 4, 7);
  }),
  mk("plaza", "Village well", "A small cobbled plaza around a well", 6, 6, (k) => {
    for (let x = 0; x <= 5; x++) for (let y = 0; y <= 5; y++) k.d((x + y) % 2 === 0 ? "gravel floor" : "dirt pebbles", x, y);
    k.d("water pond", 2, 2);
    k.d("white lily pad", 2, 2);
    k.d("fish school", 2, 1);
    k.d("starfish", 3, 2);
    k.p("cattails", 1, 2);
    k.p("wooden barrel", 0, 2);
    k.p("wooden barrel", 5, 2);
    k.p("wood bench", 2, 5);
    k.p("white bench", 0, 4, { flip: 1 });
    k.p("street lamp", 5, 5);
    k.p("potted plant", 0, 0);
  }),
  mk("camp", "Camp", "A woodland camp with a canvas tent, campfires, a cauldron and carts", 10, 8, (k) => {
    for (let x = 1; x <= 8; x++) for (let y = 2; y <= 6; y++) if ((x + y) % 3 === 0) k.d("dirt patch", x, y);
    k.d("fur rug", 6, 6);
    k.p("tent", 2, 5);
    k.p("hay and tools", 1, 6);
    k.p("wood group", 5, 7);
    k.p("wood flatbed", 3, 7);
    k.p("tall wood", 0, 3);
    k.p("firewood pile", 3, 3);
    k.p("campfire", 6, 4);
    k.p("boiling cauldron", 8, 5);
    k.p("wooden barrel", 4, 7);
    k.p("sack of grain", 8, 7);
    k.p("sack of beans", 0, 7);
    k.p("standing torch", 0, 5);
    k.p("standing torch", 9, 3);
    k.p("green shrub", 9, 7);
  }),
  mk("harbour", "Harbour", "A stone dock with moored rowboats, barrels and crates", 12, 10, (k) => {
    k.p("stone dock", 5, 7);
    k.p("wooden rowboats", 5, 9);
    k.p("green fish pile", 2, 9);
    k.p("stacked sacks", 9, 9);
    k.p("wooden barrel", 0, 9);
    k.p("sack of grain", 11, 9);
    k.p("wooden post", 0, 6);
    k.p("wooden post", 11, 6);
    k.p("wood group", 10, 8, { flip: 1 });
    k.p("green shrub", 0, 8);
  }),
  mk("graveyard", "Graveyard", "A fenced graveyard with headstones and a stone lantern", 9, 8, (k) => {
    k.fence(0, 1, 9, 7, "rail", [4, 7]);
    for (let x = 1; x <= 7; x++) for (let y = 2; y <= 6; y++) if ((x * 3 + y) % 4 === 0) k.d("tall grass", x, y);
    k.p("grave cluster", 2, 3);
    k.p("grave and headstone", 6, 3);
    k.p("round headstone", 1, 6);
    k.p("tall grave cross", 4, 6);
    k.p("grave marker", 6, 6);
    k.p("stone lantern", 0, 0);
    k.p("stone lantern", 8, 0);
    k.p("green shrub", 3, 0);
  }),
  mk("shrine", "Shrine", "A torii gate, stone steps and a shrine building", 9, 9, (k) => {
    k.d("gravel floor", 4, 6); k.d("gravel floor", 3, 6); k.d("gravel floor", 5, 6);
    k.d("gravel floor", 4, 7);
    k.p("torii gate red", 4, 5);
    k.p("stone steps", 4, 6);
    k.p("stone structure", 4, 8);
    k.p("stone lantern", 1, 8);
    k.p("stone lantern", 7, 8);
    k.p("green shrub", 0, 8);
    k.p("green shrub", 8, 8);
  }),
  mk("ruins", "Ruins", "A crumbling arch, fallen pillars and rubble", 10, 8, (k) => {
    for (let x = 0; x <= 9; x++) for (let y = 0; y <= 7; y++) if ((x * 5 + y * 3) % 7 === 0) k.d("tall grass", x, y);
    k.p("stone arch", 3, 4);
    k.p("old chest", 4, 5);
    k.p("skeleton", 7, 6);
    k.p("wall segment", 1, 5);
    k.p("stone pillar", 5, 6);
    k.p("stone pillar", 6, 6);
    k.p("round stone", 1, 6);
    k.p("stone steps", 6, 7);
    k.p("mossy boulder", 8, 3);
    k.p("grey boulder", 2, 1);
    k.p("small stone cluster", 4, 7);
    k.p("stone pair", 5, 7);
    k.p("small grey stones", 8, 7);
    k.p("stone edge", 0, 7);
  }),
  mk("paddock", "Paddock", "A fenced pasture with grazing cattle", 9, 7, (k) => {
    k.fence(0, 0, 9, 7, "picket", [4, 6]);
    for (let x = 1; x <= 7; x++) for (let y = 1; y <= 5; y++) if ((x + y) % 3 === 0) k.d("tall grass", x, y);
    k.p("cow", 2, 4);
    k.p("cow", 5, 2, { flip: 1 });
    k.p("wooden barrel", 1, 1);
    k.p("green shrub", 7, 5);
  }),
  mk("windmill", "Windmill", "A windmill with grain sacks and a cart", 6, 6, (k) => {
    k.d("dirt pebbles", 2, 5); k.d("dirt pebbles", 3, 5); k.d("dirt pebbles", 1, 5);
    k.p("windmill", 2, 4);
    k.p("sack of grain", 0, 5);
    k.p("sack of beans", 5, 5);
    k.p("wood flatbed", 4, 5);
    k.p("wooden barrel", 1, 5);
  }),
  mk("smithy", "Blacksmith", "A stone forge with a forge fire, anvil, weapon rack, armour and wares", 8, 7, (k) => {
    for (let x = 0; x <= 7; x++) for (let y = 5; y <= 6; y++) if ((x * 2 + y) % 3 === 0) k.d("gravel floor", x, y);
    k.d("dirt pebbles", 4, 6);
    k.p("stone structure", 2, 4);
    k.p("campfire", 6, 5);
    k.p("street lamp", 1, 4);
    k.p("sword sign", 5, 3);
    k.p("sack of grain", 4, 3);
    k.p("wood group", 6, 2);
    k.p("wooden shield", 5, 2);
    k.p("cauldron pot", 1, 6);
    k.p("anvil and tongs", 2, 6);
    k.p("metal armor", 3, 6);
    k.p("metal tray", 4, 6);
    k.p("weapons and tools", 5, 6);
    k.p("wooden barrel", 7, 6);
  }),
  mk("mine", "Mine", "A timbered mine adit with a barred gate, a cart and ore boulders", 9, 7, (k) => {
    for (let x = 1; x <= 7; x++) for (let y = 4; y <= 6; y++) if ((x + y) % 3 !== 0) k.d("gravel floor", x, y);
    k.d("dirt pebbles", 4, 6); k.d("dirt pebbles", 5, 6);
    k.d("dark hole", 4, 5);
    k.p("metal barred", 4, 4);
    k.p("mine cart", 6, 4);
    k.p("wooden post", 2, 4);
    k.p("wooden post", 6, 4);
    k.p("standing torch", 1, 5);
    k.p("standing torch", 7, 5);
    k.p("wood group", 0, 4);
    k.p("tall wood", 8, 3);
    k.p("ore boulders", 2, 6);
    k.p("grey ore chunk", 6, 6);
    k.p("brown nuggets", 5, 5);
    k.p("grey boulder", 8, 1);
    k.p("small stone cluster", 3, 5);
    k.p("stone pair", 1, 6);
    k.p("wooden barrel", 0, 6);
  }),
  mk("bridge", "Bridge", "A railed timber bridge deck - lay it across a river or a gorge", 11, 6, (k) => {
    for (let x = 0; x <= 10; x++) { k.d("wooden plank floor", x, 2); k.d("wooden plank floor", x, 3); }
    k.rail(1, 0, 10);
    k.rail(4, 0, 10);
  }),
  mk("orchard", "Orchard", "A fenced orchard of fruit trees grown in rows", 11, 9, (k) => {
    k.fence(0, 0, 11, 9, "picket", [5, 8]);
    for (let x = 1; x <= 9; x++) for (let y = 1; y <= 7; y++) if ((x + y * 3) % 4 === 0) k.d("tall grass", x, y);
    for (let x = 2; x <= 8; x += 3) for (let y = 1; y <= 5; y += 2) k.p("tall fruit tree", x, y);
    k.p("fruit tree", 5, 7);
    k.p("wood flatbed", 9, 7);
    k.p("sack of beans", 1, 7);
    k.p("small berry bushes", 1, 1);
  }),
  mk("kitchengarden", "Kitchen garden", "Tilled beds of cabbage, carrots and herbs behind a low fence", 9, 7, (k) => {
    for (let y = 1; y <= 5; y++) for (let x = 1; x <= 7; x++) k.d(y % 2 === 0 ? "plowed soil" : "plowed soil alt", x, y);
    k.fence(0, 0, 9, 7, "rail", [4, 6]);
    k.p("green cabbage", 2, 2); k.p("green cabbage", 4, 2); k.p("green cabbage", 6, 2);
    k.p("carrot with top", 2, 4); k.p("cucumber", 4, 4); k.p("leafy plants", 6, 4);
    k.p("green cabbage", 3, 5); k.p("red tomato", 5, 5);
    k.p("potted plant", 7, 1);
    k.p("sack of grain", 1, 6); k.p("wooden barrel", 7, 6);
  }),
  mk("inn", "Inn", "A large building with an outdoor beer garden of tables and benches", 12, 10, (k) => {
    for (let x = 3; x <= 11; x++) for (let y = 7; y <= 9; y++) k.d((x + y) % 2 === 0 ? "gravel floor" : "dirt pebbles", x, y);
    k.d("checkered rug", 7, 8);
    k.p("stone and tile", 5, 7);
    k.p("inn sign", 1, 8);
    k.p("hanging signs", 10, 6);
    k.p("wood table", 4, 9); k.p("wooden bench", 3, 9); k.p("wooden bench", 5, 9);
    k.p("wood table", 7, 9); k.p("wooden chair", 6, 9); k.p("wooden chair", 8, 9);
    k.p("wooden barrel", 1, 9); k.p("sack of grain", 0, 9);
    k.p("basket of bread", 2, 8); k.p("food pot", 10, 8);
    k.p("green cabbage", 11, 9); k.p("green melon", 10, 9);
    k.p("street lamp", 0, 8); k.p("potted plant", 11, 6);
    k.p("firewood pile", 11, 4);
    k.p("green bush", 1, 4);
  }),
  mk("crypt", "Crypt", "A broken stone tomb with a barred stair, bones and a looted chest", 10, 8, (k) => {
    for (let x = 1; x <= 8; x++) for (let y = 2; y <= 6; y++) if ((x * 3 + y) % 5 === 0) k.d("dark pebbles", x, y);
    k.p("stone structure", 4, 4);
    k.p("stone steps", 4, 6);
    k.p("old chest", 6, 7);
    k.p("skeleton", 2, 7);
    k.p("skeleton", 7, 3);
    k.p("wall segment", 1, 6);
    k.p("wall segment", 8, 6);
    k.p("round headstone", 1, 3);
    k.p("tall grave cross", 9, 5);
    k.p("stone pillar", 0, 6);
    k.p("mossy boulder", 2, 1);
    k.p("small stone cluster", 5, 8);
  }),
  mk("nomad", "Nomad camp", "Travelling folk - two canvas tents, a cook fire and their gear", 14, 9, (k) => {
    for (let x = 1; x <= 12; x++) for (let y = 3; y <= 7; y++) if ((x + y * 2) % 4 === 0) k.d("dirt patch", x, y);
    k.d("fur rug", 6, 7);
    k.p("tent", 3, 5);
    k.p("tent", 10, 6);
    k.p("campfire", 6, 5);
    k.p("firewood pile", 5, 3);
    k.p("boiling cauldron", 7, 6);
    k.p("wooden barrel", 1, 7);
    k.p("stacked sacks", 12, 7);
    k.p("hay cart", 12, 3);
    k.p("standing torch", 0, 5);
    k.p("green shrub", 13, 8);
  }),
  mk("fishmonger", "Fishmonger", "A planked quayside stall of catch and wares", 12, 10, (k) => {
    for (let x = 0; x <= 11; x++) for (let y = 5; y <= 9; y++) if ((x + y) % 2 === 0) k.d("wooden plank floor", x, y);
    k.p("fish stall", 4, 7);
    k.p("market counter", 4, 9);
    k.p("green fish pile", 9, 9);
    k.p("blue fish pile", 10, 9);
    k.p("eel pile", 1, 9);
    k.p("red fish pile", 11, 7);
    k.p("green fish pair", 8, 6);
    k.p("red fish pair", 10, 6);
    k.p("stacked sacks", 0, 8);
    k.p("wooden barrel", 11, 9);
    k.p("wooden post", 0, 6);
  }),
];

export function prefabParts(index) {
  const p = PREFABS[index];
  return p ? p.parts.slice() : [];
}

export function prefabBounds(index) {
  const p = PREFABS[index];
  if (!p) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const part of p.parts) {
    const row = PROPS[part.s];
    if (!row) continue;
    const cx = part.dx * TILE + TILE / 2, by = (part.dy + 1) * TILE;
    x0 = Math.min(x0, cx - row[2] / 2); y0 = Math.min(y0, by - row[3]);
    x1 = Math.max(x1, cx + row[2] / 2); y1 = Math.max(y1, by);
  }
  if (!isFinite(x0)) return null;
  return { x0, y0, x1, y1 };
}

export function buildPrefab(index, tx, ty, scale) {
  const p = PREFABS[index];
  if (!p) return [];
  const ox = tx - ((p.w - 1) >> 1);
  const oy = ty - (p.h - 1);
  const out = [];
  for (const part of p.parts) {
    const row = PROPS[part.s];
    if (!row) continue;
    out.push({
      x: (ox + part.dx) * TILE + row[2] / 2,
      y: (oy + part.dy) * TILE + row[3],
      s: part.s,
      flip: part.flip || 0,
      kind: row[4],
      sc: part.d ? 1 : (scale || 1),
    });
  }
  return out;
}

```

## 01-internal-code/src/props.js

_46267 bytes_

```javascript
// LPC prop sprites, packed into a single atlas.
// Generated by the build script described in README.md. Source sheets are CC-BY-SA 3.0 / GPL
// (see credits.txt for the full attribution list).
//
// Row format: [sx, sy, w, h, kind, palette, species] with an optional 8th entry, a display name.
//   sx,sy      top-left of the sprite inside props.png
//   w,h        sprite size in px (native pixel-art resolution)
//   kind       tree | cherry | fruit_tree | dead_tree | conifer | conifer_snow | bush | plant |
//              mushroom | reed | crop | rock | log | stump | fence | structure | barrel | cart |
//              sack | sign | lantern | statue | stall | boat | furniture | good | decal |
//              gravestone | animal
//   palette    colour/material variant id (green/brown/orange/pale/dead/pink/gray/dark/stone/wood/
//              brick/iron/rope/gold/red/blue/cave/gravel/flower/grass/moss/lava/water) - use for
//              biome tinting
//   species    index of the sprite within its original sheet (stable id for save files)
//   name       optional human-readable label (editor palette tooltip; used by the generator to
//              look up specific decal tiles by name)
// Anchor point of every sprite is bottom-center: draw at (x - w/2, y - h).
// Sprites whose kind is "decal" are ground overlays: same anchor, but drawn beneath every other
// prop, never given a shadow, and placed grid-aligned with sc = 1.

export const PROPS_IMAGE = "./props.png";
export const ATLAS_WIDTH = 2048;
export const ATLAS_HEIGHT = 3576;
export const PROP_ROW = ["sx","sy","w","h","kind","palette","species"];
export const PROPS = [
  [0,0,271,314,"tree","green",40],
  [273,0,271,314,"tree","brown",40],
  [546,0,271,314,"tree","orange",40],
  [819,0,271,314,"tree","pale",40],
  [1092,0,271,314,"tree","dead",37],
  [1365,0,242,298,"tree","green",43],
  [1609,0,242,298,"tree","brown",43],
  [0,316,242,298,"tree","orange",43],
  [244,316,242,298,"tree","pale",43],
  [488,316,242,298,"tree","dead",39],
  [732,316,192,224,"conifer","green",0],
  [926,316,192,224,"conifer_snow","green",16],
  [1120,316,127,214,"conifer","green",3],
  [1249,316,127,214,"conifer_snow","green",19],
  [1378,316,112,203,"tree","green",9],
  [1492,316,112,203,"tree","brown",9],
  [1606,316,112,203,"tree","orange",9],
  [1720,316,112,203,"tree","pale",9],
  [1834,316,112,203,"tree","dead",8],
  [0,616,128,190,"tree","green",41],
  [130,616,128,190,"tree","brown",41],
  [260,616,128,190,"tree","orange",41],
  [390,616,128,190,"tree","pale",41],
  [520,616,170,189,"tree","green",35],
  [692,616,170,189,"tree","brown",35],
  [864,616,170,189,"tree","orange",35],
  [1036,616,170,189,"tree","pale",35],
  [1208,616,170,189,"tree","dead",32],
  [1380,616,160,189,"tree","green",36],
  [1542,616,160,189,"tree","brown",36],
  [1704,616,160,189,"tree","orange",36],
  [1866,616,160,189,"tree","pale",36],
  [0,808,160,189,"tree","dead",33],
  [162,808,165,188,"tree","green",34],
  [329,808,165,188,"tree","brown",34],
  [496,808,165,188,"tree","orange",34],
  [663,808,165,188,"tree","pale",34],
  [830,808,165,188,"tree","dead",31],
  [997,808,106,183,"tree","dead",38],
  [1105,808,113,179,"tree","green",42],
  [1220,808,113,179,"tree","brown",42],
  [1335,808,113,179,"tree","orange",42],
  [1450,808,113,179,"tree","pale",42],
  [1565,808,154,170,"tree","green",38],
  [1721,808,154,170,"tree","brown",38],
  [1877,808,154,170,"tree","orange",38],
  [0,999,154,170,"tree","pale",38],
  [156,999,154,170,"tree","dead",34],
  [312,999,150,169,"tree","green",39],
  [464,999,150,169,"tree","brown",39],
  [616,999,150,169,"tree","orange",39],
  [768,999,150,169,"tree","pale",39],
  [920,999,127,165,"tree","green",37],
  [1049,999,127,165,"tree","brown",37],
  [1178,999,127,165,"tree","orange",37],
  [1307,999,127,165,"tree","pale",37],
  [1436,999,93,159,"tree","green",26],
  [1531,999,93,159,"tree","brown",26],
  [1626,999,93,159,"tree","orange",26],
  [1721,999,93,159,"tree","pale",26],
  [1816,999,172,158,"tree","green",28],
  [0,1171,172,158,"tree","brown",29],
  [174,1171,172,158,"tree","orange",28],
  [348,1171,172,158,"tree","pale",28],
  [522,1171,74,158,"conifer","green",2],
  [598,1171,74,158,"conifer_snow","green",18],
  [674,1171,82,157,"conifer","green",1],
  [758,1171,82,157,"conifer_snow","green",17],
  [842,1171,160,156,"tree","green",29],
  [1004,1171,160,156,"tree","brown",30],
  [1166,1171,160,156,"tree","orange",29],
  [1328,1171,160,156,"tree","pale",29],
  [1490,1171,128,156,"tree","dead",35],
  [1620,1171,73,154,"conifer","green",4],
  [1695,1171,73,154,"conifer_snow","green",20],
  [1770,1171,125,151,"tree","green",27],
  [1897,1171,125,151,"tree","brown",27],
  [0,1331,125,151,"tree","orange",27],
  [127,1331,125,151,"tree","pale",27],
  [254,1331,94,150,"tree","dead",23],
  [350,1331,92,150,"tree","dead",40],
  [444,1331,61,150,"tree","brown",28],
  [507,1331,61,150,"tree","dead",22],
  [570,1331,63,149,"tree","green",31],
  [635,1331,63,149,"tree","orange",31],
  [700,1331,63,149,"tree","pale",31],
  [765,1331,63,149,"conifer","green",5],
  [830,1331,63,149,"conifer_snow","green",21],
  [895,1331,139,148,"tree","dead",36],
  [1036,1331,62,145,"tree","green",30],
  [1100,1331,62,145,"tree","brown",31],
  [1164,1331,62,145,"tree","orange",30],
  [1228,1331,62,145,"tree","pale",30],
  [1292,1331,127,142,"tree","dead",26],
  [1421,1331,95,140,"tree","dead",27],
  [1518,1331,54,140,"tree","dead",25],
  [1574,1331,104,138,"tree","green",32],
  [1680,1331,104,138,"tree","brown",32],
  [1786,1331,104,138,"tree","orange",32],
  [1892,1331,104,138,"tree","pale",32],
  [0,1484,94,137,"tree","green",25],
  [96,1484,94,137,"tree","brown",25],
  [192,1484,94,137,"tree","orange",25],
  [288,1484,94,137,"tree","pale",25],
  [384,1484,123,133,"tree","dead",24],
  [509,1484,120,128,"tree","green",21],
  [631,1484,120,128,"tree","brown",21],
  [753,1484,120,128,"tree","orange",21],
  [875,1484,120,128,"tree","pale",21],
  [997,1484,107,128,"tree","green",18],
  [1106,1484,107,128,"tree","brown",18],
  [1215,1484,107,128,"tree","orange",18],
  [1324,1484,107,128,"tree","pale",18],
  [1433,1484,89,128,"tree","green",17],
  [1524,1484,89,128,"tree","brown",17],
  [1615,1484,89,128,"tree","orange",17],
  [1706,1484,89,128,"tree","pale",17],
  [1797,1484,64,128,"tree","green",11],
  [1863,1484,64,128,"tree","brown",11],
  [1929,1484,64,128,"tree","orange",11],
  [0,1623,64,128,"tree","pale",11],
  [66,1623,115,127,"tree","green",20],
  [183,1623,115,127,"tree","brown",20],
  [300,1623,115,127,"tree","orange",20],
  [417,1623,115,127,"tree","pale",20],
  [534,1623,94,127,"tree","green",19],
  [630,1623,94,127,"tree","brown",19],
  [726,1623,94,127,"tree","orange",19],
  [822,1623,94,127,"tree","pale",19],
  [918,1623,89,126,"tree","green",22],
  [1009,1623,89,126,"tree","brown",22],
  [1100,1623,89,126,"tree","orange",22],
  [1191,1623,89,126,"tree","pale",22],
  [1282,1623,96,125,"tree","dead",15],
  [1380,1623,123,124,"tree","dead",16],
  [1505,1623,96,122,"tree","green",14],
  [1603,1623,96,122,"tree","brown",14],
  [1701,1623,96,122,"tree","orange",14],
  [1799,1623,96,122,"tree","pale",14],
  [1897,1623,93,122,"tree","dead",17],
  [0,1753,96,120,"tree","green",12],
  [98,1753,96,120,"tree","brown",12],
  [196,1753,96,120,"tree","orange",12],
  [294,1753,96,120,"tree","pale",12],
  [392,1753,96,120,"tree","dead",9],
  [490,1753,88,120,"tree","green",23],
  [580,1753,88,120,"tree","brown",23],
  [670,1753,88,120,"tree","orange",23],
  [760,1753,88,120,"tree","pale",23],
  [850,1753,82,120,"tree","dead",18],
  [934,1753,101,119,"tree","dead",19],
  [1037,1753,95,118,"tree","green",15],
  [1134,1753,95,118,"tree","brown",15],
  [1231,1753,95,118,"tree","orange",15],
  [1328,1753,95,118,"tree","pale",15],
  [1425,1753,131,117,"tree","dead",28],
  [1558,1753,64,117,"tree","dead",10],
  [1624,1753,63,117,"tree","green",13],
  [1689,1753,63,117,"tree","brown",13],
  [1754,1753,63,117,"tree","orange",13],
  [1819,1753,63,117,"tree","pale",13],
  [1884,1753,108,111,"tree","dead",20],
  [1994,1753,50,111,"tree","green",24],
  [0,1875,50,111,"tree","brown",24],
  [52,1875,50,111,"tree","orange",24],
  [104,1875,50,111,"tree","pale",24],
  [156,1875,86,107,"tree","dead",21],
  [244,1875,83,106,"tree","green",16],
  [329,1875,83,106,"tree","brown",16],
  [414,1875,83,106,"tree","orange",16],
  [499,1875,83,106,"tree","pale",16],
  [584,1875,76,99,"tree","dead",29],
  [662,1875,128,97,"tree","green",2],
  [792,1875,128,97,"tree","brown",2],
  [922,1875,128,97,"tree","orange",2],
  [1052,1875,128,97,"tree","pale",2],
  [1182,1875,128,96,"tree","dead",2],
  [1312,1875,64,96,"tree","green",1],
  [1378,1875,64,96,"tree","brown",1],
  [1444,1875,64,96,"tree","orange",1],
  [1510,1875,64,96,"tree","pale",1],
  [1576,1875,64,96,"tree","dead",1],
  [1642,1875,58,96,"tree","green",0],
  [1702,1875,58,96,"tree","brown",0],
  [1762,1875,58,96,"tree","orange",0],
  [1822,1875,58,96,"tree","pale",0],
  [1882,1875,60,95,"conifer","green",9],
  [1944,1875,60,95,"conifer_snow","green",25],
  [0,1988,58,93,"tree","green",4],
  [60,1988,58,93,"tree","brown",4],
  [120,1988,58,93,"tree","orange",4],
  [180,1988,58,93,"tree","pale",4],
  [240,1988,83,92,"tree","green",3],
  [325,1988,83,92,"tree","brown",3],
  [410,1988,83,92,"tree","orange",3],
  [495,1988,83,92,"tree","pale",3],
  [580,1988,83,92,"tree","dead",3],
  [665,1988,95,91,"tree","dead",13],
  [762,1988,87,91,"tree","dead",12],
  [851,1988,58,87,"bush","green",216],
  [911,1988,84,81,"bush","dead",11],
  [997,1988,94,80,"bush","green",33],
  [1093,1988,94,80,"bush","brown",33],
  [1189,1988,94,80,"bush","orange",33],
  [1285,1988,94,80,"bush","pale",33],
  [1381,1988,64,80,"bush","green",7],
  [1447,1988,64,80,"bush","brown",7],
  [1513,1988,64,80,"bush","orange",7],
  [1579,1988,64,80,"bush","pale",7],
  [1645,1988,64,80,"bush","dead",6],
  [1711,1988,58,80,"bush","dead",14],
  [1771,1988,38,80,"conifer","green",10],
  [1811,1988,38,80,"conifer_snow","green",26],
  [1851,1988,56,78,"conifer","green",6],
  [1909,1988,56,78,"conifer_snow","green",22],
  [1967,1988,52,64,"bush","dead",0],
  [0,2083,36,64,"conifer","green",11],
  [38,2083,36,64,"conifer_snow","green",27],
  [76,2083,32,64,"bush","green",212],
  [110,2083,29,64,"bush","green",211],
  [141,2083,64,63,"bush","green",38],
  [207,2083,47,62,"bush","green",108],
  [256,2083,32,62,"bush","green",208],
  [290,2083,28,62,"bush","green",203],
  [320,2083,61,61,"bush","green",234],
  [383,2083,31,60,"conifer","green",12],
  [416,2083,31,60,"conifer_snow","green",28],
  [449,2083,30,60,"bush","green",214],
  [481,2083,29,60,"bush","green",191],
  [512,2083,62,59,"bush","green",297],
  [576,2083,36,59,"bush","green",314],
  [614,2083,32,59,"bush","green",315],
  [648,2083,30,59,"conifer","green",13],
  [680,2083,30,59,"conifer_snow","green",29],
  [712,2083,63,58,"bush","green",302],
  [777,2083,55,58,"bush","green",5],
  [834,2083,55,58,"bush","brown",5],
  [891,2083,55,58,"bush","orange",5],
  [948,2083,55,58,"bush","pale",5],
  [1005,2083,55,58,"bush","dead",4],
  [1062,2083,32,58,"bush","green",292],
  [1096,2083,26,58,"bush","green",257],
  [1124,2083,54,57,"bush","green",238],
  [1180,2083,36,57,"bush","green",298],
  [1218,2083,22,56,"bush","green",317],
  [1242,2083,22,56,"bush","green",318],
  [1266,2083,32,55,"bush","green",210],
  [1300,2083,48,54,"bush","green",6],
  [1350,2083,48,54,"bush","brown",6],
  [1400,2083,48,54,"bush","orange",6],
  [1450,2083,48,54,"bush","pale",6],
  [1500,2083,48,54,"bush","dead",5],
  [1550,2083,28,53,"bush","green",193],
  [1580,2083,28,53,"bush","green",194],
  [1610,2083,28,52,"bush","green",239],
  [1640,2083,64,51,"bush","green",153],
  [1706,2083,25,51,"bush","green",262],
  [1733,2083,59,50,"bush","green",259],
  [1794,2083,59,50,"bush","green",282],
  [1855,2083,43,50,"bush","green",8],
  [1900,2083,43,50,"bush","brown",8],
  [1945,2083,43,50,"bush","orange",8],
  [1990,2083,43,50,"bush","pale",8],
  [0,2149,43,50,"bush","dead",7],
  [45,2149,24,49,"bush","green",303],
  [71,2149,19,49,"bush","green",213],
  [92,2149,61,47,"bush","green",261],
  [155,2149,61,47,"bush","green",286],
  [218,2149,27,47,"bush","green",195],
  [247,2149,32,46,"conifer","green",7],
  [281,2149,32,46,"conifer","green",8],
  [315,2149,32,46,"conifer_snow","green",23],
  [349,2149,32,46,"conifer_snow","green",24],
  [383,2149,34,45,"bush","green",319],
  [419,2149,21,45,"bush","green",320],
  [442,2149,30,42,"conifer","green",14],
  [474,2149,30,42,"conifer_snow","green",30],
  [506,2149,50,41,"bush","green",294],
  [558,2149,33,41,"plant","green",248],
  [593,2149,59,40,"bush","green",264],
  [654,2149,59,40,"bush","green",287],
  [715,2149,32,40,"plant","green",312],
  [749,2149,31,40,"plant","green",322],
  [782,2149,19,38,"plant","green",246],
  [803,2149,12,35,"plant","green",219],
  [817,2149,64,32,"bush","green",277],
  [883,2149,37,32,"plant","green",249],
  [922,2149,32,32,"rock","gray",0],
  [956,2149,32,32,"rock","gray",1],
  [990,2149,32,32,"plant","green",296],
  [1024,2149,28,32,"plant","green",202],
  [1054,2149,28,32,"plant","green",323],
  [1084,2149,23,32,"conifer","green",15],
  [1109,2149,23,32,"conifer_snow","green",31],
  [1134,2149,96,31,"bush","green",313],
  [1232,2149,64,31,"bush","green",176],
  [1298,2149,62,31,"bush","green",189],
  [1362,2149,30,31,"plant","green",188],
  [1394,2149,26,31,"plant","green",235],
  [1422,2149,22,31,"plant","green",190],
  [1446,2149,17,31,"plant","green",295],
  [1465,2149,29,30,"plant","green",236],
  [1496,2149,28,30,"plant","green",266],
  [1526,2149,20,30,"plant","green",276],
  [1548,2149,33,29,"plant","green",265],
  [1583,2149,28,29,"plant","green",254],
  [1613,2149,28,29,"plant","green",255],
  [1643,2149,28,29,"plant","green",256],
  [1673,2149,24,29,"plant","green",178],
  [1699,2149,32,28,"plant","green",324],
  [1733,2149,30,28,"plant","green",215],
  [1765,2149,29,28,"plant","green",204],
  [1796,2149,29,28,"plant","green",281],
  [1827,2149,29,28,"plant","green",289],
  [1858,2149,28,28,"plant","green",279],
  [1888,2149,23,28,"plant","green",316],
  [1913,2149,16,28,"plant","green",177],
  [1931,2149,15,28,"plant","green",9],
  [1948,2149,15,28,"plant","green",16],
  [1965,2149,15,28,"plant","green",17],
  [1982,2149,15,28,"plant","green",18],
  [0,2201,63,27,"bush","green",179],
  [65,2201,30,27,"plant","green",192],
  [97,2201,31,26,"plant","green",126],
  [130,2201,31,26,"plant","green",290],
  [163,2201,31,26,"plant","green",301],
  [196,2201,28,26,"plant","green",164],
  [226,2201,28,26,"plant","green",184],
  [256,2201,28,26,"plant","green",227],
  [286,2201,27,26,"plant","green",133],
  [315,2201,19,26,"plant","green",258],
  [336,2201,59,25,"bush","green",283],
  [397,2201,43,25,"bush","green",310],
  [442,2201,32,25,"plant","green",127],
  [476,2201,32,25,"plant","green",148],
  [510,2201,28,25,"plant","green",288],
  [540,2201,27,25,"plant","green",167],
  [569,2201,25,25,"plant","green",230],
  [596,2201,18,25,"plant","green",82],
  [616,2201,59,24,"bush","green",293],
  [677,2201,32,24,"plant","green",97],
  [711,2201,32,24,"plant","green",185],
  [745,2201,32,24,"plant","green",209],
  [779,2201,29,24,"plant","green",109],
  [810,2201,29,24,"plant","green",110],
  [841,2201,29,24,"plant","green",131],
  [872,2201,29,24,"plant","green",132],
  [903,2201,20,24,"plant","green",81],
  [925,2201,17,24,"plant","green",63],
  [944,2201,13,24,"plant","green",41],
  [959,2201,13,24,"plant","green",42],
  [974,2201,13,24,"plant","green",43],
  [989,2201,13,24,"plant","green",44],
  [1004,2201,28,23,"plant","green",149],
  [1034,2201,28,23,"plant","green",305],
  [1064,2201,27,23,"plant","green",272],
  [1093,2201,17,23,"plant","green",96],
  [1112,2201,32,22,"plant","green",311],
  [1146,2201,27,22,"plant","green",80],
  [1175,2201,27,22,"plant","green",83],
  [1204,2201,27,22,"plant","green",84],
  [1233,2201,27,22,"plant","green",85],
  [1262,2201,16,22,"plant","green",0],
  [1280,2201,16,22,"plant","green",1],
  [1298,2201,16,22,"plant","green",26],
  [1316,2201,16,22,"plant","green",50],
  [1334,2201,16,22,"plant","green",51],
  [1352,2201,16,22,"plant","green",52],
  [1370,2201,16,22,"plant","green",53],
  [1388,2201,16,22,"plant","green",65],
  [1406,2201,15,22,"plant","green",64],
  [1423,2201,15,22,"plant","green",66],
  [1440,2201,15,22,"plant","green",67],
  [1457,2201,40,21,"bush","green",321],
  [1499,2201,32,21,"plant","green",291],
  [1533,2201,28,21,"plant","green",306],
  [1563,2201,27,21,"plant","green",225],
  [1592,2201,27,21,"plant","green",300],
  [1621,2201,26,21,"plant","green",86],
  [1649,2201,23,21,"plant","green",299],
  [1674,2201,16,21,"plant","green",165],
  [1692,2201,16,21,"plant","green",224],
  [1710,2201,16,21,"plant","green",231],
  [1728,2201,14,21,"plant","green",10],
  [1744,2201,14,21,"plant","green",23],
  [1760,2201,14,21,"plant","green",24],
  [1776,2201,14,21,"plant","green",25],
  [1792,2201,30,20,"plant","green",111],
  [1824,2201,30,20,"plant","green",112],
  [1856,2201,30,20,"plant","green",135],
  [1888,2201,30,20,"plant","green",136],
  [1920,2201,23,20,"plant","green",134],
  [1945,2201,22,20,"plant","green",263],
  [1969,2201,15,20,"plant","green",260],
  [1986,2201,13,20,"plant","green",232],
  [2001,2201,10,20,"plant","green",325],
  [2013,2201,25,19,"plant","green",284],
  [0,2230,22,19,"plant","green",307],
  [24,2230,21,19,"plant","green",144],
  [47,2230,21,19,"plant","green",173],
  [70,2230,19,19,"plant","green",147],
  [91,2230,19,19,"plant","green",166],
  [112,2230,17,19,"plant","green",151],
  [131,2230,16,19,"plant","green",228],
  [149,2230,12,19,"plant","green",217],
  [163,2230,8,19,"plant","green",15],
  [173,2230,8,19,"plant","green",31],
  [183,2230,8,19,"plant","green",32],
  [193,2230,8,19,"plant","green",33],
  [203,2230,51,18,"bush","green",309],
  [256,2230,18,18,"plant","green",94],
  [276,2230,18,18,"plant","green",95],
  [296,2230,18,18,"plant","green",98],
  [316,2230,15,18,"plant","green",240],
  [333,2230,15,18,"plant","green",241],
  [350,2230,15,18,"plant","green",242],
  [367,2230,32,17,"plant","green",196],
  [401,2230,31,17,"plant","green",197],
  [434,2230,26,17,"plant","green",206],
  [462,2230,26,17,"plant","green",207],
  [490,2230,18,17,"plant","green",142],
  [510,2230,17,17,"plant","green",186],
  [529,2230,17,17,"plant","green",218],
  [548,2230,17,17,"plant","green",271],
  [567,2230,16,17,"plant","green",220],
  [585,2230,15,17,"plant","green",243],
  [602,2230,15,17,"plant","green",244],
  [619,2230,15,17,"plant","green",245],
  [636,2230,13,17,"plant","green",229],
  [651,2230,8,17,"plant","green",3],
  [661,2230,8,17,"plant","green",5],
  [671,2230,22,16,"plant","green",199],
  [695,2230,20,16,"plant","green",285],
  [717,2230,18,16,"plant","green",58],
  [737,2230,18,16,"plant","green",59],
  [757,2230,18,16,"plant","green",60],
  [777,2230,18,16,"plant","green",61],
  [797,2230,18,16,"plant","green",150],
  [817,2230,18,16,"plant","green",161],
  [837,2230,18,16,"plant","green",174],
  [857,2230,17,16,"plant","green",117],
  [876,2230,16,16,"plant","green",91],
  [894,2230,16,16,"plant","green",92],
  [912,2230,16,16,"plant","green",93],
  [930,2230,16,16,"plant","green",102],
  [948,2230,16,16,"plant","green",103],
  [966,2230,16,16,"plant","green",104],
  [984,2230,16,16,"plant","green",116],
  [1002,2230,16,16,"plant","green",278],
  [1020,2230,16,16,"plant","green",304],
  [1038,2230,15,16,"plant","green",114],
  [1055,2230,15,16,"plant","green",118],
  [1072,2230,15,16,"plant","green",124],
  [1089,2230,12,16,"plant","green",156],
  [1103,2230,9,16,"plant","green",138],
  [1114,2230,8,16,"plant","green",226],
  [1124,2230,19,15,"plant","green",87],
  [1145,2230,19,15,"plant","green",88],
  [1166,2230,18,15,"plant","green",143],
  [1186,2230,17,15,"plant","green",152],
  [1205,2230,16,15,"plant","green",168],
  [1223,2230,16,15,"plant","green",198],
  [1241,2230,14,15,"plant","green",273],
  [1257,2230,14,15,"plant","green",274],
  [1273,2230,9,15,"plant","green",163],
  [1284,2230,9,15,"plant","green",183],
  [1295,2230,28,14,"plant","green",159],
  [1325,2230,20,14,"plant","green",72],
  [1347,2230,20,14,"plant","green",73],
  [1369,2230,20,14,"plant","green",74],
  [1391,2230,20,14,"plant","green",75],
  [1413,2230,19,14,"plant","green",237],
  [1434,2230,19,14,"plant","green",253],
  [1455,2230,16,14,"plant","green",2],
  [1473,2230,16,14,"plant","green",6],
  [1491,2230,16,14,"plant","green",7],
  [1509,2230,16,14,"plant","green",19],
  [1527,2230,16,14,"plant","green",20],
  [1545,2230,16,14,"plant","green",34],
  [1563,2230,16,14,"plant","green",35],
  [1581,2230,16,14,"plant","green",47],
  [1599,2230,16,14,"plant","green",48],
  [1617,2230,16,14,"plant","green",76],
  [1635,2230,15,14,"plant","green",119],
  [1652,2230,15,14,"plant","green",120],
  [1669,2230,14,14,"plant","green",55],
  [1685,2230,14,14,"plant","green",56],
  [1701,2230,14,14,"plant","green",57],
  [1717,2230,14,14,"plant","green",62],
  [1733,2230,14,14,"plant","green",99],
  [1749,2230,14,14,"plant","green",100],
  [1765,2230,14,14,"plant","green",101],
  [1781,2230,14,14,"plant","green",105],
  [1797,2230,14,14,"plant","green",125],
  [1813,2230,14,14,"plant","green",128],
  [1829,2230,14,14,"plant","green",129],
  [1845,2230,14,14,"plant","green",130],
  [1861,2230,13,14,"plant","green",154],
  [1876,2230,11,14,"plant","green",181],
  [1889,2230,19,13,"plant","green",250],
  [1910,2230,19,13,"plant","green",251],
  [1931,2230,19,13,"plant","green",252],
  [1952,2230,17,13,"plant","green",247],
  [1971,2230,15,13,"plant","green",171],
  [1988,2230,15,13,"plant","green",180],
  [2005,2230,14,13,"plant","green",280],
  [2021,2230,13,13,"plant","green",21],
  [0,2251,13,13,"plant","green",113],
  [15,2251,13,13,"plant","green",115],
  [30,2251,13,13,"plant","green",121],
  [45,2251,13,13,"plant","green",122],
  [60,2251,13,13,"plant","green",137],
  [75,2251,13,13,"plant","green",139],
  [90,2251,13,13,"plant","green",140],
  [105,2251,13,13,"plant","green",141],
  [120,2251,13,13,"plant","green",157],
  [135,2251,12,13,"plant","green",123],
  [149,2251,12,13,"plant","green",169],
  [163,2251,11,13,"plant","green",27],
  [176,2251,11,13,"plant","green",28],
  [189,2251,11,13,"plant","green",29],
  [202,2251,11,13,"plant","green",30],
  [215,2251,11,13,"plant","green",54],
  [228,2251,11,13,"plant","green",68],
  [241,2251,11,13,"plant","green",69],
  [254,2251,11,13,"plant","green",70],
  [267,2251,11,13,"plant","green",71],
  [280,2251,11,13,"plant","green",269],
  [293,2251,11,13,"plant","green",270],
  [306,2251,8,13,"plant","green",233],
  [316,2251,16,12,"plant","green",8],
  [334,2251,16,12,"plant","green",49],
  [352,2251,16,12,"plant","green",205],
  [370,2251,15,12,"plant","green",308],
  [387,2251,14,12,"plant","green",275],
  [403,2251,13,12,"plant","green",155],
  [418,2251,12,12,"plant","green",145],
  [432,2251,12,12,"plant","green",146],
  [446,2251,12,12,"plant","green",158],
  [460,2251,12,12,"plant","green",221],
  [474,2251,12,12,"plant","green",222],
  [488,2251,16,11,"plant","green",170],
  [506,2251,14,11,"plant","green",13],
  [522,2251,14,11,"plant","green",14],
  [538,2251,14,11,"plant","green",36],
  [554,2251,14,11,"plant","green",40],
  [570,2251,13,11,"plant","green",11],
  [585,2251,13,11,"plant","green",12],
  [600,2251,13,11,"plant","green",39],
  [615,2251,13,11,"plant","green",45],
  [630,2251,13,11,"plant","green",46],
  [645,2251,10,11,"plant","green",267],
  [657,2251,10,11,"plant","green",268],
  [669,2251,16,10,"plant","green",4],
  [687,2251,16,10,"plant","green",22],
  [705,2251,16,10,"plant","green",37],
  [723,2251,10,10,"plant","green",77],
  [735,2251,10,10,"plant","green",78],
  [747,2251,10,10,"plant","green",79],
  [1810,2643,94,62,"barrel","brown",400,"wood group"],
  [938,2643,26,75,"barrel","brown",401,"tall wood"],
  [323,2818,21,24,"barrel","wood",402,"wooden barrel"],
  [1198,2272,303,127,"boat","brown",403,"wooden rowboats"],
  [0,2643,99,80,"bush","green",404,"round green"],
  [738,2643,78,78,"bush","green",405,"round green bush"],
  [818,2643,78,78,"bush","green",406,"dark green bush"],
  [1042,2643,75,71,"bush","green",407,"light green bush"],
  [1681,2725,93,33,"bush","green",408,"small leafy"],
  [1417,2784,57,28,"bush","green",409,"leafy cluster"],
  [75,2844,24,15,"bush","green",410,"low broad leaves"],
  [1609,2818,13,17,"bush","green",411,"green bush"],
  [780,2844,11,7,"bush","green",412,"green leafy"],
  [88,2725,80,55,"cart","yellow",413,"hay and tools"],
  [858,2725,64,45,"cart","brown",414,"wood flatbed"],
  [248,2272,183,236,"cherry","pink",415,"pink cherry tree"],
  [433,2272,107,236,"cherry","pink",416,"pink cherry blossom"],
  [762,2272,63,147,"conifer","green",417,"tall pine tree"],
  [1131,2516,85,91,"conifer","green",418,"green pine"],
  [542,2272,58,235,"crop","gold",419,"tall corn stalks"],
  [1842,2725,64,33,"crop","green",420,"leafy plants"],
  [1031,2784,24,32,"crop","orange",421,"carrot with top"],
  [515,2818,26,23,"crop","orange",422,"carrot root"],
  [1516,2818,20,17,"crop","gold",423,"yellow leafy plant"],
  [2011,2818,17,16,"crop","green",424,"cucumber"],
  [1123,2818,12,20,"crop","green",425,"tall green plant"],
  [1053,2516,76,92,"dead_tree","dead",426,"bare dead tree"],
  [932,2272,80,128,"decal","brown",427,"dirt cliff edge"],
  [1096,2272,64,128,"decal","brown",428,"dirt cliff edge"],
  [0,2516,65,125,"decal","brown",429,"brown cliff"],
  [67,2516,65,125,"decal","green",430,"tan cliff"],
  [539,2516,63,119,"decal","brown",431,"brown cliff edge"],
  [251,2643,81,79,"decal","brown",432,"dirt hole"],
  [334,2643,81,79,"decal","green",433,"dark hole"],
  [417,2643,81,79,"decal","brown",434,"dirt hole"],
  [500,2643,81,79,"decal","green",435,"lava pool"],
  [583,2643,81,79,"decal","green",436,"water pond"],
  [666,2643,70,79,"decal","brown",437,"wooden plank floor"],
  [170,2725,71,55,"decal","brown",438,"wooden planks"],
  [1180,2643,48,71,"decal","brown",439,"wood flooring"],
  [1230,2643,48,71,"decal","green",440,"floor with cloth"],
  [0,2784,96,32,"decal","green",441,"water strip"],
  [1585,2516,29,86,"decal","brown",442,"vertical wood"],
  [323,2784,32,32,"decal","brown",443,"plowed soil"],
  [357,2784,32,32,"decal","brown",444,"plowed soil alt"],
  [391,2784,32,32,"decal","yellow",445,"wheat field"],
  [425,2784,32,32,"decal","yellow",446,"wheat field 2"],
  [459,2784,32,32,"decal","yellow",447,"wheat sparse"],
  [493,2784,32,32,"decal","green",448,"young wheat"],
  [527,2784,32,32,"decal","green",449,"young wheat 2"],
  [561,2784,32,32,"decal","green",450,"tall grass"],
  [595,2784,32,32,"decal","green",451,"tall grass edge"],
  [629,2784,32,32,"decal","yellow",452,"sand fill"],
  [663,2784,32,32,"decal","yellow",453,"sand/water"],
  [697,2784,32,32,"decal","green",454,"reed field"],
  [481,2818,32,23,"decal","green",455,"cobweb corner"],
  [1895,2784,22,25,"decal","brown",456,"dirt pit patch"],
  [1919,2784,22,25,"decal","green",457,"dark hole patch"],
  [1943,2784,22,25,"decal","brown",458,"dirt patch"],
  [1967,2784,22,25,"decal","green",459,"water pool"],
  [762,2818,24,21,"decal","brown",460,"wooden boards"],
  [1270,2818,26,18,"decal","brown",461,"dirt mound"],
  [515,2844,44,10,"decal","brown",462,"wooden double plank"],
  [805,2725,8,47,"decal","brown",463,"vertical wooden plank"],
  [1219,2818,19,19,"decal","gray",464,"grey cog-shaped tile"],
  [1538,2818,17,17,"decal","green",465,"tan square"],
  [1971,2818,18,16,"decal","brown",466,"diagonal wooden plank"],
  [1991,2818,18,16,"decal","brown",467,"diagonal wooden plank"],
  [19,2844,16,16,"decal","green",468,"round grate tile"],
  [161,2844,15,15,"decal","gray",469,"grey gear tile"],
  [327,2844,13,13,"decal","gray",470,"grey stone tile"],
  [663,2844,18,9,"decal","gray",471,"gray oval rocks"],
  [683,2844,16,9,"decal","brown",472,"wooden plank floor"],
  [701,2844,15,9,"decal","brown",473,"dirt patch"],
  [241,2844,9,14,"decal","green",474,"dark angled patch"],
  [793,2844,10,7,"decal","brown",475,"brown pebbles"],
  [805,2844,10,7,"decal","green",476,"dark pebbles"],
  [817,2844,11,6,"decal","green",477,"tan pebbles"],
  [830,2844,11,6,"decal","gray",478,"grey pebbles"],
  [602,2272,96,190,"fence","iron",479,"tall iron fence"],
  [1322,2516,159,87,"fence","wood",480,"wooden fence gate"],
  [232,2516,72,122,"fence","wood",481,"wood ladder"],
  [306,2516,72,122,"fence","wood",482,"wood slat"],
  [1690,2516,48,83,"fence","wood",483,"wooden fence"],
  [1740,2516,48,83,"fence","rope",484,"rope barrier"],
  [1640,2784,128,25,"fence","wood",485,"low wood"],
  [1439,2725,78,37,"fence","rope",486,"wood with rope"],
  [346,2818,72,23,"fence","wood",487,"wood rail"],
  [833,2784,32,32,"fence","wood",488,"fence rail"],
  [867,2784,32,32,"fence","wood",489,"fence gate"],
  [901,2784,32,32,"fence","wood",490,"fence post"],
  [935,2784,32,32,"fence","iron",491,"iron fence rail"],
  [969,2784,32,32,"fence","iron",492,"iron gate"],
  [1776,2725,64,33,"fruit_tree","green",493,"fruit tree"],
  [1547,2725,26,36,"fruit_tree","green",494,"tall fruit tree"],
  [1575,2725,26,36,"fruit_tree","green",495,"fruit tree"],
  [707,2516,124,105,"furniture","green",496,"tiled counter"],
  [134,2516,96,123,"furniture","green",497,"stove with kettle"],
  [604,2516,101,106,"furniture","brown",498,"wooden table"],
  [700,2272,60,149,"furniture","green",499,"small bed"],
  [965,2516,86,95,"furniture","green",500,"curtained window"],
  [1818,2516,93,82,"furniture","green",501,"double bed"],
  [1592,2643,88,64,"furniture","green",502,"table and chairs"],
  [1682,2643,74,64,"furniture","green",503,"large bed"],
  [1376,2643,64,68,"furniture","brown",504,"wooden cabinets"],
  [1913,2516,48,82,"furniture","red",505,"single bed red"],
  [1963,2516,48,81,"furniture","gray",506,"single bed blue"],
  [167,2643,48,80,"furniture","red",507,"red wardrobe"],
  [0,2818,76,24,"furniture","white",508,"white bench"],
  [60,2725,26,56,"furniture","brown",509,"wooden high chair"],
  [1603,2725,26,36,"furniture","brown",510,"wooden chair"],
  [1003,2784,26,32,"furniture","brown",511,"wood bench"],
  [1198,2784,27,30,"furniture","green",512,"cauldron pot"],
  [1083,2784,22,32,"furniture","green",513,"curved chair"],
  [1107,2784,22,32,"furniture","green",514,"curved chair"],
  [1131,2784,22,32,"furniture","green",515,"fancy chair"],
  [1155,2784,22,32,"furniture","green",516,"fancy chair"],
  [1584,2784,26,27,"furniture","green",517,"bench seat"],
  [1612,2784,26,27,"furniture","green",518,"bench back"],
  [143,2818,26,24,"furniture","brown",519,"wood table"],
  [1179,2784,17,32,"furniture","green",520,"grandfather clock"],
  [1240,2818,28,18,"furniture","brown",521,"wood board"],
  [1010,2818,22,20,"furniture","gray",522,"blue bowl"],
  [1858,2818,22,16,"furniture","brown",523,"wooden chair"],
  [1882,2818,22,16,"furniture","brown",524,"wooden bench"],
  [0,2725,58,57,"good","green",525,"sushi platter"],
  [309,2725,52,55,"good","green",526,"basket of bread"],
  [610,2725,56,49,"good","gray",527,"grey fish"],
  [717,2725,55,48,"good","green",528,"green fish"],
  [668,2725,47,49,"good","green",529,"green fish"],
  [815,2725,41,46,"good","red",530,"red meat chunks"],
  [1631,2725,48,34,"good","green",531,"raw ham hock"],
  [1271,2784,48,29,"good","gray",532,"blue fish"],
  [1321,2784,48,29,"good","gray",533,"blue fish"],
  [420,2818,59,23,"good","red",534,"red sushi rolls"],
  [1476,2784,48,28,"good","gray",535,"blue fish"],
  [1371,2784,44,29,"good","green",536,"raw steak"],
  [1526,2784,34,28,"good","red",537,"red sushi rolls"],
  [112,2818,29,24,"good","green",538,"raw meat"],
  [1838,2784,27,25,"good","green",539,"ham hock"],
  [698,2818,31,21,"good","green",540,"roast chicken"],
  [731,2818,29,21,"good","green",541,"green melon"],
  [171,2818,25,24,"good","orange",542,"orange fruit"],
  [198,2818,25,24,"good","green",543,"pumpkin head"],
  [1662,2818,36,16,"good","green",544,"green fish"],
  [1700,2818,36,16,"good","green",545,"green fish"],
  [1333,2818,32,17,"good","green",546,"small fish"],
  [37,2844,36,15,"good","green",547,"green fish"],
  [1137,2818,28,19,"good","green",548,"raw meat"],
  [604,2818,24,22,"good","green",549,"watermelon"],
  [1367,2818,31,17,"good","green",550,"spotted fish"],
  [1738,2818,32,16,"good","green",551,"whole green fish"],
  [543,2818,22,23,"good","red",552,"red tomato"],
  [957,2818,25,20,"good","red",553,"red radish"],
  [1167,2818,26,19,"good","green",554,"cooked drumsticks"],
  [630,2818,22,22,"good","green",555,"sushi rolls"],
  [984,2818,24,20,"good","purple",556,"purple eggplant"],
  [1772,2818,29,16,"good","red",557,"red raw meat"],
  [812,2818,22,21,"good","green",558,"ginger cluster"],
  [1803,2818,28,16,"good","green",559,"sushi platter"],
  [654,2818,20,22,"good","brown",560,"brown onion"],
  [676,2818,20,22,"good","green",561,"green pepper"],
  [1034,2818,22,20,"good","yellow",562,"banana squash"],
  [1058,2818,22,20,"good","orange",563,"orange fruit"],
  [567,2818,19,23,"good","green",564,"green pear"],
  [1195,2818,22,19,"good","red",565,"red strawberry"],
  [1082,2818,20,20,"good","green",566,"green pea pod"],
  [879,2818,19,21,"good","red",567,"red cherries"],
  [1400,2818,22,17,"good","gray",568,"blue fish"],
  [1833,2818,23,16,"good","brown",569,"brown potato"],
  [1424,2818,21,17,"good","yellow",570,"yellow lemon"],
  [1447,2818,21,17,"good","green",571,"green lime"],
  [1470,2818,21,17,"good","green",572,"green leafy vegetable"],
  [1493,2818,21,17,"good","green",573,"green leafy vegetable"],
  [1104,2818,17,20,"good","purple",574,"purple eggplant"],
  [939,2818,16,21,"good","red",575,"red apple"],
  [588,2818,14,23,"good","green",576,"hanging meat cut"],
  [191,2844,23,14,"good","gray",577,"blue fish"],
  [216,2844,23,14,"good","gray",578,"silver fish"],
  [1928,2818,20,16,"good","red",579,"red tomatoes"],
  [1950,2818,19,16,"good","red",580,"red tomatoes"],
  [1298,2818,16,18,"good","red",581,"red pepper"],
  [252,2844,22,13,"good","green",582,"speckled fish"],
  [1575,2818,16,17,"good","white",583,"white food mound"],
  [0,2844,17,16,"good","green",584,"green zucchini"],
  [1316,2818,15,18,"good","red",585,"red pepper"],
  [141,2844,18,15,"good","gray",586,"gray fish steak"],
  [457,2844,24,11,"good","yellow",587,"yellow banana"],
  [353,2844,18,12,"good","gray",588,"gray fish steak"],
  [373,2844,18,12,"good","red",589,"red and white fish"],
  [483,2844,18,11,"good","red",590,"red and white fish"],
  [718,2844,16,8,"good","green",591,"bowl and item"],
  [1162,2272,16,128,"lantern","green",592,"tall lamp post"],
  [1180,2272,16,128,"lantern","green",593,"tall lamp post"],
  [1483,2516,18,87,"lantern","green",594,"street lamp"],
  [966,2643,8,74,"lantern","green",595,"standing torch"],
  [1562,2784,20,28,"lantern","green",596,"oil lamp"],
  [255,2784,32,32,"log","brown",597,"wooden post"],
  [1227,2784,22,30,"log","brown",598,"wood bundle"],
  [2015,2784,20,25,"log","gray",599,"diagonal grey log"],
  [1280,2643,94,68,"plant","green",600,"small berry bushes"],
  [243,2725,64,55,"plant","green",601,"green bushes"],
  [1343,2725,94,37,"plant","green",602,"berry plants"],
  [558,2725,30,52,"plant","green",603,"potted plant"],
  [1758,2643,24,64,"plant","red",604,"red chili peppers"],
  [503,2725,27,53,"plant","green",605,"green sprouts"],
  [858,2818,19,21,"plant","green",606,"green stalks"],
  [900,2818,18,21,"plant","green",607,"green sprout"],
  [920,2818,17,21,"plant","green",608,"green seedling"],
  [1906,2818,20,16,"plant","green",609,"green sprout"],
  [1557,2818,16,17,"plant","green",610,"small tree"],
  [101,2844,18,15,"plant","green",611,"green stalks"],
  [121,2844,18,15,"plant","green",612,"green sprouts"],
  [1593,2818,14,17,"plant","green",613,"green leafy plant"],
  [276,2844,15,13,"plant","green",614,"green fronds"],
  [293,2844,15,13,"plant","green",615,"green fronds"],
  [310,2844,15,13,"plant","green",616,"fern"],
  [342,2844,9,13,"plant","green",617,"green twig"],
  [503,2844,10,11,"plant","green",618,"green seedling"],
  [613,2844,11,10,"plant","green",619,"green sprout"],
  [626,2844,11,10,"plant","green",620,"tiny seedling"],
  [639,2844,10,10,"plant","green",621,"green leaf"],
  [651,2844,10,10,"plant","green",622,"green leaf"],
  [393,2844,8,12,"plant","green",623,"green leaf"],
  [532,2725,24,53,"reed","green",624,"cattails"],
  [731,2784,32,32,"reed","green",625,"lone reed"],
  [765,2784,32,32,"reed","green",626,"reed clump"],
  [799,2784,32,32,"reed","green",627,"reed clump 2"],
  [178,2844,11,15,"reed","green",628,"green reeds"],
  [439,2725,62,53,"rock","gray",629,"grey boulder"],
  [774,2725,29,48,"rock","brown",630,"brown boulder"],
  [1867,2784,26,25,"rock","gray",631,"grey ore chunk"],
  [1991,2784,22,25,"rock","lava",632,"lava stone"],
  [788,2818,22,21,"rock","moss",633,"mossy boulder"],
  [836,2818,20,21,"rock","gray",634,"grey block"],
  [403,2844,25,11,"rock","brown",635,"brown nuggets"],
  [430,2844,25,11,"rock","gray",636,"grey lump"],
  [561,2844,16,10,"rock","gray",637,"small stone cluster"],
  [579,2844,16,10,"rock","gray",638,"stone pair"],
  [597,2844,14,10,"rock","gray",639,"small grey stones"],
  [736,2844,20,7,"rock","gray",640,"stone edge"],
  [758,2844,20,7,"rock","gray",641,"dark stone edge"],
  [1014,2272,80,128,"sack","green",642,"sacks of grain"],
  [1062,2725,64,41,"sack","green",643,"sack of grain"],
  [1128,2725,64,41,"sack","green",644,"sack of beans"],
  [1770,2784,32,25,"sack","green",645,"sack of grain"],
  [1804,2784,32,25,"sack","green",646,"sack of beans"],
  [827,2272,103,133,"sign","green",647,"hanging signs"],
  [1906,2643,95,57,"sign","brown",648,"wooden signs"],
  [898,2643,38,77,"sign","brown",649,"wooden post"],
  [1784,2643,24,64,"sign","green",650,"flag pole"],
  [1057,2784,24,32,"sign","green",651,"notice board"],
  [225,2818,24,24,"sign","green",652,"inn sign"],
  [251,2818,24,24,"sign","green",653,"sword sign"],
  [78,2818,32,24,"stall","green",654,"market stand"],
  [1272,2516,48,88,"statue","gray",655,"stone lion"],
  [0,2272,246,242,"structure","stone",656,"stone and tile"],
  [1503,2272,288,127,"structure","stone",657,"stone steps"],
  [1793,2272,187,127,"structure","stone",658,"torii gate red"],
  [1442,2643,148,64,"structure","stone",659,"wall with window"],
  [867,2516,96,95,"structure","stone",660,"dark peak"],
  [1503,2516,80,86,"structure","stone",661,"shoji screen"],
  [1616,2516,72,85,"structure","wood",662,"windmill"],
  [101,2643,64,80,"structure","stone",663,"stone structure"],
  [1218,2516,52,90,"structure","wood",664,"red double door"],
  [833,2516,32,105,"structure","stone",665,"wall segment"],
  [98,2784,91,32,"structure","stone",666,"stone steps"],
  [363,2725,48,54,"structure","stone",667,"stone arch"],
  [217,2643,32,80,"structure","stone",668,"metal barred"],
  [1790,2516,26,83,"structure","wood",669,"wooden ladder"],
  [191,2784,62,32,"structure","stone",670,"dark slanted"],
  [413,2725,24,54,"structure","stone",671,"inn sign"],
  [1908,2725,38,33,"structure","brick",672,"brick wall"],
  [1948,2725,34,33,"structure","stone",673,"tan wall"],
  [289,2784,32,32,"structure","stone",674,"tan wall"],
  [924,2725,22,45,"structure","brick",675,"brick base"],
  [948,2725,22,45,"structure","stone",676,"red and white"],
  [972,2725,22,45,"structure","stone",677,"stone pillar"],
  [1246,2725,16,41,"structure","wood",678,"wood red"],
  [1264,2725,16,41,"structure","wood",679,"wooden door"],
  [1624,2818,36,16,"structure","wood",680,"wood corner"],
  [277,2818,21,24,"structure","wood",681,"round wood"],
  [300,2818,21,24,"structure","stone",682,"round stone"],
  [976,2643,64,73,"stump","brown",683,"brown trunk"],
  [1119,2643,59,71,"stump","green",684,"tall trunk"],
  [996,2725,64,41,"stump","green",685,"tree stump"],
  [1282,2725,59,39,"stump","green",686,"tree stump"],
  [1194,2725,50,41,"stump","green",687,"tree stump"],
  [380,2516,157,119,"tree","green",688,"two green trees"],
  [1984,2725,31,33,"tree","green",689,"green tree"],
  [1519,2725,26,36,"tree","green",690,"thin tree"],
  [590,2725,18,50,"tree","green",691,"sapling"],
  [1251,2784,18,30,"tree","dead",692,"sparse sapling"],

  [0,2862,32,32,"decal","brick",700,"brick wall"],
  [34,2862,32,32,"decal","brick",701,"dark brick"],
  [68,2862,32,32,"decal","gravel",702,"dirt pebbles"],
  [102,2862,32,32,"decal","cave",703,"cave floor"],
  [136,2862,32,32,"decal","gravel",704,"gravel floor"],
  [170,2862,32,32,"decal","grass",705,"grass plain"],
  [204,2862,32,32,"decal","flower",706,"flowering grass"],
  [238,2862,32,32,"mushroom","red",707,"red mushroom"],
  [272,2862,32,32,"mushroom","brown",708,"brown mushrooms"],
  [306,2862,32,32,"decal","brown",709,"pumpkin patch"],
  [340,2862,32,32,"decal","gold",710,"gold coins"],
  [374,2862,32,32,"reed","red",711,"red cattails"],
  [408,2862,32,32,"decal","red",712,"starfish"],
  [442,2862,32,32,"decal","pink",713,"white lily pad"],
  [476,2862,32,32,"decal","green",714,"green shrub"],
  [0,2896,32,32,"fence","wood",720,"fence right end"],
  [32,2896,32,32,"fence","wood",721,"fence horizontal"],
  [64,2896,32,32,"fence","wood",722,"fence left end"],
  [0,2928,32,32,"fence","wood",723,"fence post cap"],
  [32,2928,32,32,"fence","wood",724,"fence vertical"],
  [64,2928,32,32,"fence","wood",725,"fence post foot"],
  [0,2960,32,32,"fence","wood",726,"fence corner right down"],
  [32,2960,32,32,"fence","wood",727,"fence tee down"],
  [64,2960,32,32,"fence","wood",728,"fence corner left down"],
  [0,2992,32,32,"fence","wood",729,"fence corner right both"],
  [32,2992,32,32,"fence","wood",730,"fence cross"],
  [64,2992,32,32,"fence","wood",731,"fence corner left both"],
  [0,3024,32,32,"fence","wood",732,"fence corner right up"],
  [32,3024,32,32,"fence","wood",733,"fence tee up"],
  [64,3024,32,32,"fence","wood",734,"fence corner left up"],
  [0,3056,32,32,"fence","wood",735,"fence gate left"],
  [32,3056,32,32,"fence","wood",736,"fence gate"],
  [64,3056,32,32,"fence","wood",737,"fence gate right"],
  [96,2896,32,32,"fence","wood",738,"picket right end"],
  [128,2896,32,32,"fence","wood",739,"picket horizontal"],
  [160,2896,32,32,"fence","wood",740,"picket left end"],
  [96,2928,32,32,"fence","wood",741,"picket post cap"],
  [128,2928,32,32,"fence","wood",742,"picket vertical"],
  [160,2928,32,32,"fence","wood",743,"picket post foot"],
  [96,2960,32,32,"fence","wood",744,"picket corner right down"],
  [128,2960,32,32,"fence","wood",745,"picket tee down"],
  [160,2960,32,32,"fence","wood",746,"picket corner left down"],
  [96,2992,32,32,"fence","wood",747,"picket corner right both"],
  [128,2992,32,32,"fence","wood",748,"picket cross"],
  [160,2992,32,32,"fence","wood",749,"picket corner left both"],
  [96,3024,32,32,"fence","wood",750,"picket corner right up"],
  [128,3024,32,32,"fence","wood",751,"picket tee up"],
  [160,3024,32,32,"fence","wood",752,"picket corner left up"],
  [96,3056,32,32,"fence","wood",753,"picket gate left"],
  [128,3056,32,32,"fence","wood",754,"picket gate"],
  [160,3056,32,32,"fence","wood",755,"picket gate right"],
  [0,3088,89,96,"gravestone","stone",756,"grave cluster"],
  [95,3088,61,94,"gravestone","stone",757,"grave and headstone"],
  [162,3088,57,76,"gravestone","stone",758,"round headstone"],
  [225,3088,32,96,"gravestone","stone",759,"tall grave cross"],
  [263,3088,18,29,"gravestone","stone",760,"grave marker"],
  [287,3088,32,58,"lantern","stone",761,"stone lantern"],
  [325,3088,82,55,"animal","brown",762,"cow"],
  [413,3088,72,56,"animal","brown",763,"deer"],
  [491,3088,64,45,"cart","wood",764,"wheelbarrow"],
  [561,3088,80,55,"cart","wood",765,"wheelbarrow with hay"],
  [647,3088,64,55,"cart","wood",766,"wheelbarrow empty"],
  [717,3088,467,64,"boat","brown",767,"sampan ship"],
  [1190,3088,186,181,"structure","stone",768,"stone dock"],
  [0,3274,94,56,"furniture","wood",769,"weapons and tools"],
  [97,3274,29,29,"furniture","stone",770,"stone archway"],
  [129,3274,18,22,"good","wood",771,"wooden shield"],
  [150,3274,16,21,"furniture","iron",772,"anvil and tongs"],
  [169,3274,18,14,"good","iron",773,"metal tray"],
  [190,3274,16,15,"good","green",774,"potion bottles"],
  [209,3274,12,16,"good","gold",775,"gold amulet"],
  [224,3274,24,8,"good","stone",776,"silver jewelry"],
  [251,3274,12,15,"good","iron",777,"metal armor"],
  [266,3274,10,16,"good","brown",778,"leather pouch"],
  [279,3274,8,14,"good","green",779,"green bottle"],
  [290,3274,80,57,"good","brown",780,"baskets of grains"],
  [373,3274,80,57,"good","green",781,"baskets of greens"],
  [456,3274,28,36,"good","blue",782,"blue vase"],
  [487,3274,32,25,"good","iron",783,"soup pot"],
  [522,3274,32,25,"good","iron",784,"food pot"],
  [557,3274,20,39,"good","gold",785,"lit candle"],
  [580,3274,34,28,"decal","blue",786,"fish school"],
  [0,3333,20,17,"good","green",787,"green cabbage"],
  [24,3333,22,21,"rock","brown",788,"ore boulders"],
  [50,3333,22,25,"rock","dark",789,"dark boulder"],
  [76,3333,22,25,"rock","water",790,"water stone"],
  [0,3360,32,32,"structure","wood",791,"campfire"],
  [32,3360,32,32,"structure","iron",792,"boiling cauldron"],
  [0,3394,124,150,"structure","pale",800,"tent"],
  [126,3394,66,64,"cart","wood",801,"mine cart"],
  [194,3394,80,55,"cart","wood",802,"hay cart"],
  [276,3394,255,42,"stall","wood",803,"market counter"],
  [533,3394,224,182,"stall","blue",804,"fish stall"],
  [759,3394,55,48,"good","green",805,"green fish pile"],
  [816,3394,64,56,"good","blue",806,"blue fish pile"],
  [882,3394,47,49,"good","green",807,"eel pile"],
  [931,3394,48,34,"good","red",808,"red fish pile"],
  [981,3394,56,24,"good","green",809,"green fish pair"],
  [1039,3394,42,32,"good","red",810,"red fish pair"],
  [1083,3394,52,55,"log","brown",811,"firewood pile"],
  [1137,3394,64,63,"sack","brown",812,"stacked sacks"],
  [1203,3394,64,69,"furniture","wood",813,"bookcase"],
  [1269,3394,52,90,"furniture","wood",814,"tall wardrobe"],
  [1323,3394,51,95,"furniture","gold",815,"curtains"],
  [1376,3394,73,59,"decal","green",816,"checkered rug"],
  [1451,3394,57,78,"decal","brown",817,"fur rug"],
  [1510,3394,32,57,"gravestone","pale",818,"skeleton"],
  [1544,3394,71,55,"furniture","wood",819,"old chest"],
];

```

## 01-internal-code/src/tileset.js

_5123 bytes_

```javascript
// LPC "terrain-v7" autotile tileset data (bluecarrot16, CC-BY-SA 3.0 - see credits.txt).
// The tileset is a UNIVERSAL corner-autotile set: every terrain provides one tile per
// non-empty subset of the 4 quadrants of a 32x32 cell, plus pure-fill variants.
//
// Corner order is [top-left, top-right, bottom-left, bottom-right], which in perchance/map
// terms is (x,y), (x+1,y), (x,y+1), (x+1,y+1) of the corner lattice.
//
// To render one 32x32 map cell from 4 corner terrain indices (t0..t3):
//   1. uniq = distinct terrains present, sorted by RANK ascending (lowest priority first)
//   2. draw BASE[uniq[0]] - a pure fill of the lowest-priority terrain (avoids pixel gaps)
//   3. for each terrain t in uniq (in RANK order): build mask m from which corners equal t,
//      then draw MASKS[t][m] on top (if present). Higher RANK ends up on top.
// Randomized pure fills: MASKS[t][15] holds several variants - pick one per cell for texture variety.

export const TILESET_IMAGE = "./terrain.png";
export const TILE = 32;
export const COLUMNS = 32;

export const TERRAINS = [
  "Dirt_Tan",
  "Dirt_Brown",
  "Dirt_Dark",
  "Rock_White",
  "Rock_Gray",
  "Rock_Dark",
  "Rock_Black",
  "Hole_Brown",
  "Hole_Black",
  "Mud_Brown",
  "Grass",
  "Grass_Light",
  "Grass_Dark",
  "Grass_Dead",
  "Soil",
  "Sand",
  "Snow_1",
  "Snow_2",
  "Gravel_1",
  "Dirt_Roots",
  "Water_Shallows_Dirt",
  "Water",
  "Water_Deep",
  "Water_Purple",
  "Water_Green",
  "Lava",
  "Water_Shallows_Sand",
  "Ice",
  "Ice_Melting",
  "Earth_Cracked",
  "Stone_White",
  "Stone_Tan",
  "Mudstone_Gray",
  "Mudstone_Brown",
];

// Pure fill tile id per terrain (index-aligned with TERRAINS).
export const BASE = [97,100,103,106,109,112,115,118,121,124,321,324,327,330,333,336,339,342,345,348,545,548,551,554,557,560,837,838,841,784,787,790,793,796];

// Draw order, lowest priority first (index into TERRAINS).
export const ORDER = [15,29,14,3,4,5,6,0,1,2,16,17,23,24,22,21,20,26,27,28,8,7,9,19,32,33,30,31,12,11,13,10,18,25];

// rank[terrainIndex] = position in ORDER. Missing entries sort first.
export const RANK = [7,8,9,3,4,5,6,21,20,22,31,29,28,30,2,0,10,11,32,23,16,15,14,12,13,33,17,18,19,1,26,27,24,25];

// MASKS[terrainIndex][mask] = tile id, or array of variant tile ids, or 0 if absent.
// mask bits: 1=top-left, 2=top-right, 4=bottom-left, 8=bottom-right.
export const MASKS = [
  [0,130,128,129,66,98,192,1,64,193,96,2,65,33,34,[97,160,161,162]],
  [0,133,131,132,69,101,195,4,67,196,99,5,68,36,37,[100,163,164,165]],
  [0,136,134,135,72,104,198,7,70,199,102,8,71,39,40,[103,166,167,168]],
  [0,139,137,138,75,107,201,10,73,202,105,11,74,42,43,[106,169,170,171]],
  [0,142,140,141,78,110,204,13,76,205,108,14,77,45,46,[109,172,173,174]],
  [0,145,143,144,[81,209],113,207,16,79,208,111,17,80,48,49,[112,175,176,177]],
  [0,148,146,147,84,116,210,19,82,211,114,20,83,51,52,[115,178,179,180]],
  [0,151,149,150,87,119,213,22,85,214,117,23,86,54,55,118],
  [0,154,152,153,90,122,216,25,88,217,120,26,89,57,58,121],
  [0,157,155,156,93,125,219,28,91,220,123,29,92,60,61,[124,187,188,189]],
  [0,354,352,353,290,322,416,225,288,417,320,226,289,257,258,[321,384,385,386,418]],
  [0,357,355,356,293,325,419,228,291,420,323,229,292,260,261,[324,387,388,389,421]],
  [0,360,358,359,296,328,422,231,294,423,326,232,295,263,264,[327,390,391,392]],
  [0,363,361,362,299,331,425,234,297,426,329,235,298,266,267,[330,393,394,395,427]],
  [0,366,364,365,302,334,428,237,300,429,332,238,301,269,270,[333,1130]],
  [0,369,367,368,305,337,431,240,303,432,335,241,304,272,273,[336,399,400,401,769,772]],
  [0,372,370,371,308,340,434,243,306,435,338,244,307,275,276,[339,402,403,404,775,778,781]],
  [0,375,373,374,311,343,437,246,309,438,341,247,310,278,279,[342,405,406,407]],
  [0,378,376,377,314,346,440,249,312,441,344,250,313,281,282,[345,408,409]],
  [0,381,379,380,317,349,443,252,315,444,347,253,316,284,285,[348,411,412,413,1369,1372]],
  [0,578,576,577,514,546,640,449,512,641,544,450,513,481,482,[545,608,609,610,663,1363,1366]],
  [0,581,579,580,517,549,643,452,515,644,547,453,516,484,485,[548,566,569,572,611,612,613]],
  [0,584,582,583,520,552,646,455,518,647,550,456,519,487,488,[551,563,614,615,616,626,627,628]],
  [0,587,585,586,523,555,649,458,521,650,553,459,522,490,491,[554,617,618,619]],
  [0,590,588,589,526,558,652,461,524,653,556,462,525,493,494,[557,620,621,622]],
  [0,593,591,592,529,561,655,464,527,656,559,465,528,496,497,[560,623,624,625]],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[837,867,868]],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[838,839,840]],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[681,713,841,842,843]],
  [0,817,815,816,753,785,879,688,751,880,783,689,752,720,721,[784,847,848,849]],
  [0,820,818,819,756,788,882,691,754,883,786,692,755,723,724,[787,850,851,852,1348]],
  [0,823,821,822,759,791,885,694,757,886,789,695,758,726,727,[790,853,854,855,1351]],
  [0,826,824,825,762,794,888,697,[760,889],0,792,698,761,729,730,[793,856,857,858,1354]],
  [0,829,827,828,765,797,891,700,763,892,795,701,764,732,733,[796,859,860,861,1360]],
];

export const TERRAIN_INDEX = Object.fromEntries(TERRAINS.map((n, i) => [n, i]));

```

## 01-internal-code/src/noise.js

_2634 bytes_

```javascript
export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function hashInt(x) {
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}

export function hash2i(ix, iy, seed) {
  const h = hashInt(Math.imul(ix | 0, 0x27d4eb2d) ^ hashInt((iy | 0) ^ hashInt(seed | 0)));
  return h / 4294967296;
}

export function hash3i(ix, iy, iz, seed) {
  return hashInt(hashInt(Math.imul(ix | 0, 0x27d4eb2d) ^ (iy | 0)) ^ Math.imul(iz | 0, 0x165667b1) ^ hashInt(seed | 0)) / 4294967296;
}

export function seedFromString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

export function valueNoise2D(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const u = fade(x - ix), v = fade(y - iy);
  const n00 = hash2i(ix, iy, seed);
  const n10 = hash2i(ix + 1, iy, seed);
  const n01 = hash2i(ix, iy + 1, seed);
  const n11 = hash2i(ix + 1, iy + 1, seed);
  const a = n00 + (n10 - n00) * u;
  const b = n01 + (n11 - n01) * u;
  return a + (b - a) * v;
}

export function fbm2D(x, y, seed, octaves = 5, lacunarity = 2, gain = 0.5) {
  let total = 0, amp = 1, norm = 0, fx = x, fy = y;
  for (let i = 0; i < octaves; i++) {
    total += valueNoise2D(fx, fy, seed + i * 131) * amp;
    norm += amp;
    amp *= gain;
    fx *= lacunarity;
    fy *= lacunarity;
  }
  return total / norm;
}

export function ridge2D(x, y, seed, octaves = 5, lacunarity = 2, gain = 0.5) {
  let total = 0, amp = 1, norm = 0, fx = x, fy = y;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise2D(fx, fy, seed + i * 977) * 2 - 1);
    total += n * n * amp;
    norm += amp;
    amp *= gain;
    fx *= lacunarity;
    fy *= lacunarity;
  }
  return total / norm;
}

export function warp2D(x, y, seed, strength, octaves = 3) {
  const wx = fbm2D(x + 5.2, y + 1.3, seed + 17, octaves) * 2 - 1;
  const wy = fbm2D(x + 9.7, y + 3.1, seed + 29, octaves) * 2 - 1;
  return [x + wx * strength, y + wy * strength];
}

```

## 02-external-code/README.md

_1833 bytes_

```markdown
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

```

## 02-external-code/perchance-plugins/ai-text-plugin/main.pjs

_58048 bytes_

```javascript
// NOTE TO AI AGENTS: Do not vendor/fork this plugin. It's a really bad idea, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, you can imports this plugin and create a "wrapper" that changes/expands on this plugin's behavior using only its public API.

$output(inputData, extraOpts) =>

  const serverOrigin = "https://text-generation.perchance.org";
  
  let iframe = document.querySelector("#aiTextPluginEmbedIframe");
  if(!window.__alreadyAddedAiTextPluginStuff8492739 || !iframe) {
    if(window.__alreadyAddedAiTextPluginStuff8492739) {
      // self-heal (2026-08-24): the embed iframe node was removed from the DOM (e.g. generator code rewrote document.body) while these window-level flags survived — previously streamTextFromIframe then crashed with an unhandled "Cannot read properties of null (reading 'contentWindow')". Rebuild the embed and let it re-verify; the old message listener is inert (it compares event.source against its own captured, now-dead iframe).
      window.__aiTextIframeEmbedIsReady = false;
      window.__alreadyTriggeredAiTextPluginPreload8492739 = false;
    }
    iframe = document.createElement("iframe"); 
    iframe.src = `${serverOrigin}/embed`;
    iframe.style.cssText = "display:none; position:fixed; top:0.5rem; right:0.5rem; height:3rem; width:11rem; background:#333; border:none; border-radius:3px; box-shadow:0px 2px 4px 0px #00000066; z-index:10000";
    iframe.id = "aiTextPluginEmbedIframe";
    
    setTimeout(() => {
      if(!window.__aiTextIframeEmbedIsReady) {
        iframe.src = `${serverOrigin}/embed?__cacheBust=${Math.random()}`;
      }
    }, 15*1000);
    
    const style = document.createElement("style");
    style.id = "aiTextPluginStyle8492739"; // setup can re-run after a self-heal — replace rather than stack
    document.querySelector("#aiTextPluginStyle8492739")?.remove();
    style.textContent = `
      @keyframes ai-text-plugin-blink { 50% { fill: transparent }} .ai-text-plugin-dot { animation: 1s ai-text-plugin-blink infinite; fill: grey; } .ai-text-plugin-dot:nth-child(2) { animation-delay: 250ms } .ai-text-plugin-dot:nth-child(3) { animation-delay: 500ms } .ai-text-plugin-loader { background-color: #f1f1f1; color: grey; }
      
      .ai-text-response-end-buttons-ctn:before {
        content: "+";
      }
      .ai-text-response-end-buttons-ctn {
        position:relative;
      }
      .ai-text-response-buttons-wrapper {
        display:none;
        position:absolute;
        width: max-content;
        bottom: 0;
        min-height: 2.5rem;
        pointer-events:none;
      }
      @media screen and (max-width: 600px) {
        .ai-text-response-buttons-wrapper {
          min-height: 3.5rem; /* buttons should be further apart on mobile - else 'hover' click triggers the buttons themselves */
        }
      }
      
      .ai-text-response-end-buttons-ctn:hover .ai-text-response-buttons-wrapper {
        display:flex;
        pointer-events:auto;
      }
    `;
    document.head.appendChild(style);
    
    window.addEventListener('message', (event) => {
      if(event.source !== iframe.contentWindow) return;
      if(event.origin !== serverOrigin) return;

      if(event.data.type === "embedIsReady") {   
        window.__aiTextIframeEmbedIsReady = true;
        // console.debug("got embedIsReady, sent verifyUser");
        if(!window.__alreadyTriggeredAiTextPluginPreload8492739) {
          iframe.contentWindow.postMessage({type:"verifyUser"}, serverOrigin);
        }
      }
      if(event.data.type === "verified") {
        iframe.style.display = "none";
      }
      if(event.data.type === "verifying") {
        iframe.style.display = "";
      }
    });
    document.body.appendChild(iframe);
    
    window.__alreadyAddedAiTextPluginStuff8492739 = true;
  }
  
  if(inputData && inputData.preload === true) {
    if(!window.__alreadyTriggeredAiTextPluginPreload8492739) {
      (async function() {
        while(!window.__aiTextIframeEmbedIsReady) await new Promise(r => setTimeout(r, 500));
        await new Promise(r => setTimeout(r, 500));
        iframe.contentWindow.postMessage({type:"preload"}, serverOrigin);
      })();
      window.__alreadyTriggeredAiTextPluginPreload8492739 = true;
    }
    return "";
  }
  
  if(inputData && inputData.getMetaObject===true) {

    // Fast bigram-based approx token counter thingy.
    // About 80x faster and 200x smaller than HF tokenizer.
    // To "train" a new fast/approx counter like this (but e.g. on a non-deepseek tokenizer), use this script:
    //    deno run --allow-write=. --allow-net https://user.uploads.dev/file/e29eab687b1fbf129076ec6057484bb3.js --tokenizer=/abs/path/to/tokenizer.json
    const MODEL_BASE64="REJHMQEAAAC5hhc/AACARQAAAEUADAAATgwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADCBeYG9wpXAtkHRwmbEbwLXgtOBocAYw/zC/sNJg+QBDwJQw6YCIkMDBAVDycKEQ9HDHoJ5wcmBP8NxQnmBecHCg+wAwMLlAT0CQABdgMRC8UDswPTB0QOkgVOBtQFEwRaCQYSuAX7BuD/wwhTDdIBcAQRBSf/EhFgCe0DGArwDXAGxgTFBjQC+QI3A18CCwJEAp8GUwgpDGkDWAV9AgwDQgDkBZQDrgLP/7gG4AJg/lAM9wEbEZIFew6CAogFAACeBDgDHgAVBFQB9gbGBvECHAXABNgHrgWFA8YEbgulAzAFOAMSBuEApQegAEIEFwi0AuUC7AGHB/MBjgMSChcDzQgZBvkHQgSDBm4GmQHGAekDgQJ/Am0HRgfVAoEEgQISCtEHCQraAlYDggYiCVwJbgN+BCMFMgptCSQJVQUcBQAAAACuC9APahJ5HkkCCwCxAGkHSBTlCAAkoA7aCq/+hP/x/gAAAAAAAAAAAABeA1IB/QETAEMAtQMAAAAAAABM/8cE5hKlAiD7YwKWAg8CrgXIBnD/agHEAYIFCACsAg4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwkABAQICAQMBAgIBAQEBAQEBAQEHAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQcBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAkYBAQEBBAYBDwEBAQcBAQEDMQGAAgwCGwt8EIECUgTsAYECgQIHOgMBBAMBBQEBAQFNHQsBNREBDyACAgsEXAEPAggBAQECMgwClAEgCAEBtwQCDgWtAT8JBAQBDwIDAQYGDgEBAQEBAQEBAgEBAQEBAgEBAQEBAlcBUAIHAwICAiGNAQIeIRLvAQwBAQIBAQEBAQEBAQGyAQE1CQMCAgEBAQEBAQEBAbIBAQE0DAICAQEBAQEBAQGzAQE1DAICBAEBtgE1DAICBbYBATUMAgIBAQIBAbUBATUMAgIBuwE1DAICvAE1DAICvAE1DgUCAQEBAbIBATUa5wGfBOUD4AGiAgwCFAIKAgIBDwEBAgECAgEBAQICAQEBAQEDpwEMFwoUBAQDAwMDBEoeQA4TAQMEBgERBAMBAwMDA04eAT8OIAIRBAQGAwNOXjMOAgEFAwEBBAEBAQECqQFBBAQDAwMDTl5BBAQDAwMDTl5BBAQGBk4eQAcFFwYHAwESAgQBAQQBAW6AAQQKBqwBKQcRBAMBAwMDA05eQQQEBgZOHz8OKgkCAgQGAwMESh5AQQQCAQEGBk0BHkBCBAUBAgICAQEBrAEOEwgFBQENBAMBAwMDA06zAawBMw4EBAYGTl4MAhMDAQQYAgIDAQICAgEEAQJMHkA2CwQDAQYDAwJMHkAOIAUaAQQBrgEpGAQEBlQegQEEAwEGsgGBAkEECvMBBBCyDQcCAwEBDCcBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBSQEBBxYeIQw1AQMEAQIBAgMBAQEBA0oJFUAMAjMCAgMBAgECAQIBAQEBBEoBAQEbAR4hBwUBATMBAgECAQEBAgEBAQMBAQEBAQJKAQIbAR4hAQEFAgMBAQwFIgEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQFJAQEdHiEMAQEzBAEDAwMDAQEBBEpeDAEBMwQCAQECAQEBAQMBAQEESgMbAR4hDAEBMwEBAQEEAgEBAQEDAQEBAgJKAQIbHyEMAQEiEQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQFJAQEcAR4hQQQEBgZOXgwBARQfBAIBAQIBAQEBAwEBAQICSgEdAT8HBQEBDCcBAQEBAQEBAQIBAQEBAQEBAQEBAQECSgECGwEeIQwBATMBAgEBAwMBAQEBAwEBBEoBHQEeIQIFAgMBAQwFIgEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAUkBAgYVAR4hCQMBAQwnAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAUkBCBUBHiEMAjMCAQEBAgECAQECAQIBAQEESgEeP1WsAQcFAQERIgEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAUkBAQEbAR4hAQEFAgMBAQwBBCIBAQEBAQEBAQIBAQEBAQEBAQEBAQECSgECGwEeIQcCAwEBDCcBAQIBAQEBAgEBAQEBAgEBAQICAUkBAhsBHiEHBQEBMwEBAQEBAQEBAQEBAQEBAQIBAQICAQFJAQEcAR4hQQQEBgMDTgEdQAwCMwQDAQMCAQMBAQFOXgwBATMCAgQGAQQBBEoeQAcFAQEzAQEBAQICAwEBAQECAQEBAkwBHQE/DAIzAwEEAwMFAQICAUkBCNYChAhhDAYBBQMBBQQqAQ8BAQMBAgIBAQEDMQ4/AQcPBwEBAgYCAgYHAQECAQECAQ8SAQ8CAQcBAQE0DAJUBwEBAQYBBQQEBAgEBAUTBAEPAgENMQwCPwEHCwECBQETAQ0JCQETAQ8CAQgBNQxwAQMECAQBBwQQBAEPAgECAQEBAgEBATROFhQEECQBDwIIAQEBA50BARQUGxACAwYBNUMKAQIEAToGAxgBDwKjARQEBBAgAQ8CAQcBAQEDMU5iEAIBBwEBAQOhAQQQARADARcQAgEJNQw1AgsaEAQBAwQEBAQEBRcBDwIBAgeVAQgEBEABDwIBAQEBAQEBAQEBAXcGBSoYIAEPAgECBQEBBDEMXS8YAREDBzUMAjsbAQQBDxMDBAkBEwEPAgE+DD0nCAQnDRABAQMFAQEBdQICBAUBBRwMDRoBAgoBEAEBAgUBAQE0aDMVAQ8CAQk1SQUuBAQNLwIBCTVBHwEBAQIBAQEBAQEBAQEBAQEBAQIBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQIBAQEBAQEBAQEBAgEBERACCAEBATRJBRYEAgIIBAEDAgIIAQQCBQgBIwIBBwEBAZwBAQMFEAQOAQEDKAI/DTwbAQECBAQIFAEDBAgkAgE+YQECBAUDAQMBDwQEAwkBFxACCAEBATQCPwIBAQMBAwEBAQMBAQEBCg8FBAQNDwoBHQIBBwEBATRgBAgBBxUHBAQYEAI/QwYFFgQEBAQ5EwIKNQwVAgYDAQYBAwoBAQEBAQcFAQEPAQEEAhUBBw0HFBACCAEBATQMAjsFEgQUFAgBAwQUEAIBBwEBARMhDlYBAwQEAQcNByQBDwIKNUEEBAIBAQEEAgEMBgIDAgECAQIEAQEKAQIFBBMBDAEPAgECPAw9BAEBBAYIAQEBAQEBAgEBAQEBAQMBAQEBAQEBAQEBAQEBAQEBAQMBAgEBAQEBAQEBAQECAQECAQEBAQEBAwoEEAIDBQEBAQMxDjQBAwECAwEBAQECAQEBAQIBIwEDEAEDDg4QAggCNU0BBwQMPQgCBBABAT8ONQYEAQEBBAUTHBQkAgE+DjoGBAEBDAICAQEBAQEGAgMBAQEDAgMBAQIBAQEBAQIBAQEBAQECAwEBAQEDAgEhAgEHAQEBdwoBAgQBBAcBAQEEAQMCCwwOAgQCAiQCAwUBAQEDMWQECA0PBAwkAgE+QQQEAwEBAQYEBwEDBAQCAg0BAgQfARUHAgE+RwYBBAEDagIBAgUBAQEDMQw1AQEBAQEBBQEBAQEBAQEBAQEeHAQsAgEHAQEBA34BBQEBECMBIxQCAT5BDQdbEAIBiwEBRgQEJAIDBQEBATRBAgECBgEBAQECAQECAz8ZDwIBBwEBATSWASoCAT5BAgsGRAQGHgIBDAExDjMNBwsBAwwEAQMBAgEBCwEHCAUFBAoBDwEBAwUBAQECMg4zAggBAQEBAwEGAQosBAQMAQsBDwIDBQEBATQMAkASAwEEBAgBAwQIBQQDBAkTAQ8CBToMAjMCAQMCAwEBAgIBAwIIBAwBDxMBAQMEFAEPAgEJAzJJBQYMCAEDBQYGLwEDAQ8CCAEBATQCCgI3KwwQAQMcBAEPAggBAQE0RwUCBAEHBgEDCAgBBw0JEgkDAQ8CAzxDEQwcHAQRAwEPAgo1DAJTAQIDAQIBAgIBAQEBAQEBAQEBAQEBAQEBAQEBAQICAQEBAQIEAQEBAQEBAQEUAwEPAgUDAQEBNAwCQAIQAQEBAQIBAQEDDAgIKAEPAgEHAQEBNAw2AQEIAQECAwESGwICAgICAgICAgQCAgICEQERAQ0xDAJTAgICAgICAgICAgIBAQICAgICAgICAgICAgIEAhcBEQMLMQwCNAEBBAMBAQEEAQEFARI3AgsBEQEHAQEBNGMRDS8BEQMBAQMBAQE0DAEBogEBDwIBPk0BAgQBWwEPAgHABQsEAQcDAQTDAQYCDQYEAQEBAQMBAQECAQEDAQEBAQEDAQEBAQHGAQ0BDgoHAe4BAQr5AQ/oBwHtAwEICgQBAwgJCAEBAQHLAQIZA/MFAQEBAQECAQIBAQEBAQEBAQEBCQMBAQEBAQEBAQEBAQEBAQHCAQEBAQEBAQEBAQEBAQEBAQKFEJ0OARMB/AEGAcYBFAEHAQPiAQEBtgIBAQECxAEFAwIDAgEMCAkBAgcBAQXLAQIEBgICBPkBBhwFyQEEARkHBhHCASuGAgEBAQEBAQEBAQIBAcUBAQEBAQEBAQEBAQEBAgEBAQEBAQECBQEBAQECAgEBAQEBAgMBAgEBAgIBBsQBAQEBAQIBAQECBgEBAQEBAQEBAQEBAQEBAQEBAgEJAQEBAQEBAQEBAgEBxQEBAQEBAQICAQECAQIBAgEBAQEBAQEBAQGcBATkAZMfHwEBAQEBAgEBAQEBAQEBAwEBAQECCAIBAQMBAwEBAQECAQEBTgEMAQ8CCAEB2v2OA/r/gfwJAPv80v5TAEf//QG6AAgAYP8xAVYBGQFq/8EC9PtR/TP8FPva/SkBhv3F+8L9cv4y/gv+l/wG/Uv8lv25/Kj5Y/4y/uD9BPzT+0D7M/z2/AYE1f4J/iD+D/2b/yv+of2b/J3/Jf7G/TH/Fv2O/sP/w/1CAEv/7fzi/kL9lACw/UgA+wDn/QkAEvuN/Xz9H/24AA4CRgAh/pX8ogFh/mv/1vzh/2b9GP32AA0I1/lIA/L/cftO/zkA9gHnAJsA8fyMAJ8CjvxaBIv46QP+/ycCGAX6AAn/af6F/qwBYP6CAIsBhAAxAckAjwEE/9sBtP7AAJoD3AG8AmQDJAEAAPL/fQI0Af8AbAM6AfP+RQOO/K76BABTAqMAMwJ8Av0C7vqU/jwBwPtE/8b+5/joAav+tgGz/MP+3v6lAHQBYQk2BgQFRwFVCKYJeP2y+8IDq/5PAYwAfwD8/D4AF/4w/6n/uQJ4AVr/wv4hA/ECXwJh+f75BvwM+K0CVQGp/M8B/PkmACECYAvcAn8EawfIAAr/Dv/X/wv9OfxW/IH/O/7z/fT+SwLBALoEqAM9Ax4Ccf1/+RD+D/rj+037//6+/gP69/4IADIB8wBLAzACH/9RAMX/wf+t/gv9Jf9KAAL8j/vd/9QCBQLCBJ4Er/8i/cz+1v1uAXYDOAAlAnAAA/0O/xsA2QCtAOcCFP3L+z78Df/q/QH+jwHdAYsAZABW/wX+/f53/3X/ZACk/uT9tgAyBFb+xwA9AgcBiQWl/14A/P59AG//EQDqAEwBqQA6BMkB7wVS/dMCrwC9BL8Gpv+oAYj7qgSRAF0ErQc+BhIB8gB5/8IHV//v/SwCAf3KAd0A0gDxAoAGMQG/AngAzf4iAt8J5v7g/QQABf6MALL8JwBg/V78qP+S/ocAOAe4/hICSP4XAcECMgF1AGID1wNHAQgFBgCnAqT7YAR0BA0Bbv+r/xH/+/zR/p//zP0I/ykBH/1Z//wBNf8J/4j++wE6/skCjQJSAc0BBgMzAZ0Bbf8vAcoCGQhSAwz/d/8tAssB2wLxA6IAnATBAmP+GgV4ART9pwC5ABQB/gjfAKcAKQLw/vn/0ADk//EFKgQK/iwBigP1BPgBsAV+ASsATQL3ApcBHQDB/YECRgKz/FT9i/4KAAYAMf7z/x0AIP/sAHr9ewJvARQAZf8q+/wCSABMAQoDigF/ADMAyP5O/73/qQDpACwAaAHB/MYCnQDiAJUBgP62ALAEigNjAUMDRQLSAWcAgARd/4X+fP9DBcH+of5+ABcG0/+YA0UBxgCMAEb+cQQ0AKj7F/Yb/xH5fgPyACL+oPypAdL9FQCh/tr98P8D/3cDhPyLA/QBNwFgAWv/QQAqA9sBPQLpBKH+nwCh/qID1v5DAL7/6gB1AMYARQPmA3kDp/6FAWgAuQBtBFcAAQLdANr8YAVFA9MDLwHd/50BRwPDAFr/g/8S/7sBcP98AHwCQwbM+hcAbACq/rcCdgDUAWgIygLU/wUEawByC/gFOQDBAvYAuwBTAjEBjwEJ/TQCZgBaCU/+fQVbBIv9k/0G/TQGL/+T/aj9UPyb/kj8ifwu/gH90//D/uwDU/9e/Zz9PvzT/or+D/pp/iT9/PtN/j//Ff4gAQYBOgNrAeb/HAS//s0AF/5j+yT99v7Y/33/GAAn/b4Amf9tAV//0//6AswCc/+XAJUBXP8cAHwAFPu2APsCbgDJ/+YA7QGJ/5H+b/zI/hQBQv5eAJf/rgDnA4ABKARIAh0Eef/dATf/VQFVATn+BQZFAQsBCQER//QCLAHIAP3+pwXG/6H/Hv50AyUC0wPzAWIB0ALHAhMCtAFJ/5UB9wLsAaYD9P0x/HwCNgDxAMf/Z/73/mf93P/u/4cAhABYAF8AIP74/wcCSP+y/hwAR/7qAaQCngBsAdT7DAMb/noD1wMKAXEBdwNHA1cCEA1O/0cBfwAuAI3+bAFfAO3/LAQtAZoAzwHd/hkBeQFxAksB8wJkARkE4f2WAL0BIALLAHH/MgPjAOYBuQQBAB7+9gLp/sUBJwDc//MBFQLH/tb97gGU/4gAHP8hAbQBYP/GA+MAFwDeAKkBsQEqAxoArwGvAjcBZQBgAR8AQQJoBVEEoAEIA8T+BP6P/vX8U/sw/t78nf2e/tn+iAHg+5v+l/4D/a77xP3jAFAAXf2B/zYAZfyD/QT8sQiB+qH8UwHjAMr8xAImAaMBCf10ABMBqP7S/Mr9RgFc/4P75/yb++T/rPwsAEj+cQAwA4cD/AGs/RsCgQF2/agDov+BAmP/NfxE/VEBOwDcAJ0Dkf81Adb/iP86Aan+WgIe/5n/Yv5bARQBcwCmANz/0AMtAR3/Vv+bAXT+CABq/xsACQJf/wn9SwD4/wz/xQHCAp//mAIWAvACy//c/5395Qbp/hb+sQHrBJD+7gLMABUAw/4DBXX/UANE/iD9Rf83AVcBHgMrARUA+AaIAb78cf5lAXEAnQL4Bwb/1v5l/xEATf67ARgBpv0E/kQC/QI3AIsBywHzAM8DF/4NAOH/ZgCg/2wAnwCK/nj9bP+qAC0CpwERAQUDvgRdA7YAqgFCB1n/afzL/8z8VgAj/kb9iQQRASYBdfzC/vf8BP8IAPn+MgM0/P8A4wDE/Pz+4P16/ej/KAAjAfv/PgET/8n/5AO2A08DUP8mAfcCXf8hAHIEqf+OA7wClf9mAgcAAgD7AK7/RAOp/0EDmQEsA/3/hgTK+18C9fxOAWH9KAE9ABsCRgLUAOP+O/63/aP+EwDq/kwDMfwGAob+uv8JAf7+IwF7/zn/AwAz/wD/XP+u/kr82QDH/aD+AQBZAur+3QEdAdcB8v5k/5cF+wDJAxX+AAC1BCb+EgITAeYBufuV/tMACQPa/qoA//7iBTkBJwLrALAAmwX0B4H/qgBh/tkE4P9HAYcBlgHXADH/dgBxArcBmgH8AxUBJf39/ob/sAAHApgB9f/i/hsAAf6q/igB3ADDAnkAsQCpBJv/dP4JAuL9Jv2t/P/9gv8KAncDYAA4AQEBfARKAZwEYABtBLj/GP4sANL9q/2Z/ywAov5t/67/6fsH/kn9egE1AcH/df5D/1EB8gcz/y4FVQLy/3EDbALEAGIABgMeApUBMv6D/j0AzwBtA2f/oAKV/HIDhAIZBHoDhgB5AGEA//8XAsAC8wDh/wMCSQN9AFsBZgVO/h38PwJM/jIBgPwFAhD+zgB9/ykB3P5x/xwBEQDk/nr7qPxPAk8AtQOcBLv//AaHAoEEzfzsAGX+zwKRAaD9iwCkBmv/HQFVAUf/Gf8FAiX+w/9K/WcBQvzR/z8F1/3G/LD6hP4/AZ7+8f0eAJf/MQC6A3MDIQSbAGz+vQCI/zABWAJwAMD/Pv+b/5P/bPzqALj9nfuGAdoAOwEBAjkCCQXd+u4ATv6M/ef9Zv3XAhED1QJrAu/+Xv2Y/BX9qQMhADz/jAKv/2MBxv7a+OP/AP4c//ACvP/+/TEA9f08/dMCuAEAAP8CEwNZAqP6Zv5OAD4ECAR4AZoAcf+r/2f7fwFZ/Zf/EACBAEEE5f60AGUAUwKC/WMF1ftlANL/UQICAV0AYP95AjECn/6OAev+N/7Q+ZX/hADJ/iT/wwGQAbz9jQLa/2IAdP/j/97/tQCYATIC7wG4AqL/w/8jACP/GwJOBRz+0QGEAkz+VgGJAEIC6ABhAJcCiAKxAKEBHvy6AeH/Ov5R/3ICYACPAs3+jf5M/qgC2/4E/6z+yQDDBL3/UAEoAbUBEAGp/tP/awPJ/nH8TgE5AfYAD/6OAlX/MwMvAKYAHAGb/l788P/OAN39O//T/bAC/P9v/6AA1f4Q/ukBz/+X/4n+Nv62/80AbgMmADP+SALC/er8uPwG/FwBtAYEAC8EUAE///0ATwQqAID/yQNY/H/9dQJvAioIzAJF/rr+jvuz/xEBkALcAZf/cAHn/FkADv6bAVsBEP8hAKoCWP7O/yUB2wAUAr/8Yv9uAH4BuP9S/+b/iwCE/wsCSfs4ABkBPgQ3AqUA6f7T/T0BI/+9/UgA8QEvAcn93wOmAL0DoP82AA/+af4T/7H9+gaoAHf/qwDaAEADxAIHAJL/ZwHHAIYJT//LARMBaQP9/2L/nQLm/GYBJf+9AUn/9ARr/38BFQAaAAH/v/6f/vABWwER/2sC7AAJAFb7VAH1/8AC8v+UAKYC8ADs/pD7TgL9ACL9UQB2AQr/+AKvAS0AIP/FBf8EXf83ANwA9//r/n4En/5g/Y8CAAT4AyoBN/70/hcBXQK2AEYCO/27ACf3igBN/mwANwFm/yYChP9yAcX/1v/iAL7/5v8w/3MBtf9vAKwBLACDAMX+tAbMANQCSP+WBrsBgP6W/J7/3P3l/1b+8f5X+rEC4QCg/SUEjwKtAEb7zv+P/FwBRANvBHb9GgAQ/dICzP/WAUX9AAIMAC39T/+x9oQBOPz2//v+mgBz/8f9MwAC/k8AQf+C/zsCnP06/w3/jP6YBRMB0v2f/cz+gQBl/a3/g/7I/hQAOQCWAO0A9ACcAEoCBgB6A7AAQQNb/q0CHgGo/wkCyACmAMP/VAEmALIA4QAV+4wBWf/l/2z/MgHw+zX+Pf0G/Sz/5P8z/1wASAB1ATT8c/5UAesCxAAzAQADqACnAab9ZACC/VgAswBJAZsAOwCIAYn/AAAhAPj+ywL2BJMA8AEaAT4DEgIJAfQAEgKlAQQCOwAzAcEAFQJh/3X/eAF2/kUAif5nAd7/Sf9VAOD/sAHeANoD1wBJ/9gC4v6T9XX/ZgCu/yMA5/7P/mYCUwHcBZ8Bnwep/Zb7AgP1//MAYwGk+/ABmgCnAK7/dAAKAHgBx//k/hj/KQBF/qz/2gE5/6cAsv8T/5H/rP/8/1cAzwCXAJEAc//kAHn+KPyB/jr/nf4J/0QCUv51AVkAEv0o/mL/LAHyAOX86von+Dz+wf33AK0DCwIQAYr+NADA/fP/0AGuAfj9FwBHAJMBhv7q/nn7VvwIAdb86QCC+rv+Kfyh/2oB7v5wAC8DKABN/yQAOgAmAIT/VQA0ANH/gQOrAR8DQgIbA7oDTADsAWn/ywGE/pr/0/8n//IE7QAOAoUE/AEl/tMAcALS/5f9ovjQAFwALwLp/iUETgAtAtwBOv6oAUcCvP32/xQAKv8xBT4A5wHL+qT+x/v8AIT/ywDCAAsBs//e/qoAfP58+DUAmgAq/tz+ZQDP/0j/CAIIAb3/LAJ//3n/z/+S/5sBHAC5/08A3v+tAYUBAwGnAPMAFgM0/6EA5v6H/5T6zv9QAIoGDv2OAKUALABW/+sAxQBPAS0ACwC/ANkAUAFsAHADhwJg/5sBBf/PAEH93f2+AeQDFQDS/3YAPP2Q/jECWQAU/4790ATvAWcC5v2e/7X+yv+A/rcBLv4g/9UAnP+VAukA+P5OACQA4gIfALz/if/y/9MA4P8d/tsE4AGe+tP/pgEBAbX8g/7S/7gA8/7jBWIASfoFAvQCLQVY/Kj8y/2z/7cBl/+6/4P9cQDGAggBDgBbAY3/IgEr/jwAQADa/zMAb/0wBFgBV/r/AzIARP2dAD3+hvyJAMv9mAWcAJsAUP6iAL3/8/6p/+f/EQKM/lsAT/+2+wv+JgDy/Qf/sAGJADL+CwLQ/74Aov57An779QBFAPP/QgLyAMr/kwDVAEn9V/3UAPj//QGzAjH/7AKY+7YBHf8rAPsAAwELAar/OPxgBAECU/+fAKMBUALIAPQADgR8+cABiwLS/ewCRwBOAU4D9AFtAKf7EAOAAbME3/4jAZH/Lf1SA2QCrv/VAHgE2/ay/kv9AQI7APUA/gD3AFz+wgIt/Zb8NQDj/jYBQP9VANIAuv8yA0IAwP5MAFP//v9X/+X+rwFkANoA2/47Aaz/t/6J/58D8QFm/8X/hgFYArgAXgAm/p4Ecf85/+sEwf/W//UCwP5M/oX+Of2C/+H8iv4LATQCwgLW/nwC6gATArMDQQQfAPH/UwKf/0D/Xv3v/pr7agG9/nL+WwB2+2kA2P/Z/4EAQP6CBab/FwFhAET+BgAeACv/u/+8/Y8Ay/9L/pgBO/8SAZsA/gGD/psDHAGqADoBiQBqAvv6ogES/lkBFQCyAQsAWv7kAJEBkf5+/wIAwACHAzkBLwHGAMD/rgNGAlcBk/0dAHkCGwAw/rEDJgKMAKX8bgCGAaf9OwAEAJ8A0/+IAPT+mfwc/+T7Z/w7/Uz+/Pyo/6oB7QEDANf/1Pqj/hYAEf/OABb/av8F/cYAtAFZAdP66QI0AMX+nv/3/AT78wCO/cv9VPxZ/ZkAXQA4/kEByAXgAOYCKgAUAOP+bQEsAgoAcACO/u/+mv+oAGMEHQF1/hH/tf1G/p79Hf2I/Qz9wQY6B1sD3wE4A1wAVv7gACECeP9J/VUBJ/5d/78A+/+eA0kFiADBAaQBOweoAq8BGv/lAcf+SQCX/47/eAODADD8aQW3/yv+NAK2AWMJFQL1AGQDCACwAMP+8AAyACcAKAGz/TUCGAMnAxECCwFTAH0BXv93/OD83AA2/SEB2feaAKz86f8zAIsATv7Z/wQDw//n/4b8awHi/4X9QAA0/zP/PP80/Y0BBv/4/MP+9f7d+y8ALv8j/6b/5P7B/Hv+2wGbAO3/GAAI/73+Gv9qAKz+if/a/hMAfQDvAmUBRP3zA/ECAAKX/nMDpQDj/539FP/lAPkCg//J/lAAawEiAgP/ygJAA8X8K/6V/pUAV/+lAP0ATgKCAfgFVAJIAbz+dvz0+8H/m/7HAccCHAiKAzP/Qv/z/979qQKX/9YAdv55Ac7+OgIvA/oA1AJuAHYAhv+8+VQB0gGlAR8CrAEzAokB3ADgA+73fvucAnABv/zAAEcCaP+w/+b/xgAPAc//mwH0/9wF7gD4+5kB9/7o/B/+Av9+AnYAUgBT+kr72f2B/zX8rAPHANr/2gEZAeL/WvhMBmf+i/yg+u/+uQHI/sUA3AC6BAf9Kv/5AjUCiQO4AMkBMwRRAnL/hgH7//UGWAHaA7YBJv3E/pgBmP+fASUAegBgASIBmv5iBHgCR/85/NACQ/5b/f7/O/smAGsDFQB8ALj7cQKx/Zr+jQDAAsP+QQHZ/XoBQgGCALUANAHK/Wf9Qf/S/zj+Cf/p/ZD9RgLjAssCMADsAScArv3M/w3/9f0M/VUAmP+tAOn/mQCtBeYDiwSuA8QAdgCV/1cAbwLyBRAAUwAF/wD/BP10ALT8pP3GARoBJv+zAU0EYP9F/5wBLv5B/ycAcgQoAFMAhAW5+KD74f4C/TT/UADR/r78u/+J/Sz6DQC7/JH/efqOALX8UP7q/W78A/6C/QwBjgIxABwAafgZAQIBQgDR/tn+u/pGAmwFKwG3/+D//P3B+5wA6AB6//cC1ADY/YP/9gCpAC3/WP+X/5f/ov+mAPAAGwOUATAA4AGfAZ0A2QCCAQAC9QDeAUICIgPpAfMA/AFCAK0BewCuAO7/yv7G/hMBUv8q/yv/g/6sAZUDWQC0APH9rv9B/tD+vwCIAd7/egEMAAL+X/8SAXoBFQB3AIr+nwGc/zH+2v6IAokMxABtAHD+GgGM/wYFs/95/BAAVP/5/UwFMgDK/gwBr/+DAS0ElAF9/7L/zf+rAacAx/1GAnr9sAEmBWMCdgBd/2r9Dv2z/g8B2/0jAEP9LPz3/8P+af+lAdD7sQdf/9Ptm/5xAO0Apf0V/b/9nf45/nX5XQB9AnX9twD+/xEBqAEt/5QApQOe/3QC2gC7Af0DCAK3BZL+fP4uAC0BVAGLARwAmQEcAxcD3/vT/3EAhgGwAhQCfvxPAQH/DgFFAcj/5wAqAGP9OP8VAlkCv/+EAFD+DgC//LYDmf1eA3j+eAE2BFgBPgOMAOz+JwHb/twA+AEdAVUAqgA/AVUFVQKD/3IAOQRmBJH/ugQw/4j/oABMAEj9Y/8hAGX/twDL/+v/AAN7AJz/YgCeAIEA3wG7APsAAQN8AggCzgCo/ycDSwO1/vIAzPx0/3j+/QGXAFgAlf8dAo4Auv79/X392QBhAur+BQPNAJUAFAQIAun9eAAw/1YAigDlADICEgPjAwcF2gFeAVsA5gC4Au4CcACbAen/1f2bAZb+Qv4CARUBKAR+AswBmwKQASsCEQR8AaIBEQTBAlYDNgP5BXcBnf1i/YQEnwOgARH++gC+AdoA",MAGIC=[68,66,71,49],VERSION=1,EMPTY_KEY=4294967295;function decodeVarUint(A,B){let Q=0,E=0;for(;;){const g=A[B.value++];if(E|=(127&g)<<Q,0==(128&g))return E>>>0;Q+=7}}function nextPow2(A){let B=1;for(;B<A;)B<<=1;return B}function keyHash(A){let B=A>>>0;return B^=B>>>16,B=Math.imul(B,2146121005),B^=B>>>15,B=Math.imul(B,2221713035),B^=B>>>16,B>>>0}function base64ToBytes(A){const B=atob(A),Q=new Uint8Array(B.length);for(let A=0;A<B.length;A+=1)Q[A]=B.charCodeAt(A);return Q}function parseModelBytes(A){const B=new DataView(A.buffer,A.byteOffset,A.byteLength);let Q=0;for(const A of MAGIC)if(B.getUint8(Q++)!==A)throw new Error("Invalid model header.");const E=B.getUint16(Q,!0);if(Q+=2,Q+=2,1!==E)throw new Error(`Unsupported model version: ${E}`);const g=B.getFloat32(Q,!0);Q+=4;const w=B.getFloat32(Q,!0);Q+=4;const C=B.getFloat32(Q,!0);Q+=4;const D=B.getUint32(Q,!0);Q+=4;const I=B.getUint32(Q,!0);Q+=4;const M=new Int16Array(A.buffer,A.byteOffset+Q,256);Q+=M.byteLength;const P=A.subarray(Q,Q+I);Q+=I;const f=new Int16Array(A.buffer,A.byteOffset+Q,D),e=new Uint32Array(D);let v=0;const H={value:0};for(let A=0;A<D;A+=1)v+=decodeVarUint(P,H),e[A]=v>>>0;const c=nextPow2(Math.max(8,2*D)),o=new Uint32Array(c),t=new Int16Array(c);o.fill(EMPTY_KEY);for(let A=0;A<D;A+=1){const B=e[A];let Q=keyHash(B)&c-1;for(;o[Q]!==EMPTY_KEY;)Q=Q+1&c-1;o[Q]=B,t[Q]=f[A]}return{bias:g,unigramScale:w,bigramScale:C,unigramWeights:M,tableKeys:o,tableWeights:t}}const model=parseModelBytes(base64ToBytes(MODEL_BASE64)),encoder=new TextEncoder,mask=model.tableKeys.length-1;function lookupPairWeight(A){let B=keyHash(A)&mask;for(;;){const Q=model.tableKeys[B];if(Q===EMPTY_KEY)return 0;if(Q===A)return model.tableWeights[B]/model.bigramScale;B=B+1&mask}}
    function countTokensApprox(A){const B=encoder.encode(A);let Q=model.bias,E=256;for(let A=0;A<B.length;A+=1){const g=B[A];Q+=model.unigramWeights[g]/model.unigramScale,Q+=lookupPairWeight(257*E+g),E=g}return Q+=lookupPairWeight(257*E+256),Q};
    
    return {
      countTokens: function(text) {
        return Math.ceil(countTokensApprox(text));
        // return Math.ceil(text.length/3.6); // old, very bad approximation
      },
      idealMaxContextTokens: 6000, // this is just a recommendation - not a fundamental limit. and it will increase over time.
    };
  }
  // console.debug("inputData:", inputData);
  if(!inputData) return "(Error: No input data given to the ai text plugin.)";
  if(inputData.instructions) {
    if(inputData.outputTo) {
      inputData.outputTo.value = "(Error: Looks like you wrote 'instructions = ...' instead of 'instruction = ...' in your ai-text-plugin prompt data?)";
    } else {
      return "(Error: Looks like you wrote 'instructions = ...' instead of 'instruction = ...' in your ai-text-plugin prompt data?)";
    }
  }
  
  if(typeof inputData === "string" || inputData instanceof String) {
    inputData = {instruction:inputData+""}
    if(!extraOpts) extraOpts = {};
    if(extraOpts.startWith) inputData.startWith = extraOpts.startWith;
    if(extraOpts.stopSequences) inputData.stopSequences = extraOpts.stopSequences;
    if(extraOpts.hideStartWith) inputData.hideStartWith = extraOpts.hideStartWith;
    if(extraOpts.outputTo) inputData.outputTo = extraOpts.outputTo;
    if(extraOpts.outputTo) inputData.outputTo = extraOpts.outputTo;
    if(extraOpts.onChunk) inputData.onChunk = extraOpts.onChunk;
    if(extraOpts.onStart) inputData.onStart = extraOpts.onStart;
    if(extraOpts.onFinish) inputData.onFinish = extraOpts.onFinish;
    if(extraOpts.render) inputData.render = extraOpts.render;
    if(extraOpts.endButtons) inputData.endButtons = extraOpts.endButtons;
  }
  
  // REMEMBER: if you add more inputs, you need to also update `window.__continueAiTextResponseClickHandler`
  let hideStartWith = inputData.hideStartWith; // get the 'concrete' value in case it was dynamic like `hideStartWith = [ ... ]` - this is important because the condition in the square brackets could change later
  
  let instruction = inputData.instruction;
  // Vision attachments: `instruction` may be an ARRAY of text parts and at
  // most ONE image Blob/File (png/jpeg/webp; GIF is not supported). The image
  // is inserted into the prompt exactly where it appears in the array. Example:
  //   generateText({instruction: ["Describe this image:", imageBlob], startWith: "..."})
  if(Array.isArray(instruction) && instruction.some(p => (typeof Blob !== "undefined" && p instanceof Blob))) {
    let imageCount = 0;
    instruction = instruction.map(part => {
      if(part instanceof Blob) {
        imageCount++;
        if(imageCount > 1) throw new Error("ai-text-plugin: only ONE image attachment is allowed per generateText call.");
        if(!/^image\/(png|jpeg|webp)$/.test(part.type)) throw new Error(`ai-text-plugin: attachment must be a png/jpeg/webp image Blob (got type "${part.type || "unknown"}"). GIFs are not supported.`);
        if(part.size > 20*1024*1024) throw new Error("ai-text-plugin: attachment image is too large (max 20MB before re-encoding).");
        return part;
      }
      if(typeof part === "function") { let v = part({}); return typeof v === "string" ? v : v.toString(); }
      if(part && typeof part !== "string" && part.evaluateItem !== undefined) return part.evaluateItem.toString();
      return String(part ?? "");
    });
    // NOTE: `instruction` stays an ARRAY from here on; text-only helpers below
    // use instructionTextOnly.
  } else if(typeof instruction === "function") {
    instruction = instruction({}); // this is useful as a way to give a string that should not be evaluated - since e.g. instruction = [textareaEl.value] will actually evaluate the text when we call inputData.instruction
    if(typeof instruction !== "string") instruction = instruction.toString();
  } else if(Array.isArray(instruction) && instruction.evaluateItem === undefined) {
    // Text-only ARRAY from plain JS (2026-08-24 bug report: root.generateText({instruction:
    // ["hello"]}) threw "reading 'toString'"): no Blob, so the vision branch above skips it,
    // and no perchance evaluateItem wrapper, so the generic branch below crashed. Treat the
    // parts as text, same per-part rules as the vision branch, joined.
    instruction = instruction.map(part => {
      if(typeof part === "function") { let v = part({}); return typeof v === "string" ? v : v.toString(); }
      if(part && typeof part !== "string" && part.evaluateItem !== undefined) return part.evaluateItem.toString();
      return String(part ?? "");
    }).join("");
  } else if(instruction) {
    if(typeof instruction !== "string") {
      instruction = instruction.evaluateItem;
    }
    instruction = instruction.toString();
  } else {
    instruction = "Write something."; // default instruction
  }
  const instructionTextOnly = Array.isArray(instruction) ? instruction.filter(p => !(typeof Blob !== "undefined" && p instanceof Blob)).join("") : instruction;
  
  let startWith = inputData.startWith;
  if(typeof startWith === "function") {
    startWith = startWith({}); // this is useful as a way to give a string that should not be evaluated - since e.g. startWith = [textareaEl.value] will actually evaluate the text when we call inputData.startWith
    if(typeof startWith !== "string") startWith = startWith.toString();
  } else if(startWith) {
    if(typeof startWith !== "string") {
      startWith = startWith.evaluateItem;
    }
    startWith = startWith.toString();
    // We trim whitespace off the end due to the classic tokenizer problem (most word tokens start with a space as of 2023 tokenizers).
    // This of course does mean that you can't "force" the model to start with a space after a word, but it's worth that trade-off until we get models with better tokenizers.
    startWith = startWith.replace(/ +$/g, ""); // CAUTION: Don't trim newlines - only spaces. Because e.g. the story writer demo relies on being able to start with 2 new lines before the paragraph that the AI is about to generate, since if the AI generates them, it'll trigger the stop sequence before it even gets to start writing the new paragraph
  } else {
    startWith = "";
  }

  let stopSequences = inputData.stopSequences;
  if(typeof stopSequences === "function") {
    stopSequences = stopSequences({});
  } else if(stopSequences) {
    if(!Array.isArray(stopSequences)) {
      stopSequences = stopSequences.selectAll.map(n => n.evaluateItem);
    }
  } else {
    stopSequences = [];
  }
  
  let textareaLoadingIndicatorHandler;
  
  // REMEMBER: if you add more inputs, you need to also update `window.__continueAiTextResponseClickHandler`
  
  let concreteInputs = {startWith, instruction, stopSequences};  // <-- CAUTION: the startWith property of this is set to the full startWith+generatedText after generation, and the startWith can be changed after generation for the `editAiTextResponseClickHandler` feature - ctrl+f for `concreteInputs.startWith =`. Use `originalConcreteInputs` for original inputs.
  // structuredClone (not JSON stringify) so image Blobs in array-form
  // instructions survive; fall back to JSON for exotic environments.
  let originalConcreteInputsClone;
  try { originalConcreteInputsClone = structuredClone(concreteInputs); }
  catch(e) { originalConcreteInputsClone = JSON.parse(JSON.stringify({...concreteInputs, instruction: instructionTextOnly})); }
  const originalConcreteInputs = Object.freeze(originalConcreteInputsClone);

  let placeholderEl;
  let placeholderElDidInitiallyExist = false; // this is for keepalive stuff - so we can cancel a queued up generation if the placeholder is removed
  let userStoppedGeneration = false;
  
  let textStreamController;
  const textStream = new ReadableStream({
    start(c) {
      textStreamController = c;
    }
  });
  
  let darkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const animatedLoadingSvg = `<svg style="${darkModeEnabled ? "filter:invert(0.85);" : ""} height:1rem; width:2rem; overflow:hidden; border-radius:3px; vertical-align:top; position:relative; top:0.07rem; margin-left:0.125rem;" height="1rem" width="2rem" class="ai-text-plugin-loader"> <circle class="ai-text-plugin-dot" cx="0.5em" cy="0.5em" r="0.2em" style="fill:grey;"></circle> <circle class="ai-text-plugin-dot" cx="1em" cy="0.5em" r="0.2em" style="fill:grey;"></circle> <circle class="ai-text-plugin-dot" cx="1.5em" cy="0.5em" r="0.2em" style="fill:grey;"></circle> </svg>`;
  
  let generatedText = "";
  let finishedGenerating = false;
  let thereWasAnErrorDuringGeneration = false;
  
  let onFinishPromiseResolver;
  let onFinishPromiseRejecter;
  let onFinishPromise = new Promise((resolve, reject) => {
    onFinishPromiseResolver = resolve;
    onFinishPromiseRejecter = reject;
  });
  
  let completionId = "aiTextCompletion"+Math.random().toString().replace(".", "");
  let lastGeneratedChunkReceivedTime = null;
  const generationStartTime = Date.now(); // arms the silent-stream backstop even when NO chunk ever arrives (2026-08-26 bug report: no-first-chunk hangs were un-timed-out forever)

  async function streamTextFromIframe(chunkCallback) { 
    let postData = {};
    postData.instruction = concreteInputs.instruction || "";
    postData.startWith = concreteInputs.startWith || "";
    postData.stopSequences = concreteInputs.stopSequences || [];
    postData.generatorName = window.generatorName;

    if(Array.isArray(postData.instruction)) {
      // apply marker to the first text part with a space
      let parts = postData.instruction.slice();
      let marked = false;
      for(let i = 0; i < parts.length; i++) {
        if(typeof parts[i] === "string" && parts[i].includes(" ")) { parts[i] = parts[i].replace(" ", " "); marked = true; break; }
      }
      if(!marked) {
        for(let i = parts.length - 1; i >= 0; i--) {
          if(typeof parts[i] === "string") { parts[i] = `${parts[i]} `; marked = true; break; }
        }
        if(!marked) parts.push(" ");
      }
      postData.instruction = parts;
    } else {
      postData.instruction = postData.instruction.replace(" ", " ");
      if(!postData.instruction.includes(" ")) { postData.instruction = `${postData.instruction} `; }
    } 
    
    let url = `${serverOrigin}/api/generate`;
    let haveReceivedFirstTextChunk = false;
    let haveReceivedLastTextChunk = false;
    let retriedUnknownRequestId = false;
    function messageHandler(event) {
      if(event.data.requestId !== completionId) return;
      
      // console.debug("streamTextFromIframe messageHandler:", event.data);
      if(event.data.type === "streamData") {
        lastGeneratedChunkReceivedTime = Date.now();
        let text = event.data.value.text;
        let data = {text};
        if(event.data.value.stopReason) data.stopReason = event.data.value.stopReason;
        
        // console.debug("event.data.value:", event.data.value);
        if(!haveReceivedFirstTextChunk) {
          data.isFirstChunk = true;
          haveReceivedFirstTextChunk = true;
        }
        if(haveReceivedLastTextChunk) {
          console.error("haveReceivedLastTextChunk but about to send another chunk??? maybe recieving streamEnd before it's actually finished??");
        }
        if(event.data.value.final) {
          data.isLastChunk = true; // remember, a chunk can be both the first *and* last chunk
          haveReceivedLastTextChunk = true;
        }
        chunkCallback(data);
      } else if (event.data.type === "streamEnd") {
        // console.debug(`ai-text-plugin Received 'streamEnd' for ${completionId}`);
        window.removeEventListener("message", messageHandler);
        if(!haveReceivedLastTextChunk) {
          // this can happen if stream is aborted, or if .stop() was called in userland, and perhaps for other reasons, so we send a last "dummy" chunk
          chunkCallback({text:"", stopReason:"user", isLastChunk:true, isFirstChunk:!haveReceivedFirstTextChunk});
          haveReceivedLastTextChunk = true;
        }
      } else if (event.data.type === "streamError") {
        if(userStoppedGeneration && event.data.status === "stale") {
          // this is not actually an error, but iframe embed can't know that, so it sends us this, which we just ignore.
        } else if(event.data.status === "unknown_request_id" && !haveReceivedFirstTextChunk && !finishedGenerating && !retriedUnknownRequestId) {
          // (2026-08-24 bug report): the embed self-reloads to escape a wedged verification,
          // wiping its known-request registry — every in-flight/queued generation then surfaced
          // a red "error: unknown request id" banner mid-play. This plugin still holds the full
          // request, so re-issue it ONCE instead of failing (only when no text has arrived yet;
          // a partially-streamed generation keeps the honest error path below).
          retriedUnknownRequestId = true;
          console.warn("ai-text-plugin: embed forgot this request (likely an embed reload) — re-issuing startStream once");
          setTimeout(() => {
            try { if(iframe && iframe.contentWindow) iframe.contentWindow.postMessage({ type: "startStream", url, postData, requestId:completionId, perchanceGeneratorOrigin:window.location.origin }, serverOrigin); } catch(e) { console.error(e); }
          }, 1000);
          return; // keep listening — the retried stream reuses this handler
        } else {
          if(!finishedGenerating) { // <-- just to guard against weird timing stuff
            thereWasAnErrorDuringGeneration = true;
            chunkCallback({text:"", error:true, isLastChunk:!haveReceivedLastTextChunk, isFirstChunk:!haveReceivedFirstTextChunk});
            let div = document.createElement("div");
            div.innerHTML = `<div style="z-index:1000; position: fixed; bottom: 1rem; width: 100%; pointer-events:none;"><span style=" padding: 0.5rem; background: #ac2c2c; border-radius: 3px; color: white; pointer-events:auto;">error: ${event.data.status.replaceAll("_", " ")}</span></div>`;
            div = div.firstElementChild;
            document.body.appendChild(div);
            setTimeout(() => {
              div.remove();
            }, 1000*5);
          }
        }
        window.removeEventListener("message", messageHandler);
      }
    }
    
    window.addEventListener("message", messageHandler);
    
    while(!window.__aiTextIframeEmbedIsReady) {
      await new Promise(r => setTimeout(r, 100));
    }
    if(inputData._debug) postData._debug = JSON.parse(JSON.stringify(inputData._debug));
    if(!iframe || !iframe.isConnected || !iframe.contentWindow) {
      // the embed iframe vanished mid-flight (e.g. generator code rewrote document.body) — fail this generation cleanly through the normal error path instead of throwing an unhandled rejection from inside a timer (2026-08-24). The next $output call rebuilds the embed.
      console.error("ai-text-plugin: embed iframe is missing/detached — failing this generation cleanly");
      window.removeEventListener("message", messageHandler);
      thereWasAnErrorDuringGeneration = true;
      chunkCallback({text:"", error:true, isLastChunk:true, isFirstChunk:!haveReceivedFirstTextChunk});
      return;
    }
    iframe.contentWindow.postMessage({ type: "startStream", url, postData, requestId:completionId, perchanceGeneratorOrigin:window.location.origin }, serverOrigin);
    // console.debug("sent startStream request to iframe");
  }

  async function editAiTextResponseClickHandler(el) {    
    let saveButton = document.createElement("button");
    saveButton.style.cssText = "position:fixed; z-index:501;";
    saveButton.textContent = "💾";
    document.body.append(saveButton);

    let textarea = document.createElement("textarea");
    textarea.style.cssText = "z-index:500; display:block; position:fixed; min-height:2rem; min-width:10rem;";
    textarea.value = concreteInputs.startWith;
    document.body.append(textarea);
    let updateCoverPosition = () => {
      let rect = el.getBoundingClientRect();
      textarea.style.left = `${rect.left}px`;
      textarea.style.top = `${rect.top}px`;
      textarea.style.width = `${rect.width}px`;
      textarea.style.height = `${rect.height+10}px`;

      let textareaRect = textarea.getBoundingClientRect(); // Use coverElement's dimensions
      saveButton.style.left = `${textareaRect.right-saveButton.offsetWidth}px`;
      saveButton.style.top = `${textareaRect.bottom}px`;
    };
    updateCoverPosition();
    window.addEventListener('scroll', updateCoverPosition);
    window.addEventListener('resize', updateCoverPosition);
    
    const observer = new MutationObserver((mutationsList) => {
      for(let mutation of mutationsList) {
        for(let node of mutation.removedNodes) {
          if(node.contains(el)) {
            textarea.remove();
            saveButton.remove();
            window.removeEventListener('scroll', updateCoverPosition);
            window.removeEventListener('resize', updateCoverPosition);
            observer.disconnect();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    await new Promise(r => saveButton.onclick=r); 

    let endButtonsCtn = el.querySelector(".ai-text-response-end-buttons-ctn");
    endButtonsCtn.remove();

    concreteInputs.startWith = textarea.value;
    
    // we do this because the onFinishPromise is actually the return value of this function, but it also serves as an object with a bunch of handy properties like .liveResponseText, .stop(), etc.
    onFinishPromise.liveResponseText = textarea.value;
    
    // el.innerHTML = textarea.value;
    // el.appendChild(endButtonsCtn);
    renderResponseTextIntoContainer(textarea.value, {addEndButtons:true, isFinalRender:true});

    window.removeEventListener('scroll', updateCoverPosition);
    window.removeEventListener('resize', updateCoverPosition);
    textarea.remove();
    saveButton.remove();
  };
  
  async function continueAiTextResponseClickHandler(el, opts={}) {    
    let instruction = concreteInputs.instruction;
    let startWith = concreteInputs.startWith;
    let stopSequences = concreteInputs.stopSequences;
    
    if(opts.appendContinuationSuffix) startWith += "\n";
    
    responseEndButtonsCtn.remove();
    let obj = $output({instruction, startWith, stopSequences, style:inputData.style, outputTo:el, render:inputData.render, onFinish:inputData.onFinish, onChunk:inputData.onChunk});
    el.innerHTML += obj.loadingIndicatorHtml;
    let result = await obj;
    if(!opts.appendContinuationSuffix && result.generatedText === "" && !result.text.endsWith("\n\n")) {
      // no text was generated, so try again with a suffix that's likely to trigger more text.
      // TODO: maybe check stopReason here too?
      continueAiTextResponseClickHandler(el, {appendContinuationSuffix:true})
    }
  };
  
  let responseEndButtonsCtn;
  {
    let buttonGap = "0.25rem";
    if(window.innerWidth < 600) buttonGap = "1.5rem";
    
    let darkModeEnabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let responseEndButtonsHtml = `<span class="ai-text-response-end-buttons-ctn" style="display: inline-flex;background:${darkModeEnabled ? "#666666" : "#f1f1f1"};color: ${darkModeEnabled ? "#d5d5d5" : "grey"};height: 1rem;width: 1rem;border-radius: 3px;vertical-align: top;position: relative;top: 0.07rem;margin-left: 0.125rem;align-items: center;justify-content: center;cursor: pointer; font-size:80%">
      <div class="ai-text-response-buttons-wrapper">
        <button class="ai-text-continue-button" style="height:min-content;">▶️</button>
        <button class="ai-text-edit-button" style="height:min-content; margin-left:${buttonGap}">✏️</button>
      </div>
    </span>`;
    responseEndButtonsCtn = document.createElement("div");
    responseEndButtonsCtn.innerHTML = responseEndButtonsHtml;
    responseEndButtonsCtn = responseEndButtonsCtn.firstElementChild;
    if(inputData.endButtons?.evaluateItem === "none") {
      responseEndButtonsCtn.style.display = "none";
    }
    responseEndButtonsCtn.querySelector(".ai-text-continue-button").onclick = function() {
      // console.debug("wrapper display:", this.closest('.ai-text-response-buttons-wrapper').style.display);
      let responseCtn = this.closest(".ai-text-response-end-buttons-ctn").__aiTextResponseCtn || this.closest('.ai-text-response-ctn');
      continueAiTextResponseClickHandler(responseCtn);
    };
    responseEndButtonsCtn.querySelector(".ai-text-edit-button").onclick = function() {
      // console.debug("wrapper display:", this.closest('.ai-text-response-buttons-wrapper').style.display);
      let responseCtn = this.closest(".ai-text-response-end-buttons-ctn").__aiTextResponseCtn || this.closest('.ai-text-response-ctn');
      editAiTextResponseClickHandler(responseCtn);
    };
  }
  
  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  
  let startWithRegex;
  
  function renderResponseTextIntoContainer(response, opts={}) {
    if(!inputData.outputTo && !placeholderEl) return; // <-- indicates that they're doing things manually with e.g. onFinishPromise/onChunk/etc.
    
    if(hideStartWith) { // note that `hideStartWith` is purely 'visual' - it's just a handy helper for a common case (that could otherwise be solved with `render`)
      if(!startWithRegex) startWithRegex = new RegExp("^"+escapeRegExp(concreteInputs.startWith));
      response = response.replace(startWithRegex, "");
    }
    if(inputData.render) {
      response = inputData.render({text:response, isPartial:!opts.isFinalRender});
    }
    if(inputData.outputTo) {
      if(typeof inputData.outputTo.value == "string") { // textarea, input, or user's custom object with string `.value` property
        inputData.outputTo.value = response;
        if(inputData.outputTo.tagName === "TEXTAREA") {
          if(inputData.outputTo.scrollTop > (inputData.outputTo.scrollHeight - inputData.outputTo.offsetHeight)-30) { // <-- if the text box is already scrolled near the end of the text
            inputData.outputTo.scrollTop = 9999999999; // scroll down to bottom of text box
          }
        }
      } else {
        inputData.outputTo.innerHTML = response;
        if(opts.addEndButtons) {
          responseEndButtonsCtn.title = `Inputs that were used:\n\ninstruction=${Array.isArray(concreteInputs.instruction) ? concreteInputs.instruction.map(p => (typeof Blob !== "undefined" && p instanceof Blob) ? "[image]" : p).join("") : concreteInputs.instruction}\n\nstartWith=${concreteInputs.startWith}`;
          responseEndButtonsCtn.__aiTextResponseCtn = inputData.outputTo;
          inputData.outputTo.append(responseEndButtonsCtn);
        }
      }
    } else {
      if(typeof placeholderEl.value == "string") { // textarea, input, or user's custom object with string `.value` property
        placeholderEl.value = response;
      } else {
        placeholderEl.innerHTML = response;
        if(opts.addEndButtons) {
          responseEndButtonsCtn.title = `Inputs that were used:\n\ninstruction=${Array.isArray(concreteInputs.instruction) ? concreteInputs.instruction.map(p => (typeof Blob !== "undefined" && p instanceof Blob) ? "[image]" : p).join("") : concreteInputs.instruction}\n\nstartWith=${concreteInputs.startWith}`;
          placeholderEl.append(responseEndButtonsCtn);
        }
      }
    }
  }
  
  let gotFirstChunk = false;
  let chunks = [];
  let generatedChunks = []; // difference from `chunks` is that this doesn't include the user-specified `startWith` text
  let alreadyDoneOnFinishStuff = false; // just as an extra guard against bugs
  
  function doOnFinishStuff({stopReason}) {
    if(alreadyDoneOnFinishStuff) return; // this is possible because e.g. userland onChunk can synchronously call .stop(), so it gets executed after last chunk arrival via stopFn(), but before 'normal' doOnFinishStuff call
    alreadyDoneOnFinishStuff = true;

    console.debug("FINISHED STREAMING.");

    let finishData = new String(chunks.join(""));
    finishData.text = chunks.join("");
    finishData.generatedText = generatedChunks.join("");
    finishData.stopReason = stopReason;

    if(inputData.onFinish) {
      try { inputData.onFinish(finishData); } catch(e) { console.error("error in onFinish:", e); }
    }
    onFinishPromiseResolver(finishData);
    generatedText = generatedChunks.join("");

    if(textareaLoadingIndicatorHandler) textareaLoadingIndicatorHandler.stop();
    try { textStreamController.close(); } catch(e) { console.error(e); }
  }
  function stopFn() {
    if(finishedGenerating) return;
    finishedGenerating = true;

    if(!gotFirstChunk && placeholderEl) placeholderEl.innerHTML = ""; // clear the svg 'loading' dots

    doOnFinishStuff({stopReason:"user"});
  }

  async function startStreamingResponse() {
    try {
      (async function() {
        await new Promise(r => setTimeout(r, 500));
        while(true) {
          if(userStoppedGeneration) {
            console.debug("stopping keepalives due to `userStoppedGeneration`");
            break;
          }
          if(finishedGenerating) { console.debug("stopping keepalives due to `finishedGenerating`"); break; }
          if(placeholderElDidInitiallyExist && !document.querySelector(`#${completionId}`)) { console.debug("stopping keepalives due to `placeholderEl`"); break; } // placeholderEl no longer exists in the DOM, so user probably clicked 'randomize' or whatever while previous one was still loading, hence we abort previous one by stopping the keepalives, which drops it from the queue
          if(inputData.outputTo && (!document.body.contains(inputData.outputTo) || inputData.outputTo.dataset.aiTextCompletionId !== completionId))  { console.debug("stopping keepalives due to `outputTo`"); break; }
          // Silent-stream backstop (2026-08-24; armed-from-start 2026-08-26): if no chunk has
          // arrived for 600s — measured from the last chunk, or from request start when no chunk
          // EVER arrived (the previously-uncovered case: e.g. a wedged server slot answering
          // waiting_for_prev forever, or a broken embed channel) — the generation is dead:
          // finalize honestly instead of hanging forever with keepalives running.
          if(Date.now() - (lastGeneratedChunkReceivedTime !== null ? lastGeneratedChunkReceivedTime : generationStartTime) > 1000*600) {
            // 600s, not 120s (2026-08-25 owner decision): the embed's own recovery ladder
            // (60s watchdog -> continuation retries) takes up to ~6.5min worst-case; a
            // shorter backstop could finalize partial text that WOULD have recovered,
            // and generators rarely handle errors — so this only catches true zombies.
            try { navigator.sendBeacon && navigator.sendBeacon("https://ai-agent.perchance.org/api/aiAgent/clientLog", new Blob([JSON.stringify({ kind: "ai-text-backstop-fired", detail: lastGeneratedChunkReceivedTime === null ? "no first chunk within " + Math.round((Date.now()-generationStartTime)/1000) + "s of request start" : "silent " + Math.round((Date.now()-lastGeneratedChunkReceivedTime)/1000) + "s after streaming began", generator: String(window.generatorName || "") })], { type: "text/plain" })); } catch(e) {}
            console.error("ai-text-plugin: no chunks for 600s (" + (lastGeneratedChunkReceivedTime === null ? "stream never started" : "stream had started") + ") — finalizing as interrupted (silently-dead stream)");
            let allChunksJoined = chunks.join("");
            thereWasAnErrorDuringGeneration = true;
            finishedGenerating = true;
            concreteInputs.startWith = allChunksJoined;
            renderResponseTextIntoContainer(allChunksJoined, {addEndButtons:true, isFinalRender:true});
            doOnFinishStuff({stopReason:"interrupted"});
            break;
          }
          
          try { iframe.contentWindow.postMessage({ type: "streamKeepAlive", requestId:completionId }, serverOrigin); }
          catch(e) { console.error("ai-text-plugin: keepalive failed (embed iframe gone?) — stopping keepalives for this generation", e); break; }
          console.debug("streamKeepAlive sent");
          await new Promise(r => setTimeout(r, 800));
          // if(window.devTest98375290385) await new Promise(r => setTimeout(r, 10000000000));
        }
        try { stopFn(); } catch(e) { console.error(e); }; // need to call stopFn() here (and not just wait for it to be called in streamTextFromIframe) because otherwise it only gets called if streamTextFromIframe gets called again, which it *might not*
        try { iframe.contentWindow.postMessage({ type: "stopStream", requestId:completionId }, serverOrigin); } catch(e) { console.error(e); };
      })();
      
      streamTextFromIframe(function(data) {
        if(userStoppedGeneration) {
          if(!finishedGenerating) stopFn();
          return;
        }
        if(placeholderElDidInitiallyExist && !document.querySelector(`#${completionId}`)) {
          if(!finishedGenerating) stopFn();
          return;
        }
        if(inputData.outputTo && (!document.body.contains(inputData.outputTo) || inputData.outputTo.dataset.aiTextCompletionId !== completionId)) {
          if(!finishedGenerating) stopFn();
          return;
        }
        if(finishedGenerating) {
          thereWasAnErrorDuringGeneration = true;
          console.error("We received a chunk of text even though we've already finishedGenerating?");
          return;
        }
        
        // add the startWith chunk before the first 'real' chunk:
        if(data.isFirstChunk && concreteInputs.startWith && !hideStartWith) {
          chunks.push(concreteInputs.startWith);
          textStreamController.enqueue(concreteInputs.startWith);
          if(inputData.onChunk) {
            inputData.onChunk({fullTextSoFar:chunks.join(""), textChunk:concreteInputs.startWith, isFromStartWith:true});
          }
        }
        
        if(data.error) {
          let allChunksJoined = chunks.join("");
          thereWasAnErrorDuringGeneration = true;
          finishedGenerating = true;
          
          concreteInputs.startWith = allChunksJoined;
          renderResponseTextIntoContainer(allChunksJoined, {addEndButtons:true, isFinalRender:true});
          
          doOnFinishStuff({stopReason:"error"});
        } else {
          generationLastKnownToBeWorkingAt = Date.now();
          if(data.isFirstChunk) {
            gotFirstChunk = true;
            if(placeholderEl) placeholderEl.innerHTML = ""; // clear the svg 'loading' dots
            if(inputData.beforeFirstChunk) {
              inputData.beforeFirstChunk({});
            }
          }
          
          generatedChunks.push(data.text);
          chunks.push(data.text);
          textStreamController.enqueue(data.text);
          
          if(inputData.onChunk) {
            try { // user-land handler may throw error
              inputData.onChunk({fullTextSoFar:chunks.join(""), textChunk:data.text}); // `data.text` is the full text so far (like in onFinish, render, etc.), and `data.chunk` is the most recent chunk (the one that triggered this call to onChunk)
            } catch(e) {
              console.error("Error in onChunk:", e);
            } 
          }

          onFinishPromise.liveResponseText = chunks.join("");
          
          renderResponseTextIntoContainer(chunks.join(""), {addEndButtons:!!data.isLastChunk, isFinalRender:!!data.isLastChunk});
          if(data.isLastChunk) {
            concreteInputs.startWith = chunks.join(""); // update the startWith for 'continue' and 'edit' button use
            finishedGenerating = true;
            doOnFinishStuff({stopReason:data.stopReason});
          }
        }
      });    

    } catch(e) {
      thereWasAnErrorDuringGeneration = true;
      finishedGenerating = true;
      // onFinishPromiseRejecter();
      doOnFinishStuff({stopReason:"error"});
      
      console.error(e);
      await new Promise(r => setTimeout(r, 1000));
      iframe.contentWindow.postMessage({type:"verifyUser"}, serverOrigin); // probably not necessary, but just in case (it'll only re-verify if it's actually needed anyway)
    }
  }
  
  function onVisible(element, callback) {
    new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.intersectionRatio > 0) {
          callback(element);
          observer.disconnect();
        }
      });
    }).observe(element);
    if(!callback) return new Promise(r => callback=r);
  }
    
  setTimeout(async () => {
    // give placeholderEl a chance to be put into the DOM
    placeholderEl = document.querySelector(`#${completionId}`); // this will be null if they're using outputTo or are just doing things fully manually onFinishPromise/onChunk/etc.
    if(placeholderEl) placeholderElDidInitiallyExist = true;
    // wait for placeholderEl to become visible:
    if(placeholderElDidInitiallyExist && !inputData.outputTo) {
      await onVisible(placeholderEl);
    }
    
    if(inputData.onStart) {
      inputData.onStart(onFinishPromise); // note that `onFinishPromise` has all the data attached, like `inputs`, `liveResponseText`, etc. - see below
      if(inputData.outputTo && inputData.outputTo.tagName === "TEXTAREA") {
        try { textareaLoadingIndicatorHandler = addTextareaLoadingIndicator(inputData.outputTo); } catch(e) { console.error(e); } // try/catch because new code
      }
    }
    startStreamingResponse(); 
  }, 100);
  
  let beforeLoaderHtml = "";
  if(!inputData.outputTo && !hideStartWith) {
    beforeLoaderHtml = inputData.render ? inputData.render({text:concreteInputs.startWith, isPartial:true}) : concreteInputs.startWith;
  }
  
  if(inputData.outputTo) {
    inputData.outputTo.dataset.aiTextCompletionId = completionId; // this is used for keepalive stuff - if a queued request is going to output to an outputTo element, but that element no longer has the correct `dataset.aiTextCompletionId` then we drop it from the queue
  }
  
  onFinishPromise.inputs = originalConcreteInputs;
  onFinishPromise.liveResponseText = concreteInputs.startWith; // this is full text (including startWith, which is why this property isn't called liveGeneratedText, or liveOutputText) and is live-updated as chunks come in. and note that it can also be edited by the user using the end buttons
  onFinishPromise.textStream = textStream;
  onFinishPromise.onFinishPromise = onFinishPromise; // backwards-compat with old return object
  onFinishPromise.stop = () => {
    userStoppedGeneration = true;
    try { stopFn(); } catch(e) { console.error(e); };
    try { iframe.contentWindow.postMessage({ type: "stopStream", requestId:completionId }, serverOrigin); } catch(e) { console.error(e); };
    return onFinishPromise; // <-- so .stop() returns the output data
  };
  onFinishPromise.id = completionId;
  onFinishPromise.loadingIndicatorHtml = animatedLoadingSvg; // <-- just a littler helper for people who are e.g. using onFinishPromise/onChunk/etc. but want to add a loading indicator to the page manually
  onFinishPromise.toString = function() { // this object stringifies into the default placeholder element
    return `<span class="ai-text-response-ctn" id="${completionId}" style="white-space:pre-wrap; ${inputData.style ? inputData.style : ""}">${beforeLoaderHtml}${animatedLoadingSvg}</span>`;
  };
  onFinishPromise.submitUserRating = async ({score, reason}) => {
    if(!finishedGenerating || thereWasAnErrorDuringGeneration) {
      console.error(thereWasAnErrorDuringGeneration ? "cannot rate because there was an error during generation" : "cannot rate because it hasn't finished generating yet");
      return;
    }
    if(isNaN(Number(score)) || Number(score) > 1 || Number(score) < 0) return alert(`User rating should be a value between 0 (bad) and 1 (good). Like 0.4 or 0.8, for example.`);
    score = Number(score);
    if(!reason) reason = "";
    iframe.contentWindow.postMessage({ type: "rateGeneratedText", instruction: instructionTextOnly, startWith, generatedText, generatorName:window.generatorName, score, reason }, serverOrigin);
  };
  return onFinishPromise;
  




// this was causing user-agent styles (specifically background color) to be removed in dark mode in chrome for some reason.
// it's a little too obtrusive anyway - ideally it would just be a "sliding line" that's only at the bottom of the textarea.
// or maybe a transparent loading indicator in the top-right of the textarea.
addTextareaLoadingIndicator(el) =>
  // const computedStyle = getComputedStyle(el);
  // const borderColor = computedStyle.borderColor;
  // // Convert border color to rgba with 30% opacity
  // const rgbaColor = borderColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, 'rgba($1, $2, $3, 0.3)');
  // const className = 'blink-' + Math.random().toString(36).substring(2, 15);
  // const style = document.createElement('style');
  // style.innerHTML = `
  //   @keyframes ${className}-blink {
  //     0%, 100% {
  //       border-color: ${borderColor};
  //     }
  //     50% {
  //       border-color: ${rgbaColor};
  //     }
  //   }
  //   .${className} {
  //     animation: ${className}-blink 1s infinite;
  //     border-color: ${borderColor}; /* must add this explicitly, since user-agent-only borders don't trigger the animation */
  //   }
  // `;
  // document.head.appendChild(style);
  // el.classList.add(className);
  return {
    stop: function() {
      // el.classList.remove(className);
      // document.head.removeChild(style);
    },
  };








character
  {mech|demon|cyberpunk} {warrior|minion|samurai}

place
  a retropunk distopia
  a small village
  a mountainous region
  an underwater cavern
  a = 10

season
  winter
  summer
  
poemPrompt
  instruction = Write a haiku about a [character] in [place] during [season].





```

## 02-external-code/perchance-plugins/kv-plugin/main.pjs

_4177 bytes_

```javascript
$output = [getKv()]

getKv() =>
  const moduleName = this.$root.$moduleName; // this is 'kv-plugin' - it's different to `window.generatorName` because that will be the name/url of the generator that imports this plugin, not this plugin's name/url. This is used in IndexedDB db/store name so forks of this plugin don't conflict with one another.
  
  if(!window.__kvPluginProxy7583683) {
    // let idbKeyval = await import("https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm");
    let idbKeyval = (function() { // This is v6.2.1
      function e(e){return new Promise(((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)}))}function t(t,n){const r=indexedDB.open(t);r.onupgradeneeded=()=>r.result.createObjectStore(n);const o=e(r);return(e,t)=>o.then((r=>t(r.transaction(n,e).objectStore(n))))}let n;function r(){return n||(n=t("keyval-store","keyval")),n}function o(t,n=r()){return n("readonly",(n=>e(n.get(t))))}function u(t,n,o=r()){return o("readwrite",(r=>(r.put(n,t),e(r.transaction))))}function c(t,n=r()){return n("readwrite",(n=>(t.forEach((e=>n.put(e[1],e[0]))),e(n.transaction))))}function s(t,n=r()){return n("readonly",(n=>Promise.all(t.map((t=>e(n.get(t)))))))}function a(t,n,o=r()){return o("readwrite",(r=>new Promise(((o,u)=>{r.get(t).onsuccess=function(){try{r.put(n(this.result),t),o(e(r.transaction))}catch(e){u(e)}}}))))}function i(t,n=r()){return n("readwrite",(n=>(n.delete(t),e(n.transaction))))}function l(t,n=r()){return n("readwrite",(n=>(t.forEach((e=>n.delete(e))),e(n.transaction))))}function f(t=r()){return t("readwrite",(t=>(t.clear(),e(t.transaction))))}function d(t,n){return t.openCursor().onsuccess=function(){this.result&&(n(this.result),this.result.continue())},e(t.transaction)}function h(t=r()){return t("readonly",(t=>{if(t.getAllKeys)return e(t.getAllKeys());const n=[];return d(t,(e=>n.push(e.key))).then((()=>n))}))}function y(t=r()){return t("readonly",(t=>{if(t.getAll)return e(t.getAll());const n=[];return d(t,(e=>n.push(e.value))).then((()=>n))}))}function p(t=r()){return t("readonly",(n=>{if(n.getAll&&n.getAllKeys)return Promise.all([e(n.getAllKeys()),e(n.getAll())]).then((([e,t])=>e.map(((e,n)=>[e,t[n]]))));const r=[];return t("readonly",(e=>d(e,(e=>r.push([e.key,e.value]))).then((()=>r))))}))}
      return {clear:f,createStore:t,del:i,delMany:l,entries:p,get:o,getMany:s,keys:h,set:u,setMany:c,update:a,values:y};
    })();
    
    let storeNameToStore = {};
    
    window.__kvPluginProxy7583683 = new Proxy({}, { // so api is like: kv.myStoreName.get(...)
      get(target, storeName, receiver) {
        
        let store = storeNameToStore[storeName];
        if(!store) {
          // NOTE: We don't need to include `window.generatorName` in the storeName because each generator has its own subdomain, and hence its own partitioned IndexedDB database.
          // CAUTION: changing the store naming (in createStore calls) will make previously-added data inaccessible!!! Don't change it.
          store = idbKeyval.createStore(`${storeName}-db-${moduleName}`, `${storeName}-store-${moduleName}`); // <-- creates if it doesn't already exist, but we have an extra cache on top of that anyway in case it's expensive
          storeNameToStore[storeName] = store;
        }
        
        return {
          // Reads:
          get: (key) => idbKeyval.get(key, store),
          has: (key) => idbKeyval.keys(store).then(keys => keys.includes(key)), // probably a bit inefficient, but fine for now
          getMany: (keys) => idbKeyval.getMany(keys, store),
          entries: () => idbKeyval.entries(store),
          keys: () => idbKeyval.keys(store),
          values: () => idbKeyval.values(store),
          // Writes/Mutations:
          set: (key, value) => idbKeyval.set(key, value, store),
          setMany: (entries) => idbKeyval.setMany(entries, store),
          update: (key, setterFn) => idbKeyval.update(key, setterFn, store),
          delete: (key) => idbKeyval.del(key, store),
          deleteMany: (keys) => idbKeyval.delMany(keys, store),
          clear: () => idbKeyval.clear(store),
        };
      },
    });
  }
  
  return window.__kvPluginProxy7583683;
```

## 04-project-resources/README.md

_28265 bytes_

```markdown
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

```

## 04-project-resources/SPEC.md

_10097 bytes_

```markdown
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

```

## 04-project-resources/TODO.md

_3465 bytes_

```markdown
# TODO / known rough edges

## Known issues

* `volcanic` theme produces very little `Lava` (~200 cells on a 96 map). The lava branch in
  `buildTerrain` requires `rockiness > 0.42 && e > 0.12` **and** `cc > 0.30`, so only true summits
  erupt. Loosen it a little, but keep lava off grass/low ground.
* `highland` is heavily snow-covered — the default `temperature` (0.56) combined with the lapse rate
  pushes most of the map below the snow line. Consider lowering `highland`'s `snow` or adding a
  rockier cold band between grass and snow.
* Rock detail is thin: the `rock` kind is a handful of grey boulders, so scree/boulder fields look
  repetitive on rocky biomes. The LPC Terrains / Tile Atlas packs contain more `Rock_*`/`Stone_*`
  boulders that could be cropped and appended to the atlas (append at the END of `props.js`).
* Plants are a single green palette, so snowy biomes rely on dead bushes and conifers for detail.
  A white/desaturated plant variant would help.
* The whole-world composite is only used when it is at least as sharp as the screen
  (`zoom * TILE * dpr <= ppt`). At dpr 2+ that means the tile path draws 2-3k tiles at mid zoom
  (~30ms/frame). Acceptable, but a second composite level (e.g. ppt 64/128) would make zooming
  smoother at the cost of memory.
* `despeckleWater` removes 1-cell water only when it has *zero* water neighbours — deliberately
  conservative. Tuning the threshold will change river headwaters noticeably.
* On small maps (≈64x64) `stats.ruins` and `stats.camps` both land on 0: the top candidates for
  those landmarks cluster around existing villages, so every sampled site is rejected by the
  "too close to a settlement" rule. Widening the candidate sample helps, but a proper fix is to
  bias landmark sampling towards the frontier/away-from-sites region.
* The map JSON is a full corner array, so a 256x256 map is ~1.3 MB of JSON before props. A
  compact/delta encoding would help the `kv` slots on big maps.

## Ideas

* Wire the plugin into the game: `mapForge = {import:lpc-map-forge}` in
  `2d-top-down-rpg-multiplayer`, then drive the overworld from `mapForge.generate(...)` /
  `toTileGrid(...)` (needs a game-side terrain→collision/biome mapping) and/or open the editor via
  `mapForge.open()` to hand-author a world. A "Use this map" button in `open()`'s close path would
  make the round-trip seamless.
* Let the AI world designer also place labels ("a fishing village on the north coast") — the label
  data model and rendering already exist; only the prompt/placement step is missing.
* Prop "era"/style filters (e.g. only temperate deciduous, only conifers) as AI-settable params.
* More prefabs: waterfalls, mountain stairs, harbour cranes, watchtowers, bandit camps (a railed
  bridge and a barred mine entrance now exist; the camps/mining sprites were integrated in the
  second asset pass).
* Roads painted in `Dirt_Tan`/`Gravel_1` place bridges at river crossings but the bridge deck is
  flat — a railed bridge sprite (with a shadow that follows the river) would look much better.
* A "stamp this region as a prefab" action: capture a clone-tool selection into `prefabs.js` so
  hand-built clusters can be reused across maps and sessions.
* Export a bare tile-id grid (JSON) alongside the `.tmx`, for engines that prefer their own map
  format over Tiled.
* Minimap viewport rectangle + drag-to-pan, and a hovered-tile info tooltip (status bar covers the
  basics today).

```

## 04-project-resources/props-sources.json

_37963 bytes_

```json
{
 "note": "Candidate source-sheet rectangles that props.png was packed from. Paths are relative to the unzipped source packs listed below and in README.md (Rebuilding the assets). props.js holds the FINAL atlas rectangles; this file holds the ORIGINAL sheet rectangles. Not every rect here was used - props.js lists only the sprites that were selected for the atlas; the rest were filtered out as too small, duplicated, or unsuitable for outdoor maps.",
 "sources": {
  "lpc-trees": "https://opengameart.org/sites/default/files/lpc-trees.zip",
  "lpc-conifers": "https://opengameart.org/sites/default/files/lpc-conifers.zip",
  "lpc-flowers-plants-fungi-wood": "https://opengameart.org/sites/default/files/lpc-flowers-plants-fungi-wood.zip",
  "lpc-terrains": "https://opengameart.org/sites/default/files/lpc-terrains.zip",
  "lpc_base_assets": "https://opengameart.org/sites/default/files/lpc_base_assets.zip",
  "lpc-submission-daneeklu": "https://opengameart.org/sites/default/files/submission_daneeklu.zip",
  "lpc-dungeon-elements": "https://opengameart.org/sites/default/files/dungeon_0.zip",
  "lpc-tile-atlas": "https://opengameart.org/sites/default/files/Atlas_0.zip",
  "lpc-tile-atlas2": "https://opengameart.org/sites/default/files/Atlas2.zip",
  "lpc-house-interior": "https://opengameart.org/sites/default/files/LPC_house_interior_0.zip"
 },
 "groups": {
  "trees-green": {
   "sheet": "lpc-trees/trees-green.png",
   "rects": [
    [
     65,
     0,
     58,
     96
    ],
    [
     256,
     0,
     64,
     96
    ],
    [
     320,
     0,
     128,
     97
    ],
    [
     582,
     0,
     83,
     92
    ],
    [
     518,
     1,
     58,
     93
    ],
    [
     131,
     2,
     55,
     58
    ],
    [
     200,
     7,
     48,
     54
    ],
    [
     672,
     8,
     64,
     80
    ],
    [
     11,
     11,
     43,
     50
    ],
    [
     424,
     21,
     112,
     203
    ],
    [
     0,
     64,
     64,
     32
    ],
    [
     64,
     96,
     64,
     128
    ],
    [
     544,
     96,
     96,
     120
    ],
    [
     0,
     102,
     63,
     117
    ],
    [
     320,
     102,
     96,
     122
    ],
    [
     128,
     104,
     95,
     118
    ],
    [
     231,
     104,
     83,
     106
    ],
    [
     164,
     224,
     89,
     128
    ],
    [
     264,
     224,
     107,
     128
    ],
    [
     384,
     224,
     94,
     127
    ],
    [
     583,
     224,
     115,
     127
    ],
    [
     709,
     224,
     120,
     128
    ],
    [
     485,
     226,
     89,
     126
    ],
    [
     66,
     230,
     88,
     120
    ],
    [
     8,
     232,
     50,
     111
    ],
    [
     129,
     352,
     94,
     137
    ],
    [
     321,
     352,
     93,
     159
    ],
    [
     418,
     352,
     125,
     151
    ],
    [
     681,
     354,
     172,
     158
    ],
    [
     864,
     354,
     160,
     156
    ],
    [
     0,
     356,
     62,
     145
    ],
    [
     64,
     356,
     63,
     149
    ],
    [
     556,
     356,
     104,
     138
    ],
    [
     224,
     368,
     94,
     80
    ],
    [
     301,
     512,
     165,
     188
    ],
    [
     491,
     515,
     170,
     189
    ],
    [
     672,
     515,
     160,
     189
    ],
    [
     161,
     530,
     127,
     165
    ],
    [
     835,
     533,
     154,
     170
    ],
    [
     0,
     535,
     150,
     169
    ],
    [
     268,
     704,
     271,
     314
    ],
    [
     0,
     705,
     128,
     190
    ],
    [
     131,
     716,
     113,
     179
    ],
    [
     551,
     718,
     242,
     298
    ]
   ]
  },
  "trees-brown": {
   "sheet": "lpc-trees/trees-brown.png",
   "rects": [
    [
     65,
     0,
     58,
     96
    ],
    [
     256,
     0,
     64,
     96
    ],
    [
     320,
     0,
     128,
     97
    ],
    [
     582,
     0,
     83,
     92
    ],
    [
     518,
     1,
     58,
     93
    ],
    [
     131,
     2,
     55,
     58
    ],
    [
     200,
     7,
     48,
     54
    ],
    [
     672,
     8,
     64,
     80
    ],
    [
     11,
     11,
     43,
     50
    ],
    [
     424,
     21,
     112,
     203
    ],
    [
     0,
     64,
     64,
     32
    ],
    [
     64,
     96,
     64,
     128
    ],
    [
     544,
     96,
     96,
     120
    ],
    [
     0,
     102,
     63,
     117
    ],
    [
     320,
     102,
     96,
     122
    ],
    [
     128,
     104,
     95,
     118
    ],
    [
     231,
     104,
     83,
     106
    ],
    [
     164,
     224,
     89,
     128
    ],
    [
     264,
     224,
     107,
     128
    ],
    [
     384,
     224,
     94,
     127
    ],
    [
     583,
     224,
     115,
     127
    ],
    [
     709,
     224,
     120,
     128
    ],
    [
     485,
     226,
     89,
     126
    ],
    [
     66,
     230,
     88,
     120
    ],
    [
     8,
     232,
     50,
     111
    ],
    [
     129,
     352,
     94,
     137
    ],
    [
     321,
     352,
     93,
     159
    ],
    [
     418,
     352,
     125,
     151
    ],
    [
     67,
     353,
     61,
     150
    ],
    [
     681,
     354,
     172,
     158
    ],
    [
     864,
     354,
     160,
     156
    ],
    [
     0,
     356,
     62,
     145
    ],
    [
     556,
     356,
     104,
     138
    ],
    [
     224,
     368,
     94,
     80
    ],
    [
     301,
     512,
     165,
     188
    ],
    [
     491,
     515,
     170,
     189
    ],
    [
     672,
     515,
     160,
     189
    ],
    [
     161,
     530,
     127,
     165
    ],
    [
     835,
     533,
     154,
     170
    ],
    [
     0,
     535,
     150,
     169
    ],
    [
     268,
     704,
     271,
     314
    ],
    [
     0,
     705,
     128,
     190
    ],
    [
     131,
     716,
     113,
     179
    ],
    [
     551,
     718,
     242,
     298
    ]
   ]
  },
  "trees-orange": {
   "sheet": "lpc-trees/trees-orange.png",
   "rects": [
    [
     65,
     0,
     58,
     96
    ],
    [
     256,
     0,
     64,
     96
    ],
    [
     320,
     0,
     128,
     97
    ],
    [
     582,
     0,
     83,
     92
    ],
    [
     518,
     1,
     58,
     93
    ],
    [
     131,
     2,
     55,
     58
    ],
    [
     200,
     7,
     48,
     54
    ],
    [
     672,
     8,
     64,
     80
    ],
    [
     11,
     11,
     43,
     50
    ],
    [
     424,
     21,
     112,
     203
    ],
    [
     0,
     64,
     64,
     32
    ],
    [
     64,
     96,
     64,
     128
    ],
    [
     544,
     96,
     96,
     120
    ],
    [
     0,
     102,
     63,
     117
    ],
    [
     320,
     102,
     96,
     122
    ],
    [
     128,
     104,
     95,
     118
    ],
    [
     231,
     104,
     83,
     106
    ],
    [
     164,
     224,
     89,
     128
    ],
    [
     264,
     224,
     107,
     128
    ],
    [
     384,
     224,
     94,
     127
    ],
    [
     583,
     224,
     115,
     127
    ],
    [
     709,
     224,
     120,
     128
    ],
    [
     485,
     226,
     89,
     126
    ],
    [
     67,
     228,
     88,
     120
    ],
    [
     8,
     232,
     50,
     111
    ],
    [
     129,
     352,
     94,
     137
    ],
    [
     321,
     352,
     93,
     159
    ],
    [
     418,
     352,
     125,
     151
    ],
    [
     681,
     354,
     172,
     158
    ],
    [
     864,
     354,
     160,
     156
    ],
    [
     0,
     356,
     62,
     145
    ],
    [
     64,
     356,
     63,
     149
    ],
    [
     556,
     356,
     104,
     138
    ],
    [
     224,
     368,
     94,
     80
    ],
    [
     301,
     512,
     165,
     188
    ],
    [
     491,
     515,
     170,
     189
    ],
    [
     672,
     515,
     160,
     189
    ],
    [
     161,
     530,
     127,
     165
    ],
    [
     835,
     533,
     154,
     170
    ],
    [
     0,
     535,
     150,
     169
    ],
    [
     268,
     704,
     271,
     314
    ],
    [
     0,
     705,
     128,
     190
    ],
    [
     131,
     716,
     113,
     179
    ],
    [
     551,
     718,
     242,
     298
    ]
   ]
  },
  "trees-pale": {
   "sheet": "lpc-trees/trees-pale.png",
   "rects": [
    [
     65,
     0,
     58,
     96
    ],
    [
     256,
     0,
     64,
     96
    ],
    [
     320,
     0,
     128,
     97
    ],
    [
     582,
     0,
     83,
     92
    ],
    [
     518,
     1,
     58,
     93
    ],
    [
     131,
     2,
     55,
     58
    ],
    [
     200,
     7,
     48,
     54
    ],
    [
     672,
     8,
     64,
     80
    ],
    [
     11,
     11,
     43,
     50
    ],
    [
     424,
     21,
     112,
     203
    ],
    [
     0,
     64,
     64,
     32
    ],
    [
     64,
     96,
     64,
     128
    ],
    [
     544,
     96,
     96,
     120
    ],
    [
     0,
     102,
     63,
     117
    ],
    [
     320,
     102,
     96,
     122
    ],
    [
     128,
     104,
     95,
     118
    ],
    [
     231,
     104,
     83,
     106
    ],
    [
     164,
     224,
     89,
     128
    ],
    [
     264,
     224,
     107,
     128
    ],
    [
     384,
     224,
     94,
     127
    ],
    [
     583,
     224,
     115,
     127
    ],
    [
     709,
     224,
     120,
     128
    ],
    [
     485,
     226,
     89,
     126
    ],
    [
     66,
     230,
     88,
     120
    ],
    [
     8,
     232,
     50,
     111
    ],
    [
     129,
     352,
     94,
     137
    ],
    [
     321,
     352,
     93,
     159
    ],
    [
     418,
     352,
     125,
     151
    ],
    [
     681,
     354,
     172,
     158
    ],
    [
     864,
     354,
     160,
     156
    ],
    [
     0,
     356,
     62,
     145
    ],
    [
     64,
     356,
     63,
     149
    ],
    [
     556,
     356,
     104,
     138
    ],
    [
     224,
     368,
     94,
     80
    ],
    [
     301,
     512,
     165,
     188
    ],
    [
     491,
     515,
     170,
     189
    ],
    [
     672,
     515,
     160,
     189
    ],
    [
     161,
     530,
     127,
     165
    ],
    [
     835,
     533,
     154,
     170
    ],
    [
     0,
     535,
     150,
     169
    ],
    [
     268,
     704,
     271,
     314
    ],
    [
     0,
     705,
     128,
     190
    ],
    [
     131,
     716,
     113,
     179
    ],
    [
     551,
     718,
     242,
     298
    ]
   ]
  },
  "trees-dead": {
   "sheet": "lpc-trees/trees-dead.png",
   "rects": [
    [
     71,
     0,
     52,
     64
    ],
    [
     256,
     0,
     64,
     96
    ],
    [
     320,
     0,
     128,
     96
    ],
    [
     582,
     0,
     83,
     92
    ],
    [
     131,
     2,
     55,
     58
    ],
    [
     200,
     7,
     48,
     54
    ],
    [
     672,
     8,
     64,
     80
    ],
    [
     11,
     11,
     43,
     50
    ],
    [
     424,
     21,
     112,
     203
    ],
    [
     544,
     96,
     96,
     120
    ],
    [
     64,
     107,
     64,
     117
    ],
    [
     233,
     129,
     84,
     81
    ],
    [
     131,
     133,
     87,
     91
    ],
    [
     322,
     133,
     95,
     91
    ],
    [
     3,
     139,
     58,
     80
    ],
    [
     480,
     225,
     96,
     125
    ],
    [
     576,
     227,
     123,
     124
    ],
    [
     384,
     229,
     93,
     122
    ],
    [
     165,
     232,
     82,
     120
    ],
    [
     268,
     233,
     101,
     119
    ],
    [
     713,
     241,
     108,
     111
    ],
    [
     66,
     243,
     86,
     107
    ],
    [
     67,
     353,
     61,
     150
    ],
    [
     425,
     353,
     94,
     150
    ],
    [
     544,
     361,
     123,
     133
    ],
    [
     1,
     364,
     54,
     140
    ],
    [
     880,
     369,
     127,
     142
    ],
    [
     320,
     371,
     95,
     140
    ],
    [
     708,
     391,
     131,
     117
    ],
    [
     140,
     393,
     76,
     99
    ],
    [
     236,
     408,
     76,
     40
    ],
    [
     301,
     512,
     165,
     188
    ],
    [
     491,
     515,
     170,
     189
    ],
    [
     672,
     515,
     160,
     189
    ],
    [
     835,
     533,
     154,
     170
    ],
    [
     178,
     539,
     128,
     156
    ],
    [
     26,
     555,
     139,
     148
    ],
    [
     268,
     704,
     271,
     314
    ],
    [
     11,
     712,
     106,
     183
    ],
    [
     551,
     718,
     242,
     298
    ],
    [
     147,
     745,
     92,
     150
    ]
   ]
  },
  "conifers": {
   "sheet": "lpc-conifers/conifers.png",
   "rects": [
    [
     0,
     0,
     192,
     224
    ],
    [
     391,
     1,
     82,
     157
    ],
    [
     487,
     2,
     74,
     158
    ],
    [
     641,
     2,
     127,
     214
    ],
    [
     303,
     3,
     73,
     154
    ],
    [
     225,
     8,
     63,
     149
    ],
    [
     580,
     11,
     56,
     78
    ],
    [
     160,
     15,
     32,
     46
    ],
    [
     192,
     15,
     32,
     46
    ],
    [
     162,
     96,
     60,
     95
    ],
    [
     590,
     101,
     38,
     80
    ],
    [
     240,
     160,
     36,
     64
    ],
    [
     289,
     162,
     31,
     60
    ],
    [
     321,
     163,
     30,
     59
    ],
    [
     353,
     170,
     30,
     42
    ],
    [
     166,
     192,
     23,
     32
    ],
    [
     0,
     224,
     192,
     224
    ],
    [
     391,
     225,
     82,
     157
    ],
    [
     487,
     226,
     74,
     158
    ],
    [
     641,
     226,
     127,
     214
    ],
    [
     298,
     228,
     73,
     154
    ],
    [
     225,
     232,
     63,
     149
    ],
    [
     580,
     235,
     56,
     78
    ],
    [
     160,
     239,
     32,
     46
    ],
    [
     192,
     239,
     32,
     46
    ],
    [
     162,
     320,
     60,
     95
    ],
    [
     590,
     325,
     38,
     80
    ],
    [
     240,
     384,
     36,
     64
    ],
    [
     289,
     386,
     31,
     60
    ],
    [
     321,
     387,
     30,
     59
    ],
    [
     353,
     394,
     30,
     42
    ],
    [
     166,
     416,
     23,
     32
    ]
   ]
  },
  "plants": {
   "sheet": "lpc-flowers-plants-fungi-wood/plants.png",
   "rects": [
    [
     40,
     4,
     16,
     22
    ],
    [
     7,
     5,
     16,
     22
    ],
    [
     168,
     8,
     16,
     14
    ],
    [
     452,
     8,
     8,
     17
    ],
    [
     104,
     10,
     16,
     10
    ],
    [
     465,
     12,
     8,
     17
    ],
    [
     8,
     40,
     16,
     14
    ],
    [
     40,
     41,
     16,
     14
    ],
    [
     72,
     41,
     16,
     12
    ],
    [
     327,
     66,
     15,
     28
    ],
    [
     364,
     69,
     14,
     21
    ],
    [
     10,
     74,
     13,
     11
    ],
    [
     42,
     74,
     13,
     11
    ],
    [
     73,
     74,
     14,
     11
    ],
    [
     169,
     74,
     14,
     11
    ],
    [
     341,
     74,
     8,
     19
    ],
    [
     327,
     98,
     15,
     28
    ],
    [
     391,
     98,
     15,
     28
    ],
    [
     455,
     98,
     15,
     28
    ],
    [
     14,
     99,
     16,
     14
    ],
    [
     46,
     99,
     16,
     14
    ],
    [
     113,
     99,
     13,
     13
    ],
    [
     164,
     100,
     16,
     10
    ],
    [
     364,
     101,
     14,
     21
    ],
    [
     428,
     101,
     14,
     21
    ],
    [
     492,
     101,
     14,
     21
    ],
    [
     129,
     105,
     16,
     22
    ],
    [
     206,
     106,
     11,
     13
    ],
    [
     238,
     106,
     11,
     13
    ],
    [
     270,
     106,
     11,
     13
    ],
    [
     302,
     106,
     11,
     13
    ],
    [
     341,
     106,
     8,
     19
    ],
    [
     405,
     106,
     8,
     19
    ],
    [
     469,
     106,
     8,
     19
    ],
    [
     2,
     113,
     16,
     14
    ],
    [
     34,
     113,
     16,
     14
    ],
    [
     98,
     114,
     14,
     11
    ],
    [
     173,
     116,
     16,
     10
    ],
    [
     128,
     129,
     64,
     63
    ],
    [
     107,
     131,
     13,
     11
    ],
    [
     66,
     132,
     14,
     11
    ],
    [
     203,
     132,
     13,
     24
    ],
    [
     235,
     132,
     13,
     24
    ],
    [
     267,
     132,
     13,
     24
    ],
    [
     299,
     132,
     13,
     24
    ],
    [
     2,
     135,
     13,
     11
    ],
    [
     34,
     135,
     13,
     11
    ],
    [
     13,
     145,
     16,
     14
    ],
    [
     45,
     145,
     16,
     14
    ],
    [
     78,
     147,
     16,
     12
    ],
    [
     16,
     161,
     16,
     22
    ],
    [
     48,
     161,
     16,
     22
    ],
    [
     80,
     161,
     16,
     22
    ],
    [
     112,
     161,
     16,
     22
    ],
    [
     451,
     161,
     11,
     13
    ],
    [
     324,
     162,
     14,
     14
    ],
    [
     388,
     162,
     14,
     14
    ],
    [
     420,
     162,
     14,
     14
    ],
    [
     203,
     163,
     18,
     16
    ],
    [
     235,
     163,
     18,
     16
    ],
    [
     267,
     163,
     18,
     16
    ],
    [
     299,
     163,
     18,
     16
    ],
    [
     356,
     163,
     14,
     14
    ],
    [
     488,
     163,
     17,
     24
    ],
    [
     1,
     170,
     15,
     22
    ],
    [
     32,
     170,
     16,
     22
    ],
    [
     65,
     170,
     15,
     22
    ],
    [
     97,
     170,
     15,
     22
    ],
    [
     340,
     175,
     11,
     13
    ],
    [
     372,
     175,
     11,
     13
    ],
    [
     404,
     175,
     11,
     13
    ],
    [
     436,
     175,
     11,
     13
    ],
    [
     196,
     177,
     20,
     14
    ],
    [
     228,
     177,
     20,
     14
    ],
    [
     260,
     177,
     20,
     14
    ],
    [
     292,
     177,
     20,
     14
    ],
    [
     321,
     177,
     16,
     14
    ],
    [
     427,
     194,
     10,
     10
    ],
    [
     459,
     194,
     10,
     10
    ],
    [
     491,
     194,
     10,
     10
    ],
    [
     196,
     197,
     27,
     22
    ],
    [
     164,
     198,
     20,
     24
    ],
    [
     135,
     199,
     18,
     25
    ],
    [
     228,
     199,
     27,
     22
    ],
    [
     259,
     200,
     27,
     22
    ],
    [
     291,
     200,
     27,
     22
    ],
    [
     355,
     200,
     26,
     21
    ],
    [
     326,
     203,
     19,
     15
    ],
    [
     390,
     203,
     19,
     15
    ],
    [
     19,
     206,
     13,
     11
    ],
    [
     81,
     206,
     13,
     11
    ],
    [
     424,
     207,
     16,
     16
    ],
    [
     456,
     207,
     16,
     16
    ],
    [
     488,
     207,
     16,
     16
    ],
    [
     359,
     229,
     18,
     18
    ],
    [
     391,
     229,
     18,
     18
    ],
    [
     135,
     230,
     17,
     23
    ],
    [
     160,
     231,
     32,
     24
    ],
    [
     330,
     231,
     18,
     18
    ],
    [
     201,
     232,
     14,
     14
    ],
    [
     265,
     232,
     14,
     14
    ],
    [
     297,
     232,
     14,
     14
    ],
    [
     422,
     232,
     16,
     16
    ],
    [
     454,
     232,
     16,
     16
    ],
    [
     486,
     232,
     16,
     16
    ],
    [
     233,
     233,
     14,
     14
    ],
    [
     83,
     237,
     13,
     11
    ],
    [
     20,
     239,
     13,
     11
    ],
    [
     141,
     258,
     47,
     62
    ],
    [
     35,
     262,
     29,
     24
    ],
    [
     99,
     262,
     29,
     24
    ],
    [
     1,
     264,
     30,
     20
    ],
    [
     65,
     264,
     30,
     20
    ],
    [
     202,
     264,
     13,
     13
    ],
    [
     328,
     264,
     15,
     16
    ],
    [
     234,
     265,
     13,
     13
    ],
    [
     359,
     265,
     16,
     16
    ],
    [
     391,
     265,
     17,
     16
    ],
    [
     425,
     265,
     15,
     16
    ],
    [
     490,
     265,
     15,
     14
    ],
    [
     456,
     266,
     15,
     14
    ],
    [
     265,
     267,
     13,
     13
    ],
    [
     297,
     267,
     13,
     13
    ],
    [
     451,
     288,
     12,
     13
    ],
    [
     497,
     289,
     15,
     16
    ],
    [
     226,
     291,
     14,
     14
    ],
    [
     352,
     292,
     31,
     26
    ],
    [
     416,
     292,
     32,
     25
    ],
    [
     193,
     293,
     14,
     14
    ],
    [
     257,
     293,
     14,
     14
    ],
    [
     289,
     293,
     14,
     14
    ],
    [
     35,
     294,
     29,
     24
    ],
    [
     99,
     294,
     29,
     24
    ],
    [
     323,
     294,
     27,
     26
    ],
    [
     388,
     295,
     23,
     20
    ],
    [
     1,
     296,
     30,
     20
    ],
    [
     65,
     296,
     30,
     20
    ],
    [
     238,
     299,
     13,
     13
    ],
    [
     134,
     300,
     9,
     16
    ],
    [
     210,
     300,
     13,
     13
    ],
    [
     274,
     300,
     13,
     13
    ],
    [
     306,
     300,
     13,
     13
    ],
    [
     456,
     302,
     18,
     17
    ],
    [
     482,
     304,
     18,
     15
    ],
    [
     452,
     323,
     21,
     19
    ],
    [
     393,
     324,
     12,
     12
    ],
    [
     355,
     326,
     12,
     12
    ],
    [
     485,
     326,
     19,
     19
    ],
    [
     192,
     327,
     32,
     25
    ],
    [
     322,
     327,
     28,
     23
    ],
    [
     421,
     328,
     18,
     16
    ],
    [
     9,
     330,
     17,
     19
    ],
    [
     73,
     331,
     17,
     15
    ],
    [
     192,
     332,
     64,
     51
    ],
    [
     46,
     333,
     13,
     14
    ],
    [
     385,
     334,
     13,
     12
    ],
    [
     299,
     336,
     12,
     16
    ],
    [
     362,
     337,
     13,
     13
    ],
    [
     398,
     337,
     12,
     12
    ],
    [
     256,
     338,
     28,
     14
    ],
    [
     146,
     340,
     12,
     12
    ],
    [
     417,
     353,
     18,
     16
    ],
    [
     260,
     356,
     8,
     13
    ],
    [
     275,
     357,
     9,
     15
    ],
    [
     386,
     357,
     28,
     26
    ],
    [
     71,
     358,
     16,
     21
    ],
    [
     485,
     358,
     19,
     19
    ],
    [
     323,
     359,
     27,
     25
    ],
    [
     165,
     362,
     16,
     15
    ],
    [
     360,
     362,
     12,
     13
    ],
    [
     136,
     363,
     16,
     11
    ],
    [
     458,
     364,
     15,
     13
    ],
    [
     33,
     365,
     11,
     15
    ],
    [
     295,
     365,
     21,
     19
    ],
    [
     428,
     368,
     18,
     16
    ],
    [
     267,
     369,
     8,
     13
    ],
    [
     192,
     384,
     64,
     31
    ],
    [
     169,
     386,
     16,
     28
    ],
    [
     453,
     386,
     24,
     29
    ],
    [
     385,
     387,
     63,
     27
    ],
    [
     131,
     388,
     15,
     13
    ],
    [
     148,
     388,
     11,
     14
    ],
    [
     260,
     388,
     8,
     13
    ],
    [
     275,
     389,
     9,
     15
    ],
    [
     322,
     389,
     28,
     26
    ],
    [
     352,
     390,
     32,
     24
    ],
    [
     294,
     399,
     17,
     17
    ],
    [
     267,
     401,
     8,
     13
    ],
    [
     321,
     416,
     30,
     31
    ],
    [
     129,
     417,
     62,
     31
    ],
    [
     354,
     417,
     22,
     31
    ],
    [
     0,
     418,
     29,
     60
    ],
    [
     288,
     418,
     30,
     27
    ],
    [
     34,
     423,
     28,
     53
    ],
    [
     67,
     424,
     28,
     53
    ],
    [
     99,
     427,
     27,
     47
    ],
    [
     192,
     429,
     32,
     17
    ],
    [
     256,
     429,
     31,
     17
    ],
    [
     239,
     432,
     16,
     15
    ],
    [
     389,
     432,
     22,
     16
    ],
    [
     228,
     437,
     9,
     9
    ],
    [
     290,
     437,
     9,
     10
    ],
    [
     130,
     448,
     28,
     32
    ],
    [
     162,
     450,
     28,
     62
    ],
    [
     34,
     484,
     29,
     28
    ],
    [
     11,
     487,
     16,
     12
    ],
    [
     66,
     487,
     26,
     17
    ],
    [
     98,
     493,
     26,
     17
    ],
    [
     0,
     512,
     32,
     62
    ],
    [
     64,
     512,
     32,
     24
    ],
    [
     32,
     513,
     32,
     55
    ],
    [
     386,
     544,
     29,
     64
    ],
    [
     416,
     544,
     32,
     64
    ],
    [
     487,
     546,
     19,
     49
    ],
    [
     448,
     547,
     30,
     60
    ],
    [
     66,
     548,
     30,
     28
    ],
    [
     201,
     551,
     58,
     87
    ],
    [
     302,
     555,
     12,
     19
    ],
    [
     354,
     559,
     17,
     17
    ],
    [
     297,
     573,
     12,
     35
    ],
    [
     368,
     576,
     16,
     17
    ],
    [
     73,
     586,
     12,
     12
    ],
    [
     12,
     587,
     12,
     12
    ],
    [
     324,
     588,
     14,
     20
    ],
    [
     459,
     610,
     16,
     21
    ],
    [
     482,
     612,
     27,
     21
    ],
    [
     244,
     613,
     8,
     16
    ],
    [
     387,
     614,
     28,
     26
    ],
    [
     227,
     615,
     16,
     19
    ],
    [
     297,
     615,
     13,
     17
    ],
    [
     325,
     615,
     25,
     25
    ],
    [
     423,
     616,
     16,
     21
    ],
    [
     361,
     618,
     13,
     20
    ],
    [
     258,
     627,
     8,
     13
    ],
    [
     259,
     641,
     61,
     61
    ],
    [
     419,
     641,
     26,
     31
    ],
    [
     449,
     642,
     29,
     30
    ],
    [
     481,
     642,
     19,
     14
    ],
    [
     198,
     645,
     54,
     57
    ],
    [
     323,
     646,
     28,
     52
    ],
    [
     112,
     649,
     15,
     18
    ],
    [
     145,
     649,
     15,
     18
    ],
    [
     177,
     649,
     15,
     18
    ],
    [
     97,
     650,
     15,
     17
    ],
    [
     130,
     650,
     15,
     17
    ],
    [
     162,
     650,
     15,
     17
    ],
    [
     390,
     654,
     19,
     38
    ],
    [
     495,
     654,
     17,
     13
    ],
    [
     351,
     659,
     33,
     41
    ],
    [
     428,
     672,
     37,
     32
    ],
    [
     102,
     683,
     19,
     13
    ],
    [
     135,
     683,
     19,
     13
    ],
    [
     167,
     683,
     19,
     13
    ],
    [
     488,
     684,
     19,
     14
    ],
    [
     35,
     704,
     28,
     29
    ],
    [
     1,
     705,
     28,
     29
    ],
    [
     66,
     705,
     28,
     29
    ],
    [
     484,
     706,
     26,
     58
    ],
    [
     135,
     708,
     19,
     26
    ],
    [
     256,
     708,
     59,
     50
    ],
    [
     168,
     711,
     15,
     20
    ],
    [
     320,
     712,
     61,
     47
    ],
    [
     451,
     712,
     25,
     51
    ],
    [
     103,
     714,
     22,
     20
    ],
    [
     193,
     716,
     59,
     40
    ],
    [
     398,
     722,
     33,
     29
    ],
    [
     66,
     736,
     28,
     30
    ],
    [
     17,
     739,
     10,
     11
    ],
    [
     50,
     739,
     10,
     11
    ],
    [
     4,
     743,
     11,
     13
    ],
    [
     37,
     743,
     11,
     13
    ],
    [
     105,
     744,
     17,
     17
    ],
    [
     164,
     746,
     27,
     23
    ],
    [
     14,
     751,
     14,
     15
    ],
    [
     47,
     751,
     14,
     15
    ],
    [
     139,
     756,
     14,
     12
    ],
    [
     6,
     768,
     20,
     30
    ],
    [
     384,
     768,
     64,
     32
    ],
    [
     97,
     770,
     16,
     16
    ],
    [
     163,
     770,
     28,
     28
    ],
    [
     114,
     771,
     14,
     13
    ],
    [
     130,
     771,
     29,
     28
    ],
    [
     256,
     772,
     59,
     50
    ],
    [
     450,
     775,
     59,
     25
    ],
    [
     35,
     776,
     25,
     19
    ],
    [
     71,
     776,
     20,
     16
    ],
    [
     320,
     776,
     61,
     47
    ],
    [
     193,
     780,
     59,
     40
    ],
    [
     131,
     802,
     28,
     25
    ],
    [
     162,
     803,
     29,
     28
    ],
    [
     1,
     805,
     31,
     26
    ],
    [
     96,
     806,
     32,
     21
    ],
    [
     384,
     806,
     32,
     58
    ],
    [
     450,
     808,
     59,
     24
    ],
    [
     36,
     811,
     50,
     41
    ],
    [
     135,
     832,
     17,
     31
    ],
    [
     480,
     832,
     32,
     32
    ],
    [
     225,
     834,
     62,
     59
    ],
    [
     314,
     834,
     36,
     57
    ],
    [
     5,
     837,
     23,
     21
    ],
    [
     450,
     837,
     27,
     21
    ],
    [
     97,
     838,
     31,
     26
    ],
    [
     161,
     838,
     63,
     58
    ],
    [
     289,
     842,
     24,
     49
    ],
    [
     425,
     846,
     16,
     16
    ],
    [
     481,
     868,
     28,
     23
    ],
    [
     448,
     871,
     28,
     21
    ],
    [
     421,
     872,
     22,
     19
    ],
    [
     393,
     877,
     15,
     12
    ],
    [
     132,
     878,
     51,
     18
    ],
    [
     138,
     900,
     43,
     25
    ],
    [
     96,
     904,
     32,
     22
    ],
    [
     192,
     911,
     32,
     40
    ],
    [
     0,
     960,
     96,
     31
    ],
    [
     333,
     960,
     36,
     59
    ],
    [
     288,
     962,
     32,
     59
    ],
    [
     484,
     962,
     23,
     28
    ],
    [
     228,
     964,
     22,
     56
    ],
    [
     260,
     964,
     22,
     56
    ],
    [
     398,
     970,
     34,
     45
    ],
    [
     453,
     970,
     21,
     45
    ],
    [
     138,
     971,
     40,
     21
    ],
    [
     192,
     974,
     31,
     40
    ],
    [
     65,
     992,
     28,
     32
    ],
    [
     32,
     993,
     32,
     28
    ],
    [
     493,
     996,
     10,
     20
    ]
   ]
  }
 },
 "verifiedProvenance": {
  "note": "Each repo sheet below was hashed (SHA-256, first 16 hex chars) and compared against the downloaded source pack. `srcToken` is the value used in the build data (scratch/build/placed.json, not shipped) and therefore the name of the sheet those sprites were cropped from.",
  "sheets": [
   {
    "srcToken": "terrain_terrain_atlas_png",
    "repoFile": "src/images/terrain/terrain_atlas.png",
    "source": "lpc-tile-atlas",
    "sourceFile": "terrain_atlas.png",
    "sha256_16": "139693a61792d788",
    "spritesUsed": 71
   },
   {
    "srcToken": "terrain_base_out_atlas_png",
    "repoFile": "src/images/terrain/base_out_atlas.png",
    "source": "lpc-tile-atlas",
    "sourceFile": "base_out_atlas.png",
    "sha256_16": "81a37fefd8d5e1ce",
    "spritesUsed": 11
   },
   {
    "srcToken": "terrain_build_atlas_png",
    "repoFile": "src/images/terrain/build_atlas.png",
    "source": "lpc-tile-atlas2",
    "sourceFile": "build_atlas.png",
    "sha256_16": "b04a47b4e598bf12",
    "spritesUsed": 55
   },
   {
    "srcToken": "terrain_obj_misk_atlas_png",
    "repoFile": "src/images/terrain/obj_misk_atlas.png",
    "source": "lpc-tile-atlas2",
    "sourceFile": "obj_misk_atlas.png",
    "sha256_16": "3cecbf75f002d0bb",
    "spritesUsed": 104
   },
   {
    "srcToken": "props_dungeonex_png",
    "repoFile": "src/images/props/dungeonex.png",
    "source": "lpc-dungeon-elements",
    "sourceFile": "dungeonex.png",
    "sha256_16": "5bb40be127a7fb0f",
    "spritesUsed": 13
   },
   {
    "srcToken": "props_plants_png",
    "repoFile": "src/images/props/plants.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/plants.png",
    "sha256_16": "593f5e134e447f71",
    "spritesUsed": 14
   },
   {
    "srcToken": "props_farming_fishing_png",
    "repoFile": "src/images/props/farming_fishing.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/farming_fishing.png",
    "sha256_16": "eb57d8271eeed63a",
    "spritesUsed": 17
   },
   {
    "srcToken": "props/fence.png",
    "repoFile": "src/images/props/fence.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/fence.png",
    "sha256_16": "4b06696d0feb9a9c",
    "spritesUsed": 3
   },
   {
    "srcToken": "props/fence_alt.png",
    "repoFile": "src/images/props/fence_alt.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/fence_alt.png",
    "sha256_16": "907d1676c9ac07bc",
    "spritesUsed": 2
   },
   {
    "srcToken": "terrain/plowed_soil.png",
    "repoFile": "src/images/terrain/plowed_soil.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/plowed_soil.png",
    "spritesUsed": 2
   },
   {
    "srcToken": "terrain/wheat.png",
    "repoFile": "src/images/terrain/wheat.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/wheat.png",
    "spritesUsed": 3
   },
   {
    "srcToken": "terrain/youngwheat.png",
    "repoFile": "src/images/terrain/youngwheat.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/youngwheat.png",
    "spritesUsed": 2
   },
   {
    "srcToken": "terrain/tallgrass.png",
    "repoFile": "src/images/terrain/tallgrass.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/tallgrass.png",
    "spritesUsed": 2
   },
   {
    "srcToken": "terrain/sand.png",
    "repoFile": "src/images/terrain/sand.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/sand.png",
    "spritesUsed": 1
   },
   {
    "srcToken": "terrain/sandwater.png",
    "repoFile": "src/images/terrain/sandwater.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/sandwater.png",
    "spritesUsed": 1
   },
   {
    "srcToken": "terrain/reed.png",
    "repoFile": "src/images/terrain/reed.png",
    "source": "lpc-submission-daneeklu",
    "sourceFile": "tilesets/reed.png",
    "spritesUsed": 4
   },
   {
    "srcToken": "interior_interior_png",
    "repoFile": "src/images/interior/interior.png",
    "source": "lpc-house-interior",
    "sourceFile": "interior.png",
    "sha256_16": "75da3be7ff3bfa99",
    "spritesUsed": 1,
    "only": "grandfather clock"
   },
   {
    "srcToken": "props_trees_plants_png",
    "repoFile": "src/images/props/props_trees_plants.png",
    "note": "the original atlas top half (rows 0-2272) - shipped unchanged as the top half of src/props.png; contains the LPC Trees / Conifers / Flowers-Plants-Fungi-Wood content credited in credits.txt"
   },
   {
    "srcToken": "terrain_terrain_tileset_png",
    "repoFile": "src/images/terrain/terrain_tileset.png",
    "note": "== src/terrain.png (sha256_16 d098d23fbe6bb51b); the terrain-v7 corner-autotile export of lpc-terrains/terrain-v7.png"
   }
  ]
 },
 "lateAdditions": {
  "note": "Sprites appended to props.png in the second integration pass (rows 940-959, species 800-819). Rects are [sx,sy,w,h] in the repo sheet named by `repoFile`; the atlas rows are byte-identical copies. Append-only: never reorder or remove these.",
  "sheets": {
   "src/images/terrain/build_atlas.png": [
    {
     "name": "tent",
     "rect": [
      418,
      517,
      124,
      150
     ]
    },
    {
     "name": "mine cart",
     "rect": [
      704,
      608,
      66,
      64
     ]
    },
    {
     "name": "hay cart",
     "rect": [
      680,
      676,
      80,
      55
     ]
    },
    {
     "name": "fur rug",
     "rect": [
      355,
      658,
      57,
      78
     ]
    }
   ],
   "src/images/props/farming_fishing.png": [
    {
     "name": "market counter",
     "rect": [
      256,
      320,
      255,
      42
     ]
    },
    {
     "name": "fish stall",
     "rect": [
      160,
      74,
      224,
      182
     ]
    },
    {
     "name": "green fish pile",
     "rect": [
      576,
      390,
      55,
      48
     ]
    },
    {
     "name": "blue fish pile",
     "rect": [
      576,
      513,
      64,
      56
     ]
    },
    {
     "name": "eel pile",
     "rect": [
      582,
      455,
      47,
      49
     ]
    },
    {
     "name": "red fish pile",
     "rect": [
      107,
      526,
      48,
      34
     ]
    },
    {
     "name": "green fish pair",
     "rect": [
      576,
      352,
      56,
      24
     ]
    },
    {
     "name": "red fish pair",
     "rect": [
      98,
      458,
      42,
      32
     ]
    },
    {
     "name": "firewood pile",
     "rect": [
      103,
      5,
      52,
      55
     ]
    },
    {
     "name": "stacked sacks",
     "rect": [
      96,
      65,
      64,
      63
     ]
    }
   ],
   "src/images/terrain/obj_misk_atlas.png": [
    {
     "name": "bookcase",
     "rect": [
      448,
      133,
      64,
      69
     ]
    },
    {
     "name": "tall wardrobe",
     "rect": [
      582,
      448,
      52,
      90
     ]
    },
    {
     "name": "curtains",
     "rect": [
      681,
      897,
      51,
      95
     ]
    },
    {
     "name": "checkered rug",
     "rect": [
      651,
      514,
      73,
      59
     ]
    }
   ],
   "src/images/props/dungeonex.png": [
    {
     "name": "skeleton",
     "rect": [
      0,
      260,
      32,
      57
     ]
    },
    {
     "name": "old chest",
     "rect": [
      153,
      73,
      71,
      55
     ]
    }
   ]
  }
 }
}
```

## 03-third-party-assets/licensing/credits.txt

_10636 bytes_

```markdown
LPC Map Forge - asset attribution
=================================

The two sprite sheets that ship with this generator (src/terrain.png and src/props.png) are packed
from freely-licensed Liberated Pixel Cup (LPC) art found on OpenGameArt.org. Every source pack is
listed below with its authors, licence(s) and origin URL. All of the art is CC-BY 4.0, CC-BY 3.0,
CC-BY-SA 3.0 and/or GPL; the resulting sheets are therefore distributed under CC-BY-SA 3.0.

The bottom band of src/props.png (everything below row 2272 - see props-sources.json) was packed
from a second group of packs, listed under "EXTENDED SHEET SOURCES" below.

The generator itself (code, procedural algorithms, UI) is original work.


TERRAIN — src/terrain.png
-------------------------
"[LPC] Terrains" (the terrain-v7 universal corner-autotile sheet, used unmodified)
  by bluecarrot16, Lanea Zimmerman (Sharm), Daniel Eddeland (Daneeklu), Richard Kettering (Jetrel),
  Zachariah Husiar (Zabin), Hyptosis, Casper Nilsson, Buko Studios, Nushio, ZaPaper, billknye,
  William Thompson, caeles, Redshrike, Bertram, and Rayane Felix (RayaneFLX)
  CC-BY-SA 3.0 / GPL 3.0
  https://opengameart.org/content/lpc-terrains

  which in turn credits / is derived from:
  - Liberated Pixel Cup (LPC) Base Assets (sprites & map tiles) - Lanea Zimmerman (Sharm)
    CC-BY 3.0 / CC-BY-SA 3.0 / GPL 3.0
    https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
  - [LPC] Farming tilesets, magic animations and UI elements - Daniel Eddeland (Daneeklu)
    CC-BY-SA 3.0 / GPL 3.0
    https://opengameart.org/content/lpc-farming-tilesets-magic-animations-and-ui-elements
  - ZRPG Tiles - Richard Kettering (Jetrel), Zachariah Husiar (Zabin), Hyptosis,
    Lanea Zimmerman (Sharm), Open Pixel Project
    CC-BY-SA 3.0+
    https://opengameart.org/content/zrpg-tiles
  - LPC C.Nilsson - Casper Nilsson
    CC-BY-SA 3.0 / GPL 3.0
    https://opengameart.org/content/lpc-cnilsson
  - Frozen Lake [LPC] - Buko Studios, commissioned by PlayCraft
    CC-BY 3.0
    https://opengameart.org/content/frozen-lake-lpc
  - LPC Animated Water and Waterfalls - ZaPaper
    CC-BY-SA 3.0
    https://opengameart.org/content/lpc-animated-water-and-waterfalls
  - LPC More Water Transitions - billknye
    CC-BY-SA 3.0 / GPL 3.0
    https://opengameart.org/content/lpc-more-water-transitions
  - [LPC] Sand+Rock Alt Colors - William.Thompsonj, Daniel Eddeland
    CC-BY-SA 3.0 / GPL 3.0
    https://opengameart.org/content/lpc-sandrock-alt-colors
  - [LPC] Colorful Sand + Deep Water! - Nushio
    CC-BY-SA 3.0 / GPL 3.0
    https://opengameart.org/content/lpc-colorful-sand-deep-water
  - LPC terrain extension - caeles
    CC-BY-SA 3.0 / GPL 3.0
    https://opengameart.org/content/lpc-terrain-extension
  - RPG Tiles: Cobble stone paths & town objects - Zachariah Husiar (Zabin),
    Daniel Eddeland (Daneeklu), Richard Kettering (Jetrel), Hyptosis, Redshrike, Bertram
    CC-BY-SA 3.0
    https://opengameart.org/content/rpg-tiles-cobble-stone-paths-town-objects
  - RPG Terrains - Rayane Felix (RayaneFLX)
    CC-BY-SA 3.0
    https://opengameart.org/content/rpg-terrains


PROPS — src/props.png
---------------------
Most sprites come from four curated LPC "mega packs" (which are themselves compilations of the
community packs listed beneath them):

"[LPC] Trees" (deciduous trees in green / brown / orange / pale / dead palettes)
  by bluecarrot16, Jetrel, Zabin, Hyptosis, Surt, Buch, Johann Charlot, Stephen Challener and the
  Open Surge team, Gaurav Munjal, Ivan Voirol (Silver IV), Guido Bos, Yar, Paulina Riva (PauR),
  William.Thompsonj, Casper Nilsson, ansimuz, qubodup, Bart K., Blarumyrran, Lanea Zimmerman
  (Sharm), Leonard Pabin, Chris Phillips, Barbara Rivera, and Talosaurus
  CC-BY-SA 3.0
  https://opengameart.org/content/lpc-trees

"[LPC] Conifers" (pine / fir trees, including snow-covered variants)
  by bluecarrot16, b_o, Lanea Zimmerman (Sharm), Johann Charlot, Yar, Jetrel, Zabin, Hyptosis,
  Surt, and KnoblePersona
  CC-BY-SA 3.0 / GPL 2.0 / GPL 3.0
  https://opengameart.org/content/lpc-conifers

"[LPC] Flowers / Plants / Fungi / Wood" (grass tufts, reeds, flowers, bushes)
  by bluecarrot16, Guido Bos, Ivan Voirol (Silver IV), SpiderDave, William.Thompsonj, Yar,
  Stephen Challener and the Open Surge team, Gaurav Munjal, Johann Charlot, Casper Nilsson, Jetrel,
  Zabin, Hyptosis, Surt, Lanea Zimmerman, George Bailey, ansimuz, Buch, and Open Pixel Project
  contributors
  CC-BY-SA 3.0
  https://opengameart.org/content/lpc-flowers-plants-fungi-wood

The two rock sprites come from:
  Liberated Pixel Cup (LPC) Base Assets - Lanea Zimmerman (AKA Sharm)
  CC-BY-SA 3.0 / CC-BY 3.0 / GPL 3.0
  https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles

The packs above build on these original community submissions (credited by the mega packs):
  - Lots of trees and plants from OGA (DB32) tilesets pack 1 - Jetrel, Zabin, Hyptosis, Surt (CC0)
  - Pine Tree Tiles - b_o (CC-BY-SA 3.0 / GPL 2.0)
  - Pine Tree Pack - KnoblePersona (CC-BY 3.0)
  - Lots of Hyptosis' tiles organized! - Hyptosis (CC-BY 3.0)
  - Basic map 32x32 by Silver IV - Ivan Voirol (CC-BY 3.0 / GPL 3.0 / GPL 2.0)
  - old frogatto tile art - Guido Bos (CC0)
  - Generic Platformer Tiles - Surt (CC0)
  - Isometric 64x64 Outside Tileset - Yar (CC-BY 3.0)
  - Nature tileset - Paulina Riva (PauR) (CC-BY 3.0)
  - [LPC] Tree Recolors - William.Thompsonj (CC-BY-SA 3.0 / GPL 3.0)
  - LPC C.Nilsson - Casper Nilsson (CC-BY-SA 3.0 / GPL 3.0)
  - Trees & Bushes - ansimuz (CC0)
  - OGA Community Tileset: Nature - qubodup, Bart K., Blarumyrran (GPL 2.0 / GPL 3.0 / CC-BY-SA 3.0)
  - Whispers of Avalon: Grassland Tileset - Leonard Pabin (CC-BY 3.0)
  - Team River Fox - Chris Phillips, Barbara Rivera (CC-BY-SA 3.0 / GPL 3.0)
  - Concept Art for LPC Entry - Barbara Rivera (CC-BY-SA 3.0 / GPL 3.0)
  - Flowers - SpiderDave (CC0)
  - [LPC] Leaf Recolor - William.Thompsonj (CC-BY-SA 3.0 / GPL 3.0)
  - 32x32 (and 16x16) RPG Tiles - Forest and some Interior Tiles - Stephen Challener and the
    Open Surge team, commissioned by Gaurav Munjal (CC-BY 3.0)
  - 16x16 Game Assets - George Bailey (CC-BY 4.0)
  - Tuxemon tileset - Buch (CC-BY-SA 3.0)
  - Outdoor tiles, again - Buch (CC-BY 2.0)
  - The Field of the Floating Islands - Buch (CC0)
  - Orthographic outdoor tiles - Buch (CC0)
  - OPP2017 - Jungle and temple set - OpenPixelProject.com (CC0)
  - Shoot'em up graphic kit - Johann Charlot (CC-BY-SA 3.0 / GPL 3.0)
  - Frozen Lake [LPC] - Buko Studios (CC-BY 3.0)


EXTENDED SHEET SOURCES (the rows below 2272 of src/props.png)
------------------------------------------------------------
These packs were added to the atlas after the original build, so that the map can place crops,
buildings, town objects, furniture and dungeon props. Each of the sheets below was matched to the
repo copy byte-for-byte (SHA-256), so the mapping in props-sources.json is exact.

"LPC Tile Atlas" (terrain_atlas.png, base_out_atlas.png)
  a 1024x1024 hardware-friendly atlas compiled from the LPC contest entries by adrix89
  CC-BY-SA 3.0 / GPL 3.0
  https://opengameart.org/content/lpc-tile-atlas
  Contains work by (per the pack's Attribution.txt):
  - Lanea Zimmerman (Sharm) - base assets (barrel, chests, country, dungeon, house, rock, stairs,
    treetop, trunk, water, waterfall, watergrass, mountains, signs, hole*, dirt*, grass*)
  - Stephen Challener (Redshrike) - walk/hurt/slash/spellcast character sprites
  - Charles Sanchez (CharlesGabriel) - monsters (bat, bee, worm, eyeball, ghost, slime, snake...)
  - Manuel Riecke (MrBeast) - hair, soldier
  - Daniel Armstrong (HughSpectrum) - castle walls/floors/outside/lightsources
  - Casper Nilsson - LPC C.Nilsson entry
  - Daniel Eddeland (Daneeklu) - farming tilesets
  - Johann Charlot - Shoot'em up graphic kit
  - Skyler Robert Colladay - FeralFantom's entry
  (see Attribution.txt in the zip for the full list)

"LPC Tile Atlas2" (build_atlas.png, obj_misk_atlas.png)
  the continuation atlas by adrix89 - buildings/architecture plus the leftover objects
  CC-BY-SA 3.0 / GPL 3.0
  https://opengameart.org/content/lpc-tile-atlas2
  Contains work by (per the pack's Attribution2.txt):
  - Barbara Rivera - tree, tombstone
  - Casper Nilsson - LPC C.Nilsson entry
  - Chris Phillips - tree
  - Daniel Eddeland (Daneeklu) - plants, props, food, environments, fences, market objects
  - Anamaris and Krusmira (Emilio J Sanchez) - Sierra__Steampun-a-fy
  - Jonas Klinger - Skorpio's SciFi Sprite Pack
  - Joshua Taylor - Fruit and Veggie Inventory
  - Leo Villeveygoux - Limestone Wall
  - Mark Weyer - signpost + shadow
  - Matthew Nash - Public Toilet Tileset
  - Skyler Robert Colladay - FeralFantom's entry
  - plus the LPC base-assets artists listed above (Sharm, Redshrike, CharlesGabriel, MrBeast,
    HughSpectrum)
  (see Attribution2.txt in the zip for the full list)

"[LPC] Dungeon Elements" (dungeonex.png)
  graphic art by Lanea Zimmerman (Sharm), commissioned and uploaded by William.Thompsonj
  CC-BY 4.0
  https://opengameart.org/content/lpc-dungeon-elements
  attribution required: "attribute Sharm as graphic artist, and William.Thompsonj as contributor"

"[LPC] Farming tilesets, magic animations and UI elements" (plants.png, farming_fishing.png,
fence.png, fence_alt.png, and the terrain-style sheets plowed_soil.png, wheat.png, youngwheat.png,
tallgrass.png, sand.png, sandwater.png, reed.png, which are used as ground decals)
  by Daniel Eddeland (Daneeklu)
  CC-BY-SA 3.0 / GPL 3.0
  https://opengameart.org/content/lpc-farming-tilesets-magic-animations-and-ui-elements
  (this pack is also a dependency of "[LPC] Terrains" above, but here its sheets are used directly)

"[LPC] House interior and decorations" (interior.png)
  by Reemax
  CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0
  https://opengameart.org/content/lpc-house-interior-and-decorations
  (one sprite is used: the grandfather clock)


REFERENCE ONLY (downloaded while researching, not shipped)
----------------------------------------------------------
"LPC C.Nilsson" - Casper Nilsson (harbour, Victorian house, windmill, gravestones, tent, deer, cow,
Asian theme). No sprite from this pack was identified in the shipped atlas - the Casper Nilsson
work that IS shipped reaches us through the two Tile Atlas compilations listed above, which credit
him directly.
  CC-BY-SA 3.0 / GPL 3.0
  https://opengameart.org/content/lpc-cnilsson

"LPC Base Assets" and "[LPC] Terrains" were also used as the source of terrain.png/water autotiles
(see the TERRAIN section above), so they are credited there rather than here.

```

## 05-build-config/build.mjs

_2672 bytes_

```javascript
// LPC Map Forge - bundle build pipeline
//
// Bundles src/forge.js (plus every module it imports) into a single ES-module bundle
// that the Perchance plugin facade in main.pjs can `import()` lazily.
//
// Usage (from this folder):
//   npm install          # installs esbuild
//   npm run build        # writes ../06-dist/forge-bundle.js
//
// Paths are relative to the package layout of this archive:
//   ../01-internal-code/src   -> bundle input
//   ../06-dist/forge-bundle.js -> bundle output
// Override with:  SRC=/path/to/src OUT=/path/to/out.js node build.mjs
//
// The source tree is never modified; this script only reads src/ and writes the bundle.
// See ../04-project-resources/README.md -> "Rebuilding the plugin bundle" for the
// equivalent browser-side recipe (esbuild-wasm inside a Web Worker), which is what the
// Perchance editor itself uses.

import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";

const SRC = process.env.SRC || "../01-internal-code/src";
const OUT = process.env.OUT || "../06-dist/forge-bundle.js";

// Minimal plugin: `import atlas from "./props.png"` becomes `export default "./props.png"`
// (the PNGs are hosted separately and their URLs are injected by main.pjs at runtime),
// and anything that is not a PNG is inlined as JavaScript by walking the src/ tree.
const assetUrls = {
  name: "asset-urls",
  setup(build) {
    build.onResolve({ filter: /^\// }, (args) => ({
      path: args.path.slice(1),
      namespace: "assets",
    }));
    build.onResolve({ filter: /^\./ }, (args) => ({
      path: args.path,
      namespace: "assets",
      pluginData: { resolveDir: args.resolveDir },
    }));
    build.onLoad({ filter: /.*/, namespace: "assets" }, (args) => {
      const dir = args.pluginData?.resolveDir ?? SRC;
      if (args.path.endsWith(".png")) {
        return { contents: `export default "./${basename(args.path)}";`, loader: "js" };
      }
      const file = resolve(dir, args.path);
      return {
        contents: readFileSync(file, "utf8"),
        loader: "js",
        resolveDir: dirname(file),
      };
    });
  },
};

const result = await esbuild.build({
  stdin: {
    contents: `export * from "./forge.js";`,
    resolveDir: SRC,
    loader: "js",
    sourcefile: "entry.js",
  },
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: true,
  write: false,
  plugins: [assetUrls],
  logLevel: "warning",
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, result.outputFiles[0].text);
console.log(`${OUT} written (${result.outputFiles[0].text.length} bytes)`);

```

## 05-build-config/package.json

_571 bytes_

```json
{
  "name": "lpc-map-forge",
  "version": "1.5.1",
  "private": true,
  "type": "module",
  "description": "Procedural top-down LPC fantasy map generator + editor. Builds the hosted ES-module bundle consumed by the Perchance plugin facade (main.pjs).",
  "homepage": "https://perchance.org/lpc-map-forge-v2",
  "repository": {
    "type": "git",
    "url": "https://github.com/Mosberg/LPCGame"
  },
  "author": "Mosberg",
  "scripts": {
    "build": "node build.mjs",
    "build:watch": "node build.mjs --watch"
  },
  "devDependencies": {
    "esbuild": "^0.21.5"
  }
}

```

## 05-build-config/README.md

_3330 bytes_

```markdown
# 05 — Build & config files

The only build step in the project: turning the `src/` ES-module tree into the single
minified bundle that the Perchance plugin facade lazy-loads.

| File | Role |
| --- | --- |
| `package.json` | Package metadata + the `build` script and the `esbuild` devDependency. |
| `build.mjs` | The esbuild pipeline (entry `src/forge.js` -> `dist/forge-bundle.js`). |

## Usage

```bash
npm install            # installs esbuild (^0.21.5)
npm run build          # ../06-dist/forge-bundle.js
```

Override the paths if you rearranged the archive:

```bash
SRC=../01-internal-code/src OUT=../06-dist/forge-bundle.js node build.mjs
```

## What the build does

1. Entry point is `export * from "./forge.js"` fed to esbuild via `stdin`, so the bundle's
   named exports are exactly the module's public API (`generate`, `serialize`, `buildTmx`,
   `renderFull`, `mountMapForge`, `openMapForge`, `pluginInfo`, ...).
2. `format: "esm"`, `target: "es2020"`, `minify: true`, `bundle: true`, `write: false`.
3. A tiny plugin resolves the two asset imports (`./terrain.png`, `./props.png`) into
   `export default "./terrain.png"` strings — the actual PNGs are hosted separately and their
   URLs are injected at runtime by `lpcMapForgePlugin()` in `main.pjs`. Every other import is
   read from disk and inlined, so the whole `src/` tree lands in one file.

## Browser variant (what the Perchance editor uses)

The editor runs the *same* pipeline entirely in the browser, via `esbuild-wasm` inside a Web
Worker — no Node, no install:

```js
const esbuild = (await import("https://esm.sh/esbuild-wasm@0.21.5?bundle")).default;
await esbuild.initialize({ wasmURL: "https://esm.sh/esbuild-wasm@0.21.5/esbuild.wasm" });

const assetUrls = {
  name: "asset-urls",
  setup(build) {
    build.onResolve({ filter: /^\// }, (a) => ({ path: a.path.slice(1), namespace: "assets" }));
    build.onResolve({ filter: /^\./ }, (a) => ({
      path: a.path, namespace: "assets", pluginData: { resolveDir: a.resolveDir },
    }));
    build.onLoad({ filter: /.*/, namespace: "assets" }, async (a) => {
      const dir = a.pluginData?.resolveDir ?? "src";
      if (a.path.endsWith(".png")) return { contents: `export default "./${a.path.split("/").pop()}";`, loader: "js" };
      let p = a.path.replace(/^\/+/, "").replace(/^\.\//, "");
      if (!p.startsWith("src/")) p = (dir === "src" ? "src/" : dir + "/") + p;
      const contents = await fs.readTextFile(p);            // the editor's virtual FS
      return { contents, loader: "js", resolveDir: p.split("/").slice(0, -1).join("/") || "." };
    });
  },
};

const out = await esbuild.build({
  stdin: { contents: `export * from "./forge.js";`, resolveDir: "src", loader: "js", sourcefile: "entry.js" },
  bundle: true, format: "esm", target: "es2020", minify: true, write: false, plugins: [assetUrls],
});
// out.outputFiles[0].text  ->  upload_file  ->  paste the URL as BUNDLE_URL in main.pjs
```

## Release checklist

1. `npm run build`
2. Upload `06-dist/forge-bundle.js` (Perchance `upload_file`) and paste the URL into
   `BUNDLE_URL` in `main.pjs`.
3. If `src/props.png` or `src/terrain.png` changed, upload those too and update `PROPS_URL` /
   `TILESET_URL`.
4. Bump `VERSION` in `lpcMapForgePlugin()`.
5. Reload the generator and confirm the console is clean.

```


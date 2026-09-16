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

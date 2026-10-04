// ============================================================================
// LPC Character Creator - application layer
// ============================================================================

import {
  ANIMS,
  BODY_TYPES,
  DIRECTIONS,
  DIR_ROWS,
  FRAME,
  CUSTOM_ANIM_LABELS,
  animMeta,
  frameIndicesFor,
  frameSizeFor,
  customAnimsFor,
  availableAnimations,
  attackAnimations,
  resolveAnimation,
  animationMap as animationMapEngine,
  equipmentAnimations as equipmentAnimationsEngine,
  loadCatalog,
  buildIndexes,
  supportsBodyType,
  supportsAnim,
  colorSlots,
  defaultKey,
  colorOptions,
  variantSwatch,
  collectLayers,
  getFrame,
  renderFullSheet as renderFullSheetEngine,
  renderAnimSheet as renderAnimSheetEngine,
  renderFrame as renderFrameEngine,
  encodeHash,
  decodeHash,
  keyLabel,
  resolvePalette,
} from "./engine.js";
import { LPC_CSS, LPC_HTML } from "./ui.js";

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
};

// ---------------------------------------------------------------------------
// Catalog plumbing + stateless public API (usable without mounting the UI)
// ---------------------------------------------------------------------------

export const PLUGIN_VERSION = "1.4.1";
export const DEFAULT_CATALOG_URL = "src/data/catalog.json";

let catalogUrl = DEFAULT_CATALOG_URL;
let catalogPromise = null;
let indexesCache = null;

async function ensureCatalog(url) {
  if (url) catalogUrl = url;
  if (!catalogPromise) catalogPromise = loadCatalog(catalogUrl);
  return catalogPromise;
}

/** Normalise anything the caller passes (character object or share code) into engine state. */
function normalizeCharacter(cat, character) {
  const fallback = {
    bt: "male",
    sel: {
      body: { item: "body", variant: null },
      head: { item: "heads_human_male", variant: null },
    },
    colors: {},
  };
  if (character == null) return fallback;
  if (typeof character === "string") {
    const s = decodeHash(cat, buildIndexes(cat), character);
    return s && Object.keys(s.sel).length ? s : fallback;
  }
  const sel = {};
  for (const [type, v] of Object.entries(character.sel || {})) {
    if (!v) continue;
    const item = typeof v === "string" ? v : v.item;
    if (cat.items[item]) sel[type] = { item, variant: (v && v.variant) || null };
  }
  if (!Object.keys(sel).length) return fallback;
  return { bt: character.bt || "male", sel, colors: Object.assign({}, character.colors || {}) };
}

function scaleCanvas(canvas, scale) {
  const c = document.createElement("canvas");
  c.width = Math.round(canvas.width * scale);
  c.height = Math.round(canvas.height * scale);
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}

/** One recoloured frame canvas (64/128/192px, per animation) for a state. */
async function drawFrameCanvas(cat, st, animKey, dir, frameIdx, scale) {
  const idx = frameIndicesFor(animKey);
  const fi = idx[((frameIdx % idx.length) + idx.length) % idx.length];
  const row = DIR_ROWS[dir] === undefined ? DIR_ROWS.down : DIR_ROWS[dir];
  const layers = collectLayers(cat, st, animKey);
  const size = frameSizeFor(animKey);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  await renderFrameEngine(ctx, cat, st, animKey, fi, row, layers);
  if (!scale || scale === 1) return c;
  return scaleCanvas(c, scale);
}

export async function getCatalog(opts = {}) {
  return ensureCatalog(opts.catalogUrl);
}

/** A single frame of a character as a canvas. dir: up|left|down|right. */
export async function renderFrame(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  return drawFrameCanvas(cat, st, opts.anim || "idle", opts.dir || "down", opts.frame || 0, opts.scale || 1);
}

/** All frames of one animation, 4 direction rows x cycle columns, as a canvas. */
export async function renderAnimSheet(character, anim, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  return renderAnimSheetEngine(cat, st, anim || "walk", opts.onProgress);
}

/**
 * The full LPC sheet for a character, as a canvas: the standard 832x3456 sheet
 * plus one area per custom animation the equipment provides (appended below it).
 */
export async function renderFullSheet(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  return renderFullSheetEngine(cat, st, opts.onProgress);
}

/** Share code (upstream-compatible hash) for a character object. */
export async function characterToCode(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return encodeHash(cat, normalizeCharacter(cat, character));
}

/** Parse a share code (or a full share link) back into a character object. */
export async function characterFromCode(code, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const s = decodeHash(cat, buildIndexes(cat), code);
  if (!s || !Object.keys(s.sel).length) return null;
  return { bt: s.bt, sel: s.sel, colors: s.colors };
}

/**
 * Which animations a character can play, given what it has equipped.
 * Returns `{ available, standard, custom, attacks }` - `custom` are the
 * equipment-authored animations (e.g. `slash_128` for an arming sword, the axe
 * swing for a tool) and `attacks` is the ordered list a game should use for
 * "attack" (custom attack areas first, then standard slash/thrust/shoot).
 */
export async function animationsFor(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  const custom = customAnimsFor(cat, st);
  return {
    available: availableAnimations(cat, st),
    standard: ANIMS.map((a) => a.key),
    custom,
    attacks: attackAnimations(cat, st),
  };
}

/** The single best "attack" animation key for a character, or null. */
export async function attackAnimation(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return attackAnimations(cat, normalizeCharacter(cat, character))[0] || null;
}

/**
 * Map each standard animation a game might request to the animation the
 * equipment actually supersedes it with, e.g. `{ walk: "walk_128", slash:
 * "slash_128" }` for a bow + arming sword. Unaffected animations map to
 * themselves, so a game can safely do
 * `sprite.draw(ctx, x, y, { anim: map[logicalAnim], ... })`.
 */
export async function animationMap(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return animationMapEngine(cat, normalizeCharacter(cat, character));
}

/**
 * The equipped-item -> animation association: one entry per item that brings
 * its own animation art, e.g. `{ name: "Arming Sword", animations: ["slash_128",
 * "backslash_128", "halfslash_128"] }`. Handy for tooltips, keybinds and for
 * knowing which animation to play when an item is used.
 */
export async function equipmentAnimations(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return equipmentAnimationsEngine(cat, normalizeCharacter(cat, character));
}

/**
 * Pre-rendered sprite for a character, ready to draw in a game loop:
 *   const sprite = await lpc.createSprite(character, { anims: ["idle", "walk"] });
 *   sprite.draw(ctx, x, y, { anim: "walk", dir: "down", frame: i });
 */
export async function createSprite(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  // Equipment-authored animations (e.g. `slash_128` for an arming sword, or the
  // axe swing for a tool) are pre-rendered alongside the requested ones, plus
  // the primary attack animation - otherwise the equipped weapon would vanish
  // whenever the game plays its attack.
  const attack = opts.attackAnim === false ? [] : attackAnimations(cat, st);
  const animKeys = (opts.anims || ["idle", "walk"]).slice();
  if (opts.includeEquipmentAnims !== false) {
    for (const k of customAnimsFor(cat, st)) if (!animKeys.includes(k)) animKeys.push(k);
    if (attack.length && !animKeys.includes(attack[0])) animKeys.push(attack[0]);
  }
  const dirKeys = opts.directions || ["up", "left", "down", "right"];
  const scale = opts.scale || 1;
  const frames = {};
  const sizes = {};
  for (const key of animKeys) {
    const meta = animMeta(key);
    if (!meta) continue;
    frames[key] = {};
    sizes[key] = meta.frameSize * scale;
    for (const dir of dirKeys) {
      if (DIR_ROWS[dir] === undefined) continue;
      const list = [];
      for (let i = 0; i < meta.frameCount; i++) {
        list.push(await drawFrameCanvas(cat, st, key, dir, i, scale));
      }
      frames[key][dir] = list;
    }
  }
  const fpsFor = (key) => {
    if (typeof opts.fps === "number") return opts.fps;
    if (opts.fps && opts.fps[key]) return opts.fps[key];
    if (key === "walk" || key === "walk_128") return 10;
    if (key === "run") return 14;
    if (key === "idle" || key === "combat") return 4;
    return 8;
  };
  const maxSize = Math.max(FRAME * scale, ...Object.values(sizes));
  return {
    character: { bt: st.bt, sel: st.sel, colors: st.colors },
    frameSize: FRAME * scale,
    maxFrameSize: maxSize,
    scale,
    animations: Object.keys(frames),
    attackAnim: attack[0] || null,
    attackAnims: attack,
    frameSizeFor(anim) {
      return sizes[anim] || FRAME * scale;
    },
    getFrame(anim, dir, index = 0) {
      const d = frames[anim] && frames[anim][dir];
      if (!d || !d.length) return null;
      return d[((index % d.length) + d.length) % d.length];
    },
    frameCount(anim) {
      return (frames[anim] && frames[anim].down && frames[anim].down.length) || 0;
    },
    fps(anim) {
      return fpsFor(anim);
    },
    /**
     * Resolve a logical animation name to the one the equipment supersedes it
     * with (e.g. "walk" -> "walk_128" for a bow, "slash" -> "slash_128" for an
     * arming sword). Returns the input unchanged when nothing overrides it.
     */
    resolve(anim) {
      return resolveAnimation(cat, st, anim);
    },
    draw(ctx, x, y, o = {}) {
      const c = this.getFrame(o.anim || "idle", o.dir || "down", o.frame || 0);
      if (!c) return false;
      const s = o.scale || 1;
      const w = c.width * s;
      const h = c.height * s;
      const anchor = o.anchor || "bottom-center";
      let dx = x;
      let dy = y;
      if (anchor === "center") {
        dx = x - w / 2;
        dy = y - h / 2;
      } else if (anchor === "bottom-center") {
        // Larger (custom) areas centre the 64px character in the frame, so
        // keep the character's feet on `y` rather than the canvas bottom.
        dx = x - w / 2;
        dy = y - ((c.width + FRAME) / 2) * s;
      }
      ctx.drawImage(c, dx, dy, w, h);
      return true;
    },
  };
}

// ---------------------------------------------------------------------------
// The app instance (one fully independent copy per mount)
// ---------------------------------------------------------------------------

async function createApp(root, host, options) {
  const $ = (id) => root.getElementById(id);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

const REQUIRED = new Set(["body", "head"]);
const DEFAULT_SEL = { body: "body", head: "heads_human_male", expression: "face_neutral" };

const state = {
  bt: "male",
  sel: {},
  colors: {},
  anim: "walk",
  dir: "down",
  zoom: 12,
  playing: true,
  dirs4: false,
};

let cat = null;
let indexes = null;
let activeTags = new Set();

// preview
let previewSets = [];
let previewGen = 0;
let previewDirty = true;
let frameIdx = 0;
let lastTick = 0;
const FPS = 8;

// browser
let browserGen = 0;
const tiles = [];

// lifecycle
let destroyed = false;
const changeListeners = new Set();
const teardown = [];

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

function recomputeTags() {
  const tags = new Set();
  for (const sel of Object.values(state.sel)) {
    const item = sel && cat.items[sel.item];
    if (!item) continue;
    for (const t of item.tg || []) tags.add(t);
  }
  activeTags = tags;
}

function itemAllowed(item) {
  if (!item) return false;
  if (!supportsBodyType(item, state.bt)) return false;
  if (item.rt && item.rt.length) return item.rt.some((t) => activeTags.has(t));
  return true;
}

function ensureColors() {
  for (const sel of Object.values(state.sel)) {
    const item = cat.items[sel.item];
    if (!item) continue;
    for (const slot of colorSlots(item)) {
      if (state.colors[slot.group] === undefined) state.colors[slot.group] = defaultKey(slot.entry);
    }
  }
}

function defaultState() {
  state.sel = {};
  for (const [t, id] of Object.entries(DEFAULT_SEL)) state.sel[t] = { item: id, variant: null };
  state.colors = {};
  recomputeTags();
  ensureColors();
}

function sanitize() {
  recomputeTags();
  // required: body
  if (!state.sel.body || !supportsBodyType(cat.items[state.sel.body.item], state.bt)) {
    state.sel.body = { item: "body", variant: null };
  }
  recomputeTags();
  // required: head - swap for a compatible one if the current head no longer fits
  const head = state.sel.head && cat.items[state.sel.head.item];
  if (!head || !supportsBodyType(head, state.bt) || !itemAllowed(head)) {
    const pref = [
      "heads_human_male",
      "heads_human_female",
      "heads_human_child",
      "heads_boarman",
      "heads_lizard_male",
      "heads_orc_male",
    ];
    let pick = pref.find((id) => cat.items[id] && supportsBodyType(cat.items[id], state.bt));
    if (!pick) pick = (indexes.byType.head || []).find((id) => supportsBodyType(cat.items[id], state.bt));
    if (pick) state.sel.head = { item: pick, variant: null };
  }
  recomputeTags();
  for (const t of Object.keys(state.sel)) {
    if (REQUIRED.has(t)) continue;
    const item = cat.items[state.sel[t].item];
    if (!item || !itemAllowed(item)) {
      delete state.sel[t];
      recomputeTags();
    }
  }
  ensureColors();
  // drop colours whose group no longer exists anywhere
  const live = new Set();
  for (const sel of Object.values(state.sel)) {
    const item = cat.items[sel.item];
    if (item) for (const s of colorSlots(item)) live.add(s.group);
  }
  for (const g of Object.keys(state.colors)) if (!live.has(g)) delete state.colors[g];
}

function selectItem(itemId) {
  const item = cat.items[itemId];
  if (!item) return;
  if (!itemAllowed(item)) return;
  const prev = state.sel[item.t];
  if (prev && prev.item === itemId) {
    if (REQUIRED.has(item.t)) return;
    delete state.sel[item.t];
  } else {
    state.sel[item.t] = { item: itemId, variant: item.v && item.v.length ? item.v[0] : null };
  }
  sanitize();
  onStateChange();
}

function setVariant(typeName, variant) {
  const sel = state.sel[typeName];
  if (!sel) return;
  sel.variant = variant;
  onStateChange();
}

function setColor(group, key) {
  state.colors[group] = key;
  onStateChange();
}

// ---------------------------------------------------------------------------
// Preview rendering
// ---------------------------------------------------------------------------

/**
 * Names of equipped items that bring their own art to an animation - the
 * association the user can see ("Slash (128) · down · Arming Sword"). Only
 * items with custom animation art are listed, so ordinary clothing stays out.
 */
function animSourceNames(animKey) {
  const meta = animMeta(animKey);
  if (!meta || !cat) return "";
  const names = [];
  for (const sel of Object.values(state.sel)) {
    const item = sel && cat.items[sel.item];
    if (!item || !supportsBodyType(item, state.bt)) continue;
    if (!item.l.some((l) => l.ca)) continue;
    const contributes = meta.custom
      ? item.l.some((l) => l.ca === animKey)
      : supportsAnim(item, animKey) || (meta.base && supportsAnim(item, meta.base));
    if (contributes) names.push(item.n);
  }
  return names.join(", ");
}

/**
 * Frame order for the live preview. A custom area may mark itself
 * `skipFirstFrameInPreview` (e.g. `walk_128`, whose frame 0 is the standing
 * pose); the exported sheets keep every frame, only the playback loop skips it.
 */
function previewFrameIndicesFor(key) {
  const meta = animMeta(key);
  const idx = frameIndicesFor(key);
  if (meta && meta.custom && meta.def.skipFirstFrameInPreview && idx.length > 1) return idx.slice(1);
  return idx;
}

async function rebuildPreview() {
  const gen = ++previewGen;
  const meta = animMeta(state.anim);
  if (!meta) return;
  const dirs = state.dirs4 ? ["up", "left", "down", "right"] : [state.dir];
  const idx = previewFrameIndicesFor(state.anim);
  const layers = collectLayers(cat, state, state.anim);
  const sets = [];
  for (const d of dirs) {
    const row = DIR_ROWS[d];
    const frames = await Promise.all(
      idx.map(async (fi) => {
        const set = await Promise.all(layers.map((l) => getFrame(l, row, fi)));
        return set.filter(Boolean);
      }),
    );
    sets.push({ dir: d, frames });
  }
  if (gen !== previewGen) return;
  previewSets = sets;
  previewDirty = false;
  const sources = animSourceNames(state.anim);
  $("stageBadge").textContent =
    meta.label.toLowerCase() +
    (state.dirs4 ? " · all directions" : " · " + state.dir) +
    (sources ? " · " + sources : "");
  $("previewCanvas").style.opacity = layers.length ? "1" : "0.15";
  drawPreview();
}

function drawPreview() {
  const canvas = $("previewCanvas");
  const size = frameSizeFor(state.anim) * state.zoom;
  const sets = previewSets;
  const n = Math.max(1, sets.length);
  const w = size * n;
  if (canvas.width !== w || canvas.height !== size) {
    canvas.width = w;
    canvas.height = size;
  }
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, size);
  for (let s = 0; s < sets.length; s++) {
    const frames = sets[s].frames;
    if (!frames.length) continue;
    const set = frames[frameIdx % frames.length];
    const dx = s * size;
    for (const f of set) ctx.drawImage(f, dx, 0, size, size);
  }
  fitCanvasToStage(canvas, w, size);
}

function fitCanvasToStage(canvas, w, h) {
  const stage = canvas.parentElement;
  if (!stage) return;
  const availW = stage.clientWidth - 36;
  const availH = stage.clientHeight - 36;
  let s = 1;
  if (availW > 0 && availH > 0) {
    const fit = Math.min(availW / w, availH / h, 1);
    // Prefer crisp integer downscales (1/2, 1/3, ...) when they don't cost
    // much space; otherwise fall back to a fractional fit.
    const inv = 1 / Math.ceil(1 / fit);
    s = inv >= fit * 0.85 ? inv : fit;
    s = Math.max(s, 0.04);
  }
  canvas.style.width = Math.max(1, Math.round(w * s)) + "px";
  canvas.style.height = Math.max(1, Math.round(h * s)) + "px";
}

function drawTiles() {
  for (const t of tiles) {
    if (!t.frames || !t.frames.length) continue;
    const set = t.frames[frameIdx % t.frames.length];
    const ctx = t.canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, t.canvas.width, t.canvas.height);
    for (const f of set) ctx.drawImage(f, 0, 0);
  }
}

function tick(t) {
  if (destroyed) return;
  requestAnimationFrame(tick);
  if (t - lastTick < 1000 / FPS) return;
  lastTick = t;
  if (!state.playing) return;
  frameIdx++;
  drawPreview();
  drawTiles();
}

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

const THUMB_ANIMS = ["walk", "idle", "spellcast", "slash", "thrust", "shoot", "hurt", "jump", "sit"];

/**
 * Best animation for an item's tile. Items whose only art lives in a custom
 * animation (katana, club, fishing rod, ...) fall back to that area, otherwise
 * their tile would be blank.
 */
function thumbAnimFor(item) {
  for (const a of THUMB_ANIMS) if (supportsAnim(item, a)) return a;
  for (const layer of item.l || []) if (layer.ca && CUSTOM_ANIM_LABELS[layer.ca]) return layer.ca;
  return (item.a && item.a[0]) || "walk";
}

function thumbStateFor(item, anim) {
  const sel = Object.assign({}, state.sel);
  sel[item.t] = { item: findId(item), variant: item.v && item.v.length ? item.v[0] : null };
  const colors = Object.assign({}, state.colors);
  for (const s of colorSlots(item)) if (colors[s.group] === undefined) colors[s.group] = defaultKey(s.entry);
  return { bt: state.bt, sel, colors, anim };
}

let idOfItem = new WeakMap();
function findId(item) {
  return idOfItem.get(item);
}

function makePool(size) {
  let running = 0;
  const q = [];
  const next = () => {
    while (running < size && q.length) {
      const job = q.shift();
      running++;
      Promise.resolve()
        .then(job)
        .catch((e) => console.error("thumbnail failed", e))
        .finally(() => {
          running--;
          next();
        });
    }
  };
  return (job) => {
    q.push(job);
    next();
  };
}
const thumbPool = makePool(6);

function buildTile(itemId) {
  const item = cat.items[itemId];
  const tile = el("button", "tile");
  tile.type = "button";
  tile.title = item.n;
  const canvas = document.createElement("canvas");
  canvas.width = FRAME;
  canvas.height = FRAME;
  tile.appendChild(canvas);
  const cap = el("div", "cap", item.n);
  tile.appendChild(cap);
  const shimmer = el("div", "shimmer");
  tile.appendChild(shimmer);
  tile.dataset.item = itemId;
  if (state.sel[item.t] && state.sel[item.t].item === itemId) tile.classList.add("on");
  tile.addEventListener("click", () => selectItem(itemId));
  const entry = { tile, shimmer, canvas, frames: null };
  tiles.push(entry);
  return entry;
}

function scheduleTiles(gen) {
  for (const t of tiles) {
    thumbPool(async () => {
      if (gen !== browserGen) return;
      if (t.frames) {
        t.shimmer.remove();
        return;
      }
      const item = cat.items[t.tile.dataset.item];
      if (!item) return;
      const anim = thumbAnimFor(item);
      const st = thumbStateFor(item, anim);
      const layers = collectLayers(cat, st, anim);
      const row = DIR_ROWS.down;
      const idx = frameIndicesFor(anim);
      const sets = await Promise.all(
        idx.map(async (fi) => {
          const s = await Promise.all(layers.map((l) => getFrame(l, row, fi)));
          return s.filter(Boolean);
        }),
      );
      if (gen !== browserGen) return;
      const size = frameSizeFor(anim);
      t.canvas.width = size;
      t.canvas.height = size;
      t.frames = sets;
      t.shimmer.remove();
      const set = sets[frameIdx % sets.length] || [];
      const ctx = t.canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);
      for (const f of set) ctx.drawImage(f, 0, 0);
    });
  }
}

// ---------------------------------------------------------------------------
// Browser (category drill-down + search)
// ---------------------------------------------------------------------------

let navPath = [];
let searchQuery = "";

function countItems(node) {
  let n = (node.items || []).length;
  for (const c of node.children || []) n += countItems(c);
  return n;
}

function renderBreadcrumb() {
  const wrap = el("div", "crumb");
  const parts = [{ label: "All", node: null }].concat(
    navPath.map((n) => ({ label: n.label, node: n })),
  );
  wrap.innerHTML = parts
    .map((p, i) => (i === parts.length - 1 ? "<b>" + esc(p.label) + "</b>" : esc(p.label)))
    .join(" &nbsp;›&nbsp; ");
  return wrap;
}

function renderBrowser() {
  browserGen++;
  const gen = browserGen;
  tiles.length = 0;
  const browserEl = $("browserEl");
  browserEl.innerHTML = "";

  if (searchQuery.length >= 2) {
    const q = searchQuery.toLowerCase();
    const hits = Object.keys(cat.items).filter((id) => {
      const it = cat.items[id];
      if (!itemAllowed(it)) return false;
      return it.n.toLowerCase().includes(q) || (it.t || "").toLowerCase().includes(q);
    });
    const head = el("div", "crumb");
    head.innerHTML = "<b>" + hits.length + "</b> result" + (hits.length === 1 ? "" : "s") + " for “" + esc(searchQuery) + "”";
    browserEl.appendChild(head);
    const grid = el("div", "grid big");
    for (const id of hits.slice(0, 160)) grid.appendChild(buildTile(id).tile);
    browserEl.appendChild(grid);
    if (!hits.length) browserEl.appendChild(el("div", "empty", "No items match."));
    scheduleTiles(gen);
    updateTreeHighlight();
    return;
  }

  const node = navPath.length ? navPath[navPath.length - 1] : null;
  browserEl.appendChild(renderBreadcrumb());

  const children = node ? node.children || [] : cat.tree;
  if (children.length) {
    const chips = el("div", "cat-chips");
    for (const c of children) {
      const b = el("button", "chip", c.label + " · " + countItems(c));
      b.type = "button";
      b.addEventListener("click", () => openNode(c));
      chips.appendChild(b);
    }
    browserEl.appendChild(chips);
  }

  const own = (node ? node.items || [] : []).filter((id) => cat.items[id] && itemAllowed(cat.items[id]));
  if (own.length) {
    const grid = el("div", "grid big");
    for (const id of own) grid.appendChild(buildTile(id).tile);
    browserEl.appendChild(grid);
  } else if (!children.length) {
    browserEl.appendChild(el("div", "empty", "Nothing here."));
  }
  scheduleTiles(gen);
  updateTreeHighlight();
}

function openNode(node) {
  navPath = [];
  // rebuild the path from the root by walking the tree
  const found = findPath(cat.tree, node, []);
  if (found) navPath = found;
  scrollBrowserIntoView();
  renderBrowser();
}

function scrollBrowserIntoView() {
  try {
    const pb = document.querySelector(".col-browser .panel-body");
    if (!pb || pb.scrollHeight <= pb.clientHeight + 4) return;
    const top = $("browserEl").offsetTop - pb.offsetTop - 8;
    pb.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  } catch (e) {
    /* layout not scrollable - fine */
  }
}

function findPath(nodes, target, acc) {
  for (const n of nodes) {
    if (n === target) return acc.concat(n);
    if (n.children && n.children.length) {
      const r = findPath(n.children, target, acc.concat(n));
      if (r) return r;
    }
  }
  return null;
}

function renderTree() {
  const treeEl = $("treeEl");
  treeEl.innerHTML = "";
  const wrap = el("div");
  for (const root of cat.tree) wrap.appendChild(treeRow(root, wrap, true));
  treeEl.appendChild(wrap);
}

function treeRow(node, parent, branch) {
  const box = el("div", "tree-node");
  const row = el("div", "tree-row");
  row.dataset.nodeId = node.id;
  const hasKids = node.children && node.children.length;
  const caret = el("span", "tree-caret", hasKids ? "▸" : "·");
  row.appendChild(caret);
  row.appendChild(el("span", "tree-label", node.label));
  row.appendChild(el("span", "tree-count", String(countItems(node))));
  box.appendChild(row);
  if (hasKids) {
    const kids = el("div", "tree-children");
    kids.hidden = true;
    for (const c of node.children) kids.appendChild(treeRow(c, kids, true));
    box.appendChild(kids);
    row.addEventListener("click", () => {
      const open = kids.hidden;
      kids.hidden = !open;
      caret.textContent = open ? "▾" : "▸";
      openNode(node);
    });
  } else {
    row.addEventListener("click", () => openNode(node));
  }
  return box;
}

function updateTreeHighlight() {
  const cur = navPath.length ? navPath[navPath.length - 1] : null;
  for (const r of document.querySelectorAll(".tree-row")) {
    r.classList.toggle("active", !!cur && r.dataset.nodeId === cur.id);
  }
}

// ---------------------------------------------------------------------------
// Detail panels
// ---------------------------------------------------------------------------

const TYPE_ORDER = [
  "body", "head", "expression", "eyes", "eyebrows", "nose", "ears", "furry_ears",
  "hair", "beard", "mustache", "hairextl", "hairextr", "hairtie", "updo",
  "hat", "hat_overlay", "hat_trim", "facial_mask", "visor",
  "neck", "necklace", "cape", "backpack", "quiver",
  "torso", "clothes", "dress", "vest", "jacket", "apron", "overalls", "sash", "belt", "buckles",
  "arms", "sleeves", "gloves", "wrists", "bracers", "shoulders", "bauldron", "chainmail", "armour",
  "legs", "shoes", "socks", "feet", "accessory",
  "weapon", "shield", "tool", "ammo", "charm", "ring",
  "wings", "tail", "horns", "fins", "wound_ribs", "wound_arm", "wound_brain", "wound_mouth",
  "shadow", "prosthesis_hand", "prosthesis_leg",
  // There is a single wheelchair item, but it is its own slot upstream.
  "wheelchair",
];
function typeRank(t) {
  const i = TYPE_ORDER.indexOf(t);
  return i < 0 ? 500 : i;
}

function renderEquipped() {
  const wrap = $("equippedEl");
  wrap.innerHTML = "";
  const entries = Object.entries(state.sel).sort(
    (a, b) => typeRank(a[0]) - typeRank(b[0]) || a[0].localeCompare(b[0]),
  );
  if (!entries.length) {
    wrap.appendChild(el("div", "empty", "Nothing equipped."));
    return;
  }
  for (const [typeName, sel] of entries) {
    const item = cat.items[sel.item];
    if (!item) continue;
    const row = el("div", "eq-item");
    const sw = el("span", "sw");
    sw.style.background = swatchBgFor(item, sel);
    row.appendChild(sw);
    const nm = el("div", "nm");
    nm.appendChild(el("div", null, item.n));
    const subBits = [typeName];
    if (item.v && item.v.length) subBits.push(String(sel.variant || item.v[0]));
    const slot = colorSlots(item)[0];
    if (slot) subBits.push(state.colors[slot.group] || defaultKey(slot.entry));
    const sub = el("div", "sub", subBits.join(" · "));
    nm.appendChild(sub);
    // Show which animations this item brings along, so the item <-> animation
    // association is visible right where the item is equipped.
    const anims = [];
    for (const layer of item.l || []) if (layer.ca && !anims.includes(layer.ca)) anims.push(layer.ca);
    if (anims.length) {
      const tags = el("div", "anim-tags");
      for (const key of anims) {
        const b = el("button", "anim-tag", CUSTOM_ANIM_LABELS[key] || key);
        b.type = "button";
        b.title = "Preview this animation";
        b.addEventListener("click", () => {
          state.anim = key;
          frameIdx = 0;
          syncControls();
          onStateChange();
        });
        tags.appendChild(b);
      }
      nm.appendChild(tags);
    }
    row.appendChild(nm);
    if (!REQUIRED.has(typeName)) {
      const x = el("button", "x", "✕");
      x.title = "Remove " + item.n;
      x.addEventListener("click", () => {
        delete state.sel[typeName];
        sanitize();
        onStateChange();
      });
      row.appendChild(x);
    }
    wrap.appendChild(row);
  }
}

function swatchBgFor(item, sel) {
  const slot = colorSlots(item)[0];
  if (slot) {
    const key = state.colors[slot.group] || defaultKey(slot.entry);
    const colors = resolvePalette(cat, slot.entry, key);
    if (colors) return ramp(colors);
  }
  if (item.v && item.v.length) {
    const colors = variantSwatch(cat, sel.variant || item.v[0]);
    if (colors) return ramp(colors);
  }
  return "#1a2330";
}

function ramp(colors) {
  const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`);
  return "linear-gradient(120deg," + stops.join(",") + ")";
}

function renderColors() {
  const wrap = $("colorsEl");
  const title = $("colorsTitle");
  wrap.innerHTML = "";
  const slotsByGroup = new Map();
  const variantBlocks = [];
  for (const [typeName, sel] of Object.entries(state.sel).sort((a, b) => typeRank(a[0]) - typeRank(b[0]))) {
    const item = cat.items[sel.item];
    if (!item) continue;
    for (const slot of colorSlots(item)) {
      if (!slotsByGroup.has(slot.group)) slotsByGroup.set(slot.group, { slot, item, typeName });
    }
    if (item.v && item.v.length) variantBlocks.push({ item, sel, typeName });
  }
  let count = slotsByGroup.size + variantBlocks.length;
  title.textContent = "Colors" + (count ? " (" + count + ")" : "");
  if (!count) {
    wrap.appendChild(el("div", "empty", "This item has no colour options."));
    return;
  }

  for (const { slot, item } of slotsByGroup.values()) {
    wrap.appendChild(colorBlock(slot, item));
  }
  for (const v of variantBlocks) wrap.appendChild(variantBlock(v));
}

function colorBlock(slot, item) {
  const block = el("div", "slot-block");
  const head = el("div", "slot-head");
  const nm = el("div", "slot-name", slot.label);
  nm.title = slot.label + " — shared by: " + item.n;
  head.appendChild(nm);
  const cur = state.colors[slot.group] || defaultKey(slot.entry);
  head.appendChild(el("span", "tree-count", keyLabel(cat, slot.entry, cur)));
  block.appendChild(head);

  const options = colorOptions(cat, slot.entry);
  // group by version for readability
  const groups = new Map();
  for (const o of options) {
    const entry = o.key === "source" ? { d: "custom" } : slot.entry;
    const ver =
      o.key === "source"
        ? "custom"
        : (function () {
            const k = o.key.split(".");
            return k.length > 1 && k[0] !== slot.entry.m ? k[0] : k[1] || slot.entry.d;
          })();
    if (!groups.has(ver)) groups.set(ver, []);
    groups.get(ver).push(o);
  }
  for (const [ver, opts] of groups) {
    const g = el("div", "swatch-group");
    const verLabel = (cat.paletteVersions && cat.paletteVersions[ver] && cat.paletteVersions[ver].label) || ver;
    if (groups.size > 1) g.appendChild(el("div", "vg", verLabel));
    const row = el("div", "swatches");
    for (const o of opts) {
      const b = el("button", "sw" + (o.key === cur ? " on" : ""));
      b.type = "button";
      b.style.background = ramp(o.colors);
      b.title = o.label;
      b.addEventListener("click", () => setColor(slot.group, o.key));
      row.appendChild(b);
    }
    g.appendChild(row);
    block.appendChild(g);
  }
  return block;
}

function variantBlock({ item, sel, typeName }) {
  const block = el("div", "slot-block");
  const head = el("div", "slot-head");
  head.appendChild(el("div", "slot-name", item.n + " — variant"));
  head.appendChild(el("span", "tree-count", String(sel.variant || item.v[0])));
  block.appendChild(head);
  const cur = sel.variant || item.v[0];
  if (item.v.length > 14) {
    const sel2 = document.createElement("select");
    for (const v of item.v) {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = variantLabel(v);
      if (v === cur) o.selected = true;
      sel2.appendChild(o);
    }
    sel2.addEventListener("change", () => setVariant(typeName, sel2.value));
    block.appendChild(sel2);
  } else {
    const row = el("div", "swatches");
    for (const v of item.v) {
      const b = el("button", "sw" + (v === cur ? " on" : ""));
      b.type = "button";
      const colors = variantSwatch(cat, v);
      if (colors) b.style.background = ramp(colors);
      else b.classList.add("sw-plain");
      b.title = variantLabel(v);
      b.addEventListener("click", () => setVariant(typeName, v));
      row.appendChild(b);
    }
    block.appendChild(row);
  }
  return block;
}

function variantLabel(v) {
  return String(v).replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderCredits() {
  const wrap = $("creditsEl");
  wrap.innerHTML = "";
  const keys = new Set();
  for (const sel of Object.values(state.sel)) {
    const item = cat.items[sel.item];
    if (!item) continue;
    for (const k of item.cr || []) keys.add(k);
  }
  if (!keys.size) {
    wrap.appendChild(el("div", "empty", "—"));
    return;
  }
  let shown = 0;
  for (const k of keys) {
    const c = cat.credits[k];
    if (!c) continue;
    if (shown++ > 40) break;
    const d = el("div", "c");
    d.innerHTML =
      "<b>" +
      esc(c.a && c.a.length ? c.a.join(", ") : "Unknown") +
      "</b><br>" +
      (c.l || [])
        .map((l) => '<span class="lic">' + esc(l) + "</span>")
        .join("") +
      (c.n ? "<br>" + esc(c.n) : "") +
      ((c.u || []).length
        ? "<br>" + c.u.map((u) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(shortUrl(u)) + "</a>").join(" · ")
        : "");
    wrap.appendChild(d);
  }
  const note = el("div", "c");
  note.style.color = "var(--muted-2)";
  note.innerHTML =
    "LPC assets by many artists. Art hot-linked from the " +
    '<a href="https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator" target="_blank" rel="noopener">Universal LPC Spritesheet Character Generator</a>.';
  wrap.appendChild(note);
}

function shortUrl(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch (e) {
    return u;
  }
}

// ---------------------------------------------------------------------------
// Coordinating updates
// ---------------------------------------------------------------------------

function onStateChange() {
  renderEquipped();
  renderColors();
  renderCredits();
  updateItemCount();
  // Equipment changes can add/remove the animations that are available.
  if (refreshAnimOptions()) frameIdx = 0;
  // update tile selection marks
  for (const t of tiles) {
    const item = cat.items[t.tile.dataset.item];
    t.tile.classList.toggle("on", !!(item && state.sel[item.t] && state.sel[item.t].item === t.tile.dataset.item));
  }
  // re-render tiles if the allowed set changed (body type / tags)
  const allowedKey = state.bt + "|" + [...activeTags].sort().join(",");
  if (allowedKey !== lastAllowedKey) {
    lastAllowedKey = allowedKey;
    renderBrowser();
  }
  rebuildPreview();
  if (changeListeners.size) {
    const c = getCharacter();
    for (const fn of changeListeners) {
      try {
        fn(c);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

let lastAllowedKey = "";

function updateItemCount() {
  let n = 0;
  for (const it of Object.values(cat.items)) if (itemAllowed(it)) n++;
  $("itemCountEl").textContent = n + " available";
}

// ---------------------------------------------------------------------------
// Top bar actions
// ---------------------------------------------------------------------------

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomize() {
  const bt = randomPick(["male", "male", "female", "female", "teen", "muscular", "child", "pregnant"]);
  const sel = {};
  // head
  const heads = (indexes.byType.head || []).filter((id) => supportsBodyType(cat.items[id], bt));
  const humanHeads = heads.filter(
    (id) => cat.items[id].n.startsWith("Human") && !/(Elderly|Plump|Gaunt|Small)/.test(cat.items[id].n),
  );
  const head = Math.random() < 0.8 && humanHeads.length ? randomPick(humanHeads) : randomPick(heads);
  sel.head = { item: head, variant: null };
  sel.body = { item: "body", variant: null };
  const colors = { body: randomPick(optionKeys("body")) };
  // expression
  const faces = (indexes.byType.expression || []).filter((id) => supportsBodyType(cat.items[id], bt));
  if (faces.length) sel.expression = { item: randomPick(faces), variant: null };
  // skin
  const bodySlot = colorSlots(cat.items.body)[0];
  colors.body = randomPick(optionKeysFromSlot(bodySlot));

  state.bt = bt;
  state.sel = sel;
  recomputeTags();
  // clothes / accessories
  const plan = [
    ["torso", 1], ["legs", 1], ["shoes", 1], ["hair", 1],
    ["hat", 0.45], ["belt", 0.4], ["neck", 0.3], ["gloves", 0.22], ["wrists", 0.22],
    ["arms", 0.18], ["shoulders", 0.2], ["backpack", 0.14], ["cape", 0.1],
    ["weapon", 0.4], ["shield", 0.18], ["beard", 0.25], ["mustache", 0.08],
    ["ears", 0.08], ["tail", 0.06], ["wings", 0.05], ["apron", 0.1], ["vest", 0.12],
    ["jacket", 0.1], ["dress", bt === "male" ? 0.02 : 0.25], ["hat_overlay", 0.08],
  ];
  colors.hair = randomPick(optionKeysFromSlot(colorSlots(cat.items[randomPick(indexes.byType.hair || ["hair_afro"])])[0]));
  for (const [type, chance] of plan) {
    const pool = (indexes.byType[type] || []).filter((id) => itemAllowed(cat.items[id]));
    if (!pool.length || Math.random() > chance) continue;
    const id = randomPick(pool);
    const item = cat.items[id];
    sel[type] = { item: id, variant: item.v && item.v.length ? randomPick(item.v) : null };
    recomputeTags();
    for (const s of colorSlots(item)) {
      if (colors[s.group] === undefined) colors[s.group] = randomPick(optionKeysFromSlot(s));
    }
  }
  state.colors = colors;
  ensureColors();
  recomputeTags();
  sanitize();
  onStateChange();
}

function optionKeysFromSlot(slot) {
  if (!slot) return ["source"];
  const opts = colorOptions(cat, slot.entry);
  return opts.length ? opts.map((o) => o.key) : ["source"];
}

function optionKeys(type) {
  const ids = indexes.byType[type] || [];
  if (!ids.length) return ["light"];
  const slot = colorSlots(cat.items[ids[0]])[0];
  return optionKeysFromSlot(slot);
}

// --- saves -----------------------------------------------------------------

const SAVE_KEY = "lpc-creator-saves-v1";

async function kvFolder() {
  const root = window.root || {};
  if (root.kv && root.kv.lpcCharacters) return root.kv.lpcCharacters;
  return null;
}

async function loadSaves() {
  const folder = await kvFolder();
  if (folder) {
    try {
      const list = await folder.get("list");
      if (Array.isArray(list)) return list;
    } catch (e) {
      /* fall through */
    }
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return [];
}

async function writeSaves(list) {
  const folder = await kvFolder();
  if (folder) {
    try {
      await folder.set("list", list);
    } catch (e) {
      /* fall through */
    }
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(list));
  } catch (e) {
    toast("Could not save (storage blocked)");
    return false;
  }
  return true;
}

function snapshot() {
  return {
    bt: state.bt,
    sel: JSON.parse(JSON.stringify(state.sel)),
    colors: JSON.parse(JSON.stringify(state.colors)),
    anim: state.anim,
    dir: state.dir,
    zoom: state.zoom,
  };
}

function applySnapshot(s) {
  if (!s) return;
  state.bt = BODY_TYPES.some((b) => b.key === s.bt) ? s.bt : "male";
  state.sel = {};
  for (const [t, v] of Object.entries(s.sel || {})) {
    if (cat.items[v.item]) state.sel[t] = { item: v.item, variant: v.variant || null };
  }
  state.colors = Object.assign({}, s.colors || {});
  if (s.anim && animMeta(s.anim)) state.anim = s.anim;
  if (s.dir && DIR_ROWS[s.dir] !== undefined) state.dir = s.dir;
  if (s.zoom) state.zoom = Math.max(4, Math.min(14, s.zoom));
  sanitize();
  syncControls();
  onStateChange();
}

async function openLibrary() {
  const list = await loadSaves();
  const body = $("modalBody");
  body.innerHTML = "";
  if (!list.length) {
    body.appendChild(el("div", "empty", "No saved characters yet. Hit “Save” to store the current one."));
  }
  list.forEach((entry, i) => {
    const row = el("div", "save-row");
    const nm = el("div");
    nm.className = "nm";
    nm.appendChild(el("div", null, entry.name));
    nm.appendChild(el("div", "meta", new Date(entry.at).toLocaleString() + " · " + describeSnapshot(entry.state)));
    row.appendChild(nm);
    const load = el("button", "btn btn-sm", "Load");
    load.addEventListener("click", () => {
      applySnapshot(entry.state);
      closeModal();
      toast("Loaded “" + entry.name + "”");
    });
    const del = el("button", "btn btn-sm btn-ghost", "Delete");
    del.addEventListener("click", async () => {
      list.splice(i, 1);
      await writeSaves(list);
      openLibrary();
    });
    row.appendChild(load);
    row.appendChild(del);
    body.appendChild(row);
  });
  const foot = $("modalFoot");
  foot.innerHTML = "";
  const paste = el("button", "btn", "Load share code…");
  paste.addEventListener("click", () => promptCode("load"));
  foot.appendChild(paste);
  openModal("Character library");
}

function describeSnapshot(s) {
  if (!s) return "";
  const bits = [s.bt];
  for (const t of ["head", "expression", "hair", "torso", "legs", "shoes", "weapon"]) {
    const sel = s.sel && s.sel[t];
    if (sel && cat.items[sel.item]) bits.push(cat.items[sel.item].n);
  }
  return bits.join(" · ");
}

async function saveCharacter() {
  const list = await loadSaves();
  const name = await promptName("Name your character", "Adventurer " + (list.length + 1));
  if (!name) return;
  list.push({ name, at: Date.now(), state: snapshot() });
  if (await writeSaves(list)) toast("Saved “" + name + "”");
}

function promptName(title, def) {
  return new Promise((resolve) => {
    const body = $("modalBody");
    body.innerHTML = "";
    const field = el("div", "field");
    field.appendChild(el("label", null, "Name"));
    const input = document.createElement("input");
    input.type = "text";
    input.value = def || "";
    field.appendChild(input);
    body.appendChild(field);
    const foot = $("modalFoot");
    foot.innerHTML = "";
    const cancel = el("button", "btn", "Cancel");
    cancel.addEventListener("click", () => {
      closeModal();
      resolve(null);
    });
    const ok = el("button", "btn btn-primary", "Save");
    const done = () => {
      closeModal();
      resolve(input.value.trim() || def);
    };
    ok.addEventListener("click", done);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") done();
    });
    foot.appendChild(cancel);
    foot.appendChild(ok);
    openModal(title);
    setTimeout(() => input.focus(), 30);
  });
}

// --- share / code ----------------------------------------------------------

function shareUrl() {
  const name = window.generatorName || "";
  return "https://perchance.org/" + name + "#" + encodeHash(cat, state);
}

function openShare() {
  const body = $("modalBody");
  body.innerHTML = "";
  const field = el("div", "field");
  field.appendChild(el("label", null, "Share link (also restores in this generator)"));
  const input = document.createElement("input");
  input.type = "text";
  input.value = shareUrl();
  input.readOnly = true;
  field.appendChild(input);
  body.appendChild(field);
  const field2 = el("div", "field");
  field2.appendChild(el("label", null, "Character code (paste anywhere)"));
  const ta = document.createElement("input");
  ta.type = "text";
  ta.value = encodeHash(cat, state);
  ta.readOnly = true;
  field2.appendChild(ta);
  body.appendChild(field2);
  const hint = el("div", "empty");
  hint.textContent =
    "The link is compatible with the upstream Universal LPC generator's hash format, so it will open there too (upgrade-only colours use a “c=” extra parameter upstream ignores).";
  body.appendChild(hint);
  const foot = $("modalFoot");
  foot.innerHTML = "";
  const copy = el("button", "btn btn-primary", "Copy link");
  copy.addEventListener("click", async () => {
    copyText(input.value);
  });
  const copyCode = el("button", "btn", "Copy code");
  copyCode.addEventListener("click", async () => {
    copyText(encodeHash(cat, state));
  });
  const loadCode = el("button", "btn btn-ghost", "Load code…");
  loadCode.addEventListener("click", () => promptCode("load"));
  foot.appendChild(loadCode);
  foot.appendChild(copyCode);
  foot.appendChild(copy);
  openModal("Share character");
}

function copyText(text) {
  const done = () => toast("Copied to clipboard");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (e) {
    toast("Copy failed — select the text manually");
  }
  ta.remove();
}

function promptCode(mode) {
  const body = $("modalBody");
  body.innerHTML = "";
  const field = el("div", "field");
  field.appendChild(el("label", null, "Paste a character code or share link"));
  const ta = document.createElement("input");
  ta.type = "text";
  ta.placeholder = "sex=male&body=Body_Color_light&…";
  field.appendChild(ta);
  body.appendChild(field);
  const foot = $("modalFoot");
  foot.innerHTML = "";
  const cancel = el("button", "btn", "Cancel");
  cancel.addEventListener("click", closeModal);
  const ok = el("button", "btn btn-primary", "Load");
  ok.addEventListener("click", () => {
    let raw = ta.value.trim();
    const i = raw.indexOf("#");
    if (i >= 0) raw = raw.slice(i + 1);
    const s = decodeHash(cat, indexes, raw);
    if (!s || !Object.keys(s.sel).length) {
      toast("Could not read that code");
      return;
    }
    applySnapshot({
      bt: s.bt,
      sel: s.sel,
      colors: s.colors,
      anim: state.anim,
      dir: state.dir,
      zoom: state.zoom,
    });
    closeModal();
    toast("Character loaded");
  });
  foot.appendChild(cancel);
  foot.appendChild(ok);
  openModal(mode === "load" ? "Load character code" : "Share character");
}

// --- export ---------------------------------------------------------------

function openExport() {
  const body = $("modalBody");
  body.innerHTML = "";
  const p = el("div", null, "Export the current character as a PNG spritesheet.");
  body.appendChild(p);
  const prog = el("div", "prog");
  prog.innerHTML = "<i></i>";
  body.appendChild(prog);
  const status = el("div", "empty");
  status.style.paddingTop = "8px";
  body.appendChild(status);
  const foot = $("modalFoot");
  foot.innerHTML = "";
  const full = el("button", "btn btn-primary", "Full sheet + animations");
  const anim = el("button", "btn", "Current animation");
  const close = el("button", "btn btn-ghost", "Close");
  close.addEventListener("click", closeModal);
  const run = async (label, fn) => {
    full.disabled = anim.disabled = true;
    status.textContent = "Rendering " + label + "…";
    const t0 = performance.now();
    const canvas = await fn((f) => {
      prog.firstChild.style.width = Math.round(f * 100) + "%";
    });
    const ms = Math.round(performance.now() - t0);
    status.textContent = label + " ready (" + canvas.width + "×" + canvas.height + ", " + ms + "ms)";
    downloadCanvas(canvas, "lpc-" + label.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".png");
    full.disabled = anim.disabled = false;
    toast("Downloaded " + label);
  };
  full.addEventListener("click", () => run("character sheet", (onp) => renderFullSheet(cat, state, onp)));
  anim.addEventListener("click", () =>
    run(state.anim + " animation", (onp) => renderAnimSheet(cat, state, state.anim, onp)),
  );
  foot.appendChild(close);
  foot.appendChild(anim);
  foot.appendChild(full);
  openModal("Export spritesheet");
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, "image/png");
}

// --- modal / toast ---------------------------------------------------------

function openModal(title) {
  $("modalTitle").textContent = title;
  $("modalBack").hidden = false;
}
function closeModal() {
  $("modalBack").hidden = true;
}
let toastTimer = null;
function toast(msg) {
  const t = $("toastEl");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------------------------------------------------------------------------
// Controls wiring
// ---------------------------------------------------------------------------

/**
 * Rebuild the animation dropdown from what the current equipment can actually
 * render: the standard animations, plus one entry per custom animation the
 * equipped items provide - labelled with the item name, so the item <->
 * animation association is visible where the animation is chosen. Returns true
 * when the selection had to fall back (e.g. the weapon providing it was
 * removed).
 */
function refreshAnimOptions() {
  const keys = availableAnimations(cat, state);
  let changed = false;
  if (!keys.includes(state.anim)) {
    const atk = attackAnimations(cat, state);
    state.anim = keys.includes("walk") ? "walk" : atk[0] || keys[0];
    changed = true;
  }
  const select = $("animSelect");
  const sig = keys.join("|");
  if (select.dataset.sig !== sig) {
    select.innerHTML = "";
    for (const key of keys) {
      const meta = animMeta(key);
      const o = document.createElement("option");
      o.value = key;
      const source = meta.custom ? animSourceNames(key) : "";
      o.textContent = source ? meta.label + " — " + source : meta.label;
      select.appendChild(o);
    }
    select.dataset.sig = sig;
  }
  select.value = state.anim;

  const attacks = attackAnimations(cat, state);
  const attackBtn = $("attackBtn");
  if (attacks.length) {
    const meta = animMeta(attacks[0]);
    attackBtn.hidden = false;
    attackBtn.dataset.anim = attacks[0];
    attackBtn.textContent = "⚔ " + (meta ? meta.label : attacks[0]);
    attackBtn.title = "Play the attack animation your equipment provides";
  } else {
    attackBtn.hidden = true;
    attackBtn.dataset.anim = "";
  }
  return changed;
}

function syncControls() {
  $("bodyTypeSelect").value = state.bt;
  refreshAnimOptions();
  $("zoomRange").value = state.zoom;
  $("dirsToggle").checked = state.dirs4;
  $("playBtn").textContent = state.playing ? "❚❚" : "▶";
  for (const b of $("dirSeg").children) b.classList.toggle("on", b.dataset.dir === state.dir);
  $("dirSeg").style.opacity = state.dirs4 ? "0.4" : "1";
}

function wireControls() {
  const bt = $("bodyTypeSelect");
  for (const b of BODY_TYPES) {
    const o = document.createElement("option");
    o.value = b.key;
    o.textContent = b.label;
    bt.appendChild(o);
  }
  bt.addEventListener("change", () => {
    state.bt = bt.value;
    sanitize();
    onStateChange();
  });

  // The animation list is rebuilt by refreshAnimOptions() (it depends on the
  // equipment), so only the behaviour is wired here.
  const as = $("animSelect");
  as.addEventListener("change", () => {
    state.anim = as.value;
    frameIdx = 0;
    rebuildPreview();
    refreshAnimOptions();
  });

  $("attackBtn").addEventListener("click", () => {
    const key = $("attackBtn").dataset.anim;
    if (!key) return;
    state.anim = key;
    frameIdx = 0;
    syncControls();
    rebuildPreview();
  });

  const ds = $("dirSeg");
  for (const d of DIRECTIONS) {
    const b = el("button", null, d.label);
    b.type = "button";
    b.dataset.dir = d.key;
    b.addEventListener("click", () => {
      state.dir = d.key;
      state.dirs4 = false;
      syncControls();
      rebuildPreview();
    });
    ds.appendChild(b);
  }

  $("zoomRange").addEventListener("input", (e) => {
    state.zoom = Number(e.target.value);
    drawPreview();
  });

  let resizeTimer = null;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawPreview, 90);
  };
  window.addEventListener("resize", onResize);
  teardown.push(() => window.removeEventListener("resize", onResize));

  $("playBtn").addEventListener("click", () => {
    state.playing = !state.playing;
    $("playBtn").textContent = state.playing ? "❚❚" : "▶";
  });

  $("dirsToggle").addEventListener("change", (e) => {
    state.dirs4 = e.target.checked;
    syncControls();
    rebuildPreview();
  });

  let searchTimer = null;
  $("searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const v = e.target.value.trim();
    searchTimer = setTimeout(() => {
      searchQuery = v;
      renderBrowser();
    }, 160);
  });

  $("randomBtn").addEventListener("click", randomize);
  $("resetBtn").addEventListener("click", () => {
    defaultState();
    syncControls();
    onStateChange();
    toast("Reset to default");
  });
  $("saveBtn").addEventListener("click", saveCharacter);
  $("savesBtn").addEventListener("click", openLibrary);
  $("shareBtn").addEventListener("click", openShare);
  $("exportBtn").addEventListener("click", openExport);
  $("modalClose").addEventListener("click", closeModal);
  $("modalBack").addEventListener("click", (e) => {
    if (e.target === $("modalBack")) closeModal();
  });
  const onKeydown = (e) => {
    if (e.key === "Escape") closeModal();
  };
  document.addEventListener("keydown", onKeydown);
  teardown.push(() => document.removeEventListener("keydown", onKeydown));
}

// ---------------------------------------------------------------------------
// Boot + controller
// ---------------------------------------------------------------------------

function getCharacter() {
  return {
    bt: state.bt,
    sel: JSON.parse(JSON.stringify(state.sel)),
    colors: Object.assign({}, state.colors),
  };
}

function onChange(fn) {
  if (typeof fn !== "function") return () => {};
  changeListeners.add(fn);
  return () => changeListeners.delete(fn);
}

function destroy() {
  destroyed = true;
  changeListeners.clear();
  for (const off of teardown) {
    try {
      off();
    } catch (e) {
      /* ignore */
    }
  }
  teardown.length = 0;
}

async function boot() {
  cat = await ensureCatalog();
  indexes = buildIndexes(cat);
  indexesCache = indexes;
  for (const [id, item] of Object.entries(cat.items)) idOfItem.set(item, id);

  wireControls();
  defaultState();

  if (options.character) {
    const c =
      typeof options.character === "string"
        ? decodeHash(cat, indexes, options.character)
        : options.character;
    if (c) applySnapshot(c);
  } else {
    const hash = String(options.hash || "").replace(/^#/, "");
    if (hash) {
      const s = decodeHash(cat, indexes, hash);
      if (s && Object.keys(s.sel).length) {
        state.bt = s.bt;
        state.sel = s.sel;
        state.colors = Object.assign({}, state.colors, s.colors);
        sanitize();
      }
    }
  }

  renderTree();
  renderBrowser();
  lastAllowedKey = state.bt + "|" + [...activeTags].sort().join(",");
  syncControls();
  onStateChange();
  frameIdx = 0;
  requestAnimationFrame(tick);
}

const controller = {
  version: PLUGIN_VERSION,
  el: host,
  root,
  get state() {
    return state;
  },
  getCharacter,
  setCharacter(c) {
    if (cat && c) applySnapshot(c);
  },
  getCode() {
    return cat ? encodeHash(cat, state) : "";
  },
  setCode(code) {
    if (!cat) return;
    const s = decodeHash(cat, indexes, code);
    if (s && Object.keys(s.sel).length) {
      state.bt = s.bt;
      state.sel = s.sel;
      state.colors = Object.assign({}, state.colors, s.colors);
      sanitize();
      syncControls();
      onStateChange();
    }
  },
  catalog() {
    return cat;
  },
  /** Everything this character can currently play, plus the attack list. */
  animationsFor() {
    return cat
      ? {
          available: availableAnimations(cat, state),
          standard: ANIMS.map((a) => a.key),
          custom: customAnimsFor(cat, state),
          attacks: attackAnimations(cat, state),
        }
      : { available: [], standard: [], custom: [], attacks: [] };
  },
  /** Which equipped item provides which animations (item <-> animation map). */
  equipmentAnimations() {
    return cat ? equipmentAnimationsEngine(cat, state) : [];
  },
  attackAnimations() {
    return cat ? attackAnimations(cat, state) : [];
  },
  attackAnimation() {
    return cat ? attackAnimations(cat, state)[0] || null : null;
  },
  /** Logical animation -> the animation the equipment supersedes it with. */
  animationMap() {
    return cat ? animationMapEngine(cat, state) : {};
  },
  resolveAnimation(anim) {
    return cat ? resolveAnimation(cat, state, anim) : anim;
  },
  randomize,
  onChange,
  renderFrame(o = {}) {
    return drawFrameCanvas(cat, state, o.anim || state.anim, o.dir || state.dir, o.frame || 0, o.scale || 1);
  },
  renderAnimSheet(animKey, o = {}) {
    return renderAnimSheetEngine(cat, state, animKey || state.anim, o.onProgress);
  },
  renderFullSheet(o = {}) {
    const onProgress = typeof o === "function" ? o : o.onProgress;
    return renderFullSheetEngine(cat, state, onProgress);
  },
  destroy,
};

try {
  await boot();
} catch (e) {
  console.error(e);
  const browserEl = $("browserEl");
  if (browserEl) browserEl.innerHTML = '<div class="empty">Failed to start: ' + esc(e.message) + "</div>";
}

// Debug hook: the most recently mounted instance (handy from the browser console).
window.__lpc = controller;

return controller;
}

// ---------------------------------------------------------------------------
// Mounting API
// ---------------------------------------------------------------------------

const DEFAULT_HEIGHT = "min(760px, 85vh)";

function prepareHost(host) {
  let shadow = host.shadowRoot;
  if (!shadow) shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = '<style>' + LPC_CSS + '</style><div class="lpc-app">' + LPC_HTML + "</div>";
  return shadow;
}

/**
 * Mount the creator UI inside `container` and return a controller.
 * options: { height, character, hash, catalogUrl }
 *   height    - CSS height for the container (default "min(760px, 85vh)"; pass false to keep your own).
 *   character - initial character object or share code.
 */
export async function mountLpcCreator(container, options = {}) {
  if (!container || typeof container.appendChild !== "function") {
    throw new Error("mountLpcCreator(container): a DOM element is required");
  }
  if (options.height) container.style.height = options.height;
  else if (options.height !== false && !container.style.height) container.style.height = DEFAULT_HEIGHT;
  const shadow = prepareHost(container);
  return createApp(shadow, container, options);
}

/**
 * Open the creator as a full-screen overlay and resolve with the chosen
 * character, or null if the player cancels.
 */
export async function openCreator(options = {}) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:#0b0e13;overflow:auto;";
  document.body.appendChild(host);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const controller = await mountLpcCreator(host, Object.assign({}, options, { height: false }));

  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      controller.destroy();
      host.remove();
      resolve(value);
    };
    const onKey = (e) => {
      if (e.key === "Escape") finish(null);
    };
    document.addEventListener("keydown", onKey, true);

    const actions = controller.root.querySelector(".top-actions");
    if (actions) {
      const cancel = document.createElement("button");
      cancel.className = "btn btn-ghost";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => finish(null));
      const use = document.createElement("button");
      use.className = "btn btn-primary";
      use.textContent = "Use this character";
      use.addEventListener("click", () => finish(controller.getCharacter()));
      actions.appendChild(cancel);
      actions.appendChild(use);
    }
  });
}

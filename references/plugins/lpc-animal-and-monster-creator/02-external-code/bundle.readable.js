/* LPC Animal & Monster Creator v1.0.0 — bundle of src/plugin.js (see src/BUILD.md).
   Catalog: https://user.uploads.dev/file/27e36c970aba9ca460ae230c015c201e.json
   Art: LPC community packs — see catalog.packs for the per-pack attribution. */

// workspace:src/lpc-creatures/core.js
var PLUGIN_VERSION = "1.0.0";
var DEFAULT_CATALOG_URL = true ? "https://user.uploads.dev/file/27e36c970aba9ca460ae230c015c201e.json" : new URL("./catalog.json", import.meta.url).href;
var DIRECTIONS = ["up", "left", "down", "right"];
var DIR_LABEL = { up: "Up", left: "Left", down: "Down", right: "Right" };
var DIR_ICON = { up: "\u25B2", left: "\u25C0", down: "\u25BC", right: "\u25B6" };
var MAX_FRAME_CACHE = 900;
var bitmapCache = /* @__PURE__ */ new Map();
var frameCache = /* @__PURE__ */ new Map();
function putFrame(key, canvas) {
  if (frameCache.size >= MAX_FRAME_CACHE) {
    let n = Math.floor(MAX_FRAME_CACHE * 0.15);
    for (const k of frameCache.keys()) {
      frameCache.delete(k);
      if (--n <= 0) break;
    }
  }
  frameCache.set(key, canvas);
}
function clearCaches() {
  bitmapCache.clear();
  frameCache.clear();
}
async function loadBitmap(url) {
  const hit = bitmapCache.get(url);
  if (hit) return hit;
  const p = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " fetching " + url);
    const blob = await res.blob();
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(blob);
      } catch {
      }
    }
    return await new Promise((resolve, reject) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(blob);
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not decode " + url));
      img.src = objUrl;
    });
  })();
  p.catch(() => bitmapCache.delete(url));
  bitmapCache.set(url, p);
  return p;
}
function newCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return c;
}
function scaleCanvas(canvas, scale) {
  if (!canvas) return null;
  if (!scale || scale === 1) return canvas;
  const c = newCanvas(canvas.width * scale, canvas.height * scale);
  c.getContext("2d").drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}
async function loadBitmapRetry(url) {
  try {
    return await loadBitmap(url);
  } catch {
  }
  bitmapCache.delete(url);
  await new Promise((r) => setTimeout(r, 350));
  return loadBitmap(url);
}
async function loadCatalog(opts = {}) {
  const url = opts.catalogUrl || DEFAULT_CATALOG_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status + " fetching catalog " + url);
  const catalog = await res.json();
  catalog.creatures = catalog.creatures || [];
  const byId = /* @__PURE__ */ new Map();
  for (const c of catalog.creatures) byId.set(c.id, c);
  catalog.byId = byId;
  const byCategory = {};
  for (const c of catalog.creatures) (byCategory[c.category] = byCategory[c.category] || []).push(c);
  catalog.byCategory = byCategory;
  catalog.categoryOf = (key) => (catalog.categories || []).find((c) => c.key === key);
  catalog.allTags = [...new Set(catalog.creatures.flatMap((c) => c.tags || []))].sort();
  return catalog;
}
function sheetUrl(catalog, rel, opts = {}) {
  if (opts.sheetBase) return opts.sheetBase.replace(/\/?$/, "/") + rel;
  return catalog.sheets && catalog.sheets[rel] || rel;
}
function variantOf(creature, key) {
  if (!creature) return null;
  const variants = creature.variants || [];
  if (!key) return variants[0] || null;
  return variants.find((v) => v.key === key) || variants[0] || null;
}
function findCreature(catalog, ref) {
  if (!ref) return { creature: null, variantKey: null };
  if (typeof ref === "string") {
    const [id, variant] = ref.split(/[~:]/);
    const c = catalog.byId ? catalog.byId.get(id) : null;
    return { creature: c || null, variantKey: variant || null };
  }
  if (ref.id && catalog.byId) {
    return { creature: catalog.byId.get(ref.id) || null, variantKey: ref.variant || null };
  }
  return { creature: ref, variantKey: ref.variant || null };
}
function isDirectional(creature) {
  return Object.values(creature.anims || {}).some((a) => a.dirs);
}
function animationsFor(creature) {
  return Object.keys(creature.anims || {});
}
function animInfo(creature, animKey) {
  const a = (creature.anims || {})[animKey];
  if (!a) return null;
  const fw = a.fw || creature.fw;
  const fh = a.fh || creature.fh;
  return { key: animKey, def: a, fw, fh, fps: a.fps || 8, loop: a.loop !== false, dirless: !!a.frames };
}
function frameCount(creature, animKey, dir = "down") {
  const info = animInfo(creature, animKey);
  if (!info) return 0;
  if (info.dirless) return info.def.frames.length;
  const d = info.def.dirs || {};
  const entry = d[dir] || d.down || d[Object.keys(d)[0]];
  return entry ? entry.cols.length : 0;
}
function animSheetRel(creature, animKey, variant) {
  const info = animInfo(creature, animKey);
  if (!info) return variant.sheet;
  if (info.def.sheetKey && variant.sheets && variant.sheets[info.def.sheetKey]) {
    return variant.sheets[info.def.sheetKey];
  }
  return info.def.sheet || variant.sheet;
}
function animFrameGrid(creature, animKey, dir, index) {
  const info = animInfo(creature, animKey);
  if (!info) return null;
  if (info.dirless) {
    const n2 = info.def.frames.length;
    const [row, col] = info.def.frames[(index % n2 + n2) % n2];
    return { row, col, count: n2, index: (index % n2 + n2) % n2 };
  }
  const d = info.def.dirs || {};
  const entry = d[dir] || d.down || d[Object.keys(d)[0]];
  if (!entry) return null;
  const n = entry.cols.length;
  const i = (index % n + n) % n;
  return { row: entry.row, col: entry.cols[i], count: n, index: i };
}
async function frameCanvas(catalog, creature, animKey, variantKey, dir, index, opts = {}) {
  const variant = variantOf(creature, variantKey);
  const info = animInfo(creature, animKey);
  if (!info || !variant) return null;
  const pos = animFrameGrid(creature, animKey, dir, index);
  if (!pos) return null;
  const rel = animSheetRel(creature, animKey, variant);
  const url = sheetUrl(catalog, rel, opts);
  const key = [url, pos.row, pos.col, info.fw, info.fh].join("|");
  const hit = frameCache.get(key);
  if (hit) return hit;
  let bmp;
  try {
    bmp = await loadBitmapRetry(url);
  } catch {
    return null;
  }
  const cols = Math.max(1, Math.round(bmp.width / info.fw));
  const rows = Math.max(1, Math.round(bmp.height / info.fh));
  if (pos.col >= cols || pos.row >= rows) {
    return null;
  }
  const canvas = newCanvas(info.fw, info.fh);
  canvas.getContext("2d").drawImage(
    bmp,
    pos.col * info.fw,
    pos.row * info.fh,
    info.fw,
    info.fh,
    0,
    0,
    info.fw,
    info.fh
  );
  putFrame(key, canvas);
  return canvas;
}
async function shadowFrameCanvas(catalog, creature, variantKey, dir, index, opts = {}) {
  if (!creature.shadow) return null;
  const variant = variantOf(creature, variantKey);
  const rel = variant && variant.shadow;
  if (!rel) return null;
  const entry = creature.shadow.dirs[dir] || creature.shadow.dirs.down;
  if (!entry) return null;
  const n = entry.cols.length;
  const col = entry.cols[(index % n + n) % n];
  const url = sheetUrl(catalog, rel, opts);
  const key = [url, entry.row, col, creature.shadow.fw, creature.shadow.fh].join("|");
  const hit = frameCache.get(key);
  if (hit) return hit;
  let bmp;
  try {
    bmp = await loadBitmapRetry(url);
  } catch {
    return null;
  }
  const canvas = newCanvas(creature.shadow.fw, creature.shadow.fh);
  canvas.getContext("2d").drawImage(
    bmp,
    col * creature.shadow.fw,
    entry.row * creature.shadow.fh,
    creature.shadow.fw,
    creature.shadow.fh,
    0,
    0,
    creature.shadow.fw,
    creature.shadow.fh
  );
  putFrame(key, canvas);
  return canvas;
}
function shadowCount(creature, dir) {
  if (!creature.shadow) return 0;
  const entry = creature.shadow.dirs[dir] || creature.shadow.dirs.down;
  return entry ? entry.cols.length : 0;
}
async function renderFrame(catalog, creatureRef, opts = {}) {
  const { creature, variantKey } = findCreature(catalog, creatureRef);
  if (!creature) throw new Error("Unknown creature: " + creatureRef);
  const anim = opts.anim || (creature.anims.idle ? "idle" : animationsFor(creature)[0]);
  const dir = opts.dir || "down";
  const canvas = await frameCanvas(catalog, creature, anim, variantKey, dir, opts.frame || 0, opts);
  if (!canvas) throw new Error("No frame for " + creature.id + "/" + anim);
  return scaleCanvas(canvas, opts.scale || 1);
}
async function renderAnimSheet(catalog, creatureRef, animKey, opts = {}) {
  const { creature, variantKey } = findCreature(catalog, creatureRef);
  const info = animInfo(creature, animKey);
  if (!info) throw new Error("Unknown animation: " + animKey);
  const dirs = opts.dirs || DIRECTIONS;
  const scale = opts.scale || 1;
  let cols = 0;
  for (const d of dirs) cols = Math.max(cols, frameCount(creature, animKey, d));
  cols = Math.max(1, cols);
  const canvas = newCanvas(cols * info.fw * scale, dirs.length * info.fh * scale);
  const ctx = canvas.getContext("2d");
  for (let r = 0; r < dirs.length; r++) {
    for (let i = 0; i < cols; i++) {
      const frame = await frameCanvas(catalog, creature, animKey, variantKey, dirs[r], i, opts);
      if (!frame) continue;
      ctx.drawImage(frame, i * info.fw * scale, r * info.fh * scale, info.fw * scale, info.fh * scale);
    }
  }
  return canvas;
}
async function renderSheet(catalog, creatureRef, opts = {}) {
  const { creature, variantKey } = findCreature(catalog, creatureRef);
  if (!creature) throw new Error("Unknown creature: " + creatureRef);
  const variant = variantOf(creature, variantKey);
  const anims = (opts.anims || animationsFor(creature)).filter((k) => creature.anims[k]);
  const scale = opts.scale || 1;
  const shadow = opts.shadow !== false && !!creature.shadow && !!variant.shadow;
  let cellW = creature.fw;
  let cellH = creature.fh;
  for (const k of anims) {
    const info = animInfo(creature, k);
    cellW = Math.max(cellW, info.fw);
    cellH = Math.max(cellH, info.fh);
  }
  let cols = 0;
  for (const k of anims) for (const d of DIRECTIONS) cols = Math.max(cols, frameCount(creature, k, d));
  cols = Math.max(1, cols);
  let rows = anims.length * DIRECTIONS.length;
  if (shadow) rows += DIRECTIONS.length;
  const canvas = newCanvas(cols * cellW * scale, rows * cellH * scale);
  const ctx = canvas.getContext("2d");
  const place = (frame, colIdx, rowIdx) => {
    if (!frame) return;
    const dx = (cellW - frame.width) / 2;
    const dy = (cellH - frame.height) / 2;
    ctx.drawImage(frame, (colIdx * cellW + dx) * scale, (rowIdx * cellH + dy) * scale, frame.width * scale, frame.height * scale);
  };
  const blocks = {};
  anims.forEach((k, blockIdx) => {
    const info = animInfo(creature, k);
    const counts = {};
    DIRECTIONS.forEach((d, di) => {
      counts[d] = frameCount(creature, k, d);
    });
    blocks[k] = {
      row: blockIdx * DIRECTIONS.length,
      frames: counts,
      fps: info.fps,
      loop: info.loop
    };
  });
  for (let bi = 0; bi < anims.length; bi++) {
    const k = anims[bi];
    for (let di = 0; di < DIRECTIONS.length; di++) {
      const count = frameCount(creature, k, DIRECTIONS[di]);
      for (let i = 0; i < count; i++) {
        place(await frameCanvas(catalog, creature, k, variantKey, DIRECTIONS[di], i, opts), i, bi * 4 + di);
      }
    }
  }
  if (shadow) {
    const base = anims.length * 4;
    for (let di = 0; di < DIRECTIONS.length; di++) {
      const n = shadowCount(creature, DIRECTIONS[di]);
      for (let i = 0; i < n; i++) {
        place(await shadowFrameCanvas(catalog, creature, variantKey, DIRECTIONS[di], i, opts), i, base + di);
      }
    }
  }
  return { canvas, blocks, cols, rows, cellW, cellH, anims, shadow: !!shadow };
}
function sheetManifest(catalog, creatureRef, opts = {}, sheetInfo = {}) {
  const { creature, variantKey } = findCreature(catalog, creatureRef);
  if (!creature) throw new Error("Unknown creature: " + creatureRef);
  const variant = variantOf(creature, variantKey);
  const scale = opts.scale || 1;
  const ground = creature.ground || { x: Math.round(creature.fw / 2), y: creature.fh };
  const cellW = sheetInfo.cellW || creature.fw;
  const cellH = sheetInfo.cellH || creature.fh;
  const packs = (creature.packs || []).map((p) => catalog.packs[p]).filter(Boolean);
  return {
    generator: "lpc-animal-and-monster-creator",
    version: PLUGIN_VERSION,
    creature: creature.id,
    name: creature.name,
    variant: variant.key,
    variantName: variant.name,
    image: sheetInfo.image || `${creature.id}-${variant.key}.png`,
    sheet: variant.sheet,
    scale,
    cellW,
    cellH,
    cols: sheetInfo.cols || 0,
    rows: sheetInfo.rows || 0,
    dirOrder: DIRECTIONS.slice(),
    blocks: sheetInfo.blocks || {},
    shadowRows: sheetInfo.shadow ? DIRECTIONS.length : 0,
    pivot: {
      x: Math.round(cellW / 2),
      y: Math.round((cellH - creature.fh) / 2 + ground.y)
    },
    tags: creature.tags || [],
    category: creature.category,
    credits: packs.map((p) => ({ name: p.name, authors: p.authors, license: p.license, url: p.url, extraUrls: p.extraUrls }))
  };
}
async function createSprite(catalog, creatureRef, opts = {}) {
  const { creature, variantKey } = findCreature(catalog, creatureRef);
  if (!creature) throw new Error("Unknown creature: " + creatureRef);
  const variant = variantOf(creature, variantKey);
  const scale = opts.scale || 1;
  const animKeys = (opts.anims || animationsFor(creature)).filter((k) => creature.anims[k]);
  const dirs = opts.directions || DIRECTIONS;
  const withShadow = opts.shadow !== false && !!creature.shadow && !!variant.shadow;
  const baseScale = scale;
  const ground = creature.ground || { x: Math.round(creature.fw / 2), y: creature.fh };
  const baseW = creature.fw * baseScale;
  const baseH = creature.fh * baseScale;
  const frames = {};
  for (const k of animKeys) {
    const info = animInfo(creature, k);
    frames[k] = { fw: info.fw, fh: info.fh, fps: info.fps, loop: info.loop, dirs: {} };
    for (const d of dirs) {
      const list = [];
      const n = frameCount(creature, k, d);
      for (let i = 0; i < n; i++) {
        const frame = await frameCanvas(catalog, creature, k, variantKey, d, i, opts);
        if (frame) list.push(scaleCanvas(frame, scale));
      }
      frames[k].dirs[d] = list;
    }
  }
  const shadows = {};
  if (withShadow) {
    for (const d of dirs) {
      const list = [];
      const n = shadowCount(creature, d);
      for (let i = 0; i < n; i++) {
        const frame = await shadowFrameCanvas(catalog, creature, variantKey, d, i, opts);
        if (frame) list.push(scaleCanvas(frame, scale));
      }
      shadows[d] = list;
    }
  }
  const total = Object.values(frames).reduce((a, f) => a + Object.values(f.dirs).reduce((b, l) => b + l.length, 0), 0);
  const sprite = {
    creature: { id: creature.id, variant: variant.key, name: creature.name },
    scale,
    animations: animKeys.slice(),
    directions: dirs.slice(),
    frameCount(anim, dir = "down") {
      const f = frames[anim];
      return f && f.dirs[dir] ? f.dirs[dir].length : 0;
    },
    frameSizeFor(anim) {
      const f = frames[anim];
      return f ? { w: f.fw * scale, h: f.fh * scale } : { w: creature.fw * scale, h: creature.fh * scale };
    },
    fps(anim) {
      const f = frames[anim];
      return f ? f.fps : 8;
    },
    loop(anim) {
      const f = frames[anim];
      return f ? f.loop : true;
    },
    duration(anim, dir = "down") {
      const n = this.frameCount(anim, dir);
      return n ? n / (this.fps(anim) || 1) : 0;
    },
    getFrame(anim, dir = "down", index = 0) {
      const f = frames[anim];
      const list = f && f.dirs[dir] ? f.dirs[dir] : null;
      if (!list || !list.length) return null;
      return list[(index % list.length + list.length) % list.length];
    },
    getShadow(dir = "down", index = 0) {
      const list = shadows[dir];
      if (!list || !list.length) return null;
      return list[(index % list.length + list.length) % list.length];
    },
    hasShadow: withShadow,
    // frame totals across every animation/direction (handy for asset budgets)
    frameTotal: total,
    // The creature's feet/centre point inside a drawn frame at this sprite's
    // baked-in scale (i.e. `pivot` is where (x, y) lands in the image).
    pivot: { x: Math.round(ground.x * baseScale), y: Math.round(ground.y * baseScale) },
    // Where a frame lands when the creature is drawn with its feet on (x, y).
    // Everything is in output pixels; padding of larger animation canvases is
    // divided by two, which is exactly how the sheets are authored.
    place(x, y, o = {}) {
      const c = this.getFrame(o.anim || (frames.idle ? "idle" : animKeys[0]), o.dir || "down", o.frame || 0);
      if (!c) return null;
      const s = o.scale || 1;
      const w = c.width * s;
      const h = c.height * s;
      if (o.anchor === "center") return { c, w, h, left: x - w / 2, top: y - h / 2 };
      const offX = ground.x * baseScale + (c.width - baseW) / 2;
      const offY = ground.y * baseScale + (c.height - baseH) / 2;
      return { c, w, h, left: x - offX * s, top: y - offY * s };
    },
    /**
     * Draw the creature's feet at (x, y) — the point you move around a map.
     * o: { anim, dir, frame, scale, anchor: "feet" | "center" }
     */
    draw(ctx, x, y, o = {}) {
      const p = this.place(x, y, o);
      if (!p) return false;
      ctx.drawImage(p.c, p.left, p.top, p.w, p.h);
      return true;
    },
    /**
     * Draw the drop shadow. Call it with the same (x, y) you pass to draw(),
     * before drawing the creature, so the shadow is anchored to the same
     * ground line.
     */
    drawShadow(ctx, x, y, o = {}) {
      const c = this.getShadow(o.dir || "down", o.frame || 0);
      if (!c) return false;
      const s = o.scale || 1;
      if (o.anchor === "center") {
        const w = c.width * s;
        const h = c.height * s;
        ctx.drawImage(c, x - w / 2, y - h / 2, w, h);
        return true;
      }
      ctx.drawImage(c, x - ground.x * baseScale * s, y - ground.y * baseScale * s, c.width * s, c.height * s);
      return true;
    },
    // Convenience: shadow first, then the body (the order you want on screen).
    drawWithShadow(ctx, x, y, o = {}) {
      this.drawShadow(ctx, x, y, o);
      return this.draw(ctx, x, y, o);
    }
  };
  return sprite;
}
function creatureToCode(creatureRef) {
  if (typeof creatureRef === "string") return creatureRef;
  if (!creatureRef || !creatureRef.id) return "";
  return creatureRef.variant ? creatureRef.id + "~" + creatureRef.variant : creatureRef.id;
}
function creatureFromCode(code) {
  if (!code) return null;
  const [id, variant] = String(code).split(/[~:]/);
  if (!id) return null;
  return { id, variant: variant || null };
}
function catalogStats(catalog) {
  return {
    creatures: catalog.creatures.length,
    variants: catalog.creatures.reduce((a, c) => a + c.variants.length, 0),
    animations: catalog.creatures.reduce((a, c) => a + Object.keys(c.anims).length, 0),
    frames: catalog.creatures.reduce(
      (a, c) => a + Object.entries(c.anims).reduce((b, [, anim]) => {
        if (anim.frames) return b + anim.frames.length;
        return b + Object.values(anim.dirs || {}).reduce((n, d) => n + d.cols.length, 0);
      }, 0),
      0
    ),
    sheets: Object.keys(catalog.sheets || {}).length
  };
}

// workspace:src/lpc-creatures/styles.js
var CSS = `
:host { display: block; height: 100%; }

:host {
  --bg: #0b0e13;
  --bg-2: #10151d;
  --panel: #151b24;
  --panel-2: #1b2330;
  --panel-3: #222c3b;
  --text: #e8ecf3;
  --muted: #93a0b4;
  --muted-2: #6b7789;
  --accent: #f0b429;
  --accent-2: #ffd05c;
  --accent-ink: #2a1e05;
  --blue: #5aa9ff;
  --green: #6ddc8b;
  --red: #ff7a7a;
  --border: #26303d;
  --border-2: #33404f;
  --radius: 12px;
  --shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.lpc-app, .lpc-app * { box-sizing: border-box; }
/* the hidden attribute must always win, even over the display rules below */
.lpc-app [hidden] { display: none !important; }

.lpc-app {
  margin: 0;
  background:
    radial-gradient(1100px 600px at 70% -10%, #1b2534 0%, transparent 60%),
    radial-gradient(800px 500px at 0% 100%, #1a1f2b 0%, transparent 55%),
    var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  text-align: left;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

button, input, select { font: inherit; color: inherit; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2c3644; border-radius: 6px; border: 2px solid transparent; background-clip: content-box; }
::-webkit-scrollbar-thumb:hover { background: #3b4859; background-clip: content-box; }

/* ---------- top bar ---------- */
.topbar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px max(14px, calc((100% - 1720px) / 2 + 14px));
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(27, 35, 48, 0.9), rgba(16, 21, 29, 0.85));
  backdrop-filter: blur(6px);
  position: sticky; top: 0; z-index: 40;
  flex-wrap: wrap;
  flex: none;
}
.brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.brand > div { min-width: 0; }
.brand-mark {
  width: 38px; height: 38px; border-radius: 10px; flex: none;
  display: grid; place-items: center; font-weight: 800; font-size: 13px; letter-spacing: 0.5px;
  color: var(--accent-ink);
  background: linear-gradient(150deg, var(--accent-2), var(--accent) 60%, #c98a10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 3px 10px rgba(240,180,41,0.25);
}
.brand h1 { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.brand p { margin: 2px 0 0; font-size: 11.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.btn {
  appearance: none; cursor: pointer;
  border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
  padding: 8px 13px; border-radius: 9px; font-size: 13px; font-weight: 500;
  transition: background .12s ease, border-color .12s ease, transform .05s ease;
  display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
}
.btn:hover { background: var(--panel-3); border-color: #43526a; }
.btn:active { transform: translateY(1px); }
.btn[disabled] { opacity: .5; pointer-events: none; }
.btn-primary {
  background: linear-gradient(180deg, var(--accent-2), var(--accent));
  border-color: #b9840d; color: var(--accent-ink); font-weight: 700;
}
.btn-primary:hover { background: linear-gradient(180deg, #ffe08a, var(--accent-2)); border-color: var(--accent); }
.btn-ghost { background: transparent; }
.btn-sm { padding: 5px 9px; font-size: 12px; border-radius: 8px; }
.btn-icon { padding: 6px 9px; }
.btn.on { border-color: var(--accent); color: var(--accent-2); background: rgba(240,180,41,.12); }

/* ---------- layout ---------- */
.layout {
  display: grid;
  grid-template-columns: 344px minmax(320px, 1fr) 322px;
  gap: 14px; padding: 14px; align-items: stretch;
  max-width: 1720px; margin: 0 auto 0;
  flex: 1 1 auto; min-height: 0; width: 100%;
}
@media (max-width: 1240px) {
  .lpc-app { height: auto; }
  .layout { grid-template-columns: 330px minmax(0, 1fr); flex: none; }
  .col-detail { grid-column: 1 / -1; }
  .col-browser .panel-body { max-height: min(560px, 62vh); overflow: auto; }
  .col-detail .panel-body { overflow: visible; }
  .stage { flex: none; min-height: 420px; }
}
@media (max-width: 900px) {
  .layout { grid-template-columns: minmax(0, 1fr); padding: 10px; gap: 10px; }
  .col-detail { grid-column: auto; }
  .col-browser .panel-body { max-height: none; overflow: visible; }
  .stage { flex: none; min-height: 340px; }
  .topbar { padding: 10px 12px; }
}
@media (max-width: 620px) {
  .topbar { gap: 10px; }
  .brand p { display: none; }
  .top-actions { width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .top-actions .btn { justify-content: center; padding: 8px 6px; }
}

.panel {
  background: linear-gradient(180deg, var(--panel), var(--bg-2));
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow); display: flex; flex-direction: column; min-width: 0; min-height: 0;
}
.panel-head {
  padding: 11px 13px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 9px; flex-wrap: wrap; flex: none;
  background: linear-gradient(180deg, rgba(34,44,59,0.55), rgba(21,27,36,0.2));
}
.panel-head h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.9px; color: var(--muted); font-weight: 700; }
.panel-body { padding: 12px; }
.col-browser .panel-body, .col-detail .panel-body { overflow: auto; position: relative; flex: 1 1 auto; min-height: 0; }
@media (max-width: 900px) {
  .col-browser .panel-body, .col-detail .panel-body { overflow: visible; max-height: none; }
}
.spacer { flex: 1 1 auto; }

/* ---------- stage ---------- */
.col-stage { overflow: hidden; }
.stage-tabs { display: flex; gap: 4px; margin-left: auto; }
.stage-tabs button {
  appearance: none; border: 1px solid transparent; background: transparent; color: var(--muted);
  padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
}
.stage-tabs button:hover { color: var(--text); background: var(--panel-2); }
.stage-tabs button.on { background: var(--panel-3); border-color: var(--border-2); color: var(--accent-2); }

.stage-wrap { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
.stage {
  position: relative; display: grid; place-items: center;
  padding: 18px; min-height: 260px; flex: 1 1 auto; min-width: 0;
  overflow: auto;
}
.stage-bg-checker {
  background:
    linear-gradient(45deg, #0d1117 25%, transparent 25%, transparent 75%, #0d1117 75%),
    linear-gradient(45deg, #0d1117 25%, #111823 25%, #111823 75%, #0d1117 75%);
  background-size: 22px 22px; background-position: 0 0, 11px 11px;
}
.stage-bg-dark { background: #0a0d12; }
.stage-bg-grass {
  background:
    radial-gradient(120% 90% at 50% 0%, #4f8b3f 0%, #3a6d30 45%, #2a5225 100%);
}
.stage-bg-light { background: #dfe5ee; }
#previewCanvas { image-rendering: pixelated; max-width: 100%; height: auto; filter: drop-shadow(0 12px 18px rgba(0,0,0,0.55)); }
#sheetCanvas, #playgroundCanvas { image-rendering: pixelated; max-width: 100%; }
#sheetCanvas { filter: drop-shadow(0 10px 16px rgba(0,0,0,0.5)); }
.playground-ctn { position: absolute; inset: 0; }
#playgroundCanvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.stage-badge {
  position: absolute; left: 12px; top: 12px; font-size: 11px; color: var(--muted); white-space: nowrap;
  background: rgba(11,14,19,0.72); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px;
  z-index: 2;
}
.stage-hint {
  font-size: 11.5px; color: var(--muted); padding: 9px 12px; border-top: 1px solid var(--border);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap; flex: none;
}
.stage-controls { padding: 12px; border-top: 1px solid var(--border); display: grid; gap: 10px; flex: none; }
.ctrl-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ctrl-row .label { font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); font-weight: 700; }
.ctrl-row .grow { flex: 1 1 90px; min-width: 80px; }

select, input[type="text"], input[type="search"], input[type="number"] {
  background: var(--panel-2); border: 1px solid var(--border-2); color: var(--text);
  border-radius: 9px; padding: 7px 10px; outline: none; width: 100%;
}
select:focus, input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(240,180,41,0.14); }
input[type="range"] { width: 118px; accent-color: var(--accent); }
input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; }
label.chk { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; color: var(--muted); }
label.chk:hover { color: var(--text); }

.seg { display: inline-flex; background: var(--panel-2); border: 1px solid var(--border-2); border-radius: 9px; overflow: hidden; }
.seg button {
  appearance: none; border: 0; background: transparent; color: var(--muted);
  padding: 6px 10px; cursor: pointer; font-size: 12px; font-weight: 600;
}
.seg button + button { border-left: 1px solid var(--border); }
.seg button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); }

/* D-pad for direction */
.dpad { display: grid; grid-template-columns: repeat(3, 30px); grid-template-rows: repeat(3, 26px); gap: 3px; }
.dpad button {
  appearance: none; border: 1px solid var(--border-2); background: var(--panel-2); color: var(--muted);
  border-radius: 7px; cursor: pointer; font-size: 12px; padding: 0; line-height: 1;
}
.dpad button:hover { color: var(--text); background: var(--panel-3); }
.dpad button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); border-color: #b9840d; }
.dpad .up { grid-area: 1 / 2; }
.dpad .left { grid-area: 2 / 1; }
.dpad .down { grid-area: 3 / 2; }
.dpad .right { grid-area: 2 / 3; }
.dpad .mid {
  grid-area: 2 / 2; display: grid; place-items: center; font-size: 9px; color: var(--muted-2);
  border: 1px dashed var(--border); border-radius: 7px;
}

/* ---------- browser ---------- */
.cat-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 9px; }
.chip {
  border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
  padding: 4px 9px; border-radius: 999px; font-size: 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
}
.chip:hover { border-color: var(--accent); color: var(--accent-2); }
.chip.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); border-color: #b9840d; font-weight: 700; }
.chip .n { font-size: 10px; opacity: .75; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 7px; }
.tile {
  position: relative; border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
  background: #0e1319; cursor: pointer; padding: 0; aspect-ratio: 1 / 1;
  transition: border-color .12s ease, transform .06s ease;
}
.tile:hover { border-color: var(--border-2); transform: translateY(-1px); }
.tile.on { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(240,180,41,.25) inset; }
.tile canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
.tile .cap {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 3px 4px 4px;
  font-size: 9.5px; line-height: 1.15; text-align: center; color: #dbe2ec;
  background: linear-gradient(180deg, transparent, rgba(6,9,13,.88) 55%);
  text-shadow: 0 1px 2px #000; pointer-events: none;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.tile .fav {
  position: absolute; top: 3px; right: 3px; width: 19px; height: 19px; border-radius: 6px;
  border: 1px solid var(--border-2); background: rgba(11,14,19,.75); color: var(--muted-2);
  font-size: 11px; line-height: 1; padding: 0; cursor: pointer; display: grid; place-items: center;
}
.tile .fav:hover { color: var(--accent-2); border-color: var(--accent); }
.tile .fav.on { color: var(--accent-ink); background: var(--accent); border-color: #b9840d; }
.tile .badge {
  position: absolute; top: 4px; left: 4px; font-size: 8.5px; padding: 1px 5px; border-radius: 999px;
  background: rgba(11,14,19,.72); border: 1px solid var(--border-2); color: var(--muted); font-weight: 700;
  text-transform: uppercase; letter-spacing: .4px;
}
.shimmer { position: absolute; inset: 0; background: linear-gradient(100deg, #131a23 30%, #1b2530 50%, #131a23 70%); background-size: 200% 100%; animation: sh 1.1s linear infinite; }
@keyframes sh { from { background-position: 200% 0; } to { background-position: -60% 0; } }
.empty { color: var(--muted-2); font-size: 12.5px; padding: 14px 4px; text-align: center; }

/* ---------- detail ---------- */
.section + .section { border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; }
.section h3 { margin: 0 0 9px; font-size: 11px; text-transform: uppercase; letter-spacing: .9px; color: var(--muted); font-weight: 700; }
.swatches { display: flex; flex-wrap: wrap; gap: 5px; }
.sw {
  width: 26px; height: 26px; border-radius: 6px; padding: 0; cursor: pointer;
  border: 1px solid rgba(255,255,255,.14); background: #0e1319; position: relative; overflow: hidden;
}
.sw canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
.sw:hover { transform: translateY(-1px); }
.sw.on { box-shadow: 0 0 0 2px var(--accent), 0 0 0 3px rgba(0,0,0,.5); }
.var-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.var {
  display: flex; align-items: center; gap: 7px; padding: 5px 9px 5px 6px; cursor: pointer;
  border: 1px solid var(--border-2); background: var(--panel-2); border-radius: 9px; color: var(--text); font-size: 12px;
}
.var:hover { border-color: var(--accent); }
.var.on { border-color: var(--accent); background: rgba(240,180,41,.12); color: var(--accent-2); }
.var .sw { width: 24px; height: 24px; border-radius: 5px; }

.anim-list { display: flex; flex-direction: column; gap: 5px; }
.anim-row {
  display: flex; align-items: center; gap: 9px; padding: 5px 7px; border-radius: 8px; cursor: pointer;
  border: 1px solid transparent;
}
.anim-row:hover { background: var(--panel-2); }
.anim-row.on { background: linear-gradient(90deg, rgba(240,180,41,.18), rgba(240,180,41,.04)); border-color: rgba(240,180,41,.35); color: var(--accent-2); }
.anim-row .sw { width: 34px; height: 34px; flex: none; }
.anim-row .nm { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 600; text-transform: capitalize; }
.anim-row .meta { font-size: 10.5px; color: var(--muted-2); font-variant-numeric: tabular-nums; }

.info { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 12px; }
.info dt { color: var(--muted); }
.info dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
.tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.tag { border: 1px solid var(--border-2); border-radius: 999px; padding: 1px 7px; font-size: 10.5px; color: var(--muted); cursor: pointer; }
.tag:hover { color: var(--accent-2); border-color: var(--accent); }
.tag.on { background: var(--accent); color: var(--accent-ink); border-color: #b9840d; font-weight: 700; }

.credits { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
.credits .c { padding: 7px 0; border-top: 1px dashed var(--border); }
.credits .c:first-child { border-top: 0; }
.credits b { color: var(--text); font-weight: 600; }
.credits a { color: var(--blue); text-decoration: none; word-break: break-word; }
.credits a:hover { text-decoration: underline; }
.lic { display: inline-block; border: 1px solid var(--border-2); border-radius: 999px; padding: 0 6px; margin: 2px 3px 0 0; font-size: 10px; color: var(--muted); }

/* ---------- misc ---------- */
.toast {
  position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%) translateY(14px);
  background: #1d2635; border: 1px solid var(--border-2); color: var(--text);
  padding: 10px 16px; border-radius: 10px; box-shadow: var(--shadow);
  opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; z-index: 100;
  font-size: 13px; max-width: 80vw;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.err { border-color: #7a3a3a; background: #2a1a1c; }

.modal-back {
  position: fixed; inset: 0; background: rgba(5,8,12,.72); backdrop-filter: blur(3px);
  display: grid; place-items: center; z-index: 90; padding: 18px;
}
.modal-back[hidden] { display: none; }
.modal {
  background: linear-gradient(180deg, var(--panel), var(--bg-2)); border: 1px solid var(--border-2);
  border-radius: 14px; box-shadow: var(--shadow); width: min(620px, 100%); max-height: 86vh; overflow: auto;
}
.modal.wide { width: min(820px, 100%); }
.modal-head { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 10px; position: sticky; top: 0; background: #141a23; z-index: 2; }
.modal-head h3 { margin: 0; font-size: 15px; }
.modal-body { padding: 16px; }
.modal-foot { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; position: sticky; bottom: 0; background: #12171f; }
.prog { height: 8px; background: var(--panel-3); border-radius: 99px; overflow: hidden; margin: 10px 0; }
.prog > i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .15s ease; }
.field + .field { margin-top: 12px; }
.field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); margin-bottom: 5px; font-weight: 700; }
.field .row2 { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.x { border: 0; background: transparent; color: var(--muted-2); cursor: pointer; font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 6px; }
.x:hover { color: #ff8a8a; background: rgba(255,90,90,.12); }
code.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; background: #0e1319; border: 1px solid var(--border); border-radius: 6px; padding: 2px 5px; word-break: break-all; }
.codebox {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; line-height: 1.5;
  background: #0b1017; border: 1px solid var(--border); border-radius: 9px; padding: 11px 12px;
  white-space: pre; overflow: auto; max-height: 300px; color: #cfe0f5; text-align: left; margin: 0;
}
.note { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
.kv { display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-top: 1px dashed var(--border); font-size: 12px; }
.kv:first-child { border-top: 0; }
.kv b { font-weight: 600; }
`;
var styles_default = CSS;

// workspace:src/lpc-creatures/app.js
var HTML = `
<div class="lpc-app">
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark">LPC</div>
      <div>
        <h1>Animal &amp; Monster Creator</h1>
        <p id="brandSubEl">Loading bestiary\u2026</p>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn" id="randomBtn" title="Random creature, animation and direction (R)">Randomize</button>
      <button class="btn" id="favBtn" title="Show starred creatures only">&#9733; Favourites</button>
      <button class="btn" id="creditsBtn">Credits</button>
      <button class="btn" id="exportBtn">Export</button>
      <button class="btn btn-primary" id="shareBtn">Share link</button>
    </div>
  </header>

  <div class="layout">
    <section class="panel col-browser">
      <div class="panel-head">
        <h2>Bestiary</h2>
        <span class="spacer"></span>
        <span class="meta" id="browserCountEl"></span>
      </div>
      <div class="panel-body">
        <input type="search" id="searchInput" placeholder="Search creatures, tags, packs&hellip;" autocomplete="off" style="margin-bottom:9px" />
        <div class="cat-chips" id="catChipsEl"></div>
        <div class="grid" id="browserEl"></div>
      </div>
    </section>

    <section class="panel col-stage">
      <div class="panel-head">
        <h2 id="stageTitleEl">Preview</h2>
        <div class="stage-tabs" id="stageTabsEl">
          <button data-tab="preview">Preview</button>
          <button data-tab="sheet">Sheet</button>
          <button data-tab="playground">Playground</button>
        </div>
      </div>
      <div class="stage-wrap">
        <div class="stage stage-bg-checker" id="stageEl">
          <div class="stage-badge" id="stageBadgeEl">&hellip;</div>
          <canvas id="previewCanvas" width="256" height="256"></canvas>
          <canvas id="sheetCanvas" hidden></canvas>
          <div class="playground-ctn" id="playgroundEl" hidden>
            <canvas id="playgroundCanvas"></canvas>
          </div>
        </div>
        <div class="stage-hint" id="stageHintEl"></div>

        <div class="stage-controls" id="previewControlsEl">
          <div class="ctrl-row">
            <span class="label">Anim</span>
            <select id="animSelect" style="width:auto"></select>
            <button class="btn btn-sm" id="playBtn" title="Play / pause (space)">&#10074;&#10074;</button>
            <div class="seg" id="dirSegEl" hidden></div>
            <div class="dpad" id="dpadEl" hidden>
              <button class="up" data-dir="up" title="Face up (arrow keys)">&#9650;</button>
              <button class="left" data-dir="left">&#9664;</button>
              <div class="mid">dir</div>
              <button class="right" data-dir="right">&#9654;</button>
              <button class="down" data-dir="down">&#9660;</button>
            </div>
          </div>
          <div class="ctrl-row">
            <span class="label">Frame</span>
            <input type="range" id="frameRange" class="grow" min="0" max="0" value="0" step="1" />
            <span class="meta" id="frameLabelEl">0 / 0</span>
            <span class="label" style="margin-left:6px">Zoom</span>
            <input type="range" id="zoomRange" min="1" max="14" step="1" value="5" />
            <button class="btn btn-sm" id="fitBtn" title="Fit creature to the stage">Fit</button>
          </div>
          <div class="ctrl-row">
            <label class="chk"><input type="checkbox" id="dirsToggle" /> 4-dir strip</label>
            <label class="chk"><input type="checkbox" id="gridToggle" /> grid &amp; pivot</label>
            <label class="chk"><input type="checkbox" id="shadowToggle" checked /> shadow</label>
            <span class="label" style="margin-left:6px">BG</span>
            <div class="seg" id="bgSegEl">
              <button data-bg="checker">Checker</button>
              <button data-bg="grass">Grass</button>
              <button data-bg="dark">Dark</button>
              <button data-bg="light">Light</button>
            </div>
          </div>
        </div>

        <div class="stage-controls" id="sheetControlsEl" hidden>
          <div class="ctrl-row">
            <span class="label">Scale</span>
            <div class="seg" id="sheetScaleSegEl"></div>
            <span class="meta" id="sheetInfoEl"></span>
            <span class="spacer"></span>
            <button class="btn btn-sm" id="sheetDownloadBtn">Download PNG</button>
          </div>
        </div>

        <div class="stage-controls" id="playgroundControlsEl" hidden>
          <div class="ctrl-row">
            <button class="btn btn-sm btn-primary" id="pgSpawnBtn">Spawn selected</button>
            <button class="btn btn-sm" id="pgAddBtn">Random creature</button>
            <button class="btn btn-sm" id="pgClearBtn">Clear</button>
            <span class="label" style="margin-left:6px">Speed</span>
            <input type="range" id="pgSpeedRange" min="10" max="240" value="80" />
            <span class="meta" id="pgCountEl"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel col-detail">
      <div class="panel-head">
        <h2>Creature</h2>
        <span class="spacer"></span>
        <button class="btn btn-sm btn-ghost" id="favStarBtn" title="Star this creature">&#9734; Star</button>
        <button class="btn btn-sm btn-ghost" id="resetBtn">Reset</button>
      </div>
      <div class="panel-body">
        <div class="section" id="variantsSection">
          <h3 id="variantTitleEl">Variants</h3>
          <div class="var-chips" id="variantsEl"></div>
        </div>
        <div class="section">
          <h3>Animations</h3>
          <div class="anim-list" id="animListEl"></div>
        </div>
        <div class="section">
          <h3>Details</h3>
          <dl class="info" id="infoEl"></dl>
          <div class="tags" id="tagsEl"></div>
        </div>
        <div class="section">
          <h3>Credits</h3>
          <div class="credits" id="creditsEl"></div>
        </div>
      </div>
    </section>
  </div>

  <div class="toast" id="toastEl"></div>
  <div class="modal-back" id="modalBack" hidden>
    <div class="modal" id="modalEl">
      <div class="modal-head">
        <h3 id="modalTitleEl"></h3>
        <button class="x" id="modalCloseEl">&#10005;</button>
      </div>
      <div class="modal-body" id="modalBodyEl"></div>
      <div class="modal-foot" id="modalFootEl"></div>
    </div>
  </div>
</div>
`;
var clamp = (v, a, b) => Math.min(b, Math.max(a, v));
var esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function makeStore(provided) {
  if (provided && typeof provided.get === "function") return provided;
  try {
    const ls = window.localStorage;
    if (ls) {
      return {
        get: async (k) => {
          const raw = ls.getItem("lpc-animals:" + k);
          return raw ? JSON.parse(raw) : null;
        },
        set: async (k, v) => ls.setItem("lpc-animals:" + k, JSON.stringify(v))
      };
    }
  } catch {
  }
  const mem = /* @__PURE__ */ new Map();
  return { get: async (k) => mem.has(k) ? mem.get(k) : null, set: async (k, v) => mem.set(k, v) };
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8e3);
}
function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
function creatureFrameTotal(creature) {
  let n = 0;
  for (const anim of Object.values(creature.anims || {})) {
    if (anim.frames) n += anim.frames.length;
    else for (const d of Object.values(anim.dirs || {})) n += d.cols.length;
  }
  return n;
}
function preferredAnim(creature) {
  const keys = animationsFor(creature);
  for (const k of ["idle", "walk", "fly", "swim", "hop", "gallop", "shoot", "attack", "die"]) {
    if (keys.includes(k)) return k;
  }
  return keys[0];
}
async function mount(container, opts = {}) {
  const shadow = container.shadowRoot || container.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${styles_default}</style>${HTML}`;
  const $ = (id) => shadow.querySelector("#" + id);
  const root = shadow.querySelector(".lpc-app");
  const store = makeStore(opts.store);
  const useHash = opts.hash === true;
  const el = {
    brandSub: $("brandSubEl"),
    randomBtn: $("randomBtn"),
    favBtn: $("favBtn"),
    creditsBtn: $("creditsBtn"),
    exportBtn: $("exportBtn"),
    shareBtn: $("shareBtn"),
    search: $("searchInput"),
    catChips: $("catChipsEl"),
    browser: $("browserEl"),
    browserCount: $("browserCountEl"),
    stageTitle: $("stageTitleEl"),
    stageTabs: $("stageTabsEl"),
    stage: $("stageEl"),
    stageBadge: $("stageBadgeEl"),
    stageHint: $("stageHintEl"),
    preview: $("previewCanvas"),
    sheet: $("sheetCanvas"),
    playgroundCtn: $("playgroundEl"),
    playground: $("playgroundCanvas"),
    previewControls: $("previewControlsEl"),
    sheetControls: $("sheetControlsEl"),
    playgroundControls: $("playgroundControlsEl"),
    animSelect: $("animSelect"),
    playBtn: $("playBtn"),
    dirSeg: $("dirSegEl"),
    dpad: $("dpadEl"),
    frameRange: $("frameRange"),
    frameLabel: $("frameLabelEl"),
    zoomRange: $("zoomRange"),
    fitBtn: $("fitBtn"),
    dirsToggle: $("dirsToggle"),
    gridToggle: $("gridToggle"),
    shadowToggle: $("shadowToggle"),
    bgSeg: $("bgSegEl"),
    sheetScaleSeg: $("sheetScaleSegEl"),
    sheetInfo: $("sheetInfoEl"),
    sheetDownloadBtn: $("sheetDownloadBtn"),
    pgSpawnBtn: $("pgSpawnBtn"),
    pgAddBtn: $("pgAddBtn"),
    pgClearBtn: $("pgClearBtn"),
    pgSpeed: $("pgSpeedRange"),
    pgCount: $("pgCountEl"),
    favStarBtn: $("favStarBtn"),
    resetBtn: $("resetBtn"),
    variantsSection: $("variantsSection"),
    variantTitle: $("variantTitleEl"),
    variants: $("variantsEl"),
    animList: $("animListEl"),
    info: $("infoEl"),
    tags: $("tagsEl"),
    credits: $("creditsEl"),
    toast: $("toastEl"),
    modalBack: $("modalBack"),
    modalEl: $("modalEl"),
    modalTitle: $("modalTitleEl"),
    modalBody: $("modalBodyEl"),
    modalFoot: $("modalFootEl"),
    modalClose: $("modalCloseEl")
  };
  const state = {
    id: null,
    variant: null,
    anim: "idle",
    dir: "down",
    frame: 0,
    playing: true,
    scale: 5,
    fourDir: false,
    grid: false,
    shadow: true,
    bg: "checker",
    tab: "preview",
    sheetScale: 2,
    search: "",
    category: "all",
    tag: null,
    favOnly: false
  };
  let destroyed = false;
  let raf = 0;
  let acc = 0;
  let previewSprite = null;
  let previewInfo = null;
  let previewToken = 0;
  let sheetToken = 0;
  const favourites = /* @__PURE__ */ new Set();
  const recent = [];
  const thumbCache = /* @__PURE__ */ new Map();
  const playground = { entities: [], sprites: /* @__PURE__ */ new Map(), grass: null, grassW: 0, grassH: 0, seeded: false };
  let catalog = null;
  const creature = () => state.id ? catalog.byId.get(state.id) : null;
  const ref = () => ({ id: state.id, variant: state.variant });
  const codeOf = () => creatureToCode({ id: state.id, variant: state.variant });
  let toastTimer = 0;
  function toast(msg, isErr) {
    el.toast.textContent = msg;
    el.toast.className = "toast show" + (isErr ? " err" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.className = "toast";
    }, 2600);
  }
  function openModal(title, bodyHtml, footHtml, wide) {
    el.modalTitle.textContent = title;
    el.modalBody.innerHTML = bodyHtml || "";
    el.modalFoot.innerHTML = footHtml || "";
    el.modalEl.className = "modal" + (wide ? " wide" : "");
    el.modalBack.hidden = false;
    return el.modalEl;
  }
  function closeModal() {
    el.modalBack.hidden = true;
    el.modalBody.innerHTML = "";
    el.modalFoot.innerHTML = "";
  }
  el.modalClose.addEventListener("click", closeModal);
  el.modalBack.addEventListener("click", (e) => {
    if (e.target === el.modalBack) closeModal();
  });
  const catalogOptions = { catalogUrl: opts.catalogUrl, sheetBase: opts.sheetBase };
  catalog = await loadCatalog(catalogOptions);
  const stats = catalogStats(catalog);
  const storedFavs = await store.get("favourites");
  if (Array.isArray(storedFavs)) {
    for (const id of storedFavs) if (catalog.byId.has(id)) favourites.add(id);
  }
  const storedLast = await store.get("last");
  const storedSettings = await store.get("settings");
  if (storedSettings && typeof storedSettings === "object") {
    for (const k of ["fourDir", "grid", "shadow", "bg", "tab", "sheetScale"]) {
      if (storedSettings[k] !== void 0) state[k] = storedSettings[k];
    }
  }
  function saveSettings() {
    store.set("settings", {
      fourDir: state.fourDir,
      grid: state.grid,
      shadow: state.shadow,
      bg: state.bg,
      tab: state.tab,
      sheetScale: state.sheetScale
    });
  }
  function saveFavourites() {
    store.set("favourites", [...favourites]);
  }
  function remember() {
    const i = recent.indexOf(state.id);
    if (i >= 0) recent.splice(i, 1);
    recent.unshift(state.id);
    if (recent.length > 8) recent.length = 8;
    store.set("recent", [...recent]);
    store.set("last", { id: state.id, variant: state.variant });
  }
  el.brandSub.textContent = stats.creatures + " creatures \xB7 " + stats.variants + " variants \xB7 " + stats.animations + " animations \xB7 " + stats.frames + " frames";
  function filtered() {
    const q = state.search.trim().toLowerCase();
    return catalog.creatures.filter((c) => {
      if (state.favOnly && !favourites.has(c.id)) return false;
      if (state.category !== "all" && c.category !== state.category) return false;
      if (state.tag && !(c.tags || []).includes(state.tag)) return false;
      if (!q) return true;
      const hay = [c.id, c.name, c.category, ...c.tags || [], ...c.packs || []].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  function renderCatChips() {
    const chips = [];
    const cats = [{ key: "all", label: "All" }, ...catalog.categories || []];
    chips.push(`<button class="chip${state.category === "all" && !state.favOnly ? " on" : ""}" data-cat="all">All <span class="n">${catalog.creatures.length}</span></button>`);
    for (const c of cats) {
      if (c.key === "all") continue;
      const n = (catalog.byCategory[c.key] || []).length;
      if (!n) continue;
      chips.push(`<button class="chip${state.category === c.key ? " on" : ""}" data-cat="${esc(c.key)}" title="${esc(c.blurb || "")}">${esc(c.label)} <span class="n">${n}</span></button>`);
    }
    el.catChips.innerHTML = chips.join("");
    el.catChips.querySelectorAll("[data-cat]").forEach(
      (b) => b.addEventListener("click", () => {
        state.category = b.dataset.cat;
        state.favOnly = false;
        el.favBtn.classList.remove("on");
        renderCatChips();
        renderBrowser();
      })
    );
  }
  function renderBrowser() {
    const list = filtered();
    el.browserCount.textContent = list.length + (list.length === 1 ? " creature" : " creatures");
    if (!list.length) {
      el.browser.innerHTML = `<div class="empty">No creatures match that filter.<br>Try clearing the search or the tag.</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach((c) => {
      const b = document.createElement("button");
      b.className = "tile" + (c.id === state.id ? " on" : "");
      b.dataset.id = c.id;
      b.title = c.name + " \u2014 " + (c.tags || []).join(", ");
      const cv = document.createElement("canvas");
      cv.width = 104;
      cv.height = 104;
      b.appendChild(cv);
      const cap = document.createElement("span");
      cap.className = "cap";
      cap.textContent = c.name;
      b.appendChild(cap);
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = c.size || c.category;
      b.appendChild(badge);
      const fav = document.createElement("span");
      fav.className = "fav" + (favourites.has(c.id) ? " on" : "");
      fav.textContent = "\u2605";
      fav.title = "Star / unstar";
      fav.addEventListener("click", (e) => {
        e.stopPropagation();
        if (favourites.has(c.id)) favourites.delete(c.id);
        else favourites.add(c.id);
        fav.className = "fav" + (favourites.has(c.id) ? " on" : "");
        saveFavourites();
        updateStarButton();
        if (state.favOnly) renderBrowser();
      });
      b.appendChild(fav);
      b.addEventListener("click", () => selectCreature(c.id, null));
      frag.appendChild(b);
    });
    el.browser.innerHTML = "";
    el.browser.appendChild(frag);
    fillThumbnails();
  }
  function tileCanvas(id) {
    const b = el.browser.querySelector('.tile[data-id="' + attrEsc(id) + '"] canvas');
    return b;
  }
  function attrEsc(s) {
    return String(s).replace(/"/g, '\\"');
  }
  function makeSwatch(size) {
    const sw = document.createElement("span");
    sw.className = "sw";
    const cv = document.createElement("canvas");
    cv.width = size || 52;
    cv.height = size || 52;
    sw.appendChild(cv);
    return { sw, cv };
  }
  const thumbBoxCache = /* @__PURE__ */ new WeakMap();
  function inkBox(src) {
    const cached = thumbBoxCache.get(src);
    if (cached) return cached;
    let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
    try {
      const d = src.getContext("2d").getImageData(0, 0, src.width, src.height).data;
      for (let y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; x++) {
          if (d[(y * src.width + x) * 4 + 3] > 8) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    } catch {
    }
    const box = maxX < 0 ? { x: 0, y: 0, w: src.width, h: src.height } : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    thumbBoxCache.set(src, box);
    return box;
  }
  function paintThumb(canvas, src) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const box = inkBox(src);
    const big = canvas.width >= 96;
    const t = big ? 25 : Math.max(1, Math.round(canvas.width * 0.05));
    const r = big ? 8 : t;
    const b = big ? 22 : t;
    const l = big ? 8 : t;
    const availW = canvas.width - l - r;
    const availH = canvas.height - t - b;
    const s = Math.min(availW / box.w, availH / box.h);
    const smoothing = s < 1;
    ctx.imageSmoothingEnabled = smoothing;
    if (smoothing) ctx.imageSmoothingQuality = "high";
    const w = Math.round(box.w * s);
    const h = Math.round(box.h * s);
    ctx.drawImage(
      src,
      box.x,
      box.y,
      box.w,
      box.h,
      l + Math.round((availW - w) / 2),
      t + Math.round((availH - h) / 2),
      w,
      h
    );
  }
  async function thumbSource(creature2) {
    if (thumbCache.has(creature2.id)) return thumbCache.get(creature2.id);
    const anim = preferredAnim(creature2);
    const dir = isDirectional(creature2) ? "down" : "down";
    let frame = null;
    try {
      frame = await renderFrame(catalog, creature2.id, { anim, dir, frame: 0, ...catalogOptions });
    } catch {
    }
    if (!frame) {
      try {
        frame = await renderFrame(catalog, { id: creature2.id, variant: creature2.variants[0].key }, { anim: preferredAnim(creature2), frame: 0, ...catalogOptions });
      } catch {
      }
    }
    thumbCache.set(creature2.id, frame);
    return frame;
  }
  function fillThumbnails() {
    const tiles = [...el.browser.querySelectorAll(".tile")];
    let i = 0;
    const step2 = () => {
      if (destroyed) return;
      const end = Math.min(tiles.length, i + 4);
      for (; i < end; i++) {
        const tile = tiles[i];
        const c = catalog.byId.get(tile.dataset.id);
        if (!c) continue;
        thumbSource(c).then((src) => {
          if (!src || !tile.isConnected) return;
          const cv = tile.querySelector("canvas");
          if (cv) paintThumb(cv, src);
        });
      }
      if (i < tiles.length) setTimeout(step2, 24);
    };
    step2();
  }
  function selectCreature(id, variant, o = {}) {
    const c = catalog.byId.get(id);
    if (!c) return;
    state.id = id;
    state.variant = variant || (c.variants.find((v) => v.key === variant) ? variant : c.variants[0].key);
    const anims = animationsFor(c);
    if (!anims.includes(state.anim)) state.anim = preferredAnim(c);
    if (!isDirectional(c)) state.dir = "down";
    state.frame = 0;
    if (!o.keepZoom) fitZoom();
    el.browser.querySelectorAll(".tile").forEach((t) => t.classList.toggle("on", t.dataset.id === id));
    updateVariants();
    updateAnimList();
    updateInfo();
    updateCredits();
    updateStarButton();
    syncControls();
    buildPreview();
    if (state.tab === "sheet") renderSheetView();
    writeHash();
    if (!o.silent) {
      remember();
      if (typeof opts.onSelect === "function") {
        try {
          opts.onSelect(getSelection());
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  function fitZoom() {
    const c = creature();
    if (!c) return;
    const m = Math.max(c.fw, c.fh);
    state.scale = clamp(Math.round(170 / m), 1, 14);
    el.zoomRange.value = String(state.scale);
  }
  function setAnim(k, o = {}) {
    const c = creature();
    if (!c || !k || !c.anims[k]) return;
    state.anim = k;
    state.frame = 0;
    if (state.tab === "sheet") renderSheetView();
    updateAnimList();
    updateDirUI();
    if (!o.silent) buildPreview();
    writeHash();
  }
  function setDir(d) {
    if (!d || isDirectional(creature()) && !DIRECTIONS.includes(d)) return;
    state.dir = d;
    state.frame = 0;
    updateDirUI();
    buildPreview();
    writeHash();
  }
  function setFrame(i) {
    const n = frameMax() + 1;
    state.frame = n ? (i % n + n) % n : 0;
    acc = 0;
    updateFrameUI();
    drawPreview();
  }
  function previewDirs() {
    const c = creature();
    const info = c && animInfo(c, state.anim);
    return state.fourDir && isDirectional(c) && info && !info.dirless ? DIRECTIONS : [state.dir];
  }
  function previewAnchor() {
    const c = creature();
    const info = c && animInfo(c, state.anim);
    if (!c || !info) return "center";
    if (isDirectional(c) || info.fw === c.fw && info.fh === c.fh) return "feet";
    return "center";
  }
  function frameMax() {
    if (!previewSprite) return 0;
    const dirs = previewDirs();
    let n = 0;
    for (const d of dirs) n = Math.max(n, previewSprite.frameCount(state.anim, d));
    return Math.max(0, n - 1);
  }
  function syncControls() {
    const c = creature();
    el.zoomRange.value = String(state.scale);
    el.dirsToggle.checked = state.fourDir;
    el.gridToggle.checked = state.grid;
    el.shadowToggle.checked = state.shadow;
    el.shadowToggle.disabled = !(c && c.shadow);
    el.dirsToggle.disabled = !isDirectional(c);
    el.bgSeg.querySelectorAll("[data-bg]").forEach((b) => b.classList.toggle("on", b.dataset.bg === state.bg));
    el.stage.className = "stage stage-bg-" + state.bg;
    el.stageTabs.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === state.tab));
    el.previewControls.hidden = state.tab !== "preview";
    el.sheetControls.hidden = state.tab !== "sheet";
    el.playgroundControls.hidden = state.tab !== "playground";
    el.preview.hidden = state.tab !== "preview";
    el.sheet.hidden = state.tab !== "sheet";
    el.playgroundCtn.hidden = state.tab !== "playground";
    el.stageTitle.textContent = state.tab === "preview" ? "Preview" : state.tab === "sheet" ? "Animation sheet" : "Playground";
    el.animSelect.disabled = state.tab === "playground";
    el.stageHint.innerHTML = state.tab === "playground" ? 'A live demo of the exported API: every creature below is drawn with <code class="mono">createSprite().drawWithShadow(ctx, x, y, { anim, dir, frame })</code> &mdash; the same call your game makes.' : state.tab === "sheet" ? "Canonical sheet for one animation: one row per direction, in the order <b>up, left, down, right</b>. Transparent background." : 'Feet sit on the ground line, so <code class="mono">draw(ctx, x, y, { dir, frame })</code> drops straight into a top-down game loop.';
    if (state.tab === "playground") syncPlaygroundSize();
  }
  function updateStarButton() {
    const on = favourites.has(state.id);
    el.favStarBtn.innerHTML = on ? "&#9733; Starred" : "&#9734; Star";
    el.favStarBtn.classList.toggle("on", on);
  }
  function updateVariants() {
    const c = creature();
    const vs = c.variants || [];
    el.variantTitle.textContent = vs.length > 1 ? "Variants (" + vs.length + ")" : "Variant";
    el.variants.innerHTML = "";
    vs.forEach((v) => {
      const b = document.createElement("button");
      b.className = "var" + (v.key === state.variant ? " on" : "");
      const { sw, cv } = makeSwatch(48);
      b.appendChild(sw);
      const nm = document.createElement("span");
      nm.textContent = v.name || v.key;
      b.appendChild(nm);
      b.addEventListener("click", () => selectCreature(c.id, v.key, { keepZoom: true }));
      el.variants.appendChild(b);
      renderFrame(catalog, { id: c.id, variant: v.key }, { anim: preferredAnim(c), dir: "down", frame: 0, ...catalogOptions }).then((f) => {
        if (f) paintThumb(cv, f);
      }).catch(() => {
      });
    });
  }
  function updateAnimList() {
    const c = creature();
    el.animSelect.innerHTML = "";
    const infos = [];
    el.animList.innerHTML = "";
    for (const k of animationsFor(c)) {
      const info = animInfo(c, k);
      infos.push(info);
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      el.animSelect.appendChild(opt);
      const row = document.createElement("div");
      row.className = "anim-row" + (k === state.anim ? " on" : "");
      const { sw, cv } = makeSwatch(68);
      row.appendChild(sw);
      const nm = document.createElement("span");
      nm.className = "nm";
      nm.textContent = k;
      row.appendChild(nm);
      const meta = document.createElement("span");
      meta.className = "meta";
      const count = isDirectional(c) ? frameCount(c, k, "down") : (info.def.frames || []).length;
      meta.textContent = count + "f \xB7 " + info.fps + "fps" + (info.loop ? "" : " \xB7 once");
      row.appendChild(meta);
      row.addEventListener("click", () => setAnim(k));
      el.animList.appendChild(row);
      renderFrame(catalog, ref(), { anim: k, dir: "down", frame: 0, ...catalogOptions }).then((f) => {
        if (f) paintThumb(cv, f);
      }).catch(() => {
      });
    }
    el.animSelect.value = state.anim;
    updateDirUI();
  }
  function updateDirUI() {
    const c = creature();
    const directional = isDirectional(c);
    el.dirSeg.hidden = !directional;
    el.dpad.hidden = !directional;
    el.dirSeg.innerHTML = "";
    if (directional) {
      for (const d of DIRECTIONS) {
        const b = document.createElement("button");
        b.textContent = DIR_LABEL[d];
        b.className = d === state.dir ? "on" : "";
        b.addEventListener("click", () => setDir(d));
        el.dirSeg.appendChild(b);
      }
      el.dpad.querySelectorAll("[data-dir]").forEach((b) => b.classList.toggle("on", b.dataset.dir === state.dir));
    }
    updateFrameUI();
  }
  function updateFrameUI() {
    const max = frameMax();
    el.frameRange.max = String(max);
    el.frameRange.value = String(clamp(state.frame, 0, max));
    el.frameLabel.textContent = state.frame + 1 + " / " + (max + 1);
  }
  function updateInfo() {
    const c = creature();
    const v = variantOf(c, state.variant);
    const total = creatureFrameTotal(c);
    const rows = [
      ["Category", (catalog.categoryOf(c.category) || {}).label || c.category],
      ["Size class", c.size || "\u2014"],
      ["Frame size", c.fw + " \xD7 " + c.fh + " px"],
      ["Directions", isDirectional(c) ? c.dirs || "lpc" : "single view"],
      ["Animations", animationsFor(c).length + " (" + total + " frames)"],
      ["Variants", (c.variants || []).length],
      ["Sheet", v.sheet],
      ["Ground pivot", c.ground ? c.ground.x + ", " + c.ground.y : "centred"],
      ["Shadow", c.shadow ? "yes" : "none"]
    ];
    el.info.innerHTML = rows.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join("");
    el.tags.innerHTML = "";
    (c.tags || []).forEach((t) => {
      const b = document.createElement("button");
      b.className = "tag" + (state.tag === t ? " on" : "");
      b.textContent = "#" + t;
      b.addEventListener("click", () => {
        state.tag = state.tag === t ? null : t;
        state.category = "all";
        renderCatChips();
        renderBrowser();
        updateInfo();
      });
      el.tags.appendChild(b);
    });
    if (c.notes) {
      const note = document.createElement("div");
      note.className = "note";
      note.style.marginTop = "8px";
      note.textContent = c.notes;
      el.tags.appendChild(note);
    }
  }
  function updateCredits() {
    const c = creature();
    const packs = (c.packs || []).map((p) => catalog.packs[p]).filter(Boolean);
    el.credits.innerHTML = packs.map((p) => `
      <div class="c">
        <b>${esc(p.name)}</b><br>
        ${(p.authors || []).map(esc).join(", ")}<br>
        <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a>
        ${(p.extraUrls || []).map((u) => `<br><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`).join("")}
        <div>${String(p.license || "").split("/").map((l) => `<span class="lic">${esc(l.trim())}</span>`).join("")}</div>
      </div>`).join("");
  }
  async function buildPreview() {
    const c = creature();
    if (!c) return;
    const token = ++previewToken;
    const dirs = previewDirs();
    const withShadow = state.shadow && !!c.shadow;
    let sprite;
    try {
      sprite = await createSprite(catalog, ref(), {
        scale: state.scale,
        anims: [state.anim],
        directions: dirs,
        shadow: withShadow,
        ...catalogOptions
      });
    } catch (e) {
      console.error(e);
      el.stageBadge.textContent = "Could not render this creature";
      return;
    }
    if (token !== previewToken || destroyed) return;
    previewSprite = sprite;
    previewInfo = animInfo(c, state.anim);
    state.frame = clamp(state.frame, 0, frameMax());
    updateFrameUI();
    drawPreview();
  }
  function drawPreview() {
    const sp = previewSprite;
    if (!sp) return;
    const info = previewInfo;
    const dirs = previewDirs();
    const anchor = previewAnchor();
    const scale = state.scale;
    const PAD = 12;
    const fw = info.fw * scale;
    const fh = info.fh * scale;
    const cellW = fw + PAD * 2;
    const cellH = fh + PAD * 2;
    const cv = el.preview;
    cv.width = cellW * dirs.length;
    cv.height = cellH;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const pivot = sp.pivot;
    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i];
      const ox = i * cellW + PAD;
      if (state.grid) {
        ctx.strokeStyle = "rgba(120,140,170,0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(i * cellW + 0.5, 0.5, cellW - 1, cellH - 1);
      }
      const frame = Math.min(state.frame, Math.max(0, sp.frameCount(state.anim, d) - 1));
      const drawn = anchor === "feet" ? sp.drawWithShadow(ctx, ox + fw / 2, PAD + pivot.y, { anim: state.anim, dir: d, frame, anchor: "feet" }) : sp.drawWithShadow(ctx, ox + fw / 2, PAD + fh / 2, { anim: state.anim, dir: d, frame, anchor: "center" });
      if (!drawn) {
        ctx.fillStyle = "rgba(255,120,120,0.75)";
        ctx.font = "12px monospace";
        ctx.fillText("no frame", ox + 4, PAD + 14);
      }
      if (state.grid && anchor === "feet") {
        ctx.strokeStyle = "rgba(240,180,41,0.7)";
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(i * cellW, PAD + pivot.y + 0.5);
        ctx.lineTo(i * cellW + cellW, PAD + pivot.y + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        if (anchor === "feet") {
          ctx.fillStyle = "#f0b429";
          ctx.beginPath();
          ctx.arc(ox + pivot.x, PAD + pivot.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (dirs.length > 1) {
          ctx.fillStyle = "rgba(147,160,180,0.9)";
          ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
          ctx.fillText(DIR_LABEL[d], i * cellW + 6, cellH - 4);
        }
      }
    }
    const n = sp.frameCount(state.anim, state.dir);
    el.stageBadge.textContent = state.anim + " \xB7 " + (dirs.length > 1 ? "4 directions" : DIR_LABEL[state.dir]) + " \xB7 " + n + " frame" + (n === 1 ? "" : "s") + " \xB7 " + sp.fps(state.anim) + " fps \xB7 " + info.fw + "\xD7" + info.fh + " @ " + scale + "x";
  }
  function renderSheetView() {
    const c = creature();
    if (!c) return;
    const token = ++sheetToken;
    const anim = c.anims[state.anim] && state.anim || preferredAnim(c);
    const maxW = Math.max(320, el.stage.clientWidth - 48);
    const cols = Math.max(1, ...DIRECTIONS.map((d) => frameCount(c, anim, d)));
    const info = animInfo(c, anim);
    const auto = clamp(Math.floor(Math.min(maxW / (cols * info.fw), 420 / (4 * info.fh))), 1, 6);
    if (!el.sheetScaleSeg.dataset.touched) state.sheetScale = auto;
    el.sheetScaleSeg.innerHTML = [1, 2, 3, 4].map((s) => `<button data-s="${s}" class="${s === state.sheetScale ? "on" : ""}">${s}x</button>`).join("");
    el.sheetScaleSeg.querySelectorAll("[data-s]").forEach(
      (b) => b.addEventListener("click", () => {
        el.sheetScaleSeg.dataset.touched = "1";
        state.sheetScale = Number(b.dataset.s);
        saveSettings();
        renderSheetView();
      })
    );
    renderAnimSheet(catalog, ref(), anim, { scale: state.sheetScale, ...catalogOptions }).then((canvas) => {
      if (token !== sheetToken || destroyed) return;
      const cv = el.sheet;
      cv.width = canvas.width;
      cv.height = canvas.height;
      const ctx = cv.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(canvas, 0, 0);
      const directional = isDirectional(c);
      el.sheetInfo.textContent = anim + " \xB7 " + (directional ? "up, left, down, right" : "single view") + " \xB7 " + canvas.width + "\xD7" + canvas.height + " px";
      el.stageHint.innerHTML = directional ? "One row per direction \u2014 <b>up, left, down, right</b>, " + cols + " columns. Frames are centred in their cell; the pivot stays put across rows, so a whole row animates as-is." : "Direction-independent animation (" + frameCount(c, anim, "down") + " frames).";
    }).catch((e) => {
      console.error(e);
      el.sheetInfo.textContent = "Could not render sheet";
    });
  }
  let exportCache = null;
  function predictSheet(c) {
    let cellW = c.fw;
    let cellH = c.fh;
    let cols = 0;
    let anims = 0;
    for (const k of animationsFor(c)) {
      const info = animInfo(c, k);
      cellW = Math.max(cellW, info.fw);
      cellH = Math.max(cellH, info.fh);
      anims++;
      for (const d of DIRECTIONS) cols = Math.max(cols, frameCount(c, k, d));
    }
    cols = Math.max(1, cols);
    let rows = anims * 4;
    if (c.shadow) rows += 4;
    return { cols, rows, cellW, cellH };
  }
  function cappedScale(c, wanted) {
    const p = predictSheet(c);
    let s = wanted;
    while (s > 1 && (p.cols * p.cellW * s > 8e3 || p.rows * p.cellH * s > 8e3 || p.cols * p.cellW * s * p.rows * p.cellH * s > 24e6)) s--;
    return s;
  }
  async function buildExport(scale, withShadow) {
    const c = creature();
    const safe = cappedScale(c, scale);
    const res = await renderSheet(catalog, ref(), { scale: safe, shadow: withShadow, ...catalogOptions });
    const manifest = sheetManifest(catalog, ref(), { scale: safe, shadow: withShadow }, res);
    manifest.scaleLimit = safe < scale ? { requested: scale, applied: safe, reason: "canvas size limit" } : null;
    return { res, manifest, scale: safe, withShadow };
  }
  function spriteSnippet() {
    const c = creature();
    const v = variantOf(c, state.variant);
    const anims = animationsFor(c).slice(0, 4).join('", "');
    const dir = isDirectional(c) ? state.dir : "down";
    const generatorName = typeof window.generatorName === "string" ? window.generatorName : "lpc-animal-and-monster-creator";
    return [
      "// main.pjs",
      "lpcAnimals = {import:" + generatorName + "}",
      "",
      "// game code (importing the generator gives you the plugin object directly)",
      "const creator = root.lpcAnimals;",
      "const sprite = await creator.createSprite(" + JSON.stringify(codeOf()) + ", { scale: 1 });",
      "",
      "// each frame, with the feet anchored at (entity.x, entity.y):",
      "sprite.drawWithShadow(ctx, entity.x, entity.y, {",
      '  anim: "' + state.anim + '",',
      '  dir: "' + dir + '",',
      '  frame: sprite.frameCount("' + state.anim + '", "' + dir + '") > 1',
      '    ? Math.floor(t * sprite.fps("' + state.anim + '")) % sprite.frameCount("' + state.anim + '", "' + dir + '")',
      "    : 0,",
      "});",
      "",
      "// animations available: " + anims,
      "// frame size: " + (c.fw + "x" + c.fh) + " \xB7 animations: " + animationsFor(c).join(", "),
      "// credit: " + (c.packs || []).map((p) => (catalog.packs[p] || {}).name).filter(Boolean).join(" + "),
      "// licence: " + [...new Set((c.packs || []).map((p) => (catalog.packs[p] || {}).license).filter(Boolean))].join(" / ")
    ].join("\n");
  }
  function openExportModal() {
    const c = creature();
    const v = variantOf(c, state.variant);
    const modal = openModal(
      "Export \u2014 " + c.name + (v.name && v.name !== c.name ? " (" + v.name + ")" : ""),
      `
      <div class="field">
        <label>Pixel scale</label>
        <div class="row2">
          <div class="seg" id="expScaleSeg">
            <button data-s="1">1x</button><button data-s="2" class="on">2x</button>
            <button data-s="3">3x</button><button data-s="4">4x</button>
          </div>
          <label class="chk"><input type="checkbox" id="expShadow" checked ${c.shadow ? "" : "disabled"} /> shadow rows</label>
          <span class="meta" id="expStatusEl">building&hellip;</span>
        </div>
      </div>
      <div class="prog" id="expProgEl"><i></i></div>
      <div class="field">
        <label>Game sheet \u2014 every animation, uniform cells, one block of 4 direction rows each</label>
        <div class="row2">
          <button class="btn btn-sm" id="expSheetBtn" disabled>Download PNG</button>
          <button class="btn btn-sm" id="expManifestBtn" disabled>Download manifest JSON</button>
          <button class="btn btn-sm btn-ghost" id="expCopyManifestBtn" disabled>Copy manifest</button>
        </div>
      </div>
      <div class="field">
        <label>Manifest preview (<span id="expManifestNameEl"></span>)</label>
        <pre class="codebox" id="expManifestEl">building&hellip;</pre>
      </div>
      <div class="field">
        <label>Single animation sheet</label>
        <div class="row2">
          <button class="btn btn-sm" id="expAnimBtn">Download ${esc(state.anim)} sheet</button>
          <span class="meta">rows: up, left, down, right</span>
        </div>
      </div>
      <div class="field">
        <label>Use it in your game</label>
        <pre class="codebox" id="expCodeEl">${esc(spriteSnippet())}</pre>
        <div class="row2" style="margin-top:8px">
          <button class="btn btn-sm btn-ghost" id="expCopyCodeBtn">Copy code</button>
          <button class="btn btn-sm btn-ghost" id="expCopyCodeCtnBtn">Share code: ${esc(codeOf())}</button>
        </div>
      </div>`,
      `<button class="btn btn-primary" id="expCloseBtn">Done</button>`,
      true
    );
    const $m = (id) => modal.querySelector("#" + id);
    $m("expCloseBtn").addEventListener("click", closeModal);
    $m("expCopyCodeBtn").addEventListener("click", async () => {
      toast(await copyText(spriteSnippet()) ? "Sprite code copied" : "Could not copy", false);
    });
    $m("expCopyCodeCtnBtn").addEventListener("click", async () => {
      toast(await copyText(codeOf()) ? "Copied " + codeOf() : "Could not copy");
    });
    let scale = 2;
    let withShadow = !!c.shadow;
    const rebuild = async () => {
      const token = exportCache && exportCache.token || 0;
      const my = token + 1;
      exportCache = { token: my };
      $m("expStatusEl").textContent = "building\u2026";
      $m("expProgEl").querySelector("i").style.width = "35%";
      ["expSheetBtn", "expManifestBtn", "expCopyManifestBtn"].forEach((id) => $m(id).disabled = true);
      try {
        const out = await buildExport(scale, withShadow);
        if (!exportCache || exportCache.token !== my) return;
        exportCache = Object.assign(out, { token: my });
        $m("expProgEl").querySelector("i").style.width = "100%";
        const m = out.manifest;
        $m("expStatusEl").textContent = m.cols + "\xD7" + m.rows + " cells \xB7 " + out.res.canvas.width + "\xD7" + out.res.canvas.height + " px" + (m.scaleLimit ? " \xB7 scale reduced to " + m.scaleLimit.applied + "x (canvas limit)" : "");
        $m("expManifestNameEl").textContent = m.image;
        $m("expManifestEl").textContent = JSON.stringify(m, null, 1);
        ["expSheetBtn", "expManifestBtn", "expCopyManifestBtn"].forEach((id) => $m(id).disabled = false);
      } catch (e) {
        console.error(e);
        $m("expStatusEl").textContent = "Failed: " + e.message;
        $m("expProgEl").querySelector("i").style.width = "0%";
      }
    };
    $m("expScaleSeg").querySelectorAll("[data-s]").forEach(
      (b) => b.addEventListener("click", () => {
        scale = Number(b.dataset.s);
        $m("expScaleSeg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
        rebuild();
      })
    );
    $m("expShadow").addEventListener("change", (e) => {
      withShadow = e.target.checked;
      rebuild();
    });
    $m("expSheetBtn").addEventListener("click", async () => {
      if (!exportCache || !exportCache.res) return;
      const blob = await canvasToBlob(exportCache.res.canvas);
      downloadBlob(blob, exportCache.manifest.image);
      toast("Downloaded " + exportCache.manifest.image);
    });
    $m("expManifestBtn").addEventListener("click", () => {
      if (!exportCache || !exportCache.manifest) return;
      const name = exportCache.manifest.image.replace(/\.png$/, ".json");
      downloadBlob(new Blob([JSON.stringify(exportCache.manifest, null, 2)], { type: "application/json" }), name);
      toast("Downloaded " + name);
    });
    $m("expCopyManifestBtn").addEventListener("click", async () => {
      if (!exportCache) return;
      toast(await copyText(JSON.stringify(exportCache.manifest, null, 2)) ? "Manifest copied" : "Could not copy");
    });
    $m("expAnimBtn").addEventListener("click", async () => {
      const canvas = await renderAnimSheet(catalog, ref(), state.anim, { scale: cappedScale(c, scale), ...catalogOptions });
      const name = c.id + "-" + (v.key && v.key !== "default" ? v.key + "-" : "") + state.anim + ".png";
      downloadBlob(await canvasToBlob(canvas), name);
      toast("Downloaded " + name);
    });
    rebuild();
  }
  function openCreditsModal() {
    const packs = Object.values(catalog.packs || {});
    openModal(
      "Credits & licences",
      `<p class="note" style="margin-top:0">Every sprite in this bestiary comes from the Liberated Pixel Cup (LPC) community. Most of these licences require attribution &mdash; the credits for the creature you are viewing are also shown in the right-hand panel so you can copy them into your game's credits screen.</p>
       <div class="credits">${packs.map((p) => `
        <div class="c">
          <b>${esc(p.name)}</b><br>
          ${(p.authors || []).map(esc).join(" \xB7 ")}<br>
          <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a>
          ${(p.extraUrls || []).map((u) => `<br><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`).join("")}
          <div>${String(p.license || "").split("/").map((l) => `<span class="lic">${esc(l.trim())}</span>`).join("")}</div>
        </div>`).join("")}
       </div>`,
      `<button class="btn btn-primary" id="crCloseBtn">Close</button>`,
      true
    );
    el.modalFoot.querySelector("#crCloseBtn").addEventListener("click", closeModal);
  }
  function shareLink() {
    return "https://perchance.org/" + (typeof window.generatorName === "string" ? window.generatorName : "lpc-animal-and-monster-creator") + "#" + codeOf() + "/" + state.anim + "/" + state.dir;
  }
  function openShareModal() {
    const link = shareLink();
    const modal = openModal(
      "Share this creature",
      `<div class="field">
        <label>Link</label>
        <div class="row2"><input type="text" id="shareLinkInput" readonly value="${esc(link)}" />
        <button class="btn" id="shareCopyBtn">Copy</button></div>
      </div>
      <div class="field">
        <label>Share code</label>
        <div class="row2"><input type="text" id="shareCodeInput" readonly value="${esc(codeOf())}" />
        <button class="btn" id="shareCodeCopyBtn">Copy</button></div>
        <p class="note">Pass the code straight to the plugin: <code class="mono">creator.createSprite("${esc(codeOf())}")</code></p>
      </div>`,
      `<button class="btn btn-primary" id="shareCloseBtn">Close</button>`
    );
    modal.querySelector("#shareCloseBtn").addEventListener("click", closeModal);
    modal.querySelector("#shareCopyBtn").addEventListener("click", async () => {
      toast(await copyText(link) ? "Link copied" : "Could not copy");
    });
    modal.querySelector("#shareCodeCopyBtn").addEventListener("click", async () => {
      toast(await copyText(codeOf()) ? "Code copied" : "Could not copy");
    });
    const input = modal.querySelector("#shareLinkInput");
    input.focus();
    input.select();
  }
  function writeHash() {
    if (!useHash) return;
    try {
      history.replaceState(null, "", "#" + codeOf() + "/" + state.anim + "/" + state.dir);
    } catch {
    }
  }
  function readHash() {
    if (!useHash) return null;
    const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!raw) return null;
    const [code, anim, dir] = raw.split("/");
    const parsed = creatureFromCode(code);
    if (!parsed || !catalog.byId.has(parsed.id)) return null;
    return { id: parsed.id, variant: parsed.variant, anim, dir };
  }
  function pgScale(c) {
    return c.fh <= 40 ? 2 : c.fh <= 64 ? 1 : 1;
  }
  async function pgSprite(c) {
    const key = c.id + "~" + (state.variant && state.id === c.id ? state.variant : "");
    if (playground.sprites.has(key)) return playground.sprites.get(key);
    const anims = animationsFor(c).filter((k) => k === "walk" || k === "run" || k === "fly" || k === "idle" || k === "hop" || k === "swim" || k === "gallop");
    const sprite = await createSprite(catalog, { id: c.id, variant: state.id === c.id ? state.variant : null }, {
      scale: pgScale(c),
      anims: anims.length ? anims : [preferredAnim(c)],
      shadow: state.shadow,
      ...catalogOptions
    });
    playground.sprites.set(key, sprite);
    return sprite;
  }
  function pgMoveAnim(sprite) {
    for (const k of ["walk", "gallop", "run", "hop", "swim", "fly", "idle"]) if (sprite.animations.includes(k)) return k;
    return sprite.animations[0];
  }
  async function pgAdd(id, variant) {
    const c = catalog.byId.get(id || state.id);
    if (!c) return;
    let sprite;
    try {
      sprite = await pgSprite(c);
    } catch (e2) {
      console.error(e2);
      toast("Could not load " + c.name + " frames", true);
      return;
    }
    if (destroyed) return;
    const w = el.playground.clientWidth || 600;
    const h = el.playground.clientHeight || 360;
    playground.entities.push({
      id: c.id,
      sprite,
      anim: pgMoveAnim(sprite),
      dir: ["down", "left", "right", "up"][Math.floor(Math.random() * 4)],
      x: 40 + Math.random() * Math.max(40, w - 80),
      y: 60 + Math.random() * Math.max(40, h - 100),
      tx: 0,
      ty: 0,
      t: Math.random() * 3,
      speed: 18 + Math.random() * 22,
      waiting: 0
    });
    const e = playground.entities[playground.entities.length - 1];
    e.tx = 40 + Math.random() * Math.max(40, w - 80);
    e.ty = 60 + Math.random() * Math.max(40, h - 40);
    el.pgCount.textContent = playground.entities.length + " on the field";
  }
  function pgClear() {
    playground.entities.length = 0;
    el.pgCount.textContent = "0 on the field";
    pgDraw();
  }
  async function pgSeed() {
    if (playground.seeded) return;
    playground.seeded = true;
    const pool = catalog.creatures.filter((c) => c.id !== "slime-projectile");
    const picks = [];
    const seen = /* @__PURE__ */ new Set();
    while (picks.length < 9 && picks.length < pool.length) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      picks.push(c);
    }
    for (const c of picks) {
      await pgAdd(c.id, c.variants[Math.floor(Math.random() * c.variants.length)].key);
      if (destroyed) return;
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  function pgBuildGrass(w, h) {
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, w);
    cv.height = Math.max(1, h);
    const ctx = cv.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#4b8a3d");
    g.addColorStop(0.55, "#3f7a34");
    g.addColorStop(1, "#2f5f28");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const rnd = (n) => Math.floor(Math.random() * n);
    for (let i = 0; i < Math.floor(w * h / 900); i++) {
      const x = rnd(w), y = rnd(h);
      ctx.fillStyle = "rgba(0,0,0," + (0.03 + Math.random() * 0.06) + ")";
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + rnd(34), 5 + rnd(16), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < Math.floor(w * h / 420); i++) {
      const x = rnd(w), y = rnd(h);
      ctx.strokeStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() < 0.5 ? -2 : 2), y - 3 - rnd(3));
      ctx.stroke();
    }
    return cv;
  }
  function syncPlaygroundSize() {
    const w = Math.max(1, Math.round(el.playground.clientWidth));
    const h = Math.max(1, Math.round(el.playground.clientHeight));
    if (!w || !h) return;
    if (el.playground.width !== w || el.playground.height !== h) {
      el.playground.width = w;
      el.playground.height = h;
    }
    if (playground.grassW !== w || playground.grassH !== h) {
      playground.grass = pgBuildGrass(w, h);
      playground.grassW = w;
      playground.grassH = h;
    }
  }
  function pgUpdate(dt) {
    const w = el.playground.width;
    const h = el.playground.height;
    const scale = Number(el.pgSpeed.value) / 80;
    for (const e of playground.entities) {
      if (e.waiting > 0) {
        e.waiting -= dt;
        continue;
      }
      const dx = e.tx - e.x;
      const dy = e.ty - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 3) {
        e.waiting = 0.2 + Math.random() * 1.6;
        e.tx = 30 + Math.random() * Math.max(30, w - 60);
        e.ty = 50 + Math.random() * Math.max(40, h - 60);
        continue;
      }
      const step2 = e.speed * scale * dt;
      e.x += dx / dist * step2;
      e.y += dy / dist * step2;
      e.dir = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up";
      const n = e.sprite.frameCount(e.anim, e.dir) || 1;
      e.t += dt;
      e.frame = Math.floor(e.t * e.sprite.fps(e.anim)) % n;
    }
  }
  function pgDraw() {
    syncPlaygroundSize();
    const cv = el.playground;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    if (playground.grass) ctx.drawImage(playground.grass, 0, 0);
    else {
      ctx.fillStyle = "#3f7a34";
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
    const order = [...playground.entities].sort((a, b) => a.y - b.y);
    for (const e of order) {
      e.sprite.drawWithShadow(ctx, Math.round(e.x), Math.round(e.y), {
        anim: e.anim,
        dir: e.dir,
        frame: e.frame || 0
      });
    }
    if (!playground.entities.length) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "13px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Spawn a few creatures to see the exported sprite API in action", cv.width / 2, cv.height / 2);
      ctx.textAlign = "left";
    }
  }
  el.search.addEventListener("input", () => {
    state.search = el.search.value;
    renderBrowser();
  });
  el.animSelect.addEventListener("change", () => setAnim(el.animSelect.value));
  el.playBtn.addEventListener("click", () => {
    state.playing = !state.playing;
    el.playBtn.innerHTML = state.playing ? "&#10074;&#10074;" : "&#9654;";
  });
  el.dirSeg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) setDir(DIRECTIONS[Array.from(el.dirSeg.children).indexOf(b)]);
  });
  el.dpad.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dir]");
    if (b) setDir(b.dataset.dir);
  });
  el.frameRange.addEventListener("input", () => {
    state.playing = false;
    el.playBtn.innerHTML = "&#9654;";
    setFrame(Number(el.frameRange.value));
  });
  el.zoomRange.addEventListener("input", () => {
    state.scale = Number(el.zoomRange.value);
    buildPreview();
  });
  el.fitBtn.addEventListener("click", () => {
    fitZoom();
    buildPreview();
  });
  el.dirsToggle.addEventListener("change", () => {
    state.fourDir = el.dirsToggle.checked;
    saveSettings();
    buildPreview();
  });
  el.gridToggle.addEventListener("change", () => {
    state.grid = el.gridToggle.checked;
    saveSettings();
    drawPreview();
  });
  el.shadowToggle.addEventListener("change", () => {
    state.shadow = el.shadowToggle.checked;
    saveSettings();
    buildPreview();
  });
  el.bgSeg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-bg]");
    if (!b) return;
    state.bg = b.dataset.bg;
    saveSettings();
    syncControls();
  });
  el.stageTabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    state.tab = b.dataset.tab;
    saveSettings();
    syncControls();
    if (state.tab === "preview") buildPreview();
    if (state.tab === "sheet") renderSheetView();
    if (state.tab === "playground") {
      syncPlaygroundSize();
      pgDraw();
      pgSeed();
    }
  });
  el.randomBtn.addEventListener("click", () => {
    const c = catalog.creatures[Math.floor(Math.random() * catalog.creatures.length)];
    state.anim = "<random>";
    state.search = "";
    el.search.value = "";
    state.category = "all";
    state.favOnly = false;
    el.favBtn.classList.remove("on");
    selectCreature(c.id, c.variants[Math.floor(Math.random() * c.variants.length)].key);
    const anims = animationsFor(creature());
    setAnim(anims[Math.floor(Math.random() * anims.length)]);
    if (isDirectional(creature())) setDir(DIRECTIONS[Math.floor(Math.random() * 4)]);
    renderCatChips();
    renderBrowser();
    toast("Rolled the dice: " + creature().name);
  });
  el.favBtn.addEventListener("click", () => {
    state.favOnly = !state.favOnly;
    el.favBtn.classList.toggle("on", state.favOnly);
    renderCatChips();
    renderBrowser();
  });
  el.favStarBtn.addEventListener("click", () => {
    if (favourites.has(state.id)) favourites.delete(state.id);
    else favourites.add(state.id);
    saveFavourites();
    updateStarButton();
    const tile = el.browser.querySelector('.tile[data-id="' + CSS_escape(state.id) + '"] .fav');
    if (tile) tile.classList.toggle("on", favourites.has(state.id));
    if (state.favOnly) renderBrowser();
  });
  el.creditsBtn.addEventListener("click", openCreditsModal);
  el.exportBtn.addEventListener("click", openExportModal);
  el.shareBtn.addEventListener("click", openShareModal);
  el.resetBtn.addEventListener("click", () => {
    state.playing = true;
    el.playBtn.innerHTML = "&#10074;&#10074;";
    state.fourDir = false;
    state.grid = false;
    state.shadow = true;
    state.bg = "checker";
    state.search = "";
    el.search.value = "";
    state.category = "all";
    state.tag = null;
    state.favOnly = false;
    el.favBtn.classList.remove("on");
    saveSettings();
    selectCreature(state.id, null, { keepZoom: true, silent: true });
    renderCatChips();
    renderBrowser();
    updateInfo();
    toast("Reset view");
  });
  el.sheetDownloadBtn.addEventListener("click", async () => {
    const c = creature();
    const canvas = await renderAnimSheet(catalog, ref(), state.anim, { scale: state.sheetScale, ...catalogOptions });
    const name = c.id + "-" + state.anim + ".png";
    downloadBlob(await canvasToBlob(canvas), name);
    toast("Downloaded " + name);
  });
  el.pgSpawnBtn.addEventListener("click", () => pgAdd(state.id, state.variant));
  el.pgAddBtn.addEventListener("click", () => {
    const c = catalog.creatures[Math.floor(Math.random() * catalog.creatures.length)];
    pgAdd(c.id, c.variants[0].key);
  });
  el.pgClearBtn.addEventListener("click", pgClear);
  el.playground.addEventListener("click", (e) => {
    if (!playground.entities.length) return;
    const r = el.playground.getBoundingClientRect();
    playground.entities[playground.entities.length - 1].tx = e.clientX - r.left;
    playground.entities[playground.entities.length - 1].ty = e.clientY - r.top;
  });
  function onKey(e) {
    const t = e.target;
    const tag = t && t.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || t && t.isContentEditable) {
      if (!(tag === "INPUT" && t.type === "range")) return;
    }
    if (!el.modalBack.hidden && e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (isDirectional(creature())) {
        setDir(map[e.key]);
        e.preventDefault();
      }
      return;
    }
    if (e.key === " ") {
      state.playing = !state.playing;
      el.playBtn.innerHTML = state.playing ? "&#10074;&#10074;" : "&#9654;";
      e.preventDefault();
      return;
    }
    if (e.key === "[") step(-1);
    else if (e.key === "]") step(1);
    else if (e.key === "r" || e.key === "R") el.randomBtn.click();
  }
  function step(delta) {
    const list = filtered();
    if (!list.length) return;
    let i = list.findIndex((c) => c.id === state.id);
    if (i < 0) i = 0;
    i = (i + delta + list.length) % list.length;
    selectCreature(list[i].id, null);
  }
  document.addEventListener("keydown", onKey);
  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (destroyed) return;
      syncPlaygroundSize();
      if (state.tab === "preview") buildPreview();
      else if (state.tab === "sheet") renderSheetView();
    }, 150);
  }
  addEventListener("resize", onResize);
  let lastTs = 0;
  function loop(ts) {
    if (destroyed) return;
    raf = requestAnimationFrame(loop);
    const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1e3) : 0;
    lastTs = ts;
    if (state.tab === "preview") {
      const max = frameMax();
      if (state.playing && max > 0 && previewSprite) {
        acc += dt;
        const spf = 1 / (previewSprite.fps(state.anim) || 8);
        if (acc >= spf) {
          acc %= spf;
          setFrame(state.frame + 1);
        }
      }
    } else if (state.tab === "playground") {
      pgUpdate(dt);
      pgDraw();
    }
  }
  renderCatChips();
  const fromHash = readHash();
  const initial = fromHash || storedLast || { id: catalog.creatures[0].id, variant: null, anim: null, dir: null };
  if (Array.isArray(await store.get("recent"))) recent.push(...await store.get("recent"));
  selectCreature(initial.id, initial.variant, { silent: true });
  if (initial.anim && creature().anims[initial.anim]) setAnim(initial.anim, { silent: true });
  if (initial.dir) setDir(initial.dir);
  buildPreview();
  renderBrowser();
  syncControls();
  el.playBtn.innerHTML = "&#10074;&#10074;";
  el.pgCount.textContent = "0 on the field";
  if (state.tab === "sheet") renderSheetView();
  if (state.tab === "playground") {
    syncPlaygroundSize();
    pgSeed();
    pgDraw();
  }
  raf = requestAnimationFrame(loop);
  const controller = {
    root,
    shadow,
    mountEl: container,
    catalog,
    get state() {
      return Object.assign({}, state);
    },
    getSelection() {
      const c = creature();
      const v = variantOf(c, state.variant);
      return {
        id: c.id,
        variant: v.key,
        name: c.name,
        variantName: v.name,
        code: codeOf(),
        category: c.category,
        tags: (c.tags || []).slice(),
        anim: state.anim,
        dir: state.dir,
        frameSize: { w: c.fw, h: c.fh },
        ground: c.ground || null,
        packs: (c.packs || []).slice()
      };
    },
    getCreature: () => creature(),
    select: (id, variant) => selectCreature(id, variant),
    setAnim,
    setDir,
    setFrame,
    renderFrame: (o) => renderFrame(catalog, ref(), Object.assign({}, catalogOptions, o)),
    renderAnimSheet: (anim, o) => renderAnimSheet(catalog, ref(), anim || state.anim, Object.assign({}, catalogOptions, o)),
    renderFullSheet: (o) => renderSheet(catalog, ref(), Object.assign({}, catalogOptions, o)),
    manifest: (o) => sheetManifest(catalog, ref(), o || {}),
    createSprite: (o) => createSprite(catalog, ref(), Object.assign({}, catalogOptions, o)),
    openExport: openExportModal,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      playground.entities.length = 0;
      playground.sprites.clear();
      thumbCache.clear();
      clearCaches();
      try {
        shadow.innerHTML = "";
      } catch {
      }
    }
  };
  return controller;
}
async function open(opts = {}) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:#0b0e13;overflow:auto;";
  document.body.appendChild(host);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const controller = await mount(host, Object.assign({}, opts, { height: false }));
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
      use.textContent = "Use this creature";
      use.addEventListener("click", () => finish(controller.getSelection()));
      actions.appendChild(cancel);
      actions.appendChild(use);
    }
  });
}

// workspace:src/plugin.js
var catalogs = /* @__PURE__ */ new Map();
function getCatalog(opts = {}) {
  const url = opts.catalogUrl || DEFAULT_CATALOG_URL;
  if (!catalogs.has(url)) {
    const p = loadCatalog(opts);
    p.catch(() => catalogs.delete(url));
    catalogs.set(url, p);
  }
  return catalogs.get(url);
}
function clearCatalogCache() {
  catalogs.clear();
}
async function renderFrame2(creature, opts = {}) {
  return renderFrame(await getCatalog(opts), creature, opts);
}
async function renderAnimSheet2(creature, animKey, opts = {}) {
  return renderAnimSheet(await getCatalog(opts), creature, animKey, opts);
}
async function renderSheet2(creature, opts = {}) {
  return renderSheet(await getCatalog(opts), creature, opts);
}
async function sheetManifest2(creature, opts = {}, sheetInfo = {}) {
  return sheetManifest(await getCatalog(opts), creature, opts, sheetInfo);
}
async function createSprite2(creature, opts = {}) {
  return createSprite(await getCatalog(opts), creature, opts);
}
async function animationsFor2(creatureRef, opts = {}) {
  const catalog = await getCatalog(opts);
  const { creature } = findCreature(catalog, creatureRef);
  if (!creature) return [];
  return animationsFor(creature).map((key) => {
    const info = animInfo(creature, key);
    const def = info.def;
    const frames = info.dirless ? def.frames.length : Math.max(0, ...Object.values(def.dirs || {}).map((d) => (d.cols || []).length));
    return { id: key, name: def.name || key, frames, fps: info.fps, loop: info.loop, directional: !info.dirless };
  });
}
async function listCreatures(opts = {}) {
  const catalog = await getCatalog(opts);
  return catalog.creatures.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    tags: c.tags || [],
    variants: c.variants.map((v) => ({ key: v.key, name: v.name })),
    animations: Object.keys(c.anims),
    frameSize: { w: c.fw, h: c.fh },
    size: c.size || null
  }));
}
export {
  CSS,
  DEFAULT_CATALOG_URL,
  DIRECTIONS,
  DIR_ICON,
  DIR_LABEL,
  PLUGIN_VERSION,
  animFrameGrid,
  animInfo,
  animSheetRel,
  animationsFor2 as animationsFor,
  catalogStats,
  clearCaches,
  clearCatalogCache,
  createSprite2 as createSprite,
  creatureFromCode,
  creatureToCode,
  findCreature,
  frameCanvas,
  frameCount,
  getCatalog,
  isDirectional,
  listCreatures,
  loadBitmap,
  loadCatalog,
  mount as mountAnimalCreator,
  newCanvas,
  open as openAnimalCreator,
  renderAnimSheet2 as renderAnimSheet,
  renderFrame2 as renderFrame,
  renderSheet2 as renderSheet,
  scaleCanvas,
  shadowCount,
  shadowFrameCanvas,
  sheetManifest2 as sheetManifest,
  sheetUrl,
  variantOf
};

// LPC Animals & Monsters — core: catalog access, frame rendering, sprite
// building and game-ready sheet export. No UI, no framework dependencies.
//
// Data model (see src/lpc-creatures/catalog.json, built by src/tools/build-catalog.mjs):
//   creature   { id, name, category, tags, packs, fw, fh, zoom, size, dirs,
//                variants[], anims{}, shadow?, ground?, notes? }
//   variant    { key, name, sheet, shadow?, sheets? }
//   animation  { fps, loop, sheet? | sheetKey?, fw?, fh?,
//                dirs?{ up|left|down|right: {row, cols[]} } | frames?[[row,col]] }
//
// A direction-aware animation stores one row per canonical direction plus the
// list of live columns in that row; a `frames` animation is direction
// independent. Direction order in the *sheets* is recorded per creature in
// `dirs` as a readable row order (e.g. "down → left → right → up") for
// documentation only — it is already resolved away by the builder, so all
// output is always in canonical up, left, down, right order.

export const PLUGIN_VERSION = "1.0.0";

export const DEFAULT_CATALOG_URL =
  typeof __CATALOG_URL__ === "string"
    ? __CATALOG_URL__
    : new URL("./catalog.json", import.meta.url).href;

export const DIRECTIONS = ["up", "left", "down", "right"];
export const DIR_LABEL = { up: "Up", left: "Left", down: "Down", right: "Right" };
export const DIR_ICON = { up: "▲", left: "◀", down: "▼", right: "▶" };

const MAX_FRAME_CACHE = 900;

const bitmapCache = new Map();
const frameCache = new Map();

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

export function clearCaches() {
  bitmapCache.clear();
  frameCache.clear();
}

export async function loadBitmap(url) {
  const hit = bitmapCache.get(url);
  if (hit) return hit;
  const p = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " fetching " + url);
    const blob = await res.blob();
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(blob);
      } catch {}
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

export function newCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return c;
}

export function scaleCanvas(canvas, scale) {
  if (!canvas) return null;
  if (!scale || scale === 1) return canvas;
  const c = newCanvas(canvas.width * scale, canvas.height * scale);
  c.getContext("2d").drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}

// Sprite sheets come from a CDN, and with dozens of them loading at once an
// occasional request fails. One retry after a short pause keeps a stray network
// hiccup from turning into a missing animation.
async function loadBitmapRetry(url) {
  try {
    return await loadBitmap(url);
  } catch {}
  bitmapCache.delete(url);
  await new Promise((r) => setTimeout(r, 350));
  return loadBitmap(url);
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
export async function loadCatalog(opts = {}) {
  const url = opts.catalogUrl || DEFAULT_CATALOG_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status + " fetching catalog " + url);
  const catalog = await res.json();
  catalog.creatures = catalog.creatures || [];
  const byId = new Map();
  for (const c of catalog.creatures) byId.set(c.id, c);
  catalog.byId = byId;
  const byCategory = {};
  for (const c of catalog.creatures) (byCategory[c.category] = byCategory[c.category] || []).push(c);
  catalog.byCategory = byCategory;
  catalog.categoryOf = (key) => (catalog.categories || []).find((c) => c.key === key);
  catalog.allTags = [...new Set(catalog.creatures.flatMap((c) => c.tags || []))].sort();
  return catalog;
}

export function sheetUrl(catalog, rel, opts = {}) {
  if (opts.sheetBase) return opts.sheetBase.replace(/\/?$/, "/") + rel;
  return (catalog.sheets && catalog.sheets[rel]) || rel;
}

export function variantOf(creature, key) {
  if (!creature) return null;
  const variants = creature.variants || [];
  if (!key) return variants[0] || null;
  return variants.find((v) => v.key === key) || variants[0] || null;
}

export function findCreature(catalog, ref) {
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

// A creature is directional when at least one animation carries per-direction
// rows (projectiles and other single-view effects do not).
export function isDirectional(creature) {
  return Object.values(creature.anims || {}).some((a) => a.dirs);
}

export function animationsFor(creature) {
  return Object.keys(creature.anims || {});
}

export function animInfo(creature, animKey) {
  const a = (creature.anims || {})[animKey];
  if (!a) return null;
  const fw = a.fw || creature.fw;
  const fh = a.fh || creature.fh;
  return { key: animKey, def: a, fw, fh, fps: a.fps || 8, loop: a.loop !== false, dirless: !!a.frames };
}

// ---------------------------------------------------------------------------
// Frame access
// ---------------------------------------------------------------------------
export function frameCount(creature, animKey, dir = "down") {
  const info = animInfo(creature, animKey);
  if (!info) return 0;
  if (info.dirless) return info.def.frames.length;
  const d = info.def.dirs || {};
  const entry = d[dir] || d.down || d[Object.keys(d)[0]];
  return entry ? entry.cols.length : 0;
}

export function animSheetRel(creature, animKey, variant) {
  const info = animInfo(creature, animKey);
  if (!info) return variant.sheet;
  if (info.def.sheetKey && variant.sheets && variant.sheets[info.def.sheetKey]) {
    return variant.sheets[info.def.sheetKey];
  }
  return info.def.sheet || variant.sheet;
}

export function animFrameGrid(creature, animKey, dir, index) {
  const info = animInfo(creature, animKey);
  if (!info) return null;
  if (info.dirless) {
    const n = info.def.frames.length;
    const [row, col] = info.def.frames[((index % n) + n) % n];
    return { row, col, count: n, index: ((index % n) + n) % n };
  }
  const d = info.def.dirs || {};
  const entry = d[dir] || d.down || d[Object.keys(d)[0]];
  if (!entry) return null;
  const n = entry.cols.length;
  const i = ((index % n) + n) % n;
  return { row: entry.row, col: entry.cols[i], count: n, index: i };
}

// Draw one animation frame into a fresh canvas of that animation's frame size.
export async function frameCanvas(catalog, creature, animKey, variantKey, dir, index, opts = {}) {
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
    pos.col * info.fw, pos.row * info.fh, info.fw, info.fh,
    0, 0, info.fw, info.fh,
  );
  putFrame(key, canvas);
  return canvas;
}

export async function shadowFrameCanvas(catalog, creature, variantKey, dir, index, opts = {}) {
  if (!creature.shadow) return null;
  const variant = variantOf(creature, variantKey);
  const rel = variant && variant.shadow;
  if (!rel) return null;
  const entry = creature.shadow.dirs[dir] || creature.shadow.dirs.down;
  if (!entry) return null;
  const n = entry.cols.length;
  const col = entry.cols[(((index % n) + n) % n)];
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
    col * creature.shadow.fw, entry.row * creature.shadow.fh,
    creature.shadow.fw, creature.shadow.fh,
    0, 0, creature.shadow.fw, creature.shadow.fh,
  );
  putFrame(key, canvas);
  return canvas;
}

export function shadowCount(creature, dir) {
  if (!creature.shadow) return 0;
  const entry = creature.shadow.dirs[dir] || creature.shadow.dirs.down;
  return entry ? entry.cols.length : 0;
}

// ---------------------------------------------------------------------------
// Public single-frame / sheet renderers
// ---------------------------------------------------------------------------
export async function renderFrame(catalog, creatureRef, opts = {}) {
  const { creature, variantKey } = findCreature(catalog, creatureRef);
  if (!creature) throw new Error("Unknown creature: " + creatureRef);
  const anim = opts.anim || (creature.anims.idle ? "idle" : animationsFor(creature)[0]);
  const dir = opts.dir || "down";
  const canvas = await frameCanvas(catalog, creature, anim, variantKey, dir, opts.frame || 0, opts);
  if (!canvas) throw new Error("No frame for " + creature.id + "/" + anim);
  return scaleCanvas(canvas, opts.scale || 1);
}

// Canonical four-row sheet for one animation: rows are up,left,down,right.
export async function renderAnimSheet(catalog, creatureRef, animKey, opts = {}) {
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

// Uniform-cell sheet holding every animation, four direction rows per block.
// Frames are centred in the cell so a single anchor works for every cell, and
// the idle block sits first so the manifest's pivot applies to it directly.
export async function renderSheet(catalog, creatureRef, opts = {}) {
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
      loop: info.loop,
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

export function sheetManifest(catalog, creatureRef, opts = {}, sheetInfo = {}) {
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
    cellW, cellH,
    cols: sheetInfo.cols || 0,
    rows: sheetInfo.rows || 0,
    dirOrder: DIRECTIONS.slice(),
    blocks: sheetInfo.blocks || {},
    shadowRows: sheetInfo.shadow ? DIRECTIONS.length : 0,
    pivot: {
      x: Math.round(cellW / 2),
      y: Math.round((cellH - creature.fh) / 2 + ground.y),
    },
    tags: creature.tags || [],
    category: creature.category,
    credits: packs.map((p) => ({ name: p.name, authors: p.authors, license: p.license, url: p.url, extraUrls: p.extraUrls })),
  };
}

// ---------------------------------------------------------------------------
// Sprite: pre-rendered frames plus a draw() helper, for game code.
// ---------------------------------------------------------------------------
export async function createSprite(catalog, creatureRef, opts = {}) {
  const { creature, variantKey } = findCreature(catalog, creatureRef);
  if (!creature) throw new Error("Unknown creature: " + creatureRef);
  const variant = variantOf(creature, variantKey);
  const scale = opts.scale || 1;
  const animKeys = (opts.anims || animationsFor(creature)).filter((k) => creature.anims[k]);
  const dirs = opts.directions || DIRECTIONS;
  const withShadow = opts.shadow !== false && !!creature.shadow && !!variant.shadow;
  // Every frame canvas is treated as concentric with the creature's base frame
  // (measured: when an animation ships on a larger canvas the ink sits at
  // (larger - base) / 2, i.e. the frames are centre-aligned), so the ground line
  // always lands on the same pixel once the canvas padding is accounted for.
  // `scale` bakes into the pre-rendered frames; `baseScale` recovers the
  // unscaled geometry no matter what runtime scale draw() is called with.
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
      return list[((index % list.length) + list.length) % list.length];
    },
    getShadow(dir = "down", index = 0) {
      const list = shadows[dir];
      if (!list || !list.length) return null;
      return list[((index % list.length) + list.length) % list.length];
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
    },
  };
  return sprite;
}

// ---------------------------------------------------------------------------
// Share codes
// ---------------------------------------------------------------------------
export function creatureToCode(creatureRef) {
  if (typeof creatureRef === "string") return creatureRef;
  if (!creatureRef || !creatureRef.id) return "";
  return creatureRef.variant ? creatureRef.id + "~" + creatureRef.variant : creatureRef.id;
}

export function creatureFromCode(code) {
  if (!code) return null;
  const [id, variant] = String(code).split(/[~:]/);
  if (!id) return null;
  return { id, variant: variant || null };
}

export function catalogStats(catalog) {
  return {
    creatures: catalog.creatures.length,
    variants: catalog.creatures.reduce((a, c) => a + c.variants.length, 0),
    animations: catalog.creatures.reduce((a, c) => a + Object.keys(c.anims).length, 0),
    frames: catalog.creatures.reduce(
      (a, c) => a + Object.entries(c.anims).reduce((b, [, anim]) => {
        if (anim.frames) return b + anim.frames.length;
        return b + Object.values(anim.dirs || {}).reduce((n, d) => n + d.cols.length, 0);
      }, 0),
      0,
    ),
    sheets: Object.keys(catalog.sheets || {}).length,
  };
}

// LPC Animals & Monsters — plugin entry point.
//
// This is the file the published bundle is built from (see src/BUILD.md). It is
// the API game code talks to: unlike core.js you never pass the catalog around,
// because these functions load it once and cache it.
//
//   const creator = root.lpcAnimals;          // from main.pjs (the import yields
//                                             // this object directly)
//   await creator.init();
//   const sprite = await creator.createSprite("bear~polar", { scale: 1 });
//   sprite.drawWithShadow(ctx, x, y, { anim: "walk", dir: "down", frame: 3 });
//
// Every function also accepts { catalogUrl } to point at a different catalog.

import * as core from "./lpc-creatures/core.js";

export {
  PLUGIN_VERSION,
  DEFAULT_CATALOG_URL,
  DIRECTIONS,
  DIR_LABEL,
  DIR_ICON,
  loadCatalog,
  loadBitmap,
  newCanvas,
  scaleCanvas,
  clearCaches,
  sheetUrl,
  variantOf,
  findCreature,
  isDirectional,
  animInfo,
  frameCount,
  animSheetRel,
  animFrameGrid,
  frameCanvas,
  shadowFrameCanvas,
  shadowCount,
  creatureToCode,
  creatureFromCode,
  catalogStats,
} from "./lpc-creatures/core.js";

export { CSS } from "./lpc-creatures/styles.js";
export { mount as mountAnimalCreator, open as openAnimalCreator } from "./lpc-creatures/app.js";

const catalogs = new Map();

/** The catalog (all creatures, packs, sheet URLs), loaded once per URL. */
export function getCatalog(opts = {}) {
  const url = opts.catalogUrl || core.DEFAULT_CATALOG_URL;
  if (!catalogs.has(url)) {
    const p = core.loadCatalog(opts);
    p.catch(() => catalogs.delete(url));
    catalogs.set(url, p);
  }
  return catalogs.get(url);
}

/** Forget the cached catalog (handy after deploying a new one). */
export function clearCatalogCache() {
  catalogs.clear();
}

export async function renderFrame(creature, opts = {}) {
  return core.renderFrame(await getCatalog(opts), creature, opts);
}

export async function renderAnimSheet(creature, animKey, opts = {}) {
  return core.renderAnimSheet(await getCatalog(opts), creature, animKey, opts);
}

export async function renderSheet(creature, opts = {}) {
  return core.renderSheet(await getCatalog(opts), creature, opts);
}

export async function sheetManifest(creature, opts = {}, sheetInfo = {}) {
  return core.sheetManifest(await getCatalog(opts), creature, opts, sheetInfo);
}

export async function createSprite(creature, opts = {}) {
  return core.createSprite(await getCatalog(opts), creature, opts);
}

/** Animation descriptors for a creature (id, name, frames, fps, loop). */
export async function animationsFor(creatureRef, opts = {}) {
  const catalog = await getCatalog(opts);
  const { creature } = core.findCreature(catalog, creatureRef);
  if (!creature) return [];
  return core.animationsFor(creature).map((key) => {
    const info = core.animInfo(creature, key);
    const def = info.def;
    const frames = info.dirless
      ? def.frames.length
      : Math.max(0, ...Object.values(def.dirs || {}).map((d) => (d.cols || []).length));
    return { id: key, name: def.name || key, frames, fps: info.fps, loop: info.loop, directional: !info.dirless };
  });
}

/** Every creature id/name, for building spawn tables. */
export async function listCreatures(opts = {}) {
  const catalog = await getCatalog(opts);
  return catalog.creatures.map((c) => ({
    id: c.id, name: c.name, category: c.category, tags: c.tags || [],
    variants: c.variants.map((v) => ({ key: v.key, name: v.name })),
    animations: Object.keys(c.anims),
    frameSize: { w: c.fw, h: c.fh },
    size: c.size || null,
  }));
}

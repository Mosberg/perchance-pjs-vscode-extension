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

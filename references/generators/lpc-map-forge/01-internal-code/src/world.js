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

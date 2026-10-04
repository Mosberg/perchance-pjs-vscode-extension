// ws:src/engine.js
var COMMIT = "553ba7562534cbf32e7d9a502660f569d6b26512";
var CDN = "https://cdn.jsdelivr.net/gh/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator@" + COMMIT + "/";
var FRAME = 64;
var BODY_TYPES = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "teen", label: "Teen" },
  { key: "muscular", label: "Muscular" },
  { key: "pregnant", label: "Pregnant" },
  { key: "child", label: "Child" }
];
var DIR_ROWS = { up: 0, left: 1, down: 2, right: 3 };
var DIRECTIONS = [
  { key: "up", label: "Up" },
  { key: "left", label: "Left" },
  { key: "down", label: "Down" },
  { key: "right", label: "Right" }
];
var ANIMS = [
  { key: "walk", label: "Walk", cycle: [1, 2, 3, 4, 5, 6, 7, 8] },
  { key: "idle", label: "Idle", cycle: [0, 0, 1] },
  { key: "run", label: "Run", cycle: [0, 1, 2, 3, 4, 5, 6, 7] },
  { key: "slash", label: "Slash", cycle: [0, 1, 2, 3, 4, 5] },
  {
    key: "thrust",
    label: "Thrust",
    support: ["thrust", "watering"],
    cycle: [0, 1, 2, 3, 4, 5, 6, 7]
  },
  { key: "spellcast", label: "Spellcast", cycle: [0, 1, 2, 3, 4, 5, 6] },
  {
    key: "shoot",
    label: "Shoot",
    cycle: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  { key: "hurt", label: "Hurt", cycle: [0, 1, 2, 3, 4, 5] },
  { key: "climb", label: "Climb", cycle: [0, 1, 2, 3, 4, 5] },
  { key: "jump", label: "Jump", cycle: [0, 1, 2, 3, 4, 1] },
  {
    key: "sit",
    label: "Sit",
    cycle: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2]
  },
  {
    key: "emote",
    label: "Emote",
    cycle: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2]
  },
  // The watering can/shovel/hoe use the `thrust` row with a different cycle.
  {
    key: "watering",
    label: "Watering",
    folder: "thrust",
    support: ["thrust", "watering"],
    cycle: [0, 1, 4, 4, 4, 4, 5]
  },
  {
    key: "combat",
    label: "Combat",
    folder: "combat_idle",
    support: ["combat"],
    cycle: [0, 0, 1]
  },
  {
    key: "1h_slash",
    label: "1H Slash",
    folder: "backslash",
    support: ["1h_slash", "1h_backslash"],
    cycle: [0, 1, 2, 3, 4, 5, 6]
  },
  {
    key: "1h_backslash",
    label: "1H Backslash",
    folder: "backslash",
    support: ["1h_slash", "1h_backslash"],
    cycle: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]
  },
  {
    key: "1h_halfslash",
    label: "1H Halfslash",
    folder: "halfslash",
    support: ["1h_halfslash"],
    cycle: [0, 1, 2, 3, 4, 5]
  }
];
var ANIMS_BY_KEY = Object.fromEntries(ANIMS.map((a) => [a.key, a]));
var SHEET_OFFSETS = {
  spellcast: 0,
  thrust: 4 * FRAME,
  walk: 8 * FRAME,
  slash: 12 * FRAME,
  shoot: 16 * FRAME,
  hurt: 20 * FRAME,
  climb: 21 * FRAME,
  idle: 22 * FRAME,
  jump: 26 * FRAME,
  sit: 30 * FRAME,
  emote: 34 * FRAME,
  run: 38 * FRAME,
  combat_idle: 42 * FRAME,
  backslash: 46 * FRAME,
  halfslash: 50 * FRAME
};
var SHEET_WIDTH = 13 * FRAME;
var SHEET_HEIGHT = 54 * FRAME;
var DIR_KEY_ROWS = { n: 0, w: 1, s: 2, e: 3 };
var CUSTOM_ANIMATIONS = {
  wheelchair: {
    frameSize: 64,
    frames: [
      ["sit-n,2", "sit-n,2"],
      ["sit-w,2", "sit-w,2"],
      ["sit-s,2", "sit-s,2"],
      ["sit-e,2", "sit-e,2"]
    ]
  },
  tool_rod: {
    frameSize: 128,
    frames: [
      [
        "thrust-n,0",
        "thrust-n,1",
        "thrust-n,2",
        "thrust-n,3",
        "thrust-n,4",
        "thrust-n,5",
        "thrust-n,4",
        "thrust-n,4",
        "thrust-n,4",
        "thrust-n,5",
        "thrust-n,4",
        "thrust-n,2",
        "thrust-n,3"
      ],
      [
        "thrust-w,0",
        "thrust-w,1",
        "thrust-w,2",
        "thrust-w,3",
        "thrust-w,4",
        "thrust-w,5",
        "thrust-w,4",
        "thrust-w,4",
        "thrust-w,4",
        "thrust-w,5",
        "thrust-w,4",
        "thrust-w,2",
        "thrust-w,3"
      ],
      [
        "thrust-s,0",
        "thrust-s,1",
        "thrust-s,2",
        "thrust-s,3",
        "thrust-s,4",
        "thrust-s,5",
        "thrust-s,4",
        "thrust-s,4",
        "thrust-s,4",
        "thrust-s,5",
        "thrust-s,4",
        "thrust-s,2",
        "thrust-s,3"
      ],
      [
        "thrust-e,0",
        "thrust-e,1",
        "thrust-e,2",
        "thrust-e,3",
        "thrust-e,4",
        "thrust-e,5",
        "thrust-e,4",
        "thrust-e,4",
        "thrust-e,4",
        "thrust-e,5",
        "thrust-e,4",
        "thrust-e,2",
        "thrust-e,3"
      ]
    ]
  },
  slash_128: {
    frameSize: 128,
    frames: [
      [
        "slash-n,0",
        "slash-n,1",
        "slash-n,2",
        "slash-n,3",
        "slash-n,4",
        "slash-n,5"
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,2",
        "slash-w,3",
        "slash-w,4",
        "slash-w,5"
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,2",
        "slash-s,3",
        "slash-s,4",
        "slash-s,5"
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,2",
        "slash-e,3",
        "slash-e,4",
        "slash-e,5"
      ]
    ]
  },
  backslash_128: {
    frameSize: 128,
    frames: [
      [
        "backslash-n,0",
        "backslash-n,1",
        "backslash-n,2",
        "backslash-n,3",
        "backslash-n,4",
        "backslash-n,5",
        "backslash-n,6",
        "backslash-n,7",
        "backslash-n,8",
        "backslash-n,9",
        "backslash-n,10",
        "backslash-n,11",
        "backslash-n,12"
      ],
      [
        "backslash-w,0",
        "backslash-w,1",
        "backslash-w,2",
        "backslash-w,3",
        "backslash-w,4",
        "backslash-w,5",
        "backslash-w,6",
        "backslash-w,7",
        "backslash-w,8",
        "backslash-w,9",
        "backslash-w,10",
        "backslash-w,11",
        "backslash-w,12"
      ],
      [
        "backslash-s,0",
        "backslash-s,1",
        "backslash-s,2",
        "backslash-s,3",
        "backslash-s,4",
        "backslash-s,5",
        "backslash-s,6",
        "backslash-s,7",
        "backslash-s,8",
        "backslash-s,9",
        "backslash-s,10",
        "backslash-s,11",
        "backslash-s,12"
      ],
      [
        "backslash-e,0",
        "backslash-e,1",
        "backslash-e,2",
        "backslash-e,3",
        "backslash-e,4",
        "backslash-e,5",
        "backslash-e,6",
        "backslash-e,7",
        "backslash-e,8",
        "backslash-e,9",
        "backslash-e,10",
        "backslash-e,11",
        "backslash-e,12"
      ]
    ]
  },
  halfslash_128: {
    frameSize: 128,
    frames: [
      [
        "halfslash-n,0",
        "halfslash-n,1",
        "halfslash-n,2",
        "halfslash-n,3",
        "halfslash-n,4",
        "halfslash-n,5"
      ],
      [
        "halfslash-w,0",
        "halfslash-w,1",
        "halfslash-w,2",
        "halfslash-w,3",
        "halfslash-w,4",
        "halfslash-w,5"
      ],
      [
        "halfslash-s,0",
        "halfslash-s,1",
        "halfslash-s,2",
        "halfslash-s,3",
        "halfslash-s,4",
        "halfslash-s,5"
      ],
      [
        "halfslash-e,0",
        "halfslash-e,1",
        "halfslash-e,2",
        "halfslash-e,3",
        "halfslash-e,4",
        "halfslash-e,5"
      ]
    ]
  },
  thrust_oversize: {
    frameSize: 192,
    frames: [
      [
        "thrust-n,0",
        "thrust-n,1",
        "thrust-n,2",
        "thrust-n,3",
        "thrust-n,4",
        "thrust-n,5",
        "thrust-n,6",
        "thrust-n,7"
      ],
      [
        "thrust-w,0",
        "thrust-w,1",
        "thrust-w,2",
        "thrust-w,3",
        "thrust-w,4",
        "thrust-w,5",
        "thrust-w,6",
        "thrust-w,7"
      ],
      [
        "thrust-s,0",
        "thrust-s,1",
        "thrust-s,2",
        "thrust-s,3",
        "thrust-s,4",
        "thrust-s,5",
        "thrust-s,6",
        "thrust-s,7"
      ],
      [
        "thrust-e,0",
        "thrust-e,1",
        "thrust-e,2",
        "thrust-e,3",
        "thrust-e,4",
        "thrust-e,5",
        "thrust-e,6",
        "thrust-e,7"
      ]
    ]
  },
  slash_oversize: {
    frameSize: 192,
    frames: [
      [
        "slash-n,0",
        "slash-n,1",
        "slash-n,2",
        "slash-n,3",
        "slash-n,4",
        "slash-n,5"
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,2",
        "slash-w,3",
        "slash-w,4",
        "slash-w,5"
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,2",
        "slash-s,3",
        "slash-s,4",
        "slash-s,5"
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,2",
        "slash-e,3",
        "slash-e,4",
        "slash-e,5"
      ]
    ]
  },
  walk_128: {
    skipFirstFrameInPreview: true,
    frameSize: 128,
    frames: [
      [
        "walk-n,0",
        "walk-n,1",
        "walk-n,2",
        "walk-n,3",
        "walk-n,4",
        "walk-n,5",
        "walk-n,6",
        "walk-n,7",
        "walk-n,8"
      ],
      [
        "walk-w,0",
        "walk-w,1",
        "walk-w,2",
        "walk-w,3",
        "walk-w,4",
        "walk-w,5",
        "walk-w,6",
        "walk-w,7",
        "walk-w,8"
      ],
      [
        "walk-s,0",
        "walk-s,1",
        "walk-s,2",
        "walk-s,3",
        "walk-s,4",
        "walk-s,5",
        "walk-s,6",
        "walk-s,7",
        "walk-s,8"
      ],
      [
        "walk-e,0",
        "walk-e,1",
        "walk-e,2",
        "walk-e,3",
        "walk-e,4",
        "walk-e,5",
        "walk-e,6",
        "walk-e,7",
        "walk-e,8"
      ]
    ]
  },
  thrust_128: {
    frameSize: 128,
    frames: [
      [
        "thrust-n,0",
        "thrust-n,1",
        "thrust-n,2",
        "thrust-n,3",
        "thrust-n,4",
        "thrust-n,5",
        "thrust-n,6",
        "thrust-n,7"
      ],
      [
        "thrust-w,0",
        "thrust-w,1",
        "thrust-w,2",
        "thrust-w,3",
        "thrust-w,4",
        "thrust-w,5",
        "thrust-w,6",
        "thrust-w,7"
      ],
      [
        "thrust-s,0",
        "thrust-s,1",
        "thrust-s,2",
        "thrust-s,3",
        "thrust-s,4",
        "thrust-s,5",
        "thrust-s,6",
        "thrust-s,7"
      ],
      [
        "thrust-e,0",
        "thrust-e,1",
        "thrust-e,2",
        "thrust-e,3",
        "thrust-e,4",
        "thrust-e,5",
        "thrust-e,6",
        "thrust-e,7"
      ]
    ]
  },
  slash_reverse_oversize: {
    frameSize: 192,
    frames: [
      [
        "slash-n,5",
        "slash-n,4",
        "slash-n,3",
        "slash-n,2",
        "slash-n,1",
        "slash-n,0"
      ],
      [
        "slash-w,5",
        "slash-w,4",
        "slash-w,3",
        "slash-w,2",
        "slash-w,1",
        "slash-w,0"
      ],
      [
        "slash-s,5",
        "slash-s,4",
        "slash-s,3",
        "slash-s,2",
        "slash-s,1",
        "slash-s,0"
      ],
      [
        "slash-e,5",
        "slash-e,4",
        "slash-e,3",
        "slash-e,2",
        "slash-e,1",
        "slash-e,0"
      ]
    ]
  },
  whip_oversize: {
    frameSize: 192,
    frames: [
      [
        "slash-n,0",
        "slash-n,1",
        "slash-n,4",
        "slash-n,5",
        "slash-n,3",
        "slash-n,2",
        "slash-n,2",
        "slash-n,1"
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,5",
        "slash-w,4",
        "slash-w,3",
        "slash-w,3",
        "slash-w,3",
        "slash-w,2"
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,5",
        "slash-s,4",
        "slash-s,3",
        "slash-s,3",
        "slash-s,2",
        "slash-w,1"
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,5",
        "slash-e,4",
        "slash-e,3",
        "slash-e,3",
        "slash-e,3",
        "slash-e,2"
      ]
    ]
  },
  tool_whip: {
    frameSize: 192,
    frames: [
      [
        "slash-n,0",
        "slash-n,1",
        "slash-n,4",
        "slash-n,5",
        "slash-n,3",
        "slash-n,2",
        "slash-n,2",
        "slash-n,1"
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,5",
        "slash-w,4",
        "slash-w,3",
        "slash-w,3",
        "slash-w,3",
        "slash-w,2"
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,5",
        "slash-s,4",
        "slash-s,3",
        "slash-s,3",
        "slash-s,2",
        "slash-s,1"
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,5",
        "slash-e,4",
        "slash-e,3",
        "slash-e,3",
        "slash-e,3",
        "slash-e,2"
      ]
    ]
  },
  tool_axe: {
    frameSize: 128,
    sourceSingleAnimation: true,
    frames: [
      [
        "slash-n,5",
        "slash-n,5",
        "slash-n,4",
        "slash-n,4",
        "slash-n,3",
        "slash-n,1",
        "slash-n,0",
        "slash-n,0",
        "slash-n,0",
        "slash-n,0"
      ],
      [
        "slash-w,5",
        "slash-w,5",
        "slash-w,4",
        "slash-w,4",
        "slash-w,3",
        "slash-w,1",
        "slash-w,0",
        "slash-w,0",
        "slash-w,0",
        "slash-w,0"
      ],
      [
        "slash-s,5",
        "slash-s,5",
        "slash-s,4",
        "slash-s,4",
        "slash-s,3",
        "slash-s,1",
        "slash-s,0",
        "slash-s,0",
        "slash-s,0",
        "slash-s,0"
      ],
      [
        "slash-e,5",
        "slash-e,5",
        "slash-e,4",
        "slash-e,4",
        "slash-e,3",
        "slash-e,1",
        "slash-e,0",
        "slash-e,0",
        "slash-e,0",
        "slash-e,0"
      ]
    ]
  },
  tool_hammer: {
    frameSize: 128,
    sourceSingleAnimation: true,
    frames: [
      [
        "slash-n,5",
        "slash-n,5",
        "slash-n,4",
        "slash-n,4",
        "slash-n,1",
        "slash-n,0",
        "slash-n,0",
        "slash-n,0",
        "slash-n,0"
      ],
      [
        "slash-w,5",
        "slash-w,5",
        "slash-w,4",
        "slash-w,4",
        "slash-w,1",
        "slash-w,0",
        "slash-w,0",
        "slash-w,0",
        "slash-w,0"
      ],
      [
        "slash-s,5",
        "slash-s,5",
        "slash-s,4",
        "slash-s,4",
        "slash-s,1",
        "slash-s,0",
        "slash-s,0",
        "slash-s,0",
        "slash-s,0"
      ],
      [
        "slash-e,5",
        "slash-e,5",
        "slash-e,4",
        "slash-e,4",
        "slash-e,1",
        "slash-e,0",
        "slash-e,0",
        "slash-e,0",
        "slash-e,0"
      ]
    ]
  }
};
var CUSTOM_ANIM_LABELS = {
  slash_oversize: "Slash (oversize)",
  thrust_oversize: "Thrust (oversize)",
  slash_reverse_oversize: "Reverse slash (oversize)",
  slash_128: "Slash (128)",
  backslash_128: "Backslash (128)",
  halfslash_128: "Halfslash (128)",
  thrust_128: "Thrust (128)",
  whip_oversize: "Whip (oversize)",
  tool_axe: "Axe swing",
  tool_hammer: "Hammer swing",
  tool_whip: "Whip",
  tool_rod: "Fishing rod",
  walk_128: "Walk (128)",
  wheelchair: "Wheelchair"
};
function customAnimationBase(def) {
  return def.frames[0][0].split(",")[0].split("-")[0];
}
var CUSTOM_ANIM_ORDER = [
  "slash_oversize",
  "thrust_oversize",
  "slash_reverse_oversize",
  "slash_128",
  "backslash_128",
  "halfslash_128",
  "thrust_128",
  "whip_oversize",
  "tool_axe",
  "tool_hammer",
  "tool_whip",
  "tool_rod",
  "walk_128",
  "wheelchair"
];
var CUSTOM_ANIMS = CUSTOM_ANIM_ORDER.filter((k) => CUSTOM_ANIMATIONS[k]).map((key) => ({
  key,
  def: CUSTOM_ANIMATIONS[key],
  base: customAnimationBase(CUSTOM_ANIMATIONS[key])
}));
var CUSTOM_ANIMS_BY_KEY = Object.fromEntries(CUSTOM_ANIMS.map((a) => [a.key, a]));
function animMeta(key) {
  const std = ANIMS_BY_KEY[key];
  if (std) {
    return { key, label: std.label, custom: false, folder: std.folder || key, cycle: std.cycle, frameCount: std.cycle.length, frameSize: FRAME };
  }
  const cust = CUSTOM_ANIMS_BY_KEY[key];
  if (cust) {
    return { key, label: CUSTOM_ANIM_LABELS[key] || key, custom: true, def: cust.def, base: cust.base, frameCount: cust.def.frames[0].length, frameSize: cust.def.frameSize };
  }
  return null;
}
function frameSizeFor(key) {
  const m = animMeta(key);
  return m ? m.frameSize : FRAME;
}
function frameIndicesFor(key) {
  const m = animMeta(key);
  if (!m) return [0];
  return Array.from({ length: m.frameCount }, (_, i) => i);
}
async function loadCatalog(url = "src/data/catalog.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load catalog: " + res.status);
  return res.json();
}
function buildIndexes(cat) {
  const byType = {};
  const nameIndex = {};
  for (const [id, item] of Object.entries(cat.items)) {
    (byType[item.t] || (byType[item.t] = [])).push(id);
    const idx = nameIndex[item.t] || (nameIndex[item.t] = {});
    const key = normName(item.n);
    if (!(key in idx)) idx[key] = id;
    if (!(id in idx)) idx[id] = id;
  }
  for (const list of Object.values(byType)) {
    list.sort((a, b) => cat.items[a].n.localeCompare(cat.items[b].n));
  }
  return { byType, nameIndex };
}
function normName(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function variantToFilename(v) {
  return String(v).replace(/ /g, "_");
}
function supportsBodyType(item, bodyType) {
  return Array.isArray(item.req) && item.req.includes(bodyType);
}
function animSupportNames(animKey) {
  const anim = ANIMS_BY_KEY[animKey];
  return anim && anim.support ? anim.support : [animKey];
}
function supportsAnim(item, animKey) {
  if (!item.a || !item.a.length) return false;
  const names = animSupportNames(animKey);
  return names.some((n) => item.a.includes(n));
}
function colorSlots(item) {
  return (item.r || []).map((entry, idx) => ({
    idx,
    entry,
    group: entry.t || (entry.m === "body" ? "body" : item.t),
    label: entry.lb || entry.t || "Color"
  }));
}
function defaultKey(entry) {
  if (entry.s) return "source";
  const b = entry.b || "";
  const parts = b.split(".");
  return parts.length > 1 ? parts.slice(1).join(".") : b;
}
function parseColorKey(cat, entry, key) {
  if (key === "source") return { material: entry.m, version: "custom", color: "source" };
  const [color, p1, p2] = String(key).split(".").reverse();
  let material = p2;
  let version = p1;
  if (!material && version && cat.materials[version]) {
    material = version;
    version = void 0;
  }
  if (!material) material = entry.m;
  if (!version) version = entry.d;
  return { material, version, color };
}
function resolvePalette(cat, entry, key) {
  if (key === "source") return entry.s || null;
  const { material, version, color } = parseColorKey(cat, entry, key);
  const pal = cat.materials[material] && cat.materials[material].palettes[version];
  return pal && pal[color] || null;
}
function sourcePalette(cat, entry) {
  if (entry.s) return entry.s;
  const [v, c] = String(entry.b || "").split(".");
  const pal = cat.materials[entry.m] && cat.materials[entry.m].palettes[v];
  return pal && pal[c] || null;
}
function keyLabel(cat, entry, key) {
  if (key === "source") return "Custom";
  const { version, color } = parseColorKey(cat, entry, key);
  const ver = cat.paletteVersions && cat.paletteVersions[version];
  const short = ver ? ver.label : version;
  const name = color.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  return version === entry.d ? name : name + " \xB7 " + short;
}
function colorOptions(cat, entry) {
  const out = [];
  if (entry.s) out.push({ key: "source", colors: entry.s, label: "Custom" });
  const list = entry.var === void 0 ? [] : cat.varPool[entry.var] || [];
  for (const key of list) {
    const colors = resolvePalette(cat, entry, key);
    if (colors) out.push({ key, colors, label: keyLabel(cat, entry, key) });
  }
  return out;
}
function variantSwatch(cat, name) {
  const needle = String(name).toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
  const order = [
    ["hair", ["ulpc", "lpcr"]],
    ["body", ["ulpc", "lpcr"]],
    ["cloth", ["ulpc"]],
    ["metal", ["ulpc"]],
    ["wood", ["ulpc", "lpcr"]],
    ["all", ["lpcr"]]
  ];
  for (const [mat, vers] of order) {
    const m = cat.materials[mat];
    if (!m) continue;
    for (const ver of vers) {
      const pal = m.palettes[ver];
      if (pal && pal[needle]) return pal[needle];
    }
  }
  return null;
}
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}
function buildLookup(pairs) {
  const map = /* @__PURE__ */ new Map();
  for (const { source, target } of pairs) {
    const n = Math.min(source.length, target.length);
    for (let i = 0; i < n; i++) {
      const s = hexToRgb(source[i]);
      const t = hexToRgb(target[i]);
      if (!s || !t) continue;
      const packed = t.r << 16 | t.g << 8 | t.b;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dg = -1; dg <= 1; dg++) {
          for (let db = -1; db <= 1; db++) {
            const r = s.r + dr;
            const g = s.g + dg;
            const b = s.b + db;
            if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) continue;
            const k = r << 16 | g << 8 | b;
            if (!map.has(k)) map.set(k, packed);
          }
        }
      }
    }
  }
  return map;
}
function itemLookup(cat, item, colors) {
  const pairs = [];
  for (const slot of colorSlots(item)) {
    const key = colors[slot.group];
    if (!key || key === defaultKey(slot.entry)) continue;
    const src = sourcePalette(cat, slot.entry);
    const tgt = resolvePalette(cat, slot.entry, key);
    if (src && tgt) pairs.push({ source: src, target: tgt });
  }
  if (!pairs.length) return null;
  return buildLookup(pairs);
}
function colorSignature(item, colors) {
  return colorSlots(item).map((s) => s.group + "=" + (colors[s.group] || defaultKey(s.entry))).join(",");
}
function replaceInPath(item, base, selections, cat) {
  let ok = true;
  const out = base.replace(/\$\{(.*?)\}/g, (m, typeName) => {
    const map = item.rip && item.rip[typeName];
    const sel = selections[typeName];
    if (!map || !sel) {
      ok = false;
      return m;
    }
    const picked = cat.items[sel.item];
    if (!picked) {
      ok = false;
      return m;
    }
    const name = String(picked.n || "").replace(/ /g, "_");
    const rep = map[name];
    if (!rep) {
      ok = false;
      return m;
    }
    return rep;
  });
  return ok ? out : null;
}
function sheetPathFor(layer, animKey) {
  const anim = ANIMS_BY_KEY[animKey];
  const folder = anim && anim.folder || animKey;
  return layer.variant ? "spritesheets/" + layer.base + folder + "/" + variantToFilename(layer.variant) + ".png" : "spritesheets/" + layer.base + folder + ".png";
}
function resolveLayerBase(item, layer, bodyType, selections, cat) {
  let base = layer[bodyType];
  if (!base) return null;
  if (base.includes("${")) {
    base = replaceInPath(item, base, selections, cat);
    if (!base) return null;
  }
  return base;
}
function selectedVariant(item, sel) {
  return item.v && item.v.length ? sel.variant || item.v[0] : null;
}
function customSpritePath(base, variant) {
  return "spritesheets/" + base + (variant ? variantToFilename(variant) : "") + ".png";
}
function collectLayers(cat, state, animKey, opts = {}) {
  const meta = animMeta(animKey);
  if (!meta) return [];
  const items = opts.items || state.sel;
  const colors = opts.colors || state.colors;
  const layers = [];
  let order = 0;
  const push = (sel, item, layer, path, kind, lookup, sig) => {
    layers.push({
      kind,
      z: layer.z || 0,
      order: order++,
      itemId: sel.item,
      animKey,
      path,
      lookup,
      sig,
      cycle: meta.custom ? null : meta.cycle
    });
  };
  if (!meta.custom) {
    for (const sel of Object.values(items)) {
      if (!sel || !sel.item) continue;
      const item = cat.items[sel.item];
      if (!item) continue;
      if (!supportsBodyType(item, state.bt)) continue;
      if (!supportsAnim(item, animKey)) continue;
      const variant = selectedVariant(item, sel);
      const lookup = itemLookup(cat, item, colors);
      const sig = colorSignature(item, colors);
      for (const layer of item.l) {
        if (layer.ca) continue;
        const base = resolveLayerBase(item, layer, state.bt, items, cat);
        if (!base) continue;
        push(sel, item, layer, sheetPathFor({ base, variant }, animKey), "std", lookup, sig);
      }
    }
  } else {
    const def = meta.def;
    for (const sel of Object.values(items)) {
      if (!sel || !sel.item) continue;
      const item = cat.items[sel.item];
      if (!item) continue;
      if (!supportsBodyType(item, state.bt)) continue;
      if (!supportsAnim(item, meta.base)) continue;
      const variant = selectedVariant(item, sel);
      const lookup = itemLookup(cat, item, colors);
      const sig = colorSignature(item, colors);
      for (const layer of item.l) {
        if (layer.ca) continue;
        const base = resolveLayerBase(item, layer, state.bt, items, cat);
        if (!base) continue;
        push(sel, item, layer, sheetPathFor({ base, variant }, meta.base), "extract", lookup, sig);
      }
    }
    for (const sel of Object.values(items)) {
      if (!sel || !sel.item) continue;
      const item = cat.items[sel.item];
      if (!item) continue;
      if (!supportsBodyType(item, state.bt)) continue;
      const variant = selectedVariant(item, sel);
      const lookup = itemLookup(cat, item, colors);
      const sig = colorSignature(item, colors);
      for (const layer of item.l) {
        if (layer.ca !== animKey) continue;
        const base = resolveLayerBase(item, layer, state.bt, items, cat);
        if (!base) continue;
        if (!variant && base.endsWith("/")) continue;
        push(sel, item, layer, customSpritePath(base, variant), def.sourceSingleAnimation ? "single" : "area", lookup, sig);
      }
    }
  }
  layers.sort((a, b) => a.z - b.z || a.order - b.order);
  return layers;
}
function customAnimsFor(cat, state) {
  const present = /* @__PURE__ */ new Set();
  for (const sel of Object.values(state.sel || {})) {
    if (!sel || !sel.item) continue;
    const item = cat.items[sel.item];
    if (!item || !supportsBodyType(item, state.bt)) continue;
    for (const layer of item.l || []) if (layer.ca) present.add(layer.ca);
  }
  return CUSTOM_ANIMS.filter((a) => present.has(a.key)).map((a) => a.key);
}
function availableAnimations(cat, state) {
  return ANIMS.map((a) => a.key).concat(customAnimsFor(cat, state));
}
function equipmentAnimations(cat, state) {
  const out = [];
  for (const [typeName, sel] of Object.entries(state.sel || {})) {
    if (!sel || !sel.item) continue;
    const item = cat.items[sel.item];
    if (!item) continue;
    const keys = [];
    for (const layer of item.l || []) if (layer.ca && !keys.includes(layer.ca)) keys.push(layer.ca);
    if (!keys.length) continue;
    out.push({
      type: typeName,
      itemId: sel.item,
      name: item.n,
      animations: CUSTOM_ANIMS.filter((a) => keys.includes(a.key)).map((a) => a.key)
    });
  }
  return out;
}
var ATTACK_BASES = /* @__PURE__ */ new Set(["slash", "thrust", "backslash", "halfslash"]);
function isWeaponItem(item) {
  return item.t === "weapon" || String(item.t || "").startsWith("weapon_");
}
function attackAnimations(cat, state) {
  const out = customAnimsFor(cat, state).filter((k) => ATTACK_BASES.has(CUSTOM_ANIMS_BY_KEY[k].base));
  const weapons = Object.values(state.sel || {}).map((sel) => sel && cat.items[sel.item]).filter((item) => item && supportsBodyType(item, state.bt) && isWeaponItem(item));
  for (const key of ["shoot", "slash", "thrust", "spellcast"]) {
    if (out.includes(key)) continue;
    if (weapons.some((item) => supportsAnim(item, key))) out.push(key);
  }
  return out;
}
function resolveAnimation(cat, state, base) {
  for (const key of customAnimsFor(cat, state)) {
    const anim = CUSTOM_ANIMS_BY_KEY[key];
    if (anim && anim.base === base) return key;
  }
  return base;
}
function animationMap(cat, state) {
  const out = {};
  for (const anim of ANIMS) out[anim.key] = resolveAnimation(cat, state, anim.key);
  return out;
}
var MAX_FRAMES = 2400;
var imageCache = /* @__PURE__ */ new Map();
var frameCache = /* @__PURE__ */ new Map();
function loadSprite(path) {
  let p = imageCache.get(path);
  if (!p) {
    p = fetch(CDN + path).then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.blob();
    }).then((b) => createImageBitmap(b));
    p.catch(() => {
    });
    imageCache.set(path, p);
  }
  return p;
}
function newCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function cachePut(key, value) {
  if (frameCache.size >= MAX_FRAMES) {
    let n = Math.floor(MAX_FRAMES * 0.1);
    for (const k of frameCache.keys()) {
      frameCache.delete(k);
      if (--n <= 0) break;
    }
  }
  frameCache.set(key, value);
}
function recolorCanvas(canvas, lookup) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = new Uint32Array(img.data.buffer);
  let touched = false;
  for (let i = 0; i < px.length; i++) {
    const v = px[i];
    const a = v & 4278190080;
    if (!a) continue;
    const key = (v & 255) << 16 | (v >>> 8 & 255) << 8 | v >>> 16 & 255;
    const t = lookup.get(key);
    if (t === void 0) continue;
    px[i] = a | (t & 255) << 16 | (t >>> 8 & 255) << 8 | t >>> 16 & 255;
    touched = true;
  }
  if (touched) ctx.putImageData(img, 0, 0);
  return canvas;
}
function customFrameSource(def, dirRow, frameIdx) {
  const spec = def.frames[dirRow][frameIdx];
  const comma = spec.indexOf(",");
  const rowName = spec.slice(0, comma);
  const srcCol = parseInt(spec.slice(comma + 1), 10) || 0;
  const dir = rowName.slice(rowName.indexOf("-") + 1);
  return { srcRow: DIR_KEY_ROWS[dir] === void 0 ? 0 : DIR_KEY_ROWS[dir], srcCol };
}
async function getFrame(layer, dirRow, frameIdx) {
  const key = layer.kind + "|" + layer.animKey + "|" + dirRow + "|" + frameIdx + "|" + layer.path + "|" + (layer.lookup ? layer.sig : "-");
  const hit = frameCache.get(key);
  if (hit) return hit;
  const meta = animMeta(layer.animKey);
  if (!meta) {
    cachePut(key, null);
    return null;
  }
  const size = meta.frameSize;
  let img;
  try {
    img = await loadSprite(layer.path);
  } catch (e) {
    cachePut(key, null);
    return null;
  }
  let srcFrame;
  let srcRow;
  let srcCol;
  if (layer.kind === "std") {
    srcFrame = FRAME;
    srcRow = dirRow;
    srcCol = layer.cycle[frameIdx];
  } else if (layer.kind === "area") {
    srcFrame = size;
    srcRow = dirRow;
    srcCol = frameIdx;
  } else {
    const src = customFrameSource(meta.def, dirRow, frameIdx);
    srcRow = src.srcRow;
    srcCol = src.srcCol;
    srcFrame = layer.kind === "single" ? Math.max(1, Math.round(img.height / 4)) : FRAME;
  }
  const cols = Math.max(1, Math.round(img.width / srcFrame));
  const rows = Math.max(1, Math.round(img.height / srcFrame));
  if (layer.kind === "std" && srcRow >= rows) srcRow = rows - 1;
  if (srcCol >= cols || srcRow >= rows) {
    cachePut(key, null);
    return null;
  }
  const canvas = newCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const off = Math.round((size - srcFrame) / 2);
  ctx.drawImage(img, srcCol * srcFrame, srcRow * srcFrame, srcFrame, srcFrame, off, off, srcFrame, srcFrame);
  if (layer.lookup) recolorCanvas(canvas, layer.lookup);
  cachePut(key, canvas);
  return canvas;
}
async function renderFrame(ctx, cat, state, animKey, frameIdx, row, layers) {
  const list = layers || collectLayers(cat, state, animKey);
  const size = frameSizeFor(animKey);
  const frames = await Promise.all(list.map((l) => getFrame(l, row, frameIdx)));
  ctx.clearRect(0, 0, size, size);
  for (const f of frames) if (f) ctx.drawImage(f, 0, 0);
  return list.length;
}
async function renderFullSheet(cat, state, onProgress) {
  const areas = [];
  let y = SHEET_HEIGHT;
  for (const key of customAnimsFor(cat, state)) {
    const def = CUSTOM_ANIMS_BY_KEY[key].def;
    const area = {
      key,
      def,
      cols: def.frames[0].length,
      height: def.frameSize * def.frames.length,
      width: def.frameSize * def.frames[0].length,
      offsetY: y,
      layers: collectLayers(cat, state, key)
    };
    y += area.height;
    areas.push(area);
  }
  const width = Math.max(SHEET_WIDTH, ...areas.map((a) => a.width));
  const canvas = newCanvas(width, y);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const jobs = [];
  const paths = /* @__PURE__ */ new Set();
  for (const anim of ANIMS) {
    for (const layer of collectLayers(cat, state, anim.key)) {
      jobs.push({ layer, y: SHEET_OFFSETS[anim.folder || anim.key] });
      paths.add(layer.path);
    }
  }
  for (const area of areas) for (const layer of area.layers) paths.add(layer.path);
  const uniq = [...paths];
  let loaded = 0;
  let cursor = 0;
  const CONC = 10;
  const worker = async () => {
    while (cursor < uniq.length) {
      const p = uniq[cursor++];
      try {
        await loadSprite(p);
      } catch (e) {
      }
      loaded++;
      if (onProgress) onProgress(loaded / uniq.length * 0.8);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONC, uniq.length) }, worker));
  let done = 0;
  const total = jobs.length + areas.reduce((n, a) => n + a.layers.length, 0);
  for (const job of jobs) {
    try {
      const img = await loadSprite(job.layer.path);
      let drawable = img;
      if (job.layer.lookup) {
        const c = newCanvas(img.width, img.height);
        c.getContext("2d").drawImage(img, 0, 0);
        recolorCanvas(c, job.layer.lookup);
        drawable = c;
      }
      ctx.drawImage(drawable, 0, job.y);
    } catch (e) {
    }
    done++;
    if (onProgress && done % 8 === 0) {
      onProgress(0.8 + 0.2 * (done / total));
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  for (const area of areas) {
    const fs = area.def.frameSize;
    for (let i = 0; i < area.def.frames.length; i++) {
      for (let j = 0; j < area.cols; j++) {
        for (const layer of area.layers) {
          const f = await getFrame(layer, i, j);
          if (f) ctx.drawImage(f, j * fs, area.offsetY + i * fs);
        }
      }
    }
    if (onProgress) onProgress(0.8 + 0.2 * (done / Math.max(1, total)));
    done += area.layers.length;
  }
  if (onProgress) onProgress(1);
  return canvas;
}
async function renderAnimSheet(cat, state, animKey, onProgress) {
  const meta = animMeta(animKey);
  if (!meta) return null;
  const layers = collectLayers(cat, state, animKey);
  const cols = meta.frameCount;
  const size = meta.frameSize;
  const canvas = newCanvas(cols * size, 4 * size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  let done = 0;
  for (const layer of layers) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < cols; j++) {
        const f = await getFrame(layer, i, j);
        if (f) ctx.drawImage(f, j * size, i * size);
      }
    }
    done++;
    if (onProgress) onProgress(done / Math.max(1, layers.length));
  }
  return canvas;
}
function encodeHash(cat, state) {
  const params = {};
  params.sex = state.bt;
  for (const [typeName, sel] of Object.entries(state.sel)) {
    if (!sel || !sel.item) continue;
    const item = cat.items[sel.item];
    if (!item) continue;
    const name = String(item.n).replace(/ /g, "_");
    let tail = "";
    if (item.v && item.v.length) tail = variantToFilename(sel.variant || item.v[0]);
    else {
      const slot = colorSlots(item)[0];
      tail = slot ? state.colors[slot.group] || defaultKey(slot.entry) : "";
    }
    if (tail) {
      if (item.v && item.v.length) tail = tail.replace(/ /g, "_");
      params[typeName] = name + "_" + tail;
    } else {
      params[typeName] = name;
    }
  }
  const cols = [];
  for (const [group, key] of Object.entries(state.colors)) cols.push(group + ":" + key);
  if (cols.length) params.c = cols.join(",");
  return Object.entries(params).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
}
function decodeHash(cat, indexes, hash) {
  let s = (hash || "").replace(/^#/, "").replace(/^\?/, "");
  if (!s) return null;
  const params = {};
  for (const pair of s.split("&")) {
    const i = pair.indexOf("=");
    if (i < 0) continue;
    try {
      params[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1));
    } catch (e) {
    }
  }
  const state = { bt: "male", sel: {}, colors: {} };
  if (params.sex && BODY_TYPES.some((b) => b.key === params.sex)) state.bt = params.sex;
  if (params.c) {
    for (const entry of params.c.split(",")) {
      const i = entry.indexOf(":");
      if (i < 0) continue;
      state.colors[entry.slice(0, i)] = entry.slice(i + 1);
    }
  }
  for (const [key, raw] of Object.entries(params)) {
    if (key === "sex" || key === "c") continue;
    const idx = indexes.nameIndex[key];
    if (!idx) continue;
    const bar = raw.indexOf("|");
    const head = bar >= 0 ? raw.slice(0, bar) : raw;
    const extra = bar >= 0 ? raw.slice(bar + 1) : "";
    let itemId = null;
    let tail = "";
    const parts = head.split("_");
    for (let n = parts.length; n >= 1; n--) {
      const nm = normName(parts.slice(0, n).join(" "));
      if (idx[nm]) {
        itemId = idx[nm];
        tail = parts.slice(n).join("_");
        break;
      }
    }
    if (!itemId) continue;
    const item = cat.items[itemId];
    const sel = { item: itemId, variant: null };
    if (item.v && item.v.length) {
      const match = item.v.find((v) => variantToFilename(v) === tail);
      if (!match) continue;
      sel.variant = match;
      if (extra) {
        const slot = colorSlots(item)[0];
        if (slot) state.colors[slot.group] = extra;
      }
    } else {
      const slot = colorSlots(item)[0];
      if (slot && tail) state.colors[slot.group] = tail;
    }
    state.sel[item.t] = sel;
  }
  return state;
}

// ws:src/ui.js
var LPC_CSS = `/* LPC Character Creator styles. Scoped for injection into a shadow root: the
   selectors below use .lpc-app / :host rather than body. Kept as one string so
   the plugin bundle stays a single file (see src/README.md). */
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
    --border: #26303d;
    --border-2: #33404f;
    --radius: 12px;
    --shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  }

  .lpc-app, .lpc-app * { box-sizing: border-box; }

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

  .layout {
    display: grid;
    grid-template-columns: 336px minmax(320px, 1fr) 316px;
    gap: 14px; padding: 14px; align-items: stretch;
    max-width: 1720px; margin: 0 auto 0;
    flex: 1 1 auto; min-height: 0; width: 100%;
  }
  @media (max-width: 1240px) {
    :host, .lpc-app { display: block; height: auto; }
    .layout { grid-template-columns: 340px minmax(0, 1fr); flex: none; min-height: 0; }
    .col-detail { grid-column: 1 / -1; }
    .col-browser .panel-body { max-height: min(560px, 62vh); overflow: auto; }
    .col-detail .panel-body { overflow: visible; }
    .stage { flex: none; min-height: 420px; }
  }
  @media (max-width: 900px) {
    :host, .lpc-app { display: block; height: auto; }
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
    .top-actions .btn:nth-child(5) { grid-column: span 2; }
  }

  .panel {
    background: linear-gradient(180deg, var(--panel), var(--bg-2));
    border: 1px solid var(--border); border-radius: var(--radius);
    box-shadow: var(--shadow); display: flex; flex-direction: column; min-width: 0; min-height: 0;
  }
  .panel-head {
    padding: 11px 13px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
    background: linear-gradient(180deg, rgba(34,44,59,0.55), rgba(21,27,36,0.2));
  }
  .panel-head h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.9px; color: var(--muted); font-weight: 700; }
  .panel-body { padding: 12px; }
  .col-browser .panel-body,
  .col-detail .panel-body { overflow: auto; position: relative; flex: 1 1 auto; min-height: 0; }
  @media (max-width: 900px) {
    .col-browser .panel-body,
    .col-detail .panel-body { overflow: visible; max-height: none; }
  }

  /* ---- stage ---- */
  .col-stage { overflow: hidden; }
  .stage {
    position: relative; display: grid; place-items: center;
    padding: 18px; min-height: 260px; flex: 1 1 auto; min-width: 0;
    background:
      linear-gradient(45deg, #0d1117 25%, transparent 25%, transparent 75%, #0d1117 75%),
      linear-gradient(45deg, #0d1117 25%, #111823 25%, #111823 75%, #0d1117 75%);
    background-size: 22px 22px; background-position: 0 0, 11px 11px;
    overflow: hidden;
  }
  #previewCanvas { image-rendering: pixelated; filter: drop-shadow(0 12px 18px rgba(0,0,0,0.55)); }
  .stage-badge {
    position: absolute; left: 12px; top: 12px; font-size: 11px; color: var(--muted); white-space: nowrap;
    background: rgba(11,14,19,0.7); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px;
  }
  .stage-controls { padding: 12px; border-top: 1px solid var(--border); display: grid; gap: 10px; flex: none; }
  .ctrl-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ctrl-row .label { font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); font-weight: 700; }

  select, input[type="text"], input[type="search"] {
    background: var(--panel-2); border: 1px solid var(--border-2); color: var(--text);
    border-radius: 9px; padding: 7px 10px; outline: none; width: 100%;
  }
  select:focus, input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(240,180,41,0.14); }
  input[type="range"] { width: 106px; accent-color: var(--accent); }
  input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; }

  .seg { display: inline-flex; background: var(--panel-2); border: 1px solid var(--border-2); border-radius: 9px; overflow: hidden; }
  .seg button {
    appearance: none; border: 0; background: transparent; color: var(--muted);
    padding: 6px 10px; cursor: pointer; font-size: 12px; font-weight: 600;
  }
  .seg button + button { border-left: 1px solid var(--border); }
  .seg button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); }

  /* ---- tree ---- */
  .tree { font-size: 13px; }
  .tree-node > .tree-row {
    display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 7px;
    cursor: pointer; user-select: none;
  }
  .tree-node > .tree-row:hover { background: var(--panel-2); }
  .tree-row.active { background: linear-gradient(90deg, rgba(240,180,41,.18), rgba(240,180,41,.05)); color: var(--accent-2); }
  .tree-caret { width: 14px; text-align: center; color: var(--muted-2); font-size: 10px; flex: none; }
  .tree-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tree-count { font-size: 10.5px; color: var(--muted-2); }
  .tree-children { margin-left: 11px; border-left: 1px solid var(--border); padding-left: 5px; }
  .tree-children[hidden] { display: none; }

  /* ---- item grid ---- */
  .crumb { font-size: 11.5px; color: var(--muted); padding: 2px 2px 8px; }
  .crumb b { color: var(--text); }
  .cat-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .chip {
    border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
    padding: 4px 9px; border-radius: 999px; font-size: 12px; cursor: pointer;
  }
  .chip:hover { border-color: var(--accent); color: var(--accent-2); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(66px, 1fr)); gap: 7px; }
  .grid.big { grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); }
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
  .tile .badge {
    position: absolute; top: 4px; right: 4px; font-size: 9px; padding: 1px 5px; border-radius: 999px;
    background: rgba(240,180,41,.9); color: var(--accent-ink); font-weight: 700;
  }
  .tile.dim { opacity: .35; }
  .shimmer { position: absolute; inset: 0; background: linear-gradient(100deg, #131a23 30%, #1b2530 50%, #131a23 70%); background-size: 200% 100%; animation: sh 1.1s linear infinite; }
  @keyframes sh { from { background-position: 200% 0; } to { background-position: -60% 0; } }

  .empty { color: var(--muted-2); font-size: 12.5px; padding: 14px 4px; }

  /* ---- detail ---- */
  .section + .section { border-top: 1px solid var(--border); }
  .section h3 { margin: 0 0 9px; font-size: 11px; text-transform: uppercase; letter-spacing: .9px; color: var(--muted); font-weight: 700; }
  .eq-item { display: flex; align-items: center; gap: 9px; padding: 5px 0; }
  .eq-item .sw {
    width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--border-2); flex: none;
    background: #0e1319; image-rendering: pixelated;
  }
  .eq-item .nm { flex: 1; min-width: 0; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .eq-item .sub { font-size: 10.5px; color: var(--muted-2); }
  .eq-item .anim-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
  .anim-tag {
    border: 1px solid var(--border-2); background: var(--panel-2); color: var(--accent-2);
    font-size: 9.5px; padding: 1px 6px; border-radius: 999px; cursor: pointer; line-height: 1.6;
  }
  .anim-tag:hover { border-color: var(--accent); background: var(--panel-3); }
  .x { border: 0; background: transparent; color: var(--muted-2); cursor: pointer; font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 6px; }
  .x:hover { color: #ff8a8a; background: rgba(255,90,90,.12); }

  .slot-block { margin-bottom: 13px; }
  .slot-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px; }
  .slot-name { font-size: 12px; font-weight: 600; }
  .swatches { display: flex; flex-wrap: wrap; gap: 5px; }
  .sw {
    width: 24px; height: 24px; border-radius: 6px; padding: 0; cursor: pointer;
    border: 1px solid rgba(255,255,255,.14); position: relative;
  }
  .sw:hover { transform: translateY(-1px); }
  .sw.on { box-shadow: 0 0 0 2px var(--accent), 0 0 0 3px rgba(0,0,0,.5); }
  .sw-plain { background: repeating-linear-gradient(45deg, #2a3444 0 4px, #1d2a38 4px 8px); }
  .sw.ver { border-radius: 50%; }
  .swatch-group { margin-top: 7px; }
  .swatch-group .vg { font-size: 10px; color: var(--muted-2); margin-bottom: 4px; letter-spacing: .4px; }

  .credits { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
  .credits .c { padding: 7px 0; border-top: 1px dashed var(--border); }
  .credits .c:first-child { border-top: 0; }
  .credits b { color: var(--text); font-weight: 600; }
  .credits a { color: var(--blue); text-decoration: none; }
  .credits a:hover { text-decoration: underline; }
  .lic { display: inline-block; border: 1px solid var(--border-2); border-radius: 999px; padding: 0 6px; margin: 2px 3px 0 0; font-size: 10px; color: var(--muted); }

  /* ---- misc ---- */
  .toast {
    position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%) translateY(14px);
    background: #1d2635; border: 1px solid var(--border-2); color: var(--text);
    padding: 10px 16px; border-radius: 10px; box-shadow: var(--shadow);
    opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; z-index: 100;
    font-size: 13px; max-width: 80vw;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  .modal-back {
    position: fixed; inset: 0; background: rgba(5,8,12,.72); backdrop-filter: blur(3px);
    display: grid; place-items: center; z-index: 90; padding: 18px;
  }
  .modal-back[hidden] { display: none; }
  .modal {
    background: linear-gradient(180deg, var(--panel), var(--bg-2)); border: 1px solid var(--border-2);
    border-radius: 14px; box-shadow: var(--shadow); width: min(560px, 100%); max-height: 84vh; overflow: auto;
  }
  .modal-head { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .modal-head h3 { margin: 0; font-size: 15px; }
  .modal-body { padding: 16px; }
  .modal-foot { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
  .prog { height: 8px; background: var(--panel-3); border-radius: 99px; overflow: hidden; margin-top: 12px; }
  .prog > i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .15s ease; }
  .field + .field { margin-top: 12px; }
  .field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); margin-bottom: 5px; font-weight: 700; }
  .save-row { display: flex; align-items: center; gap: 9px; padding: 8px 0; border-top: 1px solid var(--border); }
  .save-row .nm { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .save-row .meta { font-size: 10.5px; color: var(--muted-2); }
  code.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; background: #0e1319; border: 1px solid var(--border); border-radius: 6px; padding: 2px 5px; word-break: break-all; }
`;
var LPC_HTML = `<div class="topbar">
  <div class="brand">
    <div class="brand-mark">LPC</div>
    <div>
      <h1>Character Creator</h1>
      <p>Universal LPC Spritesheet &mdash; 657 items, live recolouring, equipped-item animations</p>
    </div>
  </div>
  <div class="top-actions">
    <button class="btn" id="randomBtn" title="Randomize the whole character">Randomize</button>
    <button class="btn" id="saveBtn">Save</button>
    <button class="btn" id="savesBtn">Library</button>
    <button class="btn" id="exportBtn">Export</button>
    <button class="btn btn-primary" id="shareBtn">Share link</button>
  </div>
</div>

<div class="layout">
  <section class="panel col-browser">
    <div class="panel-head">
      <h2>Items</h2>
      <span class="tree-count" id="itemCountEl"></span>
    </div>
    <div class="panel-body">
      <input type="search" id="searchInput" placeholder="Search items\u2026" autocomplete="off" style="margin-bottom:10px" />
      <div class="tree" id="treeEl"></div>
      <div id="browserEl"></div>
    </div>
  </section>

  <section class="panel col-stage">
    <div class="stage">
      <canvas id="previewCanvas" width="256" height="256"></canvas>
      <div class="stage-badge" id="stageBadge">idle \xB7 down</div>
    </div>
    <div class="stage-controls">
      <div class="ctrl-row">
        <span class="label">Body</span>
        <select id="bodyTypeSelect" style="width:auto"></select>
        <span class="label" style="margin-left:6px">Anim</span>
        <select id="animSelect" style="width:auto"></select>
        <button class="btn btn-sm" id="playBtn" title="Play / pause">\u275A\u275A</button>
        <button class="btn btn-sm" id="attackBtn" hidden></button>
        <div class="seg" id="dirSeg"></div>
        <span class="label" style="margin-left:6px">Zoom</span>
        <input type="range" id="zoomRange" min="4" max="14" step="1" value="12" />
        <label class="ctrl-row" style="gap:5px"><input type="checkbox" id="dirsToggle" /> 4-dir</label>
      </div>
    </div>
  </section>

  <section class="panel col-detail">
    <div class="panel-head"><h2>Character</h2><button class="btn btn-sm btn-ghost" id="resetBtn">Reset</button></div>
    <div class="panel-body">
      <div class="section" id="equippedSection">
        <h3>Equipped</h3>
        <div id="equippedEl"></div>
      </div>
      <div class="section" id="colorsSection" style="margin-top:12px">
        <h3 id="colorsTitle">Colors</h3>
        <div id="colorsEl"></div>
      </div>
      <div class="section" id="creditsSection" style="margin-top:12px">
        <h3>Credits</h3>
        <div class="credits" id="creditsEl"></div>
      </div>
    </div>
  </section>
</div>

<div class="toast" id="toastEl"></div>

<div class="modal-back" id="modalBack" hidden>
  <div class="modal">
    <div class="modal-head"><h3 id="modalTitle">Title</h3><button class="x" id="modalClose">\u2715</button></div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-foot" id="modalFoot"></div>
  </div>
</div>`;

// ws:src/creator.js
var esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
};
var PLUGIN_VERSION = "1.4.1";
var DEFAULT_CATALOG_URL = "src/data/catalog.json";
var catalogUrl = DEFAULT_CATALOG_URL;
var catalogPromise = null;
var indexesCache = null;
async function ensureCatalog(url) {
  if (url) catalogUrl = url;
  if (!catalogPromise) catalogPromise = loadCatalog(catalogUrl);
  return catalogPromise;
}
function normalizeCharacter(cat, character) {
  const fallback = {
    bt: "male",
    sel: {
      body: { item: "body", variant: null },
      head: { item: "heads_human_male", variant: null }
    },
    colors: {}
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
    if (cat.items[item]) sel[type] = { item, variant: v && v.variant || null };
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
async function drawFrameCanvas(cat, st, animKey, dir, frameIdx, scale) {
  const idx = frameIndicesFor(animKey);
  const fi = idx[(frameIdx % idx.length + idx.length) % idx.length];
  const row = DIR_ROWS[dir] === void 0 ? DIR_ROWS.down : DIR_ROWS[dir];
  const layers = collectLayers(cat, st, animKey);
  const size = frameSizeFor(animKey);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  await renderFrame(ctx, cat, st, animKey, fi, row, layers);
  if (!scale || scale === 1) return c;
  return scaleCanvas(c, scale);
}
async function getCatalog(opts = {}) {
  return ensureCatalog(opts.catalogUrl);
}
async function renderFrame2(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  return drawFrameCanvas(cat, st, opts.anim || "idle", opts.dir || "down", opts.frame || 0, opts.scale || 1);
}
async function renderAnimSheet2(character, anim, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  return renderAnimSheet(cat, st, anim || "walk", opts.onProgress);
}
async function renderFullSheet2(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  return renderFullSheet(cat, st, opts.onProgress);
}
async function characterToCode(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return encodeHash(cat, normalizeCharacter(cat, character));
}
async function characterFromCode(code, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const s = decodeHash(cat, buildIndexes(cat), code);
  if (!s || !Object.keys(s.sel).length) return null;
  return { bt: s.bt, sel: s.sel, colors: s.colors };
}
async function animationsFor(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
  const custom = customAnimsFor(cat, st);
  return {
    available: availableAnimations(cat, st),
    standard: ANIMS.map((a) => a.key),
    custom,
    attacks: attackAnimations(cat, st)
  };
}
async function attackAnimation(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return attackAnimations(cat, normalizeCharacter(cat, character))[0] || null;
}
async function animationMap2(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return animationMap(cat, normalizeCharacter(cat, character));
}
async function equipmentAnimations2(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  return equipmentAnimations(cat, normalizeCharacter(cat, character));
}
async function createSprite(character, opts = {}) {
  const cat = await ensureCatalog(opts.catalogUrl);
  const st = normalizeCharacter(cat, character);
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
      if (DIR_ROWS[dir] === void 0) continue;
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
      return d[(index % d.length + d.length) % d.length];
    },
    frameCount(anim) {
      return frames[anim] && frames[anim].down && frames[anim].down.length || 0;
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
        dx = x - w / 2;
        dy = y - (c.width + FRAME) / 2 * s;
      }
      ctx.drawImage(c, dx, dy, w, h);
      return true;
    }
  };
}
async function createApp(root, host, options) {
  const $ = (id) => root.getElementById(id);
  const REQUIRED = /* @__PURE__ */ new Set(["body", "head"]);
  const DEFAULT_SEL = { body: "body", head: "heads_human_male", expression: "face_neutral" };
  const state = {
    bt: "male",
    sel: {},
    colors: {},
    anim: "walk",
    dir: "down",
    zoom: 12,
    playing: true,
    dirs4: false
  };
  let cat = null;
  let indexes = null;
  let activeTags = /* @__PURE__ */ new Set();
  let previewSets = [];
  let previewGen = 0;
  let previewDirty = true;
  let frameIdx = 0;
  let lastTick = 0;
  const FPS = 8;
  let browserGen = 0;
  const tiles = [];
  let destroyed = false;
  const changeListeners = /* @__PURE__ */ new Set();
  const teardown = [];
  function recomputeTags() {
    const tags = /* @__PURE__ */ new Set();
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
        if (state.colors[slot.group] === void 0) state.colors[slot.group] = defaultKey(slot.entry);
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
    if (!state.sel.body || !supportsBodyType(cat.items[state.sel.body.item], state.bt)) {
      state.sel.body = { item: "body", variant: null };
    }
    recomputeTags();
    const head = state.sel.head && cat.items[state.sel.head.item];
    if (!head || !supportsBodyType(head, state.bt) || !itemAllowed(head)) {
      const pref = [
        "heads_human_male",
        "heads_human_female",
        "heads_human_child",
        "heads_boarman",
        "heads_lizard_male",
        "heads_orc_male"
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
    const live = /* @__PURE__ */ new Set();
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
  function animSourceNames(animKey) {
    const meta = animMeta(animKey);
    if (!meta || !cat) return "";
    const names = [];
    for (const sel of Object.values(state.sel)) {
      const item = sel && cat.items[sel.item];
      if (!item || !supportsBodyType(item, state.bt)) continue;
      if (!item.l.some((l) => l.ca)) continue;
      const contributes = meta.custom ? item.l.some((l) => l.ca === animKey) : supportsAnim(item, animKey) || meta.base && supportsAnim(item, meta.base);
      if (contributes) names.push(item.n);
    }
    return names.join(", ");
  }
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
        })
      );
      sets.push({ dir: d, frames });
    }
    if (gen !== previewGen) return;
    previewSets = sets;
    previewDirty = false;
    const sources = animSourceNames(state.anim);
    $("stageBadge").textContent = meta.label.toLowerCase() + (state.dirs4 ? " \xB7 all directions" : " \xB7 " + state.dir) + (sources ? " \xB7 " + sources : "");
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
    if (t - lastTick < 1e3 / FPS) return;
    lastTick = t;
    if (!state.playing) return;
    frameIdx++;
    drawPreview();
    drawTiles();
  }
  const THUMB_ANIMS = ["walk", "idle", "spellcast", "slash", "thrust", "shoot", "hurt", "jump", "sit"];
  function thumbAnimFor(item) {
    for (const a of THUMB_ANIMS) if (supportsAnim(item, a)) return a;
    for (const layer of item.l || []) if (layer.ca && CUSTOM_ANIM_LABELS[layer.ca]) return layer.ca;
    return item.a && item.a[0] || "walk";
  }
  function thumbStateFor(item, anim) {
    const sel = Object.assign({}, state.sel);
    sel[item.t] = { item: findId(item), variant: item.v && item.v.length ? item.v[0] : null };
    const colors = Object.assign({}, state.colors);
    for (const s of colorSlots(item)) if (colors[s.group] === void 0) colors[s.group] = defaultKey(s.entry);
    return { bt: state.bt, sel, colors, anim };
  }
  let idOfItem = /* @__PURE__ */ new WeakMap();
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
        Promise.resolve().then(job).catch((e) => console.error("thumbnail failed", e)).finally(() => {
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
          })
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
      navPath.map((n) => ({ label: n.label, node: n }))
    );
    wrap.innerHTML = parts.map((p, i) => i === parts.length - 1 ? "<b>" + esc(p.label) + "</b>" : esc(p.label)).join(" &nbsp;\u203A&nbsp; ");
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
      head.innerHTML = "<b>" + hits.length + "</b> result" + (hits.length === 1 ? "" : "s") + " for \u201C" + esc(searchQuery) + "\u201D";
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
        const b = el("button", "chip", c.label + " \xB7 " + countItems(c));
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
    for (const root2 of cat.tree) wrap.appendChild(treeRow(root2, wrap, true));
    treeEl.appendChild(wrap);
  }
  function treeRow(node, parent, branch) {
    const box = el("div", "tree-node");
    const row = el("div", "tree-row");
    row.dataset.nodeId = node.id;
    const hasKids = node.children && node.children.length;
    const caret = el("span", "tree-caret", hasKids ? "\u25B8" : "\xB7");
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
        caret.textContent = open ? "\u25BE" : "\u25B8";
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
  const TYPE_ORDER = [
    "body",
    "head",
    "expression",
    "eyes",
    "eyebrows",
    "nose",
    "ears",
    "furry_ears",
    "hair",
    "beard",
    "mustache",
    "hairextl",
    "hairextr",
    "hairtie",
    "updo",
    "hat",
    "hat_overlay",
    "hat_trim",
    "facial_mask",
    "visor",
    "neck",
    "necklace",
    "cape",
    "backpack",
    "quiver",
    "torso",
    "clothes",
    "dress",
    "vest",
    "jacket",
    "apron",
    "overalls",
    "sash",
    "belt",
    "buckles",
    "arms",
    "sleeves",
    "gloves",
    "wrists",
    "bracers",
    "shoulders",
    "bauldron",
    "chainmail",
    "armour",
    "legs",
    "shoes",
    "socks",
    "feet",
    "accessory",
    "weapon",
    "shield",
    "tool",
    "ammo",
    "charm",
    "ring",
    "wings",
    "tail",
    "horns",
    "fins",
    "wound_ribs",
    "wound_arm",
    "wound_brain",
    "wound_mouth",
    "shadow",
    "prosthesis_hand",
    "prosthesis_leg",
    // There is a single wheelchair item, but it is its own slot upstream.
    "wheelchair"
  ];
  function typeRank(t) {
    const i = TYPE_ORDER.indexOf(t);
    return i < 0 ? 500 : i;
  }
  function renderEquipped() {
    const wrap = $("equippedEl");
    wrap.innerHTML = "";
    const entries = Object.entries(state.sel).sort(
      (a, b) => typeRank(a[0]) - typeRank(b[0]) || a[0].localeCompare(b[0])
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
      const sub = el("div", "sub", subBits.join(" \xB7 "));
      nm.appendChild(sub);
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
        const x = el("button", "x", "\u2715");
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
    const stops = colors.map((c, i) => `${c} ${i / (colors.length - 1) * 100}%`);
    return "linear-gradient(120deg," + stops.join(",") + ")";
  }
  function renderColors() {
    const wrap = $("colorsEl");
    const title = $("colorsTitle");
    wrap.innerHTML = "";
    const slotsByGroup = /* @__PURE__ */ new Map();
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
    nm.title = slot.label + " \u2014 shared by: " + item.n;
    head.appendChild(nm);
    const cur = state.colors[slot.group] || defaultKey(slot.entry);
    head.appendChild(el("span", "tree-count", keyLabel(cat, slot.entry, cur)));
    block.appendChild(head);
    const options2 = colorOptions(cat, slot.entry);
    const groups = /* @__PURE__ */ new Map();
    for (const o of options2) {
      const entry = o.key === "source" ? { d: "custom" } : slot.entry;
      const ver = o.key === "source" ? "custom" : function() {
        const k = o.key.split(".");
        return k.length > 1 && k[0] !== slot.entry.m ? k[0] : k[1] || slot.entry.d;
      }();
      if (!groups.has(ver)) groups.set(ver, []);
      groups.get(ver).push(o);
    }
    for (const [ver, opts] of groups) {
      const g = el("div", "swatch-group");
      const verLabel = cat.paletteVersions && cat.paletteVersions[ver] && cat.paletteVersions[ver].label || ver;
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
    head.appendChild(el("div", "slot-name", item.n + " \u2014 variant"));
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
    const keys = /* @__PURE__ */ new Set();
    for (const sel of Object.values(state.sel)) {
      const item = cat.items[sel.item];
      if (!item) continue;
      for (const k of item.cr || []) keys.add(k);
    }
    if (!keys.size) {
      wrap.appendChild(el("div", "empty", "\u2014"));
      return;
    }
    let shown = 0;
    for (const k of keys) {
      const c = cat.credits[k];
      if (!c) continue;
      if (shown++ > 40) break;
      const d = el("div", "c");
      d.innerHTML = "<b>" + esc(c.a && c.a.length ? c.a.join(", ") : "Unknown") + "</b><br>" + (c.l || []).map((l) => '<span class="lic">' + esc(l) + "</span>").join("") + (c.n ? "<br>" + esc(c.n) : "") + ((c.u || []).length ? "<br>" + c.u.map((u) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(shortUrl(u)) + "</a>").join(" \xB7 ") : "");
      wrap.appendChild(d);
    }
    const note = el("div", "c");
    note.style.color = "var(--muted-2)";
    note.innerHTML = 'LPC assets by many artists. Art hot-linked from the <a href="https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator" target="_blank" rel="noopener">Universal LPC Spritesheet Character Generator</a>.';
    wrap.appendChild(note);
  }
  function shortUrl(u) {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch (e) {
      return u;
    }
  }
  function onStateChange() {
    renderEquipped();
    renderColors();
    renderCredits();
    updateItemCount();
    if (refreshAnimOptions()) frameIdx = 0;
    for (const t of tiles) {
      const item = cat.items[t.tile.dataset.item];
      t.tile.classList.toggle("on", !!(item && state.sel[item.t] && state.sel[item.t].item === t.tile.dataset.item));
    }
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
  function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function randomize() {
    const bt = randomPick(["male", "male", "female", "female", "teen", "muscular", "child", "pregnant"]);
    const sel = {};
    const heads = (indexes.byType.head || []).filter((id) => supportsBodyType(cat.items[id], bt));
    const humanHeads = heads.filter(
      (id) => cat.items[id].n.startsWith("Human") && !/(Elderly|Plump|Gaunt|Small)/.test(cat.items[id].n)
    );
    const head = Math.random() < 0.8 && humanHeads.length ? randomPick(humanHeads) : randomPick(heads);
    sel.head = { item: head, variant: null };
    sel.body = { item: "body", variant: null };
    const colors = { body: randomPick(optionKeys("body")) };
    const faces = (indexes.byType.expression || []).filter((id) => supportsBodyType(cat.items[id], bt));
    if (faces.length) sel.expression = { item: randomPick(faces), variant: null };
    const bodySlot = colorSlots(cat.items.body)[0];
    colors.body = randomPick(optionKeysFromSlot(bodySlot));
    state.bt = bt;
    state.sel = sel;
    recomputeTags();
    const plan = [
      ["torso", 1],
      ["legs", 1],
      ["shoes", 1],
      ["hair", 1],
      ["hat", 0.45],
      ["belt", 0.4],
      ["neck", 0.3],
      ["gloves", 0.22],
      ["wrists", 0.22],
      ["arms", 0.18],
      ["shoulders", 0.2],
      ["backpack", 0.14],
      ["cape", 0.1],
      ["weapon", 0.4],
      ["shield", 0.18],
      ["beard", 0.25],
      ["mustache", 0.08],
      ["ears", 0.08],
      ["tail", 0.06],
      ["wings", 0.05],
      ["apron", 0.1],
      ["vest", 0.12],
      ["jacket", 0.1],
      ["dress", bt === "male" ? 0.02 : 0.25],
      ["hat_overlay", 0.08]
    ];
    colors.hair = randomPick(optionKeysFromSlot(colorSlots(cat.items[randomPick(indexes.byType.hair || ["hair_afro"])])[0]));
    for (const [type, chance] of plan) {
      const pool = (indexes.byType[type] || []).filter((id2) => itemAllowed(cat.items[id2]));
      if (!pool.length || Math.random() > chance) continue;
      const id = randomPick(pool);
      const item = cat.items[id];
      sel[type] = { item: id, variant: item.v && item.v.length ? randomPick(item.v) : null };
      recomputeTags();
      for (const s of colorSlots(item)) {
        if (colors[s.group] === void 0) colors[s.group] = randomPick(optionKeysFromSlot(s));
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
  const SAVE_KEY = "lpc-creator-saves-v1";
  async function kvFolder() {
    const root2 = window.root || {};
    if (root2.kv && root2.kv.lpcCharacters) return root2.kv.lpcCharacters;
    return null;
  }
  async function loadSaves() {
    const folder = await kvFolder();
    if (folder) {
      try {
        const list = await folder.get("list");
        if (Array.isArray(list)) return list;
      } catch (e) {
      }
    }
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
    }
    return [];
  }
  async function writeSaves(list) {
    const folder = await kvFolder();
    if (folder) {
      try {
        await folder.set("list", list);
      } catch (e) {
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
      zoom: state.zoom
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
    if (s.dir && DIR_ROWS[s.dir] !== void 0) state.dir = s.dir;
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
      body.appendChild(el("div", "empty", "No saved characters yet. Hit \u201CSave\u201D to store the current one."));
    }
    list.forEach((entry, i) => {
      const row = el("div", "save-row");
      const nm = el("div");
      nm.className = "nm";
      nm.appendChild(el("div", null, entry.name));
      nm.appendChild(el("div", "meta", new Date(entry.at).toLocaleString() + " \xB7 " + describeSnapshot(entry.state)));
      row.appendChild(nm);
      const load = el("button", "btn btn-sm", "Load");
      load.addEventListener("click", () => {
        applySnapshot(entry.state);
        closeModal();
        toast("Loaded \u201C" + entry.name + "\u201D");
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
    const paste = el("button", "btn", "Load share code\u2026");
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
    return bits.join(" \xB7 ");
  }
  async function saveCharacter() {
    const list = await loadSaves();
    const name = await promptName("Name your character", "Adventurer " + (list.length + 1));
    if (!name) return;
    list.push({ name, at: Date.now(), state: snapshot() });
    if (await writeSaves(list)) toast("Saved \u201C" + name + "\u201D");
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
    hint.textContent = "The link is compatible with the upstream Universal LPC generator's hash format, so it will open there too (upgrade-only colours use a \u201Cc=\u201D extra parameter upstream ignores).";
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
    const loadCode = el("button", "btn btn-ghost", "Load code\u2026");
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
      toast("Copy failed \u2014 select the text manually");
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
    ta.placeholder = "sex=male&body=Body_Color_light&\u2026";
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
        zoom: state.zoom
      });
      closeModal();
      toast("Character loaded");
    });
    foot.appendChild(cancel);
    foot.appendChild(ok);
    openModal(mode === "load" ? "Load character code" : "Share character");
  }
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
      status.textContent = "Rendering " + label + "\u2026";
      const t0 = performance.now();
      const canvas = await fn((f) => {
        prog.firstChild.style.width = Math.round(f * 100) + "%";
      });
      const ms = Math.round(performance.now() - t0);
      status.textContent = label + " ready (" + canvas.width + "\xD7" + canvas.height + ", " + ms + "ms)";
      downloadCanvas(canvas, "lpc-" + label.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".png");
      full.disabled = anim.disabled = false;
      toast("Downloaded " + label);
    };
    full.addEventListener("click", () => run("character sheet", (onp) => renderFullSheet2(cat, state, onp)));
    anim.addEventListener(
      "click",
      () => run(state.anim + " animation", (onp) => renderAnimSheet2(cat, state, state.anim, onp))
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
      setTimeout(() => URL.revokeObjectURL(url), 4e3);
    }, "image/png");
  }
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
        o.textContent = source ? meta.label + " \u2014 " + source : meta.label;
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
      attackBtn.textContent = "\u2694 " + (meta ? meta.label : attacks[0]);
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
    $("playBtn").textContent = state.playing ? "\u275A\u275A" : "\u25B6";
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
      $("playBtn").textContent = state.playing ? "\u275A\u275A" : "\u25B6";
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
  function getCharacter() {
    return {
      bt: state.bt,
      sel: JSON.parse(JSON.stringify(state.sel)),
      colors: Object.assign({}, state.colors)
    };
  }
  function onChange(fn) {
    if (typeof fn !== "function") return () => {
    };
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
      const c = typeof options.character === "string" ? decodeHash(cat, indexes, options.character) : options.character;
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
      return cat ? {
        available: availableAnimations(cat, state),
        standard: ANIMS.map((a) => a.key),
        custom: customAnimsFor(cat, state),
        attacks: attackAnimations(cat, state)
      } : { available: [], standard: [], custom: [], attacks: [] };
    },
    /** Which equipped item provides which animations (item <-> animation map). */
    equipmentAnimations() {
      return cat ? equipmentAnimations(cat, state) : [];
    },
    attackAnimations() {
      return cat ? attackAnimations(cat, state) : [];
    },
    attackAnimation() {
      return cat ? attackAnimations(cat, state)[0] || null : null;
    },
    /** Logical animation -> the animation the equipment supersedes it with. */
    animationMap() {
      return cat ? animationMap(cat, state) : {};
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
      return renderAnimSheet(cat, state, animKey || state.anim, o.onProgress);
    },
    renderFullSheet(o = {}) {
      const onProgress = typeof o === "function" ? o : o.onProgress;
      return renderFullSheet(cat, state, onProgress);
    },
    destroy
  };
  try {
    await boot();
  } catch (e) {
    console.error(e);
    const browserEl = $("browserEl");
    if (browserEl) browserEl.innerHTML = '<div class="empty">Failed to start: ' + esc(e.message) + "</div>";
  }
  window.__lpc = controller;
  return controller;
}
var DEFAULT_HEIGHT = "min(760px, 85vh)";
function prepareHost(host) {
  let shadow = host.shadowRoot;
  if (!shadow) shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = "<style>" + LPC_CSS + '</style><div class="lpc-app">' + LPC_HTML + "</div>";
  return shadow;
}
async function mountLpcCreator(container, options = {}) {
  if (!container || typeof container.appendChild !== "function") {
    throw new Error("mountLpcCreator(container): a DOM element is required");
  }
  if (options.height) container.style.height = options.height;
  else if (options.height !== false && !container.style.height) container.style.height = DEFAULT_HEIGHT;
  const shadow = prepareHost(container);
  return createApp(shadow, container, options);
}
async function openCreator(options = {}) {
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
export {
  DEFAULT_CATALOG_URL,
  PLUGIN_VERSION,
  animationMap2 as animationMap,
  animationsFor,
  attackAnimation,
  characterFromCode,
  characterToCode,
  createSprite,
  equipmentAnimations2 as equipmentAnimations,
  getCatalog,
  mountLpcCreator,
  openCreator,
  renderAnimSheet2 as renderAnimSheet,
  renderFrame2 as renderFrame,
  renderFullSheet2 as renderFullSheet
};

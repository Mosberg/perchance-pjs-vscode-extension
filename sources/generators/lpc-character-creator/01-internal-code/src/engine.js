// ============================================================================
// LPC sprite engine
// ----------------------------------------------------------------------------
// Composites Universal LPC Spritesheet layers on a canvas at runtime.
//
// Sprite art is hot-linked from jsDelivr, pinned to a specific upstream commit
// (see COMMIT) so the file layout can never shift under us. The layer/recolor
// metadata comes from src/data/catalog.json, which is generated from the raw
// `sheet_definitions/**` + `palette_definitions/**` JSON in the upstream repo.
// See src/README.md for the rebuild recipe.
//
// Upstream project: https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator
// ============================================================================

export const COMMIT = "553ba7562534cbf32e7d9a502660f569d6b26512";
export const CDN =
  "https://cdn.jsdelivr.net/gh/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator@" +
  COMMIT +
  "/";

export const FRAME = 64;

export const BODY_TYPES = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "teen", label: "Teen" },
  { key: "muscular", label: "Muscular" },
  { key: "pregnant", label: "Pregnant" },
  { key: "child", label: "Child" },
];

// Row order inside every 4-row LPC sheet (single-row sheets are always row 0).
export const DIR_ROWS = { up: 0, left: 1, down: 2, right: 3 };
export const DIRECTIONS = [
  { key: "up", label: "Up" },
  { key: "left", label: "Left" },
  { key: "down", label: "Down" },
  { key: "right", label: "Right" },
];

// Items whose sheet definition omits an `animations` array get this set.
export const DEFAULT_ANIMS = [
  "spellcast",
  "thrust",
  "walk",
  "slash",
  "shoot",
  "hurt",
  "watering",
];

// Animation table. `folder` is the on-disk folder/file name when it differs
// from the key; `support` lists the metadata animation names that enable it.
export const ANIMS = [
  { key: "walk", label: "Walk", cycle: [1, 2, 3, 4, 5, 6, 7, 8] },
  { key: "idle", label: "Idle", cycle: [0, 0, 1] },
  { key: "run", label: "Run", cycle: [0, 1, 2, 3, 4, 5, 6, 7] },
  { key: "slash", label: "Slash", cycle: [0, 1, 2, 3, 4, 5] },
  {
    key: "thrust",
    label: "Thrust",
    support: ["thrust", "watering"],
    cycle: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  { key: "spellcast", label: "Spellcast", cycle: [0, 1, 2, 3, 4, 5, 6] },
  {
    key: "shoot",
    label: "Shoot",
    cycle: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  { key: "hurt", label: "Hurt", cycle: [0, 1, 2, 3, 4, 5] },
  { key: "climb", label: "Climb", cycle: [0, 1, 2, 3, 4, 5] },
  { key: "jump", label: "Jump", cycle: [0, 1, 2, 3, 4, 1] },
  {
    key: "sit",
    label: "Sit",
    cycle: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  },
  {
    key: "emote",
    label: "Emote",
    cycle: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  },
  // The watering can/shovel/hoe use the `thrust` row with a different cycle.
  {
    key: "watering",
    label: "Watering",
    folder: "thrust",
    support: ["thrust", "watering"],
    cycle: [0, 1, 4, 4, 4, 4, 5],
  },
  {
    key: "combat",
    label: "Combat",
    folder: "combat_idle",
    support: ["combat"],
    cycle: [0, 0, 1],
  },
  {
    key: "1h_slash",
    label: "1H Slash",
    folder: "backslash",
    support: ["1h_slash", "1h_backslash"],
    cycle: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    key: "1h_backslash",
    label: "1H Backslash",
    folder: "backslash",
    support: ["1h_slash", "1h_backslash"],
    cycle: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12],
  },
  {
    key: "1h_halfslash",
    label: "1H Halfslash",
    folder: "halfslash",
    support: ["1h_halfslash"],
    cycle: [0, 1, 2, 3, 4, 5],
  },
];

export const ANIMS_BY_KEY = Object.fromEntries(ANIMS.map((a) => [a.key, a]));

// Y offset of each animation block on the full 832x3456 universal sheet.
export const SHEET_OFFSETS = {
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
  halfslash: 50 * FRAME,
};
export const SHEET_WIDTH = 13 * FRAME;
export const SHEET_HEIGHT = 54 * FRAME;

// ============================================================================
// Custom animations
// ----------------------------------------------------------------------------
// Tools, oversized weapons and a few other items ship art for animations that
// are not part of the standard LPC set. Upstream keeps that art in dedicated
// 64/128/192px custom animation areas appended below the standard sheet, and
// marks the owning layer with a `custom_animation` name (the catalog stores it
// as `ca`). Each area folds the frames of one standard animation (its base -
// e.g. `slash` for `slash_128`) in underneath its own layers, so the body and
// clothing keep moving inside the area while the equipped item swings.
//
// `frames[dirRow][frameIdx]` is a "<sourceRow>,<column>" spec naming the frame
// to lift out of a standard 4-row sheet (or out of a 4-row single-animation
// sprite) when composing the area.
//
// Copied verbatim from upstream `sources/custom-animations.ts` - see
// src/README.md for how to re-sync it.
// ============================================================================

// Direction letter -> row index inside a 4-row (n/w/s/e) sprite.
const DIR_KEY_ROWS = { n: 0, w: 1, s: 2, e: 3 };

export const ANIMATION_ROWS_LAYOUT = {
  "thrust-n": 3,
  "thrust-w": 4,
  "thrust-s": 5,
  "thrust-e": 6,
  "walk-n": 7,
  "walk-w": 8,
  "walk-s": 9,
  "walk-e": 10,
  "slash-n": 11,
  "slash-w": 12,
  "slash-s": 13,
  "slash-e": 14,
  "backslash-n": 45,
  "backslash-w": 46,
  "backslash-s": 47,
  "backslash-e": 48,
  "halfslash-n": 49,
  "halfslash-w": 50,
  "halfslash-s": 51,
  "halfslash-e": 52,
  "sit-n": 29,
  "sit-w": 30,
  "sit-s": 31,
  "sit-e": 32,
};

export const CUSTOM_ANIMATIONS = {
  wheelchair: {
    frameSize: 64,
    frames: [
      ["sit-n,2", "sit-n,2"],
      ["sit-w,2", "sit-w,2"],
      ["sit-s,2", "sit-s,2"],
      ["sit-e,2", "sit-e,2"],
    ],
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
        "thrust-n,3",
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
        "thrust-w,3",
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
        "thrust-s,3",
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
        "thrust-e,3",
      ],
    ],
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
        "slash-n,5",
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,2",
        "slash-w,3",
        "slash-w,4",
        "slash-w,5",
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,2",
        "slash-s,3",
        "slash-s,4",
        "slash-s,5",
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,2",
        "slash-e,3",
        "slash-e,4",
        "slash-e,5",
      ],
    ],
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
        "backslash-n,12",
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
        "backslash-w,12",
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
        "backslash-s,12",
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
        "backslash-e,12",
      ],
    ],
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
        "halfslash-n,5",
      ],
      [
        "halfslash-w,0",
        "halfslash-w,1",
        "halfslash-w,2",
        "halfslash-w,3",
        "halfslash-w,4",
        "halfslash-w,5",
      ],
      [
        "halfslash-s,0",
        "halfslash-s,1",
        "halfslash-s,2",
        "halfslash-s,3",
        "halfslash-s,4",
        "halfslash-s,5",
      ],
      [
        "halfslash-e,0",
        "halfslash-e,1",
        "halfslash-e,2",
        "halfslash-e,3",
        "halfslash-e,4",
        "halfslash-e,5",
      ],
    ],
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
        "thrust-n,7",
      ],
      [
        "thrust-w,0",
        "thrust-w,1",
        "thrust-w,2",
        "thrust-w,3",
        "thrust-w,4",
        "thrust-w,5",
        "thrust-w,6",
        "thrust-w,7",
      ],
      [
        "thrust-s,0",
        "thrust-s,1",
        "thrust-s,2",
        "thrust-s,3",
        "thrust-s,4",
        "thrust-s,5",
        "thrust-s,6",
        "thrust-s,7",
      ],
      [
        "thrust-e,0",
        "thrust-e,1",
        "thrust-e,2",
        "thrust-e,3",
        "thrust-e,4",
        "thrust-e,5",
        "thrust-e,6",
        "thrust-e,7",
      ],
    ],
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
        "slash-n,5",
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,2",
        "slash-w,3",
        "slash-w,4",
        "slash-w,5",
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,2",
        "slash-s,3",
        "slash-s,4",
        "slash-s,5",
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,2",
        "slash-e,3",
        "slash-e,4",
        "slash-e,5",
      ],
    ],
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
        "walk-n,8",
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
        "walk-w,8",
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
        "walk-s,8",
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
        "walk-e,8",
      ],
    ],
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
        "thrust-n,7",
      ],
      [
        "thrust-w,0",
        "thrust-w,1",
        "thrust-w,2",
        "thrust-w,3",
        "thrust-w,4",
        "thrust-w,5",
        "thrust-w,6",
        "thrust-w,7",
      ],
      [
        "thrust-s,0",
        "thrust-s,1",
        "thrust-s,2",
        "thrust-s,3",
        "thrust-s,4",
        "thrust-s,5",
        "thrust-s,6",
        "thrust-s,7",
      ],
      [
        "thrust-e,0",
        "thrust-e,1",
        "thrust-e,2",
        "thrust-e,3",
        "thrust-e,4",
        "thrust-e,5",
        "thrust-e,6",
        "thrust-e,7",
      ],
    ],
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
        "slash-n,0",
      ],
      [
        "slash-w,5",
        "slash-w,4",
        "slash-w,3",
        "slash-w,2",
        "slash-w,1",
        "slash-w,0",
      ],
      [
        "slash-s,5",
        "slash-s,4",
        "slash-s,3",
        "slash-s,2",
        "slash-s,1",
        "slash-s,0",
      ],
      [
        "slash-e,5",
        "slash-e,4",
        "slash-e,3",
        "slash-e,2",
        "slash-e,1",
        "slash-e,0",
      ],
    ],
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
        "slash-n,1",
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,5",
        "slash-w,4",
        "slash-w,3",
        "slash-w,3",
        "slash-w,3",
        "slash-w,2",
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,5",
        "slash-s,4",
        "slash-s,3",
        "slash-s,3",
        "slash-s,2",
        "slash-w,1",
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,5",
        "slash-e,4",
        "slash-e,3",
        "slash-e,3",
        "slash-e,3",
        "slash-e,2",
      ],
    ],
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
        "slash-n,1",
      ],
      [
        "slash-w,0",
        "slash-w,1",
        "slash-w,5",
        "slash-w,4",
        "slash-w,3",
        "slash-w,3",
        "slash-w,3",
        "slash-w,2",
      ],
      [
        "slash-s,0",
        "slash-s,1",
        "slash-s,5",
        "slash-s,4",
        "slash-s,3",
        "slash-s,3",
        "slash-s,2",
        "slash-s,1",
      ],
      [
        "slash-e,0",
        "slash-e,1",
        "slash-e,5",
        "slash-e,4",
        "slash-e,3",
        "slash-e,3",
        "slash-e,3",
        "slash-e,2",
      ],
    ],
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
        "slash-n,0",
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
        "slash-w,0",
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
        "slash-s,0",
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
        "slash-e,0",
      ],
    ],
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
        "slash-n,0",
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
        "slash-w,0",
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
        "slash-s,0",
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
        "slash-e,0",
      ],
    ],
  },
};

// Human labels (upstream keeps these unnamed).
export const CUSTOM_ANIM_LABELS = {
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
  wheelchair: "Wheelchair",
};

/** The standard animation a custom area folds its frames in from. */
function customAnimationBase(def) {
  return def.frames[0][0].split(",")[0].split("-")[0];
}

// Ordered by attack priority: the first equipped match is the primary attack a
// game should play. Kept in sync with CUSTOM_ANIMATIONS.
const CUSTOM_ANIM_ORDER = [
  "slash_oversize", "thrust_oversize", "slash_reverse_oversize", "slash_128",
  "backslash_128", "halfslash_128", "thrust_128", "whip_oversize", "tool_axe",
  "tool_hammer", "tool_whip", "tool_rod", "walk_128", "wheelchair",
];

export const CUSTOM_ANIMS = CUSTOM_ANIM_ORDER.filter((k) => CUSTOM_ANIMATIONS[k]).map((key) => ({
  key,
  def: CUSTOM_ANIMATIONS[key],
  base: customAnimationBase(CUSTOM_ANIMATIONS[key]),
}));
export const CUSTOM_ANIMS_BY_KEY = Object.fromEntries(CUSTOM_ANIMS.map((a) => [a.key, a]));

export function isCustomAnim(key) {
  return !!CUSTOM_ANIMS_BY_KEY[key];
}

/**
 * Everything the engine needs to know about an animation key: frame size,
 * frame count and (for standard animations) the sheet column cycle.
 */
export function animMeta(key) {
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

export function frameSizeFor(key) {
  const m = animMeta(key);
  return m ? m.frameSize : FRAME;
}

/**
 * Frame-slot positions to play for an animation, in order. `getFrame` maps a
 * position to the actual source cell (through the standard cycle, or the
 * custom area's frame spec), so these are always 0..frameCount-1 - never the
 * source columns themselves (passing columns would double-map them).
 */
export function frameIndicesFor(key) {
  const m = animMeta(key);
  if (!m) return [0];
  return Array.from({ length: m.frameCount }, (_, i) => i);
}

// ============================================================================
// Catalog
// ============================================================================

// ============================================================================
// Catalog
// ============================================================================

export async function loadCatalog(url = "src/data/catalog.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load catalog: " + res.status);
  return res.json();
}

export function buildIndexes(cat) {
  const byType = {};
  const nameIndex = {}; // typeName -> normalized name -> itemId
  for (const [id, item] of Object.entries(cat.items)) {
    (byType[item.t] || (byType[item.t] = [])).push(id);
    const idx = nameIndex[item.t] || (nameIndex[item.t] = {});
    const key = normName(item.n);
    if (!(key in idx)) idx[key] = id;
    // also index by full item id suffix for tolerance
    if (!(id in idx)) idx[id] = id;
  }
  for (const list of Object.values(byType)) {
    list.sort((a, b) => cat.items[a].n.localeCompare(cat.items[b].n));
  }
  return { byType, nameIndex };
}

export function normName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function variantToFilename(v) {
  return String(v).replace(/ /g, "_");
}

// ============================================================================
// Capability checks
// ============================================================================

export function supportsBodyType(item, bodyType) {
  return Array.isArray(item.req) && item.req.includes(bodyType);
}

export function animSupportNames(animKey) {
  const anim = ANIMS_BY_KEY[animKey];
  return anim && anim.support ? anim.support : [animKey];
}

export function supportsAnim(item, animKey) {
  if (!item.a || !item.a.length) return false;
  const names = animSupportNames(animKey);
  return names.some((n) => item.a.includes(n));
}

// ============================================================================
// Colors
// ============================================================================

/**
 * Recolor slots of an item. Each slot is keyed by a "group" so that shared
 * colours stay in sync across items (skin follows the body item, eye colour is
 * shared between the head and any face overlay, and so on).
 */
export function colorSlots(item) {
  return (item.r || []).map((entry, idx) => ({
    idx,
    entry,
    group: entry.t || (entry.m === "body" ? "body" : item.t),
    label: entry.lb || entry.t || "Color",
  }));
}

/** The default (unrecoloured) key of a slot - choosing it means "no recolor". */
export function defaultKey(entry) {
  if (entry.s) return "source";
  const b = entry.b || "";
  const parts = b.split(".");
  return parts.length > 1 ? parts.slice(1).join(".") : b;
}

export function parseColorKey(cat, entry, key) {
  if (key === "source") return { material: entry.m, version: "custom", color: "source" };
  const [color, p1, p2] = String(key).split(".").reverse();
  let material = p2;
  let version = p1;
  if (!material && version && cat.materials[version]) {
    material = version;
    version = undefined;
  }
  if (!material) material = entry.m;
  if (!version) version = entry.d;
  return { material, version, color };
}

export function resolvePalette(cat, entry, key) {
  if (key === "source") return entry.s || null;
  const { material, version, color } = parseColorKey(cat, entry, key);
  const pal = cat.materials[material] && cat.materials[material].palettes[version];
  return (pal && pal[color]) || null;
}

export function sourcePalette(cat, entry) {
  if (entry.s) return entry.s;
  const [v, c] = String(entry.b || "").split(".");
  const pal = cat.materials[entry.m] && cat.materials[entry.m].palettes[v];
  return (pal && pal[c]) || null;
}

export function keyLabel(cat, entry, key) {
  if (key === "source") return "Custom";
  const { version, color } = parseColorKey(cat, entry, key);
  const ver = cat.paletteVersions && cat.paletteVersions[version];
  const short = ver ? ver.label : version;
  const name = color.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  return version === entry.d ? name : name + " · " + short;
}

/** All selectable colours for a slot, in catalog order. */
export function colorOptions(cat, entry) {
  const out = [];
  if (entry.s) out.push({ key: "source", colors: entry.s, label: "Custom" });
  const list = entry.var === undefined ? [] : cat.varPool[entry.var] || [];
  for (const key of list) {
    const colors = resolvePalette(cat, entry, key);
    if (colors) out.push({ key, colors, label: keyLabel(cat, entry, key) });
  }
  return out;
}

/** Best-effort swatch ramp for a variant name (used by variant-only items). */
export function variantSwatch(cat, name) {
  const needle = String(name).toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
  const order = [
    ["hair", ["ulpc", "lpcr"]],
    ["body", ["ulpc", "lpcr"]],
    ["cloth", ["ulpc"]],
    ["metal", ["ulpc"]],
    ["wood", ["ulpc", "lpcr"]],
    ["all", ["lpcr"]],
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

// ---- recolor lookup -------------------------------------------------------

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
}

/**
 * Flatten (source -> target) palette pairs into a single RGB lookup table.
 * Tolerance is 1 per channel, matching upstream. First mapping wins, matching
 * upstream's first-match-wins search order.
 */
export function buildLookup(pairs) {
  const map = new Map();
  for (const { source, target } of pairs) {
    const n = Math.min(source.length, target.length);
    for (let i = 0; i < n; i++) {
      const s = hexToRgb(source[i]);
      const t = hexToRgb(target[i]);
      if (!s || !t) continue;
      const packed = (t.r << 16) | (t.g << 8) | t.b;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dg = -1; dg <= 1; dg++) {
          for (let db = -1; db <= 1; db++) {
            const r = s.r + dr;
            const g = s.g + dg;
            const b = s.b + db;
            if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) continue;
            const k = (r << 16) | (g << 8) | b;
            if (!map.has(k)) map.set(k, packed);
          }
        }
      }
    }
  }
  return map;
}

/** Build the recolor lookup for an item from the resolved colour map. */
export function itemLookup(cat, item, colors) {
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

/** Stable signature of an item's resolved colours (used as a frame cache key). */
export function colorSignature(item, colors) {
  return colorSlots(item)
    .map((s) => s.group + "=" + (colors[s.group] || defaultKey(s.entry)))
    .join(",");
}

// ============================================================================
// Sprite paths
// ============================================================================

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

/** Sheet path for a resolved layer base + animation folder. */
export function sheetPathFor(layer, animKey) {
  const anim = ANIMS_BY_KEY[animKey];
  const folder = (anim && anim.folder) || animKey;
  return layer.variant
    ? "spritesheets/" + layer.base + folder + "/" + variantToFilename(layer.variant) + ".png"
    : "spritesheets/" + layer.base + folder + ".png";
}

/**
 * Path of one layer's sheet for an animation, relative to the repo root.
 * Returns null when the layer has no art for this body type / head.
 */
export function spritePath(cat, item, selections, opts) {
  const layer = item.l[opts.layerIdx];
  if (!layer) return null;
  let base = layer[opts.bodyType];
  if (!base) return null;
  if (base.includes("${")) {
    base = replaceInPath(item, base, selections, cat);
    if (!base) return null;
  }
  const variant = item.v && item.v.length ? opts.variant || item.v[0] : null;
  return sheetPathFor({ base, variant }, opts.anim);
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

/** Direct path of a custom-animation sprite (`<base><variant>.png`, no folder). */
export function customSpritePath(base, variant) {
  return "spritesheets/" + base + (variant ? variantToFilename(variant) : "") + ".png";
}

/**
 * Every drawable layer for the current state, sorted back-to-front.
 *
 * A descriptor's `kind` says how to get a frame out of `path`:
 *   "std"     - a standard per-animation sheet; frame (dirRow, frameIdx) is
 *               (cycle[frameIdx], dirRow) at 64px.
 *   "extract" - a standard sheet folded into a custom area; the source
 *               (row, column) comes from the custom animation's frame spec.
 *   "single"  - a custom sprite that is itself a 4-row single-animation sheet
 *               (native frame size = height / 4); the source frame comes from
 *               the spec.
 *   "area"    - a pre-built custom-area sprite whose frame grid already matches
 *               the custom animation.
 * Callers that only need "does anything draw for this animation" can use the
 * length; `getFrame` turns one descriptor into a canvas.
 */
export function collectLayers(cat, state, animKey, opts = {}) {
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
      cycle: meta.custom ? null : meta.cycle,
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
        // Layers owned by a custom animation only exist inside their area.
        if (layer.ca) continue;
        const base = resolveLayerBase(item, layer, state.bt, items, cat);
        if (!base) continue;
        push(sel, item, layer, sheetPathFor({ base, variant }, animKey), "std", lookup, sig);
      }
    }
  } else {
    const def = meta.def;
    // 1. Fold in every item that supports the area's base animation (body,
    //    hair, clothes, ...) so the character keeps animating underneath.
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
    // 2. The area's own layers (the equipped tool/weapon art).
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

// ============================================================================
// Equipment <-> animation association
// ============================================================================

/**
 * Custom animations the current equipment actually provides art for, in attack
 * priority order. Standard animations are always renderable (the body has
 * them), so they are not listed here.
 */
export function customAnimsFor(cat, state) {
  const present = new Set();
  for (const sel of Object.values(state.sel || {})) {
    if (!sel || !sel.item) continue;
    const item = cat.items[sel.item];
    if (!item || !supportsBodyType(item, state.bt)) continue;
    for (const layer of item.l || []) if (layer.ca) present.add(layer.ca);
  }
  return CUSTOM_ANIMS.filter((a) => present.has(a.key)).map((a) => a.key);
}

/** Every animation that can be previewed/exported for this state. */
export function availableAnimations(cat, state) {
  return ANIMS.map((a) => a.key).concat(customAnimsFor(cat, state));
}

/** Which equipped item provides which custom animations (for UI/debugging). */
export function equipmentAnimations(cat, state) {
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
      animations: CUSTOM_ANIMS.filter((a) => keys.includes(a.key)).map((a) => a.key),
    });
  }
  return out;
}

const ATTACK_BASES = new Set(["slash", "thrust", "backslash", "halfslash"]);

/** Items that can drive an attack: held weapons/tools (not clothing). */
function isWeaponItem(item) {
  return item.t === "weapon" || String(item.t || "").startsWith("weapon_");
}

/**
 * Ordered list of animation keys suitable for "the character attacks".
 * Equipment-authored custom animations come first (e.g. `slash_128` for an
 * arming sword, the axe swing for a tool), then the standard attack animations
 * the held weapon supports (a bow has no custom attack, so this yields `shoot`;
 * a plain dagger yields `slash`). Empty when nothing attack-like is equipped.
 */
export function attackAnimations(cat, state) {
  const out = customAnimsFor(cat, state).filter((k) => ATTACK_BASES.has(CUSTOM_ANIMS_BY_KEY[k].base));
  const weapons = Object.values(state.sel || {})
    .map((sel) => sel && cat.items[sel.item])
    .filter((item) => item && supportsBodyType(item, state.bt) && isWeaponItem(item));
  for (const key of ["shoot", "slash", "thrust", "spellcast"]) {
    if (out.includes(key)) continue;
    if (weapons.some((item) => supportsAnim(item, key))) out.push(key);
  }
  return out;
}

/**
 * The animation a game should actually play when it wants `base`, given the
 * equipment. Items whose art lives only in a custom area supersede the standard
 * animation it was authored from: a bow's `walk` becomes `walk_128` (otherwise
 * the bow vanishes while walking), an arming sword's `slash` becomes
 * `slash_128`, a wheelchair's `sit` becomes `wheelchair`. Returns `base`
 * unchanged when no equipped item provides a replacement.
 */
export function resolveAnimation(cat, state, base) {
  for (const key of customAnimsFor(cat, state)) {
    const anim = CUSTOM_ANIMS_BY_KEY[key];
    if (anim && anim.base === base) return key;
  }
  return base;
}

/**
 * Every standard animation mapped to the animation the current equipment
 * supersedes it with (see `resolveAnimation`). Keys whose value equals the key
 * are unaffected by the equipment.
 */
export function animationMap(cat, state) {
  const out = {};
  for (const anim of ANIMS) out[anim.key] = resolveAnimation(cat, state, anim.key);
  return out;
}

// ============================================================================
// Frame loading / recolouring
// ============================================================================

// ============================================================================
// Frame loading / recolouring
// ============================================================================

const MAX_FRAMES = 2400;
const imageCache = new Map(); // path -> Promise<ImageBitmap>
const frameCache = new Map(); // cacheKey -> canvas

export function loadSprite(path) {
  let p = imageCache.get(path);
  if (!p) {
    p = fetch(CDN + path)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      })
      .then((b) => createImageBitmap(b));
    p.catch(() => {});
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
    // drop the oldest ~10%
    let n = Math.floor(MAX_FRAMES * 0.1);
    for (const k of frameCache.keys()) {
      frameCache.delete(k);
      if (--n <= 0) break;
    }
  }
  frameCache.set(key, value);
}

export function recolorCanvas(canvas, lookup) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = new Uint32Array(img.data.buffer);
  let touched = false;
  for (let i = 0; i < px.length; i++) {
    const v = px[i];
    const a = v & 0xff000000;
    if (!a) continue;
    const key = ((v & 0xff) << 16) | (((v >>> 8) & 0xff) << 8) | ((v >>> 16) & 0xff);
    const t = lookup.get(key);
    if (t === undefined) continue;
    px[i] = a | ((t & 0xff) << 16) | (((t >>> 8) & 0xff) << 8) | ((t >>> 16) & 0xff);
    touched = true;
  }
  if (touched) ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Source (row, column) of one frame of a custom animation, from its
 * `"<sourceRow>,<column>"` spec.
 */
function customFrameSource(def, dirRow, frameIdx) {
  const spec = def.frames[dirRow][frameIdx];
  const comma = spec.indexOf(",");
  const rowName = spec.slice(0, comma);
  const srcCol = parseInt(spec.slice(comma + 1), 10) || 0;
  const dir = rowName.slice(rowName.indexOf("-") + 1);
  return { srcRow: DIR_KEY_ROWS[dir] === undefined ? 0 : DIR_KEY_ROWS[dir], srcCol };
}

/**
 * One frame of one layer, already recoloured, as a `frameSize` x `frameSize`
 * canvas (`frameSize` is 64 for standard animations, 64/128/192 for custom
 * ones). Cached, so repeated draws of the same item/frame/colour are free.
 *
 * The cache key includes the layer's sheet path: without it, two layers that
 * share a kind/animation/direction/frame would collide - e.g. an item's `bg`
 * and `fg` custom sprites (only one of which holds art for a given direction),
 * or body/head/face, which all have no recolour to tell them apart.
 */
export async function getFrame(layer, dirRow, frameIdx) {
  const key =
    layer.kind +
    "|" +
    layer.animKey +
    "|" +
    dirRow +
    "|" +
    frameIdx +
    "|" +
    layer.path +
    "|" +
    (layer.lookup ? layer.sig : "-");
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
    // The sprite's frame grid already matches the area.
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
  // Some standard per-animation sheets are authored with fewer than 4 rows -
  // upstream's `hurt` and `climb` are a single front-facing row. Fall back to
  // the last available row so the character shows that pose in every direction
  // instead of vanishing (upstream's own preview does the same).
  if (layer.kind === "std" && srcRow >= rows) srcRow = rows - 1;
  if (srcCol >= cols || srcRow >= rows) {
    cachePut(key, null);
    return null;
  }
  const canvas = newCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  // Smaller sources are centred in the area, exactly like upstream.
  const off = Math.round((size - srcFrame) / 2);
  ctx.drawImage(img, srcCol * srcFrame, srcRow * srcFrame, srcFrame, srcFrame, off, off, srcFrame, srcFrame);
  if (layer.lookup) recolorCanvas(canvas, layer.lookup);
  cachePut(key, canvas);
  return canvas;
}

// ============================================================================
// Rendering
// ============================================================================

/**
 * Render one frame of the character into `ctx` at (0,0) of a `frameSize` box.
 * Returns the number of layers that were queued.
 */
export async function renderFrame(ctx, cat, state, animKey, frameIdx, row, layers) {
  const list = layers || collectLayers(cat, state, animKey);
  const size = frameSizeFor(animKey);
  const frames = await Promise.all(list.map((l) => getFrame(l, row, frameIdx)));
  ctx.clearRect(0, 0, size, size);
  for (const f of frames) if (f) ctx.drawImage(f, 0, 0);
  return list.length;
}

/** Preload every frame of an animation so playback can be synchronous. */
export async function prepareAnimation(cat, state, animKey, row, layers) {
  const idx = frameIndicesFor(animKey);
  const list = layers || collectLayers(cat, state, animKey);
  const frames = await Promise.all(
    idx.map(async (frameIdx) => {
      const set = await Promise.all(list.map((l) => getFrame(l, row, frameIdx)));
      return set.filter(Boolean);
    }),
  );
  return { frames, cycle: idx };
}

/**
 * Full LPC sheet for download: the standard 832x3456 sheet, plus one area per
 * custom animation the equipment provides (appended below it, in the same
 * order the engine lays them out).
 */
export async function renderFullSheet(cat, state, onProgress) {
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
      layers: collectLayers(cat, state, key),
    };
    y += area.height;
    areas.push(area);
  }
  const width = Math.max(SHEET_WIDTH, ...areas.map((a) => a.width));
  const canvas = newCanvas(width, y);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const jobs = [];
  const paths = new Set();
  for (const anim of ANIMS) {
    for (const layer of collectLayers(cat, state, anim.key)) {
      jobs.push({ layer, y: SHEET_OFFSETS[anim.folder || anim.key] });
      paths.add(layer.path);
    }
  }
  for (const area of areas) for (const layer of area.layers) paths.add(layer.path);

  // Preload every distinct sheet concurrently - the network is the bottleneck
  // here, so this is what makes a full-sheet export take seconds not minutes.
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
        /* missing animation for this item - fine */
      }
      loaded++;
      if (onProgress) onProgress((loaded / uniq.length) * 0.8);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONC, uniq.length) }, worker));

  // Standard bands: one whole (recoloured) sheet per layer, at its band offset.
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
      /* missing animation for this item - fine */
    }
    done++;
    if (onProgress && done % 8 === 0) {
      onProgress(0.8 + 0.2 * (done / total));
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // Custom areas: one frame at a time, in the engine's z order.
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

/** One animation's sheet: 4 direction rows x one column per played frame. */
export async function renderAnimSheet(cat, state, animKey, onProgress) {
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

// ============================================================================
// Share links (upstream-compatible hash format)
// ============================================================================

export function encodeHash(cat, state) {
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
  // full colour map for exact round-tripping (ignored by upstream)
  const cols = [];
  for (const [group, key] of Object.entries(state.colors)) cols.push(group + ":" + key);
  if (cols.length) params.c = cols.join(",");
  return Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
    .join("&");
}

export function decodeHash(cat, indexes, hash) {
  let s = (hash || "").replace(/^#/, "").replace(/^\?/, "");
  if (!s) return null;
  const params = {};
  for (const pair of s.split("&")) {
    const i = pair.indexOf("=");
    if (i < 0) continue;
    try {
      params[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1));
    } catch (e) {
      /* skip malformed */
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
    // value forms: "Name_variant", "Name_color", or "Name_variant|recolor"
    const bar = raw.indexOf("|");
    const head = bar >= 0 ? raw.slice(0, bar) : raw;
    const extra = bar >= 0 ? raw.slice(bar + 1) : "";
    let itemId = null;
    let tail = "";
    // longest matching item name wins (names may contain underscores)
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
      if (!match) continue; // unknown variant - skip this selection entirely
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

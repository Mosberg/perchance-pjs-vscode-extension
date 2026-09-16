# LPC Character Creator — source notes

A self-contained Universal LPC Spritesheet character creator. It composites the
upstream sprite layers on a `<canvas>` at runtime (no iframe wrapper), with live
palette recolouring, animation preview, sheet export, saves and
upstream-compatible share links.

The same generator **doubles as an importable plugin**: another Perchance
generator can import it and mount the creator (or use the stateless sprite
renderers) as the character creator for a game. See [Plugin API](#plugin-api).

- Upstream project: <https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator>
- Upstream live page: <https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/>

## Files

| File | Role |
| --- | --- |
| `main.pjs` | `$meta` (title/description/tags), `kv = {import:kv-plugin}`, and the `$output` plugin object (`lpcCreatorPlugin()`) that importers receive. Holds the hosted `BUNDLE_URL` / `CATALOG_URL`. |
| `index.html` | Thin host only: a full-height `#lpcHost` div plus a module script that calls `mountLpcCreator(hostEl, ...)`. All UI lives in `src/ui.js`. |
| `src/ui.js` | The app shell as two exported strings: `LPC_CSS` (shadow-scoped styles) and `LPC_HTML` (topbar + layout + modal). Injected into the shadow root by `creator.js`. |
| `src/engine.js` | Pure sprite engine: catalog load, layer collection/z-sorting, sprite fetch + frame extraction + palette recolouring, custom-animation playback, sheet rendering, share-hash encode/decode. No DOM ownership, and the source of the stateless plugin helpers. |
| `src/creator.js` | App layer + public API: state, UI wiring, animated preview, randomiser, save/library, share, PNG export; exports the plugin API and installs the `window.__lpc` controller. |
| `src/data/catalog.json` | **657 items** + category tree + credits, generated from the upstream definitions (see below). ~719 KB. Also uploaded so importers can load it cross-origin. |

## Sprite art: pinned CDN

Art is **hot-linked** at runtime from jsDelivr, pinned to one upstream commit so
the file layout can never shift (`src/engine.js`):

```
https://cdn.jsdelivr.net/gh/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator@553ba7562534cbf32e7d9a502660f569d6b26512/
```

To move to a newer upstream commit: bump `COMMIT` in `engine.js`, then rebuild
`catalog.json` and the custom-animation table (see below) and re-verify. Nothing
else hard-codes the commit.

### Sprite path rules (verified)

- Item with no variants: `spritesheets/<basePath><animFolder>.png`
- Item with variants: `spritesheets/<basePath><animFolder>/<variantFilename>.png`
- `animFolder` differs from the animation key for: `combat`→`combat_idle`,
  `1h_slash`/`1h_backslash`→`backslash`, `1h_halfslash`→`halfslash`. `thrust` is
  enabled by `thrust` **or** `watering`.
- Rows are always `up=0, left=1, down=2, right=3`; single-row sheets use row 0.
  `hurt` and `climb` are authored as a **single front-facing row** (upstream's
  own config marks them `num: 1`), so every direction falls back to that row —
  without the fallback the whole character renders blank in those animations.
- Palette recolour key prefix: `mat !== entry.m ? mat + "." : ""` +
  `version !== entry.d ? version + "." : ""` + colour.

## Custom animations (tools, oversized weapons, wheelchair)

Upstream ships art for animations that are **not** part of the standard LPC set
(axe swings, oversize slashes, fishing rod, whip, wheelchair, and 128px walk /
slash sheets). That art lives in dedicated **64 / 128 / 192 px custom animation
areas appended below the standard 832×3456 sheet**. A layer that belongs to such
an area carries a `custom_animation` name; the catalog stores it as the **`ca`**
field on the layer, and the item's own art is deliberately absent from the
standard sheet paths.

The engine (`CUSTOM_ANIMATIONS` in `engine.js`, copied verbatim from upstream
`sources/custom-animations.ts`) knows, for each area, which standard-animation
frame each of its cells was lifted from (`"<sourceRow>,<column>"`, e.g.
`"slash-n,5"`). When the character plays a custom animation, `collectLayers`
**folds in every item that supports the area's base animation first** (body,
hair, clothes…) so the character keeps moving underneath, then draws the
area's own layers (the equipped tool/weapon). This is why a swing shows a whole
animated character with the weapon attached, not a floating weapon.

| key | label | base | frameSize | frames | source kind |
| --- | --- | --- | --- | --- | --- |
| `slash_oversize` | Slash (oversize) | slash | 192 | 6 | area |
| `thrust_oversize` | Thrust (oversize) | thrust | 192 | 8 | area |
| `slash_reverse_oversize` | Reverse slash (oversize) | slash | 192 | 6 | area |
| `slash_128` | Slash (128) | slash | 128 | 6 | area |
| `backslash_128` | Backslash (128) | backslash | 128 | 13 | area |
| `halfslash_128` | Halfslash (128) | halfslash | 128 | 6 | area |
| `thrust_128` | Thrust (128) | thrust | 128 | 8 | area |
| `whip_oversize` | Whip (oversize) | slash | 192 | 8 | area |
| `tool_whip` | Whip | slash | 192 | 8 | area |
| `tool_rod` | Fishing rod | thrust | 128 | 13 | area |
| `walk_128` | Walk (128) | walk | 128 | 9 | area |
| `wheelchair` | Wheelchair | sit | 64 | 2 | area |
| `tool_axe` | Axe swing | slash | 128 | 10 | single |
| `tool_hammer` | Hammer swing | slash | 128 | 9 | single |

- `CUSTOM_ANIM_LABELS` gives the human labels (upstream keeps them unnamed).
- `CUSTOM_ANIM_ORDER` is **attack priority** — the first equipped match is the
  primary attack a game should play.
- `walk_128` sets `skipFirstFrameInPreview` — frame 0 is the standing pose, so
  the live preview loop starts at frame 1. Exported sheets keep every frame.

Frame-source kinds (a layer descriptor's `kind`):

- `std` — a standard per-animation sheet; `(dirRow, frameIdx)` → column
  `cycle[frameIdx]`.
- `extract` — a standard sheet folded into a custom area; source `(row, column)`
  comes from the custom animation's frame spec.
- `single` — a custom sprite that is itself a 4-row single-animation sheet
  (native frame size = `height / 4`); only `tool_axe` / `tool_hammer`.
- `area` — a pre-built custom-area sprite whose frame grid already matches the
  custom animation (source column = frame index).

`getFrame`'s cache key includes the layer **path** — without it, an item's `bg`
and `fg` area sprites (only one of which carries art per direction) and the body
layers would collide and return each other's blank canvas.

## `src/data/catalog.json` schema

```
{
  v: 1,
  commit: "<upstream commit the metadata came from>",
  paletteVersions: { custom|ulpc|lpcr: {...} },   // palette generation versions
  materials: { <material>: {label|type, ...} },   // recolour material table
  varPool: [ "<recolour-variant>", ... ],         // deduped strings items reference
  items: {
    "<id>": {
      n: "Display name", t: "type_name", req: ["male","female",...],
      a: ["walk","idle",...],                      // supported animations
      l: [{ z, ca, male: "path/", female: "path/", ... }],  // layers per body type
                                                   //   `ca: "<custom-anim-key>"` marks a
                                                   //   layer that only exists inside that
                                                   //   custom area (see above)
      v: ["variant", ...],                         // optional: variants
      mbc: 0,                                      // material-body-colour index
      r: [{ m, t, lb, d, b, var }],                // recolour entries (`var` -> varPool)
      rip: [...], tg: [...], rt: [...],            // rarity/tag/random-table hints
      cr: ["credit-key", ...]
    }, ...
  },
  tree: [ { id, label, path, priority, items:[id], children:[...] } ],  // category tree
  credits: { "<key>": { a:[authors], l:[licenses], u:[urls], n:"notes" } },
}
```

Items that omit `animations` upstream (they inherit `DEFAULT_ANIMS`) were
pre-patched in the catalog to the explicit default set.

The 657 items break down as: Body 30, Head 92, Hair 122, Headwear 155, Arms 11,
Torso 102, Legs 22, Feet 17, Tools 8, Weapons 97, Wheelchair 1 (11 tree roots).
**32 items carry `ca` layers** (85 layers total) — the tools/weapons/wheelchair
whose art lives only in custom areas.

## Rebuilding `catalog.json`

The catalog is derived from the upstream `sheet_definitions/**` + tree
definitions, cross-checked against the upstream built metadata modules
(`dist/item-metadata.js`, `dist/layers-metadata.js`) so `type_name`, `required`,
`animations` and `mbc` match upstream exactly. Recipe:

1. `fetch_url` the repo archive at the pinned commit, e.g.
   `https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/archive/<COMMIT>.zip`,
   unzip in `execute_js` (`@zip.js/zip.js`) and read every
   `sheet_definitions/**/*.json` (these are the per-item definitions: name,
   `type_name`, `required`, `animations`, `recolors`, `layers`, variants, and
   `custom_animation` names on layers).
2. Parse the category tree source and the credits source from the same archive.
3. Fetch the built metadata modules from
   `https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/dist/item-metadata.js`
   (and `layers-metadata.js`) and use them to validate/patch `required` /
   `animations` / `mbc` (upstream computes some of these at build time).
4. Emit `src/data/catalog.json` with the schema above, deduping recolour/credit
   strings into `varPool`/`credits` and copying each layer's `custom_animation`
   to `ca`.
5. `page_refresh` and sanity-check: 11 tree roots totalling 657 items, 32 items
   with `ca` layers, the default male character renders, and a full-sheet export
   (including custom areas) completes.

## Plugin API

Import this generator by name from another generator, then use `root.<alias>`:

```pjs
// main.pjs of the host generator
lpc = {import:lpc-character-creator}   // <- this generator's name
```

The importer receives the object built by `lpcCreatorPlugin()` in `main.pjs`.
It lazily `import()`s a pre-bundled ES module and injects this generator's own
hosted asset URLs, so the host never has to know them:

| Member | Signature | Notes |
| --- | --- | --- |
| `mount(container, opts)` | `async -> controller` | Mounts the full creator UI *inside* `container` (Shadow DOM), returns a controller. `opts`: `{ height, character, hash, catalogUrl }`. `height` defaults to `min(760px, 85vh)`; pass `false` to keep your own CSS height. |
| `open(opts)` | `async -> character \| null` | Full-screen overlay with "Cancel" / "Use this character" buttons (and Escape). Resolves with the chosen character, or `null` if cancelled. |
| `createSprite(character, opts)` | `async -> sprite` | Stateless runtime sprite for a game loop: `{ character, frameSize, maxFrameSize, scale, animations, attackAnim, attackAnims, getFrame(anim,dir,i), frameCount(anim), frameSizeFor(anim), fps(anim), resolve(anim), draw(ctx,x,y,{anim,dir,frame,scale,anchor}) }`. `anchor` defaults to `"bottom-center"`. |
| `renderFrame(character, opts)` | `async -> canvas` | One frame at the animation's frame size (×`scale`). `opts`: `{ anim, dir, frame, scale, catalogUrl }`. |
| `renderAnimSheet(character, anim, opts)` | `async -> canvas` | One animation's full sheet (every direction × frame). |
| `renderFullSheet(character, opts)` | `async -> canvas` | The complete sheet: standard 832×3456 **plus** one block per custom animation the equipment provides. |
| `animationsFor(character, opts)` | `async -> {available, standard, custom, attacks}` | What a character can play: `custom` = equipment-authored animations, `attacks` = ordered attack keys (custom attack areas first, then `shoot`/`slash`/`thrust`/`spellcast` the held weapon supports). |
| `attackAnimation(character, opts)` | `async -> string \| null` | The single best attack animation key, or `null` if nothing attack-like is equipped. |
| `animationMap(character, opts)` | `async -> { <base>: <actual> }` | Every standard animation mapped to the animation the equipment supersedes it with — e.g. a bow maps `walk → walk_128`, an arming sword maps `slash → slash_128`, a wheelchair maps `sit → wheelchair`. Unaffected keys map to themselves, so a game can play `map[logicalAnim]` and get the equipped item's art. |
| `equipmentAnimations(character, opts)` | `async -> [{type, itemId, name, animations}]` | The **equipped-item ↔ animation association**: one entry per item that brings its own animation art (e.g. `{ name: "Arming Sword", animations: ["slash_128","backslash_128","halfslash_128"] }`). |
| `characterToCode(character)` / `characterFromCode(code)` | `async -> string` / `async -> character` | Share-code round-trip (upstream-compatible `sex=&body=&head=…`, plus an exact-colour `c=` param). |
| `getCatalog()` | `async -> catalog` | The parsed item catalog, for custom UIs. |
| `load()`, `version`, `bundleUrl`, `catalogUrl` | — | Escape hatches: raw module / metadata. |

`character` is either a share-code string (`"sex=female&body=…"`) or an object
`{ bt, sel, colors }`, as returned by `controller.getCharacter()`.

### Equipped items and animations

This is the important part for a game: **the character's appearance always
reflects what it has equipped, in every animation, including attacks.**

- A held **weapon/tool** supplies its own custom area art. Ask for the animation
  set with `animationsFor(character)`, the item↔animation map with
  `equipmentAnimations(character)`, and play `attackAnimation(character)` when the
  character attacks. E.g. an arming sword → `slash_128` / `backslash_128` /
  `halfslash_128`; an axe → `tool_axe`; a bow → standard `shoot` (with its art
  folded into `walk_128` for walking); a wheelchair → a sit-based area.
- Some items only ship art for a custom area, so their declared animation has no
  standard-sheet art (bows, katana and scimitar have no standard `walk`; upstream
  404s). `animationMap(character)` / `sprite.resolve(anim)` tell you the
  animation to play instead (`walk` → `walk_128`), so the item still shows. This
  is the equipment↔animation association a game should drive its animation
  state machine from.
- `createSprite` automatically pre-renders the requested `anims` **plus** every
  equipment-authored animation and the primary attack, so the weapon never
  disappears mid-swing even if the game only asked for `["idle","walk"]`. Turn
  this off with `{ includeEquipmentAnims: false }`, or override the attack with
  `{ attackAnim: "..." }` / `{ attackAnim: false }`.
- `maxFrameSize` / `frameSizeFor(anim)` tell you an area is larger than the
  standard 64px (128px or 192px), so draw the character with the right box when
  it swings an oversize weapon.

### Controller (returned by `mount`)

`getCharacter()`, `setCharacter(character)`, `getCode()`, `setCode(code)`,
`catalog()`, `randomize()`, `onChange(cb) -> unsubscribe`, `renderFrame(...)`,
`renderAnimSheet(...)`, `renderFullSheet(...)`, `animationsFor()`,
`attackAnimations()`, `attackAnimation()`, `animationMap()`,
`resolveAnimation(base)`, `equipmentAnimations()`,
`destroy()`. It is also exposed globally (per page) as `window.__lpc`.

### Typical RPG usage

```js
lpcCreator = {import:lpc-character-creator}

let controller = await root.lpcCreator.mount(document.getElementById("creator"), { character: savedCode });
controller.onChange((c) => { localStorage.setItem("hero", JSON.stringify(c)); });
// later, in the game loop:
let hero = await root.lpcCreator.createSprite(character, { anims: ["idle","walk","run"], scale: 2 });
let attack = await root.lpcCreator.attackAnimation(character);   // e.g. "slash_128" or "shoot"
hero.draw(ctx2d, x, y, { anim: attacking ? attack : "walk", dir: "left", frame: tick });
```

## Building the plugin bundle

`$output` does **not** point at `src/creator.js` directly — the creator is a
multi-file ES-module graph and importers can't import a generator's `src/`
files. Instead a single self-contained ES module is built from the sources and
hosted, and `main.pjs`'s `lpcCreatorPlugin()` embeds that URL plus the catalog
URL. Rebuild it whenever `src/*.js` changes (and bump `PLUGIN_VERSION` in
`creator.js`):

1. Bundle with esbuild (works from `execute_js`):
   ```js
   const esbuild = (await import("https://esm.sh/esbuild-wasm@0.21.5")).default;
   await esbuild.initialize({ wasmURL: "https://esm.sh/esbuild-wasm@0.21.5/esbuild.wasm" });
   // - entry: `export * from "./creator.js"` with resolveDir "src"
   // - bundle:true, format:"esm", write:false, and a tiny onResolve/onLoad plugin
   //   that maps "./x" to workspace files read via `fs.readTextFile`
   // -> write to scratch/plugin/lpc-creator-plugin.js
   ```
2. `upload_file scratch/plugin/lpc-creator-plugin.js` and
   `upload_file src/data/catalog.json`.
3. Paste the two returned URLs into `BUNDLE_URL` / `CATALOG_URL` in `main.pjs`.
4. `page_refresh`, then verify `root.$output.version` and, e.g.,
   `await root.$output.animationsFor(character)` in the live page.

Last built: `PLUGIN_VERSION` **1.4.1**, bundle
<https://user.uploads.dev/file/5055a3d3b25948a3c6980c81491f9e3c.js>,
catalog
<https://user.uploads.dev/file/62294525be9572725bf48e04093c8adb.json>.

## `window.__lpc` debug hook

`src/creator.js` installs the active controller as `window.__lpc` for
console/preview inspection (see the controller list above).

## Behaviour notes
- The whole UI is injected into a **Shadow DOM** root (`prepareHost` in
  `creator.js`), so its ids/classes/styles can't leak into or collide with a host
  generator. `vision`/`querySelector` from outside can't pierce it — reach the
  preview via `container.shadowRoot`.
- Saves/library live in the `kv` plugin folder **`lpcCharacters`** (per-user,
  survives reloads) so a host generator's own kv data can't collide.
- `$meta.image` (in `main.pjs`) is a 1440×900 JPEG screenshot of the UI, hosted at
  `https://user.uploads.dev/file/4b4e2412916737e0955207d055e5149f.jpg`. Rebuild it by
  loading a nice character, `set_viewport_size(1440, 900)`, snapshotting the live page
  (the agent's `snapshot.js` helper), downscaling to 1440×900 JPEG and uploading it. It
  exists because the platform screenshotter does not reliably capture a canvas preview.
- `#previewCanvas` is sized by `fitCanvasToStage()`: it renders at
  `frameSizeFor(anim) * zoom` and is scaled to fit the stage, preferring crisp integer
  downscales (1/2, 1/3, …) unless that costs more than ~15% of the available space.
- The animation `<select>` (`refreshAnimOptions`) lists the standard animations plus a
  labelled entry per custom animation the equipment provides, e.g.
  `"Slash (128) — Arming Sword"`, and the stage badge names the contributing item(s).
- **Animation frame indexing contract:** `frameIndicesFor(key)` returns frame *slot
  positions* (`0..frameCount-1`), never source columns. `getFrame` is the single place
  that maps a position to the actual cell — through the standard `cycle`
  (`layer.cycle[frameIdx]`, so repeated entries like `idle:[0,0,1]` hold frames) or the
  custom area's `def.frames[row][frameIdx]` spec. Every caller (preview, tiles,
  `drawFrameCanvas`, `prepareAnimation`, `renderAnimSheet`) passes positions. Passing
  columns instead double-maps them — that skipped the first walk frame, collapsed
  `idle`/`sit` to a freeze, and made the sprite **vanish** on the out-of-range final
  frame. Don't feed columns in.
- Full-sheet export preloads every distinct spritesheet with 10-way concurrency
  (`renderFullSheet` in `engine.js`) — keep that parallel preload, it is the
  difference between ~2 s and ~50 s. The sheet grows below 3456 into one block per
  custom animation (width = `max(832, widest area)`, e.g. 1664×4992 for an arming
  sword, 1536×5760 for three 192px areas).
- Layout is a fixed-height app (panels scroll internally) above 1240px, and
  normal page flow with 2 columns (≤1240) / 1 column (≤900) below that.
- Colour "upgrade" keys (e.g. `lpcr.red`, `all.lpcr.mustard`) are carried in an
  extra `c=` parameter in share links; upstream ignores it but still opens the
  link with the base palette colour.

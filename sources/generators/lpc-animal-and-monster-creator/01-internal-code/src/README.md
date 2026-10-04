# LPC Animal & Monster Creator

A browser for the animal, monster and mythical-creature sprite sheets in the LPC
style: animated 4-direction previews, sprite-sheet/manifest export, a Playground
that demos the runtime sprite API, and an importable plugin facade so a game can
drop the same creatures straight onto a map.

Created by **Mosberg** — <https://github.com/Mosberg>.
Live generator: <https://perchance.org/lpc-animal-and-monster-creator>.

Dataset: **39 creatures · 59 variants · 118 animations · 1392 frames**, drawn from
**17 OpenGameArt packs** (full attribution in `catalog.json → packs`).

---

## 1. File map

```
main.pjs                      the generator's pjs file: $meta, the kv import, and the
                              `lpcAnimalMonsterCreator()` / `animalCreatorStore()` facade
index.html                    body-only page: styles, #appCtn, boot spinner, and the
                              module script that mounts the editor UI
src/lpc-creatures/
  core.js                     UI-FREE engine. Catalog loading, frame extraction, sheet
                              rendering, manifests, createSprite(). Safe to import alone.
  app.js                      the editor UI (shadow DOM, 3 tabs, filters, rAF loop,
                              export/share/credits modals, playground, hash sync).
  styles.js                   one exported CSS string (used by the shadow root).
  index.js                    entry for THIS page: mountAnimalCreator / openAnimalCreator.
  catalog.json                the shipped dataset (see §4).
  urls.json                   rel-path → hosted sheet URL map (durable rebuild source).
src/plugin.js                 the importable facade (bundled into the hosted plugin, §3).
src/sheets/<group>/*.png      97 source sprite sheets (the art, kept locally so the
                              catalog can be rebuilt without re-downloading).
src/tools/build-catalog.mjs   catalog generator (DIR_PRESETS + SPEC + per-pack credits).
src/tools/build-bundle.mjs    bundles src/plugin.js into the hosted ES module.
src/BUILD.md                  rebuild + redeploy recipe (do this after ANY change here).
```

`index.html` imports `./src/lpc-creatures/index.js` — the creator's own UI. Other
generators never touch `src/`: they import the **hosted bundle** (§3).

## 2. How the editor works

`mountAnimalCreator(container, opts)` (index.js) applies a default embed height of
`min(780px, 86vh)` unless `opts.height` is given or explicitly `false`, then lazily
imports `app.js` and calls its `mount()`. `opts`:

| option | meaning |
| --- | --- |
| `store` | `{get(key), set(key, value)}` — persistence for favourites/recent. `main.pjs → animalCreatorStore()` wires this to `kv-plugin`. |
| `hash` | `true` → sync the selected creature (`#bear~polar/walk/left`) with `location.hash` for share links. |
| `height` | CSS height string, or `false` to let the container size itself (the real page passes `false` because `#appCtn` is `100vh`). |
| `catalogUrl` | point at a different catalog (defaults to the baked-in hosted URL). |
| `sheetBase` | override how sheet URLs are resolved (defaults to `catalog.sheets[rel]`). |
| `onSelect` | called with the current selection (used by the full-screen `open()` picker). |

Three tabs:

- **Preview** — the creature with its animation/direction/frame/zoom controls, plus a
  live "how to draw this" pivot readout for game code.
- **Sheet** — the generated sheet grid for the creature (per-animation rows and the
  full atlas), with a manifest preview.
- **Playground** — a tiny top-down scene that spawns your selection and walks it
  around, proving the sprite API (auto-seeds a mixed group the first time it opens).

Favourites (★), search, category chips, size filter and "favourites only" all live in
the left column. Selection is remembered per user via the kv store (`favourites`,
`recent`, plus the last pick). Keyboard: `/` focuses search, `←/→` change variant,
`[`/`]` change animation, `space` play/pause, `f` favourite, `Esc` closes a modal.

Export/share/credits modals live in the header: export writes a sheet PNG, an
animation sheet, the full atlas and a JSON manifest; share builds a
`https://perchance.org/<generatorName>#<creature>~<variant>/<anim>/<dir>` link;
credits lists every pack with its authors, licence and source URL.

## 3. The plugin API (for a game)

`src/plugin.js` is the entry point of the **hosted bundle** — the file another
generator imports. Unlike `core.js` you never pass a catalog around; every call
loads it once and caches it.

From a generator's `main.pjs`:

```pjs
lpcAnimals = {import:lpc-animal-and-monster-creator}
```

then from JS:

```js
const creator = root.lpcAnimals;                 // importing yields this object directly
                                                  // (not a function) — { version, bundleUrl, catalogUrl, ... }
const cat     = await creator.listCreatures();    // 39 entries: id, name, category, tags,
                                                  // variants, animations, frameSize, size
const sprite  = await creator.createSprite("bear~polar", { scale: 2 });

// draw the feet at (x, y), shadow first:
sprite.drawWithShadow(ctx, x, y, { anim: "walk", dir: "down", frame: 3 });

sprite.frameCount("walk", "down");   // frames in that direction
sprite.frameSizeFor("walk");         // { w, h } in output px
sprite.fps("walk"); sprite.loop("walk"); sprite.duration("walk");
sprite.place(x, y, { anim, dir, frame });   // where a frame lands, without drawing
```

Other facade methods: `getCatalog`, `init`, `listCreatures`, `animationsFor`,
`renderFrame`, `renderAnimSheet`, `renderFullSheet`, `sheetManifest`,
`creatureToCode`, `creatureFromCode`, `stats`, `mount`, `open`. Every one accepts
`{ catalogUrl, sheetBase }` to override the default assets, and `creature` arguments
take either `"bear"`, `"bear~polar"`, or a catalog object.

Returned `Canvas`/`ImageBitmap` objects come from `core.js` (`newCanvas` etc.) — draw
them directly, or `renderFullSheet(...).canvas` for the whole atlas.

> **Consumers should prefer the facade over the raw bundle exports.** The bundle also
> re-exports `core.js` helpers (`frameCount`, `animInfo`, `findCreature`, …); those are
> catalog-first signatures intended for advanced use and are not the stable surface.

## 4. Catalog schema

`core.js → loadCatalog()` fetches `catalog.json`, adds `byId` (a Map) and `allTags`,
and returns it. Shape:

```
{ version, generatedAt,
  sheets: { "<group>/<file>.png": "<hosted url>", ... },       // 96 entries
  packs:  { "<pack-id>": { name, authors[], license, url, extraUrls[], note }, ... },
  creatures: [ {
    id, name, category, tags[], size, notes,
    packs: ["lpc-animals", ...],
    fw, fh,                    // base frame size in px
    dirs,                      // human-readable row order, e.g. "up → left → right → down"
    zoom, ground: {x, y},      // pivot inside the base frame
    shadow: { fw, fh, dirs } | false,
    variants: [ { key, name, sheet, shadow? } ],
    anims: { <id>: { row?, cols?[], dirs?: {dir:{row,cols[]}}, frames?: [[row,col],...],
                     fw?, fh?, fps?, loop?, name? } }
  }, ... ] }
```

An animation is either **directional** (a `dirs` map of row+cols per direction — the
normal case) or **dirless** (`frames`, an explicit `[row,col]` list — used by effects
like the slime projectile). `core.animInfo()` normalises both.

## 5. Direction (row) orders — verified, NOT guessable

Sheets in the wild use several different row orders, and packs that *look* like they
should match often don't. Every one was verified by rendering the four candidate rows
side by side and checking the art, then re-verified as a 4-direction composite. The
presets live in `build-catalog.mjs → DIR_PRESETS`:

| preset | up | left | down | right | used by |
| --- | --- | --- | --- | --- | --- |
| `lpc` | 0 | 1 | 2 | 3 | the 10 original LPC monsters, farm animals, rabbit, wild-boar, horse |
| `nesw` | 0 | 3 | 2 | 1 | cats-rework, pigs-rework, piglet, minotaur, arachne, werewolf, serpent |
| `swen` | 3 | 1 | 0 | 2 | Reemax (pumpkin-monster, raven, seagull), tapatilorenzo shiba / giant-rat / mushroom-walker, shark |
| `urld` | 0 | 2 | 3 | 1 | tapatilorenzo **bear** |
| `ulrd` | 0 | 1 | 3 | 2 | tapatilorenzo **lion / lioness / deer** |
| `drlu` | 2 | 1 | 0 | 3 | tapatilorenzo **fox** |
| `durl` | 1 | 3 | 0 | 2 | Redshrike's **beetle** |

(The table reads "which row holds which direction".) Discriminators that worked, in
order of reliability: a **near-black eye pair + black nose that only appears in the
front view**; a distinctive beak/marking colour; and an attack-lunge translation
(bears, lions and foxes step toward the camera in the front row).

Notes that were non-obvious:

- **Raven vs seagull** ship on the *same* sheet with the gull in the first three
  columns — the seagull is the light-grey bird with black wingtips and a pale-yellow
  beak; the raven is all black. The SPEC assigns `raven cols:[3,4,5]`,
  `seagull cols:[0,1,2]`.
- **Shark** is non-standard: `animFrameGrid` maps swim to cols 0–3, dive to 4–6;
  `minInk` 0.001 is needed because some frames are nearly transparent.
- The **deer** was the one that took longest — `ulrd`, proven by the doe's face
  features appearing only in row 3 plus a 4-direction composite read.

## 6. Licences & attribution

Art is used under the licences offered by each OpenGameArt pack (mostly
CC-BY-SA 3.0 / GPL 3.0, some OGA-BY 3.0). `catalog.json → packs` is the source of
truth and the Credits modal renders it verbatim; **any game shipping these sprites
must reproduce that attribution.** The 17 packs are:

`lpc-base-assets`, `lpc-monsters`, `lpc-monster-death`, `lpc-farm`, `lpc-animals`,
`reemax-pumpkin`, `reemax-birds`, `cats-rework`, `minotaur`, `arachne`, `werewolf`,
`snake-rework`, `pigs-rework`, `wild-boar`, `horse-extended`, `beetle`, `rabbit`.

## 7. Gotchas worth knowing

- **Unsaved `src/` files need a service worker.** In the Perchance editor preview,
  `index.html`'s `import("./src/...")` is served by a service worker. In an in-app
  browser without one (e.g. the Google app on iOS) it fails with "Load failed" until
  the generator is **saved** — `index.html`'s error surface says so. Opening the saved
  generator in a normal browser tab always works.
- **Embed height.** `mountAnimalCreator` defaults to `min(780px, 86vh)` for people
  embedding the creator in their own page. The generator's own page passes
  `height: false` so `#appCtn` wins — otherwise you get a gap below the app.
- **Scroll container (easy to break).** `styles.js` stacks the three panels into one
  column at `max-width: 1240px` and sets `.lpc-app { height: auto }`, so *below* that
  breakpoint the app is taller than the viewport and the **document** must scroll. That
  is why `index.html` only pins `#appCtn` to `100vh` at `min-width: 1241px`, and uses
  `min-height: 100vh` otherwise. If you give `html`/`body` a fixed `height: 100%` plus
  `overflow-y: auto` (as an earlier version did), the body becomes a *dead inner
  scroller*: `window.scrollY` stays 0, the panels below the first screen are
  unreachable, and any full-page capture renders them as blank. Don't reintroduce it.
  Also avoid `overflow-x: hidden` on `body` — paired with a visible `overflow-y` it
  silently makes body a scroll container again; use `overflow-x: clip` instead.
- **Clipboard.** `copyText()` tries `navigator.clipboard` then falls back to
  `execCommand`. Inside a cross-origin preview iframe the async clipboard API is
  denied, so it can report "Could not copy" there; it works on the real page.
- **Thumbnails trim alpha.** Tile art is fitted from its alpha bounding box
  (`inkBox()`, cached in a WeakMap) so small sprites aren't lost in a huge cell, and so
  the favourite ★ / size badge never lands on top of the art.
- **`$meta.image`** is a real screenshot of the app, not an AI render — re-capture it
  if the UI changes materially (see `BUILD.md`).

## 8. Rebuilding

After changing any file under `src/`: follow **`src/BUILD.md`**. In short —
regenerate `catalog.json` from `src/sheets/**` with `tools/build-catalog.mjs`, upload
it, rebuild the bundle from `src/plugin.js` with `tools/build-bundle.mjs` (it bakes in
the new catalog URL), upload that, and paste both URLs into `main.pjs`.

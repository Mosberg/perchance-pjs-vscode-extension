# Build & deploy

Everything under `src/` ships inside the generator, so the editor UI updates
automatically when you edit it. **Only the catalog and the importable plugin bundle
need a manual rebuild + upload.** Do that after any change to `catalog.json`,
`src/sheets/**`, `core.js`, `styles.js`, `app.js`, `index.js` or `plugin.js`.

There are three hosted artifacts:

| artifact | built from | referenced by |
| --- | --- | --- |
| catalog JSON | `src/sheets/**` via `tools/build-catalog.mjs` | `main.pjs → CATALOG_URL`; also baked into the bundle |
| plugin bundle | `src/plugin.js` via `tools/build-bundle.mjs` | `main.pjs → BUNDLE_URL` |
| `$meta.image` | a screenshot of the running app | `main.pjs → $meta.image` |

Current URLs (keep this table in sync when you redeploy):

- catalog: `https://user.uploads.dev/file/27e36c970aba9ca460ae230c015c201e.json`
- bundle: `https://user.uploads.dev/file/fcde6dcee16cffac6ae21cc517fb4a51.js`
- `$meta.image`: `https://user.uploads.dev/file/97022216b3a909d7540e29551cf953ec.jpg`

Version strings to bump on a release: `PLUGIN_VERSION` in
`src/lpc-creatures/core.js` (the bundle banner reads it) and the `VERSION` in
`main.pjs → lpcAnimalMonsterCreator()`. `catalogVersion` is the second argument to
`buildCatalog()`.

---

## 1. Rebuild the catalog

`buildCatalog(env, version)` needs a tiny environment so it works both in the browser
and in a worker:

- `env.readFile(rel)` → `Uint8Array` of a sheet, `rel` like `animals/bear.png`
- `env.decode(bytes)` → `{ width, height, data }` (getImageData)
- `env.urls` → sheet rel-path → hosted sheet URL (this is `src/lpc-creatures/urls.json`)

From a worker (the agent's `execute_js`, or a browser Worker) — load the file from a
Blob URL so no directory reads are needed:

```js
const src = await fs.readTextFile("src/tools/build-catalog.mjs");
const mod = await import(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
const urls = JSON.parse(await fs.readTextFile("src/lpc-creatures/urls.json"));

const readFile = (rel) => fs.readFile("src/sheets/" + rel);
const decode = async (bytes) => {
  const bmp = await createImageBitmap(new Blob([bytes]));
  const cv = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0);
  return ctx.getImageData(0, 0, bmp.width, bmp.height);
};

const cat = await mod.buildCatalog({ readFile, decode, urls }, "1.0.0");
await fs.writeTextFile("src/lpc-creatures/catalog.json", JSON.stringify(cat, null, 2) + "\n");
```

`buildCatalog` throws on an unknown `dirs` preset (a good guard — see `DIR_PRESETS`),
and uses each animation's `minInk` (`classify`/`trimCols`) to drop empty padding
columns that LPC sheets use as separators.

**Diff before you publish.** The catalog is generated, so an accidental SPEC edit shows
up as a huge JSON diff. Keep the previous catalog around and compare per creature:

```js
// key by creature id, compare Object.keys(anims) and each anim's dirs/frames
```

## 2. Upload the catalog

`upload_file` the regenerated `src/lpc-creatures/catalog.json`; paste the returned URL
into `main.pjs → CATALOG_URL` **and** use it as `catalogUrl` in step 3 (the bundle bakes
it in as `DEFAULT_CATALOG_URL`).

> The catalog is self-contained apart from the sheet PNGs, whose URLs live in
> `catalog.json → sheets` (96 entries) — the same map as `urls.json`. If you ever move
> the sheets, update `urls.json` *before* rebuilding.

## 3. Rebuild the plugin bundle

`buildBundle({ fs, catalogUrl, outPath, minify, version })` bundles `src/plugin.js`
(pulling in `core.js`, `app.js`, `styles.js`) into one ES module with esbuild-wasm.

```js
const src = await fs.readTextFile("src/tools/build-bundle.mjs");
const mod = await import(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
const core = await fs.readTextFile("src/lpc-creatures/core.js");
const version = core.match(/PLUGIN_VERSION\s*=\s*"([^"]+)"/)[1];

await mod.buildBundle({
  fs,
  catalogUrl: "<the catalog URL from step 2>",
  outPath: "scratch/lpc-animals.bundle.js",
  version,
});
```

It refuses to bundle a *bare* import (the plugin must stay self-contained), defines
`__CATALOG_URL__` so `core.DEFAULT_CATALOG_URL` points at the hosted catalog, and writes
a banner comment with the version + catalog URL. `upload_file` the result and paste the
URL into `main.pjs → BUNDLE_URL`.

## 4. Verify the API end-to-end

After pasting, reload the page and exercise the facade — this is the real test that the
cross-origin import + baked catalog work:

```js
const c = window.root.lpcAnimalMonsterCreator();
await c.getCatalog();                              // 39 creatures
await c.animationsFor("bear~polar");               // [{ id:"walk", frames:5, fps:8, … }, …]
const s = await c.createSprite("bear~polar");
const f = s.getFrame("walk", "down", 3);           // a Canvas with real ink
await c.renderFullSheet("bear~polar");             // { canvas, cols, rows, cellW, … }
await c.sheetManifest("bear~polar");               // 20 keys incl. blocks/credits/dirOrder
```

Also check the bundle banner and `c.bundleUrl`/`c.catalogUrl` report the URLs you just
deployed (a stale cached module is the usual cause of "my change didn't apply").

## 5. Refresh `$meta.image`

`$meta.image` is a screenshot of the app. In the live page:

```js
return (await import("https://ai-agent.perchance.org/files/snapshot.js")).capture();
// → save to scratch/shots/app-meta.png
```

Then crop to **1280×720** and export a JPG (quality ≈ 0.9, aim for < 300 KB) with
`OffscreenCanvas`, `upload_file` it, and paste the URL into `main.pjs → $meta.image`.
Make sure the crop keeps all three columns and doesn't slice the header or the bottom
control bar.

## 6. Before you call it done

- `page_refresh` and confirm **no console errors** and **no `perchanceErrors`**.
- Look at all three tabs (`vision`), including a phone viewport
  (`set_viewport_size {width:390,height:844}`) and a desktop one — no horizontal
  overflow, controls wrap readably.
- **Test that narrow layouts actually scroll:** at 390px the page is ~2500px tall, so
  check `document.documentElement.scrollHeight > innerHeight` and that
  `window.scrollTo(0, 99999); window.scrollY` is non-zero. Then confirm the *bottom*
  panel (details + credits) is reachable. At 1440px the opposite must hold: the app is
  exactly `innerHeight` tall, the three columns sit side by side, and `scrollY` stays 0
  (the panels scroll internally). See the "Scroll container" gotcha in `README.md`.
- Re-run the step-4 façade checks.
- Remember the deployed bundle/catalog are **immutable uploads**: redeploying creates
  new URLs, so update `main.pjs` in the same pass or the page will keep using the old
  assets.

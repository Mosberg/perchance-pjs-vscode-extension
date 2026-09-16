# tooltip-plugin - complete source & asset package

**Generator:** `tooltip-plugin`  
**Public page:** https://perchance.org/tooltip-plugin  
**Source page:** https://perchance.org/tooltip-plugin#edit  
**Exported:** 2026-09-16T17:32:55.241Z  
**Package root:** `tooltip-plugin-export/`

This archive is a 1:1 dump of everything that makes the tooltip-plugin generator run: the two
generator source files exactly as they are served, a verified copy of every third-party library it
depends on, and provenance/integrity data. Nothing is summarised or abbreviated - the vendored
libraries were both extracted out of main.pjs AND downloaded from their canonical upstream URLs,
then cross-checked: the inlined copies are byte-identical to upstream apart from upstream's own
banner and sourcemap trailer comments (verified, see section 4).

---

## 1. Package map (by category)

```text
tooltip-plugin-export/
|- README.md                       <- this file
|- MANIFEST.md                     <- every file: category, size, sha256
|- manifest.json                   <- machine-readable manifest (+ provenance)
|- THIRD-PARTY-LICENSES.md         <- full upstream license texts
|- generator/                      <- CATEGORY: internal code (the generator itself)
|  |- main.pjs                     <- the entire plugin implementation (Perchance pjs)
|  \- index.html                   <- the entire docs/demo page
|- dependencies/                   <- CATEGORY: external / third-party code
|  |- package.json                 <- pinned npm deps + canonical CDN URLs
|  |- popper-2.5.2.min.js          <- @popperjs/core 2.5.2 UMD build (upstream, verbatim)
|  |- tippy-6.2.6.min.js           <- tippy.js 6.2.6 UMD bundle (upstream, verbatim)
|  |- embedded/                    <- the SAME two libs as inlined inside main.pjs
|  |  |- popper-2.5.2.inlined-in-main.pjs.js
|  |  \- tippy-6.2.6.inlined-in-main.pjs.js
|  \- licenses/
|     |- popper-LICENSE.md
|     \- tippy-LICENSE.txt
|- provenance/
|  \- INTEGRITY-REPORT.txt         <- hashes, match results, attribution comments
|- tools/
|  \- verify-embedded-deps.mjs     <- re-runs the extraction + upstream comparison
\- docs/
   \- PLUGIN-API.md                <- complete API reference
```

### Category summary

| Category | Files | Notes |
| --- | --- | --- |
| Internal code | `generator/main.pjs`, `generator/index.html` | 100% of the generator's own code. Two files, no hidden parts. |
| External code | `dependencies/...` | @popperjs/core 2.5.2 and tippy.js 6.2.6 (MIT), vendored - also inlined inside main.pjs. |
| Third-party assets | none | No images, audio, fonts, models or shaders are used. |
| Project resources | none | No JSON data files, templates or runtime config. |
| Build / config | `dependencies/package.json`, `tools/verify-embedded-deps.mjs` | No build step exists; the tool only verifies the vendoring. |

---

## 2. Architecture (what the code actually does)

The generator is a single exported function, `$output(anchorText, toolTipText, options)`. It returns an
HTML `<span>` whose text is the anchor; ~200 ms later it lazily injects tippy.js + Popper into
`document.head` (once per page, guarded by `window.alreadyAddedToolTipScripts`) and attaches a tooltip
to that span.

Because the plugin is called from Perchance template code, tooltip text and options can themselves
be Perchance lists / curly blocks. The implementation therefore never resolves them: it stashes the
raw text in a `data-tooltip-content` attribute (with `>` and `"` swapped for placeholder tokens) so
the engine's own HTML rendering resolves them, then reverses the swap and installs tippy.

Key details:

- `getTippyJSText()` returns the whole third-party payload (Popper + tippy + tippy's CSS) as one giant
  JS string, written into a `<script>` element's `innerHTML`.
- Perchance-list options are detected via `options.getParent && options.getPropertyNames` and copied
  key-by-key (they cannot be JSON-serialised); plain objects are deep-cloned.
- `appendTo` defaults to `document.body` so `interactive:true` tooltips don't inherit the anchor's CSS.
- The `css` option compiles into a generated tippy theme: a random class cached per CSS string, one
  `<style>` tag per unique CSS, and arrow colour derived from any `background-color`.
- The vendor script is injected from a string (no src URL), so the plugin makes zero network requests
  and works offline inside the sandboxed generator iframe.

## 3. Usage

```text
tooltip = {import:tooltip-plugin}

output
  There is [tooltip(race, description)] standing nearby.

race
  an orc
  an elf
  a human

description
  They look suspicious.
  Their shirt is torn.
```

```text
tooltipOptions
  css = background-color:tomato; color:yellow;
  interactive = true
  allowHTML = true

output
  Try [tooltip("hover over this text", tooltipText, tooltipOptions)] to see a custom popup.
```

Full option reference: `docs/PLUGIN-API.md` - upstream props: https://atomiks.github.io/tippyjs/v6/all-props/

## 4. Third-party provenance (verified)

| Library | Version | Canonical URL | Inlined in main.pjs | Inlined copy vs upstream |
| --- | --- | --- | --- | --- |
| @popperjs/core | 2.5.2 | https://unpkg.com/@popperjs/core@2.5.2/dist/umd/popper.min.js | yes | byte-identical |
| tippy.js (bundle, incl. CSS) | 6.2.6 | https://unpkg.com/tippy.js@6.2.6/dist/tippy-bundle.umd.min.js | yes | byte-identical |

"Byte-identical" means: after removing leading indentation and reversing template-literal escaping,
the inlined body equals the upstream file exactly apart from the upstream file's own banner comment
and its sourcemap trailer comment (neither is executable code). See `provenance/INTEGRITY-REPORT.txt`
for sha256s, and rerun `node tools/verify-embedded-deps.mjs`.

Both libraries are MIT (tippy.js (c) 2017-present atomiks; @popperjs/core (c) 2019 Federico Zivolo);
full texts in `THIRD-PARTY-LICENSES.md`. Perchance does not host these files for the generator - they
travel inside main.pjs, so there is no CDN dependency at runtime.

## 5. Re-vendoring / rebuilding

There is no build pipeline: main.pjs + index.html ARE the artifact. To update tippy:

1. Download the new UMD build from unpkg.
2. Escape it for a JS template literal: every backslash becomes a double backslash; the backtick and
   the dollar-brace sequence also get a backslash.
3. Replace the body of `getTippyJSText()` in `generator/main.pjs` with the escaped text.
4. Run `node tools/verify-embedded-deps.mjs` from the package root to confirm the inlined copy matches
   the upstream file you placed in `dependencies/`.

## 6. Restoring the source into Perchance

1. Open https://perchance.org/tooltip-plugin#edit (or fork it to your own generator name).
2. Paste `generator/main.pjs` into the Perchance code panel (replace everything).
3. Paste `generator/index.html` into the Perchance HTML panel (replace everything).
4. Save. No imports, no external files, no storage keys, no service worker involved.

The generator has zero import dependencies, so no other generator's source is needed to run or fork it.

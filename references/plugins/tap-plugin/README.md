# Perchance "Tap Plugin" — Complete Source Package

Generator: **tap-plugin** (perchance.org/tap-plugin)
Generator type: Perchance plugin / generator (runs on the Perchance engine)

This package contains every file that makes up the generator, plus a
dependency/asset audit explaining what does and does not exist.

## Category index

| Category | Location | Status |
|---|---|---|
| 1. Internal code | `01-internal-code/` | 2 files — all source |
| 2. External code | `02-external-code/` | NONE — see DEPENDENCIES.md |
| 3. Third-party assets | `03-third-party-assets/` | NONE |
| 4. Project resources (text/content) | `04-project-resources/` | See content-source.txt |
| 5. Build / config files | `05-build-config/` | No build pipeline — see build-notes.md |

## 1. Internal code
- `01-internal-code/main.pjs` — the generator's Perchance-JS code: the
  \$output function that implements the tap plugin, plus the `animal` and
  `adjective` demo lists.
- `01-internal-code/index.html` — the entire page markup, tutorial text,
  inline demo output blocks, and the <style> block.

## 2. External code
The generator imports NO other generators/plugins/libraries at runtime.
There are no `{import:...}` statements, no CDN scripts, no npm packages.
See `02-external-code/DEPENDENCIES.md`.

## 3. Third-party assets
None. No images, audio, fonts, models, or textures are used. The only
imagery is emoji/Unicode glyphs typed directly into index.html
(👆 🖱️ ⚄ and a few HTML entities), which are rendered by the reader's OS.

## 4. Project resources
The only "data" resources are the two Perchance lists inside main.pjs
(`animal`, `adjective`) and the tutorial prose in index.html.
`04-project-resources/content-source.txt` extracts them.

## 5. Build / config
There is no build step, bundler, or config. Perchance compiles main.pjs
and index.html server-side at load. `05-build-config/build-notes.md`
documents this, and `05-build-config/manifest.json` records a hash of
every file.

## How the plugin works
`tap(listOrStr, style)` returns an object whose `toString()` yields a
clickable <span>/<button>. Each call stores the list on `window[listRefId]`
and wires an onclick that re-evaluates `window[listRefId].evaluateItem`
(laminating a new random selection) and repaints every element sharing
that `tap-id-<ref>` class. Variants: `noTap`, `noTapNoUpdate`, and a
third arg treated as inline CSS.

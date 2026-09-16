# RPG Icon Plugin — complete source & asset package

| | |
|---|---|
| Generator | https://perchance.org/rpg-icon-plugin |
| Platform | perchance.org (iframe-hosted generator) |
| Public entry point | `icon = {import:rpg-icon-plugin}` then `[icon("sword")]` |
| Package files | 42 |
| Uncompressed size | 1,611,913 bytes |
| Runtime dependencies | none (no `{import:}`, no `<script>`, no network requests) |

## 0. What the project actually is

A single Perchance **plugin generator** made of exactly two files plus one embedded binary asset.
`main.pjs` defines one function, `$output(iconName, style)`: on first invocation it builds a
128,272-character CSS string, injects it into `document.head` as a `<style>` element (guarded by the
`window.alreadyAddedRPGAwesomeCSS` flag so it happens once), and returns `<i class="ra ra-<name>">`
markup. `index.html` is simultaneously the plugin usage documentation and the browsable gallery of
every available icon (491 gallery entries, 13 categories).

The icon font is **not** a separate file at runtime: it is a base64 `data:` URL embedded inside the
CSS string on `main.pjs` line 17, which is 128,308 characters long. Everything in `02-embedded-assets/`
is that blob decoded back into real files.

Data flow: `index.html` gallery (491 `<i title="...">` names) → icon names; `main.pjs` line 17
(1 `@font-face` + 494 `.ra-NAME:before{content:"\eXXX"}` rules) → name-to-codepoint map; the inlined
WOFF2 → the glyph shapes themselves.

## 1. Internal code — `01-internal-code/`

| File | Bytes | SHA-256 | Description |
|---|---|---|---|
| `main.pjs` | 130,029 | `928a4c8cecc0…` | The entire plugin: 2 comment lines, `$output()`, `getRPGAwesomeCSSText()`. 20 lines total. |
| `index.html` | 31,016 | `29f1bfac5e90…` | Generator body: usage docs, the worked examples, and the full 491-icon gallery with `<h2>` category headings. |
| `main.readable.pjs` | 20,854 | | Identical to `main.pjs` with the 109,168-character base64 blob replaced by `__RPG_AWESOME_WOFF2_BASE64__`, so the code is human-readable. |

Inline square-bracket calls in `index.html` (`[$output("sword", "")]`) are the platform's templating
syntax evaluating the plugin function to render each example.

## 2. Project resources — `02-embedded-assets/` (decoded from `01-internal-code/main.pjs`)

| File | Bytes | Description |
|---|---|---|
| `fonts/rpgawesome.woff2` | 81,876 | **The only binary asset in the project.** Decoded from the CSS `data:` URL; header magic `wOF2`. SHA-256 `228fc9a97152…`. |
| `css/rpgawesome.css` | 20,089 | The exact text the plugin injects into `<head>`, byte-identical to the embedded string except the `data:` URL is rewritten to `url(rpgawesome.woff2) format('woff2')` so it also works as a normal linked stylesheet. |
| `data/icon-names.txt` | 5,156 | 491 icon names, one per line, in gallery order. |
| `data/icon-names.json` | 10,731 | The same names grouped by gallery category. |
| `data/glyph-map.json` | 31,938 | Complete `{name, glyph}` table: 494 rules mapping each class to its private-use codepoint. |

CSS breakdown: `@charset "UTF-8"`, the `.ra-fw`/`.ra-li` helpers, the `@font-face` with the inlined
WOFF2, the `.ra`/`.ra-lg`–`.ra-5x` size and `.ra-fw` fixed-width helpers, then 494 `.ra-NAME:before{content:"…"}` rules.

Gallery categories: undefined (17), undefined (11), undefined (46), undefined (36), undefined (46), undefined (25), undefined (18), undefined (15), undefined (12), undefined (19), undefined (57), undefined (109), undefined (80).

## 3. Third-party assets — `03-third-party/rpg-awesome/`

[RPG Awesome](https://github.com/nagoshiashumari/Rpg-Awesome) by Daniela Howe — the upstream project
every glyph in this plugin comes from. Included complete as a snapshot of the `master` branch
(33 files, nothing stripped):

- `LICENSE.md` — BSD 3-clause ("Copyright (c) 2014, Daniela Howe"). Attribution also appears in `main.pjs`'s header comment and in `index.html`.
- `css/rpg-awesome.css`, `css/rpg-awesome.min.css`, `css/rpg-awesome.css.map` — upstream stylesheets + source map.
- `scss/` — SCSS sources (`_icons.scss` is the master glyph list, `_variables.scss` holds the codepoint variables, plus `_core`, `_larger`, `_fixed-width`, `_list`, `_mixins`, `_path`, `_bordered-pulled`, `_rotated-flipped`, `_spinning`, `_stacked`, `rpg-awesome.scss`, `.scss-lint.yml`).
- `fonts/rpgawesome-webfont.{eot,svg,ttf,woff}` — upstream font builds. Upstream ships no WOFF2; the WOFF2 in this package (81,876 B) is the build Perchance inlines, versus the 149,064 B WOFF.
- `demo/index.html`, `README.md`, `Gruntfile.js`, `package.json`, `package.js`, `bower.json`, `rpg-awesome-tests.js`, `.versions`, `.gitignore`, `CONTRIBUTING.md`.

## 4. Build / tooling — `04-tools/`

`extract-assets.mjs` — regenerates everything in `02-embedded-assets/` from `01-internal-code/`.
Dependencies: Node 18+ only (`node:fs/promises`, `node:crypto`). It finds the `getRPGAwesomeCSSText() =>`
line, slices out the template literal, decodes the WOFF2 (asserting the `wOF2` magic), rewrites the CSS
URL, parses the gallery for icon names, and emits all five derived files.

```
node 04-tools/extract-assets.mjs .
```

## 5. External / third-party runtime code

There is none. Verified: `main.pjs` contains zero `{import:...}` declarations and `index.html` contains
zero `<script>` tags, so the shipped generator loads no libraries, modules or tools at runtime. The only
external URLs anywhere in the project are documentation links (the RPG Awesome repo, the Wikipedia CSS
page, a hex-colour-picker search). `@zip.js/zip.js` was used by the packaging agent, not by the generator.

## 6. `MANIFEST.json`

Every one of the 42 files with its byte count and SHA-256, so the archive can be
verified. `01-internal-code/main.pjs` and `01-internal-code/index.html` are byte-exact copies of the live
generator source.

## 7. Rebuild / use

- Ship the plugin: paste `01-internal-code/main.pjs` into the Perchance code panel and `01-internal-code/index.html` into the HTML panel. Nothing else is needed.
- Read the code: open `01-internal-code/main.readable.pjs`.
- See the icons standalone: open `02-embedded-assets/css/rpgawesome.css` with `02-embedded-assets/fonts/rpgawesome.woff2` kept in the same relative layout.
- Rebuild the upstream CSS from SCSS: `npm install` then `npx grunt` inside `03-third-party/rpg-awesome/`.


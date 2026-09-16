# select-leaves-plugin — Complete Source & Asset Package

Complete, byte-exact dump of everything that makes up this project, plus every
external generator/library it depends on or links to. Nothing is summarized and
nothing is omitted.

* **Generator name:** `select-leaves-plugin`
* **Public URL:** https://perchance.org/select-leaves-plugin
* **Runtime origin:** `https://86ee688dc96be17847257c87a2b0e189.perchance.org/select-leaves-plugin`
* **Package assembled:** 2026-09-16
* **Total files:** see `INVENTORY.md` (every file with size + SHA-256)

---

## What this generator is

A Perchance **plugin**. It exports (via `$output`) a single JavaScript function
that selects *several* "leaf" nodes from a hierarchical Perchance list at once.

A "leaf" is a list item that has no sub-items (no children) — i.e. the end of a
branch in a list tree. The function returned by this plugin is essentially the
standard `selectMany`, except it uses `selectLeaf` (from `select-leaf-plugin`)
instead of `selectOne` on each draw, so every item it returns is a true leaf.

Usage in a Perchance code panel:

```
selectLeaves = {import:select-leaves-plugin}
```

Then, inside a list item / square block:

```
[selectLeaves(myList, 10)]      // 10 items
[selectLeaves(myList, 5, 10)]   // between 5 and 10 items
[selectLeaves(myList, [3, 7])]  // random choice from the array of counts
```

The returned value is a JS `Array` whose `toString` is overridden to
`join("")`, so interpolating it produces the concatenated items (which lets
Perchance's own formatting/dedenting behave as expected).

---

## Package layout

```
select-leaves-plugin-complete/
├── README.md                     <- you are here
├── INVENTORY.md                  <- every file: path, bytes, SHA-256, role
├── 01-internal-code/             <- THIS generator's own source (the project itself)
│   ├── main.pjs
│   └── index.html
├── 02-dependencies/              <- external code vendored into this project
│   └── imports/select-leaf-plugin/main.pjs
├── 03-external-generators/       <- external code this project imports/links to
│   ├── select-leaf-plugin/         {main.pjs, index.html}
│   ├── consumable-leaf-list-plugin/{main.pjs, index.html}
│   └── select-leaves-plugin-example/{main.pjs, index.html}
├── 04-assets/                    <- images/audio/models/data (NONE exist; see ASSETS.md)
│   └── ASSETS.md
├── 05-build-config/              <- no build step; packaging metadata + reproducible zipper
│   ├── BUILD.md
│   ├── package.json
│   └── tools/package.mjs
└── 99-agent-instructions/
    └── AGENTS.md                 <- harness/assistant instructions shipped for completeness
```

---

## How the pieces relate

| Piece | Kind | Role |
|---|---|---|
| `01-internal-code/main.pjs` | first-party code | The plugin itself: `$output (list, ...a) =>` returns `selectMany`-like function |
| `01-internal-code/index.html` | first-party code | Human-facing docs page/UI for the plugin |
| `02-dependencies/imports/select-leaf-plugin/main.pjs` | third-party (vendored, read-only) | Actual source of the `{import:select-leaf-plugin}` dependency, as resolved by the engine |
| `03-external-generators/select-leaf-plugin` | third-party | Source of the dependency as a standalone generator (also the canonical docs) |
| `03-external-generators/consumable-leaf-list-plugin` | third-party | Related plugin (unique leaf selection) linked from this plugin's UI |
| `03-external-generators/select-leaves-plugin-example` | third-party | The live demo generator linked from this plugin's UI |

### Dependency chain

```
select-leaves-plugin  (this project)
└── {import:select-leaf-plugin}          -> 02-dependencies + 03-external-generators
    └── (no further imports: it is a leaf dependency of the import graph)

Prose links from index.html (not code dependencies):
    consumable-leaf-list-plugin
        └── {import:select-leaf-plugin}  (same dependency, transitively)
    select-leaves-plugin-example
        └── {import:select-leaves-plugin} (uses THIS plugin)
```

There are **no** npm packages, no CDN/`esm.sh` imports, no `<script src>` tags,
no fonts, no images, no audio, no models, no shaders, and no JSON data files.
The generator is 100% Perchance-flavoured JavaScript inside `main.pjs`, plus a
static docs page in `index.html`. `04-assets/` is empty by nature, not by
omission — `ASSETS.md` records that explicitly.

---

## Deploy / install model

Perchance generators are deployed by saving them in the editor — there is no
build, no bundler, no transpile, no minify, no artifact upload.

* `main.pjs` and `index.html` **are** the shipping artifacts.
* Imported plugins are pulled by the Perchance engine at page load from
  `{import:<generator-name>}`; the copies under `02-dependencies/` and
  `03-external-generators/` are reference copies for offline reading.
* To re-create this generator: paste `01-internal-code/main.pjs` into the code
  panel and `01-internal-code/index.html` into the HTML panel of a new
  generator, then save.

`05-build-config/tools/package.mjs` reproduces this zip from a workspace tree
(it is packaging tooling for this handoff, not a runtime dependency).

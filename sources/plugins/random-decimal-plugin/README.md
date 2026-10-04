# random-decimal-plugin — Complete Source Package

Perchance generator: **random-decimal-plugin**
Public page: https://perchance.org/random-decimal-plugin
Runtime origin: https://496486540df6c859a1113d0f06292e9e.perchance.org/random-decimal-plugin
Exported: 2026-09-16T17:26:44.105Z

## What this generator is

A Perchance *plugin* generator. It exposes a single callable output — `randomDecimal(from, to)` —
which returns a uniformly random decimal number in the half-open interval [from, to).
`from` may legitimately be larger than `to`; the arithmetic still produces a value in the
closed numeric interval. The plugin is consumed by other generators via
`randomDecimal = {import:random-decimal-plugin}`.

## Package layout

    .
    ├── README.md                                  <- this file
    ├── MANIFEST.json                              <- file list, sizes, SHA-256 hashes
    ├── project/                                   <- INTERNAL CODE (ships with the generator)
    │   ├── main.pjs                               <- Perchance code panel: the plugin itself
    │   └── index.html                             <- documentation page shown to visitors
    └── referenced/                                <- EXTERNAL / RELATED
        └── random-decimal-plugin-example/
            ├── main.pjs                           <- the example generator linked from the docs
            └── index.html

## Category breakdown (per the requested organisation)

### 1. Internal code (first-party, ships with the generator)
- `project/main.pjs` — the entire plugin implementation. Defines `$output(from, to)`,
  plus the `small` and `big` lists used only by the documentation examples.
- `project/index.html` — the whole visible page: heading, usage documentation, three live
  re-rollable examples, the inline `update()` helper, and all CSS. No external stylesheet.

### 2. External code / third-party libraries, modules, tools, dependencies
- **None.** The generator has zero `{import:...}` lines and loads no JavaScript libraries,
  no npm/CDN modules, no bundler, no build step. Everything the page needs is contained in
  `project/main.pjs` + `project/index.html`. The only platform-provided dependency is the
  Perchance engine itself, which injects `main.pjs` before `index.html` runs and provides
  the `{a-b}` range syntax and square-bracket templating at runtime.

### 3. Third-party assets
- **None.** No images, audio, models, fonts, or other binary assets. The page styling is
  pure inline CSS; there are no `<img>`, `<audio>`, `<link>`, or webfont references.

### 4. Project resources (data, templates, UI)
- `project/main.pjs` — data lists (`small = {10-20}`, `big = {50-100}`).
- `project/index.html` — the documentation template / UI copy, including the
  `small = {10-20}.{1-9}` and `big = {50-100}` example snippets.
- `referenced/random-decimal-plugin-example/*` — a separate generator by the same author,
  linked from the docs' "Notes" section. It is a *different* generator (it imports this one),
  included here for completeness because it is the canonical usage example.

### 5. Build / configuration files
- **None.** There is no package.json, lockfile, CI config, or bundler config — Perchance
  generators are not built; the platform serves `main.pjs` + `index.html` directly.
  `$meta` is absent from `main.pjs`, so all metadata (title, description, tags) is set
  through the generator-settings modal rather than in code.

## How the code works

`project/main.pjs`:

    // not that `from` could be larger than `to` - and that's fine - the math works out.
    $output(from, to) =>
    	let start = from;
    	let range = to - from;
      return start + Math.random()*range;

    // these are just used for the examples in the HTML panel
    small = {10-20}
    big = {50-100}

Because the first item of the file is `$output`, importing this generator yields the
function itself rather than the generator's `root` object — that is what makes
`randomDecimal(10, 20)` work in downstream generators.

## Verifying the package

Every file's byte size and SHA-256 digest is listed in `MANIFEST.json`. To confirm a
downloaded copy is intact:

    sha256sum project/main.pjs project/index.html

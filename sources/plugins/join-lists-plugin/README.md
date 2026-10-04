# join-lists-plugin — Complete Source & Asset Package

Generator: https://perchance.org/join-lists-plugin
Public id:  48616c71a9c84bb6091131b983671959
Exported:   2026-09-16

This archive contains the COMPLETE, byte-exact set of files that make up the
generator, plus its one external runtime dependency and captured rendered
resources. Nothing is summarised or omitted.

## Contents

| Folder | What it holds |
|---|---|
| `01-internal-code/`   | The generator's own source: `main.pjs` (Perchance DSL / plugin logic) and `index.html` (the page body). These are the only two files the generator actually owns. |
| `02-external-code/`   | Platform runtime dependency: the Perchance engine bundle loaded from `perchance.org/lib/`. Required for the generator to run, but served by the platform, not authored here. |
| `03-third-party-assets/` | (empty) — see NOTE.txt. No images, audio, models, shaders, fonts or third-party libraries are used. |
| `04-project-resources/` | Captured rendered output: a full-page PNG screenshot and the complete rendered DOM after the engine evaluated the template. |
| `05-build-config/`    | (empty) — see NOTE.txt. There is no build step; Perchance files are shipped as-is. |
| `MANIFEST.md`         | File-by-file inventory with sizes, SHA-256 hashes and roles. |

## How the generator works

`main.pjs` defines a single Perchance function `$output (...lists)` that
concatenates any number of Perchance list objects into one array and returns it
with a custom `toString` (delegating to a random `selectOne`), so the result
behaves exactly like a native list and supports `.selectOne`, `.selectMany(n)`,
`.evaluateItem`, etc.

`index.html` is purely documentation/demo content for the plugin page. It
contains no JavaScript; it only uses escaped-square-bracket examples (`\[`, `\]`)
so the engine renders them literally instead of evaluating them.

## Rebuild / restore

1. Create a Perchance generator.
2. Paste `01-internal-code/main.pjs` into the code (main.pjs) panel.
3. Paste `01-internal-code/index.html` into the HTML panel.
4. Save. No compilation, bundling or configuration is involved.

## Licensing / provenance

- `main.pjs`, `index.html` — authored for this generator (Perchance ToS).
- `perchance-engine.js` — © Perchance platform, redistributed here for archival
  completeness only; not part of the generator's own source.

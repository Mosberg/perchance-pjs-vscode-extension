# MANIFEST — every file in the project, by category

Generator: `google-sheets-plugin` · snapshot 2026-09-16 · all sizes in bytes, from the
workspace at snapshot time. SHA-256 checksums for the original source/asset files are in
`MANIFEST.sha256`; the zip's own checksum is recorded in the chat/`MANIFEST.sha256` too.

## Category 1 — Internal code (the generator itself)

| Path in package | Origin | Bytes | Purpose |
|---|---|---|---|
| `01-internal-code/main.pjs` | `main.pjs` | 3307 | The plugin. Defines `$output(desiredParentNode, v1UrlsV2Settings, version)`: fetches each published Google Sheet TSV, splits into columns, names each column's list from the header row, and attaches the lists to the given parent node. Handles both the legacy `@version1` signature (`$output(parent, urlOrArray, "@version1")`) and the current settings-object signature (`{urls, onLoad}`), de-duplicates URLs via `window.__alreadyLoadedGoogleSheetsUrls4729702`, and calls `update()` (or `settings.onLoad()`) once every sheet has loaded. |
| `01-internal-code/index.html` | `index.html` | 8107 | The generator's page: complete end-user documentation — how to publish a sheet as TSV, the backslash-before-`=` URL rule, the import line, `sheetsSettings` list with `urls` + optional `onLoad()`, the `[googleSheets(root, sheetsSettings)]` call, placeholder "loading…" lists, parent-node/sub-list targeting, odds-notation support and its limitations, and the 5-minute Google republish delay. Also contains the page `<style>` block (background, `code`, `pre`, `ul li` styling) and the two external image references. |

Total internal code: **11414 bytes / 2 files**.

## Category 2 — External code

| Path in package | Origin | Bytes | Notes |
|---|---|---|---|
| `02-external-code/referenced-generators/google-sheets-plugin-example/main.pjs` | perchance.org/google-sheets-plugin-example | 483 | Example usage: `animal` import, `sheetsSettings.urls` with one escaped URL, `fruit`/`veg` placeholders, `output` list. |
| `02-external-code/referenced-generators/google-sheets-plugin-example/index.html` | ″ | 200 | `[googleSheets(root, sheetsSettings)]` + `[output]` + randomize button. |
| `02-external-code/referenced-generators/google-sheets-plugin-onload-example/main.pjs` | perchance.org/google-sheets-plugin-onload-example | 545 | Same, plus `onLoad() => update(outputEl)` selective update and a `[number]` list that must *not* be updated. |
| `02-external-code/referenced-generators/google-sheets-plugin-onload-example/index.html` | ″ | 290 | `id="outputEl"` on the element that gets selectively updated. |

- External **libraries / CDN modules / npm packages / vendored scripts: none.**
- External **`{import:...}`s declared by this project: none.**
- The example generators import the stock platform list plugin `animal`
  (https://perchance.org/animal) — source not redistributed.

## Category 3 — Third-party assets

No third-party *files* are bundled inside the generator; the third-party material is
hotlinked media plus external services. Full provenance in
`03-third-party-assets/README.md`. Summary:

| Third-party item | Original location | Mirror in this package |
|---|---|---|
| Screenshot: "Publish to web" dialog | https://i.imgur.com/dmGUKLv.png | `04-project-resources/images/publish-to-web-instructions.png` (55141 B) |
| Screenshot: example spreadsheet | https://i.imgur.com/PARDKrd.png | `04-project-resources/images/spreadsheet-example.png` (27882 B) |
| Published-TSV endpoint | `https://docs.google.com/spreadsheets/d/e/<id>/pub?gid\=0&single\=true&output\=tsv` | service, not a file |
| `google-sheets-plugin-example` generator | https://perchance.org/google-sheets-plugin-example | `02-external-code/…` |
| `google-sheets-plugin-onload-example` generator | https://perchance.org/google-sheets-plugin-onload-example | `02-external-code/…` |
| `animal` list plugin | https://perchance.org/animal | not redistributed |

## Category 4 — Project resources (media/data shipped or referenced by the page)

| Path in package | Bytes | Type |
|---|---|---|
| `04-project-resources/images/publish-to-web-instructions.png` | 55141 | image/png |
| `04-project-resources/images/spreadsheet-example.png` | 27882 | image/png |

Audio: none · 3D models: none · animations: none · shaders: none · fonts: none ·
prefabs/templates: none · JSON/data files: none (sheet data is supplied by the end user at
runtime via `sheetsSettings.urls`).

## Category 5 — Build / config files

None. See `05-build-config/README.md`. Saving in the Perchance editor is the whole build+deploy.

## Category 6 — Workspace meta

| Path in package | Origin | Bytes | Notes |
|---|---|---|---|
| `06-workspace-meta/AGENTS.md` | `AGENTS.md` | 51258 | Platform AI-helper instructions. **Not** used by or shipped with the generator. |

## Package documentation files

| Path | Notes |
|---|---|
| `README.md` | Overview: what the project is, category index, install/use, dependencies. |
| `MANIFEST.md` | This file. |
| `MANIFEST.sha256` | SHA-256 of every original file (code, assets, meta) as snapshotted. |
| `02–06/*/README.md` | Per-category notes. |

## Complete list of external URLs referenced by the project

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vSrOdsc_b_N-k9bs0wzeSudRW2_GwLAvhwtikqL5VlFyU0WE6JKIj1hmnDeEWzzJ5UpDdmZiXVOm2mx/pub?gid=0&single=true&output=tsv
https://i.imgur.com/dmGUKLv.png
https://i.imgur.com/PARDKrd.png
https://perchance.org/google-sheets-plugin-example#edit
https://perchance.org/google-sheets-plugin-onload-example#edit
https://perchance.org/plugins
```

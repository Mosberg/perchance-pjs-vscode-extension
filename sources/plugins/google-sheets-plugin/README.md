# Google Sheets Plugin — Complete Project Package

- **Generator:** `google-sheets-plugin`
- **Live page:** https://perchance.org/google-sheets-plugin
- **Listing / plugins index:** https://perchance.org/plugins
- **Runtime origin id (`window.generatorPublicId`):** `5e9fdaff73998c0f822cef67230e4436`
- **Snapshot date:** 2026-09-16
- **Nature of project:** a *Perchance plugin* — a generator whose top-level `$output`
  function is meant to be `{import:...}`-ed by other generators. It has **no build
  pipeline, no package manager, and no bundled JS libraries**; Perchance serves
  `main.pjs` + `index.html` directly.

This package is a byte-exact snapshot of every file in the project workspace plus every
asset, dependency and referenced generator, organized by category.

## Contents

| # | Category | Folder | What's in it |
|---|----------|--------|--------------|
| 1 | Internal code | `01-internal-code/` | `main.pjs` (the actual plugin), `index.html` (the documentation page). These two files *are* the shipped generator. |
| 2 | External code | `02-external-code/` | Verbatim source of the two example generators referenced by the docs. There are **no** external libraries, CDN modules, or vendored scripts anywhere in this project. |
| 3 | Third-party assets | `03-third-party-assets/` | Provenance + original URLs of the third-party-hosted media/links the docs page depends on (imgur screenshots, Google Sheets hosting, linked Perchance generators). |
| 4 | Project resources | `04-project-resources/` | The two PNG screenshots used by the documentation page, mirrored locally. |
| 5 | Build / config files | `05-build-config/` | None — see that folder's README for why. |
| 6 | Workspace meta | `06-workspace-meta/` | The platform's `AGENTS.md` agent-instructions file that sits in the workspace. **Not** part of the shipped generator. |

- Full file-by-file inventory: `MANIFEST.md`
- SHA-256 checksums of every original source/asset file: `MANIFEST.sha256`

## What it does

It loads one or more *published* Google Sheets (as tab-separated values) and injects each
spreadsheet column into the generator as a Perchance list named after that column's header
row. So a sheet with headers `fruit` / `veg` and rows underneath produces a `fruit` list
and a `veg` list, usable as `[fruit]`, `[veg]`, `[food.fruit]`, etc.

Because Perchance renders synchronously and the sheet fetch is async, placeholder
`<b>loading...</b>` items are recommended so the page doesn't error while data arrives. The
plugin calls `update()` (i.e. re-renders the page) once all sheets have loaded, or a
user-supplied `onLoad()` function instead, so only chosen elements are refreshed.

## Install / use (as documented by the generator itself)

1. In the Perchance *lists* editor (`main.pjs`):

   ```
   googleSheets = {import:google-sheets-plugin}

   sheetsSettings
     urls
       https://docs.google.com/spreadsheets/d/e/xMruYbv....OoEuPn/pub?gid\=0&single\=true&output\=tsv
       // add all the URLs you want to load

   fruit
     <b>loading...</b>
   veg
     <b>loading...</b>
   ```

2. At the top of the *HTML* editor (`index.html`):

   ```
   [googleSheets(root, sheetsSettings)]
   ```

   Pass a list instead of `root` to attach the imported lists as sub-lists of it.

3. Optional selective update:

   ```
   sheetsSettings
     urls
       ...
     onLoad() =>
       update(myCoolElement)
       update(myOtherElement)
   ```

Note: the sheet's columns are read from the first row (used as list names) and every
non-empty cell below becomes a list item. Odds notation works in cells; properties and
sub-lists are **not** supported. Google only republishes every ~5 minutes.

## Dependencies

- **Runtime dependencies:** none. The plugin uses the browser-native `fetch()` and the
  Perchance engine's own list API.
- **External service dependency:** Google Sheets' "File → Share → Publish to web → Tab-separated
  values (.tsv)" feature. The docs explicitly warn this may change/disappear.
- **Build dependencies:** none.

## License / attribution

No license file is present in the project. Documentation text and code are the generator
author's; the two screenshots in `04-project-resources/images/` are third-party-hosted
imgur uploads (see `03-third-party-assets/README.md`).

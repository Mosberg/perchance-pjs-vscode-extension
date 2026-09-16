# Project export

## What this project is
A Perchance generator. It ships exactly two source files:

- `main.pjs`  - perchance-js lists/config
- `index.html` - the generator's HTML body

There is **no** `src/` tree, **no** `imports/`, **no** build pipeline, **no** npm
dependencies, and **no** binary assets (images/audio/models/shaders/data). The
current content is the stock documentation page for the `url-params-plugin`.

## How it runs
`main.pjs` is evaluated by the Perchance engine before `index.html` runs; its
top-level names become globals on the page. Square-bracket templating works in
index.html text nodes and attributes. Nothing else is required to run it.

## Files
| File | Category | Notes |
|------|----------|-------|
| `main.pjs` | internal code | one line, defines `$output` |
| `index.html` | internal code | markup + inline CSS |
| `README.md` | build/config | this file |
| `DEPENDENCIES.md` | build/config | external URLs |
| `manifest.json` | build/config | machine-readable inventory |
| `source-backup/` | internal code | byte-identical copies of the two source files |

## Rebuild recipe
None needed - the two source files are the whole artifact.

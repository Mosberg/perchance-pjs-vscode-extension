# title-case-plugin — complete asset manifest

Generator: **title-case-plugin** (`https://perchance.org/title-case-plugin`)
Platform: Perchance (`main.pjs` + `index.html`, no build step)
Internal code size: 3546 bytes across 2 files

## Contents by category

| # | Category | What is in it |
|---|---|---|
| 01 | Internal code | `main.pjs`, `index.html` — the entire generator |
| 02 | External / third-party code | upstream `gouch/to-title-case` @ v2.2.1, full repo copy |
| 03 | Third-party assets | none exist; only the MIT license text is bundled |
| 04 | Project resources | none exist (no src/, no uploads, no data files, no state) |
| 05 | Build & config files | platform needs no build; upstream QUnit/std config + fixtures included |

## Every file in this package

| Path (relative to `title-case-plugin-full-package/`) | Bytes | SHA-256 |
|---|---:|---|
| `01-internal-code/main.pjs` | 1504 | `77cbaddcd69d16e5707c50f86750e9e0ce6a91632ea48ee7ab7bc829a7d7994b` |
| `01-internal-code/index.html` | 2057 | `b7fe74fc8c0b74358e6454c3bbc6ab243771eeac7cb7611bef4b85b9728742e4` |
| `01-internal-code/README.md` | 1279 | `e49249ac2ac42efbba46cfbcd3202639c9a1a2d7f6eeb14562cb5b44ff9682d8` |
| `02-external-code/README.md` | 1988 | `1ee77bc6de72a044d57433fd2859e00729b3733651d611012afd81873f0594fe` |
| `03-third-party-assets/README.md` | 895 | `336b64f59d6a921dc9cf48f64afabf625da32ebe7cbfc30a89133c1944a31747` |
| `03-third-party-assets/LICENSE-to-title-case` | 1061 | `ff02019c5989db6e30dbf35dcb86b3832448f2ae661c26df297f2e28d83d8ada` |
| `04-project-resources/README.md` | 712 | `c00d6b204a11fda7b41bb8100cc0960dbc67fc1183da2da3049da5fad84d6fa7` |
| `05-build-config/README.md` | 1848 | `dbb7eb5587fa957d0ee6dcddb8acfe8dec8ab7cec19bbc63ca7c07a8445c2381` |
| `02-external-code/to-title-case/README.md` | 3583 | `ca36174bbb5558b0386ac3ee8f82f579328d4d2cd233e333dd619ceb2842418b` |
| `02-external-code/to-title-case/LICENSE` | 1061 | `ff02019c5989db6e30dbf35dcb86b3832448f2ae661c26df297f2e28d83d8ada` |
| `02-external-code/to-title-case/package.json` | 512 | `37b325d6d1d5e640e496504882e505721a84f8d8ad42e4581e11de88c1a0e9e4` |
| `02-external-code/to-title-case/package-lock.json` | 121691 | `8d7bb74856289a8f863d3e24d7b932dae87925f1128d99e143e22fcee08e7c3a` |
| `02-external-code/to-title-case/to-title-case.js` | 1428 | `4995ee015667f33014540f568ad6baf7b40a78134619013d40ef2129598c7614` |
| `02-external-code/to-title-case/.gitignore` | 13 | `16d30e4462189fb14dd611bdb708c510630c576a1f35b9383e89a4352da36c97` |
| `02-external-code/to-title-case/test/index.js` | 688 | `fafe0e344804c6eda8a00f0a14be1db5024d5623a8075d47646660068a401309` |
| `02-external-code/to-title-case/test/runner.html` | 581 | `84afa60381701ef9effd302f593cb51a95f37e74a6771178dd0dbd8fb6162208` |
| `02-external-code/to-title-case/test/tests.json` | 5329 | `01ae15091bda22586b0c9fb88ae8fffe708547f2591dcba7b1c6fc78e0faad96` |
| `05-build-config/package.json` | 512 | `37b325d6d1d5e640e496504882e505721a84f8d8ad42e4581e11de88c1a0e9e4` |
| `05-build-config/package-lock.json` | 121691 | `8d7bb74856289a8f863d3e24d7b932dae87925f1128d99e143e22fcee08e7c3a` |
| `05-build-config/test/index.js` | 688 | `fafe0e344804c6eda8a00f0a14be1db5024d5623a8075d47646660068a401309` |
| `05-build-config/test/runner.html` | 581 | `84afa60381701ef9effd302f593cb51a95f37e74a6771178dd0dbd8fb6162208` |
| `05-build-config/test/tests.json` | 5329 | `01ae15091bda22586b0c9fb88ae8fffe708547f2591dcba7b1c6fc78e0faad96` |

## Runtime load graph

```
perchance.org/title-case-plugin  (top-level page)
└── iframe https://<publicId>.perchance.org/title-case-plugin
    ├── main.pjs   (engine parses; declares $output = titleCase(inputText, opts))
    └── index.html (engine renders body markup + <style>)
        └── (no scripts, no imports, no fetch, no assets)
```

## Rebuild / repackage recipe

Nothing is compiled, so "rebuilding" is repackaging the two shipped files:

```sh
# 1. the generator itself (only these two files are required to ship it)
cp main.pjs index.html 01-internal-code/

# 2. refresh the upstream reference copy at the pinned revision
curl -L https://codeload.github.com/gouch/to-title-case/zip/refs/heads/master -o up.zip
unzip up.zip -d 02-external-code/

# 3. zip it up
zip -r title-case-plugin-full-package.zip title-case-plugin-full-package
```

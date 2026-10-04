# Complete manifest — every file and reference

## 1. Internal code (the generator itself — 3 files, no build step)

| # | Path | Type | Role |
|---|------|------|------|
| 1 | internal-code/main.pjs | Perchance-JS source | The entire plugin: `$output(data)` function, image downloader, exampleData, exampleImagesHtml |
| 2 | internal-code/index.html | HTML source | Generator body: documentation page, live example, style block, inline base64 icon |
| 3 | internal-code/AGENTS.md | Markdown | Platform/agent notes shipped with the workspace |

## 2. External code (imports / libraries / build pipeline)

**NONE.** This generator has zero `{import:...}` statements, zero `<script src>` tags,
zero ES module imports, zero npm packages, zero config files (no package.json,
tsconfig, webpack/vite/esbuild config), and zero build pipeline.
Nothing is compiled, bundled, transpiled, or minified.

## 3. Project resources (assets created for the project)

| # | Path | Type | Origin |
|---|------|------|--------|
| 1 | assets/inline/page-icon.png | PNG 64x64, 1,451 B | Base64 `data:` URI inlined in index.html (the <h1> icon) |
| 2 | assets/contact-sheet.png | PNG | Generated for this package: all 11 sprites in one grid |

## 4. Third-party assets (referenced by main.pjs exampleData — archived here)

All 11 are 600x1200 PNGs with transparency (drawn on a common canvas), hosted on
imgur.com. Verified byte-exact downloads, non-empty pixel content:

| # | Layer | Local path | Original URL | Size |
|---|-------|-----------|--------------|------|
| 1 | hat | assets/example-layers/hat/1spyUp1.png | https://i.imgur.com/1spyUp1.png | 5,580 B |
| 2 | hat | assets/example-layers/hat/snpdUvc.png | https://i.imgur.com/snpdUvc.png | 4,370 B |
| 3 | eyes | assets/example-layers/eyes/PShX0T8.png | https://i.imgur.com/PShX0T8.png | 5,332 B |
| 4 | eyes | assets/example-layers/eyes/j6WWWPO.png | https://i.imgur.com/j6WWWPO.png | 3,115 B |
| 5 | head | assets/example-layers/head/ur3TABt.png | https://i.imgur.com/ur3TABt.png | 5,942 B |
| 6 | head | assets/example-layers/head/ERbhMDS.png | https://i.imgur.com/ERbhMDS.png | 9,669 B |
| 7 | body | assets/example-layers/body/iYazR0j.png | https://i.imgur.com/iYazR0j.png | 9,033 B |
| 8 | body | assets/example-layers/body/TGaOOVX.png | https://i.imgur.com/TGaOOVX.png | 10,550 B |
| 9 | legs | assets/example-layers/legs/Cn1S2Wh.png | https://i.imgur.com/Cn1S2Wh.png | 6,568 B |
| 10 | legs | assets/example-layers/legs/SKlERIz.png | https://i.imgur.com/SKlERIz.png | 7,250 B |
| 11 | legs | assets/example-layers/legs/BTl5Uf1.png | https://i.imgur.com/BTl5Uf1.png | 10,992 B |

## 5. External references (links only — not bundled)

See external/external-references.md.

## Totals

- Internal source files: 3
- Project-generated assets: 2
- Third-party bundled assets: 11
- External libraries / modules / build tools: 0
- Total files in this archive: 18 (incl. README.md + MANIFEST.md)

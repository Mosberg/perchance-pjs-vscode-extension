# INVENTORY - every item in this project, categorised

## A. INTERNAL CODE (project source, authored here)
| File | Lines | Bytes | Purpose |
|---|---|---|---|
| internal-code/main.pjs | 62 | 1808 | Entire generator logic: `$output (table) =>` function that turns a pipe-delimited list into an HTML <table>, plus demo lists myTable / myTable2 / myTable3. |
| internal-code/index.html | 70 | 2743 | Documentation page for the plugin (?output calls at lines 33/44/62) and an inline <style> block. |

## B. EXTERNAL CODE (fetched at runtime, not authored here)
| Item | Bytes | Source | Notes |
|---|---|---|---|
| perchance-engine-491bf81418aa4b69.js | 115369 | https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js | The only external script on the page. Implements the DSL, list-tree methods, renderer. Byte-exact copy included. |

## C. THIRD-PARTY ASSETS
None. No images, fonts, audio, video, models, textures, shaders, animations,
icons, or data files are referenced or generated anywhere in this project.

## D. PROJECT RESOURCES (data / templates / UI resources)
- No separate resource files.
- UI is produced procedurally: the function emits <table>/<tr>/<td> markup with
  inline styles built from the list's own properties (cellPadding, width,
  columnWidths, columnAlignments, tableStyle, rowStyle, cellStyle).
- "Templates" are only the inline <pre> documentation snippets inside index.html.

## E. BUILD / CONFIG
None. No package.json, bundler, transpiler, minifier, test runner, CI config,
or environment file. The two source files are shipped exactly as written;
Perchance renders main.pjs at request time and injects index.html into the page.

## F. PERSISTENCE / NETWORK / SECRETS
- localStorage/IndexedDB/kv: not used.
- Network calls from generator code: none.
- Secrets/API keys: none.

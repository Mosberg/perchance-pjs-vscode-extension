# AI Character Chat — complete source & asset package

A full, categorized export of the Perchance generator **AI Character Chat** (`https://perchance.org/ai-character-chat`):
the generator's own code, every Perchance generator it imports, every third-party library it loads,
and every hosted asset (bundled scripts, data files, avatar images) it references.

- Exported: **2026-09-16**
- Files: **84** — total **13,581,599 bytes**
- Original URLs, versions, licenses and SHA-256 hashes: see `MANIFEST.md` / `MANIFEST.json` / `LICENSES.md`
- Things the app fetches at runtime but that are not bundled here: see `RUNTIME-REFERENCES.md`

## Categories

| Directory | Category | Files | Bytes | What it is |
|---|---|---:|---:|---|
| `01-internal-code/` | Internal code | 2 | 932,597 | The generator's own source (the app itself). MIT-licensed (see header comment in index.html). |
| `02-perchance-imports/` | External code — Perchance generators | 13 | 457,547 | Read-only copies of every generator pulled in with {import:name}. These are separate Perchance generators, not files in this project. |
| `03-external-libraries/` | Third-party libraries | 32 | 5,778,264 | Pinned npm/CDN JS + CSS bundles the app loads at runtime (IndexedDB, markdown, sanitizer, PDF, transformers.js, editors, zip/exif/readability helpers, ...). |
| `04-hosted-assets/` | Project-hosted assets | 19 | 5,777,074 | The app's own bundled scripts + data files hosted on user.uploads.dev and referenced by URL from main.pjs/index.html (dependency bundle, worker scripts, emoji list, named-character share data). |
| `05-images/` | Project images | 18 | 636,117 | Avatar images for the default characters shipped with the app. |

## The two files that are the app

| File | Bytes | Role |
|---|---:|---|
| `01-internal-code/main.pjs` | 46,914 | Perchance-js config layer: plugin imports, share-link creation/loading (gzip + upload), the sandboxed perchance-text evaluator bridge, hierarchical chat summarization + memory extraction, `confirmAsync`, comment channels/options, static + dynamic `$meta`. |
| `01-internal-code/index.html` | 885,683 | The whole application: Dexie/IndexedDB schema + migrations, character & thread management, chat UI + streaming + markdown highlighting, the character "custom code" runner (the `oc` API), image generation, attachments (PDF/readability/zip/exif), lore & memory vector search, comments tabs, import/export, settings, etc. |

## Boot order (how the pieces connect)

1. **`main.pjs` evaluates first.** Each `x = {import:y}` line loads another Perchance generator and exposes it on `root.x` (e.g. `root.aiTextPlugin`, `root.commentsPlugin`, `root.uploadPlugin`). The list/function definitions in `main.pjs` become `root.*` globals too.
2. **`index.html` renders.** The engine evaluates every template expression first, then runs the page's `<script>` tags in order: `window.dbName`, the dependency bootstrap (`root.loadDependencies()` — the vendored dexie + dexie-export-import + marked + DOMPurify bundle from `04-hosted-assets/scripts/app-dependency-bundle-356cdae1.js`), then the main app script.
3. **Runtime libraries are pulled from CDN** (or the `user.uploads.dev` mirrors in `04-hosted-assets/scripts/`) exactly where the code needs them — CodeMirror themes/modes, highlight.js, morphdom, pdf.js, transformers.js, zip.js, ExifReader, readability, Comlink.
4. **Character "custom code"** and any perchance syntax inside character data must be untrusted, so it is evaluated inside the isolated iframe generator `02-perchance-imports/ai-character-chat-sandboxed-executor/` (see the CAUTION comment in its `index.html`).

## Reproducing this package

All of `03-external-libraries/`, `04-hosted-assets/scripts/` and `05-images/` are byte-exact downloads from the URLs listed in `MANIFEST.json` (`origin` field) — re-fetch those URLs to rebuild. `01-internal-code/` and `02-perchance-imports/` are the generator sources themselves (export them from the Perchance editor, or `perchance.org/api/getGeneratorsAndDependencies?generatorNames=...` for the imports).

## Licensing

The generator's own code is released under the MIT license (stated in the `index.html` header). The bundled third-party libraries keep their own licenses — see `LICENSES.md`, and note that `ua-parser-js` (used only by the bug-report helper) is **AGPL-3.0-or-later**.

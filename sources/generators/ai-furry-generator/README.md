# AI Furry Generator — complete project package

Everything that this project is made of: its own code, the full source of every Perchance generator
it imports, every third-party library and webfont it loads, the generator's own images/video/data
assets, the assets referenced from inside the imported generators, its configuration constants, and
the tooling needed to re-fetch anything that is deliberately not bundled.

| | |
|---|---|
| project | **Perchance AI Furry Generator** (`ai-furry-generator`) |
| canonical URL | https://perchance.org/ai-furry-generator |
| runtime origin | `https://<generatorPublicId>.perchance.org/ai-furry-generator` (captured id prefix `dbed7477`) |
| platform | Perchance (HTML + perchance-js "pjs"; no bundler, no npm install step) |
| build tags in source | `main.pjs` *AIFG v1.47 Quiet Mind Easter Egg build* · framework plugin *AIFG v1.50 Manual-stop AI translator bridge build* · tabbed comments *AIFG v1.93 Clean More build* |
| package contents | **846 files · ≈193.7 MB** (see `inventory.json` for the authoritative per-file list, `CHECKSUMS.sha256` to verify) |
| distribution | **4 zip parts** (a single archive exceeds the host's 100 MB per-file limit) — every part carries the same top-level folder, so unzip all four into one directory; see `README-FIRST.md` and `inventory.json → parts` |

> Licensing / credits: this project contains heavy community contributions and its authors ask that
> public cloning and credit removal be avoided. Read **`NOTICE.md`** before reusing anything.

---

## 1. Quick start

**To run it on Perchance** (there is no build step):

1. Create a generator at https://perchance.org.
2. Paste `01-internal-code/main.pjs` into its **main.pjs** pane.
3. Paste `01-internal-code/index.html` into its **HTML** pane.
4. Leave the `{import:...}` lines in `main.pjs` alone — Perchance resolves them by name at render
   time. (`02-external-code/imports/` is a reference snapshot of what gets pulled in, for study and
   for offline reading — you do not deploy it.)
5. Assets, fonts and emoji lists load from the URLs baked into the source. To run fully offline, see
   §5.

**To read it offline / audit it:** `01-internal-code/CODE-MAP.md` explains how `main.pjs` and
`index.html` are organised, `02-external-code/SOURCES.md` explains every import, and
`04-project-assets/ASSETS.md` maps every asset to the exact line that references it.

---

## 2. Layout

```
ai-furry-generator-complete-package/
├── README.md                     ← you are here
├── README-FIRST.md               ← how the 4 zip parts fit together (extract-all-into-one-folder)
├── NOTICE.md                     ← provenance, credits, licensing
├── inventory.json                ← machine-readable: every file + bytes + sha256 + category + source URL
├── CHECKSUMS.sha256              ← sha256 of every file (verify with: sha256sum -c CHECKSUMS.sha256)
├── 01-internal-code/             ← the project's own source, exactly as shipped
├── 02-external-code/             ← full source of every {import:...} generator + import graph
├── 03-third-party-vendor/        ← CDN libraries & fonts, stored locally, with offline CSS
├── 04-project-assets/            ← all images / video / emoji-list data / import-referenced assets
├── 05-external-services/         ← every host & endpoint the project talks to
├── 06-config/                    ← identity, $meta, import block, storage keys, profiles, agent notes
└── tools/                        ← build-inventory.mjs, fetch-remote-assets.mjs (Node 18+, no deps)
```

### 01-internal-code — the project itself

| file | lines | size | role |
|---|---|---|---|
| `main.pjs` | 6,047 | 325 KB | the generator's perchance-js: `$meta`, the import block, all data lists, helper functions, moderation config |
| `index.html` | 19,507 | 833 KB | the entire UI: 42 inline scripts, 21 style blocks, gallery/workspace/chat/wallpaper/settings markup |
| `CODE-MAP.md` | — | 10 KB | written for this package: section-by-section map of both files |

No minification, no build artefacts — these two files *are* the shipped app.

### 02-external-code — Perchance imports (external code)

`imports/<name>/main.pjs` for all **19** generators (8 direct + 11 transitive), 3.15 MB total,
including the 577 KB `t2i-framework-plugin-v2-furry-v1` engine and the 1.3 MB `furry-banlist`
moderation data. `SOURCES.md` lists each one with its public URL, role, size, line count, its own
imports, the full dependency graph, and its verbatim self-description comment. These are
**generators, not npm packages** — they are resolved by name on Perchance.

### 03-third-party-vendor — third-party libraries & fonts

| folder | contents |
|---|---|
| `css/` | 4 upstream stylesheets (Google Fonts ×3, Font Awesome 7.0.1) + `*.local.css` variants whose `url(...)`s point at the bundled fonts, + `all-vendor.local.css` (concatenation) |
| `js/` | `tally-embed.js` (feedback form widget), `jszip-3.10.1.esm.js` (client-side ZIP export inside the app) |
| `fonts/google-fonts/` | 130 `.woff2` from fonts.gstatic.com |
| `fonts/font-awesome/` | 4 Font Awesome webfonts |
| `VENDOR.md` | each file's original URL and license |

### 04-project-assets — project resources

| folder | files | size | contents |
|---|---|---|---|
| `images/` | 104 | 25.5 MB | banners, wallpaper full-size + picker previews, UI art |
| `video/` | 1 | 2.0 MB | animated `.webm` wallpaper |
| `emoji/` | 5 | 24.4 MB | the custom-emoji lookup lists (`name = image-file`), 86k–95k entries each |
| `import-assets/<import>/` | 556 | 134.2 MB | art-style previews, banlist media, emoji examples referenced from *inside* the imports (207 for the style list, 182 for the emoji list, 160 for the banlist, …) |
| `ASSETS.md` | — | 129 KB | full inventory tables: local file ↔ original URL ↔ referenced-at line |
| `ASSET-URLS.tsv` | — | 68 KB | the same mapping as a tab-separated file for scripting |

### 05-external-services

`EXTERNAL-SERVICES.md`: every host the project contacts (63 hosts, 164 non-asset URLs) grouped by
purpose — Perchance platform APIs, `user.uploads.dev`, comments/socket subdomains, Google Analytics
(`G-6QDMTXJTDD`), Tally (`mY2kKz`), font/CDN hosts, etc.

### 06-config

`CANONICAL.md` + `config.json` (same facts, machine-readable) + `AGENTS.md`: generator identity,
the verbatim `$meta` block, the verbatim import block, performance profiles
(`pl_performanceProfileV1`: `performance` / `balance` / `minimal`), every `localStorage` key the
project reads or writes, the page's inline script ids, analytics/feedback ids, and the embedded
page-identity gate.

### tools

Node 18+, no dependencies (they are *not* used by the generator at runtime — they are the capture /
maintenance tooling that produced this package):

| script | purpose |
|---|---|
| `tools/build-inventory.mjs` | walks the tree, re-hashes every file, re-categorises by path and regenerates `inventory.json` + `CHECKSUMS.sha256` |
| `tools/fetch-remote-assets.mjs` | re-downloads every remote-backed file from `inventory.json`, and with `--emoji` the ~92k custom-emoji images |

---

## 3. What is *not* in this package (and why)

| not included | scale | how to get it |
|---|---|---|
| the custom-emoji **images** the emoji lists point at | 91,848 unique files, multiple GB | `node tools/fetch-remote-assets.mjs --emoji` → `04-project-assets/emoji-images/` |
| AI images the app generates at runtime | unbounded, per-user | produced live by the text-to-image plugin; the *styles/prompts* that produce them are fully included (`import-assets/ai-furry-generator-style-v17/`, `t2i-styles`) |
| user runtime state (saved galleries, `kv-plugin` folders, comments, settings in `localStorage`) | per-user | lives in the visitor's browser; key names are documented in `06-config/CANONICAL.md` |
| 10 wallpaper-picker preview images that 404 upstream | 10 files | recorded with their URLs in `ASSETS.md` § 4; the app falls back to the full-size wallpaper |

Everything else the project references *is* included, byte-for-byte, including the assets that are
only referenced from commented-out lines (they are flagged `active = no` in `ASSETS.md`).

---

## 4. Verify

```bash
sha256sum -c CHECKSUMS.sha256                 # every file in the package
node tools/fetch-remote-assets.mjs --verify   # every remote-backed file still matches upstream
```

`inventory.json` schema (per entry): `path`, `bytes`, `sha256`, `category`, `sourceUrl` (the exact
URL found in the source, `null` for the project's own files).

---

## 5. Running without the public asset host

Every asset lives at `https://user.uploads.dev/file/<id>.<ext>`. To make the project fully offline:

1. Upload the files from `04-project-assets/` somewhere you control (or serve them locally).
2. Replace the URL strings in `01-internal-code/main.pjs` and `01-internal-code/index.html` — the
   mapping is in `04-project-assets/ASSET-URLS.tsv` (`local-file ⇥ original-url`, plus the
   `referenced at` column so you can target the exact occurrences) and in `inventory.json`.
3. `03-third-party-vendor/css/all-vendor.local.css` already removes all CDN font/CSS requests: swap
   the four `<link>` tags in `index.html` for `<link rel="stylesheet" href=".../all-vendor.local.css">`.
4. If you keep the emoji lists, either re-host the emoji `.txt` files or fetch the images with
   `tools/fetch-remote-assets.mjs --emoji`.

---

## 6. How this package was captured

* Sources came from the generator as saved on Perchance (its `main.pjs` + `index.html`) and from the
  platform's public import resolution for each `{import:...}` (the full transitive dependency set).
* Every remote URL was extracted from the source text (including commented-out lines), then fetched
  and stored byte-for-byte under `04-project-assets/`; failures were detected by HTTP status and are
  documented rather than silently dropped.
* Vendor CSS was rewritten only in the `*.local.css` copies — the upstream `*.css` files are
  unmodified, and no change whatsoever was made to `main.pjs`, `index.html`, or any import.
* All checksums were computed after the tree was finalised; `inventory.json` and `CHECKSUMS.sha256`
  are regenerated by re-running the same extraction script.

# AI RPG - complete source & asset package

**Generator:** `ai-rpg` (<https://perchance.org/ai-rpg>)
**Runtime origin:** `https://3024cd578e830e9961167a8c06292d9c.perchance.org/ai-rpg`
**Packaged:** 2026-09-16T17:09:33.832Z
**Total assets catalogued:** 966 files (71.6 MB bundled in this zip, 11281.8 MB of large media linked from the manifests)

---

## 1. What this is

This zip is a byte-exact mirror of every file that the Perchance generator `ai-rpg` loads or is built from,
organised by category, plus a complete machine-readable index of every remote asset with its URL,
byte size, SHA-256 (for bundled files) and the exact place in the code where it is referenced.

Bundled in this zip: **71.6 MB across 739 files**
(all source code, all Perchance plugin dependencies, all third-party libraries, all data files,
all 723 premade-adventure card images, and the 4 gif background loops).

Referenced but *not* bundled: **11281.8 MB across 227 audio/video files**
(227 mp3 / mp4 / webm assets). They are Perchance-hosted and can be re-fetched at will - see
`05-media-assets/` (manifest + one-command downloaders for bash, Node and the browser).
Bundling them would have produced an ~11.3 GB zip, so they ship as links plus a downloader instead.

## 2. Layout

```
ai-rpg-complete-package/
  README.md                      <- this file
  PACKAGE-MANIFEST.json          <- every file in this zip: category, bytes, sha256, provenance
  PACKAGE-MANIFEST.md            <- same thing, human readable
  ASSET-INDEX.csv / .md          <- all 966 assets (bundled + linked): URL, size, sha256, where it's used
  SHA256SUMS.txt                 <- checksums of every bundled file
  FULL-SOURCE.md                 <- every code/config file in one document, in full, in fenced code blocks
  01-project-source/             <- the generator itself (main.pjs + index.html)
  02-perchance-dependencies/     <- the 14 Perchance plugin generators it imports (full source)
  03-external-libraries/         <- third-party JS libraries and tools (vendored copies)
  04-project-assets/             <- data + images the generator loads at runtime
  05-media-assets/               <- media manifest, file list and downloader scripts
  06-config/                     <- generator metadata, dependency graph, build notes
```

## 3. Project code (01)

| file | bytes | role |
|---|---|---|
| `01-project-source/main.pjs` | 276436 | Perchance-js generator code: imports, `$meta`, prompt/instruction lists, save/load, story management, share links, summarisation, tracked-info, music/background plumbing |
| `01-project-source/index.html` | 196355 | The body markup + the bulk of the client JS (UI, playlists, premade adventures, tag suggestor, settings, drawers/modals) |

There is **no build pipeline**: Perchance renders `main.pjs` + `index.html` directly on the server/edge,
resolving `{import:name}` references and evaluating the template at page load. Nothing is transpiled,
minified or bundled for this generator - what is in these two files is what runs. See `06-config/BUILD-NOTES.md`.

## 4. Perchance plugin dependencies (02)

- `ai-text-plugin` (58048 B) - <https://perchance.org/ai-text-plugin>
- `bug-report-plugin` (7718 B) - <https://perchance.org/bug-report-plugin>
- `combine-emojis-plugin` (283 B) - <https://perchance.org/combine-emojis-plugin>
- `comments-plugin` (38261 B) - <https://perchance.org/comments-plugin>
- `dynamic-import-plugin` (4187 B) - <https://perchance.org/dynamic-import-plugin>
- `fullscreen-button-plugin` (1916 B) - <https://perchance.org/fullscreen-button-plugin>
- `huge-emoji-list` (513 B) - <https://perchance.org/huge-emoji-list>
- `kv-plugin` (4177 B) - <https://perchance.org/kv-plugin>
- `literal-plugin` (454 B) - <https://perchance.org/literal-plugin>
- `prompt2-plugin` (14632 B) - <https://perchance.org/prompt2-plugin>
- `tabbed-comments-plugin-v1` (64046 B) - <https://perchance.org/tabbed-comments-plugin-v1>
- `text-editor-plugin-v1` (465766 B) - <https://perchance.org/text-editor-plugin-v1>
- `text-to-image-plugin` (37978 B) - <https://perchance.org/text-to-image-plugin>
- `upload-plugin` (10271 B) - <https://perchance.org/upload-plugin>

These are fetched by the Perchance engine at page load; the copies here are the exact sources served by the
platform on 2026-09-16. Dependency edges (which plugin imports which) are in
`06-config/generator-metadata.json`. See `02-perchance-dependencies/_DEPENDENCIES.md` for a per-plugin role list.

## 5. Third-party libraries (03)

- `03-external-libraries/cbor-x/cbor-x-1.6.0.js` (87547 B) - CBOR (de)serialization for save/share payloads
  - source: https://user.uploads.dev/file/4cc84b2c503aad595e5c6e9fffe24602.js
  - upstream: https://unpkg.com/cbor-x@1.6.0/dist/index.js
- `03-external-libraries/ua-parser-js/ua-parser-js-2.0.0-rc.1.js` (30035 B) - Browser/device detection used by bug-report-plugin
  - source: https://user.uploads.dev/file/f2e26ac127c029f401f2a990a4bafbe8.js
  - perchance-hosted immutable mirror of https://cdn.jsdelivr.net/npm/ua-parser-js@2.0.0-rc.1/dist/ua-parser.min.js
- `03-external-libraries/idb-keyval/idb-keyval-6.esm.js` (2320 B) - IndexedDB key/value store used by kv-plugin
  - source: https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm
- `03-external-libraries/zip.js/zip.js-2.7.60-esm-entry-shim.js` (506 B) - zip read/write for adventure import/export (this file is the tiny esm.sh entry shim; the real module is fetched from esm.sh at runtime)
  - source: https://esm.sh/@zip.js/zip.js@2.7.60
- `03-external-libraries/perchance-tools/tokenizer-training-script.ts` (22115 B) - Dev tool referenced in ai-text-plugin: Deno script that trains the fast bigram token counter
  - source: https://user.uploads.dev/file/e29eab687b1fbf129076ec6057484bb3.js

## 6. Project data & images (04)

- `04-project-assets/data/wordlists/massive-word-list.txt` (1500231 B) - Creativity seed words, one per line. Fetched on load into window.massiveWordList and sampled into the instructions to vary story openings.
  - source: https://user.uploads.dev/file/fdd83a6f7348fec983cb2583936beaf5.txt
- `04-project-assets/data/wordlists/story-tags.txt` (3222148 B) - Story tag names (window.massiveStoryTagsList) - used for creativity seeds and the tag suggestor.
  - source: https://user.uploads.dev/file/f81d2b202b03da473014d0f2db351931.txt
- `04-project-assets/data/wordlists/tag-vector-pack.bin` (6645116 B) - Packed quantized tag embedding vectors + LSH tables for the overview tag-suggestor (decoded by decodePacked()).
  - source: https://user.uploads.dev/file/a5aed167ed50de1e081c05fea18a9010.bin
- `04-project-assets/data/wordlists/tag-counts.bin` (663404 B) - Uint32Array of per-tag usage counts, paired with tag-vector-pack.bin.
  - source: https://user.uploads.dev/file/77c9fc95d491d1d4ce8d0018a29315c1.bin
- `04-project-assets/data/emoji-name-map.txt` (4546603 B) - Custom emoji name -> .webp sprite filename map (the huge-emoji-list generator's $output) used by the comments plugin.
  - source: https://user.uploads.dev/file/a39d52b89a33865b9a903fcc5786a2da.txt
- `04-project-assets/data/premade-adventures.json` (10019449 B) - Full premade-adventures manifest (723 entries: title, rating, tags, description, overview text, cardImage). Loaded via window.premadeAdventuresManifestUrl.
  - source: https://user.uploads.dev/file/4bae8c63c1b8a8f0485e27e30737dc44.json
- `04-project-assets/meta/social-image.jpeg` (232494 B) - The generator's $meta.image (listing/social preview image).
  - source: https://user.uploads.dev/file/7779244672aaaf6c2c3c6b72d61c600a.jpeg
- `04-project-assets/premade-adventures/cards/*.webp` - 723 card images (~21.2 MB), one per entry in `premade-adventures.json`.

## 7. Media (05)

| category | files | total size | bundled? |
|---|---|---|---|
| Background music playlist (window.defaultMusicTracks) | 44 | 2997.9 MB | no - linked |
| Animated background scenes (window.defaultBackgroundVisuals) - mp4/webm video loops + gif loops | 49 | 552.4 MB | yes (4 files) |
| Music library (commented-out <option> list used for future dynamic audio selection) | 138 | 7756.2 MB | no - linked |
| Premade adventure card images (webp) - inline top-10 + full 723-entry manifest | 723 | 21.2 MB | yes (723 files) |
| Project data files (word lists, tag vectors, emoji map, premade manifest, $meta image) | 7 | 25.6 MB | yes (7 files) |
| Third-party libraries & tools | 5 | 0.1 MB | yes (5 files) |

### Fetching the non-bundled media

```bash
cd 05-media-assets
./download-media.sh ./downloads        # bash + curl (11.3 GB)
node download-media.mjs ./downloads    # Node 18+
open downloader.html                   # browser: pick a folder, click "download all"
```

`media-filelist.txt` is a plain `URL<TAB>destination` list that any downloader (`wget -i`, aria2, ...) can consume.
`media-manifest.json` carries the title, emoji, category and size of every one of them.

## 8. Runtime external endpoints (no code shipped - they are services)

| endpoint | purpose |
|---|---|
| `text-generation.perchance.org` | AI text generation backend used by the `ai`/`ai-text-plugin` iframe |
| `image-generation.perchance.org` | text-to-image backend (scene image tray) |
| `comments-plugin.perchance.org` | comments/chat backend |
| `upload.perchance.org`, `user.uploads.dev`, `user-uploads.perchance.org`, `editable.uploads.dev` | file hosting used for share links, image hosting and editable files |
| `esm.sh/@zip.js/zip.js@2.7.60` | dynamically imported zip writer/reader (adventure export/import) |
| `cdn.jsdelivr.net/npm/idb-keyval@6/+esm` | duplicate retrieval of the kv-plugin storage helper |
| `cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3` | on-demand background removal model runtime (`removeBackground` in text-to-image-plugin) |
| `fonts.googleapis.com/css2?family=...` | Google Fonts stylesheets loaded on demand for user-picked story fonts |
| `www.youtube-nocookie.com/embed/${id}` | YouTube embeds in generated content |
| `editable.uploads.dev/file/ai-rpg/...` | editable share payloads |

## 9. Integrity

Every bundled file's SHA-256 is in `SHA256SUMS.txt` and `PACKAGE-MANIFEST.json`. Verify with:

```bash
sha256sum -c SHA256SUMS.txt
```

## 10. Provenance & licensing

- Generator code (`01-*`): authored for the Perchance generator `ai-rpg`. Treat as the generator author's work.
- Perchance plugins (`02-*`): each plugin is itself a Perchance generator; the canonical, always-current
  source is `https://perchance.org/<name>`. Licence terms are those of each generator's author
  (Perchance generators are publicly downloadable; check the individual generator page).
- Third-party libraries (`03-*`): cbor-x (MIT), ua-parser-js, idb-keyval (MIT), zip.js (BSD-3-Clause),
  @huggingface/transformers (Apache-2.0). Check each upstream repository for the exact licence text; the
  vendored copies here are unmodified.
- Media (`04-*, 05-*`): hosted by Perchance (`user.uploads.dev`) and referenced by the generator. This
  package redistributes only the small subset that the generator needs to run its UI (cards, meta image,
  data files, git loops); the music/video library is delivered as links to the original host.
- AI RPG's music/scene library is third-party content aggregated by the generator author; it is linked,
  not re-licensed, here.

## 11. Reproducing this package

1. Fetch the generator source: `GET https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=ai-rpg`
   (returns `main.pjs` = `code`, `index.html`, and the transitive import list).
2. For each imported plugin name, fetch `https://perchance.org/<name>` and pull its two files.
3. Collect every `https://user.uploads.dev/file/<32-hex>.<ext>` URL found in those files, plus every
   `cardImage` in the premade-adventures manifest, and download each one byte for byte.
4. Recompute the SHA-256 of each file and compare against `SHA256SUMS.txt`.

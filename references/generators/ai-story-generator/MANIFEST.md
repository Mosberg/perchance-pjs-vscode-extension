# MANIFEST

Complete, categorised index of the project. Sizes are bytes on disk.

## 1. Internal code (written for this generator)

| File | Size | Contents |
|---|---|---|
| `internal-code/main.pjs` | 243525 | `$meta` SEO config, the 14 `{import:}` declarations, the story-writing prompt template (`storyWritingPrompt` + streaming `onStart/onChunk/onFinish` hooks), all story state normalisation, kv persistence, folders, search, export/import (CBOR + zip), theme engine helpers, music/background helpers |
| `internal-code/index.html` | 123309 | Page markup (drawers, modals, editors, image tray), all CSS, and the client app: editor integration, generation control, stories drawer, notepad, theme UI, media library, share/export/import flows, story-tag suggestion engine |
| `internal-code/meta-config.md` | — | the `$meta` block alone |

### Where things live inside main.pjs
- `$meta` — page title/description for SEO + social cards.
- `storyWritingPrompt` — the AI instruction template, including the prefix-cache-friendly ordering
  (static instruction → append-only story-so-far → per-call task/state).
- `getOptionalSeedWordsTip()` — creativity-seed injection (uses `assets/data/creativity-seed-words.txt`).
- KV layer: `ensureStoryManager`, `saveCurrentStoryToKvNow`, `requestSaveCurrentStory`, folder meta,
  app media, notepad, `checkForExternalStoryUpdate` (multi-tab conflict watch).
- Export/import: `ensureCBOR`, `ensureZipJs`, `getAllStoriesBundle`, zip read/write, encrypted export.
- Share: `shareStoryLinkInputEl` builds `https://perchance.org/<name>#data=...` links.

## 2. External code — Perchance imports (`external-code/perchance-imports/`)

| # | Import name | Local name in main.pjs | Purpose | Size |
|---|---|---|---|---|
| 1 | `ai-text-plugin` | `ai` | Story text generation (streaming `generateText`) | 56.7 KB |
| 2 | `comments-plugin` | `commentsPlugin` | Feedback button (also a transitive dep of tabbed-comments-plugin-v1) | 37.4 KB |
| 3 | `tabbed-comments-plugin-v1` | `tabbedCommentsPlugin` | Comments section at the bottom of the page | 62.5 KB |
| 4 | `fullscreen-button-plugin` | `fullscreenButton` | Fullscreen toggle button | 1.9 KB |
| 5 | `literal-plugin` | `literal` | Escapes `{}`/`[]` in user/AI text so the Perchance engine treats them literally | 0.4 KB |
| 6 | `upload-plugin` | `upload` | Share links + temporary-URL exports (also hosts imported files) | 10.0 KB |
| 7 | `kv-plugin` | `kv` | Per-story + app-wide persistence and auto-backups (IndexedDB) | 4.1 KB |
| 8 | `favicon-plugin` | `favicon` | Sets the browser-tab icon | 0.5 KB |
| 9 | `bug-report-plugin` | `bugReport` | Collects browser debug info for the feedback button | 7.5 KB |
| 10 | `text-editor-plugin-v1` | `createTextEditor` | High-performance rich text editor (vendors CodeMirror 6 internals) | 454.8 KB |
| 11 | `text-to-image-plugin` | `generateImage` | Illustration/kept-image generation | 37.1 KB |
| 12 | `combine-emojis-plugin` | `combineEmojis` | Layers emojis for composed icon badges | 0.3 KB |
| 13 | `huge-emoji-list` | (transitive) | Emoji-name → emoji list; imported by tabbed-comments-plugin-v1 | 0.5 KB |
| 14 | `dynamic-import-plugin` | (transitive) | Runtime `{import:}` resolution; imported by bug-report-plugin | 4.1 KB |

Resolution line(s): `ai = {import:ai-text-plugin} // <-- for generating the story text\ncommentsPlugin = {import:comments-plugin} // <-- for feedback button\ntabbedCommentsPlugin = {import:tabbed-comments-plugin-v1} // <-- for comments section at bottom of page\nfullscreenButton = {import:fullscreen-button-plugin}\nliteral = {import:literal-plugin} // <-- we use this to make it so curly brackets and square brackets in the story are interpreted as literal/plain brackets, and not Perchance special curly/square block characters\nupload = {import:upload-plugin} // <-- for the share link feature\nkv = {import:kv-plugin} // <-- for story storage + auto-backups (indexeddb)\nfavicon = {import:favicon-plugin} // <-- for the icon in the browser tab\nbugReport = {import:bug-report-plugin} // for comments-plugin-based feedback button - it's a helper for getting browser debug info like browser version, localStorage size limits, etc. - stuff that's relevant to bug reports\ncreateTextEditor = {import:text-editor-plugin-v1} // a higher-performance version of <textarea> that also supports text styling (e.g. text within asterisks can be italicized)\ngenerateImage = {import:text-to-image-plugin}\ncombineEmojis = {import:combine-emojis-plugin} // simple helper for layering multiple emojis on top of one another`

## 3. External code — third-party libraries (`external-code/`)

| File | Upstream | Notes |
|---|---|---|
| `cbor.js` | [cbor-x@1.6.0](https://unpkg.com/cbor-x@1.6.0/dist/index.js) | Perchance-hosted copy; `import()`-ed in `ensureCBOR()`. Exposes `CBOR.encode/decode` for the export/import bundle and URL share links. |
| `ua-parser-js-2.0.0-rc.1.min.js` | [ua-parser-js@2.0.0-rc.1](https://cdn.jsdelivr.net/npm/ua-parser-js@2.0.0-rc.1/dist/ua-parser.min.js) | AGPLv3. Loaded by `bug-report-plugin` for browser/OS detection in feedback. |
| `tokenizer-tool.js` | bespoke (with inlined model + tokenizer data) | Dev utility referenced from a comment in `ai-text-plugin`; not loaded at page runtime. |

## 4. Project resources / assets (`assets/`)

| File | Size | Used by |
|---|---|---|
| `assets/images/favicon.png` | 34565 | `[favicon(...)]` in index.html |
| `assets/data/creativity-seed-words.txt` | 1500231 | `getOptionalSeedWordsTip()` at story start |
| `assets/data/story-tag-embeddings-pack.txt` | 3222148 | story-tag suggestion box (tag vocabulary) |
| `assets/data/story-tag-embeddings-q4.bin` | 6645116 | quantised embedding planes |
| `assets/data/story-tag-embeddings-counts.bin` | 663404 | per-tag usage counts |
| `assets/data/emoji-list.txt` | 4546603 | `huge-emoji-list` (`$output`) for comment emoji picker |
| `assets/data/upload-deletion-notice.txt` | 16 | default deletion notice for `upload-plugin` |
| `assets/media/MEDIA-ASSETS.md` / `.csv` | — | 44 music tracks + 49 animated backgrounds, with direct links |

## 5. Build / config files

There are none. Perchance generators have **no build step**: `main.pjs` and `index.html` are parsed and
executed by the platform engine at load time. Configuration that would normally live in a config file is
instead:
- the `$meta` block (see `internal-code/meta-config.md`),
- the `{import:...}` lines at the top of `main.pjs`,
- module-level constants in `main.pjs` (`STORIES_META_KEY`, `ACTIVE_STORY_ID_KEY`, `FOLDERS_META_KEY`,
  `APP_CUSTOM_MUSIC_KEY`, `APP_CUSTOM_BACKGROUNDS_KEY`, `APP_NOTEBOOK_KEY`),
- the `window.defaultMusicTracks` / `window.defaultBackgroundVisuals` arrays at the top of `index.html`.

## 6. Runtime CDN / service dependencies

See `external-code/cdn-runtime-dependencies.md`.

# Runtime CDN & service dependencies

Libraries and services fetched **while the page runs** (i.e. not part of the zip).

## Libraries loaded from a CDN

| Library | URL | Loaded by | Purpose |
|---|---|---|---|
| @zip.js/zip.js v2.7.60 | `https://esm.sh/@zip.js/zip.js@2.7.60` | `ensureZipJs()` in main.pjs | zip export/import (incl. password-protected archives) |
| cbor-x v1.6.0 | `https://user.uploads.dev/file/4cc84b2c503aad595e5c6e9fffe24602.js` | `ensureCBOR()` in main.pjs | binary encoding of the export bundle & share links (bundled in `external-code/cbor.js`) |
| @huggingface/transformers v3.3.3 | `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3` | `imports/text-to-image-plugin/main.pjs` | optional in-browser model work for image features |
| ua-parser-js v2.0.0-rc.1 | `https://user.uploads.dev/file/f2e26ac127c029f401f2a990a4bafbe8.js` | `imports/bug-report-plugin/main.pjs` | browser/OS detection for bug reports (bundled) |
| idb-keyval v6 | `https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm` | commented-out alternative in `imports/kv-plugin/main.pjs` | not used at runtime |
| Google Fonts | `https://fonts.googleapis.com/css2?family=<family>&display=swap` | theme engine in main.pjs | user-chosen font for the story text |

## Perchance platform services

| Service | Origin | Purpose |
|---|---|---|
| AI text generation | `https://text-generation.perchance.org` | streams story text (`ai-text-plugin`) |
| AI image generation | `https://image-generation.perchance.org` | illustrations (`text-to-image-plugin`) |
| Comments embed | `https://comments-plugin.perchance.org/embed/<channel>` | the comments/feedback iframe |
| File upload | `https://upload.perchance.org/embed` | user uploads via `upload-plugin` |
| Editable text files | `https://editable.uploads.dev/file/<generator>/<name>` | `upload-plugin.editable` |
| Generator source API | `https://perchance.org/api/getGeneratorsAndDependencies` | `dynamic-import-plugin` / `bug-report-plugin` |
| AI agent log endpoint | `https://ai-agent.perchance.org/api/aiAgent/clientLog` | telemetry beacon from `ai-text-plugin` |
| Asset host | `https://user.uploads.dev/file/...`, `https://user-uploads.perchance.org/file/...` | all media/data assets in this project |
| Cross-generator link | `https://perchance.org/text-to-audiobook#text=...` | "read as audiobook" button |

## External references (not loaded, cited in comments/source)

- `https://issues.chromium.org/issues/371791303` — Chromium EditContext bug worked around in `text-editor-plugin-v1`
- `https://github.com/jhchen/fast-diff` — fast-diff, vendored (and surgically modified) inside `text-editor-plugin-v1`
- `https://www.w3.org/...` — SVG namespace strings
- `https://fonts.google.com/` — help link in the theme UI

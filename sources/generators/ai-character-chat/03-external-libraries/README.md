# 03-external-libraries — third-party libraries (pinned versions)

Byte-exact copies of every third-party JS/CSS asset the app loads, at the exact version/URL the app requests.
CSV and worker mirrors are included where the app keeps them on user.uploads.dev (see `04-hosted-assets/`).

| File | Bytes | Original URL |
|---|---:|---|
| `cdnjs/dexie-4.0.8/dexie.min.js` | 93,880 | `https://cdnjs.cloudflare.com/ajax/libs/dexie/4.0.8/dexie.min.js` |
| `cdnjs/highlight.js-11.7.0/highlight.min.js` | 120,692 | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/es/highlight.min.js` |
| `esm.sh/mozilla-readability-0.5.0.js` | 188 | `https://esm.sh/@mozilla/readability@0.5.0?no-check` |
| `esm.sh/mozilla-readability-0.5.0/readability.mjs` | 34,241 | `null` |
| `esm.sh/zip.js-2.7.55.js` | 99 | `https://esm.sh/@zip.js/zip.js@2.7.55?bundle` |
| `esm.sh/zip.js-2.7.55/zip.bundle.mjs` | 172,997 | `null` |
| `jsdelivr-gh/highlightjs-cdn-release-11.7.0/default.min.css` | 1,144 | `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/default.min.css` |
| `npm/codemirror-5.65.13/codemirror.min.css` | 6,378 | `https://cdn.jsdelivr.net/npm/codemirror@5.65.13/lib/codemirror.min.css` |
| `npm/codemirror-5.65.13/mode/css.js` | 40,492 | `null` |
| `npm/codemirror-5.65.13/mode/htmlmixed.js` | 5,688 | `null` |
| `npm/codemirror-5.65.13/mode/javascript.js` | 38,894 | `null` |
| `npm/codemirror-5.65.13/mode/xml.js` | 13,353 | `null` |
| `npm/codemirror-5.65.13/theme-material-darker.css` | 2,607 | `null` |
| `npm/codemirror-5.65.17/addon-display-placeholder.js` | 2,831 | `https://cdn.jsdelivr.net/npm/codemirror@5.65.17/addon/display/placeholder.js` |
| `npm/codemirror-5.65.17/codemirror.min.js` | 173,953 | `https://cdn.jsdelivr.net/npm/codemirror@5.65.17/lib/codemirror.min.js` |
| `npm/dompurify-3.0.1/purify.min.js` | 22,934 | `https://cdn.jsdelivr.net/npm/dompurify@3.0.1/dist/purify.min.js` |
| `npm/exifreader-4.12.0/exifreader.js` | 84,744 | `https://cdn.jsdelivr.net/npm/exifreader@4.12.0/+esm` |
| `npm/highlight.js-11.7.0/atom-one-dark.css` | 856 | `https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/styles/atom-one-dark.css` |
| `npm/huggingface-transformers-3.3.3/transformers.js` | 820,359 | `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3` |
| `npm/json5-2.2.2/index.min.mjs` | 29,473 | `https://cdn.jsdelivr.net/npm/json5@2.2.2/dist/index.min.mjs` |
| `npm/marked-4.2.12/marked.min.js` | 48,887 | `https://cdn.jsdelivr.net/npm/marked@4.2.12/marked.min.js` |
| `npm/morphdom-2.7.2/morphdom-umd.min.js` | 12,028 | `https://cdn.jsdelivr.net/npm/morphdom@2.7.2/dist/morphdom-umd.min.js` |
| `npm/msgpackr-1.11.0/index.min.js` | 28,035 | `https://cdn.jsdelivr.net/npm/msgpackr@1.11.0/dist/index.min.js` |
| `npm/pdfjs-dist-4.7.76/pdf.min.mjs` | 336,222 | `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs` |
| `npm/pdfjs-dist-4.7.76/pdf.worker.min.mjs` | 1,366,356 | `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs` |
| `npm/ua-parser-js-2.0.0-rc.1/ua-parser.min.js` | 30,034 | `https://cdn.jsdelivr.net/npm/ua-parser-js@2.0.0-rc.1/dist/ua-parser.min.js` |
| `npm/xenova-transformers-2.0.0-alpha.0/transformers.js` | 1,110,351 | `https://cdn.jsdelivr.net/npm/@xenova/transformers@2.0.0-alpha.0/dist/transformers.js` |
| `npm/xenova-transformers-2.17.1/transformers.js` | 894,840 | `https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1` |
| `unpkg/cbor-x-1.6.0/index.js` | 87,433 | `https://unpkg.com/cbor-x@1.6.0/dist/index.js` |
| `unpkg/comlink-4.4.1/comlink.js` | 14,125 | `https://unpkg.com/comlink@4.4.1/dist/umd/comlink.js` |
| `unpkg/comlink-4.4.1/comlink.mjs` | 12,158 | `https://unpkg.com/comlink@4.4.1/dist/esm/comlink.mjs` |
| `unpkg/dexie-export-import-4.1.2/dexie-export-import.js` | 171,992 | `https://unpkg.com/dexie-export-import@4.1.2/dist/dexie-export-import.js` |

Licenses: see `../LICENSES.md` (note ua-parser-js is AGPL-3.0-or-later).

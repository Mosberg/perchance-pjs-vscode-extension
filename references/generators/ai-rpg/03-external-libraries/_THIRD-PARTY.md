# Third-party libraries and tools

Non-Perchance code the generator loads, vendored here byte-for-byte.

## cbor-x-1.6.0.js

- path: `03-external-libraries/cbor-x/cbor-x-1.6.0.js`
- bytes: 87547
- sha256: `2962cef419bdd3a7232c3996c6aa2aabaedbf60950ad66be39363c26328811e4`
- runtime source: https://user.uploads.dev/file/4cc84b2c503aad595e5c6e9fffe24602.js
- upstream: https://unpkg.com/cbor-x@1.6.0/dist/index.js
- role: CBOR (de)serialization for save/share payloads

## ua-parser-js-2.0.0-rc.1.js

- path: `03-external-libraries/ua-parser-js/ua-parser-js-2.0.0-rc.1.js`
- bytes: 30035
- sha256: `7da47cfc6b734e4e5200e78d1875727ebc979306a185e4eff956a0fe675cd756`
- runtime source: https://user.uploads.dev/file/f2e26ac127c029f401f2a990a4bafbe8.js
- perchance-hosted immutable mirror of https://cdn.jsdelivr.net/npm/ua-parser-js@2.0.0-rc.1/dist/ua-parser.min.js
- role: Browser/device detection used by bug-report-plugin

## idb-keyval-6.esm.js

- path: `03-external-libraries/idb-keyval/idb-keyval-6.esm.js`
- bytes: 2320
- sha256: `693d13bc9b2be241c07d80b6c35a953183d50535cbcd8ffdba420549a9c9c778`
- runtime source: https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm
- role: IndexedDB key/value store used by kv-plugin

## zip.js-2.7.60-esm-entry-shim.js

- path: `03-external-libraries/zip.js/zip.js-2.7.60-esm-entry-shim.js`
- bytes: 506
- sha256: `7aa31ee87f68ea478bc1d225bca7c69dd3846bbffc77d6cc38d070087c871e68`
- runtime source: https://esm.sh/@zip.js/zip.js@2.7.60
- role: zip read/write for adventure import/export (this file is the tiny esm.sh entry shim; the real module is fetched from esm.sh at runtime)

## tokenizer-training-script.ts

- path: `03-external-libraries/perchance-tools/tokenizer-training-script.ts`
- bytes: 22115
- sha256: `6339c0626b78c2953df0ea609c11eee73e389b16da5f09fb2526c490b4274a8b`
- runtime source: https://user.uploads.dev/file/e29eab687b1fbf129076ec6057484bb3.js
- role: Dev tool referenced in ai-text-plugin: Deno script that trains the fast bigram token counter

## Loaded at runtime from CDNs (not vendored)

| URL | why it is not vendored | role |
|---|---|---|
| `https://esm.sh/@zip.js/zip.js@2.7.60` | esm.sh serves a module graph of dozens of sub-modules relative to its own origin; the entry shim is vendored in `03-external-libraries/zip.js/` | zip read/write for adventure bundle import/export |
| `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3` | multi-MB browser build plus WASM + model weights fetched on demand | background removal for generated scene images (text-to-image-plugin) |
| `https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm` | vendored copy included (`idb-keyval/idb-keyval-6.esm.js`) | IndexedDB helper behind kv-plugin |
| `https://cdn.jsdelivr.net/npm/ua-parser-js@2.0.0-rc.1/dist/ua-parser.min.js` | Perchance-hosted immutable mirror included (`ua-parser-js/`) | browser/device detection in bug reports |
| `https://fonts.googleapis.com/css2?family=<name>&display=swap` | stylesheets generated per font family chosen in story theme settings | story font loading |

## Licence notes

* cbor-x 1.6.0 - MIT (upstream: https://github.com/kriszyp/cbor-x)
* ua-parser-js 2.0.0-rc.1 - dual MIT/AGPL-3.0 (upstream: https://github.com/faisalman/ua-parser-js)
* idb-keyval 6 - MIT (upstream: https://github.com/jakearchibald/idb-keyval)
* zip.js 2.7.60 - BSD-3-Clause (upstream: https://github.com/gildas-lormeau/zip.js)
* @huggingface/transformers 3.3.3 - Apache-2.0 (upstream: https://github.com/huggingface/transformers.js)

Vendored files are unmodified copies; consult each upstream project for the authoritative licence text and notices.

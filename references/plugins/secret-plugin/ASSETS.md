# secret-plugin — complete asset inventory

Generator: **perchance.org/secret-plugin** — `$output = [getObj()]` → `{ generateKeyPair, encrypt, decrypt }`
Inventory generated: 2026-09-16T17:25:15.653Z

Totals: **356 files, 66.10 MiB** uncompressed.
Full 64-character SHA-256 digests for every file are in `manifest.json`; the tables below show the first 16 hex chars.

| Category | Folder in this package | Files | Size |
| --- | --- | --- | --- |
| `external-cdn-bundles` | `external/esm-sh-bundles/` | 11 | 149.8 KiB |
| `external-upstream-sources` | `external/upstream-sources/` | 322 | 65.56 MiB |
| `external-vendored` | `external/vendored-in-main-pjs/` | 5 | 64.7 KiB |
| `internal-code` | `internal/` | 6 | 221.5 KiB |
| `project-resources` | `references/` | 12 | 122.4 KiB |

> **There are no other assets.** This project ships no runtime images, audio, models, shaders, animations,
> fonts, prefabs or JSON data — it is pure JavaScript plus one documentation HTML page. The only binary file
> anywhere in this package is `fflate-0.8.2/demo/favicon.ico`, which comes from the upstream fflate repo and
> is **not** used by this project.

---

## 1. Internal code (this project's own source)

### 1.1 `internal/main.pjs` — the generator's perchance-js source (71.3 KiB)

893 lines in one file:

| main.pjs lines | What lives there |
| --- | --- |
| 1 | `$output = [getObj()]` — the generator's export (the plugin object) |
| 3–8 | Design notes + the `getObj() =>` pjs function header |
| 9 | `if(!window["public-key-encryption-plugin-obj-8593757"])` — singleton guard |
| 11–673 | *Third-party*: `MlKem768_Module()` — ML-KEM-768, containing a nested `sha3_Module()` |
| 676–681 | *Third-party*: `hkdf_Module()` — HKDF |
| 683–688 | *Third-party*: `sha256_Module()` — SHA-256 |
| 690–695 | *Third-party*: `gcm_Module()` — AES-GCM |
| 699–705 | *Third-party*: `fflate_Module()` — gzip/gunzip |
| 708–889 | *This project's code*: lazy init, synchronous crypto helpers, base64 variant, public API |
| 891 | `window["public-key-encryption-plugin-obj-8593757"] = {generateKeyPair, encrypt, decrypt}` |

### 1.2 `internal/secret-plugin-core.js`

main.pjs **lines 708–889** extracted and de-indented — only the plugin-authored code, with every vendored
`*_Module()` factory stripped out: `initIfNeeded`, `bytesAreSame`, `deriveKeySync`, `deriveKey` (unused async
twin), `aesGcmEncryptSync`, `aesGcmDecryptSync`, `compressBytesWithGzipSync`, `compressBytesWithGzip` (unused),
`decompressBytesWithGzipSync`, `decompressBytesWithGzip` (unused), `bytesToBase64`, `base64ToBytes`,
`generateKeyPair`, `encrypt`, `decrypt`.

### 1.3 `internal/index.html` — the public documentation page (20.1 KiB)

The `<body>` contents of the live generator: the illustrated "magical keys" explainer, copy-pasteable usage
snippets, the notes list, the in-page self-test `<script>` (encrypts + decrypts a ~30 kB string three times and
logs keygen/encrypt/decrypt timings to the console), and the light/dark-mode CSS.

### 1.4 `internal/standalone/secret-plugin.mjs` — the same crypto, runnable outside Perchance

main.pjs lines 11–889, de-indented and unwrapped from the pjs `getObj() =>` list syntax, exported as an
ordinary ES module:

```js
import secretPlugin from "./secret-plugin.mjs";
const keys = secretPlugin.generateKeyPair();
const enc  = secretPlugin.encrypt("Hello!", keys.public);
const dec  = secretPlugin.decrypt(enc, keys.private);   // "Hello!"
// named exports { generateKeyPair, encrypt, decrypt } are also available
```

Verified: a round-trip on a 1,450-character plaintext returns the original string exactly, and decrypting
with a non-matching private key throws. `internal/standalone/demo.html` is a browser demo — open it **from this
folder** (it imports `./secret-plugin.mjs`, so `file://` origins will be blocked by CORS; serve the folder or
use the perchance page).

### 1.5 `internal/workspace/AGENTS.md`

The agent-harness / workspace instruction file that was used to build this generator (platform + plugin
reference). Not part of the shipped generator — included for workspace completeness.

---

## 2. External code (third-party)

### 2.1 `external/vendored-in-main-pjs/` — the code that literally lives inside main.pjs

Byte-for-byte the embedded module text, lifted out of main.pjs (with a short provenance header prepended).
These five factories are what actually executes:

| File | main.pjs lines | Upstream | License |
| --- | --- | --- | --- |
| `MlKem768_Module.js` | 11–673 | crystals-kyber-js 2.3.0 (ML-KEM-768 / FIPS 203) + nested @noble/hashes sha3 | MIT |
| `hkdf_Module.js` | 676–681 | @noble/hashes 1.5.0 `/hkdf` (esm.sh `v135` es2022 bundle) | MIT |
| `sha256_Module.js` | 683–688 | @noble/hashes 1.5.0 `/sha256` | MIT |
| `gcm_Module.js` | 690–695 | @noble/ciphers 1.0.0 `/aes` | MIT |
| `fflate_Module.js` | 699–705 | fflate 0.8.2, tree-shaken to `gzipSync`/`gunzipSync` | MIT |

Differences from upstream: the ML-KEM module has the upstream async `setup()`/`loadCrypto()` removed (that
exists only for Node.js `node:crypto` support), and each module is wrapped in a plain `function X_Module(){}`
factory instead of being an ES module.

### 2.2 `external/esm-sh-bundles/` — the CDN bundle files they were copied from

| File | Source URL |
| --- | --- |
| `sha3.bundle.mjs` | https://esm.sh/v135/@noble/hashes@1.5.0/es2022/sha3.bundle.mjs |
| `hkdf.bundle.mjs` | https://esm.sh/v135/@noble/hashes@1.5.0/es2022/hkdf.bundle.mjs |
| `sha256.bundle.mjs` | https://esm.sh/v135/@noble/hashes@1.5.0/es2022/sha256.bundle.mjs |
| `aes.bundle.mjs` | https://esm.sh/v135/@noble/ciphers@1.0.0/es2022/aes.bundle.mjs |
| `fflate.bundle.mjs` | https://esm.sh/v135/fflate@0.8.2/es2022/fflate.bundle.mjs |
| `sha3.bundle.js`, `hkdf.bundle.js`, `sha256.bundle.js`, `aes.bundle.js` | the tiny esm.sh re-export stubs for the five `.mjs` bundles |
| `pako-2.1.0.bundle.js` | https://user-uploads.perchance.org/file/c0fe46e365351bc8eacadc5f761dc28a.txt (cited in a main.pjs comment; pako was replaced with fflate because it is smaller) |

### 2.3 `external/upstream-sources/` — full, unmodified upstream repositories

Complete tagged-release source trees (downloaded exactly as listed in `build/BUILD.md`): TypeScript source,
tests, KAT/Wycheproof vectors, docs, CI config and licenses. None of this executes at runtime — it is here so
every dependency is fully auditable and rebuildable.

| Repo | Version | Files | Size | Release archive |
| --- | --- | --- | --- | --- |
| `crystals-kyber-js-2.3.0/` | 2.3.0 | 68 | 41.53 MiB | https://github.com/dajiaji/crystals-kyber-js/archive/refs/tags/2.3.0.zip |
| `noble-hashes-1.5.0/` | 1.5.0 | 85 | 20.74 MiB | https://github.com/paulmillr/noble-hashes/archive/refs/tags/1.5.0.zip |
| `noble-ciphers-1.0.0/` | 1.0.0 | 68 | 2.80 MiB | https://github.com/paulmillr/noble-ciphers/archive/refs/tags/1.0.0.zip |
| `fflate-0.8.2/` | 0.8.2 | 101 | 505.9 KiB | https://github.com/101arrowz/fflate/archive/refs/tags/v0.8.2.zip |

Licenses (full text in each repo's `LICENSE`):
- **crystals-kyber-js 2.3.0** — MIT License /  / Copyright (c) 2023 Ajitomi Daisuke
- **@noble/hashes 1.5.0** — The MIT License (MIT) /  / Copyright (c) 2022 Paul Miller (https://paulmillr.com)
- **@noble/ciphers 1.0.0** — The MIT License (MIT) /  / Copyright (c) 2022 Paul Miller (https://paulmillr.com)
- **fflate 0.8.2** — MIT License /  / Copyright (c) 2023 Arjun Barrett

### 2.4 External resources referenced by the project

| Resource | Home | Direct download / link | License |
| --- | --- | --- | --- |
| ML-KEM reference implementation — used for keygen / encap / decap | https://github.com/dajiaji/crystals-kyber-js/tree/2.3.0 | https://github.com/dajiaji/crystals-kyber-js/archive/refs/tags/2.3.0.zip | MIT |
| @noble/hashes 1.5.0 — sha3, sha256, hkdf | https://github.com/paulmillr/noble-hashes | https://esm.sh/v135/@noble/hashes@1.5.0/es2022/sha3.bundle.mjs | MIT |
| @noble/ciphers 1.0.0 — AES-GCM | https://github.com/paulmillr/noble-ciphers | https://esm.sh/v135/@noble/ciphers@1.0.0/es2022/aes.bundle.mjs | MIT |
| fflate 0.8.2 — gzip/gunzip | https://github.com/101arrowz/fflate | https://www.npmjs.com/package/fflate/v/0.8.2 | MIT |
| pako 2.1.0 — only referenced in a comment (replaced by fflate) | https://github.com/nodeca/pako | https://user-uploads.perchance.org/file/c0fe46e365351bc8eacadc5f761dc28a.txt | MIT / Zlib |
| FIPS 203 — ML-KEM standard | https://csrc.nist.gov/pubs/fips/203/final | — | public domain |
| Public-key cryptography — background reading | https://en.wikipedia.org/wiki/Public-key_cryptography | — | CC BY-SA |
| Perchance plugin directory | https://perchance.org/plugins | — | platform |

---

## 3. Project resources — linked example generators

`references/linked-generators/` holds the complete source (`main.pjs` + `index.html`) of every Perchance
generator the documentation page links to:

| Generator | `main.pjs` | `index.html` |
| --- | --- | --- |
| `send-me-a-secret-message` | 10.9 KiB | 7.1 KiB |
| `secret-plugin-example` | 31 B | 1.4 KiB |
| `public-key-encryption-tool` | 594 B | 11.6 KiB |
| `bug-report-plugin-encryption-example` | 1.7 KiB | 3.8 KiB |
| `bug-report-plugin-encryption-simpler-example` | 2.9 KiB | 587 B |
| `comments-plugin` | 37.4 KiB | 44.5 KiB |

The generator's own public pages: https://perchance.org/secret-plugin ·
https://perchance.org/public-key-encryption-tool · https://perchance.org/send-me-a-secret-message

---

## 4. Build / config files

| File | What it is |
| --- | --- |
| `build/BUILD.md` | Vendoring + packaging recipe: how each bundle got into main.pjs, how this package was assembled, and how to reproduce either |
| `internal/workspace/AGENTS.md` | Agent-harness workspace instructions used while building this generator |
| `external/upstream-sources/*/package.json`, `tsconfig*.json`, `deno.json`, `.github/workflows/*` | Each dependency's own build/publish configuration, as shipped upstream |

There is **no compile step for this generator**: Perchance evaluates `main.pjs` directly, and the third-party
libraries are committed as pre-bundled ES2022 text. `main.pjs` is simultaneously the source and the build output.

---

## 5. Full file listing (every file in the package, with size and checksum)

### 5.1 internal-code
| File | Size | SHA-256 (first 16) |
| --- | --- | --- |
| `internal/index.html` | 20.1 KiB | `de23c58272c1f9b0…` |
| `internal/main.pjs` | 71.3 KiB | `305699d5df697b00…` |
| `internal/secret-plugin-core.js` | 9.3 KiB | `c97da3009926f753…` |
| `internal/standalone/demo.html` | 1.9 KiB | `0235cef032544c53…` |
| `internal/standalone/secret-plugin.mjs` | 68.7 KiB | `347b60bbcdb17827…` |
| `internal/workspace/AGENTS.md` | 50.1 KiB | `ed93ec9691766453…` |

### 5.2 external-vendored
| File | Size | SHA-256 (first 16) |
| --- | --- | --- |
| `external/vendored-in-main-pjs/MlKem768_Module.js` | 28.7 KiB | `04dec6a5a0d83be8…` |
| `external/vendored-in-main-pjs/fflate_Module.js` | 9.8 KiB | `b3c52968d01d265f…` |
| `external/vendored-in-main-pjs/gcm_Module.js` | 17.0 KiB | `7c8d48f6a2f5b881…` |
| `external/vendored-in-main-pjs/hkdf_Module.js` | 3.7 KiB | `23b0e068b348fd64…` |
| `external/vendored-in-main-pjs/sha256_Module.js` | 5.5 KiB | `79e476ddbf11ea9c…` |

### 5.3 external-cdn-bundles
| File | Size | SHA-256 (first 16) |
| --- | --- | --- |
| `external/esm-sh-bundles/aes.bundle.js` | 264 B | `1e0f85a9ccd1d898…` |
| `external/esm-sh-bundles/aes.bundle.mjs` | 12.1 KiB | `8d2c5eeb4007e902…` |
| `external/esm-sh-bundles/fflate.bundle.mjs` | 31.2 KiB | `b3d1c0429436d243…` |
| `external/esm-sh-bundles/hkdf.bundle.js` | 108 B | `5d8e060e3957148e…` |
| `external/esm-sh-bundles/hkdf.bundle.mjs` | 3.1 KiB | `22c545786d73d0aa…` |
| `external/esm-sh-bundles/pako-2.1.0.bundle.js` | 46.3 KiB | `0d478229cc0db82c…` |
| `external/esm-sh-bundles/pako-2.1.0.bundle.txt` | 46.3 KiB | `0d478229cc0db82c…` |
| `external/esm-sh-bundles/sha256.bundle.js` | 112 B | `b63d10dd2d627c8b…` |
| `external/esm-sh-bundles/sha256.bundle.mjs` | 4.9 KiB | `eb95a426177f0f8c…` |
| `external/esm-sh-bundles/sha3.bundle.js` | 257 B | `69e70555299af6aa…` |
| `external/esm-sh-bundles/sha3.bundle.mjs` | 5.1 KiB | `fe36d574b2b60922…` |

### 5.4 external-upstream-sources
| File | Size | SHA-256 (first 16) |
| --- | --- | --- |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/dependabot.yml` | 240 B | `f7b2088ec115777f…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/workflows/cd.yml` | 713 B | `3aa0961129d8f643…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/workflows/ci_browsers.yml` | 1.5 KiB | `797f1a550259b85f…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/workflows/ci_bun.yml` | 924 B | `965e4d307aceb6ab…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/workflows/ci_cloudflare.yml` | 497 B | `128a22c8c93b0618…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/workflows/ci_deno.yml` | 894 B | `62c60aaddd9a0735…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/workflows/ci_node.yml` | 622 B | `9cef6385f973b97a…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.github/workflows/codeql-analysis.yml` | 2.7 KiB | `76b0c63aa7e2d098…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/.gitignore` | 2.0 KiB | `1190885060e3a6d4…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/CHANGES.md` | 5.7 KiB | `f80ab0a439e864cc…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/LICENSE` | 1.0 KiB | `ab49bdfb96b9c011…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/README.md` | 9.1 KiB | `aa2db0eb1f151c72…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/SECURITY.md` | 395 B | `3039157d4fb8b70a…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/bench/ecdh.bench.ts` | 435 B | `e5f3a31ee727767e…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/bench/mlKem1024.bench.ts` | 1.7 KiB | `5b2735117689fc08…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/bench/mlKem512.bench.ts` | 1.7 KiB | `ab91e53c2cfabfd9…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/bench/mlKem768.bench.ts` | 1.7 KiB | `ed0c5336d94c7a67…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/deno.json` | 2.5 KiB | `a1d4f28e76fff696…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/deno.lock` | 5.6 KiB | `b68d7294994bd3ee…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/dnt.ts` | 1.9 KiB | `8633b7055fc562fd…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/import_map.json` | 222 B | `087da466b46e2112…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/mod.ts` | 186 B | `b9f81bd40772aac5…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/consts.ts` | 1.9 KiB | `17b7b0cbdd77859a…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/deps.ts` | 77 B | `748e588de4c3e3b8…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/errors.ts` | 367 B | `173d303103167e27…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/mlKem1024.ts` | 6.5 KiB | `99c0313ec441f473…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/mlKem512.ts` | 2.7 KiB | `4e93d7ded0b0f8b8…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/mlKem768.ts` | 1.4 KiB | `fa5c3f86aef459ad…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/mlKemBase.ts` | 35.2 KiB | `c93e67c8e854710f…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/src/utils.ts` | 3.0 KiB | `7ec5e6ce415af978…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/drng.ts` | 954 B | `1706dc8bb0f9bff5…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/mlkem.test.ts` | 6.9 KiB | `8c2f09425562b0c7…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/browsers/mlkem.spec.ts` | 348 B | `ec8dbdaf340db34e…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/browsers/package.json` | 65 B | `67204e2aa382ec7b…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/browsers/pages/index.html` | 2.4 KiB | `e3f1248e9b22085a…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/browsers/pages/src/.gitkeep` | 0 B | `e3b0c44298fc1c14…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/browsers/playwright.config.ts` | 459 B | `ccb7646e8b6b7bab…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/bun/mlkem.spec.ts` | 726 B | `9ab0b86a42494496…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/bun/src/index.js` | 149 B | `23849991a3261b6d…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/mlkem.spec.ts` | 849 B | `e50a3e08b622a807…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/package-lock.json` | 110.6 KiB | `e39f0046c401db89…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/package.json` | 501 B | `f46108a607e7269f…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/src/index.ts` | 193 B | `23ebdc1cf1e2b6c5…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/src/server.ts` | 3.2 KiB | `62da2428c03372e0…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/tsconfig.json` | 10.4 KiB | `ddd77decd258f5af…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/vitest.config.mts` | 240 B | `17c35a6e6384c30e…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/cloudflare/wrangler.toml` | 4.8 KiB | `f5d07e1359797c3b…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/runtimes/server.js` | 3.2 KiB | `b5ecefc4341bd038…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/utils.ts` | 1.2 KiB | `3d12e1cdb4d86850…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/intermediate/ML-KEM-1024.txt` | 91.3 KiB | `af15ceb9c7129a15…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/intermediate/ML-KEM-512.txt` | 47.4 KiB | `3cb7a5c2421d4ada…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/intermediate/ML-KEM-768.txt` | 67.4 KiB | `4cdeed48a917ec28…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/kat/README.md` | 3.4 KiB | `70291efb31d0a3a2…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/kat/kat_MLKEM_1024.rsp` | 15.48 MiB | `ed23c551c5376164…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/kat/kat_MLKEM_512.rsp` | 8.04 MiB | `783106e35afb1ab9…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/kat/kat_MLKEM_768.rsp` | 11.46 MiB | `6ecab47c229a80b8…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/modulus/ML-KEM-1024.txt` | 3.11 MiB | `9c27ef8951a6b6b5…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/modulus/ML-KEM-512.txt` | 1.18 MiB | `cc1597aa8fb37f38…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/modulus/ML-KEM-768.txt` | 1.76 MiB | `1070efdae5c268a5…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/modulus/README.md` | 538 B | `effb2d3f03013e16…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/strcmp/ML-KEM-1024.txt` | 9.3 KiB | `5059fcb4d5912c37…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/strcmp/ML-KEM-512.txt` | 4.8 KiB | `4bc308bf9a7ac41c…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/strcmp/ML-KEM-768.txt` | 6.9 KiB | `2b09aa46d8b1c7b9…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/unluckysample/ML-KEM-1024.txt` | 12.6 KiB | `8da6cdb2fb0d4e22…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/unluckysample/ML-KEM-512.txt` | 6.5 KiB | `9d4e0ae011978a8f…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/unluckysample/ML-KEM-768.txt` | 9.4 KiB | `fede6f787581dc70…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/test/vectors/unluckysample/README.md` | 867 B | `edc3e8dabc3e2167…` |
| `external/upstream-sources/crystals-kyber-js-2.3.0/tsconfig.json` | 277 B | `b45d7eb6c54b9463…` |
| `external/upstream-sources/fflate-0.8.2/.browserslistrc` | 5 B | `2b18032369e7a046…` |
| `external/upstream-sources/fflate-0.8.2/.github/ISSUE_TEMPLATE/bug.md` | 653 B | `fae446c4c119b689…` |
| `external/upstream-sources/fflate-0.8.2/.github/ISSUE_TEMPLATE/config.yml` | 324 B | `3c6cf379b86025e7…` |
| `external/upstream-sources/fflate-0.8.2/.github/ISSUE_TEMPLATE/feature_request.md` | 942 B | `6490883ef586ef5b…` |
| `external/upstream-sources/fflate-0.8.2/.gitignore` | 147 B | `dfcc43a0c615cf52…` |
| `external/upstream-sources/fflate-0.8.2/.npmignore` | 73 B | `077a91c435b9c1ad…` |
| `external/upstream-sources/fflate-0.8.2/.terserrc` | 43 B | `4834b142db82dc87…` |
| `external/upstream-sources/fflate-0.8.2/CHANGELOG.md` | 4.0 KiB | `a61f0369d564fa7e…` |
| `external/upstream-sources/fflate-0.8.2/LICENSE` | 1.0 KiB | `805f6cb28bb8b6d3…` |
| `external/upstream-sources/fflate-0.8.2/README.md` | 26.7 KiB | `7697e0b31b94feb5…` |
| `external/upstream-sources/fflate-0.8.2/demo/App.tsx` | 3.9 KiB | `2df3826c106fff7d…` |
| `external/upstream-sources/fflate-0.8.2/demo/augment.d.ts` | 518 B | `1308d29d136dc195…` |
| `external/upstream-sources/fflate-0.8.2/demo/components/code-box/index.tsx` | 17.9 KiB | `ac3e49c7c43d5f28…` |
| `external/upstream-sources/fflate-0.8.2/demo/components/code-box/prism.css` | 1.8 KiB | `95a2ef2b73e23cdb…` |
| `external/upstream-sources/fflate-0.8.2/demo/components/code-box/prism.js` | 17.6 KiB | `9eacf2fa69b15c0b…` |
| `external/upstream-sources/fflate-0.8.2/demo/components/code-box/sandbox.ts` | 4.4 KiB | `0825d34adf031657…` |
| `external/upstream-sources/fflate-0.8.2/demo/components/code-box/stream-adapter.ts` | 1.5 KiB | `72b4daf7177b4834…` |
| `external/upstream-sources/fflate-0.8.2/demo/components/file-picker/index.tsx` | 6.3 KiB | `771bf34cce3aeac9…` |
| `external/upstream-sources/fflate-0.8.2/demo/favicon.ico` | 5.3 KiB | `d65e0b843a92bd61…` |
| `external/upstream-sources/fflate-0.8.2/demo/index.css` | 159 B | `524ba964f692e79b…` |
| `external/upstream-sources/fflate-0.8.2/demo/index.html` | 1.1 KiB | `1a5c0f3fb8e16e02…` |
| `external/upstream-sources/fflate-0.8.2/demo/index.tsx` | 342 B | `355518facbb76d5b…` |
| `external/upstream-sources/fflate-0.8.2/demo/package.json` | 27 B | `9edc73b3fbdb8066…` |
| `external/upstream-sources/fflate-0.8.2/demo/sw.ts` | 972 B | `c96af6bc7df8ff13…` |
| `external/upstream-sources/fflate-0.8.2/demo/util/workers.ts` | 4.7 KiB | `9072bebe94c236c2…` |
| `external/upstream-sources/fflate-0.8.2/docs/README.md` | 24.2 KiB | `a69053cc55349a00…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncDecompress.md` | 1.8 KiB | `c8004a32eb682c2b…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncDeflate.md` | 2.2 KiB | `6e9f7cd2301364b6…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncGunzip.md` | 2.2 KiB | `7b2e0ac4376601c0…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncGzip.md` | 2.1 KiB | `f4f51d1a2f6f8fea…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncInflate.md` | 2.0 KiB | `2008c726cbf81246…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncUnzipInflate.md` | 1.8 KiB | `4916146c620c2567…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncUnzlib.md` | 2.0 KiB | `c5f66ba6c3252c79…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncZipDeflate.md` | 7.0 KiB | `78b9cc10faf078ff…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/AsyncZlib.md` | 2.1 KiB | `99b99a3c2a97dabf…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/DecodeUTF8.md` | 987 B | `4ddb522dad2a663c…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Decompress.md` | 1.3 KiB | `6559697f58e15a44…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Deflate.md` | 1.5 KiB | `54206a9bcc9a2a07…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/EncodeUTF8.md` | 976 B | `b764807d386c8ee1…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Gunzip.md` | 1.5 KiB | `def0cf391ef5e260…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Gzip.md` | 1.4 KiB | `8920c1093cc7993e…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Inflate.md` | 1.3 KiB | `dd1aa9d9a2723798…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Unzip.md` | 1.4 KiB | `a7e31d17bfd0a55b…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/UnzipInflate.md` | 1.3 KiB | `ab1b44258968f80f…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/UnzipPassThrough.md` | 1.2 KiB | `061034a68ac14b16…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Unzlib.md` | 1.3 KiB | `be86d7f73a10b86f…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Zip.md` | 1.4 KiB | `c18a4dd513d5a2e8…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/ZipDeflate.md` | 6.5 KiB | `4a65b68ac96b1c89…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/ZipPassThrough.md` | 6.0 KiB | `0e826d0a0e644c84…` |
| `external/upstream-sources/fflate-0.8.2/docs/classes/Zlib.md` | 1.4 KiB | `d7bc1a5d2b9765c6…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncDeflateOptions.md` | 2.9 KiB | `05ee1090b62b6f51…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncGunzipOptions.md` | 1.0 KiB | `a37a014addd9b094…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncGzipOptions.md` | 3.5 KiB | `29f9f1202cbb72ae…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncInflateOptions.md` | 1.3 KiB | `b8e1387b6583b91f…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncTerminable.md` | 244 B | `cdacc89bdf2823d8…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncUnzipOptions.md` | 504 B | `eb2acaeb72e7da4b…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncUnzlibOptions.md` | 1.4 KiB | `e2b7f6037210e575…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncZipOptions.md` | 5.3 KiB | `eb96435b3179dced…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncZippable.md` | 190 B | `d569bade0baf144d…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/AsyncZlibOptions.md` | 2.8 KiB | `743c393f80684a09…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/DeflateOptions.md` | 2.3 KiB | `b7735fcda22313ed…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/FlateError.md` | 601 B | `95223863f1f4aab9…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/GunzipOptions.md` | 1003 B | `a9daa04f97196d82…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/GunzipStreamOptions.md` | 703 B | `9659cc24aee4c307…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/GzipOptions.md` | 3.0 KiB | `f892107bff58b864…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/InflateOptions.md` | 1.0 KiB | `0920cb18e66f9634…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/InflateStreamOptions.md` | 839 B | `b2d677786803f9fb…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/UnzipDecoder.md` | 1.1 KiB | `a97ae06a5e95032f…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/UnzipDecoderConstructor.md` | 889 B | `63df176d9596d824…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/UnzipFile.md` | 1.6 KiB | `1e0541b42a9b4c71…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/UnzipFileInfo.md` | 838 B | `754eb3dfa25cb8d6…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/UnzipOptions.md` | 397 B | `5bb6063302362cf7…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/Unzipped.md` | 167 B | `ddab5df138c05f54…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/UnzlibOptions.md` | 1.0 KiB | `340ef2ce13c774ea…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/UnzlibStreamOptions.md` | 703 B | `7ad8468d043387f1…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/ZipAttributes.md` | 2.2 KiB | `ae4d1062bac3aeb4…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/ZipInputFile.md` | 5.2 KiB | `1da2353459a46509…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/ZipOptions.md` | 4.8 KiB | `3a5abb9a2bd3c55f…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/Zippable.md` | 159 B | `c732fcc2a532cf54…` |
| `external/upstream-sources/fflate-0.8.2/docs/interfaces/ZlibOptions.md` | 2.5 KiB | `3d266421742c270b…` |
| `external/upstream-sources/fflate-0.8.2/package-lock.json` | 144.3 KiB | `99b9fc2712e442da…` |
| `external/upstream-sources/fflate-0.8.2/package.json` | 3.4 KiB | `1f39729fc15f568a…` |
| `external/upstream-sources/fflate-0.8.2/scripts/buildUMD.ts` | 1.4 KiB | `af29f49b2fe146c4…` |
| `external/upstream-sources/fflate-0.8.2/scripts/cpGHPages.ts` | 737 B | `f7d993cba42428c6…` |
| `external/upstream-sources/fflate-0.8.2/scripts/rewriteBuilds.ts` | 2.8 KiB | `354d8150be2ff0b0…` |
| `external/upstream-sources/fflate-0.8.2/src/index.ts` | 113.8 KiB | `5c53303c081ce37d…` |
| `external/upstream-sources/fflate-0.8.2/src/node-worker.ts` | 1.2 KiB | `f025621a72fed25d…` |
| `external/upstream-sources/fflate-0.8.2/src/worker.ts` | 635 B | `6046799f3838e2c6…` |
| `external/upstream-sources/fflate-0.8.2/test/0-valid.ts` | 827 B | `536aff541d357a24…` |
| `external/upstream-sources/fflate-0.8.2/test/1-size.ts` | 925 B | `75685cd5d0dd8c58…` |
| `external/upstream-sources/fflate-0.8.2/test/2-perf.ts` | 1.3 KiB | `c3db332b3be034fd…` |
| `external/upstream-sources/fflate-0.8.2/test/3-zip.ts` | 17 B | `da72dd48187c0722…` |
| `external/upstream-sources/fflate-0.8.2/test/4-streams.ts` | 41 B | `4b377969a2408bbc…` |
| `external/upstream-sources/fflate-0.8.2/test/5-async.ts` | 62 B | `263ef0f7a6a36835…` |
| `external/upstream-sources/fflate-0.8.2/test/data/.gitignore` | 13 B | `5c89a8a9c5af258d…` |
| `external/upstream-sources/fflate-0.8.2/test/results/.gitignore` | 13 B | `5c89a8a9c5af258d…` |
| `external/upstream-sources/fflate-0.8.2/test/tsconfig.json` | 145 B | `4259adfdcd7643e8…` |
| `external/upstream-sources/fflate-0.8.2/test/util.ts` | 6.3 KiB | `baede3a51eb8bb9c…` |
| `external/upstream-sources/fflate-0.8.2/tsconfig.demo.json` | 292 B | `3b0744292f108348…` |
| `external/upstream-sources/fflate-0.8.2/tsconfig.esm.json` | 132 B | `b2d8b240045eda4b…` |
| `external/upstream-sources/fflate-0.8.2/tsconfig.json` | 135 B | `98f9a6bee0735f1d…` |
| `external/upstream-sources/noble-ciphers-1.0.0/.github/funding.yml` | 18 B | `b0f88b6249202c09…` |
| `external/upstream-sources/noble-ciphers-1.0.0/.github/workflows/nodejs.yml` | 653 B | `921f09fcbe0de069…` |
| `external/upstream-sources/noble-ciphers-1.0.0/.github/workflows/publish-npm.yml` | 655 B | `f501c56d2ea8d1fb…` |
| `external/upstream-sources/noble-ciphers-1.0.0/.github/workflows/upload-release.yml` | 793 B | `bb4cf9825895b61c…` |
| `external/upstream-sources/noble-ciphers-1.0.0/.gitignore` | 68 B | `3761c5c001bc79cc…` |
| `external/upstream-sources/noble-ciphers-1.0.0/.prettierrc.json` | 73 B | `0b0ec1c6246acfd4…` |
| `external/upstream-sources/noble-ciphers-1.0.0/.vscode/settings.json` | 163 B | `056aeef01177c8a5…` |
| `external/upstream-sources/noble-ciphers-1.0.0/LICENSE` | 1.1 KiB | `f36671a5487c9c50…` |
| `external/upstream-sources/noble-ciphers-1.0.0/README.md` | 23.9 KiB | `2dfc1aa84520486c…` |
| `external/upstream-sources/noble-ciphers-1.0.0/SECURITY.md` | 730 B | `1f98632b511ccd14…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/README.md` | 323 B | `2bbed830bff57e9b…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/_utils.js` | 4.1 KiB | `b6aeca8933877f84…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/aead.js` | 4.8 KiB | `7da5f901164a3d8a…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/aes.js` | 13.2 KiB | `3de003ddfe6ca5fa…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/ciphers.js` | 3.1 KiB | `c189a52d877be50c…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/cross_test.test.js` | 710 B | `38345dbf797489b5…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/package-lock.json` | 15.5 KiB | `70e31ba39c84edec…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/package.json` | 871 B | `00d6acac1c45278b…` |
| `external/upstream-sources/noble-ciphers-1.0.0/benchmark/poly.js` | 1.8 KiB | `7aa0441120cc586e…` |
| `external/upstream-sources/noble-ciphers-1.0.0/build/README.md` | 223 B | `1f868aec00cf2ca9…` |
| `external/upstream-sources/noble-ciphers-1.0.0/build/input.js` | 448 B | `64109e333db5bdf2…` |
| `external/upstream-sources/noble-ciphers-1.0.0/build/package-lock.json` | 12.6 KiB | `79d07c9a31d6087e…` |
| `external/upstream-sources/noble-ciphers-1.0.0/build/package.json` | 324 B | `14bded1b4fd327a4…` |
| `external/upstream-sources/noble-ciphers-1.0.0/esm/package.json` | 147 B | `bd389eb8cfe61883…` |
| `external/upstream-sources/noble-ciphers-1.0.0/package-lock.json` | 3.8 KiB | `5d586f03449c5845…` |
| `external/upstream-sources/noble-ciphers-1.0.0/package.json` | 3.1 KiB | `d90f78f24497ad67…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/_arx.ts` | 6.9 KiB | `765bfcf019e44af9…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/_assert.ts` | 1.6 KiB | `c47658a367e780b6…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/_micro.ts` | 9.5 KiB | `2f8623b5b0402779…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/_poly1305.ts` | 8.5 KiB | `70ad60d5a2438c9b…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/_polyval.ts` | 7.5 KiB | `adaa0f6f4e3c6d5e…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/aes.ts` | 36.0 KiB | `d3d8cdabc50471c9…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/chacha.ts` | 10.4 KiB | `0ffd09f1071a7df2…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/crypto.ts` | 287 B | `d5ac3ef40dae277d…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/cryptoNode.ts` | 402 B | `55fa6dfbd66aec70…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/ff1.ts` | 5.6 KiB | `2a016255b3f087d6…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/index.ts` | 80 B | `b1639d20ef5ff1ab…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/package.json` | 23 B | `3ca9d4afd2142508…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/salsa.ts` | 8.0 KiB | `0ea7615f288335c1…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/utils.ts` | 8.9 KiB | `8855e764e2e774b4…` |
| `external/upstream-sources/noble-ciphers-1.0.0/src/webcrypto.ts` | 5.0 KiB | `4a56e233fd530b99…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/README.md` | 214 B | `050c02d51f789e50…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/aes.test.js` | 9.6 KiB | `464940ee1413728d…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/arx.test.js` | 12.6 KiB | `759d7fd013af0986…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/basic.test.js` | 5.1 KiB | `b4a0c39e7195f579…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/ff1.test.js` | 3.7 KiB | `112f6ec403258401…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/index.js` | 252 B | `e41bf4edd6ced8da…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/polyval.test.js` | 2.4 KiB | `81c398af37f4b896…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/utils.js` | 3.4 KiB | `cd007d9e7977ca0a…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/utils.test.js` | 661 B | `a5072df446b85a78…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/ff1.json` | 569.5 KiB | `62bdff875a8dc3f3…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/nist_800_38a.json` | 20.0 KiB | `e169d1750dda18ac…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/siv.json` | 42.0 KiB | `86d431ba074cb3e9…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/stablelib_chacha20.json` | 1.5 KiB | `8dc3b66cb5b20d32…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/stablelib_chacha20poly1305.json` | 25.2 KiB | `5b9752192bb80df2…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/stablelib_poly1305.json` | 16.7 KiB | `d4d434d82ed36b4a…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/stablelib_salsa20.json` | 1.0 KiB | `dbc921cbfbf59d3e…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/stablelib_xchacha20poly1305.json` | 677 B | `de5616655315c11c…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/vectors/tweetnacl_secretbox.json` | 887.0 KiB | `13b2163c5bbe8fa5…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/wycheproof/aes_cbc_pkcs5_test.json` | 96.4 KiB | `f496e602b3b71e9e…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/wycheproof/aes_gcm_siv_test.json` | 129.7 KiB | `9b983f263e769493…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/wycheproof/aes_gcm_test.json` | 207.5 KiB | `f7d77a3a059f30c8…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/wycheproof/aes_kwp_test.json` | 98.3 KiB | `eece0f19f3f1cf18…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/wycheproof/aes_wrap_test.json` | 67.1 KiB | `babf1b1971fa9af7…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/wycheproof/chacha20_poly1305_test.json` | 237.9 KiB | `3975ada79f4b2b6f…` |
| `external/upstream-sources/noble-ciphers-1.0.0/test/wycheproof/xchacha20_poly1305_test.json` | 229.2 KiB | `e64f20d42c194280…` |
| `external/upstream-sources/noble-ciphers-1.0.0/tsconfig.esm.json` | 277 B | `a7d704b0d8313317…` |
| `external/upstream-sources/noble-ciphers-1.0.0/tsconfig.json` | 275 B | `1e70cf0f2e394e24…` |
| `external/upstream-sources/noble-hashes-1.5.0/.github/funding.yml` | 18 B | `b0f88b6249202c09…` |
| `external/upstream-sources/noble-hashes-1.5.0/.github/workflows/nodejs.yml` | 653 B | `921f09fcbe0de069…` |
| `external/upstream-sources/noble-hashes-1.5.0/.github/workflows/publish-npm.yml` | 655 B | `f501c56d2ea8d1fb…` |
| `external/upstream-sources/noble-hashes-1.5.0/.github/workflows/upload-release.yml` | 793 B | `bb4cf9825895b61c…` |
| `external/upstream-sources/noble-hashes-1.5.0/.gitignore` | 69 B | `fa5d67276cfd093b…` |
| `external/upstream-sources/noble-hashes-1.5.0/.prettierrc.json` | 73 B | `0b0ec1c6246acfd4…` |
| `external/upstream-sources/noble-hashes-1.5.0/.vscode/settings.json` | 95 B | `cb35bb2821b812ee…` |
| `external/upstream-sources/noble-hashes-1.5.0/LICENSE` | 1.1 KiB | `4f221aee6e072336…` |
| `external/upstream-sources/noble-hashes-1.5.0/README.md` | 21.0 KiB | `373b3cea22b13f6f…` |
| `external/upstream-sources/noble-hashes-1.5.0/SECURITY.md` | 722 B | `7b19e02974e8b10e…` |
| `external/upstream-sources/noble-hashes-1.5.0/audit/2022-01-05-cure53-audit-nbl2.pdf` | 311.9 KiB | `11acbec6b4faa301…` |
| `external/upstream-sources/noble-hashes-1.5.0/audit/README.md` | 178 B | `bfd037a669aab0fc…` |
| `external/upstream-sources/noble-hashes-1.5.0/benchmark/README.md` | 1.5 KiB | `828946875b858fef…` |
| `external/upstream-sources/noble-hashes-1.5.0/benchmark/argon.js` | 1.9 KiB | `a01153b03d00f4cd…` |
| `external/upstream-sources/noble-hashes-1.5.0/benchmark/hashes.js` | 5.3 KiB | `ce0385df84e3c47d…` |
| `external/upstream-sources/noble-hashes-1.5.0/benchmark/kdf.js` | 5.6 KiB | `9f4ca3a515d32adf…` |
| `external/upstream-sources/noble-hashes-1.5.0/benchmark/package.json` | 1002 B | `0529b490edbacc85…` |
| `external/upstream-sources/noble-hashes-1.5.0/benchmark/secp.js` | 1.2 KiB | `6df656bcc4532712…` |
| `external/upstream-sources/noble-hashes-1.5.0/build/README.md` | 223 B | `1f868aec00cf2ca9…` |
| `external/upstream-sources/noble-hashes-1.5.0/build/input.js` | 1.1 KiB | `4aca5789f5ff501c…` |
| `external/upstream-sources/noble-hashes-1.5.0/build/package-lock.json` | 12.5 KiB | `38ec447962adf602…` |
| `external/upstream-sources/noble-hashes-1.5.0/build/package.json` | 323 B | `d7c3117b739dcf68…` |
| `external/upstream-sources/noble-hashes-1.5.0/esm/package.json` | 147 B | `bd389eb8cfe61883…` |
| `external/upstream-sources/noble-hashes-1.5.0/package-lock.json` | 2.3 KiB | `3871aa90d8371e6e…` |
| `external/upstream-sources/noble-hashes-1.5.0/package.json` | 3.8 KiB | `9165b53a6392dc43…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/_assert.ts` | 1.6 KiB | `950e1d13f95f27f0…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/_blake.ts` | 4.9 KiB | `1fda51ce23b1d3fa…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/_md.ts` | 4.5 KiB | `63d3c5473b2ed413…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/_u64.ts` | 3.4 KiB | `9a0d57ec12b8ca2e…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/argon2.ts` | 12.3 KiB | `f04bc7d75f246627…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/blake2b.ts` | 7.6 KiB | `7eec9387f277a2c1…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/blake2s.ts` | 5.3 KiB | `83d5ede5718f85fe…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/blake3.ts` | 9.3 KiB | `5f2055f15f8e4d50…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/crypto.ts` | 287 B | `d5ac3ef40dae277d…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/cryptoNode.ts` | 402 B | `55fa6dfbd66aec70…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/eskdf.ts` | 6.9 KiB | `60127663ca74b345…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/hkdf.ts` | 2.9 KiB | `67ebd8611ddf09a7…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/hmac.ts` | 2.8 KiB | `ce3925333d01930e…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/index.ts` | 96 B | `10a98110fa10385f…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/package.json` | 23 B | `3ca9d4afd2142508…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/pbkdf2.ts` | 3.7 KiB | `cb924b3299749f2f…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/ripemd160.ts` | 4.1 KiB | `252f6af684f7818b…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/scrypt.ts` | 9.6 KiB | `396be81cecf4817a…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/sha1.ts` | 2.4 KiB | `258e246655611b5d…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/sha2.ts` | 211 B | `bf3c50e36c3b5ad2…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/sha256.ts` | 4.5 KiB | `ac00259abdec2875…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/sha3-addons.ts` | 15.2 KiB | `b6a28ea6b988e6dc…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/sha3.ts` | 7.4 KiB | `4b93c6f9b8086bc4…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/sha512.ts` | 9.7 KiB | `46a5f03d99ab83ce…` |
| `external/upstream-sources/noble-hashes-1.5.0/src/utils.ts` | 9.4 KiB | `74b7f3713a592fc6…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/README.md` | 2.5 KiB | `0712a18713072d04…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/argon2.test.js` | 8.7 KiB | `19dcc132b1ee9dfe…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/async.test.js` | 3.3 KiB | `f6d4abdd4d9768e2…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/blake.test.js` | 6.3 KiB | `94694763127a188a…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/clone.test.js` | 4.7 KiB | `d06225056adc9d9b…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/eskdf.test.js` | 2.0 KiB | `260ba9d84c6852ab…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/example.js` | 2.9 KiB | `b91b517593ecf689…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/generator.js` | 7.4 KiB | `c4e404a4b69b9aaa…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/hashes.test.js` | 24.4 KiB | `5f115065db22103d…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/hmac.test.js` | 8.4 KiB | `3c806e5eef5d91a8…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/index.js` | 513 B | `be87b315755157ec…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/kdf.test.js` | 12.5 KiB | `77713bdf485b638e…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/keccak.test.js` | 31.5 KiB | `fbac6536c7822b38…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/sha3-addons.test.js` | 1.7 KiB | `44e6725d633bcb7f…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/slow-big.test.js` | 4.8 KiB | `7ed59e223bcc75c5…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/slow-dos.test.js` | 6.1 KiB | `4167e41a2d5f5f1b…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/turboshake.test.js` | 15.8 KiB | `e054e7438b0fd1d1…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/u64.test.js` | 2.7 KiB | `7764af7c540ac4e1…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/utils.js` | 3.3 KiB | `3a4c7a97c4232338…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/utils.test.js` | 1.4 KiB | `f3059b1658dc15a7…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/ShortMsgKAT_SHA3-224.txt` | 674.5 KiB | `d0e77c6bf2817aad…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/ShortMsgKAT_SHA3-256.txt` | 690.5 KiB | `bc2506ecea3d2ffc…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/ShortMsgKAT_SHA3-384.txt` | 754.5 KiB | `e670c595a5584f5a…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/ShortMsgKAT_SHA3-512.txt` | 818.5 KiB | `87a5d329f3d6cb36…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/ShortMsgKAT_SHAKE128.txt` | 2.56 MiB | `7a1bde3a3ad79ecd…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/ShortMsgKAT_SHAKE256.txt` | 2.56 MiB | `965170bc74bd0c24…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/blake2-gen.py` | 1.5 KiB | `108d277e845a8526…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/blake2-kat.json` | 1.79 MiB | `5031ac14800798ae…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/blake2-python.json` | 429.6 KiB | `57375e4b1595bb30…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/blake3.json` | 31.2 KiB | `dcb91ea8accc77e6…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/eskdf.json` | 5.3 KiB | `d8333b670e525e43…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/sha3-addon-keccak-prg.json.gz` | 7.83 MiB | `4b2d1a4d740e99c8…` |
| `external/upstream-sources/noble-hashes-1.5.0/test/vectors/sha3-addons.json.gz` | 2.04 MiB | `7f9e7086edd9c271…` |
| `external/upstream-sources/noble-hashes-1.5.0/tsconfig.esm.json` | 276 B | `59c25397a700ed8e…` |
| `external/upstream-sources/noble-hashes-1.5.0/tsconfig.json` | 274 B | `ea793368f35254d7…` |

### 5.5 project-resources
| File | Size | SHA-256 (first 16) |
| --- | --- | --- |
| `references/linked-generators/bug-report-plugin-encryption-example/index.html` | 3.8 KiB | `0fd9b559e8e0706f…` |
| `references/linked-generators/bug-report-plugin-encryption-example/main.pjs` | 1.7 KiB | `34ef344954fd5a5b…` |
| `references/linked-generators/bug-report-plugin-encryption-simpler-example/index.html` | 587 B | `8c86352691063cb2…` |
| `references/linked-generators/bug-report-plugin-encryption-simpler-example/main.pjs` | 2.9 KiB | `2c83bf69f6556344…` |
| `references/linked-generators/comments-plugin/index.html` | 44.5 KiB | `8c9de693c4adabee…` |
| `references/linked-generators/comments-plugin/main.pjs` | 37.4 KiB | `4b20ff48b15882e1…` |
| `references/linked-generators/public-key-encryption-tool/index.html` | 11.6 KiB | `abc6cb644d4001f2…` |
| `references/linked-generators/public-key-encryption-tool/main.pjs` | 594 B | `bb8a47658bada482…` |
| `references/linked-generators/secret-plugin-example/index.html` | 1.4 KiB | `fc53094566204751…` |
| `references/linked-generators/secret-plugin-example/main.pjs` | 31 B | `bb67b9fa50ff88b5…` |
| `references/linked-generators/send-me-a-secret-message/index.html` | 7.1 KiB | `daa13da8de8c3bcb…` |
| `references/linked-generators/send-me-a-secret-message/main.pjs` | 10.9 KiB | `eb1a6d783c94d1c2…` |

---
*Every hash above is SHA-256 of the file exactly as shipped; `manifest.json` contains the full 64-character digests.*

# Build / vendoring recipe

There is **no compiler in this project**. Perchance evaluates `main.pjs` directly, and every third-party
library is committed inside it as pre-bundled ES2022 source. `main.pjs` is both the source and the build output.

## How the vendored modules got into main.pjs

Each library was taken as a ready-made esm.sh **es2022 production** bundle, then rewritten by hand into a
plain `function X_Module() { … return { … }; }` factory (main.pjs lines 11–705) so it could be inlined into a
pjs list without `import`/`export` and without any network or module resolution at runtime.

| main.pjs lines | Factory | Copied from |
| --- | --- | --- |
| 11–673 | `MlKem768_Module()` | https://github.com/dajiaji/crystals-kyber-js/tree/2.3.0 (typescript in `src/`, compiled by hand); the nested `sha3_Module()` is https://esm.sh/v135/@noble/hashes@1.5.0/es2022/sha3.bundle.mjs |
| 676–681 | `hkdf_Module()` | https://esm.sh/v135/@noble/hashes@1.5.0/es2022/hkdf.bundle.mjs |
| 683–688 | `sha256_Module()` | https://esm.sh/v135/@noble/hashes@1.5.0/es2022/sha256.bundle.mjs |
| 690–695 | `gcm_Module()` | https://esm.sh/v135/@noble/ciphers@1.0.0/es2022/aes.bundle.mjs |
| 699–705 | `fflate_Module()` | https://esm.sh/fflate@0.8.2 (tree-shaken to `gzipSync`/`gunzipSync`) |

Edits made to the upstream code while vendoring:
1. ML-KEM: the upstream async `setup()` / `loadCrypto()` (which dynamically imports `node:crypto` for Node.js
   support — see `utils.ts` in that repo) was removed; `_setup()` is reduced to `this._api = globalThis.crypto`.
2. Every module: ES module syntax stripped, wrapped in a factory function, wrapped in an
   `if(!window["public-key-encryption-plugin-obj-8593757"]) { … }` singleton guard inside the pjs function
   `getObj() =>`, and the result cached on `window` so repeat imports are free.
3. `@noble/ciphers` also exports aeskw/aeskwp/cbc/cfb/ctr/ecb/siv/unsafe — only `gcm` is used.
4. `pako` (https://user-uploads.perchance.org/file/c0fe46e365351bc8eacadc5f761dc28a.txt) was evaluated and
   dropped in favour of `fflate` because it is smaller; the commented-out pako code path is still in main.pjs.

Re-vendoring a newer version means: fetch the new esm.sh bundle, verify its exports match
(`hkdf`, `sha256`, `gcm`, `gunzipSync`/`gzipSync`, `MlKem768`), re-wrap it as a factory, and bump the version
number after `PUBLIC_`/`PRIVATE_`/`ENCRYPTED_` in the serialization helpers if the wire format changes.

## How this package was assembled

1. `main.pjs`, `index.html` and the workspace `AGENTS.md` copied verbatim into `internal/`.
2. The five embedded module factories were extracted from main.pjs by line range
   (11–673, 676–681, 683–688, 690–695, 699–705) into `external/vendored-in-main-pjs/`.
3. main.pjs lines 708–889 were extracted and de-indented by 4 spaces into
   `internal/secret-plugin-core.js` (plugin-authored code only).
4. main.pjs lines 11–889, de-indented and wrapped in an IIFE with a `return { generateKeyPair, encrypt, decrypt }`,
   became `internal/standalone/secret-plugin.mjs` — verified with a real generate → encrypt → decrypt round-trip.
5. Dependency archives downloaded with `fetch_url` and unpacked with `@zip.js/zip.js`:

   ```
   https://github.com/dajiaji/crystals-kyber-js/archive/refs/tags/2.3.0.zip
   https://github.com/paulmillr/noble-hashes/archive/refs/tags/1.5.0.zip
   https://github.com/paulmillr/noble-ciphers/archive/refs/tags/1.0.0.zip
   https://github.com/101arrowz/fflate/archive/refs/tags/v0.8.2.zip
   ```

6. The esm.sh bundle URLs cited in main.pjs were fetched verbatim into `external/esm-sh-bundles/`.
7. Every generator linked from `index.html` was fetched into `references/linked-generators/` via the
   Perchance `getGeneratorsAndDependencies` API (`/api/getGeneratorsAndDependencies?generatorNames=…`).
8. Sizes and SHA-256 digests for all 356 files were computed and written to `ASSETS.md` and `manifest.json`;
   the tree was zipped with `fflate.zipSync`.

## Running the self-test

- **Standalone:** serve the package root and open `internal/standalone/demo.html`, click the button — it
  prints timings, both keys, the ciphertext and the round-trip result.
- **In Perchance:** open https://perchance.org/secret-plugin#edit — index.html's inline script already
  generates 3 key pairs and encrypts/decrypts a ~30 kB string three times, logging timings to the console.
  (Observed in a Chromium session: ~5–12 ms encrypt, ~5–8 ms decrypt for 31 KB.)

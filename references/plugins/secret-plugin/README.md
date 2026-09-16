# secret-plugin — complete source & asset package

Everything used by the Perchance generator **https://perchance.org/secret-plugin**, in one download:
its own code, the exact third-party libraries vendored into it, the upstream repositories those came from,
and every generator the documentation links to.

- **Inventory with per-file sizes + SHA-256 checksums:** [`ASSETS.md`](ASSETS.md)
- **Machine-readable manifest:** [`manifest.json`](manifest.json)
- **Vendoring / reproduction recipe:** [`build/BUILD.md`](build/BUILD.md)
- **Runnable standalone module:** [`internal/standalone/secret-plugin.mjs`](internal/standalone/secret-plugin.mjs) (+ [`demo.html`](internal/standalone/demo.html))

Uncompressed size: ~69 MB. The bulk of that is upstream test-vector data the project never loads
(`crystals-kyber-js/test/vectors/kat/*.rsp`) — kept so the package is a complete, auditable snapshot.

---

## What the plugin is

`secret-plugin` generates a public/private key pair and uses it to encrypt/decrypt text, entirely in the
browser and entirely **synchronously**. The public key is safe to publish; only the private key can decrypt.

```js
secret = {import:secret-plugin}

let keys = secret.generateKeyPair();                 // { public, private } — plain text
let enc  = secret.encrypt("Hello!", keys.public);    // "ENCRYPTED_1_…_ENCRYPTED_END"
let dec  = secret.decrypt(enc, keys.private);        // "Hello!"
```

Key / message wire formats (all purely alphanumeric — no spaces, so double-click selects the whole thing):

| | Prefix | Suffix | Payload |
| --- | --- | --- | --- |
| Public key | `PUBLIC_` *version* `_` | `_PUBLIC_END` | ML-KEM-768 encapsulation key (1,184 B) |
| Private key | `PRIVATE_` *version* `_` | `_PRIVATE_END` | ML-KEM-768 decapsulation key (2,400 B) |
| Message | `ENCRYPTED_` *version* `_` | `_ENCRYPTED_END` | see below |

---

## Cryptographic pipeline (as implemented)

**Key generation** — `MlKem768.generateKeyPair()` from 64 CSPRNG bytes; keys are the raw ML-KEM-768
encapsulation/decapsulation keys encoded with the plugin's alphanumeric-Base64 variant.

**Encryption** — `encrypt(plainText, publicKey)`:
1. `kem.encap(publicKey)` → `[ciphertext (1,088 B), sharedSecret (32 B)]`
2. random 12-byte IV and 16-byte salt from `crypto.getRandomValues`
3. `key = HKDF-SHA256(sharedSecret, salt, info=∅, 32 bytes)` (`deriveKeySync`)
4. `plainText` → UTF-8 → **gzip** (fflate)
5. **AES-256-GCM** encrypt with `key`/`iv` (@noble/ciphers `gcm`)
6. payload = `iv(12) ‖ salt(16) ‖ uint64-BE len(ciphertext) ‖ ciphertext ‖ gcmOutput`, then alphanumeric-Base64

**Decryption** — `decrypt(encryptedText, privateKey)`: split the payload, `kem.decap(ciphertext, privateKey)` →
same HKDF derivation → AES-GCM decrypt (GCM tag authenticates the data) → gunzip → UTF-8.

**Why it is synchronous:** the author replaced `crypto.subtle` (async WebCrypto), `pako` and the upstream
Kyber library's async `loadCrypto()` with synchronous equivalents — `@noble/hashes` HKDF/SHA-256/SHA-3,
`@noble/ciphers` AES-GCM and `fflate` gzip — then checked them byte-for-byte against the WebCrypto results
(the `*_orig` variables and `bytesAreSame(...)` comparisons in main.pjs). The `async` marker on
`initIfNeeded()` is vestigial: its body is synchronous and it is called without `await`.

**Freshness:** a random IV + salt per call means encrypting the same text twice yields different ciphertext,
so identical public messages cannot be correlated.

**Alphanumeric Base64:** standard Base64 with `Z` as the escape character — `Z`→`ZZ`, `+`→`ZP`, `/`→`ZS`,
`=`→`ZE` (`bytesToBase64`/`base64ToBytes`).

The `*_N_` prefix on every key and message is a scheme version number, so the format can be upgraded
backwards-compatibly.

---

## Package layout

```
secret-plugin/
├── README.md                     ← you are here
├── ASSETS.md                     ← complete categorized inventory + checksums
├── manifest.json                 ← every file: size + full SHA-256 + category + source links
├── internal/                     ← THIS PROJECT'S OWN CODE
│   ├── main.pjs                  ← the generator's perchance-js source (893 lines)
│   ├── index.html                ← the public documentation page (<body> contents)
│   ├── secret-plugin-core.js     ← main.pjs:708–889 — plugin-authored code only, de-indented
│   ├── standalone/
│   │   ├── secret-plugin.mjs     ← same code as a plain ES module (no Perchance needed)
│   │   └── demo.html             ← browser round-trip demo that imports it
│   └── workspace/AGENTS.md       ← the agent-workspace instructions used to build this
├── external/                     ← THIRD-PARTY CODE
│   ├── vendored-in-main-pjs/     ← the 5 module factories that literally sit inside main.pjs
│   │   ├── MlKem768_Module.js    ← ML-KEM-768 (FIPS 203) + nested sha3
│   │   ├── hkdf_Module.js        ├─ @noble/hashes 1.5.0
│   │   ├── sha256_Module.js      ┘
│   │   ├── gcm_Module.js         ← @noble/ciphers 1.0.0 AES-GCM
│   │   └── fflate_Module.js      ← fflate 0.8.2 gzip/gunzip
│   ├── esm-sh-bundles/           ← the esm.sh bundle files + entry stubs they were copied from
│   └── upstream-sources/         ← full unmodified repos: crystals-kyber-js 2.3.0,
│                                    noble-hashes 1.5.0, noble-ciphers 1.0.0, fflate 0.8.2
├── references/
│   └── linked-generators/        ← full source of every generator the docs page links to
│       ├── send-me-a-secret-message/            ├── bug-report-plugin-encryption-example/
│       ├── secret-plugin-example/               ├── bug-report-plugin-encryption-simpler-example/
│       ├── public-key-encryption-tool/          └── comments-plugin/
└── build/
    └── BUILD.md                  ← vendoring + packaging recipe
```

---

## Using the standalone module

The crypto has no Perchance dependency. Serve this folder over http(s) (or use the perchance page) and:

```js
import secretPlugin from "./internal/standalone/secret-plugin.mjs";
const keys = secretPlugin.generateKeyPair();
const enc  = secretPlugin.encrypt("private message", keys.public);
const dec  = secretPlugin.decrypt(enc, keys.private);
```

Requires a secure context (`crypto.getRandomValues`), `TextEncoder`/`TextDecoder` and `btoa`/`atob`.
Verified before packaging: round-trip on a 1,450-char plaintext returns the original text, and a
non-matching private key throws.

Encoding a file/image works the same way — convert it to a data URL first (text), then encrypt.

---

## Licenses

All four vendored libraries are **MIT**:

| Library | Copyright |
| --- | --- |
| crystals-kyber-js 2.3.0 | (c) 2023 Ajitomi Daisuke |
| @noble/hashes 1.5.0 | (c) 2022 Paul Miller (https://paulmillr.com) |
| @noble/ciphers 1.0.0 | (c) 2022 Paul Miller (https://paulmillr.com) |
| fflate 0.8.2 | (c) 2023 Arjun Barrett |

Full license texts: `external/upstream-sources/*/LICENSE`. The linked example generators in
`references/` belong to their own authors/pages on perchance.org.

# MANIFEST — markov-chain-plugin

Complete inventory of every file in the generator `markov-chain-plugin`.
Files marked *(root)* were authored as part of this export (documentation); all
others are the project's real shipped content, reproduced byte-exactly.

```
perchance.org/markov-chain-plugin
├── main.pjs          (7,629 B)   the plugin function $output(dataStr, length)
└── index.html      (181,524 B)   the entire UI page
```

The generator ships exactly those two files. Everything else in this archive is
either a decomposition of them (for readability), a third-party artifact that is
*inlined* inside them, or documentation.

## internal-code/

_Internal code — written for this project._

| File | Bytes | SHA-256 (first 16) |
|---|---|---|
| `internal-code/decomposed/index.inline-script.js` | 8.434 | `9bbca0ead4de77ab` |
| `internal-code/decomposed/index.module-no-lzstring.js` | 3.714 | `58b8d5fe764c1b1d` |
| `internal-code/decomposed/index.styles.css` | 25.912 | `bf9cb3f4f70661cb` |
| `internal-code/index.html` | 187.492 | `c94e653ad2e735f2` |
| `internal-code/main.pjs` | 7.629 | `f36d77dd7789078f` |

## external-code/

_External code — third-party libraries vendored into the project._

| File | Bytes | SHA-256 (first 16) |
|---|---|---|
| `external-code/lz-string/LICENSE.txt` | 1.086 | `dcfcb96e3b0fccfb` |
| `external-code/lz-string/README.upstream.md` | 4.863 | `d1f0cab563727b62` |
| `external-code/lz-string/lz-string.1.4.4.min.js` | 4.721 | `7d7c7a114efa1c5d` |
| `external-code/lz-string/lz-string.as-vendored-in-this-project.js` | 4.577 | `4e5a999d97fbf33a` |
| `external-code/lz-string/upstream-reference/lz-string.1.4.4.min.js` | 4.719 | `9d1a0ef07a2ea5fa` |
| `external-code/lz-string/upstream-reference/lz-string.1.5.0.min.js` | 4.814 | `95f4d1cbf099f571` |

## third-party-assets/

_Third-party assets — binary/embedded resources from other projects._

| File | Bytes | SHA-256 (first 16) |
|---|---|---|
| `third-party-assets/fonts/AdobeBlank-Regular.otf` | 19.120 | `17ac015940634708` |
| `third-party-assets/fonts/LICENSE-OFL-1.1.txt` | 4.301 | `6a73f9541c2de741` |
| `third-party-assets/fonts/README.adobe-blank.md` | 2.379 | `cf44b8d806bbf038` |
| `third-party-assets/fonts/font-license-notices.txt` | 1.287 | `026e683b34f169f8` |

## project-resources/

_Project resources — data and copy owned by this project._

| File | Bytes | SHA-256 (first 16) |
|---|---|---|
| `project-resources/data/sample-corpus-alice-in-wonderland.txt` | 148.810 | `36a7ff59b043c45e` |
| `project-resources/ui-copy/page-text.txt` | 153.215 | `1a788adfa94c71e7` |

## build-config/

_Build & configuration files._

| File | Bytes | SHA-256 (first 16) |
|---|---|---|
| `build-config/README.md` | 1.133 | `8fe87c8db9e90146` |

## Top-level

_Export documentation._

| File | Bytes | SHA-256 (first 16) |
|---|---|---|
| `README.md` | 3.927 | `7b900355d050c0b6` |

## Totals

- Files: 19
- (MANIFEST.md itself is not counted above — it is this file.)

- Bytes: 592.133

## Inlined third-party code — where it appears

| Artifact | main.pjs | index.html |
|---|---|---|
| lz-string 1.4.4 (min, UMD tail stripped) | yes — `var LZString=...` | yes — identical copy |
| Adobe Blank 1.045 (`@font-face` "NotDef") | — | yes — base64 data URI |

The two embedded LZString copies are **byte-identical** to each other and
**byte-identical** to the first 4,576 bytes of the official `lz-string@1.4.4`
minified build (verified by direct comparison; the vendored copy simply drops
the trailing AMD/CommonJS UMD line). See `external-code/lz-string/`.

## Network / external dependencies at runtime

None. The page fetches no URLs,
loads no external scripts, styles, fonts or images, and imports no Perchance
plugins. External links on the page are outbound hyperlinks only (setosa.io,
gutenberg.org, two Perchance example generators).

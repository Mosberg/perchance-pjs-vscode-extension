# MANIFEST — every file in this project, categorised

## 1. Internal code (first-party) — `10-internal-code/`
| File | Bytes | SHA-256 |
|---|---|---|
| main.pjs | 36563 | `9f5427165744e388984fbe3a594f356d270c8ae97876d2ebcdbddfc270ba89f7` |
| index.html | 1564 | `03472dc4358f53c8e97461b64629c0d61d25ba57632f36e5a76fef9426d4447d` |
| modules/numerals-to-words.core.pjs | 2232 | `76b197e9c92316f42434094d88b29ac02b98c25fee7283b2d43048b6652ee6cd` |
| modules/word-tables.pjs | 34330 | `da5e8f92b7e1503c6b440139909d117ad757438de8f938b59303926d80b1e0bb` |
| LINE-MAP.md | — | — |

## 2. External / third-party code — `20-external-code/`
| File | Bytes | SHA-256 |
|---|---|---|
| big.js-4.0.2.min.js | 6224 | `c8cd4fc75871eeacfdf0196c2f23fd3818e0fc3e36992bc885e900603281a91f` |
| big.js-4.0.2.LICENCE.txt | 1085 | `9d0903993f9bb997b9f060b580862badea55ed14dca7bcefcfde6afe75c9f20d` |
| VENDOR.md | — | — |

## 3. Third-party binary assets — `30-third-party-assets/`
None. No images, audio, models, fonts, sprites, shaders or animation files are used.

## 4. Project resources — `40-project-resources/`
None as separate files. The only data resources are the three word tables
(`digitsToWords_ONE_TO_NINETEEN`, `digitsToWords_TENS`, `digitsToWords_SCALES`),
which are defined inline at the end of `main.pjs` and extracted to
`10-internal-code/modules/word-tables.pjs`.

## 5. Build / config / pipeline files — `50-build-config/`
None. Perchance generators have no build system; `main.pjs` + `index.html` are served
directly. See `50-build-config/README.md` for how this package was produced.

## Total
2 first-party source files (38.127 bytes),
1 vendored library (6224 bytes, MIT), 0 binary assets, 0 build files.

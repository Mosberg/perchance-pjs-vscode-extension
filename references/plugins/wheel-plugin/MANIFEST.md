# MANIFEST

Every file in this package, with byte size, SHA-256 (first 16 hex chars) and origin.

Generator: `wheel-plugin` — public page https://perchance.org/wheel-plugin (public id `f3449182ad1c943a784479f58cd20a9c`), exported 2026-09-16.

Contents: 28 files, 715652 bytes before compression.

Directories: `01-internal-code` (the generator's own code) · `02-external-code` (third-party libraries, vendored + upstream) · `03-assets` (images & audio) · `04-project-resources` (specs/reference) · `05-build-config` (build notes & audit script).

## internal-code

| File | Bytes | SHA-256 | Origin |
|---|---:|---|---|
| `01-internal-code/example-lists-wheelOptions.pjs` | 1,611 | `db43aff6c4900ecc` | extracted from main.pjs:1-116 |
| `01-internal-code/index.html` | 11,141 | `289a9f0f05afceb5` | generator source (HTML panel), byte-exact |
| `01-internal-code/main.pjs` | 173,359 | `a1cf26abe42c34f0` | generator source (lists panel), byte-exact |
| `01-internal-code/wheel-plugin-functions.js` | 7,991 | `569efb5bfc7410e7` | extracted from main.pjs:117-345 |

## external-code

| File | Bytes | SHA-256 | Origin |
|---|---:|---|---|
| `02-external-code/DEPENDENCIES.md` | 5,293 | `8116d6a560b151b1` | generated |
| `02-external-code/gsap-tweenmax-2.0.2/TweenMax-2.0.2.vendored.js` | 116,236 | `1f0d5bff2ea40f5a` | extracted from main.pjs:455-462 (as shipped) |
| `02-external-code/gsap-tweenmax-2.0.2/upstream/TweenMax.min.js` | 116,074 | `009bf00d3831fb62` | cdnjs gsap@2.0.2/TweenMax.min.js |
| `02-external-code/winwheel-2.8.0/upstream/LICENSE` | 1,088 | `69a40b9b607a8da6` | github.com/zarocknz/javascript-winwheel v2.8.0 release |
| `02-external-code/winwheel-2.8.0/upstream/README.md` | 2,784 | `27d568070d142c16` | github.com/zarocknz/javascript-winwheel v2.8.0 release |
| `02-external-code/winwheel-2.8.0/upstream/Winwheel.js` | 127,197 | `bbfa9c026aa2abc0` | github.com/zarocknz/javascript-winwheel v2.8.0 release |
| `02-external-code/winwheel-2.8.0/upstream/Winwheel.min.js` | 23,260 | `ad92356928636125` | github.com/zarocknz/javascript-winwheel v2.8.0 release |
| `02-external-code/winwheel-2.8.0/winwheel-2.8.0.vendored.js` | 26,310 | `af24f355fb500abe` | extracted from main.pjs:354-445 (as shipped) |

## assets

| File | Bytes | SHA-256 | Origin |
|---|---:|---|---|
| `03-assets/ASSETS.md` | 3,645 | `81fccf434e6a931b` | generated |
| `03-assets/audio/tick.mp3` | 2,398 | `a7ceb880d9140d5f` | decoded from the base64 data URL in main.pjs |
| `03-assets/audio/tock.mp3` | 1,944 | `69a7af2f02e618dc` | decoded from the base64 data URL in main.pjs |
| `03-assets/audio/tock2.mp3` | 11,411 | `b869625c344c01be` | decoded from the base64 data URL in main.pjs |
| `03-assets/images/i.imgur.com/apples.jpg` | 14,597 | `fb75e17a72a039ac` | downloaded from https://i.imgur.com/... |
| `03-assets/images/i.imgur.com/bananas.jpg` | 5,109 | `d4cb7ae1e72693f7` | downloaded from https://i.imgur.com/... |
| `03-assets/images/i.imgur.com/grapes.jpg` | 9,403 | `db22b7ef96ab0cd1` | downloaded from https://i.imgur.com/... |
| `03-assets/images/user-uploads.perchance.org/apples.jpeg` | 14,597 | `fb75e17a72a039ac` | downloaded from https://user-uploads.perchance.org/file/... |
| `03-assets/images/user-uploads.perchance.org/bananas.jpeg` | 5,109 | `d4cb7ae1e72693f7` | downloaded from https://user-uploads.perchance.org/file/... |
| `03-assets/images/user-uploads.perchance.org/grapes.jpeg` | 9,403 | `db22b7ef96ab0cd1` | downloaded from https://user-uploads.perchance.org/file/... |

## project-resources

| File | Bytes | SHA-256 | Origin |
|---|---:|---|---|
| `04-project-resources/wheel-options-reference.md` | 8,599 | `f7726819f33d70f8` | derived from main.pjs + index.html |

## build-config

| File | Bytes | SHA-256 | Origin |
|---|---:|---|---|
| `05-build-config/build.md` | 3,234 | `3935a9728aa3182a` | written for this export |
| `05-build-config/verify-vendored.mjs` | 4,280 | `d8a85f0285534949` | written for this export |

## package root

| File | Bytes | SHA-256 | Origin |
|---|---:|---|---|
| `LICENSE-NOTES.md` | 1,560 | `be627e75508fc51b` | written for this export |
| `README.md` | 8,019 | `f6babadd545c2391` | written for this export |
| `MANIFEST.md` | (this file) | — | written for this export |

## Integrity notes

* Each imgur image and its `user-uploads.perchance.org` counterpart are byte-identical (the Perchance uploads are re-hosts of the imgur originals).
* The vendored GSAP blob inside `main.pjs` matches upstream `gsap@2.0.2/TweenMax.min.js` modulo whitespace; the only local change is the `fakeWindow` wrapper.
* The vendored Winwheel blob is a re-minified v2.8.0 with local edits (rewritten `draw()`, extra `drawSegments()` call in the `segmentImage` branch); upstream v2.8.0 is included for diffing.
* Audit performed while building this package (re-runnable with `05-build-config/verify-vendored.mjs`):
  * `PASS  gsap vendored == upstream cdnjs 2.0.2 modulo whitespace`
  * `PASS  gsap vendored file contains main.pjs:455-462 verbatim`
  * `PASS  winwheel vendored file contains main.pjs:354-445 verbatim`
  * `PASS  functions file contains main.pjs:117-345 verbatim`
  * `PASS  example lists == main.pjs:1-116`

# wheel-plugin — complete source & asset package

Full export of the Perchance generator **`wheel-plugin`** (public page: `https://perchance.org/wheel-plugin`,
public id `f3449182ad1c943a784479f58cd20a9c`), taken 2026-09-16 from an exact snapshot of its two
authoring files plus every asset and third-party library the generator uses, vendored or referenced.

This package contains **everything**: every line of the generator's own code, every vendored library blob
as it is actually shipped inside the generator, the upstream originals of those libraries for auditing,
and every image/audio file referenced by the code (both as delivered URLs and as decoded local copies).

---

## 1. What the generator is

`wheel-plugin` is a Perchance **plugin**: a generator whose top-level list is an output function
(`$output(wheelOptions) => ...`) that other generators import with `makeWheel = {import:wheel-plugin}` and
call as `[makeWheel(wheelOptions)]` to render a clickable, spinning prize wheel.

The wheel itself is drawn with **Winwheel.js 2.8.0** (MIT, by @zarocknz) and animated with
**GSAP TweenMax 2.0.2**, both of which are *vendored* (pasted) into `main.pjs` rather than loaded from a CDN,
so the plugin has **zero runtime network dependencies** apart from user-supplied segment images.

The generator ships in exactly two authoring files:

| File | Role |
|---|---|
| `main.pjs` | Perchance list code: 12 demo `wheelOptions` configs, the `$output(wheelOptions)` render function, `initWinwheel()` helpers, the three built-in segment sounds (base64 MP3), vendored Winwheel, vendored GSAP |
| `index.html` | The generator's documentation page (usage, options, examples, custom-sound uploader) — this is what visitors see at `perchance.org/wheel-plugin` |

There is **no build pipeline, bundler, package.json, or config file of any kind** — see
`05-build-config/build.md`. Everything is hand-authored/edited text files.

---

## 2. Package layout

```
wheel-plugin-complete-package/
├── README.md                     ← this file
├── MANIFEST.md                   ← every file: size + SHA-256 + category + origin
├── LICENSE-NOTES.md              ← licensing/attribution for each component
│
├── 01-internal-code/             ← the generator's own code (written/maintained in the Perchance editor)
│   ├── main.pjs                  ← THE generator source, byte-exact (173,352 bytes, 463 lines)
│   ├── index.html                ← THE generator's HTML/docs page, byte-exact (11,131 bytes)
│   ├── wheel-plugin-functions.js ← main.pjs lines 117-345 extracted for readable reference
│   └── example-lists-wheelOptions.pjs ← main.pjs lines 1-116 (the 12 demo configs) extracted
│
├── 02-external-code/             ← third-party code (vendored blobs + upstream originals)
│   ├── DEPENDENCIES.md
│   ├── winwheel-2.8.0/
│   │   ├── winwheel-2.8.0.vendored.js     ← exactly as shipped inside main.pjs (lines 354-445)
│   │   └── upstream/  Winwheel.js, Winwheel.min.js, LICENSE, README.md   (v2.8.0 release, MIT)
│   └── gsap-tweenmax-2.0.2/
│       ├── TweenMax-2.0.2.vendored.js     ← exactly as shipped inside main.pjs (lines 455-462)
│       └── upstream/TweenMax.min.js       ← cdnjs copy of 2.0.2 (verified identical modulo whitespace)
│
├── 03-assets/                    ← every non-code asset (binary, decoded/downloaded)
│   ├── ASSETS.md
│   ├── audio/  tick.mp3, tock.mp3, tock2.mp3      (decoded from the base64 data URLs in main.pjs)
│   └── images/
│       ├── user-uploads.perchance.org/  apples.jpeg, bananas.jpeg, grapes.jpeg
│       └── i.imgur.com/                 apples.jpg,  bananas.jpg,  grapes.jpg
│
├── 04-project-resources/         ← spec/reference material for the project
│   └── wheel-options-reference.md ← complete option schema (segments, animation, text, sound, ...)
│
└── 05-build-config/              ← build/reproduce/verify scripts (none existed; these are written for this export)
    ├── build.md                  ← how the vendored blobs are assembled + how to rebuild the generator
    └── verify-vendored.mjs       ← re-extracts the vendored sections from main.pjs and verifies them
```

---

## 3. Everything, in code form

* **Generator code** — `01-internal-code/main.pjs` and `01-internal-code/index.html` are byte-exact copies of
  the generator's two files, so the whole generator can be re-created by pasting them into
  `perchance.org/edit` (lists panel + HTML panel). No other file is needed for the generator to work.
* **Vendored third-party code** — included in full twice: once as it ships (with its local edits), once as
  upstream v2.8.0 / v2.0.2 for audit and diffing. The shipped copies are consumed from `main.pjs`; the
  `*.vendored.js` files are extractions of those same bytes, dedented by two spaces.
* **Assets** — the three MP3 sounds are stored *inside* `main.pjs` as `data:audio/mpeg;base64,...` data URLs;
  `03-assets/audio/*.mp3` are those exact bytes decoded to real MP3 files. The six referenced JPEGs were
  downloaded from their live URLs (`03-assets/images/...`); the imgur and perchance-upload copies of each
  picture were verified **byte-identical** (the perchance uploads are re-hosts of the imgur originals).

### Asset URLs as referenced by the code

| Referenced in | URL | Local file |
|---|---|---|
| `main.pjs` → `wheelOptions8` | `https://i.imgur.com/gPg3Uvi.jpg` | `03-assets/images/i.imgur.com/apples.jpg` |
| `main.pjs` → `wheelOptions8` | `https://i.imgur.com/McrEpfA.jpg` | `03-assets/images/i.imgur.com/bananas.jpg` |
| `main.pjs` → `wheelOptions8` | `https://i.imgur.com/dZmOaTp.jpg` | `03-assets/images/i.imgur.com/grapes.jpg` |
| `index.html` (doco example) | `https://user-uploads.perchance.org/file/47592ece70be9cfbc378b3820d93eae6.jpeg` | `03-assets/images/user-uploads.perchance.org/apples.jpeg` |
| `index.html` (doco example) | `https://user-uploads.perchance.org/file/1b7bfdc0ef9998b869301f83974feacd.jpeg` | `03-assets/images/user-uploads.perchance.org/bananas.jpeg` |
| `index.html` (doco example) | `https://user-uploads.perchance.org/file/9bf235dcce14dc85e26bff744338697b.jpeg` | `03-assets/images/user-uploads.perchance.org/grapes.jpeg` |
| `main.pjs` → `wheelSegmentSoundsDataUrls` | inline `data:audio/mpeg;base64,...` (`tick`, `tock`, `tock2`) | `03-assets/audio/tick.mp3`, `tock.mp3`, `tock2.mp3` |

---

## 4. Verification performed while building this package

* `01-internal-code/main.pjs` / `index.html` — byte-exact copies (sizes 173,352 B / 11,131 B, SHA-256 in `MANIFEST.md`).
* Vendored GSAP — **identical to upstream cdnjs `gsap@2.0.2/TweenMax.min.js` modulo whitespace** (114,422
  non-whitespace characters on both sides); the only local change is the `fakeWindow` wrapper.
* Vendored Winwheel — a locally modified/re-minified build of v2.8.0; upstream 2.8.0 is included for diffing
  (see `02-external-code/DEPENDENCIES.md` for the exact local edits).
* Decoded audio — `tick.mp3` 2,398 B (MPEG frame sync `FF FB`), `tock.mp3` 1,944 B (MPEG frame sync `FF FB`),
  `tock2.mp3` 11,411 B (ID3v2 header) — all valid MP3 files.
* Images — all six downloads returned HTTP 200 / `image/jpeg`; imgur↔perchance pairs are SHA-256 identical.

---

## 5. Re-creating the generator from this package

1. Open `perchance.org/edit` (or any generator's editor) and create a new generator.
2. Replace the contents of the **lists** panel with `01-internal-code/main.pjs`.
3. Replace the contents of the **HTML** panel with `01-internal-code/index.html`.
4. Save. The generator is now a working clone of `wheel-plugin`; other generators import it with
   `makeWheel = {import:<your-generator-name>}` and use `[makeWheel(wheelOptions)]`.

Nothing else is required: no imports besides the plugin itself, no external scripts, no build step.

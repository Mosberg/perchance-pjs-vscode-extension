# conjugate-plugin — Complete Asset Package

Complete, unabridged source + asset export of the Perchance generator **`conjugate-plugin`**
(`https://perchance.org/conjugate-plugin`).

This package contains **every file the project uses or generates**, organised by category.
Nothing is summarised or omitted. The only file in the generator's source tree is listed in
full; the one large third-party dependency is included both **as embedded** and **as its
original upstream distribution**.

---

## 1. What this project is

`conjugate-plugin` is a Perchance *plugin* generator. Importing it (`conjugate = {import:conjugate-plugin}`)
yields a function, `conjugate(wordOrList)`, that returns an object with every verb form of the
supplied word (or of a randomly selected word, if given a Perchance list):

```js
{ actor, future, gerund, infinitive, past, present }
// e.g. conjugate("speak") -> { actor:"speaker", future:"will speak", gerund:"speaking",
//                             infinitive:"speak", past:"spoke", present:"speaks" }
```

It works by handing the word to the **compromise** natural-language library, which is bundled
(inlined, minified) directly inside `main.pjs` so the plugin has zero runtime network
dependencies. A short hand-maintained override table covers three verbs compromise gets wrong
(`hope`, `bill`, `dawn`) plus an `addedWords` lexicon that forces ~390 ambiguous words to be
tagged as verbs.

There is **no build step, no bundler, no package manager, and no manifest file** in this
project: a Perchance generator is just `main.pjs` (code) + `index.html` (page body), served
directly by the platform.

---

## 2. Directory layout

```
conjugate-plugin-assets/
├── README.md                        <- this file (manifest + documentation)
├── MANIFEST.txt                     <- machine-readable inventory: path, bytes, sha256
├── 01-internal-code/                <- code authored for this generator
│   ├── main.pjs                     <- THE generator source (verbatim, as shipped)
│   ├── index.html                   <- THE generator page (verbatim, as shipped)
│   ├── plugin-logic.extracted.js    <- derived: authored code only, library de-inlined for reading
│   └── vendored-inline/
│       └── compromise-11.12.4.min.js <- the library exactly as embedded in main.pjs
├── 02-external-code/                <- third-party dependency, upstream originals
│   └── compromise-11.12.4/
│       ├── LICENSE
│       ├── package.json
│       ├── README.md
│       ├── changelog.md
│       ├── compromise.d.ts
│       └── builds/
│           ├── compromise.min.js
│           ├── compromise.js
│           └── compromise.es6.min.js
├── 03-third-party-assets/           <- EMPTY (see that folder's README.txt)
├── 04-project-resources/            <- EMPTY (see that folder's README.txt)
└── 05-build-config/                 <- EMPTY (see that folder's README.txt)
```

---

## 3. Category: internal code (`01-internal-code/`)

### 3.1 `main.pjs` — the generator source (251,634 bytes, 36 lines)

Verbatim copy of the file that ships. It is only 36 lines, but one of those lines is 246,201
characters long: the minified compromise library.

Structure, line by line:

| line(s) | bytes | contents |
|---|---|---|
| 1 | 22 | `$output(wordOrList) =>` — declares the plugin's exported value (the function itself) |
| 2–12 | ~246.4 K | lazily-attached library loader: on first call it defines `window.nlp235326222` by running the inlined compromise UMD bundle against a fake `window`, then sets the `window.alreadyAttachedNLPCompromise235326222` guard flag |
| 6 | 69 | provenance comment: `/* compromise v11.12.4 github.com/nlp-compromise/compromise MIT */` |
| **7** | **246,201** | **the entire minified compromise v11.12.4 build, inlined** |
| 13 | 27 | coerces the argument to a string |
| 14–16 | 192 / 197 / 197 | hard-coded correct conjugations for the irregular verbs `hope`, `bill`, `dawn` (compromise mis-handles these) |
| 17 | 3,952 | `addedWords` — a map of ~390 words → `"Verb"`, force-tagging words compromise misses |
| 18 | 84 | `nlp235326222("They "+word, addedWords).verbs().conjugate()[0]` |
| 19–22 | 158 | fallback: if compromise returns no conjugation, echo the word back in all six slots (and `console.log("Not a verb? --> ", word)`) |
| 24–31 | ~147 | `typeMap`: compromise's tags → the plugin's public keys |
| 32–36 | 91 | builds and returns `{actor, future, gerund, infinitive, past, present}` |

### 3.2 `index.html` — the generator page (2,091 bytes, 72 lines)

Verbatim. The plugin's documentation / listing page: heading, the import snippet, worked
examples (`conjugate("run").gerund`, the `verb` list example, the full six-form table), notes
with links to `/conjugate-plugin-example` and `/plugins`, an inline `<style>` block styling
`body`, `code`, `pre` (dark code blocks, `tab-size:2`) and `ul li`.

### 3.3 `plugin-logic.extracted.js` — derived, for reading only

Not a shipped file. It is `main.pjs` with the 246 KB library on line 7 replaced by a comment,
so the ~5 KB of hand-written plugin code is readable. Generated mechanically from `main.pjs`
(lines 1–4, library marker, lines 8–36) — no edits.

### 3.4 `vendored-inline/compromise-11.12.4.min.js` — the dependency as embedded

The library exactly as it sits inside `main.pjs`, with only the three tabs of JS indentation
stripped. Verified **byte-identical** to the official upstream
`builds/compromise.min.js` with its 75-byte banner comment removed:

```
/* compromise v11.12.4
   github.com/nlp-compromise/compromise
   MIT
*/
```

(the plugin replaced that banner with its own one-line provenance comment on `main.pjs` line 6.)

---

## 4. Category: external code (`02-external-code/`)

One dependency, used at runtime, fetched at build time by the plugin author and inlined:

### compromise v11.12.4

- Upstream: `https://github.com/nlp-compromise/compromise`
- Package: `https://www.npmjs.com/package/compromise/v/11.12.4`
- CDN as downloaded: `https://unpkg.com/compromise@11.12.4/`
- License: **MIT** (full text in `LICENSE`)
- Author: Spencer Kelly and contributors (`spencermountain@gmail.com`)
- Description (from `package.json`): "natural language processing in javascript"

Files included — all three upstream builds plus complete package metadata:

| file | bytes | purpose |
|---|---|---|
| `builds/compromise.min.js` | 247,227 | UMD, minified — **this is the build that is inlined in `main.pjs`** |
| `builds/compromise.js` | 427,443 | UMD, unminified/readable |
| `builds/compromise.es6.min.js` | 247,374 | ES6 (modern syntax) minified |
| `package.json` | 1,768 | npm manifest (version, deps, entry points, author, MIT) |
| `README.md` | 17,404 | upstream readme |
| `changelog.md` | 9,034 | upstream changelog |
| `compromise.d.ts` | 318 | upstream TypeScript entry stub |
| `LICENSE` | 1,067 | MIT license text |

Only `builds/compromise.min.js` is actually *used* by the generator; the rest are included so
the dependency is fully documented and reproducible. compromise's own transitive npm
dependencies (`efrt`, `grad-school`, `suffix-thumb`) are **not** separate files here — they are
already bundled inside the three build files, which is why the minified build is ~247 KB.

**Note on how it is embedded:** the bundle is the UMD variant, so the plugin wraps it in an IIFE
that supplies a throwaway `window` object, then copies the resulting `nlp` function out to
`window.nlp235326222` (the `235326222` suffix is a collision-avoiding id). Loading is deferred
until first call and guarded by a global flag so repeat imports don't re-execute it.

---

## 5. Category: third-party assets (`03-third-party-assets/`) — empty

The project uses **no** third-party images, audio, video, fonts, 3D models, textures,
sprites, shaders, animations, JSON data files, prefabs, or UI resource files. The page uses
only text, native HTML elements, and one Unicode character (`⚄` / `&#xFE0E;`, the die-face-5
dingbat, with a variation selector) rendered by the system font. See
`03-third-party-assets/README.txt`.

---

## 6. Category: project resources (`04-project-resources/`) — empty

The project authors **no** images, audio, data, or other binary/creative resources of its own.
All visible content is generated from the code, or is a Perchance list/dynamic output. See
`04-project-resources/README.txt`.

---

## 7. Category: build / config (`05-build-config/`) — empty

There is **no build pipeline and no config file** in this project. Perchance generators are
served directly from `main.pjs` + `index.html`; there is no `package.json`, bundler config,
tsconfig, CI file, bundler, or task runner in the generator itself. The `package.json` in this
package belongs to the *dependency* (compromise), not to this generator. See
`05-build-config/README.txt`.

---

## 8. License / redistribution

- **Plugin code** (`main.pjs`, `index.html`): authored for this generator.
- **Inlined library**: compromise v11.12.4, MIT — the MIT license permits redistribution
  including in bundled/inlined form; the copyright notice and permission text are preserved in
  `02-external-code/compromise-11.12.4/LICENSE`, and attribution is kept in `main.pjs` line 6.

---

## 9. Reproducing the package

Everything here is reproducible from two inputs:

1. The generator's own two files (`01-internal-code/main.pjs`, `01-internal-code/index.html`).
2. `https://unpkg.com/compromise@11.12.4/` (or `npm i compromise@11.12.4`) for
   `02-external-code/`.

`plugin-logic.extracted.js` and `vendored-inline/compromise-11.12.4.min.js` are derived by
splitting `main.pjs` on newlines and taking line 1–4 + 8–36, and line 7 (leading indentation
stripped), respectively — see `MANIFEST.txt` for the resulting hashes.

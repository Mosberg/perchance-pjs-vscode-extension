# a-an-plugin — complete source & asset package

**Generator name:** `a-an-plugin`
**Public page:** https://perchance.org/a-an-plugin
**Runtime (iframe) origin id:** `26fd2c81c2d49536e74c4526ca794932`
**Exported:** 2026-09-16
**Source of truth:** the Perchance editor workspace — `main.pjs` + `index.html` (both included verbatim in this package)

This package is a byte-complete snapshot of the generator: every line of project code,
every vendored third-party file, every embedded data asset, plus provenance and licensing.

---

## 1. What this project is

A **Perchance plugin** that emits the correct English indefinite article — `a` or `an` —
for the word that *follows* it, and — this is the whole point — **re-evaluates itself
automatically when the following word changes**.

Why that matters: Perchance's built-in `{a}` alternation is resolved once, at render time.
Plugins like the `tap-plugin` re-randomize only the node the user taps, leaving neighbours
untouched. So with `That's {a} [tap(animal)]`, tapping `antelope` → `zebra` leaves you with
*"That's an zebra"*. This plugin fixes that by rendering a live `<span>` and watching the DOM
for changes to the following word.

Usage (from the generator's own listing page):

```
an = {import:a-an-plugin}
tap = {import:tap-plugin}

output
  That's [an()] [tap(animal)].

animal
  antelope
  zebra
  ...
```

Case variants — all are HTML strings you can drop straight into a template:

| Expression | Result for "apple" |
|---|---|
| `[an()]` / `[an().lowerCase]` | `a` |
| `[an().upperCase]` | `A` |
| `[an().titleCase]` | `A` |
| `[an().sentenceCase]` | `A` |
| `[an().lower]` | `a` (legacy alias) |

---

## 2. Package contents, by category

```
a-an-plugin/
├── README.md                         <- this file
├── MANIFEST.md                       <- every file: size, line count, SHA-256, origin, license
├── LICENSE.txt                       <- licensing summary for the whole package
│
├── internal-code/                    <- CATEGORY A: code authored for this project
│   ├── main.pjs                      <- the entire plugin (Perchance-js source)
│   └── index.html                    <- the generator's listing / documentation page
│
├── external-code/                    <- CATEGORY B: third-party code, vendored
│   └── a-vs-an/
│       ├── AvsAn-simple.js           <- upstream source (verbatim, CRLF)
│       ├── AvsAn-simple.min.js       <- upstream minified source (verbatim)
│       ├── LICENSE-Apache-2.0.txt    <- upstream license (Apache License 2.0)
│       ├── README-upstream.md        <- upstream project README (verbatim)
│       └── SOURCE.md                 <- provenance, commit, and how it is embedded
│
├── third-party-assets/               <- CATEGORY C: third-party data assets
│   └── a-vs-an/
│       └── dictionary-prefix-trie.base36.txt   <- the article dataset (see note)
│
├── project-resources/                <- CATEGORY D: docs, examples, metadata
│   └── example-usage.md              <- worked usage example + related links
│
└── build-config/                     <- CATEGORY E: build / config
    └── BUILD.md                      <- build pipeline (there is none) & deploy notes
```

### Category A — Internal code (authored here)

| File | Role |
|---|---|
| `internal-code/main.pjs` | The whole plugin. Defines `$output()` (returns the span object + registers the watcher) and `getAOrAnFunction()` (lazily builds and caches the article decision trie). |
| `internal-code/index.html` | The page body. Doubles as the generator's public listing/docs page: `<h1>` title, explanation of the problem, usage snippets, links, and the `<style>` block. |

There are **no** `src/` files and **no** `{import:...}` dependencies in this project. The
generator is exactly these two files.

### Category B — External code (third-party, vendored)

One library, **vendored inline** rather than imported: **`a-vs-an`** by Eamon Nerbonne
(https://github.com/EamonNerbonne/a-vs-an), Apache License 2.0.

`getAOrAnFunction()` in `main.pjs` contains the `AvsAnSimple` implementation verbatim —
the same source as `external-code/a-vs-an/AvsAn-simple.js`, minus the upstream header
comment (`//by Eamon Nerbonne (from https://eamonnerbonne.github.io/a-vs-an/), Apache 2.0 license`)
which was replaced by a `// From: https://github.com/EamonNerbonne/a-vs-an` note. See
`external-code/a-vs-an/SOURCE.md` for the exact provenance and diff notes.

No npm packages, no CDN `<script>` tags, no wasm, no CSS frameworks. Nothing else is loaded
at runtime — the plugin is fully self-contained.

### Category C — Third-party assets / data

The plugin carries the a-vs-an **dataset**: a compressed prefix trie of English article
usage, extracted from the July-2014 English Wikipedia text dump by the upstream author and
serialized as a **base-36 string** (the `dict` literal inside `main.pjs`). It is the only
non-code asset in the project.

`third-party-assets/a-vs-an/dictionary-prefix-trie.base36.txt` is that dataset, extracted
verbatim from the source into a standalone file so it can be diffed/audited without reading
through the JS. The same string is inlined in `internal-code/main.pjs` — that inline copy is
what actually runs; the standalone file is for reference only.

### Category D — Project resources

- `project-resources/example-usage.md` — the usage example, the case-variant table, and the
  related-generator links your listing page points at.
- `internal-code/index.html` **is** the project's presentation resource (title, problem
  statement, docs, styling). It is filed under internal code because it is the shipped page;
  it is reproduced nowhere else in this package.

There is no `$meta` block in `main.pjs`, so the listing title/description/tags are whatever
the generator settings hold, not source files.

### Category E — Build / config files

**None.** Perchance generators are not built. `main.pjs` is executed by the Perchance engine
before `index.html` runs; there is no bundler, transpiler, lockfile, package manifest, CI
config, or environment file anywhere in this project. `build-config/BUILD.md` documents the
load order and how to redeploy, since that is the closest thing this project has to a
"pipeline". Note that `MANIFEST.md` and this package were generated by tooling outside the
generator and are not part of it.

---

## 3. How the plugin works (walkthrough of `main.pjs`)

1. **`$output()`** is the entirety of the exported plugin. Because it is a function, importing
   the generator hands the caller that function (`an = {import:a-an-plugin}` → `[an()]`).

2. **Trie bootstrap + cache.** The first call builds the article decider and stashes it on
   `window.__aOrAn3472398593759834`; every later call reuses it.

3. **Unique element id.** Each call mints a unique class `aOrAnId_<random><random>` so that
   many `[an()]` calls on one page never collide, even if a template is re-rendered.

4. **Returned object.** `$output()` returns
   `{ lower, lowerCase, upperCase, titleCase, sentenceCase, toString() }` — every value
   except `toString` is a `<span class="aOrAnId_…" data-case="…">` placeholder, and
   `toString()` returns the lowercase one, so `[an()]` and `[an().titleCase]` both work.

5. **Deferred first paint.** A `setTimeout(…, 1)` waits for the span to land in the DOM,
   then calls `updateNodeText()`.

6. **`updateNodeText(node)`** — the actual decision:
   - walk `node.nextSibling` rightwards, concatenating `textContent` with
     `[\s$%&*@#,!=+\-.?:;'"(){}\[\]\/<>`~_|]` stripped out, stopping at the first chunk that
     contains a real word (`/\b[^\s]+\b/`);
   - take the first whitespace-delimited token as the following word;
   - `out = aOrAn.query(word)` (`"a"` or `"an"`), or `""` if no word follows;
   - apply the `data-case` transform: `upperCase` → `out.upperCase`, `titleCase` →
     `out.titleCase`, `sentenceCase` → `out.sentenceCase` (Perchance's `String.prototype`
     helpers); `lower`/`lowerCase`/absent → unchanged;
   - write the result into the span.

7. **Live updates.** A `MutationObserver` is attached to the span's **parent node** with
   `{childList:true, subtree:true, characterData:true}`. Any change anywhere in that parent
   (e.g. the `tap-plugin` swapping the neighbouring animal) re-runs `updateNodeText()`, which
   is exactly the behaviour `{a}` cannot provide. Two guards prevent feedback loops
   (ignoring `characterData` mutations of the span's own text node, and mutations targeting
   the span itself), and the observer **disconnects itself** once the span is removed from
   the document (checked with `document.body.contains`) so that repeated randomize/delete
   cycles don't leak observers.

8. **`getAOrAnFunction()`** — `fill()` uncompresses the base-36 `dict` into a nested object
   trie (`article` on each node plus one child object per character); `query(word)` walks it
   character by character, remembering the last `article` seen, and returns that. Unknown
   words fall back to the most specific known prefix's article.

---

## 4. Dependency inventory

| Dependency | Kind | Version | How it is used | License |
|---|---|---|---|---|
| `a-vs-an` / `AvsAnSimple` | JS library | upstream `master` @ commit recorded in `SOURCE.md` | Vendored inline in `main.pjs` | Apache-2.0 |
| Perchance engine | runtime platform | n/a | Executes `main.pjs`, renders `index.html` | platform ToS |
| Perchance `String.prototype.upperCase/.titleCase/.sentenceCase` | platform runtime helpers | n/a | Case variants in `updateNodeText()` | platform |

No other runtime dependencies exist.

---

## 5. Licensing

- **Project code** (`internal-code/`) — authored for this generator and published publicly
  at https://perchance.org/a-an-plugin. Treat it as the generator owner's own work.
- **`a-vs-an`** (`external-code/a-vs-an/`, and the `AvsAnSimple` code inlined in
  `main.pjs`, and the dataset in `third-party-assets/`) — **Apache License 2.0**,
  © Eamon Nerbonne. Full text in `external-code/a-vs-an/LICENSE-Apache-2.0.txt`.
  Apache-2.0 requires that the license and attribution be preserved when the work is
  redistributed — see `external-code/a-vs-an/SOURCE.md` for the recommended attribution line.
- See `LICENSE.txt`.

---

## 6. Rebuilding / redeploying

There is nothing to compile. To run this project, put `main.pjs` and `index.html` back into a
Perchance generator at the workspace root (see `build-config/BUILD.md`), or simply open
https://perchance.org/a-an-plugin.

---

## 7. Integrity

`MANIFEST.md` lists a SHA-256 for every file in this package. The two shipped files
(`internal-code/main.pjs`, `internal-code/index.html`) are byte-identical copies of the
generator's workspace files as exported.

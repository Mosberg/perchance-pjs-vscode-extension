# select-until-plugin — Complete Source Package

Complete, unabridged source + assets for the Perchance generator **perchance.org/select-until-plugin**
(public id `24b78de113202a7791a16d832575a913`).

Everything in this package is the *entire* generator. Nothing has been summarized, trimmed,
minified, or omitted. See `MANIFEST.md` for the category-by-category inventory with the full
code of every file inlined.

---

## 1. What this generator is

`select-until-plugin` is a Perchance **function plugin**. It exports a single JavaScript
function named `selectUntil` that other generators consume via `{import:select-until-plugin}`.

`selectUntil(list, condition)` repeatedly draws a random item from a Perchance list until the
drawn item satisfies a caller-supplied predicate, then returns that item.

Signature:

```js
selectUntil(list, condition) -> list-item (or error string)
```

* `list` — any Perchance list/node object (the thing you'd normally call `.selectOne` on).
  Because `list` is passed as a *live list object*, the plugin's repeated `.selectOne` draws
  respect that list's weights/odds (`item^3`), dynamic odds (`[expr]`), and any nested
  `if/else` gating — exactly like a normal selection.
* `condition` — a Perchance "condition" function of the form `item => <boolean expression>`.
  The arrow-function argument name is arbitrary (`item=>`, `blah=>`, …); it only exists to name
  the placeholder that stands for the candidate item being tested.
* Returns the **first item that passed the condition** (a live list-item object, not a string —
  so sub-properties such as `item.type` remain reachable), or, if no item passes within
  **10,000 attempts**, returns:
  `"(error: selectUntil couldn't find an item that meets the condition)"`.

### Why the demo compares `.evaluateItem`

Two items drawn from two different lists are never the *same object*, so `item != p` would
always be `true`. `.evaluateItem` materializes the item into its final raw text, so
`item.evaluateItem != p.evaluateItem` is the correct text comparison. (See `index.html`.)

---

## 2. Install

In the *consuming* generator's `main.pjs`, first line:

```pjs
selectUntil = {import:select-until-plugin}
```

Then call it from any square-bracket block:

```pjs
output
  Her name was [p = prefix.selectOne][s = selectUntil(suffix, item=> item.evaluateItem != p.evaluateItem)].
```

Condition with a sub-property test:

```pjs
suffix
  feather
    type = air
  stone
    type = earth

output
  Her name was [p = prefix.selectOne][s = selectUntil(suffix, item=> item.evaluateItem != p.evaluateItem && item.type == "air")].
```

---

## 3. How it works internally

`main.pjs` declares exactly one declaration, `$output`, whose value is the function that
`{import:...}` hands to the consumer (instead of the generator's `root` list). The body is a
plain `for` loop with a `10000`-iteration attempt cap, one `list.selectOne` draw per iteration,
an early `return` on the first passing item, and a sentinel error string on exhaustion. There
is no state, no randomness seeding, no I/O, no storage, no DOM access, and no imports — it is
pure and side-effect free apart from consuming the engine's RNG via `selectOne`.

The 10,000 cap exists so that an unsatisfiable condition (e.g. `item => false`) terminates with
a readable message rather than hanging the engine's render.

---

## 4. Runtime / platform dependencies

| Dependency | Kind | Where it comes from | Bundled here? |
|---|---|---|---|
| Perchance engine (pjs parser + list-tree runtime) | platform | perchance.org, loaded by the host page | No — provided by the platform |
| `list.selectOne` | platform API | Perchance list-tree method | No — platform |
| `item.evaluateItem` | platform API | Perchance list-item property | No — platform |

No npm packages, no CDN scripts, no `{import:}`s, no binary assets, no fonts, no audio, no
images, no JSON data files, no shaders, no models.

---

## 5. Build pipeline

**There is none.** Perchance generators are declarative:

* `main.pjs` is parsed by the engine into a list tree; function headers (`foo(a) =>`) are
  compiled to JS, and `$output` designates the importable value.
* `index.html` is injected as the page `<body>`; square-bracket expressions inside text nodes
  and non-event attributes are evaluated as templates by the same engine.
* `<style>` blocks and inline SVG markup are shipped as-is.

Consequently there are no bundler configs, lockfiles, env files, CI definitions, or generated
artifacts in this project — hence the "none" entries in `MANIFEST.md`.

---

## 6. File tree of this package

```
select-until-plugin/
├── README.md      <- this file
├── MANIFEST.md    <- categorized inventory + full inlined source of every file
├── main.pjs       <- internal code (the plugin function; the whole engine-side program)
└── index.html     <- internal code (page markup, docs, demo, inline CSS)
```

The live generator consists of exactly two source files (`main.pjs`, `index.html`), both
included byte-for-byte.

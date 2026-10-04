# lockable-list-plugin — complete source & asset export

Full project: **https://perchance.org/lockable-list-plugin**
Generator public id: `00fbc8fbf73d153a9e282606911dbd86`
Export date: 2026-09-16

## What this is

A Perchance **plugin** (a generator meant to be imported by other generators). It lets you
drop a random list into a page with a small lock/unlock toggle beside it, so a reader can
"pin" a particular list to the value it currently shows. Clicking 🔐 freezes that list; every
subsequent read of the list — anywhere on the page — returns the frozen value. Clicking 🔓
resumes normal random selection.

Consumers use it like this:

```
lockableList = {import:lockable-list-plugin}
```

```html
That [lockableList(animal)] is [lockableList(adjective)].
```

`[lockableList(adjective, "button")]` emits just the toggle button, so it can be placed away
from the list's own output.

## Package contents

```
01-internal-code/            the generator's own source (this is the whole shipped product)
    main.pjs                 the plugin function + demo lists
    index.html               the documentation / landing page

02-external-code/            other Perchance generators this one links to (not dependencies)
    lockable-list-plugin-example/                 "example" link
    lockable-list-plugin-example-2/               with makeTable
    lockable-list-plugin-example-3/               separate lock button
    lockable-list-plugin-example-duplicates/      independent locks via duplicated lists
    locker-plugin/                                more powerful alternative, mentioned in notes
    make-table-plugin/                            companion plugin, mentioned in notes

03-third-party-assets/       NONE (see NONE.md)
04-project-resources/        NONE (see NONE.md)
05-build-config/             NONE (see NONE.md) + rebuild-package.sh
06-known-dependencies.md     platform behaviours the code is coupled to
INVENTORY.md                 per-file inventory with sizes and SHA-256
CHECKSUMS.txt                machine-readable checksums
```

Nothing is minified and nothing is generated: every file in `01-internal-code/` is
byte-identical to what the Perchance editor serves for this generator.

## How it works (source walkthrough)

`main.pjs` is a single `$output (list, command) =>` function plus two demo lists.

1. **Lazy global state.** On first call it creates `window.lockListPluginData` holding four
   `Map`s — `lockedMap` (list → locked?), `lastValueMap` (list → last value),
   `idMap`/`idMapRev` (numeric id ↔ list) — and an `idCounter`. The four maps plus the
   counter are copied into locals for speed.
2. **Register the list.** If the list has not been seen, it gets `locked = false` and a stable
   numeric id. The id is what lets the generated `onclick` string find its list again without
   embedding an object reference in HTML.
3. **Read.** If the list is locked, or a `command` was passed, the value is the memoized
   `lastValueMap` entry; otherwise `list+""` triggers a fresh weighted selection through the
   engine. The result is written back to `lastValueMap`, so a list always re-renders to
   whatever it last produced until it is deliberately re-rolled.
   (`|| command` matters: without it, asking for a button would silently re-roll the value.)
4. **Emit.** `command === "button"` returns a standalone toggle `<span>` and a `<style>` rule
   that hides the *default* button for that list id, so the button does not appear twice.
   Otherwise it returns `value` followed by the default toggle `<span>`.

The toggle's `onclick` looks up `d.idMap.get(<id>)`, flips the lock in `lockedMap`, and
swaps the span's innerHTML between 🔐 and 🔓.

## Known limitation (documented by the author in index.html)

The plugin reads values through `list+""`, so it only works with **plain-text** list items. If
an item contains curly `{...}` or square `[...]` blocks, the plugin misbehaves — the
author points users at `locker-plugin` in that case. Locks are also per *list*, so using one
list twice and locking the two occurrences independently requires duplicated lists (see
`02-external-code/lockable-list-plugin-example-duplicates/`).

## Usage / reinstall

1. Open https://perchance.org/lockable-list-plugin or create a new generator.
2. Paste `01-internal-code/main.pjs` into the code panel.
3. Paste `01-internal-code/index.html` into the HTML panel.
4. Save. The generator then works as-is at `https://perchance.org/<your-name>`.

# roll-table-plugin — complete project package

This archive contains the complete source of the Perchance generator `roll-table-plugin`,
organised by category, plus a reference copy of its companion `dice-plugin`.

## What the generator does

`main.pjs` defines a single `$output` function that turns a weighted Perchance list into a
roll-table lookup: each list item is written as `n, text` or `n1-n2, text`, and calling
`rollTable(myList, roll)` returns the text whose numeric range contains `roll`.
`index.html` is the plugin's documentation/landing page (usage examples, notes, credits).

## Layout

```
internal-code/      main.pjs, index.html  (the generator itself)
external-code/      dice-plugin reference source (companion plugin, not imported)
third-party-assets/ none
project-resources/  none
build-config/       none (no build step)
FULL-SOURCE.md      all source files inline, in full
MANIFEST.md         categorised inventory with sizes + SHA-256
CHECKSUMS.sha256    integrity hashes
```

## Restoring / re-running it

Create a new Perchance generator, paste `internal-code/main.pjs` into the code panel and
`internal-code/index.html` into the HTML panel. It needs no imports and no assets.
Companion usage example: `rollTable = {import:roll-table-plugin}`, `dice = {import:dice-plugin}`.

# consumable-leaf-list-plugin — complete source & asset package

A single-file Perchance plugin generator. There is **no build pipeline, no npm
dependency, no binary asset, no shader/audio/model/JSON data** — the entire
project is the two Perchance files below. This package therefore contains the
literal, byte-exact source of everything the generator uses or references.

## Contents

| # | Category | Path | Notes |
|---|----------|------|-------|
| 1 | Internal code | `01-internal-code/main.pjs` | Plugin definition (`$output` list function) |
| 1 | Internal code | `01-internal-code/index.html` | Plugin documentation page |
| 2 | External code | `02-external-code/select-leaf-plugin/{main.pjs,index.html}` | Referenced plugin (conceptual prerequisite) |
| 2 | External code | `02-external-code/consumable-leaf-list-plugin-example/{main.pjs,index.html}` | The working example generator linked from the docs page |
| 3 | Third-party assets | — | **none** |
| 4 | Project resources | — | **none** |
| 5 | Build/config | — | **none** (Perchance generators are built by the platform engine) |

## Dependency graph

```
consumable-leaf-list-plugin      (this project)
  ├─ no {import:...} statements — fully self-contained
  └─ doc links out to:
       select-leaf-plugin               (conceptual explanation of "leaf")
       consumable-leaf-list-plugin-example  ({import:consumable-leaf-list-plugin})  ← consumes this plugin
```

## Usage

In a Perchance generator's code panel:

```
consumableLeafList = {import:consumable-leaf-list-plugin}
```

```
output
  [l = consumableLeafList(myList)] [l] [l]
```

`myList` is any hierarchy (list with nested sub-items). The returned object
supports `selectOne`, `selectMany(...)`, `selectAll`, `getLength`,
`isLeaf(item)`, `leafCount`, `list`, `leaves`, `consumedLeaves`,
`exhaustedBranches`, plus `toString`/`valueOf`. Each `selectOne` permanently
consumes a leaf, and branches whose leaves are all consumed become exhausted
(cascading exhaustion), so repeated selections yield *unique* leaves until the
list runs out (`"(error: no more items left in consumableLeafList)"`).

## Byte sizes

- main.pjs — 4608 chars
- index.html — 1479 chars

---
Full inline source of every file is in `SOURCE-DUMP.md`.

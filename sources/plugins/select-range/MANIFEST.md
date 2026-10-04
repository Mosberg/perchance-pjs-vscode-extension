# select-range-plugin — COMPLETE ASSET PACKAGE

Generator: https://perchance.org/select-range-plugin
Public iframe origin: https://87b459b3361f2cb103b8145aa32f0c51.perchance.org/select-range-plugin
Packaged: 2026-09-16

## What this project is
A perchance "plugin" generator: a single callable pjs function that selects an
inclusive range of items from a perchance list, with support for negative indices
(counting back from the end of the list), and the returned slice behaves like a
real perchance list (it has `selectOne`, and a `toString`), so it can be nested:
`[selectRange(selectRange(animal, 3, 9), 2, 4)]`.

Consumed by other generators as: `selectRange = {import:select-range-plugin}`

## Contents — everything, by category

### 01 / Internal code (the shipped generator) — 2 files
| File | Lines | Bytes | SHA-256 |
|---|---|---|---|
| internal-code/main.pjs  | 29 | 736 | 9199edda58715a3cd0c54d7a141050aa9b394ad869b72dbcb694b179cdb2ce4c |
| internal-code/index.html | 55 | 2561 | aeedbf80129c3687ecad74d04066c1f2a7d1a2b9f4a9813a0e145595a95123aa |

- `main.pjs` — the entire plugin: `$output (list, start, end) =>` … slice logic +
  list-like `toString` shim. This IS the artifact that importers receive.
- `index.html` — the generator's public documentation page (usage examples,
  negative-index table, notes, styling).

### 02 / External code (third-party libs, modules, tools) — NONE
See `external-code/README.md`. Zero imports, zero CDN scripts, zero npm deps.
Only the perchance engine and standard browser JS are used.

### 03 / Third-party assets (images/audio/models/shaders/anims/data) — NONE
See `project-assets/README.md`. There is not a single binary asset in this project.

### 04 / Project resources — NONE beyond the above
No src/ tree, no fonts, no data files, no prefabs, no UI assets.

### 05 / Build & config files — NONE
See `build-config/README.md`. No build step, no package.json, no config files.
(`workspace-config/AGENTS.md` is the editor's agent-instruction file, not part of
the generator.)

## Complete file tree of the generator itself (unzipped)

```
select-range-plugin/
├── main.pjs      <-- all executable code (736 bytes)
└── index.html    <-- all markup/style/docs (2561 bytes)
```

That is the whole project. 100% of it is present in this zip; nothing is
referenced that is not included here, and nothing included here is unused.

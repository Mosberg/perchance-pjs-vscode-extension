# select-all-leaves-plugin — Complete Source Package

Generator: https://perchance.org/select-all-leaves-plugin
Public subdomain (at time of export): https://acd681bd1e015a46e8a9e076f6317363.perchance.org/select-all-leaves-plugin

A Perchance plugin: given a hierarchical list, returns a list containing ALL of its
"leaf" items (items with no children), preserving top-to-bottom order. The returned
array behaves like a normal list (supports .selectOne, .selectMany(...), .selectAll,
.getLength, and stringification).

## Package contents

```
01-internal-code/            The generator's own code
  main.pjs                   The plugin function ($output)
  index.html                 The generator's page (body contents)
02-external-code/            (empty — this generator imports NO plugins/modules)
03-third-party-assets/       (empty — no images/audio/models/fonts/etc.)
04-project-resources/        Referenced material
  referenced-generators/
    select-leaf-plugin/           Sibling plugin (linked from docs)
    consumable-leaf-list-plugin/  Sibling plugin (linked from docs)
    select-all-leaves-plugin-example/ Working usage example
05-build-config/             Workspace / tooling config
  AGENTS.md                  Environment instructions (not part of the generator)
```

## What this project actually is

This is a single-file Perchance plugin. There is:

- NO build pipeline, bundler, package.json, or compile step.
- NO external dependencies — `main.pjs` contains no `{import:...}` lines.
- NO third-party assets — no images, audio, video, models, shaders, fonts, or JSON data.
- NO `src/` file tree.

Everything the generator ships is exactly two files: `main.pjs` and `index.html`.

## How the plugin works (main.pjs)

1. Guard: if no list is passed, return an error string.
2. `isLeaf(node)` -> a node is a leaf when it has no own keys.
3. Start with a copy of the list's first-level items (`[...list.selectAll]`).
4. Walk the array; whenever a non-leaf is found, splice in its children in place and
   step back one index. Because `leaves` grows during iteration, `leaves.length` is
   deliberately NOT cached. Splicing in place preserves top-to-bottom leaf order.
5. Attach a `toString` so the returned array stringifies by selecting one item
   (matching normal Perchance list behavior), then return it.

## Usage

Perchance code panel:
```
selectAllLeaves = {import:select-all-leaves-plugin}

myList
  a
  b
    c
    d

output
  [l = selectAllLeaves(myList)] [l] [l]  // picks random leaves
```

Count leaves:
```
output
  myList has [selectAllLeaves(myList).getLength] leaves.
```

## Licensing / provenance

The generator and its two sibling plugins were authored by the Perchance user
account that owns `select-all-leaves-plugin`. The copies under
`04-project-resources/referenced-generators/` are included for completeness as
they are referenced by the docs — they are independent generators, not build inputs.

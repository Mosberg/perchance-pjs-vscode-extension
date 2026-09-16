# select-leaf-plugin — Complete Source Package

Generated for full asset/code access. This package contains **100% of the project's
source and assets** — verified against the generator workspace (total project size: 2940 bytes).

## What this project is
A Perchance **plugin** generator (published at https://perchance.org/select-leaf-plugin).
It exports a single function that walks a list hierarchy until it reaches a "leaf"
node — an item with no sub-items — and returns it. Registered via `$output`.

Public page: https://perchance.org/select-leaf-plugin
Usage: `selectLeaf = {import:select-leaf-plugin}` then `[selectLeaf(myList)]`

## Package contents, by category

### 1. Internal code (first-party, written for this project)
| File | Bytes | Purpose |
|---|---|---|
| `internal-code/main.pjs` | 653 | The plugin function itself (`$output`), all logic |
| `internal-code/index.html` | 2287 | Plugin documentation/landing page markup + inline styles |

There are exactly two internal source files. No other first-party code exists.

### 2. External code (dependencies / imports)
**None.** `main.pjs` contains zero `{import:...}` statements. This plugin has no
runtime dependencies, no imported generators, no npm/CDN modules, and no bundled libraries.

### 3. Third-party assets
**None.** No images, audio, video, fonts, models, shaders, animations, sprites, or
textures are used, referenced, generated, or shipped by this project.

### 4. Project resources (data / config / build)
**None.** No JSON data files, no prefabs/templates, no build pipeline, no bundler config,
no package.json/tsconfig, no CI, no `src/` file tree, no service worker, no environment files.

### 5. External references (hyperlinks only — NOT shipped assets)
These are documentation links in `index.html`. They are plain `<a href>` anchors to other
Perchance pages; no code or asset is fetched from them at runtime:
- https://perchance.org/select-leaf-plugin-example   (usage example generator)
- https://perchance.org/select-leaves-plugin         (sibling plugin: several leaves)
- https://perchance.org/consumable-leaf-list-plugin  (sibling plugin: consumableList of leaves)
- https://perchance.org/plugins                      (plugin directory)

## Platform runtime (provided by the host, not part of this project)
The Perchance engine renders `main.pjs` and injects `index.html` into a wrapped
`<html><body>`. `index.html` is the *contents of <body> only*. No build step occurs
server-side — the platform serves these files directly.

## How the plugin works
```js
$output (list) =>
  if(!list) return "(no list given to selectLeaf plugin)";
  let leaf = list;
  let i = 0;
  let result;
  while(1) {
    i++;
    if(i > 10000) { return "(error in select-leaf-plugin: infinite loop encountered?)"; }
    result = leaf.selectOne;
    if(typeof result === "string" || Object.keys(result).length === 0) {
      return result;
    }
    leaf = result;
  }
```

All credits/attribution: original author of the Perchance generator of the same name.

## Integrity
See `MANIFEST.json` for SHA-256 hashes and byte sizes of every file in this package.

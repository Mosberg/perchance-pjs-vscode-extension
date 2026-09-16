# nested-plugin — complete project export

Perchance generator: **nested-plugin** (https://perchance.org/nested-plugin)
Public id: 55c8c065d32c1699783fe682490d194f

`nested-plugin` renders a Perchance list-tree as an interactive, collapsible
"nested world" (Orteil's *Nested* style). It is a single-generator plugin: the
whole thing is `main.pjs` + `index.html`, with no imports, no build step and
no bundled dependencies. Everything below is byte-identical to what runs on the
live page.

## Categories

### 1. Internal code (project source)
| file | role |
|---|---|
| `internal-code/main.pjs` | All engine code: \`$output(node)\` (entry point, called as \`[nested(world)]\` / \`[$output(world)]\`), the click handler, the item/body/header renderers, the default CSS injector, and the example `world` list-tree used by the demo. |
| `internal-code/index.html` | The <body> markup: title, prose documentation, syntax-highlighted usage example, the live demo mount `<div>[$output(world)]</div>`, and the plugin's own <style> block. |

There are no other internal files: no `src/` tree, no modules, no tests.

### 2. External code (libraries / imports / CDNs)
**None.** No `{import:...}` statements, no `<script src>` of library code, no
npm/CDN modules. The only externally-served JS in the live page is the Perchance
engine itself (`https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js`),
which is platform infrastructure, not project code. There is no build pipeline
and no dependency manifest — see `build-config/DEPENDENCIES.md`.

### 3. Third-party assets
| file | original URL | used for |
|---|---|---|
| `third-party-assets/alpine-forest-picture.png` | https://i.imgur.com/0Xy40ze.png | The <img> hotlinked inside the `alpine_forest` `description` in main.pjs — the only asset the running generator actually loads. |
| `third-party-assets/desert-region-picture.jpg` | https://i.imgur.com/B34FLcF.jpg | Referenced in the `index.html` documentation example (shown as escaped screenshot text, not loaded by the page). |

Both are Imgur-hosted and are third-party content; they are vendored here for
completeness/archival only.

### 4. Project resources (data / content)
| file | notes |
|---|---|
| `project-resources/world-lists.pjs` | The runtime content model — the `world` → `continent` → `desert_region` / `mountain_range` → `alpine_forest` list-tree, with `n = {min-max}` child-count budgets, per-item quantities like `mountain_range {1-3}`, `name = {...}` alternatives and `description = {...}` strings. |
| `project-resources/DATA-MODEL.md` | Prose description of the node schema the renderer consumes. |

`world-lists.pjs` is an exact excerpt of the trailing section of
`internal-code/main.pjs` — included separately because it is the part a user
edits; the authoritative copy is always main.pjs.

### 5. Build / config files
There are none. `build-config/DEPENDENCIES.md` records that fact explicitly
(no package.json, no bundler, no `$meta` block, no CI). The generator is
source-served: main.pjs and index.html are evaluated directly by the Perchance
engine on page load.

## Rebuilding / running
Nothing to build. To run locally, create a Perchance generator and paste
`internal-code/main.pjs` into the code panel and `internal-code/index.html`
into the HTML panel (index.html is <body>-contents only). To use it from another
generator: `nested = {import:nested-plugin}` then `[nested(world)]`.

## How the renderer works (short version)
- `$output(node)` resolves `node.getParent` to the list root, stashes the click
  handler + root on \`window\` under namespaced globals, injects the default CSS
  once, and returns the container markup.
- `generateItemBody(archetypeId)` reads `n` (overall child count) and each child's
  `{n}` / `{min-max}` quantity, expands the specified-quantity children first, then
  fills remaining budget with random children (`selectOne`), falling back to a
  sensible default of 5–10 items when nothing is specified.
- `generateItem(archetypeId)` / `generateItemHeader` / `headerElementClickHandler`
  render collapsible rows (➕/➖), lazily building a body on first expand, and put
  the node's `description` in the header tooltip.
- Leaves (no children) render dimmed; leaves that have only a `description` render
  their description inline when unfolded.

## Files in this package
See `MANIFEST.json` for every file with byte size and SHA-256.

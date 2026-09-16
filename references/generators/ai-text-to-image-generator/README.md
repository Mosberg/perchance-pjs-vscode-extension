# Full source & asset package — `ai-text-to-image-generator`

Live generator: https://perchance.org/ai-text-to-image-generator (saved, public)
Complete dump of every file that exists in the generator workspace, plus the transitive source of every `{import:...}` dependency, plus every referenced asset. Nothing summarised or trimmed.

## Contents

| Folder | Category | What's in it |
|---|---|---|
| `01-internal-code/` | Internal code (the generator itself) | `main.pjs` (all lists/settings/data/logic), `index.html` |
| `02-external-code/` | External / third-party code (perchance plugin sources) | 16 imported generator sources, byte-exact |
| `03-assets/` | Assets | `meta-image.jpeg` — the image referenced by `$meta.image` |
| `04-config/` | Configuration | `metadata.txt` (`$meta` block), `dependency-graph.json` (import graph + upstream URLs) |
| `05-inventory/` | Inventory | `manifest.json` with size/line-count/SHA-256 for every file |

## 01 — Internal code

| File | Bytes | Lines | SHA-256 |
|---|---|---|---|
| `main.pjs` | 86.413 | 1770 | `1f807f6e4988023a…` |
| `index.html` | 392 | 10 | `d594f990a170fe88…` |

- `index.html` (392 bytes) is 100% generated markup: its body is the single pjs expression `[generateInterfaceHTML(settings)]`.
- `main.pjs` (86.413 bytes) holds `$meta`, the `settings` tree (pageTitle, introMessage, imageOptions, userInputs incl. scratchpad/description/artStyle/shape/numImages, imageButtons, social features), the `artStyle.options` list with all style prompts + negatives, and the custom random-description lists.
- Direct `{import:...}` references: `t2i-framework-plugin-v2`, `t2i-styles`, `huge-emoji-list`, `animal` (the rest of the graph is transitive).

## 02 — External code (perchance plugin sources)

Every file below is the exact source the engine loads for the corresponding `{import:name}`. Upstream editable URLs are `https://perchance.org/<name>#edit`.

| File | Bytes | Lines | SHA-256 |
|---|---|---|---|
| `upload-plugin/main.pjs` | 10.271 | 237 | `ebe4e080acb958f0…` |
| `text-to-image-plugin/main.pjs` | 37.978 | 772 | `9245fbf9b4041da7…` |
| `tabbed-comments-plugin-v1/main.pjs` | 64.046 | 1296 | `462a464e90013bf5…` |
| `t2i-styles/main.pjs` | 43.838 | 532 | `9547582cd388a614…` |
| `t2i-framework-plugin-v2/main.pjs` | 127.030 | 2203 | `4ed30e2ba13bcd27…` |
| `super-fetch-plugin/main.pjs` | 2.857 | 46 | `3becd031accfdc0d…` |
| `simple-gen-footer/main.pjs` | 520 | 4 | `ac94e344fbba297f…` |
| `select-leaf-plugin/main.pjs` | 653 | 21 | `98c736212e5d07f1…` |
| `prompt2-plugin/main.pjs` | 14.632 | 279 | `ca6d03d9283871ae…` |
| `kv-plugin/main.pjs` | 4.177 | 46 | `a5edb7f5bf28ab5f…` |
| `huge-emoji-list/main.pjs` | 513 | 8 | `f856329fd461e334…` |
| `fullscreen-button-plugin/main.pjs` | 1.916 | 29 | `4686fd38f3d7fdd6…` |
| `create-media-gallery-plugin/main.pjs` | 26.229 | 567 | `b25c56ee25e9ed49…` |
| `comments-plugin/main.pjs` | 38.261 | 680 | `4b20ff48b15882e1…` |
| `animal/main.pjs` | 2.091 | 189 | `c4e9954357007f03…` |
| `ai-text-plugin/main.pjs` | 58.048 | 804 | `f57d9efbf330aef1…` |

```
dependency graph (as resolved by the engine)
  main.pjs ──┬─ t2i-framework-plugin-v2 ─┬─ text-to-image-plugin
             │                          ├─ comments-plugin ── huge-emoji-list
             │                          ├─ tabbed-comments-plugin-v1 ─┬─ comments-plugin
             │                          │                             ├─ ai-text-plugin
             │                          │                             └─ huge-emoji-list
             │                          ├─ create-media-gallery-plugin ─┬─ kv-plugin
             │                          │                               └─ super-fetch-plugin
             │                          ├─ select-leaf-plugin
             │                          ├─ fullscreen-button-plugin
             │                          ├─ ai-text-plugin
             │                          ├─ upload-plugin
             │                          ├─ prompt2-plugin
             │                          └─ t2i-styles
             ├─ t2i-styles
             ├─ huge-emoji-list
             └─ animal ── simple-gen-footer
```

## 03 — Assets

| File | Bytes | Role |
|---|---|---|
| `03-assets/meta-image.jpeg` | 122,178 | `$meta.image` — the social-card / generator-listing image |

No other binary assets exist: all imagery in the running app is produced at runtime by the text-to-image model (the plugin's own remote inference endpoint), and all icons/CSS are inline SVG/CSS strings inside the plugin sources above.

## 04 — Build / config files

There is no npm/rollup/webpack/vite pipeline and no lockfile. The "build" is the perchance engine's render step:

1. Engine parses `main.pjs` → builds the list tree (`settings`, `userInputs`, `artStyle`, `$meta`, …) and hoists the imported plugin functions (`generateInterfaceHTML`, `generateText`, …) onto `root`.
2. Engine evaluates `index.html`'s pjs expressions → calls `generateInterfaceHTML(settings)`.
3. That framework source (`02-external-code/imports/t2i-framework-plugin-v2/main.pjs`) returns the full HTML/CSS/JS document body that you see in the preview, wiring each `userInputs` entry to a DOM control and each generated image to `text-to-image-plugin`.
4. `$meta` (see `04-config/metadata.txt`) supplies title/description/image for SEO + social cards.

## Reproduce / re-import

Drop `01-internal-code/main.pjs` and `01-internal-code/index.html` into a new perchance generator's two editor panels and it will fetch the same `02-external-code` dependencies from perchance.org by name. To pin them instead of tracking upstream, rename each `{import:x}` to `{import:<your-fork>}` and paste the corresponding bundled `main.pjs` into that fork.

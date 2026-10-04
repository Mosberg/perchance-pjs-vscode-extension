# Dependencies (complete)

## Declared `{import:...}` dependencies
NONE. `main.pjs` contains no import declarations. Contents are self-contained:
- `$output(lockerName, value)` — the locker implementation (plain JS, no imports)
- lists `animal` and `letterPair`
- `letterPair` uses the engine builtin `{A-Z}` character-range syntax (not a dependency)
Importing `locker-plugin` from `locker-plugin` would be self-referential.

## Runtime-provided code (cannot be vendored — it is the host platform)
| Asset | URL | Role |
|---|---|---|
| Perchance engine | https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js | DSL parser/renderer, list-tree API, global `update()`, `PERCH` object. Loaded by the platform into the generator iframe. |
| Cloudflare Insights beacon | https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495 | Host analytics, auto-injected. |

Byte-for-byte copies live in `../02-external-code/`.

## Globals used by this project's code
| Global | Provided by | Used in |
|---|---|---|
| `$output` (locker function) | this generator, main.pjs | all locker calls |
| `root.lockerPluginOpts` | this generator, main.pjs | custom icon initialization |
| `window.__63456lockablePluginIdMap` | created at runtime by main.pjs | locker state map |
| `update(el)` | Perchance engine | `onclick="update(example1)"`, `update(example2)` in index.html |
| `selectOne`, `evaluateItem` | Perchance engine node API | demo examples in index.html |

## Images / fonts / audio / models / shaders / JSON data
NONE. The page loads zero images, webfonts, stylesheets, audio, 3D models or data files.
Icons are emoji glyphs hard-coded in `main.pjs` (`🔐` / `🔓`); all styling is the inline
`<style>` block at the end of `index.html`. Only external network requests made by the
page are the two files listed above plus the platform's own API endpoints
(`/api/securityData`, cache-check endpoint).

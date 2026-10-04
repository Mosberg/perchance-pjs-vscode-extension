# Asset inventory — random-select-plugin

Every asset the project uses, by category. Nothing is omitted; this is the complete set.

## 1. Internal / own code
| File | Role | Bytes |
|---|---|---|
| main.pjs | Plugin implementation (Perchance-js). Defines the `$output(...argItems)` function that the import resolves to. Contains the weighted random-selection algorithm. | 1336 |
| index.html | Documentation / landing page markup + inline <style> block. | 2939 |

## 2. External code (libraries, modules, tools, CDNs, npm)
NONE. No `{import:...}` lines in main.pjs; no <script src> tags in index.html;
no CDN modules; no package.json / bundler / build pipeline.

## 3. Third-party assets (images, audio, models, shaders, animations, fonts, JSON data)
NONE. The page uses only browser-default fonts and inline CSS colors.

## 4. Project resources / data files
NONE. No `src/` tree, no JSON, no prefabs, no templates.

## 5. Build / configuration
NONE. Perchance generators have no build or config files. Optional platform-level
`$meta` block (title/description/image/tags) is NOT present in this generator's
main.pjs.

## 6. Outbound hyperlinks present in index.html (not assets — external references)
| URL | Purpose in page |
|---|---|
| https://perchance.org/random-select-plugin-example#edit | "Here's an example generator" |
| https://www.reddit.com/r/perchance/comments/n2rqp9/properties_not_accessible_from_inside_a_variable/ | Origin story / forum thread |
| /plugins | "Check out more plugins at perchance.org/plugins" |

## 7. Runtime platform dependencies (provided by perchance, not bundled)
- Perchance engine itself (renders main.pjs + index.html).
- Browser globals used: Math.random.

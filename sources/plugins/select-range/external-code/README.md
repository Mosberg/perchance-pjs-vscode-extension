# 02 — External Code (third-party libraries / modules / tools)

**Inventory: none. This generator has zero external code dependencies.**

`main.pjs` contains no `{import:...}` statements, and `index.html` loads no
`<script src>`, no ES modules, no CDN bundles, no npm packages. There is nothing
to vendor, bundle, or host.

## Platform runtime it relies on (not a project file — provided by perchance)

| Provided by | Item | Used in | What it does |
|---|---|---|---|
| perchance engine | pjs list engine (`list.selectAll`, `.selectOne`, `this`) | main.pjs | evaluates the user's list into an array of item objects |
| perchance engine | `$output` assignment | main.pjs | exports the function so `{import:select-range-plugin}` yields it |
| perchance engine | JS-in-square-brackets templating | index.html | renders `[selectRange(...)]` inside the page |
| browser | `Array.prototype.slice` | main.pjs | the actual range selection |
| browser | `<style>` / inline CSS | index.html | documentation page styling |

To re-derive the source of the perchance engine itself: it is not open source and is
not shipped with this package. The generator's public source is always reachable at
`https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=select-range-plugin`.

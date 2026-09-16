# External code / dependencies

**None.** This generator has zero bundled third-party libraries and zero imports.

* `main.pjs` declares no `{import:...}` lines, so there is no `imports/` tree to ship.
* All code that executes on the page is the two files in `internal-code/`.
* The only external code is the **Perchance engine itself** (hosted at perchance.org),
  which parses main.pjs, evaluates `[...]` square-block templates, and exposes the
  platform globals used here:

  | Global / feature | Used for |
  |---|---|
  | `$output (list, font, size, color) =>` list-function syntax | the plugin's public entry point; importing this generator yields the function |
  | `window.generatorName` / `window.generatorPublicId` | set by the platform, not referenced directly by this generator |
  | `document.body` / `HTMLElement` | the `list` argument may be the body, an element, a string, or `null` |

* Rendering/CDN dependencies of the external assets are listed in
  `../third-party-assets/fonts/SOURCES.txt`.

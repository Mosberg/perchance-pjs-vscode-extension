# 05 - Build pipeline & configuration

## There is no build step for this generator

No package.json, no lockfile, no bundler config, no CI, no preprocessor directives
(`$preprocess`), no `$meta` block, and no environment/secret configuration. A Perchance
generator is *read*, not built:

```
perchance.org/tldraw-plugin
  -> top-level page (platform chrome, SEO, social card)
     -> iframe: https://<generatorPublicId>.perchance.org/tldraw-plugin
        -> platform injects the engine  (02-external-code/perchance-engine-*.js)
        -> engine parses main.pjs -> list tree on `root` + globals
        -> engine renders index.html (square blocks evaluated first)
        -> engine appends index.html to <body>
        -> engine executes <script> tags in document order
     -> the plugin then lazily creates its own nested iframe to www.tldraw.com
```

The ones that matter:
- `main.pjs` is implicitly loaded before index.html and its top-level names become globals.
- Square blocks (like `[$output()]`) evaluate BEFORE any <script> in the same document.
- Main file edits only reach the live page on reload (the editor's live preview does this).
- If a generator has NOT been saved yet (`window.generatorIsUnsaved === true`), the
  platform runs it under a temporary public id; the tldraw room URL embeds
  `window.generatorName`, so renaming or forking a generator yields a DIFFERENT room and
  therefore a blank canvas. This is the single most surprising runtime behavior in this
  project - and the reason the room path is built from window.generatorName rather than a
  hardcoded string.

## How THIS package was produced (reproducible)

1. Enumerate the workspace; confirm the only project files are main.pjs + index.html
   (AGENTS.md is harness guidance, filed under 06 - it is never loaded by the page).
2. Read the live page's resource timings to enumerate external code, then fetch each
   URL byte-exact:
   - https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
   - https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495
   - https://www.tldraw.com/r/perchance-aUf8Njeo73-tldraw-plugin-general  (shell HTML)
3. Copy main.pjs and index.html verbatim.
4. Extract the inlined Font Awesome path from main.pjs into a standalone SVG.
5. SHA-256 every file into MANIFEST.json, then zip the tree (deflate, level 9).

The zip is a pure repackaging - no file inside it has been reformatted, minified, or
rewritten from the originals.
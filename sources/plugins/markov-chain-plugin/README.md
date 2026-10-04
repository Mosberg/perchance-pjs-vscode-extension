# markov-chain-plugin — complete source & asset export

Exported from the live Perchance generator `markov-chain-plugin`
(origin `b1386abe43c6af25bf67318165c6f386`).

This archive is a byte-exact snapshot of everything the generator ships.
Nothing else exists in the project — there are no other scripts, no build
pipeline, no bundler config, no npm dependencies, no external images, audio,
models or shaders. See MANIFEST.md for the full inventory and provenance.

## What this generator is
The Perchance **Markov Chain plugin** (experimental). The page trains a Markov
chain on a body of text pasted by the user, then emits a compressed model
(LZString + base64) plus a one-line snippet the user pastes into their own
generator. `main.pjs` exposes `$output(dataStr, length)`, which decompresses
such a model and generates `length` characters from it.

## Directory layout
```
internal-code/          Code written for this project
  main.pjs                the `$output` function = the plugin's runtime
  index.html              the whole UI page (markup + CSS + training script)
  decomposed/             the same index.html split into its parts, for reading
    index.inline-script.js   the page's <script> (model training + codegen)
    index.styles.css         both <style> blocks concatenated
    index.module-no-lzstring.js  the script with the vendored LZString removed

external-code/          Third-party code vendored into the project
  lz-string/
    lz-string.as-vendored-in-this-project.js   exact copy embedded in main.pjs
                                               and index.html (byte-identical)
    lz-string.1.4.4.min.js                     the same, with the upstream UMD
                                               tail restored
    upstream-reference/                        pristine upstream builds for diffing
    LICENSE.txt                                MIT (c) 2013 Pieroxy
    README.upstream.md                         upstream readme

third-party-assets/     Third-party binary assets
  fonts/
    AdobeBlank-Regular.otf           the @font-face "NotDef" font, decoded
    LICENSE-OFL-1.1.txt              SIL OFL 1.1
    font-license-notices.txt         copyright/name-table provenance
    README.adobe-blank.md            upstream readme

project-resources/      Project data & copy
  data/sample-corpus-alice-in-wonderland.txt   the default training corpus
                                               baked into the page (142,844 bytes;
                                               public domain, Lewis Carroll)
  ui-copy/page-text.txt                every user-visible string on the page,
                                       with script/style/data-URI blobs removed

build-config/           Build & configuration files  -- see build-config/README.md
```

## Dependencies
| Dependency | Version | Where it lives | License |
|---|---|---|---|
| lz-string | 1.4.4 (UMD tail stripped) | inlined in `main.pjs` **and** `index.html` | MIT |
| Adobe Blank | 1.045 | base64 `@font-face` data URI in `index.html` | SIL OFL 1.1 |

Both are **inlined into the shipped files** — the generator loads no external
JS, CSS, font, image or network resource at runtime. It makes zero network
requests and imports zero Perchance plugins.

## Runtime dependencies of the page
- `$output(dataStr, length)` from `main.pjs` (a top-level Perchance function).
- `LZString` (global, from the inline script) — used by both `$output` and the
  page's `updateMarkovModelBegin()` to (de)compress models.

## Rebuilding / re-vendoring
There is nothing to build. To update the LZString copy, replace the
`var LZString=function(){...}();` statement in *both* `main.pjs` and
`index.html` with a new build (strip the trailing UMD boilerplate for
`main.pjs`, as the original does). To change the font, regenerate the base64
data URI and swap the `url(...)` in the `@font-face` rule.

Generated 2026-09-16.

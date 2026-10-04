# Provenance - marked bundle (marked.bundle.min.js)

- File: marked.bundle.min.js (41,791 bytes, one minified IIFE line).
- Origin: extracted byte-exact from 01-internal-code/main.pjs, from the inline statement
  const marked = (() => { var __docsMarkedBundle=(()=>{ ... })(); return __docsMarkedBundle.marked; })();
- Upstream package: marked (npm), https://www.npmjs.com/package/marked - MIT licensed (see LICENSE.md).
- Bundle shape: IIFE assigning the global __docsMarkedBundle, produced by esbuild-style bundling
  (format=iife, globalName=__docsMarkedBundle, minify). API exposed on the object: Hooks, Lexer, Marked,
  Parser, Renderer, TextRenderer, Tokenizer, defaults, getDefaults, lexer, marked, options, parse,
  parseInline, parser, setOptions, use, walkTokens.

## Exact version note

Because the artifact is minified, the upstream version cannot be proven byte-by-byte from this file alone.
A feature probe of the bundle (all present: TextRenderer, processAllTokens, provideLexer, provideParser,
passThroughHooks, walkTokens) matches marked >= 14.1.x and is consistent with the marked 14.1-16.x line.
upstream-reference/marked.esm.js is the unminified ESM build of marked 16.2.1, included FOR REFERENCE ONLY -
it is not verified to be the version that was bundled.

## Reproduce

Re-extract the shipped bytes:

```sh
node 05-build-config/tools/extract-marked-bundle.mjs
```

Rebuild from npm (content-equivalent, not guaranteed byte-identical):

```sh
node 05-build-config/tools/rebuild-marked-bundle.mjs
```
# External code (dependencies)

Third-party code this project depends on. Nothing here was written for this project.

## Loaded at runtime (by index.html, from a CDN)

~~~html
<script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
~~~

| copy in this folder | resolves to | bytes | licence |
|---|---|---|---|
| react-17.0.2/react.production.min.js | React 17.0.2 UMD production build | 11,440 | MIT (Meta) |
| react-dom-17.0.2/react-dom.production.min.js | ReactDOM 17.0.2 UMD production build | 120,585 | MIT (Meta) |

These are byte-exact downloads of the URLs above (fetched at export time; the `@17` tag is a
floating major version, so a future `@17` fetch could in principle differ — 17.0.2 is the last
17.x release).

## Vendored inside main.pjs (inlined so the plugin is self-contained)

| copy in this folder | origin | bytes | how it got in |
|---|---|---|---|
| avataaars-1.2.1/avataaars.bundle.js | https://cdn.skypack.dev/avataaars, "deno bundle" output | 522,891 | extracted from main.pjs byte offset 133,433..656,390, de-indented by the 2 spaces of pjs function-body indentation |

The avataaars bundle is a single rolled-up ESM module (System.register wrapper) containing:
- avataaars 1.2.1 React components (`Avatar`) — **and all of the avatar artwork as inline SVG**
- lodash internals
- a prop-types 15.7.2 shim

Its registered module id is visible in the bundle text:
    System.register("-/avataaars@v1.2.1-Ng4X1ToRgd9IXKpeHJni/dist=es2020,mode=imports/optimized/avataaars", ...)

### React/ReactDOM: vendored vs upstream

The copies inlined in main.pjs are **not byte-identical** to the unpkg downloads:

| | upstream (unpkg) | vendored (inside main.pjs) |
|---|---|---|
| react.production.min.js | 11,440 B | 11,070 B |
| react-dom.production.min.js | 120,585 B | 118,312 B |

Differences: the vendored copies have the `/** @license React v17.0.2 ... */` banner and some
inter-token whitespace stripped, and use a marginally different UMD wrapper. Version and
behaviour are the same (17.0.2). The vendored copies are the authoritative ones as far as the
shipped generator is concerned — the upstream copies are provided so you can diff/inspect.

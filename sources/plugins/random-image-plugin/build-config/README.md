# Build & configuration files

## Summary

**There is no build step, bundler, transpiler, package manager, or config file in this project.**

| Expected item | Present? | Notes |
|---|---|---|
| `package.json` / lockfile | no | no npm dependencies |
| bundler config (webpack/rollup/vite/esbuild) | no | nothing to bundle - one `.pjs` + one `.html` |
| `tsconfig.json` | no | sources are plain JS / pjs |
| linter/formatter config | no | - |
| `.env` / secrets | no | the plugin needs no API key and holds no credentials |
| CI workflow | no | publish is a manual Save in the Perchance editor |
| `$meta` block | no | `main.pjs` declares no `$meta`, so the platform derives title/description from the page content |
| service worker / `src/` tree | no | the project has no `src/` directory; both source files are top-level |

## The actual 'build pipeline'

```
edit main.pjs / index.html in the Perchance editor
                 |
                 v
      (implicit) engine render + concatenate
                 |
                 v
   live preview  https://<publicId>.perchance.org/random-image-plugin
                 |
                 v
        Save ->  https://perchance.org/random-image-plugin
```

### How the two source files combine

1. `main.pjs` is parsed as the pjs list tree. Its top-level nodes become properties of `root`
   and become bare globals inside inline classic `<script>` tags in `index.html`.
2. `index.html` is inserted as the document `<body>` (the engine wraps it in `<html>`/`<body>`;
   no `<html>`, `<head>`, or `<body>` tags appear in the source file).
3. The engine evaluates square-bracket blocks in the HTML, then runs `<script>` tags, in order.
4. `$output(topic, width, height, contain) =>` in `main.pjs` has a special meaning: it declares
   the value an importer receives from `{import:random-image-plugin}`. That value is a function,
   which is why consumers can call `image(\"cat\")` from their own HTML.

## Deployment coordinates

| Field | Value |
|---|---|
| Generator name | `random-image-plugin` |
| Public page | https://perchance.org/random-image-plugin |
| Runtime origin | `https://c79864f5da09bc756b7888f09b19a997.perchance.org/random-image-plugin` |
| Source files | `main.pjs`, `index.html` (no imports, no `src/`) |
| Last platform-registered edit | 1614186801777 (2021-02-24, UTC) |

## Reproducing this package

`tools/export-package.js` contains the exact script used to assemble this archive
(node-free: it runs against the Perchance agent workspace filesystem). Re-run it after any
source change to regenerate an up-to-date bundle.

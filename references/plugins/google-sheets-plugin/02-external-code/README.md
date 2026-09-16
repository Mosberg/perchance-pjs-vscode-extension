# 02 — External code

"External code" = code that the project depends on but does not own.

## 2.1 JS/TS libraries, CDN modules, npm packages, vendored scripts

**None.** This project loads no external JavaScript whatsoever. `main.pjs` uses only:

- `fetch()` (browser built-in)
- `Promise` / `Promise.all` (browser built-in)
- `console` (browser built-in)
- the Perchance engine's own list-node API (`desiredParentNode[listName] = [...]`)

There is no `package.json`, no bundler, no transpiler, no minifier, no test runner, no
lockfile. Nothing is downloaded at runtime except the Google Sheet TSV files themselves.

## 2.2 Perchance imports

The plugin itself declares **no** `{import:...}` lines. Consumers import *it*:

```
googleSheets = {import:google-sheets-plugin}
```

## 2.3 Referenced example generators (verbatim source included)

The docs page links to two other generators, which are also the canonical usage examples.
Their exact `main.pjs` + `index.html` are reproduced under `referenced-generators/`:

| Folder | Generator | URL |
|---|---|---|
| `referenced-generators/google-sheets-plugin-example/` | `google-sheets-plugin-example` | https://perchance.org/google-sheets-plugin-example |
| `referenced-generators/google-sheets-plugin-onload-example/` | `google-sheets-plugin-onload-example` | https://perchance.org/google-sheets-plugin-onload-example |

Both of those generators additionally import the platform list plugin
`animal = {import:animal}` (source not redistributed here — it lives at
https://perchance.org/animal and is a stock platform plugin).

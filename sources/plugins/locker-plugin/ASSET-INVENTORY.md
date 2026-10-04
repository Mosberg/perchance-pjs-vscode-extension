# locker-plugin — Asset Inventory

Exported: 2026-09-16T17:48:42.593Z

## 01-internal-code/ — the generator's own source
- `01-internal-code/main.pjs` — 1998 bytes — sha256 `f9fa54cf00ee7341…`
  - Perchance-JS generator code: $output(lockerName, value) locker implementation + example lists (animal, letterPair).
  - role: Generator source (root scope)
- `01-internal-code/index.html` — 7868 bytes — sha256 `c7a6aac9f985cb75…`
  - Generator HTML body: documentation page, two live demo examples, inline CSS. Uses platform-provided update() helper on the randomize buttons.
  - role: Generator source (page body)

## 02-external-code/ — third-party & platform code loaded at runtime
- `02-external-code/perchance-engine-491bf81418aa4b69.js` — 115369 bytes — sha256 `491bf81418aa4b69…`
  - Perchance runtime engine: DSL interpreter/renderer, list-tree node API (selectOne/evaluateItem), global update() and PERCH. Loaded by the platform into every generator; filename carries a content hash.
  - source: https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
  - role: Platform runtime (external code)
- `02-external-code/cloudflare-insights-beacon.min.js` — 30294 bytes — sha256 `08c4fd72f9d96a7a…`
  - Cloudflare Web Analytics beacon auto-injected by the host in production; no effect on generator behaviour.
  - source: https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495
  - role: Platform analytics (external code)

## 03-project-resources/ — rendered/generated artifacts
- `03-project-resources/rendered-output.html` — 124623 bytes — sha256 `ebd73c1fc4449eb8…`
  - Fully rendered live DOM (document.documentElement.outerHTML) of the generator iframe after pjs evaluation + script execution.
  - role: Rendered artifact
- `03-project-resources/top-level-page.html` — 84820 bytes — sha256 `8176fc6d30d8d573…`
  - Top-level perchance.org wrapper page HTML (platform header/chrome + iframe embed markup).
  - source: https://perchance.org/locker-plugin
  - role: Rendered artifact
- `03-project-resources/screenshot.png` — 135109 bytes — sha256 `90bd9cb39670ccbf…`
  - Full-page screenshot of the rendered generator (live preview capture).
  - role: Rendered artifact

## 04-build-config/ — build & config files
- `BUILD.md` — build/deploy notes (no build step exists).
- `DEPENDENCIES.md` — complete dependency manifest.
- `MANIFEST.json` (package root) — machine-readable inventory of every file.
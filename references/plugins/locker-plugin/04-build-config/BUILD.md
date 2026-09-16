# Build & deploy

## Build
**None.** Perchance has no compile step: `main.pjs` is interpreted by the engine at load
time and `index.html` is injected into the page. There is no package manager, bundler,
transpiler, minifier, test runner, CI config, or `src/` tree in this project.

## Deploy
- Edit in the Perchance editor, then **Save** on `https://perchance.org/locker-plugin`.
  Page code runs in an iframe at `https://<generatorPublicId>.perchance.org/<generatorName>`;
  here that is `https://fa0a486a4faac1ab9b787095b27a3b17.perchance.org/locker-plugin`.
- Programmatic editing is possible through the platform HTTP API
  (`https://perchance.org/api/...`).
- The engine script URL is content-hashed (`perchance-engine-491bf81418aa4b69.js`), so a
  platform release changes the URL automatically; no client-side cache busting needed.

## Reproduce this package
1. `01-internal-code/main.pjs` and `01-internal-code/index.html` are the live generator
   source, copied verbatim.
2. `02-external-code/*` were fetched from the URLs in `DEPENDENCIES.md`.
3. `03-project-resources/rendered-output.html` = `document.documentElement.outerHTML` of
   the live generator iframe.
4. `03-project-resources/top-level-page.html` = raw HTML of `https://perchance.org/locker-plugin`.
5. `03-project-resources/screenshot.png` = full-page capture of the rendered generator.
6. SHA-256 of every file is recorded in `../MANIFEST.json`.

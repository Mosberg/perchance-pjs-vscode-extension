# build-config

None. There is no build pipeline, bundler, package.json, or toolchain.

The Perchance platform serves `main.pjs` + `index.html` directly:
- `main.pjs` is the perchance-js source (parsed into lists/functions at load).
- `index.html` is the page body.

Edits take effect on the next page load; there is no compile step.

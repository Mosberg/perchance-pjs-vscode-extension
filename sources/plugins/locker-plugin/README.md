# locker-plugin — Complete Project Asset Package

Generator: **locker-plugin** (`https://perchance.org/locker-plugin`)
Runtime origin: `https://fa0a486a4faac1ab9b787095b27a3b17.perchance.org/locker-plugin`
Exported: 2026-09-16T17:48:42.593Z
Platform: Perchance — a generator is `main.pjs` + `index.html`, hosted and rendered by the Perchance engine.

## What this project is
The **Locker Plugin**: a Perchance plugin providing `locker(name, value)` and
`locker(name_button)` primitives so a user can "freeze" a randomly generated value until
they unlock it. `main.pjs` implements the whole mechanism inside a `$output(...)`
function; `index.html` is the plugin's public documentation + live demo page.

## Package layout
```
01-internal-code/       The generator's own source (the only files that ship publicly)
02-external-code/       Third-party / platform code loaded at runtime (byte-exact copies)
03-project-resources/   Rendered output, wrapper page, screenshot (generated artifacts)
04-build-config/        Build + deployment notes, complete dependency manifest
ASSET-INVENTORY.md      Human-readable inventory with sizes + sha256
MANIFEST.json           Machine-readable inventory
README.md               This file
```

## Dependencies
**Zero `{import:...}` dependencies.** `main.pjs` declares no imports — the locker logic is
written from scratch here (this generator *is* `locker-plugin`, which other generators
import). The only external code executing on the page is the Perchance platform runtime
and the host's analytics beacon; see `04-build-config/DEPENDENCIES.md`.

## Build pipeline
None — Perchance is a zero-build platform: save in the editor and the code is live.
See `04-build-config/BUILD.md`.

## How to use these files
1. Create/open a Perchance generator.
2. Paste `01-internal-code/main.pjs` into the code panel and
   `01-internal-code/index.html` into the HTML panel.
3. Save. No compilation, bundling or npm install.

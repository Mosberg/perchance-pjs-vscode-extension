# Tornado Plugin 🌪 — Complete Source Package

Generated for the Perchance generator `tornado-plugin` (perchance.org/tornado-plugin).

## What this package contains

A complete, self-contained dump of every file that makes up the project, organized by category.
This generator is small: it is a *plugin* with NO external imports and NO binary assets.

| Category | Contents |
|---|---|
| 00-README | This file + MANIFEST.md |
| 01-internal-code | `main.pjs` (Perchance engine code) and `index.html` (page body) |
| 02-external-dependencies | (none — no `{import:...}` used) |
| 03-third-party-assets | (none — no images/audio/models/shaders/data) |
| 04-project-resources | (none — no `src/` runtime files) |
| 05-build-config | (none — Perchance has no build step) |

## How to run it

1. Create/open a generator at perchance.org and switch to the **Edit** tab.
2. Paste the contents of `01-internal-code/main.pjs` into the *Perchance code* panel.
3. Paste the contents of `01-internal-code/index.html` into the *HTML* panel.
4. Use it from another generator: `tornado = {import:tornado-plugin}`.

## License / credit

This is the stock Perchance plugin template ("Tornado Plugin"), used to demonstrate the plugin
system. It is provided as-is. No third-party libraries are bundled.

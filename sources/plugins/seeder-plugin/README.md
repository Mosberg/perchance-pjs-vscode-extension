# seeder-plugin — complete project package

Generator: https://perchance.org/seeder-plugin
Runtime origin: https://1ae4c164ffb6154da507e9757372bc71.perchance.org/seeder-plugin
Exported: 2026-09-16T17:26:47.920Z

This archive contains **everything** the generator is made of: 100% of its source
(there are only two source files), plus the source of every external dependency it
references. There are no binary assets, no build step, and no third-party libraries.

## Categories

| # | Category | Location | Contents |
|---|----------|----------|----------|
| 1 | Internal code | `01-internal-code/` | `main.pjs` + `index.html` — the entire generator |
| 2 | External code | `02-external-code/` | `url-params-plugin` source (the one optional dependency named in the docs) + platform engine URL |
| 3 | Third-party assets | `03-third-party-assets/` | NONE (empty — see README inside) |
| 4 | Project resources | `04-project-resources/` | NONE (empty — see README inside) |
| 5 | Build / config | `05-build-config/` | NONE (empty — see README inside) |

## 1. Internal code (the whole generator)

### `01-internal-code/main.pjs`
The seeder plugin itself. Defines a single pjs function node, `$output`, which is the
generator's default import target: it swaps `Math.random` for a seeded xfnv1a/mulberry32
PRNG derived from a seed string, caches PRNG instances per seed, and returns the current
`Math.random`. Commands: `"forceUpdate"` (re-seed even if the seed string is unchanged)
and `"cache"` (reuse a previously-created PRNG for that seed).

### `01-internal-code/index.html`
The plugin's documentation page (headings, usage snippets, notes, styling).

## 2. External code

### `02-external-code/url-params-plugin/`
Source of `{import:url-params-plugin}`, which the docs recommend pairing with the seeder
plugin (e.g. `url = {import:url-params-plugin}` then `[seeder(url.seed)]`).
Not imported by this generator's own code — included for completeness because the page
links/documents it. Live at https://perchance.org/url-params-plugin

### `02-external-code/perchance-engine.txt`
The only script loaded at runtime: the Perchance engine itself (platform-provided, hosted
by Perchance — not bundled with this generator).

## 3. Third-party assets
None. The generator loads no images, audio, models, shaders, animations, JSON data,
prefabs, templates, fonts, or UI resources.

## 4. Project resources
None. No `src/` file tree exists — all logic lives in the two files above, which the
Perchance engine serves directly.

## 5. Build / config
None. No bundler, package.json, lockfile, CI config, or toolchain. Perchance's engine
evaluates `main.pjs` and injects `index.html` at runtime.

## Rebuild / reproduce
1. Create a generator on https://perchance.org (or open https://perchance.org/seeder-plugin#edit).
2. Paste `01-internal-code/main.pjs` into the lists/code panel.
3. Paste `01-internal-code/index.html` into the HTML panel.
4. Save. That is the entire reproducible build.

## Usage
```
seeder = {import:seeder-plugin}
```
```html
<input placeholder="Enter a seed..." oninput="seeder(this.value), update()">
```

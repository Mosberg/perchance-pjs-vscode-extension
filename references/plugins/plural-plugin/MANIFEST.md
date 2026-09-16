# MANIFEST

| Field | Value |
|-------|-------|
| Generator | `plural-plugin` |
| Public page | https://perchance.org/plural-plugin |
| Runtime iframe origin | `https://7c04e8eeb9761b097f2a2434504081f2.perchance.org/plural-plugin` |
| Export date | 2026-09-16 |
| Total first-party source | 11137 bytes across 2 files |
| Third-party dependencies | 1 (pluralize v8.0.0, MIT, vendored) |
| `{import:...}` plugins | 0 |
| Binary/assets | 0 |

## File index (SHA-256 of exact shipped bytes)

| File | Bytes | SHA-256 |
|------|-------|---------|
| `01-internal-code/main.pjs` | 8233 | `6bc7dc2f4b0c7971c9c545ed540e3396c47041ded870c40582822565ac6e09a2` |
| `01-internal-code/index.html` | 2904 | `085e67f555442cfcb027fb1953db5799bce70c9fc4620e0d52f2655faaa9b572` |
| `02-external-code/pluralize/pluralize.js` | 12618 | `9bf6ffd9399792e846298560533c359f9225117ef3f670891a9610f1d293635c` |
| `02-external-code/pluralize/pluralize.min.js` | 5878 | `485643b8028a87a7d3b766a42b44bc1f47a90b449fa72a68e71f3a392f2cfda2` |
| `02-external-code/pluralize/LICENSE` | 1103 | `5822e0d816e53e3537b306a4132cb7a70881897cf51bf483282148a602979076` |
| `02-external-code/pluralize/README.md` | 1791 | `652f55ae3b3ab06b9abdfc7f69b6a9e4abbce091ce88c2a6f534a0bdbb13989f` |
| `03-third-party-assets/README.md` | 396 | `3a87491e8fbfcc30c34e1055645929f2effacd198cb673f78ab3f863675c82a7` |
| `04-project-resources/README.md` | 396 | `3a87491e8fbfcc30c34e1055645929f2effacd198cb673f78ab3f863675c82a7` |
| `05-build-config/README.md` | 1207 | `c895505250d62abb440390623a7f7d77cd8c7e851963a04381aae6b9faa7a154` |
| `README.md` | 15389 | `3625e10d26ec2661a0626634e84afc5331237bf1088b39c8e61e812fad66e353` |
| `MANIFEST.md` | 0 | (this file) |

## Category index

| Category | Directory | Contents |
|----------|-----------|----------|
| 1. Internal code | `01-internal-code/` | `main.pjs`, `index.html` - the entire first-party source of this generator |
| 2. External code | `02-external-code/` | `pluralize` v8.0.0 (MIT) - the only dependency, vendored inline in `main.pjs` |
| 3. Third-party assets | `03-third-party-assets/` | none - no images/audio/models/fonts |
| 4. Project resources | `04-project-resources/` | none - no shaders/animation/JSON/prefabs/UI resources |
| 5. Build/config | `05-build-config/` | none - the Perchance platform is the runtime; no build step |

## Complete dependency inventory

| Symbol executed at runtime | Origin | License | Location in this export |
|---|---|---|---|
| `pluralize(word, count, inclusive)` | plurals/pluralize v8.0.0 | MIT | `02-external-code/pluralize/` |
| `pluralize.addPluralRule` / `addSingularRule` / `addUncountableRule` | plurals/pluralize v8.0.0 | MIT | `02-external-code/pluralize/` |
| `getPluralizeFunction()` | first-party glue | this project | `01-internal-code/main.pjs` |
| `$output(word, count, inclusive)` (public plugin API) | first-party | this project | `01-internal-code/main.pjs` |
| Perchance engine + template renderer + iframe host | Perchance platform | Perchance ToS | not bundleable - platform-provided |

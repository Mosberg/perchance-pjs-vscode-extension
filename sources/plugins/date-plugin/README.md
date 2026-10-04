# date-plugin — complete source & asset export

The complete, byte-for-byte export of the Perchance generator **`date-plugin`**
(https://perchance.org/date-plugin) and every asset it uses, organized by category.

- Generator name: `date-plugin`
- Public id: `80c74164ecebb566d37a0b575625b76b`
- Entry point: `$output` (importing this generator yields the `date()` function)
- Runtime network requests: **none** (all third-party code is vendored inline)
- Files in package: **549** · total **5.51 MiB**

---

## Package contents by category

### `01-internal-code/` — the generator's own code (this project)

| File | Description |
| --- | --- |
| `main.pjs` | **Verbatim** Perchance-JS source. Full 59,090 bytes (13 lines). Line 12 is the inlined moment.js bundle. |
| `index.html` | **Verbatim** generator HTML — the documentation page that renders the format-token table and examples. |
| `main.pjs.core.pjs` | The same `main.pjs` with the 58 KB inlined bundle replaced by a one-line placeholder, so the actual 12 lines of *project-authored* pjs logic are readable at a glance. |

### `02-external-dependencies/` — third-party code the generator runs

| File | Description |
| --- | --- |
| `moment/moment-2.27.0.min.js` | **The exact bundle extracted from `main.pjs`.** This is the code that actually executes. |
| `moment/moment-2.27.0.upstream-min.js` | Official upstream `moment@2.27.0/min/moment.min.js` for comparison (differs only by a trailing sourcemap comment). |
| `moment/moment-2.27.0.js` | Official unminified build — human-readable source of the same version. |
| `moment/moment.min.js.map`, `moment-with-locales.min.js(+.map)`, `locales.min.js(+.map)` | Upstream auxiliary builds. |
| `moment/LICENSE` | MIT license (© JS Foundation and other contributors). |

### `03-third-party-source/moment-2.27.0/` — full upstream source tree

Every file from the official `moment@2.27.0` npm tarball (527 files): the complete
`src/` module tree, all 130+ locale sources, `dist/`, `min/`, sourcemaps, TypeScript
typings (`moment.d.ts`, `ts3.1-typings/`), `package.json`, `CHANGELOG.md`, `LICENSE`,
and `README.md`. Upstream: https://github.com/moment/moment/tree/2.27.0

### `04-project-resources/` — assets used by the project

| File | Description |
| --- | --- |
| `docs-format-tokens.html` | The `<details>` reference table of all moment.js format tokens (extracted from `index.html`). |
| `docs-format-tokens-table.html` | The bare `<table>` markup of that reference. |
| `docs-code-examples.html` | Every `<pre>` example snippet shown on the page. |
| `docs-styles.css` | All inline `<style>` rules from `index.html`. |

> No binary assets exist (no images/audio/models/fonts). Nothing is referenced by URL.

### `05-build-and-config/` — build pipeline & configuration

| File | Description |
| --- | --- |
| `BUILD.md` | Documents that there is **no build pipeline**, plus the exact reproducible recipe for how moment.js was vendored into `main.pjs`, and the generator config. |
| `package.json` | Machine-readable config/dependency descriptor for this export. |

---

## Notes / provenance

- `main.pjs` and `index.html` are reproduced exactly as they exist in the editor workspace.
- The inlined bundle was verified to be byte-identical to `moment@2.27.0/min/moment.min.js`
  apart from the stripped `//# sourceMappingURL` comment.
- `MANIFEST.md` lists every file with its size and SHA-256 hash.
- `AGENTS.md` (the editor's AI-assistant instruction file) is intentionally excluded — it is
  platform tooling, not part of the generator.

# be-plugin — complete source package

Generator: `be-plugin` (https://perchance.org/be-plugin)
Exported: 2026-09-16
Preview origin: `https://1fdff17593a760f26c4a6e4fdc9ef88f.perchance.org/be-plugin`

## What this is

A Perchance *plugin* generator. Its entire runtime code is the `$output`
function in `main.pjs` plus the documentation page in `index.html`. It
emits a zero-width `<span>`; 1 ms after insertion it reads the word
immediately to its left in the DOM and replaces the span's text with the
correct "to be" verb (is/are, was/were) based on that word.

## Package layout

| Dir | Category | Contents |
| --- | --- | --- |
| `01-internal-code/` | Project source code | `main.pjs`, `index.html` |
| `02-external-code/` | External libraries / dependencies | none (see its README) |
| `03-third-party-assets/` | Third-party binary/media assets | none (see its README) |
| `04-project-resources/` | Project-owned images/audio/models/data | none (see its README) |
| `05-build-config/` | Build pipeline / config | none (see its README) |
| `06-referenced-generators/` | Generators this project links to or imports | `be-plugin-example`, `adjective` |

## How to re-import

1. Create a new Perchance generator.
2. Paste `01-internal-code/main.pjs` into `main.pjs`.
3. Paste `01-internal-code/index.html` into `index.html`.
4. Save. No build step, no dependencies, no assets.

## Runtime dependencies

None outside the Perchance engine itself. `main.pjs` imports nothing.
See `02-external-code/README.md` for the full dependency audit.

## Notes

- `main.pjs` contains `$output(tense)` (the exported plugin entry point)
  and `toBe(leftSideWord, tense)` (the verb table).
- The span carries a generated class `toBeId_<random>` and a
  `data-case` attribute; a `MutationObserver` on the span's parent keeps
  the verb in sync when surrounding text changes (e.g. the randomize
  button) and disconnects itself when the span is removed.
- `index.html` is documentation only — it renders no plugin logic.
- `index.html` links to `be-plugin-example` and `perchance.org/plugins`;
  the former is vendored under `06-referenced-generators/`.

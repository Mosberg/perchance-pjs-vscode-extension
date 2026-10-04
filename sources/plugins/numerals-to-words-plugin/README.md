# numerals-to-words-plugin — complete source & asset package

Generator: **numerals-to-words-plugin** (perchance.org/numerals-to-words-plugin)
Public id: `65bf8d0b602583dd1d1ca7bfdf860b00`
Exported: 2026-09-16

A Perchance plugin that converts a number into its English words. Public API:

    numToWord = {import:numerals-to-words-plugin}

    [numToWord(745)]            => seven hundred and forty-five
    [numToWord(745, "US")]      => seven hundred forty-five
    [numToWord(1.25)]           => one point two five

## Package layout (by category)

| Folder | Category | Contents |
|---|---|---|
| `10-internal-code/` | Internal code (first-party) | `main.pjs`, `index.html`, per-module extracts, line map |
| `20-external-code/` | External / third-party code | `big.js` v4.0.2 (vendored, inlined into `init()`) + licence |
| `30-third-party-assets/` | Third-party binary assets | none — this project ships no images/audio/models |
| `40-project-resources/` | Project resources (data, UI) | none — the word tables live inside `main.pjs` |
| `50-build-config/` | Build / config / pipeline | none — no build step; export recipe in its README |

There is **no build pipeline, no bundler, no package manager, no dependencies folder**.
Perchance generator source is authored directly in the editor and served as-is.

## Runtime dependencies

| Dependency | Version | Where it lives | How it is loaded |
|---|---|---|---|
| big.js | 4.0.2 (MIT) | inlined inside `init()` in `main.pjs` | executed once on first call; attaches `window.Big` |

No CDN, no `{import:}`, no network access at runtime. The plugin is fully self-contained.

## Rebuild / re-import

1. Copy `10-internal-code/main.pjs` into a Perchance generator's code panel (verbatim).
2. Copy `10-internal-code/index.html` into that generator's HTML panel (verbatim).
3. Save. Import it elsewhere with `numToWord = {import:numerals-to-words-plugin}`.

No compilation or asset upload is required; the two text files *are* the complete artifact.

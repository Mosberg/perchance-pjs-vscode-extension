# fixed-until-reload-plugin — Complete Asset Package

Generator: https://perchance.org/fixed-until-reload-plugin
Public page URL path in-package: top-level page is https://perchance.org/<generatorName>

This package contains EVERY file that the live generator actually loads.
Nothing is summarized or omitted. Categories with no files are documented as empty.

## Category index

| # | Category              | Location in this zip      | Contents |
|---|-----------------------|---------------------------|----------|
| 1 | Internal code         | internal-code/            | main.pjs, index.html |
| 2 | External code         | external-code/            | (empty — no external scripts/styles loaded) |
| 3 | Third-party assets    | third-party-assets/       | (empty — no third-party images/audio/models/shaders) |
| 4 | Project resources     | project-assets/           | (empty — no images, audio, JSON, fonts, or data files) |
| 5 | Build / config files  | build-config/             | (empty — no build pipeline; perchance serves main.pjs + index.html directly) |

## Notes on category emptiness

- **External code**: index.html contains zero <script src>, <link rel="stylesheet">, or ES module imports.
  There are zero {import:...} statements in main.pjs, so there are no vendored or referenced plugin sources.
- **Third-party assets**: no <img>, no CSS background-image, no fetch() of any external asset.
- **Project resources**: all randomness comes from Perchance lists (animal, letterPair) defined inline in main.pjs.
- **Build/config**: the Perchance platform compiles main.pjs at request time. There is no bundler,
  package manager, or config file involved.

## File inventory (byte-exact)

| Path                    | Bytes | Kind | Runtime role |
|-------------------------|-------|------|--------------|
| internal-code/main.pjs  | 547  | Perchance DSL (pjs) | Defines the $output(list, mapIndex) function, the `animal` list, and the `letterPair` list. Loaded before index.html. |
| internal-code/index.html| 4363  | HTML (body contents only) | Documentation page: explanation, examples 1-4 with randomize buttons, and the page <style> block. |

## Rebuild

There is nothing to build. To reproduce the generator exactly:
1. Create a Perchance generator.
2. Paste internal-code/main.pjs into the code panel.
3. Paste internal-code/index.html into the HTML panel.

## Licensing / provenance

All code in this package was written for this generator (or is the standard
Perchance $output(list, mapIndex) fixed-until-reload idiom). No third-party
license obligations apply, because no third-party code or assets are used.

# Exclude Items Plugin - Complete Project Package

A single-file Perchance plugin: outputs a random item from a list while excluding
any items you pass in. Generator: https://perchance.org/exclude-items-plugin

## Contents by category

| Folder | Category | Files |
|---|---|---|
| 01-internal-code/     | Internal code (this generator's own source)   | main.pjs, index.html |
| 02-external-code/     | External code imported/referenced at runtime  | (none) |
| 03-third-party-assets/| Third-party assets (images/audio/models/shader)| (none) |
| 04-project-resources/ | Project resources (data/JSON/UI/templates)     | (none) |
| 05-build-and-config/  | Build pipeline / config files                  | (none) |

## Complete inventory (exhaustive)

This generator is a single-file plugin. Its ENTIRE implementation is:

1. main.pjs    - the plugin body (`$output` function), 907 bytes.
2. index.html  - the documentation/demo page shown to users, 1722 bytes.

## Dependencies

None. Zero `{import:...}` statements, no npm/CDN modules, no bundler, no
package.json, no wasm, no fonts, no images, no audio, no models, no shaders,
no external JSON.

## Notes

- main.pjs loads before index.html; `$output` makes importing this generator
  return the `(list, ...args)` function instead of the generator root.
- index.html is the CONTENTS of <body> only (Perchance supplies the wrapper).
- To reproduce: create a Perchance generator and paste both files in.

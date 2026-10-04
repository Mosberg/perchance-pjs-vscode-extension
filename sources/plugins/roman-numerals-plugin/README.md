# Roman Numerals Plugin — Complete Project Export

Exported from the Perchance editor workspace.

## What this project actually contains

Only two files. There is no build pipeline, no package manager, no
node_modules, no bundled dependencies, and no binary assets.

| Category | Contents |
|---|---|
| Internal code (project source) | `main.pjs`, `index.html` |
| External code (third-party libs/modules/tools) | NONE |
| Third-party assets (images/audio/models/shaders/animations/fonts) | NONE |
| Project resources (JSON data, prefabs, templates, UI resources) | NONE |
| Build / config files (package.json, bundler configs, Makefile, CI) | NONE |

## File inventory

- `main.pjs` — 485 bytes, 27 lines
  - sha256: `f9b2c9a5517feeb4271df51707ea8f6cf499399192ddd6d8c05aeb778f799ff9`
- `index.html` — 1686 bytes, 40 lines
  - sha256: `4824087e2163a14eac81683dc9800ad3efbf0629b8e07844461bef1029869610`

## Dependency graph

```
index.html  ──(Perchance template evaluation)──>  main.pjs  ($output function)
main.pjs    ── imports ──> (nothing)
index.html  ── external <script>/<link>/network requests ──> (none)
```

No `{import:...}` directives exist in this project, so there are no
transitive generator/plugin dependencies to vendor or archive. The generated
plugin is intended to be consumed by other generators via
`roman = {import:roman-numerals-plugin-plugin}`.

## Reproducing the project

Copy `main.pjs` into the code panel and `index.html` into the HTML panel of a
Perchance generator. Nothing else is required.

## License / attribution

- `main.pjs` carries an in-source credit:
  https://stackoverflow.com/a/41358305/11950764 (roman numeral conversion algorithm)

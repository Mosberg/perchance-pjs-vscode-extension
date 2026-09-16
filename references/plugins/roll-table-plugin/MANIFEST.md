# MANIFEST — roll-table-plugin

Generator: `roll-table-plugin` (publicId `65a4035999326a66dc2fbcd07eaf8949`)
Public page: https://perchance.org/roll-table-plugin
Packaged: 2026-09-16T18:07:47.143Z

## 1. Internal code (this generator, authored in this project)

| File | Bytes | SHA-256 |
| --- | --- | --- |
| internal-code/main.pjs | 1048 | 1517098e083238ef8647d55f5a4f25dca55b0f4a2ba0b9dcb3cf18fa306b8496 |
| internal-code/index.html | 1650 | 50891d12c3e40eb48040dfce92fa063c35532b83bde49c371adc8a19d89577db |

## 2. External code (dependencies / referenced generators)

roll-table-plugin has NO `{import:...}` directives — running it requires nothing but the Perchance engine.
The documentation references the companion `dice-plugin` for its usage example, so its source is included as a reference copy.

| File | Note |
| --- | --- |
| external-code/dice-plugin/main.pjs | Companion plugin source, fetched from the Perchance public API |
| external-code/dice-plugin/SOURCE-INFO.json | Provenance for the above |

## 3. Third-party assets

None. This project ships no images, audio, models, shaders, animations, JSON data, prefabs or templates.
The only styling is the inline `<style>` block inside index.html.

## 4. Project resources

None (no src/ tree, no data files, no fonts).

## 5. Build / config files

None. Perchance generators are not built: the two source files are pasted directly into the editor's HTML and code panels and are interpreted server-side/by the engine at load. There is no bundler, package.json, or lockfile.

## Platform toolchain (provided by perchance.org, not bundled)

- Perchance template engine (Javascript list-tree evaluation, `{import:...}` resolver)
- Editor panels: `main.pjs` (code panel) + `index.html` (HTML panel)
- Public API used when packaging: `https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=<name>`

## Integrity

See `CHECKSUMS.sha256`.
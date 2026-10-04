# MANIFEST — full file inventory

Package: numerals-to-ordinals-plugin.zip
Source workspace root: /workspace

## Files included

- internal-code/main.pjs
  - bytes: 436
  - sha256: 4048fe5e7f7dff02e642711dbaa77a631589332c6918e8281e9bc17310e3a026
- internal-code/index.html
  - bytes: 1651
  - sha256: 91c5f8458609304a097839eb1517ebd05d17f40a1b1c0fba1240b8700dc8b490
- workspace-config/AGENTS.md
  - bytes: 51258
  - sha256: ed93ec9691766453f9e6240996225ccb6661973015d5709d59661d58da530fd4
- README.md
- MANIFEST.md

## Categories with zero contents

- external-code/       : 0 files — no {import:...} lines in main.pjs
- third-party-assets/  : 0 files — no images, audio, models, fonts, sprites, tilesets
- project-resources/   : 0 files — no JSON/data/prefab/template/UI resource files
- build-config/        : 0 files — no bundler, no package.json, no transpile step

## How this project is built / shipped

There is no build step. Perchance serves main.pjs (parsed by the pjs engine) and
index.html directly from the generator; saving the generator in the editor is the
entire deploy pipeline. Dependencies, if any were added, would be declared as
`name = {import:generator-or-plugin-name}` lines at the top of main.pjs and fetched
by the platform at page load.

## Reproduction

1. Create/paste internal-code/main.pjs into the Perchance editor's code panel.
2. Paste internal-code/index.html into the editor's HTML panel.
3. Save. The generator is live at https://perchance.org/<name>.

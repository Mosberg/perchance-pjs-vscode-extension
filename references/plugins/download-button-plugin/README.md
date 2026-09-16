# download-button-plugin — Complete Asset Export
Generator: https://perchance.org/download-button-plugin
Public id: ad11cc3e6bc52c907487eb9c95939d92
Exported: 2026-09-16T18:30:39.201Z

This package contains EVERY asset used by the project, organised by category.

## Contents
- 01-internal-code/        First-party generator source (main.pjs, index.html) — the whole project.
- 02-external-code/        Third-party code / imported generators.  (NONE — see its README)
- 03-third-party-assets/   Images, audio, models, shaders, fonts, JSON. (NONE — see its README)
- 04-project-resources/    Built/bundled artifacts (offline standalone build) + raw platform manifest.
- 05-build-config/         Build / config / dependency manifest files.

## What the project is
A Perchance "plugin" generator. Its entire runtime surface is a single function,
$output(text, style) in main.pjs, which returns an <a download> pointing at
https://perchance.org/api/downloadGenerator?generatorName=<this-generator>.
index.html is the documentation page that explains how to embed the plugin and
renders live demo buttons.

## Dependency footprint
- Perchance runtime (pjs engine + platform) — provided by the host, not bundled.
- Imports: NONE ({import:...} list is empty).
- npm / CDN modules: NONE.
- Binary assets (images/audio/models/shaders/fonts): NONE.

The generator is therefore 100% self-contained: two text files.

## Rebuilding / running
1. Create a generator on perchance.org and paste 01-internal-code/main.pjs into the
   "Lists" (main.pjs) editor and 01-internal-code/index.html into the "HTML" editor.
2. Or just open 04-project-resources/standalone/download-button-plugin.html in a
   browser for a fully offline copy (append #edit to the URL to edit it offline).

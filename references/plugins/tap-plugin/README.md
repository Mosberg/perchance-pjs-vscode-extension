# Perchance "Tap Plugin" — Complete Source Package

Generator: tap-plugin  (https://perchance.org/tap-plugin)
Platform: Perchance (main.pjs + index.html compiled server-side by the engine)

Every file that makes up this generator is included, plus a dependency/asset
audit proving which categories are empty.

## Category index

| # | Category | Location | Count |
|---|----------|----------|-------|
| 1 | Internal code | 01-internal-code/ | 2 files |
| 2 | External code (deps) | 02-external-code/ | 0 — audit in DEPENDENCIES.md |
| 3 | Third-party assets | 03-third-party-assets/ | 0 — audit in ASSETS.md |
| 4 | Project resources | 04-project-resources/ | tutorial text + 2 lists |
| 5 | Build / config | 05-build-config/ | no build step; manifest + notes |

## 1. Internal code
- 01-internal-code/main.pjs   — $output function implementing the tap plugin,
                                plus demo lists `animal` and `adjective`.
- 01-internal-code/index.html — page markup, tutorial prose, live demo blocks,
                                and the <style> block.

## 2. External code
None. No {import:...} statements, no CDN scripts, no npm packages, no fonts.
Generators named in the docs (a-an-plugin, locker-plugin, nestable-tap-plugin,
tap-plugin-example*) are hyperlinks only — never fetched, imported, or bundled.

## 3. Third-party assets
None. No images, audio, video, 3D models, shaders, animations, or licences.
Only Unicode glyphs typed inline (👆 \uFE0E, 🖱️ \uFE0E, ⚄), rendered by the OS.

## 4. Project resources
Data lives inside main.pjs as Perchance lists; prose lives in index.html.
04-project-resources/content-source.txt extracts both, plus every demo
invocation block shown on the page.

## 5. Build / config
No bundler, minifier, package manager, environment file, or CI. Saving the
generator in the Perchance editor IS the deploy step.
05-build-config/manifest.json holds a SHA-256 of every shipped file.

## How the plugin works
tap(listOrStr, style) returns an object whose toString() yields a clickable
<span>/<button>. Each call stores the list on window[ref] and wires an onclick
that re-evaluates window[ref].evaluateItem (laminating a new random pick) and
repaints every element sharing class `tap-id-<ref>`. Variants: noTap,
noTapNoUpdate (raw selected text), and a third arg used as inline CSS,
with "button" as a special case producing a real <button>.

## Reproduce
1. Create a Perchance generator.
2. Paste main.pjs and index.html from 01-internal-code/.
3. Save. Because main.pjs defines a top-level $output, any generator doing
   {import:tap-plugin} receives the tap function itself.

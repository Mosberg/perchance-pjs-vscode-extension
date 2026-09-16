# Layout Maker Plugin - Complete Project Package

Generator: layout-maker-plugin  ->  https://perchance.org/layout-maker-plugin
Exported from the Perchance editor workspace. Everything that exists in this project is in this archive.

## 1. INTERNAL CODE (written for this project)

| Path | Bytes | Role |
|---|---|---|
| internal-code/main.pjs | 5192 | All generator logic: the $output(spec) layout renderer, the window.update() wrapper for id'd areas, and every demo layout (layout0, layout1, layout1_centered, layout_auto_height, layout2, layout3, layout4, layout5, layout6). |
| internal-code/index.html | 7298 | Documentation page + live demos (body content only; Perchance supplies html/body wrappers). |

Both files are reproduced byte-for-byte in internal-code/.
SHA-256 main.pjs:    d22d6f799d46376409bf9c92f2eaf8adc370f3d03fcd9383f0c32ef7056f9990
SHA-256 index.html:  eaa9ab307928d63a9adb7dd00383206c59135c1ae616deaa887e972a1d49c39e

Runtime behaviour, at a glance:
- main.pjs defines a top-level function $output(spec) which is this generator's exported plugin API.
- It turns spec.grid rows into CSS grid-template-areas, spec.areas into grid-area cells, and escapes square/curly brackets in area content so nested pjs still evaluates.
- It wraps window.update() so update(someAreaElement) re-renders a single saved area by id.
- index.html contains only documentation and [ $output(layoutN) ] demo calls; styling is one inline style block.

## 2. EXTERNAL CODE (dependencies)

Declared dependencies: NONE. This generator contains no {import:...} lines - it is self-contained.

Host platform (not redistributable): the Perchance engine, https://perchance.org
  Supplies the pjs template engine, weighted list/hierarchy evaluation, square/curly block rendering,
  window.update(), window.generatorName, window.generatorPublicId, the root scope proxy, and the
  sandboxed iframe origin https://<generatorPublicId>.perchance.org/<generatorName>.
  It is proprietary server/client software and is not included in this archive.

Referenced example generators (informational only - NOT dependencies). Verbatim copies are included
in external-code/referenced-generators/ so the whole reference set is offline-available:

- layout-maker-plugin-example -> https://perchance.org/layout-maker-plugin-example
- responsive-layout-maker-plugin-example -> https://perchance.org/responsive-layout-maker-plugin-example
- update-specific-boxes-with-the-layout-maker-plugin -> https://perchance.org/update-specific-boxes-with-the-layout-maker-plugin
- responsive-layout-maker-plugin -> https://perchance.org/responsive-layout-maker-plugin

External hyperlinks inside index.html: https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS
(plain documentation links; no code is fetched from them at runtime).

## 3. THIRD-PARTY ASSETS

NONE. This project ships no images, audio, music, video, 3D models, shaders, animations, fonts, or icons.
There is no src/ directory. Nothing is fetched at runtime.

## 4. PROJECT RESOURCES

NONE AS SEPARATE FILES, because everything is inline:
- Layouts / prefabs / templates / data: the pjs lists in main.pjs (layout0..layout6, layout1_centered, layout_auto_height).
- UI resources: the inline HTML in index.html plus its single <style> block.
- No JSON, no spritesheets, no level data, no assets folder.

## 5. BUILD / CONFIG FILES

NONE. Perchance generators have no build step: no package.json, no bundler, no lockfile, no CI, no
minification, no toolchain. Files are saved in the editor and served as-is.
- Configuration that does exist lives in main.pjs as literal top-level items and the per-layout options
  (grid, areas, container.style, rowSizes, columnSizes, debug, centered, id).
- $meta is NOT defined: this generator sets no custom title, description, image or tags.

## Layout engine reference (main.pjs API)

spec.rows/grid        rows of letters; "." = empty gap
spec.areas[name].content   raw pjs content (re-evaluated on update)
spec.areas[name].style     CSS applied to that cell
spec.areas[name].centered  flex-center the cell contents
spec.areas[name].id        id= for update(thatId) targeting
spec.container.id/.style   id/CSS for the grid wrapper (default min-height:300px)
spec.rowSizes/columnSizes  grid-template-rows / grid-template-columns
spec.debug                 "borders" | "colors"

## Archive layout

  README.md                          this manifest
  internal-code/main.pjs             project source
  internal-code/index.html           project source
  external-code/README.md            dependency notes
  external-code/referenced-generators/<name>/{main.pjs,index.html}
  third-party-assets/README.md       empty category, explained
  project-resources/README.md        empty category, explained
  build-config/README.md             empty category, explained

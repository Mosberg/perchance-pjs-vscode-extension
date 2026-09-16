# 03 — Third-party assets

**Third-party assets in this package: NONE.**

This project ships no images, icons, favicons, sprites, textures, spritesheets,
fonts, audio (music/SFX), 3D models, rigs, animations, video, or shaders.

Evidence — the only two project files:
- `main.pjs`: pure JavaScript; no URLs other than the service endpoints listed
  in `../02-external-code/README.md`.
- `index.html`: one inline SVG-free HTML page. It has **no** `<img>`, `<svg>`,
  `<canvas>`, `<video>`, `<audio>`, `background-image`, `@font-face`, or
  `<link rel="icon">`. Its only decorative element is the HTML entity
  `&#xFE0E;` (a text-presentation variation selector following `âš„`), which is
  rendered from the page's system font and is therefore not an asset file.

## Licence notes

Because there are no bundled third-party assets, no asset licence file is
required. The plugin is a public Perchance plugin (forkable in the platform UI,
but see the coupling warning).

## Procedural / CSS-generated visuals (for completeness)

Everything visually interesting on the page is produced by CSS in the page's
inline `<style>` block: the `#eee` page background, rounded white content
cards, and the dark `#333` `<pre>` code blocks with white text. No files.

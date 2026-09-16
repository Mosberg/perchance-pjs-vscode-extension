# Project resources

**This project ships no binary assets.**

There are no images, audio files, video, 3D models, shaders, animations, JSON data files,
prefabs, or UI resources in this generator. The entire visible design of the generator's
landing page is:

- semantic HTML written by hand in `01-internal-code/index.html` (headings, paragraphs,
  `<code>` samples, an `<ul>` of notes)
- a single inline `<style>` block at the bottom of that file (3 rules: `body`, `code`, `ul li`)
- two emoji glyphs used as the lock/unlock icons: `🔐` (U+1F510) and `🔓` (U+1F513), written
  directly into the `main.pjs` function's `<span>` markup
- one `<span>` with an inline `onclick` handler, generated at runtime by `main.pjs`

The generator has no `$meta` block, so the platform listing page uses an auto-generated
screenshot rather than a `$meta.image`.

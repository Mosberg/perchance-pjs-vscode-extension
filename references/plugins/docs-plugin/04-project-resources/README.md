# Project resources

This generator has no images, audio, fonts, models, shaders or data files. Its content resources are:

1. Markdown pages - the <script type="text/markdown" data-hash=... data-title=... data-desc=...> elements inside
   01-internal-code/index.html. The plugin's demo pages (overview, advanced, markdown-syntax) are simultaneously
   the generator's visible content and its usage documentation.
2. Runtime-generated UI/CSS - the stylesheet string built by injectStyles() in main.pjs, including the hljs theme
   colors. There is no external .css file.
3. UI glyphs - text/emoji only: the copy glyph U+29C9 and the 'Menu' label. No icon files.

## examples/

Reference generators that use this plugin, fetched from perchance.org:

- examples/docs-plugin-simple/ - https://perchance.org/docs-plugin-example (minimal usage)
- examples/ai-character-chat-docs/ - https://perchance.org/ai-character-chat-docs (large real docs site, ~81 KB of markdown)

Both have main.pjs = ```docsPlugin = {import:docs-plugin}``` and put all content in index.html.
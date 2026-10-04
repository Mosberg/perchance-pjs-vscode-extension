# 03 - Third-party assets

The generator ships exactly ONE third-party visual asset, and it is inlined in main.pjs
as an SVG path rather than sitting in a file - this folder extracts it so it can be
inspected/edited on its own.

### fontawesome-expand-icon.svg
- Font Awesome Free, `expand` (solid), viewBox 0 0 448 512.
- Source: https://github.com/FortAwesome/Font-Awesome/blob/6.x/svgs/solid/expand.svg
- License: icons are CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/); the
  Font Awesome Free fonts/CSS are SIL OFL 1.1 / MIT respectively. Attribution to
  Font Awesome is required by CC BY 4.0 - the existing usage in main.pjs carries no
  attribution comment, so add one if you modify or redistribute this file.
- In main.pjs it is wrapped in <svg style="filter:invert(1)"> so the black icon renders
  white over tldraw's dark chrome, and its <span class="fullscreen-button-label"> is
  deliberately cleared/emptied by the toggle handler (label text was removed, the span
  is kept as a layout anchor).

### Third-party assets NOT included (and why)
- tldraw application bundles (React app, fonts, sprites, icons, cursors): proprietary
  hosted service at www.tldraw.com, loaded live inside the iframe. Not redistributable.
  License: https://github.com/tldraw/tldraw/blob/main/LICENSE.md (tldraw license -
  source-available, not open source). The plugin merely deep-links a room URL; it
  vendored no tldraw code, and the tldraw logo/wordmark is not used anywhere here.
- Perchance platform UI assets and Cloudflare analytics: platform-injected, see 02.
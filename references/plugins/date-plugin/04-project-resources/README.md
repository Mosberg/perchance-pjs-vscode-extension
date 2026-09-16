# Project resources

The `date-plugin` generator ships **no external binary assets** — no images, audio,
fonts, 3D models, or data files. Everything is code + HTML/CSS. The only rendered
"resources" are documentation markup embedded inside `index.html`.

| File | Source | Description |
| --- | --- | --- |
| `docs-format-tokens.html` | `index.html` | The collapsible `<details>` block listing every moment.js format token and its output. |
| `docs-format-tokens-table.html` | `index.html` | The bare `<table>` markup of that token reference. |
| `docs-code-examples.html` | `index.html` | Every `<pre>` usage example block (the `\[date()...\]` snippets). |
| `docs-styles.css` | `index.html` | The inline `<style>` rules (page background, `<code>`/`<pre>` styling, token table). |
| `assets/` | — | (absent / not applicable) |

No asset URLs are referenced anywhere in the generator (`grep` for `src=`, `url(`,
and `href=` finds only documentation links to momentjs.com and perchance.org).

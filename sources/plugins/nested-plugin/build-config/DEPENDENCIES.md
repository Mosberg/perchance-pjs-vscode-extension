# Dependencies & build config — findings

- `{import:...}` statements in main.pjs: **none**
- package.json / lockfile / bundler config: **none**
- `<script src="...">` in index.html: **none**
- CDN/npm module imports: **none**
- CSS frameworks / fonts / icon libraries: **none** (all CSS is a small inline
  `<style>` block in index.html plus the empty style element injected by
  `addDefaultPluginCSS` in main.pjs)
- `$meta` block (title/description/image/tags): **none** in main.pjs — the generator
  has no metadata block in its source export
- CI/build scripts: **none**

Runtime, platform-provided (not part of this project):

- Perchance engine: https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
  (injected by the platform into the page; the version hash changes over time)

External links appearing in the docs (not code dependencies):
- https://perchance.org/nested-plugin-example
- https://perchance.org/nested-plugin-v2
- https://perchance.org/plugins
- https://www.reddit.com/user/rsek/
- http://orteil.dashnet.org/nested

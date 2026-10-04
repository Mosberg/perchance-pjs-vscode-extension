No build pipeline, bundler, package manager, lockfile, or config files exist for this project.

This is a native Perchance generator: main.pjs and index.html are consumed directly by the
Perchance engine at runtime. There is nothing to compile, transpile, minify, or install.

Runtime dependencies (none require a build step):
  * luxbar CSS   - vendored verbatim as an inline template-literal string in main.pjs (getPluginCss())
  * Open Sans    - served by the Google Fonts CDN, referenced by URL only
  * Perchance engine + {import:...} system - provided by perchance.org

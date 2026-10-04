# Build / config files

There is **no build pipeline**. Perchance generators are interpreted directly
from `main.pjs` + `index.html` on load — no compiler, bundler, transpiler,
package manager, lockfile, CI config, or environment file is involved.

"Configuration" for this generator is limited to:

- `main.pjs` — the generator code panel (list/data definitions + JS functions).
  This generator's only top-level declaration is the exported `$output` function.
- `index.html` — the page body (this generator has no `$meta` block at all:
  no title/description/tags/image overrides; the page is a single static
  documentation card plus a `<style>` block).
- `MANIFEST.json` — machine-readable inventory of this package (paths, sizes,
  SHA-256 hashes), generated at package time.

To "build"/deploy: open the generator on perchance.org and save the editor.

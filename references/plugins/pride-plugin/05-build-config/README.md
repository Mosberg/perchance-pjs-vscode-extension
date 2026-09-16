# Build / configuration

NONE.

Perchance generators are authored and served directly by the Perchance engine.
There is no build pipeline, no bundler, no minifier, no manifest, and no
config file. The generator's "config" surface is:

- `$output(...)` in main.pjs - the exported function and its behaviour.
- Inline `<style>` in index.html - the docs page styling.

No $meta block is present in main.pjs, so the platform supplies default
metadata for the generator listing page.

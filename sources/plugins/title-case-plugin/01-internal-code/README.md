# 01 — Internal code

These two files ARE the generator. They ship publicly and are the only code that runs
at page load. There is no module graph, no bundler output, no minified blob:

| File | Role |
|---|---|
| `main.pjs` | The Perchance-js "plugin" source. Declares a single top-level function `$output(inputText, opts)`, which is the value importers of `{import:title-case-plugin}` receive. |
| `index.html` | The generator's body contents: documentation page + `<style>` block. Perchance wraps it in `<html>/<body>` and serves it inside an iframe at `https://<generatorPublicId>.perchance.org/title-case-plugin`. |

## Runtime inventory (nothing external)

A fresh load of this generator performs **zero** network requests beyond the Perchance
platform itself: no `{import:...}` dependencies, no CDN script tags, no web fonts,
no images, no `fetch()` calls, no WebGL/WebGPU, no workers, no storage APIs.

The only outbound links are user-facing documentation links inside `index.html`.

## Execution model note

`main.pjs` top-level names become globals. `$output` is special: it makes an *importer*
receive that function instead of the generator's `root` list. So
`titleCase = {import:title-case-plugin}` binds the function, and
`[titleCase("some headline")]` calls it.

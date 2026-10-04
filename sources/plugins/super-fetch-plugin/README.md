# super-fetch-plugin — Complete Project Package

Generator: https://perchance.org/super-fetch-plugin
Generator name (runtime `window.generatorName`): `super-fetch-plugin`
Generator public id (`window.generatorPublicId`): `2bfb804d6a06bdeeb50784e00b66c578`
Runtime origin (iframe): https://2bfb804d6a06bdeeb50784e00b66c578.perchance.org/super-fetch-plugin

This is a COMPLETE, byte-exact export of every file that makes up this project.
There are exactly TWO project source files. Everything else in this package is
generated documentation (README/MANIFEST/category notes) so that the package is
self-describing and organised by category.

---

## Category index

| # | Category | Folder | Contents |
|---|----------|--------|----------|
| 1 | Internal code (written for this project) | `01-internal-code/` | `main.pjs`, `index.html` |
| 2 | External code (third-party code this project depends on) | `02-external-code/` | none — see `02-external-code/README.md` |
| 3 | Third-party assets (art, audio, models, fonts...) | `03-third-party-assets/` | none — see `03-third-party-assets/README.md` |
| 4 | Project resources (data/JSON/templates/UI) | `04-project-resources/` | none — see `04-project-resources/README.md` |
| 5 | Build / config files | `05-build-config/` | none — see `05-build-config/README.md` |

Full file-by-file listing with sizes and SHA-256 hashes: `MANIFEST.md`

---

## What this project is

`super-fetch-plugin` is a Perchance plugin. It is a drop-in replacement for the
browser's built-in `fetch()` that bypasses CORS by proxying requests through a
Perchance server.

Consumers add:

```
superFetch = {import:super-fetch-plugin}
```

to the top of their own `main.pjs`, and then call `root.superFetch(url)` exactly
like `fetch`.

## How the two files fit together

- **`main.pjs`** is the entire plugin implementation. It is a single
  `$output` function: because the file defines a top-level `$output`, importing
  this generator yields the function itself rather than the generator's scope
  object. That function is the Super Fetch implementation.
  - Passes through natively (no proxy) for `blob:`, `data:`, and a small
    allowlist of CORS-friendly CDN origins (`cdn.jsdelivr.net`, `files.catbox.moe`,
    `huggingface.co/.../resolve/`, `raw.githubusercontent.com`).
  - Retries the direct request against the proxy for some Perchance upload hosts.
  - Otherwise rewrites the URL to
    `https://fetch-plugin.perchance.org/proxy1/<encoded-url>?origin=<generator-origin>&generator=<generator-name>`
    and fetches that. HTTP 530 (Cloudflare DNS/lookup failure) is rethrown as
    `new Error("Failed to fetch")` to match browser `fetch` behaviour.
  - Rejects relative URLs and non string/URL/Request inputs.
  - Supports every `fetch()` call signature, including the
    `fetch({url, ...options})` object form (which is rebuilt as a `Request`).
- **`index.html`** is the plugin's documentation/demo page (the page you see at
  https://perchance.org/super-fetch-plugin). It contains a fork warning for
  remixers, an explanation of CORS and proxying, usage examples, links to
  related plugins, and the page's `<style>` block. It contains no executable
  script blocks and no assets.

## IMPORTANT: why this package cannot be forked

The `main.pjs` header comment states this explicitly and the page repeats it:
the client code is *coupled* to Perchance's server-side proxy code
(`https://fetch-plugin.perchance.org/proxy1/...`). The server half is NOT part
of this package (it is not part of the generator's source, and it is not
redistributable). If the server is updated, a forked/vendored copy of this
client plugin can break. To extend it, write a separate generator that
`{import:super-fetch-plugin}` and wraps the public API.

## Runtime requirements

- A browser with `fetch`, `URL`, `Request`, and `Blob` (any modern browser).
- Network access to `https://fetch-plugin.perchance.org` for the proxy path.
- No npm packages, no bundler, no build step, no environment variables,
  no API keys or secrets of any kind.

## Reproducing the generator

Create a Perchance generator and paste the two files from `01-internal-code/`
into the editor's `main.pjs` and `index.html` panes respectively. That is the
entire build pipeline.

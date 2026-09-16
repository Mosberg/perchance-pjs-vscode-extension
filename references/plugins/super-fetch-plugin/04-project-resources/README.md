# 04 — Project resources

**Project resource files in this package: NONE.**

There is no `src/` tree in this project, and therefore no JSON data, level
data, prefabs, templates, localisation strings, manifests, UI resource files,
or generated content. The generator's only files are `main.pjs` and
`index.html` at the workspace root.

## Where "data" lives in this project, if you are looking for it

The plugin is stateless. Its behaviour is entirely controlled by:

1. **Constants compiled into the code** — the pass-through origin allowlist
   (`jsdelivr.net`, `catbox.moe`, `huggingface.co/resolve/`,
   `raw.githubusercontent.com`) and the retry-then-proxy list
   (`user-uploads.perchance.org`, `user.uploads.dev`, `aigc.uploads.dev`),
   all inside `01-internal-code/main.pjs`.
2. **Runtime globals** — `window.generatorPublicId` and `window.generatorName`,
   supplied by the Perchance engine, used to build the proxy URL's `origin`
   and `generator` query parameters.
3. **Caller-supplied input** — the URL/`Request`/`options` the consumer passes
   to `superFetch(...)`, forwarded verbatim (other than the URL rewrite).

There is no persistence layer (no localStorage/IndexedDB/kv), no remote data
files, and no config file to edit.

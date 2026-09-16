# 02 — External code

**Vendored third-party code in this package: NONE.**

This project contains no `{import:...}` statements, no CDN `<script src>` tags,
no ES-module `import` statements, no npm packages, no `node_modules`, and no
vendored/embedded libraries. All logic in `main.pjs` uses only JavaScript
built-ins (`fetch`, `URL`, `Request`, `Blob`, `encodeURIComponent`, regex).

## External services it depends on at RUNTIME

These are not code you can download — they are remote services the plugin
calls, plus a pass-through allowance list. They are documented here because
they are the complete set of external dependencies.

| Kind | Endpoint | Used for | Notes |
|------|----------|----------|-------|
| Perchance proxy service | `https://fetch-plugin.perchance.org/proxy1/<encodeURIComponent(href)>?origin=<generator origin>&generator=<generator name>` | The core CORS-bypassing proxy. Server-side; NOT part of this package and not forkable/redistributable. | Maintained by Perchance. Behaviour changes here are why forking the client code is discouraged. |
| Direct-fetch allowlist (no proxy) | `https://cdn.jsdelivr.net` | Content that is already CORS-enabled | Called with the native `fetch` |
| Direct-fetch allowlist (no proxy) | `https://files.catbox.moe` (origin ends with `catbox.moe`) | Ditto | Native `fetch` |
| Direct-fetch allowlist (no proxy) | `https://huggingface.co` — only when the URL contains `/resolve/` (i.e. `huggingface.co/**/resolve/**`) | Model/dataset file downloads | Native `fetch` |
| Direct-fetch allowlist (no proxy) | `https://raw.githubusercontent.com` | Raw files from GitHub | Native `fetch` |
| Direct-fetch-then-proxy-retry | `https://user-uploads.perchance.org`, `https://user.uploads.dev`, `https://aigc.uploads.dev` | Perchance-hosted user uploads | Tries native first (these sometimes have cached CORS/CORP failures), falls back to the proxy |

## Platform dependencies (supplied by Perchance, not by this project)

| Global | Where it comes from | Used for |
|--------|---------------------|----------|
| `window.generatorPublicId` | Perchance engine | Building the proxy `origin` parameter |
| `window.generatorName` | Perchance engine | Building the proxy `generator` parameter; gating the fork-warning banner on `index.html` |
| `$output` (pjs) | Perchance pjs engine | Exporting the function itself as the imported value |

## External code referenced only as links (never loaded)

The documentation page links to, but does not fetch or embed:
- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- https://github.com/mozilla/readability
- https://perchance.org/plugins
- https://perchance.org/ai-text-plugin
- https://perchance.org/upload-plugin
- https://perchance.org/super-fetch-plugin-example

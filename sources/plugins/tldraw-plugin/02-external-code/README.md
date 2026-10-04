# 02 - External code (loaded at runtime, not authored by this project)

Snapshots of every non-project script the page actually loads, taken from the live
generator's `performance.getEntriesByType('resource')` list. They are included so this
package is self-contained for reading/auditing, but they are NOT part of the generator
and must not be vendored back into it - they are served and versioned by their owners.

### perchance-engine-491bf81418aa4b69.js  (115,369 bytes)
- Source: https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
- Owner: Perchance (the hosting platform). This is the DSL engine itself: it parses
  main.pjs into a list tree, exposes node methods ($odds, selectOne, selectAll,
  evaluateItem, getLength, ...), renders square-bracket blocks, and emulates
  DOMContentLoaded/load for the injected HTML.
- The hash in the filename is an engine build id. It changes when Perchance ships a new
  engine; the file is re-fetched by the platform automatically, so nothing in this
  project pins or references it directly.

### cloudflare-insights-beacon.min.js  (30,294 bytes)
- Source: https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba1788362987495
- Owner: Cloudflare Web Analytics, injected by the Perchance platform (not by this
  project). Measures Core Web Vitals / page views. No project code calls it.

### tldraw-embed-shell.html  (13,646 bytes)
- Source: https://www.tldraw.com/r/perchance-aUf8Njeo73-tldraw-plugin-general
  (the room id segment is `perchance-aUf8Njeo73-<generatorName>-<channel>`)
- Owner: tldraw. This is the document shell the plugin's <iframe> loads. The shell is
  only a mount point: it references /theme-init.js, /manifest.webmanifest and the
  /favicon.svg + apple-touch-icon assets, and the React application itself arrives as
  dynamically-hashed JS/CSS bundles that are not enumerable by URL. Treat this file as
  the integration contract (the shell has no dependencies on the embedding page, which
  is why the iframe works with zero postMessage handshaking).

### Platform HTTP APIs contacted by the page (responses are JSON, no static URL)
- https://perchance.org/api/clearCacheIfGeneratorOrImportsHaveBeenUpdated?generatorName=...
  - cache-busting / edit-time check polled by the platform on load.
- https://perchance.org/api/securityData
  - platform security/permission metadata used by the engine.
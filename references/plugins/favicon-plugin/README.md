# favicon-plugin — Complete Source Package

Perchance generator: **favicon-plugin**
Public page: https://perchance.org/favicon-plugin
Source (fork/edit): https://perchance.org/favicon-plugin#edit

A Perchance plugin that sets the browser tab icon (favicon). It is a single
perchance-js function, exposed as `favicon` when imported via `{import:favicon-plugin}`.

---

## 1. What this project is

| | |
|---|---|
| Type | Perchance plugin (not a standalone app) |
| Public API | `favicon(url)` |
| Argument | `url` — an absolute image URL, a data URL, or a template/list item that resolves to one |
| Returns | empty string `""` (so it renders nothing into the page) |
| Dependencies | **none** — no `{import:...}` lines, no npm/CDN libraries |
| Persistent files (`src/`) | **none** |
| Binary assets | **none** (images/audio/models/shaders: n/a) |

Because a Perchance generator is just two text files, the entire project is
contained in the four files below. There is no build pipeline, no package
manager, and no compiled output.

---

## 2. File inventory (organised by category)

### Internal code (everything the generator runs)
| File | Size | Role |
|---|---|---|
| `main.pjs` | 472 B | The plugin implementation — the `$output(url)` function that creates/replaces the `<link rel="icon">` element |
| `index.html` | 2619 B | The plugin's documentation page shown when people visit perchance.org/favicon-plugin |

### External code / libraries / dependencies
**None.** `main.pjs` contains zero `{import:...}` statements and `index.html`
loads no external scripts, stylesheets, fonts, or modules. Nothing is resolved
from a CDN at runtime.

### Third-party assets
**None.** No images, audio, video, fonts, 3D models, shaders, animations, or
JSON data files are used or generated.

### Project resources / config / build files
**None.** No `package.json`, lockfile, bundler config, CI config, or toolchain.

### Linked resources (documentation hyperlinks only — not loaded assets)
The docs page links out to the following, all of which are ordinary
`<a href>` references and are **not fetched or embedded** by the plugin:
- https://perchance.org/upload — the recommended host for favicon images
- https://perchance.org/favicon-plugin-example — usage example
- https://perchance.org/animated-favicon-example — animated favicon example
- https://perchance.org/text-to-image-plugin-programmatic-example — data-URL example
- https://perchance.org/plugins — the plugin directory
- /text-to-image-plugin — referenced as a companion plugin in prose only

---

## 3. How it works

`main.pjs` defines `$output(url) =>` — Perchance's `$output` directive makes this
function what an importer receives, so `{import:favicon-plugin}` yields `favicon(url)`.

On call it:
1. Coerces the argument to a string (calling `.evaluateItem` if a Perchance list
   object was passed, so `favicon([someImageList])` works).
2. Reads the existing `<link rel~='icon'>`, if any.
3. If there is none — or the requested URL differs from the current one — removes
   *all* existing icon links (browsers otherwise keep the first/preferred one) and
   appends a fresh `<link rel="icon">` with the new URL.
4. Returns `""` so it contributes no visible HTML.

The "compare against current href" check additionally means the function is cheap
to call repeatedly: calling it once per second with successive animation frames
(see the animated-favicon example) only rebuilds the DOM node when the URL
actually changes — but note that it *does* replace the node whenever the URL
changes, which is what drives animation.

## 4. Usage

In the **lists** editor (`main.pjs`):
```
favicon = {import:favicon-plugin}
```

In the **HTML** editor (`index.html`), anywhere:
```
[favicon("https://example.com/foo.png")]
```

Recommended: host the icon via https://perchance.org/upload to get a permanent URL.
Data URLs are supported too, enabling generated/procedural favicons.

## 5. Development / rebuild notes

There is nothing to build. To modify the behaviour, edit `main.pjs` (or the
generator's lists panel) and save — Perchance serves the text files directly.
To change the docs page, edit `index.html`.

Runtime environment: the page runs inside an iframe at
`https://<generatorPublicId>.perchance.org/<generatorName>`. `main.pjs` is
evaluated before `index.html`; the body wrapper is added by the platform, which
is why `index.html` deliberately contains no `<html>`/`<head>`/`<body>` tags.

## 6. Licence / provenance

Original Perchance plugin source, (c) its author / perchance.org. This package is
an unmodified export of the generator's own two files plus this README and
MANIFEST.json generated for convenience.

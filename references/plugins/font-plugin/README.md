# font-plugin - complete source & asset package

Everything used by the Perchance generator **`font-plugin`**
([perchance.org/font-plugin](https://perchance.org/font-plugin)), extracted from the
live generator. No build step exists: the source files are the shipped artifact.

## Contents

| Folder | Category | Notes |
|---|---|---|
| `internal-code/` | **Internal code** (first-party) | `main.pjs` (pjs code panel) + `index.html` (body contents). This is 100% of the generator's own code. |
| `external-code/` | **External / third-party code** | Empty by design - this generator imports nothing (`no {import:...}` lines). See the README there. |
| `third-party-assets/` | **Third-party assets** | Google Fonts: byte-exact woff2 subsets + the raw CSS responses for Pacifico, Permanent Marker, Courgette. The plugin can request *any* Google Font at runtime. |
| `project-resources/` | **Project resources** | `generator.json` metadata + a checklist of asset categories (images/audio/models/shaders = none exist). UI resources = the markup + CSS inside `index.html`. |
| `build-config/` | **Build / config files** | None exist (no bundler, no package.json, no CI). The README documents the deployment model and how to rebuild this package. |
| `PROJECT-MANIFEST.json` | inventory | Every file with byte size + sha256. |

## What this generator actually is

A one-function plugin. `$output (list, font, size, color)` is a Perchance list-function:

*   `list` - a string/list to wrap in a styled `<span>`, **or** an `HTMLElement` to style in
    place, **or** `null` meaning `document.body` (fonts the whole page).
*   `font` - any Google Fonts family name; injected as a `<link>` on first use.
*   `size`, `color` - optional CSS `font-size` / `color`.

Consumers write `font = {import:font-plugin}` then use `[font(animal, "Pacifico")]`.

## Runtime requirements

* The Perchance engine (hosted) - no npm/CDN libraries needed.
* Network access to `fonts.googleapis.com` / `fonts.gstatic.com` for the fonts you request.
  The bundled woff2 files under `third-party-assets/fonts/` make the three example
  families available fully offline.

## Licences

* Generator source: authored on Perchance (the platform's default terms).
* Bundled fonts: SIL Open Font License 1.1 / Apache-2.0 - https://fonts.google.com/attribution

# MANIFEST

| Path | Category | Size (bytes) | Notes |
|---|---|---|---|
| internal-code/main.pjs | internal code | 157 | perchance-js source. Declares the import + the exported `$output` function. |
| internal-code/index.html | internal code | 2787 | Body HTML: documentation page. |
| external-code/create-instance-plugin/main.pjs | external code (dependency) | 2933 | Full source of the imported `create-instance-plugin`. |
| third-party-assets/ (none) | third-party assets | 0 | Project uses no images/audio/models/fonts. |
| project-resources/ (none) | project resources | 0 | No JSON data, prefabs, templates, or UI assets. |
| build-config/ (none) | build/config | 0 | No build pipeline. Perchance loads main.pjs + index.html directly. |

## How perchance loads this

1. `main.pjs` is evaluated first (top-level names become globals on `root`).
2. `index.html` is injected as the <body> of the page.
3. The engine renders square-bracket template blocks, then runs <script> tags.

The page runs in an iframe at `https://<generatorPublicId>.perchance.org/create-instances-plugin`.

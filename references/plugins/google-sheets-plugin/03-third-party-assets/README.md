# 03 — Third-party assets

Everything in this project that originates from a third party (i.e. not authored in this
workspace). The project contains **no** third-party code: no libraries, no CDN modules, no
vendored scripts, no fonts, no audio, no 3D models, no shaders, no build tools. The only
third-party things are *media* and *external URLs*.

## 3.1 Third-party media (hotlinked by the docs page, mirrored in `04-project-resources/images/`)

| Asset | Original URL | Referenced in | Local mirror | Type |
|---|---|---|---|---|
| "Publish to web" instructions screenshot | https://i.imgur.com/dmGUKLv.png | `01-internal-code/index.html` (`<a href="https://i.imgur.com/dmGUKLv.png">`) | `04-project-resources/images/publish-to-web-instructions.png` | image/png |
| Example spreadsheet screenshot | https://i.imgur.com/PARDKrd.png | `01-internal-code/index.html` (`<img src="https://i.imgur.com/PARDKrd.png">`) | `04-project-resources/images/spreadsheet-example.png` | image/png |

These are user-uploaded imgur files. They are hotlinked by the live generator, so the live
page depends on imgur continuing to serve them. The mirrored copies here are what the page
was actually displaying at snapshot time. Ownership/licence is unknown (imgur user upload) —
treat as third-party and do not re-license.

## 3.2 Third-party services the project depends on at runtime

| Service | Used for | Where |
|---|---|---|
| Google Sheets "Publish to web → .tsv" | Serves the spreadsheet columns the plugin imports | `01-internal-code/main.pjs` (`fetch(url)`) |
| Google Docs hosting (`docs.google.com/spreadsheets/d/e/.../pub`) | The published-TSV endpoint format | docs + example generators |
| imgur | Hosting the two screenshots | `01-internal-code/index.html` |

## 3.3 Third-party generators referenced (source copied into `02-external-code/`)

| Generator | URL | Referenced in |
|---|---|---|
| `google-sheets-plugin-example` | https://perchance.org/google-sheets-plugin-example | `01-internal-code/index.html` |
| `google-sheets-plugin-onload-example` | https://perchance.org/google-sheets-plugin-onload-example | `01-internal-code/index.html` |
| `animal` (list plugin) | https://perchance.org/animal | both example generators (`{import:animal}`) |

Their verbatim source is in `02-external-code/referenced-generators/`. They are other
authors' generators and are included only because this project's docs link to them.

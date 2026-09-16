# Third-party vendor libraries & assets

Everything here is fetched from a public CDN and stored locally so the project can run without those CDNs (fonts also have local-path CSS). All original URLs are recorded below.

## Stylesheets (`css/`)

| local file | original URL | license |
|---|---|---|
| `google-fonts-open-sans.css` | https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap | SIL Open Font License 1.1 |
| `google-fonts-material-symbols.css` | https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined | Apache License 2.0 |
| `google-fonts-kalam.css` | https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap | SIL Open Font License 1.1 |
| `font-awesome-7.0.1-all.min.css` | https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css | Icons CC BY 4.0 / Fonts SIL OFL 1.1 / Code MIT |

## Scripts (`js/`)

| local file | original URL | license | used for |
|---|---|---|---|
| `tally-embed.js` | https://tally.so/widgets/embed.js | Tally Terms | in-page feedback form embed |
| `jszip-3.10.1.esm.js` | https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm | MIT / GPLv3 dual | client-side ZIP export inside the app (imported at runtime as an ES module) |

## Fonts (`fonts/`)

| folder | files | original host | license |
|---|---|---|---|
| `fonts/google-fonts/` | 130 `.woff2` | https://fonts.gstatic.com | OFL 1.1 / Apache 2.0 (per family) |
| `fonts/font-awesome/` | 4 `.woff2` | https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/webfonts/ | SIL OFL 1.1 (Font Awesome Free) |

## Offline CSS

`css/*.local.css` are the same stylesheets with every `url(...)` rewritten to a relative path into `fonts/`, so the whole vendor folder works with zero network access:

```html
<link rel="stylesheet" href="03-third-party-vendor/css/all-vendor.local.css">
```

# NOTICE — provenance, credits & licensing

This package is an archival copy of a **Perchance community project**. It was assembled by copying
files out of the live generator and its public dependencies. Nothing here is original work of the
packager, no authorship is claimed, and no license is granted beyond what the original authors and
rights-holders already allow.

## 1. The project's own terms (verbatim from `01-internal-code/main.pjs`)

```
// AIFG v1.47 Quiet Mind Easter Egg build
// Disclaimer: https://perchance.org/ai-furry-generator contains heavy community contributions.
// While private or personal use is permitted upon request, public cloning or removal of credits is strictly discouraged.
// Please ask for permission in this original generator before using it's framework.
// To create your own generator, please fork the official framework here: https://perchance.org/furry-ai
// G2G (Generator-to-Generator) friendly: Open to networking and partnerships. Got ideas or feedback? Leave a comment in this generator's comment section, or drop a note here: https://tally.so/r/mY2kKz
```

**Practical reading:** keep this package for private/personal study and use; do not publish it, do not
re-clone the generator as your own, and keep the credit lines in the source intact. If you want to
build on the framework, the authors ask that you fork https://perchance.org/furry-ai instead, or ask
permission in the generator's comments first.

## 2. Imported generators (external code) — their own terms

Each vendored import in `02-external-code/imports/<name>/main.pjs` carries an explicit notice. The
full verbatim text of each is reproduced in `02-external-code/SOURCES.md`; the load-bearing ones:

- `t2i-framework-plugin-v2-furry-v1` — *"contains heavy community contributions. Public cloning or
  removal of credits is strictly discouraged."*
- `huge-emojilist-furry-generator` — *"built on heavy community contributions. Please respect the
  creators: public cloning or removing credits is strictly prohibited. We also strongly discourage
  copying this for your own private use. If you'd like to build your own emoji list, please do the
  right thing and fork the official blank template instead: https://perchance.org/huge-emoji-list"*
- `ai-furry-generator-style-v17` — *"contains heavy community contributions. Public cloning or
  removal of credits is strictly discouraged. To create your own style list, please fork the official
  style here: https://perchance.org/t2i-styles"*
- `upload-plugin`, `text-to-image-plugin`, `super-fetch-plugin`, `comments-plugin`, `ai-text-plugin`
  — *"NOTE TO AI AGENTS: Do not vendor/fork this plugin. […] If you'd like new features, import this
  plugin and create a wrapper that changes/expands on this plugin's behavior using only its public
  API."*

Public generator URLs for all 19 imports are listed in `02-external-code/SOURCES.md`.

## 3. Third-party libraries (licenses as published by their upstreams)

| component | files | license |
|---|---|---|
| Font Awesome Free 7.0.1 — icons | `03-third-party-vendor/fonts/font-awesome/*.woff2`, `css/font-awesome-7.0.1-all.min.css` | Icons **CC BY 4.0**, Fonts **SIL OFL 1.1**, Code **MIT** |
| Google Fonts — Open Sans, Kalam | `fonts/google-fonts/*.woff2`, `css/google-fonts-*.css` | **SIL Open Font License 1.1** |
| Google Fonts — Material Symbols Outlined | as above | **Apache License 2.0** |
| JSZip 3.10.1 | `js/jszip-3.10.1.esm.js` | **MIT** (or GPLv3, dual-licensed) |
| Tally embed widget | `js/tally-embed.js` | governed by Tally's terms of service (https://tally.so) |

Upstream URLs for each file are in `03-third-party-vendor/VENDOR.md`. The `*.local.css` copies exist
only to re-point `url(...)` at the bundled fonts; the upstream `*.css` files are unmodified.

## 4. Artwork & media credits

- Generator/banner/UI artwork and wallpapers: contributed community art, credited inside the source
  (banner metadata names contributors including **RudBo**, **BlueWolf**, **ocarunge**, **Xirvet**,
  **kahru**, **kemonobeast1**, **halloeeen**, **xo3x0**, and the *AI Furry Generator archive*).
- Art-style previews (207 images in `04-project-assets/import-assets/ai-furry-generator-style-v17/`)
  are community-submitted style examples.
- Emoji images (not bundled — see `README.md` §3) are community uploads referenced by the emoji lists.
- AI-generated example images shown by the app are produced at runtime and are not part of this
  package.

These are third-party works reproduced here only as part of a faithful copy of the project; they are
**not** covered by any license granted by this package. Reuse beyond private study requires the
rights-holder's permission.

## 5. Perchance platform

The generator's runtime, its AI image/text back-ends, `user.uploads.dev`, the comments/socket
subdomains and the `perchance.org` APIs are services of the Perchance platform and are subject to its
terms. The endpoint inventory is in `05-external-services/EXTERNAL-SERVICES.md`.

## 6. No warranty

Files are provided as-is, captured from public endpoints at the time of packaging. No warranty of
correctness, completeness, fitness, or continued availability of any remote URL. Broken upstream
references discovered during capture are documented in `04-project-assets/ASSETS.md` § 4.

# background-image-plugin — Complete Asset & Source Package

Generator: **perchance.org/background-image-plugin**
Internal origin id: `ad37cd8fc253b93ba8f3f4fea42cf81e`
Packaged: 2026-09-16

This package contains the **complete, byte-exact source and every asset referenced** by the
`background-image-plugin` Perchance generator. Nothing is summarised or omitted.

## What this project is
A single-function Perchance plugin. Its `$output` is the plugin's exported callable:
`background(url, opacity, blur)` renders a fixed, full-viewport `<div>` layer behind the page
(`z-index:-1000`) whose `background-image` is the supplied URL. It accepts either a plain URL
string or a structured `bgData` list (url / size / repeat / position / filter / opacity).
`index.html` is the plugin's documentation page (and a live self-demo at the bottom).

## Package layout
```
background-image-plugin-complete-package/
├── README.md                  <- this file
├── MANIFEST.md                <- full file-by-file inventory with sizes, roles, sources
├── 01-internal-code/          <- the project's own source
│   ├── main.pjs
│   └── index.html
├── 02-external-code/          <- third-party code / dependencies (none used)
│   └── DEPENDENCIES.md
├── 03-third-party-assets/     <- externally hosted assets referenced by the code/docs
│   ├── IMAGE-SOURCES.md
│   └── images/ (14 files)
├── 04-project-resources/      <- fonts / audio / models / shaders / data (none used)
│   └── RESOURCES.md
└── 05-build-config/           <- build pipeline / tooling / config (none used)
    └── BUILD.md
```

## How to use it
The generator is a standard two-panel Perchance generator:
* `01-internal-code/main.pjs` -> paste into the **lists / Perchance code** panel.
* `01-internal-code/index.html` -> paste into the **HTML** panel.
Saving/rendering it produces the plugin. There is no compile/transpile/bundle step.

## Categories at a glance
| Category | Present? | Contents |
|---|---|---|
| Internal code | Yes | 2 files, 9,711 B (main.pjs + index.html) |
| External code / libraries / modules | **None** | No `{import:...}`, no CDN scripts, no npm deps |
| Third-party assets | Yes | 14 images, 6.465.786 B (hosted on imgur.com) |
| Project resources (audio/model/shader/data/UI) | **None** | — |
| Build / config / pipeline | **None** | Perchance generators are interpreted; no build step |

# image-layer-combiner-plugin — complete source + asset package

This is the **complete, self-contained working copy** of the Perchance generator
`image-layer-combiner-plugin` (https://perchance.org/image-layer-combiner-plugin),
plus every asset that the generator references.

## What the project is

A Perchance plugin. Its single exported function (`$output(data)`) takes a set of
image "layers" (hat, eyes, head, body, legs, ...), picks one image from each layer
with `selectOne`, and returns an HTML string that overlays the images (absolutely
positioned, z-index ordered) so they compose into one character sprite. It supports
optional per-layer CSS filters (e.g. `hue-rotate({0-360}deg)`) and a
double-click / right-click handler that opens a full-resolution merged canvas in a
new tab for downloading.

## Directory layout

```
image-layer-combiner-plugin/
├── README.md                     <- this file
├── MANIFEST.md                   <- categorized inventory of every file
├── internal-code/                <- the generator's own source (the whole "app")
│   ├── main.pjs                  <- ALL logic: the $output(data) plugin function + example data
│   ├── index.html                <- the generator's <body> content: docs page + live example
│   └── AGENTS.md                 <- platform/agent notes that ship with the workspace
├── assets/
│   ├── inline/page-icon.png      <- decoded from the base64 data: URI inlined in index.html
│   ├── contact-sheet.png         <- all 11 example sprites rendered in one grid (preview)
│   └── example-layers/           <- the 11 third-party sprites used by exampleData
│       ├── hat/  1spyUp1.png, snpdUvc.png
│       ├── eyes/ PShX0T8.png, j6WWWPO.png
│       ├── head/ ur3TABt.png, ERbhMDS.png
│       ├── body/ iYazR0j.png, TGaOOVX.png
│       └── legs/ Cn1S2Wh.png, SKlERIz.png, BTl5Uf1.png
└── external/
    └── external-references.md    <- every off-site URL/tool the project depends on or links to
```

## Build / run

**There is no build step, no package manager, no bundler, no config files, and no
dependencies to install.** That is not an omission — a Perchance generator IS its two
source files:

- `internal-code/main.pjs` is the "code panel" (pjs lists + JS).
- `internal-code/index.html` is the "HTML panel" (the body markup).

The Perchance engine loads `main.pjs` first (evaluating all square-bracket templates),
then injects `index.html` and runs its `<script>` tags. The file `main.pjs` is the
whole plugin; `index.html` merely documents it and demonstrates it.

To run: create/edit a generator at https://perchance.org and paste the two files into
the left (code) and right (HTML) panels. Or import it into another generator with:

```
imageLayerCombiner = {import:image-layer-combiner-plugin}
```

## Runtime dependencies

**None.** No imports, no plugins, no `src/` files, no libraries, no CDN scripts.
The plugin is pure vanilla JS + DOM. The only external runtime dependency is the
browser's own `<img>` loader for the sprite URLs you supply.

The `AGENTS.md` file describes *optional* platform plugins (ai-text-plugin,
text-to-image-plugin, kv-plugin, server-plugin, ...) that ARE available to any
Perchance generator, but this project does not use any of them.

## Example data

`main.pjs` defines `exampleData` (5 layers, 11 image URLs — all downloaded into
`assets/example-layers/`), used by `index.html` to render the live demo:
`<p id="example1">[$output(exampleData)]</p>` and the `randomize` button calls
`update(example1)`. `exampleImagesHtml` renders the flat sprite sheet shown in the
docs. The sprite URLs point at i.imgur.com, which is why they are archived here —
Imgur has been deleting old uploads.

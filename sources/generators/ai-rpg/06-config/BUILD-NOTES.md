# Build notes / how this generator is put together

## There is no build pipeline

Perchance generators are not compiled, bundled or minified. The platform takes exactly two inputs:

* `main.pjs` - the Perchance-js source (imports, `$meta`, list/template definitions, and JS functions written with the
  `name(args) => ...` header syntax).
* `index.html` - the contents of `<body>`: markup plus `<script>` tags and `[square bracket]` template expressions.

At page load the engine (1) resolves every `{import:name}` by fetching that generator, (2) evaluates the whole template -
every square-bracket expression and every list - and only then (3) executes the `<script>` tags in order.
SSR-rendered text lands in the page first, then scripts run against it. That ordering matters a lot in this generator:
for example `window.defaultMusicTracks` (index.html) and the pjs lists that read `responseStyleEl`'s value are split
across the two worlds deliberately.

`main.pjs` is loaded *before* `index.html`, and its top-level names become globals on `root`/the page.

## Dependency resolution

`{import:ai-text-plugin}` etc. are fetched by the platform at render time from `https://perchance.org/<name>`.
The full current source of each one is mirrored in `02-perchance-dependencies/`; they are not compiled into anything.

## Media strategy

Everything the generator plays is hot-linked from `user.uploads.dev` (Perchance file hosting) rather than shipped with
the generator, so the generator itself stays small and the 11.3 GB of music/video is only downloaded on demand by the
user's browser. `ASSET-INDEX.csv` maps every URL to the code that references it.

## Rebuilding this package

1. `GET https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=ai-rpg` -> `{generators: {ai-rpg: {code, imports, ...}}}`
   (the `code` field is `main.pjs`; `index.html` comes from the generator page / editor export).
2. For each name in the transitive import list, fetch `https://perchance.org/<name>` the same way.
3. Scrape `https://user.uploads.dev/file/<32-hex>.<ext>` URLs out of the sources (and `cardImage` out of
   `premade-adventures.json`) and download each one verbatim.
4. Verify with `sha256sum -c SHA256SUMS.txt` at the package root.

## Local development

Open <https://perchance.org/ai-rpg> and click *edit*; or in the Perchance editor paste `main.pjs` + `index.html`.
Unsaved generators run inside a sandboxed emulator for server plugins; `ai-rpg` itself uses no server plugin, so
everything except cross-generator imports works offline in the editor.

## Known quirks worth knowing before editing

* The template renders before scripts run - don't expect a `<script>` above a `[square block]` to have executed first.
* `stopSequences` are used as prompt-engineering tricks ("# Ambient Outro" is never meant to be written; it just
  prevents the model from writing anything after the consequences section).
* The instruction prompt is deliberately ordered static-context -> append-only story text -> per-call task, so the
  server-side prefix cache keeps generation fast. Keep that ordering when editing `sharedInstructionPrefix`.
* The full story, tracked-info block and summary markers live inside the story textarea itself
  (`<tracked_info_placeholder>`, `SUMMARY^n:`), not in a separate data structure.

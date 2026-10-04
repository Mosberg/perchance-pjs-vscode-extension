# AI Story Generator — complete source & asset export

Full, unmodified export of the Perchance generator **`ai-story-generator`**.

| | |
|---|---|
| Generator name | `ai-story-generator` |
| Public page | https://perchance.org/ai-story-generator |
| Runtime (iframe) origin | `https://d4da62dba2215e294c0d13d0fd16ebe5.perchance.org/ai-story-generator` |
| Platform | Perchance (`main.pjs` = perkchance-js data/DSL, `index.html` = page body) |
| Licence of project code | as published on perchance.org |
| Bundled third-party libraries | see `external-code/` (cbor-x, ua-parser-js) and `external-code/cdn-runtime-dependencies.md` |

## What's in this package

```
internal-code/     the generator's own code (everything the author wrote)
  main.pjs         perchance-js: $meta, imports, prompt template, storage/search/export logic
  index.html       page body: markup, styles, and the client-side application scripts
  meta-config.md   the $meta block (SEO/social config) extracted for easy reading

external-code/     code from elsewhere that the generator depends on
  perchance-imports/<name>/main.pjs   verbatim copies of every {import:...}
  cbor.js                             cbor-x@1.6.0 (perchance-hosted copy)
  ua-parser-js-2.0.0-rc.1.min.js      ua-parser-js (perchance-hosted copy)
  tokenizer-tool.js                   tokenizer training/inference utility (dev tool + inlined model)
  cdn-runtime-dependencies.md          every library loaded from a CDN at runtime

assets/            project resources shipped/streamed by the generator
  images/favicon.png
  data/                             word lists, emoji list, story-tag embedding tensors
  media/MEDIA-ASSETS.md + .csv      the 93-track music + animated-background library (links)

docs/              workspace notes (the editor's agent guide)
MANIFEST.md        categorised index of every file, asset and dependency
```

## Running it

There is **no build pipeline, package.json, or bundler** — Perchance generators are authored and executed
directly in the browser. To run this project:

1. Create a new generator at https://perchance.org (settings → new).
2. Paste the contents of `internal-code/main.pjs` into **main.pjs** and
   `internal-code/index.html` into **index.html**.
3. Save. The engine resolves each `{import:...}` by fetching that generator from perchance.org, so the
   `external-code/perchance-imports/` copies are included for reading/auditing rather than for import.
   (If you ever want a fully self-contained build with no external `{import:}` fetches, append a plugin's
   copy verbatim to your own main.pjs and delete its `{import:}` line.)

## Notes

- Only code, config, and small binary/text data are bundled in the zip. The 93 music/animated-background
  files are streamed from Perchance's upload host and total several hundred MB, so they are listed with
  direct download links in `assets/media/MEDIA-ASSETS.md` instead of being duplicated.
- `assets/data/*.bin` are the quantised embedding tensors that power the story-tag/idea suggestion box
  (`index.html` decodes them into `q4`/scales/planes and does LSH lookup).

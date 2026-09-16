# pride-plugin - Complete Project Package

Perchance generator: pride-plugin
Source: https://perchance.org/pride-plugin

A self-contained Perchance plugin that renders a rainbow pride flag image
automatically during June (pride month), and optionally custom flags/text/HTML
on any specific month or day of a month, via an advanced options object.

## What is in this package

    pride-plugin/
    |-- README.md                     <- this file
    |-- ASSETS-MANIFEST.md            <- every file + asset, with hashes
    |-- 01-internal-code/             <- the generator's own code
    |   |-- main.pjs                  <- Perchance code (the `$output` logic + embedded flag)
    |   |-- index.html                <- page HTML (docs page + usage examples)
    |-- 02-external-code/             <- external scripts/libraries/modules (NONE - see note)
    |   |-- README.md
    |-- 03-third-party-assets/        <- third-party assets (NONE - see note)
    |   |-- README.md
    |-- 04-project-resources/         <- assets the generator actually ships
    |   |-- images/
    |   |   |-- rainbow-pride-flag.png        <- decoded from the base64 in main.pjs
    |   |   |-- rainbow-pride-flag.data-uri.txt <- the exact data URI as used in code
    |   |-- README.md
    |-- 05-build-config/              <- build pipeline / config (NONE - see note)
        |-- README.md

## Notes on categories

- **Internal code**: everything lives in two files, `main.pjs` and `index.html`.
  The Perchance engine itself is the runtime and is supplied by the platform
  (no bundler, no package.json, no build step).
- **External code**: this generator imports NOTHING. There are no `{import:...}`
  plugin dependencies, no CDN scripts, and no <script> tags.
- **Third-party assets**: none. All visuals are produced in-code.
- **Project resources**: exactly one asset - a 120x120 PNG rainbow flag,
  stored inline in `main.pjs` as a base64 data URI. It is decoded here to
  `04-project-resources/images/rainbow-pride-flag.png` for convenience.
- **Build/config**: none. Perchance generators are saved and served directly.

## How the plugin works

`main.pjs` defines a single top-level function, `$output(size, forceShow)`,
which Perchance exposes as the importable value of this generator:

1. `$output()` / `$output(size)` - simple mode. Returns the flag <img> with a
   height of `size * 1.4` rem. Only returns it during June (UTC month index 5),
   unless `forceShow` is truthy.
2. `$output(optionsObject)` - advanced mode. `optionsObject` is a Perchance list;
   `options.getPropertyNames` is read, each name's first token is a month name
   and the optional second token is a day of month. The first matching entry is
   returned, else `options.default`, else an empty string.

Usage in a downstream generator:

    pride = {import:pride-plugin}

    [pride()]              // auto: flag in June, nothing otherwise
    [pride(2)]             // 2x size
    [pride(1, true)]       // always show
    [pride(dateText)]      // custom per-month/day content

## Licensing

Generator code authored for Perchance by the generator owner. The rainbow flag
image is a simple public-domain-style national/community flag graphic; the pride
flag is a public-domain symbol. The only outbound link is informational
(https://en.wikipedia.org/wiki/Gay_pride).

# Typewriter Plugin — Complete Project Archive

Generator: https://perchance.org/typewriter-plugin
Contents exported: every file that makes up this project.

## Category index

| Category              | Path                    | Present |
|-----------------------|-------------------------|---------|
| Internal code         | internal-code/          | YES     |
| External code         | external-code/          | none    |
| Third-party assets    | third-party-assets/     | none    |
| Project resources     | project-resources/      | none    |
| Build / config files  | build-config/           | none    |

## Rationale for empty categories

- **External code**: this generator has zero `{import:...}` dependencies. The two
  `{import:typewriter-plugin}` occurrences in index.html are escaped tutorial text
  (\{\import:...\}), not real imports. No CDN scripts, no npm packages, no modules.
- **Third-party assets**: no images, audio, video, fonts, models, shaders, or sprites.
  The only external links are prose hyperlinks to perchance.org and codecademy.com.
- **Project resources**: no JSON data, prefabs, templates, level data, or UI resource files.
  All markup is authored inline in index.html.
- **Build / config files**: none. Perchance generators ship main.pjs + index.html directly;
  there is no bundler, package.json, lockfile, or CI pipeline.

## File inventory

### internal-code/main.pjs      (2578 bytes)
The entire plugin implementation. A `$output` function that:
  1. builds a <span> wrapper carrying the target text / speed / delay as data-* attributes,
  2. injects a one-time <script> (guarded by window.typewriterScriptAlreadyAdded) that
     runs a 50ms-interval ticker,
  3. the ticker walks every .typewriter-plugin-element, reveals `Math.ceil(seconds*speed)`
     characters into .typewriter-vis, and dumps the remainder into an invisible
     .typewriter-invis span so layout width stays stable while typing,
  4. sets data-typewriter-finished="1" (and el.innerText) when done so each element is
     processed exactly once — this is the completion signal other code can poll for.

  Signature: $output(text, speed = 1, delay = 0)

### internal-code/index.html    (1384 bytes)
The generator's <body> contents: a hidden <h1> for SEO, a visible <h1> that
self-demonstrates the plugin on its own title, a usage-instructions card
(Perchance code-panel snippets, argument order, renaming notes), a notes list,
and a <style> block setting the page background and code styling.

## Integrity

- main.pjs  sha256: 62486975b3ecf63638eb916587b29093030f03cd050f549c7ce882d861e2e5c8
- index.html sha256: 736a13607f2c94441cb94e92a41f02940f41b481603922fdd0af55336b1946ef

# 02 — External / third-party code

This generator has **no runtime external code**. It does not import any Perchance
plugin, npm package, CDN script, or vendored library. Nothing is fetched at runtime.

The one external *source* dependency is the algorithm this plugin is derived from:

- Project: **to-title-case** by David Gouch — https://github.com/gouch/to-title-case
- Version pinned in the upstream repo used for this package: **2.2.1** (package.json)
- Commit referenced by this plugin's own docs/attribution: `35d8f2678c6829e5aaff5b7d5af877124acc0ad7`
- License: **MIT** (see `to-title-case/LICENSE`, reproduced in `03-third-party-assets/LICENSE-to-title-case`)

The whole upstream repository at the pinned state is reproduced here byte-for-byte:

```
to-title-case/
  LICENSE
  README.md
  package.json
  package-lock.json
  to-title-case.js      <- the original String.prototype.toTitleCase implementation
  test/index.js
  test/runner.html
  test/tests.json
  .gitignore
```

## How the internal code differs from upstream

`01-internal-code/main.pjs` is a port, not a copy:

1. Upstream installs `String.prototype.toTitleCase` (a prototype mutation, rejected for a
   shared multi-generator page). The port instead exposes a **pure function**,
   `titleCase(inputText, opts)`, so it cannot collide with other code on the page.
2. The body is unchanged: the same `smallWords`, `alphanumericPattern` and
   `wordSeparators` regexes, the same `.split(...).map(...).join('')` pipeline, and the
   same three guard rules (small words, skip first/last, colon/hyphen handling,
   intentional capitalization, URLs).
3. Two Perchance-specific additions:
   - `inputText = inputText.evaluateItem` — unwraps a Perchance list-node object passed
     from a `[square bracket]` block into its plain string.
   - `if(opts !== undefined) return "(error: ...)"` — reserves the second argument for
     future options so a caller passing one gets an explicit error instead of silence.

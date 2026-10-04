# Project resources — examples, links, metadata

## The problem this plugin solves

Perchance's built-in `{a}` is resolved **once, at render time**. Interactive plugins like
`tap-plugin` re-randomize only the node the user taps, leaving the surrounding text alone.
So a template like this:

```
tap = {import:tap-plugin}

output
  That's {a} [tap(animal)]

animal
  antelope
  zebra
  ...
```

can render *"That's an antelope"*, and then a tap turns it into *"That's an zebra"* — because
`{a}` was never told the word changed. The `{a}` choice is baked in; the tapped node is not.

## The fix

```
an = {import:a-an-plugin}
tap = {import:tap-plugin}

output
  That's [an()] [tap(animal)].
```

`[an()]` renders a live `<span>` that watches its neighbours and re-decides `a`/`an` whenever
the following word changes — including when a `tap-plugin` button rewrites it.

## Case variants

```
[an()]                 -> a / an
[an().lowerCase]       -> a / an   (explicit; this is what toString() returns)
[an().lower]           -> a / an   (legacy alias, kept for backwards compatibility)
[an().upperCase]       -> A / AN
[an().titleCase]       -> A / An
[an().sentenceCase]    -> A / An
```

## Behaviour notes

- The article is decided from the **next word after the span**, with leading punctuation,
  whitespace and symbols ignored. Quotes/brackets directly before the word are skipped, so
  `[an()] "apple"` still yields `an`.
- If nothing word-like follows on the same parent, the span renders empty.
- Because it reads the DOM, it re-decides correctly after the surrounding text is rewritten
  by other plugins, not just on first paint.
- It is not a grammatical analyser: it is a statistical model of real usage (see
  `external-code/a-vs-an/SOURCE.md`). It gets acronyms and symbols right far more often than a
  vowel test — e.g. `an hour`, `a university`, `an FBI agent`, `a UFO`.

## Related links (from the generator's listing page)

- Example generator using this plugin with tap-plugin:
  https://perchance.org/tap-plugin-example-a-an-plugin
- `tap-plugin` (the interactive re-randomizer this plugin complements):
  https://perchance.org/tap-plugin
- Plugin directory: https://perchance.org/plugins
- This generator: https://perchance.org/a-an-plugin

## Generator metadata

There is **no `$meta` block** in `main.pjs`, so title/description/tags/social image are
whatever the generator settings on perchance.org hold — they are not files in this package.
The visible page content (`<h1>A/An Plugin</h1>`, the explanation, the notes list, the
`⚄` glyph, and all CSS) lives in `internal-code/index.html`.

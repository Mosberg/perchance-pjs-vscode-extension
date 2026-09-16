# a-vs-an — provenance of the vendored third-party code

## Upstream

| | |
|---|---|
| Project | **a-vs-an** — "Find the English language indeterminate article ("a" or "an") for a word." |
| Author | Eamon Nerbonne (eamon@nerbonne.org) |
| Repository | https://github.com/EamonNerbonne/a-vs-an |
| Live demo | https://eamonnerbonne.github.io/a-vs-an/AvsAnDemo/ |
| Commit vendored | `d893b5b9306658203b820137a9319bd2f5bd874d` (`master`, 2025-02-07, "Merge pull request #189 from devdupont/py-ver") |
| License | **Apache License 2.0** — full text in `LICENSE-Apache-2.0.txt` |
| Files included | `AvsAnDemo/AvsAn-simple.js` and `AvsAnDemo/AvsAn-simple.min.js` (verbatim, CRLF line endings preserved) |

## What the library does

It answers "a or an?" not with a vowel test but with a **statistical model of real English
usage**, built from the July-2014 English Wikipedia text dump. The result is serialized as a
compressed prefix trie: one base-36 string where each node encodes its article choice and its
children. This is why it handles cases a vowel rule cannot:

- `an hour`, `an honest mistake` — silent `h`
- `a university`, `a European`, `a UFO` — vowel spelled, consonant sounded
- `an FBI agent`, `a NASA scientist`, `an NSA analyst` — acronyms read as letter names
- symbols and odd leading characters

The upstream README reports ~4–5 million classifications/second in JS, ~60 ns/word in C#.

## How it is embedded in this generator

The library is **vendored inline, not imported**. `main.pjs` defines its own
`getAOrAnFunction()` which contains the `AvsAnSimple` IIFE body verbatim, and returns the
module object:

```
getAOrAnFunction() =>
  // From: https://github.com/EamonNerbonne/a-vs-an
  var AvsAnSimple = (function (root) {
    var dict = "2h.#2.a;i;&1.N;…";     // <- the dataset (see third-party-assets/)
    function fill(node) { … }
    fill(root);
    return { raw: root, query: function (word) { … } };
  })({});
  return AvsAnSimple;
```

And it is called once, lazily, from `$output()`:

```
if(!window.__aOrAn3472398593759834) window.__aOrAn3472398593759834 = getAOrAnFunction();
let aOrAn = window.__aOrAn3472398593759834;
```

so the trie is decompressed at most once per page load and shared by every `[an()]` call.

### Differences from upstream

| | upstream `AvsAn-simple.js` | inlined in `main.pjs` |
|---|---|---|
| Attribution header | `//by Eamon Nerbonne (from https://eamonnerbonne.github.io/a-vs-an/), Apache 2.0 license` | replaced with `// From: https://github.com/EamonNerbonne/a-vs-an` |
| Outer indentation | tabs at column 0 | body indented under `getAOrAnFunction() =>` |
| Wrapper | `var AvsAnSimple = (function(root){…})({});` at top level | same code, inside the function, followed by `return AvsAnSimple;` |
| `dict` | identical string | identical string |
| `fill()` / `query()` / return object | identical | identical |

The algorithm, dataset, and behaviour are unmodified. No upstream files were edited; the
inlining is the only transformation. `AvsAn-simple.js` and `AvsAn-simple.min.js` are byte-exact
copies downloaded from the pinned commit above.

## Attribution

Apache-2.0 requires the license and attribution notices to be preserved on redistribution.
Recommended notice to keep alongside any copy of this plugin:

```
Contains the AvsAnSimple implementation and dataset from "a-vs-an"
by Eamon Nerbonne (https://github.com/EamonNerbonne/a-vs-an),
licensed under the Apache License, Version 2.0.
The dataset is derived from the July-2014 English Wikipedia text dump.
```

## Also in the upstream repository (not used by this generator)

For completeness, the upstream project also ships: `AvsAn.js` (full version, exact counts),
`itertrie.js`, `A-vs-An-DotNet/` (C# implementations), a Python implementation, and the
`354984si.ngl` English word list used for benchmarking. **None of those are used here** —
this generator only uses `AvsAn-simple`. They are available at the repository above.

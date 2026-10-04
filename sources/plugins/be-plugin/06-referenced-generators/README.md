# Referenced generators

Generators named in the source/docs. None is imported by
`../01-internal-code/main.pjs` — they are included so the package is
self-contained and reproducible.

## be-plugin-example

Linked from `index.html` as the usage example
(https://perchance.org/be-plugin-example). Pattern shown:

    be = {import:be-plugin}
    they = {they|she|he|I}
    output1
      I've heard it said that [they] [be()] a very {import:adjective} person.
    output2
      I think [they] [be("past")] hiding {a} {import:adjective} in their bag.

Source: `be-plugin-example/main.pjs`, `be-plugin-example/index.html`.

## adjective

Transitive dependency of `be-plugin-example` (`{import:adjective}`),
vendored because the example will not run without it.

Source: `adjective/main.pjs`, `adjective/index.html`.

## Not vendored

- `perchance.org/plugins` — the platform plugin directory (a page, not a
  generator).
- `{a}` in the example is Perchance's single-option alternation syntax
  (`{a}` -> "a"), not an import.

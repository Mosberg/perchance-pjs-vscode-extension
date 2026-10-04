# 05 — Build & config files

Perchance generators have **no build step**: `main.pjs` is parsed by the platform's own
engine and `index.html` is the literal contents of `<body>`. There is no webpack/vite/rollup
config, no transpile target, no output directory, and no dependency tree to install.

The only configuration that participates in *this* generator is:

| Concern | Where it lives |
|---|---|
| Public API of the plugin | `main.pjs` — the `$output` declaration (what importers receive) |
| Page markup, styles, and the platform body | `index.html` |
| Generator name / public URL | `window.generatorName` (= `title-case-plugin`), editable in the Perchance generator settings modal — not stored in a file |

Included here for completeness is the upstream **test harness config** (the closest thing
to a build/CI setup in this project's ecosystem), copied byte-for-byte from
`02-external-code/to-title-case/`:

```
package.json        npm metadata; "scripts": { "test": "standard && qunit test" }
package-lock.json   locked install tree for qunit ^2.6.0 + standard ^12.0.0
test/runner.html    QUnit browser runner
test/index.js       Node/qunit entry point
test/tests.json     the fixture table the port must keep passing
```

## Verification recipe

The port is correct iff it reproduces the upstream fixture results. To re-check after any
edit to `01-internal-code/main.pjs`:

1. Open the generator's live page (the Perchance engine is the only runtime needed).
2. Evaluate a case from `test/tests.json`, e.g. input `this is an example` must yield
   `This Is an Example`.

Because upstream asserts on a `String.prototype` method and the port is a free function,
the harness itself is not directly runnable against `main.pjs` — the fixture *data* is the
shared contract, and each row is callable as `titleCase(input) === expected`.

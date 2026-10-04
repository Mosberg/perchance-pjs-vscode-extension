# 02-external-code — Third-party code / dependencies

**This category is intentionally empty: the project has zero external code dependencies.**

Evidence:
* `main.pjs` contains no `{import:...}` statements (no Perchance plugins are pulled in).
* `index.html` contains no `<script>`, `<script src>`, `<link rel="stylesheet">`,
  `@import`, `import(...)`, or `require(...)` of any kind.
* There is no package manager manifest and no bundled library.

The only "external" thing involved in running this generator is the **Perchance platform engine
itself**, which executes `main.pjs` and the template syntax in `index.html`. It is part of the
hosting platform (perchance.org) and is therefore not bundled here — bundling it would be
version-mismatched with the live engine.

If you want the state of the current engine, it is whatever perchance.org ships at load time.

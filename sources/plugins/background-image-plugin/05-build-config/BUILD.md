# 05-build-config

**This category is intentionally empty: there is no build pipeline.**

Perchance generators are interpreted by the platform engine at page load:
* `main.pjs` is parsed by the Perchance list engine.
* `index.html` is rendered as a template, with `[...]` square blocks evaluated.

There is no compiler, bundler, minifier, transpiler, task runner, dev server, CI/CD config,
lockfile, or environment configuration. Deliverable = the two source files, saved in the editor.

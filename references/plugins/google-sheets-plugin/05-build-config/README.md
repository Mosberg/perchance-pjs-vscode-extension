# 05 — Build / config files

**There are none.** This is not an omission; the project genuinely has no build step.

Perchance generators are hosted and executed directly by the Perchance platform:

- `main.pjs` — the lists/DSL file (parsed by the Perchance engine at page load)
- `index.html` — the contents of `<body>` (the platform wraps it in `<html>/<head>/<body>`
  and serves it from `https://<generatorPublicId>.perchance.org/<generatorName>`)

Because the platform compiles/renders these itself, a project like this contains:

- no `package.json` / `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`
- no bundler config (webpack / rollup / vite / esbuild / parcel)
- no transpiler config (babel / tsconfig / swc)
- no minifier or asset pipeline
- no CI config (`.github/workflows`, `.gitlab-ci.yml`)
- no `.env`, no linter/formatter/prettier config
- no Dockerfile / Makefile

Saving in the Perchance editor *is* the deploy step. Editing `main.pjs`/`index.html` and
pressing save publishes the new version at `https://perchance.org/google-sheets-plugin`.

If you are rebuilding this project from the package: copy `01-internal-code/main.pjs` and
`01-internal-code/index.html` into a new Perchance generator and save. That's the whole
"build".

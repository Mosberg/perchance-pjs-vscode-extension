# 05 — Build / config files

**Build pipeline and config files in this package: NONE.**

## How this project is "built"

There is no build step. Perchance generators are authored as plain text in the
platform's editor and executed directly by the Perchance engine:

1. The editor's **`main.pjs`** pane is the generator's pjs source. The engine
   parses it and evaluates the lists/data/functions. Because `main.pjs` defines
   a top-level `$output` function, `{import:super-fetch-plugin}` resolves to
   that function.
2. The editor's **`index.html`** pane is the contents of `<body>` (Perchance
   supplies the `<html>`/`<head>`/`<body>` wrapper). The engine renders the pjs
   first, then runs any inline scripts — this project has none.
3. Saving the generator publishes it to
   `https://perchance.org/super-fetch-plugin`, served inside a per-generator
   iframe at `https://<generatorPublicId>.perchance.org/super-fetch-plugin`.

To deploy a copy, paste the two files into a new generator. That is the whole
pipeline.

## Files that deliberately do NOT exist here

| File | Status |
|------|--------|
| `package.json` | none — no npm |
| `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` | none |
| `node_modules/` | none |
| `.babelrc` / `babel.config.*` | none |
| `tsconfig.json` | none — plain JavaScript, no types |
| `vite.config.*` / `webpack.config.*` / `rollup.config.*` / `esbuild` scripts | none |
| `Makefile` / `build.sh` / `justfile` | none |
| `.eslintrc*` / `.prettierrc*` | none |
| `.github/workflows/*` (CI/CD) | none |
| `Dockerfile` / `docker-compose.yml` | none |
| `.env` / secrets | none — the plugin uses no keys or credentials |
| `.gitignore` / git history | none — authoring happens in the Perchance editor, not a repo |

## Optional quality checks you could run against the source

```sh
# syntax check the plugin implementation
node --check 01-internal-code/main.pjs   # NOTE: main.pjs uses pjs syntax ($output =>), so
                                         # check it in the Perchance editor rather than with node.
```

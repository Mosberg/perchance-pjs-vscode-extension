# build / configuration files

None.

Perchance generators are hosted by the platform and rendered from `main.pjs` + `index.html` directly, so
this project has no build pipeline and no configuration files: no `package.json`, lockfile, bundler
(webpack/rollup/vite/esbuild), transpiler, TypeScript config, ESLint/Prettier config, `.env`, Dockerfile,
or CI workflow.

The only 'configuration' is the authored source itself. The generator declares no `$meta` block, so even
listing metadata is left to the platform defaults.

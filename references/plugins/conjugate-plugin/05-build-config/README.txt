CATEGORY: build / config files
STATUS: EMPTY - this project has no build step and no configuration files.

Perchance generators are served directly by the platform from exactly two source files,
main.pjs and index.html. There is no bundler config (webpack/rollup/vite/esbuild), no
tsconfig, no package.json, no lockfile, no Makefile/task runner, no CI workflow, no linter or
formatter config, and no environment/secret files in the generator itself.

Dependency vendoring was done manually by the plugin author: the minified compromise build
was pasted directly into main.pjs, so no build tooling is involved at any point.

Regarding ../02-external-code/compromise-11.12.4/package.json: that file is the DEPENDENCY's
own npm manifest (compromise v11.12.4), included for provenance. It is not part of this
generator's build configuration and is not used by it.

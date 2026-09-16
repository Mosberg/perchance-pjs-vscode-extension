# Build / config files

**This project has no build pipeline, bundler, transpiler, or config file.**

Perchance generators are not built. `main.pjs` and `index.html` *are* the deployed artifacts:
the platform's engine parses `main.pjs` (pjs list syntax) and injects `index.html` as the page
body, then serves the result at `https://perchance.org/<generator-name>`. There is no
package.json, lockfile, tsconfig, webpack/vite/esbuild config, CI file, or Dockerfile because
none would be read by anything.

`rebuild-package.sh` in this directory is a convenience script that re-zips the source tree
(it documents how this export was assembled; it is not part of the shipped generator).

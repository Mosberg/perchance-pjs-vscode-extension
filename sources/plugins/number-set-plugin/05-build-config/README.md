# Build / config files

**This project has no build / config files.**

There is no build pipeline. Perchance serves `main.pjs` and `index.html` directly and evaluates the pjs (`$output`) at runtime, so there is no bundler, no package.json, no lockfile, no transpiler, no minifier, no CI config, and no toolchain. The only configuration is the `$output` metadata line at the top of `main.pjs`, which declares the list exported when the generator is imported.

See `../README.md` for the complete inventory.

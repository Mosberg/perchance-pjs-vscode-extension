# Build / config files

This project has **no build step and no config files**.

Perchance generators are declarative: `main.pjs` (the Perchance-js code panel) and
`index.html` (the HTML panel) are interpreted directly by the Perchance engine at
page load. There is no bundler, package.json, lockfile, tsconfig, CI pipeline, or
toolchain of any kind.

- Runtime: the Perchance engine (perchance.org), in-browser.
- Dependencies: none (`imports:` count = 0; `<script src>` count = 0).
- Everything the generator needs ships inside the two internal-code files.

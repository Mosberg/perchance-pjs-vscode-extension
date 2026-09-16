# Build / config files

**None.**

- No build step: Perchance evaluates `main.pjs` directly and serves
  `index.html` as-is on save.
- No `package.json`, lockfile, bundler config, tsconfig, CI, or Makefile.
- No `$meta` block in `main.pjs` (listing title/description/tags/image are
  set via generator settings, not declared in code).

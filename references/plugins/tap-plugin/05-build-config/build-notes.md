# Build / configuration notes

Build pipeline:        NONE
Bundler:               NONE
Transpiler:            NONE
Minifier:              NONE
Package manager:       NONE
Lockfile:              NONE
Env/config files:      NONE
CI/CD:                 NONE
Dependencies manifest: NONE

## How compilation actually happens
The Perchance engine, server-side, parses the two source files when the
generator loads:

1. main.pjs
   - Indented hierarchy -> list tree (`animal`, `adjective`).
   - `name(args) =>` headers -> JS functions.
   - Top-level `$output = expr` -> sets what {import:generator} yields
     (here the tap function object).
   - [ ] square blocks -> JS evaluated at render time.
2. index.html
   - The engine evaluates [ ] / { } template blocks in text nodes and in
     non-event attributes BEFORE running <script> tags.
   - <style> is passed through untouched.

## Deploy
Saving in the Perchance editor publishes the generator. There is no artifact
to upload and no target environment to configure.

## Reproducing this package
Copy 01-internal-code/main.pjs and 01-internal-code/index.html into a new
Perchance generator and save.

# Build & config files

None. Perchance generators are interpreted at runtime by the Perchance engine; there is
no compiler, bundler, package.json, lockfile, CI config, or container definition.

## The "build pipeline" is the Perchance editor

    lists editor  <- main.pjs   (pjs: lists, data, functions, plugin imports)
    HTML editor   <- index.html (the CONTENTS of <body> only)

On save, the platform serves the generator inside an iframe at
https://<generatorPublicId>.perchance.org/<generatorName>, with the user-facing page at
https://perchance.org/<generatorName>.

## Deployment (reproduce this generator exactly)

1. Go to https://perchance.org/copy-text-plugin#edit
2. main.pjs   -> internal-code/main.pjs
3. index.html -> internal-code/index.html
4. Save.

## Runtime environment notes

- No network requests are made at runtime by this plugin.
- Uses navigator.clipboard (secure-context/permission dependent) with an
  execCommand('copy') fallback for older or restricted browsers.

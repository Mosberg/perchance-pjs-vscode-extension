# number-set-plugin — Complete Asset Package

Perchance plugin generator: https://perchance.org/number-set-plugin
Public id: 389281e141cb1913c2b20ea0ab284c96
Captured: 2026-09-16T17:51:49.965Z

## What this generator is

A Perchance **plugin** (importable via `{import:number-set-plugin}`). It defines a single
`$output` function that produces *n* non-negative whole numbers summing to `max`, with
optional per-number weights and optional boolean conditions.

```
numberSet = {import:number-set-plugin}

output
  [set = numberSet(3), ""]The population is [set.n1]% orcs, [set.n2]% elves and [set.n3]% humans.
```

Signature: `numberSet(n, max = 100, weights = "", conditions = "")`
Returns `{ n1, n2, ... nN }`, or `{ n1: "(ERROR ...)" }` on unsatisfiable input.

## Package contents (by category)

| Category | Path | Contents |
|---|---|---|
| 1. Internal code | `01-internal-code/` | `main.pjs`, `index.html` — the entire generator |
| 2. External code | `02-external-code/` | none — see that folder's README |
| 3. Third-party assets | `03-third-party-assets/` | none |
| 4. Project resources | `04-project-resources/` | none |
| 5. Build / config | `05-build-config/` | none — Perchance hosts and renders the source directly |

Everything the project consists of is in `01-internal-code/`. The other four categories are
included (with explanatory notes) so it is explicit that nothing was omitted.

## File inventory

- `01-internal-code/main.pjs` — 11358 bytes, 229 lines, sha256 `34f11daeb350a4502d9279121481ff5322be044d9d26fc538ce5449a72c5d60b`
- `01-internal-code/index.html` — 5467 bytes, 121 lines, sha256 `6ae218d5b28b6cc9b41bb5d17d57940ff406be62a4607a960a67b8f065349100`

## Runtime dependencies

The generator declares **zero** `{import:...}` dependencies. At runtime the page loads only:

- `https://perchance.org/lib/perchance-engine-*.js` — the Perchance engine itself (platform-provided, not part of this project).
- `https://static.cloudflareinsights.com/beacon.min.js` — Cloudflare analytics beacon (injected by the Perchance platform, not part of this project).

No npm packages, no CDN libraries, no fonts, no images, no audio, no models, no shaders,
no JSON data files, no build step, no bundler, no toolchain.

## Rebuilding

There is nothing to build. To restore the generator, paste the two files back into a
Perchance generator at the same paths (`main.pjs` and `index.html`) and save.

## Full source

Both files are reproduced verbatim in `01-internal-code/`. See also `MANIFEST.json`
for sizes and hashes.

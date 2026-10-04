# Bug Report Plugin — complete source export

Exported from the Perchance generator **bug-report-plugin** (editable copy in this workspace).
Everything the generator ships or loads at runtime is included below, byte-exact.

## 1. Internal code (the generator itself)

| File | Purpose |
|---|---|
| `internal-code/main.pjs` | The generator's Perchance code. `$output` exports the plugin's public API: `createTemporaryDebugInfoUrl(opts)` and `initAutoErrorCapture()`. |
| `internal-code/index.html` | The generator body (documentation page shown on perchance.org/bug-report-plugin). |

These two files are the entire contents of the generator; pasting them into a new
generator reproduces it exactly (see "Rebuild" below).

## 2. External code (dependencies pulled in at runtime)

The plugin has exactly one static `{import:...}`:

```
dynamicImport = {import:dynamic-import-plugin}
```

Two more dependencies are loaded **lazily** via that dynamic-import plugin, so they
never slow down initial page load for users who never submit a bug report:

| File | How it is loaded | Purpose |
|---|---|---|
| `external-code/dynamic-import-plugin/main.pjs` | static `{import:dynamic-import-plugin}` | Synchronously/async fetches other Perchance generators from `https://perchance.org/api/getGeneratorsAndDependencies` and builds them with `createPerchanceTree`. |
| `external-code/secret-plugin/main.pjs` | `dynamicImport("secret-plugin", "preload"\|"async")` | Public-key (ML-KEM) encryption of the debug payload so browser/device details are not publicly exposed. |
| `external-code/upload-plugin/main.pjs` | `dynamicImport("upload-plugin", "preload"\|"async")` | Uploads the encrypted payload, returning an expiring URL (6 months). |

None of these three have any further imports (verified against the Perchance API), so
the dependency graph is complete — nothing else is fetched to make this plugin work.

## 3. Third-party assets

| File | Source | Notes |
|---|---|---|
| `third-party-assets/ua-parser-js-2.0.0-rc.1/dist/ua-parser.min.js` | `https://user.uploads.dev/file/f2e26ac127c029f401f2a990a4bafbe8.js` (pinned, immutable copy of `https://cdn.jsdelivr.net/npm/ua-parser-js@2.0.0-rc.1/dist/ua-parser.min.js`) | Injected at runtime by `createTemporaryDebugInfoUrl` to detect browser/engine/OS/CPU. License: MIT. |

## 4. Build / configuration files

There is **no build pipeline** — Perchance generators are not compiled or bundled.
`main.pjs` + `index.html` are the source *and* the deployed artifact; the Perchance
engine evaluates `main.pjs` before running `index.html`.

The equivalent of a "config/lockfile" here is `MANIFEST.json`, which records, for every
file above: its size, its SHA-256, and (for runtime-fetched resources) the exact URL it
is fetched from. No `package.json`, bundler config, or CI config exists in this project.

## 5. Runtime external endpoints (not files)

| Endpoint | Used for |
|---|---|
| `https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=...` | dynamic-import-plugin fetching generator source |
| `https://user.uploads.dev/file/f2e26ac127c029f401f2a990a4bafbe8.js` | ua-parser-js |
| `https://perchance.org/secret-plugin` / `https://perchance.org/upload-plugin` | semantics resolved via the Perchance import system |

The plugin requires the developer to supply a **public key** (generated with
`https://perchance.org/public-key-encryption-tool`) when calling
`createTemporaryDebugInfoUrl({publicKey})`; without it the function throws by design.

## Rebuild

1. Create a generator named `bug-report-plugin` (or any name).
2. Copy `internal-code/main.pjs` into its `main.pjs`.
3. Copy `internal-code/index.html` into its `index.html`.
4. Save. The `{import:dynamic-import-plugin}` line resolves automatically from the
   Perchance plugin registry; `secret-plugin` and `upload-plugin` are fetched on demand.
5. Nothing to install, compile, or bundle.

## Manifest

See `MANIFEST.json` for per-file sizes, hashes, and provenance.

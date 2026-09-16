# Build, config & dependencies

## Build pipeline

**There is no build pipeline.** A Perchance generator is source-shipped: the two files
`main.pjs` and `index.html` are executed as-is by the Perchance engine. There is no
bundler, transpiler, minifier, package manager, lockfile, or CI step in this project.

The only "build" that ever happened was a **one-time vendoring** of the moment.js
minified build into `main.pjs` by the generator author (upstream `date-plugin`).

## How the vendoring works (reproducible)

1. Take the official minified build `moment@2.27.0/min/moment.min.js`.
2. Strip its trailing `//# sourceMappingURL=moment.min.js.map` comment (Perchance strips it).
3. Paste it verbatim into `main.pjs` as the single statement on line 12, inside the body
   of `loadPluginCode()`, wrapped as `  (function(window) { ... })(window);`.
4. `$output` lazily calls `loadPluginCode()` once (guarded by
   `window._alreadyLoadedDatePluginCode8934792`), then forwards to `moment(...)`.

To re-run the vendoring:

```sh
curl -O https://cdn.jsdelivr.net/npm/moment@2.27.0/moment.min.js
# paste into main.pjs line 12, wrapped in (function(window){ ... })(window);
```

## Generator configuration

| Setting | Value |
| --- | --- |
| Generator name | `date-plugin` |
| Public URL | https://perchance.org/date-plugin |
| `generatorPublicId` | `80c74164ecebb566d37a0b575625b76b` |
| `$meta` block | none |
| `{import:...}` dependencies | none (moment.js is vendored, not imported) |
| Entry point | `$output` (so `{import:date-plugin}` yields the date function) |

## Dependency inventory

| Dependency | Version | License | How it ships | Location in package |
| --- | --- | --- | --- | --- |
| moment.js | 2.27.0 | MIT (JS Foundation) | Vendored (inlined) into `main.pjs` | `../02-external-dependencies/moment/` |

No other third-party code is used. No CDN is contacted at runtime — the bundle is
fully self-contained, so the plugin works offline and has zero network requests.

# 05-build-config — Build, config and packaging

## Short version

**There is no build pipeline, no bundler, no compiler, no linter config, no
test runner, no CI, and no dependency manifest for the generator itself.**

That is not an omission in this package — it is a property of the platform.
A Perchance generator is *interpreted at page load* by the Perchance engine:

1. The engine loads `main.pjs`, evaluates it as a hierarchical list/template
   program, and exposes its top-level names on `root`.
2. It then renders `index.html` (the contents of `<body>`) as a template,
   evaluating `[square bracket]` blocks, and finally runs its `<script>` tags.
3. `{import:some-generator}` directives are resolved by the engine at load
   time from `https://perchance.org/api/getGeneratorsAndDependencies` — no
   package manager, no lockfile, no `node_modules`, no version pinning.

"Deploying" = pressing save in the editor. The saved `main.pjs` + `index.html`
*are* the artifact. There is nothing else to ship, and therefore no config
files whose contents could be dumped here.

## What is in this folder

| File | Purpose | Part of the generator? |
|---|---|---|
| `BUILD.md` | This document | no — documentation |
| `package.json` | Metadata descriptor for this package (name/version/description/entry points/file list). Provided so tooling and humans have a machine-readable manifest of the deliverable. | no — package metadata |
| `tools/package.mjs` | Reproducible zipper: rebuilds `select-leaves-plugin-complete.zip` (with SHA-256 inventory) from a source tree. | no — handoff tooling |

## Reproducing the zip

`tools/package.mjs` is an ES module written against the harness's worker
filesystem API (`fs.readFile` / `fs.writeTextFile` / `fs.listFiles`) plus
`@zip.js/zip.js` loaded from esm.sh. It is deterministic apart from the
`assembled` timestamp.

```js
// conceptual invocation
await import("./tools/package.mjs"); // builds ./select-leaves-plugin-complete.zip + INVENTORY.md
```

With Node.js (>=18) the same layout can be produced with the standard library:

```sh
# from a directory laid out as described in README.md:
zip -r -X select-leaves-plugin-complete.zip select-leaves-plugin-complete
shasum -a 256 $(find select-leaves-plugin-complete -type f | sort)
```

## Dependency notes (exhaustive)

* `{import:select-leaf-plugin}` — the *only* code dependency. Its source is
  vendored at `02-dependencies/imports/select-leaf-plugin/main.pjs`. Per the
  platform's rules this folder is a read-only reference copy; to change the
  dependency's behaviour you must copy the needed code into `main.pjs` and stop
  importing it.
* No runtime libraries. No `esm.sh`, no CDN `<script src>`, no npm.
* No plugins from the official plugin directory are imported (no `kv-plugin`,
  `upload-plugin`, `comments-plugin`, `ai-text-plugin`, `text-to-image-plugin`,
  `super-fetch-plugin`, `secret-plugin`, `server-plugin`).
* `03-external-generators/` holds sources fetched with the platform API
  `https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=...`
  for the related generators this project links to. They are included for
  completeness of the deliverable; only `select-leaf-plugin` is a real
  dependency.

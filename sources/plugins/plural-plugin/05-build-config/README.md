# (none - no build pipeline)

No build system, bundler, package manager, transpiler, or config files exist: there is no
`package.json`, lockfile, `tsconfig`, vite/webpack/rollup config, Makefile, Dockerfile,
CI workflow, or environment file.

The Perchance platform **is** the runtime and the build:

| Step | What happens |
|------|--------------|
| Source | `main.pjs` (Perchance-JS: lists, data, functions, plugin imports) and `index.html` (the `<body>` contents only) |
| Load | The engine renders the whole template first (evaluating every square block), then executes `index.html`'s `<script>` tags in order |
| Host | `index.html` is served in an iframe at `https://<generatorPublicId>.perchance.org/<generatorName>` |
| Deploy | Saving in the Perchance editor publishes it - there is no artifact to compile |

Runtime services provided by the platform (not declared in this project):
Perchance engine / template renderer, and the generator-name-keyed iframe origin
(`7c04e8eeb9761b097f2a2434504081f2`). Perchance's file host (uploads.dev) is **not** used
because this project has no assets.

There are zero `{import:...}` plugin imports, zero npm dependencies, zero CDN scripts,
and zero web fonts.

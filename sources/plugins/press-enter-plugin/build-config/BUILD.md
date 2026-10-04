# Build & config: NONE

This project has **no build pipeline and no config files**. The list below is an exhaustive
statement of what a build/config inventory would normally contain, and why each is absent.

| Typical build/config file | Present? | Why |
|---|---|---|
| `package.json` / `package-lock.json` | No | No JS package manager or npm dependencies are used. |
| Bundler config (webpack/rollup/vite/esbuild) | No | Perchance renders `main.pjs` + `index.html` directly in the browser; nothing is bundled. |
| TypeScript config (`tsconfig.json`) | No | The project is plain JavaScript in a Perchance `<script>` string. |
| Transpiler config (Babel/.browserslist) | No | No transpilation step. |
| Minifier / uglifier config | No | No minification step. |
| CSS preprocessor (Sass/Less/PostCSS/Tailwind) | No | One inline `<style>` block, written as plain CSS. |
| Task runner (Makefile/Gulp/Grunt/npm scripts) | No | Nothing to run. |
| CI/CD config (.github/workflows, .gitlab-ci.yml) | No | The platform publishes the generator on save. |
| Environment files (.env, .env.local) | No | No secrets, keys, or API tokens are used anywhere in this project. |
| Static host config (netlify.toml, vercel.json, _headers) | No | Hosting is provided by perchance.org. |
| Dockerfile / docker-compose | No | No containerisation. |

## How the project is "built" and shipped

1. Perchance stores the generator as two panels: the lists/pjs panel (source file `main.pjs`) and
   the HTML panel (source file `index.html`).
2. On every page load the platform parses `main.pjs` (indented list tree + `[square bracket]` JS
   expressions) and evaluates it; `$output` determines what the generator *exports*.
3. The exported value (here: a `<script>` element) is injected into the page, and the HTML panel is
   rendered into `<body>`.
4. Consumers activate the plugin by placing `{import:press-enter-plugin}` in their own code, so
   `$output` of this generator is what their page receives.
5. "Saving" in the Perchance editor publishes it to
   https://perchance.org/\<generator-name\> — no build artifact is produced.

## Deploying this source elsewhere

The two files under `internal-code/` are the complete source. To recreate the generator, create a
new Perchance generator and paste `main.pjs` into the lists panel and `index.html` into the HTML
panel. Nothing else is required.

# literal-plugin — Complete Project Export

Generator: **literal-plugin**
Public URL: https://perchance.org/literal-plugin
Exported: 2026-09-16T18:11:46.804Z

## What this project is
A single-purpose Perchance plugin. It exports one function via `$output`:

```
literal(text, opts)
```

- `text` — any string; every `\` / `[` / `]` / `{` / `}` that is not already escaped gets a backslash inserted before it, so those characters are interpreted as *literal* brackets by the Perchance engine instead of as special syntax.
- `opts` — if the string `"+html"` is passed, the result is additionally HTML-escaped (`&`, `<`, `>`, `"`, `'`).

## Package contents & categories

| Category | Contents |
|---|---|
| Internal code | `internal-code/main.pjs`, `internal-code/index.html` |
| External code (3rd-party libs/modules) | none — the generator declares no imports and loads no external scripts |
| Third-party assets | none |
| Project resources (images/audio/models/shaders/animation JSON/prefabs/templates/UI) | none |
| Build / config files | none — no build pipeline, bundler, package.json, or CI config exists |
| Perchance imports | none — `main.pjs` contains no `{import:...}` statements |
| Runtime-injected (platform, not project-owned) | `perchance-engine-491bf81418aa4b69.js` injected by perchance.org |

The only file present in the workspace but **not** part of the generator is `AGENTS.md`, the AI-agent instruction file (harness scaffolding, not shipped with the generator). It is intentionally excluded.

## Deploy / rebuild
There is nothing to build. Copy `internal-code/main.pjs` and `internal-code/index.html` into a Perchance generator's `main.pjs` / `index.html` and save.

## Usage
```
literal = {import:literal-plugin}

output
  Your name is [literal(nameBox.value)] - what a {cool|interesting} name!
```

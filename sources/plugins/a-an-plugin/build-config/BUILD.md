# Build & config — a-an-plugin

## There is no build step

This project has **no** build pipeline, and that is deliberate, not an omission:

- No bundler, transpiler, minifier, or source map.
- No `package.json`, lockfile, `node_modules`, or dependency tree.
- No CI config, Dockerfile, `.env`, or Makefile.
- No test runner, linter config, or formatter config.
- No `src/` asset tree — the generator is exactly two files.
- The generator declares **no `{import:...}` dependencies**, so there is nothing to resolve.

The reason: a Perchance generator *is* its source. `main.pjs` and `index.html` are uploaded
verbatim to the platform, which interprets them. Anything "built" would have to be committed
as source anyway.

## What plays the role of config

| Config-like concern | Where it lives |
|---|---|
| Listing title / description / tags / social image | generator settings on perchance.org (`$meta` is **not** used in this project — there is no `$meta` block in `main.pjs`) |
| Plugin export shape | `$output() =>` at the top of `main.pjs` |
| The one tunable constant | the `dict` base-36 string in `getAOrAnFunction()` |
| Page styling | the `<style>` block at the bottom of `index.html` |
| Randomness | `Math.random()` for the per-call element class |

## Load order (the platform's "pipeline")

1. The Perchance engine parses and evaluates **all of `main.pjs`**, building the generator's
   list tree. `$output` marks the value that importers receive; `getAOrAnFunction` becomes a
   callable on `root`.
2. The engine renders the template: every square block / pjs expression in `index.html` is
   evaluated, and `[an()]`-style calls run here, emitting the placeholder `<span>`s.
   (Note: square blocks evaluate *before* any `<script>` tag, regardless of position.)
3. Then `index.html`'s `<script>` tags execute, in order — this project has none.
4. Each span's `setTimeout(…, 1)` fires, resolving the article and installing its
   `MutationObserver`.

There are no network fetches, no async assets, and no lazy-loaded chunks.

## Redeploying / re-importing

To restore or fork this generator:

1. Open the target generator in the Perchance editor.
2. Paste `internal-code/main.pjs` into the editor's `main.pjs`.
3. Paste `internal-code/index.html` into the editor's `index.html`.
4. Save.

To consume it from another generator, no files are needed — import the plugin by name:

```
an = {import:a-an-plugin}

output
  That's [an()] [animal]
```

## Verification checklist for a redeploy

- `[an()] apple` renders `a apple`? — no: it renders `an apple`. Check both a vowel word
  (`[an()] apple` → `an`) and a consonant word (`[an()] zebra` → `a`).
- An edge case that a naive vowel-test gets wrong: `[an()] hour` → `an`, `[an()] university` → `a`.
- `[an().upperCase] apple` → `A`.
- Live update: pair it with a `tap-plugin` node and confirm the article changes when the
  following word is re-randomized (this is the plugin's raison d'être).

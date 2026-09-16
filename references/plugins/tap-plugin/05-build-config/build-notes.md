# Build notes

There is no build pipeline. Perchance generators are authored directly:

- `main.pjs` is parsed and evaluated by the Perchance engine (list tree +
  square-bracket JS blocks + arrow-function definitions).
- `index.html` is the body markup; the engine evaluates [ ] / { } template
  blocks inside text nodes and attributes before running <script> tags.
- Deployment = saving the generator in the Perchance editor. No bundler,
  no minifier, no package manager, no environment variables, no CI.

## Reproducing this package
Copy `main.pjs` and `index.html` into a generator named `tap-plugin`
(or any name) in the Perchance editor. Because main.pjs defines a
top-level `$output`, any generator that does `{import:tap-plugin}`
receives the tap function itself.

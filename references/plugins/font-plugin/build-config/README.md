# Build & configuration files

**There is no build step.** Perchance generators are interpreted directly by the
platform: whatever is in the editor's `main.pjs` + `index.html` **is** the shipped
artifact. There is no bundler, no package.json, no lockfile, no CI, no minifier.

## Deployment model

| Piece | Role |
|---|---|
| `main.pjs` | pjs code panel: list definitions + JS functions. Parsed and evaluated by the engine. `$output` makes the importable value the font function rather than `root`. |
| `index.html` | the CONTENTS of `<body>` only. Perchance wraps it in `<html><head><body>`. Never add `<html>`/`<head>`/`<body>`. |
| Save button | publishes. Public page: `https://perchance.org/font-plugin`. The code executes in an isolated iframe at `https://<generatorPublicId>.perchance.org/font-plugin`. |
| `{import:font-plugin}` in another generator | the consumer pattern this generator documents; it returns the `$output` function. |

## Runtime configuration surface

For consumers of the plugin (all runtime arguments, no config files):

    font = {import:font-plugin}
    [font(list, fontName)]                    // returns the list wrapped in a styled <span>
    [font(list, fontName, "30px")]            // + size
    [font(list, fontName, "30px", "#ff5252")] // + color
    [font(null, fontName, "25px", "pink")]    // font the whole page (document.body)
    [font(myParagraph, ...)]                  // font a specific element by id

## How to rebuild this package

1. Read `main.pjs` and `index.html` verbatim.
2. `curl -H 'User-Agent: <a modern browser UA>' 'https://fonts.googleapis.com/css?family=Pacifico'`
   (repeat for `Permanent Marker`, `Courgette`), then download every `url(...)` woff2 it lists.
3. Recompute `PROJECT-MANIFEST.json` hashes with any sha256 tool.

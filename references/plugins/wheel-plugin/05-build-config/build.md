# Build / config files

## There is no build pipeline

`wheel-plugin` is authored entirely inside the Perchance editor. Its full "build output" is the two
authoring files themselves:

```
main.pjs    → the generator's lists/code panel (Perchance DSL + JS + vendored libraries)
index.html  → the generator's HTML panel
```

There is **no** `package.json`, lockfile, bundler config, transpiler step, minifier, asset pipeline, CI
config, or dependency manager of any kind — and the platform needs none: saving the generator publishes it.
Consequently the only "build/config" artefacts that can exist for this project are the notes and helper
scripts below (written for this export, not part of the generator).

## How the vendored libraries got into `main.pjs`

Both third-party libraries are pasted inline into the Perchance lists panel as JavaScript inside a
Perchance function body, which is why they are indented by two spaces and why their internals reference
`window.*` explicitly:

* `main.pjs` line 249 `initWinwheel() =>` opens a Perchance function; its body (lines 250–445) defines
  `window.drawImageToCanvasContained`, `window.getArcClippedCanvas`, `window.wheelSegmentSoundsDataUrls`
  (base64 MP3s) and then the vendored Winwheel 2.8.0 build (`window.Winwheel = function(...)`, `window.Pin`,
  `window.Animation`, `window.Segment`, `window.PointerGuide`, `window.winwheel*`).
* `main.pjs` lines 455–462 are top-level in that same function body: the GSAP TweenMax 2.0.2 blob wrapped in
  `let fakeWindow = {}; (function(window){ ... })(fakeWindow);`.

`main.pjs` lines 117–345 define `$output(wheelOptions) => ...`, the function other generators import;
it calls `initWinwheel()` on first use, preloads/clips segment images, builds the Winwheel config object
from the user's `wheelOptions` list, instantiates `new Winwheel(...)` and returns the pointer + `<canvas>`
markup (the canvas has an inline `onclick` that calls `startAnimation()`).

So the "build" is: hand-paste library → adjust for `window` scoping → verify in the live preview.

## Rebuilding / re-verifying this export

`verify-vendored.mjs` (Node ≥ 18, no dependencies) re-derives the vendored sections from `main.pjs` and
checks them against the upstream copies in this package:

```bash
cd 05-build-config
node verify-vendored.mjs            # expects ../01-internal-code/main.pjs etc.
```

It reports, for each library: extracted byte/char counts, SHA-256 of each file, and for GSAP a
whitespace-insensitive equality check against upstream `TweenMax.min.js`. It exits non-zero on mismatch.

`MANIFEST.md` (package root) is generated the same way — sizes + SHA-256 for every file in the package —
so this export can be audited against a later re-download of the generator.

## How to re-create the generator from this package

1. Create a new generator on Perchance and open its editor.
2. Paste `01-internal-code/main.pjs` into the **lists** panel.
3. Paste `01-internal-code/index.html` into the **HTML** panel.
4. Save. Import it elsewhere with `makeWheel = {import:your-generator-name}` and render with
   `[makeWheel(wheelOptions)]`.

No other file is needed — the assets are embedded data URLs and the two libraries are inline.

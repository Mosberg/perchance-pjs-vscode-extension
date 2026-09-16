# 01 - Internal code (project-authored, ships with the generator)

These two files ARE the generator. Perchance concatenates them into an origin-isolated
iframe page at https://<generatorPublicId>.perchance.org/tldraw-plugin . There is no
bundler and no transpile step: `main.pjs` is parsed by the Perchance DSL engine at
page load, and `index.html` is appended to <body> verbatim.

| file | bytes | role |
| --- | --- | --- |
| main.pjs | 6275 | The plugin itself. Defines the top-level Perchance function `$output(opts)`, so `{import:tldraw-plugin}` yields that function on the importing generator's root. Injects its own <style> once, builds the container + loading spinner + lazy iframe wrapper, and installs the fullscreen toggle handler. |
| index.html | 5184 | The plugin's public documentation / demo page (usage snippets, channel docs, containerStyle docs). Also renders a live instance of the plugin via [$output()]. |

## Execution order (important, and easy to get wrong)

1. The engine renders the whole template first. Inside index.html, `[$output()]` is a
   square block, so it runs BEFORE any <script> tag in the same document.
2. `$output(opts)` never touches the DOM directly at call time. It returns HTML text
   containing a single marker span. A `setTimeout(..., 50)` then swaps that span's
   `outerHTML` for the real container. This two-step dance exists because assigning
   during render would break Perchance's node-template tracking used by `update()`.
3. The container is lazy: an IntersectionObserver waits until the canvas is actually
   visible, then replaces the placeholder with the tldraw iframe. The iframe is created
   with display:none (tldraw steals focus on load) and is revealed 1200ms after its
   onload fires, at which point the spinner facade is removed.
4. `window.__alreadyAddedTldrawPluginStuff89435793` guards the one-time global setup, so
   multiple calls to the plugin on one page do not duplicate <style> or handlers.

## Why the marker span instead of returning the container directly

Perchance re-evaluates the template on `update()` (the randomize button, goto-plugin
navigation, etc.). Nodes the engine created itself are replaced; raw DOM we injected is
not. `opts.replacedDuringUpdate === true` skips the marker path entirely and returns the
container markup as-is, which is what makes 'a fresh canvas in every room' possible.

## Channel safety

`channel` is interpolated into both a CSS class name and the tldraw room URL, so it is
validated against /^[a-z0-9\-]*$/ and an error string is returned if it fails.
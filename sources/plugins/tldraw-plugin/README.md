# tldraw-plugin - complete asset & source package

Generated 2026-09-16T17:33:24.207Z from the live generator `tldraw-plugin`
(publicId 63268b16b9c2c8552aa55718d483571c, https://perchance.org/tldraw-plugin).

## What this project is

A Perchance plugin generator that embeds a live, collaborative tldraw whiteboard into any
generator page, via a lazy-loaded iframe pointing at a tldraw.com room derived from the
host generator's name. Multiple named `channel`s give one generator several independent
canvases.

## Category index

| Folder | Category | Contents | Files |
| --- | --- | --- | --- |
| 01-internal-code | Project code | main.pjs (the plugin), index.html (docs + demo) | 3 |
| 02-external-code | External code | Perchance engine, Cloudflare beacon, tldraw embed shell | 4 |
| 03-third-party-assets | Third-party assets | Font Awesome expand icon (extracted), license notes | 2 |
| 04-project-resources | Project resources | (empty by design - no local binary assets) | 1 |
| 05-build-config | Build & config | Pipeline explanation, reproducible packaging recipe | 1 |
| 06-agent-workspace | Workspace config | AGENTS.md (AI helper instructions, not shipped) | 2 |
| - | Manifest | MANIFEST.json - sha256 + byte size + origin of every file | 1 |

## Quick read of the whole project in one screen

- main.pjs exports ONE function: `$output(opts)` -> HTML string.
- It validates `opts.channel` against /^[a-z0-9\-]*$/ (it is interpolated into a CSS
  class and a URL).
- It returns a marker <span>; a 50ms timeout swaps it for the container so Perchance's
  update() node tracking is not corrupted.
- The container holds a spinner facade + a placeholder; an IntersectionObserver swaps the
  placeholder for the tldraw iframe only when scrolled into view.
- The iframe starts hidden (tldraw steals focus), is revealed 1200ms after load, and a
  shared handler moves the wrapper to <body> (position:fixed, z-index 100000000) for
  fullscreen mode, restoring its original parent + inline CSS on exit.
- `opts.replacedDuringUpdate` returns the markup directly so canvases survive/refresh
  correctly across page updates.

## Usage (as documented on the generator's own page)

Perchance code panel:

    tldraw = {import:tldraw-plugin}

HTML panel:

    [tldraw()]

With options:

    tldrawOptions
    	width = 600
    	height = 600
    	channel = general
    	containerStyle = width:50%; height:800px; border:1px solid blue;
    	replacedDuringUpdate = true

    [tldraw(tldrawOptions)]

## Runtime dependency graph

    perchance.org/tldraw-plugin
      +-- perchance engine (02) ........ platform DSL parser + renderer
      +-- cloudflare beacon (02) ....... platform analytics
      +-- iframe -> www.tldraw.com/r/perchance-aUf8Njeo73-<generatorName>-<channel> (02/03)
            +-- tldraw app bundle ...... proprietary, hosted, dynamically loaded
            +-- room state ............. user drawings, stored on tldraw's servers

## Licenses at a glance

- Project code (01): authored by the tldraw-plugin author; no license file was present
  in the workspace, so none is asserted here.
- Perchance engine + platform APIs: Perchance, redistributed here as a reference snapshot
  for auditing only.
- Cloudflare beacon: Cloudflare.
- tldraw app: tldraw license (source-available; see https://github.com/tldraw/tldraw).
- Font Awesome expand icon: CC BY 4.0 (icons), attribution required.

## Caveats

- Anything marked as a snapshot (02) is a point-in-time copy; the engine filename hash
  changes when Perchance ships a new engine.
- Canvas contents are user-generated cloud state and are deliberately NOT included.
- There is no build step to reproduce - see 05-build-config/README.md.
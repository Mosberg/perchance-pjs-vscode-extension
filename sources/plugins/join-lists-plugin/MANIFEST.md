# MANIFEST

All hashes are SHA-256 of the file contents as shipped.

## 01-internal-code/
- main.pjs   — 468 B — Perchance DSL code panel. Defines `$output (...lists)`.
- index.html — 1049 B — Page body: documentation/demo markup + `<style>` block.

## 02-external-code/
- perchance-engine.js — ~115 KB — Minified Perchance runtime engine, loaded from
  https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js

## 03-third-party-assets/
- (none)

## 04-project-resources/
- join-lists-plugin-page.png — full-page render of the live generator.
- rendered-output.html — `document.documentElement.outerHTML` after the engine
  evaluated every square/code block (includes engine-injected inline scripts).

## 05-build-config/
- (none)

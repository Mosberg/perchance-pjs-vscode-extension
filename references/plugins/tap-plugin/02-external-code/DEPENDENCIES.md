# Dependency & Asset Audit

## Runtime imports (external code)
NONE.

The workspace contains exactly three files: `main.pjs`, `index.html`,
and the platform-supplied `AGENTS.md` (agent instructions, not shipped).
No `{import:...}` line appears anywhere in main.pjs.

## Referenced-but-not-imported generators
These appear ONLY as hyperlinks in the tutorial text of index.html.
They are not loaded, fetched, or bundled by this generator:
- a-an-plugin            -> https://perchance.org/a-an-plugin
- locker-plugin          -> https://perchance.org/locker-plugin
- nestable-tap-plugin    -> https://perchance.org/nestable-tap-plugin
- multiple-independent-outputs-example
- tap-plugin-example, tap-plugin-example-no-tap, tap-plugin-example-a-an

## Libraries / CDNs / npm
NONE.

## Fonts, images, audio, video, 3D models, shaders
NONE.

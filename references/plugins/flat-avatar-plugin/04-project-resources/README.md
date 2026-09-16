# Project resources

**This folder is empty by design.**

The generator ships exactly two files (main.pjs and index.html) and contains no standalone
resource files of any kind:

| resource category | present? | why |
|---|---|---|
| images / sprites / textures | no | all artwork is inline SVG emitted by React components (see ../03-third-party-assets) |
| audio / music / voice | no | none used |
| 3D models / meshes / rigs / animations | no | none used |
| shaders (GLSL/WGSL/HLSL) | no | no canvas or WebGL; avatars are DOM + SVG |
| fonts | no | inherits the host page's default font stack |
| JSON / CSV / XML data | no | the option catalogs are Perchance lists (segments/01) and JS arrays inside the bundle |
| HTML templates / partials | no | index.html is the only markup, and it is a shipped file, not a template |
| prefabs / level data / config data | no | none used |
| icons / favicons | no | none (the platform provides the page chrome) |

So if you are looking for "the assets", they are:
1. `01-internal-code/main.pjs` — code + inlined libraries + all artwork data
2. `01-internal-code/index.html` — the only markup, and its embedded documentation text

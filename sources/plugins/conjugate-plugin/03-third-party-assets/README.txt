CATEGORY: third-party assets
STATUS: EMPTY - the project contains no files of this kind.

Searched for and confirmed absent: images (png/jpg/gif/webp/svg/ico), audio (mp3/ogg/wav),
video, fonts (woff/ttf), 3D models (gltf/glb/obj/fbx), textures, sprites, spritesheets,
shaders (glsl/wgsl), animations, JSON/CSV/XML data files, prefabs, page/UI templates, and
generic UI resource files.

Evidence: the generator source tree consists of exactly two files - main.pjs and index.html.
index.html references zero external URLs for assets; its only links are the internal Perchance
pages /conjugate-plugin-example and /plugins. The one non-ASCII glyph on the page is the
Unicode die-face character U+2684 (with U+FE0E variation selector), drawn by the system font.

The single third-party code dependency (compromise v11.12.4, MIT) is code, not an asset, and
lives in ../02-external-code/.

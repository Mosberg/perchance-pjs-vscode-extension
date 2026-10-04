# Build / config

This project is a Perchance generator: there is no compiler, bundler or package manager in the loop. "Building" means assembling three parts and letting the Perchance engine render them.

## 1. What the build consists of

| Artifact | Role |
| --- | --- |
| `../01-internal-code/main.pjs` | The Perchance **config layer**: `$meta` (title, description, tags, listing/social image, minimal header) and the four `{import:...}` plugin bindings. Top-level names here become globals (`root.createServerSocket`, `root.commentsPlugin`, `root.generateText`, `root.generateImage`). |
| `../01-internal-code/index.html` | The **application**: all CSS, DOM/HUD, the server-plugin script, and the single client ES module that contains the whole game. |
| `../01-internal-code/src/` | The generator's persistent file tree — `README.md` (dev doc) and `Midnight_Ascent.mp3` (a track the generator serves itself). |
| `../02-external-code/imports/` | Vendored copies of the plugin sources resolved by the `{import:...}` lines. |
| `../03-third-party-assets/` | Vendored `three@0.160.0` ESM build (the runtime CDN import is `https://esm.sh/three@0.160.0`). |
| `../04-project-resources/` | Uploaded media mirrored byte-exact (audio, images). |

## 2. Assembly / run order (Perchance engine)

1. `main.pjs` is evaluated first; `$meta` is consumed by the platform and the plugin imports are registered on `root`.
2. The whole `index.html` template is rendered (square-block/`[js]` expressions evaluate).
3. Only **then** the page's `<script>` tags execute, in document order: the `<script type="text/x-server-plugin">` block is taken by the server-plugin, then the client `<script type="module">` boots the game.

Practical consequence: code inside `index.html` modules must not assume anything set by a square block lower in the file — and any value a square block needs must not come from a script.

## 3. Reproducing the generator

1. Create/open a Perchance generator.
2. Paste `../01-internal-code/main.pjs` into `main.pjs`.
3. Paste `../01-internal-code/index.html` into `index.html`.
4. Recreate the `src/` tree from `../01-internal-code/src/`.
5. Load the page. Plugins resolve by name; three.js loads from `esm.sh`; media loads from `user.uploads.dev`.

## 4. Package contents (complete tree)

```
zen-zombie-garden-complete-package/
|-- 01-internal-code/
|    |-- src/
|    |    |-- Midnight_Ascent.mp3   (4.00 MB)
|    |    |-- README.md   (34.0 KB)
|    |-- index.html   (1.01 MB)
|    |-- main.pjs   (554 B)
|-- 02-external-code/
|    |-- imports/
|    |    |-- ai-text-plugin/
|    |    |    |-- main.pjs   (56.7 KB)
|    |    |-- comments-plugin/
|    |    |    |-- main.pjs   (37.4 KB)
|    |    |-- server-plugin/
|    |    |    |-- main.pjs   (31.1 KB)
|    |    |-- text-to-image-plugin/
|    |        |-- main.pjs   (37.1 KB)
|    |-- EXTERNAL-DEPENDENCIES.md   (4.0 KB)
|-- 03-third-party-assets/
|    |-- three-0.160.0/
|    |    |-- three.module.js   (1.21 MB)
|    |-- LICENSE-NOTICE.md   (2.3 KB)
|-- 04-project-resources/
|    |-- audio/
|    |    |-- music/
|    |    |    |-- calling-cards/
|    |    |    |    |-- blackout.mp3   (3.96 MB)
|    |    |    |    |-- blue-moon.mp3   (3.81 MB)
|    |    |    |    |-- chaos-glitch.mp3   (3.96 MB)
|    |    |    |    |-- crimson-howl.mp3   (3.99 MB)
|    |    |    |    |-- fatal-error.mp3   (3.83 MB)
|    |    |    |    |-- red-static.mp3   (3.84 MB)
|    |    |    |    |-- sakura-serenade.mp3   (2.67 MB)
|    |    |    |    |-- smoke-card.mp3   (3.93 MB)
|    |    |    |    |-- solar-halo.mp3   (3.66 MB)
|    |    |    |    |-- star-glitch.mp3   (3.57 MB)
|    |    |    |    |-- zen-zombie.mp3   (3.98 MB)
|    |    |    |-- maps/
|    |    |        |-- bamboo-forest.mp3   (3.91 MB)
|    |    |        |-- crimson-shrine.mp3   (3.73 MB)
|    |    |        |-- moonlit-zen-garden.mp3   (2.98 MB)
|    |    |        |-- undertale-the-ruins.mp3   (3.99 MB)
|    |    |-- sfx/
|    |        |-- weapons/
|    |            |-- handgun-click.mp3   (26.4 KB)
|    |            |-- handgun-movement.mp3   (19.6 KB)
|    |            |-- handgun-release.mp3   (8.4 KB)
|    |            |-- laser-cannon.mp3   (40.0 KB)
|    |            |-- laser-shot.mp3   (28.7 KB)
|    |            |-- revolver-spin.mp3   (7.5 KB)
|    |            |-- shotgun-hard-pump.mp3   (13.6 KB)
|    |            |-- shotgun-long-pump.mp3   (27.0 KB)
|    |            |-- shotgun-pump.mp3   (14.4 KB)
|    |-- images/
|    |    |-- card-cosmic-spiral.jpg   (85.0 KB)
|    |    |-- card-flowery.jpg   (38.6 KB)
|    |    |-- card-thunder-strike-banner.jpg   (84.8 KB)
|    |    |-- card-thunder-strike.jpg   (103.0 KB)
|    |    |-- social-preview.jpg   (95.3 KB)
|    |    |-- weapon-cid-slime-sword.png   (116.6 KB)
|    |    |-- weapon-real-knife.png   (102.5 KB)
|    |-- ASSET-INVENTORY.md   (7.8 KB)
|-- 05-build-config/
|    |-- build-package.mjs   (8.1 KB)
|    |-- BUILD.md   (5.4 KB)
|    |-- SAVE-DATA-KEYS.md   (5.8 KB)
`-- MANIFEST.json   (digest index for every file above)
`-- README.md   (22.2 KB)
```

## 5. Regenerating this archive

`build-package.mjs` is the pipeline that produced this package: it scans the source for every external reference, downloads each one byte-exact, verifies magic bytes by type, copies the internal tree, computes SHA-256 for every file, writes `MANIFEST.json`, and zips the result. Run it (Node 18+, no dependencies beyond `node:fs`/`node:zlib` helpers) from the directory that holds `main.pjs` + `index.html` + `src/`, adjusting `OUT` if desired.

## 6. Runtime data / save schema

59 `localStorage` keys under the `zzg_*` namespace hold all player state (progression, loadout, cosmetics, settings, keybinds, custom maps, multiplayer identity). Full table with source lines: `SAVE-DATA-KEYS.md`. Player-authored maps are the one user-generated data structure: `zzg_custom_maps` stores `[{id, name, size, theme, items:[{type,x,z,rot,sub}], created}]`.

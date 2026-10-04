# 04-assets — Project asset inventory

This file is the complete answer to "what images, audio, models, shaders,
animations, JSON data, prefabs, templates, or UI resources does this project
use?" — there are none. This is recorded explicitly (rather than by simply
leaving the folder empty) so that the absence is documented and verifiable
rather than an apparent gap in the package.

| Asset category | Count | Notes |
|---|---|---|
| Images (`png`, `jpg`, `webp`, `svg`, `gif`, `ico`) | 0 | The UI uses only emoji (🌿 🍃 🍂) as text and CSS backgrounds (`background:#eee`, `background:white`) |
| Audio (`mp3`, `ogg`, `wav`, `m4a`) | 0 | No sound |
| Video (`mp4`, `webm`) | 0 | No video |
| 3D models (`glb`, `gltf`, `obj`, `fbx`, `stl`) | 0 | No 3D |
| Shaders (`glsl`, `wgsl`, `vert`, `frag`) | 0 | No WebGL/WebGPU |
| Animations (sprite sheets, CSS keyframes, Lottie) | 0 | No animation; the docs pages are static |
| JSON / YAML / CSV / XML data | 0 | All seed data lives inline in `main.pjs` as Perchance lists |
| Fonts (webfonts, `@font-face`) | 0 | System font stack only |
| Prefabs / templates | 0 | n/a |
| Generated assets (runtime `generateImage`, `generateText`, TTS) | 0 | No `text-to-image-plugin`, no `ai-text-plugin`, no uploads |
| Persistent user data (kv / IndexedDB / localStorage / OPFS) | 0 | Stateless; nothing is stored |
| API keys / secrets | 0 | None required or present |
| External network calls at runtime | 0 | No `fetch`, no `superFetch`, no sockets, no `{import:}` beyond `select-leaf-plugin` |

## Externally-hosted resources referenced

The only external resources referenced anywhere in the project are
**hyperlinks** in the docs page (no assets loaded into the page):

| URL | Type | Where |
|---|---|---|
| https://perchance.org/select-leaf-plugin | link | `index.html` body text |
| https://perchance.org/select-leaves-plugin | link | `index.html` body text |
| https://perchance.org/select-leaves-plugin-example#edit | link | `index.html` body text |
| https://perchance.org/consumable-leaf-list-plugin | link | `index.html` body text |
| /plugins | link | `index.html` body text |

And one **code-level** external dependency, which is not fetched by the browser
directly but resolved by the Perchance engine:

| Dependency | Type | Source included at |
|---|---|---|
| `select-leaf-plugin` | `{import:...}` (Perchance plugin) | `02-dependencies/imports/select-leaf-plugin/main.pjs` and `03-external-generators/select-leaf-plugin/` |

## Inline "assets" that do exist (inside HTML/CSS)

For completeness, these are the style/UI resources used — all inline, all
plain CSS, no files:

* `body { background:#eee; }`
* `code { background-color:#eee; padding:0.1em 0.2em }`
* `ul li { margin-top:0.3em; }`
* A white card: `background:white; border-radius:2px; padding:1em; max-width:650px; margin:0 auto`
* Emoji used as decoration: `🌿` (h1), and `🍃`/`🍂` in the sibling plugin pages.

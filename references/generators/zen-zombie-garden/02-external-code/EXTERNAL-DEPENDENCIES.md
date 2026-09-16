# External dependencies (everything not authored in this project)

Two kinds of dependency: **Perchance plugins** (vendored in full under `imports/`) and **remote runtime resources** (CDN / platform / uploaded media).

---

## 1. Perchance plugins — declared in `main.pjs`

```pjs
createServerSocket = {import:server-plugin}
commentsPlugin = {import:comments-plugin}
generateText = {import:ai-text-plugin}
generateImage = {import:text-to-image-plugin}
```

| Import name | Public page | Vendored source | Bytes | Used for |
| --- | --- | --- | --- | --- |
| `server-plugin` | `https://perchance.org/server-plugin` | `imports/server-plugin/main.pjs` | 31,881 | `root.createServerSocket()` — the authoritative multiplayer room server in `index.html` (`<script type="text/x-server-plugin">`, lines ~1414–1742): durable room registry, room list broadcast, chat + player-state relay, duo/squad match control. |
| `comments-plugin` | `https://perchance.org/comments-plugin` | `imports/comments-plugin/main.pjs` | 38,261 | `root.commentsPlugin(...)` — community comments/chat surface. |
| `ai-text-plugin` | `https://perchance.org/ai-text-plugin` | `imports/ai-text-plugin/main.pjs` | 58,048 | `root.generateText(...)` — AI text generation (streaming, `onChunk`). |
| `text-to-image-plugin` | `https://perchance.org/text-to-image-plugin` | `imports/text-to-image-plugin/main.pjs` | 37,978 | `root.generateImage(...)` — AI image generation (uses `root.generateImage`; the game's shipped art is pre-generated, see `../04-project-resources/`). |

Plugin source is the platform-distributed code; it is included here so the dependency set is complete and readable. The Perchance runtime itself (`perchance.org/<generatorName>`) is platform-hosted and is **not** redistributable in this archive — the generator page resolves these imports by name at load time.

---

## 2. Remote runtime resources loaded by `index.html`

### 2.1 JavaScript library

| Library | Version | Exact URL in source | Vendor copy here |
| --- | --- | --- | --- |
| three.js | 0.160.0 (ESM) | `https://esm.sh/three@0.160.0` | `../03-third-party-assets/three-0.160.0/three.module.js` (upstream MIT build from `https://unpkg.com/three@0.160.0/build/three.module.js`, 1,272,972 B) |

This is the only third-party JS the game loads. Everything else (`renderer`, `scene`, physics, AI, audio, input, UI) is implemented in `index.html`.

### 2.2 Font / preconnect hints

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

Preconnects only — no webfont stylesheet is requested, so the game renders with system font stacks. No font files are needed.

### 2.3 Uploaded media (`user.uploads.dev`)

All 31 media assets the game loads from the Perchance upload host are mirrored byte-exact in `../04-project-resources/` with their original URLs recorded. See `../04-project-resources/ASSET-INVENTORY.md`.

- 4 map music tracks (Moonlit Zen Garden, Crimson Shrine, Bamboo Forest / Custom Map, Undertale: The Ruins)
- 11 calling-card music tracks
- 9 weapon SFX (handgun click/release/movement, shotgun pump ×3, revolver spin, laser shot/cannon)
- 5 calling-card/social images
- 2 weapon art PNGs (Real Knife, Cid's Slime Sword)

The one additional track (`src/Midnight_Ascent.mp3`) is generator-local, not remote.

### 2.4 `$meta` image

`main.pjs` sets `image = https://user.uploads.dev/file/04c43cd6037c6ce20fe8b28c7b266700.jpg` (mirrored as `04-project-resources/images/social-preview.jpg`).

---

## 3. Runtime dependency summary

| Layer | Provided by | Ships in this package |
| --- | --- | --- |
| Generator page / engine / template rendering | Perchance platform | No (platform-hosted) |
| Plugin imports (4) | Perchance platform, source vendored | Yes — `imports/` |
| three.js 0.160.0 | `esm.sh` CDN | Yes — `03-third-party-assets/` |
| Media (audio/images) | Perchance upload host | Yes — `04-project-resources/` |
| Google Fonts preconnect | Google | Not needed (no webfont loaded) |

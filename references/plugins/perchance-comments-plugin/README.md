# Perchance Comments Plugin — Complete Source & Asset Package

Complete, self-contained export of this generator (workspace files `main.pjs` + `index.html`)
plus every binary asset referenced anywhere in the source.

## What this project is
This generator IS the **comments-plugin** for Perchance — a drop-in comments/chat widget
embedded in a cross-origin iframe (`https://comments-plugin.perchance.org/embed/...`).
`main.pjs` defines the `$output(opts)` entry point (the plugin itself); `index.html` is the
full documentation/tester page served at the generator's own URL.

## Package layout (by category)

### 1. Internal code (this generator's own source)
- `internal-code/main.pjs`  — the plugin implementation ($output entry point, channel-rule
  parser, iframe lifecycle, postMessage protocol, programmatic submit/ban API). 680 lines.
- `internal-code/index.html` — the docs page + live demos + inline admin-password-hash
  generator script (passwordWords list, updatePasswordHash, sha256). 471 lines.

### 2. External code (dependencies)
- None vendored locally. The plugin's authoritative chat backend and the embed iframe are
  **server-side / remote** and are intentionally NOT part of this source:
  - iframe: `https://comments-plugin.perchance.org/embed/<folderName>`
  - fonts (optional, only if the `loadFonts` option is used): Google Fonts, loaded by the
    embed at runtime, e.g. `Pacifico`, `DotGothic16`, `Syne Mono`.
- No `{import:...}` plugin imports, no npm/CDN modules, no build step.

### 3. Third-party assets
- None bundled. All image assets below belong to the Perchance upload host
  (`user.uploads.dev`) and are archived here for completeness/offline use.

### 4. Project resources (assets referenced by the source)
| File | Original URL | Used for |
|---|---|---|
| `assets/emojis/cat_jam.webp` | https://user.uploads.dev/file/a43d0b52d94c91dddb00cf157dd8c989.webp | custom emoji `:catjam:` + the 🎵 icon in the "Custom Emojis" heading |
| `assets/emojis/crythumbsup.png` | https://user.uploads.dev/file/14c78e8fbd9767e69a6b86d26817bacb.png | custom emoji `:crythumbsup:` |
| `assets/emojis/kekw.png` | https://user.uploads.dev/file/ac26ce88558188d32dc08b2529a29a31.png | custom emoji `:kekw:` (tags lol,lmao) |
| `assets/emojis/huh.webp` | https://user.uploads.dev/file/45f7c9e776b916ec90f39949c06af5f5.webp | custom emoji `:HUH:` (docs example only) |
| `assets/backgrounds/message-feed-background.jpg` | https://user.uploads.dev/file/856ec8cf14a408f8fa94f57840443b32.jpg | `messageFeedStyle` demo background |

Note: custom emojis are **only accepted from the perchance upload host** (`perchance.org/upload`);
other hosts are not supported by the embed.

### 5. Build / config files
- None. No package.json, bundler, transpiler, or task runner. There is no build pipeline —
  `main.pjs` and `index.html` are shipped as-is by the Perchance editor.
- Extended docs for the plugin live inline in `internal-code/index.html` (the generator's own
  documentation page), which doubles as a live demo/tester for every option.

## Running / embedding

```
commentsPlugin = {import:comments-plugin}   // in the Perchance code panel
[commentsPlugin()]                          // in the HTML panel
```

```js
// or programmatically, with options:
commentOptions
  width = 300
  height = 350
  channel = general-chat
  customEmojis
    catjam = https://user.uploads.dev/file/a43d0b52d94c91dddb00cf157dd8c989.webp
```

## Provenance / warnings
- `internal-code/main.pjs` carries an upstream author note: **do not fork/vendor this plugin** —
  its client code is coupled to server-side code and will break when the server is updated.
- The admin password-hash generator in `index.html` derives the hash as
  `sha256("perchance-comments-plugin|" + password)`. Never ship the plaintext password.

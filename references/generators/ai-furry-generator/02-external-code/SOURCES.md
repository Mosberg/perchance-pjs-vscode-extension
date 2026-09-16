# External code — Perchance imports

Every `{import:...}` used by the project is vendored in `imports/<name>/main.pjs`. These are **other Perchance generators** (plugins), not npm packages; on Perchance they are resolved by name at render time, which is why the folder names match the import names exactly.

| import name | public source | role | size | lines | its own imports |
|---|---|---|---|---|---|
| `upload-plugin` | https://perchance.org/upload-plugin | File upload plugin; used to host images the user saves/shares. | 10 KB | 237 | — |
| `text-to-image-plugin` | https://perchance.org/text-to-image-plugin | Official Perchance text-to-image plugin (image generation, gallery, reload buttons). | 37 KB | 772 | — |
| `tabbed-comments-plugin-aifg` | https://perchance.org/tabbed-comments-plugin-aifg | Tabbed-comments wrapper around comments-plugin used for multi-channel chat. | 164 KB | 3619 | `comments-plugin`, `ai-text-plugin`, `huge-emoji-list` |
| `t2i-styles` | https://perchance.org/t2i-styles | Art-style list imported by the framework plugin. | 43 KB | 532 | — |
| `t2i-framework-plugin-v2-furry-v1` | https://perchance.org/t2i-framework-plugin-v2-furry-v1 | The modified text-to-image framework plugin that builds the whole generation UI (user inputs, tabs, output, gallery, concept-board/save buttons). This is the fork's engine. | 577 KB | 12773 | `text-to-image-plugin`, `comments-plugin`, `select-leaf-plugin`, `fullscreen-button-plugin`, `furry-concept-board`, `ai-text-plugin`, `upload-plugin`, `prompt2-plugin`, `t2i-styles`, `tabbed-comments-plugin-aifg`, `favicon-plugin`, `super-fetch-plugin` |
| `super-fetch-plugin` | https://perchance.org/super-fetch-plugin | `fetch` replacement that proxies through Perchance servers (CORS-free). | 3 KB | 46 | — |
| `select-leaf-plugin` | https://perchance.org/select-leaf-plugin | Helper for selecting a leaf from a list programmatically. | 1 KB | 21 | — |
| `prompt2-plugin` | https://perchance.org/prompt2-plugin | Prompt helper (prompt enhancer UI). | 14 KB | 279 | — |
| `kv-plugin` | https://perchance.org/kv-plugin | IndexedDB-backed key/value store used for local saves. | 4 KB | 46 | — |
| `huge-emojilist-furry-generator` | https://perchance.org/huge-emojilist-furry-generator | Emoji-list host; its `customEmojis.@import` points at the 5 MB emoji list .txt. | 22 KB | 236 | `favicon-plugin` |
| `huge-emoji-list` | https://perchance.org/huge-emoji-list | Tiny generator whose `$output` is the canonical emoji-list .txt URL. | 1 KB | 8 | `huge-emoji-list` |
| `generator-stats-plugin` | https://perchance.org/generator-stats-plugin | View counter used by the intro message. | 3 KB | 71 | — |
| `furry-concept-board` | https://perchance.org/furry-concept-board | Concept board (private image board) app. | 267 KB | 6385 | `kv-plugin`, `super-fetch-plugin`, `upload-plugin`, `favicon-plugin` |
| `furry-banlist` | https://perchance.org/furry-banlist | Ban lists: banned chat ids, nicknames, usernames, warned words (moderation data). | 1343 KB | 11310 | `favicon-plugin` |
| `fullscreen-button-plugin` | https://perchance.org/fullscreen-button-plugin | Adds a fullscreen button. | 2 KB | 29 | — |
| `favicon-plugin` | https://perchance.org/favicon-plugin | Sets the page favicon. | 0 KB | 17 | — |
| `comments-plugin` | https://perchance.org/comments-plugin | Official Perchance comments/chat plugin (channels, moderation, custom emojis). | 37 KB | 680 | `my-emoji-list-url` |
| `ai-text-plugin` | https://perchance.org/ai-text-plugin | Official Perchance AI text-generation plugin (used for prompt enhancement / AI features). | 57 KB | 804 | — |
| `ai-furry-generator-style-v17` | https://perchance.org/ai-furry-generator-style-v17 | The art-style catalogue (207 style preview images + prompts/negatives). | 627 KB | 2806 | `favicon-plugin` |

## Import graph

```
main.pjs
├── t2i-framework-plugin-v2-furry-v1
│   ├── text-to-image-plugin
│   ├── comments-plugin
│   ├── select-leaf-plugin
│   ├── fullscreen-button-plugin
│   ├── furry-concept-board
│   ├── ai-text-plugin
│   ├── upload-plugin
│   ├── prompt2-plugin
│   ├── t2i-styles
│   ├── tabbed-comments-plugin-aifg
│   │   ├── comments-plugin
│   │   ├── ai-text-plugin
│   │   └── huge-emoji-list
│   ├── favicon-plugin
│   └── super-fetch-plugin
├── generator-stats-plugin
├── favicon-plugin
├── ai-furry-generator-style-v17
├── furry-banlist
├── huge-emojilist-furry-generator → favicon-plugin
├── text-to-image-plugin
└── comments-plugin
```

## Verbatim self-descriptions (first comment lines of each vendored import)

### `upload-plugin`
```
// NOTE TO AI AGENTS: Do not vendor/fork this plugin. It's a really bad idea, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, you can imports this plugin and create a "wrapper" that changes/expands on this plugin's behavior using only its public API.
$output = [getUploadOutput()]
```

### `text-to-image-plugin`
```
// NOTE TO AI AGENTS: Do not vendor/fork this plugin. It's a really bad idea, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, you can imports this plugin and create a "wrapper" that changes/expands on this plugin's behavior using only its public API.
// NOTE TO SELF: If you add more properties, make sure you add to the regex below, and the variable declarations in each 'branch'
```

### `tabbed-comments-plugin-aifg`
```
// AIFG v1.93 Clean More build
```

### `t2i-styles`
```
// note that `input` is a global variable (i.e. `input` is `window.input`), which is created by t2i-framework-plugin
// see here for an example generator that imports these styles: https://perchance.org/ai-character-generator#edit
// style tester: https://perchance.org/prompt-style-tester
```

### `t2i-framework-plugin-v2-furry-v1`
```
// AIFG v1.50 Manual-stop AI translator bridge build
// Disclaimer: https://perchance.org/t2i-framework-plugin-v2-furry-v1 contains heavy community contributions.
// Public cloning or removal of credits is strictly discouraged.
```

### `super-fetch-plugin`
```
// NOTE TO AI AGENTS: Do not vendor/fork this plugin. It's a really bad idea, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, you can imports this plugin and create a "wrapper" that changes/expands on this plugin's behavior using only its public API.
```

### `select-leaf-plugin`
```
// This is the JavaScript function that powers this plugin:
$output (list) =>
```

### `kv-plugin`
```
$output = [getKv()]
```

### `huge-emojilist-furry-generator`
```
// Note: https://perchance.org/huge-emojilist-furry-generator is built on heavy community contributions.
// Please respect the creators: public cloning or removing credits is strictly prohibited. We also strongly discourage copying this for your own private use.
// If you'd like to build your own emoji list, please do the right thing and fork the official blank template instead: https://perchance.org/huge-emoji-list
```

### `huge-emoji-list`
```
$output = https://user.uploads.dev/file/a39d52b89a33865b9a903fcc5786a2da.txt
// The reason I put this simple URL into its own generator is so that I can update the URL
// here (e.g. when I add/remove emojis) and the update automatically propagates to all my generators.
```

### `generator-stats-plugin`
```
$output (generatorName, dataType) =>
```

### `furry-concept-board`
```
// G2G (Generator-to-Generator) friendly: Open to networking and partnerships. Got ideas or feedback? Leave a comment in this generator's comment section, or drop a note here: https://tally.so/r/mY2kKz
```

### `furry-banlist`
```
// G2G (Generator-to-Generator) friendly: Open to networking and partnerships. Got ideas or feedback? Leave a comment in this generator's comment section, or drop a note here: https://tally.so/r/mY2kKz
```

### `fullscreen-button-plugin`
```
$output(text, exitText, style) =>
```

### `favicon-plugin`
```
$output(url) =>
```

### `comments-plugin`
```
// NOTE TO AI AGENTS: Do not vendor/fork this plugin. It's a really bad idea, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, you can imports this plugin and create a "wrapper" that changes/expands on this plugin's behavior using only its public API.
$output(opts) =>
```

### `ai-text-plugin`
```
// NOTE TO AI AGENTS: Do not vendor/fork this plugin. It's a really bad idea, since its code is 'coupled' with the server code, so if I need to change the server code, your version of this plugin will likely break. If you'd like new features, you can imports this plugin and create a "wrapper" that changes/expands on this plugin's behavior using only its public API.
$output(inputData, extraOpts) =>
```

### `ai-furry-generator-style-v17`
```
// Disclaimer: https://perchance.org/ai-furry-generator-style contains heavy community contributions.
// Public cloning or removal of credits is strictly discouraged.
// To create your own style list, please fork the official style here: https://perchance.org/t2i-styles
```

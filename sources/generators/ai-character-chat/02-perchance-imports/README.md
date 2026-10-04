# 02-perchance-imports — external code (other Perchance generators)

Each directory is a read-only copy of a generator pulled in by `{import:name}` in `main.pjs` (or transitively, e.g. `bug-report-plugin` -> `dynamic-import-plugin`).

| Generator | File | Bytes | What it provides |
|---|---|---:|---|
| `ai-character-chat-dependencies-v1` | `main.pjs` | 230,595 | Vendored bootstrap bundle (in `$output()`): Dexie 4.0.8 + dexie-export-import 4.1.2 + marked 4.2.12 + DOMPurify 3.0.1 concatenated; exposed as `root.loadDependencies()`. |
| `ai-character-chat-sandboxed-executor` | `index.html` | 874 | Tiny iframe page that evaluates a perchance template string and posts the result back. Used so untrusted character code can never touch the main page. **Note its CAUTION comment: forks depend on it, don't break it.** |
| `ai-text-plugin` | `main.pjs` | 58,048 | The LLM chat backend: `root.generateText` / `root.aiTextPlugin` with streaming, stop sequences, prefix caching, image (vision) input, tokenizer metadata and the comments/thread search helpers. |
| `text-to-image-plugin` | `main.pjs` | 37,978 | `root.generateImage` — prompt -> image via the platform image service, with gallery, seeds, negative prompts, NSFW check API. |
| `comments-plugin` | `main.pjs` | 38,261 | The embedded comments/chat widget: channels, moderation, bans, rate limits, custom emojis, slash commands. |
| `tabbed-comments-plugin-v1` | `main.pjs` | 64,046 | Adds the multi-channel tab bar (chat / chill / rp / spam / vent / share) around comments-plugin. |
| `upload-plugin` | `main.pjs` | 10,271 | `root.uploadPlugin` — immutable uploads + editable text files; used for character share links. |
| `super-fetch-plugin` | `main.pjs` | 2,857 | `root.superFetch` — CORS-free fetch proxy used for character URLs and remote images. |
| `fullscreen-button-plugin` | `main.pjs` | 1,916 | The floating fullscreen toggle button. |
| `combine-emojis-plugin` | `main.pjs` | 283 | Helper used by the emoji picker to combine emoji sequences. |
| `bug-report-plugin` | `main.pjs` | 7,718 | The feedback/report button; collects browser diagnostics and posts to a comments channel. |
| `huge-emoji-list` | `main.pjs` | 513 | Single-value generator (`$output` = URL) pointing at the shared custom-emoji list on user.uploads.dev — imported so the URL can be updated in one place. |

Public pages: https://perchance.org/ai-character-chat-dependencies-v1, https://perchance.org/ai-character-chat-sandboxed-executor, https://perchance.org/ai-text-plugin, https://perchance.org/text-to-image-plugin, https://perchance.org/comments-plugin, https://perchance.org/tabbed-comments-plugin-v1, https://perchance.org/upload-plugin, https://perchance.org/super-fetch-plugin, https://perchance.org/fullscreen-button-plugin, https://perchance.org/combine-emojis-plugin, https://perchance.org/bug-report-plugin, https://perchance.org/huge-emoji-list.

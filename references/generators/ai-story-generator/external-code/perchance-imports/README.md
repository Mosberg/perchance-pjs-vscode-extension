# Perchance imports (external code)

Verbatim copies of the generators referenced by `{import:...}` in `internal-code/main.pjs`.
On perchance.org these are fetched from the platform at load time; they are bundled here so the project
can be read/audited offline, and so any of them can be vendored (appended to main.pjs) to remove the
external dependency.

| # | Import name | Local name in main.pjs | Purpose | Size |
|---|---|---|---|---|
| 1 | `ai-text-plugin` | `ai` | Story text generation (streaming `generateText`) | 56.7 KB |
| 2 | `comments-plugin` | `commentsPlugin` | Feedback button (also a transitive dep of tabbed-comments-plugin-v1) | 37.4 KB |
| 3 | `tabbed-comments-plugin-v1` | `tabbedCommentsPlugin` | Comments section at the bottom of the page | 62.5 KB |
| 4 | `fullscreen-button-plugin` | `fullscreenButton` | Fullscreen toggle button | 1.9 KB |
| 5 | `literal-plugin` | `literal` | Escapes `{}`/`[]` in user/AI text so the Perchance engine treats them literally | 0.4 KB |
| 6 | `upload-plugin` | `upload` | Share links + temporary-URL exports (also hosts imported files) | 10.0 KB |
| 7 | `kv-plugin` | `kv` | Per-story + app-wide persistence and auto-backups (IndexedDB) | 4.1 KB |
| 8 | `favicon-plugin` | `favicon` | Sets the browser-tab icon | 0.5 KB |
| 9 | `bug-report-plugin` | `bugReport` | Collects browser debug info for the feedback button | 7.5 KB |
| 10 | `text-editor-plugin-v1` | `createTextEditor` | High-performance rich text editor (vendors CodeMirror 6 internals) | 454.8 KB |
| 11 | `text-to-image-plugin` | `generateImage` | Illustration/kept-image generation | 37.1 KB |
| 12 | `combine-emojis-plugin` | `combineEmojis` | Layers emojis for composed icon badges | 0.3 KB |
| 13 | `huge-emoji-list` | (transitive) | Emoji-name → emoji list; imported by tabbed-comments-plugin-v1 | 0.5 KB |
| 14 | `dynamic-import-plugin` | (transitive) | Runtime `{import:}` resolution; imported by bug-report-plugin | 4.1 KB |


Dependency chain between imports:

```
tabbed-comments-plugin-v1 ──> comments-plugin
                        ├──> ai-text-plugin
                        └──> huge-emoji-list
bug-report-plugin ──────────> dynamic-import-plugin
```

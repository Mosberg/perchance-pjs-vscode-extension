# Perchance plugin dependencies (full source in this folder)

These are Perchance *generators* referenced from `main.pjs` with `{import:name}`. The engine fetches and evaluates them
at page load; each one is included here as its complete source. Canonical, always-current URLs are `https://perchance.org/<name>`.

## ai-text-plugin

- file: `02-perchance-dependencies/ai-text-plugin/main.pjs` (58048 bytes, sha256 f57d9efbf330aef13ede6becde8251ae...)
- canonical URL: <https://perchance.org/ai-text-plugin>
- role: AI text-generation iframe/API (the `ai(...)` function used for every story continuation, summaries, tracked-info and idea generation).

## bug-report-plugin

- file: `02-perchance-dependencies/bug-report-plugin/main.pjs` (7718 bytes, sha256 0a44676097ff2c8fbc04543150e502a9...)
- canonical URL: <https://perchance.org/bug-report-plugin>
- role: Collects browser/debug info (ua-parser-js, storage limits) and submits an encrypted bug report.

## combine-emojis-plugin

- file: `02-perchance-dependencies/combine-emojis-plugin/main.pjs` (283 bytes, sha256 e634ae5f89ba8116645e25ff9a446c11...)
- canonical URL: <https://perchance.org/combine-emojis-plugin>
- role: Layers several emoji characters into one composite emoji (used by the UI/emoji sticker features).

## comments-plugin

- file: `02-perchance-dependencies/comments-plugin/main.pjs` (38261 bytes, sha256 4b20ff48b15882e15623c1f1048f5817...)
- canonical URL: <https://perchance.org/comments-plugin>
- role: Embedded comments/chat widget used for the feedback/bug-report surface.

## dynamic-import-plugin

- file: `02-perchance-dependencies/dynamic-import-plugin/main.pjs` (4187 bytes, sha256 a7f2432113a0ccd3c7fc90f64a0066a6...)
- canonical URL: <https://perchance.org/dynamic-import-plugin>
- role: Transitive (via bug-report-plugin): runtime import helper.

## fullscreen-button-plugin

- file: `02-perchance-dependencies/fullscreen-button-plugin/main.pjs` (1916 bytes, sha256 4686fd38f3d7fdd61d4dc86bb7c275b2...)
- canonical URL: <https://perchance.org/fullscreen-button-plugin>
- role: Adds the fullscreen toggle button.

## huge-emoji-list

- file: `02-perchance-dependencies/huge-emoji-list/main.pjs` (513 bytes, sha256 f856329fd461e334d1c74fb1b6bf01ac...)
- canonical URL: <https://perchance.org/huge-emoji-list>
- role: Transitive: supplies the custom emoji name -> sprite map used by the comments widget.

## kv-plugin

- file: `02-perchance-dependencies/kv-plugin/main.pjs` (4177 bytes, sha256 a5edb7f5bf28ab5fb31bd5c4877db0f6...)
- canonical URL: <https://perchance.org/kv-plugin>
- role: IndexedDB-backed key/value persistence (stories, settings, music library).

## literal-plugin

- file: `02-perchance-dependencies/literal-plugin/main.pjs` (454 bytes, sha256 a9a6ec270402246adbae0cf2ad54b134...)
- canonical URL: <https://perchance.org/literal-plugin>
- role: Escapes square/curly brackets so story text is not interpreted by the Perchance engine when it's fed back into prompts.

## prompt2-plugin

- file: `02-perchance-dependencies/prompt2-plugin/main.pjs` (14632 bytes, sha256 ca6d03d9283871ae43144dcfd7332f2e...)
- canonical URL: <https://perchance.org/prompt2-plugin>
- role: Modal popup used by the keyboard-shortcuts help dialog.

## tabbed-comments-plugin-v1

- file: `02-perchance-dependencies/tabbed-comments-plugin-v1/main.pjs` (64046 bytes, sha256 462a464e90013bf59c3c7dac7f366ee9...)
- canonical URL: <https://perchance.org/tabbed-comments-plugin-v1>
- role: Tabbed variant of the comments plugin (multiple channels in one widget).

## text-editor-plugin-v1

- file: `02-perchance-dependencies/text-editor-plugin-v1/main.pjs` (465766 bytes, sha256 0efac2d0f76c4dfb44b8c05cd0d7aadc...)
- canonical URL: <https://perchance.org/text-editor-plugin-v1>
- role: High-performance text editor used for the main story box (styling, undo, diffing).

## text-to-image-plugin

- file: `02-perchance-dependencies/text-to-image-plugin/main.pjs` (37978 bytes, sha256 9245fbf9b4041da7a12095fd8d45313c...)
- canonical URL: <https://perchance.org/text-to-image-plugin>
- role: Scene image tray / generateImage backend (also hosts the gallery + background removal).

## upload-plugin

- file: `02-perchance-dependencies/upload-plugin/main.pjs` (10271 bytes, sha256 ebe4e080acb958f0c26ce38e25c7bd76...)
- canonical URL: <https://perchance.org/upload-plugin>
- role: Uploads share payloads / images to Perchance file hosting and returns URLs + deletion URLs.

## Dependency edges

```
ai-rpg (root)
comments-plugin
tabbed-comments-plugin-v1 -> comments-plugin, ai-text-plugin, huge-emoji-list
bug-report-plugin -> dynamic-import-plugin
huge-emoji-list -> (self reference in docs)
comments-plugin-doc-example -> my-emoji-list-url
```

Direct imports in `01-project-source/main.pjs`:

```
ai-text-plugin = {import:ai-text-plugin}
bug-report-plugin = {import:bug-report-plugin}
combine-emojis-plugin = {import:combine-emojis-plugin}
comments-plugin = {import:comments-plugin}
dynamic-import-plugin = {import:dynamic-import-plugin}
fullscreen-button-plugin = {import:fullscreen-button-plugin}
huge-emoji-list = {import:huge-emoji-list}
kv-plugin = {import:kv-plugin}
literal-plugin = {import:literal-plugin}
prompt2-plugin = {import:prompt2-plugin}
tabbed-comments-plugin-v1 = {import:tabbed-comments-plugin-v1}
text-editor-plugin-v1 = {import:text-editor-plugin-v1}
text-to-image-plugin = {import:text-to-image-plugin}
upload-plugin = {import:upload-plugin}
```

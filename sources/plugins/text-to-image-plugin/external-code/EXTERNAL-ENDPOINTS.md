# External runtime endpoints & services

Every off-origin resource the `text-to-image-plugin` generator contacts, directly or indirectly.

## Directly, from `main.pjs`

| # | Endpoint | Where in code | Method / how | Purpose |
|---|----------|---------------|--------------|---------|
| 1 | `https://image-generation.perchance.org/embed#<urlHashData>` | `main.pjs:731` (`outputString`, the image `<iframe>`) | `GET`, lazy-set as an `<iframe src>` | The server-side image-generation embed. Receives all generation options in the URL hash (`prompt`, `seed`, `resolution`, `guidanceScale`, `negativePrompt`, `saveChannel`, `requestId`, `iframeId`, `removeBackground`, `referenceImage`, …). Posts back `{type:'finished', id, dataUrl, seedUsed}` via `postMessage`. |
| 2 | `https://image-generation.perchance.org/gallery?channel=<generatorName>&subChannel=…&sort=…&timeRange=…&contentFilter=…` | `main.pjs:168` (gallery iframe URL) and `main.pjs:46` (heart-button gallery) | `GET`, set as an `<iframe src>` | The public per-generator image gallery. Extra moderation/UI data is passed in the URL hash (`bannedUsers`, `bannedPromptPhrases`, `bannedNegativePromptPhrases`, `defaultSubChannelNames`, custom-button emoji, injected styles). Posts back `openGallerySignal`, `savedImageToGallerySignal`, `documentHeightChanged`, `customButtonClickEvent`. |
| 3 | `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3` | `main.pjs:443` | dynamic `import()` | In-browser ML runtime, loaded **only** when `removeBackground:true`. Local byte-exact copy: `external-code/huggingface-transformers-3.3.3.js`. |

## Indirectly, fetched by transformers.js (only on the `removeBackground` path)

| # | Endpoint | Fetched by | Purpose |
|---|----------|------------|---------|
| 4 | `https://huggingface.co/briaai/RMBG-1.4/resolve/main/…` (config, tokenizer/preprocessor, `onnx/model.onnx`) | `AutoModel.from_pretrained('briaai/RMBG-1.4')` / `AutoProcessor.from_pretrained('briaai/RMBG-1.4')` (`main.pjs:451`, `:455`) | Background-removal model weights + processor config. |
| 5 | `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3/dist/*.wasm` (`ort-wasm-simd-threaded.jsep.wasm`, `ort.bundle.min.mjs`, …) | onnxruntime-web, via transformers.js | WASM inference backend used to run RMBG-1.4. |

## Referenced in `index.html` (documentation only — not loaded by the app logic)

| # | URL | Purpose |
|---|-----|---------|
| 6 | `https://i.imgur.com/YNcf0Hj.jpg` | "Inspiration" sample image (`<img>` at the bottom of the page). Local copy: `third-party-assets/example-output-imgur.jpg`. |
| 7 | `https://user.uploads.dev/file/e3cdfc34728610cf6e351b72052ef0c1.jpeg` | Ad-placement illustration linked from the intro paragraph. Local copy: `third-party-assets/ad-example.jpeg`. |
| 8 | `https://en.wikipedia.org/wiki/Server_(computing)` | Hyperlink text. |
| 9 | `https://lemmy.world/comment/5709061` | Hyperlink (privacy note about image storage). |
| 10 | `https://perchance.org/<example-generator>#edit` | ~14 links to companion example generators (see `index.html`). |
| 11 | `https://perchance.org/plugins` | Plugin directory link. |

## Host-page globals the plugin depends on

| Global | Used for |
|--------|----------|
| `window.generatorName` | Gallery channel id; also the `saveChannel` for saved gallery images. |
| `window.lastUsedTextToImagePluginGalleryIframeUrl` | Set by the plugin so the heart-button opens the same gallery config. |
| `window.lastTextToImagePrompt` | Exposes the last-used prompt to page templates as `[lastTextToImagePrompt]`. |
| `window.___textToImagePluginData98420274` | Singleton store for gallery custom-button click handlers. |

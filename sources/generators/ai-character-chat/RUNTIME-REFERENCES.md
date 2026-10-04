# RUNTIME-REFERENCES.md — things the app loads live (deliberately not bundled)

Everything in this package is complete for reading/re-hosting the code, but a handful of dependencies are
fetched live at runtime (network services, model weights, per-user uploaded files). Those are listed here with
their exact URLs so nothing is unaccounted for.

## 1. Perchance platform services used by the imported plugins

| Service | Endpoint | Used by |
|---|---|---|
| Text-generation API (LLM inference) | `https://text-generation.perchance.org` | `ai-text-plugin` (`root.aiTextPlugin`) |
| Image-generation API (text-to-image) | `https://image-generation.perchance.org` | `text-to-image-plugin` (`root.generateImage`) |
| Comments/chat embed | `https://comments-plugin.perchance.org/embed/<folder>` | `comments-plugin`, `tabbed-comments-plugin-v1` |
| CORS-bypassing fetch proxy | `https://fetch-plugin.perchance.org/proxy1/<encoded-url>` | `super-fetch-plugin` (`root.superFetch`) |
| File uploads + hosted files | `https://upload.perchance.org` (embed), `https://user.uploads.dev/file/<hash>` (files) | `upload-plugin` (character share links) |
| Client-side log sink | `https://ai-agent.perchance.org/api/aiAgent/clientLog` | `ai-text-plugin` |
| Sandboxed perchance-syntax evaluator (iframe) | `https://7deabe31ae18ea5ed27c5f71b9633999.perchance.org/ai-character-chat-sandboxed-executor` | `main.pjs` -> `evaluatePerchanceTextInSandbox()` — **source is bundled** in `02-perchance-imports/ai-character-chat-sandboxed-executor/` |

## 2. ML models downloaded at runtime (transformers.js)

The app runs embeddings in a Web Worker via Comlink + transformers.js (`04-hosted-assets/scripts/transformers-2.17.1-7b296c17.js`):

- Default text-embedding model: `Xenova/bge-base-en-v1.5` (upstream `BAAI/bge-base-en-v1.5`, MIT) — used for lore/memory semantic search.
- Weights/tokenizer/config are fetched on demand from `https://huggingface.co/<model>/resolve/main/...` (ONNX quantized weights, tens of MB) and cached in the browser (Cache Storage / IndexedDB).
- Deliberately not bundled here: they are large, versioned independently, and cacheable per browser.
- Image generation uses the platform service above; no local model.

## 3. Custom emoji images (the huge emoji list)

`04-hosted-assets/data/huge-emoji-list-a39d52b8.txt` contains **86,896** entries of the form `name = <32-hex-hash>.webp`.
Each hash resolves to `https://user.uploads.dev/file/<hash>.webp` (verified: HTTP 200, `image/webp`; e.g. `b3d18a6cce0c93d42418ae18d1c17225.webp` -> 8,346 bytes).
That is thousands of small emoji images; only the *list* is bundled, the images stay on the host. The actual
resolution happens inside the comments-plugin embed page.

## 4. Fonts

Code themes/fonts are loaded from `https://fonts.googleapis.com/css2?family=...` (font files then come from `fonts.gstatic.com`), plus the platform default UI font stack.

## 5. Character-card import sources (only used when the user pastes a card URL / uploads a card)

| Source | URL pattern |
|---|---|
| Chub / Venus | `https://gateway.chub.ai/api/characters/<id>?full=true`, `https://avatars.charhub.io/avatars/<id>/chara_card_v2.png` |
| Character Tavern | `https://cards.character-tavern.com/`, `https://ct-cards.storage.character-tavern.com/` |
| AI Character Cards | `https://api.aicharactercards.com/api/cards/<id>/download` |
| JannyAI | `https://jannyai.com/characters/<id>` |
| ND-API | `https://prod.nd-api.com/v2/characters/<id>` |
| Crushon | `https://crushon.ai/character/<id>/details` |
| RisuAI | `https://realm.risuai.net/api/v1/download/charx-v3/<id>` |
| Character.AI avatars | `https://characterai.io/i/400/static/avatars/<file>` |

## 6. Named-character share data (bundled here)

The six built-in share-link characters (`main.pjs` -> `urlNamedCharacters`) are bundled as gzipped JSON under `04-hosted-assets/data/named-characters/`.
At runtime the app fetches them from `https://user.uploads.dev/file/<hash>.gz` and decompresses with `DecompressionStream("gzip")`.

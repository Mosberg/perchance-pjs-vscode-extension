# External references (cannot be bundled)

These are runtime dependencies / outbound endpoints referenced by the code. They are live
Perchance services or hosted files, not local assets, so they are not included in the zip archive.

## Runtime service (authoritative, not open source)
- https://text-generation.perchance.org  — the GPU text-generation backend.
  - `/embed`            → hidden iframe the plugin creates (`aiTextPluginEmbedIframe`); used for user
                            verification + as the postMessage transport for streaming.
  - `/api/generate`     → the generation endpoint. The client posts `{type:"startStream", url, postData,
                            requestId, perchanceGeneratorOrigin}` into the iframe; the iframe performs the
                            actual HTTP call. Streaming replies arrive as `streamData` / `streamEnd` /
                            `streamError` messages keyed by `requestId`.
  - NOTE: main.pjs explicitly warns against forking this plugin because the client is coupled to this
    server's protocol.

## Telemetry
- https://ai-agent.perchance.org/api/aiAgent/clientLog — `navigator.sendBeacon` diagnostic ping fired only
  when the 600s silent-stream backstop trips (`kind: "ai-text-backstop-fired"`).

## Hosted files referenced from code comments / docs
- https://user.uploads.dev/file/e29eab687b1fbf129076ec6057484bb3.js  → bundled here as
  external-code/tokenizer-trainer.deno.js (the Deno script that trains the DBG1 approximation model).
  It in turn fetches:
  - https://user.uploads.dev/file/3f12eadda3a055b282f8e315884d9ebb.jsonl (default train corpus)
  - https://user.uploads.dev/file/53a2308e585e419352f831a7f4e674bb.jsonl (default test corpus)
  - https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/resolve/main/tokenizer.json
  - https://huggingface.co/deepseek-ai/DeepSeek-R1-0528/resolve/main/tokenizer_config.json
- https://user.uploads.dev/file/e3cdfc34728610cf6e351b72052ef0c1.jpeg → bundled here as
  external-assets/ad-screenshot.jpeg (the "ad looks like this" screenshot linked from index.html).

## Third-party libraries
None. The plugin ships no bundled libraries, no npm packages, no CDN <script> tags, and declares no
`{import:...}` dependencies — it is self-contained apart from the server above. It uses only browser
built-ins (`atob`, `TextEncoder`, `DataView`, `ReadableStream`, `IntersectionObserver`, `postMessage`).

## Build system
None. Perchance is a no-build platform: `main.pjs` and `index.html` are interpreted directly by the
Perchance engine at load time. There is no bundler, transpiler, package.json, lockfile, or CI config.

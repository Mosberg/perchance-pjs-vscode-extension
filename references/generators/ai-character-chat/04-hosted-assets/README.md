# 04-hosted-assets — the project's own files hosted on user.uploads.dev

These are part of the app (not third-party): scripts and data the generator loads by URL. Originals at `https://user.uploads.dev/file/<hash>`.

| File | Bytes | Role |
|---|---:|---|
| `data/doc-example-c4611a05.txt` | 5,622 | Example "lore file" content referenced by the in-app help text. |
| `data/huge-emoji-list-a39d52b8.txt` | 4,546,603 | The shared custom-emoji list: 86,896 lines of `name = <hash>.webp`. Images live at https://user.uploads.dev/file/<hash>.webp (not bundled — see RUNTIME-REFERENCES.md). |
| `data/named-characters/ai-adventure-b33c6ff0.gz` | 1,203 | Built-in share-link character: gzipped JSON blob loaded by `?data=name~<hash>.gz` or `?char=<name>` and decompressed with DecompressionStream. |
| `data/named-characters/coding-assistant-570b3c67.gz` | 949 | Built-in share-link character: gzipped JSON blob loaded by `?data=name~<hash>.gz` or `?char=<name>` and decompressed with DecompressionStream. |
| `data/named-characters/psychologist-615fdef9.gz` | 1,109 | Built-in share-link character: gzipped JSON blob loaded by `?data=name~<hash>.gz` or `?char=<name>` and decompressed with DecompressionStream. |
| `data/named-characters/story-writer-76b20593.gz` | 1,558 | Built-in share-link character: gzipped JSON blob loaded by `?data=name~<hash>.gz` or `?char=<name>` and decompressed with DecompressionStream. |
| `data/named-characters/therapist-5cdaa39f.gz` | 1,112 | Built-in share-link character: gzipped JSON blob loaded by `?data=name~<hash>.gz` or `?char=<name>` and decompressed with DecompressionStream. |
| `data/named-characters/world-war-simulator-e1cf5213.gz` | 1,508 | Built-in share-link character: gzipped JSON blob loaded by `?data=name~<hash>.gz` or `?char=<name>` and decompressed with DecompressionStream. |
| `data/upload-plugin-embed-fcf0aa53.txt` | 16 | Tiny data file the upload-plugin embed reads ("{success:true}"). |
| `scripts/ai-text-plugin-helper-e29eab68.js` | 22,115 | Tokenizer/meta helper script fetched by ai-text-plugin. |
| `scripts/app-dependency-bundle-356cdae1.js` | 338,296 | The main dependency bundle (dexie + dexie-export-import + marked + DOMPurify). This is what root.loadDependencies() injects. |
| `scripts/app-dependency-bundle-old1-9992637c.js` | 351,821 | Superseded dependency bundle (dexie 3.2.3 era). Kept for reference. |
| `scripts/app-dependency-bundle-old2-e7f08d9c.js` | 339,386 | Superseded dependency bundle. |
| `scripts/bug-report-helper-f2e26ac1.js` | 30,035 | ua-parser-js 2.0.0-rc.1 bundled into the bug-report helper (AGPL-3.0-or-later — see LICENSES.md). |
| `scripts/cbor-codec-4cc84b2c.js` | 87,547 | cbor-x@1.6.0 mirrored for the raw-DB export path (also loaded from unpkg as fallback). |
| `scripts/comlink-copy-429f4417.js` | 12,157 | Exact copy of comlink@4.4.1 (ESM) used to talk to the embedding worker. |
| `scripts/reader-module-93edd249.js` | 34,560 | esm.sh bundle of @mozilla/readability@0.5.0 (page/text extraction for the "read URL" import feature). |
| `scripts/transformers-2.17.1-7b296c17.js` | 739 | Embedder worker script (transformers.js v2.17.1); also inlined as a string in index.html. |
| `scripts/transformers-2.8.0-fb599e74.js` | 738 | Old embedder worker (transformers.js v2.8.0). Kept in the source but commented out. |

The dependency bundle is reproducible: its header documents the exact `wget` commands used to build it from the four CDN files (all four are also in `../03-external-libraries/`).

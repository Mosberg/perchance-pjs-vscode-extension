# ai-text-plugin — complete asset package

Complete, unpacked source + asset dump of the generator in this workspace.

## What this project is
This workspace is (a fork of) **`ai-text-plugin`**, Perchance's official AI text-generation plugin.
It is a *plugin*, not a typical generator: it exports a single `$output` function that other generators
call as `ai(promptData)`. It streams generated text from a Perchance GPU server into the page while
rendering a spinner, with edit/continue buttons and per-chunk callbacks.

## Categories

### 1. Internal code (first-party source)
| File | Bytes | Notes |
|---|---|---|
| `internal-code/main.pjs` | 58048 | The entire plugin: one `$output(inputData, extraOpts)` function (~800 lines) plus example lists at the bottom (`character`, `place`, `season`, `poemPrompt`). |
| `internal-code/index.html` | 16650 | The plugin's documentation/demo page, including a live `[$output(poemPrompt)]` demo and all styling. |

### 2. Project resources (data + embedded binary)
| File | Bytes | Notes |
|---|---|---|
| `project-resources/tokenizer-model.bin` | 9834 | The **DBG1** binary embedded as `MODEL_BASE64` on line 99 of main.pjs, decoded to raw bytes. |
| `project-resources/tokenizer-model.base64.txt` | 13112 | The base64 string exactly as it appears in the source. |
| `project-resources/tokenizer-model.json` | 443013 | Fully parsed model: header, 256 unigram weights, and the 3072 bigram table decoded to readable `{from, to, weight}` rows. |
| `project-resources/decode-tokenizer-model.mjs` | 1726 | Standalone reusable decoder for the blob (mirrors the inline parser in main.pjs). |

**About the model:** a "fast bigram-based approx token counter" (~80x faster and ~200x smaller than a
HuggingFace tokenizer). Header: magic `DBG1`, version 1, bias 0.5918994545936584, unigramScale 4096,
bigramScale 2048, 3072 bigram entries delta-varint-encoded over 3150 bytes. The key space is
`257*prev + cur` with `256` meaning start/end-of-sequence; the runtime rehashes these into an open-addressed
lookup table. It backs `generateText({getMetaObject:true})` → `{countTokens, idealMaxContextTokens}`.

### 3. External assets (hosted third-party files, mirrored here)
| File | Bytes | Origin |
|---|---|---|
| `external-assets/ad-screenshot.jpeg` | 23790 | https://user.uploads.dev/file/e3cdfc34728610cf6e351b72052ef0c1.jpeg — the ad screenshot linked from index.html. |

### 4. External code (third-party tooling referenced by the project)
| File | Bytes | Origin |
|---|---|---|
| `external-code/tokenizer-trainer.deno.js` | 22115 | https://user.uploads.dev/file/e29eab687b1fbf129076ec6057484bb3.js — the Deno script cited in main.pjs for re-training the DBG1 model against a different tokenizer. |

### 5. Build / config files
**None exist.** Perchance is a no-build platform — see `EXTERNAL-REFERENCES.md`. The two files in
`internal-code/` are the complete, directly-executed program.

### 6. Platform harness (not part of the generator)
| File | Bytes | Notes |
|---|---|---|
| `platform-harness/AGENTS.md` | 51258 | The editor's AI-agent instruction sheet that lives in the workspace. It is platform scaffolding, **not** generator code and **not** shipped publicly. Included only for completeness. |

## Integrity
See `CHECKSUMS.txt` (SHA-256 per file).

## Rebuilding from this package
1. The generator *is* `internal-code/main.pjs` + `internal-code/index.html` — paste them into Perchance
   and it runs. No install step.
2. `project-resources/tokenizer-model.json` is derived; regenerate with
   `deno run --allow-read project-resources/decode-tokenizer-model.mjs project-resources/tokenizer-model.bin`.
3. `external-code/tokenizer-trainer.deno.js` can regenerate `tokenizer-model.bin` for a different model:
   `deno run --allow-write=. --allow-net external-code/tokenizer-trainer.deno.js --tokenizer=/abs/path/to/tokenizer.json`

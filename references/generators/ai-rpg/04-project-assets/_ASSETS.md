# Project assets

Everything in this folder is loaded by the generator at runtime or referenced by its metadata.

| file | bytes | loaded by |
|---|---|---|
| `data/wordlists/massive-word-list.txt` | 1500231 | Creativity seed words, one per line. Fetched on load into window.massiveWordList and sampled into the instructions to vary story openings. |
| `data/wordlists/story-tags.txt` | 3222148 | Story tag names (window.massiveStoryTagsList) - used for creativity seeds and the tag suggestor. |
| `data/wordlists/tag-vector-pack.bin` | 6645116 | Packed quantized tag embedding vectors + LSH tables for the overview tag-suggestor (decoded by decodePacked()). |
| `data/wordlists/tag-counts.bin` | 663404 | Uint32Array of per-tag usage counts, paired with tag-vector-pack.bin. |
| `data/emoji-name-map.txt` | 4546603 | Custom emoji name -> .webp sprite filename map (the huge-emoji-list generator's $output) used by the comments plugin. |
| `data/premade-adventures.json` | 10019449 | Full premade-adventures manifest (723 entries: title, rating, tags, description, overview text, cardImage). Loaded via window.premadeAdventuresManifestUrl. |
| `meta/social-image.jpeg` | 232494 | The generator's $meta.image (listing/social preview image). |
| `premade-adventures/cards/*.webp` | 22212006 (723 files) | `cardImage` thumbnails for the premade adventures listed in `data/premade-adventures.json`, plus the 10 inline cards in index.html |

The 4 animated gif background loops live in `../05-media-assets/bundled-scenes/` because they sit with the rest of the media catalogue.

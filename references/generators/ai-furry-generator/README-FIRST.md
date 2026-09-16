# README FIRST — this package arrives as 4 zip parts

The complete package is **193.7 MB / 846 files**, which is larger than a single downloadable archive can be here,
so it is split into 4 independent zip files. **Every part contains the same top-level folder
(`ai-furry-generator-complete-package/`)**, so extracting all of them into one directory merges them into the
complete, correct tree.

## Extract

```bash
mkdir ai-furry-generator && cd ai-furry-generator
for z in ../ai-furry-generator-part*.zip; do unzip -o "$z"; done
cd ai-furry-generator-complete-package
sha256sum -c CHECKSUMS.sha256     # verify all 846 files
```

The end state (all four extracted into the same folder):

```
ai-furry-generator-complete-package/
├── README.md
├── README-FIRST.md
├── NOTICE.md
├── inventory.json
├── CHECKSUMS.sha256
├── 01-internal-code/
├── 02-external-code/
├── 03-third-party-vendor/
├── 04-project-assets/
├── 05-external-services/
├── 06-config/
└── tools/
```

## The parts

| part | zip file | contents | files | size |
|---|---|---|---|---|
| part1 | `ai-furry-generator-part1-code-vendor-docs.zip` | Code, external code, vendor, docs, config, tooling | 178 | 7.36 MB |
| part2 | `ai-furry-generator-part2-project-assets.zip` | Generator images, video, emoji-list data, asset maps | 112 | 52.08 MB |
| part3 | `ai-furry-generator-part3-import-assets.zip` | Assets referenced from imports (art styles, banlist, emoji examples, …) | 374 | 38.55 MB |
| part4 | `ai-furry-generator-part4-import-assets-huge-emojilist.zip` | Assets referenced from the huge-emojilist import | 182 | 95.69 MB |

`inventory.json` records, for every file, its category, size, sha256, original remote URL and which part (`part`) it is delivered in — so you can also rebuild the split yourself.

## What is *not* bundled

- **91,848 custom-emoji images** referenced by the emoji lists (multiple GB) — fetch with `node tools/fetch-remote-assets.mjs --emoji`.
- AI images generated at runtime, and per-user browser state (saved galleries, kv-plugin data, comments).
- 10 wallpaper-picker previews that 404 upstream (listed in `04-project-assets/ASSETS.md` § 4).

See `README.md` for the full description of every folder, and `NOTICE.md` for credits and licensing
(this project is a community work — private use only, do not publish or remove credits).

# Pinned third-party art source

Every sprite the engine loads is hot-linked from jsDelivr, pinned to one
upstream commit so the file layout can never shift:

    https://cdn.jsdelivr.net/gh/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator@553ba7562534cbf32e7d9a502660f569d6b26512/

Each entry in `referenced-assets.txt` is a repo-relative path; its URL is
`<base above> + <path>`, e.g.

    https://cdn.jsdelivr.net/gh/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator@553ba7562534cbf32e7d9a502660f569d6b26512/spritesheets/body/bodies/male/walk.png

The runtime constant lives in `src/engine.js` (`COMMIT` / `CDN`).

## Complete art library (all of it)

The upstream repository ships the *entire* LPC library (tens of thousands of
PNGs, far larger than 50 MB), of which this project references the subset in
`referenced-assets.txt`. To obtain all art locally, clone the repo at the
pinned commit:

    git clone https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator
    cd Universal-LPC-Spritesheet-Character-Generator
    git checkout 553ba7562534cbf32e7d9a502660f569d6b26512

The art lives under `spritesheets/`; the metadata the catalog was generated
from lives under `sheet_definitions/` and `palette_definitions/`.

Or download just the referenced subset with the bundled script:

    node fetch-assets.mjs            # -> ./spritesheets/...

## License

See `ATTRIBUTION.md`. The art is variously CC0, CC-BY 3.0/4.0, CC-BY-SA
3.0/4.0, GPL 2.0/3.0, OGA-BY and OGA-SA; the per-layer credits are in that
file and in `catalog.json -> credits`.

# Media assets

The generator references 227 large media files totalling 11.02 GB. They are Perchance-hosted (`user.uploads.dev`) and are deliberately **linked rather than bundled** (bundling would mean an ~11.3 GB zip).

| category | files | size | content |
|---|---|---|---|
| `soundtrack-playlist` | 44 | 2997.9 MB | in-game background-music playlist, `window.defaultMusicTracks` in index.html |
| `animated-scene` | 49 (4 gif loops bundled in `bundled-scenes/`) | 552.4 MB | animated background visuals, `window.defaultBackgroundVisuals` (mp4/webm/gif) |
| `soundtrack-library` | 138 | 7756.2 MB | larger music library kept in an HTML comment for future dynamic audio selection |

## Files here

- `media-manifest.json` - every file: category, title, emoji, byte size, source URL, destination path, and where in the code it is used.
- `media-filelist.txt` - `URL<TAB>destination` list (one line per file), consumable by any downloader.
- `download-media.sh` - `./download-media.sh ./downloads` (curl; skips files that already exist).
- `download-media.mjs` - `node download-media.mjs ./downloads` (Node 18+).
- `downloader.html` - open in Chrome/Edge, click *pick folder* then *download all* to mirror the tree with a progress bar.
- `bundled-scenes/` - the 4 gif loops (14.6 MB, 8.0 MB, 2.1 MB, 1.2 MB), already included in this zip.

# 04 — Project resources

Media/resources that the generator's own page references or ships.

| File | Format | Bytes | Used by | Original source |
|---|---|---|---|---|
| `images/publish-to-web-instructions.png` | PNG | 55141 | `01-internal-code/index.html` — linked screenshot showing how to use Google Sheets "Publish to web" | https://i.imgur.com/dmGUKLv.png |
| `images/spreadsheet-example.png` | PNG | 27882 | `01-internal-code/index.html` — inline `<img>` showing an example spreadsheet (headers `fruit`, `veg`) | https://i.imgur.com/PARDKrd.png |

Notes:

- Both images are **hotlinked** by the live generator (they are not bundled by Perchance).
  The copies here are byte-exact mirrors of what the live page served at snapshot time.
- No audio, 3D models, animations, shaders, fonts, prefabs, templates, or JSON data files
  exist in this project. The only "data" is the plugin's source and documentation text.
- The plugin's own input data (Google Sheet TSVs) is supplied by the end user at runtime via
  URLs in their `sheetsSettings` list; no example TSV is bundled with the generator.
  For reference, the example generators in `02-external-code/` point at this public sheet:
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vSrOdsc_b_N-k9bs0wzeSudRW2_GwLAvhwtikqL5VlFyU0WE6JKIj1hmnDeEWzzJ5UpDdmZiXVOm2mx/pub?gid\=0&single\=true&output\=tsv`

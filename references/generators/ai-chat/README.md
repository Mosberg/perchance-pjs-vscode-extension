# AI Chat (perchance.org/ai-chat) — Complete Source & Asset Package

Generator: **ai-chat**  ·  Public page: https://perchance.org/ai-chat

This package contains the complete, unminified source of the generator and every
external resource it references at runtime, organised by category. Nothing here is a
summary: each file is the full, byte-exact asset.

## Categories

| Folder | What it is |
|---|---|
| `1-internal-code/` | The generator's own code: `main.pjs` (lists/data/config + JS functions) and `index.html` (UI markup + inline scripts). These are the only two files you edit to change the generator. |
| `2-external-code/` | Source of every Perchance plugin the generator imports via `{import:name}`. These are dependencies, not the user's own code. |
| `3-project-assets/characters/` | The 16 character-avatar images shown in the quick-character gallery (downloadable copies). |
| `3-project-assets/third-party-libs/` | Third-party libraries and data files the plugins pull in at runtime (JS lib, tokenizer script, emoji dataset). |

There is **no build pipeline**: a Perchance generator is served as-is (main.pjs + index.html,
with imports resolved by the platform). The "config" for the bundle is the import list at the
top of `1-internal-code/main.pjs` — see `DEPENDENCIES.md`.

## Files at the root
- `MANIFEST.json` — machine-readable inventory (path, category, bytes, source URL, notes).
- `LINKS.md` — every internal/external file as a downloadable link + its origin URL.
- `DEPENDENCIES.md` — the import/dependency graph.

## Notes on assets
- **Images**: 16 avatar images (15 named characters + 1 "Custom" card).
- **Audio / models / shaders / animations / prefabs**: none. This is a text-based
  chat/RP generator; the only "media" are the avatar images above and an optional
  YouTube background-audio embed (a runtime URL, not a shipped asset).
- **JSON data**: embedded inside `main.pjs` (character definitions and prompt templates
  are Perchance lists, not external JSON files).

Generated for export from the Perchance editor workspace.

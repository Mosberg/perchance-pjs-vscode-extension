# 01-internal-code

The generator itself — the only two files that are this project (everything else is a dependency).

| File | Bytes | What it is |
|---|---:|---|
| `main.pjs` | 46,914 | Perchance-js config + the app's top-level helpers: plugin imports (`{import:...}`), character share-link creation (gzip + upload) and loading, the isolated perchance-text evaluator bridge, hierarchical chat summarization + memory extraction prompts, `confirmAsync`, comment channels/emoji options, and `$meta` (static header mode + per-character dynamic metadata). |
| `index.html` | 885,683 | The entire app UI + logic (Dexie schema/migrations, characters & threads, streaming chat rendering with markdown/highlighting, custom-code runner exposing the `oc` API, image generation, attachments/imports, lore & memory vector search, tabs, settings, import/export). Header comment grants MIT. |

Both files are the *contents* of the generator body — on perchance.org they are wrapped by the platform (the HTML is injected inside a body inside an iframe at `<publicId>.perchance.org/<name>`).

To load them back into Perchance: create/open a generator and paste these into `main.pjs` and the HTML panel respectively. The generator's public URL is `https://perchance.org/`+ generator name.

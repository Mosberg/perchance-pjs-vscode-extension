# 04 - Project resources: images, audio, models, shaders, animations, JSON, prefabs, UI resources

**This folder is intentionally empty. The project has zero local binary/static assets.**

This is a verified statement, not an omission - the complete inventory of what the
generator ships is:

1. main.pjs (Perchance code: 1 function, 1 boolean flag, 1 injected CSS string).
2. index.html (documentation markup + a <style> block; the only styles authored here).
3. One inlined SVG path (Font Awesome `expand`, see 03).

Audit trail for that claim:
- Workspace file listing returned exactly 3 files: main.pjs, index.html, AGENTS.md.
- There is no src/ directory, so there are no persistent project files beyond the two.
- There are no {import:...} lines in main.pjs, hence no imports/ tree and no vendored
  dependency source to include.
- `performance.getEntriesByType('resource')` on the live page reports only the 5 URLs
  catalogued in 02-external-code. No images, fonts, audio, canvas data, or JSON are
  requested by this generator.
- Canvas content (the actual drawings users make) lives on tldraw's servers inside the
  room, keyed by `perchance-aUf8Njeo73-<generatorName>-<channel>`. It is user-generated
  cloud state, not a project asset, and it is not exported here.
- No localStorage / kv / IndexedDB usage, so there is no persisted project data.
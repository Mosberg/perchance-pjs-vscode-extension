# 04 — Project resources

**None.** There are no project-owned resources separate from the code:

- no `src/` file tree (the generator ships only `main.pjs` + `index.html`)
- no uploaded assets (no `user.uploads.dev` URLs are referenced anywhere)
- no `scratch/` content in the shipped package (scratch is agent-only and is not part of
  the generator; this package's own build started from it, but nothing in it is a project asset)
- no persistent state — the generator reads and writes no localStorage / IndexedDB / kv folder
- no `$meta` block, so no listing image or metadata is defined by the generator itself

The entire user-visible surface is the documentation page in `01-internal-code/index.html`.

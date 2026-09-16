# 05 — Build / Config Files

**Inventory: none.**

This generator has no build step and no build pipeline:

- No package.json / lockfile / node_modules
- No bundler / transpiler / minifier config
- No tsconfig / eslint / prettier / editorconfig
- No CI config, no Dockerfile, no Makefile
- No generated or compiled artifacts

`main.pjs` and `index.html` are authored as-is and are the deployed artifact.
The only "configuration" that exists is `$meta` inside `main.pjs` — this
generator declares none, so the platform defaults apply (title = generator name,
description/listing image auto-derived).

## The one config file that isn't part of the generator
`workspace-config/AGENTS.md` is the perchance editor's AI-assistant instruction file.
It documents the editor workspace layout for an agent. It is NOT loaded by the
published generator and does not affect runtime behaviour.

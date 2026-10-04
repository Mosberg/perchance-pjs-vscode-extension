# Realm Weaver — Complete Package

Everything that makes the Realm Weaver Perchance generator run: the two first-party source files, the assets it
ships, the full source of every dependency it imports, and a complete inventory of every remote asset it uses.

**Start with `00-MANIFEST.md`** — the index of every file and URL in this package.

| Folder | Category | What's in it |
|--------|----------|--------------|
| `01-project-code/` | Internal code | `main.pjs` + `index.html` — the entire program |
| `02-project-assets/` | Project resources | project handoff README + 14 shipped music tracks (`src/` tree) |
| `03-third-party-code/` | External code | full source of the 8 imported Perchance plugins |
| `04-external-assets/` | Third-party assets | hosted images (bundled) + all remote media / CDN / model references (listed) |
| `05-config/` | Build & config | import declarations, `$meta`, machine-readable inventory, workspace instructions |

There is no build tooling: a Perchance generator is just `main.pjs` + `index.html`. To run this project, create a
generator at https://perchance.org/ and paste both files in, or read them as a reference implementation.

Live version: https://perchance.org/realmweaver

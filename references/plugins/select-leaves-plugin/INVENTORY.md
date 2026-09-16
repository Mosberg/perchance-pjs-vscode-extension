# INVENTORY — every file in this package

Total files: **15**  |  Total source size: **83735 bytes** (81.77 KiB)

SHA-256 hashes are of the exact bytes stored in the zip.

| # | Path in package | Source path | Bytes | SHA-256 |
|---|---|---|---|---|
| 1 | `01-internal-code/main.pjs` | `main.pjs` | 964 | `54f7d5b40d29511b7eb8c1385d009c3e645870eb01217351957a4c4ad21200b3` |
| 2 | `01-internal-code/index.html` | `index.html` | 1335 | `0ae6dc646de88d9f0a3a45dceef51ef13dfbcae66d019ce57e40483df6708544` |
| 3 | `02-dependencies/imports/select-leaf-plugin/main.pjs` | `imports/select-leaf-plugin/main.pjs` | 653 | `98c736212e5d07f16cbd9bfbd49614142976edf6f60161cca168e8e869b4fe9b` |
| 4 | `03-external-generators/select-leaf-plugin/main.pjs` | `scratch/generators/select-leaf-plugin/main.pjs` | 653 | `98c736212e5d07f16cbd9bfbd49614142976edf6f60161cca168e8e869b4fe9b` |
| 5 | `03-external-generators/select-leaf-plugin/index.html` | `scratch/generators/select-leaf-plugin/index.html` | 2287 | `a35eb86edff00a6870efabe03a2495696f3120e40c556ab1a1170383a58e607f` |
| 6 | `03-external-generators/consumable-leaf-list-plugin/main.pjs` | `scratch/generators/consumable-leaf-list-plugin/main.pjs` | 4608 | `0ef192095bc0ae5de6a19598cab9d1fddb97a52d4f1352dd380370c6bba3ddca` |
| 7 | `03-external-generators/consumable-leaf-list-plugin/index.html` | `scratch/generators/consumable-leaf-list-plugin/index.html` | 1483 | `035ae6e1b7b08b39bc885a3ef839dbaa8525b9eb34075f3d2acbfef129c9a3e3` |
| 8 | `03-external-generators/select-leaves-plugin-example/main.pjs` | `scratch/generators/select-leaves-plugin-example/main.pjs` | 222 | `92e7e6e7423d833daa34e885f81ee3689d9fe2359fffb79f08b4f77991b8f2aa` |
| 9 | `03-external-generators/select-leaves-plugin-example/index.html` | `scratch/generators/select-leaves-plugin-example/index.html` | 182 | `f3bbef0b69ee423235a3b25bfafc4d96014651caa19b846bc5627da474275401` |
| 10 | `04-assets/ASSETS.md` | `scratch/pkg/ASSETS.md` | 2945 | `8d480e8614810140a7b5cd0a17f140ae0c81c259e2b321c17d3450dc4b401d5f` |
| 11 | `05-build-config/BUILD.md` | `scratch/pkg/BUILD.md` | 3249 | `53d5b51b37e3f564031cd2aea72afe9c3d1b371410dccd2c97586981d6dbfb90` |
| 12 | `05-build-config/package.json` | `scratch/pkg/package.json` | 2261 | `0566ffd8a1bf4a04245a386fac47af12f12a73a4c45b6f077b779e5d16c5d9db` |
| 13 | `05-build-config/tools/package.mjs` | `scratch/pkg/tools/package.mjs` | 6305 | `1e7c98b2e2b99f6ea712411b48a8d3fc1c1902722b642c21be20786339973b1c` |
| 14 | `99-agent-instructions/AGENTS.md` | `AGENTS.md` | 51258 | `ed93ec9691766453f9e6240996225ccb6661973015d5709d59661d58da530fd4` |
| 15 | `README.md` | `scratch/pkg/README.md` | 5330 | `00d275a4a8cba355a0267d0fa92db047d6a46f298ccd916a1cd5ec0c5bf9eb95` |

## Roles

| Folder | Category | Contents |
|---|---|---|
| `01-internal-code` | Internal code | This generator's own `main.pjs` + `index.html` |
| `02-dependencies` | External code (imported) | `imports/` reference copy of `{import:select-leaf-plugin}` |
| `03-external-generators` | External code (related) | Standalone sources of the linked sibling generators |
| `04-assets` | Project resources | No binary assets exist; `ASSETS.md` documents the inventory |
| `05-build-config` | Build / config | No build step; packaging metadata + reproducible zipper |
| `99-agent-instructions` | Tooling docs | The AI-helper instruction file, shipped for completeness |

Assembled: 2026-09-16T17:44:50.004Z

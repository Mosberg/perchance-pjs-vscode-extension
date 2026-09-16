# MANIFEST — every file in this package

Generated 2026-09-16. SHA-256 is over the exact bytes shipped.

Excluded on purpose: the editor's `AGENTS.md` (AI-editor tooling instructions shipped by the
Perchance workspace — not part of the generator and not read by it at runtime). This
`MANIFEST.md` file itself is also not listed below.

| # | File | Category | Bytes | Lines | SHA-256 | License |
|---|------|----------|------:|------:|---------|---------|
| 1 | `internal-code/main.pjs` | A - internal code | 7774 | 87 | `9a3c9e377e75767acde923557c4a09995d9d0771680319d98abf3773191bf631` | project |
| 2 | `internal-code/index.html` | A - internal code | 2104 | 60 | `e7f3f3de23e59a0d1f41429e5b7a08c8cdb7b390cfe5afc21b0a0f7f77e15643` | project |
| 3 | `external-code/a-vs-an/AvsAn-simple.js` | B - external code | 4526 | 36 | `e869f35546f2bc8c2c15478791bf0a9986909402f6dfc58e7819dbb89b3f26f1` | Apache-2.0 |
| 4 | `external-code/a-vs-an/AvsAn-simple.min.js` | B - external code | 3944 | 1 | `319ec713b103f317345a5f6bc22804991a47704915d32b09423ded5ff01498a2` | Apache-2.0 |
| 5 | `external-code/a-vs-an/LICENSE-Apache-2.0.txt` | B - external code | 11323 | 201 | `6dc0e068dcf3a5bc8e054205b85b7720e1d49265bbc64bf515d2cf79197df69a` | Apache-2.0 |
| 6 | `external-code/a-vs-an/README-upstream.md` | B - external code | 2091 | 19 | `461ba3e1ae3796528e097b13e0b8771735dfe5f9fdfe1cf181bab6a15fdb856a` | Apache-2.0 |
| 7 | `external-code/a-vs-an/SOURCE.md` | B - external code | 3984 | 88 | `67fa93148f4af3e934b62c9c378f993f18f4635c041bd9395ecc82124aff0b64` | project |
| 8 | `third-party-assets/a-vs-an/dictionary-prefix-trie.base36.txt` | C - third-party asset | 3572 | 1 | `19c3b99257612626e7cfd56f1e00f2ff564c955ad6d271d919659d0c27a9beb5` | Apache-2.0 |
| 9 | `project-resources/example-usage.md` | D - project resource | 2627 | 75 | `2fe13be19815138d32f05d5a64c496eacebfe3a6b0baf29186845bce5ebac85d` | project |
| 10 | `build-config/BUILD.md` | E - build/config | 2982 | 68 | `780f790c289d25475ff4ac4da24081b3834812861af04268f87d6d8b9016f414` | project |
| 11 | `README.md` | index | 10925 | 226 | `3aae2edd0d907457463d4f31aa939ea87a7c465af48dc9a3ba71fa4648e7c8cd` | project |
| 12 | `LICENSE.txt` | index | 1979 | 37 | `d18dfd13c50882cc1987171b61a04d1a4fb67507ad6d26323cbde7853521ad29` | project |

## Origin of each file

- `internal-code/main.pjs`
  - category: A - internal code
  - origin: generator workspace main.pjs (verbatim)
- `internal-code/index.html`
  - category: A - internal code
  - origin: generator workspace index.html (verbatim)
- `external-code/a-vs-an/AvsAn-simple.js`
  - category: B - external code
  - origin: github.com/EamonNerbonne/a-vs-an @ d893b5b (AvsAnDemo/AvsAn-simple.js)
- `external-code/a-vs-an/AvsAn-simple.min.js`
  - category: B - external code
  - origin: github.com/EamonNerbonne/a-vs-an @ d893b5b (AvsAnDemo/AvsAn-simple.min.js)
- `external-code/a-vs-an/LICENSE-Apache-2.0.txt`
  - category: B - external code
  - origin: github.com/EamonNerbonne/a-vs-an (LICENSE)
- `external-code/a-vs-an/README-upstream.md`
  - category: B - external code
  - origin: github.com/EamonNerbonne/a-vs-an (README.md)
- `external-code/a-vs-an/SOURCE.md`
  - category: B - external code
  - origin: provenance notes, written for this export
- `third-party-assets/a-vs-an/dictionary-prefix-trie.base36.txt`
  - category: C - third-party asset
  - origin: dataset extracted from the dict literal in main.pjs
- `project-resources/example-usage.md`
  - category: D - project resource
  - origin: usage examples, links, metadata notes
- `build-config/BUILD.md`
  - category: E - build/config
  - origin: build + deploy + load-order notes
- `README.md`
  - category: index
  - origin: package overview
- `LICENSE.txt`
  - category: index
  - origin: licensing summary

## Dependency inventory

| Dependency | Kind | Pin | Used as | License |
|---|---|---|---|---|
| a-vs-an / AvsAnSimple | JS library | commit d893b5b9306658203b820137a9319bd2f5bd874d | inlined into main.pjs (getAOrAnFunction) | Apache-2.0 |
| Perchance engine | runtime | n/a (not included) | executes main.pjs, renders index.html | platform ToS |
| Perchance String.prototype.upperCase/.titleCase/.sentenceCase | runtime helper | n/a | case variants in updateNodeText() | platform |

**`{import:...}` dependencies: none.** `src/` asset tree: none.

## Runtime assets referenced but not files

- The `dict` base-36 prefix trie in `main.pjs` — same data as
  `third-party-assets/a-vs-an/dictionary-prefix-trie.base36.txt` (3504 chars,
  verified byte-identical to the upstream `AvsAn-simple.js` dataset: YES).
- The `⚄` (U+2684) glyph used on the listing page — a plain Unicode character, no font file.
- Styling — inline `<style>` in index.html. No CSS/JS/font/image files are loaded from anywhere.

## Totals

- Files: 13
- Bytes: 57831

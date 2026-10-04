# MANIFEST

Package: docs-plugin-complete-asset-package
Files listed: 32 (plus this MANIFEST.md, and checksums.sha256.txt which covers itself)

| # | file | bytes | sha256 | description |
| --- | --- | --- | --- | --- |
| 1 | 01-internal-code/docs-plugin.readable.js | 20914 | 675f56b98633f9359047941471889d4b9408dd5c56f9c43e3664b7e3abc49a5f | same source with the 42 KB inline bundle replaced by a reference comment |
| 2 | 01-internal-code/index.html | 4053 | 906274bd95b8c0ccbae2e75f53d748c30b42b66c82b966d607d6e5fa4c5c9621 | generator HTML: three markdown pages (overview, advanced, markdown-syntax) + docsPlugin() call |
| 3 | 01-internal-code/main.pjs | 62281 | f1428f23f480efe7757f540d8bc100b3da80f1baba8c7dfa91b769d24c7c4c4a | plugin source: docsPlugin = [$output]; $output builds the whole docs UI; marked bundle inlined |
| 4 | 02-external-code/highlight.js-11.11.1/LICENSE | 1514 | 6c081431591d9df696c82dc598fe1423765b8a299b200ed00b281afd0f64c490 | highlight.js BSD-3-Clause license text |
| 5 | 02-external-code/highlight.js-11.11.1/esm-shims/core.js | 173 | 31291b78a103173d98513cdc6cb47ab05177327cea488cc7596892369a1111e6 | exact shim bytes served by the core?target=es2022 URL |
| 6 | 02-external-code/highlight.js-11.11.1/esm-shims/javascript.js | 221 | 0878182c53785bcfd7fc21c1aabc0abfc5a1d669c0b3f19018997b9f9fb3373a | exact shim bytes for the javascript grammar URL |
| 7 | 02-external-code/highlight.js-11.11.1/esm-shims/json.js | 203 | 42aed60b2f22e6ac91b6aab005cb430a283c4c96e36868c539d44fbacd5dc27c | exact shim bytes for the json grammar URL |
| 8 | 02-external-code/highlight.js-11.11.1/esm-shims/xml.js | 200 | eea2d6760e8d4bc119b188fd291b17e4e96c43c70c311316019e0e1af07f3b9b | exact shim bytes for the xml (html/svg) grammar URL |
| 9 | 02-external-code/highlight.js-11.11.1/modules/README.md | 1177 | 1fc43483c634224565b1553380e765e3f86fbf795d6e73cf3f3777d1c9737e8e | URL map and language-alias notes for the external modules |
| 10 | 02-external-code/highlight.js-11.11.1/modules/core.mjs | 21284 | 437e36aa28dc7bc6133829032e681d8f2fb57a84ab4114b3bb79b089e343a9a8 | highlight.js core module actually executed at runtime |
| 11 | 02-external-code/highlight.js-11.11.1/modules/languages/javascript.mjs | 6568 | f2854944617689b73b0e6d299a2f135e1cb151c4e057ec953c0be7cbb746d470 | javascript grammar module |
| 12 | 02-external-code/highlight.js-11.11.1/modules/languages/json.mjs | 501 | d7331bf2625ae575d626f56484a2e4f53c506cb25814c9135c0f0a438913366a | json grammar module |
| 13 | 02-external-code/highlight.js-11.11.1/modules/languages/xml.mjs | 1985 | 6bc848e84048bb8152b9b1782585ce5c6c4f5d75489f2ce68aadaf6f1351a6be | xml grammar module |
| 14 | 02-external-code/highlight.js-11.11.1/package.json | 3568 | c62d61e26896bac4ea1ed0e014a0e588a51330e49b76047a430ea44b9bb863aa | highlight.js package metadata (name, version, license) |
| 15 | 03-third-party-assets/LICENSES.md | 641 | ef6756d969b53a667feb67d407c312a7a14ff686e214d206152aa9823aaa902b | third-party attribution summary |
| 16 | 03-third-party-assets/marked/LICENSE.md | 2942 | 8e3a3f82f59a60958f56ca08f445647c32a4733dc7ca6c2c46f6eb898471ab9c | marked MIT license text |
| 17 | 03-third-party-assets/marked/PROVENANCE.md | 1522 | b88b1563f34cb1e375ac08b961ce164f1fa4aa8d1ecb432cb707886fff8849c5 | where the bundle came from, API surface, version-probe result, reproduction steps |
| 18 | 03-third-party-assets/marked/marked.bundle.min.js | 41791 | 192322ae40d22b9765ce1ca599592bd76d2cbfbd4e1e67a551edc33b5b781d2f | byte-exact minified marked IIFE bundle extracted from main.pjs |
| 19 | 03-third-party-assets/marked/package.json | 3397 | 994d930f94d357956caaf25a3860fe9b2be3e3119e609c4cf48aee2a35f60059 | marked package metadata (reference, version 16.2.1) |
| 20 | 03-third-party-assets/marked/upstream-reference/marked.esm.js | 39279 | aecb5fb7944592bfd2d60ae7a5b28accd6ff06773236b89590d84d96b93faa04 | unminified marked 16.2.1 ESM build, reference only |
| 21 | 04-project-resources/README.md | 1061 | 8ee4c32215cd1a79695827538813133eeb7be25365d3efe3f7bd0b96e952479e | what the project's content resources are (markdown pages, runtime CSS, glyphs) |
| 22 | 04-project-resources/examples/ai-character-chat-docs/index.html | 81429 | b43769f9a5b8489c0a70c51f3d006505ef2422fd01a874714e17149fc5ae6e86 | large real-world docs site built with the plugin (~81 KB of markdown) |
| 23 | 04-project-resources/examples/ai-character-chat-docs/main.pjs | 33 | ea2d930307c68edd2b02c0d8295efa0b3ea32c7b4a2587010fc9d2a4d330299e | example generator lists file (one import line) |
| 24 | 04-project-resources/examples/docs-plugin-simple/index.html | 389 | b32034d97b9648ed227fcc2b79254513bbe353c2514294791e6147d757c140b3 | minimal example: two markdown pages + docsPlugin() |
| 25 | 04-project-resources/examples/docs-plugin-simple/main.pjs | 33 | ea2d930307c68edd2b02c0d8295efa0b3ea32c7b4a2587010fc9d2a4d330299e | example generator lists file (one import line) |
| 26 | 05-build-config/package.json | 1870 | 66c6b44a20bbf6aab359909fa04b342862dcb99b54d89905348bd63d055fef59 | package manifest: categories, dependency versions, runtime URLs, scripts |
| 27 | 05-build-config/tools/README.md | 903 | 77a20bfd6044bfb2da12435e53a2c32767087e2845475799592510d777ea1993 | build & config overview |
| 28 | 05-build-config/tools/extract-marked-bundle.mjs | 1127 | aac186e16eed2ae0fa3d8ef4d2aa0208881773c8d9ff920b2c93da76339be8d5 | build tool: re-extract the inline marked bundle from main.pjs |
| 29 | 05-build-config/tools/rebuild-marked-bundle.mjs | 669 | 8e46dba420c2635783131bc6e63ab428dc643effc26cf207d0aeb2e316f0b274 | build tool: rebuild an equivalent marked IIFE bundle with esbuild |
| 30 | 05-build-config/tools/verify-checksums.sh | 155 | 2d361af2d62c4c6473c47fd8c334b6dac672d00916b051803d9546e589516d82 | build tool: sha256sum -c over the package |
| 31 | ALL_CODE.md | 270213 | 37e4e805c9043b894734fef66e4d47199d66bfbaa3626db573c858898a11549f | every text file in this package, in full, in one document |
| 32 | README.md | 5313 | 32394d1d4453d53c8c62d19a2f934481d4d0c01009a46c63a200d3e8fd6dd0ea | this file: overview, categories, dependencies, rebuild instructions, provenance |

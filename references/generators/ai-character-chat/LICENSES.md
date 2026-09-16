# LICENSES & ATTRIBUTION

## 1. The generator's own code

Files: `01-internal-code/main.pjs`, `01-internal-code/index.html` (and everything under `04-hosted-assets/` except where noted).

Released under the **MIT license** — stated verbatim in the header comment of `index.html`:

```
Note: Since people have asked: You can consider all the code below to be open source under the standard MIT licence.
I.e. you're free to do as you wish with it, including copying it, hosting it yourself, and using it commercially.
```

## 2. Third-party libraries bundled in `03-external-libraries/`

| Package | Version | License | Author | Homepage | Files here |
|---|---|---|---|---|---|
| dexie | 4.0.8 | Apache-2.0 | David Fahlander | https://dexie.org | 1 |
| dexie-export-import | 4.1.2 | Apache-2.0 | david.fahlander@gmail.com | https://github.com/dexie/Dexie.js#readme | 1 |
| marked | 4.2.12 | MIT | Christopher Jeffrey | https://marked.js.org | 1 |
| dompurify | 3.0.1 | (MPL-2.0 OR Apache-2.0) | Dr.-Ing. Mario Heiderich, Cure53 | https://github.com/cure53/DOMPurify | 1 |
| cbor-x | 1.6.0 | MIT | Kris Zyp | https://github.com/kriszyp/cbor-x#readme | 1 |
| msgpackr | 1.11.0 | MIT | Kris Zyp | https://github.com/kriszyp/msgpackr#readme | 1 |
| morphdom | 2.7.2 | MIT | Patrick Steele-Idem | https://github.com/patrick-steele-idem/morphdom#readme | 1 |
| json5 | 2.2.2 | MIT | Aseem Kishore | http://json5.org/ | 1 |
| pdfjs-dist | 4.7.76 | Apache-2.0 | - | https://mozilla.github.io/pdf.js/ | 2 |
| @mozilla/readability | 0.5.0 | Apache-2.0 | - | https://github.com/mozilla/readability | 2 |
| @xenova/transformers | 2.0.0-alpha.0 | MIT | Xenova | https://github.com/xenova/transformers.js#readme | 1 |
| @xenova/transformers | 2.17.1 | Apache-2.0 | Xenova | https://github.com/xenova/transformers.js#readme | 1 |
| @huggingface/transformers | 3.3.3 | Apache-2.0 | Hugging Face | https://github.com/huggingface/transformers.js#readme | 1 |
| comlink | 4.4.1 | Apache-2.0 | Surma | https://github.com/GoogleChromeLabs/comlink#readme | 2 |
| highlight.js | 11.7.0 | BSD-3-Clause | Josh Goebel | https://highlightjs.org/ | 3 |
| codemirror | 5.65.13 | MIT | Marijn Haverbeke | https://codemirror.net/5/ | 6 |
| codemirror | 5.65.17 | MIT | Marijn Haverbeke | https://codemirror.net/5/ | 2 |
| ua-parser-js | 2.0.0-rc.1 | AGPL-3.0-or-later | Faisal Salman | https://uaparser.dev | 1 |
| exifreader | 4.12.0 | MPL-2.0 | Mattias Wallander | https://github.com/mattiasw/ExifReader#readme | 1 |
| @zip.js/zip.js | 2.7.55 | BSD-3-Clause | Gildas Lormeau | https://gildas-lormeau.github.io/zip.js | 2 |

Notes:

- **ua-parser-js@2.0.0-rc.1 is AGPL-3.0-or-later** (dual-licensed / commercial option). It is only pulled in by the bug-report helper (`04-hosted-assets/scripts/bug-report-helper-f2e26ac1.js`), which wraps ua-parser together with the report UI. If you re-host this app commercially, swap that helper for a permissive UA parser or buy a ua-parser-js license.
- Some bundled files carry their license inline in a header comment (dexie, DOMPurify, comlink, cbor-x, highlight.js, ...); the full text of each license is in the package's own repository (see Homepage above).
- `03-external-libraries/npm/@xenova__transformers*` and `@huggingface__transformers*` are only the JS runtime — see RUNTIME-REFERENCES.md for the model weights they download at runtime (those weights have their own licenses, e.g. bge-base-en-v1.5 is MIT).

## 3. Perchance generators (`02-perchance-imports/`)

These are separate generators on perchance.org, pulled in at runtime with `{import:name}`. Each is community/publisher code under whatever terms its own page states; they are included here as source copies for completeness.

## 4. Images (`05-images/`) and character data (`04-hosted-assets/data/named-characters/`)

Default-character avatars and the bundled named-character files are game/character assets published with the generator (several carry in-app credit to their original authors — e.g. the Ike, Kazushi, Yvette, Illyria and Li Jung cards credit character-card authors on chub.ai, and the card text inside the share data names those authors). If you re-publish them, preserve those credits.

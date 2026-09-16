# Third-party assets

## Summary

| asset | author | licence / terms | shipped as a file? | where it lives in this project |
|---|---|---|---|---|
| Avataaars illustration set (every avatar SVG shape) | Pablo Stanley — https://avataaars.com | free for personal and commercial use (see "Terms" below) | no | compiled into SVG-emitting React components inside main.pjs segments/05 |
| avataaars React component library v1.2.1 | Fang-Pen Ling — https://github.com/fangpenlin/avataaars | MIT | yes | segment 05 + 02-external-code/avataaars-1.2.1/ |
| React 17.0.2 + ReactDOM 17.0.2 | Meta Platforms, Inc. and affiliates | MIT | yes | segments 03, 04 + 02-external-code/ |
| prop-types 15.7.2 (shim) | Meta Platforms, Inc. | MIT | bundled inside segment 05 | — |
| lodash (internals only) | John-David Dalton / OpenJS Foundation | MIT | bundled inside segment 05 | — |

## There are no binary art assets

This is worth stating explicitly, because it is unusual: the generator contains **zero** image
files. The "art pack" (30+ hair/hat shapes, 7 accessories, 9 clothes × 13 cloth colours,
14 hat colours, 10 hair colours, 12 eyes, 12 eyebrows, 12 mouths, 7 skin tones, 4 facial-hair
types, 2 frame styles) exists only as SVG path/element data emitted by JavaScript. If you want
to extract the artwork, render an avatar and take the resulting inline <svg>, or read the
component definitions out of `02-external-code/avataaars-1.2.1/avataaars.bundle.js`
(they are the `React.createElement("g", ...)` / `<path d="...">` trees — e.g. search for
`"Mouth/Vomit"`, `"Vomit-Stuff"` to see the shape naming convention).

## Attribution requirement

index.html credits both authors in the plugin's own page text:

> This plugin allows you to generate little random avatars based on the flat-style
> illustrations of Pablo Stanley and the code of Fang-Pen Ling.
> Both the code and the illustrations are free for personal and commercial use.

If you redistribute or fork this generator, **keep that credit line** — it is the condition
under which the artwork may be used. The vendored avataaars bundle itself arrives with its
licence banner already stripped (it is a skypack/deno ESM roll-up), so the page credit and this
file are the record of provenance.

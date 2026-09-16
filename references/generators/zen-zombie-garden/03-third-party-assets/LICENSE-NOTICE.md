# Third-party assets — licence notice

## `three-0.160.0/three.module.js`

- Project: **three.js** — https://threejs.org
- Version: **0.160.0** (the exact version the generator imports: `import * as THREE from "https://esm.sh/three@0.160.0"`)
- Upstream source of this file: `https://unpkg.com/three@0.160.0/build/three.module.js`
- Bytes: 1,272,972
- Licence: **MIT** — Copyright © 2010–2024 three.js authors. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: the above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This copy is included so the package can be run/archived without depending on the `esm.sh` CDN. In the shipped generator the CDN URL is used directly; replace that import with a relative path to this file only for offline/local hosting.

## Perchance plugin sources (`../02-external-code/imports/`)

`ai-text-plugin`, `comments-plugin`, `server-plugin`, `text-to-image-plugin` — platform-distributed Perchance plugin code, vendored here as part of the generator's dependency set. See each file's own header for any additional notices.

## Generated media (`../04-project-resources/`)

The audio (map music, calling-card music, weapon SFX) and the calling-card/weapon/social art were generated for this project and uploaded to the Perchance upload host; they are mirrored here byte-exact. Original URLs are recorded per file in `../04-project-resources/ASSET-INVENTORY.md`.

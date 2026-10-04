# flat-avatar-plugin — complete source & asset package

Exported from the live Perchance generator workspace (`window.generatorName` = flat-avatar-plugin).
Everything the generator is made of: its own code, the third-party libraries it vendors,
the upstream CDN dependencies it loads at runtime, and the build/rebuild files.

Integrity of the shipped generator (the only two files the platform actually serves):

| file | bytes | sha256 |
|---|---|---|
| main.pjs | 656,792 | 609d66f7117a5d4d606ab9ef60af7344a08115a0cdca19bee0372fa258867adb |
| index.html | 5,742 | 059e5fe1766b3a3d0c7320d7d2cb78e5e716b6993137b0cae418dadad49017c6 |

---

## What this generator is

A Perchance **plugin generator**. Other generators import it with:

~~~pjs
avatar = {import:flat-avatar-plugin}
~~~

and then render a random flat-design avatar with `[avatar()]`, or a constrained one with
`[avatar(myOptionsList)]`.

Two things make it interesting:

1. **The art is not an image pack.** Every avatar is a React component tree that emits inline
   SVG — 30+ hair/hat shapes, 7 accessories, 13 clothes, 12 eyes, 12 eyebrows, 12 mouths,
   7 skin tones, etc. There are no sprite sheets, no PNGs, no JSON data files: the entire
   illustration library lives as JavaScript inside the vendored `avataaars` bundle.
2. **Three libraries are inlined, not imported.** Rather than `{import:...}`-ing a JS library
   generator, `initPlugin()` injects React 17, ReactDOM 17 and the avataaars bundle straight
   into the page the first time an avatar is requested. That is why `main.pjs` is 657 KB.

---

## Contents, by category

### 1. Internal code — `01-internal-code/`

| file | bytes | what it is |
|---|---|---|
| main.pjs | 656,792 | The shipped generator code, byte-exact. A Perchance-js file whose top-level names become page globals. |
| index.html | 5,742 | The shipped documentation page (the contents of <body>). |
| segments/01-plugin-lists-and-output.pjs | 3,766 | The plugin's only *own* pjs/JS logic: the `defaultAvatarOptions` list + the `$output(options)` function that renders an avatar. |
| segments/02-init-plugin-header.pjs | 155 | Start of `initPlugin()` — the provenance comments and the opening line. |
| segments/03-react-17.production.min.js.inc | 11,131 | **Vendored library** — React 17 UMD, inlined (indented as pjs function body). |
| segments/04-react-dom-17.production.min.js.inc | 118,381 | **Vendored library** — ReactDOM 17 UMD, inlined. |
| segments/05-avataaars.bundle.js.inc | 522,957 | **Vendored library + all artwork** — the deno/skypack bundle of avataaars 1.2.1, inlined. |
| segments/06-avatarexports-shim.pjs | 119 | The tail: rewires the bundle's module loader output onto `window.AvatarExports`. |

The six segment files are **byte-exact, contiguous slices of main.pjs** — concatenating them
in filename order reproduces the shipped file bit-for-bit (verified: sha256 above).
That is the decomposition; nothing was rewritten or reformatted.

**main.pjs layer map (byte offsets, 0-based):**

~~~
       0 ..   3766   plugin lists + $output()            <- the only original pjs logic
    3766 ..   3921   // testing generator here ... initPlugin() =>
    3921 ..  15052   React 17.0.2 UMD (vendored)
   15052 .. 133433   ReactDOM 17.0.2 UMD (vendored)
  133433 .. 656390   avataaars 1.2.1 bundle (vendored)  <- 80% of the file; contains ALL artwork
  656390 .. 656509   window.AvatarExports = __instantiate("avataaars", false)
~~~

### 2. External code — `02-external-code/`

Third-party code the project depends on, kept as standalone files so it can be inspected
and diffed against what is vendored inside `main.pjs`.

| path | source URL | bytes |
|---|---|---|
| react-17.0.2/react.production.min.js | https://unpkg.com/react@17/umd/react.production.min.js | 11,440 |
| react-dom-17.0.2/react-dom.production.min.js | https://unpkg.com/react-dom@17/umd/react-dom.production.min.js | 120,585 |
| avataaars-1.2.1/avataaars.bundle.js | https://cdn.skypack.dev/avataaars (deno/skypack ESM build, extracted from main.pjs) | 522,891 |

Notes:
- React and ReactDOM are loaded **at runtime** by index.html via <script> tags pointing at
  unpkg. They are also present inside main.pjs (vendored, so the plugin works standalone).
- The vendored React/ReactDOM copies are *not* byte-identical to the unpkg copies: React
  11,070 vs 11,440 bytes and ReactDOM 118,312 vs 120,585 bytes. The inlined copies have the
  `/** @license ... */` banner and some whitespace stripped and use a slightly different
  UMD wrapper. Same version (17.0.2), same behaviour.
- The avataaars bundle is a rolled-up ESM ("deno bundle") output including lodash internals
  and the prop-types shim. Its module id records the resolved version: `avataaars@v1.2.1`.
- No other npm package, script, tool or CLI is used. There is no package.json, no bundler
  config, no transpiler: Perchance serves main.pjs + index.html directly.

### 3. Third-party assets — `03-third-party-assets/`

| asset | author | licence / terms | where it lives |
|---|---|---|---|
| Avataaars illustration set (all avatar SVG shapes: hair, hats, eyes, brows, mouth, clothes, accessories, skin/colour palettes) | **Pablo Stanley** — https://avataaars.com | free for personal and commercial use | not shipped as files: compiled into SVG-emitting React components inside segments/05 |
| Avataaars React component library (v1.2.1) | **Fang-Pen Ling** — https://github.com/fangpenlin/avataaars | MIT | segments/05 + 02-external-code/avataaars-1.2.1/ |
| React / ReactDOM 17.0.2 | Meta Platforms, Inc. and affiliates | MIT | segments/03, segments/04 + 02-external-code/ |
| prop-types 15.7.2 (shim, bundled inside the skypack avataaars build) | Meta Platforms, Inc. | MIT | inside segments/05 |
| lodash internals (bundled inside the skypack avataaars build) | John-David Dalton / OpenJS Foundation | MIT | inside segments/05 |

The generator credits Pablo Stanley and Fang-Pen Ling in its own page text (index.html) —
that attribution is the licence requirement for the artwork, so do not remove it when
redistributing.

### 4. Project resources — `04-project-resources/`

Empty by design — **this generator ships no standalone resource files.** There are no images,
audio, video, 3D models, fonts, shaders, animations, JSON/CSV data, prefabs or HTML templates
outside the two shipped files. Everything that would be a "resource" in another project is
encoded as code: the artwork as SVG-emitting React components, the option catalogs as pjs
lists, the styling as inline CSS attributes.

### 5. Build / config — `05-build-config/`

| file | what it is |
|---|---|
| BUILD.md | How main.pjs is assembled, and how to change any layer. |
| rebuild.mjs | Node script that reassembles main.pjs from the six segments and verifies the sha256. |
| AGENTS.md | The agent-assistant configuration file that was present in the workspace (harness config — not part of the shipped generator). |

---

## Runtime data flow

~~~
[avatar(options)]  in any importing generator
        |
        v
$output(options)                                  segments/01
   - lazily calls initPlugin() on first use       segments/02
   - resolves each option: options.X.evaluateItem || defaultAvatarOptions.X.evaluateItem
   - emits <div id="avatarIdNNN" style="width:..;height:..">
   - setTimeout(10ms) -> ReactDOM.render(<Avatar .../>, el)
        |
        v
window.AvatarExports.default (avataaars Avatar)   segments/05 + 06
   - pure SVG React components (no canvas, no images, no network)
        |
        v
inline <svg> in the page — scales to any size, works on any background
~~~

`$output` returning the placeholder div (rather than the avatar itself) is what allows the
plugin to work inside a Perchance template: pjs blocks are strings, so the actual React render
happens asynchronously in the DOM after the string is inserted.

Option resolution detail: because both branches end in `.evaluateItem`, a caller may pass
either a pjs list (the usual case — e.g. `avatarOptions.hairOrHat`) or a plain string.
`defaultAvatarOptions` itself is a faithful catalog of avataaars' allowed values; the generator
removed "Blue01" from the hat/clothes colour palettes because it matches the (unchangeable)
transparent background.

---

## Usage recap (from the shipped index.html)

~~~pjs
avatar = {import:flat-avatar-plugin}
~~~

~~~pjs
[avatar()]                 // fully random
[avatar(avatarOptions)]    // constrained by your own options list
~~~

`avatarOptions` accepts: `style.width`, `style.height`, `hairOrHat`, `avatarFrame`,
`accessories`, `hatColor`, `hairColor`, `facialHair`, `clothes`, `clothesColor`, `eyes`,
`eyebrows`, `mouth`, `skin` — any omitted option falls back to `defaultAvatarOptions`.

---

## Files in this package

~~~
flat-avatar-plugin-complete/
  README.md                                  <- this file
  MANIFEST.json                              <- every file with size + sha256
  01-internal-code/
    main.pjs                                 <- the shipped generator (byte-exact)
    index.html                               <- the shipped page (byte-exact)
    segments/01..06                          <- byte-exact slice decomposition of main.pjs
  02-external-code/
    react-17.0.2/react.production.min.js
    react-dom-17.0.2/react-dom.production.min.js
    avataaars-1.2.1/avataaars.bundle.js
    README.md
  03-third-party-assets/
    README.md                                <- attribution + licence inventory
  04-project-resources/
    README.md                                <- (empty by design, explained)
  05-build-config/
    BUILD.md
    rebuild.mjs
    AGENTS.md
~~~

Verification: every file's hash is in MANIFEST.json. Reassembly check:
    node 05-build-config/rebuild.mjs --check

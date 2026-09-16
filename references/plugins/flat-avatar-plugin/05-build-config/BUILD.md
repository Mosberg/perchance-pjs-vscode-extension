# Build & rebuild

## Short version

There is **no build step**. Perchance serves `main.pjs` and `index.html` to the browser as-is.
No package.json, no bundler, no transpiler, no minifier, no CI. "Building" this project means
editing those two files in the Perchance editor.

The only thing that resembles a build is that `main.pjs` has three third-party libraries
**inlined** into it (React 17, ReactDOM 17, avataaars 1.2.1).

## main.pjs layout

main.pjs is a concatenation of six contiguous layers, in this exact order:

| # | bytes | segment file (01-internal-code/segments/) | contents |
|---|---|---|---|
| 1 | 3,766 | 01-plugin-lists-and-output.pjs | `defaultAvatarOptions` list + the `$output(options)` function — the plugin's own logic |
| 2 | 155 | 02-init-plugin-header.pjs | the two provenance comments and the `initPlugin() =>` opening line |
| 3 | 11,131 | 03-react-17.production.min.js.inc | React 17.0.2 UMD production build, indented by 2 spaces |
| 4 | 118,381 | 04-react-dom-17.production.min.js.inc | ReactDOM 17.0.2 UMD production build, indented by 2 spaces |
| 5 | 522,957 | 05-avataaars.bundle.js.inc | avataaars 1.2.1 skypack/deno bundle + all artwork, indented by 2 spaces |
| 6 | 119 | 06-avatarexports-shim.pjs | `window.AvatarExports = __instantiate("avataaars", false);` |

Why layers 3–5 work when inlined: they are the bodies of two nested UMD IIFEs, and inside a
Perchance function body they execute exactly as they would in a <script> — the UMD wrappers
assign to `this`/`window` (React, ReactDOM), and the System.register roll-up declares
`let System, __instantiate;` in the function scope, which layer 6 then drives.

## Reassembling a byte-exact main.pjs

    node 05-build-config/rebuild.mjs --check      # verify the segments reproduce main.pjs
    node 05-build-config/rebuild.mjs --write      # write the reassembled file to ./main.pjs.rebuilt

Expected sha256 of the reassembled (and therefore of the shipped) file:
    609d66f7117a5d4d606ab9ef60af7344a08115a0cdca19bee0372fa258867adb
Expected size: 656,792 bytes.

The round trip is exact — the segments are raw slices, not re-indented or re-formatted copies.

## Changing a specific layer

- **Plugin behaviour / which options exist** -> edit segment 01 (or just edit main.pjs directly
  in the Perchance editor). This is the only hand-written code in the file.
- **New avataaars version** -> fetch the new skypack/deno bundle, replace segment 05, and make
  sure the final line of segment 06 still drives the loader (`__instantiate("avataaars", false)`).
- **New React version** -> replace segments 03 and 04, and update the two <script> tags in
  index.html to matching unpkg URLs (React 18+ would also need `ReactDOM.createRoot` instead of
  `ReactDOM.render` in segment 01, so 17.x is the safe range for this code).
- **Docs page** -> index.html (shipped as <body> contents only; never add <html>/<head>/<body>).

After any change, verify in the live preview with the Perchance editor; a broken layer 05/06
surfaces as `window.AvatarExports` being undefined and avatars rendering as empty divs.

## Toolchain for reproducing the vendored blobs from source

The three inlined libraries were produced upstream, not here:

    # react / react-dom (UMD, unmodified)
    curl -O https://unpkg.com/react@17/umd/react.production.min.js
    curl -O https://unpkg.com/react-dom@17/umd/react-dom.production.min.js

    # avataaars: an ESM roll-up, then bundled for a <script> context
    #   source:     https://github.com/fangpenlin/avataaars  (v1.2.1)
    #   roll-up:    skypack / "deno bundle https://cdn.skypack.dev/avataaars  avataaars.js"
    #   edit:       remove the ESM default export, then bind the instance:
    #               window.AvatarExports = __instantiate("avataaars", false);

No other external tools (no npm scripts, no webpack/rollup/vite config) are part of this project.

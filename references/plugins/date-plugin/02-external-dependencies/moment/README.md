# External dependency: moment.js v2.27.0

The `date-plugin` generator vendors the **moment.js v2.27.0** minified UMD build
directly inside `main.pjs` (line 12, inside the `loadPluginCode()` function).

| File | Description |
| --- | --- |
| `moment-2.27.0.min.js` | **Byte-exact** bundle extracted from `main.pjs`. This is the code the generator actually runs. |
| `moment-2.27.0.upstream-min.js` | Official upstream `moment@2.27.0/min/moment.min.js` (differs only by a trailing `//# sourceMappingURL` comment). |
| `moment-2.27.0.js` | Official unminified build (`dist/moment.js`) — readable source. |
| `moment.js` | npm root build (`moment.js`). |
| `moment.min.js.map` / `moment-with-locales.min.js` / `locales.min.js` (+maps) | Upstream auxiliary builds. |
| `LICENSE` | MIT license (© JS Foundation and other contributors). |

Upstream project: https://momentjs.com/ · https://github.com/moment/moment
Canonical CDN for the exact pinned version: https://cdn.jsdelivr.net/npm/moment@2.27.0/moment.min.js
Full upstream source tree: see `../../03-third-party-source/moment-2.27.0/`.

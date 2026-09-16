# pluralize v8.0.0 (third-party dependency, MIT)

Upstream: https://github.com/plurals/pluralize
Package:  https://www.npmjs.com/package/pluralize

| File | What it is |
|------|------------|
| `pluralize.js` | byte-exact upstream v8.0.0 UMD build (unminified), fetched from https://unpkg.com/pluralize@8.0.0/pluralize.js |
| `pluralize.min.js` | the minified build **exactly as vendored inside** `01-internal-code/main.pjs`, extracted byte-for-byte from the body of `getPluralizeFunction()` |
| `LICENSE` | MIT, Copyright (c) 2013 Blake Embrey (hello@blakeembrey.com) |

## How it is embedded

`main.pjs` does **not** use `{import:...}`. The plugin inlines the minified library inside
`getPluralizeFunction()`, invoking the UMD wrapper with a throw-away `fakeWindow` as its
global so nothing leaks onto the real `window`:

```javascript
getPluralizeFunction() =>
  let fakeWindow = {};
  (function(window) {
    // From: https://github.com/plurals/pluralize (version 8.0.0)
    !function(e,a){ ...minified v8.0.0 build... }(this,function(){ ... });
  }).bind(fakeWindow)(fakeWindow);
  return fakeWindow.pluralize;
```

## Surface actually used by this project

`pluralize(word, count, inclusive)`,
`pluralize.addPluralRule(from, to)`,
`pluralize.addSingularRule(from, to)`,
`pluralize.addUncountableRule(word)`.

## Re-vendoring / upgrading

1. `curl -o pluralize.js https://unpkg.com/pluralize@<version>/pluralize.js`
2. Minify it (e.g. `esbuild pluralize.js --minify`).
3. Paste the minified result in place of the blob between `!function(e,a){` and
   `}).bind(fakeWindow)(fakeWindow);` inside `getPluralizeFunction()` in `main.pjs`.
4. Reload the generator (rules re-register on each page load).
No other changes are needed - `$output` only depends on the four functions listed above.

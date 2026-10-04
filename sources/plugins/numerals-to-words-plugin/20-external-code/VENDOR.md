# Vendored external code

## big.js v4.0.2
- Upstream: https://github.com/MikeMcl/big.js
- Version: 4.0.2 (a.k.a. `Big`) — arbitrary-precision decimal arithmetic
- Licence: MIT (see `big.js-4.0.2.LICENCE.txt`)
- Author: Michael Mclaughlin

### How it is embedded
It is **inlined** — not imported — as a single minified line inside `init()` in
`main.pjs` (line 74), immediately after the comment
`/* big.js v4.0.2 https://github.com/MikeMcl/big.js/LICENCE */`.

    init () =>
      window.digitsToWords_INITIALIZED = true;
      /* big.js v4.0.2 https://github.com/MikeMcl/big.js/LICENCE */
      !function(r){ ... }(this);
      window.digitsToWords_ONE_TO_NINETEEN = [ ... ];
      ...

The IIFE is called with `this`, so in a page it sets `window.Big`. The plugin uses it in
`chunk()` (`number.gt(0)`, `number.mod(1000)`, `number.div(1000).round(0,0)`) so that
integers of arbitrary length can be spelled out without floating-point loss.

The file `big.js-4.0.2.min.js` in this folder is that exact minified string, extracted
byte-for-byte from `main.pjs` (SHA-256 `c8cd4fc75871eeacfdf0196c2f23fd3818e0fc3e36992bc885e900603281a91f`).

### Why vendored rather than `{import:big.js}`
Perchance plugin code must be self-contained; embedding the bundle keeps the plugin a
single dependency-free unit that works offline and in any generator.

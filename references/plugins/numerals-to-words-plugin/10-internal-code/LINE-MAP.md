# main.pjs line map (1-based, 78 lines total)

| Lines | Symbol | Role |
|---|---|---|
| 1–29 | `$output(n, style)` | Public entry point. Normalises the input, splits integer/decimal, assembles the result, applies UK ("and") or US grammar, spells the decimal part. |
| 31–40 | `chunk(number)` | Splits an integer string into 3-digit chunks using Big for arbitrary precision. |
| 42–59 | `inEnglish(number)` | Spells 1–999 (handles <20, tens, hundreds). |
| 61–68 | `appendScale(chunk, exp)` | Appends thousand/million/billion… for a given chunk. |
| 71–75 | `init()` | One-time bootstrap: sets the INITIALIZED flag, evaluates the vendored big.js minified bundle, defines the word tables. |
| 73–74 | — | inlined **big.js v4.0.2** (external code; see `20-external-code/`). |
| 76 | `window.digitsToWords_ONE_TO_NINETEEN` | Data table: 1–19. |
| 77 | `window.digitsToWords_TENS` | Data table: multiples of ten. |
| 78 | `window.digitsToWords_SCALES` | Data table: scale names (thousand … novenonagintanongentillion). |

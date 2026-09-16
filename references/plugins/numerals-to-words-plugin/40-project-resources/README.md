# Project resources

**No separate resource files.**

The only data resources are the three spelling tables, kept inline at the end of
`main.pjs` and extracted for convenience into
`10-internal-code/modules/word-tables.pjs`:

| Table | Content | Entries |
|---|---|---|
| `digitsToWords_ONE_TO_NINETEEN` | "one" … "nineteen" | 19 |
| `digitsToWords_TENS` | "ten", "twenty" … "ninety" | 9 |
| `digitsToWords_SCALES` | "thousand", "million", … up to 10^3003-scale names | 1 |

UI resources: none — `index.html` is self-contained (inline `<style>`, one `<input>`).

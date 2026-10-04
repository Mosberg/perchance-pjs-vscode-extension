# 01 — Internal code (first-party source)

These two files ARE the generator. They ship together with the Perchance runtime.

- main.pjs    — the pjs code (defines the exported $output function).
- index.html  — the page body/documentation/demo.

No build step is involved: the Perchance engine consumes these directly.

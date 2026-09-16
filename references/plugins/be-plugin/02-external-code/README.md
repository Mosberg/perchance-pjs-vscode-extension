# External code / dependencies

**None.**

Dependency audit of the shipped generator:

- `main.pjs` has **zero** `{import:...}` statements.
- `index.html` has **zero** `<script src>`, `<script type="module">`,
  `import()`, or CDN references.
- No npm packages, no bundled libraries, no wasm, no external fonts.
- The only external code involved at runtime is the Perchance engine
  itself (provided by the platform, not redistributable here) plus
  standard browser DOM APIs (`document.querySelector`, `MutationObserver`,
  `setTimeout`).

Third-party generators referenced by the *documentation* (not imported by
the code) are vendored under `../06-referenced-generators/`.

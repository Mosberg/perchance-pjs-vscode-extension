# 03 — Third-party assets

**None.** This project contains no third-party binary or media assets of any kind:

- images / sprites / textures / icons — none (the page uses only text, a `<style>` block,
  and one Unicode die glyph `⚄` written as a character, not an image file)
- audio / music — none
- 3D models / meshes / animations — none
- shaders (GLSL/WGSL/HLSL) — none
- fonts — none (system font stack only)
- data files (JSON/YAML/CSV) — none at runtime

The only third-party artifact bundled is a **license text**:

| File | Source | License |
|---|---|---|
| `LICENSE-to-title-case` | https://github.com/gouch/to-title-case (David Gouch, © 2008–2018) | MIT |

The upstream project's own test fixture (`02-external-code/to-title-case/test/tests.json`,
5329 bytes) is the only structured data file in the package — test input/expected-output
pairs, not runtime data.

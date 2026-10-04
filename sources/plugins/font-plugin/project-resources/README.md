# Project resources (non-code assets)

There are **no** image, audio, model, shader, animation, sprite, or JSON-data assets in
this generator. Everything the page draws is text + CSS, and every non-text asset is
fetched from Google Fonts at runtime (bundled under `../third-party-assets/fonts/`).

| Category requested | Present? | Where |
|---|---|---|
| Images / sprites / textures | no | - |
| Audio / music | no | - |
| 3D models / meshes | no | - |
| Shaders (GLSL/WGSL) | no | - |
| Animations / rigs | no | - |
| JSON data / prefabs | no | `../project-resources/generator.json` is metadata about the generator, not consumed by it |
| Templates / UI resources | yes | the HTML markup + `<style>` block inside `../internal-code/index.html` |
| Fonts | yes | `../third-party-assets/fonts/` |

# tap-anywhere-plugin — complete asset bundle

Everything this project consists of. It is a tiny, dependency-free plugin.

Layout:
  internal-code/      main.pjs, index.html        (the whole generator)
  external-code/      (empty — no imports/libraries)
  third-party-assets/ (empty)
  project-resources/  (empty)
  build-config/       (empty)
  ASSET-MANIFEST.md   inventory
  AGENTS.md           workspace/AI instructions (not shipped code)

How the plugin works:
  main.pjs defines $output containing an inline <script>. When imported into another
  generator, that script registers a one-time global 'click' listener that calls
  window.update() — so clicking/tapping anywhere re-evaluates the generator.

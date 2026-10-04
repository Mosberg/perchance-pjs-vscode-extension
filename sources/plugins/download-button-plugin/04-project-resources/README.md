# 04 — Project resources / built artifacts

- standalone/download-button-plugin.html
    The platform-bundled, fully self-contained offline build of this generator
    (produced by https://perchance.org/api/downloadGenerator?generatorName=download-button-plugin).
    It embeds the pjs engine + this generator's main.pjs and index.html, so it runs
    with no network access. Append #edit to its URL to open the offline editor.
- deps.json
    The raw platform manifest returned by
    https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=download-button-plugin
    (records the imported-generator list and the canonical main.pjs source).

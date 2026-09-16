# External dependencies & references

## Runtime (required, not bundled)
- **Perchance engine** - https://perchance.org
  Hosts and evaluates `main.pjs` + `index.html`. Closed platform runtime;
  cannot be downloaded or vendored.
- **Perchance source API** -
  https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=<name>
  Public HTTP endpoint returning a generator's code + transitive imports.

## Plugins referenced by the page text (not imported by the code)
No `{import:...}` line exists in `main.pjs` right now. These are only mentioned
in the rendered documentation:
- url-params-plugin          https://perchance.org/url-params-plugin
- url-params-plugin-example  https://perchance.org/url-params-plugin-example?blah=abc123
- seeder-plugin              https://perchance.org/seeder-plugin
- link-plugin                https://perchance.org/link-plugin
- plugins directory          https://perchance.org/plugins

## Third-party JS / CSS / images
None. index.html loads no external scripts, stylesheets, fonts, or images.

# perchance generator: text-to-speech-plugin

Complete source package. Extracted from the live generator workspace.

- Public page: https://perchance.org/text-to-speech-plugin
- Live iframe origin: https://cdc8089acf7eefeab6e34add3b2ddb51.perchance.org/text-to-speech-plugin
- Export date: 2026-09-16

## 1. Internal code (this generator's own source)
| File | Bytes | Description |
|---|---|---|
| main.pjs | 6081 | Perchance-js source. Defines \$output(...) — the plugin entry point. |
| index.html | 4455 | Generator body: demo page + docs + voice-list script + styles. |

## 2. External code / dependencies
None. This generator imports no other generators/plugins — there is no \{import:...} line
anywhere in main.pjs or index.html, so no imports/ source tree exists.

Runtime dependency (browser platform API, not a file):
- Web Speech API: window.SpeechSynthesis, window.speechSynthesis.getVoices(), SpeechSynthesisUtterance.
  Browsers ship their own voice data; each browser exposes a different voice set.

## 3. Third-party assets
None. No images, audio, models, shaders, animations, JSON data, fonts, prefabs or templates
are referenced or generated. The only binary-ish asset is the emoji in the <h1>.

## 4. Project resources
None (nothing under src/).

## 5. Build / config files
None. No build pipeline, bundler, package.json, tsconfig, or \$meta block.
Perchance renders main.pjs + index.html directly; there is no compile step.

## Rebuild / reinstall
1. New perchance generator.
2. Paste main.pjs content into the code panel.
3. Paste index.html content into the HTML panel (body contents only).
4. Save. Other generators then use it via: speak = \{import:text-to-speech-plugin\}

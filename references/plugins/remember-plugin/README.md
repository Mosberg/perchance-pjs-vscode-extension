# remember-plugin — complete asset package

Generator: https://perchance.org/remember-plugin
Public id: 3ab4770fa532b656c62a3abe0eb1c09c

## 1. Internal code (first-party, ships with the generator)
- main.pjs    — the generator's Perchance-JS code panel (all logic lives here)
- index.html  — the generator's HTML panel (body contents only)

## 2. External code (imported perchance generators / plugins)
None. The string "\\{import:remember-plugin\\}" appears once in index.html but only inside a
documentation <pre> block as an example for users — it is escaped text, not a real import.
This generator imports no other generator or plugin at runtime.

## 3. Third-party assets (images, audio, models, shaders, animations, fonts)
None. Zero binary assets of any kind.

## 4. Project resources (JSON data, prefabs, templates, UI resources)
None. No external data files, no JSON, no templates.
UI is inline HTML + one inline <style> block in index.html.

## 5. Build / config files
None. There is no build step, bundler, package.json, lockfile, toolchain, CI config, or
dependency manifest. The two files above are served as-is by the Perchance engine.

## Runtime dependencies (provided by the Perchance platform, not vendored)
- Perchance engine (pjs list/DSL evaluator + template renderer)
- Browser APIs: localStorage, setInterval, DOM (querySelector, dispatchEvent), Node/ELEMENT_NODE

## Notes
main.pjs defines: $output(callerRoot, command), triggerEvent(el, type), getCssPath(el).
IndexedDB, network, fetch, and storage-quota use: none beyond localStorage.

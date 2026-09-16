# create-instance-plugin — Complete Project Package

Generator: https://perchance.org/create-instance-plugin
Public id: f3c1700220530a960f2912a2cfcd87b1

This archive contains every file that the project actually consists of, plus the
source of every external generator it references. It was assembled from the live
generator workspace; the workspace contains nothing else (no src/ tree, no
images, no audio, no models, no shaders, no build pipeline, no config files).

## Contents / categories

### internal-code/  (the entire generator)
- main.pjs    — the plugin implementation. Two functions: `$output (list, mode)`
                and `fixValues(node, mode)`, which clones a list node and
                "freezes" each property's value (selectOne) so repeated reads of
                the same instance return the same value. `mode === "deep"`
                recurses into property-only child nodes.
- index.html  — the generator's documentation page (the plugin's /plugins page).
                Pure static HTML + a <style> block; contains no JS and no assets.

### external-code/  (other perchance generators referenced by this project)
This plugin imports NOTHING — main.pjs has zero `{import:...}` lines. The files
under external-code/referenced-generators/ are the sources of the generators that
this project's docs link to, and of its one dependent generator. Each is a normal
Perchance generator (main.pjs, no html); each imports create-instance-plugin.

- create-instance-plugin-example/main.pjs          (docs: "this generator", simple usage)
- create-instance-plugin-example-simple/main.pjs   (docs: "very simple example")
- create-instance-plugin-example-3/main.pjs        (docs: gender-dependent example)
- create-instance-plugin-deep-example/main.pjs     (docs: "deep" mode example)
- create-instances-plugin/main.pjs                 (docs: create a LIST of instances; imports create-instance-plugin)

### third-party-assets/
None. The project uses no third-party images, fonts, audio, models, shaders,
data files or libraries.

### project-resources/
None (no data/*.json, sprites, templates, prefabs, or UI resources).

### build-config/
None. There is no build step — Perchance serves main.pjs + index.html directly.
The only "runtime" dependency is the Perchance engine itself (the platform's list
engine + inline JS evaluation), which is not a file and cannot be vendored.

## Runtime dependencies
- Perchance engine (platform, built in). No npm packages, no CDN scripts, no imports.
- Engine APIs used by main.pjs: `node.createClone`, `node.getPropertyKeys`,
  `node.getName`, `node.getLength`, `array.selectOne`, `Object.defineProperty`.

## Rebuild
No build. Copy internal-code/main.pjs -> the generator's code panel and
internal-code/index.html -> the generator's HTML panel.

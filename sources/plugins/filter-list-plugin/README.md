# filter-list-plugin — Complete Asset & Source Export

This archive is a byte-exact export of every file that makes up the
Perchance generator "filter-list-plugin" (perchance.org/filter-list-plugin).

IMPORTANT HONESTY NOTE: this project is genuinely tiny. It has NO images,
audio, models, shaders, animations, prefab/level data, fonts, or third-party
libraries, and NO build pipeline. It is a single Perchance plugin: one pjs
source file plus one HTML page. Everything that exists is included below.

## 1. Internal code (all of it)
- internal-code/main.pjs    — the generator's Perchance-JS: defines the
                              $output plugin handler (the filterList function)
                              and the plugin metadata.
- internal-code/index.html  — the generator's <body>: the plugin's
                              documentation/demo page (HTML + <style> only).

## 2. External code (imports)
NONE. main.pjs contains zero {import:...} lines; the plugin depends on no
other Perchance generator or plugin.

## 3. Third-party assets
NONE. No fonts, images, audio, video, 3D models, textures, or data files are
referenced or bundled.

## 4. Project resources
NONE. No src/ tree, no JSON/level data, no spritesheets, no generated assets.

## 5. Build / config files
NONE. Perchance generators are edited directly in the platform editor; there
is no bundler, package.json, lockfile, CI config, or compile step.

## Perchance platform runtime (not shipped, provided by the host)
The code runs inside the perchance.org engine, which supplies the DSL
($output, list trees, selectAll/selectOne/joinItems, template evaluation) and
serves index.html inside an iframe. Those are platform features, not files in
this project.

## How it works
filterList(list, handler) walks list.selectAll, keeps every node for which
handler(node) is truthy, returns the survivors as an array that also behaves
like a Perchance list when stringified (its toString applies selectOne).

## Recreating the generator
Paste main.pjs into the code panel and index.html into the HTML panel of a
new Perchance generator. Nothing else is required.

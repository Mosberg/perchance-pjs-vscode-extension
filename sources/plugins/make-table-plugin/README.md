# make-table-plugin - COMPLETE SOURCE + ASSET PACKAGE

Generator: https://perchance.org/make-table-plugin
Built from the live generator source on 2026-09-16.

## 1. What this project actually consists of

This generator is a small, dependency-free Perchance plugin. Its ENTIRE shipped
surface is two files, and both are included here in full:

  internal-code/main.pjs     <- all logic (one $output function) + 3 demo lists
  internal-code/index.html   <- the documentation page + its <style> block

There are NO other project files. Specifically, this project has NONE of:

  - src/ file tree               (none exists)
  - {import:...} statements      (none - zero Perchance dependencies)
  - npm/CDN modules              (none)
  - package.json / lockfile      (none)
  - build pipeline / bundler     (none - files ship as-authored)
  - images / sprites             (none)
  - audio / music                (none)
  - 3D models / textures         (none)
  - shaders                      (none)
  - animations                   (none)
  - JSON/data files              (none)
  - fonts                        (none - system default)
  - prefabs / templates          (only the inline <pre> doc snippets in index.html)
  - CSS files                    (styles live inline in index.html)
  - secrets / API keys           (none)

The single external script ever loaded at runtime is the Perchance engine itself.

## 2. Archive layout

  internal-code/
      main.pjs                          full source
      index.html                        full source
  external-code/
      platform-runtime/
          perchance-engine-491bf81418aa4b69.js
                                        exact byte copy of the runtime the
                                        generator loads from
                                        https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
                                        (115,369 bytes, platform code, unmodified)
      third-party-libraries/
          NONE.md                       (no third-party libs are used)
  project-resources/
      NONE.md                           (no assets of any kind)
  build-config/
      NONE.md                           (no build system)
  reference/
      AGENTS.md                         workspace/platform agent instructions
                                        (NOT part of the generator; included for
                                        completeness of the workspace snapshot)
  INVENTORY.md                          category-by-category audit
  SHA256SUMS.txt                        hashes of every file above

## 3. Runtime dependency graph

  index.html  --(render-time DSL)-->  main.pjs $output(table) -> HTML
       |                                   ^
       |                                   |
       +--> perchance-engine (external, platform-hosted, public)
                                      ^
                                      |
              [$output(myTable)] calls the function via makeTable({import:...})
              when the plugin is used from ANOTHER generator.

Note: main.pjs contains no browser JS at all - it is a single Perchance
function definition plus demo lists. No DOM handling, no event handlers,
no storage, no network calls, no timers.

## 4. Rebuild / run

  1. Paste internal-code/main.pjs into the Perchance code panel.
  2. Paste internal-code/index.html into the HTML panel.
  3. Save. The engine (external-code/platform-runtime/...) is served by the
     platform; you never need to host it yourself.

To use it as a dependency from another generator, add:
  makeTable = {import:make-table-plugin}
then in HTML:  [makeTable(myTable)]

generator-stats-plugin — complete source bundle
=================================================

This generator is the Perchance "Generator Stats Plugin".
It is a single-purpose Perchance generator (NOT a web-app project): it exposes
one public function, \$output(generatorName, dataType), which renders a <span>
that is later filled in with a generator's view count ("views") or the time
since its last edit ("lastEditTime"), fetched from the Perchance public API
endpoint /api/getGeneratorStats?name=<generatorName>.

FILES IN THIS BUNDLE
--------------------
internal code/
  main.pjs      - the generator's Perchance-js source. Defines:
                    $output(generatorName, dataType) -> returns a placeholder <span>
                      and asynchronously fills it with the requested stat.
                      Results are cached on window.generatorStatsPlugin092750294857.
                    formatData(g) -> formats views (k-suffix) and lastEditTime
                      (relative "N days ago" style string).
  index.html    - the generator's page body: usage documentation + CSS.

external code / third-party libraries / assets / build pipeline
  NONE. This generator has zero {import:...} statements, zero npm/CDN
  dependencies, no <script src>, no images/audio/models/shaders/JSON data, and
  no build step. The only network call it makes at runtime is to Perchance's own
  first-party API endpoint: /api/getGeneratorStats

HOW TO USE (as a plugin in another generator)
---------------------------------------------
In another generator's code panel:
    generatorStats = {import:generator-stats-plugin}
Then in the HTML/text area:
    [generatorStats("views")]
    [generatorStats("lastEditTime")]
    [generatorStats("some-other-generator", "views")]

LICENSE / SOURCE
----------------
Published at https://perchance.org/generator-stats-plugin

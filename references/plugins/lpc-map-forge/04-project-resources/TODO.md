# TODO / known rough edges

## Known issues

* `volcanic` theme produces very little `Lava` (~200 cells on a 96 map). The lava branch in
  `buildTerrain` requires `rockiness > 0.42 && e > 0.12` **and** `cc > 0.30`, so only true summits
  erupt. Loosen it a little, but keep lava off grass/low ground.
* `highland` is heavily snow-covered — the default `temperature` (0.56) combined with the lapse rate
  pushes most of the map below the snow line. Consider lowering `highland`'s `snow` or adding a
  rockier cold band between grass and snow.
* Rock detail is thin: the `rock` kind is a handful of grey boulders, so scree/boulder fields look
  repetitive on rocky biomes. The LPC Terrains / Tile Atlas packs contain more `Rock_*`/`Stone_*`
  boulders that could be cropped and appended to the atlas (append at the END of `props.js`).
* Plants are a single green palette, so snowy biomes rely on dead bushes and conifers for detail.
  A white/desaturated plant variant would help.
* The whole-world composite is only used when it is at least as sharp as the screen
  (`zoom * TILE * dpr <= ppt`). At dpr 2+ that means the tile path draws 2-3k tiles at mid zoom
  (~30ms/frame). Acceptable, but a second composite level (e.g. ppt 64/128) would make zooming
  smoother at the cost of memory.
* `despeckleWater` removes 1-cell water only when it has *zero* water neighbours — deliberately
  conservative. Tuning the threshold will change river headwaters noticeably.
* On small maps (≈64x64) `stats.ruins` and `stats.camps` both land on 0: the top candidates for
  those landmarks cluster around existing villages, so every sampled site is rejected by the
  "too close to a settlement" rule. Widening the candidate sample helps, but a proper fix is to
  bias landmark sampling towards the frontier/away-from-sites region.
* The map JSON is a full corner array, so a 256x256 map is ~1.3 MB of JSON before props. A
  compact/delta encoding would help the `kv` slots on big maps.

## Ideas

* Wire the plugin into the game: `mapForge = {import:lpc-map-forge}` in
  `2d-top-down-rpg-multiplayer`, then drive the overworld from `mapForge.generate(...)` /
  `toTileGrid(...)` (needs a game-side terrain→collision/biome mapping) and/or open the editor via
  `mapForge.open()` to hand-author a world. A "Use this map" button in `open()`'s close path would
  make the round-trip seamless.
* Let the AI world designer also place labels ("a fishing village on the north coast") — the label
  data model and rendering already exist; only the prompt/placement step is missing.
* Prop "era"/style filters (e.g. only temperate deciduous, only conifers) as AI-settable params.
* More prefabs: waterfalls, mountain stairs, harbour cranes, watchtowers, bandit camps (a railed
  bridge and a barred mine entrance now exist; the camps/mining sprites were integrated in the
  second asset pass).
* Roads painted in `Dirt_Tan`/`Gravel_1` place bridges at river crossings but the bridge deck is
  flat — a railed bridge sprite (with a shadow that follows the river) would look much better.
* A "stamp this region as a prefab" action: capture a clone-tool selection into `prefabs.js` so
  hand-built clusters can be reused across maps and sessions.
* Export a bare tile-id grid (JSON) alongside the `.tmx`, for engines that prefer their own map
  format over Tiled.
* Minimap viewport rectangle + drag-to-pan, and a hovered-tile info tooltip (status bar covers the
  basics today).

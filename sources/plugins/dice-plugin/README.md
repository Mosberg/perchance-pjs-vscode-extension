# dice-plugin - complete source package

Generator name: dice-plugin (public id 0d839950b26402a48933dfd80380f7e8)
Packaged: 2026-09-16

## What this is
A Perchance *plugin* generator. Its entire public surface is the `$output (str) =>` function in
`internal-code/main.pjs`, which parses dice notation (NdM, with + / - chaining) and returns a number.
`internal-code/index.html` is the plugin's documentation / landing page shown when someone visits it.

## Categories

| Category | Contents |
| --- | --- |
| internal code | internal-code/main.pjs, internal-code/index.html |
| external code | NONE - imports no other generators/plugins, loads no libraries |
| third-party assets | NONE - no images, audio, models, shaders, animations, JSON, prefabs, UI resources |
| project resources | NONE - no data/state files; the only output is a computed number |
| build / config | NONE - Perchance serves generators as-authored; no build step, bundler, package manifest, lockfile or CI |

The empty categories are not an omission. The project genuinely consists of exactly two source files.
A full-text search of both finds zero {import:...} directives, zero <script src>, zero <link href>, and
zero external asset URLs. The only outbound URL anywhere is a documentation hyperlink
(https://en.wikipedia.org/wiki/Dice_notation) in the landing page.

## Usage

In another generator's code panel:

    dice = {import:dice-plugin}

then in HTML/template:

    [dice("3d12")]          // three 12-sided dice
    [dice("3d12+4")]        // flat modifier
    [dice("2d6+1d8")]       // chain several dice groups
    [dice("4d6-3d4+2")]     // subtract too
    [dice(numDice+"d6")]    // dynamic count
    [dice("2d"+diceSize)]   // dynamic sides

Anything that is not valid dice notation returns the literal string (invalid dice notation).

## Notes

- AGENTS.md is included verbatim: it is the workspace/agent instruction file that ships alongside the
  two source files. It is not part of the plugin's runtime.
- While open in the Perchance editor preview, engine-side code (detectAdPoweredPlugin) throws
  TypeError: result2.apply is not a function when it probes properties of this function-rooted
  generator. That originates in the platform engine, not in this package; the landing page renders fine.

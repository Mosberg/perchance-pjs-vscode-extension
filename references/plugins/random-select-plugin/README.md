# random-select-plugin — complete source package

Generator: https://perchance.org/random-select-plugin
Public id: e2d8bab24dbbfe97fd45e17beff6d5de
Status at export time: saved (not unsaved)

## What this is
A Perchance plugin generator. It exposes a single function, `select(...)`, which
randomly returns a *reference* to one of the lists/variables you pass in (as opposed
to the curly-bracket notation `{a|b}`, which returns the *evaluated text* of the
chosen item).

## Usage
In the lists editor of a generator:

    select = {import:random-select-plugin}

Then:

    x = [select(a, b)]              // 50/50 between lists a and b

or with odds (all items must supply odds when any do):

    x = [select(a, b, null, 1, 2)]  // a has odds 1, b has odds 2

## Package contents
- main.pjs        — the entire plugin implementation ($output function)
- index.html      — the plugin's documentation page / landing UI
- ASSETS.md       — inventory of every asset + external reference (categorized)
- README.md       — this file

## Build system
None. Perchance generators have no build step: main.pjs is loaded implicitly before
index.html and its top-level names become globals on the page. To deploy, copy
main.pjs and index.html into the Perchance editor and save.

## Dependencies
None (no {import:...} lines, no CDN scripts, no npm packages, no fonts, no images,
no audio, no 3D/shaders/JSON data). The generator is 100% self-contained.

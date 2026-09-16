# copy-text-plugin — complete source package

A 100% complete, self-contained copy of the **copy-text-plugin** Perchance generator,
plus the complete source of every generator referenced by its documentation.
Nothing is summarized: every file is byte-exact source.

- Generator (top-level page): https://perchance.org/copy-text-plugin
- Published runtime origin: https://41cb683561b577c88650a029844b4186.perchance.org/copy-text-plugin
- Generator public id: 41cb683561b577c88650a029844b4186
- Platform: Perchance (perchance.org) — pjs + HTML generator engine

## What this plugin does

It exports a single function. Any generator can do `{import:copy-text-plugin}` and then
call `copyText(someText)` (or `copyText(someList)`) to copy text to the user's clipboard.

- `copyText(textOrList)` — `.evaluateItem` is called on the argument first, so you may pass
  either a raw string or a Perchance list node. Then it copies the resolved text.
- Uses the async Clipboard API (`navigator.clipboard.writeText`) when available and
  transparently falls back to the legacy `document.execCommand('copy')` textarea trick.

## Package layout

| Folder | Contents |
|---|---|
| internal-code/ | The generator's own source (main.pjs + index.html). |
| external-code/ | Complete source of the generators referenced in the docs/examples. NOTE: this generator has ZERO code dependencies (no {import:} lines). |
| third-party-assets/ | Images / audio / models / fonts / data — this project uses NONE. |
| project-resources/ | Runtime data files, prefabs, templates — this project uses NONE. |
| build-config/ | Build pipeline / config — this project has NONE (Perchance hosts). |

## Dependencies (exhaustive)

The generator itself imports nothing. It is pure platform-native code:

    main.pjs imports:   (none)
    index.html imports: (none)

The example and reference generators in external-code/ do import things; those imports
resolve to other public Perchance generators and are listed here so the set is complete:

- copy-text-plugin      (the plugin itself — this package, internal-code/)
- animal                (word list) -> credits github.com/dariusk/corpora
- adjective             (word list, used by the output-history example)
- simple-gen-footer     (UI footer used by the animal generator's description)

## How to deploy / build

There is no build step. Perchance is the build + host pipeline:

1. Open https://perchance.org/copy-text-plugin#edit
2. Paste internal-code/main.pjs into the "lists" editor.
3. Paste internal-code/index.html into the "HTML" editor.
4. Save. The plugin is live; other generators import it via `{import:copy-text-plugin}`.

## Usage (from the in-page documentation)

In your lists editor:

    copyText = {import:copy-text-plugin}

    output
      Your spirit animal is: {import:animal}

In your HTML editor:

    <p>[o = output.evaluateItem]</p>
    <button onclick="update()">randomize</button>
    <button onclick="copyText(o)">copy output</button>

Key detail: evaluate the list ONCE into a variable (here `o`) and use that same value for
both the visible output and the clipboard. If you hand the un-evaluated list to copyText
it is still fine (copyText calls evaluateItem internally), but evaluating once guarantees
the copied text matches exactly what the user sees.

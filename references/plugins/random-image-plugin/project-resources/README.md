# Project resources

The generator's user-facing resources are *generated from code* rather than stored as files.
This folder documents where each visible resource comes from.

## UI markup / copy

| Resource | Source | Notes |
|---|---|---|
| Page heading `\ud83d\udce6 Random Image Plugin \ud83d\udcf7` | `../internal-code/index.html` line 1 | literal HTML |
| Usage instructions, code samples, notes list | `../internal-code/index.html` | literal HTML, no i18n layer |
| Live demo images | `[$output(\"cat\")]`, `[$output(\"cat\", 200, 100)]`, `[$output(myAnimalList)]`, `[$output(myAnimalList, 600, 400, \"contain\")]` | rendered by the engine at load time from `internal-code/main.pjs` |
| Page styling | `<style>` block at the foot of `index.html` | `body` background `#eee`, `pre.custom` dark code panels, `ul.dot-list` spacing, `code` inline highlight |

## Data / content lists

| Resource | Source | Values |
|---|---|---|
| `myAnimalList` | `../internal-code/main.pjs` (last 4 lines) | `frog`, `mouse`, `rabbit`, `deer` - the sample list used to demonstrate passing a pjs list to the plugin |

## Templates

The project uses the pjs templating DSL inline. Every square-bracket expression in the project:

```
[$output(\"cat\")]
[$output(\"cat\", 200, 100)]
[$output(myAnimalList)]
[$output(myAnimalList, 600, 400, \"contain\")]
```

Escaped sequences that must stay literal in the HTML (they are shown to the reader as code,
and must NOT be evaluated by the engine):

```
\\{import:random-image-plugin\}   ->  displayed as  {import:random-image-plugin}
\\[image(\"cat\")]                 ->  displayed as  [image(\"cat\")]
```

## External links embedded in the UI

- https://perchance.org/random-image-plugin-example#edit
- https://source.unsplash.com/
- https://unsplash.com/license
- /plugins

## Generated output (runtime, not stored)

Each call returns a `String` object carrying `.src`, so consumers can request the markup
(`[image(\"cat\")]`) or just the URL (`[image(\"cat\").src]`).

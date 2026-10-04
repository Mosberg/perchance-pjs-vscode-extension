# External code: the Perchance engine

## What it is

```
https://perchance.org/lib/perchance-engine-491bf81418aa4b69.js
```

This is the `<script src>` present in the rendered page. It is the only external code
the generator depends on. The URL is content-hashed (`491bf81418aa4b69`), i.e. it is a
pinned, immutable build served by the platform.

## What it provides to this generator

| Symbol used in `main.pjs` | Provided by |
| --- | --- |
| `list.getChildNames` | engine list-tree API |
| `list[n].getOdds` | engine list-tree API |
| `Array.prototype.reduce` | JavaScript built-in |
| `$output` export semantics | engine (makes an import resolve to a function instead of `root`) |
| `[ ... ]` square-bracket evaluation | engine |
| `\[ \] \{ \}` escaping in index.html | engine |

## Why it is not included in the ZIP

It is minified, owned by Perchance, and versioned by the platform; bundling it would
create a stale copy that no longer matches the live engine. It is fetched by the browser
automatically whenever the generator runs. If you need an offline copy, download it from
the URL above at the time of packaging.

## Other external references in `index.html`

`index.html` contains ordinary hyperlinks (not assets, not loaded by the page as code):

- `https://perchance.org/sum-odds-plugin-example#edit`
- `https://www.reddit.com/r/perchance/comments/bpg131/how_do_i_use_sublists_without_altering_the_odds/`
- `/plugins`

## Imports

None. There are no `{import:...}` statements in this generator, so nothing is vendored
and there is no dependency graph to resolve.

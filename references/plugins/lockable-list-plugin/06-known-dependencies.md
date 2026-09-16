# Platform behaviour this code depends on

Not third-party assets, but the external surface the plugin is coupled to. Changing any of
these would require a code change:

| Dependency | Where used | What it provides |
| --- | --- | --- |
| Perchance `$output` | top of `main.pjs` | Exposes the module as a callable function to importing generators, and makes the return value of `lockableList(...)` the imported value (instead of the list-tree). |
| Perchance list objects | `main.pjs` params `(list, command)` | Calling `lockableList(animal)` passes the *list node object*, not a string. It is used as a `Map` key in `lockedMap`/`idMapRev`, which is what makes "one lock per list" work. |
| List selection | `value = list+""` | String-coercing the list node runs the engine's normal weighted random selection. |
| `window` global state | `window.lockListPluginData` | Persists the lock maps across renders/calls. Deliberately on `window` so that all imports of the plugin share one table. |
| Inline event handlers | generated `onclick="..."` | The lock/unlock toggle runs as a classic inline attribute handler (the generated markup must therefore stay in a non-module context). It re-reads `window.lockListPluginData` at click time rather than closing over variables, because the markup is re-rendered/stringified. |
| Emoji rendering | `🔐` / `🔓` | OS/browser emoji font supplies the icon glyphs. |

## No persistence
Lock state lives in memory only (`window.lockListPluginData`). Reloading the page resets every
lock to unlocked. That is intentional — see the plugin's `index.html` notes.

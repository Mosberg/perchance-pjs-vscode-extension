# tooltip-plugin - API reference

## Import

```text
tooltip = {import:tooltip-plugin}
```

The generator exports `$output`, so importing it yields the function itself rather than the root
list: you call it as `tooltip(...)`.

## Signature

```text
$output(anchorText, toolTipText, options) -> HTML string
```

| Arg | Type | Required | Meaning |
| --- | --- | --- | --- |
| `anchorText` | string / list | yes | Visible text (or HTML) the tooltip attaches to; output as-is. |
| `toolTipText` | string / list | yes | Tooltip body. Evaluated by the Perchance engine at render time - lists, curly blocks and square blocks all work. |
| `options` | Perchance list or plain object | no | Any tippy.js prop. List-shaped options are read property-by-property; plain objects are deep-cloned. |

Returns a `<span style='cursor:pointer' class='______tippy-tooltip-<random>'>` carrying the payload in
`data-tooltip-content`; a tippy instance is attached to it ~200 ms later.

## Options

Every tippy.js v6 prop is accepted. The ones the generator's own docs use, plus the override it
always applies:

| Option | Type | Default here | Effect |
| --- | --- | --- | --- |
| `css` | string (CSS declarations) | none | Becomes a generated tippy theme on the tooltip box. If it contains a background-color, the arrow is coloured to match. Identical CSS strings share one theme class and one style tag. |
| `interactive` | boolean | tippy default (false) | Keeps the popup open while the pointer is inside it, so links/buttons inside the tooltip are clickable. |
| `allowHTML` | boolean | tippy default (false) | Lets tooltip text contain HTML (links, images, bold, ...) instead of plain text. |
| `appendTo` | element | document.body | Overridden by the plugin: tippy's own default (parent, when interactive) would let the tooltip inherit the anchor's styles. |
| `placement` | string | tippy default (top) | e.g. bottom, top-start, right. |
| `trigger` | string | tippy default (mouseenter focus) | e.g. click, manual. |
| delay / duration / maxWidth / zIndex | number(s) | tippy defaults | Standard tippy timing and geometry props. |
| `theme` | string | set internally | Overwritten when css is supplied - that is how the generated CSS is scoped. |

Anything else passes straight through, including event hooks (onShow, onHide, onMount, ...) and plugin
props (followCursor, sticky, animateFill, inlinePositioning) - the bundled tippy includes all of its
optional plugins and installs them as defaults.

## Behaviour notes / gotchas

- **Lazy load:** tippy + Popper + tippy's CSS are injected on the first tooltip() call, once per page.
- **Randomised classes:** every call gets a unique token class, so repeated/duplicate calls cannot
  collide. A call whose span has already been removed (e.g. the page rerolled) silently no-ops.
- **Text escaping:** '>' and '"' in the tooltip text are swapped for placeholder tokens before being
  written into data-tooltip-content, then swapped back when tippy is created. This is deliberate: it
  lets Perchance curly/square blocks resolve inside the attribute rather than being escaped early.
- **Perchance lists as options:** write them as an indented sub-list; each property is copied over
  individually, because list nodes cannot survive JSON.stringify (cyclic parent references).
- **No network requests:** the vendor code is a string inside main.pjs - nothing to block, nothing to
  CORS-fail, no CDN outage risk, works offline.
- **Styling hooks:** generated themes are .tippy-box[data-theme~='<n>']; arrow overrides target
  [data-placement^='top'|'bottom'|'left'|'right'] > .tippy-arrow::before.
- **Bundled tooltip CSS** (emitted by the inlined tippy): .tippy-box, .tippy-content, .tippy-arrow,
  [data-tippy-root], the fade animation, and placement-specific arrow borders.

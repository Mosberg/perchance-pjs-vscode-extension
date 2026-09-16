# `wheelOptions` reference — complete option schema

How options flow through the code:

* `wheelOptions` is a Perchance list. Its `segments` list defines the wedges; its `animation` list configures
  the spin; **every other direct property** of `wheelOptions` is copied straight onto the Winwheel config object
  (`for (let prop of wheelOptions.getPropertyNames) winwheelOptions[prop] = wheelOptions[prop]` in
  `01-internal-code/wheel-plugin-functions.js`), so the full Winwheel option surface is available.
* Each `segments` child: the node's **name becomes the wedge label text** (`segment.text = segmentNode.getName`),
  and each of its properties is copied onto that Winwheel `Segment` (`fillStyle`, `image`, `size`, text
  overrides, ...).
* Nothing is required except `segments`. Everything else has defaults.

## Wheel-level options

| Option | Type | Default set by plugin | Meaning |
|---|---|---|---|
| `segments` | list | — (required) | Wedges, in order. Children's names are the labels. |
| `animation` | list | see below | Spin animation config (Winwheel `Animation`). |
| `pointer` | HTML string | `<div style="font-size:200%; transform: translateY(10px);">▼</div>` | Markup drawn above the canvas, e.g. `pointer = ⬇️`. |
| `wheelDiameter` | number (px) | `400` | Canvas width/height in CSS px (`responsive: true` scales it down to fit narrow screens). |
| `randomFillStyle` | `pastel` \| `normal` | — | Assigns each segment a random `fillStyle`: `pastel` = `hsla(rand(0-359), 70%, 80%, 1)`; `normal` = fully random hue/sat/light. |
| `sound` | `tick` \| `tock` \| `tock2` \| `none` \| data URL | `tock` | Per-segment-boundary tick sound (see `../03-assets/ASSETS.md`). |
| `fillStyle` | CSS color | Winwheel `silver` | Default wedge fill when a segment doesn't set its own. String or function. |
| `strokeStyle` | CSS color | `black` (forced in image mode) | Wedge border color. |
| `lineWidth` | number | `1` | Wedge border width. |
| `innerRadius` | number | `0` | Makes a doughnut wheel. |
| `outerRadius` | number | half of canvas | Wheel radius. |
| `centerX`, `centerY` | number | canvas center | Wheel center on the canvas. |
| `rotationAngle` | number | `0` | Starting rotation of the whole wheel. |
| `pointerAngle` | number | `0` | Angle used to determine the "indicated" (winning) segment. |
| `drawMode` | `code` \| `image` \| `segmentImage` | `segmentImage` if any segment has an `image`, else `code` | How wedges are painted. `image` paints a whole-wheel picture instead. |
| `drawText` | boolean | `true` (re-enabled even in image mode) | Whether labels are drawn. |
| `textFontFamily` | string | `Arial` | Label font family. |
| `textFontSize` | number | `20` | Label font size. |
| `textFontWeight` | string | `bold` | Label font weight. |
| `textOrientation` | `horizontal` \| `vertical` \| `curved` | `horizontal` | Label orientation. Use `curved` with `textAlignment` for labels that follow the arc. |
| `textAlignment` | `center` \| `inner` \| `outer` | `center` | Label placement along the radius (`inner`/`outer` needed with `curved`). |
| `textDirection` | `normal` \| `reversed` | `normal` | Label reading direction. |
| `textMargin` | number | `textFontSize / 1.7` | Gap between label and wheel edge. |
| `textFillStyle` | CSS color | `black` | Label fill. |
| `textStrokeStyle` | CSS color | `null` | Label outline color. |
| `textLineWidth` | number | `1` | Label outline width. |
| `clearTheCanvas` | boolean | `true` | Clear before each redraw. |
| `imageOverlay` | boolean | `false` | Draw wedges on top of the wheel image (debugging alignment). |
| `responsive` | boolean | `true` | Resize the canvas to the viewport (uses `window.winwheelResize`). |
| `pins` | list | — | `{ visible, number, outerRadius, fillStyle, strokeStyle, lineWidth, margin, responsive }` pegs drawn around the rim. Disabled in the shipped code (commented out). |
| `pointerGuide` | list | — | `{ display, strokeStyle, lineWidth }` debug line from center to the pointer. |
| `wheelImage` | Image | — | Whole-wheel background image (`drawMode = image`). |

### Non-Winwheel extras accepted at wheel level

Any other property is still copied verbatim onto the Winwheel config object, so future Winwheel options work
without plugin changes. Perchance-level things such as `wheelDiameter`, `pointer`, `randomFillStyle`, `sound`
are read by the plugin itself.

## `segments` child options

| Option | Type | Default | Meaning |
|---|---|---|---|
| *(node name)* | string | — | Wedge label (`segment.text`). |
| `fillStyle` | CSS color or function(`segment`, `wheel`) | wheel `fillStyle` | Wedge fill. |
| `size` | number (degrees) | remaining space split evenly | Fixed wedge angle. Sizes that don't sum to 360 have the remainder distributed across unsized wedges. Also used to clip `image`s. |
| `image` | URL | — | Picture painted inside the wedge. Forces `drawMode = "segmentImage"`, preloaded before the wheel is built, then rendered through `getArcClippedCanvas()` so it is clipped to the wedge's arc. Images are set via `imgData` (a canvas), which is why `drawSegments()` is called manually after drawing them. |
| `strokeStyle`, `lineWidth` | color / number | wheel defaults | Per-wedge border override. |
| `text*` (family, size, weight, orientation, alignment, direction, margin, fillStyle, strokeStyle, lineWidth) | as above | wheel defaults | Per-wedge label overrides. |
| `imageDirection` | `N`/`E`/`S`/`W` | `N` | Rotation of a segment image. |

**Caveat preserved from upstream/docs:** segment images do not render in the correct place if a segment's
angle exceeds 180° — keep every wedge ≤ 180° when using images.

## `animation` options

| Option | Type | Plugin default | Meaning |
|---|---|---|---|
| `type` | `spinToStop` \| `spinOngoing` \| `spinToSegment` \| `custom` | `spinToStop` | Animation mode. |
| `duration` | seconds | `5` | Spin length (docs example: `15`). |
| `spins` | number | `8` | Approximate whole turns (docs example: `20`). |
| `direction` | `clockwise` \| `anti-clockwise` | `clockwise` | Spin direction. |
| `easing` | function name | — | Tween easing; the bundled GSAP supplies the tween engine. |
| `callbackFinished` | function | no-op | Called with the winning `Segment` object when the wheel stops — e.g. `callbackFinished(winningSegment) => alert("You won " + winningSegment.text)`. The passed object is Winwheel's `getIndicatedSegment()`, so `.text`, `.fillStyle`, etc. are available. |
| `callbackSound` | function | **overridden by the plugin** | Called each time the indicated segment/pin changes (`soundTrigger`); the plugin replaces it with the tick-audio player (`pause`, reset `currentTime`, `play`). |
| `callbackBefore` | function | — | Called at the start of each animation frame. |
| `callbackAfter` | function | redraw if images are used | Called at the end of each animation frame; the plugin's default re-draws segments when segments carry images. |
| `soundTrigger` | `segment` \| `pin` | `segment` | What triggers `callbackSound`. |
| `propertyName`, `propertyValue` | string / any | — | For `custom` animation: the property tweened. |
| `yoyo`, `repeat`, `stopAngle` | boolean / number / number | — | Misc Winwheel animation controls. |

## Runtime behaviour (how the returned widget works)

`$output(wheelOptions)` returns:

```html
<div style="display:inline-block; cursor:pointer;">
  <div style="text-align:center;">{pointer}</div>
  <canvas id="{wheelId}CanvasId" width height onclick="...stopAnimation(false);
         rotationAngle %= 360; startAnimation();"></canvas>
</div>
```

* Each render creates a unique `wheelId` (`"winwheel" + Math.random().toString().slice(2)`) and a matching
  `window[wheelId]` Winwheel instance, so many wheels can coexist on one page.
* A default config set by the plugin: `responsive: true`, `drawText: true`, `numSegments = segments.getLength`,
  forced `strokeStyle = "black"` in image mode (Winwheel otherwise forces red there), and image mode draws
  once more 10 ms after construction (and again via `callbackAfter`) because segment images need a second pass.
* Spinning is initiated by **clicking the canvas**: it stops any current animation, normalizes
  `rotationAngle` modulo 360, then `startAnimation()`s. There is no plugin-provided spin button — callers can
  call `window[wheelId].startAnimation()` themselves.
* Timing detail: the Wheel instance and its audio are created in a `setTimeout(..., 10)` and image preloading
  is awaited, because the template's HTML is not in the DOM yet when the output string is produced.

# External code (third-party libraries)

The generator has exactly **two** third-party dependencies, both **vendored** (pasted verbatim into
`01-internal-code/main.pjs`) so that the plugin runs with no CDN/network dependency. No `{import:...}`
plugin, no npm module, no bundler.

Both vendored copies are reproduced in full in this folder exactly as they ship inside `main.pjs`
(the only change being a two-space dedent, because the originals are nested inside the `initWinwheel()`
Perchance function), alongside upstream originals for auditing.

---

## 1. Winwheel.js 2.8.0 — spinning-wheel rendering & animation

* Upstream: https://github.com/zarocknz/javascript-winwheel
* Release used: https://github.com/zarocknz/javascript-winwheel/releases/tag/2.8.0
* Docs (archived, as linked from the generator's own documentation):
  * Wheel options — https://web.archive.org/web/20210122080716/http://dougtesting.net/winwheel/refs/class_winwheel
  * Segment options — https://web.archive.org/web/20210122080719/http://dougtesting.net/winwheel/refs/class_segment
  * Animation options — https://web.archive.org/web/20210122080721/http://dougtesting.net/winwheel/refs/class_animation
* License: **MIT** (full text in `winwheel-2.8.0/upstream/LICENSE`), © 2015 dougtesting.net / @zarocknz
* Shipped copy: `winwheel-2.8.0/winwheel-2.8.0.vendored.js` (25,704 chars) = `main.pjs` lines 354–445
* Upstream originals: `winwheel-2.8.0/upstream/Winwheel.js` (127,197 B, annotated source),
  `winwheel-2.8.0/upstream/Winwheel.min.js` (23,260 B), `LICENSE`, `README.md`

### Local modifications in the shipped copy

The shipped copy is a **re-minified variant** of v2.8.0 (Winwheel is attached to `window.Winwheel`,
`Pin`/`Animation`/`Segment`/`PointerGuide` and the `winwheel*` free functions are attached to `window.*`,
and identifiers are mangled differently from the official `Winwheel.min.js`, e.g. `t,i` where upstream
uses `a,c`), plus these deliberate functional edits:

1. `Winwheel.prototype.draw()` is rewritten by hand in de-minified, readable form — the upstream minified
   `draw=function(...)` was replaced wholesale.
2. Inside that `draw()`, the `drawMode === "segmentImage"` branch ends with an extra `this.drawSegments();`
   call. The original code in `main.pjs` marks it:

   ```js
   //////////////////////////////////////////////////////
   this.drawSegments(); // EDIT: I added this to suit wheel-plugin defaults
   //////////////////////////////////////////////////////
   ```

   (Upstream's original minified `draw()` is commented out directly above the rewritten version, so both
   variants are preserved in the vendored blob.)

Other local glue that lives next to the vendored library in `main.pjs` (and is extracted to
`01-internal-code/wheel-plugin-functions.js`) is *not* part of Winwheel upstream:

* `window.drawImageToCanvasContained(ctx, img, x, y, w, h, offsetX, offsetY)` — object-fit-style "cover"
  image drawing. By Ken Fyrstenberg Nilsen: https://stackoverflow.com/a/21961894/11950764
* `window.getArcClippedCanvas(imageUrl, radius, arcSizeDeg)` — renders a segment image, clipped to the
  segment's arc, so images never overflow their wedge.

---

## 2. GSAP TweenMax 2.0.2 — wheel spin animation driver

* Upstream: https://greensock.com (GreenSock Animation Platform), TweenMax 2.0.2, dated 2018-08-27
* Original CDN URL, cited in a comment in `main.pjs`:
  https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.2/TweenMax.min.js
* Includes: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin,
  BezierPlugin, AttrPlugin, DirectionalRotationPlugin
* License: **GreenSock standard "no charge" license** — https://greensock.com/standard-license
  (© 2008–2018 GreenSock / Jack Doyle; the full license header is preserved at the top of the vendored blob)
* Shipped copy: `gsap-tweenmax-2.0.2/TweenMax-2.0.2.vendored.js` = `main.pjs` lines 455–462
* Upstream original: `gsap-tweenmax-2.0.2/upstream/TweenMax.min.js` (116,074 B)

### Local modifications in the shipped copy

The whole library is wrapped so that GSAP attaches to a throwaway object rather than the real page
`window`, keeping the host generator's global scope clean:

```js
let fakeWindow = {};
(function(window) {
  var _gsScope = ... // upstream body, unchanged
})(fakeWindow);
```

The wrapper's purpose is documented by a comment left in `main.pjs`:

> `// I initially tried to use a fake window to capture the objects, but then realised that it wasn't working, but then I realised that it actually works fine with just the wrapper and if I take it away then it doesn't work. *shrug*`

Verification (run by `05-build-config/verify-vendored.mjs`): the wrapped body is **identical to the
upstream cdnjs file modulo whitespace** — 114,422 non-whitespace characters, exact match. The only
difference is the wrapper plus line-wrapping/indentation.

Winwheel's animation module uses whatever tween library is on the scope it was hand-built against, which
is why this wrapper exists.

---

## 3. Everything else

Nothing else is external. The base64 MP3 tick sounds are original project assets (see
`../03-assets/ASSETS.md`), the segment images are user-supplied URLs (see the same file), and the
generator's own code is in `../01-internal-code/`.

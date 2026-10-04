# Assets

Every non-code asset used by `wheel-plugin`, stored here as real binary files.

## audio/ — the three built-in segment "tick" sounds

These are **not** separate files in the generator: they are embedded in `main.pjs` as data URLs, inside

```js
window.wheelSegmentSoundsDataUrls = {
  tick:  `data:audio/mpeg;base64,...`,
  tock:  `data:audio/mpeg;base64,...`,
  tock2: `data:audio/mpeg;base64,...`,
};
```

and played through `new Audio(...)` by Winwheel's `animation.callbackSound`, once per segment boundary
crossed during a spin. `wheelOptions.sound` selects one: `"tick"`, `"tock"` (`"tock"` is the default when
`sound` is omitted), `"tock2"`, `"none"`, or a full `data:audio/mpeg;base64,...` URL for a custom sound
(the generator's documentation page lets users upload a clip and produces that data URL).

| File | Bytes | Encoded length in `main.pjs` | Format | Notes |
|---|---|---|---|---|
| `audio/tick.mp3` | 2,398 | 3,236 chars of base64 | MPEG-1 Layer III (`FF FB` frame sync), mono | higher-pitched tick |
| `audio/tock.mp3` | 1,944 | 2,628 chars of base64 | MPEG-1 Layer III (`FF FB` frame sync), mono | the default sound |
| `audio/tock2.mp3` | 11,411 | 15,253 chars of base64 | MP3 with ID3v2 tag (encoded with Logic Pro 9.1.8) | lower "thunk", ~6× longer than the others |

To put a custom sound in a wheel config, upload it on the generator page and paste the resulting
`data:audio/mpeg;base64,...` string as `sound = data:audio/mpeg;base64,.....`.

Note: browsers block audio until the user interacts with the page. In this plugin the first sound only
plays after the user clicks the wheel to spin it, which satisfies autoplay policies in practice.

## images/ — the segment images used in the documentation examples

Both URL sets point at the same three photographs (fruit), used by the `wheelOptions` image example.

| Subject | Referenced URL | Local file | Bytes |
|---|---|---|---|
| apples | `https://i.imgur.com/gPg3Uvi.jpg` (used in `main.pjs` `wheelOptions8`) | `images/i.imgur.com/apples.jpg` | 14,597 |
| bananas | `https://i.imgur.com/McrEpfA.jpg` | `images/i.imgur.com/bananas.jpg` | 5,109 |
| grapes | `https://i.imgur.com/dZmOaTp.jpg` | `images/i.imgur.com/grapes.jpg` | 9,403 |
| apples | `https://user-uploads.perchance.org/file/47592ece70be9cfbc378b3820d93eae6.jpeg` (used in `index.html`) | `images/user-uploads.perchance.org/apples.jpeg` | 14,597 |
| bananas | `https://user-uploads.perchance.org/file/1b7bfdc0ef9998b869301f83974feacd.jpeg` | `images/user-uploads.perchance.org/bananas.jpeg` | 5,109 |
| grapes | `https://user-uploads.perchance.org/file/9bf235dcce14dc85e26bff744338697b.jpeg` | `images/user-uploads.perchance.org/grapes.jpeg` | 9,403 |

**Verified:** each imgur↔perchance pair is byte-identical by SHA-256 — the Perchance uploads are re-hosts
of the imgur originals. (The generator's own documentation tells users to prefer uploads to
`perchance.org/upload` over hotlinking, because hotlinked URLs rot; that advice was applied to
`index.html` before `main.pjs`'s demo list.)

All downloads returned HTTP 200 with `Content-Type: image/jpeg`.

## Attribution / licensing of assets

* The three tick sounds are original project assets of `wheel-plugin` (author-generated).
* The fruit photographs are third-party images of unknown provenance, used only as documentation
  examples for the `image` segment option. They are bundled here only to make this export self-contained;
  they are not required by the plugin and can be deleted without affecting the code. If you redistribute
  this package publicly, replace them with your own images or verify their license first.

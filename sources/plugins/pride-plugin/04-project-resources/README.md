# Project resources

## images/rainbow-pride-flag.png
The one and only asset the generator ships. 120x120 pixels, PNG.
It is stored inline inside main.pjs as a base64 data URI and injected into the
rendered <img> as the image src. This file is that same data URI decoded to a
real PNG for convenience/reuse.

## images/rainbow-pride-flag.data-uri.txt
The exact data URI string as embedded in main.pjs, byte-for-byte (single line,
followed by a newline).

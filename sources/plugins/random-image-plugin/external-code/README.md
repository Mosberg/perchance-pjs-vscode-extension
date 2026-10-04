# External code / services referenced by this project

## Summary

This generator contains **no `{import:...}` dependencies** and **no vendored third-party code**.
There are no npm packages, no CDN `<script>` tags, and no bundled libraries. All of the
executable code in the project is first-party (see `../internal-code/`).

The project has exactly **one external runtime dependency**, and it is a remote *service*
(reached by URL), not a code library:

| Dependency | Type | Where used | Endpoint | Status |
|---|---|---|---|---|
| Unsplash Source API | remote image service (HTTP GET, returns an image or a 302 redirect to one) | `internal-code/main.pjs` -> `$output()` | `https://source.unsplash.com/featured/?<topic>` and `https://source.unsplash.com/<width>x<height>/?<topic>` | **HTTP 503 - service retired** |

## How it is called

main.pjs builds the URL itself; there is no client library and no API key:

```js
// contain mode
`https://source.unsplash.com/featured/?${topic}${cacheBusterSpaces}&__cacheBuster=${Date.now()}`
// crop mode (default)
`https://source.unsplash.com/${width}x${height}/?${topic}${cacheBusterSpaces}&__cacheBuster=${Date.now()}`
```

The URL is never fetched by JavaScript - it is placed directly into an `<img src>` (or a CSS
`background-image`), so the *browser* performs the request. That is why the plugin needs no
CORS handling and no `super-fetch-plugin`.

`cacheBusterSpaces` (`" ".repeat(random(0..20))`) plus `__cacheBuster=<epoch ms>` are appended so
each call produces a distinct URL and the browser cache cannot serve a repeated image.

## Live status check (performed while building this package)

`GET https://source.unsplash.com/` returned **HTTP 503** (Heroku application-error page).
Unsplash retired the Source API in favour of the official API, which requires a registered
access key. A raw response snapshot is saved next to this file as
`source-unsplash-com.response.html`.

## Upstream documentation

- Unsplash Source API (legacy): https://source.unsplash.com/
- Unsplash official API (replacement, requires an access key): https://unsplash.com/developers
- Unsplash documentation: https://unsplash.com/documentation
- Unsplash licence: https://unsplash.com/license  (snapshot: `../third-party-assets/unsplash-license.snapshot.html`)

## Platform runtime code (not this generator's source)

The generator runs inside the Perchance engine. The engine, the `perchance.org` platform,
and (when such an import exists) any plugin generator it pulls in are supplied by the host
at runtime; they are **not** part of this project's source tree and are therefore not
reproduced here. The only platform-supplied interface this project relies on is the
pjs `$output` hook that turns the imported generator into a callable function.

Platform API used to verify the deployed copy of this generator:
`https://perchance.org/api/getGeneratorsAndDependencies?generatorNames=random-image-plugin`
(cached response: `../internal-code/platform-registry-snapshot.json`).

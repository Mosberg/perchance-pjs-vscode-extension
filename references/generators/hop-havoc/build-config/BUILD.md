# Build & configuration

## There is no build step

Hop Havoc is a **Perchance generator**. It is not bundled, transpiled, minified or
compiled. The three source files are served to the browser as-is by the Perchance
engine:

| File | Role | How it is served |
|---|---|---|
| `main.pjs` | Perchance DSL: `$meta`, plugin imports, config lists (`defaultCommentOptions`) | Parsed/evaluated by the Perchance engine before the page body renders |
| `index.html` | Screen markup, HUD, all CSS, the comments/server boot scripts | Injected as the `<body>` of the iframe (do **not** add `<html>`/`<head>`/`<body>`) |
| `src/main.js` | Entire game + client leaderboard + community logic (~17k lines) | `<script type="module" src="src/main.js">` — served as a static relative file |

The live page runs inside a per-generator iframe (`https://<publicId>.perchance.org/<name>`),
so the relative `src/main.js` reference resolves against that origin.

## Runtime dependencies (pinned)

* **three.js r160** — `https://esm.sh/three@0.160.0` (ES module import at the top of
  `src/main.js`). A byte copy of this library is provided in
  `external-code/three.js/` (npm tarball contents: `build/three.module.js`,
  `build/three.min.js`, `LICENSE`, `package.json`). To run fully offline, rewrite the
  import to the local copy.
* **Perchance plugins** (imported in `main.pjs`, executed on Perchance's servers):
  * `server-plugin` → `createServerSocket` (durable leaderboard state, `<script type="text/x-server-plugin">` in `index.html`)
  * `comments-plugin` → `commentsPlugin` (community tab)
  * `upload-plugin` → `uploadPlugin` (editable-text leaderboard archive mirror)
  * `huge-emojilist-furry-generator` → `customEmojis` list for the comment widget
  * `favicon-plugin` (transitive dependency of the emoji list)
  Reference copies of each are in `external-code/perchance-plugins/` and
  `third-party-assets/`.

## Pinned external data endpoints

* Translation fallbacks only (used when a user opts into auto-translate): the game
  posts to `https://translate.googleapis.com/translate_a/single` and
  `https://api.mymemory.translated.net/get`. They are *not* required for gameplay.

## Assets

All portraits, icons, the social card and the four music tracks are static files
hosted on `user.uploads.dev`, referenced by absolute URL in `src/main.js` / `main.pjs`.
They are mirrored byte-for-byte in `project-resources/` (see
`project-resources/ASSET-MANIFEST.csv` for the URL → local-file mapping). To host them
yourself, replace the URLs in `src/main.js` (`HERO_SPLASH_ART`, `HERO_THUMB_ART`,
`ICON_URL`, `MUSIC`) and in `main.pjs` (`$meta.image`).

## `$meta` configuration (from `main.pjs`)

```pjs
$meta
  title = Hop Havoc
  description = A poor man's Bullet Bunny — a roguelite twin-stick arena shooter. Survive 500 seconds, grab upgrades, stack damage and shred the horde.
  tags = bullet bunny, roguelite, shooter, twin-stick, survival, arena, upgrade, vampire-survivors-like, leaderboard, multiplayer
  image = https://user.uploads.dev/file/79f4fcfcbf74a28c3b26d660c7ef1e45.webp
```

## Running it yourself

1. Create/paste the generator on <https://perchance.org> (all three files) and save.
2. Or serve the folder locally with any static server — but note `main.pjs` needs the
   Perchance engine to evaluate `{import:...}` and square-bracket templates, and
   `src/main.js` accesses `root.*` plugin handles, so a plain static host will show the
   menu but the leaderboard/comments/server features will be inert.

## Versioning / maintenance rules

The engineering README (`docs/README.md`) mandates that **every change appends an entry
to the `CHANGELOG` array in `src/main.js`** (newest first) and bumps
`WHATS_NEW_NOTICE_VERSION`. Read `docs/README.md` before editing.

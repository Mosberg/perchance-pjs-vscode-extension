# Hop Havoc — Complete Project Package

Archive of the Perchance generator **Hop Havoc** (`perchance.org/hop-havoc`), rebuilt
byte-for-byte from its workspace. A poor man's Bullet Bunny — a roguelite twin-stick
arena shooter built with three.js (WebGL).

**Contents:** 59 files, 23.73 MB total.
Every file below is included in full — no excerpts, no minification of project code.
Per-file SHA-256 hashes are listed for verification.

---

## Layout

```
hop-havoc-package/
├── internal-code/            the generator's own source (main.pjs, index.html, src/main.js)
├── external-code/            third-party dependency code (three.js + Perchance plugins)
├── third-party-assets/       third-party data assets (huge furry emoji list)
├── project-resources/        images, audio, social card, asset manifest
├── build-config/             build/config notes + pinned dependency record
└── docs/                     engineering README + platform agent notes
```

## 1. Internal code — the generator's own source

| File | Size | Lines | SHA-256 (first 16) |
|---|---|---|---|
| `internal-code/index.html` | 202.7 KB | 3590 | `08842c2ac2a4a2ef` |
| `internal-code/main.pjs` | 3.2 KB | 40 | `a49568d4b9249607` |
| `internal-code/src/main.js` | 869.3 KB | 17359 | `a9db2c09bf02ca76` |

## 2. External code — third-party dependency sources

| File | Size | Lines | SHA-256 (first 16) |
|---|---|---|---|
| `external-code/perchance-plugins/comments-plugin/main.pjs` | 37.4 KB | 680 | `4b20ff48b15882e1` |
| `external-code/perchance-plugins/favicon-plugin/main.pjs` | 472 B | 17 | `f6c8b4cd589610ba` |
| `external-code/perchance-plugins/server-plugin/main.pjs` | 31.1 KB | 725 | `102dc3e9121ec363` |
| `external-code/perchance-plugins/upload-plugin/main.pjs` | 10.0 KB | 237 | `ebe4e080acb958f0` |
| `external-code/three.js/build/three.min.js` | 654.2 KB | 8 | `170c6789f43217c9` |
| `external-code/three.js/build/three.module.js` | 1.21 MB | 53045 | `76dea8151bc9352a` |
| `external-code/three.js/LICENSE` | 1.1 KB | — | `852e0e8699169bf9` |
| `external-code/three.js/package.json` | 3.9 KB | 125 | `f0392af130d7a636` |

## 3. Third-party assets — data/resources from other generators

| File | Size | Lines | SHA-256 (first 16) |
|---|---|---|---|
| `third-party-assets/huge-emojilist-furry-generator/main.pjs` | 22.1 KB | 236 | `d7451bc3c321bb79` |
| `third-party-assets/THIRD-PARTY.md` | 2.0 KB | 37 | `9bfd101f1fc47368` |

## 4. Project resources — images, audio, config data

| File | Size | Lines | SHA-256 (first 16) |
|---|---|---|---|
| `project-resources/ASSET-MANIFEST.csv` | 5.7 KB | 43 | `706345da37a5e0dc` |
| `project-resources/audio/d2-shadow-prologue.mp3` | 3.43 MB | — | `b01aa93413fd852a` |
| `project-resources/audio/d3-boss-rampage.mp3` | 3.40 MB | — | `6e8c1db2657b9e49` |
| `project-resources/audio/d4-dawn-of-chaos.mp3` | 3.58 MB | — | `92d93d2b4f813c99` |
| `project-resources/audio/d5-neon-savage.mp3` | 4.12 MB | — | `d679f74955365cd9` |
| `project-resources/images/hero-splash/bahamut.jpg` | 232.7 KB | — | `7f460ede80e3733c` |
| `project-resources/images/hero-splash/blink.jpg` | 206.9 KB | — | `001a17b02e16e4da` |
| `project-resources/images/hero-splash/bones.jpg` | 245.2 KB | — | `52e2c9766ad34d77` |
| `project-resources/images/hero-splash/fang.jpg` | 188.2 KB | — | `f278e19eab3e581b` |
| `project-resources/images/hero-splash/foxy.jpg` | 180.7 KB | — | `4135d3291c96b90d` |
| `project-resources/images/hero-splash/grizz.jpg` | 218.9 KB | — | `57619d8196ed3e51` |
| `project-resources/images/hero-splash/haze.jpg` | 212.5 KB | — | `7741f3f282dd22cc` |
| `project-resources/images/hero-splash/mag.jpg` | 232.9 KB | — | `3afa7be04653a0e4` |
| `project-resources/images/hero-splash/mane.jpg` | 221.6 KB | — | `07f2e94d5fb977bc` |
| `project-resources/images/hero-splash/mo.jpg` | 226.5 KB | — | `d70ed23c259c4b50` |
| `project-resources/images/hero-splash/nikki.jpg` | 182.9 KB | — | `fb92f500cb736c19` |
| `project-resources/images/hero-splash/payne.jpg` | 229.6 KB | — | `62bee7c31bde58b6` |
| `project-resources/images/hero-splash/porter.jpg` | 194.9 KB | — | `a7089b68c31d8f25` |
| `project-resources/images/hero-splash/pulse.jpg` | 188.1 KB | — | `45b7da1eba81e52b` |
| `project-resources/images/hero-splash/raja.jpg` | 249.5 KB | — | `9a154f7bf811ffe8` |
| `project-resources/images/hero-splash/rooty.jpg` | 215.5 KB | — | `18d80f6b8351b326` |
| `project-resources/images/hero-splash/talon.jpg` | 245.2 KB | — | `590c8f3984652f0e` |
| `project-resources/images/hero-splash/val.jpg` | 201.6 KB | — | `261e64d2362b069b` |
| `project-resources/images/hero-thumb/bahamut.jpg` | 29.5 KB | — | `bb7f31ddc72dffc2` |
| `project-resources/images/hero-thumb/blink.jpg` | 27.7 KB | — | `1abf920a53f2bfc8` |
| `project-resources/images/hero-thumb/bones.jpg` | 32.1 KB | — | `97492f6b4a2cc6a7` |
| `project-resources/images/hero-thumb/fang.jpg` | 27.4 KB | — | `f99ab63078c515a3` |
| `project-resources/images/hero-thumb/foxy.jpg` | 27.4 KB | — | `6fdf17a73aa4de9e` |
| `project-resources/images/hero-thumb/grizz.jpg` | 27.9 KB | — | `1432055393d45a98` |
| `project-resources/images/hero-thumb/haze.jpg` | 27.8 KB | — | `84a53297ae25febb` |
| `project-resources/images/hero-thumb/mag.jpg` | 29.9 KB | — | `cbc13629acbf122c` |
| `project-resources/images/hero-thumb/mane.jpg` | 28.2 KB | — | `92af0bcfd367418a` |
| `project-resources/images/hero-thumb/mo.jpg` | 29.4 KB | — | `0858afbf1295ffd3` |
| `project-resources/images/hero-thumb/nikki.jpg` | 24.1 KB | — | `c23a7673347f1ed0` |
| `project-resources/images/hero-thumb/payne.jpg` | 32.2 KB | — | `e4a23ab8f0b0f24a` |
| `project-resources/images/hero-thumb/porter.jpg` | 25.6 KB | — | `044d4211ed026d62` |
| `project-resources/images/hero-thumb/pulse.jpg` | 25.7 KB | — | `3dc69d3201bf190d` |
| `project-resources/images/hero-thumb/raja.jpg` | 33.3 KB | — | `d2dd39533e685255` |
| `project-resources/images/hero-thumb/rooty.jpg` | 27.3 KB | — | `6e2e824c1d25b29c` |
| `project-resources/images/hero-thumb/talon.jpg` | 29.4 KB | — | `f8928872caf27236` |
| `project-resources/images/hero-thumb/val.jpg` | 25.5 KB | — | `ed7913361240d0f2` |
| `project-resources/images/icon.png` | 13.2 KB | — | `7e1a755366be9a18` |
| `project-resources/images/social-card.webp` | 1.75 MB | — | `14fc780b85862b70` |

## 5. Build / configuration files

| File | Size | Lines | SHA-256 (first 16) |
|---|---|---|---|
| `build-config/BUILD.md` | 3.7 KB | 72 | `6fae73beb494c8b5` |

## 6. Documentation (engineering notes shipped with the project)

| File | Size | Lines | SHA-256 (first 16) |
|---|---|---|---|
| `docs/AGENTS.md` | 50.1 KB | 357 | `ed93ec9691766453` |
| `docs/README.md` | 87.4 KB | 1136 | `af154203f3fd77ba` |

## How the pieces fit

- `internal-code/main.pjs` is evaluated first. It sets `$meta`, imports the
  `server-plugin`, `comments-plugin` and `upload-plugin` handles onto `root`, and
  defines `defaultCommentOptions` (including `customEmojis` from the imported furry
  emoji list).
- `internal-code/index.html` is the page body: menu / hub / game / leaderboard /
  community screens, the HUD, all CSS, the `<script type="text/x-server-plugin">`
  authoritative leaderboard server, and `<script type="module" src="src/main.js">`.
- `internal-code/src/main.js` walks the whole game: three.js scene + meshes, enemies,
  weapons, perks, difficulty/Insane tuning, progression saves (localStorage), music, and
  the client half of the leaderboard (WebSocket via `root.createServerSocket`) plus the
  community/translation code.
- Assets referenced by URL from those files are mirrored under `project-resources/`.

## Pinned dependencies

| Dependency | Version | Loaded from | Local copy |
|---|---|---|---|
| three.js | 0.160.0 | `https://esm.sh/three@0.160.0` | `external-code/three.js/` |
| server-plugin | platform-current | `{import:server-plugin}` | `external-code/perchance-plugins/server-plugin/` |
| comments-plugin | platform-current | `{import:comments-plugin}` | `external-code/perchance-plugins/comments-plugin/` |
| upload-plugin | platform-current | `{import:upload-plugin}` | `external-code/perchance-plugins/upload-plugin/` |
| huge-emojilist-furry-generator | platform-current | `{import:huge-emojilist-furry-generator}` | `third-party-assets/huge-emojilist-furry-generator/` |
| favicon-plugin | platform-current | (transitive, pulled by the emoji list) | `external-code/perchance-plugins/favicon-plugin/` |

## Rebuild recipes

- **Self-host three.js:** change the first line of `src/main.js` from the esm.sh URL to
  `./three.module.js` (or any path to `external-code/three.js/build/three.module.js`).
- **Self-host art/audio:** upload the files in `project-resources/` somewhere, then
  replace the URLs in `src/main.js` (`HERO_SPLASH_ART`, `HERO_THUMB_ART`, `ICON_URL`,
  `MUSIC`) and `main.pjs` (`$meta.image`). `project-resources/ASSET-MANIFEST.csv`
  maps every original URL to its local file.
- **Music:** the four tracks were produced with Perchance's AI music generation
  (`generate_music`). See the comment above `const MUSIC` in `src/main.js`.

## Known documentation drift

`docs/README.md` lists `kv = {import:kv-plugin}` for save data, but `main.pjs` does
**not** import `kv-plugin` — current builds persist saves with `localStorage`
(`SAVE_KEY` / `saveGame()` in `src/main.js`). The README line is stale; the code here
is authoritative.

## Integrity

Per-file sizes, line counts and SHA-256 hashes are in the tables above. To verify a file:
`shasum -a 256 <file>`.

# Third-party code, data and assets

Everything in this package is redistributed for archival/backup purposes. Licences and
origins are listed below.

## Code

| Component | Version | Licence / origin | Located at |
|---|---|---|---|
| **three.js** | 0.160.0 | MIT © three.js authors (mrdoob and contributors) | `external-code/three.js/` |
| **Perchance platform plugins** (`server-plugin`, `comments-plugin`, `upload-plugin`, `favicon-plugin`) | as served by perchance.org at archive time | Perchance platform code; © Perchance | `external-code/perchance-plugins/` |
| **huge-emojilist-furry-generator** | as served by perchance.org | Third-party generator code + emoji data; © its author on Perchance | `third-party-assets/huge-emojilist-furry-generator/` |

The Perchance plugin copies are **reference mirrors** of the public sources that the
generator imports; they are read-only snapshots and are not modified. The live generator
loads the current platform version at runtime via `{import:...}`.

## Assets (project resources)

| Asset group | Count | Origin |
|---|---|---|
| Hero splash portraits (`hero-splash/*.jpg`) | 18 | AI-generated character art uploaded to Perchance's upload host |
| Hero thumbnails (`hero-thumb/*.jpg`) | 18 | Downscaled/paired variants of the splash art |
| App icon (`icon.png`) | 1 | Project icon |
| Social card (`social-card.webp`) | 1 | `$meta.image` used for sharing/listing cards |
| Music tracks (`audio/*.mp3`) | 4 | Generated with Perchance's AI music generation (`generate_music`) |

Characters/art style are inspired by Perchance's furry image generators
(`perchance.org/ai-furry-generator`, `perchance.org/fur-ai`, `perchance.org/rudbo`),
credited in-game on the menu/credits screen.

## Gameplay inspiration / credit

Gameplay is a homage to **Bullet Bunny** by **penusbmic** (<https://gd.games/penusbmic/bullet-bunny>),
as credited in `main.pjs` and in-game. No assets from the original game are included —
the art, audio and all code in this package were created for this project.

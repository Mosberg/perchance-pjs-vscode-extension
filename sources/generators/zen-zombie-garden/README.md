# Zen Zombie Garden — complete project package

Wave-based 3D zombie-survival shooter running on the Perchance platform. First-person, three.js (WebGL), controller + mobile + M&K input, persistent progression (rank/XP/coins/skins/calling cards/seasons), a custom-map builder, and realtime multiplayer rooms backed by a Perchance server-plugin.

Everything the generator uses or references is in this archive, organised by category. Nothing is summarised away — every script, config, dependency, asset and data table is present in full.

Generated: see `MANIFEST.json` (`generated` field) — that file also lists every file with its byte size and SHA-256.

---

## 1. Category map

| Folder | Category | What is in it |
| --- | --- | --- |
| `01-internal-code/` | **Internal code** (authored for this project) | `index.html` (the whole game — one HTML page with all CSS, DOM, and a single `<script type="text/module">`), `main.pjs` (the Perchance config/DSL layer), and the `src/` tree exactly as it ships (`src/README.md` developer doc, `src/Midnight_Ascent.mp3`). |
| `02-external-code/` | **External code** (Perchance plugins, vendored source) | Full source of every `{import:...}` used by `main.pjs`: `ai-text-plugin`, `comments-plugin`, `server-plugin`, `text-to-image-plugin`. Plus `EXTERNAL-DEPENDENCIES.md` (every runtime CDN/platform dependency and its exact URL). |
| `03-third-party-assets/` | **Third-party assets / libraries** | `three@0.160.0/build/three.module.js` (upstream MIT build, matching the exact version the game imports) + licence notice. |
| `04-project-resources/` | **Project resources** | Every generated/uploaded media asset the game loads: map music, calling-card music, weapon SFX, calling-card art, weapon art, `$meta` social image. See `04-project-resources/ASSET-INVENTORY.md`. |
| `05-build-config/` | **Build / config / data** | `BUILD.md` (how the project is assembled, run and packaged), `build-package.mjs` (the packaging pipeline that produced this archive), `SAVE-DATA-KEYS.md` (the full runtime save-data schema — 59 `localStorage` keys with their real source lines). |

---

## 2. How to run / rebuild

This is a **Perchance generator**, not a compiled app. There is no bundler and no `node_modules`.

1. Create/open a Perchance generator.
2. Put `01-internal-code/main.pjs` in as the generator's `main.pjs` (this declares `$meta` and the four plugin imports).
3. Put `01-internal-code/index.html` in as the generator's `index.html`.
4. Recreate the `src/` folder from `01-internal-code/src/` (the README/doc and the `Midnight_Ascent.mp3` track).
5. Open the page. The Perchance engine resolves `{import:...}` names, renders the template, then runs the page's scripts — three.js is pulled from `esm.sh` at runtime, and all media is fetched from the URLs listed in `ASSET-INVENTORY.md`.

To run fully offline/self-hosted, `03-third-party-assets/three-0.160.0/three.module.js` replaces the `esm.sh` import, and the `user.uploads.dev` URLs in `index.html` can be repointed at `04-project-resources/...` (the filename in this package matches the role; the original URL is preserved next to each file in the inventory).

`build-package.mjs` documents exactly how this archive was produced (fetch each referenced URL byte-exact, verify magic bytes, hash, emit `MANIFEST.json`, zip), so the package can be regenerated deterministically.

---

## 3. Internal code — full listing

### 3.1 `main.pjs` (complete file, 554 bytes)

```pjs
$meta
  title = Zen Zombie Garden
  description = A wave-based zombie survival shooter in a moonlit zen garden. Full controller support with rumble, remappable bindings, mobile controls, calling cards, and more.
  tags = game, zombie, shooter, survival, relaxing, zen, arcade
  image = https://user.uploads.dev/file/04c43cd6037c6ce20fe8b28c7b266700.jpg
  header
    mode = minimal

createServerSocket = {import:server-plugin}
commentsPlugin = {import:comments-plugin}
generateText = {import:ai-text-plugin}
generateImage = {import:text-to-image-plugin}
```

### 3.2 `index.html` (1,063,362 bytes, 17,514 lines — complete file in `01-internal-code/index.html`)

It is one page containing the CSS (`<style>`), the DOM/HUD, one `<script type="text/x-server-plugin">` block (the authoritative multiplayer room server, lines ~1414–1742), and one `<script type="module">` (the entire game, lines ~1744–17513).

Contents at a glance:

- **CSS + DOM/HUD** — `index.html:1–1410` (canvas `#gameCanvas`, all HUD layers, lobby, panels, modals).
- **Server plugin** — `index.html:1414–1742` (durable room registry in the plugin's byte `state`, room list broadcast on topic `servers`, room chat/state relay on `room:<id>`).
- **Client game module** — `index.html:1744–17513`, sectioned as follows:

| Section | Label |
| --- | --- |
| `index.html:1862` | RANK / XP SYSTEM |
| `index.html:1968` | VIRTUAL CURRENCY (Zen Coins) |
| `index.html:2013` | SHOP ITEMS |
| `index.html:2073` | GUN SKINS |
| `index.html:2105` | SEASON PASS |
| `index.html:2488` | PLAYER IDENTITY & CALLING CARDS |
| `index.html:2770` | PROFILE |
| `index.html:3282` | PETS state |
| `index.html:3321` | THREE.JS SETUP |
| `index.html:4599` | MAP SYSTEM |
| `index.html:4886` | ZEN GARDEN LAYOUT |
| `index.html:4954` | CRIMSON SHRINE LAYOUT |
| `index.html:5026` | BAMBOO FOREST LAYOUT |
| `index.html:5110` | OBSIDIAN SANCTUM LAYOUT (Gatekeeper exclusive) |
| `index.html:5115` | Lava cracks radiating from center — glowing fissures in the obsidian floor |
| `index.html:5141` | Jagged obsidian spires — towering black glass formations |
| `index.html:5157` | Ring of fire braziers |
| `index.html:5181` | Broken obsidian pillars — ruined archway at the north |
| `index.html:5196` | Scattered obsidian shards on the ground |
| `index.html:5207` | Walls — black obsidian walls with glowing top edges |
| `index.html:5218` | Ember particles instead of petals (uses the petal system but orange) |
| `index.html:5221` | Glowing ground pulse rings around center |
| `index.html:5230` | UNDERTALE: THE RUINS |
| `index.html:5549` | THE ABANDONED OUTPOST |
| `index.html:5572` | Pitch-black walls (wooden interior) with shattered windows |
| `index.html:5603` | Flickering emergency backup lights |
| `index.html:5621` | Wooden floor planks with creaking zones |
| `index.html:5634` | Desks with scattered tactical gear (the dead squad's equipment) |
| `index.html:5666` | Frozen blood splatter on walls |
| `index.html:5691` | Ceiling — low wooden ceiling for claustrophobic feel |
| `index.html:5697` | Wooden support pillars |
| `index.html:5704` | Scrap metal and debris on floor |
| `index.html:5717` | FLOOR 2: THE SNIPER OVERLOOK (balcony + staircase) |
| `index.html:5743` | Broken window in balcony wall (overlooking Floor 1) |
| `index.html:5758` | Creaky staircase leading up to the balcony |
| `index.html:5788` | FLOOR 1: THE COMMS ROOM (cramped, claustrophobic) |
| `index.html:5796` | Server racks (tall narrow cabinets with blinking LEDs) |
| `index.html:5823` | Broken radar equipment |
| `index.html:5846` | Filing cabinets (scattered, some tipped over) |
| `index.html:5874` | Extra emergency light near comms area |
| `index.html:5886` | CRUCIAL GAMEPLAY ELEMENTS |
| `index.html:5889` | Power switch — in a dark closet on Floor 1 |
| `index.html:5917` | Heavy blast doors (closed initially, open when power is on) |
| `index.html:5933` | SMG wall-buy (chalk outline on wooden wall) |
| `index.html:5961` | Window barricades — 4 windows with wooden boards |
| `index.html:5995` | SHARED DECORATION BUILDERS |
| `index.html:6220` | ANIMATRONICS (FNAF) — dormant while the wake timer runs, then FREDDY awakens as the final boss |
| `index.html:6363` | Checkered tile floor |
| `index.html:6374` | Walls — pizza place interior with dark trim |
| `index.html:6385` | Ceiling — dark indoor roof to hide the sky |
| `index.html:6391` | STAGE (north wall) — dark velvet curtain with animatronic band |
| `index.html:6422` | STAGE LIGHTS — colorful spotlights |
| `index.html:6437` | ANIMATRONIC BAND — 3 characters on stage |
| `index.html:6472` | PIRATE COVE (west of stage) — Foxy's curtained alcove |
| `index.html:6514` | FOXY — the mangled pirate fox with hook and eyepatch |
| `index.html:6664` | DINING ROOM TABLES — rows of birthday party tables |
| `index.html:6716` | BIRTHDAY BANNER across the south wall |
| `index.html:6729` | OVERHEAD CEILING LIGHTS — fluorescent style |
| `index.html:6744` | POSTERS on walls |
| `index.html:6756` | KITCHEN DOOR (east wall) — dark doorway |
| `index.html:6760` | PIZZA PLACE SIGN above the entrance |
| `index.html:6770` | ARCADE HALLWAY (Zone 2) — neon-lit corridor in SE corner |
| `index.html:6848` | TOKEN MACHINES — decoy trap dispensers |
| `index.html:6959` | MAP-SPECIFIC LAYOUTS |
| `index.html:7090` | POWER SWITCH & BARRICADES |
| `index.html:7981` | FIRST-PERSON VIEWMODEL GUN |
| `index.html:7986` | FIRST-PERSON PLAYER BODY (legs visible) |
| `index.html:8025` | THIRD-PERSON PLAYER BODY |
| `index.html:8536` | SKIN PREVIEW (lobby 3D character viewer) |
| `index.html:9273` | GATEKEEPER HARD ZOMBIES |
| `index.html:9412` | GATEKEEPER BOSSES |
| `index.html:9507` | NORMAL MODE 3D ZOMBIE MODELS (themed per map) |
| `index.html:9692` | ZOMBIE CREATION |
| `index.html:9698` | GATEKEEPER: use 3D hard zombie variants |
| `index.html:9714` | NORMAL MODE: 3D humanoid zombies themed per map |
| `index.html:9735` | BOSS CREATION |
| `index.html:9756` | NORMAL MODE 3D BOSS MODELS |
| `index.html:9808` | POWER-UP DROPS |
| `index.html:9885` | TRACERS |
| `index.html:10015` | GUN LAUNCHER ROCKET |
| `index.html:10069` | CONTROL AIRPLANE |
| `index.html:10572` | DEATH PARTICLES |
| `index.html:10878` | AUDIO |
| `index.html:11339` | INPUT |
| `index.html:11427` | MOBILE CONTROLS |
| `index.html:11505` | CONTROLLER / GAMEPAD |
| `index.html:11517` | CONTROLLER TUNING SETTINGS |
| `index.html:11543` | KEYBOARD & MOUSE TUNING SETTINGS |
| `index.html:11683` | PLAYER |
| `index.html:12383` | GATEKEEPER RULES |
| `index.html:12417` | AI DIRECTOR REWARD |
| `index.html:12469` | ZOMBIES |
| `index.html:12795` | BOSS UPDATE / KILL |
| `index.html:12975` | PARTICLES/TRACERS/FLOATS |
| `index.html:13241` | WAVES |
| `index.html:13340` | GAME OVER / RESTART |
| `index.html:13468` | TRAINING MODE |
| `index.html:13723` | HUD |
| `index.html:13807` | CONTROLLER LOBBY NAVIGATION |
| `index.html:13925` | LOOP |
| `index.html:14004` | Outpost atmosphere effects |
| `index.html:14071` | INIT |
| `index.html:14467` | PETS |
| `index.html:15395` | ROBOT PET AUTO-TALK (Chip) |
| `index.html:15579` | STORY MODE — THE RED MOON |
| `index.html:15994` | KEYBIND SYSTEM |
| `index.html:16059` | CONTROLLER BINDINGS |
| `index.html:16099` | RUMBLE |
| `index.html:16319` | MAP BUILDER |
| `index.html:16857` | MULTIPLAYER |
| `index.html:17256` | IN-GAME MULTIPLAYER RENDERING |
| `index.html:17349` | DUO MODE (2-player net co-op — blue) |

### 3.3 `src/README.md` (34,776 bytes)

The project's own developer/architecture document — map-builder internals, per-map decor notes, perf notes (the light-count/shader-recompile trap), calling-card and multiplayer design notes, arsenal/loadout rules, abilities (plane + sentry), boosts. Reproduced verbatim in `01-internal-code/src/README.md`.

### 3.4 `src/Midnight_Ascent.mp3` (4,196,534 bytes)

The "Moonlight" (`worryslowed`) calling-card track, shipped inside `src/` so the generator serves it itself rather than hotlinking.

---

## 4. External code (dependencies)

| Dependency | Kind | Resolved as | Source in this archive |
| --- | --- | --- | --- |
| `server-plugin` | Perchance plugin | `createServerSocket = {import:server-plugin}` | `02-external-code/imports/server-plugin/main.pjs` (31,881 B) |
| `comments-plugin` | Perchance plugin | `commentsPlugin = {import:comments-plugin}` | `02-external-code/imports/comments-plugin/main.pjs` (38,261 B) |
| `ai-text-plugin` | Perchance plugin | `generateText = {import:ai-text-plugin}` | `02-external-code/imports/ai-text-plugin/main.pjs` (58,048 B) |
| `text-to-image-plugin` | Perchance plugin | `generateImage = {import:text-to-image-plugin}` | `02-external-code/imports/text-to-image-plugin/main.pjs` (37,978 B) |
| `three@0.160.0` | npm library (ESM CDN) | `import * as THREE from "https://esm.sh/three@0.160.0"` | `03-third-party-assets/three-0.160.0/three.module.js` (1,272,972 B) |
| Perchance engine + platform | runtime | `perchance.org/<generator>` | not redistributable; see `EXTERNAL-DEPENDENCIES.md` |

Details, exact URLs and version notes: `02-external-code/EXTERNAL-DEPENDENCIES.md`.

---

## 5. Project resources (full inventory)

31 media assets, all downloaded byte-exact from their original `user.uploads.dev` URLs (verified by magic bytes: ID3/MPEG audio frames, JPEG SOI, PNG signature).

| File in package | Role | Bytes | SHA-256 (16) | Original URL |
| --- | --- | --- | --- | --- |
| `04-project-resources/audio/music/maps/moonlit-zen-garden.mp3` | Map music - Moonlit Zen Garden | 3.120.708 | `79cf6c2c12f1bc7e…` | `https://user.uploads.dev/file/1bf2f1520bbb9c327b78d28937f4cf03.mp3` |
| `04-project-resources/audio/music/maps/crimson-shrine.mp3` | Map music - Crimson Shrine | 3.913.159 | `7e6e0f16b2bd4d58…` | `https://user.uploads.dev/file/2382042655d29a6ed95eb611ff5fc815.mp3` |
| `04-project-resources/audio/music/maps/bamboo-forest.mp3` | Map music - Bamboo Forest (also the Custom Map default) | 4.103.122 | `4d0adfb25a96733b…` | `https://user.uploads.dev/file/74f4f1440a840e20b2ff6632a156e56c.mp3` |
| `04-project-resources/audio/music/maps/undertale-the-ruins.mp3` | Map music - Undertale: The Ruins (locked map) | 4.186.502 | `6adb208f46c848fa…` | `https://user.uploads.dev/file/e21e4ac1b9cbc015f4a48d65633a51f0.mp3` |
| `04-project-resources/audio/music/calling-cards/red-static.mp3` | Calling card music - RED STATIC (id insanity) | 4.031.649 | `74aa664a4850bb8c…` | `https://user.uploads.dev/file/8465437b16102a86fb06375874d2d542.mp3` |
| `04-project-resources/audio/music/calling-cards/zen-zombie.mp3` | Calling card music - Zen Zombie (id sonicbloom) | 4.170.206 | `d7fe8b15af32a391…` | `https://user.uploads.dev/file/695a9bdb485e70b1f6e1a1e90803ce32.mp3` |
| `04-project-resources/audio/music/calling-cards/sakura-serenade.mp3` | Calling card music - Sakura Serenade | 2.794.699 | `903f4b33a03de899…` | `https://user.uploads.dev/file/55ef4103b4f5745a7fd18a6c40292604.mp3` |
| `04-project-resources/audio/music/calling-cards/solar-halo.mp3` | Calling card music - Solar Halo / Apex Legend | 3.841.061 | `02eb462b7c670021…` | `https://user.uploads.dev/file/d20b891664e05df303db25edebc02a57.mp3` |
| `04-project-resources/audio/music/calling-cards/star-glitch.mp3` | Calling card music - Star Glitch | 3.743.259 | `c2c44e4c6d2fb9b8…` | `https://user.uploads.dev/file/5bcf2fa82eb9708ffc70075ab205f9f3.mp3` |
| `04-project-resources/audio/music/calling-cards/chaos-glitch.mp3` | Calling card music - Chaos Glitch (id voidglitcher) | 4.150.138 | `dcae9a54dcbe111a…` | `https://user.uploads.dev/file/69919b4985f4de0825f8c515c09b184d.mp3` |
| `04-project-resources/audio/music/calling-cards/fatal-error.mp3` | Calling card music - FATAL ERROR | 4.016.602 | `045b1081f4d579a7…` | `https://user.uploads.dev/file/e8da7c5f8498ee529f7828231ff13a78.mp3` |
| `04-project-resources/audio/music/calling-cards/blackout.mp3` | Calling card music - Blackout | 4.155.156 | `9fdbeef2288e6b12…` | `https://user.uploads.dev/file/893e91a66a8004a627092627465aac8d.mp3` |
| `04-project-resources/audio/music/calling-cards/blue-moon.mp3` | Calling card music - Blue Moon | 3.991.525 | `9d9d83c6bdbb7f44…` | `https://user.uploads.dev/file/6af3ec063c817d4c91e8e88777f6616a.mp3` |
| `04-project-resources/audio/music/calling-cards/smoke-card.mp3` | Calling card music - Smoke Card | 4.124.437 | `2a7fb880b9665f5a…` | `https://user.uploads.dev/file/b97f9a9ad64b417bb09e272931c0f371.mp3` |
| `04-project-resources/audio/music/calling-cards/crimson-howl.mp3` | Calling card music - Crimson Howl | 4.183.997 | `4a479182fa741ca5…` | `https://user.uploads.dev/file/929821f1ff569172ecfd863c130a1096.mp3` |
| `04-project-resources/audio/sfx/weapons/handgun-click.mp3` | Weapon SFX - handgunClick | 27.058 | `40618308e3743a92…` | `https://user.uploads.dev/file/fe3e139f99741392b6d0807f8263d6bb.mp3` |
| `04-project-resources/audio/sfx/weapons/handgun-release.mp3` | Weapon SFX - handgunRelease | 8.560 | `f87eef755cdcbd21…` | `https://user.uploads.dev/file/98b2d62af687ed0b7ac94eab7c6c7c58.mp3` |
| `04-project-resources/audio/sfx/weapons/handgun-movement.mp3` | Weapon SFX - handgunMovement | 20.095 | `86aae8631c2693ce…` | `https://user.uploads.dev/file/f21a07cd85a206ca7ebf8490d2053206.mp3` |
| `04-project-resources/audio/sfx/weapons/shotgun-pump.mp3` | Weapon SFX - shotgunPump | 14.719 | `28b17f06eb1d3608…` | `https://user.uploads.dev/file/96ad741d02809a13cc505a7163803498.mp3` |
| `04-project-resources/audio/sfx/weapons/shotgun-hard-pump.mp3` | Weapon SFX - shotgunHardPump | 13.937 | `d35c2fd7a77f539a…` | `https://user.uploads.dev/file/fe42bf0de1bb4426c6d6f60f47bc90c4.mp3` |
| `04-project-resources/audio/sfx/weapons/shotgun-long-pump.mp3` | Weapon SFX - shotgunLongPump | 27.662 | `f07f874380ce64d7…` | `https://user.uploads.dev/file/7aae7d2a86a0ff2487390719fcc9cf10.mp3` |
| `04-project-resources/audio/sfx/weapons/revolver-spin.mp3` | Weapon SFX - revolverSpin | 7.724 | `baff34e4bac81159…` | `https://user.uploads.dev/file/278ba4a5e8ca35f3377979d2e9903706.mp3` |
| `04-project-resources/audio/sfx/weapons/laser-shot.mp3` | Weapon SFX - laserShot | 29.389 | `fb27075fdbe1c7cc…` | `https://user.uploads.dev/file/88d49389ea1f3b350b3bfd074b119496.mp3` |
| `04-project-resources/audio/sfx/weapons/laser-cannon.mp3` | Weapon SFX - laserCannon | 40.920 | `f9eaaaf981ad86dc…` | `https://user.uploads.dev/file/79ae549fb8f22ea0f2c2cddab1e39f4e.mp3` |
| `04-project-resources/images/social-preview.jpg` | Generator listing / social-share image ($meta.image) | 97.542 | `5995b09f403c01f8…` | `https://user.uploads.dev/file/04c43cd6037c6ce20fe8b28c7b266700.jpg` |
| `04-project-resources/images/card-cosmic-spiral.jpg` | Calling card art - Cosmic Spiral (id galaxy / cosmicglitcher) | 87.032 | `4a891ac9fe3f21f8…` | `https://user.uploads.dev/file/6ff8770574338af58f54c39f13a10d30.jpg` |
| `04-project-resources/images/card-flowery.jpg` | Calling card art + banner - Flowery | 39.547 | `65b174a97bf1718b…` | `https://user.uploads.dev/file/9d7b83972537e2a8f473b555b107c8b5.jpg` |
| `04-project-resources/images/card-thunder-strike.jpg` | Calling card art - Thunder Strike (id pikachu) | 105.439 | `64cde82480766580…` | `https://user.uploads.dev/file/d12323b6c4adf467795083190fd885ac.jpg` |
| `04-project-resources/images/card-thunder-strike-banner.jpg` | Calling card banner - Thunder Strike | 86.829 | `d09496cabf4ec0e4…` | `https://user.uploads.dev/file/d4d89b98dee3ea6271f79854276b430c.jpg` |
| `04-project-resources/images/weapon-real-knife.png` | Weapon art - Real Knife (chara, HUD + banner + inventory) | 104.926 | `dded36226b39f544…` | `https://user.uploads.dev/file/793f7bd9eeb730ed28283a1966064275.png` |
| `04-project-resources/images/weapon-cid-slime-sword.png` | Weapon art - Cid's Slime Sword (HUD + banner + inventory) | 119.396 | `9fa96b9b71bf5348…` | `https://user.uploads.dev/file/f18455f4e1c2438573ddb64e84dbc811.png` |
| `01-internal-code/src/Midnight_Ascent.mp3` | Calling card music — Moonlight (`worryslowed`); ships in `src/` | 4,196,534 | — | generator-local asset (`src/Midnight_Ascent.mp3`) |

Full table with hashes: `04-project-resources/ASSET-INVENTORY.md`; machine-readable: `MANIFEST.json`.

---

## 6. Package tree

```
zen-zombie-garden-complete-package/
|-- 01-internal-code/
|    |-- src/
|    |    |-- Midnight_Ascent.mp3   (4.00 MB)
|    |    |-- README.md   (34.0 KB)
|    |-- index.html   (1.01 MB)
|    |-- main.pjs   (554 B)
|-- 02-external-code/
|    |-- imports/
|    |    |-- ai-text-plugin/
|    |    |    |-- main.pjs   (56.7 KB)
|    |    |-- comments-plugin/
|    |    |    |-- main.pjs   (37.4 KB)
|    |    |-- server-plugin/
|    |    |    |-- main.pjs   (31.1 KB)
|    |    |-- text-to-image-plugin/
|    |        |-- main.pjs   (37.1 KB)
|    |-- EXTERNAL-DEPENDENCIES.md   (4.0 KB)
|-- 03-third-party-assets/
|    |-- three-0.160.0/
|    |    |-- three.module.js   (1.21 MB)
|    |-- LICENSE-NOTICE.md   (2.3 KB)
|-- 04-project-resources/
|    |-- audio/
|    |    |-- music/
|    |    |    |-- calling-cards/
|    |    |    |    |-- blackout.mp3   (3.96 MB)
|    |    |    |    |-- blue-moon.mp3   (3.81 MB)
|    |    |    |    |-- chaos-glitch.mp3   (3.96 MB)
|    |    |    |    |-- crimson-howl.mp3   (3.99 MB)
|    |    |    |    |-- fatal-error.mp3   (3.83 MB)
|    |    |    |    |-- red-static.mp3   (3.84 MB)
|    |    |    |    |-- sakura-serenade.mp3   (2.67 MB)
|    |    |    |    |-- smoke-card.mp3   (3.93 MB)
|    |    |    |    |-- solar-halo.mp3   (3.66 MB)
|    |    |    |    |-- star-glitch.mp3   (3.57 MB)
|    |    |    |    |-- zen-zombie.mp3   (3.98 MB)
|    |    |    |-- maps/
|    |    |        |-- bamboo-forest.mp3   (3.91 MB)
|    |    |        |-- crimson-shrine.mp3   (3.73 MB)
|    |    |        |-- moonlit-zen-garden.mp3   (2.98 MB)
|    |    |        |-- undertale-the-ruins.mp3   (3.99 MB)
|    |    |-- sfx/
|    |        |-- weapons/
|    |            |-- handgun-click.mp3   (26.4 KB)
|    |            |-- handgun-movement.mp3   (19.6 KB)
|    |            |-- handgun-release.mp3   (8.4 KB)
|    |            |-- laser-cannon.mp3   (40.0 KB)
|    |            |-- laser-shot.mp3   (28.7 KB)
|    |            |-- revolver-spin.mp3   (7.5 KB)
|    |            |-- shotgun-hard-pump.mp3   (13.6 KB)
|    |            |-- shotgun-long-pump.mp3   (27.0 KB)
|    |            |-- shotgun-pump.mp3   (14.4 KB)
|    |-- images/
|    |    |-- card-cosmic-spiral.jpg   (85.0 KB)
|    |    |-- card-flowery.jpg   (38.6 KB)
|    |    |-- card-thunder-strike-banner.jpg   (84.8 KB)
|    |    |-- card-thunder-strike.jpg   (103.0 KB)
|    |    |-- social-preview.jpg   (95.3 KB)
|    |    |-- weapon-cid-slime-sword.png   (116.6 KB)
|    |    |-- weapon-real-knife.png   (102.5 KB)
|    |-- ASSET-INVENTORY.md   (7.8 KB)
|-- 05-build-config/
|    |-- build-package.mjs   (8.1 KB)
|    |-- BUILD.md   (5.4 KB)
|    |-- SAVE-DATA-KEYS.md   (5.8 KB)
`-- MANIFEST.json   (digest index for every file above)
`-- README.md   (22.2 KB)
```

---

## 7. Runtime save data

The game persists 59 `localStorage` keys (`zzg_*`): progression, loadout, cosmetics, settings, keybinds, custom maps, multiplayer identity. Full schema with the exact source line for each key: `05-build-config/SAVE-DATA-KEYS.md`.

---

## 8. Integrity

`MANIFEST.json` lists every file in this archive (all of them except itself, which cannot hold its own digest) with `path`, `bytes` and `sha256`, plus the timestamp the package was generated. To verify:

```bash
sha256sum -c <(node -e "const m=require('./MANIFEST.json');for(const f of m.files)console.log(f.sha256+'  '+f.path)")
```

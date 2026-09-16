# Realm Weaver — Complete Source & Asset Manifest

Generator: **Realm Weaver** — https://perchance.org/realmweaver
Kind: Perchance generator (pjs + HTML/JS app). **No build step, no bundler, no package manager** — the two
source files are the whole program, and Perchance renders/bundles them directly.

This package contains every file the project ships, plus reference copies of every dependency it pulls in and a
complete inventory of every remote asset it points at. Nothing is summarised: the files are byte-for-byte copies.

## Package layout

| # | Folder | Category | Contents |
|---|--------|----------|----------|
| 1 | `01-project-code/` | Internal code (first-party) | `main.pjs`, `index.html` — the entire generator |
| 2 | `02-project-assets/` | Project resources (first-party assets) | shipped `src/` tree: handoff README + 14 music tracks |
| 3 | `03-third-party-code/` | External code (dependencies) | full source of all 8 imported Perchance plugins |
| 4 | `04-external-assets/` | Third-party / remote assets | hosted images (bundled) + every remote media/CDN/model reference (listed) |
| 5 | `05-config/` | Build / config / meta | import declarations, `$meta`, machine-readable inventory, workspace instructions |

---

## 1. Internal code (first-party) — `01-project-code/`

### `main.pjs` — 52,572 bytes
Perchance-pjs source:
- `$meta` block (title, description, tags, listing/social `image`, minimal header mode)
- plugin import declarations (section 3 / 5)
- `commentsPlugin` options: size, placeholder, submit text, `adminPasswordHash`, `bannedUsers`
- `galleryOptions`: the public gallery (`gallery = true`), sort/filter, ban lists fed from the `unsafe` list plugin,
  and **two custom gallery buttons**:
  - `🥕` — the per-image action modal: Comments (per-image `gcomment-*` channels), Fullscreen, EXIF-embedding
    Download (piexif), Remove Background (HuggingFace `briaai/RMBG-1.4` via transformers.js), Copy Prompt,
    Edit & Regenerate, Share, AI Text on Image (canvas text renderer, 11 styles: caption / sign / big-center /
    speech-bubble / thought-bubble / shout-bubble / warning / neon / sticky-note / movie-title / newspaper),
    Send to My Gallery, Upload & Get Link
  - `🛡️` — send the image into the private local gallery
- small random lists: `npcName`, `tavernName`, `questHook`

### `index.html` — 1,487,869 bytes
The whole application: markup, the CSS theming system (8 colour themes × 6 font pairs via
`:root[data-theme]` / `:root[data-font]` custom properties), and the app JS — world selection, preset worlds,
custom world forge, character/hero forge, GM engine (streaming narration, GM config, compaction), combat,
living-world NPC simulation, the recursive place tree, inventory/economy/shops, quests, the AI art pipeline
(backgrounds, portraits, scenes, AI-text-on-image), gallery, kv saves, music player, comments dock, age gate.

---

## 2. Project assets (first-party, shipped with the generator) — `02-project-assets/`

### `src-README.md`
The project's own handoff document: architecture, feature inventory, the recursive place-tree data model, the
"never fire two AI calls concurrently" rule, background-tab resilience, slim save format, AI-localization of
hardcoded English content, and the TODO/ideas list. Read this first.

### `music/` — 14 shipped tracks, 46.5 MB total

| File | Genre key | Title | Bytes |
|------|-----------|-------|-------|
| `realm-weaver-adventure.mp3` | `fantasy` | 🏰 Fantasy Adventure | 4,090,579 |
| `scifi.mp3` | `scifi` | 🪐 Sci-Fi Explorer | 3,659,245 |
| `horror.mp3` | `horror` | 🕯️ Horror Dread | 4,351,385 |
| `postapoc.mp3` | `postapoc` | ☢️ Post-Apocalyptic Ruins | 2,837,328 |
| `cyberpunk.mp3` | `cyberpunk` | 🌃 Cyberpunk Night | 3,526,961 |
| `western.mp3` | `western` | 🤠 Western Frontier | 2,429,191 |
| `noir.mp3` | `noir` | 🌧️ Noir Detective | 4,259,852 |
| `historical.mp3` | `historical` | 🏛️ Historical Court | 2,538,278 |
| `comedy.mp3` | `comedy` | 🤡 Comedy Caper | 2,915,695 |
| `romance.mp3` | `romance` | 💕 Romantic Rendezvous | 3,793,410 |
| `survival.mp3` | `survival` | 🏕️ Survival Instinct | 4,328,189 |
| `superhero.mp3` | `superhero` | 🦸 Heroic Uprising | 2,842,971 |
| `reallife.mp3` | `reallife` | 🏙️ Everyday Living | 3,012,247 |
| `mature.mp3` | `mature / nsfw` | 🌹 Velvet After Dark | 4,212,205 |

Referenced from `index.html` as `src/music/<genrename>.mp3` in the `GENRE_MUSIC` table (`nsfw` aliases `mature.mp3`).

---

## 3. External code (dependencies, full source) — `03-third-party-code/`

Every `{import:...}` in `main.pjs`, at its exact source. These are the platform's third-party Perchance plugins,
authored and hosted elsewhere — reproduced here so the project is self-documenting. Live source: `https://perchance.org/<name>`.

| Import name | Source URL | Lines | Bytes | Role in this project |
|-------------|-----------|-------|-------|----------------------|
| `ai-text-plugin` | https://perchance.org/ai-text-plugin | 804 | 58,048 | `generateText` / `ai` — GM narration, every extractor and forge |
| `comments-plugin` | https://perchance.org/comments-plugin | 680 | 38,261 | comments dock + per-image gallery comment channels |
| `kv-plugin` | https://perchance.org/kv-plugin | 46 | 4,177 | player saves, cached shared worlds, settings |
| `super-fetch-plugin` | https://perchance.org/super-fetch-plugin | 46 | 2,857 | `superFetch` for shared-world payloads |
| `text-to-image-plugin` | https://perchance.org/text-to-image-plugin | 772 | 37,978 | `generateImage` — backgrounds, portraits, scenes |
| `upload-plugin` | https://perchance.org/upload-plugin | 237 | 10,271 | shared-world payloads + image link uploads |
| `unsafelist` | https://perchance.org/unsafelist | 49 | 3,161 | shared moderation lists (banned users / prompt phrases) |
| `unsafe-private-gallery-v5` | https://perchance.org/unsafe-private-gallery-v5 | 1079 | 46,193 | the private local gallery behind the 🛡️ button |

Convention: imported plugins are always reached through `root.<name>` (`root.generateText`, `root.kv`,
`root.generateImage`, ...); only the top-level import assignment itself is bare.

---

## 4. External / remote assets — `04-external-assets/`

### 4a. Hosted images — bundled in `hosted-images/`, live at their URLs
All are `https://user.uploads.dev/file/<name>.jpg` (Perchance file host). Copied here so the art survives
independently of the host.

| File | Used as | Bytes |
|------|---------|-------|
| `0ec2ce56ee8e63b601ad081b3d5698f1.jpg` | Preset world background — The Realm of Eldermere (fantasy) | 120,366 |
| `fdb43e3928059630c34734a49cc4be24.jpg` | Preset world background — The Cursed Darklands (horror) | 79,693 |
| `f1b59766c56c64e9c56c6e738d12c964.jpg` | Preset world background — The Floating Skylands (fantasy) | 126,829 |
| `27efb155a7e60e5afbf9440be248d146.jpg` | Preset world background — The Sunless Underworld (fantasy) | 99,613 |
| `eea2848c63568dc289dfe43868880c77.jpg` | Preset world background — The Stone Age (survival) | 96,259 |
| `8255d5b065d225928a1cbb976df31342.jpg` | Preset world background — The Hollow Hours (modern horror) | 66,702 |
| `2b2fe1473ab3c11c97abd994c63dfcb4.jpg` | Preset world background — The Galactic Frontier (sci-fi) | 137,174 |
| `ae73889ee9f59854ed0c809004913b60.jpg` | Preset world background — World of Warcraft (fantasy) | 97,763 |
| `0c2629a074a9e4f7db352ea54ebfa455.jpg` | Preset world background — Middle-earth (fantasy) | 130,033 |
| `090552ee5ed6a937a6bbe2afdfe2005e.jpg` | Preset world background — Embercrest (mature / 18+) | 107,561 |
| `f527fa28594a177bf98e476e509ffca4.jpg` | Global page + gallery background (body::before) | 94,112 |
| `9829d76060f8ea373624053bc92eedee.jpg` | Age-gate / overlay background | 159,754 |
| `953974c53a82d8c82d0235f0aca6bd9e.jpg` | $meta.image — generator listing + social share card | 161,201 |
| `9ccf038d9d3424f88e51591f23e29c50.jpg` | Alternate $meta.image (commented out in main.pjs) | 208,537 |

The preset worlds and their backgrounds:
- **The Realm of Eldermere** (`eldermere`, genre `fantasy`) — https://user.uploads.dev/file/0ec2ce56ee8e63b601ad081b3d5698f1.jpg
- **The Cursed Darklands** (`darklands`, genre `horror`) — https://user.uploads.dev/file/fdb43e3928059630c34734a49cc4be24.jpg
- **The Floating Skylands** (`skylands`, genre `fantasy`) — https://user.uploads.dev/file/f1b59766c56c64e9c56c6e738d12c964.jpg
- **The Sunless Underworld** (`underworld`, genre `fantasy`) — https://user.uploads.dev/file/27efb155a7e60e5afbf9440be248d146.jpg
- **The Stone Age** (`stoneage`, genre `survival`) — https://user.uploads.dev/file/eea2848c63568dc289dfe43868880c77.jpg
- **The Hollow Hours** (`modernhorror`, genre `horror`) — https://user.uploads.dev/file/8255d5b065d225928a1cbb976df31342.jpg
- **The Galactic Frontier** (`galactic`, genre `scifi`) — https://user.uploads.dev/file/2b2fe1473ab3c11c97abd994c63dfcb4.jpg
- **World of Warcraft** (`wow`, genre `fantasy`) — https://user.uploads.dev/file/ae73889ee9f59854ed0c809004913b60.jpg
- **Middle-earth** (`middleearth`, genre `fantasy`) — https://user.uploads.dev/file/0c2629a074a9e4f7db352ea54ebfa455.jpg
- **Embercrest** (`embercrest`, genre `mature`) — https://user.uploads.dev/file/090552ee5ed6a937a6bbe2afdfe2005e.jpg

### 4b. Streamed background-music playlist — 44 third-party tracks
Used by the music player's **Playlist** tab. These are long ambient tracks uploaded by other people to
Perchance's file host (≈ 2.2 GB in total), so they are **referenced by URL, not bundled** — they remain live.

| Title | Emoji | URL |
|-------|-------|-----|
| Celtic Autumn Harvest | 🍀 | https://user.uploads.dev/file/729d51bd7f3d73e53f39e40abed63b46.mp3 |
| Retro Synthwave | 🛼 | https://user.uploads.dev/file/e376c269e716e1643f79a0f8e60953e1.mp3 |
| Soft Gentle Piano | 🎹 | https://user.uploads.dev/file/1e1da2252b897499207306428851ae22.mp3 |
| Cozy Quiet Tavern, Guitar | ☕ | https://user.uploads.dev/file/a478e09e8bd083f2f0f4926c11b26f74.mp3 |
| Immersive Epic Fantasy | ⚔️ | https://user.uploads.dev/file/6182d658570e7ed2f73279d3f9181ecb.mp3 |
| Soft Elegant Piano | 🎹 | https://user.uploads.dev/file/41715fa7a7d1073b1cee22434e8e737f.mp3 |
| Summer Vibes, River | 🏞️ | https://user.uploads.dev/file/ed7af5c07ce4377c20d07aeda39d968b.mp3 |
| Preparing for the Quest | 📜 | https://user.uploads.dev/file/9e07a06b6549837087c5e7b61a5f01fd.mp3 |
| Forest Adventure, Ambient | 🌲 | https://user.uploads.dev/file/b8b0cc48d8fb1e6ee1a314250d3e2307.mp3 |
| Rainy Day, Piano | ☕️ | https://user.uploads.dev/file/5eacd0122359eaa89d1b282d1e24bf59.mp3 |
| Morning Vibes, Lofi | 🧘‍♀️ | https://user.uploads.dev/file/abf990528e3427eebf79885a5fcbf32a.mp3 |
| 80's Lofi Hiphop | 🌃 | https://user.uploads.dev/file/1979704506beb8cc5b8fd144c0d9ace7.mp3 |
| Epic Cinematic Awe | 🍿 | https://user.uploads.dev/file/24d46ec59d00c174a321b3b3a77f3c89.mp3 |
| Eastern Fantasy Vibes | ⛩️ | https://user.uploads.dev/file/fd7672362acd646710b111845b585f27.mp3 |
| Cozy Fairytail Fantasy | 🧚‍♀️ | https://user.uploads.dev/file/50a953934d550f9487c249a7b0b80bbd.mp3 |
| Ambient Tranquil Fantasy | 🪷 | https://user.uploads.dev/file/acfdbc7c843c29cf286caa3d244a3ee0.mp3 |
| Fantasy Exploration (Calm) | 🗺️ | https://user.uploads.dev/file/6252394fcf3c193823018f370d218fda.mp3 |
| Ambient Ethereal Vocals | 🌫️ | https://user.uploads.dev/file/31dc821b63f0db13a7b3ede3d891c5b2.mp3 |
| Ambient Hogwarts Vibe | 🧹 | https://user.uploads.dev/file/ab8afcfb0aa8883463fc7386efd87472.mp3 |
| Calm Dark Academia Piano | 🤎 | https://user.uploads.dev/file/ef26fe8e4895ebe4125b554b287e7e14.mp3 |
| Calming Japanese Instrumental | 🎐 | https://user.uploads.dev/file/214833b84e77432e311c2e47ac2ba440.mp3 |
| Celtic Harp | 𝄞 | https://user.uploads.dev/file/8ae7e6dec7ff288ff4f4d25b9911544c.mp3 |
| Cozy Hobbit Living Room | 🧒 | https://user.uploads.dev/file/469c4fd6a3e83465d6283e0483da5000.mp3 |
| Dark Academia Train Ride | 🚂 | https://user.uploads.dev/file/b91c4b0fd0016138e7c721062a284c43.mp3 |
| Gentle Fantasy Anime Vibe | 👒 | https://user.uploads.dev/file/1855082aa8fab9675e0341b39a424e3d.mp3 |
| Gentle Inspiring Piano | 🍂 | https://user.uploads.dev/file/3b940c4fa4201074a7b112495cf5a14b.mp3 |
| Japanese Instrumentals | 🍵 | https://user.uploads.dev/file/7c6df2b832f50bacf1777520acb1ded3.mp3 |
| Japanese Road Trip | 🗼 | https://user.uploads.dev/file/ee667bb34fa81e92339b0037dcc5ccc7.mp3 |
| Japanese Upbeat Wistful | 🩹 | https://user.uploads.dev/file/e2f34e6fb2c53c91d5ebef6183288d4d.mp3 |
| Kawaii Vocals | 🧋 | https://user.uploads.dev/file/4a376965fe387eea741349869e26cd96.mp3 |
| Medieval Folk | 📜 | https://user.uploads.dev/file/0486809b5b02408acb3d2ad36942fc1a.mp3 |
| Difficult Journey Orchestral | 🏔️ | https://user.uploads.dev/file/aac989d61ca39bd66553ddc13fd93ec8.mp3 |
| Relaxing Celtic | 💚 | https://user.uploads.dev/file/073662830cd824d640f28de796e9e465.mp3 |
| Relaxing Iconic Piano | 🥇 | https://user.uploads.dev/file/753e04549c0d30e10447b981afcfb0fd.mp3 |
| Soft Hymnal Instrumental | 🎼 | https://user.uploads.dev/file/a3378e7e12e1ce7cf3a464056e79ef86.mp3 |
| Scottish Highlands (Bagpipes) | 🏴 | https://user.uploads.dev/file/bbfda1aa43149980d104bbc84d9f4da6.mp3 |
| Serene Sci-Fi | 🪐 | https://user.uploads.dev/file/f463c6e7c8b6e6abae2acdf423a72f90.mp3 |
| Soft Sci-Fi | ☄️ | https://user.uploads.dev/file/5ca2c3e11243c1dec20b274ce6d8d2ec.mp3 |
| Soothing Elven Vocals | 🧝‍♀️ | https://user.uploads.dev/file/5d11408fd625df97743095488c2284a5.mp3 |
| Tokyo Vibes | 🗼 | https://user.uploads.dev/file/c8100c5ba725441c747a0483bbf3f3fe.mp3 |
| Very Gentle Ethereal | 😌 | https://user.uploads.dev/file/0bf90087944ff9b441089fc0d54ad03a.mp3 |
| Wistful Peaceful Forest | 🍃 | https://user.uploads.dev/file/2f3b33d14df71a83c371cc51441e9ac7.mp3 |
| Wistful Piano | 🕊 | https://user.uploads.dev/file/7f06357b5112c77e1139d38778dacb86.mp3 |
| Wistful Sci-Fi | 🌌 | https://user.uploads.dev/file/ca38400ca13388c03fb689b0ab528dbf.mp3 |

### 4c. Context tracks (auto music per game state)
- `menu` — https://user.uploads.dev/file/c0d679bc3f01a0a08feb5cc5a8a9fef0.mp3
- `adventure` — https://user.uploads.dev/file/c63a4b23034739f2d8c6fa0995c29050.mp3
- `combat` — https://user.uploads.dev/file/e1703ce9f1428da7effa8d3c2953cb9c.mp3

### 4d. CDN libraries (loaded by the page at runtime)
| Library | Version | URL | Purpose |
|---------|---------|-----|---------|
| piexifjs | latest via jsDelivr | https://cdn.jsdelivr.net/npm/piexifjs | write prompt/seed EXIF into downloaded JPEGs |
| Font Awesome | 6.5.2 | https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css | UI icons (injected async so it can't block load) |
| @huggingface/transformers | 3.3.3 | https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3 | runs RMBG-1.4 in-browser for "Remove Background" |
| RMBG-1.4 model | briaai/RMBG-1.4 | https://huggingface.co/briaai/RMBG-1.4 | background-removal weights |

### 4e. Google Fonts families
Cinzel, Crimson Text, Playfair Display, Lora, Montserrat, Lato, Inter, Orbitron, Rajdhani, IM Fell English,
Creepster — fetched per selected font pair from `fonts.googleapis.com/css2`.

### 4f. Perchance platform services called at runtime
- text generation → `https://text-generation.perchance.org` (via ai-text-plugin)
- image generation → `https://image-generation.perchance.org/gallery` (via text-to-image-plugin)
- comments embeds → `https://comments-plugin.perchance.org/embed/<generator>+<channel>`
- file uploads / shared worlds → `https://user.uploads.dev/file/...` (via upload-plugin)

---

## 5. Build / config / meta — `05-config/`

- `perchance-imports.txt` — the exact `$meta` block and import declarations from `main.pjs`
- `perchance-generator.json` — machine-readable inventory: every file with byte size, all dependencies,
  hosted images, remote audio, preset worlds
- `PERCHANCE-WORKSPACE-AGENTS.md` — the documented workspace contract for this project (folder layout,
  `src/` rules, pjs/HTML conventions, plugin access rules)

### Build pipeline
There isn't one, by design. A Perchance generator is two files: `main.pjs` is evaluated first and its top-level
names become globals; `index.html` is then rendered (square-bracket pjs blocks first, then `<script>` tags).
"Deploying" means saving the generator in the Perchance editor. The only shipped artifacts are the music files
under `src/` and the hosted images listed above.

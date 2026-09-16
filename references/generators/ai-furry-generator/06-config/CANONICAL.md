# Project configuration & canonical facts

Everything in this file was extracted from the shipped sources (`01-internal-code/main.pjs`,
`01-internal-code/index.html`) — it is the "config" of the project, which on Perchance lives
partly in `$meta`, partly in `localStorage` keys, and partly in URL/analytics constants.

## Identity

| item | value |
|---|---|
| generator name | `ai-furry-generator` |
| canonical (top-level) URL | https://perchance.org/ai-furry-generator |
| runtime origin | `https://${window.generatorPublicId}.perchance.org/ai-furry-generator` |
| `window.generatorPublicId` (captured) | starts with `dbed7477` (32-hex, full value is per-page runtime state) |
| shipped as | a saved (not unsaved) Perchance generator |
| build tags in source | `main.pjs`: *AIFG v1.47 Quiet Mind Easter Egg build* · `t2i-framework-plugin-v2-furry-v1`: *AIFG v1.50 Manual-stop AI translator bridge build* · `tabbed-comments-plugin-aifg`: *AIFG v1.93 Clean More build* |
| licensing posture | heavy community contributions; private/personal use on request, public cloning / credit removal discouraged — see top-level `NOTICE.md` |

## `$meta` (SEO / platform metadata) — from `main.pjs`

```pjs
$meta
  title = Perchance AI Furry Generator
  description = Generate free furry AI art & fursona, free, unlimited, no sign-up. Join the Perchance community for AI character roleplay and prompts, powered by FLUX.
  image = https://user.uploads.dev/file/ea64aa498f9affdd98f62ad6fd115500.jpg
  tags = furry, furry AI, AI furry generator, furry art generator, furry AI art, fursona, fursona generator, anthro, anthropomorphic, character generator, AI character art, AI image generator, text to image, FLUX, FLUX AI, free AI art, unlimited AI art, no sign-up, furry prompts, AI art styles, furry roleplay, furry community, Perchance
  header
    mode = minimal
```

The `$meta.image` asset is bundled at `04-project-assets/images/ea64aa498f9affdd98f62ad6fd115500.jpg`.

## Import block — verbatim from the top of `main.pjs`

```pjs
generateHTML = {import:t2i-framework-plugin-v2-furry-v1}
generatorStats = {import:generator-stats-plugin}
favicon = {import:favicon-plugin}
art = {import:ai-furry-generator-style-v17}
jail = {import:furry-banlist}
emoji = {import:huge-emojilist-furry-generator}
image = {import:text-to-image-plugin}
commentsPlugin = {import:comments-plugin}
```

(`from = {import:ai-furry-generator-style-v17}` also appears later in `main.pjs` — a second binding
of the same art-style list. `index.html` contains no `{import:...}` at all.)

These 8 direct imports pull in 11 more transitively, for **19 vendored generators** total — all
stored in `02-external-code/imports/<name>/main.pjs`. The full graph and per-import roles are in
`02-external-code/SOURCES.md`.

## Performance profiles

| item | value |
|---|---|
| storage key | `pl_performanceProfileV1` |
| selectable values | `performance` (default, full set of features), `balance`, `minimal` |
| applied by | inline `<script id="aifg-performance-bootstrap">` early in `index.html` — sets `document.documentElement.dataset.performanceProfile` before the app renders |
| UI control | `<select id="performanceProfileSelect">` on the settings card, with `<span id="performanceProfileSummary">` |
| behaviour difference (example) | `main.pjs#commentEmojiSelection()` loads the 5 MB custom comment-emoji list only for the `performance` profile; `balance` / `minimal` return an empty list |
| analytics difference | Google Analytics (gtag) loads for `performance` and `balance`, skipped for `minimal` |

## `localStorage` keys written by the project

### From `main.pjs`

```
pl_performanceProfileV1            autoSaveLinks                hideTrollPopup
_f_unl                             gallerySaveDestType          gallerySaveDestName
_adultEntryPassV1                  gallerySaveStorageMode       autoSaveDestType
_adultNicknameCorrectionRequiredV1 autoSaveDestName             _moderator_warning_v2
lastHardRefreshCommandId           _moderator_warning_v1        _passportId
_myNickname                        _myUsername                  _yeet_curse
_3d_curse                          _adultMinorPermanentBanV1    _3d_fullscreen_stage
_myAvatar                          _pg13ProfileSetupRequiredV1
```

### From `index.html`

```
userConsent                        hidePrivateChannelWarningV1  rpRuleDismissedV1
commentToggleOpen                  galleryCollapsed             lookForThis
dontLookForThis                    floatingBtnHintDismissed     chatMode
pl_showAppCloseHints               forceColorScheme             autoSaveLinks
pl_rememberGallerySearch           pl_titleBannerModeV2         pl_workspaceLayout
pl_workspaceStudioSplit            pl_workspaceDockAutoHide     pl_workspaceDockSwipeDirection
pl_autoSavePromptHistory           pl_autoSavePromptHistoryFirstImage
pl_showInputHints                  pl_workspaceShortcuts        mute_chip_*
pl_* (namespaced app launcher keys, templated)
pl_customAppName${i}  pl_customAppUrl${i}  pl_customAppIcon${...}  pl_showCustomApp${...}
pl_customAppMemory${index}  pl_mem_${key}
genSaveDestType  genSaveDestName  autoSaveDestType  autoSaveDestName
gallerySaveStorageMode  gallerySaveDestType  gallerySaveDestName
promptHistorySaveDestType  promptHistorySaveDestName
```

## Access gate embedded in `index.html`

An inline `onerror` handler on a hidden `<img src="x">` performs a page-identity check: if
`localStorage._f_unl !== "1"` and the runtime path is not `/ai-furry-generator`, it renders a
full-screen "AI Furry Generator" disclaimer overlay. The overlay strings are stored base64-encoded
in the handler. This is part of the shipped source and is reproduced verbatim in
`01-internal-code/index.html`; nothing needs to be configured for a fork to run, as the guard only
triggers on `perchance.org` hosts with a different path.

## External service constants

| item | value | where |
|---|---|---|
| Google Analytics (gtag) | `G-6QDMTXJTDD` — `https://www.googletagmanager.com/gtag/js?id=G-6QDMTXJTDD` | `index.html` |
| feedback form | Tally form `mY2kKz` — https://tally.so/r/mY2kKz (widget script vendored as `03-third-party-vendor/js/tally-embed.js`) | `main.pjs` header comment, `furry-concept-board`, `furry-banlist` |
| image / asset host | `https://user.uploads.dev/file/<id>.<ext>` (Perchance upload service) | everywhere |
| all other hosts/endpoints | see `05-external-services/EXTERNAL-SERVICES.md` | — |

## Page composition (from `index.html`)

| item | count |
|---|---|
| `<script>` tags | 42 — all **inline**; no external `<script src>` is used |
| named inline scripts | `aifg-browser-translation-guard`, `aifg-performance-bootstrap`, `aifg-wallpaper-system`, `aifg-language-system` |
| `<style>` blocks | 21 |
| external `<link rel="stylesheet">` | 4 (Google Fonts ×3, Font Awesome) — all saved under `03-third-party-vendor/` with offline `.local.css` variants |
| `import()` at runtime | `jszip@3.10.1` (bundled as `03-third-party-vendor/js/jszip-3.10.1.esm.js`) for client-side ZIP export |

## Rebuild / run notes

Perchance has no build step. To stand the project up:

1. Create a Perchance generator and paste `01-internal-code/main.pjs` into its `main.pjs` and
   `01-internal-code/index.html` into its HTML pane.
2. Keep the `{import:...}` lines in `main.pjs` (they resolve by name on Perchance). The vendored
   copies in `02-external-code/imports/` are reference copies, not something you deploy.
3. Remote assets load from `user.uploads.dev` as-is. To run fully offline, re-point the URL strings
   using `04-project-assets/ASSET-URLS.tsv` / `inventory.json`, and use the `.local.css` stylesheets
   from `03-third-party-vendor/css/`.
4. Re-fetch anything missing with `tools/fetch-remote-assets.mjs` (see the top-level `README.md`).

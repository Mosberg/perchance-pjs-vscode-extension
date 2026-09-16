# External services, APIs and remote endpoints used at runtime

These are **not** bundled (they are live services). Assets that could be bundled are in `04-project-assets/` and `03-third-party-vendor/`.

Hosts, in order of how load-bearing they are:

| host | what it is used for |
|---|---|
| `perchance.org` | Perchance generator links (canonical/related generators, help pages, share links). |
| `null.perchance.org` | Perchance generator links that auto-resolve to the correct subdomain (used in embedded iframes/links). |
| `user-uploads.perchance.org` | Legacy upload host used by imported plugins. |
| `www.youtube.com` | YouTube embeds (media app). |
| `open.spotify.com` | Spotify embeds (media app). |
| `cdn.jsdelivr.net` | JSZip ES module (vendored in `03-third-party-vendor/js/`). |
| `upload.perchance.org` | Perchance upload API: `fileInfo?url=...` |
| `fonts.googleapis.com` | Google Fonts CSS (vendored). |
| `comments-plugin.perchance.org` | comments-plugin embed endpoint (the chat iframes). |
| `image-generation.perchance.org` | Perchance image-host API: `imageTags?url=...` NSFW check. |
| `tally.so` | Feedback form widget (vendored JS + iframe endpoint). |
| `www.google.com` | Google favicon/search helpers used by the in-app link previewer. |
| `cdnjs.cloudflare.com` | Font Awesome 7.0.1 CSS (vendored). |
| `furrybackend.onrender.com` | Community backend on Render: `/active-users` and `/country-stats` (online counter, country stats). |
| `esm.sh` | referenced in source |
| `www.w3.org` | XML namespace strings (not network calls). |
| `instafonts.io` | External font tool link (in the preset list). |
| `noembed.com` | YouTube video metadata (titles) for embeds. |
| `www.googletagmanager.com` | Google Analytics (gtag) — loaded unless the Minimal performance profile is active. |
| `fonts.gstatic.com` | Google Fonts woff2 files (vendored). |
| `schema.org` | JSON-LD context string (not a network call). |
| `flagcdn.com` | Flag images for the country-stats panel: `/w20/<code>.webp`. |
| `translate.googleapis.com` | Free Google translate endpoint used by the in-app text translator. |
| `api.mymemory.translated.net` | MyMemory translation API (second translator engine). |
| `calendar.google.com` | Embedded community calendar iframe. |
| `www.tldraw.com` | Embedded tldraw whiteboard link. |
| `selfit-camera-omni-image-editor.hf.space` | Hugging Face Space (Gradio API) — image editor app. |
| `r3gm-wan2-2-fp8da-aoti-preview.hf.space` | Hugging Face Space (Gradio API) — video/image model app. |
| `not-lain-background-removal.hf.space` | Hugging Face Space (Gradio API) — background removal. |
| `finegrain-finegrain-image-enhancer.hf.space` | Hugging Face Space (Gradio API) — image enhancer/upscaler. |
| `user-uploads.perchance` | referenced in source |
| `${text.replace(` | referenced in source |
| `${rawurl}` | referenced in source |
| `bigger.pics` | referenced in source |
| `app.bigger.pics` | referenced in source |
| `raw.githubusercontent.com` | referenced in source |
| `fetch-plugin.perchance.org` | referenced in source |
| `${window.generatorpublicid}.perchance.org` | referenced in source |
| `example.com` | referenced in source |
| `www.codecademy.com` | referenced in source |
| `unpkg.com` | referenced in source |
| `peoplenationsandtongues.blogspot.com` | referenced in source |
| `e926.net` | referenced in source |
| `e621.ne` | referenced in source |
| `secret.viralsachxd.com` | referenced in source |
| `www.secretmessage.link` | referenced in source |
| `i.secret-share.net` | referenced in source |
| `aads.com` | referenced in source |
| `unlucid.ai` | referenced in source |
| `prnt.sc` | referenced in source |
| `sl1nk.com` | referenced in source |
| `fbi.cults3d.com` | referenced in source |
| `docs.google.com` | referenced in source |
| `minitube.pythonanywhere.com` | referenced in source |
| `thailandshow.raiselysite.com` | referenced in source |
| `video.a2e.ai` | referenced in source |
| `discord.gg` | referenced in source |
| `www.musiccreator.ai` | referenced in source |
| `kira.art` | referenced in source |
| `generated-images.perchance.org` | referenced in source |
| `lucidshadowdreamer.newgrounds.com` | referenced in source |
| `text-generation.perchance.org` | referenced in source |
| `ai-agent.perchance.org` | referenced in source |

## Full URL inventory (excluding the `*.uploads.dev` asset CDN)

### `${rawurl}`

- `https://${rawUrl}`  — *imports/tabbed-comments-plugin-aifg*

### `${text.replace(`

- `https://${text.replace(/^`  — *imports/tabbed-comments-plugin-aifg*

### `${window.generatorpublicid}.perchance.org`

- `https://${window.generatorPublicId}.perchance.org`  — *imports/super-fetch-plugin*

### `aads.com`

- `https://aads.com/`  — *imports/furry-banlist*

### `ai-agent.perchance.org`

- `https://ai-agent.perchance.org/api/aiAgent/clientLog`  — *imports/ai-text-plugin*

### `api.mymemory.translated.net`

- `https://api.mymemory.translated.net/get?q=`  — *index.html*

### `app.bigger.pics`

- `https://app.bigger.pics`  — *imports/t2i-framework-plugin-v2-furry-v1*

### `bigger.pics`

- `https://bigger.pics/`  — *imports/t2i-framework-plugin-v2-furry-v1*

### `calendar.google.com`

- `https://calendar.google.com/calendar/u/0/embed?src=cde7c71a398167fc0d4d9666a674666c5561ee0ace2dba953f3615f2fe5a041f@group.calendar.google.com`  — *index.html*

### `cdn.jsdelivr.net`

- `https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm`  — *index.html*
- `https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3`  — *imports/text-to-image-plugin*
- `https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm`  — *imports/kv-plugin*
- `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`  — *imports/furry-concept-board*

### `cdnjs.cloudflare.com`

- `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css`  — *index.html*
- `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`  — *imports/furry-concept-board*

### `comments-plugin.perchance.org`

- `https://comments-plugin.perchance.org`  — *imports/comments-plugin*
- `https://comments-plugin.perchance.org/embed/${folderName}?${queryString}`  — *imports/comments-plugin*
- `https://comments-plugin.perchance.org/embed/${folderName}?${queryString}#${urlHashDataEncoded}`  — *imports/comments-plugin*
- `https://comments-plugin.perchance.org/embed/${folderName}?${queryString}#${encodeURIComponent(JSON.stringify(urlHashData`  — *imports/comments-plugin*

### `discord.gg`

- `https://discord.gg/Ctasd4kDQ`  — *imports/furry-banlist*

### `docs.google.com`

- `https://docs.google.com/document/d/1sIVynt6wvnE-iKnkKjb51NKpBFHawd1MdgL2f50TK0A/edit?tab=t.0`  — *imports/furry-banlist*

### `e621.ne`

- `https://e621.ne/i`  — *imports/furry-banlist*

### `e926.net`

- `https://e926.net/i`  — *imports/furry-banlist*

### `esm.sh`

- `https://esm.sh/@tensorflow/tfjs@4.22.0`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://esm.sh/@tensorflow/tfjs-backend-webgpu@4.22.0`  — *imports/t2i-framework-plugin-v2-furry-v1*

### `example.com`

- `https://example.com`  — *imports/super-fetch-plugin*

### `fbi.cults3d.com`

- `https://fbi.cults3d.com/uploaders/17487350/illustration-file/40e1e0df-9969-4f89-ab61-f3fa3c3d50d2/CADViewRear.PNG/`  — *imports/furry-banlist*

### `fetch-plugin.perchance.org`

- `https://fetch-plugin.perchance.org/proxy1/${encodeURIComponent(new`  — *imports/super-fetch-plugin*

### `finegrain-finegrain-image-enhancer.hf.space`

- `https://finegrain-finegrain-image-enhancer.hf.space`  — *index.html*

### `flagcdn.com`

- `https://flagcdn.com/w20/${code}.webp`  — *index.html*

### `fonts.googleapis.com`

- `https://fonts.googleapis.com`  — *index.html*
- `https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap`  — *index.html*
- `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`  — *index.html*
- `https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap`  — *index.html*

### `fonts.gstatic.com`

- `https://fonts.gstatic.com`  — *index.html*

### `furrybackend.onrender.com`

- `https://furrybackend.onrender.com/active-users`  — *index.html*
- `https://furrybackend.onrender.com/country-stats`  — *index.html*

### `generated-images.perchance.org`

- `https://generated-images.perchance.org/image/8befb2498340e0185af2af7bd6c99f5b726899c11bcfbfefa9e82135651c1017.jpeg`  — *imports/furry-banlist*

### `i.secret-share.net`

- `https://i.secret-share.net`  — *imports/furry-banlist*

### `image-generation.perchance.org`

- `https://image-generation.perchance.org/api/imageTags?url=${encodeURIComponent(normalizedUrl`  — *main.pjs*
- `https://image-generation.perchance.org`  — *imports/text-to-image-plugin*
- `https://image-generation.perchance.org/api/imageTags?url=${encodeURIComponent(url`  — *imports/tabbed-comments-plugin-aifg*

### `instafonts.io`

- `https://instafonts.io`  — *main.pjs*

### `kira.art`

- `https://kira.art/?invite=577d5ff8-f4f9-4b30-a983-2e4e524f0631`  — *imports/furry-banlist*

### `lucidshadowdreamer.newgrounds.com`

- `https://lucidshadowdreamer.newgrounds.com/`  — *imports/furry-banlist*

### `minitube.pythonanywhere.com`

- `https://minitube.pythonanywhere.com/`  — *imports/furry-banlist*

### `noembed.com`

- `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`  — *main.pjs*

### `not-lain-background-removal.hf.space`

- `https://not-lain-background-removal.hf.space`  — *index.html*

### `null.perchance.org`

- `https://null.perchance.org/welcome`  — *index.html*
- `https://null.perchance.org/ai-furry-generator-guide`  — *index.html, imports/t2i-framework-plugin-v2-furry-v1*
- `https://null.perchance.org/furdex`  — *index.html*
- `https://null.perchance.org/furry-banlist-search`  — *index.html*
- `https://null.perchance.org/ai-furry-generator-submission#emoji`  — *index.html*
- `https://null.perchance.org/ai-furry-generator-submission#style`  — *index.html*
- `https://null.perchance.org/ai-furry-generator-submission#furdex`  — *index.html*
- `https://null.perchance.org/ai-furry-generator-submission#furai`  — *index.html*
- `https://null.perchance.org/vn-character-art-generator`  — *index.html*
- `https://null.perchance.org/emoji-sticker-generator`  — *index.html*
- `https://null.perchance.org/furpost`  — *index.html*
- `https://null.perchance.org/ai-furrygen-pc`  — *index.html*
- `https://null.perchance.org/pomodoro`  — *index.html*
- `https://null.perchance.org/fur-ai`  — *index.html*

### `open.spotify.com`

- `https://open.spotify.com/embed/track/${spotifyId}`  — *main.pjs*
- `https://open.spotify.com/embed/playlist/${spotifyId}`  — *main.pjs*
- `https://open.spotify.com/embed/album/${spotifyId}`  — *main.pjs*
- `https://open.spotify.com/embed/artist/${spotifyId}`  — *main.pjs*
- `https://open.spotify.com/embed/${spotifyMatch[1`  — *index.html*

### `peoplenationsandtongues.blogspot.com`

- `https://peoplenationsandtongues.blogspot.com/i`  — *imports/furry-banlist*

### `perchance.org`

- `https://perchance.org/ai-furry-generator`  — *main.pjs, index.html, imports/t2i-framework-plugin-v2-furry-v1, imports/huge-emojilist-furry-generator, imports/furry-banlist, imports/ai-furry-generator-style-v17*
- `https://perchance.org/furry-ai`  — *main.pjs*
- `https://perchance.org/text-to-image-plugin`  — *main.pjs*
- `https://perchance.org/clickable-share#https://perplexity666.notion.site/User-account-nicknames-and-usernames-on-Perchance-5904e6d9b3c24214ae174194783acc40`  — *main.pjs*
- `https://perchance.org/clickable-share#https://lemmy.world/post/39217737`  — *main.pjs*
- `https://perchance.org/clickable-share#`  — *main.pjs*
- `https://perchance.org/clickable-share#yourURL`  — *main.pjs*
- `https://perchance.org/hub`  — *main.pjs, index.html*
- `https://perchance.org/ai-text-to-image-generator`  — *main.pjs*
- `https://perchance.org/advanced-image-generator`  — *main.pjs*
- `https://perchance.org/oi-text-to-image-generator`  — *main.pjs*
- `https://perchance.org/ai-art-generator-advanced`  — *main.pjs*
- `https://perchance.org/share-img-link`  — *main.pjs*
- `https://perchance.org/prompt-hunter`  — *main.pjs*
- `https://perchance.org/bove-flux`  — *main.pjs*
- `https://perchance.org/vibe-chat`  — *main.pjs*
- `https://perchance.org/ai-text-to-image-generators`  — *main.pjs*
- `https://perchance.org/coyote-apex-v3`  — *main.pjs, imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/on-input-text-change`  — *main.pjs*
- `https://perchance.org/ai-artgen`  — *main.pjs*
- `https://perchance.org/pi-text-to-image-generator`  — *main.pjs*
- `https://perchance.org/artscapes-v3`  — *main.pjs*
- `https://perchance.org/urvillain-imagine`  — *main.pjs*
- `https://perchance.org/urv-ai-chat`  — *main.pjs*
- `https://perchance.org/upload`  — *index.html, imports/text-to-image-plugin*
- `https://perchance.org/furpost`  — *index.html*
- `https://perchance.org/furdex`  — *index.html*
- `https://perchance.org/fur-ai`  — *index.html*
- `https://perchance.org/user-count-display-guide`  — *index.html*
- `https://perchance.org/live-activity-plugin`  — *index.html*
- `https://perchance.org/user-counter`  — *index.html*
- `https://perchance.org/ai-furry-generator?utm_source=forked&utm_medium=perchance`  — *index.html*
- `https://perchance.org/ad-viewer-appreciation-day`  — *index.html*
- `https://perchance.org/blackyt`  — *index.html*
- `https://perchance.org/g2g-contest`  — *index.html*
- `https://perchance.org/new-furry-ai`  — *index.html, imports/furry-banlist*
- `https://perchance.org/ai-furrygen-pc`  — *imports/tabbed-comments-plugin-aifg*
- `https://perchance.org/ai-character-generator#edit`  — *imports/t2i-styles*
- `https://perchance.org/prompt-style-tester`  — *imports/t2i-styles*
- `https://perchance.org/t2i-framework-plugin-v2-furry-v1`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/t2i-framework-plugin-v2`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/${window.generatorName}#data=`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/ai-character-chat#${urlHashData}`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/ai-character-chat?data=${characterName}~${fileName}`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/fur-ai?char_import=${furAiFileUrl}&name=${cleanName}`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/ai-character-chat?data=${cleanName}~${standardId}`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://perchance.org/huge-emojilist-furry-generator`  — *imports/huge-emojilist-furry-generator*
- `https://perchance.org/huge-emoji-list`  — *imports/huge-emojilist-furry-generator*
- `https://perchance.org/7tdtrgb9tt`  — *imports/furry-banlist*
- `https://perchance.org/a3mrhzw7tc`  — *imports/furry-banlist*
- `https://perchance.org/ai-furry-generator-style`  — *imports/ai-furry-generator-style-v17*
- `https://perchance.org/t2i-styles`  — *imports/ai-furry-generator-style-v17*
- `https://perchance.org/ai-pokemon-generator`  — *imports/ai-furry-generator-style-v17*

### `prnt.sc`

- `https://prnt.sc/7fV9eRsvWBfv/i`  — *imports/furry-banlist*

### `r3gm-wan2-2-fp8da-aoti-preview.hf.space`

- `https://r3gm-wan2-2-fp8da-aoti-preview.hf.space`  — *index.html*

### `raw.githubusercontent.com`

- `https://raw.githubusercontent.com`  — *imports/super-fetch-plugin*

### `schema.org`

- `https://schema.org`  — *index.html*

### `secret.viralsachxd.com`

- `https://secret.viralsachxd.com`  — *imports/furry-banlist*

### `selfit-camera-omni-image-editor.hf.space`

- `https://selfit-camera-omni-image-editor.hf.space`  — *index.html*

### `sl1nk.com`

- `https://sl1nk.com/i`  — *imports/furry-banlist*

### `tally.so`

- `https://tally.so/r/mY2kKz`  — *main.pjs, index.html, imports/t2i-framework-plugin-v2-furry-v1, imports/huge-emojilist-furry-generator, imports/furry-concept-board, imports/furry-banlist, imports/ai-furry-generator-style-v17*
- `https://tally.so/widgets/embed.js`  — *index.html*

### `text-generation.perchance.org`

- `https://text-generation.perchance.org`  — *imports/ai-text-plugin*

### `thailandshow.raiselysite.com`

- `https://thailandshow.raiselysite.com/`  — *imports/furry-banlist*

### `translate.googleapis.com`

- `https://translate.googleapis.com/translate_a/single?client=gtx&sl=`  — *index.html*

### `unlucid.ai`

- `https://unlucid.ai/r/t9e5vhbl`  — *imports/furry-banlist*

### `unpkg.com`

- `https://unpkg.com/jszip@3.10.1/dist/jszip.min.js`  — *imports/furry-concept-board*

### `upload.perchance.org`

- `https://upload.perchance.org/api/fileInfo?url=${encodeURIComponent(normalizedUrl`  — *main.pjs*
- `https://upload.perchance.org`  — *imports/upload-plugin*
- `https://upload.perchance.org/embed#${JSON.stringify({email:false`  — *imports/upload-plugin*
- `https://upload.perchance.org/api/fileInfo?url=${encodeURIComponent(url`  — *imports/tabbed-comments-plugin-aifg*

### `user-uploads.perchance`

- `https://user-uploads.perchance`  — *imports/text-to-image-plugin*

### `user-uploads.perchance.org`

- `https://user-uploads.perchance.org/file/example.webp`  — *main.pjs*
- `https://user-uploads.perchance.org`  — *imports/upload-plugin, imports/text-to-image-plugin, imports/super-fetch-plugin, imports/comments-plugin*
- `https://user-uploads.perchance.org/file/43b41e9c6cb79e540c0675bd02637c87.webp`  — *imports/t2i-framework-plugin-v2-furry-v1*
- `https://user-uploads.perchance.org/file/0696ec9185e18650c6413e11dea7ce50.webp`  — *imports/huge-emojilist-furry-generator*
- `https://user-uploads.perchance.org/file/a90ee49d4ef47ac9c377ab90954c7349.webp`  — *imports/furry-banlist*
- `https://user-uploads.perchance.org/file/4579c0b9443c11d833559ca4e9965367.webp`  — *imports/ai-furry-generator-style-v17*

### `video.a2e.ai`

- `https://video.a2e.ai/?coupon=aeGR`  — *imports/furry-banlist*

### `www.codecademy.com`

- `https://www.codecademy.com/learn/javascript`  — *imports/select-leaf-plugin*

### `www.google.com`

- `https://www.google.com/s2/favicons?sz=64&domain=${domain}`  — *main.pjs*
- `https://www.google.com/search?q=${encodeURIComponent(c`  — *index.html*

### `www.googletagmanager.com`

- `https://www.googletagmanager.com/gtag/js?id=G-6QDMTXJTDD`  — *index.html*

### `www.musiccreator.ai`

- `https://www.musiccreator.ai/ai-music-generator?shareid=SJlT7br09OHard`  — *imports/furry-banlist*

### `www.secretmessage.link`

- `https://www.secretmessage.link`  — *imports/furry-banlist*

### `www.tldraw.com`

- `https://www.tldraw.com/f/nYfr9a4wO7THc-95QdvwK?d=v491.1022.1568.3120.kxLhWAeyQ3JqzamV5GRNc`  — *index.html*

### `www.w3.org`

- `http://www.w3.org/2000/svg`  — *main.pjs, index.html, imports/t2i-framework-plugin-v2-furry-v1*

### `www.youtube.com`

- `https://www.youtube.com/embed/${videoId}`  — *main.pjs, imports/furry-concept-board*
- `https://www.youtube.com/embed/${ytMatch[1`  — *index.html*
- `https://www.youtube.com/embed/${ytShortsMatch[1`  — *index.html*
- `https://www.youtube.com/embed/${ytBeMatch[1`  — *index.html*
- `https://www.youtube.com/@NataliTheWolf/i`  — *imports/furry-banlist*
- `https://www.youtube.com/watch?v=QkmmEjfsNG4`  — *imports/furry-banlist*

## Asset CDN hosts (excluded above)

- `https://user.uploads.dev/file/<name>` — every bundled asset's original URL is listed in `04-project-assets/ASSETS.md` and `ASSET-URLS.tsv`.
- `https://aigc.uploads.dev/image/<name>` — one wallpaper original.
- `https://upload.perchance.org`, `https://image-generation.perchance.org` — moderation/quota and NSFW-check APIs.

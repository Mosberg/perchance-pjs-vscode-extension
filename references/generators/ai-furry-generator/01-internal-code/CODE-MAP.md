# Code map — `main.pjs` and `index.html`

Line numbers refer to the files in `01-internal-code/`. `main.pjs` is the Perchance (pjs) source: lists, functions and plugin imports. `index.html` is the HTML **body contents** (the platform supplies `<html>`/`<body>`), and mixes CSS, markup and ~42 inline scripts.

## `main.pjs` — top-level entries (imports, meta, lists, functions)

| line | entry |
|---|---|
| 8 | `generateHTML = {import:t2i-framework-plugin-v2-furry-v1}` |
| 9 | `generatorStats = {import:generator-stats-plugin}` |
| 10 | `favicon = {import:favicon-plugin}` |
| 11 | `art = {import:ai-furry-generator-style-v17}` |
| 12 | `jail = {import:furry-banlist}` |
| 13 | `emoji = {import:huge-emojilist-furry-generator}` |
| 14 | `image = {import:text-to-image-plugin}` |
| 15 | `commentsPlugin = {import:comments-plugin}` |
| 19 | `commentEmojiSelection() =>` |
| 25 | `$meta` |
| 1393 | `isNsfwGatedGalleryImage(data) =>` |
| 1406 | `normalLetters = [Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")]` |
| 1407 | `normalChars = [Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")]` |
| 1408 | `boldChars = [Array.from("𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣�` |
| 1409 | `italicChars = [Array.from("𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖�` |
| 1410 | `gothicChars = [Array.from("𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺�` |
| 1411 | `small = [Array.from("ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫")]` |
| 1412 | `smol = [Array.from("ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᶿᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹")]` |
| 1413 | `script = [Array.from("𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡` |
| 1414 | `frizzleChars = [Array.from("ǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաӽʏʐ ǞɮƇƉƐʄɢӇƗᨸӃʟʍՌՕՔԶƦՖȶƱƲЩӼʏʐ")]` |
| 1415 | `bodeChars = [Array.from("ᗩᗷᑕᗪᗴᖴǤᕼᏆᒍᛕ⎳ᗰᑎᗝᑭɊᖇᔕ丅ᑌᐯᗯ᙭Ƴ乙")]` |
| 1419 | `$output(txt) =>` |
| 1620 | `yeetChatID = [jail.yeetChatID]` |
| 1621 | `yeetNickNames = [jail.yeetNickNames]` |
| 1622 | `yeetUsernames = [jail.yeetUsernames]` |
| 1623 | `yeetNameCombos = [jail.yeetNameCombos]` |
| 1624 | `warnChatNames = [jail.warnChatNames]` |
| 1625 | `warnChatWords = [jail.warnChatWords]` |
| 1627 | `normalizeChatFullId(value) =>` |
| 1631 | `getYeetChatIdSet() =>` |
| 1651 | `isUserBannedByFullId(passportId) =>` |
| 1655 | `getChatYeetWords() =>` |
| 1687 | `getYeetNameRegexes(listValue, cacheKey) =>` |
| 1711 | `matchesYeetNameList(value, listValue, cacheKey) =>` |
| 1722 | `getYeetNameComboRegexes(listValue, cacheKey) =>` |
| 1750 | `matchesYeetNameCombos(username, nickname) =>` |
| 1763 | `isUserBannedByNicknameOrUsername(nickname, username) =>` |
| 1778 | `getWarnChatEntries(listValue, cacheKey) =>` |
| 1807 | `getWarnChatMatch(listValue, cacheKey, values) =>` |
| 1823 | `getWarnChatNameMatch(nickname, username) =>` |
| 1830 | `getWarnChatWordMatch(message) =>` |
| 1837 | `buildConceptBoardSaveInfo(data) =>` |
| 1916 | `getChatPreviewNsfwInfo(rawUrl) =>` |
| 1985 | `targetId(value) =>` |
| 1988 | `normalizeUsernameText(value) =>` |
| 1991 | `normalizeNicknameText(value) =>` |
| 1994 | `stampPassport(user) =>` |
| 1999 | `normalizeTarget(value) =>` |
| 2013 | `readTarget(value) =>` |
| 2036 | `writeTarget(target) =>` |
| 2040 | `identityTarget(passportId, nickname, username) =>` |
| 2049 | `parseTarget(raw) =>` |
| 2085 | `splitModeratorWarningBody(value) =>` |
| 2114 | `matchTargetCached(passportId, nickname, username, target) =>` |
| 2132 | `targetsOverlap(left, right) =>` |
| 2144 | `parseModeratorWarningSpan(value) =>` |
| 2193 | `formatModeratorWarningRemaining(expiresAt) =>` |
| 2218 | `parseModeratorWarningCommand(message) =>` |
| 2237 | `formatModeratorTarget(target) =>` |
| 2247 | `showLocalModeratorCommandResult(title, lines) =>` |
| 2268 | `showBailReleaseNotice() =>` |
| 2291 | `readModeratorWarning() =>` |
| 2329 | `clearModeratorWarning() =>` |
| 2336 | `showModeratorWarning(warning) =>` |
| 2371 | `activateStoredModeratorWarning(passportId, nickname, username) =>` |
| 2393 | `baseOnComment(comment, adultChannel, submitScope) =>` |
| 2999 | `banRain() =>` |
| 3069 | `chatMinorPermanentBan() =>` |
| 3081 | `clearChat3d() =>` |
| 3093 | `chat3d() =>` |
| 3125 | `clearChatYeet() =>` |
| 3143 | `chatYeet() =>` |
| 3174 | `formatText(text) => // chat slash command: format` |
| 3182 | `clickclackify (input) =>` |
| 3198 | `glitch (input) =>` |
| 3212 | `strike (input) =>` |
| 3228 | `underline (input) =>` |
| 3244 | `keycaps(text) =>` |
| 3308 | `noDramaMessage (extraText) =>` |
| 3318 | `nodramaSlash (extraText) =>` |
| 3322 | `notify(message, subMessage) =>` |
| 3425 | `notifyPinned(rawText, subMessage) =>` |
| 3515 | `notifyWithLink(message, url, isSpoiler, senderUser, infoData, isAutoFlagged) =>` |
| 4196 | `notifyRefreshManual (constantHtml, reasonHtml, options = {}) =>` |
| 4331 | `normalizePg13ProfileValue(value) =>` |
| 4335 | `getPg13ProfileIdentity(user) =>` |
| 4344 | `cachePg13ProfileIdentity(user) =>` |
| 4362 | `readCachedPg13ProfileIdentity() =>` |
| 4369 | `setPg13ProfileSetupStatus(state, message) =>` |
| 4377 | `appendPg13ProfileReturnButton() =>` |
| 4388 | `closePg13ProfileSetupRoom() =>` |
| 4391 | `handlePg13ProfileSetupComment(comment) =>` |
| 4408 | `showPg13ProfileSetupFallback() =>` |
| 4418 | `showPg13ProfileSetupRoom(scope) =>` |
| 4536 | `allowPg13ProfileSubmit(scope) =>` |
| 4548 | `getAdultConsentKey(channel) =>` |
| 4553 | `writeAdultRuleConsent(channel, source) =>` |
| 4571 | `classifyAdultBirthDate(text) =>` |
| 4893 | `classifyAdultNickname(nickname) =>` |
| 5033 | `adultNicknameCheckMessage(status) =>` |
| 5040 | `setAdultWaitingRoomStatus(state, message) =>` |
| 5048 | `appendAdultRoomEntryButton() =>` |
| 5065 | `closeAdultWaitingRoom() =>` |
| 5086 | `applyAdultMinorPermanentBan(target, age) =>` |
| 5104 | `completeAdultNicknameCheck(message) =>` |
| 5110 | `handleAdultWaitingRoomComment(comment) =>` |
| 5123 | `processAgeResult(ageResult, currentIdentity, comment) =>` |
| 5148 | `showAdultNicknameCheck(channel, status) =>` |
| 5238 | `showAgeVerificationModal() =>` |
| 5262 | `triggerGlobalRefresh(customMessage, reasonMessage) =>` |
| 5389 | `triggerHardRefresh(customMessage, reasonMessage) =>` |
| 5454 | `triggerAgeConfirmTimer(customMessage) =>` |
| 5605 | `showImageFullscreen(imageUrl) =>` |
| 5700 | `saveToPrivateGallery () =>` |
| 5801 | `silentSaveToConceptBoard(url, senderInfo) =>` |
| 5828 | `downloadImage (url) =>` |

## `main.pjs` — leading import block (verbatim)

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

## `index.html` — landmark `<script id>` / `<style id>` blocks

| line | tag | id |
|---|---|---|
| 5 | `script` | `aifg-browser-translation-guard` |
| 9 | `script` | `aifg-performance-bootstrap` |
| 703 | `style` | `aifg-language-css` |
| 1185 | `style` | `aifg-performance-css` |
| 1202 | `style` | `aifg-wallpaper-css` |
| 2471 | `script` | `aifg-wallpaper-system` |
| 3571 | `script` | `aifg-language-system` |
| 5095 | `style` | `aifgIframeLoaderStyles` |
| 6377 | `style` | `adultWaitingRoomShellStyles` |

## `index.html` — HTML section comments

| line | comment |
|---|---|
| 1 | AIFG v2.15 Default Channel Control Correction build |
| 46 | Canonical URL for SEO |
| 50 | Loading screen |
| 131 | Loading screen |
| 186 | Loading screen |
| 235 | Styles for most main buttons and elements |
| 445 | Styles for most main buttons and elements |
| 447 | clickable random banner image |
| 555 | clickable random banner image |
| 574 | Loading screen |
| 584 | Loading screen |
| 656 | Login screen |
| 658 | announcement comment plugin |
| 677 | announcement comment plugin |
| 6376 | Adult Guest Waiting Room shell. Behavior remains in main PJS. |
| 7690 | We use this (advanced): https://perchance.org/user-count-display-guide |
| 14676 | Header Tabs |
| 14680 | Editor |
| 14690 | Buttons |
| 14692 | Link view toggle |
| 14698 | Floating Copy Button |
| 17118 | loadUploader floating panel |

## `index.html` — statistics

- lines: 19507
- `<script>` tags: 42
- `<style>` tags: 21
- `<iframe>` tags: 16
- `<img>` tags: 10
- external stylesheet links: 4

## Where the important systems live

| system | location |
|---|---|
| Plugin imports / generator meta | `main.pjs:8-32` |
| User inputs (`userInputs`), prompt assembly, image options | `main.pjs:~60-...` (`settings.userInputs`, `settings.imageOptions`) |
| Art-style / emoji / banlist data lists | `main.pjs` top-level lists |
| Comment moderation, adult gate, ban notices | `main.pjs:1600-5600` (functions `isUserBannedByFullId`, `handleAdultWaitingRoomComment`, `showAgeVerificationModal`, ...) |
| Header banner rotation (`AIFG_BANNER_SLOTS`) | `index.html:452` |
| Wallpaper engine (built-in pool, previews, gallery, sliders) | `index.html:2480-3000` |
| Language/translation UI | `index.html:3930-4520` |
| Sidebar / floating apps / themed pages | `index.html:13350-15200` |
| Account & settings overlay (accent colour, wallpaper, search) | `index.html:~17400-18600` |
| Comments channels + 18+ lounge wiring | `index.html:14500-14600` |

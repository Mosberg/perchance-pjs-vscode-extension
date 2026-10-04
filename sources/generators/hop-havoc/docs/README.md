# Hop Havoc — Mod (3D Bullet-Bunny-style twin-stick roguelite)

Perchance generator. Twin-stick shooter: WASD move, mouse aim, auto-fire, dash (Shift),
up to 2 selectable perks per level-up. Multiple difficulties, characters, guns, gems,
masters, a HUB shop with meta-progression (saved via kv-plugin), and daily-run vibe.

## Files

- `main.pjs` — perchance imports only:
  - `createServerSocket = {import:server-plugin}`
  - `commentsPlugin = {import:comments-plugin}`
  - `kv = {import:kv-plugin}` (save data)
  - `uploadPlugin = {import:upload-plugin}` (leaderboard archive mirror file)
- `index.html` — screens (menu / hub / game / lb / community), HUD, the
  `<script type="text/x-server-plugin">` leaderboard server, CSS.
- `src/main.js` — all game logic + client-side leaderboard (LB) + community code
  (~4600 lines). Loaded as `<script type="module">`; top-level names are module-scoped,
  exposed for debugging via `window.__BB` (game state `G`) and `window.__BBAPI`.

## Changelog discipline (MANDATORY — read this before changing anything)

**Every change to this generator adds an entry to the `CHANGELOG` array in `src/main.js`**,
in the same edit batch as the change itself, newest first. This is a standing user
requirement, not a nicety: the user reads the changelog to see what changed between visits.

- The list renders in-game. The What's New modal shows it as the last block, BELOW the
  credits (`#pnList` / `pnRender()` in `src/main.js`, styles in
  `index.html` under "Patch notes / changelog"): the newest `PN_OPEN_DEFAULT` entries start
  expanded, each entry toggles open/closed, and SHOW ALL / HIDE OLDER expands the history.
- Entry shape: `{date, tag, title, items}`. `tag` is one of `FIX | RESTORE | FEATURE |
  BALANCE | UX` and drives the chip colour via `.pnTag.<tag>`. `title` is one short line.
  `items` are plain strings (built with `textContent`, never HTML) that say what changed
  AND why, in player-readable language — no internal shorthand, no blame.
- Bump `WHATS_NEW_NOTICE_VERSION` (right above `CHANGELOG`) whenever an entry is added, so
  the notice pops up once per browser and shows the new notes (stored as
  `bb_whats_new_notice_version`).
- Server/layout/data changes ALSO update their section lower in this README. The changelog
  is the player-facing summary; this README is the engineering detail.
- Never rewrite or delete entries that have already SHIPPED (saved/published) — the history is
  the point, and a correction to a shipped entry gets its own new entry.
- EXCEPTION (user requirement): while a change has NOT been saved yet
  (`window.generatorIsUnsaved` is true, i.e. the current edit has never reached players), do
  NOT append a second entry for a follow-up tweak to that same change — edit/rewrite the
  existing in-flight entry in place, and leave `WHATS_NEW_NOTICE_VERSION` alone. Nobody should
  ever see half-shipped intermediate iterations listed as separate patch notes.

## RudBo apex beasts (anthro bipedal)

- Five purchasable HUB heroes, all `biped:true`, built by `buildBeastMesh()` as upright
  humanoid critters (torso/head/2 arms/2 legs, gun in right hand, walk animator swings
  legs+arms). Prices: RAJA (tiger) 5000, MANE (lion) 5500, GRIZZ (bear) 5000, FANG
  (wolf) 4500, FOXY (fox, new) 3500. No longer free — default save owns only
  `pulse,nikki,blink,rooty` (existing saves keep old unlocks).
- Passives: raja +25% dmg/+10% crit + autoSlash (slash nearest enemy every 0.8s);
  mane +100 HP/+20% DR/+20% dmg; grizz +130 HP/+45% dmg + regen (+0.9 HP/s, +0.6 HP
  per orb); fang 2 wolves + wolfDmg 10 + speed; foxy +10 HP + speed 1.2 + a flat 3s
  dash-super cooldown (unlimited uses, unaffected by difficulty).
- Supers: raja ring 300 +450; mane ring 340 +350 + XP magnet; grizz ring 230 +1000 +
  quake aftershock zone (`{kind:'quake'}` in `G.effects`); fang summons 4 temp wolves
  (15s); foxy FOX DASH — a fast VISIBLE slide (260 units over 0.22s along the aim,
  no teleport, stays solid, no fire trail/ring): every enemy swept through takes
  30×dmg-mult and is knocked back hard (kb 260) once each, small dust bursts, 0.32s
  invince, flat 3s cooldown (uses never consumed, `foxDash` flag on `h.dashing`;
  regular perk dash via `tryDash` unchanged). Shared helper `spawnRadiusRing()` +
  `{kind:'ringfx'}`.
- Wolves (`addDog(temp,life)` when char is fang): 4-legged grey model (body/head/snout/
  nose/ears/tail/4 legs), fan out around target at slot angle, flat bite dmg
  `20+wolfFlat`, speed 95+. Non-wolf dog path unchanged.

## Difficulty-based super slots

`DIFF_SUPER` in `beginRun()`: Easy +6 uses / charge ×0.7, Normal +3 / ×0.85, Hard +0 /
×1, Insane −2 / ×1.15, applied to each character's base `superUses`/`superCharge`.

## Insane difficulty tuning (BERSERK is OP-run only)

- `DIFFS.Insane = {sb:0.06, hpMult:1.45, speedMult:1.16, incomingMult:1.28}` — spawn
  cadence bonus, enemy HP multiplier (heavies only; fodder keeps base HP via
  `difficultyHp`), movement-speed multiplier and incoming-damage multiplier. Plus the
  Insane-only `SPAWNS` entries and `BOSS_SPAWNS.Insane`. These are the FULL-pressure
  values: they are what an OP run uses.
- `INSANE_EASE = 0.9` (src/main.js, above the BERSERK constants) with two frozen grids
  beside it — `INSANE_PRESSURE_OP` (the numbers above) and `INSANE_PRESSURE_CLEAN`
  (`sb` 0.054, `hpMult` 1.305, `incomingMult` 1.152). `insanePressure()` picks the grid
  via `opLoadoutEquipped()`, so THE EASE IS CLEAN-ONLY: no OP hero and no OP gun → eased;
  either one → full pressure. Read sites (all guarded with `G.diff==='Insane'`, so every
  other difficulty still reads `DIFFS` directly): `spawnEnemy` (`hpMult`),
  `damageHero` (`incomingMult`), `beginRun` (`G.sb`). Pursuit speed is deliberately NOT
  eased for either side — `1.16 × 0.9 = 1.044` is at/below `Hard.speedMult = 1.05`, and
  Insane must never be as soft as Hard on any axis, so `DIFFS.Insane.speedMult` stays
  `1.16` and `INSANE_CLEAN_SPEED_MULT` stays `1.08`. Retune the clean ease here, not by
  editing the literals.
- `INSANE_CLEAN_SPEED_MULT = 1.08` (src/main.js, beside the BERSERK constants) is the
  Insane chase multiplier used when the loadout has NO OP item. `spawnEnemy` reads
  `1.08` for a clean Insane run and `DIFFS.Insane.speedMult` (1.16) when
  `insaneBerserkEligible()` is true, so the faster pursuit is reserved for the premium
  kits that need the pressure applied to them. `spawnEnemy` is the ONLY place `e.speed`
  is assigned, so that single read is the entire change — HP (`hpMult`/`difficultyHp`),
  `incomingMult`, spawn cadence and Normal (×1.00) / Hard (×1.05) are all untouched, and
  `spawnApexFinalHero` still sets its own speed directly.
- The final-30s BERSERK escalation (two stages) is gated by `insaneBerserkEligible()`
  (`G.char?.op || G.gun?.op`): an OP hero or an OP weapon gets it, a CLEAN / no-OP run
  (neither) gets nothing and keeps a constant pace to 500s. Loadout-based, not saved —
  it is derived from the live `G.char`/`G.gun` at every `insaneBerserkStage()` call.
- Stages: `INSANE_BERSERK_START` = `WIN_TIME-30` (470s) → enemy speed ×1.08, spawn
  cadence ×0.78, `+1` enemy every 4th wave of a spawner; `INSANE_FINAL_BERSERK_START` =
  `WIN_TIME-10` (490s) → speed ×1.18, cadence ×0.58, `+1` every 2nd wave. Both add a
  `banner()` + `G.shake`, pull late spawner timers forward (max 1.5s / 0.8s) so the
  surge is felt immediately, and drive the `#difficultyHud.berserk` /
  `.finalBerserk` pulse plus the `BERSERK` / `FINAL BERSERK` `#timePanel .sub` label.
  `insaneBerserkSpeedMult()` multiplies `e.speed` in `updateEnemies` (chase, briar,
  wraith sweep, laser reposition) and the arena-return walk.
- The run-start pressure notices are GENERATED, never hand-written:
  `pressureNoticeLine(DRAGON_CHAOS_PRESSURE | OP_STACK_PRESSURE)` and
  `insaneGridNoticeLine(INSANE_PRESSURE_OP | _CLEAN)` build their numbers from the same
  constants the arena reads (`fmtMult`, `pressurePct`, `berserkSurgeTail`), so a tuning
  pass can never leave a broadcast describing a run the player is not in. `beginRun`'s
  notice chain covers all four premium/Insane cases: dragon chaos, opStack, Insane with
  exactly one OP item (full-pressure grid + BERSERK surge), and clean Insane (eased grid
  + `INSANE_CLEAN_SPEED_MULT`, no surge). The surge tail is printed only when
  `G.diff==='Insane' && insaneBerserkEligible()` (the stacks themselves apply on every
  difficulty, e.g. BAHAMUT on Easy), so keep `berserkSurgeTail` as the single source of
  that wording. If the timings change, they change in the constants and the notices
  follow automatically — do not reintroduce literals here. `__BBAPI` exports
  `pressureNoticeLine`, `insaneGridNoticeLine`, `berserkSurgeTail`, both pressure objects
  and both Insane grids, so the exact broadcast text for any loadout can be checked in a
  `page_eval` without launching a run.
- Do NOT ungate this (an earlier revision ran it for every Insane run — including
  CLEAN — and it was reverted by request). `G.testMode` returns stage 0, so training
  and the test arena never show the surge; to exercise it, launch a non-test run with
  an OP hero or OP gun and drive `G.time` past 470.

## Auto-translate (UI)

- `initAutoTranslate()` (src/main.js, before Boot) + `#langSelect` on the menu screen.
  Google translate endpoint with MyMemory fallback, per-language localStorage cache
  (`bb_ui_translation_cache_v1`, keyed `bb_ui_language_v1`), concurrency 2, retry
  once, 15s pause after 6 failures. DOM-walk of visible `.screen` containers +
  MutationObservers (added nodes + hidden→visible transitions). `data-no-translate`
  marks names (`.cname` in customize/HUB cards), `#hud`/`#lbTable`/`#commentWrap`
  excluded. Language switch restores English sources then rescans (`bbSetLanguage`).
  Test via `window.__BBAPI.bbSetLanguage('es')`.

## Score, credits & rank (normalization model)

- Live score gain inside a run is deliberately UNTOUCHED (`G.score += dt*G.mult`, kill/orb/
  milestone/boss awards, `awardSurvivalClear()`), so perk feedback and the HUD keep their
  existing feel. Normalization happens ONCE at the end of the run:
  `settleRunScoreAndCredits()` (src/main.js ~12997) is called by `showEndScreen()` before the
  end screen paints, and rewrites `G.score` + sets `G.runCredits`; it is idempotent via
  `G.scoreSettled`/`G.scoreBreakdown`. Those settled values are what the end screen shows,
  what `bankRunGold()` pays and what `lbSubmitRun()` submits — so HUD shows the raw score
  during play and the normalized score on the result screen.
- `SCORE_BALANCE` (top of src/main.js) is the single source of truth:
  `difficulty.{Easy 0.85/0.85, Normal 1.00/1.00, Hard 1.30/1.20, Insane 1.70/1.45}`
  (score/credit multipliers), `speed:{fullAt:600, zeroAt:900, curve:1.25}`, and
  `ending.{survival {paceBonus 0, flatScore 0, speedCredits 0}, dragon {1.00, 12000, 1200},
  apex7 {1.10, 15000, 1600}}`.
- `finalScore = clamp(round((raw * paceMult + flatSpeedScore) * diff.score), 0, SCORE_MAX)`
  where `paceMult = 1 + paceBonus*speedFactor` and `speedFactor = ((zeroAt-time)/(zeroAt-fullAt))
  ^ curve` clamped to 0..1. `finalCredits = round(gold/3 * diff.credits) + speedCredits`.
  Pace/flat bonuses are paid only on a WIN (`survival` ending has none), and the hard deadline
  stays 999s: full reward at <=600s, tapering to zero at 900s.
- `renderEndScoreBreakdown()` fills `#endScoreBreak` from `G.scoreBreakdown`
  (RAW SCORE -> PACE -> SPEED BONUS -> PRE-DIFFICULTY -> FINAL SCORE, then BASE/SPEED/FINAL CR);
  it is hidden for training/debug runs.
- Measured by driving `__BBAPI.winGame()` with synthetic runs: Insane, raw 150,000 =
  **532,100** for a 600s BAHAMUT clear vs **255,850** at 900s+ (no pace reward); APEX SEVEN
  clear = 562,785; the same raw on Easy = 127,925. A monster 600k raw Insane clear = 2,062,100.
  So difficulty weighting and the speed reward dominate farming, which was the point.
- Consequence for the archive: final scores can legitimately exceed 999,999, so they can land
  in the histogram's aggregated top bin. That only coarsens the rank ESTIMATE for those runs;
  the stored score is exact and the board ordering is exact.

## Leaderboard (server-plugin)

- Server: `index.html` `<script type="text/x-server-plugin">`. Durable binary state
  (`lb`), 12 boards = 4 difficulties (Easy/Normal/Hard/Insane) x 3 tiers
  (0 clean / 1 cheat / 2 OP), **200 entries each**, 72-byte fixed entry. Server
  `VERSION = 4`. RPCs: `submit`
  (rate-limited 10/min/conn, 60/hr/network) and `getBoard`. Client subscribes via
  `\u0000SUB:lb:N`; server publishes `lb:N` on change.
- **`VERSION` tracks the ARCHIVE BYTE LAYOUT ONLY — never the scoring rules, and a
  mismatch is MIGRATED, never wiped.** A score is still a u32 at record offset +16 and a
  record is still 72 bytes, so rebalancing how runs are scored must not touch this
  constant. `initState()` returns early when `state[0] === VERSION` (so an existing
  archive loads byte-for-byte untouched), and otherwise migrates: `3 -> 4` via
  `migrateV3()` (old 200-entry/100-bin layout, records copied, bins split 1:10),
  `5 -> 4` via `migrateCoarse5()` (the accidental 10k-wide-bin variant: bins expanded
  back 1:10, mass past the fine range aggregates into the top bin). Only a genuinely
  unreadable version byte is a bug to fix, never a reason to wipe: it FREEZES the archive.
  Both paths preserve every retained run, lifetime totals and histogram mass.
  **An UNRECOGNISED version byte now FREEZES the archive instead of zero-filling it**
  (`archiveFrozen = true`, `console.error`, every byte left untouched): `submit` throws
  `archive-frozen`, `getBoard` returns a single `0xf0` byte, and the next connection is
  sent the marker text `\u0000LB-FROZEN` so the client shows a "leaderboard offline" state.
  This is the guard against ever repeating the incident described below.
  Verified offline by evaluating the server script with a stubbed `state`/`self`/`pubsub`
  (virgin boot -> v4; v4 reboot -> byte-identical, firstDiff -1; v5 -> migrate;
  v6/unknown -> zero bytes changed, submit rejected, 0xf0 reply).
- Histogram: 1000 bins x `HIST_WIDTH = 1000` (`histIndex()` clamps), so scores at/above
  999,000 aggregate into the top bin — `lbEstimateRank` then reports `~#1` for them.
  `MAX_SCORE = 9999999` is a validation bound only (a record's score field is a u32),
  which is what lets the normalized score scale exceed 1M without any layout change.
- The client's `LB_HIST_BINS` / `LB_HIST_WIDTH` / `LB_PROTO_VERSION` in `src/main.js`
  must stay equal to the server's `HIST_BINS` / `HIST_WIDTH` / `VERSION`; the reply header
  is `34 + HIST_BINS*4` bytes and `lbHandleBoard` rejects a reply whose `histBins` differs.
  Byte-level round-trip checked: an 81-byte client payload (proto 4, UTF-8 name tail)
  parses to the expected record and comes back as a 4106-byte board reply.
- **Every run is recorded as its own entry** — there is no per-player overwrite of a
  "personal best". A run is dropped only when its board is full (200) and its score
  can't displace the worst entry. `sortBoard` ranks by score desc (then time asc,
  kills desc) reading the score at entry offset +16 — the off-by-16 that previously
  sorted by token bytes is fixed.
- Client (`src/main.js`): `LB` object + `lbConnect/lbOpen/lbRefresh/lbSubmitRun/
  lbHandleBoard/lbRender/lbBuildSubmit/lbSendSubmit`. Identity = random 16-hex token
  stored in `localStorage bb_lb_token_v1` (lets the UI highlight YOUR entries and
  show "YOUR BEST" = your highest-ranked run across reloads without an account).
  Display name in `bb_lb_name_v1`. `myRank` is the FIRST token match (best run);
  `lbHandleBoard` keeps the first match (`myRank === 0` guard). Protocol version byte
  is `LB_PROTO_VERSION = 4` — must match the server's `VERSION` or every submit is
  rejected (`invalid-submit`) while the name still saves client-side.
- Tier split (`lbTier()`): `G.cheated` -> 1 (debug GRANT/quick-test tools, shows
  "CHEAT MODE" banner; RudBo credit codes are bank-only and do NOT flag). A run using
  an OP character (the 5 apex beasts) or an OP gun (missile/rocket/grenade) -> 2,
  ranked on the separate "OP" boards. Otherwise 0 (clean). The LB UI has a 3-way
  CLEAN/CHEAT/OP filter and shows a red "OP" badge on owned OP cards.
- Security model: no passwords/accounts. Names sanitized server-side (strips
  `<>&\``), length-capped, server validates score/time bounds. Honest caveat: a
  client-side game can't be truly anti-cheat — that's why there are separate boards.

## Ranked vs sandbox runs, and owner cleanup ("hide my own runs")

Added 2026-09-16: the `__BBAPI` test harness could call `beginRun()`, which used to be
indistinguishable from a real launch, so driver-started runs were RANKED and posted to the
live boards under the owner's own token.

- **One place declares a rankable run**: `startRunWithOrientation(ev)` (only callers:
  `#startBtn`, `#customGoBtn`, the end-screen retry button — all pass the click event) sets
  `G._rankIntent = true` immediately before `beginRun()`, which consumes it into
  `G.rankedRun = rankIntent && !G._launchTest`. Training
  (`startTestModeWithOrientation`, `resetTestArena`) and the rotate-cancel handler clear it.
- **Only a trusted click can make a run rankable**: the same function clears
  `G.harnessTouched` when `ev.isTrusted` is true, and *marks* it when the click was scripted
  (`isTrusted === false`, e.g. `el.click()` from the tooling). `beginRun()` deliberately does
  NOT reset that flag, so a scripted press of PLAY cannot launder a run back into the
  ranking. Real input always reports `isTrusted`, so a normal player is unaffected even after
  a tool has inspected the page — and if the property is ever missing the flag is left alone
  rather than cleared.
- `G.harnessTouched` is set by every function-valued export on `window.__BBAPI` (the
  wrapper at the bottom of `src/main.js`; for `beginRun` it is set *before* the call and
  `G.rankedRun`/`G._rankIntent` are forced to `false` around it), so even the first
  harness-driven run is sandbox
  from frame one. **`runIsRankable()` = `G.rankedRun && !G.harnessTouched && !G.testMode &&
  !G.debugInvalidated` must gate every reward and every write**: `lbSubmitRun`,
  `submitEndLeaderboard`, `bankRunGold`, `renderEndScoreBreakdown`, `updateEndRank`,
  `winGame`'s `unlockBahamut`, and `communityRecordEnd`. `#testHudBadge` shows
  `TRAINING · FAKE` / `SANDBOX · NOT RANKED` whenever `G.hero && !runIsRankable()`.
- **Owner cleanup RPC**: `withdrawMine` (server) + `lbWithdrawMineOnBoards` /
  `lbWithdrawRows` / `lbWithdrawRequestBuffer` / `lbOwnerHide` (client, OWNER TOOLS button
  in the leaderboard panel). Payload: `[0xce][token:16][count:u16le][pwLen:u8][password]`
  then per row `[board:u8][day:u16le][score:u32le][kills:u16le][time:u16le][level:u16le]
  [charLen][charId][gunLen][gunId]`; reply `"withdrawn:<n>"`. Both sides must stay in
  lockstep.
- A withdrawn row sets `REC_WITHDRAWN = 0x10` in its meta byte and is filtered out of every
  paged reply by `visibleIndex()`. It is **never deleted**: slot, lifetime totals, histogram
  and duplicate signature all stay, so `storedCount` never shrinks (the crowd-restore path
  compares counts, and a shrinking count can look like a wipe) and a browser that still
  holds the row can never get it re-accepted. Matching requires the caller's token **and
  every run field**, so even a leaked token cannot touch another player's runs or bulk-wipe
  a board. `withdrawRow()` is the single matcher.
- **Only the password's SHA-256** (`WITHDRAW_PW_SHA256`) is in the public server script,
  checked with a synchronous pure-JS `sha256HexBytes()` (server handlers have no
  `crypto.subtle`). The password itself is typed into the modal at runtime, never
  persisted, never in the source; `WITHDRAW_HITS_PER_MIN = 4` rate-limits attempts.
- The owner's own browser must also forget a hidden run: `lbForgetLocalRuns()` drops the
  matching `LB.myBest` entry and `LB_SEEN` row, or the contribution path would keep
  re-offering it from the owner's own local mirror.
- **Withdrawals only exist on the real archive**: while the editor holds unsaved changes the
  plugin serves a temporary in-tab emulator (its "click save" bubble), so the RPC becomes
  reachable only after the generator is saved. Testing the round trip against the emulator
  works fine, and is how it was verified (submit 3 rows -> `withdrawn:2` -> page count
  3 -> 1 with `storedCount` still 3 -> wrong password rejected with `bad-password`).
- **OPEN ITEM — 2026-09-16 harness rows on the LIVE boards (day `unixDays 20712`).** Before
  the trusted-click gate existed, agent-driven `beginRun()` calls did post to the real
  archive: a read of the live boards on 2026-09-16 found **56 rows under the owner token**
  (`10b4e86594e2463d`, name `RudBo`) all stamped day 20712 — board 3 x4, board 9 x48,
  board 11 x4 (e.g. `1146543`, `606710`, `8765`, plus a sweep of 7-108 s runs on board 9).
  The owner's three genuine rows are untouched and still live: board 2 `47990` (d20710),
  board 5 `2134` (d20704), board 8 `17040` (d20708). The deployed server does **not** have
  `withdrawMine` yet — calling it returns `server has no RPC method 'withdrawMine'` — so the
  rows cannot be hidden until the generator is saved once. After a save: LEADERBOARD ->
  OWNER TOOLS -> password -> scope `TODAY ONLY · ALL BOARDS` -> HIDE MY RUNS.
- The local pollution that made those rows visible in the preview lives in
  `bb_lb_seenrows_v1` (JSON array of every row this browser has seen; day field `unixDays`)
  and `bb_lb_mybest_v1`. `bb_lb_seenrows_v1` is not a cache: `lbSeenAdd` feeds the
  crowd-restore offer, so a harness row kept there can be pushed back into the archive after
  a wipe — it has to be refused at the source, not just deleted once. `LB_SEEN_DROP` /
  `lbSeenRefused` (src/main.js) now refuse the whole 2026-09-16 owner-token day bucket
  (keeping board 9 score `583`, the owner's one real run) both on `lbSeenLoad` — which
  rewrites the stored array immediately when it drops anything — and on every `lbSeenAdd`,
  so an old read of the live boards can never refill the ledger. `bb_lb_mybest_v1` was
  cleaned in place the same day (keys 2/5/8 plus the genuine board-9 run). Removed rows are
  kept in `bb_lb_purged_backup_v1` (nothing reads that key). Verified 2026-09-16: 124 stored
  rows drop to 75 on the first load of the new build and stay there across reloads.
- To READ the live boards from the preview without writing anything: make
  `generatorIsUnsaved` a read-only `false` (so the plugin opens the real socket and mints an
  embed token) and patch `WebSocket.prototype.send` to drop every RPC frame whose method
  matches `submit|contributeRuns|restore.*|ownerReport|community.*`; then `lbConnect()` +
  `lbRefresh(true)` and read `LB.cache`. Without that frame filter the client will happily
  crowd-restore local rows into production.



Context: the pre-2026-09-16 history was lost to a `state.fill(0)` fallback in
`initState()` when `VERSION` was bumped without a migrator (a layout bump used to make the
old archive unreadable). That fallback is gone (frozen guard above), and three features were
added so a wipe can at least be *recovered from* next time. The only change actually
requested at the time was a rebalance of the win/pace score bonus, which is pure client-side
arithmetic (`SCORE_BALANCE`) and never needed a layout bump at all — the bump came from the
histogram bin-width change that went with the new score scale, and because no migrator
existed for it the whole 50 MiB buffer was zero-filled, taking the HUB social-proof
counters (same buffer, 4 KB tail) down with it. Two lessons are encoded below: a layout
version is migrated or frozen, never wiped; and nothing outside the archive region may be
zero-filled by any boot path.

- **Server-side restore RPCs** (all in the `self.rpc` block): `restoreBegin`,
  `restoreRows` (base64 row blocks), `restoreStats`, `restoreFinish`. Guards:
  `RESTORE_MAX_EXISTING = 200` (refuses to clobber a populated archive:
  `archive-not-empty`), `RESTORE_MAX_ROWS = 20000`, `RESTORE_MAX_BLOCKS = 200`,
  `RESTORE_ROWS_PER_BLOCK = 256`, `RESTORE_SESSION_MS = 300000`, rate limit 10/hour per
  connection (`conn.net[2]`). One generator-wide `restoreSession` at a time. Each row is
  validated (`restoreRowValid`: non-zero token, score <= `MAX_SCORE`, time <= `MAX_TIME`,
  plausible date, known hero/gun code, sane token) — invalid rows are counted and dropped.
  A durable "restore happened" flag lives in archive header **byte 1** (previously unused),
  so a second restore is refused with `already-restored` even across reboots.
  Trust tradeoff: the backup file's `editKey` travels in the file itself, so a hostile
  client can push *validated* rows into a near-empty archive — the same trust level as
  `submit`, and only into an archive that is already effectively wiped.
- **Client periodic mirror** (`src/main.js`, module block "Archive backup + restore"):
  `lbBuildBackupSnapshot()` serialises every board (up to `LB_BACKUP_ROWS_PER_BOARD = 600`
  rows/board) plus the 12 lifetime stat blobs into one editable text file,
  `LB_BACKUP_NAME = 'hop-havoc-mod-lb-backup-1'`, via `root.uploadPlugin.editable`.
  Text format (`LB_BACKUP_MAGIC = 'HHMODLB1'`): `HHMODLB1 <gen> <at> 4`, optional
  `K <editKey>`, `ROWS <board> <n> <base64 of n*72 bytes>`, `STATS <base64 of 12*4008>`.
  Throttled by `lbBackupMaybe()` to once per `LB_BACKUP_MIN_INTERVAL = 30 min` AND only
  when the archive signature changed; `LB.backupBusy` latches re-entry.
- **Client self-heal** (`lbTryRestore()`): called from `lbOpen` and at the end of
  `lbHandleBoard`. Skipped when the archive is frozen, already restored, busy, blocked, the
  socket isn't open, or `root.uploadPlugin.editable` is absent. Fetches the backup file,
  parses it, and replays rows/stats through the restore RPCs. Only fires when the observed
  archive is (near-)empty (`globalActive <= LB_RESTORE_MAX_EXISTING = 200`) and gates a
  retry with `meta.restoreAt` + `LB_RESTORE_RETRY_MS = 90s`. On success it sets
  `LB.restoreNote` (rendered in `#lbStatusLine` as the gold `lbAlert` line, e.g.
  "ARCHIVE RESTORED FROM LOCAL BACKUP · 18 RUNS"). Failures are deliberately allowed to
  `console.warn` only (`LB.restoreBlocked`) so an undeployed server doesn't show a scary UI.
- `window.__BBAPI` exposes `lbBuildBackupSnapshot, lbUploadBackup, lbTryRestore,
  lbBackupMaybe, lbParseBackupText, lbAllBoards` for testing.

## Local contribution (crowd restore)

A single mirror file is still a single point of failure, so the archive is also rebuilt
*from the players themselves*: every browser keeps the board rows it has seen, and offers
them back when the server looks wiped.

- **Client memory** (`src/main.js`, module block "Local contribution (crowd restore)":
  `LB_SEEN_KEY = 'bb_lb_seenrows_v1'`): `lbHandleBoard` calls `lbSeenAdd(b, page)` for every
  board reply, so this browser accumulates every row it has ever seen (its own and other
  players'), deduped by `lbSeenKey = board|token|score|time|kills`, bounded to
  `LB_SEEN_MAX_ROWS = 2500` (oldest dropped), persisted with a `LB_CONTRIB_SAVE_MS = 6000`
  debounce. This is separate from `LB.myBest` (`bb_lb_mybest_v1`), which is only this
  player's own best run per board.
- **Offering them back** (`lbContributeMaybe(force)`, called from `lbOpen`, from
  `lbHandleBoard` right after `lbTryRestore`, and on socket open):
  builds `lbCollectMyBestRuns()` (own bests, always re-offered so a wipe can re-seed them;
  tier-1 boards skipped) plus unsent `LB_SEEN` rows, encodes them with `lbContributionBlock`
  and sends them in `LB_CONTRIB_BATCH = 64`-run chunks with 150 ms gaps via the
  `contributeRuns` RPC. Gated on: socket open, a cached board reply (so the archive's real
  size is known), not frozen/blocked, `globalActive <= LB_CONTRIB_MAX_ACTIVE = 20000`
  (a healthy archive is not writable this way), and `meta.contribAt` throttled to
  `LB_CONTRIB_RETRY_MS = 120s` unless forced. `LB_CONTRIB_PASS_MAX = 1500` rows per pass.
- **Per-board gate — the important part**: a seen row is only offered when
  `LB.cache[r.b].storedCount < localByBoard[r.b]`, i.e. the server holds *fewer* rows for that
  board than this browser does. On a healthy archive every board already has at least as
  many, so a client uploads **nothing**; after a wipe (`storedCount` 0) it offers everything
  it kept. So this is not a background uploader — it only ever acts when it can see that the
  server is missing data.
- **Fresh-wipe detection**: if `meta.lastActive >= 500` but the observed `globalActive < 200`,
  the live row count collapsed from a real archive, so every `sent` flag in `bb_lb_seenrows_v1`
  is cleared and all rows are offered again (a client that already contributed once would
  otherwise never re-offer).
- **Block format** (`contributeRuns`, server side): `[0xCB][count:u16le]` then
  `count × [days:u16le][len:u16le][payload]`, where `payload` is an ordinary `submit`
  payload. Days is the real day the run was set (`lbRunDay` uses `unixDays` when it is in
  19000..40000, else 0 = "stamp today"), so a rebuilt archive keeps true dates.
- **Server side** (`index.html`, "ARCHIVE CONTRIBUTION (crowd restore)" block):
  `CONTRIB_MAX_ACTIVE = 20000`, `CONTRIB_RUNS_PER_BLOCK = 128`, `CONTRIB_BLOCK_MAGIC = 0xCB`,
  `CONTRIB_HITS_PER_HOUR = 240` (per connection network). Every run goes through the
  *existing* `parseSubmit` — identical tier/hero/gun/token/name validation to `submit` — the
  day is resolved before writing (so the dedup signature matches the stored row), exact
  duplicates are skipped via a lazily-built per-board signature set
  (`contribSigSet`/`contribInvalidate`, invalidated by `submit`, `restoreFinish` and
  `pruneGlobalIfNeeded`), and `recordBoardStat` runs **before** `allocateSlot()`/`writeRecord`/
  `insertIndex` (same order as `submit` — reversing it double-counts board totals through
  `seedStatsFromRetained`). Throws `archive-frozen`, `restore-in-progress` (a live restore
  session wins), `bad-contribution`, `contribute-rate-limited`, `archive-healthy` (when
  `archiveRowCount(CONTRIB_MAX_ACTIVE) > 20000`). Returns `"added:duplicate:invalid"`.
- **Trust note**: identical surface to `submit` — the payload is re-validated and the row
  rebuilt server-side, duplicates are skipped, and it only applies while the archive is
  still small, so it adds no new attack surface. A hostile client can no more forge a run
  here than it could by calling `submit`.
- `window.__BBAPI` exposes `lbContributeMaybe, lbSeenAdd, lbCollectMyBestRuns, lbRunFromSeen`
  (and `lbBuildRunPayload`) for testing.

## Owner registry (HUB "N OWN IT", rebuilt from the players)

The HUB shop social-proof numbers are OWNERSHIP counters (who bought each permanent item),
and they were the one casualty of the 2026-09-16 wipe with **no local copy anywhere**:
`COMMUNITY.{delta,local}` in `src/main.js` is in-memory only, never persisted, and re-read
from the server on every load — so after the shared 50 MiB buffer was zero-filled every
browser simply re-read zeros. Unlike runs, there was nothing to hand back. Production still
shows this: every `own:*` key reads delta `0` (`clear:*` keys hold 6/2/1/1, i.e. those were
rebuilt by ordinary play).

`clear:*` deltas are the wrong tool for this anyway — nobody cached them. What every browser
DOES have is its own save, which says exactly which items it owns, so the counts are now
rebuilt from the players themselves, exactly like the crowd restore:

- **Server** (`index.html`): an OWNER REGISTRY in the ~3.1 MB of state *between* the archive
  pool and the community tail that no layout version ever used — so **no VERSION bump and no
  archive change**; existing archives load byte-for-byte and only this unused region is
  written. `OWNER_OFF = COMM_OFF - OWNER_BYTES` (52,424,704 - 524,288 = 51,900,416), well
  above the pool end (49,283,050); layout is `[magic u32][39 x u32 count][39 x 1600 x 8-byte
  token hash]` = 499,360 bytes. `OWNER_FEATURE_ON` is false (and every write is skipped) if
  the region would ever overlap the pool.
- **Counting rule**: a client reports the keys it owns; the server stores the 8-byte hash
  (`commHashA`/`commHashB`) of the reporting **token** per key and the count IS the number of
  occupied slots — so it counts DISTINCT PLAYERS, re-reports are free, and a full key (1600
  tokens) freezes instead of over-counting. Keys travel as STRINGS on the wire
  (`[0xcf][token:16][count:u16le]` then `count x [len:u8][key bytes]`), so the two scripts
  need no shared key ordering.
- **RPC**: `ownerReport`. Guards `archive-frozen`, `owner-registry-off`, `bad-owner-report`
  (bad token / bad length), `owner-rate-limited` (`OWNER_HITS_PER_HOUR = 120` per
  `conn.net[2]`). Same trust level as `communityEvent` — a client claiming it bought
  something — so no new attack surface. Publishes `community` when something was added.
- **`communityGet` rows**: `[key, delta]` as before, or `[key, delta, 1, owners]` when the key
  is registry-backed. Slot 1 keeps the legacy delta so an **already-open older client reads
  exactly what it always did** (no overcount); the `1` marks kind, slot 3 is the rebuilt
  owner count.
- **Client** (`src/main.js`): `communityOwnershipKeys()` derives the owned key list from
  `HUB_SHOP` itself (only purchasable items exist there, and the server ignores unknown
  keys), `ownerReportBlock()`, and `communityReportOwnership()` — fired from `lbConnect`'s
  open handler and from `buyHubItem`, skipped when the owned-key signature is unchanged
  (`COMMUNITY.ownerSent` resets on socket close so reconnects re-report for free).
  `communityCount()` renders a registry-backed key as
  `baseline + max(legacyDelta, owners, own) + local` (the legacy delta being the registry
  row's slot-1 tail, or `COMMUNITY.delta` for keys without one). The baseline is only the standing-in
  estimate for owners we can never identify, and **every real owner we can identify adds +1
  on top of it** — either the server's rebuilt distinct-owner count, or this browser's own
  ownership (`communityOwnsKey()`: owning an item proves a past purchase, so a player is
  counted in their own view even before or without a server round-trip — `own` is applied
  whether or not the registry row has arrived, so the badge never shows baseline-only for an
  item you own while the first `communityGet` is in flight). `max`, never a sum,
  so a purchase that also produced a report cannot be counted twice; the result is monotonic
  and never below what the legacy delta model showed.
- **The rule, stated plainly**: an item with baseline B and N distinct known owners displays
  `B + N`. So if 30 players owned an item before the wipe and 15 of them load the page
  afterwards, the count comes back up by 15 (all 30 visiting would add all 30). It counts
  owners we can actually observe — nobody stored the old delta, so the visitors ARE the
  evidence — and it climbs as more owners load the page.
- **Verified live (this scenario exactly)**: 15 distinct tokens reported
  `own:heroes:bahamut` (baseline 4) -> `communityGet` returned
  `["own:heroes:bahamut",0,1,15]` and the HUB displayed `19 OWN IT`; a 16th visitor -> `20`.
  `own:heroes:mag` (baseline 15) tracked `15 + N` the same way, and repeat reports from the
  same token are free (count unchanged).
- **One-time clear on deploy (`OWNER_MAGIC = 0x32574e4f`, "OWN2")**: the verification above
  was run against the *live* server while `generatorIsUnsaved` still read `false`, so the
  deployed registry ended up holding those ~15 synthetic tokens on all 39 keys (production
  read back a suspiciously uniform `15` per key, `16` on bahamut). Bumping the magic makes
  `initOwnerRegistry()` zero the whole registry region exactly once on the next boot, then
  re-stamp - no RPC, no new attack surface, no archive change, and it cannot repeat (a second
  boot sees OWN2 and keeps the data). Counts therefore dip to the baseline and rebuild from
  real visitors, which is safe because **every owner re-reports on every page load**
  (`communityReportOwnership` runs on socket open and `COMMUNITY.ownerSent` is per-load
  state) - so a real owner only has to load the page once to be counted again.
  Verified with `scratch/own_reset_test.js` (offline harness over the current server script):
  an old-magic registry seeded with 15 stale counts/token-slots -> counts `0`, all slots
  zeroed, magic OWN2, and the stale token re-reports as `owner:1:0:0` (added, not a dup);
  dedup still works (`0:1:0`); two real visitors -> count `2`; a reboot keeps the count
  (`2` -> `2`, third visitor -> `3`); and the pool region of a real v4 archive
  (`scratch/lb_v4_seeded.bin`) is byte-identical across the clear plus a report.
- Cosmetic: the HUB counter span is `white-space:nowrap`, so the green badge wraps as
  `OWNED ✓ ·` / `👥 N OWN IT` instead of breaking between "OWN" and "IT".
- Verified offline with the stub harness: virgin boot -> registry magic; 3 keys from token A
  -> `owner:3:0:0`; same token again -> `0:3:0` (counts unchanged); a second token sharing a
  key -> only the new key added; unknown key counted `bad`; bad token rejected; rate limit
  trips at 120; counts survive a reboot; a real v4 archive's pool region is byte-identical
  after a boot plus reports; an unknown version byte still freezes (pool untouched).
  `migrateV3()` was also fixed to lift the community tail and the owner registry out and put
  them back around its `state.fill(0)` (checked: a v3 boot into a tail with delta 7 keeps
  `7`, and a registry count of 3 survives). Live: the HUB renders `OWNED ✓ · 👥 16 OWN IT`
  (baseline 15 + the player's own verified ownership), and buying a key steps `10 -> 11` and
  stays at 11 after the report lands.
- `window.__BBAPI` exposes `communityReportOwnership, communityOwnershipKeys` for testing.

## Operational gotchas (learned the hard way)

- **Any UNSAVED workspace edit makes `window.generatorIsUnsaved === true`, and
  `root.createServerSocket()` then returns the in-document QuickJS emulator
  (`EmulatedServerSocket`), NOT production.** The live preview stops talking to the real
  archive while you're editing. To query *production* from the preview, temporarily force
  the flag: `Object.defineProperty(window,'generatorIsUnsaved',{value:false,writable:true,
  configurable:true})`, call `root.createServerSocket()`, then restore the flag and
  `LB.socket`. The emulator does run your *edited* server script, which is how server
  changes are tested pre-save.
- **`root.uploadPlugin.editable.set` refuses while the generator is unsaved** — it resolves
  `{error:'editable_requires_saved_generator'}` (it does not throw), and `editable.get`
  returns `null` for a missing file. So the backup mirror only starts working after the
  user SAVES (which is also what deploys the frozen-guard + restore server code).
  `editable.get` is a non-writable property; to stub it for tests, replace `root.uploadPlugin`
  wholesale.
- **Offline server harness**: extract the `<script type="text/x-server-plugin">` body and
  `eval` it in `execute_js` with a fake `self` (capturing `self.rpc`/`self.onopen`) and a
  50 MiB `state = new Uint8Array(...)`, then call the RPCs directly. This is how the
  migration/freeze/restore/contribution matrix above was verified without touching
  production.
- **`contributeRuns` only exists once the new server script is SAVED.** Against the
  currently-deployed server the RPC is unknown, so `lbContributeMaybe` latches
  `LB.contribBlocked` (reset on the next socket connect) and `console.warn`s; the
  contribution therefore stays a silent no-op until the user saves.

## RudBo OP arsenal (beasts + 4 OP guns)

- The 5 apex beasts (raja/mane/grizz/fang/foxy) are flagged `op:true` and rank on the
  OP leaderboard tier.
- New HUB guns, all `op:true` (ranked OP tier), bought with credits:
  - MISSILE LAUNCHER (4500 CR): homing missiles lock the nearest enemy, blastR 46,
    explode on expiry.
  - ROCKET LAUNCHER (4000 CR): slow heavy rocket, blastR 72, big knockback,
    explode on expiry.
  - GRENADE LAUNCHER (4000 CR): lobbed arc (vy 90, gravity 170), explodes into
    3 cluster minis (16 dmg, blastR 26) via `bulletBoom()`/`spawnCluster()`.
  - WILD-FOX (4000 CR): the fox's signature rifle — `special:['long','bounce']`,
    dmg 18, ammo 12, fire 0.35, crit 15%, speed 900, life 0.9s (≈810-unit reach),
    ricochets off walls (`bounce:999`). Picking FOXY (or starting a run with her
    without a gun chosen) auto-equips it via `grantVulpine()` (`G.sel.gunPicked`
    remembers a deliberate gun pick).
- Mechanics: `fireBullet` bullets carry `homing/vy/y/blastR/cluster/expireExplode`;
  `updateBullets` steers homing, applies arc gravity + explode-on-landing, and
  expires into `bulletBoom(b)`. Plasma rifle & bolt beam were deliberately skipped —
  redundant with the existing VOID RIFLE/ZNEEKE and BUGSY'S ZAPPER.

## Ricochet knockback rule (bounced shoves never pull enemies onto the hero)

- Bug reported 2026-09-16 (BB-NOZIA "blasts enemies towards you"): a ricochet returns
  toward the hero, and `updateBullets` takes both the contact shove (`dirx/dirz = b.dx/b.dz`)
  and the explosion push (radial from the contact point, i.e. the near edge of the target)
  from that travel vector, so a homeward shell shoved its target straight at the player -
  systematically, not randomly. Measured pre-fix: shell fired at the hero, enemy hit at
  z=120 → `kbz = -190` (playerward); same shot fired outward → `+190`.
- Fix: `outwardFromHero(e)` / `shoveAwayFromHero(e,dirx,dirz)` in `src/main.js` (defined just
  above `damageEnemy`). Bullets track `b.bounced` (set in the wall-bounce branch);
  `damageEnemy` and `explodeDamage` accept `opts.awayFromHero`, which swaps in the
  hero→enemy outward unit vector whenever the incoming direction has a negative dot product
  with it. Magnitude is unchanged (both vectors are unit length).
- Wired only to bounced projectiles (`awayFromHero: !!b.bounced`): straight shots, hero
  supers, melee/bash knockback, `damageEnemy` callers that omit the flag, and GRAVITY MAUL's
  intentional pull are untouched. The Gravity Maul / thrower pull paths write `e.kbx` directly
  and are unaffected.
- Do NOT "fix" this by removing knockback from ricochets - the rule is direction only.

## BB-NOZIA held charge (sustained auto fire IS the charged state)

- `bouncecannon` (BB-NOZIA) is the only gun with a held charge. Three lines own the mechanic:
  `updateHero`'s firing branch ramps `h.bounceCharge` by `(dt/0.75)*1.5` while fire is held
  (×1 → ×2.5 over 750ms), its else branch snaps the charge back to `1` when fire is released,
  and `fireShot` reads `clamp(h.bounceCharge,1,2.5)` per projectile and does NOT reset it.
- RULE: firing must never spend the charge. Spending it per shot (the old behaviour) capped a
  held burst at ×2 and made the first shell of every burst look different from the rest, which
  players reported as a bug ("charged only once?"). The only thing that gives up the charge is
  releasing fire.
- The fire interval is untouched by the charge: `tryFire`'s cadence gate is the single place the
  interval is computed and the charge is not part of it. Charged shells come out at the normal
  rate - an explicit user decision ("hold should charge but auto fire ... same even interval").
- Scaling at charge `c` with `t = (c-1)/1.5`: direct damage ×(1+0.65t); explosion damage reuses
  that same scaled damage; blast radius ×(1+0.30t); knockback ×(1+0.30t); projectile mesh
  `scale` = `c`. Full charge ×2.5 = ×1.65 damage / ×1.45 blast radius / ×1.45 knockback.
- Sustained held fire used to sit at ×2 (×1.43 damage) and now sits at ×2.5, so the sustained
  ceiling rose about 15%. Tap-firing is unchanged (plain shells), and the 0.75s ramp still means
  the opening shells of every hold are the small ones.
- `fireShot` also spawns a charge-scaled muzzle ring for BB-NOZIA so the charge level is
  readable; shell size alone was too subtle to read.
- Reloading with fire held keeps charging (the charge line runs before `tryFire`'s reload
  guard), so the first shell out of a reload is fully charged. Deliberate.

## TOXIC BLASTER venom pools (globs leave a small poison cloud where they land)

- Only the `toxic` gun has a pool. It is gun data, not a poison-system feature: the GUNS entry
  carries `pool:{r:24, life:2.8, strength:0.6}`, `fireShot` copies it onto each bullet
  (`b.pool`), and `updateBullets`' final filter splats ONE pool wherever the glob dies —
  on the enemy hit, on a wall bounce, or at end of range — clamped into the arena. The pool is
  therefore always at the impact point, never at the muzzle. `b.poolSplat` guards the single splat.
- `addPoisonPool(x,z,opts)` builds it and pushes it into `G.clouds` with `pool:true`, so the same
  run teardown/`clearArena()` that owns the HAZE clouds also owns the pools. It must NOT cache a
  shared geometry: `sceneRemove` disposes geometry per instance, so a cached sphere geometry would
  be disposed by the first pool and break every later one (it uses the same
  `makeToxicCloudMesh()` builder as `addCloud`, which builds a fresh `SphereGeometry` per call).
- LOOK: a pool draws the shared toxic-cloud mesh — `makeToxicCloudMesh(POISON_POOL_VIS_R)`, the
  same green emissive `MeshStandardMaterial` (0x5abf4f / emissive 0x2a7a2a) that HAZE's TOXIC BURST
  and the Stink Bug's death burst draw — sitting low (y 6 vs the cloud's 8) and animated exactly
  like a cloud: opacity `CLOUD_OPACITY*(1-k)` and scale from 1 to 1.5 across its life.
- Sizing is deliberately TWO separate numbers and must stay that way: `POISON_POOL_R = 24` is the
  hazard (what the tick test uses) and `POISON_POOL_VIS_R = 12` is what is drawn, so the sphere
  grows ~12→18 across its life against a full cloud's static 26. A pool is therefore DRAWN much
  smaller than it poisons — user requirement (2026-09-16: "should be much smaller"). Do NOT make
  the drawn radius follow the hazard radius again: drawing at 24 made a toxic run paint the floor
  with blobs as wide as the clouds themselves. The two mote bursts a tick also spread over `c.visR`
  (not `c.radius`) so they stay inside the puff rather than claiming the full hazard area.
- User requirement (2026-09-16): the pool style must BE the Stink Bug / HAZE ult look — do not
  reintroduce a bespoke pool visual. The old flat-slick art was deleted with its texture generator
  (`poisonPoolTexture`), `G.poisonPoolTex`, `G.poisonGlowTex` and `POISON_POOL_OPACITY`; the pool
  is no longer a Group of coplanar floor discs.
- `updateClouds` branches on `c.pool`: same fade/growth as a cloud, plus poison ticked on an
  interval (0.4s) instead of every frame. Each tick emits two slow-rising motes inside the radius,
  so a stationary pool visibly bubbles, and a caught enemy sets `c.kick` — a decaying +0.14
  opacity flash written through `Math.min(CLOUD_OPACITY, ...)` so the pool can never end up
  brighter than a real cloud. `c.dead` is skipped at the top of the loop so a pool retired by the
  cap cannot tick again.
- Damage: `dps = poisonDps() * pool.poisonMult * pool.strength` → 0.6 × 1.25 × `poisonDps()` for
  TOXIC BLASTER, i.e. below the gun's own direct-hit poison, applied every 0.4s with a 1.6s
  duration so stacks build over ~1s rather than capping instantly. That is the FLAT input only:
  `applyPoison` still raises it to `poisonPctDps(e)` on a big enough target, so a pool standing on
  a boss is worth the % share like every other poison source (see "Fire vs poison"). `applyPoison` keeps the
  STRONGER poison, so a pool refreshes/tops up a direct hit and can never downgrade it. That is
  the intended role: sustained venom, not a second hit.
- `POISON_POOL_MAX = 8` retires the oldest pool past the cap. A fire-rate build can spit globs
  several times faster than the 0.9s base cadence and would otherwise carpet the floor. Measured:
  19 concurrent pools still held ~57fps, so the cap is about readability, not performance.
- Retune the size/life/strength at the POISON_POOL_* block near POISON_MAX_STACKS and the cloud
  look at the CLOUD_* block above `addCloud`, not at the call sites. Verified in the live preview
  (2026-09-16): pool spawns at the impact point as the same green bubble a HAZE cloud is, stacks
  1→2→3→4 over ~1.2s while an enemy stands in it (dps 6 → 9.6 → 11.7 → 12.9 = 6 × the stack table),
  fades out and is removed from `G.clouds` at 2.8s. `__BBAPI` exports `addCloud`,
  `addPoisonPool` and `updateClouds` so this can be driven in a `page_eval` without waiting on
  the game loop.

## Fire vs poison (the two damage-over-time models)

USER SPEC (2026-09-16): "why fire damage is so weak compared to poison? fire should be high damage
to minion. poison should be good to boss? or poison do % damage and fire flat? ... or fire never
stop burning (I think this is good!)". Implemented as exactly that split — the two elements are now
MIRROR IMAGES of each other, and the design is deliberately "one flat, one percentage":

- POISON = **% of the target's MAX HP, and it EXPIRES** (3s). It is the big-target element.
  `poisonPctDps(e)` = `e.maxHp * POISON_PCT_PER_SEC * mods.poison` (× the ammo-scaling perk), and
  `applyPoison` takes `max(incomingFlatDps, poisonPctDps(e))` as the base before the 4-stack
  diminishing table. So a small enemy is byte-for-byte what it always was (the flat floor wins
  below ~1,400 HP at base poison) and only real health bars feel the share. Still 10% slow.
- FIRE = **flat damage, stacks, NEVER expires**. It is the crowd element. `applyBurn(e,dps)` is the
  single entry point for every ignition in the game; each call adds one stack up to
  `FIRE_MAX_STACKS` (5) and raises the per-stack value to the strongest source seen, and the burn
  carries `t: Infinity` — the only thing that removes a burn is the target dying. `dps = per × stacks`.
- Fire spreads by itself: the burn tick ignites anything in contact (`r+o.r+5`) on a 0.5s cadence,
  for ALL burning enemies — the Fire Nova perk no longer gates this (it keeps its super-cast nova).
- Both DoTs write straight to `e.hp` and therefore **tick through enemy shields** (pre-existing).
- Tunables: `POISON_PCT_PER_SEC` (0.007) and `FIRE_MAX_STACKS` (5) sit together in the poison/fire
  constant block near the top of `src/main.js`. Nothing else hardcodes a burn duration —
  `burnTime` / `sunBurnTime` / `burnDur` were deleted from the gun data and the bullet payload when
  the timer went away; if you see one reappear, it is dead config.
- The burn tick emits its flame puff ONCE PER TICK, not per frame. With a permanent burn a
  per-frame emit let a burning wave monopolise the shared particle ring buffer (`G.pPos`, 900
  slots); measured in the live preview, 30 permanently burning enemies now cost ~4fps (58 → 55)
  versus the same wave unlit, which is the acceptable side of that trade.
- `applyStatusTint` scales the orange by stack count (0.26 → 0.68 lerp): one stack is barely a tint,
  five is a full glow. Without it every ignited enemy on screen would be the same flat orange
  forever, and a permanent burn would have no readable intensity.
- KNOWN, ACCEPTED interaction: `per` keeps the strongest source, so triggering a burn while
  `rootedfire` is active (×2) or with `spikeFire` (×1.4) permanently raises that target's
  per-stack value — effectively those cards buy a permanent stronger burn on anything you ignite
  while standing still / spiked. That is the card's stated payoff; it is documented here so nobody
  "fixes" it by accident.
- Verified in the live preview (2026-09-16) via `__BBAPI` (which now exports `applyBurn`,
  `applyPoison`, `poisonPctDps`): 9 ignitions of a 5-value burn cap at 5 stacks / 25 DPS and are
  still burning 4.2s later, dealing 105 damage (25 DPS) over that window; an adjacent enemy 30
  units away catches fire and reaches 5 stacks on its own, while one 300 units away stays cold;
  a 10,000 HP boss takes `poisonPctDps` 131 DPS (1 stack, had the room's poison mods) where the
  flat value is 18.75, and a 261 HP troll takes the flat value; poison on a target that is not
  re-hit clears itself after 3s. Inferno reaches `per = 24 × mods.fire` with `inferno:true`, and
  SUNLANCE still applies its own `sunBurnDps` value.

## BURNING MAGNET (MAG) — the field drags the bodies, and the BODIES are what ghost through MAG

- User request #1 (2026-09-16, verbatim): *"MO passive should have better magnetic, when active ult,
  when eveyhme is INDEED PULLING to ULT, no contact damage to MO!!! (too easy knock me)"*. Read as MAG
  (the crowd-pull hero — MO is the ammo-bomb hero and has no magnet at all). **If the user ever
  confirms they meant MO, this is the section to move.**
- User request #2 (2026-09-16, verbatim): *"you are making mag OP? if he ult, he is not phase throw, i
  mean only the eneyme bing pulled like truck hitting him should phase through him. ult, <=mag
  <=pull<=eneyme"*, followed by *"he cast a magnect that pull everyone. but it's so strong that
  eyeyme become debris and meteor"* (meteor, not metro). Read as: **MAG is never phased and never
  immune**; a body the field is CURRENTLY dragging is in flight (debris/meteor), and in-flight bodies
  pass through MAG instead of body-checking him — everything else hits him exactly as usual.
- MAG's passive is `stats:{ dmg:1.12, magnet:30 }` (+30 Magnet, on top of the +12% weapon damage). 30
  is deliberately under `RUN_MAGNET_MOD_CAP` (50), so the `magnet` level-up card still has 20 points
  of room and `perkGivesNothing`'s "magnet is dead" filter never fires for MAG.
- The Super's field (`castSuper` → `id==='mag'`): `MAGNET_FX_RADIUS` 200 (was a hardcoded 170),
  planted 105 units ahead, 6s. `superAimPreview` for mag reads `impactR:MAGNET_FX_RADIUS` instead of
  the old stale 160, so the ground preview circle matches the real field.
- Pull strength: `MAGNET_PULL_ACCEL` (1300 units/s²) + `MAGNET_PULL_MAGNET_BONUS` (26) × the hero's
  `mods.magnet`. That scaling is the whole mechanical link between the passive and the Super: at the
  +30 passive the field pulls at 2080/s², and stacking Magnet cards keeps pushing it to ~2600. It is
  also the numbers behind the "debris/meteor" read: a dragged body is accelerated ~30-50× harder than
  an enemy walks (40-75 units/s).
- The field cancels outward drift: `outward = (kbx,kbz)·radial-unit`, and if positive it is
  subtracted. Accelerating alone let enemies whose kb was already outward-bound walk out of the
  radius one at a time, which is exactly what made the Super read as a nudge rather than a pull.
  This is the only place in the codebase that zeroes a force the player's own weapons may have
  applied inside a zone, and it is intentional here: inside its own radius the magnet outranks
  knockback.
- **The contact rule is per BODY, not a state of MAG's** (`magnetPulled(e)`, which replaced the old
  hero-wide `magnetContactImmune()`). It returns the live `kind:'magnet'` field that currently has
  `e` inside its radius, or null — and it refuses `e.dead`, `kind==='shield'`, `type==='apexcake'`
  and any non-MAG character up front. The two body-contact call sites use it directly as
  `!magnetPulled(e)`: the generic per-enemy contact tick in `updateEnemies`, and the apex-seven
  body-contact tick. Flames/lasers/beams/shockwaves/projectiles/melee lunges/`area:` hits are
  untouched, and `damageHero` has no magnet branch at all — MAG can be hurt by every one of them,
  including from the very bodies he is dragging.
- **MAGNETIC SHELL is gone** (both halves). There is no hero-wide immunity and no body push-out any
  more: the old rule held every enemy out of `G.heroR + MAGNET_SHELL_PAD` around MAG and refused
  contact damage for the whole 6s, which handed one button six seconds of personal safety. MAG now
  meets bodies exactly like every other hero does (enemies may overlap him; that overlap damages him
  on the usual 0.6s cadence *unless* the field is dragging that body). `MAGNET_SHELL_PAD` and the
  `shellMesh` are deleted.
- `applyMagnetGhost(e, active)` is the look: while the field holds a body it goes semi-transparent.
  It uses the same caching discipline as `applyPhaseVisual` — the original `transparent`/`opacity`/
  `depthWrite` are remembered on the material itself (`m.userData.magGhostSaved`) and restored
  exactly on the way out. Only `MeshStandardMaterial` is touched; enemy rings and shield bubbles are
  `MeshBasicMaterial` and keep their own opacity animations.
- `updateMagnetGhosting()` is the per-frame sweep that calls it, from the main loop immediately after
  `updateEffects(dt)`. It runs unconditionally (not behind a MAG check) because the RESTORE half has
  to happen whether or not MAG is alive, still the character, or still holding a magnet — an enemy
  can also die, be cleared, or leave the field mid-pull.
- The second half of the look is a colour wash, and it lives in `applyStatusTint` (the one function
  that already owns each body's per-frame colour): a ghosted body gets `MAGNET_PULL_GHOST_TINT`
  (`0xd8ecff`, the same spectral blue the game already uses for "phased") lerped on top of any status
  tint at `MAGNET_PULL_GHOST_TINT_AMT` (0.5). Colour-only on purpose: unlike flipping `transparent`
  it costs no program change, and it clears itself the frame the pull ends.
- The field ring: `fieldRing` on the magnet effect, drawn at the REAL `MAGNET_FX_RADIUS` where the
  magnet was planted (it does not follow MAG), fading over its last second. It is its own
  `RingGeometry` mesh rather than a `spawnRadiusRing` because that helper draws every ring at `r/8`
  of the value it is handed (a codebase-wide convention), so a 200-unit field would have rendered as
  a 25-unit circle inside the crowd it is dragging. That ring is now the rule's readout: inside it,
  bodies are in flight and pass through; outside it, they are solid.
- `fieldRing` is a SECOND mesh on the same effect, so both removal paths take it: the `fx.t>=fx.life`
  branch of the magnet effect, and `clearArena` (which used to remove only `f.mesh` — without the
  extra branch a run that ended mid-magnet left a ring standing on the floor of the next run).
- `__BBAPI` exports `magnetPulled`, `applyMagnetGhost` and `updateMagnetGhosting` for testing, in
  place of the old `magnetContactImmune`.
- Verification record (harness run, MAG + RUSTY-P, Normal, sandbox): a `goblingreen` pinned on top of
  MAG with no field cost him 18 HP in 1.5s (one 20-damage contact tick at 10% DR); the same body
  pinned on top of him with a live field over both cost him **0** HP in 1.5s while `magnetPulled` and
  `magnetGhost` were true; `damageHero(10)` still landed for 9 while the field was up (so nothing
  hero-wide is being refused); and the same body started costing 18 HP again within one frame of
  `fx.dead=true`. Materials for dragged bodies measured 4/4 `MeshStandardMaterial` at
  `transparent:true, opacity:0.4`, back to 0/4 transparent after the field ended. Cost with 200
  dragged bodies: ~18.7ms/frame vs ~16.7ms/frame with the same 200 bodies solid, and no first-frame
  spike beyond the noise of the spawn burst itself (the old worry — a transparent flip re-initialising
  the program — is per material instance, the same trade-off PHASE RUN already makes).

## BRAMBLE GARDEN + THORN GUARDS (ROOTY)

- User request (2026-09-16, verbatim): *"root walk and trigger plant more easier"*. Read as ROOTY
  (the only plant hero — `id:'rooty'`): walking onto a bramble to consume it and awaken a THORN
  GUARD was too fiddly, and the trek to reach one was part of the friction.
- The step-on trigger (`updateEffects` → `fx.kind==='bramble'`) was `G.heroR+7` measured CENTRE to
  CENTRE. ROOTY's collision radius is `HERO_R` (12) while his drawn mess is far wider, so he could
  look like he was standing on a plant and still fail the check — that was the real complaint. It is
  now `rootyBrambleStepR()` = `G.heroR + ROOTY_BRAMBLE_STEP_PAD` (18) → 30 units centre-to-centre:
  the drawn body plus walking forgiveness. Constants sit next to `ROOTY_GUARD_MAX`.
- Every bramble now carries a visible step zone: `spawnRootyBramble` builds a `THREE.Group`
  (cone + a flat soft-disc `PlaneGeometry` at `y=1.6`, additive `0x62c96b`, using the lazily built
  shared `brambleZoneTexture()` — a radial gradient that fades to nothing at the rim) scaled to
  `rootyBrambleStepR()`, so the disc is drawn at the TRUE trigger radius — what you see is exactly
  where you have to be. The `fx.kind==='bramble'` branch breathes its alpha 0.30→0.50 at
  `|sin(t*2.6)|`. A graded disc rather than a `RingGeometry` outline is deliberate: the Super's 10
  zones sit ~40 apart inside a 30 radius, so outlines weave into a bright lattice over the plants
  while overlapping soft discs simply merge into one glow, which is what "the whole band converts"
  should look like. (Same reasoning as `spawnSoftRing`.) The cone grew from `ConeGeometry(5,12,6)` to `(6.5,15,6)` (group at y=0, cone at
  local y=7.5) so it reads at arena-camera distance. The group means the existing
  `sceneRemove(fx.mesh)` calls already dispose both meshes (`sceneRemove` traverses).
- Passive garden (`updatePerkActives` → rooty): spawn ring tightened from `r = 42 + rand*52`
  (42–94) to `r = rootyBrambleStepR() + 8 + rand*30` (38–68), so brambles are usable mid-fight
  rather than a detour. **The minimum is derived from the step radius on purpose** — a shorter
  fixed range (24–58 was tried) can drop a bramble INSIDE the (now much larger) step zone, and it
  then converts on the frame it spawns, so the trap is never seen and the garden silently becomes
  "a Thorn Guard every 7s". Any future change to `ROOTY_BRAMBLE_STEP_PAD` moves this minimum with
  it. Rate (7s), waiting cap (3) and passive life (14s) unchanged.
- BRAMBLES Super (`castSuper` → `id==='rooty'`): the 10-bramble ring went radius 90 → 64 and life
  6s → 8s. With the ring tighter AND the step zones now 30 wide, one pass across the ring re-plants
  the whole 3-Guard formation (`ROOTY_GUARD_MAX`), which is the Super's stated purpose. Spacing is
  `2π·64/10 ≈ 40`, i.e. under the 30-unit step radius of the neighbours, so crossing the ring
  chains conversions instead of requiring ten separate stops.
- `HERO_DETAIL_SHEETS.rooty` and ROOTY's `superDesc` were updated to the new radius/duration and to
  mention the drawn step zone. Whatever you change here, keep those two strings in sync — they are
  player-facing.

## PHASE RUN (BLINK) — phase rules

- BLINK's Super (`castSuper` → `id==='blink'`) sets `h.blinkRunT = PHASE_RUN_DURATION` (3s),
  `h.blinkPhaseT = PHASE_RUN_PHASE_DURATION` (3s) and gets a fire-rate bonus of
  `PHASE_RUN_FIRE_RATE_BONUS` (+30%), all three tuned near `HERO_BASE` at the top of
  `src/main.js`. It does not grant `h.invince`; the phase state replaces the old
  opening-stretch invulnerability. Today the phase window equals the run length, so the whole
  run is immune — but the two are separate constants/timers on purpose, so a partial window
  (the run outlasting the protection) stays a one-line change.
- The fire-rate bonus is applied at the SINGLE cadence gate in `tryFire`
  (`G.gun.fire * h.mods.fire / phaseRunFireMul(h)`), as an interval divisor — never as a
  `h.mods.fire` mutation, so it cannot leak past the run or stack with itself. Today it is the
  only such site: if a second cadence path is ever added (e.g. a hero-specific auto-fire), it
  must divide by `phaseRunFireMul()` too.
- Tuning history, recorded so it is not re-litigated: run 4s + phase the whole 4s was called
  too OP; run 4s + phase only the opening 2.5s was the compromise; the user then settled on
  **3s run, fully phased, +30% Fire Rate** — current state. Do not shorten the run to "pay for"
  phasing (a 2.5s run was called a straight nerf), and do not re-add an exposed tail unless asked.
- `heroPhasing(h)` (defined just above `damageHero`) is the single source of truth. It reads
  `(h.blinkPhaseT||0) > 0`, NOT `blinkRunT` — do not reintroduce a `blinkRunT` check there.
  While it returns true:
  - `damageHero` ignores every hit UNLESS the call site passes `opts.area:true`.
  - The hostile `thornwall` (ROOTY-style Thorn Guard brambles) push + thorn damage, and the
    hostile `apexcake` body block, are skipped (both guarded with `!heroPhasing()`).
  - `h.kbx/h.kbz` are zeroed (already true before this change).
  - The HUD `#statusLabel` reads `PHASED`; the hero gets the spectral visual.
- AREA is a per-call-site tag, not a source-type inference. When adding any new
  region-of-space attack (flame/fire zone, beam, laser, shockwave, slam, future poison pool)
  add `area:true` to its `damageHero(...)` opts, otherwise a phased hero will ignore it.
  Currently tagged: hostile fire road, enemy GRIZZ Bulwark quake shock, apex roar/slam/dive,
  dragon breath flame, Bahamut apex impact, CRUSHER slam, and LASER DUDE's `hbeam` lane.
- Decision record (user asked): lasers COUNT as area (they fill a line of space, so they are
  dodged by moving, not by phasing). Discrete enemy bullets/projectiles, bites and claws are
  NOT area, so they phase through. Flip `area:true` on/off at a site to change that call.
- Visual: **the translucent body IS the effect, by user request.** `applyPhaseVisual(h, active)`
  caches each character (standard) material's `transparent/opacity/depthWrite` in
  `material.userData.phaseSaved` and restores it exactly; while phased the body sits at
  `PHASE_BODY_OPACITY` (0.5, a module constant near `HERO_BASE`) with `depthWrite` ON, and
  `updatePhaseVisual(h,dt)` breathes that opacity and keeps the hero's parts drawing near-to-far.
  `mesh.userData.shadow` is hidden for the phase (a solid black contact disc under a translucent
  body reads as a hole) and restored with its own saved opacity afterwards. `h.blinkVisActive`
  caches the state so the material swap runs once per transition, and the restore happens the frame
  the phase window closes, not the frame the run ends. The held weapon phases with the body exactly
  like everything else - one opacity for the whole model is what "semi-transparent" means.
- REMOVED BY REQUEST (2026-09-16 - do NOT reintroduce): the spectral aura rig (floor pool + core
  billboard, two counter-rotating spiral layers, three travelling ring ripples, rising plume,
  motes, faint wide veil), the blue repaint + fresnel rim injection (`PHASE_TINT`/`PHASE_GLOW`/
  `PHASE_RIM`/`PHASE_TIME`/`PHASE_ON`/`phaseRimInject`), the after-image trail
  (`spawnPhaseGhost`/`phaseGhostMaterial` and the `phaseGhost` effect branch), and the old
  additive-blended glow gun. The old `phaseTextures()` went with them; the only piece kept is the
  soft annulus, now `softRingTexture()` next to `spawnSoftRing` (the one-shot cast flash). All of
  it was reported as "too splendid" - it hid the phase state it was describing and cost frames.
  Plain translucency is the whole look now.
- Draw order (the reason the body does NOT read as a stack of glass balloons - keep it):
  `applyPhaseVisual` collects the hero's standard meshes into `mesh.userData.phaseList` on every
  activation (rebuilt per activation, which is how the held weapon - built a beat after the hero -
  gets picked up), and `updatePhaseVisual` sorts that list near-to-far against the camera each
  frame, assigning `renderOrder = 1..n`. `depthWrite` stays ON: far-to-near (the three.js default
  for transparent objects) blends the far hemisphere through the near one and shows every internal
  sphere intersection. `renderOrder` is reset to 0 when the phase ends.
- Activation cost (learned the hard way): the original rim injection made three.js compile a fresh
  batch of programs on the FIRST phased frame - measured ~75-180ms of a totally frozen frame on a
  slower device, i.e. exactly the frame the player pressed the dodge. The injection is gone, so the
  only remaining cost is the transparent-material version bump, and `warmPhasePrograms(h)` (called
  once from `updateHero`, latched by `h.phaseWarmDone`) still pre-touches it with a throwaway
  one-pixel offscreen render on the first frame of the run. `preparePhaseLook()` was deleted (it
  existed only to attach the injection and prebuild the aura). Keep the warm-up: if a new material
  is ever added to the hero, check `renderer.info.programs` before/after activating - it must not
  grow.

## Cursed gear (vending): remembered + confirm-on-deploy

- Buy in the HUB (`HUB_SHOP.vending`, ids `v1..v10`) → a copy lands in `SAVE.vendingStock[id]`.
  Equip up to `VENDING_EQUIP_LIMIT` (3) in CUSTOMIZE CHARACTER → `SAVE.vendingEquipped`. A copy is
  spent ONLY at `beginRun()` (a real deploy), never in training, so picking a set costs nothing on
  its own.
- `SAVE.vendingFresh` is the whole memory rule: `true` = the player hand-picked this set in
  CUSTOMIZE, `false` = the set was inherited from a finished run. `toggleVendingEquip()` sets it
  `true`; `defaultSave()` seeds it `false`; `loadSave()` coerces it. `rememberedCursedGear()` =
  `SAVE.vendingEquipped.filter(id => vendingStock(id) > 0)` — the inherited set that still has
  copies to spend. `vendingPromptNeeded()` = `!SAVE.vendingFresh && rememberedCursedGear().length > 0`.
  It deliberately does NOT test `G.testMode` (that flag is stale before `beginRun` assigns it).
- `beginRun()` no longer clears `vendingEquipped` (the old behaviour forced a full re-pick in
  CUSTOMIZE every run). It now prunes ids with no remaining copies, sets `vendingFresh = false`,
  reads `G._skipCursedGear` for the clean case, and consumes a copy per applied curse. Training
  (`launchTest`) uses `G.testSel.gear` instead and neither spends nor sets anything.
- `showCursedGearPrompt(onChoice)` is a self-contained fixed overlay (`z-index:70`, inline styles,
  HOW-TO-PLAY styling) listing each remembered item with icon / name / `×stock` / desc and the two
  buttons `#cgUse` ("USE N ITEMS THIS RUN") and `#cgSkip` ("RUN CLEAN · SAVE THEM"). A click plays
  `AUD.ui()` then calls `onChoice(use)`. `#cgUse`/`#cgSkip` are the ids; while it is open the card is
  the last child of `<body>`.
- `startRunWithOrientation(use)` sets `G._skipCursedGear = !use` and then runs its local `launch()`
  (orientation / fullscreen / `beginRun`), so BOTH `#startBtn` (menu) and `#retryBtn` (result
  screen) route through the prompt, and fullscreen is still requested inside the click gesture.
- Rules worth not breaking: hand-picking in CUSTOMIZE is the source of truth — a `fresh` set is used
  with no prompt. SKIP spends nothing, applies nothing, and leaves both `vendingStock` and
  `vendingEquipped` untouched. A set with zero remaining copies (e.g. the last copy exhausted)
  auto-prunes and never prompts again. A run that USES the set still consumes a copy per item.
- Verified in the live preview: clean Insane ×1.08 chase, OP Insane ×1.16; Normal ×1.00 and Hard
  ×1.05 unaffected; USE consumed and applied the curses; SKIP started a clean run with stock intact.
  The prompt was measured at a 390×844 phone viewport — fits with no scrolling, both buttons 320×43.

## [+] bonus drops (red heal / green XP)

- Tier + roll table lives in `PLUS_DROP_TIERS` (`src/main.js`, just above `valDropSpot`), keyed by
  `plusDropTier(e)`: `heavy` = any enemy with `r >= 18` (the fat-bodied minions — the "only
  slightly" tier the player asked for), `elite` = `e.elite || e.brain` (champions), `boss` =
  `e.boss`, `apex` = `e.apexBoss || e.type==='bahamut'`. Ordinary enemies return `null` and never
  drop one, so a [+] stays a reward for killing something that took work.
- `heavy` is `chance:0.18, heal:3, xp:3` — deliberately tiny. Champions are `0.55 / 8 / 6`. Bosses
  and apexes are `1.00` and always drop BOTH a heal and an XP plus. Apex is `16/12` → `24/18`.
  Retune the tiers here, not at the call sites.
- The tier `heal` numbers are the NEUTRAL reference. What actually spawns goes through
  `plusHealAmount(base)` (right under `PLUS_TINT`), which applies the clean-run/premium split:
  `PLUS_HEAL_CLEAN_MULT = 1.25` for a plain bunny, `PLUS_HEAL_OP_MULT = 0.75` for a premium
  loadout, via `opLoadoutEquipped()`. Effective values: heavy `4 / 2`, elite `10 / 6`,
  boss `20 / 12`, apex `30 / 18` (clean / OP). Scale at ROLL time, not at pickup — `healHero`
  floats the number it is handed, so the value baked into the drop is what the player sees.
  The XP plus is deliberately not scaled.
- Reachability, so nobody "balances" a row a player can't reach: a PLAIN loadout meets the fat
  minions, champions (`elite`/`brain`) and bosses, but never an `apex` enemy. `apexBoss` is set
  ONLY on the Apex Seven final members (`spawnApexSevenFinal`), whose run is gated by
  `finalApexSevenEligible()` = Insane + premium hero + premium gun; the other apex-tier entry is
  `type==='bahamut'`, gated by `finalBahamutEligible()` = Insane + BAHAMUT. So `apex 30` (clean) is
  unreachable in practice — the apex [+] only ever drops at 18. The `heavy`/`elite`/`boss` rows are
  the live balance surface.
- `opLoadoutEquipped()` (`G.char?.op || G.gun?.op`) is the single definition of "OP run" —
  `insaneBerserkEligible()` now just calls it. Before adding another loadout-scaled rule, use it
  rather than re-testing `.op` inline, or the rules will drift apart.
- `rollPlusDrops(e,x,z,rewardPath)` is called from the `killEnemy` reward path with the same
  off-map fly-back leg the XP orb uses, so a plus dropped by an enemy that died outside the arena
  walks back in with the loot. Boss pairs are offset (`dx/dz`, ±8.5 for boss / ±11 for apex) so the
  two additive glows never share a spot — stacked, red + green add up to one white flare and stop
  reading as two pickups.
- Colours are single-channel on purpose (`PLUS_TINT`, glow centres in `plusGlowTexture`). An
  additive sprite drawn over the bars pushes the dominant channel into clipping; a colour whose
  channels are all near max (e.g. the ordinary orb's chartreuse) clips to white and the plus stops
  reading as a plus. The bonus-XP green is also deeper than the orb chartreuse so the two are
  distinguishable at a glance. The glow sprite has `depthTest:false`, so keep its opacity low
  (0.46) or it washes the bars out from directly in front of them.
- Heal red is `0xff1f30` and its halo is the SAME red (`rgba(255,42,58,…)`) — the old
  `0xff4f6a`/`rgba(255,96,122,…)` pair had enough green and blue in it that the additive pass
  lifted the off-channels and the cross came out salmon-PINK. Off-channels stay low here, or the
  player reads the heal as pink; this was a shipped bug, fixed 2026-09-16.
- Shape: two crossed bars in the XY plane (`spawnPlus`), plus `mesh.scale.y = 1/CAM_TILT_COS`
  (~1.717). The one camera is tilted ~54° down, which squashes world-y to `cos(tilt)≈0.58` on
  screen; without the pre-scale the plus renders squat and wide with visibly breathing arms.
  `CAM_TILT_SIN`/`CAM_TILT_COS` are defined next to `CAM_OFF` — use them for anything else that
  must read as a flat upright shape (the tilt is fixed, so inverse-projecting is legitimate).
  The per-frame pose lives in `updateOrbs`' `if(o.plus)` branch; the pickup radius is 16.5 vs the
  plain orb's 15.
- It does NOT spin in its own plane any more. That spin (2.4 rad/s on Z) turned the cross into an
  X twice a second, and under the tilt the arms changed length through every turn — the shipped
  "spinning plus" simply did not read as a cross. It now only sways `rotation.y = 0.16·sin(...)`,
  which stays a plus at every frame, and the bob comes from the shared orb float. Do not put an
  in-plane (Z) rotation back on it.
- Rules worth not breaking: a heal [+] at FULL health is never magneted and never collected
  (`const fullHp` in `updateOrbs` gates both the pull and the pickup) — it waits where it fell
  until the next hit lands, which is the one pickup in the arena that behaves that way. Neither
  [+] pays `G.gold`, so a bonus drop can never be farmed for currency; the XP plus pays the
  plain-orb score rate and its XP goes through `addExp()` like any orb, so `h.expMult` still
  applies.

## Perk picker: no dead cards

- `perkGivesNothing(p)` in `src/main.js` (defined just above `repeatPerkLimit`) returns true
  when a perk's effect is *numerically dead* for the current hero, so `drawPerks`' `avail`
  filter and `lateRepeatUseful` both drop it. Every draw still returns 3 picks (no pool
  starvation); if literally everything is dead/owned the score-card fallback is used.
- Covered (cap / dead-value only):
  - `criticalhit` at the 100% crit cap; `armor` at the DR cap.
  - `doublebullet` / `bulletbully` at the 2-stack projectile cap (`mods.projStacks`;
    their `apply()` early-returns there, so they were literal no-ops).
  - `magnet` when the XP radius is capped AND crit is capped (the card's only two effects).
  - `superplus` for an unlimited-Super hero (FOXY) already at the 1s charge floor.
  - `hpfordamage` at full HP (pure -25% damage trap - nothing to heal).
- Deliberately KEPT (investment cards - a later pick can make them pay off): Summon Buff with
  no summons, Poison lines on a non-poison gun, Rooted Fire with no burn source, Armor King
  with no shield source, plus the dodge/DR halves of cards that are partly capped. The rule
  is caps and dead values, never "weak for this build".
- `RUN_MAGNET_MOD_CAP` / `HERO_BASE_MAGNET_RADIUS` (right after `RUN_STAT_CAPS`) keep the
  runtime radius calc and hero init from drifting away from `RUN_STAT_CAPS.magnetRadius`.
- Note: `spikebuff` is NOT filtered. Its `requires:'penburst'` and `spikeDmg` read like a
  no-op, but its `spikeFire` x1.4 quietly multiplies ALL burn DPS (main.js ~8642), so it is
  live even without the Bullet Spikes.

## Projectile cards: one base volley per stack

- `baseVolleySize()` (just above `const PERKS` in `src/main.js`) returns `G.gun.proj`, and
  both projectile cards add one whole base volley per stack (`g.hero.mods.proj += baseVolleySize()`).
- Why not a flat `+1`: `fireShot` computes `n = G.gun.proj + h.mods.proj`, so a flat +1 was
  worth +100% of the shot on a single-projectile gun (1→2→3 beams) but only +20% on
  BLASTER-SG12's 5 shells (5→6→7) and +25% on SALAMANDRO's 4 pellets — and with the flat −20%
  damage per stack charged on top, the shotgun card was a net LOSS. Every weapon now gets the
  same payout: ×2 then ×3 its own volley, i.e. +60% then +92% total shot damage.
- `RUN_STAT_CAPS.projectileBonus` (2) is therefore a count of STACKS, tracked in
  `mods.projStacks` (that is what the cap check and `perkGivesNothing` read), while
  `mods.proj` stays the additive bonus in projectiles so `fireShot`, `aegisShieldCount()`
  and the HUD keep reading the same expression.
- The `+spread` skip for `blastersg`/`splitter` is still correct and more important than
  ever: pellet guns now widen their fan through `volleyAngles`' minimum step (BLASTER-SG12's
  62° → 90° at 10 shells → 140° at 15) instead of through a spread mod. AEGIS is a
  `proj:1` gun, so `aegisShieldCount()` (1 + `mods.proj`, clamped 1..3) is unchanged.
- The level-up card appends the live numbers for the held gun via `projectileVolleyNote`
  (used in `showLevelupChoices`), e.g. "5 → 10 PROJECTILES", so the card states its own
  payout. The pause-menu PROJECTILES row shows the total count plus
  "×N VOLLEY · stacks/2 UPGRADES".
- Guns with `proj > 1` in the current rotation: `blastersg` 5, `salamandro` 4,
  `splitter` 3 — the only weapons whose perk behaviour changed. Every `proj:1` weapon
  (explosive launchers, beams, melee, flame and shield guns) is unchanged.

## Pause screen: HERO STATUS + live calculated damage

- User request (2026-09-16, verbatim): *"when esc, should also show hero status passive ult, and
  dagamge should show caculatge live number too, not only original/"*. Two halves: the pause menu
  must show WHAT the hero does (passive + Ult), and damage must be readable as the CALCULATED live
  value, not only the hero's original baseline.
- `renderPauseHeroStatus()` (next to `renderPauseStats`) fills `#pauseHeroStatusPanel` /
  `#pauseHeroStatusBody` (markup + `.phs*` styles in `index.html`). It rebuilds from
  `CHARACTERS` + `HERO_DETAIL_SHEETS` (the same sources `heroDetailsHtml` uses on the select
  screen, so the two can never drift) and adds a live layer: role row, PASSIVE / IDENTITY,
  optional MECHANICS (used by BONES and any sheet with `mechanics`/`mechanicsTitle`), SUPER with
  its baseline stock/charge AND `NOW <uses> STOCK LEFT`, BASELINE (ORIGINAL) = the sheet's `stats`
  string, then LIVE NOW · CALCULATED THIS RUN.
- The live tiles are built from the RUNNING hero, never the sheet: `SHOT DMG` =
  `computeBulletDamage(true)` with `BASE <gun.dmg> · ×<mods.dmg>` printed underneath (this is the
  literal answer to "not only original"), `SHOT DPS` = live shot × total projectiles ÷ fire
  interval, plus HP / DR (`pauseLiveDamageReduction`, so Wounded Resolve + guard are folded in) /
  CRIT / MOVE / FIRE RATE / SUPER.
- The same live-vs-original pairing was added to `renderPauseStats`' `WEAPON DMG` row, whose meta
  now reads `BASE 20 · ×1.12` instead of just the multiplier.
- Placement matters: the panel sits AFTER `.stageBtns` and BEFORE `#pauseStatsPanel`. The hero
  text is long (MAG's Super paragraph alone is ~1k chars), and the verify step showed the panel at
  ~490px tall for ROOTY — anywhere above the buttons it would have pushed RESUME off screen on a
  short viewport. Buttons must never require scrolling.
- The tile grid reuses the existing `.pauseStat` classes (only `#pauseHeroLiveGrid` is new CSS) so
  the card matches the CURRENT STATS grid exactly, and it reflows 4 → 3 → 2 columns with the same
  breakpoints as `#pauseStatsGrid`.
- Verified 2026-09-16: `resumeBtn.bottom` stays above the viewport bottom at 1920x1080, 390x844 and
  360x640; `documentElement.scrollWidth === innerWidth` and no descendant of the panel overflows
  horizontally at any of those sizes; the live grid reports 4/4/2 columns. Rendered the panel
  through an SVG `foreignObject` (the page-snapshot helper hangs on this WebGL page — do not use it)
  and read the tiles back: SHOT DMG 20 / BASE 20 · ×1.00 · SHOT DPS 66.7 / HP 60/60 / DR 10% /
  CRIT 10% / MOVE 75 / FIRE RATE 3.33/s / SUPER 13/13 for ROOTY on RUSTY-P, all correct.

## Hero card briefs (the `passiveDesc` one-liners)

- `passiveDesc` on each entry in `CHARACTERS` is the card brief: it is the subtitle on the
  customize/HUB hero cards (`subtitle:c.passiveDesc` in `src/main.js`, rendered as `.cdesc`)
  and the shop description in `HUB_SHOP`-style entries.
- Rule: keep it to ONE comparable sentence, roughly 60-75 characters, naming the hero's
  signature mechanic. `.cdesc` is `flex:1 1 auto` on those cards, so cards in a row stretch
  to the tallest brief - uneven lengths make a row look ragged. The 10 default bunnies are
  balanced to this length; the apex briefs were already one-liners.
- Never spend brief words on a qualifier that is true of every passive ("Always-on",
  "Permanent", "Passive") - it makes the hero read as a special case when it is just the
  baseline. MAG's old brief ("Always-on +12% weapon damage...") did exactly that and the user
  called it out; it now states the bonus, then what the Super adds.
- The brief is NOT the rules text. Exact numbers, thresholds and edge cases belong in
  `HERO_DETAIL_SHEETS` (`passive` / `mechanics` / `super`), which `heroDetailsHtml()` shows in
  the spec popover and which takes priority over the brief there. Trimming a brief never
  removes a mechanic as long as the detail sheet still documents it.

## Bunny ear accents (per-hero ear colour)

- `buildHeroMesh()` in `src/main.js` gives the ears their own material (`earAccentMat`) instead
  of reusing the shared belly material (`pink`). The belly keeps that pastel; only the ears get
  the accent.
- The accent is derived from the hero's own signature colour (`CHARACTERS[].color`), NOT from a
  pink mix: same hue, saturation floored at `>= 0.44` (signature `s * 1.05`, capped at `0.88`),
  lightness pulled into a band of `0.40-0.54` (`signature l * 0.90`, clamped). Mixing pink into
  the signature is what used to drag a green bunny's ear through olive.
- Saturation scale, user-driven (2026-09-16 "the bunny ear more saturation should be a bit less"):
  it was `s * 1.12` / floor `0.50` / cap `0.98`, which put the strong signatures (MAG orange, the
  greens) at a fully-saturated ear. The ears must stay the richest part of the bunny - do not drop
  the boost entirely, or the accent stops reading at arena-camera distance.
- The coat tint in the same function is deliberately weak and was weakened further in the same
  pass (2026-09-16 "their body color much less"): `coat = 0xf6f2ea.lerp(sig, 0.18)` (was `0.42`,
  which read as a dyed rabbit). The belly pastel follows it down - `0xffc6d0.lerp(sig, 0.20)` (was
  `0.30`) - so the belly can never end up more tinted than the coat it sits on. The coat is the
  bunny's identity HINT; the ears carry the colour.
- Do NOT implement "deeper" as scaling lightness down on top of an already-dark signature:
  BLINK's navy and ROOTY's brown became unlit blobs at arena-camera distance that way. Use the
  band.
- Near-neutral signatures (`s < 0.25`, i.e. BONES' ivory) own no hue worth keeping, so that branch
  sets the ear colour OUTRIGHT instead of deriving it: COFFEE, `h 0.068 / s 0.34 / l 0.33`
  (resolves to `#714f38`). It deliberately skips the saturation floor used for signature hues -
  letting that floor touch the coffee pushed the ear to `s 0.50` (`#7e4c2a`, rust/orange, not brown).
  History, recorded so it is not re-litigated: this branch used to force the "classic" pink ear
  (`h 0.97 / s 0.30 / l 0.46`, `#b03b50`), which against the ivory coat read as a RED ear - the
  user reported that as a bug. A near-black ear was also rejected. Coffee is the one accent that
  stays in the same material family as bare bone and still separates from the near-white coat.
- Ear emissive is `0.30`, close to the body's `0.38` on purpose: the ears are already darker in
  hue, and also dropping their emissive (0.30 -> 0.22) darkened them a second time, which pushed
  the dark signatures into near-black silhouettes. Verified: at 0.22 BLINK's ears read as a black
  cap; at 0.30 they read as lit deep blue.
- GOTCHA: three.js `Color.getHSL()` reads the WORKING (linear) space while `setHSL()` writes
  sRGB, so both calls in `buildHeroMesh()` pass `THREE.SRGBColorSpace` explicitly. Mixing the two
  defaults makes a naive HSL tweak come out unexpectedly bright.
- Resolved ear hexes (regression reference): pulse `#22acf1`, mag `#f18522`, bones `#c2475d` ->
  `#b03b50` -> now `#714f38` (coffee), porter `#8231e3`, payne `#f12222`, haze `#3ea945`, mo `#f1b322`,
  nikki `#f1229b`, blink `#264fd5`, rooty `#936c39`. (These are the post-2026-09-16 relaxed values;
  the previous set was pulse `#17affd` / mag `#fd8517` / porter `#812be9` / payne `#fd1717` /
  haze `#3aad41` / mo `#fdb817` / nikki `#fd179d` / blink `#204cdb` / rooty `#996d33`.)
- Resolved COAT hexes after the same pass (was `lerp(sig, 0.42)`): pulse `#e6edee`, mag `#f8e5d7`,
  bones `#f4f0e8`, porter `#e9e0e9`, payne `#f8e0d8`, haze `#e3e9d8`, mo `#f8edda`, nikki `#f8e5e6`,
  blink `#e3e1e7`, rooty `#e7e1d8`. Cross-check these if the coat ever looks dyed again - every one
  should sit close to the `0xf6f2ea` cream base.
- Verification harness (WebGL canvas has `preserveDrawingBuffer:false`, so captures must happen in
  the same task as the render): via `window.__BBAPI` -> `A.G._launchTest = true`,
  `A.G.testSel = {...}`, `A.beginRun()`, kill enemies, hide `G.hero.mesh`, build meshes with
  `A.buildHeroMesh(id)`, size the renderer with `setPixelRatio(1)` + `setSize(1200,700,false)`,
  set the camera, then `camera.updateProjectionMatrix()` AND `camera.updateMatrixWorld(true)`
  before projecting (a stale matrix world samples background pixels) and either
  `drawImage(renderer.domElement)` into a 2D canvas for pixel sampling or
  `toDataURL()` on the same tick. Finish with `page_refresh` to leave the page at the main menu.

## Comments (comments-plugin)

- Channel `hop-havoc`, dark scheme, admin flair "👑 RUDBO".
- `src/main.js` `openCommunity()` renders it; `ensureCommentsIframe()` /
  `injectCommentsIframe()` are a fallback that manually injects the embed iframe
  (URL built from `window.generatorName` + `+hop-havoc`) because the platform preview
  occasionally has a wedged IntersectionObserver that prevents the plugin's lazy-load.
- Mod/admin password hash: `LB_ADMIN_HASH` constant in `src/main.js`
  (`961b113adb85fdfe788941b771e2ca7147cfeb0dbc87aecdf45c06062c11ce9c`).
  It is SHA-256 of `"perchance-comments-plugin|" + <plaintext password>`.
  The plaintext password (`5ef224f5fa5e68262615d39925d987315eba`) lives only in the
  build conversation history; login in the comments widget with Ctrl+L.

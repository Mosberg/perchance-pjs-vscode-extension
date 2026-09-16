# Runtime save-data schema (`localStorage`, namespace `zzg_*`)

Every persistent value the game writes, with the source line of its first use in `index.html` and the exact call that reads/writes it. 59 keys.

| Key | Source | First use in code |
| --- | --- | --- |
| `zzg_arsenal` | index.html:1970 | `localStorage.getItem('zzg_arsenal')` |
| `zzg_blackone_unlocked` | index.html:2550 | `localStorage.getItem('zzg_blackone_unlocked')` |
| `zzg_boosts` | index.html:2045 | `localStorage.getItem('zzg_boosts')` |
| `zzg_callingcard` | index.html:2490 | `localStorage.getItem('zzg_callingcard')` |
| `zzg_cardmusic` | index.html:2860 | `localStorage.getItem('zzg_cardmusic')` |
| `zzg_cc_manual` | index.html:2207 | `localStorage.getItem('zzg_cc_manual')` |
| `zzg_cg_unlocked` | index.html:2541 | `localStorage.getItem('zzg_cg_unlocked')` |
| `zzg_challenges` | index.html:2494 | `localStorage.getItem('zzg_challenges')` |
| `zzg_coins` | index.html:1969 | `localStorage.getItem('zzg_coins')` |
| `zzg_controller` | index.html:11506 | `localStorage.getItem('zzg_controller')` |
| `zzg_ctrlAimAssist` | index.html:11520 | `localStorage.getItem('zzg_ctrlAimAssist')` |
| `zzg_ctrlDeadzone` | index.html:11519 | `localStorage.getItem('zzg_ctrlDeadzone')` |
| `zzg_ctrlSens` | index.html:11518 | `localStorage.getItem('zzg_ctrlSens')` |
| `zzg_ctrlbinds` | index.html:16074 | `localStorage.getItem('zzg_ctrlbinds')` |
| `zzg_custom_maps` | index.html:16362 | `localStorage.getItem('zzg_custom_maps')` |
| `zzg_customcard` | index.html:3038 | `localStorage.getItem('zzg_customcard')` |
| `zzg_diff` | index.html:15951 | `localStorage.getItem('zzg_diff')` |
| `zzg_fnaf_cleared` | index.html:13352 | `localStorage.setItem('zzg_fnaf_cleared', '1')` |
| `zzg_friends` | index.html:2776 | `localStorage.getItem('zzg_friends')` |
| `zzg_fs_unlocked` | index.html:2558 | `localStorage.getItem('zzg_fs_unlocked')` |
| `zzg_gunskin_eq` | index.html:2093 | `localStorage.getItem('zzg_gunskin_eq')` |
| `zzg_gunskin_per` | index.html:2095 | `localStorage.getItem('zzg_gunskin_per')` |
| `zzg_gunskins` | index.html:2092 | `localStorage.getItem('zzg_gunskins')` |
| `zzg_inbox_gift` | index.html:14303 | `localStorage.getItem('zzg_inbox_gift')` |
| `zzg_invertY` | index.html:11545 | `localStorage.getItem('zzg_invertY')` |
| `zzg_kbSprintMode` | index.html:11546 | `localStorage.getItem('zzg_kbSprintMode')` |
| `zzg_keybinds` | index.html:16014 | `localStorage.getItem('zzg_keybinds')` |
| `zzg_lg_unlocked` | index.html:2524 | `localStorage.getItem('zzg_lg_unlocked')` |
| `zzg_loadout` | index.html:1971 | `localStorage.getItem('zzg_loadout')` |
| `zzg_melee` | index.html:1972 | `localStorage.getItem('zzg_melee')` |
| `zzg_melee_weapon` | index.html:1973 | `localStorage.getItem('zzg_melee_weapon')` |
| `zzg_mobile` | index.html:15979 | `localStorage.getItem('zzg_mobile')` |
| `zzg_mouseSens` | index.html:11544 | `localStorage.getItem('zzg_mouseSens')` |
| `zzg_myrooms` | index.html:16886 | `localStorage.getItem('zzg_myrooms')` |
| `zzg_pet` | index.html:3302 | `localStorage.getItem('zzg_pet')` |
| `zzg_pets` | index.html:3299 | `localStorage.getItem('zzg_pets')` |
| `zzg_pk_unlocked` | index.html:2561 | `localStorage.getItem('zzg_pk_unlocked')` |
| `zzg_playerid` | index.html:2771 | `localStorage.getItem('zzg_playerid')` |
| `zzg_playername` | index.html:2489 | `localStorage.getItem('zzg_playername')` |
| `zzg_quality` | index.html:3330 | `localStorage.getItem('zzg_quality')` |
| `zzg_rank` | index.html:1873 | `localStorage.getItem('zzg_rank')` |
| `zzg_rumble` | index.html:16100 | `localStorage.getItem('zzg_rumble')` |
| `zzg_season_claims` | index.html:2111 | `localStorage.getItem('zzg_season_claims')` |
| `zzg_season_tier` | index.html:2109 | `localStorage.getItem('zzg_season_tier')` |
| `zzg_season_xp` | index.html:2110 | `localStorage.getItem('zzg_season_xp')` |
| `zzg_sf_unlocked` | index.html:2557 | `localStorage.getItem('zzg_sf_unlocked')` |
| `zzg_sg_unlocked` | index.html:2543 | `localStorage.getItem('zzg_sg_unlocked')` |
| `zzg_skin` | index.html:1860 | `localStorage.getItem('zzg_skin')` |
| `zzg_skins` | index.html:2052 | `localStorage.getItem('zzg_skins')` |
| `zzg_story` | index.html:15614 | `localStorage.getItem('zzg_story')` |
| `zzg_totalxp` | index.html:1875 | `localStorage.getItem('zzg_totalxp')` |
| `zzg_tracer_eq` | index.html:2025 | `localStorage.getItem('zzg_tracer_eq')` |
| `zzg_tracer_per` | index.html:2027 | `localStorage.getItem('zzg_tracer_per')` |
| `zzg_tracers` | index.html:2024 | `localStorage.getItem('zzg_tracers')` |
| `zzg_unlocked_cards` | index.html:3214 | `localStorage.getItem('zzg_unlocked_cards')` |
| `zzg_vg_unlocked` | index.html:2547 | `localStorage.getItem('zzg_vg_unlocked')` |
| `zzg_vip` | index.html:2113 | `localStorage.getItem('zzg_vip')` |
| `zzg_ws_unlocked` | index.html:2553 | `localStorage.getItem('zzg_ws_unlocked')` |
| `zzg_xp` | index.html:1874 | `localStorage.getItem('zzg_xp')` |

Custom-map payload written to `zzg_custom_maps` (the only structured user-generated data):

```
[{ id, name, size, theme, items: [ { type, x, z, rot, sub } ], created }]
```

- `size` — arena half-extent (S 24 / M 34 / L 44).
- `theme` — `zen` | `crimson` | `desert` | `pale`.
- `items[].type` — `crate` | `barrel` | `barrier` | `tree` | `rock` | `torch` | `bush` | `gravestone` | `spawn` | `start` | `wallgun` | `pap` | `mysterybox` | `aat`.
- `items[].rot` — quarter-turns; `items[].sub` — sub-selection for `wallgun` (11 wall weapons) and `aat` (5 elements), and the zombie variant for `spawn` portals.

Multiplayer identity: `zzg_netid` holds the stable 32-hex client id sent to the server as `hello`; `zzg_myrooms` mirrors the server's `myRooms` answer so the browser list can mark **YOURS** rows instantly.

All storage is per-generator-origin (each generator runs on its own `*.perchance.org` subdomain), so renaming a generator or forking it starts with a clean save.

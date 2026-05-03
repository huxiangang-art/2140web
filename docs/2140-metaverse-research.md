# 2140 Metaverse Research

Reference archive: `/Users/tony/Projects/2140-research`

Authoritative APK for current metaverse UI: `/Users/tony/Projects/2140-research/apk_new/2140_2_8_5.apk`

Extracted archive: `/Users/tony/Projects/2140-research/apk_new/extracted_2_8_5`

This document maps the 2140 "metaverse" board as it exists across the original APK research archive, live API responses, and the current plugin implementation.

## Summary

The metaverse board is not a single route. It is the narrative and identity layer tying together:

- World timeline and eight-series canon
- Six-race identity and race bases
- Universe/race-war map
- Collaborative writing branches and chapters
- Turing test and gene sequencing
- Digital person progression
- Genesis keys, creation index, and contribution ranks
- Media assets and AI films in the research archive

Product-wise, this board is the "hard sci-fi IP browser + citizen identity system + contribution game loop".

## Canon Model

### Core Premise

Research docs describe 2140 as:

- A hard sci-fi IP set against a 13.8-billion-year cosmic background.
- A digital city-state parallel to reality, with independent governance and economy.
- A social experiment where citizens create, vote, invest, and govern the fictional civilization.

Core laws:

- `算力即权力`: hashrate becomes the resource behind governance, war, rewards, and status.
- `共创进化`: citizens write branches/chapters and vote on narrative direction.
- `碳硅博弈`: human/AI/silicon life conflict is not decoration; it is the identity and plot engine.

### Timeline

Source:

- Live API: `/write/get_time_nodes/1`
- Research sample: `deep_analysis.json -> write_time_nodes`
- Original page: `web/html/write_index.html`

Live response currently returns 55 nodes. Important nodes include:

| Time | Node | Role |
| --- | --- | --- |
| `10E^- 43秒` | 宇宙诞生 | Cosmological origin |
| `3秒` | 三秒文明 | Earliest micro-civilization |
| `50亿年` | 宏观文明 | First galaxy-scale civilization |
| `2021` | 元宇宙·六族志 | Anchors six-race metaverse identity |
| `2042` | 零点革命 | Traditional Turing test fails |
| `2047` | 镜像世界 | Humanoid AI training ground |
| `2049` | CSI圣杯 | Carbon/silicon competition |
| `2060` | 图灵梦境 | Dream-world branch |

Implementation status:

- Current `/world` renders the time-node list.
- Nodes with `branch_seq` now open `/write/branch/{branch_seq}`, matching the original `write_index.html` behavior.

### Eight-Series Canon

Source:

- Live API: `/write/get_theme8/2`
- Current plugin wrapper: `getTheme8()`
- Current route: `/world`

Live returns 8 series. The first is `CSI圣杯`, authored by `2140元宇宙`, with cover, synopsis, chapter sequence, hashrate, and ending chapter.

Current plugin:

- Shows series cards on `/world`.
- Links each series card to `/write/branch/{seq}`.
- Surfaces live cover images from `getTheme8()`.

Recommended interpretation:

- `/world` should be the canonical "metaverse library".
- `/write` should be the participation/workbench surface.

## Identity Layer

### Six Races

Sources:

- Original API: `/race/get_races/`
- Current plugin: `/races`, `/turing`, `/map`
- Assets: `public/racewar/race_img*.jpg`, `race_role_img*.jpg`, `race_groups_img*.jpg`

Races:

- 人族
- 熵族
- 神族
- 晓族
- AI族
- 零族

Current plugin state:

- `/races` has strong hand-written lore for race ideology, hero, base, and live hashrate status.
- `/map` uses shorter race descriptions and race dots on civilization levels.
- `/turing` uses static questions and local scoring.

Gap:

- Race identity is duplicated in several files instead of having one canonical data module.
- Original `join_race.html` assets exist but the plugin does not have a full race-joining/restoration flow.

### Turing Test

Sources:

- Original pages: `turing_test.html`, `turing_choose.html`, `turing_result.html`, `turing_share.html`
- Assets: `turing_*`
- Plugin route: `/turing`

Role:

- Lightweight identity assignment game.
- Frames race identity through AI/human/metaverse questions.

Current plugin:

- Static 16-question local test.
- Good as a fast public experience.

Gap:

- Not wired to original backend test/result/share flow.
- Does not reuse original visual assets.

### Gene Sequencing

Sources:

- Original pages: `gene_sequencing_*`
- Original APIs: `/geneSequencing/get_questions/`, `/get_user_last_record/`, `/get_match_records/`, `/replace_question/`, `/restart_select_question/`, `/submit_selected_question/`
- Plugin route/API: `/gene`, `/api/gene`

Live observations:

- `/geneSequencing/get_user_last_record/` returns primary and secondary gene identities.
- `/geneSequencing/get_match_records/` returns historical match records and match rates.
- `/geneSequencing/get_questions/` returns 10 scenario questions with gene-mapped options.

Current plugin:

- Can fetch questions and submit selected answers.

Gap:

- Missing last-record and match-record views.
- Missing question replacement/restart behavior from original app.
- Does not use original gene visual assets, such as `gene_sequencing_question_dynamic_bg.gif`.

### Digital Person

Sources:

- Live APIs: `/digitalPerson/get_user_digital_person/`, `/get_digital_person_rewards/`, `/get_rank/`
- Assets: `public/digital/person_equip1..21.png`
- Plugin route: `/digital`

Live observations from logged-in account:

- Current digital person standards: `standard1`, `standard2`, `standard3`, `standard4`, `standard_sum`
- Current account was `person_lv: 3`, `standard_sum: 11`
- Rewards include props, engine boosts, NFTs/items, and standards thresholds.

Current plugin:

- Has a functional progression view and rank tab.

Gap:

- Some reward images point to `../image/digital_person/...`, while local public assets live under `/digital/...`; image URL normalization should be added.
- Digital person is not yet connected back to race/gene/turing identity in one identity dashboard.

## Map and War Layer

### New APK Metaverse Entry

Source:

- Official download page: `https://www.2140city.cn/foreign/download/`
- APK: `2140_2_8_5.apk`, last modified `2024-01-24`
- Original home entry: `assets/widget/html/home.html`
- Original main map: `assets/widget/html/racewar.html`
- Original race-war assets: `assets/widget/image/racewar/`

Entry behavior in `home.html`:

- Right-side home button `to_racewar` is labeled `元宇宙`.
- Button is shown when `is_audit == 0`.
- If the user has no race, original app prompts `您尚未选择种族!`.
- Otherwise it reads `last_map`; fallback is `race_lv`.
- If `last_map > 10000`, it opens `racewar_branch_map`; otherwise it opens `racewar` with `{ seq: last_map }`.

Main map behavior in `racewar.html`:

- Fetch map detail from `/racewar/get_map/{seq}/{race}`.
- Fetch debris markers from `/racewar/get_debriss/{seq}`.
- Render `map.bg` as the full-screen map background with `height: 100vh`; the image natural width becomes wider than the viewport.
- After background load, run `window.scrollTo((map_bg.offsetWidth - window.screen.width) / 2, 0)` so the first view starts centered while still allowing horizontal swipe/scroll.
- Render map title as `{map.name}·主线`.
- Render debris markers using `racewar_debris_icon.png`.
- Place debris markers from `/racewar/get_debriss/{seq}` using `position[0]` and `position[1]`, e.g. `["52.4%","75.6%"]`.
- Clicking a debris marker opens `racewar_debris` with `{ seq: debris.seq }`.

Primary UI actions:

| Original ID | Label | Original Page | Plugin Route |
| --- | --- | --- | --- |
| `to_map_add` | 创建文明 | `racewar_map_add` | `/metaverse/worlds` |
| `to_map_select` | 切换文明 | `racewar_map_select` | `/metaverse/worlds` |
| `to_racewar_creation_index` | 创世榜 | `racewar_creation_index_rank` | `/metaverse/contribution` |
| `to_total_rank` | 地票榜 | `racewar_total_rank` | `/metaverse/war/ranks` |
| `to_race_plaza` | 广场 | `race_plaza_speechs` | `/plaza` |
| `to_branch_map` | 前往支线 | `racewar_map_select`, `show_type: 2` | `/metaverse/worlds` |
| `to_racewar_situation` | 战况 | `racewar_situation` | `/metaverse/war/reports` |
| `to_racewar_task` | 任务 | `racewar_race_task` | `/metaverse/quests` |
| `to_prop_all` | 道具 | `prop_backpack` | `/prop/backpack` |
| `to_last_debris` | 战斗中 | `racewar_debris` | `/metaverse/war` |

### Universe Map

Sources:

- Live API: `/racewar/get_map_situation/`
- Plugin route: `/map`
- Assets: `public/racewar/*`

Live response shape:

- `maps`: main civilization levels
- `tasks`: race-to-level state
- `race_lv`, `race_step`

Observed main levels:

- Lv.1 春蚕文明
- Lv.2 地球文明
- Further levels are represented in plugin lore up to Lv.9.

Current plugin:

- `/map` renders an interactive star-map with main and branch nodes.
- Modals show civilization descriptions, race dots, debris, and status.

Gap:

- CIV descriptions are hard-coded in `UniverseMap.tsx`, but comment says they came from an API. Need find or verify `/racewar/get_map/{seq}/2`.
- No dedicated route for a main map lore detail; only rank pages under `/racewar/map/[seq]`.
- Visual layout is useful but not faithful to original APK because these race-war endpoints/assets are newer than the original 75-endpoint extraction.

### Branch Maps

Source:

- Live API: `/racewar/get_branch_maps/`
- Plugin route: `/map` and `/racewar`

Live observations:

- 4 branch maps.
- Example: `根世界`, health `9500`, described as the first root world under the metaverse.

Current plugin:

- Shows branch nodes on `/map`.
- Shows list and HP on `/racewar`.

Gap:

- Branch maps should be a first-class metaverse section, not only race-war utility data.
- Need link branch map -> debris -> residents/tasks/rank flows more coherently.

### Creation Index and Genesis

Sources:

- `/racewar/get_creation_index_rank/1/0/3/`
- `/genesisKeys/get_genesis_keys_users/`
- `/genesisKeys/get_genesis_keys2/`
- Plugin routes: `/racewar`, `/genesis`

Role:

- Connects contribution to metaverse authorship.
- Genesis keys imply founder/creator status.

Current plugin:

- `/racewar` shows creation index and creator lists when data exists.
- `/genesis` exists, but this system is not integrated with `/world` or `/map`.
- `/metaverse` is now reserved for the original APK-style map entry: horizontally scrollable race-war map, live debris positions, and fixed race-war menu.
- `/metaverse/dashboard` keeps the platform-enhanced read-only control console: race, digital person, gene records, world map state, branch maps, creation index, tasks, timeline nodes, and eight-series entries.
- `/metaverse/dashboard` normalizes nested race-war task data into an action queue and shows core progress rails for civilization, digitalization, race task progress, and branch-world survival.
- `/metaverse/identity` now provides a logged-in read-only identity dossier: race, resource stats, digital-person standards, gene report, match records, genesis-key status, and creation index.

Gap:

- No unified "metaverse contribution profile": race, gene, digital person, creation index, keys, authored branches.

## Media and Asset Layer

Research archive includes strong metaverse media:

- `docs/2140-preview-en.mov`
- `docs/无限世界简介 - 副本.m4v`
- `docs/AI电影/5、2140·图灵梦境/图灵梦境定稿.m4v`
- `docs/AI电影/6、2140 丝绸之路/丝绸之路.mp4`
- `docs/AI电影/1、算力即权利/算力即权力（最终确定）.mp4`
- `docs/GPT-X2-22.pptx`
- `docs/2140概要介绍.pptx`

Original web assets include:

- `home_bg.jpg`, home hashrate ball icons
- `join_race_*`
- `turing_*`
- `gene_sequencing_*`
- `write_*`
- `city_code_*`

Current plugin uses only part of the racewar and digital assets. The metaverse board can feel much more native if the strongest original media is selectively surfaced.

## Current Plugin Route Map

| Route | Metaverse role | Current strength | Main gap |
| --- | --- | --- | --- |
| `/metaverse` | Unified game board/control console | Opens with a large interactive universe map, then aggregates identity, branch worlds, tasks, progress rails, ranks, timeline, and eight-series from live APIs | Read-only first pass; map details still reuse `/map` modals |
| `/metaverse/identity` | Personal metaverse identity dossier | Consolidates race, digital person, gene, match records, genesis-key status, resources, and creation index | Needs authored branches and Turing backend result integration |
| `/metaverse/worlds` | Main/branch world selector | Shows main civilization levels, debris links, branch-world HP and survival state | Needs dedicated branch-world detail and resident/action panels |
| `/metaverse/worlds/[seq]` | Main world detail | Shows main civilization detail, debris bases, ground-ticket/rank slices | Needs richer lore copy and resident panels |
| `/metaverse/worlds/branch/[seq]` | Branch world detail | Shows branch-world description, HP, linked missions | Needs resident/action panels |
| `/metaverse/quests` | Unified quest center | Normalizes nested race-war tasks, branch missions, completed records, safe confirmation affordance | Needs write/governance quests |
| `/metaverse/library` | Canon library | Extracts timeline and eight-series into metaverse namespace with covers, branch links, and filters | Needs node detail and chapter progress |
| `/metaverse/contribution` | Contribution/ranking hub | Aggregates creation index, daily debris contribution, digital person, ground ticket, hashrate, genesis users | Needs personal contribution history |
| `/metaverse/agent` | GPT-X/Agent planning workbench | Provides proposal lanes and draft persistence API/UI with Supabase fallback | Needs actual LLM generation and review workflow |
| `/metaverse/library/[seq]` | Series detail | Shows series cover, synopsis, linked node, and chapter progress | Needs richer investment/vote/comment summaries |
| `/metaverse/war` | Active war center | Combines hashrate pool, digital person rank, branch-world HP, anomaly debris, daily contribution, plaza signals, and template war report | Needs war quest/action/report subroutes |
| `/metaverse/war/quests` | War quest center | Focused race-war and branch mission view with Agent action plan and safety confirmation | Needs real write/governance war quests |
| `/metaverse/war/ranks` | War ranks | Today contribution, ground ticket, race, hashrate, and digital person rank panels | Needs filters |
| `/metaverse/war/reports` | War reports | Template war report, risk worlds, and today's action plan | Needs persisted/generated reports |
| `/metaverse/war/contribute` | Contribution preview | Preview-only targets and safe confirmation links; no submit calls | Needs full Preview -> Confirm -> Submit shell |
| `/world` | Canon timeline and eight-series library | Uses branch links and live covers | Needs richer node detail and filters |
| `/map` | Universe/race-war spatial view | Strong interactive map | Needs data-type cleanup, API verification, linked detail pages |
| `/races` | Six-race identity | Strong lore page | Needs canonical shared race data and join-race flow |
| `/racewar` | War/contribution dashboard | Useful operational view | Needs tighter relationship to `/map` and creator identity |
| `/write` | Citizen co-creation | Functional but simplified | Needs original timeline/branch drawer and creation forms |
| `/turing` | Quick race/identity test | Lightweight usable | Not backend/restored-asset faithful |
| `/gene` | Deep identity sequencing | Functional submission flow | Missing last record, matches, restart/replace, visuals |
| `/digital` | Digital person progression | Functional live data view | Needs image normalization and identity integration |
| `/genesis` | Founder/key layer | Present | Needs integration into metaverse identity |

## Recommended Build Plan

### Phase 1: Metaverse Hub

Create a new `/metaverse` route that is not another marketing page, but a dense operational/lore hub:

- Top: current user identity summary: race, gene, digital person, creation index.
- Middle: world timeline + current unlocked map level.
- Right/side: live branch map status and active writing branches.
- Bottom: media/library entries: `图灵梦境`, `丝绸之路`, `算力即权力`, `CSI圣杯`.

This makes "元宇宙板块" a real board instead of scattered links.

Status: implemented as a read-only first pass in `src/app/metaverse/page.tsx`; upgraded with a first-screen map panel, progress rails, task normalization, live branch links, and P0-P4 subroute entry points.

### Phase 2: World Page Upgrade

Upgrade `/world`:

- Use `getWriteTheme()` and `getTheme8()` with covers.
- Make time nodes with `branch_seq` link to `/write/branch/{branch_seq}`.
- Add filters: `已开放`, `有支线`, `未来节点`.
- Add canonical route mapping: node -> theme -> branch -> chapters.

Status: `/metaverse/library` added as the metaverse-native library route; `/world` remains as a legacy/public world-view route.

### Phase 3: Identity Integration

Create `/metaverse/identity` or fold into `/profile`:

- Race card
- Turing result
- Gene last record and match records
- Digital person progression
- Genesis key status
- Creation index

Required API wrappers to add:

- `getGeneLastRecord()` - added
- `getGeneMatchRecords()` - added
- `DigitalPerson`, `GeneMatchRecord`, and `GenesisKeyStatus` response types - added
- `replaceGeneQuestion()`
- `restartGeneQuestions()`
- type definitions for racewar responses

Status: `/metaverse/identity` implemented as a logged-in read-only dossier.

### Phase 4: Worlds, Quests, Contribution, Agent

Implemented read-only first pass:

- `/metaverse/worlds`
- `/metaverse/worlds/[seq]`
- `/metaverse/worlds/branch/[seq]`
- `/metaverse/quests`
- `/metaverse/contribution`
- `/metaverse/agent`

### Phase 5-10 Follow-up Status

Implemented:

- P5: shared metaverse helper/types in `src/lib/metaverse.ts`
- P6: `/api/metaverse/agent` and `/metaverse/agent` draft persistence UI, with no-config fallback
- P7: safe quest confirmation UI that opens original task surfaces without submitting mutations
- P8: main/branch world detail routes
- P9: library filters for all/linked/key/future nodes
- P10: identity participation/Turing status/creation summary blocks

### Phase 4: Map/War Deepening

Upgrade `/map` and `/racewar`:

- Extract all hard-coded race/map lore to shared modules.
- Verify or discover map-detail endpoint for main map descriptions.
- Add `/map/[seq]` read-only lore detail distinct from rank page.
- Link branch maps to debris/resident/task/rank pages.

### Phase 5: Native Visual Restoration

Selective asset restoration:

- `/gene`: use gene background/avatar/dynamic question assets.
- `/turing`: use turing test/result/share visuals.
- `/world`: use write index top image and branch cover default.
- `/metaverse`: use video thumbnails from research docs, not raw autoplay.

## Immediate Next Step

Best next implementation:

### Phase 11-18 Follow-up Status

Implemented:

- P11: added additional metaverse data types and Agent lane helpers in `src/lib/metaverse.ts`
- P12: `/metaverse/agent` can request real DeepSeek generation when `DEEPSEEK_API_KEY` is configured; otherwise it degrades safely
- P13: Agent records support status transitions through `draft`, `reviewing`, `approved`, `rejected`
- P14: `/metaverse/identity` includes authored chapter count, participation stats, Turing placeholder status, and creation identity summary
- P15: world detail routes include rank/contribution slices and linked chapter nodes
- P16: `/metaverse/quests` includes war, branch, writing, and governance quest lanes
- P17: `/metaverse/library/[seq]` added for series detail and chapter progress
- P18: restored selected original visual assets under `public/metaverse/` and surfaced them on `/metaverse`

### Active War Center

Implemented first pass:

- `src/lib/metaverse-war.ts`
- `/metaverse/war`
- `/metaverse/war/quests`
- `/metaverse/war/ranks`
- `/metaverse/war/reports`
- `/metaverse/war/contribute`

The war center is designed as the highest-frequency metaverse surface. It combines the currently most active live systems:

- Hashrate pool and hashrate rank
- Digital person rank and current user digital person level
- Branch-world HP and danger level
- Anomaly debris
- Daily debris contribution
- Plaza latest signals
- Template Agent war report

Next:

1. Finish strict racewar response types across legacy routes.
2. Add real Turing backend result integration once the original endpoint mapping is verified.
3. Extend `/metaverse/agent` from draft generation to full review workspace with diff/export targets.
4. Add investment/vote/comment summaries to `/metaverse/library/[seq]`.

This gives the metaverse board a coherent entry point while preserving current routes.

# 2140 APK 2.8.5 首页入口复刻对照

参考源：`/Users/tony/Projects/2140-research/apk_new/extracted_2_8_5/assets/widget/html/`

## 首页主入口

| APK pageName | Web route | 当前状态 |
| --- | --- | --- |
| `home` | `/` | 已复刻首页 |
| `write_index` | `/write` | 已承接，待继续细化投票/续写 |
| `hashrate_pool` | `/hashrate` | 已承接 |
| `hashrate_pool_rank` | `/hashrate/rank` | 已承接 |
| `hashrate_pool_rule` | `/hashrate/rule` | 已承接 |
| `hashrate_engine` | `/hashrate/engine` | 已承接 |
| `parliament` | `/parliament` | 已承接 |
| `treasure_hunt_index` | `/treasure` | 已承接 |
| `treasure_hunt_maze` | `/treasure/maze` | 已承接，待复刻答题交互 |
| `treasure_hunt_reward_rank` | `/treasure/rank` | 已承接 |
| `treasure_hunt_rule` | `/treasure/rule` | 已承接 |
| `my_questions` | `/treasure/questions` | 已承接 |
| `treasure_hunt_question_add` | `/treasure/question-add` | 已承接 |
| `racewar` | `/metaverse` | 已复刻地图入口 |
| `racewar_branch_map` | `/metaverse?mode=branch` | 已接支线深链 |
| `store` | `/store` | 已承接 |
| `store_goods` | `/store/[seq]` | 已承接详情 |
| `store_goods_more` | `/store/more` | 已承接 |
| `store_nft_apply` | `/store/nft-apply` | 已承接 |
| `nfts` | `/nft` | 已承接 |
| `nft_detail` | `/nft/[seq]` | 已承接详情 |
| `nfts_more` | `/nft/more` | 已承接 |
| `race_plaza_speechs` | `/plaza` | 已承接 |
| `task` | `/tasks` | 已承接，任务跳转走路由表 |
| `my` | `/profile` | 已承接基地页 |

## 首页浮动入口

| APK pageName | Web route | 当前状态 |
| --- | --- | --- |
| `digital_person` | `/digital` | 已承接 |
| `user_space` | `/user-space` | 已复刻罗盘驾驶舱第一版 |
| `user_space_journal` | `/user-space/journal` | 已承接日志 |
| `my_hashrate` | `/profile/hashrate` | 已承接 |
| `my_token` | `/profile/token` | 已承接 |
| `my_level` | `/profile/level` | 已承接 |
| `racewar_branch_missions` | `/racewar/tasks` | 已承接 |
| `user_guide` | `/racewar/tasks` | 已承接 |
| `invite` | `/invite` | 已承接 |
| `invite_rule` | `/invite/rule` | 已承接 |
| `propaganda_index` | `/propaganda` | 已专项复刻 |

## 宣传中心

| APK pageName | Web route | 当前状态 |
| --- | --- | --- |
| `propaganda_map` | `/propaganda/civilization` | 已承接 |
| `propaganda_regulation` | `/propaganda/rules` | 已承接 |
| `propaganda_history` | `/propaganda/history` | 已承接 |
| `propaganda_debris` | `/propaganda/base-world` | 已承接 |
| `propaganda_race` | `/propaganda/races` | 已承接 |
| `propaganda_role` | `/propaganda/roles` | 已承接 |

## 盲盒/资产

| APK pageName | Web route | 当前状态 |
| --- | --- | --- |
| `bilnd_box` | `/blindbox` | 已承接 |
| `bilnd_box_detail` | `/blindbox/[seq]` | 已承接详情 |

## 兼容入口

旧 APK pageName 可通过 `/apk/[pageName]` 统一跳转，例如：

- `/apk/propaganda_role` -> `/propaganda/roles`
- `/apk/racewar_branch_map` -> `/metaverse?mode=branch`
- `/apk/hashrate_engine` -> `/hashrate/engine`

路由表维护位置：`src/lib/apk-route-map.ts`。

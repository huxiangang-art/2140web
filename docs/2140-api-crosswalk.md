# 2140 API Crosswalk

Reference archive: `/Users/tony/Projects/2140-research`

Primary source files:

- `api_list.json`: 75 endpoints extracted from the original APK/web bundle.
- `api_responses.json`: captured responses keyed by endpoint path.
- `deep_analysis.json`: curated response samples grouped by product area.
- `web/html/*`: original page implementations and request call sites.
- `web/image/*`: original visual assets.

Related page-behavior map: `docs/2140-citycode-write-crosswalk.md`.

## Wrapper Policy

All 2140 API calls should go through `src/lib/api2140.ts`.

Use these conventions:

- Keep exported function names stable when existing pages already import them.
- Add newly restored endpoints as small wrappers near their product area.
- Prefer `formBody()` for POST bodies instead of hand-built query strings.
- Use `dataOr()` and `listOr()` for normal `ret !== 0` fallback behavior.
- Return the raw `ApiResponse` only for mutations where the caller needs `ret` or `msg`.
- Keep `cache: 'no-store'` unless a page explicitly owns freshness/caching behavior.

## Original App Endpoint Coverage

### Covered or partially covered in the plugin

| Area | Original endpoints | Plugin wrappers |
| --- | --- | --- |
| Login | `/login/index/mobile/` | `login()` |
| User | `/index/get_user_info/`, `/user/get_user_hashrate/`, `/user/get_user_invite_count/`, `/user/get_user_orders/`, `/user/get_user_token/`, `/user/get_user_total_token/`, `/user/get_user_vote/`, `/user/get_hashrate_goods/` | `getUserInfo()`, `getUserHashrate()`, `getUserInvite()`, `getUserOrders()`, `getUserTokenRecords()`, `getUserTotalToken()`, `getUserVotes()`, `getHashrateGoods()` |
| Hashrate pool | `/hashratePool/get_current_hashrate_pool/`, `/hashratePool/get_ranks/`, `/hashratePool/input_hashrate/`, `/hashratePool/get_last_luckyer/` | `getHashratePool()`, `getRanks()`, `getHashratePoolRank()`, `inputHashrate()`, `getLastHashrateLuckyer()` |
| Home balls | `/index/get_hashrate_ball/`, `/index/click_hashrate_ball/` | `getHashrateBalls()`, `clickHashrateBall()` |
| Race | `/race/get_races/` | `getRaces()` |
| City Code | `/cityCode/get_proposals/`, `/cityCode/get_proposal/`, `/cityCode/get_amendments/`, `/cityCode/proposal_add/`, `/cityCode/submit_add_amendment/`, `/cityCode/support_proposal/`, `/cityCode/support_amendment/`, `/cityCode/get_unread_amount/` | `getProposals()`, `getAllCityCodeBills()`, `getCityCodeProposal()`, `getCityCodeAmendments()`, `addProposal()`, `addCityCodeAmendment()`, `supportCityCodeProposal()`, `supportCityCodeAmendment()`, `getCityCodeUnreadAmount()` |
| Gene sequencing | `/geneSequencing/get_questions/`, `/geneSequencing/submit_selected_question/` | `getGeneQuestions()`, `submitGeneSequencing()` |
| Store | `/store/get_goods_list/`, `/store/get_goods/`, `/store/get_goods_more/` | `getStoreGoods()`, `getStoreGoodsDetail()`, `getStoreGoodsMore()` |
| Tasks | `/task/get_user_task/` | Partially covered by `getTasks()` against newer `/task/get_tasks/` |
| Writing | `/write/chapter_add/`, `/write/comment_add/`, `/write/get_branch/`, `/write/get_branchs/`, `/write/get_chapter/`, `/write/get_chapters/`, `/write/get_time_nodes/1` | `addChapter()`, `addWriteComment()`, `getWriteBranch()`, `getWriteBranchs()`, `getWriteChapter()`, `getWriteChapters()`, `getTimeNodes()` |

### Original app endpoints not yet wrapped

These are known from `2140-research/api_list.json` and should be restored only when a page or feature needs them.

| Area | Missing endpoints |
| --- | --- |
| Auth/account | `/login/mobile_register/`, `/logout/index/`, `/user/forget_passwd/`, `/user/get_verify_code/`, `/user/mobile_bind/`, `/user/update_info/` |
| Pay/store | `/pay/submit_order/`, `/store/create_store_invite_code/`, `/store/get_contact/`, `/store/get_gift_bags/`, `/store/get_order/`, `/store/submit_contact/`, `/store/submit_order/` |
| User records | `/user/get_user_bill/`, `/user/get_user_friends/`, `/user/get_user_write/`, `/user/join_race/` |
| City Code | `/cityCode/give_tip/` |
| Gene sequencing | `/geneSequencing/get_match_records/`, `/geneSequencing/get_user_last_record/`, `/geneSequencing/replace_question/`, `/geneSequencing/restart_select_question/` |
| Writing | `/write/branch_add/`, `/write/branch_chapter_ope/`, `/write/chapter_vote/`, `/write/comment_support/`, `/write/get_chapter_content/`, `/write/get_chapter_tips/`, `/write/get_chapter_vote/`, `/write/get_chapter_vote_winner/`, `/write/get_chapters_by_sequel/`, `/write/get_comments/`, `/write/get_theme/1`, `/write/give_tip/`, `/write/grade_submit/`, `/write/reference_submit/` |

## Plugin-only or newer endpoints

The current plugin also calls endpoints that were not present in the original 75-endpoint APK extraction. Treat these as newer 2140 API surface or plugin discoveries:

- `bulletin/*`
- `parliament/*`
- `racewar/*`
- `branchMission/*`
- `prop/*`
- `treasureHunt/*`
- `digitalPerson/*`
- `nft/*`
- `hashrateEngine/*`
- `writeInvestment/*`
- `racePlaza/*`
- `genesisKeys/*`
- `bilndBox/*` (spelling follows the live API)

Before changing these, verify against live responses or a newer research capture.

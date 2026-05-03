# CityCode and Write Page Crosswalk

Reference archive: `/Users/tony/Projects/2140-research/web/html`

This document tracks how the plugin currently maps to the original 2140 app pages. Use it before changing CityCode or Write behavior.

## CityCode

### Original Pages

| Original page | Core behavior | API calls |
| --- | --- | --- |
| `city_code_index.html` | Category entry grid and unread count. | `/cityCode/get_unread_amount/` |
| `city_code_proposals.html` | Proposal list by type/category/page/sort/scope. Supports cards directly for proposal lists. | `/cityCode/get_proposals/{type}/{category}/{page}/{sort}/{scope}`, `/cityCode/support_proposal/{seq}/{type}` |
| `city_code_proposal_audit.html` | Proposal detail during audit, support/against voting, progress metadata. | `/cityCode/get_proposal/{seq}`, `/cityCode/support_proposal/{seq}/{type}` |
| `city_code_bill.html` | Formal bill detail, amendment lists split by type, amendment support, proposal tipping, amendment submission. | `/cityCode/get_proposal/{seq}`, `/cityCode/get_amendments/{type}/{seq}/{page}/{sort}`, `/cityCode/support_amendment/{seq}`, `/cityCode/give_tip/{seq}`, `/cityCode/submit_add_amendment/{seq}` |
| `city_code_proposal_add.html` | Create proposal with title/content/image/category. | `/cityCode/proposal_add/` |

### Plugin State

| Plugin route/component | Current coverage | Gap |
| --- | --- | --- |
| `/citycode` | Aggregates formal type-3 proposals across 20 categories and renders inline expandable cards. | No original category landing visuals or type/scope/sort controls. |
| `/citycode/[seq]` | Shows proposal detail, support/against/target/amendment metrics, image, and type-1/type-2 amendment lists. Falls back to list data if the live detail endpoint is unavailable. | Read-only; support/against actions, tipping, and amendment submission are not wired. |
| `CityCodeClient` | Shows proposal id/title/content/image/support counts and category filters, and links expanded cards to details. | Uses simplified cards instead of original bill/proposal page structure. |
| `api2140.ts` | Has typed proposal/amendment wrappers and mutations. | Wrappers are ready, but UI routes for detail/amendment actions are not wired yet. |

### Field Notes

- `CityCodeProposal.author_nickname` appears in list responses; `user_nickname` appears in detail responses.
- `support_num` / `against_num` are formal bill counts; original proposal-list UI also uses `target`, `supported`, and `scope`.
- `type=3` in original proposal list is the formal bill view that shows `last_contents` and `amendment_count`.
- Original amendment list fetches both type `1` and type `2`; type `2` is paginated and sortable.

## Write

### Original Pages

| Original page | Core behavior | API calls |
| --- | --- | --- |
| `write_index.html` | Theme intro, timeline nodes, branch drawer by node, hot/time sort, create branch entry. | `/write/get_theme/1`, `/write/get_time_nodes/1`, `/write/get_branchs/{nodeSeq}/{sort}` |
| `write_branch.html` | Branch detail, chapter list, branch comments, add chapter, edit/admin chapter ordering. | `/write/get_branch/{seq}`, `/write/get_chapters/{branchSeq}/{type}/{sort}`, `/write/get_comments/{seq}/1/{page}`, `/write/comment_add/`, `/write/branch_chapter_ope/` |
| `write_branch_add.html` | Create or update branch with cover/title/content. | `/write/branch_add/` |
| `write_chapter.html` | Chapter detail, grade, vote, tips, comments, sequel recommendations, reference/unreference, share. | `/write/get_chapter/{branchSeq}/{chapterSeq}`, `/write/get_chapter_vote/{voteSeq}`, `/write/chapter_vote/{voteSeq}/{option}/{amount}`, `/write/get_chapters_by_sequel/{branchSeq}/{chapterSeq}/hot/{page}/{limit}`, `/write/get_comments/{chapterSeq}/2/{page}`, `/write/comment_support/{commentSeq}/{type}`, `/write/comment_add/`, `/write/reference_submit/{branchSeq}/{chapterSeq}/{ope}`, `/write/give_tip/{chapterSeq}`, `/write/grade_submit/{chapterSeq}/{score}` |
| `write_chapter_add.html` | Add/update/sequel chapter with optional vote. | `/write/chapter_add/`, `/write/get_chapter_content/{branchSeq}/{chapterSeq}` |
| `write_sequel_more.html` | Full sequel/reference chapter list. | `/write/get_chapters_by_sequel/{branchSeq}/{chapterSeq}/hot/0/9999` |
| `write_vote_winner.html` | Vote winners/rewards. | `/write/get_chapter_vote_winner/{voteSeq}` |

### Plugin State

| Plugin route/component | Current coverage | Gap |
| --- | --- | --- |
| `/write` | Requires login, shows simplified submission card, recent updates, and branch list. | Does not show original theme hero, full time-node interaction, branch drawer, or branch creation flow. |
| `/write/branch/[seq]` | Shows branch title/metadata/description and chapters. | No branch comments, add/edit/admin actions, sort tabs, or original cover treatment. |
| `/write/chapter/[bseq]/[cseq]` | Shows chapter content, investment info, and comments. | No grade/vote UI, tips, sequel/reference list, comment support, previous/next navigation actions beyond raw fields. |
| `api2140.ts` | Has typed theme/time-node/branch/chapter/comment wrappers plus original mutation wrappers. | Some newer plugin endpoints still use loose types; original add/update forms are not wired into UI. |

### Field Notes

- Original write branch cards use `title`, `hashrate`, `author`, and `time`; plugin pages also tolerate `name`, `author_nickname`, `chapter_count`, and `lv` from newer endpoints.
- Original chapter detail uses `author_nick`; plugin pages currently also check `author_nickname`.
- Original comments endpoint returns grouped data for wonderful and normal comments; newer plugin `get_comments_by_sort` can return a flatter list.
- Original vote flow caps a user's per-round vote amount at 500 and minimum vote amount at 20.

## Recommended Next UI Work

1. Add `/citycode/[seq]` to show original-style proposal detail plus amendment tabs using the now-typed wrappers.
2. Add support/against actions behind explicit logged-in checks.
3. Restore `/write` theme and time-node layout before adding creation forms.
4. Add chapter detail side panels for vote, grade, sequel/reference, and tips after the read-only route is stable.

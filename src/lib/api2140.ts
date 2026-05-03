const BASE = process.env.API_BASE ?? 'https://www.2140city.cn'

export type ApiResponse<T = any> = {
  ret: number
  msg?: string
  count?: number
  data: T
}

export type ApiRecord = Record<string, any>
export type RaceId = '1' | '2' | '3' | '4' | '5' | '6'

export type UserInfo = {
  nickname: string
  avatar: string
  mobile: string
  hashrate: string
  token: string
  total_token: string
  race: RaceId | string
  race_lv?: string
  reg_limit?: number
}

export type HashratePoolDetail = Record<string, {
  hashrate_count: string
  reward_amount: number | string
  race: number | string
}>

export type HashratePool = ApiRecord & {
  seq: string
  total_count: string
  reward_amount: string
  name: string
  hashrate_pool_detail: HashratePoolDetail
  status: string
  start_time: string
  end_time: string
  user_hashrate: string
  user_hashrate_inputed: number
  countdonw: number
}

export type HashrateRank = {
  reward_sum: string
  hashrate_sum: string
  user_seq: string
  user_nickname: string
  user_avatar: string
  user_race: RaceId | string
  user_token: string
}

export type HashrateBall = ApiRecord & {
  seq: string
  hashrate: string | number
  b_level: string | number
  rec_time?: string
}

export type CityCodeProposal = ApiRecord & {
  seq: string
  proposal_seq?: string
  user_seq?: string
  id: string
  title: string
  content: string
  introduce_img: string
  target?: string
  target_num?: string
  support_num: string
  against_num: string
  supported?: number | string
  support_seqs?: string
  against_seqs?: string
  status: string
  deadline?: string
  time: string
  author_avatar?: string
  author_nickname?: string
  user_nickname?: string
  scope: string
  scope_text?: string
  poundage?: string
  amendment_count: string
  category?: number
  last_contents?: string | string[]
}

export type CityCodeAmendment = ApiRecord & {
  seq: string
  proposal_seq: string
  user_seq?: string
  title: string
  content: string
  introduce_img: string
  support_num?: string
  support_count?: string
  supported?: number | string
  time: string
  author_avatar?: string
  author_nickname?: string
  user_nickname?: string
}

export type WriteTheme = ApiRecord & {
  seq: string
  node_seq: string
  title: string
  desc: string
  cover: string
  chapters: string
  status: string
  time: string
  author: string
  hashrate: string
  time_node: string
  end_chapter: string
}

export type WriteTimeNode = ApiRecord & {
  seq: string
  node_time: string
  node_title: string
  node_txt: string
  status: string | number
}

export type WriteBranch = ApiRecord & {
  seq: string
  title: string
  name?: string
  content?: string
  desc?: string
  cover?: string
  hashrate: string
  author: string
  author_nickname?: string
  time: string
  lv?: string
  level?: string
  chapter_count?: string | number
  is_author?: number | boolean
}

export type WriteChapter = ApiRecord & {
  seq: string
  branch_seq?: string
  title: string
  content: string
  author_nick?: string
  author_nickname?: string
  author_avatar?: string
  time: string
  hashrate?: string
  score?: number | string
  grade_avg?: string
  read_count?: string | number
  parent_seq?: string | number
  next_seq?: string | number
}

export type WriteComment = ApiRecord & {
  seq: string
  user_avatar: string
  user_nick: string
  time: string
  content: string
  support_count?: string | number
  support_seqs?: string
}

export type GeneIdentity = ApiRecord & {
  seq?: string
  name?: string
  label?: string
  personal_text?: string
  group_text?: string
}

export type GeneSequencingRecord = ApiRecord & {
  seq?: string
  fir_gene?: GeneIdentity
  sec_gene?: GeneIdentity
  genes?: {
    fir_gene?: GeneIdentity
    sec_gene?: GeneIdentity
    standard?: string | number
    test_seq?: string
  }
  selecteds?: string
  standard?: string | number
  time?: string
}

export type DigitalPerson = ApiRecord & {
  standard1: number | string
  standard2: number | string
  standard3: number | string
  standard4: number | string
  standard_sum: number | string
  member_lv?: number | string
  person_lv: number | string
  time?: string
}

export type GeneMatchRecord = ApiRecord & {
  seq: string
  matcher_nickname?: string
  matcher_avatar?: string
  match_rate?: string | number
  reward?: string | number
  time?: string
}

export type GenesisKeyStatus = ApiRecord & {
  standard1?: number | string
  standard2?: number | string
  standard3?: number | string
  standard4?: number | string
  status?: number | string
  time?: string
}

export const RACE_NAMES: Record<string, string> = {
  '1': '人族', '2': '熵族', '3': '神族',
  '4': '晓族', '5': 'AI族', '6': '零族',
}

export const RACE_COLORS: Record<string, string> = {
  '1': '#3b82f6', '2': '#f97316', '3': '#a855f7',
  '4': '#22c55e', '5': '#06b6d4', '6': '#6b7280',
}

function formBody(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) params.set(key, String(value))
  }
  return params.toString()
}

function normalizeHashratePoolDetail(detail: unknown): HashratePoolDetail {
  if (typeof detail === 'string') {
    try {
      return JSON.parse(detail) as HashratePoolDetail
    } catch {
      return {}
    }
  }
  if (detail && typeof detail === 'object') return detail as HashratePoolDetail
  return {}
}

async function req<T = any>(path: string, opts: RequestInit = {}, cookie?: string): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Mobile Safari/537.36',
    ...(opts.headers as Record<string, string>),
  }
  if (cookie) headers['Cookie'] = `ci_session=${cookie}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`2140 API ${res.status} ${res.statusText}: ${path}`)
  }
  return res.json() as Promise<ApiResponse<T>>
}

function dataOr<T>(res: ApiResponse<T>, fallback: T): T {
  return res.ret === 0 ? res.data : fallback
}

function listOr<T>(res: ApiResponse<T[]>, fallback: T[] = []): T[] {
  return Array.isArray(res.data) && res.ret === 0 ? res.data : fallback
}

export async function login(mobile: string, passwdMd5: string) {
  // Returns cookie_key on success
  const data = await req<{ cookie_key: string }>('/login/index/mobile/', {
    method: 'POST',
    body: formBody({ mobile, passwd: passwdMd5 }),
  })
  return data.ret === 0 ? data.data.cookie_key : null
}

export async function getUserInfo(cookie: string) {
  return req<UserInfo>('/index/get_user_info/', {}, cookie)
}

export async function getHashratePool(cookie: string) {
  const res = await req<HashratePool>('/hashratePool/get_current_hashrate_pool/', {}, cookie)
  if (res.ret !== 0) return null
  const d = res.data
  return {
    ...d,
    hashrate_pool_detail: normalizeHashratePoolDetail(d.hashrate_pool_detail),
  }
}

export async function getRanks(cookie: string) {
  const res = await req<HashrateRank[]>('/hashratePool/get_ranks/', {}, cookie)
  return listOr(res)
}

export async function getRaces() {
  const res = await req<Array<{ seq: RaceId | string; name: string }>>('/race/get_races/')
  return listOr(res)
}

export async function getProposals(cookie: string, type = 3, category = 0, page = 0, sort = 1, scope = 0) {
  const path = type === 3 && category === 0
    ? '/cityCode/get_proposals/'
    : type === 3
    ? `/cityCode/get_proposals/${type}/${category}/${page}//`
    : `/cityCode/get_proposals/${type}/${category}/${page}/${sort}/${scope}`
  const res = await req<CityCodeProposal[]>(path, {}, cookie)
  return dataOr(res, [])
}

export async function getAllCityCodeBills(cookie: string) {
  const results = await Promise.allSettled(
    Array.from({ length: 20 }, (_, i) =>
      req<CityCodeProposal[]>(`/cityCode/get_proposals/3/${i + 1}/0//`, {}, cookie)
        .then(res => listOr(res).map(b => ({ ...b, category: i + 1 })))
    )
  )
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

export async function addChapter(cookie: string, content: string, sequelId = 1, branchId = 1) {
  return req('/write/chapter_add/', {
    method: 'POST',
    body: formBody({ content, sequel_id: sequelId, branch_id: branchId }),
  }, cookie)
}

export async function addProposal(cookie: string, title: string, content: string) {
  return req('/cityCode/proposal_add/', {
    method: 'POST',
    body: formBody({ title, content }),
  }, cookie)
}

export async function inputHashrate(cookie: string, poolSeq: string, amount: number) {
  return req('/hashratePool/input_hashrate/', {
    method: 'POST',
    body: formBody({ pool_seq: poolSeq, amount }),
  }, cookie)
}

// Research archive coverage: original 2140 app endpoints confirmed in
// /Users/tony/Projects/2140-research/api_list.json.
export async function getLastHashrateLuckyer(cookie: string) {
  const res = await req('/hashratePool/get_last_luckyer/', {}, cookie)
  return dataOr(res, null)
}

export async function getHashrateBalls(cookie: string) {
  const res = await req('/index/get_hashrate_ball/', {}, cookie)
  return dataOr(res, null)
}

export async function clickHashrateBall(cookie: string, seq: string) {
  return req(`/index/click_hashrate_ball/${seq}`, {}, cookie)
}

export async function getLatestVersion() {
  return req('/index/get_latest_version/')
}

export async function getCityCodeProposal(cookie: string, seq: string) {
  const res = await req<CityCodeProposal>(`/cityCode/get_proposal/${seq}`, {}, cookie)
  return dataOr(res, null)
}

export async function getCityCodeAmendments(cookie: string, proposalSeq: string, type = 2, page = 0, sort = 1) {
  const res = await req<CityCodeAmendment[]>(`/cityCode/get_amendments/${type}/${proposalSeq}/${page}/${sort}`, {}, cookie)
  return listOr(res)
}

export async function supportCityCodeProposal(cookie: string, proposalSeq: string, type: 1 | 2 = 1) {
  return req(`/cityCode/support_proposal/${proposalSeq}/${type}`, {}, cookie)
}

export async function supportCityCodeAmendment(cookie: string, amendmentSeq: string) {
  return req(`/cityCode/support_amendment/${amendmentSeq}`, {}, cookie)
}

export async function getCityCodeUnreadAmount(cookie: string, openTime = '') {
  const res = await req('/cityCode/get_unread_amount/', {
    method: openTime ? 'POST' : 'GET',
    body: openTime ? formBody({ open_time: openTime }) : undefined,
  }, cookie)
  return dataOr(res, null)
}

export async function addCityCodeAmendment(cookie: string, proposalSeq: string, title: string, content: string, img?: string) {
  return req(`/cityCode/submit_add_amendment/${proposalSeq}`, {
    method: 'POST',
    body: formBody({ title, content, img }),
  }, cookie)
}

export async function tipCityCodeProposal(cookie: string, proposalSeq: string, amount: number) {
  return req(`/cityCode/give_tip/${proposalSeq}`, {
    method: 'POST',
    body: formBody({ amount }),
  }, cookie)
}

export async function getUserHashrate(cookie: string) {
  const res = await req('/user/get_user_hashrate/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getUserTotalToken(cookie: string) {
  const res = await req('/user/get_user_total_token/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getUserInvite(cookie: string) {
  const res = await req('/user/get_user_invite_count/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getSpeeches(cookie: string) {
  const res = await req('/racePlaza/get_speechs/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getBills(cookie: string) {
  const res = await req('/parliament/get_bills/0', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getParliamentUser(cookie: string) {
  const res = await req('/parliament/get_parliament_user/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getOfficials(cookie: string) {
  const res = await req('/parliament/get_officials/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getOfficialInfo(cookie: string) {
  const res = await req('/parliament/get_official/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getActiveValRank(cookie: string) {
  const res = await req('/parliament/get_active_val_rank', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getBulletins(cookie: string) {
  const res = await req('/bulletin/get_bulletins/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getBranchMaps(cookie: string) {
  const res = await req('/racewar/get_branch_maps/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getMapSituation(cookie: string) {
  const res = await req('/racewar/get_map_situation/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getBranchMapSituation(cookie: string) {
  const res = await req('/racewar/get_branch_map_situation/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getRacewarMaps(cookie: string) {
  const res = await req('/racewar/get_maps/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getRacewarMap(cookie: string, mapSeq: string | number, race: string | number = 1) {
  const res = await req(`/racewar/get_map/${mapSeq}/${race}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getRacewarDebriss(cookie: string, mapSeq: string | number) {
  const res = await req(`/racewar/get_debriss/${mapSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getCreationRank(cookie: string) {
  const res = await req('/racewar/get_creation_index_rank/1/0/3/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getTimeNodes(cookie: string) {
  const res = await req<WriteTimeNode[]>('/write/get_time_nodes/1', {}, cookie)
  return listOr(res)
}

export async function getWriteTheme(cookie: string, themeSeq = '1') {
  const res = await req<WriteTheme>(`/write/get_theme/${themeSeq}`, {}, cookie)
  return dataOr(res, null)
}

export async function getTheme8(cookie: string) {
  const res = await req('/write/get_theme8/2', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getDebrisRank(cookie: string, mapSeq = 1) {
  const res = await req(`/racewar/get_debris_rank/${mapSeq}/`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getTotalRank(cookie: string, mapSeq = 1) {
  const res = await req(`/racewar/get_total_rank/${mapSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getMapRank(cookie: string, mapSeq: string) {
  const res = await req(`/racewar/get_map_rank/${mapSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getGenesisKeysUsers(cookie: string) {
  const res = await req('/genesisKeys/get_genesis_keys_users/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getGeneQuestions(cookie: string) {
  const res = await req('/geneSequencing/get_questions/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getGeneLastRecord(cookie: string) {
  const res = await req<GeneSequencingRecord>('/geneSequencing/get_user_last_record/', {}, cookie)
  return dataOr(res, null)
}
export async function getGeneMatchRecords(cookie: string) {
  const res = await req<{ count: number; records: GeneMatchRecord[] }>('/geneSequencing/get_match_records/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function submitGeneSequencing(cookie: string, body: string) {
  const res = await req('/geneSequencing/submit_selected_question/', { method: 'POST', body }, cookie)
  return res
}

export async function getPropPath(cookie: string) {
  const res = await req('/prop/get_prop_path/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 道具背包 ────────────────────────────────────────────────
export async function getMyProps(cookie: string) {
  const res = await req('/prop/get_my_props/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getAllProps(cookie: string) {
  const res = await req('/prop/get_all_props/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getPropUserRank(cookie: string) {
  const res = await req('/prop/get_prop_user_rank/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

// ── 种族战争任务 ────────────────────────────────────────────
export async function getRacewarTasks(cookie: string) {
  const res = await req('/racewar/get_tasks/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getBranchMissions(cookie: string) {
  const res = await req('/branchMission/get_missions/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getCompletedMissions(cookie: string) {
  const res = await req('/branchMission/get_completed_missions/', {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getDebrisTask(cookie: string, debrisSeq: string) {
  const res = await req(`/racewar/get_debris_task/${debrisSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 算力竞技场 ──────────────────────────────────────────────
export async function getHashrateGoods(cookie: string) {
  const res = await req('/user/get_hashrate_goods/', {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getHashrateEngine(cookie: string) {
  const res = await req('/hashrateEngine/get_user_hashrate_engine/0', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getHashrateEngineRecords(cookie: string, page = 0) {
  const res = await req(`/hashrateEngine/get_hashrate_engine_records/0/${page}/20`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getHashratePoolRank(cookie: string, type = 1, scope = 0) {
  const res = await req(`/hashratePool/get_ranks/${type}/${scope}`, {}, cookie)
  return res.ret === 0 ? res.data : []
}

// ── 寻宝 ────────────────────────────────────────────────────
export async function getTreasureUserInfo(cookie: string) {
  const res = await req('/treasureHunt/get_user_info/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getTreasureFutureDebris(cookie: string) {
  const res = await req('/treasureHunt/get_futuredebris/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getTreasureRewardRank(cookie: string, type = 1) {
  const res = await req(`/treasureHunt/get_reward_rank/${type}/0/50`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getTreasureMaze(cookie: string) {
  const res = await req('/treasureHunt/get_maze/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 盲盒 ────────────────────────────────────────────────────
export async function getBlindBoxList(cookie: string, page = 0) {
  const res = await req(`/bilndBox/get_bilnd_box_partake/${page}/20`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getBlindBoxMy(cookie: string, page = 0) {
  const res = await req(`/bilndBox/get_bilnd_box_my/${page}/20`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getBlindBoxDetail(cookie: string, seq: string) {
  const res = await req(`/bilndBox/get_bilnd_box/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 数字人 ──────────────────────────────────────────────────
export async function getDigitalPerson(cookie: string) {
  const res = await req<DigitalPerson>('/digitalPerson/get_user_digital_person/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getDigitalPersonRewards(cookie: string) {
  const res = await req('/digitalPerson/get_digital_person_rewards/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getDigitalPersonRank(cookie: string) {
  const res = await req('/digitalPerson/get_rank/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

// ── NFT ─────────────────────────────────────────────────────
export async function getNfts(cookie: string) {
  const res = await req('/nft/get_nfts/99999', {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getNft(cookie: string, seq: string) {
  const res = await req(`/nft/get_nft/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getUserNfts(cookie: string, page = 0) {
  const res = await req(`/nft/get_user_nfts/${page}`, {}, cookie)
  return res.ret === 0 ? res.data : []
}

// ── 商店 ────────────────────────────────────────────────────
export async function getStoreGoods(cookie: string) {
  const res = await req('/store/get_goods_list/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getStoreGoodsDetail(cookie: string, seq: string) {
  const res = await req(`/store/get_goods/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getStoreGoodsMore(cookie: string) {
  const res = await req('/store/get_goods_more/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

// ── 任务系统 ────────────────────────────────────────────────
export async function getTasks(cookie: string) {
  const res = await req('/task/get_tasks/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

// ── 我的记录 ────────────────────────────────────────────────
export async function getUserVotes(cookie: string, page = 0, type = 0) {
  const res = await req(`/user/get_user_vote/${page}/${type}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getUserOrders(cookie: string) {
  const res = await req('/user/get_user_orders/', {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getUserTokenRecords(cookie: string, page = 0) {
  const res = await req(`/user/get_user_token/${page}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 公告 ────────────────────────────────────────────────────
export async function getBulletinList(cookie: string, page = 0) {
  const res = await req(`/bulletin/get_bulletins/${page}`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getBulletinDetail(cookie: string, seq: string) {
  const res = await req(`/bulletin/get_bulletin/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 碎片详情 ────────────────────────────────────────────────
export async function getDebrisDetail(cookie: string, seq: string) {
  const res = await req(`/racewar/get_debris/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getDebrisInfo(cookie: string, seq: string) {
  const res = await req(`/racewar/get_debris_info/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getDebrisHealthInfo(cookie: string, seq: string) {
  const res = await req(`/racewar/get_debris_health_info/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getDebrisResidents(cookie: string, seq: string, page = 0) {
  const res = await req(`/racewar/get_debris_residents/${seq}/${page}/20`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getDebrisRankDetail(cookie: string, seq: string) {
  const res = await req(`/racewar/get_debris_rank/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getDebrisCitySets(cookie: string, seq: string, type = 1, page = 0) {
  const res = await req(`/racewar/get_city_sets/${type}/${seq}/${page}`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getDebrisPropUseRecords(cookie: string, seq: string, type = 101, level = 1, page = 0, size = 10) {
  const res = await req(`/prop/get_prop_use_records/${seq}/${type}/${level}/${page}/${size}`, {}, cookie)
  return res.ret === 0 ? { data: res.data, count: res.count ?? 0 } : { data: [], count: 0 }
}

// ── 写作系统 ────────────────────────────────────────────────
export async function getWriteBranchs(cookie: string, nodeSeq = '1', sort = '1') {
  const res = await req<WriteBranch[]>(`/write/get_branchs/${nodeSeq}/${sort}`, {}, cookie)
  return listOr(res)
}
export async function getWriteBranch(cookie: string, seq: string) {
  const res = await req<WriteBranch>(`/write/get_branch/${seq}`, {}, cookie)
  return dataOr(res, null)
}
export async function getWriteChapters(cookie: string, branchSeq: string, type = '1', sort = '1') {
  const res = await req<WriteChapter[]>(`/write/get_chapters/${branchSeq}/${type}/${sort}`, {}, cookie)
  return listOr(res)
}
export async function getWriteChapter(cookie: string, branchSeq: string, chapterSeq: string) {
  const res = await req<WriteChapter>(`/write/get_chapter/${branchSeq}/${chapterSeq}`, {}, cookie)
  return dataOr(res, null)
}
export async function getRecentUpdates(cookie: string, page = 0) {
  const res = await req<WriteChapter[]>(`/write/get_recent_updates/${page}/5/2`, {}, cookie)
  return listOr(res)
}
export async function getChapterComments(cookie: string, seq: string, type = '2', sort = '1', page = 0) {
  const res = await req<WriteComment[]>(`/write/get_comments_by_sort/${seq}/${type}/${sort}/${page}`, {}, cookie)
  return listOr(res)
}
export async function addWriteComment(cookie: string, belongSeq: string, type: string, comment: string) {
  return req('/write/comment_add/', { method: 'POST', body: formBody({ belong_seq: belongSeq, type, comment }) }, cookie)
}
export async function getChapterSequels(cookie: string, branchSeq: string, chapterSeq: string) {
  const res = await req(`/write/get_chapter_sequels/${branchSeq}/${chapterSeq}/1/0/10000`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getMyWriteChapters(cookie: string) {
  const res = await req<WriteChapter[]>('/write/get_chapters/', {}, cookie)
  return listOr(res)
}

export async function addWriteBranch(
  cookie: string,
  type: 1 | 2,
  seq: string,
  title: string,
  content: string,
  cover?: string,
) {
  return req('/write/branch_add/', {
    method: 'POST',
    body: formBody({ type, seq, title, content, cover }),
  }, cookie)
}

export async function updateBranchChapterOrder(cookie: string, branchSeq: string, type: string, chapters: string) {
  return req('/write/branch_chapter_ope/', {
    method: 'POST',
    body: formBody({ branch_seq: branchSeq, type, chapters }),
  }, cookie)
}

export async function getWriteChapterContent(cookie: string, branchSeq: string, chapterSeq: string) {
  const res = await req(`/write/get_chapter_content/${branchSeq}/${chapterSeq}`, {}, cookie)
  return dataOr(res, null)
}

export async function getWriteChapterTips(cookie: string, chapterSeq: string) {
  const res = await req(`/write/get_chapter_tips/${chapterSeq}`, {}, cookie)
  return dataOr(res, null)
}

export async function getWriteChapterVote(cookie: string, voteSeq: string) {
  const res = await req(`/write/get_chapter_vote/${voteSeq}`, {}, cookie)
  return dataOr(res, null)
}

export async function voteWriteChapter(cookie: string, voteSeq: string, optionIndex: number, amount: number) {
  return req(`/write/chapter_vote/${voteSeq}/${optionIndex}/${amount}`, {}, cookie)
}

export async function supportWriteComment(cookie: string, commentSeq: string, type: 1 | 2) {
  return req(`/write/comment_support/${commentSeq}/${type}`, {}, cookie)
}

export async function getWriteComments(cookie: string, belongSeq: string, type = '2', page = 0) {
  const res = await req(`/write/get_comments/${belongSeq}/${type}/${page}`, {}, cookie)
  return dataOr(res, null)
}

export async function getWriteChaptersBySequel(cookie: string, branchSeq: string, chapterSeq: string, sort = 'hot', page = 0, limit = 5) {
  const res = await req(`/write/get_chapters_by_sequel/${branchSeq}/${chapterSeq}/${sort}/${page}/${limit}`, {}, cookie)
  return dataOr(res, null)
}

export async function getWriteChapterVoteWinner(cookie: string, voteSeq: string) {
  const res = await req(`/write/get_chapter_vote_winner/${voteSeq}`, {}, cookie)
  return dataOr(res, null)
}

export async function tipWriteChapter(cookie: string, chapterSeq: string, amount: number) {
  return req(`/write/give_tip/${chapterSeq}`, {
    method: 'POST',
    body: formBody({ amount }),
  }, cookie)
}

export async function submitWriteGrade(cookie: string, chapterSeq: string, score: number) {
  return req(`/write/grade_submit/${chapterSeq}/${score}`, {}, cookie)
}

export async function submitWriteReference(cookie: string, branchSeq: string, chapterSeq: string, ope: 1 | 2) {
  return req(`/write/reference_submit/${branchSeq}/${chapterSeq}/${ope}`, {}, cookie)
}

// ── 写作投资 ────────────────────────────────────────────────
export async function getInvestmentIndex(cookie: string) {
  const res = await req('/writeInvestment/get_investment_index_rank/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getInvestmentUser(cookie: string) {
  const res = await req('/writeInvestment/get_investment_user/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getInvestmentRank(cookie: string) {
  const res = await req('/writeInvestment/get_investment_rank/', {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function getInvestmentInfo(cookie: string, chapterSeq: string) {
  const res = await req(`/writeInvestment/get_investment_info/${chapterSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getChapterRoundReward(cookie: string, chapterSeq: string) {
  const res = await req(`/writeInvestment/get_user_round_reward/${chapterSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getUserCoinRecords(cookie: string, page = 0) {
  const res = await req(`/writeInvestment/get_user_coin_records/${page}`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function investHashrate(cookie: string, chapterSeq: string, amount: number) {
  return req(`/writeInvestment/user_hashrate_investment/${chapterSeq}`, { method: 'POST', body: `amount=${amount}` }, cookie)
}
export async function investToken(cookie: string, chapterSeq: string, amount: number) {
  return req(`/writeInvestment/user_token_investment/${chapterSeq}`, { method: 'POST', body: `amount=${amount}` }, cookie)
}

// ── 道具详情/排行 ────────────────────────────────────────────
export async function getPropDetail(cookie: string, seq: string) {
  const res = await req(`/prop/get_prop/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getPropUseRecords(cookie: string, page = 0) {
  const res = await req(`/prop/get_prop_use_records/0/0/0/${page}/20`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getUserPropRewards(cookie: string) {
  const res = await req('/prop/get_user_rewards/', {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getPropDrawInfo(cookie: string, debrisSeq: string) {
  const res = await req(`/prop/get_prop_draw_info/${debrisSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 创世密钥 ────────────────────────────────────────────────
export async function getGenesisKeys(cookie: string) {
  const res = await req<GenesisKeyStatus>('/genesisKeys/get_genesis_keys2/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

// ── 用户空间 ────────────────────────────────────────────────
export async function getUserSpace(cookie: string, userSeq: string) {
  const res = await req(`/user/get_user_space2/${userSeq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getUserSpaceJournals(cookie: string, masterSeq: string, page = 0) {
  const res = await req(`/user/get_user_space_journals/1/${masterSeq}/${page}`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function addJournal(cookie: string, masterSeq: string, content: string) {
  return req(`/user/user_space_journal_add/${masterSeq}`, { method: 'POST', body: `content=${encodeURIComponent(content)}` }, cookie)
}

// ── 广场发帖/详情 ────────────────────────────────────────────
export async function getSpeech(cookie: string, seq: string) {
  const res = await req(`/racePlaza/get_speech/${seq}`, {}, cookie)
  return res.ret === 0 ? res.data : null
}
export async function getSpeechComments(cookie: string, seq: string, page = 0) {
  const res = await req(`/racePlaza/get_comments/${seq}/${page}/20`, {}, cookie)
  return res.ret === 0 ? res.data : []
}
export async function addSpeech(cookie: string, title: string, content: string) {
  return req('/racePlaza/speech_add/', { method: 'POST', body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}` }, cookie)
}
export async function addSpeechComment(cookie: string, speechSeq: string, comment: string) {
  return req(`/racePlaza/comment_add/${speechSeq}`, { method: 'POST', body: `comment=${encodeURIComponent(comment)}&type=1` }, cookie)
}

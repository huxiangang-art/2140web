const BASE = process.env.API_BASE ?? 'https://www.2140city.cn'

export const RACE_NAMES: Record<string, string> = {
  '1': '人族', '2': '熵族', '3': '神族',
  '4': '晓族', '5': 'AI族', '6': '零族',
}

export const RACE_COLORS: Record<string, string> = {
  '1': '#3b82f6', '2': '#f97316', '3': '#a855f7',
  '4': '#22c55e', '5': '#06b6d4', '6': '#6b7280',
}

async function req(path: string, opts: RequestInit = {}, cookie?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Mobile Safari/537.36',
    ...(opts.headers as Record<string, string>),
  }
  if (cookie) headers['Cookie'] = `ci_session=${cookie}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: 'no-store' })
  return res.json()
}

export async function login(mobile: string, passwdMd5: string) {
  // Returns cookie_key on success
  const data = await req('/login/index/mobile/', {
    method: 'POST',
    body: `mobile=${mobile}&passwd=${passwdMd5}`,
  })
  return data.ret === 0 ? data.data.cookie_key : null
}

export async function getUserInfo(cookie: string) {
  return req('/index/get_user_info/', {}, cookie)
}

export async function getHashratePool(cookie: string) {
  const res = await req('/hashratePool/get_current_hashrate_pool/', {}, cookie)
  if (res.ret !== 0) return null
  const d = res.data
  return {
    ...d,
    hashrate_pool_detail: typeof d.hashrate_pool_detail === 'string'
      ? JSON.parse(d.hashrate_pool_detail)
      : d.hashrate_pool_detail,
  }
}

export async function getRanks(cookie: string) {
  const res = await req('/hashratePool/get_ranks/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getRaces() {
  const res = await req('/race/get_races/')
  return res.ret === 0 ? res.data : []
}

export async function getProposals(cookie: string, type = 3, category = 0, page = 0) {
  const path = type === 3 && category === 0
    ? '/cityCode/get_proposals/'
    : `/cityCode/get_proposals/${type}/${category}/${page}//`
  const res = await req(path, {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getAllCityCodeBills(cookie: string) {
  const results = await Promise.allSettled(
    Array.from({ length: 20 }, (_, i) =>
      req(`/cityCode/get_proposals/3/${i + 1}/0//`, {}, cookie)
        .then(res => (res.ret === 0 ? (res.data ?? []).map((b: any) => ({ ...b, category: i + 1 })) : []))
    )
  )
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

export async function addChapter(cookie: string, content: string, sequelId = 1, branchId = 1) {
  return req('/write/chapter_add/', {
    method: 'POST',
    body: `content=${encodeURIComponent(content)}&sequel_id=${sequelId}&branch_id=${branchId}`,
  }, cookie)
}

export async function addProposal(cookie: string, title: string, content: string) {
  return req('/cityCode/proposal_add/', {
    method: 'POST',
    body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`,
  }, cookie)
}

export async function inputHashrate(cookie: string, poolSeq: string, amount: number) {
  return req('/hashratePool/input_hashrate/', {
    method: 'POST',
    body: `pool_seq=${poolSeq}&amount=${amount}`,
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

export async function getCreationRank(cookie: string) {
  const res = await req('/racewar/get_creation_index_rank/1/0/3/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getTimeNodes(cookie: string) {
  const res = await req('/write/get_time_nodes/1', {}, cookie)
  return res.ret === 0 ? res.data : []
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

export async function getGenesisKeysUsers(cookie: string) {
  const res = await req('/genesisKeys/get_genesis_keys_users/', {}, cookie)
  return res.ret === 0 ? res.data : null
}

export async function getGeneQuestions(cookie: string) {
  const res = await req('/geneSequencing/get_questions/', {}, cookie)
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
  const res = await req('/digitalPerson/get_user_digital_person/', {}, cookie)
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

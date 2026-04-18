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
    'User-Agent': 'Mozilla/5.0 (2140-web)',
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

export async function getProposals(cookie: string) {
  const res = await req('/cityCode/get_proposals/', {}, cookie)
  return res.ret === 0 ? res.data : []
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
  const res = await req('/parliament/get_bills/0/', {}, cookie)
  return res.ret === 0 ? res.data : []
}

export async function getParliamentUser(cookie: string) {
  const res = await req('/parliament/get_parliament_user/', {}, cookie)
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

export async function getDigitalPersonRank(cookie: string) {
  const res = await req('/digitalPerson/get_rank/', {}, cookie)
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

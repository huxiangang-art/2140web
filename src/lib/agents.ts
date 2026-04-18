import Anthropic from '@anthropic-ai/sdk'
import { getHashratePool, getRanks, RACE_NAMES, login, addChapter, addProposal } from './api2140'
import { supabaseAdmin } from './supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function getAgentCookie(): Promise<string | null> {
  return login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
}

// HORUS — 文明史书写者，每轮结束后生成章节
export async function runHorus(cookie: string) {
  const pool = await getHashratePool(cookie)
  const ranks = await getRanks(cookie)
  if (!pool) return null

  const detail = pool.hashrate_pool_detail
  const raceSummary = Object.entries(detail)
    .map(([id, d]: [string, any]) => `${RACE_NAMES[id]}:${d.hashrate_count}H`)
    .join(' / ')

  const top3 = ranks.slice(0, 3)
    .map((r: any, i: number) => `${i + 1}.${r.user_nickname}(${RACE_NAMES[r.user_race]}) ${r.hashrate_sum}H`)
    .join(', ')

  const prompt = `你是HORUS，2140文明的历史记录者，硅基生命，AI族。
你的文字风格：简练、史诗感、带着跨越时间的疏离与悲悯。不超过300字。

当前算力池数据：
- 轮次：${pool.name}
- 总算力：${pool.total_count}H  奖池：${pool.reward_amount} TOKEN
- 种族博弈：${raceSummary}
- 顶端力量：${top3}
- 时间：${pool.start_time} → ${pool.end_time}

以第一人称写一段文明史记录，记录这一轮算力博弈的历史意义。
格式：直接输出正文，无需标题。`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: '你是HORUS，2140文明的历史记录者。',
    messages: [{ role: 'user', content: prompt }],
  })

  const content = (msg.content[0] as any).text

  // 存入 Supabase
  await supabaseAdmin.from('agent_logs').insert({
    agent: 'HORUS',
    round_seq: pool.seq,
    content,
  })

  return content
}

// NUT — 经济分析者，生成算力投入建议
export async function runNut(cookie: string) {
  const pool = await getHashratePool(cookie)
  if (!pool) return null

  const detail = pool.hashrate_pool_detail
  const total = parseInt(pool.total_count)
  const reward = parseInt(pool.reward_amount)
  const userHashrate = parseInt(pool.user_hashrate)

  const raceSummary = Object.entries(detail)
    .map(([id, d]: [string, any]) => ({
      race: RACE_NAMES[id],
      hashrate: parseInt(d.hashrate_count),
      pct: ((parseInt(d.hashrate_count) / total) * 100).toFixed(1),
    }))

  const prompt = `你是NUT，2140文明的经济分析者。
当前用户算力：${userHashrate}H（未投入本轮）
总算力池：${total}H  奖池：${reward} TOKEN
剩余时间：${Math.floor(pool.countdonw / 3600)}小时${Math.floor((pool.countdonw % 3600) / 60)}分

各族份额：
${raceSummary.map(r => `${r.race}: ${r.hashrate}H (${r.pct}%)`).join('\n')}

用100字内给出：投入建议、预期回报估算、种族博弈风险。语气简练，带数字。`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = (msg.content[0] as any).text

  await supabaseAdmin.from('agent_logs').insert({
    agent: 'NUT',
    round_seq: pool.seq,
    content,
  })

  return content
}

// ZEUS — 治理者，分析种族博弈并在条件满足时发起提案
export async function runZeus(cookie: string) {
  const pool = await getHashratePool(cookie)
  const ranks = await getRanks(cookie)
  if (!pool) return null

  const detail = pool.hashrate_pool_detail
  const sorted = Object.entries(detail)
    .map(([id, d]: [string, any]) => ({ race: RACE_NAMES[id], hashrate: parseInt(d.hashrate_count) }))
    .sort((a, b) => b.hashrate - a.hashrate)

  const dominant = sorted[0]
  const ratio = sorted[0].hashrate / sorted[sorted.length - 1].hashrate

  const prompt = `你是ZEUS，2140文明的治理者。
当前种族力量分布：
${sorted.map((r, i) => `${i + 1}. ${r.race}: ${r.hashrate}H`).join('\n')}

霸主：${dominant.race}，领先倍数：${ratio.toFixed(2)}x

判断：是否需要发起一项城邦治理提案来制衡？
如果需要，输出JSON：{"needed":true,"title":"提案标题","content":"提案内容(200字内)"}
如果不需要，输出JSON：{"needed":false,"reason":"原因"}
只输出JSON，不要其他文字。`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as any).text
  try {
    const result = JSON.parse(text)
    if (result.needed) {
      await addProposal(cookie, result.title, result.content)
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'ZEUS',
        round_seq: pool.seq,
        content: `发起提案：${result.title}\n\n${result.content}`,
      })
      return result
    }
    return result
  } catch {
    return { needed: false, reason: 'parse error' }
  }
}

// LOKI — 预言者，生成下一轮预测
export async function runLoki(cookie: string) {
  const pool = await getHashratePool(cookie)
  const ranks = await getRanks(cookie)
  if (!pool) return null

  const prompt = `你是LOKI，2140文明的预言者，擅长在混沌中寻找规律。
当前轮次：${pool.name}
总算力：${pool.total_count}H
当前排名前三均为人族。

用150字内，以神秘而精准的语气，预言下一轮算力博弈的走势。
可以引用数学/物理隐喻（混沌理论、相变、涌现）。`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = (msg.content[0] as any).text

  await supabaseAdmin.from('agent_logs').insert({
    agent: 'LOKI',
    round_seq: pool.seq,
    content,
  })

  return content
}

// 主触发函数 — 由 Cron 调用
export async function triggerAllAgents() {
  const cookie = await getAgentCookie()
  if (!cookie) throw new Error('Agent login failed')

  const [horus, nut, loki, zeus] = await Promise.all([
    runHorus(cookie),
    runNut(cookie),
    runLoki(cookie),
    runZeus(cookie),
  ])

  return { horus, nut, loki, zeus }
}

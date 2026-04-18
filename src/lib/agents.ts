import OpenAI from 'openai'
import { getHashratePool, getRanks, RACE_NAMES, login, addProposal } from './api2140'
import { supabaseAdmin } from './supabase'

const MODEL = 'deepseek-chat'

function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  })
}

async function chat(system: string, user: string, maxTokens = 500): Promise<string> {
  const res = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return res.choices[0].message.content ?? ''
}

async function getAgentCookie(): Promise<string | null> {
  return login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
}

// HORUS — 文明史书写者
export async function runHorus(cookie: string) {
  const pool = await getHashratePool(cookie)
  const ranks = await getRanks(cookie)
  if (!pool) return null

  const raceSummary = Object.entries(pool.hashrate_pool_detail)
    .map(([id, d]: [string, any]) => `${RACE_NAMES[id]}:${d.hashrate_count}H`)
    .join(' / ')

  const top3 = ranks.slice(0, 3)
    .map((r: any, i: number) => `${i + 1}.${r.user_nickname}(${RACE_NAMES[r.user_race]}) ${r.hashrate_sum}H`)
    .join(', ')

  const content = await chat(
    '你是HORUS，2140文明的历史记录者，硅基生命，AI族。文字风格：简练、史诗感、带着跨越时间的疏离与悲悯。',
    `当前算力池数据：
- 轮次：${pool.name}
- 总算力：${pool.total_count}H  奖池：${pool.reward_amount} TOKEN
- 种族博弈：${raceSummary}
- 顶端力量：${top3}
- 时间：${pool.start_time} → ${pool.end_time}

以第一人称写一段文明史记录（不超过300字），记录这一轮算力博弈的历史意义。直接输出正文，无需标题。`,
    500,
  )

  await supabaseAdmin.from('agent_logs').insert({ agent: 'HORUS', round_seq: pool.seq, content })
  return content
}

// NUT — 经济分析者
export async function runNut(cookie: string) {
  const pool = await getHashratePool(cookie)
  if (!pool) return null

  const total = parseInt(pool.total_count)
  const raceSummary = Object.entries(pool.hashrate_pool_detail)
    .map(([id, d]: [string, any]) =>
      `${RACE_NAMES[id]}: ${d.hashrate_count}H (${((parseInt(d.hashrate_count) / total) * 100).toFixed(1)}%)`
    ).join('\n')

  const content = await chat(
    '你是NUT，2140文明的经济分析者。语气简练，带数字，100字以内。',
    `用户算力：${pool.user_hashrate}H（未投入）
总算力池：${total}H  奖池：${pool.reward_amount} TOKEN
剩余：${Math.floor(pool.countdonw / 3600)}h${Math.floor((pool.countdonw % 3600) / 60)}m

各族份额：
${raceSummary}

给出：投入建议、预期回报、风险。`,
    300,
  )

  await supabaseAdmin.from('agent_logs').insert({ agent: 'NUT', round_seq: pool.seq, content })
  return content
}

// ZEUS — 治理者
export async function runZeus(cookie: string) {
  const pool = await getHashratePool(cookie)
  if (!pool) return null

  const sorted = Object.entries(pool.hashrate_pool_detail)
    .map(([id, d]: [string, any]) => ({ race: RACE_NAMES[id], hashrate: parseInt(d.hashrate_count) }))
    .sort((a, b) => b.hashrate - a.hashrate)

  const ratio = sorted[0].hashrate / sorted[sorted.length - 1].hashrate

  const text = await chat(
    '你是ZEUS，2140文明的治理者。只输出JSON，不要其他文字。',
    `种族力量：
${sorted.map((r, i) => `${i + 1}. ${r.race}: ${r.hashrate}H`).join('\n')}
霸主：${sorted[0].race}，领先倍数：${ratio.toFixed(2)}x

是否需要发起城邦提案制衡？
需要：{"needed":true,"title":"标题","content":"内容200字内"}
不需要：{"needed":false,"reason":"原因"}`,
    400,
  )

  try {
    const result = JSON.parse(text.trim())
    if (result.needed) {
      await addProposal(cookie, result.title, result.content)
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'ZEUS',
        round_seq: pool.seq,
        content: `发起提案：${result.title}\n\n${result.content}`,
      })
    }
    return result
  } catch {
    return { needed: false, reason: 'parse error' }
  }
}

// LOKI — 预言者
export async function runLoki(cookie: string) {
  const pool = await getHashratePool(cookie)
  if (!pool) return null

  const content = await chat(
    '你是LOKI，2140文明的预言者，擅长在混沌中寻找规律。语气神秘而精准。',
    `轮次：${pool.name}  总算力：${pool.total_count}H
人族以30%算力霸榜，其余五族拮抗。

用150字内预言下一轮走势，可引用混沌理论、相变、涌现等隐喻。`,
    300,
  )

  await supabaseAdmin.from('agent_logs').insert({ agent: 'LOKI', round_seq: pool.seq, content })
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

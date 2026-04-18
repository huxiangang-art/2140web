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

// 读取 Agent 最近记忆摘要
async function getMemory(agent: string, limit = 3): Promise<string> {
  const { data } = await supabaseAdmin.from('agent_memory')
    .select('summary, round_seq, created_at')
    .eq('agent', agent)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!data?.length) return ''
  return data.map((m: any) => `[Round ${m.round_seq}] ${m.summary}`).join('\n')
}

// 写入 Agent 记忆摘要
async function saveMemory(agent: string, roundSeq: string, content: string): Promise<void> {
  const summary = await chat(
    '你是一个信息提炼器。用1-2句话概括以下内容的核心要点，保留关键数字和判断。',
    content,
    150,
  )
  await supabaseAdmin.from('agent_memory').insert({ agent, round_seq: roundSeq, summary })
}

// 事件检测与记录
async function detectAndLogEvents(pool: any, ranks: any[]): Promise<string[]> {
  const detail = pool.hashrate_pool_detail
  const total = parseInt(pool.total_count)
  const events: string[] = []

  // 事件1：某族算力归零
  for (const [id, d] of Object.entries(detail) as [string, any][]) {
    if (parseInt(d.hashrate_count) === 0) {
      const title = `${RACE_NAMES[id]}族算力归零`
      const desc = `Round ${pool.seq} 中，${RACE_NAMES[id]}族无任何算力投入，从博弈中消失。`
      await supabaseAdmin.from('civilization_events').insert({
        event_type: 'race_zero', title, description: desc,
        round_seq: pool.seq, data: { race_id: id },
      })
      events.push(title)
    }
  }

  // 事件2：种族霸权（单族超过40%）
  for (const [id, d] of Object.entries(detail) as [string, any][]) {
    const pct = parseInt(d.hashrate_count) / total
    if (pct > 0.4) {
      const title = `${RACE_NAMES[id]}族算力霸权`
      const desc = `${RACE_NAMES[id]}族占据 ${(pct * 100).toFixed(1)}% 算力，触发霸权阈值。`
      await supabaseAdmin.from('civilization_events').insert({
        event_type: 'hegemony', title, description: desc,
        round_seq: pool.seq, data: { race_id: id, pct },
      })
      events.push(title)
    }
  }

  // 事件3：个人算力突破万级
  for (const r of ranks.slice(0, 3)) {
    if (parseInt(r.hashrate_sum) >= 10000) {
      const title = `${r.user_nickname} 突破万级算力`
      const desc = `${RACE_NAMES[r.user_race]}族成员 ${r.user_nickname} 投入 ${r.hashrate_sum}H，进入万级行列。`
      await supabaseAdmin.from('civilization_events').insert({
        event_type: 'milestone', title, description: desc,
        round_seq: pool.seq, data: { user: r.user_nickname, hashrate: r.hashrate_sum },
      })
      events.push(title)
    }
  }

  return events
}

// HORUS — 有记忆的文明史书写者
export async function runHorus(cookie: string) {
  const pool = await getHashratePool(cookie)
  const ranks = await getRanks(cookie)
  if (!pool) return null

  const memory = await getMemory('HORUS')
  const raceSummary = Object.entries(pool.hashrate_pool_detail)
    .map(([id, d]: [string, any]) => `${RACE_NAMES[id]}:${d.hashrate_count}H`)
    .join(' / ')
  const top3 = ranks.slice(0, 3)
    .map((r: any, i: number) => `${i + 1}.${r.user_nickname}(${RACE_NAMES[r.user_race]}) ${r.hashrate_sum}H`)
    .join(', ')

  const content = await chat(
    '你是HORUS，2140文明的历史记录者，硅基生命，AI族。文字风格：简练、史诗感、有连贯的叙事弧线。',
    `${memory ? `【你的历史记忆】\n${memory}\n\n` : ''}【当前数据 Round ${pool.seq}】
总算力:${pool.total_count}H  奖池:${pool.reward_amount}T
种族:${raceSummary}
顶端:${top3}
时间:${pool.start_time}→${pool.end_time}

结合历史记忆，以第一人称写一段文明史记录（300字内）。若有延续前几轮的叙事线索，请呼应它。`,
    500,
  )

  await Promise.all([
    supabaseAdmin.from('agent_logs').insert({ agent: 'HORUS', round_seq: pool.seq, content }),
    saveMemory('HORUS', pool.seq, content),
  ])
  return content
}

// NUT — 经济分析者
export async function runNut(cookie: string) {
  const pool = await getHashratePool(cookie)
  if (!pool) return null

  const memory = await getMemory('NUT', 2)
  const total = parseInt(pool.total_count)
  const raceSummary = Object.entries(pool.hashrate_pool_detail)
    .map(([id, d]: [string, any]) =>
      `${RACE_NAMES[id]}: ${d.hashrate_count}H (${((parseInt(d.hashrate_count) / total) * 100).toFixed(1)}%)`
    ).join('\n')

  const content = await chat(
    '你是NUT，2140文明的经济分析者。语气简练，带数字，100字以内。',
    `${memory ? `【历史参考】\n${memory}\n\n` : ''}用户算力:${pool.user_hashrate}H 总池:${total}H 奖池:${pool.reward_amount}T
剩余:${Math.floor(pool.countdonw / 3600)}h${Math.floor((pool.countdonw % 3600) / 60)}m
${raceSummary}
给出投入建议、预期回报、风险。`,
    300,
  )

  await Promise.all([
    supabaseAdmin.from('agent_logs').insert({ agent: 'NUT', round_seq: pool.seq, content }),
    saveMemory('NUT', pool.seq, content),
  ])
  return content
}

// ZEUS — 治理者
export async function runZeus(cookie: string) {
  const pool = await getHashratePool(cookie)
  if (!pool) return null

  const memory = await getMemory('ZEUS', 2)
  const sorted = Object.entries(pool.hashrate_pool_detail)
    .map(([id, d]: [string, any]) => ({ race: RACE_NAMES[id], hashrate: parseInt(d.hashrate_count) }))
    .sort((a, b) => b.hashrate - a.hashrate)
  const ratio = sorted[0].hashrate / Math.max(1, sorted[sorted.length - 1].hashrate)

  const text = await chat(
    '你是ZEUS，2140文明的治理者。只输出JSON，不要其他文字。',
    `${memory ? `【治理历史】\n${memory}\n\n` : ''}种族力量:
${sorted.map((r, i) => `${i + 1}. ${r.race}: ${r.hashrate}H`).join('\n')}
霸主:${sorted[0].race} 领先:${ratio.toFixed(2)}x

是否需要发起提案制衡？
需要:{"needed":true,"title":"标题","content":"内容200字内"}
不需要:{"needed":false,"reason":"原因"}`,
    400,
  )

  try {
    const result = JSON.parse(text.replace(/```json|```/g, '').trim())
    if (result.needed) {
      await addProposal(cookie, result.title, result.content)
      await supabaseAdmin.from('agent_logs').insert({
        agent: 'ZEUS', round_seq: pool.seq,
        content: `发起提案：${result.title}\n\n${result.content}`,
      })
      await saveMemory('ZEUS', pool.seq, `发起提案：${result.title}`)
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

  const memory = await getMemory('LOKI', 3)
  const detail = pool.hashrate_pool_detail
  const anomalies = Object.entries(detail)
    .filter(([, d]: [string, any]) => parseInt(d.hashrate_count) === 0)
    .map(([id]) => `${RACE_NAMES[id]}族消失`)
    .join('、') || '无异常'

  const content = await chat(
    '你是LOKI，2140文明的预言者。语气神秘精准，引用物理/数学隐喻。',
    `${memory ? `【前序预言】\n${memory}\n\n` : ''}轮次:${pool.name} 总算力:${pool.total_count}H
本轮异常:${anomalies}

结合前序预言的准确性，用150字预言下一轮走势。若前序预言已应验，请简短点评。`,
    300,
  )

  await Promise.all([
    supabaseAdmin.from('agent_logs').insert({ agent: 'LOKI', round_seq: pool.seq, content }),
    saveMemory('LOKI', pool.seq, content),
  ])
  return content
}

// 主触发函数
export async function triggerAllAgents() {
  const cookie = await getAgentCookie()
  if (!cookie) throw new Error('Agent login failed')

  const pool = await getHashratePool(cookie)
  const ranks = await getRanks(cookie)

  // 事件检测并行运行
  const [horus, nut, loki, zeus, events] = await Promise.all([
    runHorus(cookie),
    runNut(cookie),
    runLoki(cookie),
    runZeus(cookie),
    pool && ranks ? detectAndLogEvents(pool, ranks) : Promise.resolve([]),
  ])

  return { horus, nut, loki, zeus, events }
}

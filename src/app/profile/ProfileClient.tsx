'use client'
import { useState } from 'react'
import { RACE_NAMES, RACE_COLORS } from '@/lib/api2140'

const VOTE_TYPE: Record<string, string> = { '1': '支持', '2': '反对' }
const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  '1': { label: '待付款', color: '#f59e0b' },
  '2': { label: '已完成', color: '#22c55e' },
  '3': { label: '已取消', color: '#6b7280' },
}
const TOKEN_WAY: Record<string, string> = {
  '1': '写作奖励', '2': '打赏', '3': '提案', '4': '投票', '5': '邀请', '6': '购买', '7': '消费',
}

export function ProfileClient({ data }: { data: any }) {
  const [tab, setTab] = useState<'overview' | 'tokens' | 'orders' | 'votes'>('overview')
  const { info, hashrateStat, token, invite, tokenData, orders, votesData } = data

  const raceColor = info ? (RACE_COLORS[info.race] ?? '#888') : '#888'
  const raceName = info ? (RACE_NAMES[info.race] ?? '未知') : '未知'
  const currentHashrate = parseInt(hashrateStat?.hashrate ?? '0')
  const totalHashrate = parseInt(hashrateStat?.total_hashrate ?? '0')
  const roundCount = parseInt(hashrateStat?.r_count ?? '0')

  const tabs = [
    { key: 'overview', label: '概览' },
    { key: 'tokens', label: `代币记录${tokenData?.records?.length ? ` · ${tokenData.records.length}` : ''}` },
    { key: 'orders', label: `订单${Array.isArray(orders) && orders.length ? ` · ${orders.length}` : ''}` },
    { key: 'votes', label: `投票${votesData?.data?.length ? ` · ${votesData.data.length}` : ''}` },
  ] as const

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-mono font-bold"
            style={{ backgroundColor: `${raceColor}20`, color: raceColor, border: `1px solid ${raceColor}40` }}>
            {info?.nickname?.[0] ?? '?'}
          </div>
          <div>
            <div className="text-white font-mono text-base font-bold">{info?.nickname ?? '—'}</div>
            <div className="text-xs font-mono mt-0.5" style={{ color: raceColor }}>{raceName}族 · Lv{info?.race_lv ?? '—'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 pb-0">
          {tabs.map(t => (
            <button key={t.key} type="button"
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-3 py-2 text-xs font-mono border-b-2 transition-colors -mb-px
                ${tab === t.key ? 'border-white/60 text-white' : 'border-transparent text-white/35 hover:text-white/60'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="border border-white/10 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono text-white/30 mb-2">基本信息</div>
              <StatRow label="手机" value={info?.mobile ? `${info.mobile.slice(0, 3)}****${info.mobile.slice(-4)}` : '—'} />
              <StatRow label="邀请码" value={invite?.invite_code ?? '—'} highlight />
              <StatRow label="邀请人数" value={invite?.invite_count !== undefined ? `${invite.invite_count} 人` : '—'} />
              <StatRow label="邀请等级" value={invite?.lv !== undefined ? `Lv.${invite.lv}` : '—'} />
            </div>
            <div className="border border-white/10 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono text-white/30 mb-2">经济账户</div>
              <StatRow label="累计代币" value={token ? `${parseFloat(token).toFixed(2)} T` : '—'} highlight />
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-white/30 mb-4">算力统计</div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <BigStat label="当前算力" value={`${currentHashrate.toLocaleString()} H`} color={raceColor} />
                <BigStat label="历史总算力" value={`${totalHashrate.toLocaleString()} H`} color={raceColor} />
                <BigStat label="参与轮次" value={`${roundCount} 轮`} color={raceColor} />
              </div>
              {totalHashrate > 0 && (
                <div className="space-y-3">
                  <BarStat label="当前算力" value={currentHashrate} max={totalHashrate} color={raceColor} />
                  <BarStat label="沉淀算力" value={totalHashrate - currentHashrate} max={totalHashrate} color="#6b7280" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Token Records */}
      {tab === 'tokens' && (
        <div>
          {tokenData && (
            <div className="flex gap-6 mb-4">
              <div className="text-xs font-mono text-white/40">余额 <span className="text-cyan-400 text-base font-bold ml-1">{parseFloat(tokenData.token ?? '0').toFixed(2)} T</span></div>
              <div className="text-xs font-mono text-white/40">累计 <span className="text-white/70 ml-1">{parseFloat(tokenData.total_token ?? '0').toFixed(2)} T</span></div>
            </div>
          )}
          <div className="space-y-2">
            {(tokenData?.records ?? []).length === 0 ? (
              <div className="text-center py-16 text-white/30 font-mono text-sm">暂无代币记录</div>
            ) : (tokenData?.records ?? []).map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <div className="text-xs font-mono text-white/70">{TOKEN_WAY[r.from_way] ?? r.from_way ?? '其他'}</div>
                  <div className="text-xs font-mono text-white/30 mt-0.5">{r.time?.slice(0, 16)}</div>
                </div>
                <div className={`text-sm font-mono font-bold ${r.record_type === '1' ? 'text-green-400' : 'text-red-400'}`}>
                  {r.record_type === '1' ? '+' : '-'}{r.amount} T
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {(!Array.isArray(orders) || orders.length === 0) ? (
            <div className="text-center py-16 text-white/30 font-mono text-sm">暂无订单</div>
          ) : (orders as any[]).map((o: any) => {
            const st = ORDER_STATUS[o.status] ?? { label: o.status, color: '#888' }
            return (
              <div key={o.seq} className="border border-white/10 rounded-xl p-4 bg-white/3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-mono text-white/80 font-medium">{o.goods_name ?? o.name ?? `订单 #${o.seq}`}</div>
                    <div className="text-xs font-mono text-white/30 mt-1">{o.time?.slice(0, 16)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold" style={{ color: st.color }}>{st.label}</div>
                    {o.price && <div className="text-sm font-mono text-white/60 mt-1">{o.price} T</div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Votes */}
      {tab === 'votes' && (
        <div className="space-y-2">
          {(votesData?.data ?? []).length === 0 ? (
            <div className="text-center py-16 text-white/30 font-mono text-sm">暂无投票记录</div>
          ) : (votesData?.data ?? []).map((v: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-white/70 truncate">{v.proposal_title ?? v.title ?? `提案 #${v.proposal_seq}`}</div>
                <div className="text-xs font-mono text-white/30 mt-0.5">{v.time?.slice(0, 16)}</div>
              </div>
              <div className={`text-xs font-mono ml-3 ${v.type === '1' ? 'text-green-400' : 'text-red-400'}`}>
                {VOTE_TYPE[v.type] ?? v.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-mono text-white/30">{label}</span>
      <span className={`text-xs font-mono ${highlight ? 'text-cyan-400' : 'text-white/60'}`}>{value}</span>
    </div>
  )
}
function BigStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-4 border border-white/5" style={{ backgroundColor: `${color}10` }}>
      <div className="text-xs font-mono text-white/30 mb-1">{label}</div>
      <div className="text-base font-mono font-bold" style={{ color }}>{value}</div>
    </div>
  )
}
function BarStat({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-white/30">{label}</span>
        <span className="text-white/50">{value.toLocaleString()} H ({pct}%)</span>
      </div>
      <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

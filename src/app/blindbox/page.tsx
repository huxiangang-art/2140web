import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import { getBlindBoxList, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

const CONTENT_TYPE: Record<string, string> = {
  '1': '算力', '2': 'NFT', '3': '道具', '4': '代币',
}
const PLAY_TYPE: Record<string, string> = {
  '1': '标准', '2': '限时', '3': '竞拍',
}
const STATUS_COLOR: Record<string, string> = {
  '1': '#22c55e', '2': '#f59e0b', '3': '#6b7280',
}
const STATUS_LABEL: Record<string, string> = {
  '1': '进行中', '2': '即将结束', '3': '已结束',
}

async function getData() {
  try {
    const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
    if (!cookie) return null
    return getBlindBoxList(cookie, 0)
  } catch { return null }
}

export default async function BlindBoxPage() {
  const [data, loggedIn] = await Promise.all([getData(), getLoggedIn()])

  const items: any[] = data?.data ?? []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/blindbox" loggedIn={loggedIn} />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">盲盒</h2>
        <p className="text-xs text-white/30 mt-1">限定奖励 · 神秘开盒 · 碎片兑换</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-mono text-sm">暂无盲盒活动</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b: any) => {
            const color = STATUS_COLOR[b.status] ?? '#6b7280'
            return (
              <div key={b.seq} className="border border-white/10 rounded-xl overflow-hidden bg-white/3"
                style={{ borderColor: b.status === '1' ? '#22c55e22' : undefined }}>
                <div className="h-1 w-full" style={{ backgroundColor: color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold font-mono text-white mb-1">
                        {b.title ?? `盲盒 #${b.seq}`}
                      </div>
                      <div className="flex items-center gap-2">
                        {b.content_type && (
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/8 text-white/50 border border-white/10">
                            {CONTENT_TYPE[b.content_type] ?? b.content_type}
                          </span>
                        )}
                        {b.play_type && (
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/8 text-white/50 border border-white/10">
                            {PLAY_TYPE[b.play_type] ?? b.play_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-mono" style={{ color }}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {b.user_avatar && <img src={b.user_avatar} alt="" className="w-5 h-5 rounded-full" />}
                    <span className="text-xs font-mono text-white/40">{b.user_nick}</span>
                  </div>

                  {b.time_limit && (
                    <div className="text-xs font-mono text-white/25">截止 {b.time_limit?.slice(0, 10)}</div>
                  )}
                  {b.time && (
                    <div className="text-xs font-mono text-white/25">{b.time?.slice(0, 10)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

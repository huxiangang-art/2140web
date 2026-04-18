import { Nav } from '@/components/Nav'
import { getLoggedIn } from '@/lib/auth'
import { getPropPath, login } from '@/lib/api2140'
import { PropClient } from './PropClient'

export const dynamic = 'force-dynamic'

export default async function PropPage() {
  const [loggedIn, sysCookie] = await Promise.all([
    getLoggedIn(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])

  const data = await getPropPath(sysCookie ?? '')

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <Nav active="/prop" loggedIn={loggedIn} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white font-mono">道具合成</h2>
        <p className="text-xs text-white/30 mt-1">2140文明道具 · 合成路径 · 材料索引</p>
      </div>

      {data ? (
        <PropClient
          propSwitches={data.prop_switchs}
          propTemplates={data.prop_templates}
          baseUrl={data.base_url}
        />
      ) : (
        <div className="text-xs font-mono text-white/30">暂无数据</div>
      )}
    </main>
  )
}

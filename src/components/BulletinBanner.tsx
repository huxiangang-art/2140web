import { getBulletins, login } from '@/lib/api2140'

export async function BulletinBanner() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  if (!cookie) return null
  const bulletins = await getBulletins(cookie)
  if (!bulletins?.length) return null
  const latest = bulletins[0]

  return (
    <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-3">
      <span className="text-xs font-mono text-amber-400/80 shrink-0">公告</span>
      <span className="text-xs font-mono text-white/50 truncate">{latest.title}</span>
      <span className="text-xs font-mono text-white/20 shrink-0 ml-auto">{latest.time?.slice(0, 10)}</span>
    </div>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import {
  getCreationRank,
  getDigitalPerson,
  getGeneLastRecord,
  getGeneMatchRecords,
  getGenesisKeys,
  getMyWriteChapters,
  getUserOrders,
  getUserHashrate,
  getUserInfo,
  getUserTotalToken,
  getUserVotes,
  login,
  RACE_COLORS,
  RACE_NAMES,
} from '@/lib/api2140'

export const dynamic = 'force-dynamic'

const DIGITAL_LV_NAMES = ['', '碳基体', '猿人', '直立人', '智人', '原始人', '自然人', '农业人', '封建人', '工业人', '社会人', '契约人', '加密客', '基因体', '半数人', '算力体', '硅基体', '比特人', '低熵体', '全数人', '元人', '数字人']

async function settled<T>(task: Promise<T>, fallback: T): Promise<T> {
  try {
    return await task
  } catch {
    return fallback
  }
}

export default async function MetaverseIdentityPage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  if (!loggedIn || !userCookie) redirect('/login')

  const publicCookie = sysCookie ?? userCookie
  const [
    userInfo,
    userHashrate,
    userToken,
    digitalPerson,
    geneRecord,
    geneMatches,
    genesisKeys,
    creationRank,
    votesData,
    orders,
    myChapters,
  ] = await Promise.all([
    settled(getUserInfo(userCookie).then(r => r.ret === 0 ? r.data : null), null),
    settled(getUserHashrate(userCookie), null),
    settled(getUserTotalToken(userCookie), null),
    settled(getDigitalPerson(userCookie), null),
    settled(getGeneLastRecord(userCookie), null),
    settled(getGeneMatchRecords(userCookie), null),
    settled(getGenesisKeys(userCookie), null),
    settled(getCreationRank(publicCookie), null),
    settled(getUserVotes(userCookie, 0, 0), null),
    settled(getUserOrders(userCookie), []),
    settled(getMyWriteChapters(userCookie), []),
  ])

  const race = String(userInfo?.race ?? '')
  const raceColor = RACE_COLORS[race] ?? '#94a3b8'
  const personLv = Number(digitalPerson?.person_lv ?? 0)
  const personName = DIGITAL_LV_NAMES[personLv] ?? '未激活'
  const gene = geneRecord?.genes ?? geneRecord
  const firGene = gene?.fir_gene
  const secGene = gene?.sec_gene
  const matches = Array.isArray(geneMatches?.records) ? geneMatches.records : []
  const genesisScore = sum([genesisKeys?.standard1, genesisKeys?.standard2, genesisKeys?.standard3, genesisKeys?.standard4])
  const creationIndex = creationRank?.my_num
  const creationLv = Array.isArray(creationRank?.my_lv) ? creationRank.my_lv.join(' · ') : undefined
  const votes = Array.isArray(votesData?.records) ? votesData.records : Array.isArray(votesData?.data) ? votesData.data : []
  const orderList = Array.isArray(orders) ? orders : []
  const authored = Array.isArray(myChapters) ? myChapters : []

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />

      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-mono text-cyan-300/60 mb-1">Metaverse Identity</div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono text-white">元身份档案</h1>
        </div>
        <Link href="/metaverse/dashboard" className="w-fit rounded border border-white/10 px-3 py-2 text-xs font-mono text-white/40 transition-colors hover:border-white/25 hover:text-white/70">
          元宇宙控制台
        </Link>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_2fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-lg border" style={{ borderColor: `${raceColor}66`, backgroundColor: `${raceColor}18` }}>
              {userInfo?.avatar
                ? <img src={userInfo.avatar} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-sm font-mono" style={{ color: raceColor }}>2140</div>
              }
            </div>
            <div className="min-w-0">
              <div className="truncate text-xl font-bold font-mono text-white">{userInfo?.nickname ?? '2140 Citizen'}</div>
              <div className="mt-1 text-sm font-mono" style={{ color: raceColor }}>{RACE_NAMES[race] ?? '未绑定种族'}</div>
              <div className="mt-1 text-xs font-mono text-white/30">{creationLv ?? '创世居民'}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="算力" value={num(userHashrate?.hashrate ?? userInfo?.hashrate)} color="#facc15" />
            <Stat label="通证" value={num(userToken?.total_token ?? userInfo?.total_token ?? userInfo?.token)} color="#34d399" />
            <Stat label="创世指数" value={num(creationIndex)} color="#fb7185" />
            <Stat label="密钥标准" value={num(genesisScore)} color="#eab308" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ProgressCard title="数字人" value={Number(digitalPerson?.standard_sum ?? 0)} detail={`Lv.${personLv || '-'} · ${personName}`} href="/digital" color="#22d3ee" />
          <ProgressCard title="基因测序" value={firGene ? 100 : 0} detail={firGene?.name ?? '未测序'} href="/gene" color="#a78bfa" />
          <ProgressCard title="创世密钥" value={Math.min(100, genesisScore)} detail={genesisKeys?.status ? `状态 ${genesisKeys.status}` : '未持有'} href="/genesis" color="#eab308" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="数字人构成" action={<SmallLink href="/digital">详情</SmallLink>}>
          <div className="mb-4 flex items-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-lg border border-cyan-400/20 bg-black/30">
              {personLv > 0 && personLv <= 21
                ? <img src={`/digital/person_equip${personLv}.png`} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-xs font-mono text-white/25">未激活</div>
              }
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white">第 {personLv || '-'} 代</div>
              <div className="mt-1 text-sm font-mono text-cyan-300/75">{personName}</div>
            </div>
          </div>
          <div className="space-y-3">
            <Meter label="身体数字化" value={Number(digitalPerson?.standard1 ?? 0)} color="#22d3ee" />
            <Meter label="意识数字化" value={Number(digitalPerson?.standard2 ?? 0)} color="#38bdf8" />
            <Meter label="社会数字化" value={Number(digitalPerson?.standard3 ?? 0)} color="#818cf8" />
            <Meter label="资产数字化" value={Number(digitalPerson?.standard4 ?? 0)} color="#34d399" />
          </div>
        </Panel>

        <Panel title="基因报告" action={<SmallLink href="/gene">测序</SmallLink>}>
          <GeneBlock label="主基因" gene={firGene} />
          <div className="my-4 border-t border-white/8" />
          <GeneBlock label="副基因" gene={secGene} />
        </Panel>

        <Panel title="匹配记录">
          {matches.length ? (
            <div className="space-y-2">
              {matches.slice(0, 6).map(record => (
                <div key={record.seq} className="flex items-center gap-3 border-b border-white/5 py-2 last:border-0">
                  <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-black/30">
                    {record.matcher_avatar && <img src={record.matcher_avatar} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-mono text-white/70">{record.matcher_nickname ?? '未知居民'}</div>
                    <div className="text-xs font-mono text-white/25">{record.time?.slice(0, 10)}</div>
                  </div>
                  <div className="text-sm font-bold font-mono text-purple-300">{record.match_rate ?? 0}%</div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>暂无匹配记录</Empty>
          )}
        </Panel>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="参与记录" action={<SmallLink href="/profile">档案</SmallLink>}>
          <MiniStat label="投票/治理" value={String(votes.length)} />
          <MiniStat label="订单/资产" value={String(orderList.length)} />
          <MiniStat label=" authored chapters" value={String(authored.length)} />
          <MiniStat label="基因匹配" value={String(matches.length)} />
        </Panel>

        <Panel title="Turing 状态" action={<SmallLink href="/turing">测试</SmallLink>}>
          <div className="text-sm font-mono text-white/70">{RACE_NAMES[race] ?? '未绑定种族'}</div>
          <p className="mt-3 text-xs leading-relaxed text-white/38">当前主站研究资料里 Turing 后端结果接口尚未完成对照；此处先以账号种族身份作为可读状态，后续补正式测试结果。</p>
        </Panel>

        <Panel title="创作身份">
          <MiniStat label="创世指数" value={num(creationIndex)} />
          <MiniStat label="创世等级" value={creationLv ?? '-'} />
          <MiniStat label="密钥标准" value={num(genesisScore)} />
        </Panel>
      </section>
    </main>
  )
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-mono text-white/35">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded border border-white/8 bg-black/20 p-3">
      <div className="text-xs font-mono text-white/30">{label}</div>
      <div className="mt-1 truncate text-lg font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  )
}

function ProgressCard({ title, value, detail, href, color }: { title: string; value: number; detail: string; href: string; color: string }) {
  return (
    <Link href={href} className="rounded-lg border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20">
      <div className="text-xs font-mono text-white/35">{title}</div>
      <div className="mt-2 text-lg font-bold font-mono" style={{ color }}>{Math.round(Math.max(0, Math.min(100, value)))}%</div>
      <div className="mt-1 truncate text-xs font-mono text-white/35">{detail}</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} />
      </div>
    </Link>
  )
}

function GeneBlock({ label, gene }: { label: string; gene: any }) {
  return (
    <div>
      <div className="text-xs font-mono text-white/30">{label}</div>
      <div className="mt-1 text-base font-bold font-mono text-purple-200/85">{gene?.name ?? '未测序'}</div>
      {gene?.label && <div className="mt-1 text-xs font-mono text-purple-300/45">{gene.label}</div>}
      {gene?.personal_text && <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-white/40">{gene.personal_text}</p>}
    </div>
  )
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-mono text-white/40">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="mb-2 flex items-center justify-between rounded border border-white/8 bg-black/20 px-3 py-2 last:mb-0"><span className="text-xs font-mono text-white/35">{label}</span><span className="text-xs font-mono text-cyan-300/70">{value}</span></div>
}

function SmallLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-xs font-mono text-white/35 hover:text-white/65">{children}</Link>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-10 text-center text-xs font-mono text-white/25">{children}</div>
}

function sum(values: unknown[]) {
  return values.reduce<number>((acc, value) => acc + (Number(value) || 0), 0)
}

function num(value: unknown) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return String(value ?? '-')
  return Math.round(n).toLocaleString()
}

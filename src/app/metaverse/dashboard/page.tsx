import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { CenteredRacewarScroll } from '../CenteredRacewarScroll'
import { getLoggedIn, getUserCookie } from '@/lib/auth'
import {
  getBranchMaps,
  getBranchMissions,
  getCompletedMissions,
  getCreationRank,
  getDigitalPerson,
  getDigitalPersonRank,
  getGeneLastRecord,
  getGeneMatchRecords,
  getMapSituation,
  getRacewarDebriss,
  getRacewarMap,
  getRacewarTasks,
  getTheme8,
  getTimeNodes,
  getUserHashrate,
  getUserInfo,
  getUserTotalToken,
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

export default async function MetaversePage() {
  const [loggedIn, userCookie, sysCookie] = await Promise.all([
    getLoggedIn(),
    getUserCookie(),
    login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!),
  ])
  const publicCookie = sysCookie ?? userCookie ?? ''
  const activeCookie = userCookie ?? publicCookie

  const [
    userInfo,
    userHashrate,
    userToken,
    digitalPerson,
    digitalRank,
    geneRecord,
    geneMatches,
    situation,
    branchMaps,
    creationRank,
    racewarTasks,
    branchMissions,
    completedMissions,
    timeNodes,
    themes,
  ] = await Promise.all([
    userCookie ? settled(getUserInfo(userCookie).then(r => r.ret === 0 ? r.data : null), null) : null,
    userCookie ? settled(getUserHashrate(userCookie), null) : null,
    userCookie ? settled(getUserTotalToken(userCookie), null) : null,
    userCookie ? settled(getDigitalPerson(userCookie), null) : null,
    settled(getDigitalPersonRank(publicCookie), []),
    userCookie ? settled(getGeneLastRecord(userCookie), null) : null,
    userCookie ? settled(getGeneMatchRecords(userCookie), null) : null,
    settled(getMapSituation(publicCookie), null),
    settled(getBranchMaps(publicCookie), []),
    settled(getCreationRank(publicCookie), null),
    settled(getRacewarTasks(activeCookie), null),
    settled(getBranchMissions(activeCookie), null),
    settled(getCompletedMissions(activeCookie), []),
    settled(getTimeNodes(publicCookie), []),
    settled(getTheme8(publicCookie), []),
  ])

  const race = String(userInfo?.race ?? '')
  const raceColor = RACE_COLORS[race] ?? '#94a3b8'
  const unlockedMaps = arr(situation?.maps).filter(m => String(m.is_unlock) !== '-1')
  const currentMap = unlockedMaps[unlockedMaps.length - 1] ?? arr(situation?.maps)[0]
  const activeBranches = arr(branchMaps).filter(m => Number(m.health ?? 0) > 0)
  const taskList = flattenRaceTasks(racewarTasks)
  const myRaceTasks = race ? taskList.filter(t => String(t.race_seq) === race) : taskList
  const missionList = arr(branchMissions?.data ?? branchMissions?.missions ?? branchMissions)
  const completedCount = arr(completedMissions).length
  const personLv = Number(digitalPerson?.person_lv ?? 0)
  const personName = DIGITAL_LV_NAMES[personLv] ?? '未激活'
  const creationUsers = arr(creationRank?.racewar_users)
  const digitalRankList = arr(digitalRank?.records ?? digitalRank)
  const geneMatchList = arr(geneMatches?.records ?? geneMatches)
  const currentTask = pickCurrentTask(myRaceTasks)
  const worldProgress = Math.round((Number(currentMap?.lv ?? 0) / 9) * 100)
  const digitalProgress = Math.min(100, Number(digitalPerson?.standard_sum ?? 0))
  const raceTaskProgress = Number(currentTask?.per ?? currentTask?.schedule ?? 0)
  const previousMap = unlockedMaps.slice(0, -1).at(-1) ?? unlockedMaps[0] ?? currentMap
  const anomalyCount = arr(situation?.maps).flatMap(m => arr(m.debriss)).filter(d => String(d.error_status) === '1').length
  const [racewarMap, racewarDebriss] = await Promise.all([
    currentMap?.seq ? settled(getRacewarMap(publicCookie, currentMap.seq, race || 1), null) : null,
    currentMap?.seq ? settled(getRacewarDebriss(publicCookie, currentMap.seq), []) : [],
  ])

  return (
    <main className="min-h-screen p-2 md:p-8 max-w-7xl mx-auto">
      <Nav active="/metaverse" loggedIn={loggedIn} />

      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-mono text-cyan-300/60 mb-1">2140 Metaverse</div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono text-white">元宇宙控制台</h1>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="h-9 w-9 rounded-full overflow-hidden border" style={{ borderColor: `${raceColor}66`, backgroundColor: `${raceColor}18` }}>
            {userInfo?.avatar
              ? <img src={userInfo?.avatar} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-xs font-mono" style={{ color: raceColor }}>2140</div>
            }
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-mono text-white/85">{userInfo?.nickname ?? '游客观察者'}</div>
            <div className="text-xs font-mono text-white/35">{RACE_NAMES[race] ?? '未绑定种族'} · {personName}</div>
          </div>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Metric label="种族" value={RACE_NAMES[race] ?? '未登录'} color={raceColor} />
        <Metric label="数字人" value={personLv ? `Lv.${personLv}` : '未激活'} sub={personName} color="#22d3ee" />
        <Metric label="算力" value={num(userHashrate?.hashrate ?? userInfo?.hashrate)} color="#facc15" />
        <Metric label="通证" value={num(userToken?.total_token ?? userInfo?.total_token ?? userInfo?.token)} color="#34d399" />
        <Metric label="主线地图" value={currentMap?.name ?? '未同步'} sub={currentMap ? `Lv.${currentMap.lv}` : undefined} color="#a78bfa" />
        <Metric label="创世指数" value={num(creationRank?.my_num)} sub={creationRank?.my_rank ? `排名 ${creationRank.my_rank}` : undefined} color="#fb7185" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Visual href="/metaverse/library" src="/metaverse/write_index_top_img.jpg" label="写作宇宙" />
        <Visual href="/turing" src="/metaverse/turing_test_middle_img.png" label="图灵测试" />
        <Visual href="/gene" src="/metaverse/gene_sequencing_question_dynamic_bg.gif" label="基因测序" />
      </section>

      <section className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-5">
        <ActionLink href="/metaverse/war" label="战争中心" />
        <ActionLink href="/metaverse/worlds" label="世界地图" />
        <ActionLink href="/metaverse/quests" label="任务中心" />
        <ActionLink href="/metaverse/library" label="宇宙文库" />
        <ActionLink href="/metaverse/contribution" label="贡献中心" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-4">
          <Panel title="核心进度" action={<LinkButton href="/racewar/tasks">任务</LinkButton>}>
            <div className="space-y-4">
              <ProgressRow label="文明推进" value={worldProgress} detail={currentMap ? `${currentMap.name} · Lv.${currentMap.lv}` : '未同步'} color="#a78bfa" />
              <ProgressRow label="数字化" value={digitalProgress} detail={personName} color="#22d3ee" />
              <ProgressRow label="种族任务" value={raceTaskProgress} detail={currentTask ? `Lv.${currentTask.lv} / Step ${currentTask.step}` : '暂无任务'} color={raceColor} />
              <ProgressRow label="支线存活" value={arr(branchMaps).length ? Math.round((activeBranches.length / arr(branchMaps).length) * 100) : 0} detail={`${activeBranches.length}/${arr(branchMaps).length} 个世界`} color="#34d399" />
            </div>
          </Panel>

          <Panel title="身份栈" action={<LinkButton href="/metaverse/identity">元身份</LinkButton>}>
            <div className="grid grid-cols-2 gap-3">
              <IdentityTile label="主基因" value={(geneRecord?.genes ?? geneRecord)?.fir_gene?.name ?? '未测序'} sub={(geneRecord?.genes ?? geneRecord)?.fir_gene?.label} href="/metaverse/identity" />
              <IdentityTile label="副基因" value={(geneRecord?.genes ?? geneRecord)?.sec_gene?.name ?? '未测序'} sub={(geneRecord?.genes ?? geneRecord)?.sec_gene?.label} href="/metaverse/identity" />
              <IdentityTile label="匹配记录" value={String(geneMatchList.length)} sub="gene match" href="/gene" />
              <IdentityTile label="数字化" value={`${digitalPerson?.standard_sum ?? 0}%`} sub="standard sum" href="/digital" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ActionLink href="/turing" label="图灵测试" />
              <ActionLink href="/digital" label="数字人" />
              <ActionLink href="/gene" label="基因测序" />
              <ActionLink href="/races" label="六族档案" />
            </div>
          </Panel>

          <Panel title="创作指数" action={<LinkButton href="/write">写作</LinkButton>}>
            <RankList
              rows={creationUsers.slice(0, 7).map((u, i) => ({
                key: u.seq ?? `${u.user_seq}-${i}`,
                rank: i + 1,
                name: u.user_nick ?? u.nickname,
                value: num(u.creation_index),
                race: u.user_race,
                avatar: u.user_avatar,
              }))}
            />
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-5">
          <Panel title="世界态势" action={<LinkButton href="/map">宇宙地图</LinkButton>}>
            <div className="space-y-3">
              {unlockedMaps.slice(-4).reverse().map(map => (
                <div key={map.seq} className="rounded-lg border border-white/8 bg-black/20 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Link href={`/racewar/map/${map.seq}`} className="truncate text-sm font-mono text-white/85 hover:text-white">{map.name}</Link>
                    <span className="shrink-0 text-xs font-mono text-white/30">Lv.{map.lv}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {arr(map.debriss).slice(0, 7).map(debris => (
                      <Link
                        key={debris.seq}
                        href={`/racewar/debris/${debris.seq}`}
                        className={`rounded border px-2 py-0.5 text-xs font-mono transition-colors ${String(debris.error_status) === '1' ? 'border-red-500/35 text-red-300/65' : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/65'}`}
                      >
                        {debris.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="支线世界" action={<LinkButton href="/racewar">战争</LinkButton>}>
            <div className="space-y-3">
              {arr(branchMaps).map(map => (
                <div key={map.seq} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-mono text-white/85">{map.name}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/35">{stripHtml(map.desc)}</div>
                    </div>
                    <span className="shrink-0 text-xs font-mono text-white/30">Lv.{map.lv}</span>
                  </div>
                  <HpBar health={Number(map.health ?? 0)} max={100000} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-3">
          <Panel title="行动队列" action={<LinkButton href="/racewar/tasks">任务</LinkButton>}>
            <QueueList rows={myRaceTasks.slice(-4).reverse()} fallback="暂无战争任务" />
            <div className="my-4 border-t border-white/8" />
            <QueueList rows={missionList.slice(0, 4)} fallback="暂无支线任务" />
            <div className="mt-3 rounded border border-white/8 bg-white/[0.025] px-3 py-2 text-xs font-mono text-white/35">
              已完成支线任务 <span className="text-white/70">{completedCount}</span>
            </div>
          </Panel>

          <Panel title="数字人排行" action={<LinkButton href="/digital">排行</LinkButton>}>
            <RankList
              rows={digitalRankList.slice(0, 7).map((u, i) => ({
                key: u.user_seq ?? u.seq ?? i,
                rank: i + 1,
                name: u.user_nick ?? u.nickname,
                value: `Lv.${u.person_lv ?? u.lv ?? '-'}`,
                race: u.user_race ?? u.race,
                avatar: u.user_avatar ?? u.avatar,
              }))}
            />
          </Panel>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="时间线节点" action={<LinkButton href="/world">世界观</LinkButton>}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {timeNodes.slice(0, 8).map(node => (
              <TimelineNode key={node.seq} node={node} />
            ))}
          </div>
        </Panel>

        <Panel title="八大系列" action={<LinkButton href="/write">章节</LinkButton>}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {arr(themes).slice(0, 8).map(theme => (
              <Link key={theme.seq} href={`/write/branch/${theme.seq}`} className="grid grid-cols-[64px_1fr] gap-3 rounded border border-white/8 bg-white/[0.025] p-2 transition-colors hover:border-white/18">
                <div className="h-20 overflow-hidden rounded border border-white/8 bg-black/30">
                  {theme.cover
                    ? <img src={theme.cover} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-xs font-mono text-white/20">{theme.seq}</div>
                  }
                </div>
                <div className="min-w-0 py-1">
                  <div className="truncate text-sm font-mono text-white/80">{theme.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/35">{stripHtml(theme.desc)}</div>
                  <div className="mt-2 truncate text-xs font-mono text-white/25">{theme.time_node ?? theme.node_time ?? ''}</div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  )
}

function TimelineNode({ node }: { node: any }) {
  const content = (
    <>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="truncate text-xs font-mono text-cyan-200/70">{node.node_time}</span>
        {Number(node.branch_seq) > 0 && <span className="shrink-0 text-xs font-mono text-white/20">#{node.branch_seq}</span>}
      </div>
      <div className="truncate text-sm font-mono text-white/80">{node.node_title}</div>
    </>
  )
  return Number(node.branch_seq) > 0 ? (
    <Link href={`/write/branch/${node.branch_seq}`} className="rounded border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/18">
      {content}
    </Link>
  ) : (
    <div className="rounded border border-white/8 bg-black/20 p-3">
      {content}
    </div>
  )
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-mono text-white/35">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function ProgressRow({ label, value, detail, color }: { label: string; value: number; detail: string; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-mono text-white/45">{label}</span>
        <span className="truncate text-xs font-mono text-white/25">{detail}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <span className="w-10 text-right text-xs font-mono" style={{ color }}>{pct}%</span>
      </div>
    </div>
  )
}

function MetaversePhoneMap({
  currentMap,
  previousMap,
  unlockedCount,
  totalCount,
  activeBranchCount,
  branchCount,
  anomalyCount,
  race,
  mapDetail,
  debriss,
}: {
  currentMap: any
  previousMap: any
  unlockedCount: number
  totalCount: number
  activeBranchCount: number
  branchCount: number
  anomalyCount: number
  race: string
  mapDetail: any
  debriss: any[]
}) {
  const mapName = mapDetail?.name ?? currentMap?.name ?? '虫洞文明'
  const mapBg = racewarAsset(mapDetail?.bg) ?? '/racewar/space.jpg'
  const markers = arr(debriss).length
    ? arr(debriss)
    : [
        { seq: currentMap?.seq, id: `V - ${currentMap?.lv ?? '-'}`, name: currentMap?.name ?? '无限∞世界', race_seq: race, position: ['54%', '17%'], error_status: 1 },
        { seq: previousMap?.seq, id: `V - ${previousMap?.lv ?? '-'}`, name: previousMap?.name ?? '丝绸之路', race_seq: 1, position: ['69%', '61%'], error_status: 1 },
      ]

  return (
    <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,540px)_1fr]">
      <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-lg border border-cyan-300/20 bg-black shadow-[0_0_36px_rgba(34,211,238,0.12)]">
        <div
          className="relative aspect-[750/1334] overflow-hidden bg-black"
        >
          <CenteredRacewarScroll>
            <div
              className="relative h-full min-w-full bg-cover bg-center bg-no-repeat"
              style={{ width: '178%', backgroundImage: `url('${mapBg}')` }}
            >
              <div className="absolute inset-0 bg-black/10" />
              {markers.map((debris, index) => (
                <WorldMarker
                  key={debris.seq ?? `${debris.name}-${index}`}
                  href={debris.seq ? `/racewar/debris/${debris.seq}` : '/metaverse/worlds'}
                  className=""
                  style={{ left: debris.position?.[0] ?? '50%', top: debris.position?.[1] ?? '50%' }}
                  badge={raceShortName(debris.race_seq)}
                  level={debris.id ?? `V - ${debris.lv ?? '-'}`}
                  name={debris.name ?? '未知基地'}
                  status={debris.error_status}
                  boss={Number(debris.is_boss) === 1}
                  bossDst={Boolean(debris.is_boss_dst)}
                />
              ))}
            </div>
          </CenteredRacewarScroll>

          <div className="absolute left-0 right-0 top-0 h-[10%] bg-gradient-to-b from-black/85 to-black/0">
            <IconDock href="/metaverse" label="返回" iconClass="rw-return" edge="left" />
            <IconDock href="/map" label="搜索" iconClass="rw-search" edge="right" />
            <div
              className="absolute left-1/2 top-0 flex h-[7.2vw] min-h-[38px] w-[47%] -translate-x-1/2 items-center justify-center bg-[length:100%_100%] bg-center bg-no-repeat px-3"
              style={{ backgroundImage: "url('/racewar/racewar_map_name_bg.png')" }}
            >
              <div className="truncate whitespace-nowrap text-lg font-mono font-bold text-white md:text-2xl">{mapName.replace('文明', '')}·主线</div>
            </div>
          </div>

          <Link href="/metaverse/worlds" className="absolute left-[17%] top-[8.5%] flex -translate-x-1/2 flex-col items-center text-cyan-300">
            <SpriteIcon className="rw-icon-create h-12 w-12" />
            <span className="mt-1 rounded bg-black/45 px-1.5 text-sm font-mono text-white">创建文明</span>
          </Link>

          <Link href="/metaverse/worlds" className="absolute right-[13%] top-[8.5%] flex translate-x-1/2 flex-col items-center text-cyan-300">
            <SpriteIcon className="rw-icon-switch h-12 w-12" />
            <span className="mt-1 rounded bg-black/45 px-1.5 text-sm font-mono text-white">切换文明</span>
          </Link>

          <div className="absolute right-0 top-[25%] rounded-l-3xl border-y border-l border-cyan-300/25 bg-black/65 px-2 py-4 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
            <SideButton href="/metaverse/contribution" label="创世榜" iconClass="rw-icon-genesis" />
            <SideButton href="/metaverse/war/ranks" label="地票榜" iconClass="rw-icon-ticket" />
            <SideButton href="/plaza" label="广场" iconClass="rw-icon-plaza" />
          </div>

          <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 rounded bg-red-700 px-4 py-2 text-center text-sm font-mono text-white shadow-lg">
            完成新人任务领取福利!
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[14px] border-x-transparent border-t-red-700" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-[82px_1fr_82px] items-end gap-1 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 pb-3 pt-12">
            <BottomPillar href="/metaverse/worlds" label="前往支线" iconClass="rw-icon-branch" prominent />
            <div className="flex min-w-0 items-end justify-center gap-1 rounded-t-3xl bg-black/62 px-1 py-3">
              <BottomPillar href="/metaverse/war/reports" label="战况" iconClass="rw-icon-situation" />
              <BottomPillar href="/metaverse/quests" label="任务" iconClass="rw-icon-task" />
              <BottomPillar href="/prop/backpack" label="道具" iconClass="rw-icon-prop" />
            </div>
            <BottomPillar href="/metaverse/war" label="战斗中" iconClass="rw-icon-fighting" prominent />
          </div>
        </div>
      </div>

      <div className="grid content-start gap-3">
        <section className="rounded-lg border border-cyan-300/15 bg-black/30 p-4">
          <div className="text-xs font-mono text-cyan-300/60">Original App Flow</div>
          <h2 className="mt-1 text-xl font-bold font-mono text-white">元宇宙入口地图</h2>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            入口先落在主线文明地图，再从地图分流到支线、战况、任务、道具、排行和广场。这里保留原 App 的竖屏操作关系，同时接入当前插件页面。
          </p>
        </section>
        <section className="grid grid-cols-2 gap-2">
          <MapStat label="主线" value={`${unlockedCount}/${totalCount || 0}`} />
          <MapStat label="支线" value={`${activeBranchCount}/${branchCount || 0}`} />
          <MapStat label="当前" value={currentMap?.name ?? '-'} />
          <MapStat label="异常" value={String(anomalyCount)} />
        </section>
        <section className="grid grid-cols-2 gap-2">
          <ActionLink href="/map" label="全屏地图" />
          <ActionLink href="/metaverse/war" label="战争中心" />
          <ActionLink href="/metaverse/worlds" label="世界详情" />
          <ActionLink href="/metaverse/quests" label="任务队列" />
        </section>
      </div>
    </section>
  )
}

function WorldMarker({
  href,
  className,
  style,
  badge,
  level,
  name,
  status,
  boss,
  bossDst,
}: {
  href: string
  className: string
  style?: React.CSSProperties
  badge: string
  level: string
  name: string
  status?: string | number
  boss?: boolean
  bossDst?: boolean
}) {
  return (
    <Link href={href} style={style} className={`absolute -translate-x-1/2 -translate-y-1/2 text-center ${className}`}>
      <div className="rw-debris">
        <div className="rw-debris-id">{level}</div>
        <div className="rw-debris-name">{name}</div>
        <div className="rw-debris-race">{badge}</div>
        <div className="rw-debris-labels">
          {boss && <span className="rw-debris-label rw-debris-boss" />}
          {String(status) === '101' && <span className="rw-debris-label rw-debris-lock" />}
          {String(status) === '102' && <span className="rw-debris-label rw-debris-freeze" />}
          {String(status) === '1' && <span className="rw-debris-label rw-debris-unlock" />}
          {String(status) === '11' && <span className="rw-debris-label rw-debris-disaster" />}
          {bossDst && <span className="rw-debris-boss-dst" />}
        </div>
      </div>
    </Link>
  )
}

function IconDock({ href, label, iconClass, edge }: { href: string; label: string; iconClass: string; edge: 'left' | 'right' }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`absolute top-0 flex h-[7.6vw] min-h-[40px] w-[10.8vw] min-w-[56px] items-center justify-center bg-black/60 ${edge === 'left' ? 'left-0 rounded-br-[4vw]' : 'right-0 rounded-bl-[4vw]'}`}
    >
      <SpriteIcon className={`${iconClass} h-9 w-9`} />
    </Link>
  )
}

function SideButton({ href, label, iconClass }: { href: string; label: string; iconClass: string }) {
  return (
    <Link href={href} className="mb-5 flex flex-col items-center text-cyan-300 last:mb-0">
      <SpriteIcon className={`${iconClass} h-12 w-12`} />
      <span className="-mt-1 rounded border border-cyan-300 bg-black/55 px-2 py-0.5 text-sm font-mono text-white">{label}</span>
    </Link>
  )
}

function BottomPillar({ href, label, iconClass, prominent = false }: { href: string; label: string; iconClass: string; prominent?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center text-cyan-300 ${prominent ? 'w-24' : 'w-16'}`}>
      <SpriteIcon className={`${iconClass} ${prominent ? 'h-20 w-20' : 'h-12 w-12'}`} />
      <span className="-mt-1 rounded border border-cyan-300 bg-black/60 px-2 py-0.5 text-sm font-mono text-white">{label}</span>
    </Link>
  )
}

function SpriteIcon({ className }: { className: string }) {
  return <span aria-hidden className={`rw-sprite block ${className}`} />
}

function raceShortName(value: string | number | undefined) {
  const raceName = RACE_NAMES[String(value ?? '')]
  return raceName ? raceName.replace('族', '') : ''
}

function racewarAsset(path?: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const normalized = path.replace(/^\.\.\/image\/racewar\//, '/racewar/')
  if (normalized.startsWith('/racewar/')) return normalized
  if (normalized.startsWith('/')) return `https://www.2140city.cn${normalized}`
  return path
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded border border-white/8 bg-black/25 p-2">
      <div className="text-xs font-mono text-white/25">{label}</div>
      <div className="mt-1 truncate text-sm font-mono text-white/80">{value}</div>
    </div>
  )
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-xs font-mono text-white/30">{label}</div>
      <div className="mt-1 truncate text-lg font-bold font-mono" style={{ color }}>{value}</div>
      {sub && <div className="mt-0.5 truncate text-xs font-mono text-white/25">{sub}</div>}
    </div>
  )
}

function Visual({ href, src, label }: { href: string; src: string; label: string }) {
  return (
    <Link href={href} className="group relative h-28 overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <img src={src} alt="" className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-90" />
      <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-xs font-mono text-white/75">{label}</div>
    </Link>
  )
}

function IdentityTile({ label, value, sub, href }: { label: string; value: string; sub?: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-white/8 bg-black/20 p-3 transition-colors hover:border-white/18">
      <div className="text-xs font-mono text-white/30">{label}</div>
      <div className="mt-1 truncate text-sm font-mono text-white/85">{value}</div>
      {sub && <div className="mt-0.5 truncate text-xs font-mono text-white/25">{sub}</div>}
    </Link>
  )
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded border border-white/10 px-3 py-2 text-center text-xs font-mono text-white/45 transition-colors hover:border-white/25 hover:text-white/75">
      {label}
    </Link>
  )
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded border border-white/10 px-2 py-1 text-xs font-mono text-white/35 transition-colors hover:border-white/25 hover:text-white/65">
      {children}
    </Link>
  )
}

function HpBar({ health, max }: { health: number; max: number }) {
  const safeHealth = Math.max(0, health)
  const pct = Math.max(0, Math.min(100, Math.round((safeHealth / max) * 100)))
  const color = safeHealth <= 0 ? '#ef4444' : safeHealth < max * 0.2 ? '#f59e0b' : '#22c55e'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-20 text-right text-xs font-mono" style={{ color }}>{num(safeHealth)} HP</span>
    </div>
  )
}

function RankList({ rows }: { rows: Array<{ key: string | number; rank: number; name?: string; value?: string; race?: string | number; avatar?: string }> }) {
  if (!rows.length) return <div className="py-6 text-center text-xs font-mono text-white/25">暂无排行数据</div>
  return (
    <div className="space-y-1">
      {rows.map(row => {
        const race = String(row.race ?? '')
        const color = RACE_COLORS[race] ?? '#94a3b8'
        return (
          <div key={row.key} className="flex items-center gap-2 border-b border-white/5 py-1.5 last:border-0">
            <span className="w-5 text-xs font-mono text-white/20">{row.rank}</span>
            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: `${color}55`, backgroundColor: `${color}18` }}>
              {row.avatar
                ? <img src={row.avatar} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-xs font-mono" style={{ color }}>{row.name?.[0] ?? '-'}</div>
              }
            </div>
            <span className="min-w-0 flex-1 truncate text-xs font-mono text-white/70">{row.name ?? '未知'}</span>
            <span className="shrink-0 text-xs font-mono text-white/35">{row.value ?? '-'}</span>
          </div>
        )
      })}
    </div>
  )
}

function QueueList({ rows, fallback }: { rows: any[]; fallback: string }) {
  if (!rows.length) return <div className="py-4 text-center text-xs font-mono text-white/25">{fallback}</div>
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={row.seq ?? `${row.title}-${i}`} className="rounded border border-white/8 bg-black/20 p-3">
          <div className="line-clamp-2 text-xs font-mono leading-relaxed text-white/70">{stripHtml(row.title ?? row.name ?? row.task_desc ?? row.introduce ?? row.desc ?? `任务 ${i + 1}`)}</div>
          {(row.reward || row.hashrate || row.amount || row.per) && (
            <div className="mt-1 text-xs font-mono text-amber-300/55">{row.reward ?? row.hashrate ?? row.amount ?? `${row.per}%`}</div>
          )}
        </div>
      ))}
    </div>
  )
}

function flattenRaceTasks(value: any): any[] {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const direct = value.race_tasks ?? value.tasks
  if (Array.isArray(direct)) return direct
  const source = direct && typeof direct === 'object' ? direct : value
  return Object.values(source).flatMap(level =>
    level && typeof level === 'object'
      ? Object.values(level as Record<string, unknown>).flatMap(group => Array.isArray(group) ? group : [])
      : []
  )
}

function pickCurrentTask(tasks: any[]) {
  return tasks.find(t => String(t.status) !== '1' && Number(t.per ?? 0) < 100) ?? tasks[tasks.length - 1] ?? null
}

function arr(value: any): any[] {
  return Array.isArray(value) ? value : []
}

function stripHtml(value?: string) {
  return String(value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function num(value: any) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return String(value ?? '-')
  return Math.round(n).toLocaleString()
}

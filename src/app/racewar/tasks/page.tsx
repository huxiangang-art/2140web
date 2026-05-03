import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getBranchMissions, getCompletedMissions, getRacewarTasks, login } from '@/lib/api2140'

export const dynamic = 'force-dynamic'

export default async function RacewarTasksPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const [tasksRes, missionsRes, completedRes] = await Promise.allSettled([
    cookie ? getRacewarTasks(cookie) : Promise.resolve(null),
    cookie ? getBranchMissions(cookie) : Promise.resolve([]),
    cookie ? getCompletedMissions(cookie) : Promise.resolve([]),
  ])
  const taskRaw: any = tasksRes.status === 'fulfilled' ? tasksRes.value : null
  const tasks: any[] = Array.isArray(taskRaw) ? taskRaw : taskRaw?.race_tasks ?? taskRaw?.tasks ?? []
  const missionRaw: any = missionsRes.status === 'fulfilled' ? missionsRes.value : []
  const missions: any[] = Array.isArray(missionRaw) ? missionRaw : missionRaw?.data ?? []
  const completedRaw: any = completedRes.status === 'fulfilled' ? completedRes.value : []
  const completed: any[] = Array.isArray(completedRaw) ? completedRaw : completedRaw?.data ?? []

  return (
    <ApkReplicaPage
      title="新手任务"
      subtitle="种族任务 · 支线任务 · 新人引导"
      hero="/apk/user_guide_img1.jpg"
      actions={[
        { href: '/metaverse', label: '进入元宇宙', desc: '返回地图入口' },
        { href: '/racewar', label: '种族战争', desc: '查看战争总览' },
        { href: '/prop', label: '获取道具', desc: '碎片与道具系统' },
        { href: '/tasks', label: '算力任务', desc: '日常任务列表' },
      ]}
    >
      <ApkSection title="种族任务">
        <ApkList>
          {tasks.slice(0, 10).map((task: any, index) => (
            <ApkListItem key={task.seq ?? index} title={task.title ?? task.name ?? `任务 ${index + 1}`} desc={task.desc ?? task.introduce ?? '种族战争任务'} meta={task.status === '1' ? '已完成' : '进行中'} />
          ))}
          {tasks.length === 0 && <ApkListItem title="暂无种族任务" desc="保留 APK racewar_branch_missions 入口。" />}
        </ApkList>
      </ApkSection>

      <ApkSection title="支线任务">
        <ApkList>
          {missions.slice(0, 12).map((mission: any, index) => (
            <ApkListItem key={mission.seq ?? index} title={mission.title ?? mission.name ?? `支线 ${index + 1}`} desc={mission.introduce ?? mission.desc ?? '支线任务'} meta={mission.reward_hashrate ? `+${mission.reward_hashrate}H` : '前往'} />
          ))}
          {completed.slice(0, 4).map((mission: any, index) => (
            <ApkListItem key={`c-${mission.seq ?? index}`} title={mission.title ?? mission.name ?? '已完成任务'} desc="已完成" meta="完成" />
          ))}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}

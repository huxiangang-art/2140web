import { ApkList, ApkListItem, ApkReplicaPage, ApkSection } from '@/components/ApkReplicaPage'
import { getTasks, login } from '@/lib/api2140'
import { routeForApkPage } from '@/lib/apk-route-map'

export const dynamic = 'force-dynamic'

const statusMap: Record<string, string> = { '0': '前往', '1': '已完成', '2': '领取' }
const taskPageByType: Record<string, string> = {
  '1': 'join_race',
  '2': 'invite',
  '3': 'buy_hashrate',
  '4': 'treasure_hunt_futuredebris',
  '5': 'treasure_hunt_index',
  '6': 'write_index',
  '7': 'write_index',
  '8': 'racewar',
  '9': 'write_investment_my',
  '10': 'city_code_index',
  '11': 'racewar_branch_missions',
}

export default async function TasksPage() {
  const cookie = await login(process.env.AGENT_MOBILE!, process.env.AGENT_PASSWD_MD5!)
  const tasks: any[] = cookie ? await getTasks(cookie).catch(() => []) : []

  return (
    <ApkReplicaPage
      title="算力任务"
      subtitle="完成任务越多，算力越多，可获取更多 TOFZ"
      hero="/apk/my_banner.jpg"
      active="task"
      actions={[
        { href: '/hashrate', label: '获取 TOFZ', desc: '进入算力池' },
        { href: '/invite', label: '去邀请', desc: '邀请好友获取算力' },
        { href: '/pay', label: '去充值', desc: '购买算力权益' },
        { href: '/hashrate', label: '算力引擎', desc: '查看引擎与记录' },
      ]}
    >
      <ApkSection title="任务列表">
        <ApkList>
          {tasks.slice(0, 24).map((task: any, index) => (
            <ApkListItem
              key={task.seq ?? index}
              href={routeForApkPage(taskPageByType[String(task.type)] ?? '', '/tasks')}
              title={task.title ?? task.name ?? `任务 ${index + 1}`}
              desc={task.desc ?? task.content ?? `${task.current ?? 0}/${task.target ?? task.target_num ?? 0}`}
              meta={statusMap[String(task.status ?? 0)] ?? '前往'}
            />
          ))}
          {tasks.length === 0 && <ApkListItem title="暂无任务数据" desc="已复刻 APK 任务页入口与底部导航。" />}
        </ApkList>
      </ApkSection>
    </ApkReplicaPage>
  )
}

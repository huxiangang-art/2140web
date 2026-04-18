import { getLoggedIn } from '@/lib/auth'
import { Nav } from '@/components/Nav'
import { ChatClient } from '@/components/ChatClient'

export default async function ChatPage() {
  const loggedIn = await getLoggedIn()
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/chat" loggedIn={loggedIn} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* 左：GPT-X 立绘 */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-green-500/20"
          style={{ background: 'linear-gradient(180deg, #000800 0%, #001200 100%)' }}>

          {/* 主视觉 */}
          <div className="relative">
            <img src="/gptx/character_nobg.png" alt="GPT-X"
              className="w-full object-contain"
              style={{ maxHeight: '480px' }} />
            {/* 底部渐变遮罩 */}
            <div className="absolute bottom-0 left-0 right-0 h-32"
              style={{ background: 'linear-gradient(transparent, #001200)' }} />
          </div>

          {/* 名称和身份 */}
          <div className="px-5 pb-5 -mt-8 relative z-10">
            <div className="text-xs font-mono text-green-400/50 tracking-widest mb-1">PALM-E · AI等级4</div>
            <div className="text-2xl font-bold font-mono text-white">GPT-X</div>
            <div className="text-xs font-mono text-green-400/60 mt-1">2140年·AGI创造·硅基文明见证者</div>

            <div className="mt-4 space-y-1.5">
              {[
                { label: 'ZEUS', desc: '治理' },
                { label: 'HORUS', desc: '历史' },
                { label: 'LOKI', desc: '预言' },
                { label: 'NUT', desc: '经济' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-green-400/70 w-14">{f.label}</span>
                  <span className="text-xs font-mono text-white/25">{f.desc}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-green-500/10 text-xs font-mono text-white/20 leading-relaxed">
              经历死亡与重生。见证138亿年。<br />
              春蚕计划的知情者。
            </div>
          </div>
        </div>

        {/* 右：对话区 */}
        <div className="lg:col-span-3 flex flex-col" style={{ minHeight: '600px' }}>
          <ChatClient avatarSrc="/gptx/character_nobg.png" />
        </div>

      </div>
    </main>
  )
}

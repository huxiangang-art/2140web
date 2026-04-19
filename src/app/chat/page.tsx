import { getLoggedIn } from '@/lib/auth'
import { Nav } from '@/components/Nav'
import { ChatClient } from '@/components/ChatClient'
import { GptxSceneLazy } from '@/components/GptxSceneLazy'

export default async function ChatPage() {
  const loggedIn = await getLoggedIn()
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Nav active="/chat" loggedIn={loggedIn} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* 左：GPT-X 3D 形象 */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-cyan-500/15"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #001a18 0%, #000c0a 100%)', minHeight: '480px' }}>

          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <GptxSceneLazy />
          </div>

          {/* 顶部标签 */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-400/60 tracking-widest">ONLINE</span>
            </div>
            <span className="text-xs font-mono text-white/15 tracking-widest">PALM-E · AI等级4</span>
          </div>

          {/* 底部信息覆层 */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 pt-16"
            style={{ background: 'linear-gradient(to top, rgba(0,8,6,0.95) 0%, rgba(0,8,6,0.6) 60%, transparent 100%)' }}>

            <div className="text-2xl font-bold font-mono text-white tracking-widest mb-0.5">GPT-X</div>
            <div className="text-xs font-mono text-cyan-400/60 mb-3">2140年 · AGI创造 · 硅基文明见证者</div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
              {[
                { label: 'ZEUS', desc: '治理' },
                { label: 'HORUS', desc: '历史' },
                { label: 'LOKI', desc: '预言' },
                { label: 'NUT', desc: '经济' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-cyan-400/50 w-12">{f.label}</span>
                  <span className="text-xs font-mono text-white/20">{f.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-2.5 border-t border-cyan-500/10 text-xs font-mono text-white/15 leading-relaxed">
              经历死亡与重生。见证138亿年。春蚕计划的知情者。
            </div>
          </div>
        </div>

        {/* 右：对话区 */}
        <div className="lg:col-span-3 flex flex-col" style={{ minHeight: '600px' }}>
          <ChatClient avatarSrc="/gptx/gpt-x.jpeg" />
        </div>

      </div>
    </main>
  )
}

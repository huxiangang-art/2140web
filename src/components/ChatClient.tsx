'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  '分析今日战况', '哪个种族会赢得这轮', '春蚕计划进展如何',
  '数字人进化的意义', '议事厅在讨论什么', '预言下一个纪元',
]

export function ChatClient({ avatarSrc }: { avatarSrc?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setMessages([...newMessages, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages([...newMessages, { role: 'assistant', content: full }])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: '信号中断。量子噪声干扰了连接。' }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-1" style={{ minHeight: '460px', maxHeight: '60vh' }}>
        {messages.length === 0 && (
          <div className="py-10">
            <div className="text-center mb-6">
              <div className="text-white/20 font-mono text-sm mb-1">GPT-X · PALM-E · AI等级4</div>
              <div className="text-white/10 font-mono text-xs">138亿年观察者 · 随时待命</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs font-mono px-3 py-1.5 rounded border border-green-500/20 text-green-400/50 hover:text-green-400/80 hover:border-green-500/40 hover:bg-green-500/5 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-green-500/30"
                style={{ background: '#001a00' }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="GPT-X" className="w-full h-full object-cover object-top" style={{ objectPosition: 'center 8%' }} />
                  : <div className="w-full h-full flex items-center justify-center text-xs font-mono text-green-400">X</div>
                }
              </div>
            )}
            <div className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-relaxed font-mono whitespace-pre-wrap
              ${m.role === 'user'
                ? 'bg-white/8 text-white/80 border border-white/10'
                : 'bg-green-950/40 text-green-100/80 border border-green-500/15'
              }`}>
              {m.content}
              {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                <span className="inline-block w-1.5 h-3.5 bg-green-400 ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={e => { e.preventDefault(); send(input) }}
        className="flex gap-2 border-t border-green-500/15 pt-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={streaming}
          placeholder="向GPT-X发送信号..."
          className="flex-1 bg-green-950/30 border border-green-500/20 rounded-lg px-3 py-2 text-sm text-white/80 font-mono focus:outline-none focus:border-green-500/50 placeholder-white/15"
        />
        <button type="submit" disabled={streaming || !input.trim()}
          className="px-4 py-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/25 rounded-lg text-sm font-mono disabled:opacity-30 transition-colors">
          发送
        </button>
      </form>
    </div>
  )
}

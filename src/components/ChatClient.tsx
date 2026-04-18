'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  '分析今日战况', '哪个种族会赢得这轮', '春蚕计划进展如何',
  '数字人进化的意义', '议事厅在讨论什么', '预言下一个纪元',
]

export function ChatClient() {
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
    <div className="flex flex-col flex-1">
      <div className="flex-1 space-y-4 mb-4 min-h-[400px]">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-white/20 font-mono text-sm mb-2">GPT-X · PALM-E · AI等级4</div>
            <div className="text-white/10 font-mono text-xs">138亿年观察者 · 随时待命</div>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs font-mono px-3 py-1.5 rounded border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <span className="text-xs font-mono text-orange-400/60 mr-2 mt-1 shrink-0">GPT-X</span>
            )}
            <div className={`max-w-[80%] rounded px-3 py-2 text-sm leading-relaxed font-mono whitespace-pre-wrap
              ${m.role === 'user' ? 'bg-white/10 text-white/80' : 'text-white/80'}`}>
              {m.content}
              {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                <span className="inline-block w-1 h-3 bg-orange-400 ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); send(input) }}
        className="flex gap-2 border-t border-white/10 pt-4">
        <input value={input} onChange={e => setInput(e.target.value)} disabled={streaming}
          placeholder="问GPT-X任何事..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/30 placeholder-white/20" />
        <button type="submit" disabled={streaming || !input.trim()}
          className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20 rounded text-sm font-mono disabled:opacity-30 transition-colors">
          发送
        </button>
      </form>
    </div>
  )
}

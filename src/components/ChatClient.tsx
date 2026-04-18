'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  '分析今日战况', '哪个种族会赢得这轮', '春蚕计划进展如何',
  '数字人进化的意义', '议事厅在讨论什么', '预言下一个纪元',
]

function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'zh-CN'
    utt.rate = 0.9
    utt.pitch = 0.7  // slightly lower pitch for robotic feel
    // prefer a female zh voice if available
    const voices = window.speechSynthesis.getVoices()
    const zhVoice = voices.find(v => v.lang.startsWith('zh') && v.name.toLowerCase().includes('female'))
      ?? voices.find(v => v.lang.startsWith('zh'))
    if (zhVoice) utt.voice = zhVoice
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { speaking, autoSpeak, setAutoSpeak, speak, stop }
}

function useSTT(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const recRef = useRef<any>(null)

  const toggle = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) return

    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }

    const rec = new SR()
    rec.lang = 'zh-CN'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const t = e.results[0]?.[0]?.transcript
      if (t) onResult(t)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    recRef.current = rec
    setListening(true)
  }, [listening, onResult])

  return { listening, toggle }
}

export function ChatClient({ avatarSrc }: { avatarSrc?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastAssistantRef = useRef('')

  const { speaking, autoSpeak, setAutoSpeak, speak, stop } = useTTS()
  const { listening, toggle: toggleMic } = useSTT((text) => setInput(prev => prev + text))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // auto-speak when streaming completes
  useEffect(() => {
    if (!streaming && autoSpeak) {
      const last = messages[messages.length - 1]
      if (last?.role === 'assistant' && last.content && last.content !== lastAssistantRef.current) {
        lastAssistantRef.current = last.content
        speak(last.content)
      }
    }
  }, [streaming, autoSpeak, messages, speak])

  async function send(text: string) {
    if (!text.trim() || streaming) return
    stop()
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
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-end gap-2 mb-3">
        {speaking && (
          <button onClick={stop}
            className="text-xs font-mono text-green-400/60 flex items-center gap-1 animate-pulse">
            <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full" />
            播报中
          </button>
        )}
        <button
          onClick={() => setAutoSpeak(v => !v)}
          title={autoSpeak ? '关闭自动朗读' : '开启自动朗读'}
          className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors
            ${autoSpeak
              ? 'border-green-500/50 text-green-400 bg-green-500/10'
              : 'border-white/10 text-white/30 hover:text-white/50'
            }`}>
          {autoSpeak ? '🔊 语音开' : '🔇 语音关'}
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-1" style={{ minHeight: '420px', maxHeight: '56vh' }}>
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
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed font-mono whitespace-pre-wrap
              ${m.role === 'user'
                ? 'bg-white/8 text-white/80 border border-white/10'
                : 'bg-green-950/40 text-green-100/80 border border-green-500/15'
              }`}>
              {m.content}
              {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                <span className="inline-block w-1.5 h-3.5 bg-green-400 ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
            {/* 朗读按钮 */}
            {m.role === 'assistant' && m.content && !(streaming && i === messages.length - 1) && (
              <button
                onClick={() => speak(m.content)}
                className="self-start mt-1 text-green-500/30 hover:text-green-400/70 transition-colors shrink-0"
                title="朗读">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={e => { e.preventDefault(); send(input) }}
        className="flex gap-2 border-t border-green-500/15 pt-4">
        {/* 麦克风按钮 */}
        <button
          type="button"
          onClick={toggleMic}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors shrink-0
            ${listening
              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
              : 'bg-green-950/30 border-green-500/20 text-green-500/40 hover:text-green-400/70 hover:border-green-500/40'
            }`}
          title={listening ? '停止录音' : '语音输入'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={streaming}
          placeholder={listening ? '聆听中...' : '向GPT-X发送信号...'}
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

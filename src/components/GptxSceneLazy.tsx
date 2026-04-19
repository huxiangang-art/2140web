'use client'
import dynamic from 'next/dynamic'

const GptxScene = dynamic(
  () => import('./GptxScene').then(m => ({ default: m.GptxScene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex items-center justify-center" style={{ minHeight: '360px' }}>
        <div className="text-xs font-mono text-white/20 animate-pulse">initializing GPT-X...</div>
      </div>
    ),
  }
)

export function GptxSceneLazy() {
  return <GptxScene />
}

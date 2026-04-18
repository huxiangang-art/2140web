import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const mono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: '2140 · 未来之城',
  description: '算力即权力。六族博弈，文明演化，138亿年观察者。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${mono.variable} dark h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}

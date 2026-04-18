import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { RegisterSW } from '@/components/RegisterSW'
import './globals.css'

const mono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: '2140 · 未来之城',
  description: '算力即权力。六族博弈，文明演化，138亿年观察者。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '2140',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${mono.variable} dark h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <RegisterSW />
        {children}
      </body>
    </html>
  )
}

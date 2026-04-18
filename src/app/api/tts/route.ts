export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return new Response('Bad request', { status: 400 })

  try {
    const tts = new MsEdgeTTS()
    await tts.setMetadata(
      'zh-CN-XiaoxiaoNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
    )
    const { audioStream } = await tts.toStream(text)

    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (c: Buffer) => chunks.push(c))
      audioStream.on('end', resolve)
      audioStream.on('error', reject)
    })

    return new Response(Buffer.concat(chunks), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response('TTS error', { status: 500 })
  }
}

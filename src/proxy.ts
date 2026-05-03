import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const normalized = pathname.replace(/^\/metaverse\/War(?=\/|$)/, '/metaverse/war')

  if (normalized !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = normalized
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/metaverse/:path*'],
}

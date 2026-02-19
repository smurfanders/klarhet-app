import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

const PROTECTED = ['/dashboard', '/api/applications', '/api/dashboard', '/api/responses']
const AUTH_ROUTES = ['/login', '/setup']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  const isProtected = PROTECTED.some(r => pathname.startsWith(r))
  if (isProtected && !session.isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuthRoute && session.isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}

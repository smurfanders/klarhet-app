import { getIronSession, type IronSessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  email: string
  isLoggedIn: boolean
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.AUTH_SECRET!,
  cookieName: 'klarhet_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions)
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

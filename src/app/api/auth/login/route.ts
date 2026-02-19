import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import getDb from '@/lib/db'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: 'Invalid credentials' }, { status: 400 })
    }

    const db = getDb()
    const user = db.prepare(`SELECT id, email, password FROM user WHERE email = ?`)
      .get(parsed.data.email) as { id: string; email: string; password: string } | undefined

    // Always run compare even when user not found — prevents timing attacks
    const dummy = '$2b$10$invalid.hash.to.prevent.timing.attacks.xxxxxxxx'
    const match = await bcrypt.compare(parsed.data.password, user?.password ?? dummy)

    if (!user || !match) {
      return NextResponse.json(
        { data: null, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const session = await getSession()
    session.userId = user.id
    session.email = user.email
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    console.error('[api/auth/login]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import getDb from '@/lib/db'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  name: z.string().min(1).max(80),
  setupKey: z.string(),
})

// One-time setup — creates the owner account.
// Locks itself permanently once an account exists.
export async function POST(request: NextRequest) {
  try {
    const db = getDb()

    const existing = db.prepare(`SELECT id FROM user LIMIT 1`).get()
    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Setup already completed' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = setupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    if (parsed.data.setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json({ data: null, error: 'Invalid setup key' }, { status: 403 })
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    db.prepare(`
      INSERT INTO user (id, email, password, name) VALUES ('owner', ?, ?, ?)
    `).run(parsed.data.email, passwordHash, parsed.data.name)

    return NextResponse.json(
      { data: { success: true, message: 'Account created. You can now log in.' }, error: null },
      { status: 201 }
    )
  } catch (err) {
    console.error('[api/auth/setup]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import getDb from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { createApplicationSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const parsed = createApplicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = getDb()
    const id = uuidv4()
    const token = uuidv4().replace(/-/g, '').slice(0, 24)

    db.prepare(`
      INSERT INTO applications (id, company, role, language, token, interview_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, parsed.data.company, parsed.data.role, parsed.data.language,
           token, parsed.data.interview_date ?? null)

    const application = db.prepare(`SELECT * FROM applications WHERE id = ?`)
      .get(id) as Record<string, unknown>

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    return NextResponse.json({
      data: { ...application, feedback_url: `${appUrl}/f/${token}` },
      error: null,
    }, { status: 201 })

  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[api/applications POST]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await requireAuth()

    const db = getDb()
    const applications = db.prepare(`
      SELECT
        a.*,
        r.id          AS response_id,
        r.q1_match,
        r.q2_communication,
        r.q3_reason,
        r.q4_future,
        r.q5_rating,
        r.submitted_at
      FROM applications a
      LEFT JOIN responses r ON r.application_id = a.id
      ORDER BY a.created_at DESC
    `).all()

    return NextResponse.json({ data: applications, error: null })

  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[api/applications GET]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

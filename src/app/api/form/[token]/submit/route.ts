import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import getDb from '@/lib/db'
import { submitResponseSchema } from '@/lib/validation'
import { getIp, hashIp, checkRateLimit, logRateLimit } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    if (!token || !/^[a-f0-9]{24}$/.test(token)) {
      return NextResponse.json({ data: null, error: 'Invalid link' }, { status: 400 })
    }

    const ip = getIp(request)
    const ipHash = hashIp(ip)
    if (!checkRateLimit(ipHash, 'form_submit')) {
      return NextResponse.json(
        { data: null, error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = submitResponseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Invalid form data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = getDb()
    const application = db.prepare(
      `SELECT id FROM applications WHERE token = ?`
    ).get(token) as { id: string } | undefined

    if (!application) {
      return NextResponse.json({ data: null, error: 'Form not found' }, { status: 404 })
    }

    const existing = db.prepare(
      `SELECT id FROM responses WHERE application_id = ?`
    ).get(application.id)

    if (existing) {
      return NextResponse.json(
        { data: null, error: 'This form has already been completed. Thank you!' },
        { status: 409 }
      )
    }

    const { data } = parsed
    db.prepare(`
      INSERT INTO responses (
        id, application_id,
        q1_match, q1_detail,
        q2_communication, q2_checkboxes,
        q3_reason, q3_detail,
        q4_future, q4_detail,
        q5_rating, q6_profile, q7_interview, q7_other, ip_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(), application.id,
      data.q1_match, data.q1_detail ?? null,
      data.q2_communication,
      data.q2_checkboxes ? JSON.stringify(data.q2_checkboxes) : null,
      data.q3_reason, data.q3_detail ?? null,
      data.q4_future, data.q4_detail ?? null,
      data.q5_rating,
      data.q6_profile ?? null,
      data.q7_interview ?? null,
      data.q7_other ?? null,
      ipHash
    )

    logRateLimit(ipHash, 'form_submit')
    return NextResponse.json({ data: { success: true }, error: null }, { status: 201 })

  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { data: null, error: 'This form has already been completed. Thank you!' },
        { status: 409 }
      )
    }
    console.error('[api/form/submit POST]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

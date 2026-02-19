import { NextResponse } from 'next/server'
import getDb from '@/lib/db'
import { requireAuth } from '@/lib/session'

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

    const stats = db.prepare(`
      SELECT
        COUNT(a.id)                                           AS total_applications,
        COUNT(r.id)                                           AS total_responses,
        ROUND(AVG(r.q5_rating), 1)                           AS avg_rating,
        ROUND(100.0 * COUNT(r.id) / MAX(COUNT(a.id), 1), 0) AS response_rate_pct,
        ROUND(
          100.0 *
          SUM(CASE WHEN r.q4_future IN ('yes','maybe') THEN 1 ELSE 0 END) /
          MAX(COUNT(r.id), 1), 0
        )                                                     AS reconsider_pct
      FROM applications a
      LEFT JOIN responses r ON r.application_id = a.id
    `).get()

    const rejectionReasons = db.prepare(`
      SELECT q3_reason AS reason, COUNT(*) AS count
      FROM responses
      WHERE q3_reason IS NOT NULL
      GROUP BY q3_reason
      ORDER BY count DESC
    `).all()

    return NextResponse.json({
      data: { applications, stats, rejectionReasons },
      error: null,
    })

  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[api/dashboard GET]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

import { createHash } from 'crypto'
import getDb from './db'

const WINDOW_MINUTES = 60
const MAX_SUBMISSIONS = parseInt(process.env.RATE_LIMIT_MAX ?? '5', 10)

export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.AUTH_SECRET)
    .digest('hex')
}

export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

export function checkRateLimit(ipHash: string, action: string): boolean {
  const db = getDb()
  const windowStart = new Date(
    Date.now() - WINDOW_MINUTES * 60 * 1000
  ).toISOString()

  const row = db.prepare(`
    SELECT COUNT(*) as count FROM rate_limit_log
    WHERE ip_hash = ? AND action = ? AND created_at >= ?
  `).get(ipHash, action, windowStart) as { count: number }

  return row.count < MAX_SUBMISSIONS
}

export function logRateLimit(ipHash: string, action: string): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO rate_limit_log (ip_hash, action) VALUES (?, ?)`
  ).run(ipHash, action)

  // Prune entries older than 24 hours
  db.prepare(`
    DELETE FROM rate_limit_log
    WHERE created_at < datetime('now', '-24 hours')
  `).run()
}

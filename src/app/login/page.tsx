'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') ?? '/dashboard'
  const justSetup = params.get('setup') === 'done'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong')
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>Klarhet</div>

        {justSetup && (
          <div style={styles.success}>
            Account created — you can now log in.
          </div>
        )}

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Log in to your dashboard.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            autoFocus
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bg: {
    minHeight: '100vh',
    background: '#0d0f14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: '#13161d',
    border: '1px solid #252936',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  },
  logo: {
    fontFamily: 'serif',
    fontSize: '22px',
    fontWeight: 700,
    color: '#e8b86d',
    marginBottom: '28px',
    letterSpacing: '-0.5px',
  },
  heading: { fontSize: '24px', fontWeight: 700, color: '#e8eaf0', marginBottom: '8px' },
  sub: { fontSize: '14px', color: '#5a6080', marginBottom: '28px', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', color: '#5a6080', letterSpacing: '1.5px',
           textTransform: 'uppercase', marginTop: '12px', marginBottom: '4px' },
  input: {
    background: '#1a1e28',
    border: '1px solid #252936',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#e8eaf0',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  error: {
    background: 'rgba(232,112,112,0.1)',
    border: '1px solid rgba(232,112,112,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#e87070',
    marginTop: '8px',
  },
  success: {
    background: 'rgba(94,196,131,0.1)',
    border: '1px solid rgba(94,196,131,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#5ec483',
    marginBottom: '20px',
  },
  btn: {
    marginTop: '20px',
    background: '#e8b86d',
    color: '#0d0f14',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
}

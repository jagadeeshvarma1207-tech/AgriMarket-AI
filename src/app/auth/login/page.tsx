'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Leaf, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || null

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError(res.error)
      return
    }

    // Fetch session to check role
    const sessionRes = await fetch('/api/auth/session')
    const session = await sessionRes.json()
    const role = session?.user?.role

    if (callbackUrl) {
      router.push(callbackUrl)
    } else if (role === 'FARMER') {
      router.push('/farmer/dashboard')
    } else {
      router.push('/consumer')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(22,163,74,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={24} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>AgriMarket <span style={{ color: 'var(--color-primary-light)' }}>AI</span></span>
          </Link>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 8 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 24, textAlign: 'center' }}>Welcome back</h2>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-danger-pale)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <AlertCircle size={16} color="var(--color-danger)" />
              <span style={{ fontSize: '0.9rem', color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginTop: 4 }}
            >
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }} />

          {/* Demo accounts */}
          <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Demo Accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { role: 'Farmer', email: 'farmer@demo.com', pw: 'demo1234' },
                { role: 'Consumer', email: 'consumer@demo.com', pw: 'demo1234' },
              ].map((d) => (
                <button
                  key={d.role}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', gap: 8 }}
                  onClick={() => setForm({ email: d.email, password: d.pw })}
                >
                  <span style={{ fontSize: '0.7rem', background: 'var(--color-bg-elevated)', padding: '2px 8px', borderRadius: 999, color: 'var(--color-primary-light)', fontWeight: 600 }}>{d.role}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  )
}

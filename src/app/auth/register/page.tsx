'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle, Tractor, ShoppingBag } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import LanguageSelector from '@/components/ui/LanguageSelector'

function RegisterPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || ''

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: defaultRole,
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const { t } = useI18n()

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    // Client validation
    const errs: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.includes('@')) errs.email = 'Enter a valid email'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.role) errs.role = 'Please select your role'

    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, role: form.role }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) { setErrors(data.errors) }
        else { setApiError(data.error || 'Registration failed') }
        return
      }

      // Auto sign in
      const signInRes = await signIn('credentials', { email: form.email.trim().toLowerCase(), password: form.password, redirect: false })
      if (signInRes?.error) { router.push('/auth/login'); return }

      router.push(form.role === 'FARMER' ? '/farmer/dashboard' : '/consumer')
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.08) 0%, transparent 50%)', pointerEvents: 'none' }} />

      {/* Top right language selector */}
      <div style={{ position: 'absolute', top: 24, right: 24 }}>
        <LanguageSelector />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>AgriMarket AI</span>
          </Link>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 6 }}>{t('auth.createAccount', 'Create your free account')}</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 24, textAlign: 'center' }}>{t('auth.signUp', 'Join AgriMarket')}</h2>

          {apiError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <AlertCircle size={16} color="var(--color-danger)" />
              <span style={{ fontSize: '0.9rem', color: '#fca5a5' }}>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Role selection */}
            <div className="form-group">
              <label className="form-label">{t('nav.profile', 'I want to')} <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { value: 'FARMER', label: t('auth.farmer', 'Sell Produce'), sub: 'I am a farmer', icon: Tractor, color: 'var(--color-primary)' },
                  { value: 'CONSUMER', label: t('auth.consumer', 'Buy Produce'), sub: 'I am a consumer', icon: ShoppingBag, color: 'var(--color-accent)' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => set('role', r.value)}
                    style={{
                      background: form.role === r.value ? `${r.color}15` : 'var(--color-bg-secondary)',
                      border: `2px solid ${form.role === r.value ? r.color : 'var(--color-border)'}`,
                      borderRadius: 12, padding: '14px 12px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                  >
                    <r.icon size={22} color={form.role === r.value ? r.color : 'var(--color-text-muted)'} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: form.role === r.value ? r.color : 'var(--color-text)' }}>{r.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.sub}</span>
                  </button>
                ))}
              </div>
              {errors.role && <span className="form-error"><AlertCircle size={13} />{errors.role}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.name', 'Full name')}</label>
              <input type="text" className="form-input" placeholder="Your name" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
              {errors.name && <span className="form-error"><AlertCircle size={13} />{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.email', 'Email address')}</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
              {errors.email && <span className="form-error"><AlertCircle size={13} />{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.password', 'Password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} className="form-input"
                  placeholder="Min 8 characters" value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="new-password" style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error"><AlertCircle size={13} />{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.confirmPassword', 'Confirm password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} className="form-input"
                  placeholder="Repeat your password" value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle size={18} color="var(--color-success)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>
              {errors.confirmPassword && <span className="form-error"><AlertCircle size={13} />{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> {t('common.submitting', 'Creating account...')}</> : t('auth.createAccount', 'Create Account')}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }} />
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {t('auth.haveAccount', 'Already have an account?')}
            <Link href="/auth/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600, marginLeft: 4 }}>{t('auth.signIn', 'Sign in')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <RegisterPageInner />
    </Suspense>
  )
}

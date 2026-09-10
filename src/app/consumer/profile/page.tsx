'use client'
import { useEffect, useState } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { User, Phone, MapPin, Save, AlertCircle, CheckCircle } from 'lucide-react'

export default function ConsumerProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    deliveryAddress: '',
  })

  useEffect(() => {
    fetch('/api/consumer/profile')
      .then(r => r.json())
      .then(d => {
        if (d.consumer) {
          setForm({
            name: d.consumer.user?.name || session?.user.name || '',
            phone: d.consumer.phone || '',
            deliveryAddress: d.consumer.deliveryAddress || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/consumer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toastError(data.error || 'Failed to save profile')
        return
      }
      success('Profile updated successfully!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <ConsumerNav />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <User size={24} color="var(--color-primary-light)" /> My Profile
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your personal information</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
          </div>
        ) : (
          <div className="card" style={{ padding: 32 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-ai))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {form.name?.charAt(0)?.toUpperCase() || session?.user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>
                  {form.name || session?.user?.name}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  {session?.user?.email}
                </div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(22,163,74,0.1)', color: 'var(--color-primary-light)', fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                  <CheckCircle size={12} /> Consumer Account
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Delivery Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--color-text-muted)' }} />
                  <textarea
                    className="form-input"
                    style={{ paddingLeft: 38, resize: 'vertical' }}
                    rows={3}
                    value={form.deliveryAddress}
                    onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                    placeholder="Your delivery address"
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
                <AlertCircle size={16} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Your contact information is used to coordinate with farmers for order pickup/delivery. It is not publicly displayed.
                </p>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', gap: 8 }}>
                {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

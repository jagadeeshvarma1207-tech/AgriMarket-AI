'use client'
import { useEffect, useState } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useToast } from '@/components/ui/Toast'
import { User, Phone, Leaf, Save } from 'lucide-react'

export default function FarmerProfilePage() {
  const { success, error: toastError } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', farmName: '', bio: '', phone: '', avatarUrl: '', coverUrl: '' })

  useEffect(() => {
    fetch('/api/farmer/profile')
      .then(r => r.json())
      .then(d => {
        if (d.farmer) {
          setProfile(d.farmer)
          setForm({
            name: d.farmer.user?.name || '',
            farmName: d.farmer.farmName || '',
            bio: d.farmer.bio || '',
            phone: d.farmer.phone || '',
            avatarUrl: d.farmer.avatarUrl || '',
            coverUrl: d.farmer.coverUrl || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/farmer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { success('Profile updated successfully!') }
    else { toastError('Failed to update profile') }
    setSaving(false)
  }

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>My Profile</h1>
        </div>
        <div className="dashboard-content">
          {loading ? <div className="skeleton" style={{ height: 400 }} /> : (
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 20 }}>Farmer Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Farm Name</label>
                      <input className="form-input" value={form.farmName} onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))} placeholder="e.g. Green Valley Farms" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bio / About Your Farm</label>
                      <textarea className="form-textarea" rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell consumers about your farm, growing practices, specialties..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Only shared with consumers who place orders</span>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                      {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : <><Save size={16} /> Save Profile</>}
                    </button>
                  </div>
                </div>

                {/* Avatar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card">
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: 16 }}>Profile Photo</h4>
                    {form.avatarUrl && (
                      <img src={form.avatarUrl} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                    )}
                    <ImageUpload
                      onUpload={url => setForm(f => ({ ...f, avatarUrl: url }))}
                      subDir="avatars"
                      label="Upload Profile Photo"
                    />
                  </div>
                  {profile && (
                    <div className="card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Account Info</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{profile.user?.email}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{profile.reviewCount} reviews · {profile.totalRating > 0 ? profile.totalRating.toFixed(1) + '★' : 'No rating yet'}</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

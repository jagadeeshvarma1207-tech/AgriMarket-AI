'use client'
import { useSession, signOut } from 'next-auth/react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { Settings, LogOut, Shield, Bell } from 'lucide-react'

export default function FarmerSettingsPage() {
  const { data: session } = useSession()
  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Settings</h1>
        </div>
        <div className="dashboard-content">
          <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} color="var(--color-primary-light)" /> Account Security
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>Email</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>{session?.user.email}</p>
                  </div>
                  <span className="badge badge-green">Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>Role</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>Farmer account</p>
                  </div>
                  <span className="badge badge-green">FARMER</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={18} color="var(--color-accent)" /> Notifications
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Email notifications for new orders, messages, and reviews will be available in a future update.
              </p>
            </div>

            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16, color: 'var(--color-danger)' }}>Danger Zone</h3>
              <button className="btn btn-danger" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut size={16} /> Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

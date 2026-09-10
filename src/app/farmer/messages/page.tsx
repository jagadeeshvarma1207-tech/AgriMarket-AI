'use client'
import { useEffect, useState } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { useToast } from '@/components/ui/Toast'
import { formatDateTime } from '@/lib/utils'
import { MessageSquare, MailOpen, Mail } from 'lucide-react'

export default function FarmerMessagesPage() {
  const { error: toastError } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/farmer/messages')
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(() => toastError('Failed to load messages'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Messages</h1>
        </div>
        <div className="dashboard-content">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} style={{ color: 'var(--color-text-muted)' }} />
              <h3>No messages yet</h3>
              <p>When consumers contact you, their messages will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="card"
                    style={{
                      padding: '16px 20px', cursor: 'pointer',
                      borderColor: selected?.id === msg.id ? 'var(--color-primary)' : undefined,
                      opacity: msg.isRead ? 0.8 : 1,
                    }}
                    onClick={() => setSelected(msg)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {msg.isRead ? <MailOpen size={16} color="var(--color-text-muted)" /> : <Mail size={16} color="var(--color-primary-light)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: msg.isRead ? 500 : 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{msg.senderName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDateTime(msg.createdAt)}</span>
                        </div>
                        {msg.subject && <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>{msg.subject}</p>}
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{msg.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selected && (
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', margin: 0 }}>{selected.subject || 'Message'}</h3>
                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>×</button>
                  </div>
                  <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem', margin: '0 0 4px' }}>{selected.senderName}</p>
                    {selected.senderEmail && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', margin: '0 0 2px' }}>📧 {selected.senderEmail}</p>}
                    {selected.senderPhone && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>📞 {selected.senderPhone}</p>}
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6, marginBottom: 0 }}>{formatDateTime(selected.createdAt)}</p>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{selected.body}</p>
                  {selected.senderPhone && (
                    <a href={`tel:${selected.senderPhone}`} className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
                      📞 Call {selected.senderName}
                    </a>
                  )}
                  {selected.senderEmail && (
                    <a href={`mailto:${selected.senderEmail}`} className="btn btn-ghost btn-sm" style={{ marginTop: 10, display: 'inline-flex' }}>
                      Reply via Email
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

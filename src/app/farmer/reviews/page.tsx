'use client'
import { useEffect, useState } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { StarRating } from '@/components/ui/StarRating'
import { formatDate } from '@/lib/utils'
import { Star, MessageSquare } from 'lucide-react'

export default function FarmerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ avg: 0, count: 0, breakdown: [0,0,0,0,0] })

  useEffect(() => {
    fetch('/api/farmer/profile')
      .then(r => r.json())
      .then(async d => {
        if (d.farmer) {
          const res = await fetch(`/api/reviews?farmerId=${d.farmer.id}`)
          const data = await res.json()
          const revs = data.reviews || []
          setReviews(revs)
          const breakdown = [5,4,3,2,1].map(s => revs.filter((r: any) => r.stars === s).length)
          const avg = revs.length > 0 ? revs.reduce((sum: number, r: any) => sum + r.stars, 0) / revs.length : 0
          setStats({ avg, count: revs.length, breakdown })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Customer Reviews</h1>
        </div>
        <div className="dashboard-content">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
            </div>
          ) : (
            <>
              {/* Summary */}
              {stats.count > 0 && (
                <div className="card" style={{ display: 'flex', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: 'var(--color-accent)' }}>{stats.avg.toFixed(1)}</div>
                    <StarRating value={stats.avg} readOnly size={20} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{stats.count} review{stats.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {[5,4,3,2,1].map((s, i) => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', width: 12, textAlign: 'right' }}>{s}</span>
                        <Star size={12} color="var(--color-accent)" fill="var(--color-accent)" />
                        <div style={{ flex: 1, height: 8, background: 'var(--color-bg-elevated)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${stats.count > 0 ? (stats.breakdown[i] / stats.count) * 100 : 0}%`, height: '100%', background: 'var(--color-accent)', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', width: 20 }}>{stats.breakdown[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={48} style={{ color: 'var(--color-text-muted)' }} />
                  <h3>No reviews yet</h3>
                  <p>Reviews will appear here after consumers complete orders and leave feedback.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviews.map((review) => (
                    <div key={review.id} className="card" style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-ai))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                            {review.consumer?.user?.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>{review.consumer?.user?.name}</p>
                            <StarRating value={review.stars} readOnly size={14} />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDate(review.createdAt)}</span>
                      </div>
                      {review.title && <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: 6 }}>{review.title}</p>}
                      {review.body && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>{review.body}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

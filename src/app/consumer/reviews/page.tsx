'use client'
import { useEffect, useState } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { StarRating } from '@/components/ui/StarRating'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { Star, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConsumerReviewsPage() {
  const { success, error: toastError } = useToast()
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([])
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewForms, setReviewForms] = useState<Record<string, { stars: number; title: string; body: string }>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/orders?status=COMPLETED').then(r => r.json()),
      fetch('/api/reviews/mine').then(r => r.json()).catch(() => ({ reviews: [] })),
    ]).then(([ordersData, reviewsData]) => {
      const orders = ordersData.orders || []
      const reviews = reviewsData.reviews || []
      setMyReviews(reviews)
      const reviewedOrderIds = new Set(reviews.map((r: any) => r.orderId))
      setEligibleOrders(orders.filter((o: any) => !reviewedOrderIds.has(o.id)))
    }).finally(() => setLoading(false))
  }, [])

  const submitReview = async (orderId: string, farmerId: string, productId?: string) => {
    const form = reviewForms[orderId]
    if (!form || form.stars === 0) {
      toastError('Please select a star rating')
      return
    }
    setSubmitting(orderId)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          farmerId,
          productId,
          stars: form.stars,
          title: form.title,
          body: form.body,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toastError(data.error || 'Failed to submit review')
        return
      }
      success('Review submitted successfully!')
      setEligibleOrders(prev => prev.filter(o => o.id !== orderId))
      setMyReviews(prev => [data.review, ...prev])
      setReviewForms(prev => {
        const next = { ...prev }
        delete next[orderId]
        return next
      })
    } finally {
      setSubmitting(null)
    }
  }

  const setForm = (orderId: string, field: string, value: any) => {
    setReviewForms(prev => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || { stars: 0, title: '', body: '' }), [field]: value },
    }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <ConsumerNav />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Star size={24} color="var(--color-accent)" /> My Reviews
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Rate and review your completed orders</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
          </div>
        ) : (
          <>
            {/* Orders pending review */}
            {eligibleOrders.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 16, color: 'var(--color-accent)' }}>
                  Pending Reviews ({eligibleOrders.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {eligibleOrders.map(order => {
                    const productName = order.items?.[0]?.productName || 'Product'
                    const farmerName = order.farmer?.user?.name || 'Farmer'
                    const form = reviewForms[order.id] || { stars: 0, title: '', body: '' }
                    return (
                      <div key={order.id} className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{productName}</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                              from {farmerName} · {formatDate(order.createdAt)}
                            </div>
                          </div>
                          <Link href={`/consumer/orders`} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ShoppingBag size={14} /> View Order
                          </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Your Rating *</label>
                            <StarRating
                              value={form.stars}
                              onChange={v => setForm(order.id, 'stars', v)}
                              size={24}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Review Title (optional)</label>
                            <input
                              className="form-input"
                              placeholder="Summarize your experience"
                              value={form.title}
                              onChange={e => setForm(order.id, 'title', e.target.value)}
                              maxLength={100}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Your Review (optional)</label>
                            <textarea
                              className="form-input"
                              placeholder="Share your experience with this product and farmer..."
                              value={form.body}
                              onChange={e => setForm(order.id, 'body', e.target.value)}
                              rows={3}
                              maxLength={1000}
                              style={{ resize: 'vertical' }}
                            />
                          </div>
                          <button
                            className="btn btn-primary"
                            disabled={submitting === order.id || form.stars === 0}
                            onClick={() => submitReview(order.id, order.farmer?.id, order.items?.[0]?.productId)}
                            style={{ alignSelf: 'flex-start', gap: 8 }}
                          >
                            {submitting === order.id ? (
                              <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</>
                            ) : (
                              <><Star size={15} /> Submit Review</>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* My past reviews */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 16 }}>
                Past Reviews ({myReviews.length})
              </h2>
              {myReviews.length === 0 && eligibleOrders.length === 0 ? (
                <div className="empty-state">
                  <Star size={48} style={{ color: 'var(--color-text-muted)' }} />
                  <h3>No reviews yet</h3>
                  <p>Complete an order to leave a review for the farmer.</p>
                  <Link href="/consumer/browse" className="btn btn-primary">Browse Products</Link>
                </div>
              ) : myReviews.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No past reviews yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {myReviews.map(review => (
                    <div key={review.id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <StarRating value={review.stars} readOnly size={16} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(review.createdAt)}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-success)' }}>
                          <CheckCircle size={14} /> Published
                        </div>
                      </div>
                      {review.title && <div style={{ fontWeight: 600, marginBottom: 6 }}>{review.title}</div>}
                      {review.body && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.body}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

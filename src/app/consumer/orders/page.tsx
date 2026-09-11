'use client'
import { useEffect, useState } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge'
import { StarRating } from '@/components/ui/StarRating'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDateTime, getNextOrderStatuses } from '@/lib/utils'
import { ShoppingBag, Star } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function ConsumerOrdersPage() {
  const { success, error: toastError } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({ stars: 5, title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return
    const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CANCELLED' }) })
    const d = await res.json()
    if (res.ok) { setOrders(ords => ords.map(o => o.id === orderId ? d.order : o)); success('Order cancelled') }
    else toastError(d.error || 'Failed to cancel')
  }

  const submitReview = async () => {
    if (!reviewModal) return
    setSubmitting(true)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: reviewModal.id, stars: reviewForm.stars, title: reviewForm.title, body: reviewForm.body, productId: reviewModal.items?.[0]?.productId }),
    })
    const d = await res.json()
    if (res.ok) {
      success('Review submitted! Thank you.')
      setOrders(ords => ords.map(o => o.id === reviewModal.id ? { ...o, review: d.review } : o))
      setReviewModal(null)
    } else toastError(d.error || 'Failed to submit review')
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <ConsumerNav />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 24 }}>{t('sidebar.orders', 'My Orders')}</h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} style={{ color: 'var(--color-text-muted)' }} />
            <h3>{t('dashboard.noOrders', 'No orders yet')}</h3>
            <p>{t('sidebar.browse', 'Browse products and place your first order from a local farmer!')}</p>
            <a href="/consumer/browse" className="btn btn-primary">{t('sidebar.browse', 'Browse Products')}</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t('sidebar.orders', 'Order')} #{order.id.slice(-8).toUpperCase()}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>
                      from <strong style={{ color: 'var(--color-text-secondary)' }}>{order.farmer?.farmName || order.farmer?.user?.name}</strong> · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary-light)' }}>{formatPrice(order.totalPrice)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌾</div>
                      )}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>{item.productName}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{item.quantity} {t(`product.${item.unit.toLowerCase()}`, item.unit)} × {formatPrice(item.unitPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {order.status === 'PENDING' && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(order.id)}>Cancel Order</button>
                  )}
                  {order.status === 'COMPLETED' && !order.review && (
                    <button className="btn btn-accent btn-sm" onClick={() => { setReviewModal(order); setReviewForm({ stars: 5, title: '', body: '' }) }}>
                      <Star size={14} /> Leave a Review
                    </button>
                  )}
                  {order.review && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 999 }}>
                      <Star size={12} color="var(--color-accent)" fill="var(--color-accent)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>Reviewed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review" maxWidth="480px">
        {reviewModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              How was your experience with this order from <strong>{reviewModal.farmer?.user?.name}</strong>?
            </p>
            <div className="form-group">
              <label className="form-label">Star Rating</label>
              <StarRating value={reviewForm.stars} onChange={v => setReviewForm(f => ({ ...f, stars: v }))} size={28} />
            </div>
            <div className="form-group">
              <label className="form-label">Title (optional)</label>
              <input className="form-input" placeholder="Summarize your experience" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea className="form-textarea" rows={4} placeholder="Share details about produce quality, freshness, communication..." value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview} disabled={submitting} style={{ flex: 2 }}>
                {submitting ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { QualityBadge } from '@/components/ui/QualityBadge'
import { StarRating } from '@/components/ui/StarRating'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDate, timeAgo } from '@/lib/utils'
import { QUANTITY_UNITS } from '@/lib/validation'
import { MapPin, Phone, MessageSquare, ShoppingCart, Heart, ArrowLeft, Leaf, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/maps/LeafletMap'), { ssr: false })

export default function ProductDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const { success, error: toastError } = useToast()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [orderModal, setOrderModal] = useState(false)
  const [contactModal, setContactModal] = useState(false)
  const [orderQty, setOrderQty] = useState(1)
  const [deliveryType, setDeliveryType] = useState('PICKUP')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [consumerNote, setConsumerNote] = useState('')
  const [ordering, setOrdering] = useState(false)

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.json()),
      session?.user.role === 'CONSUMER'
        ? fetch('/api/consumer/favorites').then(r => r.json()).catch(() => ({ favorites: [] }))
        : Promise.resolve({ favorites: [] }),
    ]).then(([pd, favs]) => {
      setProduct(pd.product)
      const favIds = new Set(favs.favorites?.map((f: any) => f.productId) || [])
      setIsFav(favIds.has(id as string))
    }).finally(() => setLoading(false))
  }, [id, session])

  const toggleFav = async () => {
    if (!session) { router.push('/auth/login'); return }
    const res = await fetch('/api/consumer/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) })
    const d = await res.json()
    setIsFav(d.favorited)
  }

  const placeOrder = async () => {
    if (!session) { router.push('/auth/login'); return }
    if (session.user.role !== 'CONSUMER') { toastError('Only consumers can place orders'); return }
    setOrdering(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: id, quantity: orderQty }],
        deliveryType, deliveryAddress, consumerNote,
      }),
    })
    const d = await res.json()
    if (res.ok) {
      success('Order placed! The farmer will confirm soon.')
      setOrderModal(false)
      router.push('/consumer/orders')
    } else { toastError(d.error || 'Failed to place order') }
    setOrdering(false)
  }

  const sendMessage = async () => {
    if (!contactForm.name || !contactForm.message) { toastError('Name and message are required'); return }
    setSending(true)
    const res = await fetch('/api/farmer/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId: product.farmer.id, senderName: contactForm.name, senderEmail: contactForm.email, senderPhone: contactForm.phone, subject: contactForm.subject, messageBody: contactForm.message }),
    })
    if (res.ok) { success('Message sent to farmer!'); setContactModal(false) }
    else { toastError('Failed to send message') }
    setSending(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <h3>Product not found</h3>
        <Link href="/marketplace" className="btn btn-primary">Back to Marketplace</Link>
      </div>
    </div>
  )

  const unitLabel = QUANTITY_UNITS.find(u => u.value === product.unit)?.label.split(' ')[0] || product.unit
  const aiResult = product.aiResults?.[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,17,23,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginLeft: 'auto' }}>
            <Leaf size={20} color="var(--color-primary-light)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>AgriMarket AI</span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40, alignItems: 'start' }}>
          {/* Left */}
          <div>
            <ImageCarousel images={product.images} />

            {/* Reviews */}
            {product.reviews?.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={20} color="var(--color-accent)" /> Reviews ({product.reviews.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {product.reviews.map((r: any) => (
                    <div key={r.id} className="card" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-ai))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                          {r.consumer?.user?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{r.consumer?.user?.name}</p>
                          <StarRating value={r.stars} readOnly size={13} />
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{timeAgo(r.createdAt)}</span>
                      </div>
                      {r.title && <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: 4 }}>{r.title}</p>}
                      {r.body && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>{r.body}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Main info */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600, background: 'rgba(22,163,74,0.1)', padding: '3px 10px', borderRadius: 999 }}>{product.category}</span>
                <button onClick={toggleFav} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Heart size={22} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'var(--color-text-muted)'} />
                </button>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', marginBottom: 10 }}>{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {product.qualityGrade !== 'UNGRADED' && (
                  <QualityBadge grade={product.qualityGrade} confidence={product.aiConfidence} showLabel />
                )}
                {product.totalRating > 0 && <StarRating value={product.totalRating} readOnly showCount count={product.reviewCount} />}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary-light)' }}>{formatPrice(product.price)}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>/ {unitLabel}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available</p>
                  <p style={{ fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{product.quantity} {unitLabel}</p>
                </div>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</p>
                  <p style={{ fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{product.orderCount}</p>
                </div>
              </div>

              {product.description && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 16 }}>{product.description}</p>
              )}

              {product.harvestDate && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                  <CheckCircle size={14} color="var(--color-primary-light)" /> Harvested: {formatDate(product.harvestDate)}
                </p>
              )}

              {/* Action buttons */}
              {product.status === 'ACTIVE' && session?.user.role === 'CONSUMER' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button className="btn btn-primary" style={{ flex: 2, padding: '0.75rem' }} onClick={() => setOrderModal(true)}>
                    <ShoppingCart size={18} /> Place Order
                  </button>
                  <button className="btn btn-ghost" onClick={() => setContactModal(true)}>
                    <MessageSquare size={18} />
                  </button>
                </div>
              )}
              {!session && (
                <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>
                  Sign in to Order
                </Link>
              )}
            </div>

            {/* Farmer Card */}
            <div className="card">
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: 14 }}>About the Farmer</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  {product.farmer?.user?.name?.charAt(0) || 'F'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{product.farmer?.farmName || product.farmer?.user?.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {product.farmer?.totalRating > 0 && <StarRating value={product.farmer.totalRating} readOnly size={12} showCount count={product.farmer.reviewCount} />}
                  </div>
                </div>
              </div>
              {product.farmer?.location && (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <MapPin size={13} />
                  {[product.farmer.location.displayAddress || product.farmer.location.city, product.farmer.location.state].filter(Boolean).join(', ')}
                </p>
              )}
              {session?.user.role === 'CONSUMER' && (
                <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setContactModal(true)}>
                  <MessageSquare size={16} /> Contact Farmer
                </button>
              )}
            </div>

            {/* Map */}
            {product.farmer?.location?.approxLatitude && product.farmer?.location?.approxLongitude && (
              <div className="card" style={{ padding: 16 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: 12 }}>📍 Approximate Location</h4>
                <MapComponent
                  lat={product.farmer.location.approxLatitude}
                  lng={product.farmer.location.approxLongitude}
                  label={product.farmer.location.sellingLocation || product.farmer.farmName || 'Farmer location'}
                  height={200}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center', margin: '8px 0 0' }}>Approximate location for privacy</p>
              </div>
            )}

            {/* AI Result */}
            {aiResult && (
              <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(22,163,74,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16, padding: 20 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-ai-light)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✨ AI QUALITY ASSESSMENT {aiResult.isPlaceholder && '(DEMO)'}
                </p>
                <QualityBadge grade={aiResult.grade} confidence={aiResult.confidence} showLabel isPlaceholder={aiResult.isPlaceholder} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <Modal isOpen={orderModal} onClose={() => setOrderModal(false)} title="Place Order" maxWidth="440px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            {product.images?.[0]?.url && <img src={product.images[0].url} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }} />}
            <div>
              <p style={{ fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{product.name}</p>
              <p style={{ color: 'var(--color-primary-light)', fontWeight: 600, margin: 0 }}>{formatPrice(product.price)} / {unitLabel}</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity ({unitLabel})</label>
            <input className="form-input" type="number" min="0.1" max={product.quantity} step="0.1" value={orderQty} onChange={e => setOrderQty(parseFloat(e.target.value))} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Max available: {product.quantity} {unitLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(22,163,74,0.1)', borderRadius: 10 }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{formatPrice(product.price * orderQty)}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Type</label>
            <select className="form-select" value={deliveryType} onChange={e => setDeliveryType(e.target.value)}>
              <option value="PICKUP">Pickup from farmer</option>
              <option value="DELIVERY">Home delivery</option>
            </select>
          </div>
          {deliveryType === 'DELIVERY' && (
            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <textarea className="form-textarea" rows={2} placeholder="Enter your delivery address..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Note to Farmer (optional)</label>
            <input className="form-input" placeholder="Any special requests?" value={consumerNote} onChange={e => setConsumerNote(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setOrderModal(false)} style={{ flex: 1 }}>Cancel</button>
            <button className="btn btn-primary" onClick={placeOrder} disabled={ordering || orderQty <= 0 || orderQty > product.quantity} style={{ flex: 2 }}>
              {ordering ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Placing...</> : <><ShoppingCart size={16} /> Confirm Order</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={contactModal} onClose={() => setContactModal(false)} title="Contact Farmer" maxWidth="440px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Send a message to <strong>{product.farmer?.farmName || product.farmer?.user?.name}</strong>
          </p>
          <div className="form-group">
            <label className="form-label">Your Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input className="form-input" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} placeholder={session?.user.name || 'Your name'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input className="form-input" value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Inquiry about tomatoes" />
          </div>
          <div className="form-group">
            <label className="form-label">Message <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <textarea className="form-textarea" rows={4} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} placeholder="Hi, I'm interested in your products..." />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setContactModal(false)} style={{ flex: 1 }}>Cancel</button>
            <button className="btn btn-primary" onClick={sendMessage} disabled={sending} style={{ flex: 2 }}>
              {sending ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <MessageSquare size={16} />}
              Send Message
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDateTime, getNextOrderStatuses, ORDER_STATUS_LABELS } from '@/lib/utils'
import { ShoppingBag, Phone, MessageSquare, ChevronDown, Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function FarmerOrdersPage() {
  const { success, error: toastError } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [updating, setUpdating] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/orders${filter !== 'all' ? `?status=${filter}` : ''}`)
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(() => toastError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [filter])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (res.ok) {
      setOrders(ords => ords.map(o => o.id === orderId ? data.order : o))
      setSelectedOrder(data.order)
      success(`Order status updated to ${ORDER_STATUS_LABELS[status]}`)
    } else {
      toastError(data.error || 'Failed to update order')
    }
    setUpdating(false)
  }

  const FILTERS = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'READY', label: 'Ready' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>{t('sidebar.orders', 'Incoming Orders')}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{orders.length} {t('sidebar.orders', 'orders')}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-ghost'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} style={{ color: 'var(--color-text-muted)' }} />
              <h3>{t('dashboard.noOrders', 'No orders yet')}</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => {
                const nextStatuses = getNextOrderStatuses(order.status, 'FARMER')
                return (
                  <div
                    key={order.id}
                    className="card"
                    style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      {/* Product thumb */}
                      {order.items[0]?.product?.images?.[0]?.url ? (
                        <img src={order.items[0].product.images[0].url} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🌾</div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                            {t('sidebar.orders', 'Order')} #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <OrderStatusBadge status={order.status} size="sm" />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                          {order.items.map((i: any) => `${i.quantity} ${i.unit} ${i.productName}`).join(', ')}
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                          <span>👤 {order.consumer?.user?.name}</span>
                          <span>📦 {order.deliveryType}</span>
                          <span>🕐 {formatDateTime(order.createdAt)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary-light)' }}>{formatPrice(order.totalPrice)}</span>
                        {nextStatuses.length > 0 && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {nextStatuses.map(s => (
                              <button
                                key={s}
                                className={`btn btn-sm ${s === 'CANCELLED' ? 'btn-danger' : 'btn-primary'}`}
                                style={{ fontSize: '0.7rem' }}
                                disabled={updating}
                                onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s) }}
                              >
                                {ORDER_STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder?.id.slice(-8).toUpperCase()}`} maxWidth="560px">
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <OrderStatusBadge status={selectedOrder.status} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDateTime(selectedOrder.createdAt)}</span>
            </div>

            <div className="divider" style={{ margin: '0' }} />

            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sidebar.orders', 'Order Items')}</p>
              {selectedOrder.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text)' }}>{item.quantity} {item.unit} {item.productName}</span>
                  <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 700 }}>
                <span>{t('dashboard.totalRevenue', 'Total').split(' ')[0]}</span>
                <span style={{ color: 'var(--color-primary-light)', fontSize: '1.1rem' }}>{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('auth.consumer', 'Consumer Details')}</p>
              <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>{selectedOrder.consumer?.user?.name}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Delivery: {selectedOrder.deliveryType}</p>
              {selectedOrder.deliveryAddress && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{selectedOrder.deliveryAddress}</p>}
              {selectedOrder.consumerNote && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>Note: {selectedOrder.consumerNote}</p>}
            </div>

            {/* Status update actions */}
            {getNextOrderStatuses(selectedOrder.status, 'FARMER').length > 0 && (
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {getNextOrderStatuses(selectedOrder.status, 'FARMER').map(s => (
                    <button
                      key={s}
                      className={`btn ${s === 'CANCELLED' ? 'btn-danger' : 'btn-primary'}`}
                      disabled={updating}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                    >
                      {updating ? <div className="spinner" style={{ width: 16, height: 16 }} /> : null}
                      {ORDER_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { Package, ShoppingBag, TrendingUp, Star, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface Stats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  averageRating: number
  reviewCount: number
  unreadMessages: number
}

export default function FarmerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useI18n()

  useEffect(() => {
    fetch('/api/farmer/stats')
      .then(r => r.json())
      .then(d => { setStats(d.stats); setRecentOrders(d.recentOrders || []) })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-layout">
      <FarmerSidebar unreadMessages={stats?.unreadMessages} pendingOrders={stats?.pendingOrders} />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>{t('dashboard.overview', 'Dashboard Overview')}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{t('dashboard.welcomeBack', 'Welcome back')}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
            </div>
          ) : error ? (
            <div className="empty-state">
              <AlertCircle size={40} color="var(--color-danger)" />
              <p>{error}</p>
            </div>
          ) : stats ? (
            <>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
                {[
                  { label: t('dashboard.activeProducts', 'Active Products'), value: stats.activeProducts, total: `${stats.totalProducts} total`, icon: Package, color: '#16a34a', bg: 'rgba(22,163,74,0.15)' },
                  { label: t('dashboard.pendingOrders', 'Pending Orders'), value: stats.pendingOrders, total: `${stats.totalOrders} total`, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                  { label: t('dashboard.totalRevenue', 'Total Revenue'), value: formatPrice(stats.totalRevenue), total: `${stats.completedOrders} completed`, icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', isPrice: true },
                  { label: t('dashboard.avgRating', 'Avg. Rating'), value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—', total: `${stats.reviewCount} reviews`, icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-icon" style={{ background: s.bg }}>
                      <s.icon size={22} color={s.color} />
                    </div>
                    <div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.total}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{t('dashboard.recentOrders', 'Recent Orders')}</h3>
                    <Link href="/farmer/orders" className="btn btn-ghost btn-sm">{t('dashboard.viewAll', 'View all')}</Link>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 0' }}>
                      <ShoppingBag size={32} color="var(--color-text-muted)" />
                      <p style={{ fontSize: '0.9rem' }}>{t('dashboard.noOrders', 'No orders yet')}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {recentOrders.map((order) => {
                        const img = order.items[0]?.product?.images?.[0]?.url
                        const productName = order.items[0]?.productName || 'Product'
                        return (
                          <Link key={order.id} href={`/farmer/orders`} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
                              {img ? (
                                <img src={img} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌾</div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  {order.consumer?.user?.name} · {formatDate(order.createdAt)}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary-light)' }}>{formatPrice(order.totalPrice)}</span>
                                <OrderStatusBadge status={order.status} size="sm" />
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card" style={{ padding: 20 }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: '1rem' }}>{t('dashboard.quickActions', 'Quick Actions')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: t('sidebar.addProduct', 'Add New Product'), href: '/farmer/products/new', color: 'btn-primary' },
                        { label: t('sidebar.aiQuality', 'Run AI Quality Check'), href: '/farmer/ai-quality', color: 'btn-ai' },
                        { label: t('sidebar.orders', 'View Orders'), href: '/farmer/orders', color: 'btn-outline' },
                        { label: t('sidebar.location', 'Update Location'), href: '/farmer/location', color: 'btn-ghost' },
                      ].map((a) => (
                        <Link key={a.href} href={a.href} className={`btn ${a.color}`} style={{ width: '100%' }}>
                          {a.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {stats.unreadMessages > 0 && (
                    <Link href="/farmer/messages" style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <MessageSquare size={20} color="var(--color-info)" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{stats.unreadMessages} New Message{stats.unreadMessages > 1 ? 's' : ''}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>From potential buyers</div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}

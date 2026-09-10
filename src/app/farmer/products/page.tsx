'use client'
import { useEffect, useState } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { QualityBadge } from '@/components/ui/QualityBadge'
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDate } from '@/lib/utils'
import { QUANTITY_UNITS, PRODUCT_CATEGORIES } from '@/lib/validation'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Package, Search, Filter, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function FarmerProductsPage() {
  const { success, error: toastError } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/farmer/products')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => toastError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (id: string, current: string) => {
    setToggling(id)
    const newStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setProducts(ps => ps.map(p => p.id === id ? { ...p, status: newStatus } : p))
      success(`Product ${newStatus === 'ACTIVE' ? 'published' : 'unpublished'}`)
    } else {
      toastError('Failed to update status')
    }
    setToggling(null)
  }

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts(ps => ps.filter(p => p.id !== id))
      success('Product deleted')
    } else {
      const d = await res.json()
      toastError(d.error || 'Failed to delete product')
    }
    setDeleting(null)
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))

  const unitLabel = (unit: string) => QUANTITY_UNITS.find(u => u.value === unit)?.label.split(' ')[0] || unit

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>My Products</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{products.length} total listings</p>
          </div>
          <Link href="/farmer/products/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        <div className="dashboard-content">
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={48} style={{ color: 'var(--color-text-muted)' }} />
              <h3>{products.length === 0 ? 'No products yet' : 'No matching products'}</h3>
              <p>{products.length === 0 ? 'Start by adding your first product listing.' : 'Try a different search term.'}</p>
              {products.length === 0 && (
                <Link href="/farmer/products/new" className="btn btn-primary">Add Your First Product</Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((product) => {
                const img = product.images?.[0]?.url
                return (
                  <div key={product.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Image */}
                    {img ? (
                      <img src={img} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 60, height: 60, borderRadius: 8, background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🌾</div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{product.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)', padding: '2px 8px', borderRadius: 999 }}>{product.category}</span>
                        <QualityBadge grade={product.qualityGrade} size="sm" />
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{formatPrice(product.price)}/{unitLabel(product.unit)}</span>
                        <span>{product.quantity} {unitLabel(product.unit)} available</span>
                        <span>{product.orderCount} orders</span>
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px',
                        borderRadius: 999,
                        background: product.status === 'ACTIVE' ? 'rgba(22,163,74,0.15)' : 'rgba(100,116,139,0.15)',
                        color: product.status === 'ACTIVE' ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                        border: `1px solid ${product.status === 'ACTIVE' ? 'rgba(22,163,74,0.3)' : 'rgba(100,116,139,0.3)'}`,
                      }}>
                        {product.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        title={product.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
                        disabled={toggling === product.id}
                        onClick={() => toggleStatus(product.id, product.status)}
                      >
                        {toggling === product.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> : product.status === 'ACTIVE' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link href={`/farmer/products/${product.id}/edit`} className="btn btn-ghost btn-sm">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)' }}
                        disabled={deleting === product.id}
                        onClick={() => deleteProduct(product.id, product.name)}
                      >
                        {deleting === product.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

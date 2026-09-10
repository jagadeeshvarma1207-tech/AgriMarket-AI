'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { PRODUCT_CATEGORIES } from '@/lib/validation'
import { Leaf, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'

export default function PublicMarketplacePage() {
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [grade, setGrade] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (grade) params.set('grade', grade)
    params.set('sort', sort)
    params.set('limit', '24')

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0) })
      .finally(() => setLoading(false))
  }, [search, category, grade, sort])

  const hasFilters = search || category || grade

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,17,23,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>AgriMarket <span style={{ color: 'var(--color-primary-light)' }}>AI</span></span>
          </Link>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 999, padding: '5px 14px', marginBottom: 16 }}>
            <Sparkles size={13} color="var(--color-ai-light)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-ai-light)', fontWeight: 600 }}>AI Quality Graded Produce</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 8 }}>
            Browse Fresh Produce
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500 }}>
            Discover fresh fruits and vegetables directly from local farmers. All produce AI quality-graded for transparency.
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="form-input" placeholder="Search produce..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
          </div>
          <button className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} /> Filters
            {hasFilters && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />}
          </button>
          <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="popular">Popular</option>
            <option value="price">Price ↑</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {showFilters && (
          <div className="filter-panel" style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <p className="filter-section-title">Category</p>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <p className="filter-section-title">AI Quality Grade</p>
                <select className="form-select" value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="">Any Grade</option>
                  <option value="A">Grade A — Premium</option>
                  <option value="B">Grade B — Good</option>
                  <option value="C">Grade C — Fair</option>
                  <option value="D">Grade D — Economy</option>
                  <option value="UNGRADED">Ungraded</option>
                </select>
              </div>
            </div>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); setGrade('') }} style={{ alignSelf: 'flex-start' }}><X size={14} /> Clear</button>}
          </div>
        )}

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
          {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} available`}
        </p>

        {loading ? (
          <div className="marketplace-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 80 }}>
            <Search size={48} style={{ color: 'var(--color-text-muted)' }} />
            <h3>No products found</h3>
            <p>Try different filters or check back later for new listings.</p>
          </div>
        ) : (
          <>
            <div className="marketplace-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div style={{ marginTop: 48, textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                Want to save favorites and place orders?
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/auth/register?role=CONSUMER" className="btn btn-primary">Create Free Account</Link>
                <Link href="/auth/login" className="btn btn-ghost">Sign In</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

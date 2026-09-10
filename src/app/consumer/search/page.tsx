'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PRODUCT_CATEGORIES } from '@/lib/validation'

function ConsumerSearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'createdAt',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [total, setTotal] = useState(0)

  const doSearch = useCallback(async (q: string, f: typeof filters) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('search', q)
    if (f.category) params.set('category', f.category)
    if (f.minPrice) params.set('minPrice', f.minPrice)
    if (f.maxPrice) params.set('maxPrice', f.maxPrice)
    if (f.sort) params.set('sort', f.sort)
    params.set('limit', '30')
    try {
      const [prodRes, favRes] = await Promise.all([
        fetch(`/api/products?${params}`).then(r => r.json()),
        fetch('/api/consumer/favorites').then(r => r.json()).catch(() => ({ favorites: [] })),
      ])
      setProducts(prodRes.products || [])
      setTotal(prodRes.total || 0)
      setFavorites(new Set(favRes.favorites?.map((f: any) => f.productId) || []))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    doSearch(query, filters)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query, filters)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    router.push(`/consumer/search?${params}`)
  }

  const toggleFav = async (productId: string) => {
    const res = await fetch('/api/consumer/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    const d = await res.json()
    setFavorites(prev => {
      const next = new Set(prev)
      if (d.favorited) next.add(productId); else next.delete(productId)
      return next
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <ConsumerNav />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Search header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 16 }}>
            Search Products
          </h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="form-input"
                placeholder="Search for tomatoes, mangoes, rice..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: 44, fontSize: '1rem' }}
                autoFocus
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); doSearch('', filters) }}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)} style={{ gap: 8 }}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: 8 }}>
              <Search size={16} /> Search
            </button>
          </form>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                <option value="">All Categories</option>
                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Min Price (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="0" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Max Price (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="Any" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Sort By</label>
              <select className="form-input" value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                <option value="createdAt">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => doSearch(query, filters)} style={{ flex: 1 }}>Apply</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ category: '', minPrice: '', maxPrice: '', sort: 'createdAt' }); doSearch(query, { category: '', minPrice: '', maxPrice: '', sort: 'createdAt' }) }} style={{ flex: 1 }}>Clear</button>
            </div>
          </div>
        )}

        {/* Results */}
        {query || filters.category ? (
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
            {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}${filters.category ? ` in ${filters.category}` : ''}`}
          </p>
        ) : null}

        {loading ? (
          <div className="marketplace-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Search size={48} style={{ color: 'var(--color-text-muted)' }} />
            <h3>{query || filters.category ? 'No products found' : 'Start searching'}</h3>
            <p>{query || filters.category ? 'Try a different search term or remove some filters.' : 'Type something above to find fresh produce from local farmers.'}</p>
          </div>
        ) : (
          <div className="marketplace-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={favorites.has(product.id)}
                onToggleFavorite={toggleFav}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConsumerSearchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <ConsumerNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="spinner" />
        </div>
      </div>
    }>
      <ConsumerSearchPageInner />
    </Suspense>
  )
}

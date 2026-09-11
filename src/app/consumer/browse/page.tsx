'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { PRODUCT_CATEGORIES } from '@/lib/validation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

function BrowsePageInner() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const { t } = useI18n()

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    grade: searchParams.get('grade') || '',
    minPrice: '', maxPrice: '',
    sort: 'createdAt',
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.grade) params.set('grade', filters.grade)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    params.set('sort', filters.sort)
    params.set('limit', '24')

    const [prodRes, favRes] = await Promise.all([
      fetch(`/api/products?${params}`).then(r => r.json()),
      fetch('/api/consumer/favorites').then(r => r.json()).catch(() => ({ favorites: [] })),
    ])
    setProducts(prodRes.products || [])
    setTotal(prodRes.total || 0)
    setFavorites(new Set(favRes.favorites?.map((f: any) => f.productId) || []))
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const toggleFav = async (productId: string) => {
    const res = await fetch('/api/consumer/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) })
    const d = await res.json()
    setFavorites(prev => { const next = new Set(prev); if (d.favorited) next.add(productId); else next.delete(productId); return next })
  }

  const clearFilters = () => setFilters({ search: '', category: '', grade: '', minPrice: '', maxPrice: '', sort: 'createdAt' })
  const hasFilters = filters.search || filters.category || filters.grade || filters.minPrice || filters.maxPrice

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <ConsumerNav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        {/* Search bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="form-input"
              placeholder={t('consumer.searchPlaceholder', 'Search fruits, vegetables, grains...')}
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ paddingLeft: 44, fontSize: '1rem' }}
            />
          </div>
          <button className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)} style={{ gap: 8 }}>
            <SlidersHorizontal size={18} /> {t('consumer.filters', 'Filters')}
            {hasFilters && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />}
          </button>
          <select className="form-select" style={{ width: 'auto' }} value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
            <option value="createdAt">{t('common.newest', 'Newest')}</option>
            <option value="popular">{t('common.popular', 'Most Popular')}</option>
            <option value="price">{t('common.priceLowHigh', 'Price: Low to High')}</option>
            <option value="rating">{t('common.highestRated', 'Highest Rated')}</option>
          </select>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="filter-panel" style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <p className="filter-section-title">{t('product.category', 'Category')}</p>
                <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                  <option value="">{t('common.viewAll', 'All Categories')}</option>
                  {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{t(`product.${c.toLowerCase().replace(/[\s&]+/g, '')}`, c)}</option>)}
                </select>
              </div>
              <div>
                <p className="filter-section-title">{t('ai.confidence', 'Quality Grade')}</p>
                <select className="form-select" value={filters.grade} onChange={e => setFilters(f => ({ ...f, grade: e.target.value }))}>
                  <option value="">{t('common.viewAll', 'Any Grade')}</option>
                  <option value="A">{t('ai.grade', 'Grade')} A — Premium</option>
                  <option value="B">{t('ai.grade', 'Grade')} B — Good</option>
                  <option value="C">{t('ai.grade', 'Grade')} C — Fair</option>
                  <option value="D">{t('ai.grade', 'Grade')} D — Economy</option>
                </select>
              </div>
              <div>
                <p className="filter-section-title">{t('consumer.minPrice', 'Min Price (₹)')}</p>
                <input className="form-input" type="number" min="0" placeholder="0" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
              </div>
              <div>
                <p className="filter-section-title">{t('consumer.maxPrice', 'Max Price (₹)')}</p>
                <input className="form-input" type="number" min="0" placeholder={t('common.any', 'Any')} value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
              </div>
            </div>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ alignSelf: 'flex-start' }}>
                <X size={14} /> {t('common.clearFilters', 'Clear Filters')}
              </button>
            )}
          </div>
        )}

        {/* Active filters chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {filters.category && <span className="badge badge-green">{filters.category} <button onClick={() => setFilters(f => ({ ...f, category: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: 4 }}>×</button></span>}
            {filters.grade && <span className="badge badge-purple">Grade {filters.grade} <button onClick={() => setFilters(f => ({ ...f, grade: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: 4 }}>×</button></span>}
            {filters.search && <span className="badge badge-blue">"{filters.search}" <button onClick={() => setFilters(f => ({ ...f, search: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: 4 }}>×</button></span>}
          </div>
        )}

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          {loading ? t('common.loading', 'Loading...') : `${total} ${t('product.products', 'products')} ${t('common.found', 'found')}`}
        </p>

        {loading ? (
          <div className="marketplace-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Search size={48} style={{ color: 'var(--color-text-muted)' }} />
            <h3>{t('msg.noProducts', 'No products found')}</h3>
            <p>{t('msg.tryAdjusting', 'Try adjusting your filters or search term.')}</p>
            {hasFilters && <button className="btn btn-outline" onClick={clearFilters}>{t('common.clearFilters', 'Clear All Filters')}</button>}
          </div>
        ) : (
          <div className="marketplace-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={p} isFavorited={favorites.has(p.id)} onToggleFavorite={toggleFav} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <ConsumerNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="spinner" />
        </div>
      </div>
    }>
      <BrowsePageInner />
    </Suspense>
  )
}

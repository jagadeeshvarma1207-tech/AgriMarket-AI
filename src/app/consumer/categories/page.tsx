'use client'
import { useEffect, useState } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { Grid3X3, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { name: 'Fruits', emoji: '🍎', desc: 'Fresh fruits from local orchards', color: '#ef4444' },
  { name: 'Vegetables', emoji: '🥦', desc: 'Farm-fresh vegetables daily', color: '#22c55e' },
  { name: 'Grains & Cereals', emoji: '🌾', desc: 'Whole grains, rice, wheat & more', color: '#f59e0b' },
  { name: 'Herbs & Spices', emoji: '🌿', desc: 'Aromatic herbs and spices', color: '#16a34a' },
  { name: 'Dairy & Eggs', emoji: '🥛', desc: 'Fresh dairy products and eggs', color: '#3b82f6' },
  { name: 'Pulses & Legumes', emoji: '🫘', desc: 'Protein-rich lentils and beans', color: '#8b5cf6' },
  { name: 'Nuts & Seeds', emoji: '🥜', desc: 'Healthy nuts and seeds', color: '#d97706' },
  { name: 'Organic Produce', emoji: '🌱', desc: 'Certified organic farm produce', color: '#10b981' },
  { name: 'Other', emoji: '🛒', desc: 'Other agricultural products', color: '#64748b' },
]

export default function ConsumerCategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // Load category counts
    const promises = CATEGORIES.map(cat =>
      fetch(`/api/products?category=${encodeURIComponent(cat.name)}&limit=1`)
        .then(r => r.json())
        .then(d => ({ cat: cat.name, count: d.total || 0 }))
        .catch(() => ({ cat: cat.name, count: 0 }))
    )
    Promise.all(promises).then(results => {
      const counts: Record<string, number> = {}
      results.forEach(r => { counts[r.cat] = r.count })
      setCategoryCounts(counts)
    })

    // Load favorites
    fetch('/api/consumer/favorites')
      .then(r => r.json())
      .then(d => setFavorites(new Set(d.favorites?.map((f: any) => f.productId) || [])))
      .catch(() => {})
  }, [])

  const loadCategory = async (cat: string) => {
    setSelectedCategory(cat)
    setLoading(true)
    try {
      const [prodRes, favRes] = await Promise.all([
        fetch(`/api/products?category=${encodeURIComponent(cat)}&limit=20`).then(r => r.json()),
        fetch('/api/consumer/favorites').then(r => r.json()).catch(() => ({ favorites: [] })),
      ])
      setProducts(prodRes.products || [])
      setFavorites(new Set(favRes.favorites?.map((f: any) => f.productId) || []))
    } finally {
      setLoading(false)
    }
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
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Grid3X3 size={24} color="var(--color-primary-light)" /> Browse Categories
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Select a category to explore fresh produce</p>
        </div>

        {/* Category Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => loadCategory(cat.name)}
              style={{
                background: selectedCategory === cat.name ? `${cat.color}20` : 'var(--color-bg-card)',
                border: `2px solid ${selectedCategory === cat.name ? cat.color : 'var(--color-border)'}`,
                borderRadius: 16, padding: '20px 16px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{cat.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: selectedCategory === cat.name ? cat.color : 'var(--color-text)', marginBottom: 4 }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{cat.desc}</div>
                {categoryCounts[cat.name] !== undefined && (
                  <div style={{ marginTop: 6, fontSize: '0.7rem', fontWeight: 600, color: cat.color }}>
                    {categoryCounts[cat.name]} products
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Products in selected category */}
        {selectedCategory && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                {CATEGORIES.find(c => c.name === selectedCategory)?.emoji} {selectedCategory}
              </h2>
              <Link
                href={`/consumer/browse?category=${encodeURIComponent(selectedCategory)}`}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="marketplace-grid">
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p>No products in this category yet.</p>
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
        )}
      </div>
    </div>
  )
}

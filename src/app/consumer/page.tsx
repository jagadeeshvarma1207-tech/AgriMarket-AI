'use client'
import { useEffect, useState } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { useSession } from 'next-auth/react'
import { Sparkles, TrendingUp, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ConsumerHomePage() {
  const { data: session } = useSession()
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=8&sort=popular').then(r => r.json()),
      fetch('/api/consumer/favorites').then(r => r.json()).catch(() => ({ favorites: [] })),
    ]).then(([prod, favs]) => {
      setFeatured(prod.products || [])
      setFavorites(new Set(favs.favorites?.map((f: any) => f.productId) || []))
    }).finally(() => setLoading(false))
  }, [])

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

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(139,92,246,0.08) 100%)', borderBottom: '1px solid var(--color-border)', padding: '48px 0 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> AI-Graded Fresh Produce
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', margin: '0 0 12px' }}>
                Good morning, {session?.user.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '1rem' }}>
                Discover fresh produce directly from local farmers
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/consumer/browse" className="btn btn-primary">Browse Products <ArrowRight size={16} /></Link>
              <Link href="/consumer/nearby" className="btn btn-ghost">Nearby Farmers <MapPin size={16} /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Links */}
      <div style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, padding: '16px 24px', width: 'max-content', minWidth: '100%' }}>
          {[
            { label: '🍎 Fruits', cat: 'Fruits' },
            { label: '🥦 Vegetables', cat: 'Vegetables' },
            { label: '🌾 Grains', cat: 'Grains & Cereals' },
            { label: '🌿 Herbs', cat: 'Herbs & Spices' },
            { label: '🥛 Dairy', cat: 'Dairy & Eggs' },
            { label: '🫘 Pulses', cat: 'Pulses & Legumes' },
            { label: '🌱 Organic', cat: 'Organic Produce' },
          ].map(c => (
            <Link
              key={c.cat}
              href={`/consumer/browse?category=${encodeURIComponent(c.cat)}`}
              className="btn btn-ghost btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <TrendingUp size={22} color="var(--color-primary-light)" /> Popular Products
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>Fresh and highly ordered by other consumers</p>
          </div>
          <Link href="/consumer/browse" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="marketplace-grid">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="empty-state">
            <p>No products available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="marketplace-grid">
            {featured.map(product => (
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

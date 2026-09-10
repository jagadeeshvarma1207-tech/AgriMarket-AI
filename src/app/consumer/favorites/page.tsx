'use client'
import { useEffect, useState } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favSet, setFavSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/consumer/favorites')
      .then(r => r.json())
      .then(d => {
        setFavorites(d.favorites || [])
        setFavSet(new Set((d.favorites || []).map((f: any) => f.productId)))
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleFav = async (productId: string) => {
    const res = await fetch('/api/consumer/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) })
    const d = await res.json()
    if (!d.favorited) {
      setFavorites(prev => prev.filter(f => f.productId !== productId))
      setFavSet(prev => { const next = new Set(prev); next.delete(productId); return next })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <ConsumerNav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Heart size={22} color="#ef4444" fill="#ef4444" /> My Favorites
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>{favorites.length} saved product{favorites.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="marketplace-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <Heart size={48} style={{ color: 'var(--color-text-muted)' }} />
            <h3>No favorites yet</h3>
            <p>Tap the heart icon on any product to save it here for later.</p>
            <Link href="/consumer/browse" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="marketplace-grid">
            {favorites.map(fav => (
              <ProductCard key={fav.id} product={fav.product} isFavorited={favSet.has(fav.productId)} onToggleFavorite={toggleFav} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

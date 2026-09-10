'use client'
import { useEffect, useState } from 'react'
import { ConsumerNav } from '@/components/consumer/ConsumerNav'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { MapPin, Loader2, AlertCircle, Navigation, RefreshCw } from 'lucide-react'
import { formatDistance, calculateDistance } from '@/lib/utils'

interface ProductWithDistance {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  unit: string
  qualityGrade: string
  aiConfidence?: number | null
  totalRating: number
  reviewCount: number
  images: { url: string }[]
  farmer: {
    id: string
    farmName?: string | null
    totalRating: number
    user: { name: string }
    location?: {
      city?: string | null
      state?: string | null
      approxLatitude?: number | null
      approxLongitude?: number | null
    } | null
  }
  distanceKm?: number
}

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

export default function ConsumerNearbyPage() {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')
  const [products, setProducts] = useState<ProductWithDistance[]>([])
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [radiusKm, setRadiusKm] = useState(25)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setLocationStatus('requesting')
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationStatus('granted')
        loadNearbyProducts(latitude, longitude, radiusKm)
      },
      (error) => {
        setLocationStatus('denied')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission was denied. Please enable location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable. Please try again.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.')
            break
          default:
            setLocationError('An unknown error occurred while getting your location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  const loadNearbyProducts = async (lat: number, lng: number, radius: number) => {
    setLoading(true)
    try {
      const [prodRes, favRes] = await Promise.all([
        fetch('/api/products?limit=50').then(r => r.json()),
        fetch('/api/consumer/favorites').then(r => r.json()).catch(() => ({ favorites: [] })),
      ])

      const allProducts: ProductWithDistance[] = prodRes.products || []
      setFavorites(new Set(favRes.favorites?.map((f: any) => f.productId) || []))

      // Filter products by farmer location and add distance
      const nearby = allProducts
        .filter(p => p.farmer?.location?.approxLatitude && p.farmer?.location?.approxLongitude)
        .map(p => ({
          ...p,
          distanceKm: calculateDistance(
            lat, lng,
            p.farmer.location!.approxLatitude!,
            p.farmer.location!.approxLongitude!
          )
        }))
        .filter(p => (p.distanceKm || 0) <= radius)
        .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))

      setProducts(nearby)
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
            <MapPin size={24} color="var(--color-primary-light)" /> Nearby Farmers & Products
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Find fresh produce from farmers near you</p>
        </div>

        {locationStatus === 'idle' && (
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <MapPin size={28} color="var(--color-primary-light)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 12 }}>Enable Location Access</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
              To show you nearby farmers and fresh produce, we need access to your location. Your location is only used to calculate distances and is never stored.
            </p>
            <button className="btn btn-primary" onClick={requestLocation} style={{ gap: 8 }}>
              <Navigation size={18} /> Use My Location
            </button>
          </div>
        )}

        {locationStatus === 'requesting' && (
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <Loader2 size={32} className="spinner" style={{ margin: '0 auto 16px', color: 'var(--color-primary-light)' }} />
            <h3>Getting your location...</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Please allow location access when prompted</p>
          </div>
        )}

        {(locationStatus === 'denied' || locationStatus === 'error') && (
          <div className="card" style={{ padding: 32, maxWidth: 500, margin: '0 auto', borderColor: 'rgba(239,68,68,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <AlertCircle size={24} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ marginBottom: 8, color: 'var(--color-danger)' }}>Location Unavailable</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>{locationError}</p>
                <button className="btn btn-primary btn-sm" onClick={requestLocation} style={{ gap: 8 }}>
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {locationStatus === 'granted' && (
          <>
            {/* Location info and radius control */}
            <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <MapPin size={16} color="var(--color-primary-light)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  Location found · Showing within {radiusKm}km
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Radius:</label>
                <select
                  className="form-input"
                  style={{ padding: '6px 10px', width: 'auto' }}
                  value={radiusKm}
                  onChange={e => {
                    const r = parseInt(e.target.value)
                    setRadiusKm(r)
                    if (userLocation) loadNearbyProducts(userLocation.lat, userLocation.lng, r)
                  }}
                >
                  {[5, 10, 15, 25, 50, 100].map(r => <option key={r} value={r}>{r}km</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" onClick={() => userLocation && loadNearbyProducts(userLocation.lat, userLocation.lng, radiusKm)} style={{ gap: 6 }}>
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="marketplace-grid">
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <MapPin size={48} style={{ color: 'var(--color-text-muted)' }} />
                <h3>No nearby farmers found</h3>
                <p>No farmers with products are within {radiusKm}km of your location. Try increasing the search radius.</p>
                <button className="btn btn-ghost" onClick={() => { setRadiusKm(100); if (userLocation) loadNearbyProducts(userLocation.lat, userLocation.lng, 100) }}>
                  Expand to 100km
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
                  Found {products.length} product{products.length !== 1 ? 's' : ''} within {radiusKm}km
                </p>
                <div className="marketplace-grid">
                  {products.map(product => (
                    <div key={product.id}>
                      {product.distanceKm !== undefined && (
                        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                          <MapPin size={11} /> {formatDistance(product.distanceKm)}
                        </div>
                      )}
                      <ProductCard
                        product={product}
                        isFavorited={favorites.has(product.id)}
                        onToggleFavorite={toggleFav}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

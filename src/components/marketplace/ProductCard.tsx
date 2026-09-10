'use client'
import Link from 'next/link'
import { MapPin, Star, Heart, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { QualityBadge } from '@/components/ui/QualityBadge'
import { QUANTITY_UNITS } from '@/lib/validation'
import { useState } from 'react'

interface ProductCardProps {
  product: {
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
      farmName?: string | null
      totalRating: number
      user: { name: string }
      location?: { city?: string | null; state?: string | null } | null
    }
  }
  isFavorited?: boolean
  onToggleFavorite?: (productId: string) => void
  onOrder?: (productId: string) => void
  showFarmerInfo?: boolean
}

export function ProductCard({ product, isFavorited, onToggleFavorite, onOrder, showFarmerInfo = true }: ProductCardProps) {
  const [favLoading, setFavLoading] = useState(false)
  const unitLabel = QUANTITY_UNITS.find(u => u.value === product.unit)?.label.split(' ')[0] || product.unit
  const imageUrl = product.images[0]?.url

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onToggleFavorite) return
    setFavLoading(true)
    await onToggleFavorite(product.id)
    setFavLoading(false)
  }

  const categoryEmoji: Record<string, string> = {
    'Fruits': '🍎',
    'Vegetables': '🥦',
    'Grains & Cereals': '🌾',
    'Herbs & Spices': '🌿',
    'Dairy & Eggs': '🥛',
    'Pulses & Legumes': '🫘',
    'Nuts & Seeds': '🥜',
    'Organic Produce': '🌱',
    'Other': '🛒',
  }

  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        {/* Image */}
        <div style={{ position: 'relative' }}>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="product-card-image" />
          ) : (
            <div className="product-card-image-placeholder">
              {categoryEmoji[product.category] || '🌾'}
            </div>
          )}

          {/* Quality Badge overlay */}
          {product.qualityGrade !== 'UNGRADED' && (
            <div style={{ position: 'absolute', top: 8, left: 8 }}>
              <QualityBadge grade={product.qualityGrade} confidence={product.aiConfidence ?? undefined} size="sm" />
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={handleFavorite}
              disabled={favLoading}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 32, height: 32, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Heart
                size={16}
                fill={isFavorited ? '#ef4444' : 'none'}
                color={isFavorited ? '#ef4444' : 'white'}
              />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="product-card-body">
          <div style={{ marginBottom: '6px' }}>
            <span style={{
              fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em',
              color: 'var(--color-primary-light)', fontWeight: 600,
            }}>
              {product.category}
            </span>
          </div>

          <div className="product-card-name">{product.name}</div>

          {showFarmerInfo && (
            <div className="product-card-meta" style={{ marginBottom: '8px' }}>
              <span>{product.farmer.farmName || product.farmer.user.name}</span>
              {product.farmer.location?.city && (
                <>
                  <span>•</span>
                  <MapPin size={11} />
                  <span>{product.farmer.location.city}</span>
                </>
              )}
            </div>
          )}

          {product.totalRating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <Star size={13} fill="var(--color-accent)" color="var(--color-accent)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {product.totalRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
            <span className="product-card-price">{formatPrice(product.price)}</span>
            <span className="product-card-unit">/ {unitLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {product.quantity} {unitLabel} available
            </span>
            {onOrder && (
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOrder(product.id) }}
              >
                <ShoppingCart size={13} />
                Order
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

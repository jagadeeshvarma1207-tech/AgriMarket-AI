import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number    // 1–5
  onChange?: (val: number) => void
  size?: number
  readOnly?: boolean
  showCount?: boolean
  count?: number
}

export function StarRating({ value, onChange, size = 18, readOnly = false, showCount, count }: StarRatingProps) {
  return (
    <div className="stars" style={{ gap: '3px', display: 'flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(value) ? 'currentColor' : 'none'}
          style={{
            color: star <= Math.round(value) ? 'var(--color-accent)' : 'var(--color-border)',
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'color 0.15s, transform 0.1s',
          }}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={(e) => {
            if (!readOnly) {
              (e.currentTarget as SVGElement).style.transform = 'scale(1.2)'
            }
          }}
          onMouseLeave={(e) => {
            if (!readOnly) {
              (e.currentTarget as SVGElement).style.transform = 'scale(1)'
            }
          }}
        />
      ))}
      {showCount && count !== undefined && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
          ({count})
        </span>
      )}
    </div>
  )
}

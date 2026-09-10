import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const color = ORDER_STATUS_COLORS[status] || '#6b7280'
  const label = ORDER_STATUS_LABELS[status] || status

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
        fontWeight: 600,
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  )
}

import { GRADE_INFO, type QualityGrade } from '@/lib/ai-service'
import { Sparkles, Award } from 'lucide-react'

interface QualityBadgeProps {
  grade: string
  confidence?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  isPlaceholder?: boolean
}

export function QualityBadge({ grade, confidence, size = 'md', showLabel = false, isPlaceholder }: QualityBadgeProps) {
  const key = grade as QualityGrade
  const info = GRADE_INFO[key] || GRADE_INFO['UNGRADED']
  const gradeClass = `grade-${grade.toLowerCase()}`

  const sizes = {
    sm: { fontSize: '0.7rem', padding: '0.15rem 0.5rem', iconSize: 10 },
    md: { fontSize: '0.8rem', padding: '0.25rem 0.75rem', iconSize: 12 },
    lg: { fontSize: '0.95rem', padding: '0.35rem 1rem', iconSize: 16 },
  }

  const s = sizes[size]

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
      <span
        className={`grade-badge ${gradeClass}`}
        style={{ fontSize: s.fontSize, padding: s.padding }}
        title={info.description}
      >
        <Award size={s.iconSize} />
        {grade === 'UNGRADED' ? 'Ungraded' : `Grade ${grade}`}
        {isPlaceholder && (
          <Sparkles size={s.iconSize} style={{ opacity: 0.7 }} />
        )}
      </span>
      {showLabel && (
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
          {info.label}
          {confidence !== undefined && confidence > 0 && (
            <span style={{ marginLeft: '6px', color: 'var(--color-ai-light)' }}>
              {Math.round(confidence)}% confidence
            </span>
          )}
        </span>
      )}
    </div>
  )
}

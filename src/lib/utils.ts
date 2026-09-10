/**
 * Shared utility functions for AgriMarket AI
 */

// ─── CLASS NAME UTILITY ───────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── DATE / TIME ──────────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

// ─── CURRENCY ────────────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

// ─── DISTANCE ────────────────────────────────────────────────────────────────

/**
 * Calculate distance between two lat/lng points in kilometers (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`
  return `${km.toFixed(1)}km away`
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Approximate a coordinate (privacy protection — adds small random offset)
 */
export function approximateCoordinate(coord: number, radiusKm = 0.5): number {
  const earthRadius = 6371
  const deltaLat = (radiusKm / earthRadius) * (180 / Math.PI)
  const randomOffset = (Math.random() - 0.5) * 2 * deltaLat
  return coord + randomOffset
}

// ─── STRING HELPERS ──────────────────────────────────────────────────────────

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ─── ARRAY HELPERS ───────────────────────────────────────────────────────────

export function parseJsonArray(str: string | null | undefined): string[] {
  if (!str) return []
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ─── API HELPERS ─────────────────────────────────────────────────────────────

export function apiError(message: string, status = 400) {
  return { error: message, status }
}

export function apiSuccess<T>(data: T, status = 200) {
  return { data, status }
}

// ─── ORDER STATUS ─────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  ACCEPTED: '#3b82f6',
  PREPARING: '#8b5cf6',
  READY: '#10b981',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
}

export function getNextOrderStatuses(current: string, role: string): string[] {
  if (role === 'FARMER') {
    const map: Record<string, string[]> = {
      PENDING: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    }
    return map[current] || []
  }
  if (role === 'CONSUMER') {
    const map: Record<string, string[]> = {
      PENDING: ['CANCELLED'],
      ACCEPTED: [],
      PREPARING: [],
      READY: [],
      COMPLETED: [],
      CANCELLED: [],
    }
    return map[current] || []
  }
  return []
}

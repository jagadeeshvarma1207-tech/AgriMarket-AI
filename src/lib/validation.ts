/**
 * Shared validation utilities for AgriMarket AI
 */

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

// ─── USER / AUTH ───────────────────────────────────────────────────────────────

export function validateRegistration(data: {
  name?: string
  email?: string
  password?: string
  role?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  if (data.name && data.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters'
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  if (!data.role || !['FARMER', 'CONSUMER'].includes(data.role)) {
    errors.role = 'Please select a valid role'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// ─── PRODUCT ──────────────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Grains & Cereals',
  'Herbs & Spices',
  'Dairy & Eggs',
  'Pulses & Legumes',
  'Nuts & Seeds',
  'Organic Produce',
  'Other',
] as const

export const QUANTITY_UNITS = [
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'GRAM', label: 'Gram (g)' },
  { value: 'PIECE', label: 'Piece' },
  { value: 'DOZEN', label: 'Dozen' },
  { value: 'LITER', label: 'Liter (L)' },
  { value: 'BUNDLE', label: 'Bundle' },
  { value: 'BAG', label: 'Bag' },
  { value: 'BOX', label: 'Box' },
  { value: 'QUINTAL', label: 'Quintal (100kg)' },
  { value: 'TON', label: 'Ton (1000kg)' },
] as const

export const ORDER_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
] as const

export function validateProduct(data: {
  name?: string
  category?: string
  price?: number | string
  quantity?: number | string
  unit?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters'
  }
  if (data.name && data.name.trim().length > 200) {
    errors.name = 'Product name must be less than 200 characters'
  }

  if (!data.category || !PRODUCT_CATEGORIES.includes(data.category as any)) {
    errors.category = 'Please select a valid category'
  }

  const price = parseFloat(String(data.price))
  if (isNaN(price) || price <= 0) {
    errors.price = 'Price must be a positive number'
  }
  if (price > 1000000) {
    errors.price = 'Price seems too high. Please check the value.'
  }

  const qty = parseFloat(String(data.quantity))
  if (isNaN(qty) || qty <= 0) {
    errors.quantity = 'Quantity must be a positive number'
  }

  const validUnits = QUANTITY_UNITS.map((u) => u.value)
  if (!data.unit || !validUnits.includes(data.unit as any)) {
    errors.unit = 'Please select a valid unit'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// ─── REVIEW ───────────────────────────────────────────────────────────────────

export function validateReview(data: {
  stars?: number | string
  body?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  const stars = parseInt(String(data.stars))
  if (isNaN(stars) || stars < 1 || stars > 5) {
    errors.stars = 'Rating must be between 1 and 5 stars'
  }

  if (data.body && data.body.length > 1000) {
    errors.body = 'Review must be less than 1000 characters'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^[+]?[0-9\s\-()]{7,15}$/.test(phone)
}

export function sanitizeString(str: string, maxLen = 500): string {
  return str.trim().slice(0, maxLen)
}

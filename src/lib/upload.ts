import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '5242880') // 5MB default
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export interface UploadResult {
  url: string
  filename: string
  size: number
  mimeType: string
}

export interface UploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NO_FILE'
  message: string
}

/**
 * Ensures the upload directory exists
 */
export function ensureUploadDir(subDir?: string): string {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * Validates a file before saving
 */
export function validateFile(
  size: number,
  mimeType: string,
  originalName: string
): UploadError | null {
  if (size > MAX_SIZE) {
    return {
      code: 'FILE_TOO_LARGE',
      message: `File size (${formatBytes(size)}) exceeds maximum allowed size of ${formatBytes(MAX_SIZE)}`,
    }
  }

  const ext = path.extname(originalName).toLowerCase()
  if (!ALLOWED_TYPES.includes(mimeType) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      code: 'INVALID_TYPE',
      message: `File type not allowed. Allowed types: JPEG, PNG, WebP`,
    }
  }

  return null
}

/**
 * Saves a buffer to the uploads directory and returns the public URL
 */
export async function saveUploadedFile(
  buffer: Buffer,
  mimeType: string,
  subDir: string = 'products'
): Promise<UploadResult> {
  const dir = ensureUploadDir(subDir)
  const ext = mimeTypeToExt(mimeType)
  const filename = `${uuidv4()}${ext}`
  const filePath = path.join(/*turbopackIgnore: true*/ dir, filename)

  fs.writeFileSync(filePath, buffer)

  return {
    url: `/uploads/${subDir}/${filename}`,
    filename,
    size: buffer.length,
    mimeType,
  }
}

/**
 * Deletes an uploaded file by its URL path
 */
export function deleteUploadedFile(url: string): void {
  try {
    const relativePath = url.replace('/uploads/', '')
    const filePath = path.join(UPLOAD_DIR, relativePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Failed to delete file:', err)
  }
}

function mimeTypeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  }
  return map[mimeType] || '.jpg'
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

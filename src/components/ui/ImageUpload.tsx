'use client'
import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { formatBytes } from '@/lib/upload'
import { useToast } from './Toast'

interface ImageUploadProps {
  onUpload: (url: string) => void
  subDir?: string
  label?: string
  multiple?: boolean
  existingUrls?: string[]
  onRemove?: (url: string) => void
}

export function ImageUpload({ onUpload, subDir = 'products', label = 'Upload Image', multiple = false, existingUrls = [], onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useToast()

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('subDir', subDir)

      const res = await fetch('/api/upload/image', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      onUpload(data.url)
      success('Image uploaded successfully')
    } catch (err: any) {
      error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = async (files: FileList) => {
    const fileArr = Array.from(files)
    for (const file of fileArr) {
      await uploadFile(file)
      if (!multiple) break
    }
  }

  return (
    <div>
      <div
        className={`image-upload-zone ${isDragOver ? 'dragover' : ''} ${uploading ? 'animate-pulse' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          if (!uploading) handleFiles(e.dataTransfer.files)
        }}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
      >
        {uploading ? (
          <>
            <div className="spinner" />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Uploading...</p>
          </>
        ) : (
          <>
            <Upload size={32} color="var(--color-text-muted)" />
            <div>
              <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '4px' }}>{label}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                Drag & drop or click to select
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                JPEG, PNG, WebP • Max 5MB
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {existingUrls.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginTop: '12px' }}>
          {existingUrls.map((url) => (
            <div key={url} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
              <img
                src={url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}>
                <CheckCircle size={20} color="var(--color-success)" style={{ position: 'absolute', top: 6, left: 6 }} />
              </div>
              {onRemove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(url) }}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.7)', border: 'none',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

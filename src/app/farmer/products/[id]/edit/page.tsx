'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useToast } from '@/components/ui/Toast'
import { PRODUCT_CATEGORIES, QUANTITY_UNITS } from '@/lib/validation'
import { AlertCircle, Save, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { success, error: toastError } = useToast()

  const [form, setForm] = useState({
    name: '', category: '', description: '',
    price: '', quantity: '', unit: '',
    harvestDate: '', expiryDate: '',
    status: 'ACTIVE',
  })
  const [images, setImages] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; isPrimary: boolean }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    if (!productId) return
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(d => {
        if (!d.product) { toastError('Product not found'); router.push('/farmer/products'); return }
        const p = d.product
        setForm({
          name: p.name || '',
          category: p.category || '',
          description: p.description || '',
          price: String(p.price || ''),
          quantity: String(p.quantity || ''),
          unit: p.unit || '',
          harvestDate: p.harvestDate ? p.harvestDate.split('T')[0] : '',
          expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '',
          status: p.status || 'ACTIVE',
        })
        setExistingImages(p.images || [])
      })
      .catch(() => { toastError('Failed to load product'); router.push('/farmer/products') })
      .finally(() => setLoading(false))
  }, [productId])

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          quantity: parseFloat(form.quantity),
          harvestDate: form.harvestDate || null,
          expiryDate: form.expiryDate || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        else toastError(data.error || 'Failed to update product')
        return
      }

      // Save new images
      if (images.length > 0) {
        await Promise.all(
          images.map((url, i) =>
            fetch(`/api/products/${productId}/images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, isPrimary: existingImages.length === 0 && i === 0, sortOrder: existingImages.length + i }),
            })
          )
        )
      }

      success('Product updated successfully!')
      router.push('/farmer/products')
    } catch {
      toastError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${form.name}"? This action cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        success('Product deleted')
        router.push('/farmer/products')
      } else {
        const d = await res.json()
        toastError(d.error || 'Failed to delete product')
      }
    } finally {
      setDeleting(false)
    }
  }

  const removeExistingImage = async (imageId: string) => {
    const res = await fetch(`/api/products/${productId}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
    if (res.ok) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
    } else {
      toastError('Failed to remove image')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <FarmerSidebar />
        <main className="dashboard-main">
          <div className="dashboard-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/farmer/products" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
              <ArrowLeft size={15} /> {t('common.back', 'Back')}
            </Link>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>{t('sidebar.editProduct', 'Edit Product')}</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{t('sidebar.editProduct', 'Update your product listing')}</p>
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', gap: 6 }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
            {t('common.delete', 'Delete')}
          </button>
        </div>

        <div className="dashboard-content">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
              {/* Main form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 20 }}>{t('dashboard.overview', 'Product Information')}</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">{t('dashboard.productName', 'Product Name')} <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                      <input className="form-input" placeholder="e.g. Fresh Organic Tomatoes" value={form.name} onChange={e => set('name', e.target.value)} />
                      {errors.name && <span className="form-error"><AlertCircle size={13} />{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('product.category', 'Category')} <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                      <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                        <option value="">{t('common.select', 'Select category...')}</option>
                        {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{t(`product.${c.toLowerCase().replace(/[\s&]+/g, '')}`, c)}</option>)}
                      </select>
                      {errors.category && <span className="form-error"><AlertCircle size={13} />{errors.category}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('product.description', 'Description')}</label>
                      <textarea className="form-textarea" placeholder="Describe your product..." value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">{t('product.price', 'Price (₹)')} <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                        <input className="form-input" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
                        {errors.price && <span className="form-error" style={{ fontSize: '0.7rem' }}>{errors.price}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('product.quantity', 'Quantity')} <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                        <input className="form-input" type="number" min="0.01" step="0.01" placeholder="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
                        {errors.quantity && <span className="form-error" style={{ fontSize: '0.7rem' }}>{errors.quantity}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('product.unit', 'Unit')} <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                        <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                          <option value="">{t('common.select', 'Select...')}</option>
                          {QUANTITY_UNITS.map(u => <option key={u.value} value={u.value}>{t(`product.${u.label.split(' ')[0].toLowerCase()}`, u.label)}</option>)}
                        </select>
                        {errors.unit && <span className="form-error" style={{ fontSize: '0.7rem' }}>{errors.unit}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">{t('product.harvestDate', 'Harvest Date')}</label>
                        <input className="form-input" type="date" value={form.harvestDate} onChange={e => set('harvestDate', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('product.expiryDate', 'Best Before')}</label>
                        <input className="form-input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('product.status', 'Listing Status')}</label>
                      <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                        <option value="ACTIVE">{t('product.active', 'Published — Visible to buyers')}</option>
                        <option value="INACTIVE">{t('product.inactive', 'Unlisted — Hidden from buyers')}</option>
                        <option value="DRAFT">{t('product.draft', 'Draft — Work in progress')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16 }}>{t('product.images', 'Product Images')}</h3>

                  {/* Existing images */}
                  {existingImages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {existingImages.map(img => (
                        <div key={img.id} style={{ position: 'relative' }}>
                          <img src={img.url} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: img.isPrimary ? '2px solid var(--color-primary-light)' : '2px solid var(--color-border)' }} />
                          {img.isPrimary && (
                            <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: '0.6rem', background: 'var(--color-primary)', color: 'white', padding: '1px 4px', borderRadius: 4 }}>Main</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--color-danger)', border: 'none', color: 'white', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    {existingImages.length > 0 ? t('product.addMoreImages', 'Add more images below:') : t('product.imagesDesc', 'Upload clear, well-lit photos. First image will be the main display image.')}
                  </p>
                  <ImageUpload
                    onUpload={(url) => setImages(prev => [...prev, url])}
                    subDir="products"
                    label={t('product.uploadPhoto', 'Upload Product Photo')}
                    multiple={true}
                    existingUrls={images}
                    onRemove={(url) => setImages(prev => prev.filter(u => u !== url))}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => router.push('/farmer/products')}>
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                    {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> {t('common.saving', 'Saving...')}</> : <><Save size={16} /> {t('common.save', 'Save Changes')}</>}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

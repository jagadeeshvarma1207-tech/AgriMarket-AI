'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useToast } from '@/components/ui/Toast'
import { PRODUCT_CATEGORIES, QUANTITY_UNITS } from '@/lib/validation'
import { AlertCircle, Plus, Save } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function AddProductPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()

  const [form, setForm] = useState({
    name: '', category: '', description: '',
    price: '', quantity: '', unit: '',
    harvestDate: '', expiryDate: '',
    status: 'ACTIVE',
    tags: [] as string[],
  })
  const [images, setImages] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Create product
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          quantity: parseFloat(form.quantity),
          harvestDate: form.harvestDate || null,
          expiryDate: form.expiryDate || null,
        }),
      })
      const productData = await productRes.json()

      if (!productRes.ok) {
        if (productData.errors) setErrors(productData.errors)
        else toastError(productData.error || 'Failed to create product')
        return
      }

      const productId = productData.product.id

      // Save images
      if (images.length > 0) {
        await Promise.all(
          images.map((url, i) =>
            fetch('/api/products/' + productId + '/images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, isPrimary: i === 0, sortOrder: i }),
            })
          )
        )
      }

      success('Product created successfully!')
      router.push('/farmer/products')
    } catch (err) {
      toastError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addImage = (url: string) => setImages(prev => [...prev, url])
  const removeImage = (url: string) => setImages(prev => prev.filter(u => u !== url))

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>{t('sidebar.addProduct', 'Add New Product')}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{t('sidebar.addProduct', 'Create a new product listing')}</p>
          </div>
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
                      <textarea className="form-textarea" placeholder="Describe your product — variety, growing method, taste, etc." value={form.description} onChange={e => set('description', e.target.value)} rows={4} />
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
                        <option value="DRAFT">{t('product.draft', 'Draft — Hidden from buyers')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16 }}>{t('product.images', 'Product Images')}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                    {t('product.imagesDesc', 'Upload clear, well-lit photos. First image will be the main display image.')}
                  </p>
                  <ImageUpload
                    onUpload={addImage}
                    subDir="products"
                    label={t('product.uploadPhoto', 'Upload Product Photo')}
                    multiple={true}
                    existingUrls={images}
                    onRemove={removeImage}
                  />
                  {images.length > 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center' }}>
                      {images.length} {t('product.images', 'images')}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => router.push('/farmer/products')}>
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                    {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> {t('common.saving', 'Saving...')}</> : <><Save size={16} /> {t('common.save', 'Publish Product')}</>}
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

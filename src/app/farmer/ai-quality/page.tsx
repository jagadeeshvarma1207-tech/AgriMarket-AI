'use client'
import { useState } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { GRADE_INFO, type QualityGrade } from '@/lib/ai-service'
import { Sparkles, Upload, AlertCircle, CheckCircle, Info, Leaf, ChevronDown } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '@/lib/validation'
import { useToast } from '@/components/ui/Toast'
import { useI18n } from '@/lib/i18n'

interface AIResult {
  id: string
  imageUrl: string
  grade: QualityGrade
  confidence: number
  detectedFeatures: string[]
  recommendations: string[]
  modelVersion: string
  isPlaceholder: boolean
  produceType: string | null
  analysisTimestamp: string
}

export default function AIQualityPage() {
  const { error: toastError } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [produceHint, setProduceHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const { t } = useI18n()

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    try {
      const form = new FormData()
      form.append('image', file)
      if (produceHint) form.append('produceHint', produceHint)

      const res = await fetch('/api/ai-quality/analyze', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) { toastError(data.error || 'Analysis failed'); return }
      setResult(data.result)
    } catch {
      toastError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const gradeInfo = result ? GRADE_INFO[result.grade] || GRADE_INFO['UNGRADED'] : null

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="var(--color-ai-light)" /> {t('sidebar.aiQuality', 'AI Quality Check')}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{t('ai.upload', 'Upload a produce image for instant quality assessment')}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Disclaimer */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 28 }}>
            <Info size={18} color="var(--color-ai-light)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: 'var(--color-ai-light)', fontWeight: 600, fontSize: '0.85rem', margin: '0 0 4px' }}>AI Demo Mode — Placeholder Results</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                The real trained deep learning model will be connected here. Current results are clearly marked as demo/placeholder and should not be used for actual quality certification. The model architecture supports all fruits and vegetables — not limited to specific crops.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Upload Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 20 }}>{t('ai.upload', 'Upload Produce Image')}</h3>

                {preview ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />
                    <button
                      onClick={() => { setFile(null); setPreview(''); setResult(null) }}
                      style={{
                        position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)',
                        border: 'none', borderRadius: '50%', width: 30, height: 30,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white', fontSize: '1rem',
                      }}
                    >×</button>
                    <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '4px 10px' }}>
                      <span style={{ color: 'white', fontSize: '0.75rem' }}>{file?.name}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`image-upload-zone ${isDragOver ? 'dragover' : ''}`}
                    style={{ marginBottom: 16, minHeight: 180 }}
                    onClick={() => document.getElementById('ai-file-input')?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) handleFile(f) }}
                  >
                    <Sparkles size={40} color="var(--color-ai)" />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: 4 }}>{t('ai.dropImage', 'Drop produce image here')}</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{t('common.or', 'or')} click to browse</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 4 }}>JPEG, PNG, WebP · Max 5MB</p>
                    </div>
                  </div>
                )}

                <input
                  id="ai-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">{t('ai.hint', 'Produce type hint (optional)')}</label>
                  <input
                    className="form-input"
                    placeholder="e.g. tomato, mango, onion..."
                    value={produceHint}
                    onChange={e => setProduceHint(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('ai.hintDesc', 'Helps the AI focus on the right crop category')}</span>
                </div>

                <button
                  className="btn btn-ai"
                  style={{ width: '100%', padding: '0.75rem' }}
                  disabled={!file || loading}
                  onClick={analyze}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} /> {t('ai.analyzing', 'Analyzing with AI...')}</>
                  ) : (
                    <><Sparkles size={18} /> {t('ai.analyze', 'Analyze Quality')}</>
                  )}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div>
              {loading && (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto 20px', borderTopColor: 'var(--color-ai)' }} />
                  <p style={{ color: 'var(--color-ai-light)', fontWeight: 600 }}>{t('ai.analyzing', 'AI is analyzing your produce...')}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('ai.detecting', 'Detecting visual quality indicators')}</p>
                </div>
              )}

              {result && gradeInfo && (
                <div className="ai-result-card">
                  {result.isPlaceholder && (
                    <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={14} color="var(--color-warning)" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-accent)' }}>⚠ DEMO RESULT — Placeholder model · {result.modelVersion}</span>
                    </div>
                  )}

                  {/* Grade Display */}
                  <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                      width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
                      background: `${gradeInfo.color}20`,
                      border: `4px solid ${gradeInfo.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: gradeInfo.color }}>
                        {result.grade === 'UNGRADED' ? '?' : result.grade}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: gradeInfo.color, marginBottom: 4 }}>{gradeInfo.label}</div>
                    {result.produceType && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Produce: {result.produceType}</div>
                    )}
                  </div>

                  {/* Confidence Bar */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('ai.confidence', 'AI Confidence')}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: gradeInfo.color }}>{result.confidence}%</span>
                    </div>
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${result.confidence}%`, background: gradeInfo.color }}
                      />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 6 }}>{gradeInfo.description}</p>
                  </div>

                  {/* Detected Features */}
                  {result.detectedFeatures.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10 }}>Detected Quality Indicators</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {result.detectedFeatures.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle size={14} color={gradeInfo.color} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: 16 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-light)', marginBottom: 10 }}>💡 Recommendations</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {result.recommendations.map((r, i) => (
                          <p key={i} style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>• {r}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 16 }}>
                    Analysis: {new Date(result.analysisTimestamp).toLocaleString()}
                  </p>
                </div>
              )}

              {!loading && !result && (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <Sparkles size={48} color="var(--color-ai)" style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{t('ai.upload', 'Upload an image to begin analysis')}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('ai.assess', 'The AI will assess visual quality indicators and assign a grade from A to D')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

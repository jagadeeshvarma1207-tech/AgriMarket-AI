'use client'
import { useEffect, useState, useRef } from 'react'
import { FarmerSidebar } from '@/components/farmer/FarmerSidebar'
import { useToast } from '@/components/ui/Toast'
import { MapPin, Navigation, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/maps/LeafletMap'), { ssr: false, loading: () => <div className="skeleton" style={{ height: 300, borderRadius: 12 }} /> })

type GeoError = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | null

export default function FarmerLocationPage() {
  const { success, error: toastError } = useToast()
  const [location, setLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<GeoError>(null)

  const [form, setForm] = useState({
    latitude: '', longitude: '',
    city: '', state: '', country: 'India', pincode: '',
    displayAddress: '', sellingLocation: '',
  })

  useEffect(() => {
    fetch('/api/farmer/location')
      .then(r => r.json())
      .then(d => {
        if (d.location) {
          setLocation(d.location)
          setForm({
            latitude: String(d.location.latitude),
            longitude: String(d.location.longitude),
            city: d.location.city || '',
            state: d.location.state || '',
            country: d.location.country || 'India',
            pincode: d.location.pincode || '',
            displayAddress: d.location.displayAddress || '',
            sellingLocation: d.location.sellingLocation || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('NOT_SUPPORTED')
      return
    }
    setGeoLoading(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setForm(f => ({ ...f, latitude: String(lat), longitude: String(lng) }))

        // Reverse geocode using OpenStreetMap Nominatim (free, no key needed)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
          const data = await res.json()
          if (data.address) {
            const addr = data.address
            setForm(f => ({
              ...f,
              city: addr.city || addr.town || addr.village || addr.county || '',
              state: addr.state || '',
              country: addr.country || 'India',
              pincode: addr.postcode || '',
            }))
          }
        } catch {}

        setGeoLoading(false)
        success('Location detected! Please review and save.')
      },
      (err) => {
        setGeoLoading(false)
        if (err.code === 1) setGeoError('PERMISSION_DENIED')
        else if (err.code === 2) setGeoError('POSITION_UNAVAILABLE')
        else if (err.code === 3) setGeoError('TIMEOUT')
        else setGeoError('POSITION_UNAVAILABLE')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.latitude || !form.longitude) {
      toastError('Please detect or enter your coordinates first')
      return
    }
    setSaving(true)
    const res = await fetch('/api/farmer/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setLocation(data.location)
      success('Location saved! Only your approximate location is shown publicly.')
    } else {
      toastError(data.error || 'Failed to save location')
    }
    setSaving(false)
  }

  const GEO_ERROR_MESSAGES: Record<string, string> = {
    PERMISSION_DENIED: 'Location permission denied. Please allow location access in your browser settings, then try again.',
    POSITION_UNAVAILABLE: 'Location unavailable. Your device could not determine its position. Try entering coordinates manually.',
    TIMEOUT: 'Location request timed out. Please try again or enter your location manually.',
    NOT_SUPPORTED: 'Your browser does not support geolocation. Please enter your coordinates manually.',
  }

  const hasCoords = form.latitude && form.longitude

  return (
    <div className="dashboard-layout">
      <FarmerSidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>My Location</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Your approximate selling location is shown to buyers</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Privacy notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
            <CheckCircle size={16} color="var(--color-primary-light)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              <strong style={{ color: 'var(--color-primary-light)' }}>Privacy Protected:</strong> Only your approximate location (within ~500m radius) is shown publicly. Your exact coordinates are stored securely and never displayed to buyers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                {/* Geolocation detect */}
                <div style={{ marginBottom: 24 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={detectLocation}
                    disabled={geoLoading}
                  >
                    {geoLoading ? (
                      <><div className="spinner" style={{ width: 18, height: 18 }} /> Detecting location...</>
                    ) : (
                      <><Navigation size={18} /> Use Current Location</>
                    )}
                  </button>

                  {geoError && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
                      <AlertCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ color: '#fca5a5', fontSize: '0.82rem', margin: 0 }}>{GEO_ERROR_MESSAGES[geoError]}</p>
                    </div>
                  )}
                </div>

                <div className="divider" style={{ margin: '0 0 20px' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>Or enter location manually:</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input className="form-input" type="number" step="any" placeholder="e.g. 12.9716" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input className="form-input" type="number" step="any" placeholder="e.g. 77.5946" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group">
                    <label className="form-label">City / Town</label>
                    <input className="form-input" placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" placeholder="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code</label>
                    <input className="form-input" placeholder="560001" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Public Display Address</label>
                  <input className="form-input" placeholder="e.g. Near Main Market, Bangalore" value={form.displayAddress} onChange={e => setForm(f => ({ ...f, displayAddress: e.target.value }))} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>This is what buyers see — use a landmark, not your exact home</span>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Selling Location</label>
                  <input className="form-input" placeholder="e.g. Bangalore City Market, Stall 12" value={form.sellingLocation} onChange={e => setForm(f => ({ ...f, sellingLocation: e.target.value }))} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving || !hasCoords}>
                  {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : <><MapPin size={16} /> Save Location</>}
                </button>
              </div>
            </form>

            {/* Map Preview */}
            <div>
              <div className="card">
                <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 12, fontSize: '1rem' }}>Location Preview</h4>
                {hasCoords ? (
                  <MapComponent
                    lat={parseFloat(form.latitude)}
                    lng={parseFloat(form.longitude)}
                    label={form.displayAddress || form.city || 'Your Location'}
                  />
                ) : (
                  <div style={{ height: 280, background: 'var(--color-bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                    <MapPin size={36} color="var(--color-text-muted)" />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Detect or enter location to preview on map</p>
                  </div>
                )}
                {location && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 10 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-primary-light)', marginBottom: 4 }}>✓ Location Saved</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                      {[location.city, location.state, location.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

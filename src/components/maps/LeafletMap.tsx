'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function ChangeView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 14) }, [lat, lng, map])
  return null
}

interface LeafletMapProps {
  lat: number
  lng: number
  label?: string
  zoom?: number
  height?: number
  markers?: { lat: number; lng: number; label: string }[]
}

export default function LeafletMap({ lat, lng, label, zoom = 14, height = 280, markers }: LeafletMapProps) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', height }}>
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView lat={lat} lng={lng} />
        <Marker position={[lat, lng]}>
          {label && <Popup>{label}</Popup>}
        </Marker>
        {markers?.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]}>
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

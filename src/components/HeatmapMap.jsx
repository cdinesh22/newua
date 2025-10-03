import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export default function HeatmapMap({ center, areas = [], facilities = [], showAreas = true, showFacilities = true, showTempleMarker = false, templeName = '' }) {
  const getColor = (density) => {
    switch (density) {
      case 'low': return '#16a34a'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      case 'critical': return '#991b1b'
      default: return '#3b82f6'
    }
  }

  const pulseIcon = (severity) => {
    const color = severity === 'critical' ? '#ef4444' : '#f59e0b'
    return L.divIcon({
      className: 'tcm-pulse-wrapper',
      html: `
        <div class="tcm-pulse" style="--pulse-color:${color}"></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }

  if (!center) return null

  const CenterUpdater = ({ c }) => {
    const map = useMap()
    useEffect(() => {
      if (!c) return
      const latlng = [c.latitude, c.longitude]
      // smooth pan without changing zoom
      map.setView(latlng, map.getZoom())
    }, [c?.latitude, c?.longitude])
    return null
  }

  return (
    <MapContainer center={[center.latitude, center.longitude]} zoom={16} className="h-96 w-full rounded shadow">
      <CenterUpdater c={center} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {showAreas && areas.map((a, idx) => (
        <Circle key={idx} center={[a.coordinates.latitude, a.coordinates.longitude]} radius={30}
          pathOptions={{ color: getColor(a.density), fillColor: getColor(a.density), fillOpacity: 0.4 }}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{a.name}</div>
              <div>Occupancy: {a.occupancy}/{a.capacity} ({a.occupancyPercentage}%)</div>
              <div>Density: {a.density}</div>
            </div>
          </Popup>
        </Circle>
      ))}
      {showAreas && areas.filter(a=>a.density==='high' || a.density==='critical').map((a, idx) => (
        <Marker key={`pulse-${idx}`} position={[a.coordinates.latitude, a.coordinates.longitude]} icon={pulseIcon(a.density)} interactive={false} zIndexOffset={1000} />
      ))}
      {showFacilities && facilities.map((f, idx) => (
        <Marker key={idx} position={[f.coordinates.latitude, f.coordinates.longitude]}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{f.name}</div>
              <div>Type: {f.type}</div>
              <div>{f.description}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      {showTempleMarker && (
        <Marker position={[center.latitude, center.longitude]}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{templeName || 'Temple'}</div>
              <div>Center point</div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

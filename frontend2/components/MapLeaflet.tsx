import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import type { GeoJSON } from 'geojson'
import 'leaflet/dist/leaflet.css'

// Fix for default Leaflet icon not appearing correctly in Next.js
// We'll use our own icons so this is less critical, but good practice
let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

type Props = {
  center?: LatLngExpression
  zoom?: number
  markers?: { position: LatLngExpression; label?: string; color?: string }[]
  route?: GeoJSON.Feature | null
}

const createCustomIcon = (color: string) => {
  if (typeof window === 'undefined') return null;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7]
  });
};

// Component to handle map centering when center changes
function ChangeView({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapLeaflet({ center = [5.33, -4.03], zoom = 12, markers = [], route = null }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, idx) => (
          <Marker
            position={m.position}
            key={idx}
            icon={m.color ? createCustomIcon(m.color) : undefined}
          >
            <Popup>{m.label || 'Point'}</Popup>
          </Marker>
        ))}
        {route && (() => {
          try {
            // @ts-ignore
            const coords = route.type === 'Feature' && route.geometry && (route.geometry as any).coordinates
            const latlngs = coords?.map((c: any) => [c[1], c[0]]) || []
            return <Polyline positions={latlngs} pathOptions={{ color: '#f97316', weight: 5, opacity: 0.8 }} />
          } catch (e) {
            return null
          }
        })()}
      </MapContainer>
    </div>
  )
}

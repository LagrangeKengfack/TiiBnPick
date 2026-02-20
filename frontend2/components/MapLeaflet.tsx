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

const getCoordinates = (routeData: any) => {
  if (!routeData) return [];
  try {
    // Standard GeoJSON Feature
    if (routeData.type === 'Feature' && routeData.geometry && routeData.geometry.coordinates) {
      return routeData.geometry.coordinates;
    }
    // OSRM response format (OSRM Routing Machine)
    if (routeData.routes && routeData.routes[0]?.geometry?.coordinates) {
      return routeData.routes[0].geometry.coordinates;
    }
    // Direct geometry
    if (routeData.coordinates) {
      return routeData.coordinates;
    }
  } catch (e) {
    console.error("Error extracting coordinates", e);
  }
  return [];
};

// Component to automatically fit bounds to markers and route
function FitBounds({ markers, route }: { markers: { position: LatLngExpression }[], route?: any }) {
  const map = useMap();
  useEffect(() => {
    let points: any[] = markers.map(m => m.position);

    if (route) {
      const coords = getCoordinates(route);
      if (coords.length > 0) {
        points = [...points, ...coords.map((c: any) => [c[1], c[0]])];
      }
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, route, map]);
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
        <FitBounds markers={markers} route={route} />
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
          const coords = getCoordinates(route);
          if (coords && coords.length > 0) {
            const latlngs = coords.map((c: any) => [c[1], c[0]]);
            return <Polyline positions={latlngs} pathOptions={{ color: '#f97316', weight: 5, opacity: 0.8 }} />;
          }
          return null;
        })()}
      </MapContainer>
    </div>
  )
}

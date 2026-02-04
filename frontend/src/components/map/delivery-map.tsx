'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import '@/app/globals.css'

interface DeliveryMapProps {
  pickupAddress: string
  deliveryAddress: string
}

const DeliveryMap = ({ pickupAddress, deliveryAddress }: DeliveryMapProps) => {
  // Coordonnées des points (Cameroon - Douala et Yaoundé)
  const pickupCoords: [number, number] = [4.0499, 9.7043] // Akwa, Douala
  const deliveryCoords: [number, number] = [3.8860, 11.5020] // Bastos, Yaoundé

  // Centrer la carte sur les deux points
  const mapCenter: [number, number] = [
    (pickupCoords[0] + deliveryCoords[0]) / 2,
    (pickupCoords[1] + deliveryCoords[1]) / 2
  ]

  // Icônes personnalisées - utilisation directe de SVG dans le JSX
  const createIcon = (color: string, iconSvg: string) => {
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            backgroundColor: color,
            borderRadius: '50%',
            border: '3px solid white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '36px',
            height: '36px'
          }}
        >
          {iconSvg}
        </svg>
      </div>
    )
  }

  // Icônes personnalisées - icônes SVG
  const pickupIconSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s9-6 9-13z"/>
      <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
    </svg>
  `

  const deliveryIconSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 11 22 2 13 12 21 3"/>
      <circle cx="12" cy="13" r="2.5" fill="currentColor"/>
    </svg>
  `

  const livreurIconSvg = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
    </svg>
  `

  const pickupIcon = createIcon('#22c55e', pickupIconSvg)
  const deliveryIcon = createIcon('#ef4444', deliveryIconSvg)
  const livreurIcon = createIcon('#f97316', livreurIconSvg)

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      {/* OpenStreetMap Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Marqueur de départ (vert) */}
      <Marker position={pickupCoords}>
        <Popup>
          <div className="p-2 min-w-[200px]">
            <p className="font-bold text-sm">Point de départ</p>
            <p className="text-xs text-gray-600">{pickupAddress}</p>
          </div>
        </Popup>
      </Marker>

      {/* Marqueur de destination (rouge) */}
      <Marker position={deliveryCoords} icon={deliveryIcon}>
        <Popup>
          <div className="p-2 min-w-[200px]">
            <p className="font-bold text-sm">Destination</p>
            <p className="text-xs text-gray-600">{deliveryAddress}</p>
          </div>
        </Popup>
      </Marker>

      {/* Marqueur du livreur (orange) */}
      <Marker position={livreurCoords} icon={livreurIcon}>
        <Popup>
          <div className="p-2 min-w-[200px]">
            <p className="font-bold text-sm">Votre position</p>
          </div>
        </Popup>
      </Marker>

      {/* Tracé de la route */}
      <Polyline
        positions={[pickupCoords, livreurCoords, deliveryCoords]}
        pathOptions={{ color: '#f97316', weight: 5, dashArray: '10, 10' }}
      />

      {/* Ligne pointillée entre position actuelle et destination */}
      <Polyline
        positions={[livreurCoords, deliveryCoords]}
        pathOptions={{ color: '#eab308', weight: 3, dashArray: '15, 15', opacity: 0.6 }}
      />
    </MapContainer>
  )
}

export default DeliveryMap

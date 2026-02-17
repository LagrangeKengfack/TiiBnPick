"use client";
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- ROBUST ICON DEFINITION ---
// We use a CDN to ensure the images are always found
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const createIcon = (color: 'orange' | 'green') => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = createIcon('orange');
const greenIcon = createIcon('green');

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      // Use a small timeout to let Leaflet finish the internal event
      // before React triggers a re-render. This fixes the "_leaflet_events" error.
      setTimeout(() => {
        onClick(e.latlng.lat, e.latlng.lng);
      }, 0);
    },
  });
  return null;
}

export default function MapLeaflet({
  center,
  markers,
  route,
  onMapClick,
}: any) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {onMapClick && <ClickHandler onClick={onMapClick} />}

      {markers.map((m: any, idx: number) => (
        <Marker
          position={m.position}
          key={`marker-${idx}`}
          // If the label is "Départ" or contains "Retrait", use orange, else green
    icon={m.label === 'Départ' ? orangeIcon : greenIcon}
  >
    <Popup>{m.label}</Popup>
  </Marker>
      ))}

      {route?.geometry?.coordinates && (
        <Polyline
          positions={route.geometry.coordinates.map((c: any) => [c[1], c[0]])}
          pathOptions={{ color: "#f97316", weight: 5, lineJoin: "round" }}
        />
      )}
    </MapContainer>
  );
}

"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Clock } from 'lucide-react'
import dynamic from 'next/dynamic'
import { geocode } from '@/services/geocoding'
import { getRoute } from '@/services/routing'
import type { GeoJSON } from 'geojson'

interface RouteData {
  departurePointId: string | null
  arrivalPointId: string | null
  departurePointName: string
  arrivalPointName: string
  distanceKm: number
  durationMinutes?: number
}

interface RouteSelectionStepProps {
  onContinue: (data: RouteData, travelPrice: number) => void
  onBack: () => void
  initialDepartureAddress?: string
  initialArrivalAddress?: string
  initialDepartureCoords?: { lat: number; lon: number }
  initialArrivalCoords?: { lat: number; lon: number }
  transportMethod?: string
}

const MapLeaflet = dynamic(() => import('@/components/MapLeaflet'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
})

const calculateTravelPrice = (distance: number) => {
  if (distance <= 0) return 0
  const baseFee = 500
  const pricePerKm = 80
  return Math.round(baseFee + distance * pricePerKm)
}

export default function RouteSelectionStep({
  onContinue,
  onBack,
  initialDepartureAddress,
  initialArrivalAddress,
  initialDepartureCoords,
  initialArrivalCoords,
  transportMethod
}: RouteSelectionStepProps) {
  const [routeData, setRouteData] = useState<RouteData>({
    departurePointId: null,
    arrivalPointId: null,
    departurePointName: initialDepartureAddress || (initialDepartureCoords ? 'Ma position actuelle' : ''),
    arrivalPointName: initialArrivalAddress || (initialArrivalCoords ? 'Destination' : ''),
    distanceKm: 0,
    durationMinutes: 0
  })

  const [travelPrice, setTravelPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [markers, setMarkers] = useState<any[]>([])
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.Feature | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.33, -4.03])

  useEffect(() => {
    const setupFromAddresses = async () => {
      // On a besoin soit d'adresses soit de coordonnées pour continuer
      if (!initialDepartureAddress && !initialDepartureCoords) return
      if (!initialArrivalAddress && !initialArrivalCoords) return

      setIsLoading(true)
      try {
        let depLat, depLon, arrLat, arrLon;

        // Gérer le point de départ
        if (initialDepartureCoords) {
          depLat = initialDepartureCoords.lat;
          depLon = initialDepartureCoords.lon;
        } else if (initialDepartureAddress) {
          const dep = await geocode(initialDepartureAddress)
          if (dep && dep.length > 0) {
            depLat = parseFloat(dep[0].lat)
            depLon = parseFloat(dep[0].lon)
          }
        }

        // Gérer le point d'arrivée
        if (initialArrivalCoords) {
          arrLat = initialArrivalCoords.lat;
          arrLon = initialArrivalCoords.lon;
        } else if (initialArrivalAddress) {
          const arr = await geocode(initialArrivalAddress)
          if (arr && arr.length > 0) {
            arrLat = parseFloat(arr[0].lat)
            arrLon = parseFloat(arr[0].lon)
          }
        }

        if (depLat !== undefined && depLon !== undefined && arrLat !== undefined && arrLon !== undefined) {
          setMarkers([
            { position: [depLat, depLon], label: 'Retrait', color: '#f97316' },
            { position: [arrLat, arrLon], label: 'Livraison', color: '#10b981' },
          ])
          // Calcul du point milieu pour centrer la carte
          setMapCenter([(depLat + arrLat) / 2, (depLon + arrLon) / 2])

          const data = await getRoute(depLat, depLon, arrLat, arrLon, transportMethod)
          if (data && data.routes && data.routes.length > 0) {
            const route = data.routes[0]
            const distanceKm = Math.round((route.distance / 1000) * 100) / 100
            const durationMinutes = Math.round(route.duration / 60)

            setRouteData(prev => ({
              ...prev,
              distanceKm,
              durationMinutes,
              departurePointName: initialDepartureAddress || 'Ma position actuelle',
              arrivalPointName: initialArrivalAddress || 'Destination'
            }))
            setTravelPrice(calculateTravelPrice(distanceKm))
            setRouteGeoJSON({ type: 'Feature', geometry: route.geometry as any, properties: {} })
            setRouteData(prev => ({ ...prev, departurePointId: 'from-address', arrivalPointId: 'to-address' }))
          } else {
            alert('Aucun itinéraire trouvé entre ces adresses.')
          }
        } else {
          alert('Impossible de géocoder une ou plusieurs adresses fournies.')
        }
      } catch (e) {
        console.error('Erreur geocode/route:', e)
        alert('Erreur lors du traitement des adresses.')
      } finally {
        setIsLoading(false)
      }
    }

    setupFromAddresses()
  }, [initialDepartureAddress, initialArrivalAddress, initialDepartureCoords, initialArrivalCoords, transportMethod])

  const handleReset = () => {
    setMarkers([])
    setRouteGeoJSON(null)
    setRouteData({ departurePointId: null, arrivalPointId: null, departurePointName: '', arrivalPointName: '', distanceKm: 0 })
    setTravelPrice(0)
    setMapCenter([5.33, -4.03])
  }

  const handleSubmit = () => {
    if (routeData.distanceKm > 0) {
      onContinue(routeData, travelPrice)
    } else {
      alert('Aucun itinéraire calculé.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="h-screen flex flex-col bg-gray-50 dark:bg-transparent">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Sélection de l'itinéraire</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Itinéraire calculé à partir des adresses fournies.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative h-[350px] lg:h-[450px]">
          <MapLeaflet center={mapCenter} markers={markers} route={routeGeoJSON} />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/10">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          )}
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">Détails de l'itinéraire</h4>
              <button
                onClick={handleReset}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-4 h-4 bg-orange-500 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Point de retrait</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100 leading-snug">{routeData.departurePointName || 'À sélectionner'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 w-4 h-4 bg-green-500 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Point de livraison</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100 leading-snug">{routeData.arrivalPointName || 'À sélectionner'}</p>
                  </div>
                </div>
              </div>

              {routeData.distanceKm > 0 ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col justify-center border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Distance totale</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{routeData.distanceKm.toFixed(1)} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Coût estimé</p>
                      <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{travelPrice.toLocaleString()} <span className="text-sm font-bold">FCFA</span></p>
                    </div>
                  </div>

                  {routeData.durationMinutes && routeData.durationMinutes > 0 && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Durée de route estimée</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{routeData.durationMinutes} minutes</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center italic">
                    Configurez vos adresses pour calculer l'itinéraire
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex justify-end max-w-2xl mx-auto">
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full md:w-auto inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Continuer vers la signature
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}


"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Clock,
  MapPin,
  Navigation,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { reverseGeocodeRaw, geocode } from "@/services/geocoding";
import { getRoute } from "@/services/routing";
import { calculateTravelPrice } from "@/lib/utils";
import { RouteData, RouteSelectionStepProps } from "@/types/package";

// Dynamic import to prevent SSR errors
const MapLeaflet = dynamic(() => import("@/components/MapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
      Initialisation de la carte...
    </div>
  ),
});

export default function RouteSelectionStep({
  onContinue,
  onBack,
  initialDepartureAddress,
  initialArrivalAddress,
}: RouteSelectionStepProps) {
  const [routeData, setRouteData] = useState<RouteData>({
    departurePointId: "manual",
    arrivalPointId: "manual",
    departurePointName: initialDepartureAddress || "",
    arrivalPointName: initialArrivalAddress || "",
    distanceKm: 0,
    durationMinutes: 0,
  });

  const [travelPrice, setTravelPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([3.848, 11.502]); // Default to Yaoundé
  const [selectionMode, setSelectionMode] = useState<
    "none" | "departure" | "arrival"
  >("none");
  const [updatedSenderInfo, setUpdatedSenderInfo] = useState<any>(null);
  const [updatedRecipientInfo, setUpdatedRecipientInfo] = useState<any>(null);

  // --- 1. INITIAL GEOCODING (From Step 1 & 2) ---
  useEffect(() => {
    const initRoute = async () => {
      if (!initialDepartureAddress || !initialArrivalAddress) return;
      setIsLoading(true);
      try {
        const depRes = await geocode(initialDepartureAddress);
        const arrRes = await geocode(initialArrivalAddress);

        if (depRes?.[0] && arrRes?.[0]) {
          const dep = [parseFloat(depRes[0].lat), parseFloat(depRes[0].lon)];
          const arr = [parseFloat(arrRes[0].lat), parseFloat(arrRes[0].lon)];
          updateRoute(dep as [number, number], arr as [number, number]);
        } else {
          // --- ALERT ADDED HERE ---
          alert(
            "Certaines adresses n'ont pas été trouvées. Veuillez sélectionner les points de départ et d'arrivée manuellement sur la carte.",
          );
          setSelectionMode("departure");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    initRoute();
  }, []);

  // --- 2. THE CORE ROUTING LOGIC ---
  const updateRoute = async (dep: [number, number], arr: [number, number]) => {
    setIsLoading(true);
    try {
      // 1. Get detailed address data from OSM for both points
      const depData = await reverseGeocodeRaw(dep[0], dep[1]);
      const arrData = await reverseGeocodeRaw(arr[0], arr[1]);

      // 2. Prepare the sync objects (Matching your SenderData interface)
      const newSender = {
        senderAddress:
          depData.address.suburb || depData.address.neighborhood || "",
        senderCity:
          depData.address.city ||
          depData.address.town ||
          depData.address.village ||
          "",
        senderRegion: depData.address.state || "",
        senderLieuDit:
          depData.address.road ||
          depData.address.pedestrian ||
          depData.display_name,
      };

      const newRecipient = {
        recipientAddress:
          arrData.address.suburb || arrData.address.neighborhood || "",
        recipientCity:
          arrData.address.city ||
          arrData.address.town ||
          arrData.address.village ||
          "",
        recipientRegion: arrData.address.state || "",
        recipientLieuDit:
          arrData.address.road ||
          arrData.address.pedestrian ||
          arrData.display_name,
      };

      setUpdatedSenderInfo(newSender);
      setUpdatedRecipientInfo(newRecipient);

      // 3. Get the route
      const data = await getRoute(dep[0], dep[1], arr[0], arr[1]);
      if (data?.routes?.[0]) {
        const route = data.routes[0];
        const dist = Math.round((route.distance / 1000) * 100) / 100;
        const dur = Math.round(route.duration / 60);

        setMarkers([
          { position: dep, label: "Départ", color: "#f97316" },
          { position: arr, label: "Arrivée", color: "#10b981" },
        ]);

        setRouteGeoJSON({
          type: "Feature",
          geometry: route.geometry,
          properties: {},
        });
        setTravelPrice(calculateTravelPrice(dist));
        setMapCenter([(dep[0] + arr[0]) / 2, (dep[1] + arr[1]) / 2]);

        /*        // Reverse geocode to get clean names for UI
        const depName = await reverseGeocodeRaw(dep[0], dep[1]);
        const arrName = await reverseGeocodeRaw(arr[0], arr[1]);
*/
        setRouteData((prev) => ({
          ...prev,
          distanceKm: dist,
          durationMinutes: dur,
          departurePointName: newSender.senderAddress,
          arrivalPointName: newRecipient.recipientAddress,
        }));
      }
    } catch (e) {
      alert("Erreur de calcul d'itinéraire.");
    } finally {
      setIsLoading(false);
      setSelectionMode("none");
    }
  };

  // --- 3. MANUAL SELECTION HANDLER ---
  // This function would be triggered by a click event from MapLeaflet
  // Inside RouteExpedition.tsx -> find handleMapClick and replace it with this:

  const handleMapClick = async (lat: number, lng: number) => {
    if (selectionMode === "none") return;

    if (selectionMode === "departure") {
      // Set first marker
      setMarkers([{ position: [lat, lng], label: "Départ" }]);
      // Move to next step
      setSelectionMode("arrival");
    } else if (selectionMode === "arrival") {
      // Check if we actually have a departure marker first
      if (markers.length === 0) {
        setMarkers([{ position: [lat, lng], label: "Arrivée" }]);
        setSelectionMode("departure");
        return;
      }

      const departurePos = markers[0].position;
      const arrivalPos: [number, number] = [lat, lng];

      // Trigger the route update
      updateRoute(departurePos, arrivalPos);
    }
  };

  const handleReset = () => {
     setMarkers([]);
     setRouteGeoJSON(null);
     setTravelPrice(0);
     // Reset names to specific guidance strings
     setRouteData({
       departurePointId: null,
       arrivalPointId: null,
       departurePointName: "Sélectionnez le point de départ",
       arrivalPointName: "Sélectionnez le point d'arrivée",
       distanceKm: 0,
       durationMinutes: 0,
     });
    setSelectionMode("departure");
  };

  return (
    <div className="h-[85vh] flex flex-col bg-transparent relative">
      {/* Top Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white">
              Détails du trajet
            </h2>
            <p className="text-xs text-gray-500">
              Calcul automatique et ajustement manuel
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
        </button>
      </div>

      <div className="flex-1 relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
        <MapLeaflet
          center={mapCenter}
          markers={markers}
          route={routeGeoJSON}
          onMapClick={selectionMode !== "none" ? handleMapClick : undefined}
        />

        {/* LOADING OVERLAY */}
        {isLoading && (
          <div className="absolute inset-0 z-[1001] bg-white/40 backdrop-blur-sm flex items-center justify-center font-bold text-orange-600">
            <Loader2 className="animate-spin mr-2" /> Calcul de l'itinéraire...
          </div>
        )}

        {/* FLOATING CARD - POSITIONED BOTTOM RIGHT */}
        <div className="absolute bottom-8 right-8 z-[1000] w-full max-w-sm px-4 md:px-0">
          <motion.div
            layout
            className="bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-gray-100"
          >
            <div className="space-y-5">
              {/* Points display */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mt-1" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Retrait
                    </p>
                    <p className="text-xs font-bold text-gray-700 truncate">
                      {routeData.departurePointName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Livraison
                    </p>
                    <p className="text-xs font-bold text-gray-700 truncate">
                      {routeData.arrivalPointName}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATS GRID - WITH PRICE */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Distance
                  </p>
                  <p className="text-sm font-black text-gray-800">
                    {routeData.distanceKm} km
                  </p>
                </div>
                <div className="text-center border-x border-gray-100 px-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Temps
                  </p>
                  <p className="text-sm font-black text-gray-800">
                    {routeData.durationMinutes} min
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Prix
                  </p>
                  <p className="text-sm font-black text-orange-600">
                    {travelPrice.toLocaleString()} F
                  </p>
                </div>
              </div>

              <button
                disabled={isLoading || routeData.distanceKm === 0}
                onClick={() =>
                  onContinue(
                    routeData,
                    travelPrice,
                    updatedSenderInfo,
                    updatedRecipientInfo,
                  )
                }
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
              >
                Valider l'itinéraire
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

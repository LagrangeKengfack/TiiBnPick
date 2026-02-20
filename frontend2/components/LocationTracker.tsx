'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateLocation } from '@/services/deliveryPersonService';

const LOCATION_UPDATE_INTERVAL_MS = 15_000; // Minimum 15s between updates to avoid spamming

export default function LocationTracker() {
    const { user } = useAuth();
    const watchId = useRef<number | null>(null);
    const lastUpdateTime = useRef<number>(0);
    const retryTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const sendLocation = useCallback(async (latitude: number, longitude: number, deliveryPersonId: string) => {
        const now = Date.now();
        // Throttle: skip if last update was less than 15s ago
        if (now - lastUpdateTime.current < LOCATION_UPDATE_INTERVAL_MS) {
            return;
        }
        lastUpdateTime.current = now;

        try {
            console.log(`Updating location for livreur ${deliveryPersonId}: ${latitude}, ${longitude}`);
            await updateLocation(deliveryPersonId, latitude, longitude);
        } catch (error) {
            console.error('Failed to update real-time location:', error);
        }
    }, []);

    useEffect(() => {
        // Only track for delivery persons (LIVREUR)
        if (!user || user.userType !== 'LIVREUR' || !user.deliveryPersonId) {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        const deliveryPersonId = user.deliveryPersonId;

        if (!('geolocation' in navigator)) {
            console.error('Geolocation is not supported by this browser');
            return;
        }

        // First, try to get a single position to confirm geolocation works
        // Use a longer timeout and allow cached positions for the first read
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Initial position acquired: ${latitude}, ${longitude}`);
                await sendLocation(latitude, longitude, deliveryPersonId);
            },
            (error) => {
                console.warn('Initial geolocation attempt failed:', error.message,
                    '- Code:', error.code,
                    '(1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT)');
            },
            {
                enableHighAccuracy: false, // Lower accuracy for faster first fix
                timeout: 15000,           // 15s for initial position
                maximumAge: 60000         // Accept cached position up to 1 minute old
            }
        );

        // Then start continuous watching with more generous settings
        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await sendLocation(latitude, longitude, deliveryPersonId);
            },
            (error) => {
                console.error('Geolocation watch error:', error.message,
                    '- Code:', error.code,
                    '(1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT)');

                // If permission denied, stop trying
                if (error.code === error.PERMISSION_DENIED) {
                    if (watchId.current !== null) {
                        navigator.geolocation.clearWatch(watchId.current);
                        watchId.current = null;
                    }
                    return;
                }

                // For timeout or unavailable: retry after a delay
                if (retryTimeoutId.current) clearTimeout(retryTimeoutId.current);
                retryTimeoutId.current = setTimeout(() => {
                    // Attempt a fresh single position grab
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            await sendLocation(pos.coords.latitude, pos.coords.longitude, deliveryPersonId);
                        },
                        () => { /* silently fail on retry */ },
                        { enableHighAccuracy: false, timeout: 30000, maximumAge: 120000 }
                    );
                }, 10000);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,      // 30s timeout (much more generous)
                maximumAge: 10000    // Accept position up to 10s old
            }
        );

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            if (retryTimeoutId.current) {
                clearTimeout(retryTimeoutId.current);
                retryTimeoutId.current = null;
            }
        };
    }, [user, sendLocation]);

    return null; // This component doesn't render anything
}

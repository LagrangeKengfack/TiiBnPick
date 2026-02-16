export async function getRoute(lat1: number, lon1: number, lat2: number, lon2: number, profile: string = 'driving') {
  // OSRM common profiles: driving, car, bike, foot
  // demo server uses: driving, cycling, walking
  const osrmProfile = profile === 'bike' ? 'cycling' : 'driving';

  try {
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`

    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!res.ok) {
      console.error('OSRM API error:', res.status, res.statusText);
      throw new Error(`Routing failed: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || !data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    return data;
  } catch (error: any) {
    console.error('getRoute error:', error);
    if (error.name === 'TimeoutError') {
      throw new Error('Le service de calcul d\'itinéraire a mis trop de temps à répondre.');
    }
    throw error;
  }
}

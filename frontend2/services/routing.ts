export async function getRoute(lat1: number, lon1: number, lat2: number, lon2: number, profile: string = 'driving') {
  // OSRM common profiles: driving, car, bike, foot
  // demo server uses: driving, cycling, walking
  const osrmProfile = profile === 'bike' ? 'cycling' : 'driving';

  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;

  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!res.ok) {
        console.error(`OSRM API error (attempt ${attempt}):`, res.status, res.statusText);
        throw new Error(`Routing failed: ${res.statusText}`);
      }

      const data = await res.json();

      if (!data || !data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }

      return data;
    } catch (error: any) {
      lastError = error;
      console.warn(`getRoute attempt ${attempt}/${maxRetries} failed:`, error.message || error);

      if (attempt < maxRetries) {
        // Wait before retrying (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // All retries failed
  console.error('getRoute failed after all retries:', lastError);
  if (lastError?.name === 'TimeoutError') {
    throw new Error('Le service de calcul d\'itinéraire a mis trop de temps à répondre. Veuillez réessayer.');
  }
  if (lastError?.message === 'Failed to fetch' || lastError?.name === 'TypeError') {
    throw new Error('Impossible de contacter le service de calcul d\'itinéraire. Vérifiez votre connexion internet et réessayez.');
  }
  throw lastError;
}

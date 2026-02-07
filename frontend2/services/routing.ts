export async function getRoute(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  // OSRM wants: longitude,latitude;longitude,latitude
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    console.error("OSRM Error Detail:", errorData);
    throw new Error("Routing failed");
  }
  return res.json();
}

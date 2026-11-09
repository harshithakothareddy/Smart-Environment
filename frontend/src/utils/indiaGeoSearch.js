// India Geo Search Engine — Local database + Live OpenStreetMap Nominatim Geocoding
// Supports EVERY area, place, state, district, town, village, and locality across India
import { INDIA_LOCATIONS, searchIndiaLocations } from '../data/indiaLocations';

// Haversine distance in km
export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find nearest station from citiesData
export function findNearestStation(lat, lng, citiesData) {
  if (!citiesData || citiesData.length === 0) return { city: null, distanceKm: 0 };
  let nearest = citiesData[0];
  let minDist = Infinity;
  for (const c of citiesData) {
    const d = haversine(lat, lng, c.lat, c.lng);
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  }
  return { city: nearest, distanceKm: Math.round(minDist) };
}

// Geocode any place in India via Photon (Komoot) — OSM data, no API key, browser-safe
export async function searchNominatimIndia(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  // --- Primary: Photon API (works in browsers, no User-Agent restriction) ---
  try {
    // bbox: India bounding box (lon_min, lat_min, lon_max, lat_max)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}&lang=en&bbox=68.1766,8.4077,97.4026,37.6008`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const features = data?.features || [];

      const results = features
        .filter((f) => {
          const cc = (f.properties?.countrycode || '').toLowerCase();
          const country = (f.properties?.country || '').toLowerCase();
          return cc === 'in' || country.includes('india');
        })
        .map((f) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];

          // Most specific name
          const name =
            p.name ||
            p.district ||
            p.county ||
            p.city ||
            p.state ||
            q;

          // District
          const district =
            p.county ||
            p.district ||
            null;

          // State
          const state = p.state || 'India';

          // Classify type from osm_value / osm_key
          const osmVal = (p.osm_value || '').toLowerCase();
          const osmKey = (p.osm_key || '').toLowerCase();
          let type = 'Location';
          if (['hamlet', 'isolated_dwelling'].includes(osmVal)) type = 'Village';
          else if (['village'].includes(osmVal)) type = 'Village';
          else if (['suburb', 'neighbourhood', 'quarter', 'residential'].includes(osmVal)) type = 'Area';
          else if (['town'].includes(osmVal)) type = 'Town';
          else if (['city', 'municipality'].includes(osmVal)) type = 'City';
          else if (osmKey === 'boundary' || ['administrative', 'district'].includes(osmVal)) type = 'District';
          else if (osmVal === 'state') type = 'State';
          else if (p.city && !p.suburb) type = 'Area';

          return {
            name,
            displayName: [name, district, state].filter(Boolean).join(', '),
            type,
            state,
            district,
            lat: parseFloat(coords[1]),
            lng: parseFloat(coords[0]),
            isLiveGeo: true,
          };
        })
        // Deduplicate by name+state
        .filter((item, idx, arr) =>
          arr.findIndex(x => x.name.toLowerCase() === item.name.toLowerCase() && x.state === item.state) === idx
        );

      if (results.length > 0) return results;
    }
  } catch (err) {
    console.warn('Photon search failed, trying Nominatim fallback:', err);
  }

  // --- Fallback: Nominatim (may be rate-limited in browsers) ---
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q + ', India'
    )}&countrycodes=in&format=json&addressdetails=1&limit=${limit}`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => {
        const countryCode = item.address?.country_code?.toLowerCase() || '';
        return countryCode === 'in';
      })
      .map((item) => {
        const addr = item.address || {};
        const state = addr.state || addr.union_territory || addr.region || 'India';
        const district = addr.county || addr.state_district || addr.district || null;
        const placeName =
          addr.suburb || addr.neighbourhood || addr.quarter ||
          addr.village || addr.hamlet || addr.town || addr.city ||
          addr.municipality || addr.county || addr.district ||
          item.name || item.display_name.split(',')[0].trim();

        let type = 'Location';
        if (addr.hamlet || addr.village) type = 'Village';
        else if (addr.suburb || addr.neighbourhood || addr.quarter) type = 'Area';
        else if (addr.town) type = 'Town';
        else if (addr.city || addr.municipality) type = 'City';
        else if (addr.county || addr.state_district) type = 'District';
        else if (addr.state) type = 'State';

        return {
          name: placeName,
          displayName: item.display_name,
          type,
          state,
          district,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          isLiveGeo: true,
        };
      });
  } catch (err) {
    console.warn('Both Photon and Nominatim failed:', err);
    return [];
  }
}

// Build a readable breadcrumb: "Area, District, State"
export function formatLocationBreadcrumb(loc) {
  if (!loc) return '';
  const parts = [];
  if (loc.name) parts.push(loc.name);
  if (loc.district && loc.district.toLowerCase() !== loc.name?.toLowerCase()) parts.push(loc.district);
  if (loc.state && loc.state !== 'India') parts.push(loc.state);
  else if (!loc.state || loc.state === 'India') parts.push('India');
  return parts.join(', ');
}

// Map common state names & aliases for fallback coordinate guessing
const STATE_COORDS = {
  'andhra pradesh': { lat: 15.9129, lng: 79.74, state: 'Andhra Pradesh' },
  arunachal: { lat: 28.218, lng: 94.7278, state: 'Arunachal Pradesh' },
  assam: { lat: 26.2006, lng: 92.9376, state: 'Assam' },
  bihar: { lat: 25.0961, lng: 85.3131, state: 'Bihar' },
  chhattisgarh: { lat: 21.2787, lng: 81.8661, state: 'Chhattisgarh' },
  goa: { lat: 15.2993, lng: 74.124, state: 'Goa' },
  gujarat: { lat: 22.2587, lng: 71.1924, state: 'Gujarat' },
  haryana: { lat: 29.0588, lng: 76.0856, state: 'Haryana' },
  himachal: { lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh' },
  jharkhand: { lat: 23.6102, lng: 85.2799, state: 'Jharkhand' },
  karnataka: { lat: 15.3173, lng: 75.7139, state: 'Karnataka' },
  kerala: { lat: 10.8505, lng: 76.2711, state: 'Kerala' },
  'madhya pradesh': { lat: 22.9734, lng: 78.6569, state: 'Madhya Pradesh' },
  maharashtra: { lat: 19.7515, lng: 75.7139, state: 'Maharashtra' },
  manipur: { lat: 24.6637, lng: 93.9063, state: 'Manipur' },
  meghalaya: { lat: 25.467, lng: 91.3662, state: 'Meghalaya' },
  mizoram: { lat: 23.1645, lng: 92.9376, state: 'Mizoram' },
  nagaland: { lat: 26.1584, lng: 94.5624, state: 'Nagaland' },
  odisha: { lat: 20.9517, lng: 85.0985, state: 'Odisha' },
  punjab: { lat: 31.1471, lng: 75.3412, state: 'Punjab' },
  rajasthan: { lat: 27.0238, lng: 74.2179, state: 'Rajasthan' },
  sikkim: { lat: 27.533, lng: 88.5122, state: 'Sikkim' },
  'tamil nadu': { lat: 11.1271, lng: 78.6569, state: 'Tamil Nadu' },
  telangana: { lat: 18.1124, lng: 79.0193, state: 'Telangana' },
  tripura: { lat: 23.9408, lng: 91.9882, state: 'Tripura' },
  'uttar pradesh': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  uttarakhand: { lat: 30.0668, lng: 79.0193, state: 'Uttarakhand' },
  'west bengal': { lat: 22.9868, lng: 87.855, state: 'West Bengal' },
  delhi: { lat: 28.7041, lng: 77.1025, state: 'Delhi' },
  kashmir: { lat: 34.0837, lng: 74.7973, state: 'Jammu & Kashmir' },
  ladakh: { lat: 34.1526, lng: 77.5771, state: 'Ladakh' },
};

// Fallback: create a custom location for literally ANY user input
export function buildCustomLocation(query, citiesData, defaultState = 'India') {
  const trimmed = query.trim();
  const qLower = trimmed.toLowerCase();

  // Check if query matches a known state
  let lat = 20.5937;
  let lng = 78.9629;
  let state = defaultState;

  for (const [key, val] of Object.entries(STATE_COORDS)) {
    if (qLower.includes(key)) {
      lat = val.lat;
      lng = val.lng;
      state = val.state;
      break;
    }
  }

  // Find nearest station
  const { city: nearest, distanceKm } = findNearestStation(lat, lng, citiesData);

  return {
    name: trimmed,
    type: 'Custom Area',
    state: state,
    lat,
    lng,
    isCustom: true,
    nearest,
    distanceKm,
  };
}

export { searchIndiaLocations };

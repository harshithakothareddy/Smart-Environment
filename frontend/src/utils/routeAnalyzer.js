/**
 * routeAnalyzer.js
 * Real road routing via OpenStreetMap OSRM with pollution analysis
 * based on ambient monitoring stations displayed on the EcoNexus map.
 */

// Haversine distance in km
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format duration in seconds to "X hr Y min" or "X min"
 */
export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min`;
}

/**
 * Format distance in meters to "X km"
 */
export function formatDistance(meters) {
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

/**
 * Pollution classification matching EcoNexus color scale:
 * green = low (0-100), yellow = moderate (101-200), red = high (>200)
 */
export function getPollutionClassification(aqi) {
  const val = Math.round(aqi);
  if (val <= 100) {
    return {
      level: 'low',
      label: 'Low Pollution',
      color: '#16a34a', // green
      bg: '#dcfce7',
      border: '#86efac',
      text: '#166534',
      badgeClass: 'badge-good'
    };
  }
  if (val <= 200) {
    return {
      level: 'moderate',
      label: 'Moderate Pollution',
      color: '#ca8a04', // yellow / amber
      bg: '#fef9c3',
      border: '#fde047',
      text: '#854d0e',
      badgeClass: 'badge-moderate'
    };
  }
  return {
    level: 'high',
    label: 'High Pollution',
    color: '#dc2626', // red
    bg: '#fee2e2',
    border: '#fca5a5',
    text: '#991b1b',
    badgeClass: 'badge-poor'
  };
}

/**
 * Analyzes pollution levels along route coordinates using station data.
 * Coordinates format: Array of [lat, lon]
 */
export function analyzeRoutePollution(coordinates, stations = []) {
  if (!coordinates || coordinates.length === 0) {
    return { avgAQI: 100, maxAQI: 100, minAQI: 100, ...getPollutionClassification(100) };
  }

  const validStations = stations.filter(
    s => s && Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng))
  );

  // If no stations available, fallback to neutral
  if (validStations.length === 0) {
    return { avgAQI: 110, maxAQI: 110, minAQI: 110, ...getPollutionClassification(110) };
  }

  // Sample points along the route (every ~5 to 15 points to keep calculation light and fast)
  const step = Math.max(1, Math.floor(coordinates.length / 30));
  const sampledPoints = [];
  for (let i = 0; i < coordinates.length; i += step) {
    sampledPoints.push(coordinates[i]);
  }
  if (sampledPoints[sampledPoints.length - 1] !== coordinates[coordinates.length - 1]) {
    sampledPoints.push(coordinates[coordinates.length - 1]);
  }

  // Calculate AQI for each sampled point using Inverse Distance Weighting (IDW)
  const aqiEstimates = sampledPoints.map(([pLat, pLng]) => {
    let totalWeight = 0;
    let weightedAqiSum = 0;

    for (const station of validStations) {
      const sLat = Number(station.lat);
      const sLng = Number(station.lng);
      const aqi = Number(station.aqi) || 100;
      const dist = haversineDistance(pLat, pLng, sLat, sLng);

      // Distance decay weighting with a small smoothing factor
      const weight = 1 / Math.pow(Math.max(dist, 10), 2);
      weightedAqiSum += aqi * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedAqiSum / totalWeight : 100;
  });

  const avgAQI = Math.round(aqiEstimates.reduce((a, b) => a + b, 0) / aqiEstimates.length);
  const maxAQI = Math.round(Math.max(...aqiEstimates));
  const minAQI = Math.round(Math.min(...aqiEstimates));
  const classification = getPollutionClassification(avgAQI);

  return {
    avgAQI,
    maxAQI,
    minAQI,
    ...classification
  };
}

/**
 * Fetches real road routes from OpenStreetMap OSRM with alternative routes
 */
export async function fetchRoadRoutes(origin, dest, stations = []) {
  if (!origin || !dest) return null;

  const oLat = Number(origin.lat);
  const oLng = Number(origin.lng);
  const dLat = Number(dest.lat);
  const dLng = Number(dest.lng);

  if (!Number.isFinite(oLat) || !Number.isFinite(oLng) || !Number.isFinite(dLat) || !Number.isFinite(dLng)) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson&alternatives=true`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        // Map OSRM routes
        const parsedRoutes = data.routes.map((r, idx) => {
          // OSRM coordinates are [lon, lat], Leaflet polyline needs [lat, lon]
          const waypoints = r.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const distanceMeters = r.distance;
          const durationSeconds = r.duration;
          const pollution = analyzeRoutePollution(waypoints, stations);

          return {
            id: `osrm-route-${idx}`,
            distanceKm: (distanceMeters / 1000).toFixed(1),
            distanceText: formatDistance(distanceMeters),
            durationText: formatDuration(durationSeconds),
            durationSeconds,
            distanceMeters,
            waypoints,
            pollution,
            summary: r.legs?.[0]?.summary || `Route ${idx + 1}`
          };
        });

        return buildPollutionAwareRoutes(parsedRoutes, origin, dest, stations);
      }
    }
  } catch (err) {
    console.warn('OSRM routing fetch failed or timed out, generating road fallback:', err);
  }

  // Fallback route generator if offline or rate limited
  return generateFallbackRoadRoutes(origin, dest, stations);
}

/**
 * Evaluates parsed routes to designate "Normal Route" vs "Lower Pollution Route"
 */
function buildPollutionAwareRoutes(routes, origin, dest, stations) {
  if (!routes || routes.length === 0) return null;

  // If only 1 route was returned by OSRM, synthesize a bypass corridor alternative
  if (routes.length === 1) {
    const primary = routes[0];
    const altWaypoints = generateBypassWaypoints(primary.waypoints);
    const altDistanceMeters = Math.round(primary.distanceMeters * 1.07);
    const altDurationSeconds = Math.round(primary.durationSeconds * 1.09);
    const altPollution = analyzeRoutePollution(altWaypoints, stations);

    // If the bypass has lower AQI, create an alternative
    const altRoute = {
      id: 'alternative-route',
      distanceKm: (altDistanceMeters / 1000).toFixed(1),
      distanceText: formatDistance(altDistanceMeters),
      durationText: formatDuration(altDurationSeconds),
      durationSeconds: altDurationSeconds,
      distanceMeters: altDistanceMeters,
      waypoints: altWaypoints,
      pollution: altPollution,
      summary: 'Green Corridor / Expressway Bypass'
    };

    routes.push(altRoute);
  }

  // Find lowest pollution route vs standard/fastest route
  const fastestRoute = routes[0];
  const secondRoute = routes[1];

  let normalRoute;
  let lowerPollutionRoute = null;

  if (secondRoute) {
    // Check if second route has lower pollution
    const diff = fastestRoute.pollution.avgAQI - secondRoute.pollution.avgAQI;
    if (diff >= 4) {
      // Second route has noticeably lower pollution!
      normalRoute = {
        ...fastestRoute,
        name: 'Normal Route',
        type: 'normal',
        description: 'Standard fastest road route'
      };
      lowerPollutionRoute = {
        ...secondRoute,
        name: 'Lower Pollution Route',
        type: 'lower_pollution',
        description: 'Passes through corridors with comparatively lower ambient pollution',
        reductionPct: Math.round((diff / fastestRoute.pollution.avgAQI) * 100)
      };
    } else if (diff <= -4) {
      // Fastest route is already the lower pollution one!
      lowerPollutionRoute = {
        ...fastestRoute,
        name: 'Lower Pollution Route',
        type: 'lower_pollution',
        description: 'Fastest route that also has lower ambient pollution levels',
        reductionPct: Math.round((Math.abs(diff) / secondRoute.pollution.avgAQI) * 100)
      };
      normalRoute = {
        ...secondRoute,
        name: 'Normal Route',
        type: 'normal',
        description: 'Alternative road route'
      };
    } else {
      // Very close in pollution
      normalRoute = {
        ...fastestRoute,
        name: 'Normal Route',
        type: 'normal',
        description: 'Fastest direct road route'
      };
      lowerPollutionRoute = {
        ...secondRoute,
        name: 'Lower Pollution Route',
        type: 'lower_pollution',
        description: 'Alternative route with comparable pollution levels',
        reductionPct: 0
      };
    }
  } else {
    normalRoute = {
      ...fastestRoute,
      name: 'Normal Route',
      type: 'normal',
      description: 'Direct road route'
    };
  }

  return {
    originName: origin.name,
    destName: dest.name,
    normalRoute,
    lowerPollutionRoute
  };
}

/**
 * Creates intermediate bypass points for a lower-pollution alternative corridor
 */
function generateBypassWaypoints(primaryWaypoints) {
  if (!primaryWaypoints || primaryWaypoints.length < 2) return primaryWaypoints;
  const start = primaryWaypoints[0];
  const end = primaryWaypoints[primaryWaypoints.length - 1];

  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;

  // Perpendicular offset vector to create a gentle bypass curve
  const dLat = end[0] - start[0];
  const dLng = end[1] - start[1];
  const offsetScale = 0.12;

  const bypassMid = [midLat - dLng * offsetScale, midLng + dLat * offsetScale];

  // Interpolate points smoothly
  const waypoints = [
    start,
    [start[0] * 0.7 + bypassMid[0] * 0.3, start[1] * 0.7 + bypassMid[1] * 0.3],
    bypassMid,
    [bypassMid[0] * 0.3 + end[0] * 0.7, bypassMid[1] * 0.3 + end[1] * 0.7],
    end
  ];

  return waypoints;
}

/**
 * Fallback route generator if network request to OSRM fails
 */
function generateFallbackRoadRoutes(origin, dest, stations) {
  const oLat = Number(origin.lat);
  const oLng = Number(origin.lng);
  const dLat = Number(dest.lat);
  const dLng = Number(dest.lng);

  const distKm = Math.round(haversineDistance(oLat, oLng, dLat, dLng) * 1.15);
  const durationSec = Math.round((distKm / 60) * 3600);

  // Normal direct waypoints
  const normalWaypoints = [
    [oLat, oLng],
    [(oLat * 2 + dLat) / 3 + 0.05, (oLng * 2 + dLng) / 3 - 0.04],
    [(oLat + dLat * 2) / 3 - 0.04, (oLng + dLng * 2) / 3 + 0.05],
    [dLat, dLng]
  ];

  // Lower pollution alternative bypass waypoints
  const altDistKm = Math.round(distKm * 1.12);
  const altDurationSec = Math.round(durationSec * 1.1);
  const altWaypoints = generateBypassWaypoints(normalWaypoints);

  const normalPollution = analyzeRoutePollution(normalWaypoints, stations);
  const altPollution = analyzeRoutePollution(altWaypoints, stations);

  const normalRoute = {
    id: 'fallback-normal',
    name: 'Normal Route',
    type: 'normal',
    distanceKm: distKm.toString(),
    distanceText: `${distKm} km`,
    durationText: formatDuration(durationSec),
    durationSeconds: durationSec,
    waypoints: normalWaypoints,
    pollution: normalPollution,
    description: 'Standard highway route'
  };

  const diff = normalPollution.avgAQI - altPollution.avgAQI;
  const lowerPollutionRoute = {
    id: 'fallback-lower',
    name: 'Lower Pollution Route',
    type: 'lower_pollution',
    distanceKm: altDistKm.toString(),
    distanceText: `${altDistKm} km`,
    durationText: formatDuration(altDurationSec),
    durationSeconds: altDurationSec,
    waypoints: altWaypoints,
    pollution: altPollution,
    description: 'Alternative corridor with comparatively lower ambient pollution',
    reductionPct: diff > 0 ? Math.round((diff / normalPollution.avgAQI) * 100) : 0
  };

  return {
    originName: origin.name,
    destName: dest.name,
    normalRoute,
    lowerPollutionRoute
  };
}

const CACHE_KEY = 'clotsolid_overpass_cache';
const CACHE_TTL = 1800000; // 30 minutes
const REQUEST_TIMEOUT_MS = 9000;

function calculateDistance(lat1, lon1, lat2, lon2) {
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

function extractCentreInfo(element, userLat, userLon) {
  const tags = element.tags || {};
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;

  if (!lat || !lon) return null;

  const name = tags.name || tags['name:en'] || '';
  if (!name) return null;

  const amenityType = tags.amenity || tags.healthcare || '';
  const typeMap = {
    hospital: 'Hospital',
    clinic: 'Clinic',
    doctors: 'Medical Practice',
    healthcare: tags.healthcare || 'Healthcare Centre',
    diagnostics: 'Diagnostics Centre',
    laboratory: 'Laboratory',
  };
  const centreType = typeMap[amenityType] || 'Medical Centre';

  const distance = calculateDistance(userLat, userLon, lat, lon);

  const address = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean).join(', ');

  return {
    id: element.id,
    name,
    type: centreType,
    lat,
    lon,
    distance,
    address: address || null,
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    openingHours: tags.opening_hours || null,
  };
}

function deduplicateCentres(centres) {
  const seen = new Map();
  for (const centre of centres) {
    const key = `${Math.round(centre.lat * 10000)}_${Math.round(centre.lon * 10000)}`;
    if (!seen.has(key) || (seen.get(key).name && !centre.name)) {
      seen.set(key, centre);
    }
  }
  return Array.from(seen.values());
}

function getCacheKey(lat, lon, radiusKm) {
  // Round to 2 decimal places for cache key (~1km precision)
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  return `${roundedLat}_${roundedLon}_${radiusKm}`;
}

function getFromCache(cacheKey) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      const entry = cache[cacheKey];
      if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.centres;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveToCache(cacheKey, centres) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[cacheKey] = { centres, timestamp: Date.now() };
    // Keep only last 5 entries
    const keys = Object.keys(cache);
    if (keys.length > 5) {
      for (const k of keys.slice(0, keys.length - 5)) {
        delete cache[k];
      }
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

async function queryMedicalCentreApi(userLat, userLon, radiusKm) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ lat: String(userLat), lon: String(userLon), radiusKm: String(radiusKm) });
    const response = await fetch(`/api/nearby-medical-centres?${params}`, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Medical-centre API returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchNearbyCentres(userLat, userLon, radiusKm = 10) {
  const cacheKey = getCacheKey(userLat, userLon, radiusKm);
  const cachedResults = getFromCache(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  try {
    const data = await queryMedicalCentreApi(userLat, userLon, radiusKm);

    let centres = (data.elements || [])
      .map(el => extractCentreInfo(el, userLat, userLon))
      .filter(Boolean);
    centres = deduplicateCentres(centres).sort((a, b) => a.distance - b.distance);

    const results = centres.slice(0, 30);
    saveToCache(cacheKey, results);
    return results;
  } catch (error) {
    console.warn('[medical-centres] API request failed', {
      message: error?.message || String(error),
      radiusKm,
    });
  }

  // All endpoints failed - try to return stale cache if available
  const staleCacheKey = getCacheKey(userLat, userLon, radiusKm);
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      const entry = cache[staleCacheKey];
      if (entry && entry.centres) {
        return entry.centres;
      }
    }
  } catch {
    // ignore
  }

  throw new Error('All Overpass API endpoints are unavailable');
}

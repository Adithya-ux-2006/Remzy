const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const CACHE_KEY = 'clotsolid_overpass_cache';
const CACHE_TTL = 1800000; // 30 minutes
const REQUEST_TIMEOUT_MS = 7000;
const FALLBACK_DELAY_MS = 350;

function buildOverpassQuery(lat, lon, radiusMeters) {
  return `
    [out:json][timeout:7];
    (
      nwr["amenity"~"^(hospital|clinic|doctors)$"](around:${radiusMeters},${lat},${lon});
      nwr["healthcare"~"^(hospital|clinic|doctor|diagnostics|laboratory)$"](around:${radiusMeters},${lat},${lon});
    );
    out center body;
  `;
}

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

async function queryOverpassEndpoint(endpoint, query, externalSignal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromParent = () => controller.abort();
  externalSignal?.addEventListener('abort', abortFromParent, { once: true });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortFromParent);
  }
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Request cancelled', 'AbortError'));
    }, { once: true });
  });
}

export async function searchNearbyCentres(userLat, userLon, radiusKm = 10) {
  const cacheKey = getCacheKey(userLat, userLon, radiusKm);
  const cachedResults = getFromCache(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  const radiusMeters = radiusKm * 1000;
  const query = buildOverpassQuery(userLat, userLon, radiusMeters);

  const searchController = new AbortController();

  try {
    // Start the fallback shortly after the primary instead of waiting for a full
    // timeout. Promise.any returns the first successful response.
    const data = await Promise.any(OVERPASS_ENDPOINTS.map((endpoint, index) => (async () => {
      if (index) await delay(FALLBACK_DELAY_MS * index, searchController.signal);
      return queryOverpassEndpoint(endpoint, query, searchController.signal);
    })()));
    searchController.abort();

    let centres = (data.elements || [])
      .map(el => extractCentreInfo(el, userLat, userLon))
      .filter(Boolean);
    centres = deduplicateCentres(centres).sort((a, b) => a.distance - b.distance);

    const results = centres.slice(0, 30);
    saveToCache(cacheKey, results);
    return results;
  } catch (error) {
    searchController.abort();
    console.warn('[medical-centres] Overpass endpoints failed', {
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

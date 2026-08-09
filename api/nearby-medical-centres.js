import { applySecurity, json } from './middleware.js';

const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const PROVIDER_TIMEOUT_MS = 10000;
const FALLBACK_DELAY_MS = 300;

function validCoordinate(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function buildQuery(lat, lon, radiusMeters) {
  const latitudeDelta = radiusMeters / 111320;
  const longitudeDelta = radiusMeters / (111320 * Math.max(0.2, Math.cos(lat * Math.PI / 180)));
  const bounds = [lat - latitudeDelta, lon - longitudeDelta, lat + latitudeDelta, lon + longitudeDelta]
    .map((value) => value.toFixed(5)).join(',');
  return `[out:json][timeout:9];(nwr["amenity"~"^(hospital|clinic|doctors)$"]["name"](${bounds});nwr["healthcare"~"^(hospital|clinic|doctor|diagnostics|laboratory)$"]["name"](${bounds}););out center;`;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestElements(elements, lat, lon, radiusKm) {
  return elements.map((element) => {
    const elementLat = element.lat ?? element.center?.lat;
    const elementLon = element.lon ?? element.center?.lon;
    if (!Number.isFinite(elementLat) || !Number.isFinite(elementLon) || !element.tags?.name) return null;
    return { element, distance: distanceKm(lat, lon, elementLat, elementLon) };
  }).filter((item) => item && item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 100)
    .map((item) => item.element);
}

function delayed(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryProvider(endpoint, query, delayMs = 0) {
  if (delayMs) await delayed(delayMs);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Remzy-Medical-Centre-Finder/1.0',
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.elements)) throw new Error('Provider returned invalid data');
    return payload.elements;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  const security = applySecurity(req, res);
  if (security.handled) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' });

  const lat = validCoordinate(req.query.lat, -90, 90);
  const lon = validCoordinate(req.query.lon, -180, 180);
  const requestedRadius = Number(req.query.radiusKm ?? 10);
  const radiusKm = [5, 10, 25].includes(requestedRadius) ? requestedRadius : null;
  if (lat === null || lon === null || radiusKm === null) {
    return json(res, 400, { error: 'Valid coordinates and radius are required.' });
  }

  const query = buildQuery(lat, lon, radiusKm * 1000);
  const startedAt = Date.now();
  try {
    const providerElements = await Promise.any(OVERPASS_ENDPOINTS.map((endpoint, index) =>
      queryProvider(endpoint, query, index * FALLBACK_DELAY_MS)
    ));
    const elements = nearestElements(providerElements, lat, lon, radiusKm);
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    console.log('[nearby-medical-centres] success', { radiusKm, elements: elements.length, durationMs: Date.now() - startedAt });
    return json(res, 200, { elements });
  } catch (error) {
    console.error('[nearby-medical-centres] providers failed', {
      radiusKm,
      durationMs: Date.now() - startedAt,
      errors: error?.errors?.map((item) => item?.message || String(item)) || [error?.message || String(error)],
    });
    return json(res, 503, { error: 'Medical-centre data is temporarily unavailable.' });
  }
}

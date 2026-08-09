import { applySecurity, buildResponse } from './_middleware.js';
import { lookupNearbyMedicalCentres, parseMedicalCentreParams } from '../../server/medicalCentreLookup.js';

export async function handler(event) {
  const security = applySecurity(event);
  if (security) return security;
  if (event.httpMethod !== 'GET') return buildResponse(405, { error: 'Method not allowed.' });

  const params = parseMedicalCentreParams(event.queryStringParameters || {});
  if (!params) return buildResponse(400, { error: 'Valid coordinates and radius are required.' });

  try {
    const result = await lookupNearbyMedicalCentres(params);
    console.log('[nearby-medical-centres] success', { radiusKm: params.radiusKm, elements: result.elements.length, durationMs: result.durationMs });
    return buildResponse(200, { elements: result.elements }, {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
    });
  } catch (error) {
    console.error('[nearby-medical-centres] providers failed', { radiusKm: params.radiusKm, durationMs: error.durationMs, errors: error.providerErrors });
    return buildResponse(503, { error: 'Medical-centre data is temporarily unavailable.' });
  }
}

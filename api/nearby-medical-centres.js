import { applySecurity, json } from './middleware.js';
import { lookupNearbyMedicalCentres, parseMedicalCentreParams } from '../server/medicalCentreLookup.js';

export default async function handler(req, res) {
  const security = applySecurity(req, res);
  if (security.handled) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' });

  const params = parseMedicalCentreParams(req.query);
  if (!params) return json(res, 400, { error: 'Valid coordinates and radius are required.' });

  try {
    const result = await lookupNearbyMedicalCentres(params);
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    console.log('[nearby-medical-centres] success', { radiusKm: params.radiusKm, elements: result.elements.length, durationMs: result.durationMs });
    return json(res, 200, { elements: result.elements });
  } catch (error) {
    console.error('[nearby-medical-centres] providers failed', { radiusKm: params.radiusKm, durationMs: error.durationMs, errors: error.providerErrors });
    return json(res, 503, { error: 'Medical-centre data is temporarily unavailable.' });
  }
}

// ─── Rate Limiting (in-memory token bucket per IP) ──────────────────────────
const rateLimitBuckets = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_AI_MAX = 5;

function getClientIp(event) {
  const forwarded = event.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return event.requestContext?.http?.sourceIp || 'unknown';
}

function getRateLimitBucket(key, max) {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(key);

  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    bucket = { windowStart: now, count: 0, max };
    rateLimitBuckets.set(key, bucket);
  }

  return bucket;
}

/**
 * Apply rate limiting. Returns null on success, or a response object on limit exceeded.
 */
export function applyRateLimit(event, { max = RATE_LIMIT_MAX } = {}) {
  const ip = getClientIp(event);
  const bucket = getRateLimitBucket(ip, max);

  bucket.count += 1;
  const resetAt = bucket.windowStart + RATE_LIMIT_WINDOW_MS;

  if (bucket.count > max) {
    return buildResponse(429, { error: 'Too many requests. Please try again later.' }, {
      'X-RateLimit-Limit': String(max),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    });
  }

  return null;
}

/**
 * Apply rate limit specifically for AI-heavy endpoints (stricter).
 */
export function applyAIRateLimit(event) {
  return applyRateLimit(event, { max: RATE_LIMIT_AI_MAX });
}

// ─── CORS ────────────────────────────────────────────────────────────────────
const DEFAULT_ORIGINS = [
  'https://cura-health.vercel.app',
  'https://cura-health-git-main.vercel.app',
  'https://cura-health.netlify.app',
  'https://remzyy.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
];
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : DEFAULT_ORIGINS;

/**
 * Returns CORS headers for the given origin.
 */
export function getCORSHeaders(event) {
  const origin = event.headers.origin || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || /^https?:\/\/localhost(:\d+)?$/.test(origin);

  const headers = {};
  if (isAllowed) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  headers['Access-Control-Max-Age'] = '86400';

  return headers;
}

// ─── Security Headers ────────────────────────────────────────────────────────
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  };
}

// ─── Response Builder ────────────────────────────────────────────────────────
export function buildResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

// ─── Input Sanitization ──────────────────────────────────────────────────────
export function sanitizeInput(str, { maxLength = 2000 } = {}) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    // Remove control characters (keep newlines for readability)
    // eslint-disable-next-line no-control-regex -- intentional: sanitizing input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

export function isValidQuery(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.length < 1 || trimmed.length > 500) return false;
  const alphaRatio = (trimmed.replace(/[^a-zA-Z0-9]/g, '').length) / trimmed.length;
  return alphaRatio >= 0.3;
}

// ─── Combined Security Middleware ────────────────────────────────────────────
/**
 * Apply all security checks to a Netlify function event.
 * Returns a response object if the request should be rejected, null if ok.
 */
export function applySecurity(event, { ai = false } = {}) {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...getCORSHeaders(event),
        ...getSecurityHeaders(),
      },
      body: '',
    };
  }

  // Rate limiting
  const rateLimitResult = ai ? applyAIRateLimit(event) : applyRateLimit(event);
  if (rateLimitResult) return rateLimitResult;

  return null;
}

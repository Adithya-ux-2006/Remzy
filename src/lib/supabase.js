import { createClient } from '@supabase/supabase-js';

function cleanEnvValue(raw) {
  if (typeof raw !== 'string') return raw;
  // Strip surrounding single or double quotes that may have been accidentally
  // included when copy-pasting into a hosting dashboard.
  let v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

const supabaseUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting dashboard ' +
    '(Netlify → Site settings → Environment variables).'
  );
}

if (!/^https:\/\/.+\.supabase\.co\/?$/.test(supabaseUrl)) {
  throw new Error(
    `Invalid VITE_SUPABASE_URL: "${supabaseUrl}". ` +
    'Expected format: https://<project-ref>.supabase.co — ' +
    'check for stray quote characters, missing https://, or trailing whitespace ' +
    'in your hosting dashboard environment variables.'
  );
}

// Lazy singleton — client is only created on first access, not at import time.
let _client = null;

function getClient() {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// Proxy delegates property access to the lazily-initialized client.
// This preserves the existing `supabase.from(...)` API without breaking callers.
export const supabase = new Proxy({}, {
  get(_, prop) {
    return getClient()[prop];
  },
});

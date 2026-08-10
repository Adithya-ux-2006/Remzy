#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const values = { ...process.env };
try {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !values[match[1]]) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch {
  // CI may supply environment variables directly.
}

const publicKey = values.VITE_SUPABASE_ANON_KEY || values.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!values.VITE_SUPABASE_URL || !publicKey) {
  throw new Error('Public Supabase frontend credentials are required.');
}

const supabase = createClient(values.VITE_SUPABASE_URL, publicKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const [remedies, links, evidence] = await Promise.all([
  supabase.from('remedies').select('*', { count: 'exact', head: true }),
  supabase.from('remedy_symptoms').select('*', { count: 'exact', head: true }),
  supabase.from('approved_remedy_evidence').select('*', { count: 'exact', head: true }),
]);

for (const result of [remedies, links, evidence]) if (result.error) throw result.error;
if (remedies.count !== 117) throw new Error(`Expected 117 public remedies, received ${remedies.count}.`);

console.log(JSON.stringify({
  publicRemedies: remedies.count,
  publicSymptomLinks: links.count,
  publicApprovedEvidence: evidence.count,
}));

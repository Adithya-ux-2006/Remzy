import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const candidates = ['.env.local', '.env'];
  const values = {};

  for (const candidate of candidates) {
    const filePath = path.resolve(candidate);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) continue;
      values[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }

  return values;
}

const localEnv = loadLocalEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || localEnv.VITE_SUPABASE_URL;
const publicKey = process.env.VITE_SUPABASE_ANON_KEY || localEnv.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !publicKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
}

const callbackUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/callback`;
const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`, {
  headers: { apikey: publicKey },
});

if (!response.ok) {
  throw new Error(`Unable to read Supabase Auth settings (${response.status}).`);
}

const settings = await response.json();
const googleEnabled = Boolean(settings.external?.google);

console.log(`Supabase callback URL: ${callbackUrl}`);
console.log(`Google provider: ${googleEnabled ? 'enabled' : 'disabled'}`);
console.log('Required app redirects:');
console.log('  http://localhost:5173/auth/callback');
console.log('  https://remzy.netlify.app/auth/callback');

if (!googleEnabled) {
  console.error('Google authentication is not enabled in the linked Supabase project.');
  process.exitCode = 1;
} else {
  console.log('Google Auth configuration is ready for an end-to-end sign-in test.');
}

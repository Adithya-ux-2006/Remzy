#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.split('=');
  return [key, rest.length ? rest.join('=') : true];
}));
const write = args.has('--write');
const maxSymptoms = Number(args.get('--limit') || 50);
const perSource = Math.min(Number(args.get('--per-source') || 5), 20);
const output = resolve(String(args.get('--output') || 'reports/public-api-evidence-discovery.json'));
const registryPath = resolve(String(args.get('--registry') || '../public-apis/README.md'));

function loadEnv() {
  const values = { ...process.env };
  try {
    for (const line of readFileSync(resolve('.env'), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !values[match[1]]) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  } catch { /* CI may provide environment variables. */ }
  return values;
}

function requireRegistryApis(readme) {
  const required = ['Crossref Metadata Search', 'OpenAlex'];
  const missing = required.filter((name) => !readme.includes(`[${name}]`));
  if (missing.length) throw new Error(`Requested public-apis registry is missing: ${missing.join(', ')}`);
  return required;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RemzyEvidenceDiscovery/1.0 (metadata review queue)' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function yearOf(parts) {
  return Number(parts?.[0]?.[0]) || null;
}

async function searchCrossref(query) {
  const url = new URL('https://api.crossref.org/works');
  url.search = new URLSearchParams({
    'query.bibliographic': query,
    filter: 'type:journal-article',
    rows: String(perSource),
    select: 'DOI,title,container-title,published,URL,type',
  }).toString();
  const items = (await fetchJson(url)).message?.items || [];
  return items.filter((item) => item.DOI && item.title?.[0]).map((item) => ({
    source: 'Crossref', doi: item.DOI.toLowerCase(), title: item.title[0],
    journal: item['container-title']?.[0] || null,
    year: yearOf(item.published?.['date-parts']),
    url: `https://doi.org/${item.DOI}`,
    metadataOnly: true,
  }));
}

async function searchOpenAlex(query) {
  const url = new URL('https://api.openalex.org/works');
  url.search = new URLSearchParams({ search: query, 'per-page': String(perSource) }).toString();
  const items = (await fetchJson(url)).results || [];
  return items.filter((item) => item.doi && item.title).map((item) => ({
    source: 'OpenAlex', doi: item.doi.replace(/^https:\/\/doi\.org\//i, '').toLowerCase(),
    title: item.title, journal: item.primary_location?.source?.display_name || null,
    year: item.publication_year || null, url: item.doi,
    citedByCount: item.cited_by_count ?? null, workType: item.type || null, metadataOnly: true,
  }));
}

function mergeCandidates(candidates) {
  const merged = new Map();
  for (const candidate of candidates) {
    const key = `doi:${candidate.doi}`;
    const current = merged.get(key) || { ...candidate, sources: [] };
    current.sources = [...new Set([...current.sources, candidate.source])];
    current.citedByCount = Math.max(current.citedByCount || 0, candidate.citedByCount || 0) || null;
    merged.set(key, current);
  }
  return [...merged.values()].sort((a, b) => (b.sources.length - a.sources.length) || ((b.citedByCount || 0) - (a.citedByCount || 0)));
}

const STOP_WORDS = new Set(['and', 'for', 'from', 'with', 'the', 'based', 'treatment', 'therapy', 'practice']);
function meaningfulTokens(value) {
  return String(value || '').toLowerCase().match(/[a-z0-9]+/g)?.filter((token) => token.length > 2 && !STOP_WORDS.has(token)) || [];
}

function titleMatchesClaim(title, remedyName, symptomLabel) {
  const normalizedTitle = String(title || '').toLowerCase();
  const symptomTokens = meaningfulTokens(symptomLabel);
  const symptomMatch = symptomTokens.some((token) => normalizedTitle.includes(token));
  if (!remedyName) return symptomMatch;
  const interventionTokens = meaningfulTokens(remedyName)
    .filter((token) => !symptomTokens.some((symptomToken) => token.includes(symptomToken) || symptomToken.includes(token)));
  const remedyMatch = interventionTokens.length > 0
    && interventionTokens.some((token) => normalizedTitle.includes(token));
  return symptomMatch && remedyMatch;
}

const env = loadEnv();
if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}
const registryApis = requireRegistryApis(readFileSync(registryPath, 'utf8'));
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const [
  { data: symptoms, error: symptomError },
  { data: mappings, error: mappingError },
  { data: remedies, error: remedyError },
] = await Promise.all([
  supabase.from('symptoms').select('id,label'),
  supabase.from('remedy_symptoms').select('symptom_id,remedy_id'),
  supabase.from('remedies').select('id,name'),
]);
if (symptomError) throw symptomError;
if (mappingError) throw mappingError;
if (remedyError) throw remedyError;

const mappingsBySymptom = new Map();
const remedyNames = new Map((remedies || []).map((remedy) => [remedy.id, remedy.name]));
for (const mapping of mappings || []) {
  const list = mappingsBySymptom.get(mapping.symptom_id) || [];
  list.push({ id: mapping.remedy_id, name: remedyNames.get(mapping.remedy_id) || mapping.remedy_id });
  mappingsBySymptom.set(mapping.symptom_id, list);
}
const targets = (symptoms || [])
  .map((symptom) => ({ ...symptom, remedies: mappingsBySymptom.get(symptom.id) || [] }))
  .filter((symptom) => symptom.remedies.length < 5)
  .sort((a, b) => a.remedies.length - b.remedies.length || a.label.localeCompare(b.label))
  .slice(0, maxSymptoms);

const packets = [];
for (const symptom of targets) {
  const searches = symptom.remedies.length
    ? symptom.remedies.map((remedy) => ({ remedy, query: `"${remedy.name}" "${symptom.label}" treatment` }))
    : [{ remedy: null, query: `"${symptom.label}" treatment systematic review clinical trial` }];
  const claims = [];
  for (const search of searches) {
    const settled = await Promise.allSettled([searchCrossref(search.query), searchOpenAlex(search.query)]);
    const candidates = mergeCandidates(settled
      .flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      .filter((candidate) => titleMatchesClaim(candidate.title, search.remedy?.name, symptom.label)));
    claims.push({
      remedy: search.remedy,
      query: search.query,
      candidates,
      sourceErrors: settled.flatMap((result, index) => result.status === 'rejected' ? [{ source: registryApis[index], message: result.reason?.message }] : []),
    });
  }
  packets.push({ symptom: { id: symptom.id, label: symptom.label }, currentRemedyCount: symptom.remedies.length, claims });
  process.stdout.write(`Discovered ${symptom.id} (${symptom.remedies.length} remedies)\n`);
}

if (write) {
  let publications = 0;
  let links = 0;
  const touchedClaimIds = new Set();
  for (const packet of packets) {
    for (const claim of packet.claims) {
      if (!claim.remedy) continue; // Symptom-only results require intervention extraction and human review first.
      const claimId = `${claim.remedy.id}__${packet.symptom.id}`;
      const { data: existingClaim, error: existingClaimError } = await supabase
        .from('evidence_claims').select('review_status').eq('id', claimId).maybeSingle();
      if (existingClaimError) throw existingClaimError;
      if (existingClaim?.review_status === 'approved') {
        console.log(`Skipped approved claim ${claimId}; discovery cannot downgrade clinical approval.`);
        continue;
      }
      touchedClaimIds.add(claimId);
      const { error: claimError } = await supabase.from('evidence_claims').upsert({
        id: claimId, remedy_id: claim.remedy.id, symptom_id: packet.symptom.id,
        claim_text: `${claim.remedy.name} for ${packet.symptom.label}`,
        population: { diagnosis: packet.symptom.label, ageGroup: 'requires review', sex: 'requires review' },
        intervention: { name: claim.remedy.name, dose: 'requires review', duration: 'requires review' },
        comparators: ['requires review'], outcomes: ['requires review'], certainty: 'unrated',
        recommendation_status: 'pending-review', review_status: 'needs-review', safety_reviewed: false,
        limitations: ['Automated multi-index metadata discovery; abstract/full text and claim applicability require human clinical review.'],
      }, { onConflict: 'remedy_id,symptom_id' });
      if (claimError) throw claimError;
      for (const candidate of claim.candidates) {
        const { data: publication, error: publicationError } = await supabase.from('evidence_publications').upsert({
          canonical_key: `doi:${candidate.doi}`, doi: candidate.doi, title: candidate.title,
          journal: candidate.journal, publication_year: candidate.year,
          canonical_url: `https://doi.org/${candidate.doi}`, source_database: candidate.sources.join(' + '),
          source_organization: 'Crossref/OpenAlex indexed publisher metadata', evidence_type: 'other',
          verification_status: 'discovery', metadata: {
            discoveredBy: 'public-api-evidence-discovery', registry: 'public-apis/public-apis',
            corroboratingIndexes: candidate.sources, citedByCount: candidate.citedByCount,
            warning: 'Metadata match only; not evidence approval or proof of efficacy.',
          },
        }, { onConflict: 'canonical_key' }).select('id').single();
        if (publicationError) throw publicationError;
        publications++;
        const { error: linkError } = await supabase.from('evidence_claim_publications').upsert({
          claim_id: claimId, publication_id: publication.id, overall_applicability: 'unassessed',
          included: false, review_note: 'Automated metadata discovery; PICO, abstract/full text, safety, and risk-of-bias review required.',
        }, { onConflict: 'claim_id,publication_id' });
        if (linkError) throw linkError;
        links++;
      }
    }
  }
  console.log(`Queued ${publications} publication upserts and ${links} excluded claim links for review.`);
  const claimIds = [...touchedClaimIds];
  const [{ data: verifiedClaims, error: verifyClaimError }, { data: verifiedLinks, error: verifyLinkError }] = await Promise.all([
    supabase.from('evidence_claims').select('id,review_status,safety_reviewed').in('id', claimIds),
    supabase.from('evidence_claim_publications').select('claim_id,included,overall_applicability').in('claim_id', claimIds),
  ]);
  if (verifyClaimError) throw verifyClaimError;
  if (verifyLinkError) throw verifyLinkError;
  const unsafeClaim = (verifiedClaims || []).find((claim) => claim.review_status !== 'needs-review' || claim.safety_reviewed !== false);
  const publicLink = (verifiedLinks || []).find((link) => link.included !== false || link.overall_applicability !== 'unassessed');
  if (unsafeClaim || publicLink) throw new Error('Post-write safeguard verification failed.');
  console.log(`Verified ${verifiedClaims.length} needs-review claims and ${verifiedLinks.length} non-public links in Supabase.`);
}

const report = {
  generatedAt: new Date().toISOString(), registryPath, registryApis,
  mode: write ? 'write-needs-review' : 'dry-run', threshold: 5,
  targetSymptomCount: targets.length, packets,
  safeguards: ['No remedies created', 'No claims approved', 'All links excluded from the public approved-evidence view'],
};
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Report written to ${output}`);

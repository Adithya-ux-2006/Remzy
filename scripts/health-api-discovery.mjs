#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.split('=');
  return [key, rest.length ? rest.join('=') : true];
}));
const write = args.has('--write');
const maxSymptoms = Number(args.get('--limit') || 30);
const output = resolve(String(args.get('--output') || 'reports/health-api-discovery.json'));

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

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RemzyHealthDiscovery/1.0', ...headers },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

const STOP_WORDS = new Set(['and', 'for', 'from', 'with', 'the', 'based', 'treatment', 'therapy', 'practice', 'systematic', 'review']);
function meaningfulTokens(value) {
  return String(value || '').toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => t.length > 2 && !STOP_WORDS.has(t)) || [];
}

function titleMatchesClaim(title, remedyName, symptomLabel) {
  const normalizedTitle = String(title || '').toLowerCase();
  const symptomTokens = meaningfulTokens(symptomLabel);
  const symptomMatch = symptomTokens.some((token) => normalizedTitle.includes(token));
  if (!remedyName) return symptomMatch;
  const remedyTokens = meaningfulTokens(remedyName)
    .filter((t) => !symptomTokens.some((s) => t.includes(s) || s.includes(t)));
  const remedyMatch = remedyTokens.length > 0 && remedyTokens.some((t) => normalizedTitle.includes(t));
  return symptomMatch && remedyMatch;
}

// --- ClinicalTrials.gov API v2 ---
async function searchClinicalTrials(query) {
  const url = new URL('https://clinicaltrials.gov/api/v2/studies');
  url.search = new URLSearchParams({
    query: query,
    'filter.overallStatus': 'COMPLETED,RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION',
    pageSize: '10',
    fields: 'NCTId,BriefTitle,OverallStatus,Phase,StartDate,Condition,InterventionName,LeadSponsorName',
  }).toString();
  try {
    const data = await fetchJson(url);
    return (data.studies || []).map((study) => ({
      source: 'ClinicalTrials.gov',
      nctId: study.protocolSection?.identificationModule?.nctId,
      title: study.protocolSection?.identificationModule?.briefTitle,
      status: study.protocolSection?.statusModule?.overallStatus,
      phase: study.protocolSection?.designModule?.phases?.join(', ') || 'N/A',
      startDate: study.protocolSection?.statusModule?.startDateStruct?.date,
      condition: study.protocolSection?.conditionsModule?.conditions?.join('; '),
      intervention: study.protocolSection?.armsInterventionsModule?.interventions?.map((i) => i.name)?.join(', '),
      sponsor: study.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name,
      url: `https://clinicaltrials.gov/study/${study.protocolSection?.identificationModule?.nctId}`,
    })).filter((s) => s.nctId && s.title);
  } catch (err) {
    console.warn(`  [ClinicalTrials] Error for "${query}": ${err.message}`);
    return [];
  }
}

// --- openFDA (drug labels) ---
async function searchOpenFda(remedyName) {
  if (!remedyName) return [];
  const url = new URL('https://api.fda.gov/drug/label.json');
  url.search = new URLSearchParams({
    search: `openfda.brand_name:"${remedyName}"+OR+openfda.generic_name:"${remedyName}"`,
    limit: '5',
  }).toString();
  try {
    const data = await fetchJson(url);
    return (data.results || []).map((drug) => ({
      source: 'openFDA',
      brandName: drug.openfda?.brand_name?.[0] || remedyName,
      genericName: drug.openfda?.generic_name?.[0] || null,
      route: drug.openfda?.route?.[0] || null,
      warnings: drug.warnings?.[0] || null,
      drugInteractions: drug.drug_interactions?.[0] || null,
      contraindications: drug.contraindications?.[0] || null,
      purpose: drug.purpose?.[0] || null,
      manufacturer: drug.openfda?.manufacturer_name?.[0] || null,
      url: `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(remedyName)}"`,
    }));
  } catch (err) {
    // openFDA returns 404 for no results, which is expected
    if (err.message.includes('404')) return [];
    console.warn(`  [openFDA] Error for "${remedyName}": ${err.message}`);
    return [];
  }
}

const env = loadEnv();
if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}
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
const remedyNames = new Map((remedies || []).map((r) => [r.id, r.name]));
for (const m of mappings || []) {
  const list = mappingsBySymptom.get(m.symptom_id) || [];
  list.push({ id: m.remedy_id, name: remedyNames.get(m.remedy_id) || m.remedy_id });
  mappingsBySymptom.set(m.symptom_id, list);
}

const targets = (symptoms || [])
  .map((s) => ({ ...s, remedies: mappingsBySymptom.get(s.id) || [] }))
  .filter((s) => s.remedies.length < 5)
  .sort((a, b) => a.remedies.length - b.remedies.length || a.label.localeCompare(b.label))
  .slice(0, maxSymptoms);

console.log(`Found ${targets.length} undercovered symptoms (< 5 remedies)`);
console.log(`Mode: ${write ? 'WRITE (will upsert to Supabase)' : 'DRY RUN (no changes)'}`);
console.log('---');

const packets = [];

for (const symptom of targets) {
  const searches = symptom.remedies.length
    ? symptom.remedies.map((r) => ({ remedy: r, query: `${r.name} ${symptom.label}` }))
    : [{ remedy: null, query: symptom.label }];

  const packet = {
    symptom: { id: symptom.id, label: symptom.label },
    currentRemedyCount: symptom.remedies.length,
    clinicalTrials: [],
    fdaData: [],
    errors: [],
  };

  for (const search of searches) {
    // Query ClinicalTrials.gov
    const trials = await searchClinicalTrials(search.query);
    const matchingTrials = trials.filter((t) => titleMatchesClaim(t.title, search.remedy?.name, symptom.label));
    packet.clinicalTrials.push(...matchingTrials.map((t) => ({
      ...t,
      matchedRemedy: search.remedy?.name || null,
      matchedRemedyId: search.remedy?.id || null,
    })));

    // Query openFDA (only for named remedies)
    if (search.remedy) {
      const fdaResults = await searchOpenFda(search.remedy.name);
      packet.fdaData.push(...fdaResults.map((f) => ({
        ...f,
        matchedRemedy: search.remedy.name,
        matchedRemedyId: search.remedy.id,
      })));
    }

    // Rate limit: ClinicalTrials.gov asks for no more than 1 req/sec
    await new Promise((r) => setTimeout(r, 1100));
  }

  // Deduplicate trials by NCT ID
  const seenNct = new Set();
  packet.clinicalTrials = packet.clinicalTrials.filter((t) => {
    if (seenNct.has(t.nctId)) return false;
    seenNct.add(t.nctId);
    return true;
  });

  // Deduplicate FDA by brand name + matched remedy
  const seenFda = new Set();
  packet.fdaData = packet.fdaData.filter((f) => {
    const key = `${f.brandName}__${f.matchedRemedyId}`;
    if (seenFda.has(key)) return false;
    seenFda.add(key);
    return true;
  });

  packets.push(packet);
  process.stdout.write(`  ${symptom.id} (${symptom.remedies.length} remedies): ${packet.clinicalTrials.length} trials, ${packet.fdaData.length} FDA records\n`);
}

// --- Write to Supabase ---
if (write) {
  let trialUpserts = 0;
  let fdaUpserts = 0;

  for (const packet of packets) {
    for (const trial of packet.clinicalTrials) {
      if (!trial.matchedRemedyId) continue;
      const claimId = `${trial.matchedRemedyId}__${packet.symptom.id}`;

      // Ensure evidence claim exists (needs-review gate)
      const { data: existing } = await supabase
        .from('evidence_claims').select('review_status').eq('id', claimId).maybeSingle();
      if (existing?.review_status === 'approved') continue;

      await supabase.from('evidence_claims').upsert({
        id: claimId,
        remedy_id: trial.matchedRemedyId,
        symptom_id: packet.symptom.id,
        claim_text: `${trial.matchedRemedy} for ${packet.symptom.label} (ClinicalTrials.gov discovery)`,
        population: { diagnosis: packet.symptom.label, ageGroup: 'unspecified', sex: 'unspecified' },
        intervention: { name: trial.matchedRemedy, dose: 'unspecified', duration: 'unspecified' },
        recommendation_status: 'pending-review',
        review_status: 'needs-review',
        safety_reviewed: false,
        limitations: ['Automated ClinicalTrials.gov discovery; claim applicability requires human review.'],
      }, { onConflict: 'remedy_id,symptom_id' });

      // Upsert publication
      const pubKey = `nct:${trial.nctId}`;
      const { data: pub } = await supabase.from('evidence_publications').upsert({
        canonical_key: pubKey,
        title: trial.title,
        journal: 'ClinicalTrials.gov',
        publication_year: trial.startDate ? new Date(trial.startDate).getFullYear() : null,
        canonical_url: trial.url,
        source_database: 'ClinicalTrials.gov',
        source_organization: 'National Library of Medicine',
        evidence_type: 'non-randomized-study',
        verification_status: 'metadata-verified',
        metadata: {
          discoveredBy: 'health-api-discovery',
          nctId: trial.nctId,
          status: trial.status,
          phase: trial.phase,
          sponsor: trial.sponsor,
          intervention: trial.intervention,
        },
      }, { onConflict: 'canonical_key' }).select('id').single();

      if (pub) {
        await supabase.from('evidence_claim_publications').upsert({
          claim_id: claimId,
          publication_id: pub.id,
          overall_applicability: 'unassessed',
          included: false,
          review_note: 'Automated ClinicalTrials.gov discovery; review required.',
        }, { onConflict: 'claim_id,publication_id' });
        trialUpserts++;
      }
    }

    // Write FDA data as research_papers (simpler, existing table)
    for (const fda of packet.fdaData) {
      if (!fda.matchedRemedyId) continue;
      const { error: paperError } = await supabase.from('research_papers').upsert({
        remedy_id: fda.matchedRemedyId,
        title: `FDA Drug Label: ${fda.brandName}${fda.genericName ? ` (${fda.genericName})` : ''}`,
        journal: 'openFDA',
        url: fda.url,
        key_findings: [
          fda.warnings ? `Warnings: ${fda.warnings.slice(0, 500)}` : null,
          fda.drugInteractions ? `Drug Interactions: ${fda.drugInteractions.slice(0, 500)}` : null,
          fda.contraindications ? `Contraindications: ${fda.contraindications.slice(0, 500)}` : null,
        ].filter(Boolean).join('\n') || 'FDA label data available.',
        published_year: null,
      }, { onConflict: 'remedy_id,url' });
      if (!paperError) fdaUpserts++;
    }
  }

  console.log(`\nWrote ${trialUpserts} clinical trial publication links and ${fdaUpserts} FDA label records.`);
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: write ? 'write' : 'dry-run',
  threshold: 5,
  targetSymptomCount: targets.length,
  packets: packets.map((p) => ({
    symptom: p.symptom,
    currentRemedyCount: p.currentRemedyCount,
    clinicalTrialCount: p.clinicalTrials.length,
    fdaDataCount: p.fdaData.length,
    clinicalTrials: p.clinicalTrials,
    fdaData: p.fdaData,
  })),
  safeguards: ['No claims auto-approved', 'All clinical trial links marked included=false', 'FDA data written to research_papers for display only'],
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Report written to ${output}`);

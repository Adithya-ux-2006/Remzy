#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { REMEDIES } from '../src/data/remedies.js';
import { LOCAL_REMEDIES } from '../src/data/localCatalog.js';
import { applyLegacyBatch1 } from '../src/data/legacyRemedyBatch1.js';
import { applyLegacyBatch2 } from '../src/data/legacyRemedyBatch2.js';
import { applyLegacyBatch3 } from '../src/data/legacyRemedyBatch3.js';
import { applyLegacyBatch4 } from '../src/data/legacyRemedyBatch4.js';
import { applyLegacyBatch5 } from '../src/data/legacyRemedyBatch5.js';
import { applyLegacyEvidenceTierOverlay } from '../src/data/legacyEvidenceTierOverlay.js';
import { applyMultiSourceRemedyBatch1 } from '../src/data/multiSourceRemedyBatch1.js';
import { filterEvidenceReviewedRemedies } from '../src/data/evidenceReview.js';
import { normalizeEvidenceSource } from '../src/utils/evidenceSources.js';
import { applyGeneratedEvidenceMetadata } from '../src/data/generatedEvidenceMetadata.js';

function loadEnv() {
  const values = { ...process.env };
  try {
    for (const line of readFileSync(resolve('.env'), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !values[match[1]]) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // Environment variables may be supplied by CI instead.
  }
  return values;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  return { dryRun };
}

function runtimeRemedies() {
  const legacy = applyLegacyEvidenceTierOverlay(applyLegacyBatch5(applyLegacyBatch4(applyLegacyBatch3(applyLegacyBatch2(applyLegacyBatch1(LOCAL_REMEDIES))))));
  return filterEvidenceReviewedRemedies(
    applyMultiSourceRemedyBatch1([...REMEDIES, ...legacy])
      .filter((remedy, index, all) => all.findIndex((candidate) => candidate.id === remedy.id) === index)
  );
}

function symptomIdsOf(remedy) {
  return [...new Set([...(remedy.primarySymptoms || []), ...(remedy.symptoms || [])])];
}

function publicationKey(source) {
  const url = String(source.url || '').trim();
  const pmid = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i)?.[1];
  if (pmid) return { canonicalKey: `pmid:${pmid}`, pmid, doi: null };
  const doi = url.match(/doi\.org\/(10\.\d{4,9}\/\S+)/i)?.[1];
  if (doi) return { canonicalKey: `doi:${doi.toLowerCase()}`, pmid: null, doi };
  return { canonicalKey: `url:${url.replace(/\/$/, '').toLowerCase()}`, pmid: null, doi: null };
}

function evidenceType(source) {
  const value = String(source.evidenceType || '').toLowerCase();
  if (value.includes('guideline') || value.includes('guidance') || value.includes('evidence-summary')) return 'guideline';
  if (value.includes('meta-analysis')) return 'meta-analysis';
  if (value.includes('systematic-review')) return 'systematic-review';
  if (value.includes('randomized') || value.includes('randomised')) return 'randomized-trial';
  if (value.includes('trial')) return 'non-randomized-study';
  return 'other';
}

const { dryRun } = parseArgs();

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

async function main() {
  const [remedyResult, symptomResult, legacyPaperResult] = await Promise.all([
    supabase.from('remedies').select('id'),
    supabase.from('symptoms').select('id'),
    supabase.from('research_papers').select('*'),
  ]);
  for (const result of [remedyResult, symptomResult, legacyPaperResult]) if (result.error) throw result.error;

  const remedyIds = new Set(remedyResult.data.map((row) => row.id));
  const symptomIds = new Set(symptomResult.data.map((row) => row.id));
  const runtime = runtimeRemedies().filter((remedy) => remedyIds.has(remedy.id));
  const runtimeById = new Map(runtime.map((remedy) => [remedy.id, remedy]));

  const claims = runtime.flatMap((remedy) => symptomIdsOf(remedy)
    .filter((symptomId) => symptomIds.has(symptomId))
    .map((symptomId) => ({
      id: `${remedy.id}__${symptomId}`,
      remedy_id: remedy.id,
      symptom_id: symptomId,
      claim_text: remedy.shortDescription || remedy.longDescription || remedy.name,
      population: { diagnosis: symptomId.replaceAll('_', ' '), ageGroup: 'requires review', sex: 'requires review' },
      intervention: { name: remedy.name, formulation: remedy.ingredients || [], dose: 'requires review', duration: 'requires review' },
      comparators: ['requires review'],
      outcomes: ['requires review'],
      certainty: 'unrated',
      recommendation_status: 'pending-review',
      review_status: 'needs-review',
      safety_reviewed: false,
      limitations: ['Imported as discovery metadata; semantic and clinical review not completed.'],
    }))
  );

  if (claims.length) {
    if (dryRun) {
      console.log(`[DRY-RUN] Would upsert ${claims.length} claims to evidence_claims, onConflict: remedy_id,symptom_id`);
    } else {
      const { error } = await supabase.from('evidence_claims').upsert(claims, { onConflict: 'remedy_id,symptom_id' });
      if (error) throw error;
    }
  }

  const sourceRows = [];
  for (const remedy of runtime) {
    for (const raw of [...(remedy.researchPapers || []), ...(remedy.researchLinks || [])]) {
      if (!raw?.url) continue;
      const source = normalizeEvidenceSource(applyGeneratedEvidenceMetadata(raw));
      sourceRows.push({ remedyId: remedy.id, source });
    }
  }
  for (const paper of legacyPaperResult.data || []) {
    if (!paper.url || !remedyIds.has(paper.remedy_id)) continue;
    sourceRows.push({
      remedyId: paper.remedy_id,
      source: {
        url: paper.url, title: paper.title, journal: paper.journal,
        keyFinding: paper.key_findings, year: paper.published_year,
        sourceDatabase: 'Legacy research_papers', sourceOrganization: paper.journal || 'Requires verification',
        evidenceType: 'other', verificationStatus: 'source-identified',
      },
    });
  }

  const uniqueSources = new Map();
  for (const entry of sourceRows) {
    const key = publicationKey(entry.source).canonicalKey;
    const existing = uniqueSources.get(key) || { source: entry.source, remedyIds: new Set() };
    existing.remedyIds.add(entry.remedyId);
    uniqueSources.set(key, existing);
  }

  let linked = 0;
  for (const [canonicalKey, entry] of uniqueSources) {
    const source = entry.source;
    const identifiers = publicationKey(source);
    const publication = {
      canonical_key: canonicalKey,
      pmid: identifiers.pmid,
      doi: identifiers.doi,
      title: source.title || source.label || source.journal || 'Untitled evidence source',
      journal: source.journal || null,
      publication_year: Number(source.year || source.publishedYear) || null,
      canonical_url: source.url,
      source_database: source.sourceDatabase || null,
      source_organization: source.sourceOrganization || source.journal || 'Requires verification',
      publisher: source.publisher || null,
      evidence_type: evidenceType(source),
      verification_status: source.verificationStatus === 'bibliographic-verified' ? 'metadata-verified' : 'discovery',
      metadata: { importedFrom: 'repository-and-legacy-research-papers', keyFinding: source.keyFinding || null },
    };
    if (dryRun) {
      console.log(`[DRY-RUN] Would upsert publication ${canonicalKey} to evidence_publications, onConflict: canonical_key`);
      linked += entry.remedyIds.length;
      continue;
    }
    const { data, error } = await supabase
      .from('evidence_publications')
      .upsert(publication, { onConflict: 'canonical_key' })
      .select('id')
      .single();
    if (error) throw error;

    const linkRows = [];
    for (const remedyId of entry.remedyIds) {
      const remedy = runtimeById.get(remedyId);
      if (!remedy) continue;
      for (const symptomId of symptomIdsOf(remedy).filter((id) => symptomIds.has(id))) {
        linkRows.push({
          claim_id: `${remedyId}__${symptomId}`,
          publication_id: data.id,
          overall_applicability: 'unassessed',
          included: false,
          review_note: 'Imported for discovery only; not approved for public evidence display.',
        });
      }
    }
    if (linkRows.length) {
      const { error: linkError } = await supabase.from('evidence_claim_publications').upsert(linkRows, { onConflict: 'claim_id,publication_id' });
      if (linkError) throw linkError;
      linked += linkRows.length;
    }
  }

  console.log(`Evidence backend sync: ${claims.length} claims, ${uniqueSources.size} canonical publications, ${linked} discovery links.`);
  console.log('Approved claims created: 0. Imported records remain needs-review and excluded from the public view.');
}

main().catch(console.error);
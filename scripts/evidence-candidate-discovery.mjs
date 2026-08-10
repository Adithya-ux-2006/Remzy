#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
import { classifyEvidenceSource, EVIDENCE_SOURCE_POLICY } from '../src/utils/evidenceSources.js';

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.length ? value.join('=') : true];
}));
const limit = Math.max(1, Number(args.get('limit') || 25));
const perSource = Math.min(10, Math.max(1, Number(args.get('per-source') || 5)));
const output = resolve(String(args.get('output') || 'reports/evidence-review-batch-01.json'));
const noHttp = args.has('no-http');
const timeoutMs = 20_000;

const HIGH_RISK_SYMPTOMS = new Set([
  'asthma', 'uti', 'kidney_stone', 'testicular_pain', 'pelvic_pain', 'sleep_apnea',
  'neuropathy', 'palpitations', 'anemia', 'fever', 'allergic_reaction', 'edema',
]);

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

function claimPriority(remedy, symptomId) {
  let score = 0;
  if (HIGH_RISK_SYMPTOMS.has(symptomId)) score += 100;
  if (remedy.category === 'OTC') score += 40;
  if (remedy.childSafe) score += 20;
  if ((remedy.contraindications || []).length) score += 10;
  return score;
}

function interventionTerm(remedy) {
  return (remedy.ingredients?.[0] || remedy.name)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(?:for|during|with|acute|mild|supervised|clinician-guided)\b.*$/i, ' ')
    .replace(/[^a-z0-9 -]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function conditionTerm(symptomId) {
  return symptomId.replaceAll('_', ' ');
}

function existingSources(remedy) {
  return [...(remedy.researchPapers || []), ...(remedy.researchLinks || [])]
    .filter((source) => source?.url)
    .map((source) => {
      const sourceKind = classifyEvidenceSource(source.url);
      return {
        retrievalSource: 'existing-catalogue',
        url: source.url,
        title: source.title || source.label || source.journal || null,
        organization: source.sourceOrganization || EVIDENCE_SOURCE_POLICY[sourceKind]?.organization || null,
        evidenceType: source.evidenceType || null,
        semanticStatus: 'unassessed',
      };
    });
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'Remzy-Evidence-Discovery/1.0 (candidate retrieval; no auto-publication)' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function discoverPubMed(intervention, condition) {
  const term = `(${intervention}[Title/Abstract]) AND (${condition}[Title/Abstract]) AND (systematic review[Publication Type] OR meta-analysis[Publication Type] OR randomized controlled trial[Publication Type] OR practice guideline[Publication Type])`;
  const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  searchUrl.search = new URLSearchParams({ db: 'pubmed', retmode: 'json', retmax: String(perSource), sort: 'relevance', term }).toString();
  const ids = (await fetchJson(searchUrl)).esearchresult?.idlist || [];
  if (!ids.length) return [];
  const summaryUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
  summaryUrl.search = new URLSearchParams({ db: 'pubmed', retmode: 'json', id: ids.join(',') }).toString();
  const payload = await fetchJson(summaryUrl);
  return ids.map((pmid) => {
    const record = payload.result?.[pmid] || {};
    const doi = record.articleids?.find((id) => id.idtype === 'doi')?.value;
    return {
      retrievalSource: 'NCBI PubMed', publicationId: `pmid:${pmid}`, pmid, doi: doi || null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, title: record.title || null,
      journal: record.fulljournalname || record.source || null,
      year: String(record.pubdate || '').match(/\d{4}/)?.[0] || null,
      publicationTypes: record.pubtype || [], semanticStatus: 'unassessed',
    };
  });
}

async function discoverEuropePmc(intervention, condition) {
  const query = `TITLE_ABS:"${intervention}" AND TITLE_ABS:"${condition}" AND (PUB_TYPE:"systematic review" OR PUB_TYPE:"meta-analysis" OR PUB_TYPE:"randomized controlled trial" OR PUB_TYPE:"practice guideline")`;
  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  url.search = new URLSearchParams({ query, format: 'json', pageSize: String(perSource), resultType: 'core' }).toString();
  const records = (await fetchJson(url)).resultList?.result || [];
  return records.map((record) => ({
    retrievalSource: 'Europe PMC',
    publicationId: record.pmid ? `pmid:${record.pmid}` : record.doi ? `doi:${record.doi.toLowerCase()}` : `epmc:${record.id}`,
    pmid: record.pmid || null, doi: record.doi || null,
    url: record.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/` : `https://europepmc.org/article/${record.source}/${record.id}`,
    title: record.title || null, journal: record.journalTitle || null, year: record.pubYear || null,
    publicationTypes: record.pubTypeList?.pubType || [], abstract: record.abstractText || null,
    citedByCount: record.citedByCount ?? null, semanticStatus: 'unassessed',
  }));
}

function deduplicate(candidates) {
  const seen = new Map();
  for (const candidate of candidates) {
    const id = candidate.publicationId || candidate.doi && `doi:${candidate.doi.toLowerCase()}` || candidate.url.toLowerCase();
    const existing = seen.get(id);
    if (!existing) {
      seen.set(id, candidate);
      continue;
    }
    seen.set(id, {
      ...existing,
      ...Object.fromEntries(Object.entries(candidate).filter(([, value]) => value != null)),
      retrievalSource: [...new Set(`${existing.retrievalSource},${candidate.retrievalSource}`.split(','))].join(','),
    });
  }
  return [...seen.values()];
}

const claims = runtimeRemedies()
  .flatMap((remedy) => symptomIdsOf(remedy).map((symptomId) => ({ remedy, symptomId, priority: claimPriority(remedy, symptomId) })))
  .sort((a, b) => b.priority - a.priority || a.remedy.id.localeCompare(b.remedy.id) || a.symptomId.localeCompare(b.symptomId))
  .slice(0, limit);

const packets = [];
for (const { remedy, symptomId, priority } of claims) {
  const intervention = interventionTerm(remedy);
  const condition = conditionTerm(symptomId);
  let discovered = [];
  const retrievalErrors = [];
  if (!noHttp) {
    const results = await Promise.allSettled([
      discoverPubMed(intervention, condition),
      discoverEuropePmc(intervention, condition),
    ]);
    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') discovered.push(...result.value);
      else retrievalErrors.push(`${index === 0 ? 'PubMed' : 'Europe PMC'}: ${result.reason.message}`);
    }
  }
  packets.push({
    claimId: `${remedy.id}__${symptomId}`,
    priority,
    reviewStatus: 'needs-review',
    proposedClaim: remedy.shortDescription || remedy.longDescription || remedy.name,
    picoDraft: {
      population: { diagnosis: condition, ageGroup: remedy.childSafe ? 'requires age-specific review' : 'adult or unspecified', sex: 'requires review' },
      intervention: { name: intervention, formulation: remedy.ingredients?.join(', ') || 'requires review', dose: 'requires review', duration: 'requires review' },
      comparators: ['requires review'], outcomes: ['requires extraction from displayed claim and sources'],
    },
    safetyDraft: { warnings: remedy.warnings || [], contraindications: remedy.contraindications || [], status: 'needs-review' },
    searchStrategy: { intervention, condition, sources: ['NCBI PubMed', 'Europe PMC', 'existing guideline/public-health links'] },
    candidates: deduplicate([...existingSources(remedy), ...discovered]),
    retrievalErrors,
    reviewerChecklist: [
      'Confirm population, diagnosis, sex, age, and setting',
      'Confirm exact intervention, formulation, dose, duration, and co-interventions',
      'Confirm comparator and patient-important outcomes',
      'Extract effect estimate, uncertainty, adverse events, and limitations',
      'Assess risk of bias and applicability',
      'Reject duplicate indexes of the same publication',
      'Add independent guideline and safety sources where available',
    ],
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  status: 'CANDIDATES_ONLY_NOT_APPROVED_FOR_PUBLICATION',
  batchSize: packets.length,
  methodology: {
    sourcesQueried: noHttp ? [] : ['NCBI PubMed E-utilities', 'Europe PMC REST API'],
    existingTrustedSourcesIncluded: true,
    automaticApproval: false,
    note: 'Database indexes are discovery systems, not independent evidence-producing organizations.',
  },
  packets,
};
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Evidence discovery: wrote ${packets.length} needs-review packets to ${output}.`);
console.log(`Candidates found: ${packets.reduce((sum, packet) => sum + packet.candidates.length, 0)}; retrieval errors: ${packets.reduce((sum, packet) => sum + packet.retrievalErrors.length, 0)}.`);

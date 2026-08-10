#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
import { GENERATED_EVIDENCE_METADATA } from '../src/data/generatedEvidenceMetadata.js';

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');
const noHttp = args.has('--no-http');
const timeoutMs = 15_000;

const decodeHtml = (value = '') => value
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

function runtimeRemedies() {
  const legacy = applyLegacyEvidenceTierOverlay(applyLegacyBatch5(applyLegacyBatch4(applyLegacyBatch3(applyLegacyBatch2(applyLegacyBatch1(LOCAL_REMEDIES))))));
  return filterEvidenceReviewedRemedies(
    applyMultiSourceRemedyBatch1([...REMEDIES, ...legacy])
      .filter((remedy, index, all) => all.findIndex((candidate) => candidate.id === remedy.id) === index)
  );
}

function citationsOf(remedy) {
  return [
    ...(remedy.researchPapers || []),
    ...(remedy.researchLinks || []),
  ].filter((source) => source?.url).map((source) => ({ remedyId: remedy.id, remedyName: remedy.name, ...source }));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Remzy-Evidence-Pipeline/1.0', ...(options.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

function publicationType(types = []) {
  const joined = types.join(' ').toLowerCase();
  if (joined.includes('meta-analysis')) return 'meta-analysis';
  if (joined.includes('systematic review')) return 'systematic-review';
  if (joined.includes('randomized controlled trial')) return 'randomized-trial';
  if (joined.includes('clinical trial')) return 'clinical-trial';
  if (joined.includes('guideline')) return 'clinical-guideline';
  return 'journal-article';
}

async function pubmedMetadata(source) {
  const pmid = source.url.match(/\/(\d+)\/?$/)?.[1];
  if (!pmid) throw new Error('specific PMID required');
  const response = await fetchWithTimeout(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${pmid}`);
  if (!response.ok) throw new Error(`PubMed HTTP ${response.status}`);
  const payload = await response.json();
  const record = payload.result?.[pmid];
  if (!record?.title) throw new Error('PubMed record missing');
  return {
    title: decodeHtml(record.title.replace(/\.$/, '')),
    journal: record.fulljournalname || record.source || 'PubMed-indexed journal',
    year: String(record.pubdate || '').match(/\d{4}/)?.[0] || undefined,
    evidenceType: publicationType(record.pubtype || []),
    sourceDatabase: 'PubMed',
    sourceOrganization: EVIDENCE_SOURCE_POLICY.pubmed.organization,
    sourceKind: 'pubmed',
    verificationStatus: 'bibliographic-verified',
    externalId: pmid,
  };
}

async function europePmcMetadata(source) {
  const id = source.url.match(/\/article\/(?:MED|PMC)\/(\w+)/i)?.[1];
  if (!id) throw new Error('specific Europe PMC record required');
  const response = await fetchWithTimeout(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:${encodeURIComponent(id)}&format=json`);
  if (!response.ok) throw new Error(`Europe PMC HTTP ${response.status}`);
  const record = (await response.json()).resultList?.result?.[0];
  if (!record?.title) throw new Error('Europe PMC record missing');
  return {
    title: decodeHtml(record.title), journal: record.journalTitle || 'Europe PMC-indexed journal',
    year: record.pubYear, evidenceType: 'journal-article', sourceDatabase: 'Europe PMC',
    sourceOrganization: EVIDENCE_SOURCE_POLICY.europePmc.organization, sourceKind: 'europePmc',
    verificationStatus: 'bibliographic-verified', externalId: id,
  };
}

function htmlMetadata(html, finalUrl, sourceKind) {
  const meta = (name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'),
    ];
    return patterns.map((pattern) => html.match(pattern)?.[1]).find(Boolean);
  };
  const title = meta('og:title') || meta('citation_title') || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (!title) throw new Error('source page has no canonical title');
  const policy = EVIDENCE_SOURCE_POLICY[sourceKind];
  return {
    title: decodeHtml(title),
    sourceDatabase: policy.label,
    sourceOrganization: policy.organization,
    sourceKind,
    evidenceType: sourceKind === 'cochrane' ? 'systematic-review' : sourceKind === 'cdc' ? 'public-health-guidance' : sourceKind === 'doi' ? 'journal-article' : 'clinical-guidance',
    verificationStatus: 'bibliographic-verified',
    canonicalUrl: finalUrl,
  };
}

async function webpageMetadata(source, sourceKind) {
  const response = await fetchWithTimeout(source.url);
  if (!response.ok) {
    if (sourceKind === 'nice' && response.status === 403 && (source.title || source.label)) {
      return {
        title: source.title || source.label,
        sourceDatabase: EVIDENCE_SOURCE_POLICY.nice.label,
        sourceOrganization: EVIDENCE_SOURCE_POLICY.nice.organization,
        sourceKind,
        evidenceType: source.evidenceType || 'clinical-guidance',
        verificationStatus: 'manual-metadata-reviewed',
        canonicalUrl: source.url,
        verificationNote: 'NICE blocks automated metadata retrieval; title and applicability require manual review.',
      };
    }
    throw new Error(`${sourceKind} HTTP ${response.status}`);
  }
  const type = response.headers.get('content-type') || '';
  if (type.includes('application/pdf')) {
    return {
      title: source.title || source.label || source.journal,
      sourceDatabase: EVIDENCE_SOURCE_POLICY[sourceKind].label,
      sourceOrganization: EVIDENCE_SOURCE_POLICY[sourceKind].organization,
      sourceKind, evidenceType: 'clinical-guidance', verificationStatus: 'link-verified', canonicalUrl: response.url,
    };
  }
  return htmlMetadata(await response.text(), response.url, sourceKind);
}

async function metadataFor(source, sourceKind) {
  if (sourceKind === 'pubmed') return pubmedMetadata(source);
  if (sourceKind === 'europePmc') return europePmcMetadata(source);
  return webpageMetadata(source, sourceKind);
}

const remedies = runtimeRemedies();
const citations = remedies.flatMap(citationsOf);
const generated = {};
const details = [];

for (const source of citations) {
  const sourceKind = classifyEvidenceSource(source.url);
  if (sourceKind === 'unsupported') {
    details.push({ remedyId: source.remedyId, url: source.url, sourceKind, status: 'FAIL', reason: 'source is outside the reviewed evidence-source policy' });
    continue;
  }
  if (noHttp) {
    const synchronized = GENERATED_EVIDENCE_METADATA[source.url];
    const validMetadata = synchronized?.title && synchronized?.sourceDatabase && synchronized?.evidenceType && synchronized?.verificationStatus;
    details.push({
      remedyId: source.remedyId,
      url: source.url,
      sourceKind,
      status: validMetadata ? 'PASS' : 'FAIL',
      reason: validMetadata ? 'source shape and synchronized metadata accepted' : 'missing synchronized canonical metadata; run npm run content:sync-evidence',
    });
    continue;
  }
  try {
    const metadata = await metadataFor(source, sourceKind);
    generated[source.url] = metadata;
    details.push({ remedyId: source.remedyId, url: source.url, sourceKind, status: 'PASS', title: metadata.title });
  } catch (error) {
    details.push({ remedyId: source.remedyId, url: source.url, sourceKind, status: 'FAIL', reason: error.message });
  }
}

if (shouldWrite && !noHttp) {
  const body = `// Generated by \`npm run content:sync-evidence\`. Do not edit records manually.\nexport const GENERATED_EVIDENCE_METADATA = Object.freeze(${JSON.stringify(generated, null, 2)});\n\nexport function applyGeneratedEvidenceMetadata(source = {}) {\n  const generated = GENERATED_EVIDENCE_METADATA[source.url];\n  return generated ? { ...source, ...generated } : source;\n}\n`;
  writeFileSync(resolve('src/data/generatedEvidenceMetadata.js'), body);
}

const failed = details.filter((item) => item.status === 'FAIL');
const distribution = details.reduce((counts, item) => { counts[item.sourceKind] = (counts[item.sourceKind] || 0) + 1; return counts; }, {});
console.log(`Evidence source pipeline: ${details.length - failed.length} passed, ${failed.length} failed across ${citations.length} citations.`);
console.log(`Source distribution: ${JSON.stringify(distribution)}`);
for (const item of failed) console.log(`FAIL\t${item.remedyId}\t${item.sourceKind}\t${item.url}\t${item.reason}`);
process.exitCode = failed.length ? 1 : 0;
